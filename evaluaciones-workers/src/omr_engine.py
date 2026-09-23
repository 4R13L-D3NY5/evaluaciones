"""Motor OMR para la cartilla institucional escaneada.

La cartilla se lee por su grilla de 60 reactivos. El talón inferior no participa
en la detección. El código se valida contra la nómina oficial del rol antes de
comparar respuestas con la variante interna.
"""
import json
import logging
import os
import re
from collections import Counter
from pathlib import Path
from typing import Any

import cv2
import fitz
import numpy as np
import psycopg2
import pytesseract

from src import config
from src.vault_crypto import descifrar_json

logger = logging.getLogger(__name__)
OPCIONES = "ABCDE"
# Umbral mínimo de tinta en el anillo interno de la burbuja para considerar una marca.
# Las cartillas escaneadas pueden contener marcas válidas claras o incompletas;
# el diferencial mínimo evita que el texto preimpreso se convierta en respuesta.
# Se mantiene separado de la lectura OCR del código del estudiante.
UMBRAL_DENSIDAD_MARCA = 60.0
UMBRAL_DIFERENCIAL_MARCA = 10.0
# Diferencia mínima entre la primera y segunda opción para no confundir una
# marca parcialmente escrita con una doble marca. La comparación se hace sobre
# un anillo interno que excluye las letras A-E preimpresas.
UMBRAL_DIFERENCIAL_DOBLE = 18.0
# Zona exclusiva del código del estudiante en la primera cara de la cartilla.
# Está normalizada sobre la página completa y ajustada al recuadro superior
# derecho del código, excluyendo tipo de examen, N°, materia, grupo, nombre y
# los seriales rojos superior/inferior.
# Coordenadas normalizadas sobre la cartilla oficial escaneada. El código del
# estudiante está en el área numérica del recuadro grande de la cabecera
# derecha; se excluyen N°, materia, grupo y el serial superior.
ZONA_CODIGO_ESTUDIANTE = (0.70, 0.16, 0.97, 0.22)
PARAMETROS_OMR_DEFECTO: dict[str, float] = {
    "umbral_densidad_marca": 60.0,
    "umbral_diferencial_doble": 18.0,
    "umbral_binario_grilla": 185.0,
    "nivel_tinta_marca": 120.0,
    "zona_codigo_x": 0.70,
    "zona_codigo_y": 0.16,
    "zona_codigo_ancho": 0.27,
    "zona_codigo_alto": 0.06,
    "escala_ocr": 3.0,
    "radio_busqueda_pixeles": 4.0,
}


def _cargar_parametros_omr(campus: str = "", impresora: str = "") -> dict[str, float]:
    """Resuelve impresora, campus y configuración general en ese orden."""
    columnas = tuple(PARAMETROS_OMR_DEFECTO.keys())
    conexion = None
    try:
        conexion = psycopg2.connect(
            host=config.DB_HOST, port=config.DB_PORT, dbname=config.DB_NAME,
            user=config.DB_USER, password=config.DB_PASSWORD
        )
        with conexion.cursor() as cursor:
            cursor.execute(
                """SELECT alcance, campus_clave, impresora_clave, """ + ", ".join(columnas) +
                """ FROM sea_configuracion_omr
                    WHERE activo = TRUE
                      AND (
                        (alcance = 'IMPRESORA'
                         AND UPPER(TRIM(impresora_clave)) = UPPER(TRIM(%s))
                         AND (campus_clave IS NULL OR UPPER(TRIM(campus_clave)) = UPPER(TRIM(%s))))
                        OR (alcance = 'CAMPUS'
                            AND UPPER(TRIM(campus_clave)) = UPPER(TRIM(%s)))
                        OR alcance = 'GENERAL'
                      )
                    ORDER BY CASE
                        WHEN alcance = 'IMPRESORA' AND campus_clave IS NOT NULL THEN 1
                        WHEN alcance = 'IMPRESORA' THEN 2
                        WHEN alcance = 'CAMPUS' THEN 3
                        ELSE 4
                    END,
                    id
                    LIMIT 1""",
                (impresora or "", campus or "", campus or ""),
            )
            fila = cursor.fetchone()
        if not fila:
            return PARAMETROS_OMR_DEFECTO.copy()
        valores = fila[3:]
        return {
            columna: float(valor) if valor is not None else PARAMETROS_OMR_DEFECTO[columna]
            for columna, valor in zip(columnas, valores)
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
        # La plantilla oficial tiene un cuadro de respuestas amplio, con un
        # margen izquierdo pequeño y ubicado debajo de la cabecera. En algunos
        # escaneos el fondo negro genera contornos falsos que abarcan toda la
        # página; se descartan exigiendo la posición y proporción del cuadro
        # real.
        if (
            # La cartilla oficial puede ocupar solo una parte del A4 y dejar
            # un margen blanco lateral. Por eso no se puede exigir que la
            # grilla mida 75% del ancho ni 55% del alto de toda la página.
            1.05 <= aspecto <= 1.55
            and w > ancho * 0.45
            and h > alto * 0.18
            and ancho * 0.005 <= x <= ancho * 0.20
            and alto * 0.12 <= y < alto * 0.70
        ):
            candidatos.append((w * h, x, y, w, h))
    if candidatos:
        _, x, y, w, h = max(candidatos)
        return x, y, w, h
    # Fallback según relación de aspecto (con talón vs sin talón).
    relacion = ancho / float(alto) if alto else 1.0
    if relacion > 0.88:
        # Sin talón inferior (recortado / arrancado)
        return int(ancho * 0.023), int(alto * 0.285), int(ancho * 0.950), int(alto * 0.710)
    # Con talón inferior (cartilla completa)
    return int(ancho * 0.024), int(alto * 0.246), int(ancho * 0.948), int(alto * 0.618)


def _densidad_centro(
    gray: np.ndarray, cx: int, cy: int, radio: int,
    parametros: dict[str, float] | None = None,
) -> float:
    # El escaneo puede desplazar el centro uno o dos píxeles aunque la grilla
    # haya sido encontrada correctamente. Se toma la mejor lectura en una
    # vecindad pequeña para no perder marcas hechas cerca del borde.
    # Las letras A-E impresas ocupan buena parte del centro de la burbuja.
    # El anillo anterior (.25-.65) todavía incluía sus trazos, sobre todo B y
    # D, y podía convertir una cartilla vacía en una respuesta fantasma.
    # Medimos cerca del borde interno, donde una marca real deja tinta pero la
    # tipografía preimpresa tiene mucha menos presencia.
    radio_interno = max(2, int(radio * .55))
    radio_externo = max(radio_interno + 1, int(radio * .90))
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
            # Se excluyen el centro tipográfico y el borde circular preimpreso;
            # solo se evalúa el anillo interno de escritura de la burbuja.
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
    # Las burbujas de la fila 20 se ubican en torno al 97.6% del alto de la grilla.
    # El recorte anterior al 97% cortaba la fila 20 por la mitad provocando que Hough
    # la omitiera sistemáticamente. Se amplía hasta casi el borde inferior de la grilla.
    y2 = min(gray.shape[0], gy + int(gh * 0.995))
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

    # Inferencia de filas faltantes: si Hough detectó 18 o 19 filas (por marcas pesadas
    # de los estudiantes u oclusiones locales), no se descartan las filas válidas.
    # Se deduce la posición faltante a partir de la distancia mediana entre filas.
    if len(centros_x) == 15 and 18 <= len(centros_y) < 20:
        dy_mediana = float(np.median(np.diff(centros_y))) if len(centros_y) > 1 else 0
        if dy_mediana > 0:
            while len(centros_y) < 20:
                insertado = False
                for i in range(len(centros_y) - 1):
                    if centros_y[i + 1] - centros_y[i] > 1.6 * dy_mediana:
                        centros_y.insert(i + 1, int(round(centros_y[i] + dy_mediana)))
                        insertado = True
                        break
                if not insertado:
                    if (centros_y[0] - gy) / float(gh) > 0.08:
                        centros_y.insert(0, int(round(centros_y[0] - dy_mediana)))
                    else:
                        centros_y.append(int(round(centros_y[-1] + dy_mediana)))

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
        # Hough. Mantiene la geometría calibrada con el offset real (.0605)
        # y paso (.04823) para evitar deriva vertical acumulada en filas 11 a 20.
        radio = max(5, int(gw * .011))
        centros_x = [
            gx + int((columna + posicion) * gw / 3)
            for columna in range(3)
            for posicion in (.262, .397, .529, .657, .792)
        ]
        centros_y = [gy + int((.0605 + fila * .04823) * gh) for fila in range(20)]

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
        umbral_marca = float(parametros["umbral_densidad_marca"])
        umbral_doble = float(parametros["umbral_diferencial_doble"])

        # Marca clara inequívoca: si la burbuja más marcada tiene al menos 48% de tinta,
        # su diferencia contra la segunda es amplia (>= 16%) y la segunda no es una marca
        # real (< 42%), se acepta como respuesta válida para no descartar bolígrafos claros.
        es_marca_clara = (maximo >= 48.0 and maximo - segundo >= 16.0 and segundo < 42.0)

        # La clasificación debe resolver primero las múltiples marcas. Si se
        # aplica antes el diferencial de marca única, dos burbujas realmente
        # marcadas con densidades parecidas terminan convertidas en blanco.
        # Ejemplo: P13 puede producir A=74 y B=75; no es ausencia de tinta,
        # sino una doble marca que debe pasar a revisión/calificación en cero.
        if maximo < umbral_marca and not es_marca_clara:
            respuesta = ""
        elif segundo >= umbral_marca and maximo - segundo < umbral_doble:
            # Se incluyen terceras marcas próximas al máximo para no ocultar
            # una triple/múltiple marca bajo la etiqueta de doble.
            indices_marcados = [
                indice for indice, densidad in enumerate(densidades)
                if densidad >= umbral_marca and maximo - densidad < umbral_doble
            ]
            respuesta = "".join(OPCIONES[indice] for indice in sorted(indices_marcados))
        elif maximo - segundo < UMBRAL_DIFERENCIAL_MARCA and not es_marca_clara:
            # Si no hay dos opciones que superen el umbral absoluto, pero la
            # diferencia es demasiado pequeña, la lectura no es confiable:
            # se conserva como blanco para revisión manual y no como respuesta
            # fantasma.
            respuesta = ""
        else:
            respuesta = OPCIONES[int(orden[0])]
        respuestas[str(pregunta)] = respuesta
        detalles.append({"pregunta": pregunta, "respuesta": respuesta, "densidades": densidades})
    return {"respuestas": respuestas, "detalles": detalles}


def _zona_codigo_desde_grilla(
    grilla: tuple[int, int, int, int],
    ancho: int,
    alto: int,
) -> tuple[int, int, int, int]:
    """Ubica el recuadro principal del código respecto a la matriz.

    Se añaden márgenes de tolerancia holgados a la derecha e izquierda para
    evitar que el borde derecho corte el último dígito (ej. el '4' leído como '¢')
    o que la línea divisoria izquierda genere dígitos falsos.
    """
    gx, gy, gw, gh = grilla
    x1 = gx + int(gw * 0.690)
    y1 = gy - int(gh * 0.185)
    x2 = gx + int(gw * 1.015)
    y2 = gy - int(gh * 0.075)
    return max(0, x1), max(0, y1), min(ancho, x2), min(alto, y2)


def _zonas_busqueda_codigo(
    grilla: tuple[int, int, int, int] | None,
    ancho: int,
    alto: int,
    parametros: dict[str, float] | None = None,
) -> list[tuple[int, int, int, int]]:
    """Genera las regiones prioritarias para ubicar el código del estudiante.
    
    Permite encontrar el código tanto si está impreso en el recuadro oficial
    superior derecho, como si el estudiante lo escribió en el área manuscrita
    'Código Estudiante' a la izquierda, o si la cartilla sufrió leves desplazamientos.
    """
    parametros = parametros or PARAMETROS_OMR_DEFECTO
    zonas: list[tuple[int, int, int, int]] = []
    
    if grilla:
        gx, gy, gw, gh = grilla
        # 1. Recuadro preimpreso calibrado con padding seguro (evita truncar el último dígito)
        x1_box = gx + int(gw * 0.690)
        y1_box = gy - int(gh * 0.185)
        x2_box = gx + int(gw * 1.015)
        y2_box = gy - int(gh * 0.075)
        zonas.append((max(0, x1_box), max(0, y1_box), min(ancho, x2_box), min(alto, y2_box)))
        
        # 2. Recuadro amplio derecho (abarca N° cartilla, grupo y código completo)
        x1_wide = gx + int(gw * 0.520)
        y1_wide = gy - int(gh * 0.220)
        x2_wide = gx + int(gw * 1.020)
        y2_wide = gy - int(gh * 0.065)
        zonas.append((max(0, x1_wide), max(0, y1_wide), min(ancho, x2_wide), min(alto, y2_wide)))
        
        # 3. Área manuscrita del estudiante a la izquierda ('Código Estudiante:' y datos)
        # Permite leer el código aunque esté FUERA del cuadro preimpreso de la cartilla
        x1_hand = gx + int(gw * 0.050)
        y1_hand = gy - int(gh * 0.170)
        x2_hand = gx + int(gw * 0.580)
        y2_hand = gy - int(gh * 0.065)
        zonas.append((max(0, x1_hand), max(0, y1_hand), min(ancho, x2_hand), min(alto, y2_hand)))
        
        # 4. Franja de cabecera completa (cobertura global superior)
        x1_hdr = max(0, gx)
        y1_hdr = max(0, gy - int(gh * 0.280))
        x2_hdr = min(ancho, gx + gw)
        y2_hdr = min(alto, gy - int(gh * 0.040))
        zonas.append((x1_hdr, y1_hdr, x2_hdr, y2_hdr))

    # Respaldo para imágenes donde no se detectó la grilla (coordenadas relativas de página)
    x1_cfg = parametros["zona_codigo_x"]
    y1_cfg = parametros["zona_codigo_y"]
    alto_ref = min(alto, int(ancho * 1.12))
    zonas.append((
        int(ancho * max(0.0, x1_cfg - 0.05)),
        int(alto_ref * max(0.0, y1_cfg - 0.03)),
        int(ancho * min(1.0, x1_cfg + parametros["zona_codigo_ancho"] + 0.05)),
        int(alto_ref * min(1.0, y1_cfg + parametros["zona_codigo_alto"] + 0.03)),
    ))
    return zonas


def _normalizar_digitos_ocr(texto: str) -> str:
    """Convierte confusiones tipográficas comunes de OCR a dígitos numéricos."""
    reemplazos = {
        '¢': '4', '€': '6',
        'I': '1', 'l': '1', '|': '1', '!': '1', 'i': '1',
        'O': '0', 'o': '0', 'D': '0',
        'S': '5', 's': '5',
        'B': '8',
        'Z': '2', 'z': '2',
    }
    limpio = texto
    for orig, dest in reemplazos.items():
        limpio = limpio.replace(orig, dest)
    return limpio


def _distancia_levenshtein(s1: str, s2: str) -> int:
    """Calcula la distancia de edición mínima entre dos cadenas."""
    if len(s1) < len(s2):
        return _distancia_levenshtein(s2, s1)
    if len(s2) == 0:
        return len(s1)
    prev = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        curr = [i + 1]
        for j, c2 in enumerate(s2):
            ins = prev[j + 1] + 1
            dele = curr[j] + 1
            sub = prev[j] + (c1 != c2)
            curr.append(min(ins, dele, sub))
        prev = curr
    return prev[-1]


def _resolver_codigo_estudiante(
    candidatos: list[str],
    mapeos: dict[str, dict[str, Any]],
    imagen: np.ndarray | None = None,
    grilla: tuple[int, int, int, int] | None = None,
) -> tuple[str | None, str]:
    """Resuelve el código oficial del estudiante usando la nómina oficial del examen.
    
    Aplica una cascada de tolerancia progresiva:
    1. Coincidencia exacta de candidatos en la nómina.
    2. Coincidencia por subcadena (código oficial contenido en el OCR o viceversa).
    3. Coincidencia difusa (distancia Levenshtein <= 1) unívoca en la nómina.
    4. Coincidencia por nombre completo o apellidos del estudiante en la cabecera.
    """
    codigos_nomina = list(mapeos.keys())
    
    # Nivel 1: Coincidencia exacta
    for candidato in candidatos:
        if candidato in mapeos:
            return candidato, "EXACTA"
            
    # Nivel 2: Subcadena (ej. candidato '4110174' contiene '1110174')
    for codigo in codigos_nomina:
        for cand in candidatos:
            if codigo in cand or (len(cand) >= 6 and cand in codigo):
                return codigo, "SUBCADENA"
                
    # Nivel 3: Distancia difusa Levenshtein <= 1 (ej. '111017' vs '1110174' o '4110174' vs '1110174')
    coincidencias_fuzzy: list[tuple[str, int]] = []
    for codigo in codigos_nomina:
        min_dist = min((_distancia_levenshtein(codigo, cand) for cand in candidatos), default=99)
        if min_dist <= 1:
            coincidencias_fuzzy.append((codigo, min_dist))
            
    if len(coincidencias_fuzzy) == 1:
        return coincidencias_fuzzy[0][0], "FUZZY_DISTANCIA_1"
    elif len(coincidencias_fuzzy) > 1:
        coincidencias_fuzzy.sort(key=lambda x: x[1])
        if coincidencias_fuzzy[0][1] < coincidencias_fuzzy[1][1]:
            return coincidencias_fuzzy[0][0], "FUZZY_DISTANCIA_1"
            
    # Nivel 4: Verificación por nombre impreso en la cabecera
    if imagen is not None and grilla is not None:
        try:
            gx, gy, gw, gh = grilla
            y_top = max(0, gy - int(gh * 0.280))
            crop_hdr = imagen[y_top:gy, max(0, gx):min(imagen.shape[1], gx + gw)]
            if crop_hdr.size > 0:
                hdr_gray = cv2.cvtColor(crop_hdr, cv2.COLOR_BGR2GRAY)
                texto_hdr = pytesseract.image_to_string(hdr_gray, config="--psm 6").upper()
                for codigo, datos in mapeos.items():
                    nombre = datos.get("nombre", "").upper().strip()
                    partes = [p for p in nombre.split() if len(p) >= 4]
                    if len(partes) >= 2 and all(p in texto_hdr for p in partes):
                        return codigo, "NOMBRE_CABECERA"
        except Exception as e:
            logger.debug("No se pudo verificar por nombre en cabecera: %s", e)
            
    return None, "NO_RECONOCIDO"


def _clasificar_perfil_escaneo(
    imagen: np.ndarray,
    grilla: tuple[int, int, int, int],
) -> str:
    """Clasifica la presentación por cuánto ocupa la matriz dentro de la hoja."""
    alto, ancho = imagen.shape[:2]
    proporcion_ancho = grilla[2] / float(ancho) if ancho else 0
    return "ESCANEO_FISICO" if proporcion_ancho >= .82 else "PDF_RECORTADO"


def _candidatos_codigo(
    imagen: np.ndarray,
    parametros: dict[str, float] | None = None,
    grilla: tuple[int, int, int, int] | None = None,
) -> list[str]:
    alto, ancho = imagen.shape[:2]
    parametros = parametros or PARAMETROS_OMR_DEFECTO
    zonas_pixeles = _zonas_busqueda_codigo(grilla, ancho, alto, parametros)

    candidatos: list[str] = []
    for x1, y1, x2, y2 in zonas_pixeles:
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(ancho, x2), min(alto, y2)
        recorte = imagen[y1:y2, x1:x2]
        if recorte.size == 0:
            continue
        gris = cv2.cvtColor(recorte, cv2.COLOR_BGR2GRAY)
        escala = parametros.get("escala_ocr", 3.0)
        ampliada = cv2.resize(
            gris, None, fx=escala, fy=escala,
            interpolation=cv2.INTER_CUBIC
        )
        variantes = (
            ampliada,
            cv2.threshold(ampliada, 170, 255, cv2.THRESH_BINARY)[1],
            cv2.threshold(ampliada, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1],
        )
        for psm in (
            "--psm 7 -c tessedit_char_whitelist=0123456789",
            "--psm 6 -c tessedit_char_whitelist=0123456789",
            "--psm 7",
            "--psm 6",
            "--psm 8",
        ):
            for variante in variantes:
                texto_raw = pytesseract.image_to_string(variante, config=psm)
                secuencias_raw = re.findall(r"\d{5,12}", texto_raw)
                texto_norm = _normalizar_digitos_ocr(texto_raw)
                secuencias_norm = re.findall(r"\d{5,12}", texto_norm)
                
                todas = list(set(secuencias_raw + secuencias_norm))
                candidatos.extend(todas)
                
                for sec in todas:
                    n = len(sec)
                    if n > 7:
                        candidatos.append(sec[-7:])
                        candidatos.append(sec[:7])
                        candidatos.append(sec[1:8])
                    if n >= 7:
                        candidatos.append(sec[1:])
                        candidatos.append(sec[:-1])
                        
    return [candidato for candidato, _ in Counter(candidatos).most_common()]


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
                          m.letra_variante, v.id, v.rol_examen_id,
                          v.contenido_seguro_cifrado, v.contenido_seguro_nonce,
                          v.contenido_seguro_dek_envuelta, v.contenido_seguro_kek_referencia,
                          v.contenido_seguro_kek_version, v.contenido_seguro_algoritmo
                   FROM sea_mapeo_estudiantes_variantes m
                   JOIN sea_examenes_variantes v ON v.id = m.variante_id
                  WHERE m.rol_examen_id = %s""",
                (rol_examen_id,),
            )
            resultado = {}
            for codigo, nombre, letra, variante_id, variante_rol_id, ciphertext, nonce, wrapped_key, key_ref, key_version, algorithm in cursor.fetchall():
                if not ciphertext or not nonce or not wrapped_key:
                    raise RuntimeError(f"La variante {variante_id} no tiene contenido OMR cifrado")
                paquete = descifrar_json(
                    {
                        "ciphertext": ciphertext,
                        "nonce": nonce,
                        "wrappedDataKey": wrapped_key,
                        "keyReference": key_ref,
                        "keyVersion": key_version,
                        "algorithm": algorithm,
                    },
                    f"variante:{variante_id}:rol:{variante_rol_id}",
                )
                resultado[str(codigo)] = {
                    "nombre": nombre,
                    "variante": letra,
                    "patron": json.loads(paquete.get("patronClavesJson", "{}")),
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
    anuladas = _cargar_anulaciones_activas(rol_examen_id, mapeo["variante"])
    total = len([pregunta for pregunta in patron if int(pregunta) not in anuladas])
    aciertos = sum(1 for pregunta, correcta in patron.items() if int(pregunta) not in anuladas and respuestas.get(pregunta) == correcta)
    blancos = sum(1 for pregunta in patron if int(pregunta) not in anuladas and not respuestas.get(pregunta))
    dobles = sum(1 for pregunta in patron if int(pregunta) not in anuladas and len(respuestas.get(pregunta, "")) > 1)
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
                 total, aciertos, fallos, blancos, dobles, round(aciertos * 60 / total, 2) if total else 0,
                 nota100, "APROBADO" if nota100 >= 51 else "REPROBADO", json.dumps(respuestas),
                 archivo_escaneado_path, "OMR_VISION_ENGINE_V1"),
            )
        conexion.commit()
    finally:
        conexion.close()


def _cargar_anulaciones_activas(rol_examen_id: str, letra_variante: str) -> set[int]:
    """Obtiene las preguntas anuladas para respetarlas al reprocesar un escaneado."""
    conexion = psycopg2.connect(
        host=config.DB_HOST, port=config.DB_PORT, dbname=config.DB_NAME,
        user=config.DB_USER, password=config.DB_PASSWORD
    )
    try:
        with conexion.cursor() as cursor:
            cursor.execute(
                """SELECT numero_pregunta
                     FROM sea_anulaciones_preguntas_omr
                    WHERE rol_examen_id = %s
                      AND UPPER(letra_variante) = UPPER(%s)
                      AND activo = TRUE""",
                (rol_examen_id, letra_variante),
            )
            return {int(numero) for (numero,) in cursor.fetchall()}
    finally:
        conexion.close()


def _resumen_calificacion(rol_examen_id: str, lectura: dict[str, Any], mapeo: dict[str, Any]) -> dict[str, Any]:
    """Calcula el resumen y el estado de cada pregunta para revisión manual."""
    respuestas = lectura["respuestas"]
    patron = {str(clave): valor for clave, valor in mapeo["patron"].items()}
    anuladas = _cargar_anulaciones_activas(rol_examen_id, mapeo["variante"])
    total = len([pregunta for pregunta in patron if int(pregunta) not in anuladas])
    aciertos = sum(1 for pregunta, correcta in patron.items() if int(pregunta) not in anuladas and respuestas.get(pregunta) == correcta)
    blancos = sum(1 for pregunta in patron if int(pregunta) not in anuladas and not respuestas.get(pregunta))
    dobles = sum(1 for pregunta in patron if int(pregunta) not in anuladas and len(respuestas.get(pregunta, "")) > 1)
    fallos = max(0, total - aciertos - blancos)
    nota100 = round((aciertos / total) * 100, 2) if total else 0
    detalles = []
    for detalle in lectura.get("detalles", []):
        pregunta = str(detalle["pregunta"])
        respuesta = respuestas.get(pregunta, "")
        correcta = patron.get(pregunta, "")
        if int(pregunta) in anuladas:
            estado = "ANULADA"
        elif not respuesta:
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
        "notaSobre60": round(aciertos * 60 / total, 2) if total else 0,
        "estadoCalificacion": "APROBADO" if nota100 >= 51 else "REPROBADO",
        "detalles": detalles,
    }


def procesar_archivo(archivo: str, rol_examen_id: str, campus: str = "", impresora: str = "") -> dict[str, Any]:
    parametros = _cargar_parametros_omr(campus, impresora)
    mapeos = _cargar_mapeos(rol_examen_id)
    if not mapeos:
        raise ValueError("El rol no tiene un mapeo oficial de estudiantes-variante.")
    paginas = _abrir_paginas(archivo)
    lecturas = []
    for numero_pagina, imagen in enumerate(paginas, start=1):
        gris = cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY)
        grilla = _detectar_grilla(gris, parametros)
        candidatos = _candidatos_codigo(imagen, parametros, grilla)
        codigo, metodo_resolucion = _resolver_codigo_estudiante(candidatos, mapeos, imagen, grilla)
        if codigo and codigo not in candidatos:
            candidatos.insert(0, codigo)
        lectura = {
            "pagina": numero_pagina,
            "codigoEstudiante": codigo,
            "codigoOcr": candidatos,
            "grilla": {"x": grilla[0], "y": grilla[1], "ancho": grilla[2], "alto": grilla[3]},
            "perfilEscaneo": _clasificar_perfil_escaneo(imagen, grilla),
            "zonaCodigoDetectada": {
                "x": _zona_codigo_desde_grilla(grilla, imagen.shape[1], imagen.shape[0])[0],
                "y": _zona_codigo_desde_grilla(grilla, imagen.shape[1], imagen.shape[0])[1],
                "ancho": max(0, _zona_codigo_desde_grilla(grilla, imagen.shape[1], imagen.shape[0])[2] - _zona_codigo_desde_grilla(grilla, imagen.shape[1], imagen.shape[0])[0]),
                "alto": max(0, _zona_codigo_desde_grilla(grilla, imagen.shape[1], imagen.shape[0])[3] - _zona_codigo_desde_grilla(grilla, imagen.shape[1], imagen.shape[0])[1]),
            },
            **_leer_respuestas(gris, grilla, parametros),
        }
        if codigo:
            _persistir_calificacion(rol_examen_id, lectura, mapeos[codigo], archivo)
            lectura.update(_resumen_calificacion(rol_examen_id, lectura, mapeos[codigo]))
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


def procesar_archivo_lectura(archivo: str, campus: str = "", impresora: str = "") -> dict[str, Any]:
    """Lee código y respuestas sin exigir nómina, variante ni clave de respuestas."""
    parametros = _cargar_parametros_omr(campus, impresora)
    paginas = _abrir_paginas(archivo)
    lecturas = []
    for numero_pagina, imagen in enumerate(paginas, start=1):
        gris = cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY)
        grilla = _detectar_grilla(gris, parametros)
        candidatos = _candidatos_codigo(imagen, parametros, grilla)
        lectura = {
            "pagina": numero_pagina,
            "codigoEstudiante": candidatos[0] if candidatos else None,
            "codigoOcr": candidatos,
            "codigoValidado": False,
            "letraVariante": None,
            "grilla": {"x": grilla[0], "y": grilla[1], "ancho": grilla[2], "alto": grilla[3]},
            "perfilEscaneo": _clasificar_perfil_escaneo(imagen, grilla),
            "zonaCodigoDetectada": {
                "x": _zona_codigo_desde_grilla(grilla, imagen.shape[1], imagen.shape[0])[0],
                "y": _zona_codigo_desde_grilla(grilla, imagen.shape[1], imagen.shape[0])[1],
                "ancho": max(0, _zona_codigo_desde_grilla(grilla, imagen.shape[1], imagen.shape[0])[2] - _zona_codigo_desde_grilla(grilla, imagen.shape[1], imagen.shape[0])[0]),
                "alto": max(0, _zona_codigo_desde_grilla(grilla, imagen.shape[1], imagen.shape[0])[3] - _zona_codigo_desde_grilla(grilla, imagen.shape[1], imagen.shape[0])[1]),
            },
            **_leer_respuestas(gris, grilla, parametros),
        }
        lectura["estado"] = "REVISION_MANUAL"
        lectura["mensaje"] = "Lectura para conciliación; no se calificó ni se validó variante."
        lecturas.append(lectura)
    return {"totalPaginas": len(paginas), "resultados": lecturas}
