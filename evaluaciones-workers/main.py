#!/usr/bin/env python3
"""Worker Python Typst para el Sistema de Evaluaciones SEA/SISA.

Consume de la cola `evaluaciones.generacion.typst` y publica resultados
en `evaluaciones.generacion.resultado`.
"""
import logging
import sys

from src import config, messaging, orchestrator

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)


def main() -> None:
    if len(sys.argv) > 1 and sys.argv[1] == "--local-test":
        logger.info("Ejecutando prueba local...")
        orchestrator.run_local_test()
        return

    logger.info(
        "Iniciando worker Typst: in=%s out=%s db=%s:%s/%s",
        config.RABBITMQ_QUEUE_IN,
        config.RABBITMQ_QUEUE_OUT,
        config.DB_HOST,
        config.DB_PORT,
        config.DB_NAME,
    )
    messaging.start_consumer(orchestrator.procesar_job)


if __name__ == "__main__":
    main()
