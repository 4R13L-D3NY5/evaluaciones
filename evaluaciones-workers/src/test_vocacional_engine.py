"""Motor OMR y OCR para evaluación de Test de Orientación Vocacional Holland RIASEC (8.5x13)."""

import json
import logging
import os
import re
from pathlib import Path
from typing import Any, Callable

import cv2
import fitz  # PyMuPDF
import numpy as np
import pytesseract

from . import config

logger = logging.getLogger(__name__)

# Catálogo completo de las 42 afirmaciones del test Holland RIASEC impreso
AFIRMACIONES_HOLLAND = [
    "Me gusta trabajar con automóviles.",
    "Me gusta resolver rompecabezas.",
    "Se me da bien trabajar de forma independiente.",
    "Me gusta trabajar en equipo.",
    "Soy una persona ambiciosa y me pongo metas.",
    "Me gusta organizar cosas (archivos, escritorios u oficinas).",
    "Me gusta construir cosas.",
    "Me gusta leer sobre arte y música.",
    "Me gusta tener instrucciones claras que seguir.",
    "Me gusta intentar influir o persuadir a la gente.",
    "Me gusta hacer experimentos.",
    "Me gusta enseñar o formar a la gente.",
    "Me gusta intentar ayudar a la gente a resolver sus problemas.",
    "Me gusta cuidar de animales.",
    "No me importaría trabajar ocho horas al día en una oficina.",
    "Me gusta vender cosas.",
    "Disfruto de la escritura creativa.",
    "Me gusta la ciencia.",
    "Asumo nuevas responsabilidades rápidamente.",
    "Me interesa sanar a la gente.",
    "Me gusta intentar entender cómo funcionan las cosas.",
    "Me gusta montar o ensamblar cosas.",
    "Soy una persona creativa.",
    "Presto atención a los detalles.",
    "Me gusta archivar documentos o escribir a máquina.",
    "Me gusta analizar cosas (problemas o situaciones).",
    "Me gusta tocar instrumentos o cantar.",
    "Disfruto aprendiendo sobre otras culturas.",
    "Me gustaría montar mi propio negocio.",
    "Me gusta cocinar.",
    "Me gusta actuar en obras de teatro.",
    "Soy una persona práctica.",
    "Me gusta trabajar con números o gráficos.",
    "Me gusta participar en discusiones sobre distintos temas.",
    "Se me da bien llevar un registro de mi trabajo.",
    "Me gusta liderar.",
    "Me gusta trabajar al aire libre.",
    "Me gustaría trabajar en una oficina.",
    "Se me dan bien las matemáticas.",
    "Me gusta ayudar a la gente.",
    "Me gusta dibujar.",
    "Me gusta dar discursos."
]


def _extraer_candidatos_ocr(crop_bgr: np.ndarray, tipo_campo: str = "general") -> tuple[str, list[str]]:
    """Extrae la mejor coincidencia y hasta 5 alternativas candidatas mediante preprocesamiento variado y Tesseract."""
    if crop_bgr is None or crop_bgr.size == 0:
        return "", []

    gray = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2GRAY)
    
    # Salto rápido si el área es completamente fondo blanco / sin escritura
    std_val = float(np.std(gray))
    mean_val = float(np.mean(gray))
    if mean_val > 248.0 or std_val < 7.0:
        return "", []

    candidatos: list[str] = []

    # Escalamiento 2x para mejorar legibilidad en dígitos y manuscrito
    up_gray = cv2.resize(gray, None, fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)

    # Variaciones de binarización
    variaciones = [
        up_gray,
        cv2.threshold(up_gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1],
        cv2.adaptiveThreshold(up_gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 5)
    ]

    if tipo_campo == "celular":
        configs = [
            "--psm 6 -c tessedit_char_whitelist=0123456789",
            "--psm 7 -c tessedit_char_whitelist=0123456789",
            "--psm 8 -c tessedit_char_whitelist=0123456789",
            "--psm 11 -c tessedit_char_whitelist=0123456789"
        ]
    else:
        configs = ["--psm 6", "--psm 7", "--psm 3", "--psm 8"]

    patron_etiquetas = re.compile(
        r"\b(NOMBRE\s+COMPLETO|NOMBRE|COMPLETO|CORREO\s*ELECTR[OÓ]NICO|CORREO|CELULAR|CURSO|FECHA|COLEGIO|ESTUDIANTE|PARALELO)\b",
        flags=re.IGNORECASE
    )

    candidatos: list[str] = []

    for img_variacion in variaciones:
        for cfg in configs:
            try:
                raw_txt = pytesseract.image_to_string(img_variacion, config=cfg)
            except Exception:
                continue

            for linea in raw_txt.splitlines():
                linea_str = linea.strip()
                if not linea_str:
                    continue

                if tipo_campo == "celular":
                    # Buscar secuencias numéricas de 7 a 10 dígitos
                    encontrados = re.findall(r"\d{7,10}", linea_str)
                    for num in encontrados:
                        if num not in candidatos:
                            candidatos.append(num)
                    # También si la línea contiene dígitos dispersos
                    solo_digitos = re.sub(r"\D", "", linea_str)
                    if 7 <= len(solo_digitos) <= 10 and solo_digitos not in candidatos:
                        candidatos.append(solo_digitos)

                elif tipo_campo == "correo":
                    # Buscar formato de correo
                    match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", linea_str)
                    if match:
                        correo_limpio = match.group(0).lower()
                        if correo_limpio not in candidatos:
                            candidatos.append(correo_limpio)
                    else:
                        # Limpiar etiquetas impresas del formato
                        limpio = patron_etiquetas.sub("", linea_str)
                        limpio = re.sub(r"[[\](){}|*~_=+;<>\\/:\-]+", " ", limpio)
                        limpio = re.sub(r"\s+", " ", limpio).strip()
                        if len(limpio) >= 6 and "@" in limpio and limpio.lower() not in candidatos:
                            candidatos.append(limpio.lower())

                else: # Nombre Completo
                    # Descartar etiquetas impresas del recuadro
                    limpio = patron_etiquetas.sub("", linea_str)
                    # Quitar caracteres especiales / ruido de bordes
                    limpio = re.sub(r"[[\](){}|*~_=+;<>\\/:\-]+", " ", limpio)
                    limpio = re.sub(r"\s+", " ", limpio).strip()

                    # Si el nombre es razonable, agregar
                    if len(limpio) >= 3 and limpio not in candidatos:
                        candidatos.append(limpio)

                # Salida anticipada rápida si ya encontramos un candidato de alta calidad
                if tipo_campo == "celular":
                    if any(len(c) == 8 and c[0] in ("6", "7") for c in candidatos):
                        break
                elif tipo_campo == "correo":
                    if any("@" in c and "." in c for c in candidatos):
                        break
                elif tipo_campo == "nombre":
                    if any(" " in c and len(c) >= 10 for c in candidatos):
                        break

            # Romper si ya tenemos un candidato óptimo o suficientes sugerencias
            if tipo_campo == "celular" and any(len(c) == 8 and c[0] in ("6", "7") for c in candidatos):
                break
            if tipo_campo == "correo" and any("@" in c and "." in c for c in candidatos):
                break
            if len(candidatos) >= 4:
                break
        if tipo_campo == "celular" and any(len(c) == 8 and c[0] in ("6", "7") for c in candidatos):
            break
        if tipo_campo == "correo" and any("@" in c and "." in c for c in candidatos):
            break
        if len(candidatos) >= 4:
            break

    # Si hay candidatos para nombre, podemos generar variantes útiles (ej. mayúsculas limpias)
    if tipo_campo == "nombre" and candidatos:
        extra_variantes = []
        for c in candidatos:
            c_upper = c.upper()
            if c_upper not in candidatos and c_upper not in extra_variantes and len(c_upper) >= 4:
                extra_variantes.append(c_upper)
            c_title = c.title()
            if c_title not in candidatos and c_title not in extra_variantes and len(c_title) >= 4:
                extra_variantes.append(c_title)
        candidatos.extend(extra_variantes)

    # Selección de la mejor coincidencia
    mejor = ""
    if candidatos:
        if tipo_campo == "celular":
            # En Bolivia, celulares tienen 8 dígitos e inician con 6 o 7
            celulares_8 = [c for c in candidatos if len(c) == 8 and c[0] in ("6", "7")]
            mejor = celulares_8[0] if celulares_8 else max(candidatos, key=len)
        elif tipo_campo == "correo":
            validos = [c for c in candidatos if "@" in c and "." in c]
            mejor = validos[0] if validos else candidatos[0]
        else:
            # Priorizar nombres con espacio (nombre y apellido) y longitud significativa
            con_espacios = [c for c in candidatos if " " in c and len(c) > 7]
            mejor = con_espacios[0] if con_espacios else candidatos[0]

    # Asegurar que la mejor opción esté en primera posición de la lista
    if mejor and mejor in candidatos:
        candidatos.remove(mejor)
        candidatos.insert(0, mejor)

    return mejor, candidatos[:6]


def _detectar_burbujas_y_vector(gray: np.ndarray, w: int, h: int) -> tuple[list[int], list[dict[str, Any]], list[tuple[int, int, bool]]]:
    """Evalúa las 42 burbujas del test Holland y devuelve el vector de números marcados y su estado detallado."""
    y_step = (0.860 - 0.427) / 20.0
    col1_coords = [(int(0.469 * w), int((0.427 + i * y_step) * h)) for i in range(21)]
    col2_coords = [(int(0.948 * w), int((0.427 + i * y_step) * h)) for i in range(21)]
    todas_burbujas = col1_coords + col2_coords

    numeros_marcados: list[int] = []
    detalles: list[dict[str, Any]] = []
    marcas_preview: list[tuple[int, int, bool]] = []

    for idx, (bx, by) in enumerate(todas_burbujas):
        num_pregunta = idx + 1
        texto_afirmacion = AFIRMACIONES_HOLLAND[idx] if idx < len(AFIRMACIONES_HOLLAND) else f"Afirmación {num_pregunta}"

        # Región circular interior (radio ~7 px en escala 150-300 dpi)
        radio_eval = max(4, int(w * 0.006))
        mascara = np.zeros(gray.shape, dtype=np.uint8)
        cv2.circle(mascara, (bx, by), radio_eval, 255, -1)

        intensidad_media = cv2.mean(gray, mask=mascara)[0]
        # Burbuja en blanco tiene fondo claro (>200); marcada tiene trazo oscuro (<165)
        esta_marcada = intensidad_media < 170.0

        if esta_marcada:
            numeros_marcados.append(num_pregunta)

        detalles.append({
            "numero": num_pregunta,
            "afirmacion": texto_afirmacion,
            "marcado": esta_marcada,
            "intensidad": round(float(intensidad_media), 1),
            "coordenadas": {"x": bx, "y": by}
        })
        marcas_preview.append((bx, by, esta_marcada))

    return numeros_marcados, detalles, marcas_preview


def _generar_imagen_anotada(
    img_bgr: np.ndarray,
    cajas_header: list[tuple[int, int, int, int, str]],
    marcas_burbujas: list[tuple[int, int, bool]],
    destino_path: str
) -> None:
    """Genera una imagen con anotaciones visuales de los campos leídos y burbujas marcadas para auditoría."""
    anotada = img_bgr.copy()

    # Dibujar recuadros en los campos del encabezado
    for x, y, bw, bh, etiqueta in cajas_header:
        cv2.rectangle(anotada, (x, y), (x + bw, y + bh), (220, 100, 30), 2)
        cv2.putText(anotada, etiqueta, (x, max(15, y - 4)), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (180, 50, 10), 1, cv2.LINE_AA)

    # Dibujar indicadores en las burbujas
    for bx, by, marcada in marcas_burbujas:
        if marcada:
            # Verde para las marcadas
            cv2.circle(anotada, (bx, by), 12, (0, 180, 50), 2)
            cv2.circle(anotada, (bx, by), 4, (0, 200, 50), -1)
        else:
            # Circunferencia tenue para las vacías
            cv2.circle(anotada, (bx, by), 10, (200, 200, 200), 1)

    os.makedirs(os.path.dirname(destino_path), exist_ok=True)
    cv2.imwrite(destino_path, anotada)


def procesar_archivo_test_vocacional(
    archivo_path: str,
    colegio: str,
    curso: str,
    fecha: str,
    lote_id: str,
    guardar_pdf: bool = False,
    ocr_nombre: bool = False,
    ocr_celular: bool = False,
    ocr_correo: bool = False,
    sede: str = "",
    gestion: str = "",
    municipio: str = "",
    callback_progreso: Callable[[int, int], None] | None = None,
    storage_base_path: str | None = None
) -> dict[str, Any]:
    """
    Procesa un archivo PDF o imagen escaneada de Test Vocacional Holland (8.5x13).
    Devuelve lista de resultados por hoja con datos OCR (si se habilitan), candidatos y vector de números marcados.
    """
    base_dir = storage_base_path or getattr(config, "STORAGE_BASE_PATH", None) or os.getenv("STORAGE_BASE_PATH", "/app/storage")
    previews_dir = os.path.join(base_dir, "test-vocacional", lote_id, "previews")
    os.makedirs(previews_dir, exist_ok=True)

    ruta = Path(archivo_path)
    extension = ruta.suffix.lower()

    paginas_bgr: list[np.ndarray] = []

    if extension == ".pdf":
        try:
            doc = fitz.open(archivo_path)
            for num_pag in range(len(doc)):
                pagina = doc[num_pag]
                # Renderizar a 150 DPI para equilibrio óptimo de velocidad y precisión OCR
                pix = pagina.get_pixmap(dpi=150)
                img = np.frombuffer(pix.samples, dtype=np.uint8).reshape((pix.height, pix.width, pix.n))
                if pix.n == 4:
                    img = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)
                elif pix.n == 1:
                    img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
                else:
                    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
                paginas_bgr.append(img)
            doc.close()

            # Si el usuario eligió no almacenar el PDF original en disco, eliminarlo inmediatamente
            if not guardar_pdf:
                try:
                    if os.path.exists(archivo_path):
                        os.remove(archivo_path)
                        logger.info("PDF original eliminado para ahorrar espacio en disco: %s", archivo_path)
                except Exception as ex_del:
                    logger.warning("No se pudo eliminar PDF temporal %s: %s", archivo_path, ex_del)

        except Exception as e:
            logger.error("Error al abrir PDF con PyMuPDF: %s", e)
            raise ValueError(f"No se pudo leer el archivo PDF: {e}")
    else:
        img = cv2.imread(archivo_path)
        if img is None:
            raise ValueError("No se pudo cargar la imagen escaneada.")
        paginas_bgr.append(img)

    total_paginas = len(paginas_bgr)
    logger.info("Iniciando procesamiento de Test Vocacional lote %s: %d hoja(s) (OCR: nombre=%s, celular=%s, correo=%s)",
                lote_id, total_paginas, ocr_nombre, ocr_celular, ocr_correo)

    resultados_hojas: list[dict[str, Any]] = []

    for num_hoja, img_bgr in enumerate(paginas_bgr, start=1):
        # Notificar progreso en tiempo real
        if callback_progreso:
            try:
                callback_progreso(num_hoja, total_paginas)
            except Exception as e_cb:
                logger.debug("Error ejecutando callback_progreso: %s", e_cb)

        h, w = img_bgr.shape[:2]
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

        # Coordenadas relativas para recorte de campos de encabezado en formato 8.5x13
        # Se excluyen estrictamente las etiquetas impresas inferiores ("NOMBRE COMPLETO", "CELULAR", "CORREO ELECTRONICO")
        crop_nombre = img_bgr[int(0.233 * h):int(0.258 * h), int(0.028 * w):int(0.580 * w)]
        crop_correo = img_bgr[int(0.268 * h):int(0.293 * h), int(0.403 * w):int(0.795 * w)]
        crop_celular = img_bgr[int(0.268 * h):int(0.293 * h), int(0.795 * w):int(0.975 * w)]

        # OCR condicional según flags (desactivados por defecto para velocidad máxima instantánea)
        mejor_nombre, cand_nombre = _extraer_candidatos_ocr(crop_nombre, "nombre") if ocr_nombre else ("", [])
        mejor_celular, cand_celular = _extraer_candidatos_ocr(crop_celular, "celular") if ocr_celular else ("", [])
        mejor_correo, cand_correo = _extraer_candidatos_ocr(crop_correo, "correo") if ocr_correo else ("", [])

        # Detección de burbujas OMR
        numeros_marcados, detalles_preguntas, marcas_preview = _detectar_burbujas_y_vector(gray, w, h)

        # Generar imagen de preview con anotaciones
        preview_filename = f"preview_lote_{lote_id}_p{num_hoja}.png"
        preview_full_path = os.path.join(previews_dir, preview_filename)
        preview_rel_path = f"test-vocacional/{lote_id}/previews/{preview_filename}"

        cajas_header = [
            (int(0.028 * w), int(0.233 * h), int(0.552 * w), int(0.025 * h), "Nombre Completo"),
            (int(0.403 * w), int(0.268 * h), int(0.392 * w), int(0.025 * h), "Correo"),
            (int(0.795 * w), int(0.268 * h), int(0.180 * w), int(0.025 * h), "Celular")
        ]
        _generar_imagen_anotada(img_bgr, cajas_header, marcas_preview, preview_full_path)

        resultados_hojas.append({
            "paginaNumero": num_hoja,
            "colegio": colegio,
            "curso": curso,
            "fecha": fecha,
            "sede": sede,
            "gestion": gestion,
            "municipio": municipio,
            "nombreCompleto": mejor_nombre,
            "candidatosNombre": cand_nombre,
            "celular": mejor_celular,
            "candidatosCelular": cand_celular,
            "correo": mejor_correo,
            "candidatosCorreo": cand_correo,
            "numerosMarcados": numeros_marcados,
            "totalMarcados": len(numeros_marcados),
            "detallesPreguntas": detalles_preguntas,
            "imagenPreviewPath": preview_rel_path,
            "archivoNombre": ruta.name if guardar_pdf else "[NO_ALMACENADO]",
            "estado": "PROCESADO"
        })

    return {
        "loteId": lote_id,
        "colegio": colegio,
        "curso": curso,
        "fecha": fecha,
        "sede": sede,
        "gestion": gestion,
        "municipio": municipio,
        "totalPaginas": total_paginas,
        "guardarPdf": guardar_pdf,
        "resultados": resultados_hojas
    }
