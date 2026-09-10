#!/usr/bin/env python3
"""Pruebas de las reglas institucionales de barajado por tipología."""
import json
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src import generator


class ReglasBarajadoTest(unittest.TestCase):
    @staticmethod
    def opciones(letras):
        return json.dumps([
            {"letra": letra, "texto": f"Texto {letra}", "correcta": False}
            for letra in letras
        ])

    def test_vf_simple_complejas_y_premisas_no_mezclan_sus_columnas(self):
        for tipo, letras in (
            ("VERDADERO_O_FALSO_SIMPLE", "AB"),
            ("VERDADERO_O_FALSO_COMPLEJAS", "ABCD"),
            ("RESPUESTA_PREMISAS_ABCD", "ABCD"),
        ):
            pregunta = {
                "tipo_reactivo": tipo,
                "opciones_json": self.opciones(letras),
                "respuesta_correcta": "E" if tipo == "VERDADERO_O_FALSO_COMPLEJAS" else "A",
            }
            original = json.loads(pregunta["opciones_json"])

            for semilla in (7, 53, 101):
                resultado = generator._barajar_opciones_pregunta(pregunta, semilla)
                self.assertEqual(json.loads(resultado["opciones_json"]), original)

    def test_seleccion_y_subitems_si_mezclan_alternativas(self):
        pregunta = {
            "tipo_reactivo": "SELECCION_MEJOR_RESPUESTA",
            "opciones_json": self.opciones("ABCDE"),
        }
        ordenes = {
            tuple(opcion["texto"] for opcion in json.loads(
                generator._barajar_opciones_pregunta(pregunta, semilla)["opciones_json"]
            ))
            for semilla in range(1, 10)
        }
        self.assertGreater(len(ordenes), 1)

    def test_vf_complejas_usa_la_respuesta_directa_cuando_la_clave_es_e(self):
        opciones = generator.parsear_opciones(self.opciones("ABCD"))
        self.assertEqual(generator._extraer_respuesta_correcta(opciones, "E"), "E")

    def test_premisas_no_imprime_las_respuestas_a_b_c_d(self):
        pregunta = {
            "tipo_reactivo": "RESPUESTA_PREMISAS_ABCD",
            "enunciado": "I. Primera premisa\nII. Segunda premisa",
            "opciones_json": self.opciones("ABCD"),
        }
        salida = generator._cuestionario_typst([pregunta])

        self.assertNotIn('#text(weight: "regular")[A) #raw("Texto A"', salida)
        self.assertNotIn('#text(weight: "regular")[B) #raw("Texto B"', salida)
        self.assertIn("Primera premisa", salida)
        self.assertIn("Segunda premisa", salida)


if __name__ == "__main__":
    unittest.main()
