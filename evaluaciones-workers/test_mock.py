#!/usr/bin/env python3
"""Prueba local sin DB/RabbitMQ usando datos de ejemplo."""
import json
import os
import sys

# Asegurar que se puedan importar los módulos del worker.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src import config, generator

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
        opciones.append({"letra": letra, "texto": f"Opción {letra} de ejemplo", "correcta": letra == letra_correcta})
    return json.dumps(opciones, ensure_ascii=False)


REACTIVOS_EJEMPLO = []
# 7 fáciles
for i in range(7):
    REACTIVOS_EJEMPLO.append({
        "id": i + 1,
        "tipo_reactivo": "SELECCION_MEJOR_RESPUESTA",
        "dificultad": "Fácil",
        "nivel_dificultad": 1,
        "enunciado": f"Pregunta fácil número {i + 1}",
        "opciones_json": _opciones_json("A"),
    })
# 16 medias
for i in range(16):
    tipo = "VERDADERO_O_FALSO_SIMPLE" if i < 4 else "RESPUESTA_PREMISAS_ABCD" if i < 8 else "SELECCION_MEJOR_RESPUESTA"
    REACTIVOS_EJEMPLO.append({
        "id": 100 + i,
        "tipo_reactivo": tipo,
        "dificultad": "Medio",
        "nivel_dificultad": 2,
        "enunciado": f"Pregunta media número {i + 1}",
        "opciones_json": _opciones_json("B", cantidad=2 if tipo == "VERDADERO_O_FALSO_SIMPLE" else 4),
    })
# 7 difíciles
for i in range(7):
    REACTIVOS_EJEMPLO.append({
        "id": 200 + i,
        "tipo_reactivo": "SUBITEM_CASO" if i < 4 else "OPCION_EMPAREJAMIENTO",
        "dificultad": "Difícil",
        "nivel_dificultad": 3,
        "enunciado": f"Pregunta difícil número {i + 1}",
        "opciones_json": _opciones_json("C"),
    })

ESTUDIANTE_EJEMPLO = {
    "codigo_estudiante": "1234567",
    "nombres": "JUAN PEREZ",
    "apellido_paterno": "PRUEBA",
    "apellido_materno": "TEST",
    "hash_control_seguridad": "CTL-1234567-A",
}


def main() -> None:
    output_base = os.path.join(os.path.dirname(__file__), "test_output")
    os.makedirs(output_base, exist_ok=True)

    # Sobrescribir logo por el existente en el proyecto para la prueba.
    logo_project = os.path.join(os.path.dirname(__file__), "..", "bases", "logo_unitepc_clean.png")
    if os.path.exists(logo_project):
        config.LOGO_PATH = os.path.abspath(logo_project)
    else:
        print(f"ADVERTENCIA: no se encontró {logo_project}, la compilación Typst puede fallar.")

    print("Generando variante A...")
    variante = generator.generar_variante("A", REACTIVOS_EJEMPLO, ROL_EJEMPLO, output_base)
    print(f"  PDF: {variante['archivoPdfPath']} ({os.path.getsize(variante['archivoPdfPath'])} bytes)")
    print(f"  Patrón: {variante['patronClavesJson']}")
    typst_generado = open(variante["archivoTypstPath"], encoding="utf-8").read()
    assert 'paper: "us-letter"' not in typst_generado
    assert "CARTILLA" not in typst_generado
    assert 'font: "Times New Roman"' in typst_generado
    assert 'size: 11pt' in typst_generado
    assert 'leading: 0.8em' in typst_generado
    assert 'spacing: 0.8em' in typst_generado
    assert 'breakable: false, spacing: 1.2em' in typst_generado
    assert '#block(inset: (left: 1em))' in typst_generado
    assert '#raw("___", block: false)' in typst_generado
    assert '#text(weight: "regular")[A)' in typst_generado and '#text(weight: "regular")[B)' in typst_generado
    assert '*A)*' not in typst_generado
    assert '#box[#text(weight: "bold")[1. #raw("___", block: false)]] #h(0.25em)#raw(' in typst_generado
    assert '#line(length: 100%, stroke: 1.5pt + black)' in typst_generado
    assert 'INSTRUCCIONES:' in typst_generado
    assert 'INSTRUCCIONES: Lea cuidadosamente cada enunciado' in typst_generado
    seccion_vf_simple = typst_generado.split('VERDADERO O FALSO SIMPLE', 1)[1].split('RESPUESTA A/B/AMBAS/NINGUNA', 1)[0]
    assert '#text(weight: "regular")[A)' not in seccion_vf_simple
    assert '#text(weight: "regular")[B)' not in seccion_vf_simple
    assert 'VARIANTE' not in typst_generado

    print("Generando cuadernillo individual...")
    cuadernillo = generator.generar_cuadernillo(
        ESTUDIANTE_EJEMPLO, "A", variante["_preguntas"], ROL_EJEMPLO, output_base
    )
    print(f"  PDF: {cuadernillo['cuadernilloPdfPath']} ({os.path.getsize(cuadernillo['cuadernilloPdfPath'])} bytes)")

    print("\nPrueba mock completada con éxito.")


if __name__ == "__main__":
    main()
