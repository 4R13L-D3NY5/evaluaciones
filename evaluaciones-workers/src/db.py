"""Acceso a PostgreSQL para obtener rol, banco y reactivos."""
import json
import logging
import random
from typing import Any

import psycopg2
from psycopg2.extras import RealDictCursor

from src import config

logger = logging.getLogger(__name__)


def _connect():
    return psycopg2.connect(
        host=config.DB_HOST,
        port=config.DB_PORT,
        dbname=config.DB_NAME,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
    )


def obtener_rol_examen(rol_examen_id: str) -> dict[str, Any] | None:
    sql = """
        SELECT id, sede_codigo, sede_nombre, carrera_codigo, carrera_nombre,
               materia_codigo, materia_nombre, semestre, grupo, tipo_clase,
               docente_nombre, tipo_parcial, fecha, fecha_display, horario,
               campus, estudiantes_inscritos_count
        FROM sea_roles_evaluaciones
        WHERE id = %s
    """
    with _connect() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, (rol_examen_id,))
            row = cur.fetchone()
            return dict(row) if row else None


def obtener_reactivos_por_banco(banco_preguntas_id: str) -> list[dict[str, Any]]:
    sql = """
        SELECT id, numero_orden, tipo_reactivo, dificultad, nivel_dificultad,
               grupo_contexto, enunciado, imagen_base64, opciones_json, respuesta_correcta, peso_puntos
        FROM sea_reactivos
        WHERE banco_id = %s
        ORDER BY numero_orden, id
    """
    with _connect() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, (banco_preguntas_id,))
            return [dict(row) for row in cur.fetchall()]


def obtener_estudiantes_por_rol(rol_examen_id: str) -> list[dict[str, Any]]:
    sql = """
        SELECT codigo_estudiante, nombres, apellido_paterno, apellido_materno,
               letra_variante, hash_control_seguridad
        FROM sea_mapeo_estudiantes_variantes
        WHERE rol_examen_id = %s
        ORDER BY codigo_estudiante
    """
    with _connect() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, (rol_examen_id,))
            return [dict(row) for row in cur.fetchall()]


def parsear_opciones(opciones_json: str) -> list[tuple[str, str, bool]]:
    """Convierte el JSON de opciones al formato (letra, texto, correcta)."""
    try:
        data = json.loads(opciones_json)
    except json.JSONDecodeError:
        logger.warning("No se pudo parsear opciones_json, retornando lista vacía")
        return []

    opciones = []
    if isinstance(data, list):
        for item in data:
            if isinstance(item, dict):
                letra = item.get("letra", item.get("opcion", ""))
                texto = item.get("texto", item.get("enunciado_opcion", ""))
                correcta = bool(item.get("correcta", item.get("es_correcta", False)))
                opciones.append((letra, texto, correcta))
            elif isinstance(item, (list, tuple)) and len(item) >= 3:
                opciones.append((item[0], item[1], bool(item[2])))
    return opciones


def barajar_opciones(opciones: list[tuple[str, str, bool]], semilla: int) -> list[tuple[str, str, bool]]:
    """Devuelve las opciones barajadas de forma determinística y renumeradas A-E."""
    rng = random.Random(semilla)
    mezcladas = opciones[:]
    rng.shuffle(mezcladas)
    letras = [chr(ord("A") + i) for i in range(len(mezcladas))]
    return [(letras[i], texto, correcta) for i, (_, texto, correcta) in enumerate(mezcladas)]
