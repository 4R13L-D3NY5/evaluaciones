import os
import subprocess
import shutil
import random
import openpyxl

ESTUDIANTES_OFICIALES = [
    {"codigo": "7849102", "nombre": "JUAN CARLOS PÉREZ MAMANI"},
    {"codigo": "8392104", "nombre": "MARÍA BELÉN QUISPE FLORES"},
    {"codigo": "6928103", "nombre": "RODRIGO ALEJANDRO CONDORI RODRÍGUEZ"}
]

# -----------------------------------------------------------------------------
# 30 PREGUNTAS DISTRIBUIDAS EXACTAMENTE EN LOS 6 FORMATOS SIDOPA / MACRO
# -----------------------------------------------------------------------------

# SECCIÓN 1: SELECCION DE LA MEJOR RESPUESTA (Preguntas 1 a 6)
SECCION_1_PREGUNTAS = [
    {
        "enunciado": "Al final de cada proceso de auditoría tributaria para determinar la base imponible del IUE se debe:",
        "opciones": [
            "Todas las anteriores",
            "Ninguna de las anteriores",
            "Depreciar conforme a la tabla oficial del D.S. 24051",
            "Excluir los gastos personales sin respaldo de factura legal",
            "Deducir únicamente las compras vinculadas a la actividad gravada"
        ],
        "correcta": 3
    },
    {
        "enunciado": "Según el Código Tributario Boliviano (Ley 2492), el término de prescripción de las facultades de fiscalización es de:",
        "opciones": [
            "Ninguna de las anteriores",
            "Todas las anteriores",
            "8 años para tributos y contravenciones",
            "4 años improrrogables",
            "2 años calendario continuos"
        ],
        "correcta": 2
    },
    {
        "enunciado": "Para el cómputo del Crédito Fiscal IVA en compras de bienes y servicios, el documento fiscal debe:",
        "opciones": [
            "Todas las anteriores",
            "Estar vinculado a la actividad gravada y a nombre del sujeto pasivo",
            "Haber sido emitido exclusivamente en moneda extranjera",
            "Ninguna de las anteriores",
            "Ser cancelado únicamente en efectivo"
        ],
        "correcta": 1
    },
    {
        "enunciado": "En una auditoría tributaria, la técnica de confirmación de saldos con terceros verifica principalmente:",
        "opciones": [
            "Todas las anteriores",
            "Existencia, integridad y exactitud de cuentas por cobrar y pagar",
            "Ninguna de las anteriores",
            "Estructura societaria y tenencia accionaria",
            "Capacidad de pago futura de la entidad"
        ],
        "correcta": 1
    },
    {
        "enunciado": "El método de determinación de la base imponible sobre base presunta procede cuando:",
        "opciones": [
            "El sujeto pasivo no presenta libros ni documentación fidedigna",
            "Todas las anteriores",
            "Se cuenta con estados financieros auditados limpios",
            "Ninguna de las anteriores",
            "El contribuyente presenta todos sus libros notariados"
        ],
        "correcta": 0
    },
    {
        "enunciado": "La alícuota general del Impuesto a las Transacciones (IT) según la Ley 843 es del:",
        "opciones": [
            "3% sobre los ingresos brutos devengados o percibidos",
            "13% sobre el valor neto de la factura",
            "25% sobre la utilidad neta imponible",
            "Ninguna de las anteriores",
            "Todas las anteriores"
        ],
        "correcta": 0
    }
]

# SECCIÓN 2: VERDADERO O FALSO SIMPLE (Preguntas 7 a 12)
SECCION_2_PREGUNTAS = [
    {
        "enunciado": "El Impuesto al Valor Agregado (IVA) grava únicamente las ventas en efectivo y excluye las ventas al crédito.",
        "correcta": "B"
    },
    {
        "enunciado": "Las donaciones a entidades sin fines de lucro autorizadas son deducibles hasta el límite del 10% de la utilidad neta.",
        "correcta": "A"
    },
    {
        "enunciado": "La bancarización obligatoria aplica a transacciones iguales o superiores a Bs. 50.000 respaldadas con documentos de pago.",
        "correcta": "A"
    },
    {
        "enunciado": "El IUE efectivamente pagado se compensa contra el IT a partir del mismo mes en que fue cancelado.",
        "correcta": "B"
    },
    {
        "enunciado": "Las pérdidas fiscales no compensadas en el IUE pueden trasladarse sucesivamente hasta un máximo de cinco ejercicios posteriores.",
        "correcta": "A"
    },
    {
        "enunciado": "La no emisión de factura mercantil amerita clausura directa e inmediata del establecimiento comercial.",
        "correcta": "A"
    }
]

# SECCIÓN 3: VERDADERO O FALSO COMPLEJAS (Preguntas 13 a 18)
SECCION_3_PREGUNTAS = [
    {
        "encabezado": "Seleccione los incisos verdaderos sobre la deducibilidad del gasto en el IUE:",
        "proposiciones": [
            "1. La deducibilidad del gasto exige documento mercantil original y vinculado a la actividad.",
            "2. Las depreciaciones de vehículos se amortizan a una tasa máxima del 20% anual.",
            "3. Los aportes patronales efectivamente devengados y cancelados son deducibles.",
            "4. Las multas e intereses tributarios constituyen gastos no deducibles."
        ],
        "correcta": "E"
    },
    {
        "encabezado": "Seleccione los incisos verdaderos sobre el Crédito Fiscal IVA:",
        "proposiciones": [
            "1. Requiere factura original debidamente dosificada o electrónica.",
            "2. Las compras de combustible computan el 100% de crédito fiscal.",
            "3. Es obligatorio el medio fehaciente de pago para importes mayores a Bs. 50.000.",
            "4. Procede crédito fiscal en gastos de uso particular de los accionistas."
        ],
        "correcta": "B"
    },
    {
        "encabezado": "Seleccione los incisos verdaderos sobre la prescripción según Código Tributario (Ley 2492):",
        "proposiciones": [
            "1. Las facultades de control y fiscalización prescriben a los 8 años.",
            "2. La prescripción se suspende con la notificación de la Resolución Determinativa.",
            "3. Las sanciones pecuniarias por contravenciones prescriben a los 5 años.",
            "4. La prescripción debe ser alegada expresamente por el contribuyente."
        ],
        "correcta": "A"
    },
    {
        "encabezado": "Seleccione los incisos verdaderos sobre los regímenes tributarios:",
        "proposiciones": [
            "1. El Régimen Tributario Simplificado emite factura válida para crédito fiscal.",
            "2. Los comerciantes minoristas y artesanos pertenecen al Régimen Simplificado.",
            "3. Las empresas unipersonales están exentas de presentar estados financieros.",
            "4. El Sistema Integrado de Facturación en Línea es obligatorio para emisores masivos."
        ],
        "correcta": "C"
    },
    {
        "encabezado": "Seleccione los incisos verdaderos sobre los procedimientos de impugnación tributaria:",
        "proposiciones": [
            "1. El Recurso de Alzada se interpone dentro de los 20 días siguientes a la notificación.",
            "2. La interposición del Recurso Jerárquico suspende la ejecución tributaria.",
            "3. La Autoridad General de Impugnación Tributaria (AGIT) resuelve en instancia final administrativa.",
            "4. La demanda contenciosa administrativa es la única vía judicial de revisión."
        ],
        "correcta": "E"
    },
    {
        "encabezado": "Seleccione los incisos verdaderos sobre las retenciones impositivas:",
        "proposiciones": [
            "1. La retención por compra de bienes no respaldada es del 5% IUE y 3% IT.",
            "2. La retención por contratación de servicios independientes es del 12.5% IUE y 3% IT.",
            "3. El agente de retención es solidariamente responsable ante el fisco por el tributo no retenido.",
            "4. Las entidades estatales no están obligadas a actuar como agentes de retención."
        ],
        "correcta": "A"
    }
]

# SECCIÓN 4: RESPUESTA A / B / AMBAS / NINGUNA (Preguntas 19 a 22)
SECCION_4_PREGUNTAS = [
    {
        "premisa1": "I. El Impuesto a las Transacciones se calcula sobre los ingresos brutos devengados o percibidos.",
        "premisa2": "II. El IT efectivamente pagado es deducible como gasto en el IUE cuando no ha sido compensado.",
        "correcta": "C"
    },
    {
        "premisa1": "I. La provisión para incobrables del 3% anual es acumulativa indefinidamente sin límite.",
        "premisa2": "II. Los créditos incobrables deben contar con un año de mora y cobranza judicial iniciada.",
        "correcta": "B"
    },
    {
        "premisa1": "I. Las compras de combustible computan el 70% del valor facturado como crédito fiscal.",
        "premisa2": "II. El 30% restante no computado para crédito fiscal es gasto deducible en el IUE.",
        "correcta": "C"
    },
    {
        "premisa1": "I. Las notas de crédito/débito pueden emitirse válidamente hasta 36 meses después de la factura.",
        "premisa2": "II. Las notas de crédito/débito no modifican el débito ni crédito fiscal de los períodos originales.",
        "correcta": "D"
    }
]

# SECCIÓN 5: ÍTEMS AGRUPADOS POR CASO CLÍNICO O PROBLEMA (Preguntas 23 a 26)
CASO_PROBLEMA_TEXTO = """CASO N 1:
La empresa "Comercializadora del Valle S.R.L." fue objeto de fiscalización externa por la gestión fiscal 2024. El auditor evidenció: (a) compras de mercadería por Bs. 80.000 pagadas en efectivo con factura original, (b) gastos de viaje por Bs. 15.000 sin respaldo de pasajes ni rendición, y (c) omisión de registro de ventas por Bs. 40.000."""

SECCION_5_PREGUNTAS = [
    {
        "enunciado": "¿Qué determinación técnica y legal corresponde a la compra de Bs. 80.000 cancelada en efectivo?",
        "opciones": [
            "Depuración del Crédito Fiscal IVA y gasto no deducible en IUE por falta de bancarización",
            "Aceptación plena del Crédito Fiscal IVA y del gasto",
            "Aceptación únicamente del gasto deducible",
            "Sanción de 50 UFV por deberes formales únicamente",
            "Ninguna de las anteriores"
        ],
        "correcta": 0
    },
    {
        "enunciado": "¿Cuál es el tratamiento tributario de los gastos de viaje de Bs. 15.000 sin respaldo documental?",
        "opciones": [
            "Ajuste en la conciliación tributaria como gasto no deducible del IUE",
            "Imputación a reserva legal estatutaria",
            "Compensación automática con crédito fiscal",
            "Exención tributaria bajo el D.S. 24051",
            "Todas las anteriores"
        ],
        "correcta": 0
    },
    {
        "enunciado": "¿Qué reparos tributarios genera la omisión de registro de ventas por Bs. 40.000?",
        "opciones": [
            "Determinación de oficio de Débito Fiscal IVA (13%), IT (3%) y mayor utilidad imponible de IUE (25%)",
            "Únicamente rectificatoria de libros de compras",
            "Compensación automática con créditos acumulados",
            "Exclusión de responsabilidad contable",
            "Ninguna de las anteriores"
        ],
        "correcta": 0
    },
    {
        "enunciado": "¿Qué calificación de conducta tributaria preliminar corresponde a las ventas no declaradas?",
        "opciones": [
            "Omisión de pago sujeta a sanción del 60% del tributo omitido o defraudación tributaria",
            "Falta leve no sujeta a sanción económica",
            "Error involuntario de cálculo contable",
            "Prescripción automática del reparo fiscal",
            "Todas las anteriores"
        ],
        "correcta": 0
    }
]

# SECCIÓN 6: EMPAREJAMIENTO AMPLIADO (Preguntas 27 a 30)
SECCION_6_PREGUNTAS = [
    {
        "enunciado": "Documento administrativo formal que notifica el inicio, alcance y funcionarios asignados a la auditoría tributaria.",
        "correcta": "C"
    },
    {
        "enunciado": "Acto administrativo preliminar que fija los hechos, reparos preliminares y otorga 30 días de plazo para descargos.",
        "correcta": "B"
    },
    {
        "enunciado": "Título administrativo final emitido por la Administración que liquida la deuda tributaria y califica sanciones.",
        "correcta": "A"
    },
    {
        "enunciado": "Acto administrativo que da inicio a la cobranza coactiva con embargo y retención de fondos bancarios.",
        "correcta": "E"
    }
]

def construir_bloque_examen_30(estudiante_nombre, estudiante_codigo, variante_letra, es_ultimo=False):
    seed_val = ord(variante_letra) * 317
    rnd = random.Random(seed_val)
    patron_claves = {}
    letras = ['A', 'B', 'C', 'D', 'E']

    # 1. Procesar Sección 1 (Mejor Respuesta)
    p_sec1 = []
    indices_s1 = list(range(len(SECCION_1_PREGUNTAS)))
    if variante_letra == 'B':
        indices_s1.reverse()
    for offset, idx in enumerate(indices_s1):
        num_act = 1 + offset
        orig = SECCION_1_PREGUNTAS[idx]
        opcs = list(enumerate(orig["opciones"]))
        rnd.shuffle(opcs)
        opcs_fin = []
        corr = 'A'
        for opt_idx, (orig_pos, text) in enumerate(opcs):
            l = letras[opt_idx]
            if orig_pos == orig["correcta"]:
                corr = l
            opcs_fin.append((l, text))
        patron_claves[num_act] = corr
        p_sec1.append({"numero": num_act, "enunciado": orig["enunciado"], "opciones": opcs_fin})

    # 2. Procesar Sección 2 (V/F Simple)
    p_sec2 = []
    indices_s2 = list(range(len(SECCION_2_PREGUNTAS)))
    if variante_letra == 'B':
        indices_s2.reverse()
    for offset, idx in enumerate(indices_s2):
        num_act = 7 + offset
        orig = SECCION_2_PREGUNTAS[idx]
        patron_claves[num_act] = orig["correcta"]
        p_sec2.append({"numero": num_act, "enunciado": orig["enunciado"]})

    # 3. Procesar Sección 3 (V/F Complejas)
    p_sec3 = []
    indices_s3 = list(range(len(SECCION_3_PREGUNTAS)))
    if variante_letra == 'B':
        indices_s3.reverse()
    for offset, idx in enumerate(indices_s3):
        num_act = 13 + offset
        orig = SECCION_3_PREGUNTAS[idx]
        patron_claves[num_act] = orig["correcta"]
        p_sec3.append({
            "numero": num_act,
            "encabezado": orig["encabezado"],
            "proposiciones": orig["proposiciones"]
        })

    # 4. Procesar Sección 4 (A/B/Ambas/Ninguna)
    p_sec4 = []
    indices_s4 = list(range(len(SECCION_4_PREGUNTAS)))
    if variante_letra == 'B':
        indices_s4.reverse()
    for offset, idx in enumerate(indices_s4):
        num_act = 19 + offset
        orig = SECCION_4_PREGUNTAS[idx]
        patron_claves[num_act] = orig["correcta"]
        p_sec4.append({
            "numero": num_act,
            "premisa1": orig["premisa1"],
            "premisa2": orig["premisa2"]
        })

    # 5. Procesar Sección 5 (Caso Problema)
    p_sec5 = []
    indices_s5 = list(range(len(SECCION_5_PREGUNTAS)))
    if variante_letra == 'B':
        indices_s5.reverse()
    for offset, idx in enumerate(indices_s5):
        num_act = 23 + offset
        orig = SECCION_5_PREGUNTAS[idx]
        opcs = list(enumerate(orig["opciones"]))
        rnd.shuffle(opcs)
        opcs_fin = []
        corr = 'A'
        for opt_idx, (orig_pos, text) in enumerate(opcs):
            l = letras[opt_idx]
            if orig_pos == orig["correcta"]:
                corr = l
            opcs_fin.append((l, text))
        patron_claves[num_act] = corr
        p_sec5.append({"numero": num_act, "enunciado": orig["enunciado"], "opciones": opcs_fin})

    # 6. Procesar Sección 6 (Emparejamiento Ampliado)
    p_sec6 = []
    indices_s6 = list(range(len(SECCION_6_PREGUNTAS)))
    if variante_letra == 'B':
        indices_s6.reverse()
    for offset, idx in enumerate(indices_s6):
        num_act = 27 + offset
        orig = SECCION_6_PREGUNTAS[idx]
        patron_claves[num_act] = orig["correcta"]
        p_sec6.append({"numero": num_act, "enunciado": orig["enunciado"]})

    # =========================================================================
    # CARTILLA HORIZONTAL (4 COLUMNAS DE 15 PREGUNTAS = 60 PREGUNTAS)
    # =========================================================================
    grid_cols = []
    for col_idx in range(4):
        start_q = col_idx * 15 + 1
        end_q = start_q + 15
        table_rows = []
        for num in range(start_q, end_q):
            table_rows.append(f"""        [#text(size: 7.2pt, weight: "bold")[{num}.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]]""")
        
        rows_str = ",\n".join(table_rows)
        grid_cols.append(f"""    [
      #table(
        columns: (18%, 16.4%, 16.4%, 16.4%, 16.4%, 16.4%),
        stroke: none,
        inset: (x: 0pt, y: 2.8pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
{rows_str}
      )
    ]""")
    
    cartilla_grid_joined = ",\n".join(grid_cols)

    # =========================================================================
    # HOJA 1: Cabecera 100% Horizontal + Datos 100% + Cartilla 4 Col x 15 Filas +
    #         INSTRUCCIÓN + TÍTULO PREGUNTAS + SECCIÓN 1
    # =========================================================================
    content = f"""
// ============================================================================
// EXAMEN OFICIAL UNITEPC - {estudiante_nombre.upper()} (ID: {estudiante_codigo})
// VARIANTE ASIGNADA: TIPO {variante_letra} (CONFIDENCIAL)
// ============================================================================

#set page(
  footer: context {{
    let p = counter(page).get().first()
    if calc.odd(p) {{
      align(left)[
        #text(size: 7.5pt, fill: luma(80))[
          {estudiante_nombre.upper()} \\
          {estudiante_codigo}
        ]
      ]
    }}
  }}
)

// Cabecera Oficial (100% Horizontal con margen interno adecuado)
#table(
  columns: (22%, 78%),
  stroke: 0.75pt + black,
  fill: none,
  inset: (x: 5pt, y: 3.5pt),
  align: (center + horizon, center + horizon),
  [
    #image("logo_unitepc_clean.png", width: 85%)
  ],
  [
    #text(weight: "bold")[UNIVERSIDAD TECNICA PRIVADA COSMOS]\\
    #text(weight: "bold")[GESTION 2-2026]\\
    #v(-4.5pt)
    #line(length: 100%, stroke: 0.5pt + black)
    #v(-2.5pt)
    #text(weight: "bold")[EVALUACION TEORICA 1ER PARCIAL]
  ]
)

#v(-5pt)

// Datos del Estudiante (100% Horizontal, Sin Fondos, Código Doble de Tamaño y Firma en la Misma Fila)
#table(
  columns: (58%, 42%),
  stroke: 0.5pt + black,
  fill: none,
  inset: (x: 5pt, y: 2.2pt),
  [*NOMBRE:* {estudiante_nombre.upper()}],
  [*CARRERA:* AUDITORÍA / CONTADURÍA],
  [*MATERIA:* [CPEC18] AUDITORÍA TRIBUTARIA],
  [*GRUPO:* TA-01 #h(10pt) *SEMESTRE:* 3],
  [*DOCENTE:* MAURICIO QUIROZ LAFUENTE],
  [*EXAMEN:* 1er Parcial],
  [*FECHA:* 22/08/2026],
  [*HORA:* 08:15:00 - 09:45:00],
  [
    *FIRMA DEL ESTUDIANTE:* \\
    #v(10pt)
    #line(length: 100%, stroke: (dash: "dotted", thickness: 0.85pt))
  ],
  [#align(left + horizon)[*CODIGO:* #h(6pt) #text(size: 18pt, weight: "bold")[{estudiante_codigo}]]]
)

#v(1.5pt)
#text(size: 9pt)[*INSTRUCCION DE COMPLETADO DE CARTILLA:* Debe rellenar con cuidado la opción que considere correcta en la Cartilla con lapicero de color AZUL o NEGRO.]
#v(1.5pt)

// CARTILLA HORIZONTAL (4 COLUMNAS DE 15 PREGUNTAS = 60 PREGUNTAS TOTAL - SIN FONDOS)
#rect(width: 100%, stroke: 0.85pt + black, fill: none, inset: (x: 4pt, y: 2.5pt), radius: 2pt)[
  #align(center)[
    #text(weight: "bold", size: 9pt)[CARTILLA DE RESPUESTAS (1 A 60)]
  ]
  #v(-3pt)
  #grid(
    columns: (25%, 25%, 25%, 25%),
    column-gutter: 3pt,
{cartilla_grid_joined}
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

// SECCIÓN 1: SELECCION DE LA MEJOR RESPUESTA
#text(weight: "bold")[SELECCION DE LA MEJOR RESPUESTA]\\
#v(-4pt)
#text(size: 9.5pt)[*Instrucciones:* Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.]
#v(1pt)
"""

    # Preguntas 1 a 6 de Sección 1
    for p in p_sec1:
        content += f"""
#block(breakable: false, spacing: 2.8pt)[
  *{p['numero']}.*  {p['enunciado']}
  #v(0.6pt)
  #pad(left: 12pt)[
"""
        for l, text in p["opciones"]:
            text_clean = text.replace("$", "\\$")
            content += f"""    {l}) {text_clean} \\\n"""
        content += "  ]\n]\n"

    content += """
// ============================================================================
// SECCIONES 2, 3 Y 4 DE PREGUNTAS (DISTRIBUCIÓN CONTINUA Y LIMPIA)
// ============================================================================
"""

    # SECCIÓN 2: VERDADERO O FALSO SIMPLE
    content += """
#v(2pt)
#text(weight: "bold")[VERDADERO O FALSO SIMPLE]\\
#v(-4pt)
#text(size: 9.5pt)[*Instrucciones:* Marque A si el enunciado es verdadero o B si el enunciado es falso.]
#v(1.5pt)
"""
    for p in p_sec2:
        content += f"""
#block(breakable: false, spacing: 3.2pt)[
  *{p['numero']}.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) {p['enunciado']}
]
"""

    # SECCIÓN 3: VERDADERO O FALSO COMPLEJAS
    content += """
#v(3pt)
#text(weight: "bold")[VERDADERO O FALSO COMPLEJAS]\\
#v(-4pt)
#text(size: 9.5pt)[*Instrucciones:* Seleccione la opción correcta de acuerdo con la siguiente clave:\\
#h(12pt) A: 1, 2 y 3 son verdaderas. #h(12pt) B: 1 y 3 son verdaderas. #h(12pt) C: 2 y 4 son verdaderas.\\
#h(12pt) D: Solo 4 es verdadera. #h(12pt) E: Todas son verdaderas.]
#v(1.5pt)
"""
    for p in p_sec3:
        content += f"""
#block(breakable: false, spacing: 3.2pt)[
  *{p['numero']}.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) {p['encabezado']}
  #v(0.8pt)
  #pad(left: 16pt)[
"""
        for prop in p["proposiciones"]:
            content += f"""    {prop} \\\n"""
        content += "  ]\n]\n"

    # SECCIÓN 4: RESPUESTA A / B / AMBAS / NINGUNA
    content += """
#v(3pt)
#text(weight: "bold")[RESPUESTA A / B / AMBAS / NINGUNA]\\
#v(-4pt)
#text(size: 9.5pt)[*Instrucciones:* Las siguientes preguntas están compuestas por dos premisas. Responda con:\\
#h(12pt) A: si solo la primera premisa es verdadera. #h(12pt) B: si solo la segunda premisa es verdadera.\\
#h(12pt) C: si ambas premisas son verdaderas. #h(12pt) D: si ninguna premisa es verdadera.]
#v(1.5pt)
"""
    for p in p_sec4:
        content += f"""
#block(breakable: false, spacing: 3.2pt)[
  *{p['numero']}.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) {p['premisa1']}\\
  #pad(left: 36pt)[
    {p['premisa2']}
  ]
]
"""

    content += """
// ============================================================================
// SECCIONES 5 Y 6 DE PREGUNTAS (CASO CLÍNICO + EMPAREJAMIENTO SIN FONDOS)
// ============================================================================
"""

    # SECCIÓN 5: ÍTEMS AGRUPADOS POR CASO CLÍNICO O PROBLEMA (SIN FONDOS)
    content += f"""
#v(2pt)
#text(weight: "bold")[ITEMS AGRUPADOS POR CASO CLINICO O PROBLEMA]\\
#v(-4pt)
#text(size: 9.5pt)[*Instrucciones:* El siguiente caso clinico o problema tendra varias preguntas. Seleccione la respuesta correcta en cada una.]
#v(2pt)

#rect(width: 100%, stroke: 0.75pt + black, fill: none, inset: 6pt, radius: 2pt)[
  #text(weight: "bold")[{CASO_PROBLEMA_TEXTO}]
]
#v(2pt)
"""
    for p in p_sec5:
        content += f"""
#block(breakable: false, spacing: 3.5pt)[
  *{p['numero']}.*  {p['enunciado']}\\
  #text(style: "italic", size: 9.5pt)[(Seleccione un solo inciso)]
  #v(0.8pt)
  #pad(left: 12pt)[
"""
        for l, text in p["opciones"]:
            content += f"""    {l}) {text} \\\n"""
        content += "  ]\n]\n"

    # SECCIÓN 6: EMPAREJAMIENTO AMPLIADO (SIN FONDOS)
    content += """
#v(3pt)
#text(weight: "bold")[EMPAREJAMIENTO AMPLIADO]\\
#v(-4pt)
#text(size: 9.5pt)[*Instrucciones:* De la lista de opciones, seleccione la respuesta correcta para cada enunciado.]
#v(2pt)

#rect(width: 100%, stroke: 0.75pt + black, fill: none, inset: 6pt, radius: 2pt)[
  #text(weight: "bold")[De la lista de opciones, seleccione la respuesta correcta para cada enunciado:]\\
  #v(2pt)
  #pad(left: 10pt)[
    #text[
      A) RESOLUCIÓN DETERMINATIVA (Art. 99 Ley 2492)\\
      B) VISTA DE CARGO (Art. 96 Ley 2492)\\
      C) ORDEN DE FISCALIZACIÓN EXTERNA (OFE)\\
      D) ACTA DE RECEPCIÓN FINAL DE DOCUMENTACIÓN\\
      E) PROVEÍDO DE INICIO DE EJECUCIÓN TRIBUTARIA (PIET)
    ]
  ]
]
#v(3pt)
"""
    for p in p_sec6:
        content += f"""
#block(breakable: false, spacing: 3.5pt)[
  *{p['numero']}.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) {p['enunciado']}
]
"""

    if not es_ultimo:
        content += "\n#pagebreak(to: \"odd\")\n"

    return content, patron_claves

def generar_documento_typst_completo(estudiantes_lista, output_typ_path):
    variantes_disponibles = ['A', 'B']
    
    typ_header = """#set page(
  paper: "us-legal", // Hoja Oficio (8.5 x 13 in)
  margin: 2cm,
  header: none
)
#set text(font: "Times New Roman", size: 11pt, lang: "es")
#set par(leading: 0.52em, justify: true)
"""
    body_content = ""
    patrones_variantes = {}
    
    for i, est in enumerate(estudiantes_lista):
        var_letra = variantes_disponibles[i % len(variantes_disponibles)]
        es_ultimo = (i == len(estudiantes_lista) - 1)
        bloque, patron = construir_bloque_examen_30(est["nombre"], est["codigo"], var_letra, es_ultimo)
        body_content += bloque
        if var_letra not in patrones_variantes:
            patrones_variantes[var_letra] = patron

    with open(output_typ_path, "w", encoding="utf-8") as f:
        f.write(typ_header + body_content)
        
    return patrones_variantes

def generar_typst_patron(variante_letra, patron_claves, output_typ_path):
    typ_content = f"""#set page(
  paper: "us-legal",
  margin: 2cm,
  header: none,
  footer: none
)
#set text(font: "Times New Roman", size: 11pt, lang: "es")

#table(
  columns: (28%, 72%),
  stroke: 1pt + black,
  align: center + horizon,
  [#image("logo_unitepc_clean.png", width: 90%)],
  [
    #text(size: 12pt, weight: "bold")[UNIVERSIDAD TECNICA PRIVADA COSMOS]\\
    #text(size: 10pt, weight: "bold")[PATRON OFICIAL DE CORRECCION OMR (60 REACTIVOS)]\\
    #text(size: 9.5pt)[GESTION 2-2026 · EVALUACION OFICIAL 1ER PARCIAL · TIPO {variante_letra}]
  ]
)

#v(6pt)

#table(
  columns: (50%, 25%, 25%),
  stroke: 0.5pt + black,
  [
    *MATERIA:* [CPEC18] AUDITORÍA TRIBUTARIA\\
    *DOCENTE:* MAURICIO QUIROZ LAFUENTE\\
    *GRUPO:* TA-01 · *SEDE:* Cochabamba\\
    *FECHA:* 22/08/2026
  ],
  [
    #align(center)[
      #text(size: 8pt, weight: "bold")[FIRMA DOCENTE]\\
      #v(18pt)
      #line(length: 80%, stroke: (dash: "dashed", thickness: 0.5pt))
    ]
  ],
  [
    #align(center)[
      #text(size: 8pt, weight: "bold")[SELLO JEFATURA]\\
      #v(18pt)
      #line(length: 80%, stroke: (dash: "dashed", thickness: 0.5pt))
    ]
  ]
)

#v(8pt)
#text(size: 11.5pt, weight: "bold")[MATRIZ OFICIAL DE CLAVES DE CORRECCIÓN OMR (1 A 60)]
#line(length: 100%, stroke: 1pt + rgb("#6b21a8"))
#v(6pt)

#grid(
  columns: (16.6%, 16.6%, 16.6%, 16.6%, 16.6%, 16.6%),
  column-gutter: 6pt,
  row-gutter: 5pt,
"""
    for n in range(1, 61):
        if n in patron_claves:
            clave = patron_claves[n]
            typ_content += f"""  [
    #rect(width: 100%, stroke: 0.5pt + rgb("#6b21a8"), fill: rgb("#faf5ff"), inset: 4.5pt, radius: 2pt)[
      #text(size: 8.5pt, weight: "bold")[{n}.] #h(2pt) #text(size: 8.5pt, weight: "bold", fill: rgb("#581c87"))[({clave})]
    ]
  ],\n"""
        else:
            typ_content += f"""  [
    #rect(width: 100%, stroke: 0.35pt + luma(200), fill: rgb("#fafafa"), inset: 4.5pt, radius: 2pt)[
      #text(size: 8.5pt, fill: luma(120))[*{n}.*] #h(2pt) #text(size: 8.5pt, fill: luma(150))[(-)]
    ]
  ],\n"""

    typ_content += """
)
"""

    with open(output_typ_path, "w", encoding="utf-8") as f:
        f.write(typ_content)

def generar_remark_excel(patrones_dict, output_excel_path):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Patron_OMR_60"
    
    headers = ["Codigo", "Variante", "ID_Pregunta"] + [f"P{i}" for i in range(1, 61)]
    ws.append(headers)
    
    for var_letra, patron in patrones_dict.items():
        row = ["CPEC18", f"TIPO {var_letra}", "Respuesta"] + [patron.get(i, "-") for i in range(1, 61)]
        ws.append(row)
        
    wb.save(output_excel_path)

def main():
    typst_exe = r"c:\laragon\www\evaluaciones\typst.exe"
    bases_dir = r"c:\laragon\www\evaluaciones\bases"
    assets_dir = r"c:\laragon\www\evaluaciones\evaluaciones-frontend\src\assets\examenes"
    public_assets_dir = r"c:\laragon\www\evaluaciones\evaluaciones-frontend\public\assets\examenes"
    
    os.makedirs(bases_dir, exist_ok=True)
    os.makedirs(assets_dir, exist_ok=True)
    os.makedirs(public_assets_dir, exist_ok=True)
    
def generar_typst_lista_firmas(estudiantes_lista, output_typ_path):
    typ_content = """#set page(
  paper: "us-legal",
  margin: 2cm,
  header: none,
  footer: [
    #line(length: 100%, stroke: 0.5pt + black)
    #v(-2pt)
    #grid(
      columns: (50%, 50%),
      align: (left, right),
      [#text(size: 8pt, fill: luma(80))[UNIVERSIDAD TÉCNICA PRIVADA COSMOS · SEA EVALUACIONES]],
      [#text(size: 8pt, fill: luma(80))[PÁGINA #counter(page).display()]]
    )
  ]
)
#set text(font: "Times New Roman", size: 10.5pt, lang: "es")
#set par(leading: 0.52em)

// Cabecera Oficial Institucional (Sin Fondos)
#table(
  columns: (22%, 78%),
  stroke: 0.75pt + black,
  fill: none,
  inset: (x: 5pt, y: 3.5pt),
  align: (center + horizon, center + horizon),
  [
    #image("logo_unitepc_clean.png", width: 85%)
  ],
  [
    #text(weight: "bold")[UNIVERSIDAD TECNICA PRIVADA COSMOS]\\
    #text(weight: "bold")[GESTION 2-2026]\\
    #v(-4.5pt)
    #line(length: 100%, stroke: 0.5pt + black)
    #v(-2.5pt)
    #text(weight: "bold")[PLANILLA OFICIAL DE ASISTENCIA Y FIRMAS DE EVALUACION]
  ]
)

#v(-4pt)

// Datos de la Asignatura y Examen (Sin Fondos)
#table(
  columns: (58%, 42%),
  stroke: 0.5pt + black,
  fill: none,
  inset: (x: 5pt, y: 2.2pt),
  [*CARRERA:* AUDITORÍA / CONTADURÍA],
  [*GRUPO:* TA-01],
  [*MATERIA:* [CPEC18] AUDITORÍA TRIBUTARIA],
  [*EXAMEN:* 1er Parcial],
  [*DOCENTE:* MAURICIO QUIROZ LAFUENTE],
  [*FECHA:* 22/08/2026],
  [*SEMESTRE:* 3],
  [*HORA:* 08:15:00 - 09:45:00],
  [*AULA / CAMPUS:* Aula Central · Cochabamba],
  [*MODALIDAD:* Presencial con Cartilla OMR]
)

#v(4pt)

#text(size: 9pt)[*INSTRUCCIONES PARA EL CONTROL DE ASISTENCIA:* Cada estudiante debe verificar sus datos, registrar su firma de puño y letra al recibir el examen y confirmar la variante asignada.]

#v(3pt)

// TABLA OFICIAL DE ESTUDIANTES Y FIRMAS (SIN FONDOS)
#table(
  columns: (6%, 15%, 39%, 12%, 28%),
  stroke: 0.5pt + black,
  fill: none,
  inset: (x: 4pt, y: 6pt),
  align: (center + horizon, center + horizon, left + horizon, center + horizon, center + horizon),
  
  // Encabezados
  [*N°*], [*CÓDIGO*], [*APELLIDOS Y NOMBRES*], [*VARIANTE*], [*FIRMA DEL ESTUDIANTE*],
"""
    variantes = ['TIPO A', 'TIPO B']
    for idx, est in enumerate(estudiantes_lista):
        var = variantes[idx % len(variantes)]
        typ_content += f"""  [{idx + 1}], [{est['codigo']}], [{est['nombre'].upper()}], [*{var}*], [#box(width: 100%, baseline: 4pt, line(length: 100%, stroke: (dash: "dotted", thickness: 0.75pt)))],\n"""

    typ_content += f"""
)

#v(12pt)

// RESUMEN Y FIRMAS DE CONFORMIDAD
#table(
  columns: (50%, 50%),
  stroke: 0.5pt + black,
  fill: none,
  inset: 6pt,
  [
    #text(weight: "bold")[RESUMEN DE ASISTENCIA:]\\
    #v(3pt)
    Total Estudiantes Matriculados: #strong[{len(estudiantes_lista)}]\\
    Total Estudiantes Presentes: #box(width: 30pt, baseline: 3pt, line(length: 100%, stroke: 0.5pt + black))\\
    Total Estudiantes Ausentes: #box(width: 30pt, baseline: 3pt, line(length: 100%, stroke: 0.5pt + black))
  ],
  [
    #align(center)[
      #v(20pt)
      #line(length: 75%, stroke: 0.75pt + black)
      #v(-2pt)
      #text(weight: "bold", size: 9pt)[FIRMA DOCENTE TITULAR]\\
      #text(size: 8pt)[MAURICIO QUIROZ LAFUENTE]
    ]
  ]
)
"""
    with open(output_typ_path, "w", encoding="utf-8") as f:
        f.write(typ_content)


def main():
    bases_dir = r"c:\laragon\www\evaluaciones\bases"
    typst_exe = r"c:\laragon\www\evaluaciones\typst.exe"
    assets_dir = r"c:\laragon\www\evaluaciones\evaluaciones-frontend\src\assets\examenes"
    public_assets_dir = r"c:\laragon\www\evaluaciones\evaluaciones-frontend\public\assets\examenes"
    
    os.makedirs(bases_dir, exist_ok=True)
    os.makedirs(assets_dir, exist_ok=True)
    os.makedirs(public_assets_dir, exist_ok=True)
    
    # Copiar logo limpio a todas las carpetas
    for d in [assets_dir, public_assets_dir, r"c:\laragon\www\evaluaciones\evaluaciones-frontend\src\assets"]:
        try:
            shutil.copy2(os.path.join(bases_dir, "logo_unitepc_clean.png"), os.path.join(d, "logo_unitepc_clean.png"))
        except Exception:
            pass
            
    cod = "CPEC18"
    sede = "Cochabamba"
    grupo = "TA-01"
    tipo_examen = "1erParcial"
    fecha = "20260822"
    
    # =========================================================================
    # 1. GENERAR CUADERNILLO MASTER CON 3 ESTUDIANTES Y 30 PREGUNTAS
    # =========================================================================
    master_base_name = f"{cod}_{sede}_{grupo}_{tipo_examen}_{fecha}_Examen"
    master_typ = os.path.join(bases_dir, f"{master_base_name}.typ")
    master_pdf = os.path.join(bases_dir, f"{master_base_name}.pdf")
    
    print(f"Compilando Cuadernillo Master Typst (Cartilla 60 Filas y Puntos Bajos)...")
    patrones_variantes = generar_documento_typst_completo(ESTUDIANTES_OFICIALES, master_typ)
    
    res_m = subprocess.run([typst_exe, "compile", master_typ, master_pdf], cwd=bases_dir, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if res_m.returncode == 0:
        print(f"[OK] Master PDF compilado exitosamente ({os.path.getsize(master_pdf)} bytes)")
        shutil.copy2(master_pdf, os.path.join(assets_dir, f"{master_base_name}.pdf"))
        shutil.copy2(master_pdf, os.path.join(public_assets_dir, f"{master_base_name}.pdf"))
    else:
        print(f"[ERROR Master]: {res_m.stderr}")

    # =========================================================================
    # 2. GENERAR EXAMEN INDIVIDUAL PARA CADA UNO DE LOS 3 ESTUDIANTES
    # =========================================================================
    variantes_disponibles = ['A', 'B']
    for i, est in enumerate(ESTUDIANTES_OFICIALES):
        var_letra = variantes_disponibles[i % len(variantes_disponibles)]
        nom_slug = est["nombre"].replace(" ", "_").replace("É", "E").replace("Í", "I").replace("Ó", "O").replace("Á", "A").replace("Ú", "U").replace("Ñ", "N")
        
        base_name_estudiante = f"{cod}_{est['codigo']}_{nom_slug}_Examen"
        typ_est = os.path.join(bases_dir, f"{base_name_estudiante}.typ")
        pdf_est = os.path.join(bases_dir, f"{base_name_estudiante}.pdf")
        
        generar_documento_typst_completo([est], typ_est)
        res_e = subprocess.run([typst_exe, "compile", typ_est, pdf_est], cwd=bases_dir, capture_output=True, text=True, encoding='utf-8', errors='replace')
        if res_e.returncode == 0:
            print(f"[OK] Estudiante {est['codigo']} ({est['nombre']}) -> Var {var_letra} ({os.path.getsize(pdf_est)} bytes)")
            shutil.copy2(pdf_est, os.path.join(assets_dir, f"{base_name_estudiante}.pdf"))
            shutil.copy2(pdf_est, os.path.join(public_assets_dir, f"{base_name_estudiante}.pdf"))
            
    # =========================================================================
    # 3. GENERAR PATRONES OFICIALES (A, B) Y REMARK EXCEL
    # =========================================================================
    for var_letra in variantes_disponibles:
        patron = patrones_variantes.get(var_letra, {})
        base_name_patron = f"{cod}_{sede}_{grupo}_{tipo_examen}_Var{var_letra}_{fecha}_Patron"
        typ_patron = os.path.join(bases_dir, f"{base_name_patron}.typ")
        pdf_patron = os.path.join(bases_dir, f"{base_name_patron}.pdf")
        
        generar_typst_patron(var_letra, patron, typ_patron)
        res_p = subprocess.run([typst_exe, "compile", typ_patron, pdf_patron], cwd=bases_dir, capture_output=True, text=True, encoding='utf-8', errors='replace')
        if res_p.returncode == 0:
            shutil.copy2(pdf_patron, os.path.join(assets_dir, f"{base_name_patron}.pdf"))
            shutil.copy2(pdf_patron, os.path.join(public_assets_dir, f"{base_name_patron}.pdf"))
            
    remark_name = f"{cod}_{sede}_{grupo}_{tipo_examen}_VarA_{fecha}_Remark.xlsx"
    remark_path = os.path.join(bases_dir, remark_name)
    generar_remark_excel(patrones_variantes, remark_path)
    shutil.copy2(remark_path, os.path.join(assets_dir, remark_name))
    shutil.copy2(remark_path, os.path.join(public_assets_dir, remark_name))

    # =========================================================================
    # 4. GENERAR PLANILLA OFICIAL DE ASISTENCIA Y FIRMAS DE ESTUDIANTES
    # =========================================================================
    base_name_firmas = f"{cod}_{sede}_{grupo}_{tipo_examen}_{fecha}_Lista_Firmas"
    typ_firmas = os.path.join(bases_dir, f"{base_name_firmas}.typ")
    pdf_firmas = os.path.join(bases_dir, f"{base_name_firmas}.pdf")
    generar_typst_lista_firmas(ESTUDIANTES_OFICIALES, typ_firmas)
    res_f = subprocess.run([typst_exe, "compile", typ_firmas, pdf_firmas], cwd=bases_dir, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if res_f.returncode == 0:
        print(f"[OK] Planilla de Asistencia y Firmas compilada exitosamente ({os.path.getsize(pdf_firmas)} bytes)")
        shutil.copy2(pdf_firmas, os.path.join(assets_dir, f"{base_name_firmas}.pdf"))
        shutil.copy2(pdf_firmas, os.path.join(public_assets_dir, f"{base_name_firmas}.pdf"))
    else:
        print(f"[ERROR Lista Firmas]: {res_f.stderr}")
    
    print("[OK] Generación Typst Finalizada con Cartilla de 60 Reactivos y Planilla de Firmas!")

if __name__ == "__main__":
    main()
