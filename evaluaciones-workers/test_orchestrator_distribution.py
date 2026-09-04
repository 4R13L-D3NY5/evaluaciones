#!/usr/bin/env python3
"""Pruebas de reparto equilibrado de estudiantes por variante."""
import os
import sys
import unittest
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.orchestrator import _asignar_variantes_aleatorias, _catalogo_variantes


class DistribucionVariantesTest(unittest.TestCase):
    @staticmethod
    def estudiantes(cantidad):
        return [{"codigo_estudiante": str(indice), "nombres": f"Estudiante {indice}"} for indice in range(cantidad)]

    def test_seis_estudiantes_ratio_cinco_se_reparten_tres_y_tres(self):
        resultado = _asignar_variantes_aleatorias(self.estudiantes(6), ["A", "B"], 5)
        self.assertEqual(Counter(resultado), Counter({"A": 3, "B": 3}))

    def test_trece_estudiantes_ratio_cuatro_se_reparten_cuatro_cuatro_y_cinco(self):
        resultado = _asignar_variantes_aleatorias(self.estudiantes(13), ["A", "B", "C"], 4)
        self.assertEqual(Counter(resultado), Counter({"A": 4, "B": 4, "C": 5}))

    def test_ratio_uno_puede_generar_mas_de_cinco_variantes(self):
        variantes = _catalogo_variantes(7)
        self.assertEqual(variantes, ["A", "B", "C", "D", "E", "F", "G"])
        resultado = _asignar_variantes_aleatorias(self.estudiantes(7), variantes, 1)
        self.assertEqual(Counter(resultado), Counter({letra: 1 for letra in variantes}))

    def test_catalogo_continua_con_etiquetas_tipo_excel(self):
        self.assertEqual(_catalogo_variantes(28)[-3:], ["Z", "AA", "AB"])


if __name__ == "__main__":
    unittest.main()
