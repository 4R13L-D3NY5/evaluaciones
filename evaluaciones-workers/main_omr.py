"""Entrypoint del worker OMR institucional."""
import logging
import sys
import time

from src import messaging
from src.omr_engine import procesar_archivo

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | OMR | %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)


def _procesar_job_omr(payload: dict) -> dict:
    job_id = payload.get("jobId", "unknown")
    rol_examen_id = payload.get("rolExamenId", "unknown")
    logger.info("Job OMR %s recibido para rol %s", job_id, rol_examen_id)
    resultado = procesar_archivo(payload["archivoPath"], rol_examen_id)
    return {
        "jobId": job_id,
        "rolExamenId": rol_examen_id,
        "estado": "COMPLETADO",
        "mensaje": "Cartillas procesadas: código y respuestas leídos.",
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
