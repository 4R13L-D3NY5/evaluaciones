#set text(
  font: "Times New Roman",
  size: 11pt,
  lang: "es"
)

#show raw: set text(font: "Times New Roman")

#set par(leading: 0.8em, spacing: 0.8em)
#set page(
  width: 21.59cm,
  height: 33.02cm,
  margin: 2cm,
  header: none,
  footer: context {
    grid(
      columns: (1fr, auto),
      align: (left, right),
      [
        #raw("JUAN PEREZ PRUEBA TEST", block: false)\
        #text(size: 15pt, weight: "bold")[1234567]
      ],
      [PÁG. #counter(page).display()]
    )
  }
)

#counter(page).update(1)

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
    #text(weight: "bold")[UNIVERSIDAD TECNICA PRIVADA COSMOS]\
    #text(weight: "bold")[GESTION 2-2026]
    #v(-2pt)
    #line(length: 90%, stroke: 0.5pt + black)
    #v(-2.5pt)
    #text(weight: "bold")[EVALUACION TEORICA 1ER PARCIAL]
  ]
)


#v(0.8em)
#table(
  columns: (1fr, 1fr),
  stroke: 0.4pt + black,
  inset: 4pt,
  [NOMBRE: #raw("JUAN PEREZ PRUEBA TEST", block: false)], [CARRERA: #raw("CARRERA PRUEBA", block: false)],
  [MATERIA: #raw("MATERIA DE PRUEBA", block: false)], [GRUPO: #raw("TA-01", block: false)    SEMESTRE: #raw("3", block: false)],
  [DOCENTE: #raw("DOCENTE PRUEBA", block: false)], [EXAMEN: #raw("1ER PARCIAL", block: false)],
  [FECHA: #raw("22/08/2026", block: false)], [HORA: #raw("08:15 - 09:45", block: false)],
  [FIRMA DEL ESTUDIANTE: #h(1em)........................................],
  [CODIGO: #text(size: 15pt)[#raw("1234567", block: false)]],
)
#v(0.8em)

#v(0.8em)
#align(center)[
  #text(weight: "bold")[CUESTIONARIO DE PREGUNTAS (30)]
]

#v(0.8em)
#line(length: 100%, stroke: 0.75pt + black)
#v(0.8em)


#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("SELECCIÓN DE LA MEJOR RESPUESTA", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[1. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta fácil número 2", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción C de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción A de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción E de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción D de ejemplo", block: false)]\
    #text(weight: "regular")[E) #raw("Opción B de ejemplo", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[2. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta fácil número 4", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción A de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción D de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción C de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción B de ejemplo", block: false)]\
    #text(weight: "regular")[E) #raw("Opción E de ejemplo", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[3. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta fácil número 6", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción E de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción D de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción A de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción C de ejemplo", block: false)]\
    #text(weight: "regular")[E) #raw("Opción B de ejemplo", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[4. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta fácil número 7", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción E de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción A de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción C de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción B de ejemplo", block: false)]\
    #text(weight: "regular")[E) #raw("Opción D de ejemplo", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[5. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta fácil número 3", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción D de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción E de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción C de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción B de ejemplo", block: false)]\
    #text(weight: "regular")[E) #raw("Opción A de ejemplo", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[6. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta fácil número 5", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción B de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción A de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción D de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción C de ejemplo", block: false)]\
    #text(weight: "regular")[E) #raw("Opción E de ejemplo", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[7. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta fácil número 1", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción E de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción B de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción C de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción A de ejemplo", block: false)]\
    #text(weight: "regular")[E) #raw("Opción D de ejemplo", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[8. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta media número 14", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción A de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción D de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción C de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción B de ejemplo", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[9. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta media número 9", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción D de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción A de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción C de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción B de ejemplo", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[10. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta media número 13", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción D de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción B de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción A de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción C de ejemplo", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[11. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta media número 15", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción B de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción A de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción C de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción D de ejemplo", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[12. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta media número 16", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción A de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción C de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción D de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción B de ejemplo", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[13. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta media número 11", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción A de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción B de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción C de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción D de ejemplo", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[14. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta media número 10", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción D de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción B de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción C de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción A de ejemplo", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[15. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta media número 12", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción D de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción A de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción C de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción B de ejemplo", block: false)]\
  ]
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("VERDADERO O FALSO SIMPLE", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Marque la respuesta correcta.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[16. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta media número 2", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[17. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta media número 1", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[18. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta media número 3", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[19. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta media número 4", block: false)\
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("RESPUESTA A/B/AMBAS/NINGUNA", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Las siguientes preguntas están compuestas por dos premisas.", block: false)]\
#text(weight: "regular")[#raw("Responda con:", block: false)]\
#text(weight: "regular")[#raw("A: Si solo la primera premisa es verdadera.", block: false)]\
#text(weight: "regular")[#raw("B: Si solo la segunda premisa es verdadera.", block: false)]\
#text(weight: "regular")[#raw("C: Si ambas premisas son verdaderas.", block: false)]\
#text(weight: "regular")[#raw("D: Si ninguna premisa es verdadera.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[20. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta media número 8", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción D de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción B de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción A de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción C de ejemplo", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[21. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta media número 5", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción C de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción D de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción A de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción B de ejemplo", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[22. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta media número 6", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción C de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción B de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción D de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción A de ejemplo", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[23. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta media número 7", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción A de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción D de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción C de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción B de ejemplo", block: false)]\
  ]
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("ITEMS AGRUPADOS POR CASO CLINICO O PROBLEMA", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: El siguiente caso clínico o problema tendrá varias preguntas.", block: false)]\
#text(weight: "regular")[#raw("Seleccione la respuesta correcta en cada una.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#rect(width: 100%, stroke: 0.5pt + black, fill: rgb("#f8fafc"), inset: 3.5pt)[
  [#text(weight: "bold")[CASO CLINICO O PROBLEMA:]  Resuelva el caso planteado y responda cada pregunta del grupo.]]
#v(1em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[24. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta difícil número 2", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción D de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción B de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción E de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción C de ejemplo", block: false)]\
    #text(weight: "regular")[E) #raw("Opción A de ejemplo", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[25. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta difícil número 3", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción B de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción E de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción D de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción A de ejemplo", block: false)]\
    #text(weight: "regular")[E) #raw("Opción C de ejemplo", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[26. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta difícil número 4", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción A de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción D de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción C de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción E de ejemplo", block: false)]\
    #text(weight: "regular")[E) #raw("Opción B de ejemplo", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[27. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta difícil número 1", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Opción D de ejemplo", block: false)]\
    #text(weight: "regular")[B) #raw("Opción B de ejemplo", block: false)]\
    #text(weight: "regular")[C) #raw("Opción C de ejemplo", block: false)]\
    #text(weight: "regular")[D) #raw("Opción A de ejemplo", block: false)]\
    #text(weight: "regular")[E) #raw("Opción E de ejemplo", block: false)]\
  ]
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("EMPAREJAMIENTO AMPLIADO", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: De la lista de opciones, seleccione la respuesta correcta", block: false)]\
#text(weight: "regular")[#raw("para cada enunciado.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#rect(width: 100%, stroke: 0.5pt + black, fill: rgb("#f8fafc"), inset: 3.5pt)[
  [#text(weight: "bold")[RELACIONE EL CONCEPTO CON SU DEFINICION CORRECTA:]]\
  [A) ...]\
  [B) ...]\
  [C) ...]\
  [D) ...]\
  [E) ...]
]
#v(1em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[28. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta difícil número 7", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[29. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta difícil número 6", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[30. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta difícil número 5", block: false)\
]

