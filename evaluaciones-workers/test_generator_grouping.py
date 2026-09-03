#!/usr/bin/env python3
"""Pruebas de integridad de bloques agrupados durante la generación."""
import json
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src import config, generator


class SeleccionBloquesAgrupadosTest(unittest.TestCase):
    def setUp(self):
        self.cuotas_originales = (
            config.CUOTA_FACILES,
            config.CUOTA_MEDIAS,
            config.CUOTA_DIFICILES,
        )

    def tearDown(self):
        config.CUOTA_FACILES, config.CUOTA_MEDIAS, config.CUOTA_DIFICILES = self.cuotas_originales

    @staticmethod
    def pregunta(identificador, numero, tipo, grupo):
        return {
            "id": identificador,
            "numero_orden": numero,
            "tipo_reactivo": tipo,
            "grupo_contexto": grupo,
            "dificultad": "Difícil",
            "nivel_dificultad": 3,
            "enunciado": f"Reactivo {identificador}",
            "opciones_json": json.dumps([]),
        }

    def test_caso_clinico_seleccionado_incluye_todos_los_subitems_en_orden(self):
        config.CUOTA_FACILES = 0
        config.CUOTA_MEDIAS = 0
        config.CUOTA_DIFICILES = 1
        reactivos = [
            self.pregunta("caso", 10, "CASO_CLINICO_TRONCO", "CASO-01"),
            self.pregunta("caso-1", 11, "SUBITEM_CASO", "CASO-01"),
            self.pregunta("caso-2", 12, "SUBITEM_CASO", "CASO-01"),
            self.pregunta("caso-3", 13, "SUBITEM_CASO", "CASO-01"),
        ]

        resultado = generator.seleccionar_preguntas(reactivos, seed=7)

        self.assertEqual([p["id"] for p in resultado], ["caso", "caso-1", "caso-2", "caso-3"])

    def test_emparejamiento_seleccionado_incluye_todas_las_opciones_en_orden(self):
        config.CUOTA_FACILES = 0
        config.CUOTA_MEDIAS = 0
        config.CUOTA_DIFICILES = 1
        reactivos = [
            self.pregunta("emp", 20, "EMPAREJAMIENTO_TRONCO", "EMP-01"),
            self.pregunta("emp-1", 21, "OPCION_EMPAREJAMIENTO", "EMP-01"),
            self.pregunta("emp-2", 22, "OPCION_EMPAREJAMIENTO", "EMP-01"),
            self.pregunta("emp-3", 23, "OPCION_EMPAREJAMIENTO", "EMP-01"),
        ]

        resultado = generator.seleccionar_preguntas(reactivos, seed=7)

        self.assertEqual([p["id"] for p in resultado], ["emp", "emp-1", "emp-2", "emp-3"])


if __name__ == "__main__":
    unittest.main()
