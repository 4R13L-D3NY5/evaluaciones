#set text(font: ("Arial", "Liberation Sans", "Helvetica"), size: 9pt, lang: "es")
#set par(leading: 0.52em, justify: true)

// ============================================================================
// EXAMEN OFICIAL UNITEPC - JUAN CARLOS PÉREZ MAMANI (ID: 7849102)
// VARIANTE ASIGNADA: TIPO A (CONFIDENCIAL)
// ============================================================================

#set page(
  width: 8.5in,
  height: 13in,
  margin: 2.0cm,
  footer: context [
    #grid(
      columns: (1fr, 1fr),
      align: (left + horizon, right + horizon),
      [
        #text(size: 8pt, fill: luma(80))[
          JUAN CARLOS PÉREZ MAMANI \
          7849102
        ]
      ],
      [
        #text(size: 8pt, fill: luma(80))[
          Pág. #counter(page).display()
        ]
      ]
    )
  ]
)

#counter(page).update(1)

#set text(font: ("Arial", "Liberation Sans", "Helvetica"), size: 9pt)

// Cabecera Oficial (100% Horizontal)
#table(
  columns: (22%, 78%),
  stroke: 0.75pt + black,
  fill: none,
  inset: (x: 6pt, y: 4pt),
  align: (center + horizon, center + horizon),
  [
    #image("logo_unitepc_clean.png", width: 85%)
  ],
  [
    #text(weight: "bold", size: 10pt)[UNIVERSIDAD TÉCNICA PRIVADA COSMOS]\
    #text(weight: "bold", size: 9pt)[GESTIÓN 2-2026]\
    #v(-4pt)
    #line(length: 100%, stroke: 0.5pt + black)
    #v(-2.5pt)
    #text(weight: "bold", size: 9.5pt)[EVALUACIÓN TEÓRICA 1ER PARCIAL]
  ]
)

#v(-3pt)

// Datos del Estudiante (Sin fondos, código destacado en 16pt y firma en la misma fila)
#table(
  columns: (58%, 42%),
  stroke: 0.5pt + black,
  fill: none,
  inset: (x: 6pt, y: 3pt),
  [*NOMBRE:* JUAN CARLOS PÉREZ MAMANI],
  [*CARRERA:* AUDITORÍA / CONTADURÍA],
  [*MATERIA:* [CPEC18] AUDITORÍA TRIBUTARIA],
  [*GRUPO:* TA-01 #h(10pt) *SEMESTRE:* 3],
  [*DOCENTE:* MAURICIO QUIROZ LAFUENTE],
  [*EXAMEN:* 1er Parcial · VARIANTE A],
  [*FECHA:* 22/08/2026],
  [*HORA:* 08:15:00 - 09:45:00],
  [
    *FIRMA DEL ESTUDIANTE:* \
    #v(12pt)
    #line(length: 100%, stroke: (dash: "dotted", thickness: 0.85pt))
  ],
  [
    *CÓDIGO:* \
    #v(-2pt)
    #align(center)[#text(size: 16pt, weight: "bold")[7849102]]
  ]
)

#v(3pt)
#text(size: 8.5pt)[*INSTRUCCIÓN DE COMPLETADO DE CARTILLA:* Rellene con cuidado la opción correcta con bolígrafo AZUL o NEGRO. Ejemplos: [● Correcto]  [X Incorrecto]  [- Incorrecto]  [O Incorrecto]]
#v(3pt)

// CARTILLA DE RESPUESTAS CON MARCADORES FIDUCIALES NEGROS EN SUS 4 ESQUINAS
#rect(width: 100%, stroke: 0.85pt + black, fill: none, inset: (x: 6pt, y: 5pt), radius: 0pt)[
  #place(top + left, dx: -6pt, dy: -5pt)[#rect(width: 10pt, height: 10pt, fill: black)]
  #place(top + right, dx: 6pt, dy: -5pt)[#rect(width: 10pt, height: 10pt, fill: black)]
  #place(bottom + left, dx: -6pt, dy: 5pt)[#rect(width: 10pt, height: 10pt, fill: black)]
  #place(bottom + right, dx: 6pt, dy: 5pt)[#rect(width: 10pt, height: 10pt, fill: black)]

  #align(center)[
    #text(weight: "bold", size: 9.5pt)[CARTILLA DE RESPUESTAS (1 A 60) — VARIANTE A]
  ]
  #v(-3pt)
  #grid(
    columns: (1fr, 1fr, 1fr, 1fr),
    column-gutter: 6pt,
    [
      #table(
        columns: (16%, 16.8%, 16.8%, 16.8%, 16.8%, 16.8%),
        stroke: none,
        inset: (x: 0pt, y: 5.2pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 8pt, weight: "bold")[1.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[2.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[3.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[4.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[5.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[6.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[7.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[8.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[9.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[10.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[11.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[12.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[13.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[14.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[15.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]]
      )
    ],
    [
      #table(
        columns: (16%, 16.8%, 16.8%, 16.8%, 16.8%, 16.8%),
        stroke: none,
        inset: (x: 0pt, y: 5.2pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 8pt, weight: "bold")[16.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[17.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[18.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[19.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[20.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[21.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[22.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[23.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[24.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[25.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[26.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[27.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[28.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[29.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[30.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]]
      )
    ],
    [
      #table(
        columns: (16%, 16.8%, 16.8%, 16.8%, 16.8%, 16.8%),
        stroke: none,
        inset: (x: 0pt, y: 5.2pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 8pt, weight: "bold")[31.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[32.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[33.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[34.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[35.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[36.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[37.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[38.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[39.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[40.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[41.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[42.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[43.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[44.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[45.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]]
      )
    ],
    [
      #table(
        columns: (16%, 16.8%, 16.8%, 16.8%, 16.8%, 16.8%),
        stroke: none,
        inset: (x: 0pt, y: 5.2pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 8pt, weight: "bold")[46.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[47.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[48.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[49.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[50.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[51.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[52.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[53.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[54.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[55.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[56.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[57.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[58.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[59.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[60.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]]
      )
    ]
  )
]

#pagebreak()

// ============================================================================
// HOJA 2: CUESTIONARIO DE PREGUNTAS (1 A 30)
// ============================================================================

#align(center)[
  #text(size: 11pt, weight: "bold")[CUESTIONARIO DE PREGUNTAS (30 REACTIVOS)]\
  #text(size: 9pt, fill: luma(80))[[CPEC18] AUDITORÍA TRIBUTARIA · EVALUACIÓN TEÓRICA 1ER PARCIAL · VARIANTE A]
]
#v(-2pt)
#line(length: 100%, stroke: 0.65pt + black)
#v(4pt)

// SECCIÓN 1: SELECCION DE LA MEJOR RESPUESTA (Preguntas 1 a 6)
#text(weight: "bold")[SELECCIÓN DE LA MEJOR RESPUESTA (Preguntas 1 a 6)]\
#v(-4pt)
#text(size: 8.5pt)[*Instrucciones:* Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.]
#v(2pt)

#block(breakable: false, spacing: 3.5pt)[
  *1.*  Al final de cada proceso de auditoría tributaria para determinar la base imponible del IUE se debe:
  #v(0.6pt)
  #pad(left: 12pt)[
    A) Excluir los gastos personales sin respaldo de factura legal \
    B) Ninguna de las anteriores \
    C) Deducir únicamente las compras vinculadas a la actividad gravada \
    D) Depreciar conforme a la tabla oficial del D.S. 24051 \
    E) Todas las anteriores \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *2.*  Según el Código Tributario Boliviano (Ley 2492), el término de prescripción de las facultades de fiscalización es de:
  #v(0.6pt)
  #pad(left: 12pt)[
    A) 2 años calendario continuos \
    B) Ninguna de las anteriores \
    C) Todas las anteriores \
    D) 4 años improrrogables \
    E) 8 años para tributos y contravenciones \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *3.*  Para el cómputo del Crédito Fiscal IVA en compras de bienes y servicios, el documento fiscal debe:
  #v(0.6pt)
  #pad(left: 12pt)[
    A) Todas las anteriores \
    B) Ninguna de las anteriores \
    C) Ser cancelado únicamente en efectivo \
    D) Estar vinculado a la actividad gravada y a nombre del sujeto pasivo \
    E) Haber sido emitido exclusivamente en moneda extranjera \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *4.*  En una auditoría tributaria, la técnica de confirmación de saldos con terceros verifica principalmente:
  #v(0.6pt)
  #pad(left: 12pt)[
    A) Estructura societaria y tenencia accionaria \
    B) Todas las anteriores \
    C) Capacidad de pago futura de la entidad \
    D) Ninguna de las anteriores \
    E) Existencia, integridad y exactitud de cuentas por cobrar y pagar \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *5.*  El método de determinación de la base imponible sobre base presunta procede cuando:
  #v(0.6pt)
  #pad(left: 12pt)[
    A) Se cuenta con estados financieros auditados limpios \
    B) El sujeto pasivo no presenta libros ni documentación fidedigna \
    C) Ninguna de las anteriores \
    D) Todas las anteriores \
    E) El contribuyente presenta todos sus libros notariados \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *6.*  La alícuota general del Impuesto a las Transacciones (IT) según la Ley 843 es del:
  #v(0.6pt)
  #pad(left: 12pt)[
    A) Ninguna de las anteriores \
    B) 3% sobre los ingresos brutos devengados o percibidos \
    C) Todas las anteriores \
    D) 13% sobre el valor neto de la factura \
    E) 25% sobre la utilidad neta imponible \
  ]
]

#pagebreak()

// ============================================================================
// HOJA 2: SECCIONES 2 A 6 DE PREGUNTAS
// ============================================================================

#v(2pt)
#text(weight: "bold")[VERDADERO O FALSO SIMPLE]\
#v(-4pt)
#text(size: 9.5pt)[*Instrucciones:* Marque A si el enunciado es verdadero o B si el enunciado es falso.]
#v(1.5pt)

#block(breakable: false, spacing: 3.2pt)[
  *7.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) El Impuesto al Valor Agregado (IVA) grava únicamente las ventas en efectivo y excluye las ventas al crédito.
]

#block(breakable: false, spacing: 3.2pt)[
  *8.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Las donaciones a entidades sin fines de lucro autorizadas son deducibles hasta el límite del 10% de la utilidad neta.
]

#block(breakable: false, spacing: 3.2pt)[
  *9.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) La bancarización obligatoria aplica a transacciones iguales o superiores a Bs. 50.000 respaldadas con documentos de pago.
]

#block(breakable: false, spacing: 3.2pt)[
  *10.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) El IUE efectivamente pagado se compensa contra el IT a partir del mismo mes en que fue cancelado.
]

#block(breakable: false, spacing: 3.2pt)[
  *11.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Las pérdidas fiscales no compensadas en el IUE pueden trasladarse sucesivamente hasta un máximo de cinco ejercicios posteriores.
]

#block(breakable: false, spacing: 3.2pt)[
  *12.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) La no emisión de factura mercantil amerita clausura directa e inmediata del establecimiento comercial.
]

#v(3pt)
#text(weight: "bold")[VERDADERO O FALSO COMPLEJAS]\
#v(-4pt)
#text(size: 9.5pt)[*Instrucciones:* Seleccione la opción correcta de acuerdo con la siguiente clave:\
#h(12pt) A: 1, 2 y 3 son verdaderas. #h(12pt) B: 1 y 3 son verdaderas. #h(12pt) C: 2 y 4 son verdaderas.\
#h(12pt) D: Solo 4 es verdadera. #h(12pt) E: Todas son verdaderas.]
#v(1.5pt)

#block(breakable: false, spacing: 3.2pt)[
  *13.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Seleccione los incisos verdaderos sobre la deducibilidad del gasto en el IUE:
  #v(0.8pt)
  #pad(left: 16pt)[
    1. La deducibilidad del gasto exige documento mercantil original y vinculado a la actividad. \
    2. Las depreciaciones de vehículos se amortizan a una tasa máxima del 20% anual. \
    3. Los aportes patronales efectivamente devengados y cancelados son deducibles. \
    4. Las multas e intereses tributarios constituyen gastos no deducibles. \
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *14.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Seleccione los incisos verdaderos sobre el Crédito Fiscal IVA:
  #v(0.8pt)
  #pad(left: 16pt)[
    1. Requiere factura original debidamente dosificada o electrónica. \
    2. Las compras de combustible computan el 100% de crédito fiscal. \
    3. Es obligatorio el medio fehaciente de pago para importes mayores a Bs. 50.000. \
    4. Procede crédito fiscal en gastos de uso particular de los accionistas. \
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *15.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Seleccione los incisos verdaderos sobre la prescripción según Código Tributario (Ley 2492):
  #v(0.8pt)
  #pad(left: 16pt)[
    1. Las facultades de control y fiscalización prescriben a los 8 años. \
    2. La prescripción se suspende con la notificación de la Resolución Determinativa. \
    3. Las sanciones pecuniarias por contravenciones prescriben a los 5 años. \
    4. La prescripción debe ser alegada expresamente por el contribuyente. \
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *16.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Seleccione los incisos verdaderos sobre los regímenes tributarios:
  #v(0.8pt)
  #pad(left: 16pt)[
    1. El Régimen Tributario Simplificado emite factura válida para crédito fiscal. \
    2. Los comerciantes minoristas y artesanos pertenecen al Régimen Simplificado. \
    3. Las empresas unipersonales están exentas de presentar estados financieros. \
    4. El Sistema Integrado de Facturación en Línea es obligatorio para emisores masivos. \
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *17.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Seleccione los incisos verdaderos sobre los procedimientos de impugnación tributaria:
  #v(0.8pt)
  #pad(left: 16pt)[
    1. El Recurso de Alzada se interpone dentro de los 20 días siguientes a la notificación. \
    2. La interposición del Recurso Jerárquico suspende la ejecución tributaria. \
    3. La Autoridad General de Impugnación Tributaria (AGIT) resuelve en instancia final administrativa. \
    4. La demanda contenciosa administrativa es la única vía judicial de revisión. \
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *18.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Seleccione los incisos verdaderos sobre las retenciones impositivas:
  #v(0.8pt)
  #pad(left: 16pt)[
    1. La retención por compra de bienes no respaldada es del 5% IUE y 3% IT. \
    2. La retención por contratación de servicios independientes es del 12.5% IUE y 3% IT. \
    3. El agente de retención es solidariamente responsable ante el fisco por el tributo no retenido. \
    4. Las entidades estatales no están obligadas a actuar como agentes de retención. \
  ]
]

#v(3pt)
#text(weight: "bold")[RESPUESTA A / B / AMBAS / NINGUNA]\
#v(-4pt)
#text(size: 9.5pt)[*Instrucciones:* Las siguientes preguntas están compuestas por dos premisas. Responda con:\
#h(12pt) A: si solo la primera premisa es verdadera. #h(12pt) B: si solo la segunda premisa es verdadera.\
#h(12pt) C: si ambas premisas son verdaderas. #h(12pt) D: si ninguna premisa es verdadera.]
#v(1.5pt)

#block(breakable: false, spacing: 3.2pt)[
  *19.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) I. El Impuesto a las Transacciones se calcula sobre los ingresos brutos devengados o percibidos.\
  #pad(left: 36pt)[
    II. El IT efectivamente pagado es deducible como gasto en el IUE cuando no ha sido compensado.
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *20.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) I. La provisión para incobrables del 3% anual es acumulativa indefinidamente sin límite.\
  #pad(left: 36pt)[
    II. Los créditos incobrables deben contar con un año de mora y cobranza judicial iniciada.
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *21.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) I. Las compras de combustible computan el 70% del valor facturado como crédito fiscal.\
  #pad(left: 36pt)[
    II. El 30% restante no computado para crédito fiscal es gasto deducible en el IUE.
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *22.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) I. Las notas de crédito/débito pueden emitirse válidamente hasta 36 meses después de la factura.\
  #pad(left: 36pt)[
    II. Las notas de crédito/débito no modifican el débito ni crédito fiscal de los períodos originales.
  ]
]

// ============================================================================
// SECCIONES 5 Y 6 DE PREGUNTAS (CASO CLÍNICO + EMPAREJAMIENTO SIN FONDOS)
// ============================================================================

#v(2pt)
#text(weight: "bold")[ITEMS AGRUPADOS POR CASO CLINICO O PROBLEMA]\
#v(-4pt)
#text(size: 9.5pt)[*Instrucciones:* El siguiente caso clinico o problema tendra varias preguntas. Seleccione la respuesta correcta en cada una.]
#v(2pt)

#rect(width: 100%, stroke: 0.75pt + black, fill: none, inset: 6pt, radius: 2pt)[
  #text(weight: "bold")[CASO N 1:
La empresa "Comercializadora del Valle S.R.L." fue objeto de fiscalización externa por la gestión fiscal 2024. El auditor evidenció: (a) compras de mercadería por Bs. 80.000 pagadas en efectivo con factura original, (b) gastos de viaje por Bs. 15.000 sin respaldo de pasajes ni rendición, y (c) omisión de registro de ventas por Bs. 40.000.]
]
#v(2pt)

#block(breakable: false, spacing: 3.5pt)[
  *23.*  ¿Qué determinación técnica y legal corresponde a la compra de Bs. 80.000 cancelada en efectivo?\
  #text(style: "italic", size: 9.5pt)[(Seleccione un solo inciso)]
  #v(0.8pt)
  #pad(left: 12pt)[
    A) Depuración del Crédito Fiscal IVA y gasto no deducible en IUE por falta de bancarización \
    B) Ninguna de las anteriores \
    C) Aceptación plena del Crédito Fiscal IVA y del gasto \
    D) Aceptación únicamente del gasto deducible \
    E) Sanción de 50 UFV por deberes formales únicamente \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *24.*  ¿Cuál es el tratamiento tributario de los gastos de viaje de Bs. 15.000 sin respaldo documental?\
  #text(style: "italic", size: 9.5pt)[(Seleccione un solo inciso)]
  #v(0.8pt)
  #pad(left: 12pt)[
    A) Todas las anteriores \
    B) Ajuste en la conciliación tributaria como gasto no deducible del IUE \
    C) Exención tributaria bajo el D.S. 24051 \
    D) Imputación a reserva legal estatutaria \
    E) Compensación automática con crédito fiscal \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *25.*  ¿Qué reparos tributarios genera la omisión de registro de ventas por Bs. 40.000?\
  #text(style: "italic", size: 9.5pt)[(Seleccione un solo inciso)]
  #v(0.8pt)
  #pad(left: 12pt)[
    A) Ninguna de las anteriores \
    B) Únicamente rectificatoria de libros de compras \
    C) Compensación automática con créditos acumulados \
    D) Determinación de oficio de Débito Fiscal IVA (13%), IT (3%) y mayor utilidad imponible de IUE (25%) \
    E) Exclusión de responsabilidad contable \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *26.*  ¿Qué calificación de conducta tributaria preliminar corresponde a las ventas no declaradas?\
  #text(style: "italic", size: 9.5pt)[(Seleccione un solo inciso)]
  #v(0.8pt)
  #pad(left: 12pt)[
    A) Todas las anteriores \
    B) Error involuntario de cálculo contable \
    C) Omisión de pago sujeta a sanción del 60% del tributo omitido o defraudación tributaria \
    D) Falta leve no sujeta a sanción económica \
    E) Prescripción automática del reparo fiscal \
  ]
]

#v(3pt)
#text(weight: "bold")[EMPAREJAMIENTO AMPLIADO]\
#v(-4pt)
#text(size: 9.5pt)[*Instrucciones:* De la lista de opciones, seleccione la respuesta correcta para cada enunciado.]
#v(2pt)

#rect(width: 100%, stroke: 0.75pt + black, fill: none, inset: 6pt, radius: 2pt)[
  #text(weight: "bold")[De la lista de opciones, seleccione la respuesta correcta para cada enunciado:]\
  #v(2pt)
  #pad(left: 10pt)[
    #text[
      A) RESOLUCIÓN DETERMINATIVA (Art. 99 Ley 2492)\
      B) VISTA DE CARGO (Art. 96 Ley 2492)\
      C) ORDEN DE FISCALIZACIÓN EXTERNA (OFE)\
      D) ACTA DE RECEPCIÓN FINAL DE DOCUMENTACIÓN\
      E) PROVEÍDO DE INICIO DE EJECUCIÓN TRIBUTARIA (PIET)
    ]
  ]
]
#v(3pt)

#block(breakable: false, spacing: 3.5pt)[
  *27.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Documento administrativo formal que notifica el inicio, alcance y funcionarios asignados a la auditoría tributaria.
]

#block(breakable: false, spacing: 3.5pt)[
  *28.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Acto administrativo preliminar que fija los hechos, reparos preliminares y otorga 30 días de plazo para descargos.
]

#block(breakable: false, spacing: 3.5pt)[
  *29.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Título administrativo final emitido por la Administración que liquida la deuda tributaria y califica sanciones.
]

#block(breakable: false, spacing: 3.5pt)[
  *30.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Acto administrativo que da inicio a la cobranza coactiva con embargo y retención de fondos bancarios.
]

#pagebreak(to: "odd")

// ============================================================================
// EXAMEN OFICIAL UNITEPC - MARÍA BELÉN QUISPE FLORES (ID: 8392104)
// VARIANTE ASIGNADA: TIPO B (CONFIDENCIAL)
// ============================================================================

#set page(
  width: 8.5in,
  height: 13in,
  margin: 2.0cm,
  footer: context [
    #grid(
      columns: (1fr, 1fr),
      align: (left + horizon, right + horizon),
      [
        #text(size: 8pt, fill: luma(80))[
          MARÍA BELÉN QUISPE FLORES \
          8392104
        ]
      ],
      [
        #text(size: 8pt, fill: luma(80))[
          Pág. #counter(page).display()
        ]
      ]
    )
  ]
)

#counter(page).update(1)

#set text(font: ("Arial", "Liberation Sans", "Helvetica"), size: 9pt)

// Cabecera Oficial (100% Horizontal)
#table(
  columns: (22%, 78%),
  stroke: 0.75pt + black,
  fill: none,
  inset: (x: 6pt, y: 4pt),
  align: (center + horizon, center + horizon),
  [
    #image("logo_unitepc_clean.png", width: 85%)
  ],
  [
    #text(weight: "bold", size: 10pt)[UNIVERSIDAD TÉCNICA PRIVADA COSMOS]\
    #text(weight: "bold", size: 9pt)[GESTIÓN 2-2026]\
    #v(-4pt)
    #line(length: 100%, stroke: 0.5pt + black)
    #v(-2.5pt)
    #text(weight: "bold", size: 9.5pt)[EVALUACIÓN TEÓRICA 1ER PARCIAL]
  ]
)

#v(-3pt)

// Datos del Estudiante (Sin fondos, código destacado en 16pt y firma en la misma fila)
#table(
  columns: (58%, 42%),
  stroke: 0.5pt + black,
  fill: none,
  inset: (x: 6pt, y: 3pt),
  [*NOMBRE:* MARÍA BELÉN QUISPE FLORES],
  [*CARRERA:* AUDITORÍA / CONTADURÍA],
  [*MATERIA:* [CPEC18] AUDITORÍA TRIBUTARIA],
  [*GRUPO:* TA-01 #h(10pt) *SEMESTRE:* 3],
  [*DOCENTE:* MAURICIO QUIROZ LAFUENTE],
  [*EXAMEN:* 1er Parcial · VARIANTE B],
  [*FECHA:* 22/08/2026],
  [*HORA:* 08:15:00 - 09:45:00],
  [
    *FIRMA DEL ESTUDIANTE:* \
    #v(12pt)
    #line(length: 100%, stroke: (dash: "dotted", thickness: 0.85pt))
  ],
  [
    *CÓDIGO:* \
    #v(-2pt)
    #align(center)[#text(size: 16pt, weight: "bold")[8392104]]
  ]
)

#v(3pt)
#text(size: 8.5pt)[*INSTRUCCIÓN DE COMPLETADO DE CARTILLA:* Rellene con cuidado la opción correcta con bolígrafo AZUL o NEGRO. Ejemplos: [● Correcto]  [X Incorrecto]  [- Incorrecto]  [O Incorrecto]]
#v(3pt)

// CARTILLA DE RESPUESTAS CON MARCADORES FIDUCIALES NEGROS EN SUS 4 ESQUINAS
#rect(width: 100%, stroke: 0.85pt + black, fill: none, inset: (x: 6pt, y: 5pt), radius: 0pt)[
  #place(top + left, dx: -6pt, dy: -5pt)[#rect(width: 10pt, height: 10pt, fill: black)]
  #place(top + right, dx: 6pt, dy: -5pt)[#rect(width: 10pt, height: 10pt, fill: black)]
  #place(bottom + left, dx: -6pt, dy: 5pt)[#rect(width: 10pt, height: 10pt, fill: black)]
  #place(bottom + right, dx: 6pt, dy: 5pt)[#rect(width: 10pt, height: 10pt, fill: black)]

  #align(center)[
    #text(weight: "bold", size: 9.5pt)[CARTILLA DE RESPUESTAS (1 A 60) — VARIANTE B]
  ]
  #v(-3pt)
  #grid(
    columns: (1fr, 1fr, 1fr, 1fr),
    column-gutter: 6pt,
    [
      #table(
        columns: (16%, 16.8%, 16.8%, 16.8%, 16.8%, 16.8%),
        stroke: none,
        inset: (x: 0pt, y: 5.2pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 8pt, weight: "bold")[1.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[2.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[3.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[4.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[5.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[6.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[7.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[8.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[9.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[10.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[11.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[12.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[13.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[14.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[15.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]]
      )
    ],
    [
      #table(
        columns: (16%, 16.8%, 16.8%, 16.8%, 16.8%, 16.8%),
        stroke: none,
        inset: (x: 0pt, y: 5.2pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 8pt, weight: "bold")[16.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[17.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[18.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[19.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[20.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[21.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[22.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[23.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[24.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[25.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[26.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[27.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[28.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[29.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[30.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]]
      )
    ],
    [
      #table(
        columns: (16%, 16.8%, 16.8%, 16.8%, 16.8%, 16.8%),
        stroke: none,
        inset: (x: 0pt, y: 5.2pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 8pt, weight: "bold")[31.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[32.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[33.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[34.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[35.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[36.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[37.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[38.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[39.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[40.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[41.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[42.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[43.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[44.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[45.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]]
      )
    ],
    [
      #table(
        columns: (16%, 16.8%, 16.8%, 16.8%, 16.8%, 16.8%),
        stroke: none,
        inset: (x: 0pt, y: 5.2pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 8pt, weight: "bold")[46.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[47.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[48.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[49.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[50.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[51.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[52.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[53.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[54.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[55.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[56.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[57.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[58.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[59.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[60.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]]
      )
    ]
  )
]

#pagebreak()

// ============================================================================
// HOJA 2: CUESTIONARIO DE PREGUNTAS (1 A 30)
// ============================================================================

#align(center)[
  #text(size: 11pt, weight: "bold")[CUESTIONARIO DE PREGUNTAS (30 REACTIVOS)]\
  #text(size: 9pt, fill: luma(80))[[CPEC18] AUDITORÍA TRIBUTARIA · EVALUACIÓN TEÓRICA 1ER PARCIAL · VARIANTE B]
]
#v(-2pt)
#line(length: 100%, stroke: 0.65pt + black)
#v(4pt)

// SECCIÓN 1: SELECCION DE LA MEJOR RESPUESTA (Preguntas 1 a 6)
#text(weight: "bold")[SELECCIÓN DE LA MEJOR RESPUESTA (Preguntas 1 a 6)]\
#v(-4pt)
#text(size: 8.5pt)[*Instrucciones:* Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.]
#v(2pt)

#block(breakable: false, spacing: 3.5pt)[
  *1.*  La alícuota general del Impuesto a las Transacciones (IT) según la Ley 843 es del:
  #v(0.6pt)
  #pad(left: 12pt)[
    A) Todas las anteriores \
    B) Ninguna de las anteriores \
    C) 13% sobre el valor neto de la factura \
    D) 3% sobre los ingresos brutos devengados o percibidos \
    E) 25% sobre la utilidad neta imponible \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *2.*  El método de determinación de la base imponible sobre base presunta procede cuando:
  #v(0.6pt)
  #pad(left: 12pt)[
    A) Se cuenta con estados financieros auditados limpios \
    B) Ninguna de las anteriores \
    C) El contribuyente presenta todos sus libros notariados \
    D) El sujeto pasivo no presenta libros ni documentación fidedigna \
    E) Todas las anteriores \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *3.*  En una auditoría tributaria, la técnica de confirmación de saldos con terceros verifica principalmente:
  #v(0.6pt)
  #pad(left: 12pt)[
    A) Existencia, integridad y exactitud de cuentas por cobrar y pagar \
    B) Todas las anteriores \
    C) Estructura societaria y tenencia accionaria \
    D) Ninguna de las anteriores \
    E) Capacidad de pago futura de la entidad \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *4.*  Para el cómputo del Crédito Fiscal IVA en compras de bienes y servicios, el documento fiscal debe:
  #v(0.6pt)
  #pad(left: 12pt)[
    A) Haber sido emitido exclusivamente en moneda extranjera \
    B) Todas las anteriores \
    C) Ser cancelado únicamente en efectivo \
    D) Ninguna de las anteriores \
    E) Estar vinculado a la actividad gravada y a nombre del sujeto pasivo \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *5.*  Según el Código Tributario Boliviano (Ley 2492), el término de prescripción de las facultades de fiscalización es de:
  #v(0.6pt)
  #pad(left: 12pt)[
    A) 4 años improrrogables \
    B) 2 años calendario continuos \
    C) Todas las anteriores \
    D) Ninguna de las anteriores \
    E) 8 años para tributos y contravenciones \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *6.*  Al final de cada proceso de auditoría tributaria para determinar la base imponible del IUE se debe:
  #v(0.6pt)
  #pad(left: 12pt)[
    A) Depreciar conforme a la tabla oficial del D.S. 24051 \
    B) Ninguna de las anteriores \
    C) Deducir únicamente las compras vinculadas a la actividad gravada \
    D) Excluir los gastos personales sin respaldo de factura legal \
    E) Todas las anteriores \
  ]
]

#pagebreak()

// ============================================================================
// HOJA 2: SECCIONES 2 A 6 DE PREGUNTAS
// ============================================================================

#v(2pt)
#text(weight: "bold")[VERDADERO O FALSO SIMPLE]\
#v(-4pt)
#text(size: 9.5pt)[*Instrucciones:* Marque A si el enunciado es verdadero o B si el enunciado es falso.]
#v(1.5pt)

#block(breakable: false, spacing: 3.2pt)[
  *7.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) La no emisión de factura mercantil amerita clausura directa e inmediata del establecimiento comercial.
]

#block(breakable: false, spacing: 3.2pt)[
  *8.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Las pérdidas fiscales no compensadas en el IUE pueden trasladarse sucesivamente hasta un máximo de cinco ejercicios posteriores.
]

#block(breakable: false, spacing: 3.2pt)[
  *9.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) El IUE efectivamente pagado se compensa contra el IT a partir del mismo mes en que fue cancelado.
]

#block(breakable: false, spacing: 3.2pt)[
  *10.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) La bancarización obligatoria aplica a transacciones iguales o superiores a Bs. 50.000 respaldadas con documentos de pago.
]

#block(breakable: false, spacing: 3.2pt)[
  *11.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Las donaciones a entidades sin fines de lucro autorizadas son deducibles hasta el límite del 10% de la utilidad neta.
]

#block(breakable: false, spacing: 3.2pt)[
  *12.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) El Impuesto al Valor Agregado (IVA) grava únicamente las ventas en efectivo y excluye las ventas al crédito.
]

#v(3pt)
#text(weight: "bold")[VERDADERO O FALSO COMPLEJAS]\
#v(-4pt)
#text(size: 9.5pt)[*Instrucciones:* Seleccione la opción correcta de acuerdo con la siguiente clave:\
#h(12pt) A: 1, 2 y 3 son verdaderas. #h(12pt) B: 1 y 3 son verdaderas. #h(12pt) C: 2 y 4 son verdaderas.\
#h(12pt) D: Solo 4 es verdadera. #h(12pt) E: Todas son verdaderas.]
#v(1.5pt)

#block(breakable: false, spacing: 3.2pt)[
  *13.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Seleccione los incisos verdaderos sobre las retenciones impositivas:
  #v(0.8pt)
  #pad(left: 16pt)[
    1. La retención por compra de bienes no respaldada es del 5% IUE y 3% IT. \
    2. La retención por contratación de servicios independientes es del 12.5% IUE y 3% IT. \
    3. El agente de retención es solidariamente responsable ante el fisco por el tributo no retenido. \
    4. Las entidades estatales no están obligadas a actuar como agentes de retención. \
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *14.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Seleccione los incisos verdaderos sobre los procedimientos de impugnación tributaria:
  #v(0.8pt)
  #pad(left: 16pt)[
    1. El Recurso de Alzada se interpone dentro de los 20 días siguientes a la notificación. \
    2. La interposición del Recurso Jerárquico suspende la ejecución tributaria. \
    3. La Autoridad General de Impugnación Tributaria (AGIT) resuelve en instancia final administrativa. \
    4. La demanda contenciosa administrativa es la única vía judicial de revisión. \
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *15.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Seleccione los incisos verdaderos sobre los regímenes tributarios:
  #v(0.8pt)
  #pad(left: 16pt)[
    1. El Régimen Tributario Simplificado emite factura válida para crédito fiscal. \
    2. Los comerciantes minoristas y artesanos pertenecen al Régimen Simplificado. \
    3. Las empresas unipersonales están exentas de presentar estados financieros. \
    4. El Sistema Integrado de Facturación en Línea es obligatorio para emisores masivos. \
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *16.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Seleccione los incisos verdaderos sobre la prescripción según Código Tributario (Ley 2492):
  #v(0.8pt)
  #pad(left: 16pt)[
    1. Las facultades de control y fiscalización prescriben a los 8 años. \
    2. La prescripción se suspende con la notificación de la Resolución Determinativa. \
    3. Las sanciones pecuniarias por contravenciones prescriben a los 5 años. \
    4. La prescripción debe ser alegada expresamente por el contribuyente. \
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *17.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Seleccione los incisos verdaderos sobre el Crédito Fiscal IVA:
  #v(0.8pt)
  #pad(left: 16pt)[
    1. Requiere factura original debidamente dosificada o electrónica. \
    2. Las compras de combustible computan el 100% de crédito fiscal. \
    3. Es obligatorio el medio fehaciente de pago para importes mayores a Bs. 50.000. \
    4. Procede crédito fiscal en gastos de uso particular de los accionistas. \
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *18.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Seleccione los incisos verdaderos sobre la deducibilidad del gasto en el IUE:
  #v(0.8pt)
  #pad(left: 16pt)[
    1. La deducibilidad del gasto exige documento mercantil original y vinculado a la actividad. \
    2. Las depreciaciones de vehículos se amortizan a una tasa máxima del 20% anual. \
    3. Los aportes patronales efectivamente devengados y cancelados son deducibles. \
    4. Las multas e intereses tributarios constituyen gastos no deducibles. \
  ]
]

#v(3pt)
#text(weight: "bold")[RESPUESTA A / B / AMBAS / NINGUNA]\
#v(-4pt)
#text(size: 9.5pt)[*Instrucciones:* Las siguientes preguntas están compuestas por dos premisas. Responda con:\
#h(12pt) A: si solo la primera premisa es verdadera. #h(12pt) B: si solo la segunda premisa es verdadera.\
#h(12pt) C: si ambas premisas son verdaderas. #h(12pt) D: si ninguna premisa es verdadera.]
#v(1.5pt)

#block(breakable: false, spacing: 3.2pt)[
  *19.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) I. Las notas de crédito/débito pueden emitirse válidamente hasta 36 meses después de la factura.\
  #pad(left: 36pt)[
    II. Las notas de crédito/débito no modifican el débito ni crédito fiscal de los períodos originales.
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *20.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) I. Las compras de combustible computan el 70% del valor facturado como crédito fiscal.\
  #pad(left: 36pt)[
    II. El 30% restante no computado para crédito fiscal es gasto deducible en el IUE.
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *21.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) I. La provisión para incobrables del 3% anual es acumulativa indefinidamente sin límite.\
  #pad(left: 36pt)[
    II. Los créditos incobrables deben contar con un año de mora y cobranza judicial iniciada.
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *22.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) I. El Impuesto a las Transacciones se calcula sobre los ingresos brutos devengados o percibidos.\
  #pad(left: 36pt)[
    II. El IT efectivamente pagado es deducible como gasto en el IUE cuando no ha sido compensado.
  ]
]

// ============================================================================
// SECCIONES 5 Y 6 DE PREGUNTAS (CASO CLÍNICO + EMPAREJAMIENTO SIN FONDOS)
// ============================================================================

#v(2pt)
#text(weight: "bold")[ITEMS AGRUPADOS POR CASO CLINICO O PROBLEMA]\
#v(-4pt)
#text(size: 9.5pt)[*Instrucciones:* El siguiente caso clinico o problema tendra varias preguntas. Seleccione la respuesta correcta en cada una.]
#v(2pt)

#rect(width: 100%, stroke: 0.75pt + black, fill: none, inset: 6pt, radius: 2pt)[
  #text(weight: "bold")[CASO N 1:
La empresa "Comercializadora del Valle S.R.L." fue objeto de fiscalización externa por la gestión fiscal 2024. El auditor evidenció: (a) compras de mercadería por Bs. 80.000 pagadas en efectivo con factura original, (b) gastos de viaje por Bs. 15.000 sin respaldo de pasajes ni rendición, y (c) omisión de registro de ventas por Bs. 40.000.]
]
#v(2pt)

#block(breakable: false, spacing: 3.5pt)[
  *23.*  ¿Qué calificación de conducta tributaria preliminar corresponde a las ventas no declaradas?\
  #text(style: "italic", size: 9.5pt)[(Seleccione un solo inciso)]
  #v(0.8pt)
  #pad(left: 12pt)[
    A) Prescripción automática del reparo fiscal \
    B) Omisión de pago sujeta a sanción del 60% del tributo omitido o defraudación tributaria \
    C) Falta leve no sujeta a sanción económica \
    D) Error involuntario de cálculo contable \
    E) Todas las anteriores \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *24.*  ¿Qué reparos tributarios genera la omisión de registro de ventas por Bs. 40.000?\
  #text(style: "italic", size: 9.5pt)[(Seleccione un solo inciso)]
  #v(0.8pt)
  #pad(left: 12pt)[
    A) Ninguna de las anteriores \
    B) Exclusión de responsabilidad contable \
    C) Compensación automática con créditos acumulados \
    D) Determinación de oficio de Débito Fiscal IVA (13%), IT (3%) y mayor utilidad imponible de IUE (25%) \
    E) Únicamente rectificatoria de libros de compras \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *25.*  ¿Cuál es el tratamiento tributario de los gastos de viaje de Bs. 15.000 sin respaldo documental?\
  #text(style: "italic", size: 9.5pt)[(Seleccione un solo inciso)]
  #v(0.8pt)
  #pad(left: 12pt)[
    A) Todas las anteriores \
    B) Imputación a reserva legal estatutaria \
    C) Compensación automática con crédito fiscal \
    D) Exención tributaria bajo el D.S. 24051 \
    E) Ajuste en la conciliación tributaria como gasto no deducible del IUE \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *26.*  ¿Qué determinación técnica y legal corresponde a la compra de Bs. 80.000 cancelada en efectivo?\
  #text(style: "italic", size: 9.5pt)[(Seleccione un solo inciso)]
  #v(0.8pt)
  #pad(left: 12pt)[
    A) Aceptación plena del Crédito Fiscal IVA y del gasto \
    B) Aceptación únicamente del gasto deducible \
    C) Sanción de 50 UFV por deberes formales únicamente \
    D) Depuración del Crédito Fiscal IVA y gasto no deducible en IUE por falta de bancarización \
    E) Ninguna de las anteriores \
  ]
]

#v(3pt)
#text(weight: "bold")[EMPAREJAMIENTO AMPLIADO]\
#v(-4pt)
#text(size: 9.5pt)[*Instrucciones:* De la lista de opciones, seleccione la respuesta correcta para cada enunciado.]
#v(2pt)

#rect(width: 100%, stroke: 0.75pt + black, fill: none, inset: 6pt, radius: 2pt)[
  #text(weight: "bold")[De la lista de opciones, seleccione la respuesta correcta para cada enunciado:]\
  #v(2pt)
  #pad(left: 10pt)[
    #text[
      A) RESOLUCIÓN DETERMINATIVA (Art. 99 Ley 2492)\
      B) VISTA DE CARGO (Art. 96 Ley 2492)\
      C) ORDEN DE FISCALIZACIÓN EXTERNA (OFE)\
      D) ACTA DE RECEPCIÓN FINAL DE DOCUMENTACIÓN\
      E) PROVEÍDO DE INICIO DE EJECUCIÓN TRIBUTARIA (PIET)
    ]
  ]
]
#v(3pt)

#block(breakable: false, spacing: 3.5pt)[
  *27.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Acto administrativo que da inicio a la cobranza coactiva con embargo y retención de fondos bancarios.
]

#block(breakable: false, spacing: 3.5pt)[
  *28.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Título administrativo final emitido por la Administración que liquida la deuda tributaria y califica sanciones.
]

#block(breakable: false, spacing: 3.5pt)[
  *29.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Acto administrativo preliminar que fija los hechos, reparos preliminares y otorga 30 días de plazo para descargos.
]

#block(breakable: false, spacing: 3.5pt)[
  *30.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Documento administrativo formal que notifica el inicio, alcance y funcionarios asignados a la auditoría tributaria.
]

#pagebreak(to: "odd")

// ============================================================================
// EXAMEN OFICIAL UNITEPC - RODRIGO ALEJANDRO CONDORI RODRÍGUEZ (ID: 6928103)
// VARIANTE ASIGNADA: TIPO A (CONFIDENCIAL)
// ============================================================================

#set page(
  width: 8.5in,
  height: 13in,
  margin: 2.0cm,
  footer: context [
    #grid(
      columns: (1fr, 1fr),
      align: (left + horizon, right + horizon),
      [
        #text(size: 8pt, fill: luma(80))[
          RODRIGO ALEJANDRO CONDORI RODRÍGUEZ \
          6928103
        ]
      ],
      [
        #text(size: 8pt, fill: luma(80))[
          Pág. #counter(page).display()
        ]
      ]
    )
  ]
)

#counter(page).update(1)

#set text(font: ("Arial", "Liberation Sans", "Helvetica"), size: 9pt)

// Cabecera Oficial (100% Horizontal)
#table(
  columns: (22%, 78%),
  stroke: 0.75pt + black,
  fill: none,
  inset: (x: 6pt, y: 4pt),
  align: (center + horizon, center + horizon),
  [
    #image("logo_unitepc_clean.png", width: 85%)
  ],
  [
    #text(weight: "bold", size: 10pt)[UNIVERSIDAD TÉCNICA PRIVADA COSMOS]\
    #text(weight: "bold", size: 9pt)[GESTIÓN 2-2026]\
    #v(-4pt)
    #line(length: 100%, stroke: 0.5pt + black)
    #v(-2.5pt)
    #text(weight: "bold", size: 9.5pt)[EVALUACIÓN TEÓRICA 1ER PARCIAL]
  ]
)

#v(-3pt)

// Datos del Estudiante (Sin fondos, código destacado en 16pt y firma en la misma fila)
#table(
  columns: (58%, 42%),
  stroke: 0.5pt + black,
  fill: none,
  inset: (x: 6pt, y: 3pt),
  [*NOMBRE:* RODRIGO ALEJANDRO CONDORI RODRÍGUEZ],
  [*CARRERA:* AUDITORÍA / CONTADURÍA],
  [*MATERIA:* [CPEC18] AUDITORÍA TRIBUTARIA],
  [*GRUPO:* TA-01 #h(10pt) *SEMESTRE:* 3],
  [*DOCENTE:* MAURICIO QUIROZ LAFUENTE],
  [*EXAMEN:* 1er Parcial · VARIANTE A],
  [*FECHA:* 22/08/2026],
  [*HORA:* 08:15:00 - 09:45:00],
  [
    *FIRMA DEL ESTUDIANTE:* \
    #v(12pt)
    #line(length: 100%, stroke: (dash: "dotted", thickness: 0.85pt))
  ],
  [
    *CÓDIGO:* \
    #v(-2pt)
    #align(center)[#text(size: 16pt, weight: "bold")[6928103]]
  ]
)

#v(3pt)
#text(size: 8.5pt)[*INSTRUCCIÓN DE COMPLETADO DE CARTILLA:* Rellene con cuidado la opción correcta con bolígrafo AZUL o NEGRO. Ejemplos: [● Correcto]  [X Incorrecto]  [- Incorrecto]  [O Incorrecto]]
#v(3pt)

// CARTILLA DE RESPUESTAS CON MARCADORES FIDUCIALES NEGROS EN SUS 4 ESQUINAS
#rect(width: 100%, stroke: 0.85pt + black, fill: none, inset: (x: 6pt, y: 5pt), radius: 0pt)[
  #place(top + left, dx: -6pt, dy: -5pt)[#rect(width: 10pt, height: 10pt, fill: black)]
  #place(top + right, dx: 6pt, dy: -5pt)[#rect(width: 10pt, height: 10pt, fill: black)]
  #place(bottom + left, dx: -6pt, dy: 5pt)[#rect(width: 10pt, height: 10pt, fill: black)]
  #place(bottom + right, dx: 6pt, dy: 5pt)[#rect(width: 10pt, height: 10pt, fill: black)]

  #align(center)[
    #text(weight: "bold", size: 9.5pt)[CARTILLA DE RESPUESTAS (1 A 60) — VARIANTE A]
  ]
  #v(-3pt)
  #grid(
    columns: (1fr, 1fr, 1fr, 1fr),
    column-gutter: 6pt,
    [
      #table(
        columns: (16%, 16.8%, 16.8%, 16.8%, 16.8%, 16.8%),
        stroke: none,
        inset: (x: 0pt, y: 5.2pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 8pt, weight: "bold")[1.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[2.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[3.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[4.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[5.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[6.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[7.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[8.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[9.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[10.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[11.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[12.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[13.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[14.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[15.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]]
      )
    ],
    [
      #table(
        columns: (16%, 16.8%, 16.8%, 16.8%, 16.8%, 16.8%),
        stroke: none,
        inset: (x: 0pt, y: 5.2pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 8pt, weight: "bold")[16.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[17.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[18.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[19.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[20.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[21.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[22.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[23.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[24.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[25.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[26.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[27.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[28.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[29.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[30.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]]
      )
    ],
    [
      #table(
        columns: (16%, 16.8%, 16.8%, 16.8%, 16.8%, 16.8%),
        stroke: none,
        inset: (x: 0pt, y: 5.2pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 8pt, weight: "bold")[31.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[32.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[33.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[34.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[35.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[36.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[37.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[38.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[39.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[40.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[41.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[42.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[43.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[44.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[45.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]]
      )
    ],
    [
      #table(
        columns: (16%, 16.8%, 16.8%, 16.8%, 16.8%, 16.8%),
        stroke: none,
        inset: (x: 0pt, y: 5.2pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 8pt, weight: "bold")[46.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[47.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[48.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[49.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[50.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[51.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[52.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[53.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[54.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[55.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[56.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[57.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[58.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[59.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        [#text(size: 8pt, weight: "bold")[60.]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
        [#circle(radius: 4.2pt, stroke: 0.5pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]]
      )
    ]
  )
]

#pagebreak()

// ============================================================================
// HOJA 2: CUESTIONARIO DE PREGUNTAS (1 A 30)
// ============================================================================

#align(center)[
  #text(size: 11pt, weight: "bold")[CUESTIONARIO DE PREGUNTAS (30 REACTIVOS)]\
  #text(size: 9pt, fill: luma(80))[[CPEC18] AUDITORÍA TRIBUTARIA · EVALUACIÓN TEÓRICA 1ER PARCIAL · VARIANTE A]
]
#v(-2pt)
#line(length: 100%, stroke: 0.65pt + black)
#v(4pt)

// SECCIÓN 1: SELECCION DE LA MEJOR RESPUESTA (Preguntas 1 a 6)
#text(weight: "bold")[SELECCIÓN DE LA MEJOR RESPUESTA (Preguntas 1 a 6)]\
#v(-4pt)
#text(size: 8.5pt)[*Instrucciones:* Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.]
#v(2pt)

#block(breakable: false, spacing: 3.5pt)[
  *1.*  Al final de cada proceso de auditoría tributaria para determinar la base imponible del IUE se debe:
  #v(0.6pt)
  #pad(left: 12pt)[
    A) Excluir los gastos personales sin respaldo de factura legal \
    B) Ninguna de las anteriores \
    C) Deducir únicamente las compras vinculadas a la actividad gravada \
    D) Depreciar conforme a la tabla oficial del D.S. 24051 \
    E) Todas las anteriores \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *2.*  Según el Código Tributario Boliviano (Ley 2492), el término de prescripción de las facultades de fiscalización es de:
  #v(0.6pt)
  #pad(left: 12pt)[
    A) 2 años calendario continuos \
    B) Ninguna de las anteriores \
    C) Todas las anteriores \
    D) 4 años improrrogables \
    E) 8 años para tributos y contravenciones \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *3.*  Para el cómputo del Crédito Fiscal IVA en compras de bienes y servicios, el documento fiscal debe:
  #v(0.6pt)
  #pad(left: 12pt)[
    A) Todas las anteriores \
    B) Ninguna de las anteriores \
    C) Ser cancelado únicamente en efectivo \
    D) Estar vinculado a la actividad gravada y a nombre del sujeto pasivo \
    E) Haber sido emitido exclusivamente en moneda extranjera \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *4.*  En una auditoría tributaria, la técnica de confirmación de saldos con terceros verifica principalmente:
  #v(0.6pt)
  #pad(left: 12pt)[
    A) Estructura societaria y tenencia accionaria \
    B) Todas las anteriores \
    C) Capacidad de pago futura de la entidad \
    D) Ninguna de las anteriores \
    E) Existencia, integridad y exactitud de cuentas por cobrar y pagar \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *5.*  El método de determinación de la base imponible sobre base presunta procede cuando:
  #v(0.6pt)
  #pad(left: 12pt)[
    A) Se cuenta con estados financieros auditados limpios \
    B) El sujeto pasivo no presenta libros ni documentación fidedigna \
    C) Ninguna de las anteriores \
    D) Todas las anteriores \
    E) El contribuyente presenta todos sus libros notariados \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *6.*  La alícuota general del Impuesto a las Transacciones (IT) según la Ley 843 es del:
  #v(0.6pt)
  #pad(left: 12pt)[
    A) Ninguna de las anteriores \
    B) 3% sobre los ingresos brutos devengados o percibidos \
    C) Todas las anteriores \
    D) 13% sobre el valor neto de la factura \
    E) 25% sobre la utilidad neta imponible \
  ]
]

#pagebreak()

// ============================================================================
// HOJA 2: SECCIONES 2 A 6 DE PREGUNTAS
// ============================================================================

#v(2pt)
#text(weight: "bold")[VERDADERO O FALSO SIMPLE]\
#v(-4pt)
#text(size: 9.5pt)[*Instrucciones:* Marque A si el enunciado es verdadero o B si el enunciado es falso.]
#v(1.5pt)

#block(breakable: false, spacing: 3.2pt)[
  *7.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) El Impuesto al Valor Agregado (IVA) grava únicamente las ventas en efectivo y excluye las ventas al crédito.
]

#block(breakable: false, spacing: 3.2pt)[
  *8.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Las donaciones a entidades sin fines de lucro autorizadas son deducibles hasta el límite del 10% de la utilidad neta.
]

#block(breakable: false, spacing: 3.2pt)[
  *9.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) La bancarización obligatoria aplica a transacciones iguales o superiores a Bs. 50.000 respaldadas con documentos de pago.
]

#block(breakable: false, spacing: 3.2pt)[
  *10.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) El IUE efectivamente pagado se compensa contra el IT a partir del mismo mes en que fue cancelado.
]

#block(breakable: false, spacing: 3.2pt)[
  *11.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Las pérdidas fiscales no compensadas en el IUE pueden trasladarse sucesivamente hasta un máximo de cinco ejercicios posteriores.
]

#block(breakable: false, spacing: 3.2pt)[
  *12.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) La no emisión de factura mercantil amerita clausura directa e inmediata del establecimiento comercial.
]

#v(3pt)
#text(weight: "bold")[VERDADERO O FALSO COMPLEJAS]\
#v(-4pt)
#text(size: 9.5pt)[*Instrucciones:* Seleccione la opción correcta de acuerdo con la siguiente clave:\
#h(12pt) A: 1, 2 y 3 son verdaderas. #h(12pt) B: 1 y 3 son verdaderas. #h(12pt) C: 2 y 4 son verdaderas.\
#h(12pt) D: Solo 4 es verdadera. #h(12pt) E: Todas son verdaderas.]
#v(1.5pt)

#block(breakable: false, spacing: 3.2pt)[
  *13.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Seleccione los incisos verdaderos sobre la deducibilidad del gasto en el IUE:
  #v(0.8pt)
  #pad(left: 16pt)[
    1. La deducibilidad del gasto exige documento mercantil original y vinculado a la actividad. \
    2. Las depreciaciones de vehículos se amortizan a una tasa máxima del 20% anual. \
    3. Los aportes patronales efectivamente devengados y cancelados son deducibles. \
    4. Las multas e intereses tributarios constituyen gastos no deducibles. \
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *14.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Seleccione los incisos verdaderos sobre el Crédito Fiscal IVA:
  #v(0.8pt)
  #pad(left: 16pt)[
    1. Requiere factura original debidamente dosificada o electrónica. \
    2. Las compras de combustible computan el 100% de crédito fiscal. \
    3. Es obligatorio el medio fehaciente de pago para importes mayores a Bs. 50.000. \
    4. Procede crédito fiscal en gastos de uso particular de los accionistas. \
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *15.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Seleccione los incisos verdaderos sobre la prescripción según Código Tributario (Ley 2492):
  #v(0.8pt)
  #pad(left: 16pt)[
    1. Las facultades de control y fiscalización prescriben a los 8 años. \
    2. La prescripción se suspende con la notificación de la Resolución Determinativa. \
    3. Las sanciones pecuniarias por contravenciones prescriben a los 5 años. \
    4. La prescripción debe ser alegada expresamente por el contribuyente. \
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *16.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Seleccione los incisos verdaderos sobre los regímenes tributarios:
  #v(0.8pt)
  #pad(left: 16pt)[
    1. El Régimen Tributario Simplificado emite factura válida para crédito fiscal. \
    2. Los comerciantes minoristas y artesanos pertenecen al Régimen Simplificado. \
    3. Las empresas unipersonales están exentas de presentar estados financieros. \
    4. El Sistema Integrado de Facturación en Línea es obligatorio para emisores masivos. \
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *17.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Seleccione los incisos verdaderos sobre los procedimientos de impugnación tributaria:
  #v(0.8pt)
  #pad(left: 16pt)[
    1. El Recurso de Alzada se interpone dentro de los 20 días siguientes a la notificación. \
    2. La interposición del Recurso Jerárquico suspende la ejecución tributaria. \
    3. La Autoridad General de Impugnación Tributaria (AGIT) resuelve en instancia final administrativa. \
    4. La demanda contenciosa administrativa es la única vía judicial de revisión. \
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *18.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Seleccione los incisos verdaderos sobre las retenciones impositivas:
  #v(0.8pt)
  #pad(left: 16pt)[
    1. La retención por compra de bienes no respaldada es del 5% IUE y 3% IT. \
    2. La retención por contratación de servicios independientes es del 12.5% IUE y 3% IT. \
    3. El agente de retención es solidariamente responsable ante el fisco por el tributo no retenido. \
    4. Las entidades estatales no están obligadas a actuar como agentes de retención. \
  ]
]

#v(3pt)
#text(weight: "bold")[RESPUESTA A / B / AMBAS / NINGUNA]\
#v(-4pt)
#text(size: 9.5pt)[*Instrucciones:* Las siguientes preguntas están compuestas por dos premisas. Responda con:\
#h(12pt) A: si solo la primera premisa es verdadera. #h(12pt) B: si solo la segunda premisa es verdadera.\
#h(12pt) C: si ambas premisas son verdaderas. #h(12pt) D: si ninguna premisa es verdadera.]
#v(1.5pt)

#block(breakable: false, spacing: 3.2pt)[
  *19.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) I. El Impuesto a las Transacciones se calcula sobre los ingresos brutos devengados o percibidos.\
  #pad(left: 36pt)[
    II. El IT efectivamente pagado es deducible como gasto en el IUE cuando no ha sido compensado.
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *20.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) I. La provisión para incobrables del 3% anual es acumulativa indefinidamente sin límite.\
  #pad(left: 36pt)[
    II. Los créditos incobrables deben contar con un año de mora y cobranza judicial iniciada.
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *21.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) I. Las compras de combustible computan el 70% del valor facturado como crédito fiscal.\
  #pad(left: 36pt)[
    II. El 30% restante no computado para crédito fiscal es gasto deducible en el IUE.
  ]
]

#block(breakable: false, spacing: 3.2pt)[
  *22.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) I. Las notas de crédito/débito pueden emitirse válidamente hasta 36 meses después de la factura.\
  #pad(left: 36pt)[
    II. Las notas de crédito/débito no modifican el débito ni crédito fiscal de los períodos originales.
  ]
]

// ============================================================================
// SECCIONES 5 Y 6 DE PREGUNTAS (CASO CLÍNICO + EMPAREJAMIENTO SIN FONDOS)
// ============================================================================

#v(2pt)
#text(weight: "bold")[ITEMS AGRUPADOS POR CASO CLINICO O PROBLEMA]\
#v(-4pt)
#text(size: 9.5pt)[*Instrucciones:* El siguiente caso clinico o problema tendra varias preguntas. Seleccione la respuesta correcta en cada una.]
#v(2pt)

#rect(width: 100%, stroke: 0.75pt + black, fill: none, inset: 6pt, radius: 2pt)[
  #text(weight: "bold")[CASO N 1:
La empresa "Comercializadora del Valle S.R.L." fue objeto de fiscalización externa por la gestión fiscal 2024. El auditor evidenció: (a) compras de mercadería por Bs. 80.000 pagadas en efectivo con factura original, (b) gastos de viaje por Bs. 15.000 sin respaldo de pasajes ni rendición, y (c) omisión de registro de ventas por Bs. 40.000.]
]
#v(2pt)

#block(breakable: false, spacing: 3.5pt)[
  *23.*  ¿Qué determinación técnica y legal corresponde a la compra de Bs. 80.000 cancelada en efectivo?\
  #text(style: "italic", size: 9.5pt)[(Seleccione un solo inciso)]
  #v(0.8pt)
  #pad(left: 12pt)[
    A) Depuración del Crédito Fiscal IVA y gasto no deducible en IUE por falta de bancarización \
    B) Ninguna de las anteriores \
    C) Aceptación plena del Crédito Fiscal IVA y del gasto \
    D) Aceptación únicamente del gasto deducible \
    E) Sanción de 50 UFV por deberes formales únicamente \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *24.*  ¿Cuál es el tratamiento tributario de los gastos de viaje de Bs. 15.000 sin respaldo documental?\
  #text(style: "italic", size: 9.5pt)[(Seleccione un solo inciso)]
  #v(0.8pt)
  #pad(left: 12pt)[
    A) Todas las anteriores \
    B) Ajuste en la conciliación tributaria como gasto no deducible del IUE \
    C) Exención tributaria bajo el D.S. 24051 \
    D) Imputación a reserva legal estatutaria \
    E) Compensación automática con crédito fiscal \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *25.*  ¿Qué reparos tributarios genera la omisión de registro de ventas por Bs. 40.000?\
  #text(style: "italic", size: 9.5pt)[(Seleccione un solo inciso)]
  #v(0.8pt)
  #pad(left: 12pt)[
    A) Ninguna de las anteriores \
    B) Únicamente rectificatoria de libros de compras \
    C) Compensación automática con créditos acumulados \
    D) Determinación de oficio de Débito Fiscal IVA (13%), IT (3%) y mayor utilidad imponible de IUE (25%) \
    E) Exclusión de responsabilidad contable \
  ]
]

#block(breakable: false, spacing: 3.5pt)[
  *26.*  ¿Qué calificación de conducta tributaria preliminar corresponde a las ventas no declaradas?\
  #text(style: "italic", size: 9.5pt)[(Seleccione un solo inciso)]
  #v(0.8pt)
  #pad(left: 12pt)[
    A) Todas las anteriores \
    B) Error involuntario de cálculo contable \
    C) Omisión de pago sujeta a sanción del 60% del tributo omitido o defraudación tributaria \
    D) Falta leve no sujeta a sanción económica \
    E) Prescripción automática del reparo fiscal \
  ]
]

#v(3pt)
#text(weight: "bold")[EMPAREJAMIENTO AMPLIADO]\
#v(-4pt)
#text(size: 9.5pt)[*Instrucciones:* De la lista de opciones, seleccione la respuesta correcta para cada enunciado.]
#v(2pt)

#rect(width: 100%, stroke: 0.75pt + black, fill: none, inset: 6pt, radius: 2pt)[
  #text(weight: "bold")[De la lista de opciones, seleccione la respuesta correcta para cada enunciado:]\
  #v(2pt)
  #pad(left: 10pt)[
    #text[
      A) RESOLUCIÓN DETERMINATIVA (Art. 99 Ley 2492)\
      B) VISTA DE CARGO (Art. 96 Ley 2492)\
      C) ORDEN DE FISCALIZACIÓN EXTERNA (OFE)\
      D) ACTA DE RECEPCIÓN FINAL DE DOCUMENTACIÓN\
      E) PROVEÍDO DE INICIO DE EJECUCIÓN TRIBUTARIA (PIET)
    ]
  ]
]
#v(3pt)

#block(breakable: false, spacing: 3.5pt)[
  *27.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Documento administrativo formal que notifica el inicio, alcance y funcionarios asignados a la auditoría tributaria.
]

#block(breakable: false, spacing: 3.5pt)[
  *28.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Acto administrativo preliminar que fija los hechos, reparos preliminares y otorga 30 días de plazo para descargos.
]

#block(breakable: false, spacing: 3.5pt)[
  *29.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Título administrativo final emitido por la Administración que liquida la deuda tributaria y califica sanciones.
]

#block(breakable: false, spacing: 3.5pt)[
  *30.* #h(2pt) #box(stroke: (bottom: 0.85pt), width: 24pt)[] #h(8pt) Acto administrativo que da inicio a la cobranza coactiva con embargo y retención de fondos bancarios.
]
