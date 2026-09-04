import os
import subprocess
import shutil
import json

# -----------------------------------------------------------------------------
# DEFINICIÓN DE ESTUDIANTES Y SIMULACIÓN DE RESPUESTAS (30 PREGUNTAS)
# -----------------------------------------------------------------------------

# Patrón Oficial Variante A (Preguntas 1 a 30)
PATRON_OFICIAL_VAR_A = {
    1: 'D', 2: 'C', 3: 'B', 4: 'B', 5: 'C',
    6: 'A', 7: 'A', 8: 'A', 9: 'A', 10: 'A',
    11: 'A', 12: 'A', 13: 'A', 14: 'A', 15: 'A',
    16: 'A', 17: 'A', 18: 'A', 19: 'A', 20: 'A',
    21: 'A', 22: 'A', 23: 'A', 24: 'A', 25: 'A',
    26: 'A', 27: 'A', 28: 'A', 29: 'A', 30: 'A'
}

ESTUDIANTES_SIMULADOS = [
    {
        "id": 1,
        "codigo": "7849102",
        "nombre": "JUAN CARLOS PÉREZ MAMANI",
        "carrera": "AUDITORÍA / CONTADURÍA",
        "grupo": "TA-01",
        "variante": "A",
        "perfil": "Excelente (28/30 - 93.3%)",
        # 28 correctas, 2 fallos intencionales en P4 y P12
        "respuestas": {
            **PATRON_OFICIAL_VAR_A,
            4: 'C',  # Fallo (correcta B)
            12: 'B'  # Fallo (correcta A)
        }
    },
    {
        "id": 2,
        "codigo": "8392104",
        "nombre": "MARÍA BELÉN QUISPE FLORES",
        "carrera": "AUDITORÍA / CONTADURÍA",
        "grupo": "TA-01",
        "variante": "A",
        "perfil": "Muy Bueno (24/30 - 80.0%)",
        # 24 correctas, 6 fallos en P2, P5, P9, P15, P20, P28
        "respuestas": {
            **PATRON_OFICIAL_VAR_A,
            2: 'A',
            5: 'A',
            9: 'C',
            15: 'D',
            20: 'B',
            28: 'C'
        }
    },
    {
        "id": 3,
        "codigo": "6928103",
        "nombre": "RODRIGO ALEJANDRO CONDORI RODRÍGUEZ",
        "carrera": "AUDITORÍA / CONTADURÍA",
        "grupo": "TA-01",
        "variante": "A",
        "perfil": "Regular / Aprobado (18/30 - 60.0%)",
        # 18 correctas, 12 fallos
        "respuestas": {
            **PATRON_OFICIAL_VAR_A,
            1: 'A', 3: 'D', 6: 'B', 7: 'C', 10: 'E', 13: 'B',
            16: 'C', 19: 'D', 22: 'E', 25: 'B', 27: 'C', 30: 'D'
        }
    },
    {
        "id": 4,
        "codigo": "7194820",
        "nombre": "GABRIELA SOFÍA LÓPEZ TORRICO",
        "carrera": "AUDITORÍA / CONTADURÍA",
        "grupo": "TA-01",
        "variante": "A",
        "perfil": "Reprobado con 2 Blancos (12/30 - 40.0%)",
        # 12 correctas, 16 fallos, 2 en blanco (P14, P29)
        "respuestas": {
            **PATRON_OFICIAL_VAR_A,
            1: 'B', 2: 'B', 4: 'A', 5: 'B', 7: 'B', 8: 'C', 9: 'D', 11: 'E',
            14: '',  # En Blanco
            17: 'B', 18: 'C', 20: 'D', 21: 'E', 23: 'B', 24: 'C', 26: 'D',
            29: ''   # En Blanco
        }
    },
    {
        "id": 5,
        "codigo": "7391028",
        "nombre": "SERGIO ALEJANDRO MENDOZA TAPIA",
        "carrera": "AUDITORÍA / CONTADURÍA",
        "grupo": "TA-01",
        "variante": "A",
        "perfil": "Notable con 1 Doble Marca (22/30 - 73.3%)",
        # 22 correctas, 7 fallos, 1 doble marca en P18 (A y B)
        "respuestas": {
            **PATRON_OFICIAL_VAR_A,
            3: 'A', 5: 'D', 8: 'B', 11: 'C', 15: 'E', 22: 'D', 27: 'B',
            18: 'AB' # Doble marca
        }
    }
]

def generar_grid_cartilla_estudiante(respuestas_estudiante):
    grid_cols = []
    
    for c in range(4):
        start_q = c * 15 + 1
        end_q = start_q + 15
        table_rows = []
        for num in range(start_q, end_q):
            marcada = respuestas_estudiante.get(num, '')
            bubbles = []
            for letra in ['A', 'B', 'C', 'D', 'E']:
                if letra in marcada:
                    # Rellena sólida en negro
                    bubbles.append(f"""[#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[{letra}]]]]""")
                else:
                    bubbles.append(f"""[#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[{letra}]]]]""")
            
            row_items = f"""        [#text(size: 7.2pt, weight: "bold")[{num}.]],
        {bubbles[0]},
        {bubbles[1]},
        {bubbles[2]},
        {bubbles[3]},
        {bubbles[4]}"""
            table_rows.append(row_items)
            
        rows_str = ",\n".join(table_rows)
        grid_cols.append(f"""    [
      #table(
        columns: (22%, 15.6%, 15.6%, 15.6%, 15.6%, 15.6%),
        stroke: none,
        inset: (x: 0pt, y: 2.8pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
{rows_str}
      )
    ]""")
    
    return ",\n".join(grid_cols)

def generar_documento_estudiante_typst(estudiante):
    grid_cartilla = generar_grid_cartilla_estudiante(estudiante["respuestas"])
    
    typ_code = f"""#set page(
  paper: "us-letter",
  margin: (x: 1.5cm, top: 0.85cm, bottom: 0.85cm),
  header: none,
  footer: locate(loc => {{
    let page_num = counter(page).at(loc).first()
    let total_pages = counter(page).final(loc).first()
    align(center)[
      #text(size: 7.5pt, fill: luma(80))[
        EXAMEN OFICIAL UNITEPC · COD: {estudiante['codigo']} · {estudiante['nombre']} · Página #page_num de #total_pages
      ]
    ]
  }})
)

#set text(
  font: "Liberation Sans",
  size: 8.5pt,
  lang: "es"
)

#show par: set block(spacing: 0.45em)

// Encabezado Institucional
#table(
  columns: (25%, 75%),
  stroke: 0.5pt + black,
  fill: none,
  align: (center + horizon, center + horizon),
  inset: 4pt,
  [
    #image("logo_unitepc_clean.png", width: 80%)
  ],
  [
    #text(weight: "bold", size: 10pt)[UNIVERSIDAD TECNICA PRIVADA COSMOS]\\
    #text(weight: "bold", size: 9pt)[GESTION 2-2026]
    #v(-2pt)
    #line(length: 90%, stroke: 0.5pt + black)
    #v(-2.5pt)
    #text(weight: "bold")[EVALUACION TEORICA 1ER PARCIAL]
  ]
)

#v(-5pt)

// Datos del Estudiante
#table(
  columns: (58%, 42%),
  stroke: 0.5pt + black,
  fill: none,
  inset: (x: 5pt, y: 2.2pt),
  [*NOMBRE:* {estudiante['nombre']}],
  [*CARRERA:* {estudiante['carrera']}],
  [*MATERIA:* [CPEC18] AUDITORÍA TRIBUTARIA],
  [*GRUPO:* {estudiante['grupo']} #h(10pt) *SEMESTRE:* 3],
  [*DOCENTE:* MAURICIO QUIROZ LAFUENTE],
  [*EXAMEN:* 1er Parcial],
  [*FECHA:* 22/08/2026],
  [*HORA:* 08:15:00 - 09:45:00],
  [
    *FIRMA DEL ESTUDIANTE:* \\
    #v(10pt)
    #line(length: 100%, stroke: (dash: "dotted", thickness: 0.85pt))
  ],
  [
    *CODIGO:* \\
    #v(-2pt)
    #align(center)[#text(size: 18pt, weight: "bold")[{estudiante['codigo']}]]
  ]
)

#v(1.5pt)
#text(size: 9pt)[*INSTRUCCION DE COMPLETADO DE CARTILLA:* Debe rellenar con cuidado la opción que considere correcta en la Cartilla con lapicero de color AZUL o NEGRO.]
#v(1.5pt)

// CARTILLA DE RESPUESTAS (1 A 60) CON MARCAS ÓPTICAS
#rect(width: 100%, stroke: 0.85pt + black, fill: none, inset: (x: 4pt, y: 2.5pt), radius: 2pt)[
  #align(center)[
    #text(weight: "bold", size: 9pt)[CARTILLA DE RESPUESTAS (1 A 60)]
  ]
  #v(-3pt)
  #grid(
    columns: (25%, 25%, 25%, 25%),
    column-gutter: 3pt,
{grid_cartilla}
  )
]

#v(2.5pt)

// TÍTULO GENERAL DE PREGUNTAS
#align(center)[
  #text(size: 10.5pt, weight: "bold")[CUESTIONARIO DE PREGUNTAS]
]
#v(-3pt)
#line(length: 100%, stroke: 0.5pt + black)
#v(1.5pt)

#text(weight: "bold")[SELECCION DE LA MEJOR RESPUESTA] \\
#text(size: 8pt, style: "italic")[Instrucciones: Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.]

#v(1pt)

1. Al final de cada proceso de auditoría tributaria para determinar la base imponible del IUE se debe:
  A) Excluir los gastos personales sin respaldo de factura legal
  B) Ninguna de las anteriores
  C) Deducir únicamente las compras vinculadas a la actividad gravada
  D) Depreciar conforme a la tabla oficial del D.S. 24051
  E) Todas las anteriores

2. Según el Código Tributario Boliviano (Ley 2492), el término de prescripción de las facultades de fiscalización es de:
  A) 2 años calendario continuos
  B) Ninguna de las anteriores
  C) Todas las anteriores
  D) 4 años improrrogables
  E) 8 años para tributos y contravenciones

3. Para el cómputo del Crédito Fiscal IVA en compras de bienes y servicios, el documento fiscal debe:
  A) Todas las anteriores
  B) Ninguna de las anteriores
  C) Ser cancelado únicamente en efectivo
  D) Estar vinculado a la actividad gravada y a nombre del sujeto pasivo
  E) Haber sido emitido exclusivamente en moneda extranjera
"""
    return typ_code

def main():
    bases_dir = r"C:\laragon\www\evaluaciones\bases"
    typst_exe = r"C:\laragon\www\evaluaciones\typst.exe"
    assets_omr_dir = r"C:\laragon\www\evaluaciones\evaluaciones-frontend\src\assets\omr"
    public_omr_dir = r"C:\laragon\www\evaluaciones\evaluaciones-frontend\public\assets\omr"
    
    os.makedirs(bases_dir, exist_ok=True)
    os.makedirs(assets_omr_dir, exist_ok=True)
    os.makedirs(public_omr_dir, exist_ok=True)
    
    # 1. Guardar archivo Patrón Oficial JSON
    patron_json_path = os.path.join(bases_dir, "patron_oficial_var_a.json")
    with open(patron_json_path, "w", encoding="utf-8") as f:
        json.dump(PATRON_OFICIAL_VAR_A, f, indent=2)
    shutil.copy2(patron_json_path, os.path.join(assets_omr_dir, "patron_oficial_var_a.json"))
    shutil.copy2(patron_json_path, os.path.join(public_omr_dir, "patron_oficial_var_a.json"))
    
    print(f"[OK] Patrón Oficial JSON guardado ({len(PATRON_OFICIAL_VAR_A)} preguntas).")
    
    # 2. Generar y Compilar cada una de las 5 Cartillas Simuladas
    for est in ESTUDIANTES_SIMULADOS:
        idx = est["id"]
        typ_filename = f"cartilla_simulada_estudiante_{idx}_{est['codigo']}.typ"
        pdf_filename = f"cartilla_simulada_estudiante_{idx}_{est['codigo']}.pdf"
        png_filename = f"cartilla_simulada_estudiante_{idx}_{est['codigo']}.png"
        
        typ_path = os.path.join(bases_dir, typ_filename)
        pdf_path = os.path.join(bases_dir, pdf_filename)
        png_path = os.path.join(bases_dir, png_filename)
        
        code = generar_documento_estudiante_typst(est)
        with open(typ_path, "w", encoding="utf-8") as f:
            f.write(code)
            
        # Compilar a PDF
        res_pdf = subprocess.run([typst_exe, "compile", typ_path, pdf_path], cwd=bases_dir, capture_output=True, text=True, encoding="utf-8")
        if res_pdf.returncode == 0:
            print(f"[OK PDF] Cartilla Estudiante {idx} ({est['nombre']}) compilada.")
            shutil.copy2(pdf_path, os.path.join(assets_omr_dir, pdf_filename))
            shutil.copy2(pdf_path, os.path.join(public_omr_dir, pdf_filename))
        else:
            print(f"[ERROR PDF]: {res_pdf.stderr}")
            
        # Compilar a PNG (Página 1 de alta resolución)
        res_png = subprocess.run([typst_exe, "compile", "--format", "png", typ_path, os.path.join(bases_dir, f"cartilla_simulada_estudiante_{idx}_{est['codigo']}_{{n}}.png")], cwd=bases_dir, capture_output=True, text=True, encoding="utf-8")
        created_png = os.path.join(bases_dir, f"cartilla_simulada_estudiante_{idx}_{est['codigo']}_1.png")
        if os.path.exists(created_png):
            if os.path.exists(png_path):
                os.remove(png_path)
            os.rename(created_png, png_path)
            shutil.copy2(png_path, os.path.join(assets_omr_dir, png_filename))
            shutil.copy2(png_path, os.path.join(public_omr_dir, png_filename))
            print(f"[OK PNG] Renderizada imagen de alta resolución: {png_filename}")
            
    print("\n[OK FINAL] Las 5 Cartillas de prueba han sido generadas y compiladas exitosamente.")

if __name__ == "__main__":
    main()
