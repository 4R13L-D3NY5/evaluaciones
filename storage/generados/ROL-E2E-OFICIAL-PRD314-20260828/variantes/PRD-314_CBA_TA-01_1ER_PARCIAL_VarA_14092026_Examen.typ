#set page(
  paper: "us-letter",
  margin: (x: 1.5cm, top: 0.85cm, bottom: 0.85cm),
  header: context {
    let p = counter(page).get().first()
    if p > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [#text(size: 8pt, fill: luma(90))[VARIANTE TIPO A · #text(font: "Courier", weight: "bold")[0000000]]],
        [#text(size: 8pt, fill: luma(90))[Pág. #p]]
      )
      v(-4pt)
      line(length: 100%, stroke: 0.4pt + luma(150))
    }
  },
  footer: none
)

#set text(
  font: "Liberation Sans",
  size: 8.5pt,
  lang: "es"
)

#show par: set block(spacing: 0.45em)

// PÁGINA 1: CABECERA INSTITUCIONAL + DATOS + CARTILLA OMR
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
    #text(weight: "bold", size: 10pt)[UNIVERSIDAD TECNICA PRIVADA COSMOS]\
    #text(weight: "bold", size: 9pt)[GESTION 2-2026]
    #v(-2pt)
    #line(length: 90%, stroke: 0.5pt + black)
    #v(-2.5pt)
    #text(weight: "bold")[EVALUACION TEORICA 1ER PARCIAL]
  ]
)

#v(-5pt)

#table(
  columns: (58%, 42%),
  stroke: 0.5pt + black,
  fill: none,
  inset: (x: 5pt, y: 2.2pt),
  [*NOMBRE:* VARIANTE TIPO A],
  [*CARRERA:* PROTESIS DENTAL],
  [*MATERIA:* [PRD-314] DISEÑO Y ADMINISTRACIÓN DE LABORATORIO DENTAL],
  [*GRUPO:* TA-01 #h(10pt) *SEMESTRE:* 5],
  [*DOCENTE:* DOCENTE SEA (CI 3146045)],
  [*EXAMEN:* 1ER PARCIAL · VARIANTE A],
  [*FECHA:* 14/09/2026],
  [*HORA:* 08:15 - 09:45],
  [
    *FIRMA DEL ESTUDIANTE:* \
    #v(10pt)
    #line(length: 100%, stroke: (dash: "dotted", thickness: 0.85pt))
  ],
  [
    *CODIGO:* \
    #v(-2pt)
    #align(center)[#text(size: 18pt, weight: "bold")[0000000]]
  ]
)

#v(1.5pt)
#text(size: 9pt)[*INSTRUCCION DE COMPLETADO DE CARTILLA:* Debe rellenar con cuidado la opción que considere correcta en la Cartilla con lapicero de color AZUL o NEGRO.]
#v(1.5pt)

#rect(width: 100%, stroke: 0.85pt + black, fill: none, inset: (x: 4pt, y: 2.5pt), radius: 2pt)[
  #align(center)[
    #text(weight: "bold", size: 9pt)[CARTILLA DE RESPUESTAS (1 A 60) --- VARIANTE A]
  ]
  #v(-3pt)
  #grid(
    columns: (25%, 25%, 25%, 25%),
    column-gutter: 3pt,
    [
      #table(
        columns: (22%, 15.6%, 15.6%, 15.6%, 15.6%, 15.6%),
        stroke: none,
        inset: (x: 0pt, y: 2.8pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 7.0pt, weight: "bold")[1.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[2.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[3.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[4.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[5.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[6.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[7.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[8.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[9.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[10.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[11.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[12.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[13.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[14.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[15.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]]
      )
    ],
    [
      #table(
        columns: (22%, 15.6%, 15.6%, 15.6%, 15.6%, 15.6%),
        stroke: none,
        inset: (x: 0pt, y: 2.8pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 7.0pt, weight: "bold")[16.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[17.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[18.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[19.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[20.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[21.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[22.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[23.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[24.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[25.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[26.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[27.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[28.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[29.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[30.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]]
      )
    ],
    [
      #table(
        columns: (22%, 15.6%, 15.6%, 15.6%, 15.6%, 15.6%),
        stroke: none,
        inset: (x: 0pt, y: 2.8pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 7.0pt, weight: "bold")[31.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[32.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[33.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[34.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[35.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[36.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[37.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[38.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[39.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[40.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[41.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[42.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[43.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[44.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[45.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]]
      )
    ],
    [
      #table(
        columns: (22%, 15.6%, 15.6%, 15.6%, 15.6%, 15.6%),
        stroke: none,
        inset: (x: 0pt, y: 2.8pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 7.0pt, weight: "bold")[46.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[47.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[48.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[49.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[50.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[51.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[52.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[53.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[54.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[55.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[56.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[57.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[58.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[59.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.0pt, weight: "bold")[60.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]]
      )
    ]
  )
]

#pagebreak()

// PÁGINAS SIGUIENTES: CUESTIONARIO
#align(center)[
  #text(size: 11pt, weight: "bold")[CUESTIONARIO DE PREGUNTAS (30 REACTIVOS)]\
  #text(size: 9pt, weight: "bold", fill: luma(60))[[PRD-314] DISEÑO Y ADMINISTRACIÓN DE LABORATORIO DENTAL · EVALUACIÓN TEÓRICA 1ER PARCIAL · VARIANTE A]
]

#v(-3pt)
#line(length: 100%, stroke: 0.75pt + black)
#v(3pt)

#v(4pt)
#text(weight: "bold", size: 9.5pt)[SELECCIÓN DE LA MEJOR RESPUESTA]\
#text(size: 8pt, style: "italic")[Instrucciones: Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.]
#v(1.5pt)

#block(spacing: 3.5pt)[
  *1.* #raw("Pregunta Fácil 3: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)
  #h(10pt) *A)* #raw("Cifrado de datos", block: false)\
  #h(10pt) *B)* #raw("Direccionamiento físico (MAC) y control de flujo", block: false)\
  #h(10pt) *C)* #raw("Compresión", block: false)\
  #h(10pt) *D)* #raw("Control de sesiones", block: false)\
  #h(10pt) *E)* #raw("Enrutamiento de paquetes", block: false)\
]

#block(spacing: 3.5pt)[
  *2.* #raw("Pregunta Fácil 15: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)
  #h(10pt) *A)* #raw("Direccionamiento físico (MAC) y control de flujo", block: false)\
  #h(10pt) *B)* #raw("Control de sesiones", block: false)\
  #h(10pt) *C)* #raw("Cifrado de datos", block: false)\
  #h(10pt) *D)* #raw("Enrutamiento de paquetes", block: false)\
  #h(10pt) *E)* #raw("Compresión", block: false)\
]

#block(spacing: 3.5pt)[
  *3.* #raw("Pregunta Fácil 7: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)
  #h(10pt) *A)* #raw("Compresión", block: false)\
  #h(10pt) *B)* #raw("Control de sesiones", block: false)\
  #h(10pt) *C)* #raw("Direccionamiento físico (MAC) y control de flujo", block: false)\
  #h(10pt) *D)* #raw("Cifrado de datos", block: false)\
  #h(10pt) *E)* #raw("Enrutamiento de paquetes", block: false)\
]

#block(spacing: 3.5pt)[
  *4.* #raw("Pregunta Fácil 11: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)
  #h(10pt) *A)* #raw("Compresión", block: false)\
  #h(10pt) *B)* #raw("Direccionamiento físico (MAC) y control de flujo", block: false)\
  #h(10pt) *C)* #raw("Cifrado de datos", block: false)\
  #h(10pt) *D)* #raw("Enrutamiento de paquetes", block: false)\
  #h(10pt) *E)* #raw("Control de sesiones", block: false)\
]

#block(spacing: 3.5pt)[
  *5.* #raw("Pregunta Difícil 6: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)
  #h(10pt) *A)* #raw("80 Mbps", block: false)\
  #h(10pt) *B)* #raw("64 Mbps", block: false)\
  #h(10pt) *C)* #raw("160 Mbps", block: false)\
  #h(10pt) *D)* #raw("106.6 Mbps", block: false)\
  #h(10pt) *E)* #raw("128 Mbps", block: false)\
]

#block(spacing: 3.5pt)[
  *6.* #raw("Pregunta Difícil 13: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)
  #h(10pt) *A)* #raw("106.6 Mbps", block: false)\
  #h(10pt) *B)* #raw("128 Mbps", block: false)\
  #h(10pt) *C)* #raw("80 Mbps", block: false)\
  #h(10pt) *D)* #raw("160 Mbps", block: false)\
  #h(10pt) *E)* #raw("64 Mbps", block: false)\
]

#block(spacing: 3.5pt)[
  *7.* #raw("Pregunta Difícil 11: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)
  #h(10pt) *A)* #raw("64 Mbps", block: false)\
  #h(10pt) *B)* #raw("106.6 Mbps", block: false)\
  #h(10pt) *C)* #raw("160 Mbps", block: false)\
  #h(10pt) *D)* #raw("128 Mbps", block: false)\
  #h(10pt) *E)* #raw("80 Mbps", block: false)\
]

#block(spacing: 3.5pt)[
  *8.* #raw("Pregunta Difícil 7: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)
  #h(10pt) *A)* #raw("128 Mbps", block: false)\
  #h(10pt) *B)* #raw("160 Mbps", block: false)\
  #h(10pt) *C)* #raw("64 Mbps", block: false)\
  #h(10pt) *D)* #raw("80 Mbps", block: false)\
  #h(10pt) *E)* #raw("106.6 Mbps", block: false)\
]

#block(spacing: 3.5pt)[
  *9.* #raw("Pregunta Difícil 14: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)
  #h(10pt) *A)* #raw("80 Mbps", block: false)\
  #h(10pt) *B)* #raw("64 Mbps", block: false)\
  #h(10pt) *C)* #raw("160 Mbps", block: false)\
  #h(10pt) *D)* #raw("128 Mbps", block: false)\
  #h(10pt) *E)* #raw("106.6 Mbps", block: false)\
]

#v(4pt)
#text(weight: "bold", size: 9.5pt)[FALSO O VERDADERO]\
#text(size: 8pt, style: "italic")[Instrucciones: Determine si cada afirmación es verdadera (A) o falsa (B).]
#v(1.5pt)

#block(spacing: 3.5pt)[
  *10.* #raw("Pregunta Fácil 8: La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.", block: false)
  #h(10pt) *A)* #raw("Verdadero", block: false)\
  #h(10pt) *B)* #raw("Falso", block: false)\
]

#block(spacing: 3.5pt)[
  *11.* #raw("Pregunta Fácil 14: La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.", block: false)
  #h(10pt) *A)* #raw("Verdadero", block: false)\
  #h(10pt) *B)* #raw("Falso", block: false)\
]

#block(spacing: 3.5pt)[
  *12.* #raw("Pregunta Fácil 6: La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.", block: false)
  #h(10pt) *A)* #raw("Falso", block: false)\
  #h(10pt) *B)* #raw("Verdadero", block: false)\
]

#v(4pt)
#text(weight: "bold", size: 9.5pt)[PREMISAS A / B / AMBAS / NINGUNA]\
#text(size: 8pt, style: "italic")[Instrucciones: Analice las dos premisas planteadas y elija la opción correcta.]
#v(1.5pt)

#block(spacing: 3.5pt)[
  *13.* #raw("Pregunta Media 26: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)
  #h(10pt) *A)* #raw("A. Si la primera es verdadera", block: false)\
  #h(10pt) *B)* #raw("B. Si la segunda es verdadera", block: false)\
  #h(10pt) *C)* #raw("C. Si ambas son verdaderas", block: false)\
  #h(10pt) *D)* #raw("D. Si ninguna es verdadera", block: false)\
]

#block(spacing: 3.5pt)[
  *14.* #raw("Pregunta Media 4: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)
  #h(10pt) *A)* #raw("D. Si ninguna es verdadera", block: false)\
  #h(10pt) *B)* #raw("B. Si la segunda es verdadera", block: false)\
  #h(10pt) *C)* #raw("C. Si ambas son verdaderas", block: false)\
  #h(10pt) *D)* #raw("A. Si la primera es verdadera", block: false)\
]

#block(spacing: 3.5pt)[
  *15.* #raw("Pregunta Media 18: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)
  #h(10pt) *A)* #raw("D. Si ninguna es verdadera", block: false)\
  #h(10pt) *B)* #raw("A. Si la primera es verdadera", block: false)\
  #h(10pt) *C)* #raw("C. Si ambas son verdaderas", block: false)\
  #h(10pt) *D)* #raw("B. Si la segunda es verdadera", block: false)\
]

#block(spacing: 3.5pt)[
  *16.* #raw("Pregunta Media 28: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)
  #h(10pt) *A)* #raw("B. Si la segunda es verdadera", block: false)\
  #h(10pt) *B)* #raw("D. Si ninguna es verdadera", block: false)\
  #h(10pt) *C)* #raw("A. Si la primera es verdadera", block: false)\
  #h(10pt) *D)* #raw("C. Si ambas son verdaderas", block: false)\
]

#block(spacing: 3.5pt)[
  *17.* #raw("Pregunta Media 24: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)
  #h(10pt) *A)* #raw("B. Si la segunda es verdadera", block: false)\
  #h(10pt) *B)* #raw("D. Si ninguna es verdadera", block: false)\
  #h(10pt) *C)* #raw("A. Si la primera es verdadera", block: false)\
  #h(10pt) *D)* #raw("C. Si ambas son verdaderas", block: false)\
]

#block(spacing: 3.5pt)[
  *18.* #raw("Pregunta Media 2: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)
  #h(10pt) *A)* #raw("D. Si ninguna es verdadera", block: false)\
  #h(10pt) *B)* #raw("C. Si ambas son verdaderas", block: false)\
  #h(10pt) *C)* #raw("A. Si la primera es verdadera", block: false)\
  #h(10pt) *D)* #raw("B. Si la segunda es verdadera", block: false)\
]

#block(spacing: 3.5pt)[
  *19.* #raw("Pregunta Media 8: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)
  #h(10pt) *A)* #raw("C. Si ambas son verdaderas", block: false)\
  #h(10pt) *B)* #raw("A. Si la primera es verdadera", block: false)\
  #h(10pt) *C)* #raw("D. Si ninguna es verdadera", block: false)\
  #h(10pt) *D)* #raw("B. Si la segunda es verdadera", block: false)\
]

#block(spacing: 3.5pt)[
  *20.* #raw("Pregunta Media 10: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)
  #h(10pt) *A)* #raw("D. Si ninguna es verdadera", block: false)\
  #h(10pt) *B)* #raw("B. Si la segunda es verdadera", block: false)\
  #h(10pt) *C)* #raw("A. Si la primera es verdadera", block: false)\
  #h(10pt) *D)* #raw("C. Si ambas son verdaderas", block: false)\
]

#block(spacing: 3.5pt)[
  *21.* #raw("Pregunta Media 20: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)
  #h(10pt) *A)* #raw("C. Si ambas son verdaderas", block: false)\
  #h(10pt) *B)* #raw("D. Si ninguna es verdadera", block: false)\
  #h(10pt) *C)* #raw("A. Si la primera es verdadera", block: false)\
  #h(10pt) *D)* #raw("B. Si la segunda es verdadera", block: false)\
]

#v(4pt)
#text(weight: "bold", size: 9.5pt)[PREGUNTAS CON CLAVE DE RESPUESTA]\
#text(size: 8pt, style: "italic")[Instrucciones: Marque: A si 1, 2 y 3 son correctas; B si 1 y 3; C si 2 y 4; D si solo 4; E si todas son correctas.]
#v(1.5pt)

#block(spacing: 3.5pt)[
  *22.* #raw("Pregunta Media 17: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)
  #h(10pt) *A)* #raw("Todas son correctas", block: false)\
  #h(10pt) *B)* #raw("Solo 4 es correcta", block: false)\
  #h(10pt) *C)* #raw("2 y 4 son correctas", block: false)\
  #h(10pt) *D)* #raw("1 y 3 son correctas", block: false)\
  #h(10pt) *E)* #raw("1, 2 y 3 son correctas", block: false)\
]

#block(spacing: 3.5pt)[
  *23.* #raw("Pregunta Media 3: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)
  #h(10pt) *A)* #raw("1, 2 y 3 son correctas", block: false)\
  #h(10pt) *B)* #raw("Solo 4 es correcta", block: false)\
  #h(10pt) *C)* #raw("2 y 4 son correctas", block: false)\
  #h(10pt) *D)* #raw("1 y 3 son correctas", block: false)\
  #h(10pt) *E)* #raw("Todas son correctas", block: false)\
]

#block(spacing: 3.5pt)[
  *24.* #raw("Pregunta Media 15: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)
  #h(10pt) *A)* #raw("Solo 4 es correcta", block: false)\
  #h(10pt) *B)* #raw("1 y 3 son correctas", block: false)\
  #h(10pt) *C)* #raw("Todas son correctas", block: false)\
  #h(10pt) *D)* #raw("2 y 4 son correctas", block: false)\
  #h(10pt) *E)* #raw("1, 2 y 3 son correctas", block: false)\
]

#block(spacing: 3.5pt)[
  *25.* #raw("Pregunta Media 9: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)
  #h(10pt) *A)* #raw("1 y 3 son correctas", block: false)\
  #h(10pt) *B)* #raw("Todas son correctas", block: false)\
  #h(10pt) *C)* #raw("Solo 4 es correcta", block: false)\
  #h(10pt) *D)* #raw("1, 2 y 3 son correctas", block: false)\
  #h(10pt) *E)* #raw("2 y 4 son correctas", block: false)\
]

#block(spacing: 3.5pt)[
  *26.* #raw("Pregunta Media 7: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)
  #h(10pt) *A)* #raw("1, 2 y 3 son correctas", block: false)\
  #h(10pt) *B)* #raw("Solo 4 es correcta", block: false)\
  #h(10pt) *C)* #raw("2 y 4 son correctas", block: false)\
  #h(10pt) *D)* #raw("Todas son correctas", block: false)\
  #h(10pt) *E)* #raw("1 y 3 son correctas", block: false)\
]

#block(spacing: 3.5pt)[
  *27.* #raw("Pregunta Media 11: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)
  #h(10pt) *A)* #raw("Solo 4 es correcta", block: false)\
  #h(10pt) *B)* #raw("1 y 3 son correctas", block: false)\
  #h(10pt) *C)* #raw("2 y 4 son correctas", block: false)\
  #h(10pt) *D)* #raw("1, 2 y 3 son correctas", block: false)\
  #h(10pt) *E)* #raw("Todas son correctas", block: false)\
]

#block(spacing: 3.5pt)[
  *28.* #raw("Pregunta Media 25: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)
  #h(10pt) *A)* #raw("1 y 3 son correctas", block: false)\
  #h(10pt) *B)* #raw("2 y 4 son correctas", block: false)\
  #h(10pt) *C)* #raw("Solo 4 es correcta", block: false)\
  #h(10pt) *D)* #raw("Todas son correctas", block: false)\
  #h(10pt) *E)* #raw("1, 2 y 3 son correctas", block: false)\
]

#v(4pt)
#text(weight: "bold", size: 9.5pt)[CASOS PRÁCTICOS Y PROBLEMAS APLICADOS]\
#rect(width: 100%, stroke: 0.5pt + luma(100), fill: rgb("#f8fafc"), inset: 3.5pt)[
  #text(size: 8.5pt)[*CASO PRÁCTICO:* Resuelva el caso planteado aplicando la normativa y procedimientos correspondientes.]
]
#v(1.5pt)

#block(spacing: 3.5pt)[
  *29.* #raw("Problema Difícil 3: Calcule la pérdida en el espacio libre (FSPL) para un enlace a 5 GHz a 10 km: ", block: false) + $  "FSPL" = 20 log(d) + 20 log(f) + 92.45  $
  #h(10pt) *A)* #raw("112.4 dB", block: false)\
  #h(10pt) *B)* #raw("150.0 dB", block: false)\
  #h(10pt) *C)* #raw("140.2 dB", block: false)\
  #h(10pt) *D)* #raw("98.5 dB", block: false)\
  #h(10pt) *E)* #raw("126.4 dB", block: false)\
]

#block(spacing: 3.5pt)[
  *30.* #raw("Problema Difícil 4: Calcule la pérdida en el espacio libre (FSPL) para un enlace a 5 GHz a 10 km: ", block: false) + $  "FSPL" = 20 log(d) + 20 log(f) + 92.45  $
  #h(10pt) *A)* #raw("98.5 dB", block: false)\
  #h(10pt) *B)* #raw("126.4 dB", block: false)\
  #h(10pt) *C)* #raw("112.4 dB", block: false)\
  #h(10pt) *D)* #raw("140.2 dB", block: false)\
  #h(10pt) *E)* #raw("150.0 dB", block: false)\
]
