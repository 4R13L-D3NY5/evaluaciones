#!/usr/bin/env python3
"""Pruebas de fórmulas Typst usadas en el banco de preguntas."""
import os
import subprocess
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src import config, generator


class FormulasTypstTest(unittest.TestCase):
    FORMULAS = [
        '$ "Reparo" = 150.000 times 25% $',
        '$ x = (-b + sqrt(b^2 - 4a c)) / (2a) $',
        '$ H_2 S O_4 + 2 N a O H arrow N a_2 S O_4 + H_2 O $',
    ]

    def test_preserva_texto_entre_comillas(self):
        resultado = generator._sanitize_math('"Reparo" = 150.000 times 25%')
        self.assertEqual(resultado, '"Reparo" = 150.000 times 25%')
        self.assertNotIn('""Reparo""', resultado)

    def test_formulas_de_la_interfaz_se_compilan(self):
        if not config.TYPST_BIN or not os.path.exists(config.TYPST_BIN):
            self.skipTest("Typst CLI no está disponible en este entorno")

        contenido = "\n".join(f"#par[{generator._typst_content(formula)}]" for formula in self.FORMULAS)
        documento = f'''#set page(width: 21cm, height: 29.7cm, margin: 1.5cm)
#set text(font: "{config.TIPOGRAFIA}", size: 11pt, lang: "es")
{contenido}
'''
        with tempfile.TemporaryDirectory() as directorio:
            ruta_typ = os.path.join(directorio, "formulas.typ")
            ruta_pdf = os.path.join(directorio, "formulas.pdf")
            with open(ruta_typ, "w", encoding="utf-8") as archivo:
                archivo.write(documento)
            resultado = subprocess.run(
                [config.TYPST_BIN, "compile", ruta_typ, ruta_pdf],
                check=False,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
            )
            self.assertEqual(resultado.returncode, 0, resultado.stderr or resultado.stdout)
            salida = f"{resultado.stdout}\n{resultado.stderr}".lower()
            self.assertNotIn("unknown font family", salida)
            self.assertNotIn("unknown variable", salida)
            self.assertTrue(os.path.exists(ruta_pdf))


if __name__ == "__main__":
    unittest.main()
