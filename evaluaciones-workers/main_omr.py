"""Entrypoint del worker OMR institucional."""
import logging
import sys
import time

from src import messaging
from src.omr_engine import procesar_archivo, procesar_archivo_lectura
from src.test_vocacional_engine import procesar_archivo_test_vocacional

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | OMR | %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)


def _procesar_job_omr(payload: dict) -> dict:
    job_id = payload.get("jobId", "unknown")
    modo = payload.get("modo", "")

    if modo == "TEST_VOCACIONAL" or payload.get("tipo") == "TEST_VOCACIONAL":
        lote_id = payload.get("loteId") or job_id
        logger.info("Job Test Vocacional %s recibido para lote %s", job_id, lote_id)
        colegio = payload.get("colegio", "")
        curso = payload.get("curso", "")
        fecha = payload.get("fecha", "")
        sede = payload.get("sede", "")
        gestion = payload.get("gestion", "")
        municipio = payload.get("municipio", "")
        guardar_pdf = payload.get("guardarPdf", False)
        ocr_nombre = payload.get("ocrNombre", False)
        ocr_celular = payload.get("ocrCelular", False)
        ocr_correo = payload.get("ocrCorreo", False)

        def _progreso(num_pag: int, tot_pags: int):
            pct = int((num_pag / tot_pags) * 100) if tot_pags > 0 else 0
            messaging.publicar_resultado({
                "jobId": job_id,
                "loteId": lote_id,
                "tipo": "TEST_VOCACIONAL_PROGRESO",
                "estado": "PROCESANDO",
                "paginaActual": num_pag,
                "totalPaginas": tot_pags,
                "porcentaje": pct,
                "mensaje": f"Evaluando hoja {num_pag} de {tot_pags} ({pct}%)..."
            })

        resultado = procesar_archivo_test_vocacional(
            payload["archivoPath"],
            colegio,
            curso,
            fecha,
            lote_id,
            guardar_pdf=guardar_pdf,
            ocr_nombre=ocr_nombre,
            ocr_celular=ocr_celular,
            ocr_correo=ocr_correo,
            sede=sede,
            gestion=gestion,
            municipio=municipio,
            callback_progreso=_progreso
        )
        return {
            "jobId": job_id,
            "loteId": lote_id,
            "tipo": "TEST_VOCACIONAL",
            "estado": "COMPLETADO",
            "mensaje": f"Test Vocacional procesado: {resultado.get('totalPaginas', 0)} hoja(s) evaluada(s).",
            **resultado,
        }

    rol_examen_id = payload.get("rolExamenId", "unknown")
    logger.info("Job OMR %s recibido para rol %s", job_id, rol_examen_id)
    campus = payload.get("campus", "")
    impresora = payload.get("impresora", "")
    resultado = procesar_archivo_lectura(payload["archivoPath"], campus, impresora) if modo == "LECTURA_CONCILIACION" else procesar_archivo(payload["archivoPath"], rol_examen_id, campus, impresora)
    return {
        "jobId": job_id,
        "rolExamenId": rol_examen_id,
        "estado": "COMPLETADO",
        "mensaje": "Lectura OMR completada: código y respuestas disponibles para conciliación." if modo == "LECTURA_CONCILIACION" else "Cartillas procesadas: código y respuestas leídos.",
        **resultado,
    }


def main():
    logger.info("Worker OMR iniciado.")
    while True:
        try:
            messaging.start_consumer(_procesar_job_omr)
        except Exception as e:
            logger.error("Error en consumer OMR: %s. Reconectando en 10s...", e)
            time.sleep(10)


if __name__ == "__main__":
    main()
