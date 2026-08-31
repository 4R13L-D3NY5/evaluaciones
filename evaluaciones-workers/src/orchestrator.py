"""Orquestador que genera un único documento oficial por rol."""
import json
import logging
import os
import random
from typing import Any

from src import config, db, generator, messaging

logger = logging.getLogger(__name__)


def _normalizar_estudiante(estudiante: dict[str, Any]) -> dict[str, Any]:
    """Normaliza estudiantes oficiales enviados por el backend o leídos de DB."""
    codigo = estudiante.get("codigo_estudiante") or estudiante.get("studentCode")
    nombre_completo = estudiante.get("nombre_completo") or estudiante.get("fullName")
    nombres = estudiante.get("nombres") or nombre_completo or ""
    return {
        "codigo_estudiante": codigo,
        "nombres": nombres,
        "apellido_paterno": estudiante.get("apellido_paterno") or "",
        "apellido_materno": estudiante.get("apellido_materno") or "",
        "hash_control_seguridad": estudiante.get("hash_control_seguridad")
        or estudiante.get("hashControlSeguridad"),
    }


def _asignar_variantes_aleatorias(
    estudiantes: list[dict[str, Any]],
    variantes_disponibles: list[str],
    ratio: int,
) -> list[str]:
    """Asigna variantes en grupos de ratio estudiantes, con orden aleatorio."""
    if not estudiantes:
        return []
    if ratio < 1:
        ratio = config.RATIO_ESTUDIANTES_POR_VARIANTE

    indices = list(range(len(estudiantes)))
    randomizador = random.SystemRandom()
    randomizador.shuffle(indices)

    asignaciones = [variantes_disponibles[0]] * len(estudiantes)
    for posicion, indice_estudiante in enumerate(indices):
        indice_variante = min(posicion // ratio, len(variantes_disponibles) - 1)
        asignaciones[indice_estudiante] = variantes_disponibles[indice_variante]
    return asignaciones


def procesar_job(payload: dict[str, Any]) -> dict[str, Any]:
    job_id = payload["jobId"]
    rol_examen_id = payload["rolExamenId"]
    banco_preguntas_id = payload["bancoPreguntasId"]
    ratio_payload = payload.get("ratioEstudiantesPorVariante", config.RATIO_ESTUDIANTES_POR_VARIANTE)
    try:
        ratio = int(ratio_payload)
    except (TypeError, ValueError):
        ratio = config.RATIO_ESTUDIANTES_POR_VARIANTE
    if ratio < 1:
        ratio = config.RATIO_ESTUDIANTES_POR_VARIANTE
    variantes_letras = list(dict.fromkeys(payload.get("variantes", [])))
    output_base = payload.get("outputBasePath", "/app/storage/generados")
    solo_virtual = bool(payload.get("soloVirtual", False))

    rol = db.obtener_rol_examen(rol_examen_id)
    if not rol:
        raise ValueError(f"No existe el rol de examen {rol_examen_id}")

    reactivos = db.obtener_reactivos_por_banco(banco_preguntas_id)
    if len(reactivos) < config.TOTAL_PREGUNTAS:
        raise ValueError(
            f"El banco {banco_preguntas_id} no tiene suficientes reactivos ({len(reactivos)} < {config.TOTAL_PREGUNTAS})"
        )

    estudiantes_payload = payload.get("estudiantes")
    if isinstance(estudiantes_payload, list):
        estudiantes = [_normalizar_estudiante(item) for item in estudiantes_payload if isinstance(item, dict)]
    else:
        # Compatibilidad controlada para jobs antiguos que ya tenían mapeos.
        estudiantes = [_normalizar_estudiante(item) for item in db.obtener_estudiantes_por_rol(rol_examen_id)]
    if not estudiantes:
        raise ValueError(
            f"No hay estudiantes oficiales inscritos para el rol {rol_examen_id}; "
            "no se generará un documento con datos ficticios"
        )
    if any(not item.get("codigo_estudiante") or not item.get("nombres") for item in estudiantes):
        raise ValueError("La nómina oficial contiene estudiantes sin código o nombre completo")

    cantidad_requerida = max(1, (len(estudiantes) + max(ratio, 1) - 1) // max(ratio, 1))
    letras_catalogo = ["A", "B", "C", "D", "E"]
    if not variantes_letras:
        variantes_letras = letras_catalogo[:cantidad_requerida]
    else:
        variantes_letras = [letra for letra in variantes_letras if letra in letras_catalogo]
        variantes_letras = variantes_letras[:max(cantidad_requerida, 1)]
    if not variantes_letras:
        raise ValueError("No se definieron variantes válidas para generar el examen")
    if len(estudiantes) > ratio * len(letras_catalogo):
        raise ValueError(
            f"El rol tiene {len(estudiantes)} estudiantes y supera el máximo de "
            f"{ratio * len(letras_catalogo)} con ratio {ratio}"
        )

    variantes_result = []
    preguntas_por_variante: dict[str, list[dict[str, Any]]] = {}

    for letra in variantes_letras:
        variante = generator.generar_variante(letra, reactivos, rol, output_base, generar_pdf=False)
        variantes_result.append({
            "letra": variante["letra"],
            "semilla": variante["semilla"],
            "patronClavesJson": variante["patronClavesJson"],
            "ordenReactivosIdsJson": variante["ordenReactivosIdsJson"],
            "contenidoVirtualJson": variante["contenidoVirtualJson"],
            "archivoPdfPath": variante["archivoPdfPath"],
            "archivoTypstPath": variante["archivoTypstPath"],
        })
        preguntas_por_variante[letra] = variante["_preguntas"]

    asignaciones = _asignar_variantes_aleatorias(estudiantes, variantes_letras, ratio)
    estudiantes_documento: list[tuple[dict[str, Any], str]] = []
    mapeos_result = []
    estudiantes_documento = list(zip(estudiantes, asignaciones))

    documento = {"archivoPdfPath": None, "archivoTypstPath": None}
    if not solo_virtual:
        documento = generator.generar_documento_unificado(
            estudiantes_documento,
            variantes_result,
            preguntas_por_variante,
            rol,
            output_base,
        )

    for est, letra in estudiantes_documento:
        mapeos_result.append({
            "codigoEstudiante": est["codigo_estudiante"],
            "letraVariante": letra,
            "hashControl": est.get("hash_control_seguridad") or f"CTL-{est['codigo_estudiante']}-{letra}",
            "cuadernilloPdfPath": documento["archivoPdfPath"],
            "nombres": est.get("nombres", ""),
            "apellidoPaterno": est.get("apellido_paterno", ""),
            "apellidoMaterno": est.get("apellido_materno", ""),
        })

    return {
        "jobId": job_id,
        "rolExamenId": rol_examen_id,
        "estado": "COMPLETADO",
        "mensaje": (
            f"Preparadas {len(mapeos_result)} evaluaciones virtuales y {len(variantes_result)} variantes sin PDF"
            if solo_virtual else
            f"Generadas {len(mapeos_result)} evaluaciones en un documento oficial y {len(variantes_result)} variantes"
        ),
        "variantes": variantes_result,
        "mapeos": mapeos_result,
    }


def run_local_test() -> None:
    """Ejecuta un job de prueba local sin RabbitMQ."""
    payload = {
        "jobId": "job-test-001",
        "rolExamenId": "ROL-CPEC18-TA01-1P",
        "bancoPreguntasId": "BANCO-CPEC18-001",
        "variantes": ["A", "B", "C"],
        "ratioEstudiantesPorVariante": 5,
        "outputBasePath": os.path.join(os.path.dirname(os.path.dirname(__file__)), "test_output"),
    }
    result = procesar_job(payload)
    print(json.dumps(result, indent=2, ensure_ascii=False))
