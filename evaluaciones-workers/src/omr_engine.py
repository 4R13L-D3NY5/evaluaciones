"""Motor OMR para la cartilla institucional escaneada.

La cartilla se lee por su grilla de 60 reactivos. El talón inferior no participa
en la detección. El código se valida contra la nómina oficial del rol antes de
comparar respuestas con la variante interna.
"""
import json
import logging
import os
import re
from pathlib import Path
from typing import Any

import cv2
import fitz
import numpy as np
import psycopg2
import pytesseract

from src import config

logger = logging.getLogger(__name__)
OPCIONES = "ABCDE"
# Umbral mínimo de tinta en el anillo interno de la burbuja para considerar una marca.
# Se mantiene separado de la lectura OCR del código del estudiante.
UMBRAL_DENSIDAD_MARCA = 70.0
# Diferencia mínima entre la primera y segunda opción para no confundir una
# marca parcialmente escrita con una doble marca. La comparación se hace sobre
# un anillo interno que excluye las letras A-E preimpresas.
UMBRAL_DIFERENCIAL_DOBLE = 18.0
# Zona exclusiva del código del estudiante en la primera cara de la cartilla.
# Está normalizada sobre la página completa y ajustada al recuadro superior
# derecho del código, excluyendo tipo de examen, N°, materia, grupo, nombre y
# los seriales rojos superior/inferior.
ZONA_CODIGO_ESTUDIANTE = (0.53, 0.09, 0.75, 0.14)
PARAMETROS_OMR_DEFECTO: dict[str, float] = {
    "umbral_densidad_marca": 70.0,
    "umbral_diferencial_doble": 18.0,
    "umbral_binario_grilla": 185.0,
    "nivel_tinta_marca": 145.0,
    "zona_codigo_x": 0.53,
    "zona_codigo_y": 0.09,
    "zona_codigo_ancho": 0.22,
    "zona_codigo_alto": 0.05,
    "escala_ocr": 2.5,
    "radio_busqueda_pixeles": 2.0,
}


def _cargar_parametros_omr() -> dict[str, float]:
    """Lee la configuración oficial vigente; usa defaults si la BD no responde."""
    columnas = tuple(PARAMETROS_OMR_DEFECTO.keys())
    conexion = None
    try:
        conexion = psycopg2.connect(
            host=config.DB_HOST, port=config.DB_PORT, dbname=config.DB_NAME,
            user=config.DB_USER, password=config.DB_PASSWORD
        )
        with conexion.cursor() as cursor:
            cursor.execute(
                "SELECT " + ", ".join(columnas) +
                " FROM sea_configuracion_omr WHERE id = 1"
            )
            fila = cursor.fetchone()
        if not fila:
            return PARAMETROS_OMR_DEFECTO.copy()
        return {
            columna: float(valor) if valor is not None else PARAMETROS_OMR_DEFECTO[columna]
            for columna, valor in zip(columnas, fila)
        }
    except Exception as exc:
        logger.warning("No se pudo cargar configuración OMR; se usarán defaults: %s", exc)
        return PARAMETROS_OMR_DEFECTO.copy()
    finally:
        if conexion is not None:
            conexion.close()


def _abrir_paginas(archivo: str) -> list[np.ndarray]:
    ruta = Path(archivo)
    if ruta.suffix.lower() == ".pdf":
        documento = fitz.open(str(ruta))
        try:
            paginas = []
            for pagina in documento:
                datos = np.frombuffer(
                    pagina.get_pixmap(matrix=fitz.Matrix(2.2, 2.2), alpha=False).tobytes("png"),
                    np.uint8,
                )
                imagen = cv2.imdecode(datos, cv2.IMREAD_COLOR)
                if imagen is not None:
                    paginas.append(imagen)
            return paginas
        finally:
            documento.close()
    imagen = cv2.imread(str(ruta))
    if imagen is None:
        raise ValueError(f"No se pudo abrir el archivo escaneado: {archivo}")
    return [imagen]


def _detectar_grilla(gray: np.ndarray, parametros: dict[str, float] | None = None) -> tuple[int, int, int, int]:
    alto, ancho = gray.shape[:2]
    parametros = parametros or PARAMETROS_OMR_DEFECTO
    binaria = cv2.threshold(gray, int(parametros["umbral_binario_grilla"]), 255, cv2.THRESH_BINARY_INV)[1]
    contornos, _ = cv2.findContours(binaria, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    candidatos: list[tuple[int, int, int, int, int]] = []
    for contorno in contornos:
        x, y, w, h = cv2.boundingRect(contorno)
        aspecto = w / float(h) if h else 0
        if 0.95 <= aspecto <= 1.55 and w > ancho * 0.48 and h > alto * 0.24 and y < alto * 0.78:
            candidatos.append((w * h, x, y, w, h))
    if candidatos:
        _, x, y, w, h = max(candidatos)
        return x, y, w, h
    # Fallback para un recorte de cartilla sin borde recuperable.
    return int(ancho * .015), int(alto * .125), int(ancho * .54), int(alto * .32)


def _densidad_centro(
    gray: np.ndarray, cx: int, cy: int, radio: int,
    parametros: dict[str, float] | None = None,
) -> float:
    # El escaneo puede desplazar el centro uno o dos píxeles aunque la grilla
    # haya sido encontrada correctamente. Se toma la mejor lectura en una
    # vecindad pequeña para no perder marcas hechas cerca del borde.
    radio_interno = max(2, int(radio * .25))
    radio_externo = max(radio_interno + 1, int(radio * .65))
    parametros = parametros or PARAMETROS_OMR_DEFECTO
    radio_busqueda = max(0, int(parametros["radio_busqueda_pixeles"]))
    nivel_tinta = int(parametros["nivel_tinta_marca"])
    mejor = 0.0
    for desplazamiento_y in range(-radio_busqueda, radio_busqueda + 1):
        for desplazamiento_x in range(-radio_busqueda, radio_busqueda + 1):
            centro_x = cx + desplazamiento_x
            centro_y = cy + desplazamiento_y
            x1, x2 = max(0, centro_x - radio), min(gray.shape[1], centro_x + radio + 1)
            y1, y2 = max(0, centro_y - radio), min(gray.shape[0], centro_y + radio + 1)
            roi = gray[y1:y2, x1:x2]
            if roi.size == 0:
                continue
            mask = np.zeros(roi.shape, dtype=np.uint8)
            centro = (
                min(radio, roi.shape[1] // 2),
                min(radio, roi.shape[0] // 2),
            )
            # Las letras A-E están impresas en el centro de cada burbuja y por
            # eso no pueden usarse como indicador de tinta. Se mide un anillo
            # intermedio: excluye la letra y el borde circular preimpreso.
            cv2.circle(mask, centro, radio_externo, 255, -1)
            cv2.circle(mask, centro, radio_interno, 0, -1)
            muestra = roi[mask > 0]
            if muestra.size:
                mejor = max(mejor, float(np.mean(muestra < nivel_tinta) * 100))
    return mejor


def _detectar_centros_burbujas(
    gray: np.ndarray, grilla: tuple[int, int, int, int]
) -> tuple[list[int], list[int], int] | None:
    """Obtiene centros reales para compensar escala, desplazamiento y leve sesgo.

    La cartilla se imprime con dos distribuciones que ya se encuentran en uso:
    algunas copias dejan más espacio entre el borde de la grilla y la primera
    fila. Derivar los centros con las circunferencias impresas evita depender de
    un único porcentaje vertical y evita muestrear la fila anterior.
    """
    gx, gy, gw, gh = grilla
    x1 = gx + int(gw * .04)
    y1 = gy + int(gh * .03)
    x2 = gx + int(gw * .98)
    y2 = gy + int(gh * .97)
    roi = gray[y1:y2, x1:x2]
    if roi.size == 0:
        return None

    circulos = cv2.HoughCircles(
        roi,
        cv2.HOUGH_GRADIENT,
        dp=1.2,
        minDist=max(10, int(gw * .018)),
        param1=100,
        param2=18,
        minRadius=max(5, int(gw * .005)),
        maxRadius=max(10, int(gw * .018)),
    )
    if circulos is None:
        return None

    puntos = circulos[0]
    radio_minimo = max(5, int(gw * .005))
    puntos_x = [
        (float(x) + x1, float(y) + y1, float(r))
        for x, y, r in puntos
        if gx + gw * .07 < x + x1 < gx + gw * .97 and r >= radio_minimo
    ]
    if not puntos_x:
        return None

    # Agrupar posiciones X de las 15 opciones. Los textos cercanos a la grilla
    # pueden producir falsos círculos, por lo que se conservan los grupos con
    # la frecuencia dominante de la detección.
    tolerancia_x = max(6, int(gw * .015))
    grupos_x: list[list[float]] = []
    for x, _, _ in sorted(puntos_x, key=lambda punto: punto[0]):
        if not grupos_x or x - float(np.mean(grupos_x[-1])) > tolerancia_x:
            grupos_x.append([x])
        else:
            grupos_x[-1].append(x)
    frecuencia_x = max(len(grupo) for grupo in grupos_x)
    centros_x = [
        int(round(float(np.mean(grupo))))
        for grupo in grupos_x
        if len(grupo) >= max(10, int(frecuencia_x * .9))
    ]

    # Agrupar filas. Se exige una cantidad suficiente de burbujas para excluir
    # los círculos aislados de encabezados, números y talón inferior.
    tolerancia_y = max(5, int(gh * .008))
    grupos_y: list[list[float]] = []
    for _, y, _ in sorted(puntos_x, key=lambda punto: punto[1]):
        if not grupos_y or y - float(np.mean(grupos_y[-1])) > tolerancia_y:
            grupos_y.append([y])
        else:
            grupos_y[-1].append(y)
    centros_y = [
        int(round(float(np.mean(grupo))))
        for grupo in grupos_y
        if len(grupo) >= 10
    ]

    radios = [radio for _, _, radio in puntos_x]
    # El radio de Hough describe principalmente el borde; una ventana algo
    # mayor permite medir suficiente tinta sin tocar la burbuja contigua.
    radio = max(5, int(round(float(np.median(radios) * 1.2))))
    if len(centros_x) != 15 or len(centros_y) != 20:
        return None
    return centros_x, centros_y, radio


def _leer_respuestas(
    gray: np.ndarray, grilla: tuple[int, int, int, int],
    parametros: dict[str, float] | None = None,
) -> dict[str, Any]:
    gx, gy, gw, gh = grilla
    respuestas: dict[str, Any] = {}
    detalles: list[dict[str, Any]] = []
    parametros = parametros or PARAMETROS_OMR_DEFECTO
    centros = _detectar_centros_burbujas(gray, grilla)
    if centros:
        centros_x, centros_y, radio = centros
    else:
        # Fallback para escaneos con resolución o contraste insuficiente para
        # Hough. Mantiene la geometría anterior, pero con la lectura en anillo.
        radio = max(5, int(gw * .011))
        centros_x = [
            gx + int((columna + posicion) * gw / 3)
            for columna in range(3)
            for posicion in (.262, .397, .529, .657, .792)
        ]
        centros_y = [gy + int((.055 + fila * .0482) * gh) for fila in range(20)]

    for pregunta in range(1, 61):
        columna = (pregunta - 1) // 20
        fila = (pregunta - 1) % 20
        densidades = [
            round(_densidad_centro(gray, centros_x[columna * 5 + opcion], centros_y[fila], radio, parametros), 2)
            for opcion in range(5)
        ]
        orden = np.argsort(densidades)[::-1]
        maximo = float(densidades[int(orden[0])])
        segundo = float(densidades[int(orden[1])])
        if maximo < parametros["umbral_densidad_marca"]:
            respuesta = ""
        elif (
            segundo >= parametros["umbral_densidad_marca"]
            and maximo - segundo < parametros["umbral_diferencial_doble"]
        ):
            respuesta = OPCIONES[int(orden[0])] + OPCIONES[int(orden[1])]
        else:
            respuesta = OPCIONES[int(orden[0])]
        respuestas[str(pregunta)] = respuesta
        detalles.append({"pregunta": pregunta, "respuesta": respuesta, "densidades": densidades})
    return {"respuestas": respuestas, "detalles": detalles}


def _candidatos_codigo(imagen: np.ndarray, parametros: dict[str, float] | None = None) -> list[str]:
    alto, ancho = imagen.shape[:2]
    parametros = parametros or PARAMETROS_OMR_DEFECTO
    # Solo se procesa el recuadro superior derecho donde se sobreimprime el
    # código del estudiante. No se cotejan grupo, materia ni nombre.
    x1 = parametros["zona_codigo_x"]
    y1 = parametros["zona_codigo_y"]
    zonas = [(x1, y1, x1 + parametros["zona_codigo_ancho"], y1 + parametros["zona_codigo_alto"])]
    candidatos: list[str] = []
    for x1, y1, x2, y2 in zonas:
        recorte = imagen[int(alto * y1):int(alto * y2), int(ancho * x1):int(ancho * x2)]
        if recorte.size == 0:
            continue
        gris = cv2.cvtColor(recorte, cv2.COLOR_BGR2GRAY)
        ampliada = cv2.resize(
            gris, None, fx=parametros["escala_ocr"], fy=parametros["escala_ocr"],
            interpolation=cv2.INTER_CUBIC
        )
        variantes = (
            ampliada,
            cv2.threshold(ampliada, 170, 255, cv2.THRESH_BINARY)[1],
            cv2.threshold(ampliada, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1],
        )
        for variante in variantes:
            texto = pytesseract.image_to_string(
                variante, config="--psm 6 -c tessedit_char_whitelist=0123456789"
            )
            # Se extraen secuencias de dígitos aunque Tesseract las devuelva
            # separadas por saltos de línea o espacios.
            candidatos.extend(re.findall(r"\d{5,12}", texto))
    return list(dict.fromkeys(candidatos))


def _cargar_mapeos(rol_examen_id: str) -> dict[str, dict[str, Any]]:
    conexion = psycopg2.connect(
        host=config.DB_HOST, port=config.DB_PORT, dbname=config.DB_NAME,
        user=config.DB_USER, password=config.DB_PASSWORD
    )
    try:
        with conexion.cursor() as cursor:
            cursor.execute(
                """SELECT m.codigo_estudiante,
                          concat_ws(' ', m.nombres, m.apellido_paterno, m.apellido_materno),
                          m.letra_variante, v.patron_claves_json
                   FROM sea_mapeo_estudiantes_variantes m
                   JOIN sea_examenes_variantes v ON v.id = m.variante_id
                  WHERE m.rol_examen_id = %s""",
                (rol_examen_id,),
            )
            resultado = {}
            for codigo, nombre, letra, patron_json in cursor.fetchall():
                resultado[str(codigo)] = {
                    "nombre": nombre,
                    "variante": letra,
                    "patron": json.loads(patron_json or "{}"),
                }
            return resultado
    finally:
        conexion.close()


def _persistir_calificacion(
    rol_examen_id: str,
    lectura: dict[str, Any],
    mapeo: dict[str, Any],
    archivo_escaneado_path: str,
) -> None:
    respuestas = lectura["respuestas"]
    patron = {str(clave): valor for clave, valor in mapeo["patron"].items()}
    total = len(patron)
    aciertos = sum(1 for pregunta, correcta in patron.items() if respuestas.get(pregunta) == correcta)
    blancos = sum(1 for pregunta in patron if not respuestas.get(pregunta))
    dobles = sum(1 for pregunta in patron if len(respuestas.get(pregunta, "")) > 1)
    fallos = max(0, total - aciertos - blancos)
    nota100 = round((aciertos / total) * 100, 2) if total else 0
    conexion = psycopg2.connect(host=config.DB_HOST, port=config.DB_PORT, dbname=config.DB_NAME,
                                user=config.DB_USER, password=config.DB_PASSWORD)
    try:
        with conexion.cursor() as cursor:
            cursor.execute(
                """DELETE FROM sea_calificaciones_omr
                    WHERE rol_examen_id = %s AND codigo_estudiante = %s""",
                (rol_examen_id, lectura["codigoEstudiante"]),
            )
            cursor.execute(
                """INSERT INTO sea_calificaciones_omr
                    (rol_examen_id, codigo_estudiante, estudiante_nombre_completo,
                     letra_variante, total_reactivos, aciertos, fallos, blancos,
                     dobles_marcas, nota_sobre_30, nota_sobre_100,
                     estado_calificacion, respuestas_detectadas_json, archivo_escaneado_path,
                     procesado_por)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (rol_examen_id, lectura["codigoEstudiante"], mapeo["nombre"], mapeo["variante"],
                 total, aciertos, fallos, blancos, dobles, round(aciertos * 30 / total, 2) if total else 0,
                 nota100, "APROBADO" if nota100 >= 51 else "REPROBADO", json.dumps(respuestas),
                 archivo_escaneado_path, "OMR_VISION_ENGINE_V1"),
            )
        conexion.commit()
    finally:
        conexion.close()


def _resumen_calificacion(lectura: dict[str, Any], mapeo: dict[str, Any]) -> dict[str, Any]:
    """Calcula el resumen y el estado de cada pregunta para revisión manual."""
    respuestas = lectura["respuestas"]
    patron = {str(clave): valor for clave, valor in mapeo["patron"].items()}
    total = len(patron)
    aciertos = sum(1 for pregunta, correcta in patron.items() if respuestas.get(pregunta) == correcta)
    blancos = sum(1 for pregunta in patron if not respuestas.get(pregunta))
    dobles = sum(1 for pregunta in patron if len(respuestas.get(pregunta, "")) > 1)
    fallos = max(0, total - aciertos - blancos)
    nota100 = round((aciertos / total) * 100, 2) if total else 0
    detalles = []
    for detalle in lectura.get("detalles", []):
        pregunta = str(detalle["pregunta"])
        respuesta = respuestas.get(pregunta, "")
        correcta = patron.get(pregunta, "")
        if not respuesta:
            estado = "EN_BLANCO"
        elif len(respuesta) > 1:
            estado = "DOBLE_MARCA"
        elif not correcta:
            estado = "SIN_PATRON"
        elif respuesta.upper() == correcta.upper():
            estado = "CORRECTA"
        else:
            estado = "INCORRECTA"
        detalles.append({**detalle, "respuestaCorrecta": correcta, "estado": estado})
    return {
        "estudianteNombre": mapeo["nombre"],
        "codigoValidado": True,
        "letraVariante": mapeo["variante"],
        "totalReactivos": total,
        "aciertos": aciertos,
        "fallos": fallos,
        "blancos": blancos,
        "doblesMarcas": dobles,
        "notaSobre100": nota100,
        "notaSobre30": round(aciertos * 30 / total, 2) if total else 0,
        "estadoCalificacion": "APROBADO" if nota100 >= 51 else "REPROBADO",
        "detalles": detalles,
    }


def procesar_archivo(archivo: str, rol_examen_id: str) -> dict[str, Any]:
    parametros = _cargar_parametros_omr()
    mapeos = _cargar_mapeos(rol_examen_id)
    if not mapeos:
        raise ValueError("El rol no tiene un mapeo oficial de estudiantes-variante.")
    paginas = _abrir_paginas(archivo)
    lecturas = []
    for numero_pagina, imagen in enumerate(paginas, start=1):
        gris = cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY)
        grilla = _detectar_grilla(gris, parametros)
        candidatos = _candidatos_codigo(imagen, parametros)
        codigo = next((valor for valor in candidatos if valor in mapeos), None)
        lectura = {
            "pagina": numero_pagina,
            "codigoEstudiante": codigo,
            "codigoOcr": candidatos,
            "grilla": {"x": grilla[0], "y": grilla[1], "ancho": grilla[2], "alto": grilla[3]},
            **_leer_respuestas(gris, grilla, parametros),
        }
        if codigo:
            _persistir_calificacion(rol_examen_id, lectura, mapeos[codigo], archivo)
            lectura.update(_resumen_calificacion(lectura, mapeos[codigo]))
            lectura["estado"] = "CALIFICADO"
        else:
            lectura["codigoValidado"] = False
            lectura["letraVariante"] = None
            lectura["estado"] = "REVISION_MANUAL"
            if candidatos:
                lectura["mensaje"] = (
                    "OCR leyó el código "
                    + ", ".join(candidatos)
                    + ", pero no pertenece a la nómina del rol seleccionado."
                )
            else:
                lectura["mensaje"] = "No se detectó el código preimpreso del estudiante."
        lecturas.append(lectura)
    return {"totalPaginas": len(paginas), "resultados": lecturas}
