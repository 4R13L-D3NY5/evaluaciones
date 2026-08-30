#!/usr/bin/env python3
"""Prueba de la orquestación completa sin DB/RabbitMQ reales."""
import json
import os
import shutil
import sys
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src import config, orchestrator
import src.db as db_module

# Datos de ejemplo
ROL_EJEMPLO = {
    "id": "ROL-MOCK-TA01-1P",
    "materia_codigo": "MOCK101",
    "materia_nombre": "MATERIA DE PRUEBA",
    "carrera_nombre": "CARRERA PRUEBA",
    "docente_nombre": "DOCENTE PRUEBA",
    "sede_codigo": "CBA",
    "grupo": "TA-01",
    "tipo_parcial": "1er Parcial",
    "semestre": 3,
    "horario": "08:15 - 09:45",
    "fecha_display": "22/08/2026",
}


def _opciones_json(letra_correcta: str, cantidad: int = 5) -> str:
    opciones = []
    for i in range(cantidad):
        letra = chr(ord("A") + i)
        opciones.append({"letra": letra, "texto": f"Opción {letra}", "correcta": letra == letra_correcta})
    return json.dumps(opciones, ensure_ascii=False)


REACTIVOS_EJEMPLO = []
for i in range(7):
    REACTIVOS_EJEMPLO.append({
        "id": i + 1,
        "tipo_reactivo": "SELECCION_MEJOR_RESPUESTA",
        "dificultad": "Fácil",
        "nivel_dificultad": 1,
        "enunciado": f"Pregunta fácil {i + 1}",
        "opciones_json": _opciones_json("A"),
    })
for i in range(16):
    tipo = "VERDADERO_O_FALSO_SIMPLE" if i < 4 else "RESPUESTA_PREMISAS_ABCD"
    REACTIVOS_EJEMPLO.append({
        "id": 100 + i,
        "tipo_reactivo": tipo,
        "dificultad": "Medio",
        "nivel_dificultad": 2,
        "enunciado": f"Pregunta media {i + 1}",
        "opciones_json": _opciones_json("B", cantidad=2 if tipo == "VERDADERO_O_FALSO_SIMPLE" else 4),
    })
for i in range(7):
    REACTIVOS_EJEMPLO.append({
        "id": 200 + i,
        "tipo_reactivo": "SUBITEM_CASO" if i < 4 else "OPCION_EMPAREJAMIENTO",
        "dificultad": "Difícil",
        "nivel_dificultad": 3,
        "enunciado": f"Pregunta difícil {i + 1}",
        "opciones_json": _opciones_json("C"),
    })

ESTUDIANTES_EJEMPLO = [
    {
        "codigo_estudiante": f"{1111111 + i:07d}",
        "nombres": f"ESTUDIANTE {i + 1}",
        "apellido_paterno": "PRUEBA",
        "apellido_materno": "OFICIAL",
        "hash_control_seguridad": f"CTL-{1111111 + i:07d}",
    }
    for i in range(12)
]


def main() -> None:
    output_base = os.path.join(os.path.dirname(__file__), "test_output_orchestrator")
    if os.path.exists(output_base):
        # No eliminar la raíz: puede ser un volumen montado durante la QA visual.
        for child in os.scandir(output_base):
            if child.is_dir(follow_symlinks=False):
                shutil.rmtree(child.path)
            else:
                os.unlink(child.path)
    else:
        os.makedirs(output_base, exist_ok=True)

    logo_project = os.path.join(os.path.dirname(__file__), "..", "bases", "logo_unitepc_clean.png")
    if os.path.exists(logo_project):
        config.LOGO_PATH = os.path.abspath(logo_project)

    # Parchear funciones de DB
    db_module.obtener_rol_examen = lambda _rid: ROL_EJEMPLO
    db_module.obtener_reactivos_por_banco = lambda _bid: REACTIVOS_EJEMPLO
    db_module.obtener_estudiantes_por_rol = lambda _rid: ESTUDIANTES_EJEMPLO

    payload = {
        "jobId": "job-mock-001",
        "rolExamenId": "ROL-MOCK-TA01-1P",
        "bancoPreguntasId": "BANCO-MOCK-001",
        "variantes": ["A", "B", "C"],
        "ratioEstudiantesPorVariante": 5,
        "estudiantes": ESTUDIANTES_EJEMPLO,
        "outputBasePath": output_base,
    }

    result = orchestrator.procesar_job(payload)
    print(json.dumps(result, indent=2, ensure_ascii=False))

    assert result["estado"] == "COMPLETADO"
    assert len(result["variantes"]) == 3
    assert len(result["mapeos"]) == 12
    assert Counter(m["letraVariante"] for m in result["mapeos"]) == {"A": 5, "B": 5, "C": 2}
    for v in result["variantes"]:
        assert os.path.exists(v["archivoPdfPath"])
        assert os.path.exists(v["archivoTypstPath"])
    for m in result["mapeos"]:
        assert os.path.exists(m["cuadernilloPdfPath"])
    assert len({v["archivoPdfPath"] for v in result["variantes"]}) == 1
    assert len({m["cuadernilloPdfPath"] for m in result["mapeos"]}) == 1

    documento_typst = open(result["variantes"][0]["archivoTypstPath"], encoding="utf-8").read()
    assert 'margin: 2cm' in documento_typst
    assert '#pagebreak(to: "odd")' in documento_typst
    assert documento_typst.count('#counter(page).update(1)') == 12
    assert 'size: 15pt' in documento_typst
    assert '*A)*' not in documento_typst
    assert 'VARIANTE' not in documento_typst

    print("\nPrueba de orquestador completada con éxito.")


if __name__ == "__main__":
    main()
