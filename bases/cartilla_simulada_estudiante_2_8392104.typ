#set page(
  paper: "us-letter",
  margin: (x: 1.5cm, top: 0.85cm, bottom: 0.85cm),
  header: none,
  footer: locate(loc => {
    let page_num = counter(page).at(loc).first()
    let total_pages = counter(page).final(loc).first()
    align(center)[
      #text(size: 7.5pt, fill: luma(80))[
        EXAMEN OFICIAL UNITEPC · COD: 8392104 · MARÍA BELÉN QUISPE FLORES · Página #page_num de #total_pages
      ]
    ]
  })
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
    #text(weight: "bold", size: 10pt)[UNIVERSIDAD TECNICA PRIVADA COSMOS]\
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
  [*NOMBRE:* MARÍA BELÉN QUISPE FLORES],
  [*CARRERA:* AUDITORÍA / CONTADURÍA],
  [*MATERIA:* [CPEC18] AUDITORÍA TRIBUTARIA],
  [*GRUPO:* TA-01 #h(10pt) *SEMESTRE:* 3],
  [*DOCENTE:* MAURICIO QUIROZ LAFUENTE],
  [*EXAMEN:* 1er Parcial],
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
    #align(center)[#text(size: 18pt, weight: "bold")[8392104]]
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
    [
      #table(
        columns: (22%, 15.6%, 15.6%, 15.6%, 15.6%, 15.6%),
        stroke: none,
        inset: (x: 0pt, y: 2.8pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 7.2pt, weight: "bold")[1.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[2.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[3.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[4.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[5.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[6.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[7.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[8.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[9.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[10.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[11.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[12.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[13.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[14.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[15.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]]
      )
    ],
    [
      #table(
        columns: (22%, 15.6%, 15.6%, 15.6%, 15.6%, 15.6%),
        stroke: none,
        inset: (x: 0pt, y: 2.8pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 7.2pt, weight: "bold")[16.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[17.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[18.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[19.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[20.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[21.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[22.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[23.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[24.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[25.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[26.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[27.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[28.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[29.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[30.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: white)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]]
      )
    ],
    [
      #table(
        columns: (22%, 15.6%, 15.6%, 15.6%, 15.6%, 15.6%),
        stroke: none,
        inset: (x: 0pt, y: 2.8pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 7.2pt, weight: "bold")[31.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[32.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[33.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[34.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[35.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[36.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[37.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[38.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[39.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[40.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[41.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[42.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[43.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[44.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[45.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]]
      )
    ],
    [
      #table(
        columns: (22%, 15.6%, 15.6%, 15.6%, 15.6%, 15.6%),
        stroke: none,
        inset: (x: 0pt, y: 2.8pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 7.2pt, weight: "bold")[46.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[47.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[48.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[49.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[50.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[51.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[52.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[53.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[54.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[55.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[56.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[57.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[58.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[59.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]],
        [#text(size: 7.2pt, weight: "bold")[60.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black, fill: none)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold", fill: black)[E]]]]
      )
    ]
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

#text(weight: "bold")[SELECCION DE LA MEJOR RESPUESTA] \
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
