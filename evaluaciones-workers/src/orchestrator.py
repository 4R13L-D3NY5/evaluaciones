"""Orquestador que genera un único documento oficial por rol."""
import json
import logging
import os
import random
from typing import Any

from src import config, db, generator, messaging, vault_crypto

logger = logging.getLogger(__name__)

MAX_VARIANTES = 702


def _etiqueta_variante(indice: int) -> str:
    """Devuelve etiquetas tipo Excel: A..Z, AA..ZZ."""
    if indice < 0:
        raise ValueError("El índice de variante no puede ser negativo")
    etiqueta = ""
    valor = indice
    while True:
        valor, residuo = divmod(valor, 26)
        etiqueta = chr(65 + residuo) + etiqueta
        if valor == 0:
            return etiqueta
        valor -= 1


def _catalogo_variantes(cantidad: int) -> list[str]:
    if cantidad < 1:
        return []
    if cantidad > MAX_VARIANTES:
        raise ValueError(
            f"La generación requiere {cantidad} variantes y supera el máximo seguro de {MAX_VARIANTES}"
        )
    return [_etiqueta_variante(indice) for indice in range(cantidad)]


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


def _normalizar_reactivo_previsualizacion(item: dict[str, Any], indice: int) -> dict[str, Any]:
    """Adapta un reactivo aún no persistido al contrato del generador Typst."""
    tipo = item.get("tipo_reactivo") or item.get("tipo") or "SELECCION_MEJOR_RESPUESTA"
    nivel = item.get("nivel_dificultad") or item.get("dificultad")
    try:
        nivel = int(nivel)
    except (TypeError, ValueError):
        nivel = {"fácil": 1, "facil": 1, "medio": 2, "difícil": 3, "dificil": 3}.get(
            str(nivel or "").strip().lower(), 2
        )
    nivel = max(1, min(3, nivel))
    opciones = item.get("opciones_json")
    if not isinstance(opciones, str):
        respuesta = str(item.get("respuesta_correcta") or "").strip().upper()
        opciones = json.dumps([
            {
                "letra": letra,
                "texto": item.get(f"opcion_{letra.lower()}") or "",
                "correcta": respuesta == letra,
            }
            for letra in ("A", "B", "C", "D", "E")
            if item.get(f"opcion_{letra.lower()}")
        ], ensure_ascii=False)
    return {
        "id": item.get("id") or item.get("fila") or f"preview-{indice}",
        "numero_orden": item.get("numero_orden") or item.get("fila") or indice,
        "tipo_reactivo": tipo,
        "grupo_contexto": item.get("grupo_contexto") or item.get("grupo"),
        "enunciado": item.get("enunciado") or "",
        "imagen_base64": item.get("imagen_base64"),
        "nivel_dificultad": nivel,
        "dificultad": {1: "Fácil", 2: "Medio", 3: "Difícil"}[nivel],
        "opciones_json": opciones,
    }


def procesar_previsualizacion(payload: dict[str, Any]) -> dict[str, Any]:
    """Compila una vista temporal sin cifrar ni persistir datos operativos."""
    rol = db.obtener_rol_examen(payload["rolExamenId"])
    if not rol:
        raise ValueError(f"No existe el rol de examen {payload['rolExamenId']}")
    reactivos = [
        _normalizar_reactivo_previsualizacion(item, indice)
        for indice, item in enumerate(payload.get("preguntasPreview") or [], start=1)
        if isinstance(item, dict)
    ]
    if not reactivos or not any(not generator._es_macro(item) for item in reactivos):
        raise ValueError(
            "La previsualización requiere al menos una pregunta respondible"
        )
    variante = generator.generar_variante(
        "A",
        reactivos,
        rol,
        payload.get("outputBasePath", "/app/storage/generados/previsualizaciones"),
        generar_pdf=True,
        modo_previsualizacion=True,
    )
    return {
        "jobId": payload["jobId"],
        "rolExamenId": payload["rolExamenId"],
        "estado": "COMPLETADO",
        "modoPrevisualizacion": True,
        "mensaje": "Previsualización Typst generada correctamente",
        "variantes": [{
            "letra": "A",
            "semilla": variante["semilla"],
            "totalPreguntas": len(json.loads(variante["patronClavesJson"])),
            "archivoPdfPath": variante["archivoPdfPath"],
            "archivoTypstPath": variante["archivoTypstPath"],
        }],
        "mapeos": [],
    }


def _asignar_variantes_aleatorias(
    estudiantes: list[dict[str, Any]],
    variantes_disponibles: list[str],
    ratio: int,
) -> list[str]:
    """Distribuye estudiantes de forma equilibrada entre las variantes."""
    if not estudiantes:
        return []
    if ratio < 1:
        ratio = config.RATIO_ESTUDIANTES_POR_VARIANTE

    indices = list(range(len(estudiantes)))
    randomizador = random.SystemRandom()
    randomizador.shuffle(indices)

    cantidad_variantes = len(variantes_disponibles)
    base, sobrantes = divmod(len(estudiantes), cantidad_variantes)
    cupos = [base] * cantidad_variantes
    # Los sobrantes se agregan al final: 13 estudiantes en A/B/C queda 4/4/5.
    for indice in range(sobrantes):
        cupos[cantidad_variantes - 1 - indice] += 1

    asignaciones = [variantes_disponibles[0]] * len(estudiantes)
    cursor = 0
    for indice_variante, cupo in enumerate(cupos):
        for indice_estudiante in indices[cursor:cursor + cupo]:
            asignaciones[indice_estudiante] = variantes_disponibles[indice_variante]
        cursor += cupo
    return asignaciones


def procesar_job(payload: dict[str, Any]) -> dict[str, Any]:
    if payload.get("modoPrevisualizacion"):
        return procesar_previsualizacion(payload)

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

    # El ratio orienta cuántas variantes se preparan. Cuando la división no es
    # exacta se redondea al número de variantes más razonable y luego se
    # reparte la nómina con diferencia máxima de un estudiante.
    cantidad_requerida = max(1, int(len(estudiantes) / max(ratio, 1) + 0.5))
    if len(estudiantes) > ratio and cantidad_requerida == 1:
        cantidad_requerida = 2
    letras_catalogo = _catalogo_variantes(MAX_VARIANTES)
    if not variantes_letras:
        variantes_letras = letras_catalogo[:cantidad_requerida]
    else:
        variantes_letras = [letra for letra in variantes_letras if letra in letras_catalogo]
        variantes_letras = variantes_letras[:max(cantidad_requerida, 1)]
        # El cliente puede ser antiguo y enviar solamente A-E. Completar el
        # catálogo evita rechazar ratio 1 cuando hay más de cinco estudiantes.
        for letra in letras_catalogo:
            if len(variantes_letras) >= cantidad_requerida:
                break
            if letra not in variantes_letras:
                variantes_letras.append(letra)
    if not variantes_letras:
        raise ValueError("No se definieron variantes válidas para generar el examen")
    if len(variantes_letras) < cantidad_requerida:
        raise ValueError(
            f"No se pudieron preparar {cantidad_requerida} variantes para "
            f"{len(estudiantes)} estudiantes con ratio {ratio}"
        )

    variantes_result = []
    preguntas_por_variante: dict[str, list[dict[str, Any]]] = {}

    for letra in variantes_letras:
        variante = generator.generar_variante(letra, reactivos, rol, output_base, generar_pdf=False)
        contenido_cifrado = vault_crypto.cifrar_json(
            {
                "patronClavesJson": variante["patronClavesJson"],
                "ordenReactivosIdsJson": variante["ordenReactivosIdsJson"],
                "contenidoVirtualJson": variante["contenidoVirtualJson"],
            },
            f"variante:VAR-{rol_examen_id}-{letra}:rol:{rol_examen_id}",
        )
        variantes_result.append({
            "letra": variante["letra"],
            "semilla": variante["semilla"],
            "totalPreguntas": len(json.loads(variante["patronClavesJson"])),
            "contenidoCifrado": contenido_cifrado["ciphertext"],
            "contenidoNonce": contenido_cifrado["nonce"],
            "contenidoDekEnvuelta": contenido_cifrado["wrappedDataKey"],
            "contenidoKekReferencia": contenido_cifrado["keyReference"],
            "contenidoKekVersion": contenido_cifrado["keyVersion"],
            "contenidoAlgoritmo": contenido_cifrado["algorithm"],
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
