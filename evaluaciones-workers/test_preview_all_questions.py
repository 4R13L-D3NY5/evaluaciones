#!/usr/bin/env python3
"""Pruebas de la previsualización completa del banco de preguntas."""
import json
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src import config, generator


class PrevisualizacionCompletaTest(unittest.TestCase):
    @staticmethod
    def pregunta(identificador, numero):
        return {
            "id": identificador,
            "numero_orden": numero,
            "tipo_reactivo": "SELECCION_MEJOR_RESPUESTA",
            "grupo_contexto": "",
            "dificultad": "Medio",
            "nivel_dificultad": 2,
            "enunciado": f"Pregunta {identificador}",
            "opciones_json": json.dumps([
                {"letra": "A", "texto": f"Opción A de {identificador}", "correcta": True},
                {"letra": "B", "texto": f"Opción B de {identificador}", "correcta": False},
            ]),
        }

    def test_incluye_todo_el_banco_y_conserva_el_orden(self):
        reactivos = [self.pregunta(f"p-{numero}", numero) for numero in range(1, 61)]
        resultado = generator.generar_variante(
            "A",
            reactivos,
            {
                "id": "rol-preview",
                "materia_codigo": "MAT-001",
                "sede_codigo": "CBA",
                "grupo": "TA-01",
                "tipo_parcial": "1P",
                "fecha_display": "03/09/2026",
            },
            "/tmp/preview-test",
            generar_pdf=False,
            modo_previsualizacion=True,
        )

        preguntas = resultado["_preguntas"]
        self.assertEqual(len(preguntas), 60)
        self.assertEqual([pregunta["id"] for pregunta in preguntas], [f"p-{numero}" for numero in range(1, 61)])
        self.assertEqual(
            json.loads(preguntas[0]["opciones_json"])[0]["texto"],
            "Opción A de p-1",
        )
        self.assertEqual(len(json.loads(resultado["patronClavesJson"])), 60)

    def test_compila_pdf_con_todos_los_reactivos(self):
        if not config.TYPST_BIN or not os.path.exists(config.TYPST_BIN):
            self.skipTest("Typst CLI no está disponible en este entorno")

        reactivos = [self.pregunta(f"p-{numero}", numero) for numero in range(1, 61)]
        rol = {
            "id": "rol-preview-pdf",
            "materia_codigo": "MAT-001",
            "materia_nombre": "Materia de prueba",
            "sede_codigo": "CBA",
            "sede_nombre": "Cochabamba",
            "carrera_nombre": "Ingeniería de Sistemas",
            "grupo": "TA-01",
            "tipo_parcial": "1P",
            "fecha_display": "03/09/2026",
            "docente_nombre": "Docente de prueba",
        }
        with tempfile.TemporaryDirectory() as directorio:
            resultado = generator.generar_variante(
                "A",
                reactivos,
                rol,
                directorio,
                generar_pdf=True,
                modo_previsualizacion=True,
            )
            self.assertTrue(os.path.exists(resultado["archivoPdfPath"]))
            self.assertGreater(os.path.getsize(resultado["archivoPdfPath"]), 0)


if __name__ == "__main__":
    unittest.main()
