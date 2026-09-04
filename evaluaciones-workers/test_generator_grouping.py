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

    def test_seleccion_no_descarta_preguntas_sin_id_de_postgres(self):
        config.CUOTA_FACILES = 1
        config.CUOTA_MEDIAS = 1
        config.CUOTA_DIFICILES = 1
        reactivos = [
            {**self.pregunta(None, 1, "SELECCION_MEJOR_RESPUESTA", ""), "dificultad": "Fácil", "nivel_dificultad": 1},
            {**self.pregunta(None, 2, "SELECCION_MEJOR_RESPUESTA", ""), "dificultad": "Medio", "nivel_dificultad": 2},
            {**self.pregunta(None, 3, "SELECCION_MEJOR_RESPUESTA", ""), "dificultad": "Difícil", "nivel_dificultad": 3},
        ]

        resultado = generator.seleccionar_preguntas(reactivos, seed=7)

        self.assertEqual(len(resultado), 3)

    def test_banco_algebra_lineal_resuelve_exactamente_treinta_sin_partir_emparejamiento(self):
        """Un banco con grupos de 5 no debe expandir una selección de 30 a 38."""
        config.CUOTA_FACILES = 7
        config.CUOTA_MEDIAS = 16
        config.CUOTA_DIFICILES = 7
        reactivos = []

        for numero in range(1, 16):
            pregunta = self.pregunta(f"facil-{numero}", numero, "VERDADERO_O_FALSO_SIMPLE", "")
            pregunta.update(dificultad="Fácil", nivel_dificultad=1)
            reactivos.append(pregunta)

        for numero in range(16, 46):
            pregunta = self.pregunta(f"medio-{numero}", numero, "SELECCION_MEJOR_RESPUESTA", "")
            pregunta.update(dificultad="Medio", nivel_dificultad=2)
            reactivos.append(pregunta)

        numero = 46
        for grupo in range(1, 4):
            grupo_id = f"EMP-{grupo:02d}"
            reactivos.append(self.pregunta(f"macro-{grupo}", numero, "EMPAREJAMIENTO_TRONCO", grupo_id))
            numero += 1
            for hijo in range(1, 6):
                reactivos.append(self.pregunta(f"emp-{grupo}-{hijo}", numero, "OPCION_EMPAREJAMIENTO", grupo_id))
                numero += 1

        resultado = generator.seleccionar_preguntas(reactivos, seed=100)
        respondibles = [p for p in resultado if not generator._es_macro(p)]

        self.assertEqual(len(respondibles), 30)
        grupos = {}
        for pregunta in respondibles:
            grupo = pregunta.get("grupo_contexto")
            if grupo:
                grupos.setdefault(grupo, []).append(pregunta)
        self.assertTrue(all(len(hijos) == 5 for hijos in grupos.values()))

    def test_secciones_pueden_cambiar_de_posicion_entre_variantes(self):
        reactivos = []
        for numero, tipo, nivel in (
            (1, "VERDADERO_O_FALSO_SIMPLE", 1),
            (2, "SELECCION_MEJOR_RESPUESTA", 2),
            (3, "VERDADERO_O_FALSO_COMPLEJAS", 2),
        ):
            pregunta = self.pregunta(f"p-{numero}", numero, tipo, "")
            pregunta.update(dificultad="Medio", nivel_dificultad=nivel)
            reactivos.append(pregunta)

        # Se fuerza una cuota de un reactivo por sección y se comprueba que
        # el orden no quede fijado por la tipología institucional.
        config.CUOTA_FACILES = 1
        config.CUOTA_MEDIAS = 2
        config.CUOTA_DIFICILES = 0
        ordenes = {
            tuple(p["tipo_reactivo"] for p in generator.seleccionar_preguntas(reactivos, seed=semilla))
            for semilla in range(1, 20)
        }
        self.assertGreater(len(ordenes), 1)


if __name__ == "__main__":
    unittest.main()
