#set page(
  paper: "us-legal",
  margin: 2cm,
  header: none,
  footer: none
)
#set text(font: "Times New Roman", size: 11pt, lang: "es")

#table(
  columns: (22%, 58%, 20%),
  stroke: 1pt + black,
  align: center + horizon,
  fill: (x, y) => if y == 0 and x == 2 { rgb("#fff7ed") } else { none },
  [#image("logo_unitepc_clean.png", width: 90%)],
  [
    #text(size: 12pt, weight: "bold")[UNIVERSIDAD TECNICA PRIVADA COSMOS]\
    #text(size: 10pt, weight: "bold")[PATRON OFICIAL DE CORRECCION OMR (60 REACTIVOS)]\
    #text(size: 9.5pt)[GESTION 2-2026 · EVALUACION OFICIAL 1ER PARCIAL]
  ],
  [
    #text(size: 8pt, weight: "bold", fill: rgb("#9a3412"))[VARIANTE OFICIAL]\
    #text(size: 14pt, weight: "bold", fill: rgb("#9a3412"))[TIPO C]
  ]
)

#v(6pt)

#table(
  columns: (50%, 25%, 25%),
  stroke: 0.5pt + black,
  [
    *MATERIA:* [CPEC18] AUDITORÍA TRIBUTARIA\
    *DOCENTE:* MAURICIO QUIROZ LAFUENTE\
    *GRUPO:* TA-01 · *SEDE:* Cochabamba\
    *FECHA:* 22/08/2026
  ],
  [
    #align(center)[
      #text(size: 8pt, weight: "bold")[FIRMA DOCENTE]\
      #v(18pt)
      #line(length: 80%, stroke: (dash: "dashed", thickness: 0.5pt))
    ]
  ],
  [
    #align(center)[
      #text(size: 8pt, weight: "bold")[SELLO JEFATURA]\
      #v(18pt)
      #line(length: 80%, stroke: (dash: "dashed", thickness: 0.5pt))
    ]
  ]
)

#v(8pt)
#text(size: 11.5pt, weight: "bold")[MATRIZ OFICIAL DE CLAVES DE CORRECCIÓN OMR (1 A 60)]
#line(length: 100%, stroke: 1pt + rgb("#9a3412"))
#v(6pt)

#grid(
  columns: (16%, 16%, 16%, 16%, 16%, 16%),
  column-gutter: 6pt,
  row-gutter: 5pt,
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[1.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(E)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[2.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[3.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[4.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[5.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(C)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[6.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[7.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(C)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[8.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(E)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[9.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[10.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[11.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[12.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(C)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[13.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[14.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(E)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[15.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[16.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[17.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[18.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[19.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(C)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[20.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(E)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[21.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[22.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[23.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[24.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(E)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[25.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(C)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[26.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[27.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(E)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[28.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(C)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[29.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(E)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[30.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[31.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[32.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[33.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(C)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[34.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(E)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[35.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[36.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[37.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[38.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[39.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[40.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[41.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(C)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[42.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[43.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(E)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[44.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(C)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[45.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[46.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[47.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[48.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[49.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(E)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[50.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[51.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[52.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[53.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(C)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[54.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[55.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[56.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(C)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[57.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(C)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[58.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(E)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[59.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#fafafa"), inset: 4pt, radius: 2pt)[
      #text(weight: "bold")[60.] #h(4pt) #text(weight: "bold", fill: rgb("#9a3412"))[(A)]
    ]
  ],

)
