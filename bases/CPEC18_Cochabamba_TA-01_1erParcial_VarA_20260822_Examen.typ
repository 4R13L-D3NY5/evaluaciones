#set page(
  paper: "us-letter",
  margin: (x: 1.5cm, top: 0.85cm, bottom: 0.85cm),
  header: context {
    let p = counter(page).get().first()
    if p > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [#text(size: 8pt, fill: luma(90))[JUAN CARLOS PEREZ MAMANI · #text(font: "Courier", weight: "bold")[7849102]]],
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

// ========================================================
// PÁGINA 1: CABECERA INSTITUCIONAL + DATOS + CARTILLA OMR HORIZONTAL
// ========================================================

// 1. Encabezado Institucional Oficial
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

// 2. Ficha de Datos del Estudiante
#table(
  columns: (58%, 42%),
  stroke: 0.5pt + black,
  fill: none,
  inset: (x: 5pt, y: 2.2pt),
  [*NOMBRE:* JUAN CARLOS PEREZ MAMANI],
  [*CARRERA:* AUDITORÍA / CONTADURÍA],
  [*MATERIA:* [CPEC18] AUDITORÍA TRIBUTARIA],
  [*GRUPO:* TA-01 #h(10pt) *SEMESTRE:* 3],
  [*DOCENTE:* MAURICIO QUIROZ LAFUENTE],
  [*EXAMEN:* 1er Parcial · VARIANTE A],
  [*FECHA:* 22/08/2026],
  [*HORA:* 08:15:00 - 09:45:00],
  [
    *FIRMA DEL ESTUDIANTE:* \
    #v(10pt)
    #line(length: 100%, stroke: (dash: "dotted", thickness: 0.85pt))
  ],
  [
    *CODIGO:* \
    #v(-2pt)
    #align(center)[#text(size: 18pt, weight: "bold")[7849102]]
  ]
)

#v(1.5pt)
#text(size: 9pt)[*INSTRUCCION DE COMPLETADO DE CARTILLA:* Debe rellenar con cuidado la opción que considere correcta en la Cartilla con lapicero de color AZUL o NEGRO.]
#v(1.5pt)

// 3. CARTILLA DE RESPUESTAS (1 A 60) - MATRIZ OMR EXACTA
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
        columns: (18%, 16.4%, 16.4%, 16.4%, 16.4%, 16.4%),
        stroke: none,
        inset: (x: 0pt, y: 2.8pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 7.2pt, weight: "bold")[1.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[2.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[3.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[4.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[5.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[6.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[7.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[8.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[9.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[10.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[11.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[12.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[13.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[14.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[15.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]]
      )
    ],
    [
      #table(
        columns: (18%, 16.4%, 16.4%, 16.4%, 16.4%, 16.4%),
        stroke: none,
        inset: (x: 0pt, y: 2.8pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 7.2pt, weight: "bold")[16.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[17.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[18.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[19.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[20.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[21.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[22.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[23.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[24.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[25.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[26.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[27.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[28.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[29.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[30.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]]
      )
    ],
    [
      #table(
        columns: (18%, 16.4%, 16.4%, 16.4%, 16.4%, 16.4%),
        stroke: none,
        inset: (x: 0pt, y: 2.8pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 7.2pt, weight: "bold")[31.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[32.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[33.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[34.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[35.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[36.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[37.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[38.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[39.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[40.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[41.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[42.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[43.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[44.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[45.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]]
      )
    ],
    [
      #table(
        columns: (18%, 16.4%, 16.4%, 16.4%, 16.4%, 16.4%),
        stroke: none,
        inset: (x: 0pt, y: 2.8pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 7.2pt, weight: "bold")[46.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[47.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[48.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[49.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[50.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[51.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[52.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[53.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[54.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[55.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[56.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[57.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[58.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[59.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]],
        [#text(size: 7.2pt, weight: "bold")[60.]],
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

// ========================================================
// PÁGINA 2 EN ADELANTE: CUESTIONARIO OFICIAL (30 REACTIVOS: 7F + 16M + 7D)
// ========================================================

#align(center)[
  #text(size: 11pt, weight: "bold")[CUESTIONARIO DE PREGUNTAS (30 REACTIVOS)]\
  #text(size: 9pt, weight: "bold", fill: luma(60))[[CPEC18] AUDITORÍA TRIBUTARIA · EVALUACIÓN TEÓRICA 1ER PARCIAL · VARIANTE A]
]

#v(-3pt)
#line(length: 100%, stroke: 0.75pt + black)
#v(3pt)

#text(weight: "bold", size: 9.5pt)[SELECCIÓN DE LA MEJOR RESPUESTA]\
#text(size: 8pt, style: "italic")[Instrucciones: Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.]
#v(1.5pt)

#block(spacing: 3.5pt)[
  *1.* Para el cómputo del Crédito Fiscal IVA en compras de bienes y servicios, el documento fiscal debe:
  #h(10pt) *A)* Ser emitido exclusivamente en moneda extranjera\
  #h(10pt) *B)* Ser cancelado únicamente en efectivo al momento de la entrega\
  #h(10pt) *C)* Contar con autorización del Ministerio de Economía\
  #h(10pt) *D)* Estar vinculado a la actividad gravada, a nombre y NIT del sujeto pasivo y respaldado\
  #h(10pt) *E)* Tener una antigüedad mayor a 180 días calendario\
]

#block(spacing: 3.5pt)[
  *2.* El plazo reglamentario para la presentación de descargos ante una Vista de Cargo emitida por el SIN es de:
  #h(10pt) *A)* 30 días calendario improrrogables computables a partir de su notificación\
  #h(10pt) *B)* 10 días hábiles administrativos\
  #h(10pt) *C)* 60 días calendario continuos\
  #h(10pt) *D)* 15 días hábiles según Ley 2492\
  #h(10pt) *E)* 5 días hábiles a partir de la publicación en prensa\
]

#block(spacing: 3.5pt)[
  *3.* La no emisión de factura en una venta de bienes o servicios constituye una contravención tributaria sancionada con:
  #h(10pt) *A)* Clausura del establecimiento comercial de acuerdo a la reincidencia\
  #h(10pt) *B)* Pérdida automática de la personería jurídica\
  #h(10pt) *C)* Decomiso definitivo de la mercadería sin reclamo\
  #h(10pt) *D)* Prisión de 1 a 3 años para el representante legal\
  #h(10pt) *E)* Suspensión definitiva del Registro Tributario (NIT)\
]

#block(spacing: 3.5pt)[
  *4.* La alícuota por remesas de utilidades a beneficiarios del exterior por servicios prestados desde el extranjero es del:
  #h(10pt) *A)* 25% sobre el 50% presunto (Tasa efectiva 12.5%)\
  #h(10pt) *B)* 13% sobre el total remesado\
  #h(10pt) *C)* 3% por concepto de retención IT\
  #h(10pt) *D)* 25% sobre el 10% presunto (Tasa efectiva 2.5%)\
  #h(10pt) *E)* Exención total por tratados de doble tributación\
]

#block(spacing: 3.5pt)[
  *5.* En el Régimen Complementario al IVA (RC-IVA) para dependientes, el Formulario 110 admite facturas de hasta:
  #h(10pt) *A)* 120 días anteriores a la fecha de presentación al empleador\
  #h(10pt) *B)* 30 días anteriores a la fecha de presentación\
  #h(10pt) *C)* 60 días calendario improrrogables\
  #h(10pt) *D)* 180 días del año fiscal\
  #h(10pt) *E)* Exclusivamente del mes en curso\
]

#block(spacing: 3.5pt)[
  *6.* El recurso de alzada ante la Autoridad Regional de Impugnación Tributaria (ARIT) debe interponerse en el plazo perentorio de:
  #h(10pt) *A)* 20 días improrrogables computables a partir de la notificación legal\
  #h(10pt) *B)* 15 días hábiles administrativos\
  #h(10pt) *C)* 30 días calendario continuos\
  #h(10pt) *D)* 45 días hábiles procesales\
  #h(10pt) *E)* 60 días calendario según Ley 2492\
]

#block(spacing: 3.5pt)[
  *7.* La bancarización obligatoria establecida por el SIN es exigible para transacciones iguales o mayores a:
  #h(10pt) *A)* Bs 10.000\
  #h(10pt) *B)* Bs 50.000\
  #h(10pt) *C)* Bs 100.000\
  #h(10pt) *D)* Bs 25.000\
  #h(10pt) *E)* Bs 5.000\
]

#block(spacing: 3.5pt)[
  *8.* Las compensaciones del IUE efectivamente pagado contra el IT operan:
  #h(10pt) *A)* A partir del mes siguiente al pago del IUE hasta su total agotamiento o nuevo vencimiento\
  #h(10pt) *B)* De manera retroactiva a los períodos del año anterior\
  #h(10pt) *C)* Únicamente contra el débito fiscal IVA compras\
  #h(10pt) *D)* Hasta un máximo del 50% de las ventas brutas declaradas\
  #h(10pt) *E)* Exclusivamente en empresas del sector minero y petrolero\
]

#v(4pt)
#text(weight: "bold", size: 9.5pt)[FALSO O VERDADERO]\
#text(size: 8pt, style: "italic")[Instrucciones: Determine si cada afirmación es verdadera (A) o falsa (B).]
#v(1.5pt)

#block(spacing: 3.5pt)[
  *9.* El principio de devengado tributario reconoce ingresos y gastos cuando se generan legalmente, con independencia del cobro o pago.
  #h(10pt) *A)* Verdadero\
  #h(10pt) *B)* Falso\
]

#block(spacing: 3.5pt)[
  *10.* El Impuesto a las Grandes Fortunas (IGF) aplica a personas naturales con patrimonio superior a Bs 30 millones en territorio nacional y extranjero.
  #h(10pt) *A)* Verdadero\
  #h(10pt) *B)* Falso\
]

#block(spacing: 3.5pt)[
  *11.* El crédito fiscal generado en compras de combustible (gasolina y diésel) es computable al 100% del valor total de la factura.
  #h(10pt) *A)* Verdadero\
  #h(10pt) *B)* Falso\
]

#block(spacing: 3.5pt)[
  *12.* El débito fiscal IVA se genera en la venta de bienes muebles en el momento de la entrega del bien o emisión de factura, lo que ocurra primero.
  #h(10pt) *A)* Verdadero\
  #h(10pt) *B)* Falso\
]

#v(4pt)
#text(weight: "bold", size: 9.5pt)[PREMISAS A / B / AMBAS / NINGUNA]\
#text(size: 8pt, style: "italic")[Instrucciones: Analice las dos premisas planteadas y elija la opción correcta.]
#v(1.5pt)

#block(spacing: 3.5pt)[
  *13.* I. La alícuota del ICE es idéntica para bebidas alcohólicas y vehículos automotores.\
II. El ICE pagado en importaciones es computable como crédito fiscal IVA.
  #h(10pt) *A)* Si la primera premisa es verdadera\
  #h(10pt) *B)* Si la segunda premisa es verdadera\
  #h(10pt) *C)* Si ambas premisas son verdaderas\
  #h(10pt) *D)* Si ninguna de las premisas es verdadera\
]

#block(spacing: 3.5pt)[
  *14.* I. La prescripción tributaria se interrumpe con la notificación de la Resolución Determinativa.\
II. El pago parcial de la deuda tributaria suspende el cómputo de la prescripción.
  #h(10pt) *A)* Si la primera premisa es verdadera\
  #h(10pt) *B)* Si la segunda premisa es verdadera\
  #h(10pt) *C)* Si ambas premisas son verdaderas\
  #h(10pt) *D)* Si ninguna de las premisas es verdadera\
]

#block(spacing: 3.5pt)[
  *15.* I. Los profesionales independientes liquidan el IUE mediante el Formulario 510 aplicando la alícuota del 25% sobre el 50% presunto.\
II. El IT pagado por profesionales independientes es acreditable al 100% contra el IVA débito.
  #h(10pt) *A)* Si la primera premisa es verdadera\
  #h(10pt) *B)* Si la segunda premisa es verdadera\
  #h(10pt) *C)* Si ambas premisas son verdaderas\
  #h(10pt) *D)* Si ninguna de las premisas es verdadera\
]

#block(spacing: 3.5pt)[
  *16.* I. Las compras de servicios a personas naturales no inscritas generan retención del 12.5% por IUE y 3% por IT.\
II. Las retenciones por compra de bienes son del 5% por IUE y 3% por IT.
  #h(10pt) *A)* Si la primera premisa es verdadera\
  #h(10pt) *B)* Si la segunda premisa es verdadera\
  #h(10pt) *C)* Si ambas premisas son verdaderas\
  #h(10pt) *D)* Si ninguna de las premisas es verdadera\
]

#block(spacing: 3.5pt)[
  *17.* I. Los gastos de representación con respaldo de factura son 100% deducibles en el IUE sin ningún tope reglamentario.\
II. Los sueldos pagados a socios que no trabajan efectivamente en la empresa son deducibles.
  #h(10pt) *A)* Si la primera premisa es verdadera\
  #h(10pt) *B)* Si la segunda premisa es verdadera\
  #h(10pt) *C)* Si ambas premisas son verdaderas\
  #h(10pt) *D)* Si ninguna de las premisas es verdadera\
]

#block(spacing: 3.5pt)[
  *18.* I. Las exportaciones definitivas de bienes están gravadas con tasa cero en el IVA.\
II. Los exportadores pueden solicitar la devolución del crédito fiscal mediante CEDEIMs.
  #h(10pt) *A)* Si la primera premisa es verdadera\
  #h(10pt) *B)* Si la segunda premisa es verdadera\
  #h(10pt) *C)* Si ambas premisas son verdaderas\
  #h(10pt) *D)* Si ninguna de las premisas es verdadera\
]

#v(4pt)
#text(weight: "bold", size: 9.5pt)[PREGUNTAS CON CLAVE DE RESPUESTA]\
#text(size: 8pt, style: "italic")[Instrucciones: Marque: A si 1, 2 y 3 son correctas; B si 1 y 3; C si 2 y 4; D si solo 4; E si todas son correctas.]
#v(1.5pt)

#block(spacing: 3.5pt)[
  *19.* Son condiciones formales para la deducción de sueldos y salarios en la liquidación del IUE:\
1. Planillas de sueldos debidamente visadas por el Ministerio de Trabajo.\
2. Pago de aportes patronales y laborales a las entidades de seguridad social.\
3. Contratos de trabajo registrados ante la autoridad competente.\
4. Comprobante de retención del RC-IVA debidamente declarado en Formulario 608.
  #h(10pt) *A)* 1, 2 y 3 son correctas\
  #h(10pt) *B)* 1 y 3 son correctas\
  #h(10pt) *C)* 2 y 4 son correctas\
  #h(10pt) *D)* Solo 4 es correcta\
  #h(10pt) *E)* Todas son correctas\
]

#block(spacing: 3.5pt)[
  *20.* Constituyen hechos generadores del Impuesto a las Transacciones (IT):\
1. Venta de bienes muebles e inmuebles en territorio nacional.\
2. Prestación de servicios comerciales y profesionales de toda índole.\
3. Alquiler de bienes muebles e inmuebles.\
4. Transferencias a título gratuito de bienes y derechos.
  #h(10pt) *A)* 1, 2 y 3 son correctas\
  #h(10pt) *B)* 1 y 3 son correctas\
  #h(10pt) *C)* 2 y 4 son correctas\
  #h(10pt) *D)* Solo 4 es correcta\
  #h(10pt) *E)* Todas son correctas\
]

#block(spacing: 3.5pt)[
  *21.* Requisitos para la deducibilidad de intereses por deudas financieras contraídas en el exterior:\
1. Que la deuda esté vinculada directamente a la obtención de rentas gravadas.\
2. Que la tasa de interés no supere la tasa LIBOR/SOFR más 3 puntos porcentuales.\
3. Que se efectúe la retención del IUE-BE por remesas al exterior.\
4. Que el acreedor sea una empresa filial del mismo grupo económico sin contrato.
  #h(10pt) *A)* 1, 2 y 3 son correctas\
  #h(10pt) *B)* 1 y 3 son correctas\
  #h(10pt) *C)* 2 y 4 son correctas\
  #h(10pt) *D)* Solo 4 es correcta\
  #h(10pt) *E)* Todas son correctas\
]

#block(spacing: 3.5pt)[
  *22.* Son facultades específicas de la Administración Tributaria según la Ley 2492:\
1. Control, comprobación, verificación, fiscalización e investigación.\
2. Determinación de tributos sobre base cierta o presunta.\
3. Imposición de sanciones y ejecución de la deuda tributaria.\
4. Emisión de normas reglamentarias de carácter general.
  #h(10pt) *A)* 1, 2 y 3 son correctas\
  #h(10pt) *B)* 1 y 3 son correctas\
  #h(10pt) *C)* 2 y 4 son correctas\
  #h(10pt) *D)* Solo 4 es correcta\
  #h(10pt) *E)* Todas son correctas\
]

#block(spacing: 3.5pt)[
  *23.* Son documentos soporte indispensables en el legajo de auditoría tributaria permanente:\
1. Testimonio de constitución social y poderes de representación legal.\
2. Número de Identificación Tributaria (NIT) y certificados de inscripción.\
3. Estados Financieros auditados y dictámenes tributarios de gestiones anteriores.\
4. Resoluciones Administrativas de exención o autorización de sistemas computarizados.
  #h(10pt) *A)* 1, 2 y 3 son correctas\
  #h(10pt) *B)* 1 y 3 son correctas\
  #h(10pt) *C)* 2 y 4 son correctas\
  #h(10pt) *D)* Solo 4 es correcta\
  #h(10pt) *E)* Todas son correctas\
]

#v(4pt)
#text(weight: "bold", size: 9.5pt)[CASOS PRÁCTICOS Y PROBLEMAS APLICADOS]\
#rect(width: 100%, stroke: 0.5pt + luma(100), fill: rgb("#f8fafc"), inset: 3.5pt)[
  #text(size: 8.5pt)[*CASO PRÁCTICO (Auditoría Tributaria Integral):* En la fiscalización a 'Comercial Andina S.R.L.', se detectaron compras no bancarizadas por Bs 150.000 y retenciones de servicios no declaradas.]
]
#v(1.5pt)

#block(spacing: 3.5pt)[
  *24.* Determine la sanción por omisión de pago si la empresa no rectifica voluntariamente antes de la Vista de Cargo:
  #h(10pt) *A)* 100% del tributo omitido actualizado en UFV al día del pago\
  #h(10pt) *B)* 20% del tributo si cancela en etapa preliminar\
  #h(10pt) *C)* 40% del tributo según el Artículo 156 del CTB\
  #h(10pt) *D)* 60% del tributo en caso de reincidencia\
  #h(10pt) *E)* Sanción fija de 5.000 UFV sin actualización\
]

#block(spacing: 3.5pt)[
  *25.* Calcule el interés moratorio generado si transcurrieron 500 días con una tasa de interés del 4% anual sobre el tributo omitido:
  #h(10pt) *A)* Bs 5.200 calculados con interés simple\
  #h(10pt) *B)* Interés moratorio compuesto según fórmula oficial del Artículo 47 CTB\
  #h(10pt) *C)* Tasa fija mensual del 1.5%\
  #h(10pt) *D)* Exención de intereses por caso de fuerza mayor\
  #h(10pt) *E)* Interés bancario comercial del 12% anual\
]

#block(spacing: 3.5pt)[
  *26.* En una constructora con contrato de Bs 2.000.000 y 60% de avance físico certificado, ¿cuál es el ingreso gravado devengado en el IUE?
  #h(10pt) *A)* Ingreso devengado de Bs 1.200.000 sujeto a facturación y cómputo de IUE\
  #h(10pt) *B)* Ingreso total diferido de Bs 2.000.000 al inicio de la obra\
  #h(10pt) *C)* Solo los anticipos financieros cobrados en efectivo\
  #h(10pt) *D)* Bs 800.000 correspondiente al saldo pendiente de ejecución\
  #h(10pt) *E)* Exención total hasta la entrega definitiva de la obra\
]

#block(spacing: 3.5pt)[
  *27.* Si los costos reales acumulados fueron de Bs 800.000, determine la Utilidad Bruta Imponible devengada en el ejercicio:
  #h(10pt) *A)* Bs 1.200.000 sin deducir costos directos\
  #h(10pt) *B)* Utilidad Bruta Imponible de Bs 400.000 (Bs 1.200.000 - Bs 800.000)\
  #h(10pt) *C)* Pérdida tributaria de Bs 800.000\
  #h(10pt) *D)* Bs 600.000 aplicando margen presunto de utilidad\
  #h(10pt) *E)* Bs 200.000 descontando retenciones de garantía\
]

#v(4pt)
#text(weight: "bold", size: 9.5pt)[EMPAREJAMIENTO DE CONCEPTOS]\
#rect(width: 100%, stroke: 0.5pt + luma(100), fill: rgb("#f8fafc"), inset: 3.5pt)[
  #text(size: 8pt)[*OPCIONES DE REFERENCIA:*\
  *A)* Determinación sobre Base Presunta #h(0.3cm) *B)* Crédito Fiscal IVA Trasladable #h(0.3cm) *C)* Alícuota Adicional IUE Financiero\
  *D)* Exención Tributaria Subjetiva #h(0.3cm) *E)* Determinación sobre Base Cierta]
  #v(1pt)
  #text(size: 7.5pt, style: "italic")[Relacione cada uno de los siguientes enunciados con la opción correspondiente:]
]
#v(1.5pt)

#block(spacing: 3.5pt)[
  *28.* Método de liquidación tributaria aplicable cuando el contribuyente oculta ventas y no tiene registros contables.
  #h(10pt) *A)* Determinación sobre Base Presunta\
  #h(10pt) *B)* Crédito Fiscal IVA Trasladable\
  #h(10pt) *C)* Alícuota Adicional IUE Financiero\
  #h(10pt) *D)* Exención Tributaria Subjetiva\
  #h(10pt) *E)* Determinación sobre Base Cierta\
]

#block(spacing: 3.5pt)[
  *29.* Procedimiento de fiscalización directa con libros contables y documentos de respaldo fidedignos.
  #h(10pt) *A)* Determinación sobre Base Presunta\
  #h(10pt) *B)* Crédito Fiscal IVA Trasladable\
  #h(10pt) *C)* Alícuota Adicional IUE Financiero\
  #h(10pt) *D)* Exención Tributaria Subjetiva\
  #h(10pt) *E)* Determinación sobre Base Cierta\
]

#block(spacing: 3.5pt)[
  *30.* Beneficio tributario otorgado a fundaciones y asociaciones civiles sin fines de lucro debidamente registradas.
  #h(10pt) *A)* Determinación sobre Base Presunta\
  #h(10pt) *B)* Crédito Fiscal IVA Trasladable\
  #h(10pt) *C)* Alícuota Adicional IUE Financiero\
  #h(10pt) *D)* Exención Tributaria Subjetiva\
  #h(10pt) *E)* Determinación sobre Base Cierta\
]
