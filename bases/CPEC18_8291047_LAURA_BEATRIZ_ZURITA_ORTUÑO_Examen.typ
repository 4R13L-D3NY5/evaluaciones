#set page(
  paper: "us-letter",
  margin: (top: 1.0cm, bottom: 1.0cm, left: 1.0cm, right: 1.0cm),
  header: none,
  footer: none
)
#set text(font: "Times New Roman", size: 11pt, lang: "es")
#set par(leading: 0.65em, justify: true)

// ========================================================
// PÁGINA 1: CABECERA CON LOGO OFICIAL + CARTILLA OMR 15%
// ========================================================

#grid(
  columns: (83%, 17%),
  column-gutter: 8pt,
  [
    // Cabecera Institucional Oficial con Logo UNITEPC
    #table(
      columns: (26%, 52%, 22%),
      stroke: 0.75pt + black,
      align: (center + horizon, center + horizon, center + horizon),
      fill: (x, y) => if x == 2 and y == 0 { rgb("#f8fafc") } else { none },
      [
        #image("c:\laragon\www\evaluaciones\bases\logo_unitepc.png", width: 95%)
      ],
      [
        #text(size: 10.5pt, weight: "bold")[UNIVERSIDAD TÉCNICA PRIVADA COSMOS]\
        #text(size: 9pt, weight: "bold")[GESTIÓN 2-2026]\
        #text(size: 9.5pt, weight: "bold")[EVALUACIÓN OFICIAL DE 1ER PARCIAL]
      ],
      [
        #text(size: 7pt, fill: luma(80))[CÓDIGO CONTROL]\
        #text(size: 8.5pt, weight: "bold", fill: rgb("#4c1d95"))[CTL-1047-CPEC18]
      ]
    )

    #v(-3pt)

    // Datos del Estudiante (Sin Variante Visible)
    #table(
      columns: (65%, 35%),
      stroke: 0.5pt + black,
      fill: (x, y) => if y == 0 { rgb("#f8fafc") } else { none },
      [#text(size: 9pt)[*ESTUDIANTE:* LAURA BEATRIZ ZURITA ORTUÑO]],
      [#text(size: 9pt)[*CÓDIGO:* 8291047]],
      [#text(size: 9pt)[*CARRERA:* COMPLEMENTARIA CONTADURÍA PÚBLICA]],
      [#text(size: 9pt)[*GRUPO:* TA-01]],
      [#text(size: 9pt)[*DOCENTE:* Titular Asignado]],
      [#text(size: 9pt)[*TIPO:* 1er Parcial]],
      [#text(size: 9pt)[*MATERIA:* [CPEC18] AUDITORÍA TRIBUTARIA]],
      [#text(size: 9pt)[*FECHA:* 22/08/2026]]
    )

    #v(-2pt)

    #rect(width: 100%, stroke: 0.5pt + luma(120), fill: rgb("#f1f5f9"), inset: 3.5pt, radius: 2pt)[
      #text(size: 8pt)[*INSTRUCCIONES:* Examen de 60 preguntas de opción múltiple (A-E). Rellene con *lápiz 2B* la opción correcta en la *Cartilla OMR* situada a la derecha de esta primera hoja. No marque en el texto del examen.]
    ]

    #v(2pt)
    #text(size: 9.5pt, weight: "bold")[SELECCIÓN DE LA MEJOR RESPUESTA (Preguntas 1 a 4)]
    #line(length: 100%, stroke: 0.5pt + black)
    #v(-2pt)

    #block(spacing: 5pt)[
      * 1.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la responsabilidad solidaria de los administradores y directores, señale el criterio técnico y legal correcto:
      #v(2pt)
      - *A)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
      - *B)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
      - *C)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
      - *D)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
      - *E)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    ]

    #block(spacing: 5pt)[
      * 2.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el devengamiento de intereses moratorios a favor de la Administración Tributaria, señale el criterio técnico y legal correcto:
      #v(2pt)
      - *A)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
      - *B)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
      - *C)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
      - *D)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
      - *E)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    ]

    #block(spacing: 5pt)[
      * 3.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el Impuesto a los Consumos Específicos (ICE) en bebidas alcohólicas, señale el criterio técnico y legal correcto:
      #v(2pt)
      - *A)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
      - *B)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
      - *C)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
      - *D)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
      - *E)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    ]

    #block(spacing: 5pt)[
      * 4.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a las exenciones tributarias a colegios, universidades y entidades educativas, señale el criterio técnico y legal correcto:
      #v(2pt)
      - *A)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
      - *B)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
      - *C)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
      - *D)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
      - *E)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    ]

  ],
  [
    // CARTILLA OMR 15% DERECHA (1 A 60 - BURBUJAS A, B, C, D, E)
    #rect(width: 100%, stroke: 0.75pt + black, fill: rgb("#fafafa"), inset: (x: 1.5pt, y: 3pt), radius: 2pt)[
      #align(center)[
        #text(size: 7.5pt, weight: "bold")[CARTILLA OMR]\
        #text(size: 5.5pt, fill: luma(80))[60 Reactivos (A-E)]
      ]
      #v(1pt)
      #line(length: 100%, stroke: 0.5pt + black)
      #v(1pt)

      #table(
        columns: (18%, 16%, 16%, 16%, 16%, 16%),
        stroke: none,
        inset: (x: 0.5pt, y: 1.1pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 5.5pt, weight: "bold")[1.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[2.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[3.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[4.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[5.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[6.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[7.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[8.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[9.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[10.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[11.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[12.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[13.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[14.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[15.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[16.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[17.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[18.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[19.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[20.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[21.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[22.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[23.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[24.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[25.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[26.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[27.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[28.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[29.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[30.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[31.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[32.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[33.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[34.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[35.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[36.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[37.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[38.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[39.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[40.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[41.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[42.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[43.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[44.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[45.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[46.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[47.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[48.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[49.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[50.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[51.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[52.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[53.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[54.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[55.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[56.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[57.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[58.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[59.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],
        [#text(size: 5.5pt, weight: "bold")[60.]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[A]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[B]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[C]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[D]]]],
        [#circle(radius: 2.7pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4pt)[E]]]],

      )

      #v(2pt)
      #line(length: 100%, stroke: 0.5pt + black)
      #v(6pt)
      #line(length: 80%, stroke: (dash: "dashed", thickness: 0.5pt))
      #align(center)[
        #text(size: 5.5pt, weight: "bold")[FIRMA ESTUDIANTE]\
        #text(size: 5pt, fill: luma(100))[ID: 8291047]
      ]
    ]
  ]
)

#pagebreak()

// ========================================================
// PÁGINAS SUBSIGUIENTES: PREGUNTAS 5 A 60 (2 COLUMNAS)
// ========================================================
#columns(2, gutter: 14pt)[

  #block(spacing: 5pt)[
    * 5.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la exclusión de crédito fiscal por compras en zonas francas o exentas, señale el criterio técnico y legal correcto:
    - *A)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *B)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *C)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *D)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *E)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
  ]

  #block(spacing: 5pt)[
    * 6.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el procedimiento de Determinación de Oficio y la Vista de Cargo, señale el criterio técnico y legal correcto:
    - *A)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *B)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *C)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *D)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *E)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
  ]

  #block(spacing: 5pt)[
    * 7.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el pago indebido o en exceso y la Acción de Repetición, señale el criterio técnico y legal correcto:
    - *A)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *B)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *C)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *D)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *E)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
  ]

  #block(spacing: 5pt)[
    * 8.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la deducibilidad de sueldos pagados al cónyuge o parientes del dueño, señale el criterio técnico y legal correcto:
    - *A)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *B)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *C)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *D)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *E)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
  ]

  #block(spacing: 5pt)[
    * 9.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a las diferencias temporales y permanentes en la Norma Contable 6 y D.S. 24051, señale el criterio técnico y legal correcto:
    - *A)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *B)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *C)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *D)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *E)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
  ]

  #block(spacing: 5pt)[
    * 10.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la determinación del Débito Fiscal IVA en notas de crédito/débito, señale el criterio técnico y legal correcto:
    - *A)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *B)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *C)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *D)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *E)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
  ]

  #block(spacing: 5pt)[
    * 11.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la auditoría de ingresos extraordinarios y ganancias por diferencia de cambio, señale el criterio técnico y legal correcto:
    - *A)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *B)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *C)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *D)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *E)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
  ]

  #block(spacing: 5pt)[
    * 12.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el Impuesto Especial a los Hidrocarburos y sus Derivados (IEHD), señale el criterio técnico y legal correcto:
    - *A)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *B)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *C)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *D)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *E)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
  ]

  #block(spacing: 5pt)[
    * 13.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el informe de procedimientos acordados en auditoría fiscal, señale el criterio técnico y legal correcto:
    - *A)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *B)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *C)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *D)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *E)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
  ]

  #block(spacing: 5pt)[
    * 14.* Las compensaciones del IUE pagado efectivamente contra el Impuesto a las Transacciones (IT) operan:
    - *A)* Exclusivamente en empresas del sector minero y petrolero
    - *B)* Hasta un máximo del 50% de la utilidad bruta
    - *C)* De forma retroactiva a los períodos del año anterior
    - *D)* A partir del mes siguiente al pago del IUE hasta su total agotamiento o nuevo vencimiento
    - *E)* Únicamente contra el Impuesto al Valor Agregado (IVA)
  ]

  #block(spacing: 5pt)[
    * 15.* En una auditoría tributaria, la técnica de confirmación de saldos con terceros permite verificar principalmente el objetivo de:
    - *A)* Existencia, integridad y exactitud de las cuentas por cobrar y pagar comerciales
    - *B)* Cálculo de coeficientes de solvencia
    - *C)* Depreciación acumulada de activos fijos intangibles
    - *D)* Estructura societaria y tenencia accionaria
    - *E)* Capacidad de pago futura de la entidad
  ]

  #block(spacing: 5pt)[
    * 16.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el recurso jerárquico ante la Autoridad General de Impugnación Tributaria (AGIT), señale el criterio técnico y legal correcto:
    - *A)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *B)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *C)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *D)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *E)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
  ]

  #block(spacing: 5pt)[
    * 17.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el cómputo del mantenimiento de valor en UFV según Código Tributario, señale el criterio técnico y legal correcto:
    - *A)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *B)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *C)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *D)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *E)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
  ]

  #block(spacing: 5pt)[
    * 18.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el Régimen Tributario Simplificado y sus límites de capital y ventas, señale el criterio técnico y legal correcto:
    - *A)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *B)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *C)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *D)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *E)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
  ]

  #block(spacing: 5pt)[
    * 19.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la validez de la firma digital en documentos tributarios electrónicos, señale el criterio técnico y legal correcto:
    - *A)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *B)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *C)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *D)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *E)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
  ]

  #block(spacing: 5pt)[
    * 20.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a las pruebas periciales en procesos contenciosos tributarios, señale el criterio técnico y legal correcto:
    - *A)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *B)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *C)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *D)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *E)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
  ]

  #block(spacing: 5pt)[
    * 21.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a las provisiones y previsiones deducibles para incobrabilidad, señale el criterio técnico y legal correcto:
    - *A)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *B)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *C)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *D)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *E)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
  ]

  #block(spacing: 5pt)[
    * 22.* En la determinación de la base imponible del Impuesto sobre las Utilidades de las Empresas (IUE), los gastos no deducibles corresponden a:
    - *A)* Depreciaciones conforme a la tabla del D.S. 24051
    - *B)* Gastos personales de los socios o sin respaldo de factura legal
    - *C)* Gastos vinculados directamente con la actividad gravada
    - *D)* Aportes patronales y beneficios sociales devengados
    - *E)* Intereses bancarios por préstamos destinados al giro del negocio
  ]

  #block(spacing: 5pt)[
    * 23.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la calificación de la conducta tributaria: omisión de pago vs defraudación, señale el criterio técnico y legal correcto:
    - *A)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *B)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *C)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *D)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *E)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
  ]

  #block(spacing: 5pt)[
    * 24.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la auditoría tributaria preventiva y la matriz de riesgos impositivos, señale el criterio técnico y legal correcto:
    - *A)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *B)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *C)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *D)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *E)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
  ]

  #block(spacing: 5pt)[
    * 25.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el Libro de Ventas Menores del día para comerciantes minoristas, señale el criterio técnico y legal correcto:
    - *A)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *B)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *C)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *D)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *E)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
  ]

  #block(spacing: 5pt)[
    * 26.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la clausura por no emisión de factura o documento equivalente, señale el criterio técnico y legal correcto:
    - *A)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *B)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *C)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *D)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *E)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
  ]

  #block(spacing: 5pt)[
    * 27.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el tratamiento impositivo de las cooperativas mineras y de servicios, señale el criterio técnico y legal correcto:
    - *A)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *B)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *C)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *D)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *E)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
  ]

  #block(spacing: 5pt)[
    * 28.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a los inventarios físicos y las mermas o desmedros justificados, señale el criterio técnico y legal correcto:
    - *A)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *B)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *C)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *D)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *E)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
  ]

  #block(spacing: 5pt)[
    * 29.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el acta de recepción final de la fiscalización tributaria, señale el criterio técnico y legal correcto:
    - *A)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *B)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *C)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *D)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *E)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
  ]

  #block(spacing: 5pt)[
    * 30.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el procedimiento de cobro coactivo y las medidas precautorias, señale el criterio técnico y legal correcto:
    - *A)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *B)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *C)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *D)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *E)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
  ]

  #block(spacing: 5pt)[
    * 31.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a las fiscalizaciones electrónicas y cruces masivos de información, señale el criterio técnico y legal correcto:
    - *A)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *B)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *C)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *D)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *E)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
  ]

  #block(spacing: 5pt)[
    * 32.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a las retenciones tributarias del IUE e IT por servicios de personas no inscritas, señale el criterio técnico y legal correcto:
    - *A)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *B)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *C)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *D)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *E)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
  ]

  #block(spacing: 5pt)[
    * 33.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el acta de custodia de cuadernillos y exámenes de evaluación institucional, señale el criterio técnico y legal correcto:
    - *A)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *B)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *C)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *D)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *E)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
  ]

  #block(spacing: 5pt)[
    * 34.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la fiscalización integral y la fiscalización puntual externa, señale el criterio técnico y legal correcto:
    - *A)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *B)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *C)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *D)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *E)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
  ]

  #block(spacing: 5pt)[
    * 35.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el Recurso de Alzada ante la Autoridad de Impugnación Tributaria (AIT), señale el criterio técnico y legal correcto:
    - *A)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *B)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *C)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *D)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *E)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
  ]

  #block(spacing: 5pt)[
    * 36.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la verificación del cumplimiento de la Ley 843 y decretos reglamentarios, señale el criterio técnico y legal correcto:
    - *A)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *B)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *C)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *D)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *E)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
  ]

  #block(spacing: 5pt)[
    * 37.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la determinación de la tasa efectiva de tributación (TET), señale el criterio técnico y legal correcto:
    - *A)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *B)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *C)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *D)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *E)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
  ]

  #block(spacing: 5pt)[
    * 38.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el valor probatorio de los libros de contabilidad manuales vs electrónicos, señale el criterio técnico y legal correcto:
    - *A)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *B)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *C)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *D)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *E)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
  ]

  #block(spacing: 5pt)[
    * 39.* La alícuota general del Impuesto a las Transacciones (IT) establecida en la Ley 843 es del:
    - *A)* 13% sobre el valor neto de la factura
    - *B)* 25% sobre la utilidad neta imponible
    - *C)* 0.30% aplicable al débito y crédito bancario
    - *D)* 3% sobre los ingresos brutos devengados o percibidos
    - *E)* 1.5% sobre transacciones financieras en moneda nacional
  ]

  #block(spacing: 5pt)[
    * 40.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el tratamiento tributario de las pérdidas no compensadas del IUE, señale el criterio técnico y legal correcto:
    - *A)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *B)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *C)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *D)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *E)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
  ]

  #block(spacing: 5pt)[
    * 41.* El Régimen Complementario al Impuesto al Valor Agregado (RC-IVA) para dependientes permite el descargo mediante presentación del Formulario 110 con facturas de antigüedad no mayor a:
    - *A)* 60 días corridos desde su emisión
    - *B)* 90 días exclusivamente para gastos médicos
    - *C)* 120 días calendario anteriores al día de presentación del formulario
    - *D)* 30 días calendario anteriores a la fecha de presentación
    - *E)* 365 días del ejercicio fiscal correspondiente
  ]

  #block(spacing: 5pt)[
    * 42.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el Impuesto a las Salidas Aéreas al Exterior (ISAE), señale el criterio técnico y legal correcto:
    - *A)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *B)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *C)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *D)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *E)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
  ]

  #block(spacing: 5pt)[
    * 43.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el tratamiento impositivo de dividendos y remesas al exterior, señale el criterio técnico y legal correcto:
    - *A)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *B)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *C)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *D)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *E)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
  ]

  #block(spacing: 5pt)[
    * 44.* Según el Código Tributario Boliviano (Ley 2492), el término de prescripción de las facultades de control, investigación y fiscalización de la Administración Tributaria es de:
    - *A)* 8 años para tributos de periodicidad anual y contravenciones
    - *B)* 2 años calendario continuos
    - *C)* 5 años para personas naturales únicamente
    - *D)* 4 años improrrogables
    - *E)* 20 años en materia de contravenciones
  ]

  #block(spacing: 5pt)[
    * 45.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el cálculo de la alícuota adicional del IUE para entidades financieras (AA-IUE), señale el criterio técnico y legal correcto:
    - *A)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *B)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *C)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *D)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *E)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
  ]

  #block(spacing: 5pt)[
    * 46.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el régimen de incentivos tributarios para la industrialización y exportaciones, señale el criterio técnico y legal correcto:
    - *A)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *B)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *C)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *D)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *E)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
  ]

  #block(spacing: 5pt)[
    * 47.* La bancarización obligatoria según normativa tributaria vigente aplica a operaciones de compra o venta de bienes y servicios cuyo importe sea igual o superior a:
    - *A)* Bs. 10.000 (Diez mil bolivianos)
    - *B)* Bs. 50.000 (Cincuenta mil bolivianos)
    - *C)* Bs. 200.000 (Doscientos mil bolivianos)
    - *D)* Bs. 25.000 (Veinticinco mil bolivianos)
    - *E)* Bs. 100.000 (Cien mil bolivianos)
  ]

  #block(spacing: 5pt)[
    * 48.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la deducibilidad de donaciones a entidades sin fines de lucro autorizadas, señale el criterio técnico y legal correcto:
    - *A)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *B)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *C)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *D)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *E)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
  ]

  #block(spacing: 5pt)[
    * 49.* El método de determinación de la base imponible sobre base presunta procede cuando:
    - *A)* El contribuyente presenta todos sus libros de compras y ventas notariados
    - *B)* Se solicita una prórroga ordinaria para el pago de la deuda tributaria
    - *C)* Se cuenta con estados financieros auditados con dictamen limpio
    - *D)* Las ventas declaradas superan los límites del Régimen Simplificado
    - *E)* El sujeto pasivo no presenta libros contables ni documentación fidedigna que permita conocer los hechos imponibles
  ]

  #block(spacing: 5pt)[
    * 50.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la conciliación tributaria en el dictamen sobre la información tributaria complementaria, señale el criterio técnico y legal correcto:
    - *A)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *B)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *C)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *D)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *E)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
  ]

  #block(spacing: 5pt)[
    * 51.* Para el cómputo del Crédito Fiscal IVA en compras de bienes y servicios, el documento fiscal debe cumplir obligatoriamente con:
    - *A)* Tener una antigüedad mayor a 180 días desde su emisión
    - *B)* Ser cancelado únicamente en efectivo al momento de la entrega
    - *C)* Estar vinculado a la actividad gravada, emitido a nombre y NIT del sujeto pasivo y respaldado fehacientemente
    - *D)* Contar con autorización de la Jefatura Departamental de Trabajo
    - *E)* Haber sido emitido exclusivamente en moneda extranjera
  ]

  #block(spacing: 5pt)[
    * 52.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el tratamiento contable-tributario del arrendamiento financiero (Leasing), señale el criterio técnico y legal correcto:
    - *A)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *B)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *C)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *D)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *E)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
  ]

  #block(spacing: 5pt)[
    * 53.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la resolución determinativa y sus requisitos de validez legal, señale el criterio técnico y legal correcto:
    - *A)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *B)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *C)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *D)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *E)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
  ]

  #block(spacing: 5pt)[
    * 54.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el Sistema de Facturación Electrónica en Línea y sus modalidades, señale el criterio técnico y legal correcto:
    - *A)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *B)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *C)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *D)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *E)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
  ]

  #block(spacing: 5pt)[
    * 55.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la prescripción de sanciones pecuniarias por contravenciones, señale el criterio técnico y legal correcto:
    - *A)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *B)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *C)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *D)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *E)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
  ]

  #block(spacing: 5pt)[
    * 56.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a los precios de transferencia y operaciones entre partes vinculadas, señale el criterio técnico y legal correcto:
    - *A)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *B)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *C)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *D)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *E)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
  ]

  #block(spacing: 5pt)[
    * 57.* En el examen de pasivos tributarios, la omisión de pago se configura cuando:
    - *A)* La empresa realiza ventas exentas debidamente autorizadas
    - *B)* El sujeto pasivo, por acción u omisión, no paga el tributo dentro de los plazos legales
    - *C)* Se efectúa una rectificatoria a favor del fisco con pago inmediato
    - *D)* El contribuyente presenta su declaración jurada y cancela el importe total en fecha
    - *E)* Se solicita una facilidad de pago antes del vencimiento
  ]

  #block(spacing: 5pt)[
    * 58.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a las multas por Incumplimiento a Deberes Formales (IDF), señale el criterio técnico y legal correcto:
    - *A)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *B)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *C)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *D)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *E)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
  ]

  #block(spacing: 5pt)[
    * 59.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la auditoría de activos fijos y su revalúo técnico tributario, señale el criterio técnico y legal correcto:
    - *A)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *B)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
    - *C)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *D)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *E)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
  ]

  #block(spacing: 5pt)[
    * 60.* En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el Registro de Compras y Ventas (RCV) y los plazos de confirmación, señale el criterio técnico y legal correcto:
    - *A)* El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051
    - *B)* Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa
    - *C)* Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo
    - *D)* Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados
    - *E)* Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio
  ]

]

#v(8pt)
#rect(width: 100%, stroke: 0.75pt + black, fill: rgb("#f8fafc"), inset: 6pt, radius: 3pt)[
  #align(center)[
    #text(size: 9pt, weight: "bold")[*** FIN DE LA EVALUACIÓN OFICIAL (60 PREGUNTAS) ***]\
    #text(size: 8pt, fill: luma(80))[Verifique que todas sus 60 respuestas se encuentren correctamente rellenadas en la Cartilla OMR de la Página 1.]
  ]
]
