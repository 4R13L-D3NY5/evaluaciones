"""Consumidor y publicador RabbitMQ para el worker Typst."""
import json
import logging
from typing import Any, Callable

import pika
from pika.adapters.blocking_connection import BlockingChannel

from src import config

logger = logging.getLogger(__name__)


def _connection_params() -> pika.ConnectionParameters:
    credentials = pika.PlainCredentials(config.RABBITMQ_USER, config.RABBITMQ_PASS)
    return pika.ConnectionParameters(
        host=config.RABBITMQ_HOST,
        port=config.RABBITMQ_PORT,
        virtual_host=config.RABBITMQ_VHOST,
        credentials=credentials,
        heartbeat=600,
        blocked_connection_timeout=300,
    )


def publish_result(result: dict[str, Any]) -> None:
    body = json.dumps(result, ensure_ascii=False)
    params = _connection_params()
    connection = pika.BlockingConnection(params)
    try:
        channel = connection.channel()
        channel.queue_declare(queue=config.RABBITMQ_QUEUE_OUT, durable=True)
        channel.basic_publish(
            exchange="",
            routing_key=config.RABBITMQ_QUEUE_OUT,
            body=body.encode("utf-8"),
            properties=pika.BasicProperties(
                delivery_mode=2,  # persistent
                content_type="application/json",
            ),
        )
        logger.info("Resultado publicado en %s para jobId=%s", config.RABBITMQ_QUEUE_OUT, result.get("jobId"))
    finally:
        connection.close()


def start_consumer(handler: Callable[[dict[str, Any]], dict[str, Any]]) -> None:
    params = _connection_params()
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue=config.RABBITMQ_QUEUE_IN, durable=True)
    channel.basic_qos(prefetch_count=1)

    def _on_message(
        ch: BlockingChannel,
        method: Any,
        properties: Any,
        body: bytes,
    ) -> None:
        try:
            payload = json.loads(body.decode("utf-8"))
            job_id = payload.get("jobId", "N/A")
            logger.info("Mensaje recibido jobId=%s", job_id)
            result = handler(payload)
        except Exception as exc:
            logger.exception("Error procesando mensaje")
            try:
                payload = json.loads(body.decode("utf-8")) if body else {}
            except Exception:
                payload = {}
            result = {
                "jobId": payload.get("jobId", "unknown"),
                "rolExamenId": payload.get("rolExamenId", ""),
                "estado": "ERROR",
                "mensaje": f"{type(exc).__name__}: {exc}",
                "variantes": [],
                "mapeos": [],
            }
        try:
            publish_result(result)
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception:
            logger.exception("Error publicando resultado, se reencolará el mensaje")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

    channel.basic_consume(queue=config.RABBITMQ_QUEUE_IN, on_message_callback=_on_message)
    logger.info("Worker escuchando en cola %s", config.RABBITMQ_QUEUE_IN)
    channel.start_consuming()
