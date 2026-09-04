#set page(
  paper: "us-letter",
  margin: (top: 1.2cm, bottom: 1.2cm, left: 1.2cm, right: 1.2cm)
)
#set text(font: "Times New Roman", size: 9pt, lang: "es")

#table(
  columns: (20%, 60%, 20%),
  stroke: 1pt + black,
  align: center + horizon,
  fill: (x, y) => if y == 0 and x == 0 { rgb("#2e1065") } else if y == 0 and x == 2 { rgb("#f3e8ff") } else { none },
  [#text(fill: rgb("#fef08a"), size: 14pt)[*▲*]\ #text(fill: white, size: 9pt, weight: "bold")[UNITEPC]],
  [
    #text(size: 11pt, weight: "bold")[UNIVERSIDAD TÉCNICA PRIVADA COSMOS]\
    #text(size: 9pt, weight: "bold")[PATRÓN OFICIAL DE CORRECCIÓN OMR (60 REACTIVOS)]\
    #text(size: 8.5pt)[GESTIÓN 2-2026 · EVALUACIÓN OFICIAL 1ER PARCIAL]
  ],
  [
    #text(size: 7.5pt, fill: luma(80))[VARIANTE OFICIAL]\
    #text(size: 12pt, weight: "bold", fill: rgb("#6b21a8"))[TIPO A]
  ]
)

#v(3pt)

#table(
  columns: (50%, 25%, 25%),
  stroke: 0.5pt + black,
  [
    *MATERIA:* [CPEC18] AUDITORÍA TRIBUTARIA\
    *DOCENTE:* Titular Asignado\
    *GRUPO:* TA-01 · *SEDE:* Cochabamba\
    *FECHA:* 22/08/2026
  ],
  [
    #align(center)[
      #text(size: 7pt, weight: "bold")[FIRMA DOCENTE]\
      #v(16pt)
      #line(length: 80%, stroke: (dash: "dashed", thickness: 0.5pt))
    ]
  ],
  [
    #align(center)[
      #text(size: 7pt, weight: "bold")[SELLO JEFATURA]\
      #v(16pt)
      #line(length: 80%, stroke: (dash: "dashed", thickness: 0.5pt))
    ]
  ]
)

#v(6pt)
#text(size: 10pt, weight: "bold")[MATRIZ OFICIAL DE CLAVES DE CORRECCIÓN OMR (1 A 60)]
#line(length: 100%, stroke: 1pt + rgb("#6b21a8"))
#v(3pt)

#grid(
  columns: (16%, 16%, 16%, 16%, 16%, 16%),
  column-gutter: 5pt,
  row-gutter: 3pt,
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[1.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[2.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(C)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[3.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[4.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[5.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(C)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[6.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(C)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[7.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(E)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[8.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[9.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[10.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[11.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[12.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[13.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[14.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[15.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[16.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(E)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[17.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[18.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[19.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[20.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[21.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[22.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[23.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[24.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[25.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[26.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[27.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(E)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[28.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[29.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(E)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[30.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[31.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[32.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[33.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[34.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[35.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(C)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[36.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[37.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[38.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(E)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[39.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[40.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[41.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(C)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[42.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(E)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[43.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[44.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[45.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[46.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[47.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[48.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(E)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[49.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(E)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[50.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(E)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[51.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(C)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[52.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(C)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[53.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(A)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[54.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[55.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(C)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[56.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(D)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[57.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(B)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[58.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(C)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[59.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(E)]
    ]
  ],
  [
    #rect(width: 100%, stroke: 0.5pt + luma(180), fill: rgb("#faf5ff"), inset: 2.5pt, radius: 2pt)[
      #text(weight: "bold")[60.] #h(3pt) #text(weight: "bold", fill: rgb("#581c87"))[(A)]
    ]
  ],

)
