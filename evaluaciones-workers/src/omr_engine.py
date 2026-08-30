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
# Zona exclusiva del código del estudiante en la primera cara de la cartilla.
# Está normalizada sobre la página completa para excluir N°, materia, grupo,
# nombre y los seriales rojos superior/inferior.
ZONA_CODIGO_ESTUDIANTE = (0.48, 0.08, 0.75, 0.14)


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


def _detectar_grilla(gray: np.ndarray) -> tuple[int, int, int, int]:
    alto, ancho = gray.shape[:2]
    binaria = cv2.threshold(gray, 185, 255, cv2.THRESH_BINARY_INV)[1]
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


def _densidad_centro(gray: np.ndarray, cx: int, cy: int, radio: int) -> float:
    x1, x2 = max(0, cx - radio), min(gray.shape[1], cx + radio + 1)
    y1, y2 = max(0, cy - radio), min(gray.shape[0], cy + radio + 1)
    roi = gray[y1:y2, x1:x2]
    if roi.size == 0:
        return 0.0
    mask = np.zeros(roi.shape, dtype=np.uint8)
    centro = (min(radio, roi.shape[1] // 2), min(radio, roi.shape[0] // 2))
    # La tinta preimpresa del círculo no debe contar como respuesta. Se mide
    # solo el núcleo de la burbuja, donde queda la marca del estudiante.
    cv2.circle(mask, centro, max(2, int(radio * .35)), 255, -1)
    muestra = roi[mask > 0]
    return float(np.mean(muestra < 145) * 100) if muestra.size else 0.0


def _leer_respuestas(gray: np.ndarray, grilla: tuple[int, int, int, int]) -> dict[str, Any]:
    gx, gy, gw, gh = grilla
    respuestas: dict[str, Any] = {}
    detalles: list[dict[str, Any]] = []
    radio = max(5, int(gw * .011))
    posiciones_opciones = (.262, .397, .529, .657, .792)
    for pregunta in range(1, 61):
        columna = (pregunta - 1) // 20
        fila = (pregunta - 1) % 20
        centro_x = gx + int((columna + posiciones_opciones[0]) * gw / 3)
        centro_y = gy + int((.055 + fila * .0482) * gh)
        densidades = []
        for posicion in posiciones_opciones:
            cx = gx + int((columna + posicion) * gw / 3)
            densidades.append(round(_densidad_centro(gray, cx, centro_y, radio), 2))
        orden = np.argsort(densidades)[::-1]
        # En la plantilla vacía las letras A-E pueden alcanzar densidades altas;
        # una marca real debe cubrir el núcleo prácticamente completo.
        marcadas = [OPCIONES[int(indice)] for indice in orden if densidades[int(indice)] >= 94.0]
        if len(marcadas) > 2:
            marcadas = marcadas[:2]
        respuesta = "".join(marcadas) if marcadas else ""
        respuestas[str(pregunta)] = respuesta
        detalles.append({"pregunta": pregunta, "respuesta": respuesta, "densidades": densidades})
    return {"respuestas": respuestas, "detalles": detalles}


def _candidatos_codigo(imagen: np.ndarray) -> list[str]:
    alto, ancho = imagen.shape[:2]
    # Solo se procesa el recuadro superior derecho donde se sobreimprime el
    # código del estudiante. No se cotejan grupo, materia ni nombre.
    zonas = [ZONA_CODIGO_ESTUDIANTE]
    candidatos: list[str] = []
    for x1, y1, x2, y2 in zonas:
        recorte = imagen[int(alto * y1):int(alto * y2), int(ancho * x1):int(ancho * x2)]
        if recorte.size == 0:
            continue
        gris = cv2.cvtColor(recorte, cv2.COLOR_BGR2GRAY)
        ampliada = cv2.resize(gris, None, fx=2.5, fy=2.5, interpolation=cv2.INTER_CUBIC)
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


def _persistir_calificacion(rol_examen_id: str, lectura: dict[str, Any], mapeo: dict[str, Any]) -> None:
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
                     estado_calificacion, respuestas_detectadas_json, procesado_por)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (rol_examen_id, lectura["codigoEstudiante"], mapeo["nombre"], mapeo["variante"],
                 total, aciertos, fallos, blancos, dobles, round(aciertos * 30 / total, 2) if total else 0,
                 nota100, "APROBADO" if nota100 >= 51 else "REPROBADO", json.dumps(respuestas), "OMR_VISION_ENGINE_V1"),
            )
        conexion.commit()
    finally:
        conexion.close()


def _resumen_calificacion(lectura: dict[str, Any], mapeo: dict[str, Any]) -> dict[str, Any]:
    """Calcula el resumen sin exponer la variante interna al cliente."""
    respuestas = lectura["respuestas"]
    patron = {str(clave): valor for clave, valor in mapeo["patron"].items()}
    total = len(patron)
    aciertos = sum(1 for pregunta, correcta in patron.items() if respuestas.get(pregunta) == correcta)
    blancos = sum(1 for pregunta in patron if not respuestas.get(pregunta))
    dobles = sum(1 for pregunta in patron if len(respuestas.get(pregunta, "")) > 1)
    fallos = max(0, total - aciertos - blancos)
    nota100 = round((aciertos / total) * 100, 2) if total else 0
    return {
        "estudianteNombre": mapeo["nombre"],
        "totalReactivos": total,
        "aciertos": aciertos,
        "fallos": fallos,
        "blancos": blancos,
        "doblesMarcas": dobles,
        "notaSobre100": nota100,
        "notaSobre30": round(aciertos * 30 / total, 2) if total else 0,
        "estadoCalificacion": "APROBADO" if nota100 >= 51 else "REPROBADO",
    }


def procesar_archivo(archivo: str, rol_examen_id: str) -> dict[str, Any]:
    mapeos = _cargar_mapeos(rol_examen_id)
    if not mapeos:
        raise ValueError("El rol no tiene un mapeo oficial de estudiantes-variante.")
    paginas = _abrir_paginas(archivo)
    lecturas = []
    for numero_pagina, imagen in enumerate(paginas, start=1):
        gris = cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY)
        grilla = _detectar_grilla(gris)
        candidatos = _candidatos_codigo(imagen)
        codigo = next((valor for valor in candidatos if valor in mapeos), None)
        lectura = {
            "pagina": numero_pagina,
            "codigoEstudiante": codigo,
            "codigoOcr": candidatos,
            "grilla": {"x": grilla[0], "y": grilla[1], "ancho": grilla[2], "alto": grilla[3]},
            **_leer_respuestas(gris, grilla),
        }
        if codigo:
            _persistir_calificacion(rol_examen_id, lectura, mapeos[codigo])
            lectura.update(_resumen_calificacion(lectura, mapeos[codigo]))
            lectura["estado"] = "CALIFICADO"
        else:
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
