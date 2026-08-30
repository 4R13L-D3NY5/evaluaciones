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
        #raw("RIVERA PEREDO NEILS ALEJANDRO", block: false)\
        #text(size: 15pt, weight: "bold")[1111884]
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
  [NOMBRE: #raw("RIVERA PEREDO NEILS ALEJANDRO", block: false)], [CARRERA: #raw("LICENCIATURA EN INGENIERÍA DE SISTEMAS", block: false)],
  [MATERIA: #raw("INGLÉS TÉCNICO II", block: false)], [GRUPO: #raw("TA-01", block: false)    SEMESTRE: #raw("2", block: false)],
  [DOCENTE: #raw("DOCENTE SEA (CI 5235947)", block: false)], [EXAMEN: #raw("1ER PARCIAL", block: false)],
  [FECHA: #raw("28/08/2026", block: false)], [HORA: #raw("12:45 - 14:15", block: false)],
  [FIRMA DEL ESTUDIANTE: #h(1em)........................................],
  [CODIGO: #text(size: 15pt)[#raw("1111884", block: false)]],
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
  #box[#text(weight: "bold")[1. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 3: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Cifrado de datos", block: false)]\
    #text(weight: "regular")[B) #raw("Direccionamiento físico (MAC) y control de flujo", block: false)]\
    #text(weight: "regular")[C) #raw("Compresión", block: false)]\
    #text(weight: "regular")[D) #raw("Control de sesiones", block: false)]\
    #text(weight: "regular")[E) #raw("Enrutamiento de paquetes", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[2. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 15: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Direccionamiento físico (MAC) y control de flujo", block: false)]\
    #text(weight: "regular")[B) #raw("Control de sesiones", block: false)]\
    #text(weight: "regular")[C) #raw("Cifrado de datos", block: false)]\
    #text(weight: "regular")[D) #raw("Enrutamiento de paquetes", block: false)]\
    #text(weight: "regular")[E) #raw("Compresión", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[3. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 7: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Compresión", block: false)]\
    #text(weight: "regular")[B) #raw("Control de sesiones", block: false)]\
    #text(weight: "regular")[C) #raw("Direccionamiento físico (MAC) y control de flujo", block: false)]\
    #text(weight: "regular")[D) #raw("Cifrado de datos", block: false)]\
    #text(weight: "regular")[E) #raw("Enrutamiento de paquetes", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[4. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 11: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Compresión", block: false)]\
    #text(weight: "regular")[B) #raw("Direccionamiento físico (MAC) y control de flujo", block: false)]\
    #text(weight: "regular")[C) #raw("Cifrado de datos", block: false)]\
    #text(weight: "regular")[D) #raw("Enrutamiento de paquetes", block: false)]\
    #text(weight: "regular")[E) #raw("Control de sesiones", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[5. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 6: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("80 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("64 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("106.6 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("128 Mbps", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[6. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 13: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("106.6 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("128 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("80 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("64 Mbps", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[7. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 11: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("64 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("106.6 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("128 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("80 Mbps", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[8. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 7: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("128 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("64 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("80 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("106.6 Mbps", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[9. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 14: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("80 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("64 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("128 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("106.6 Mbps", block: false)]\
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
  #box[#text(weight: "bold")[10. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 8: La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[11. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 14: La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[12. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 6: La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.", block: false)\
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
  #box[#text(weight: "bold")[13. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 26: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[D) #raw("D. Si ninguna es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[14. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 4: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[D) #raw("A. Si la primera es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[15. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 18: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[D) #raw("B. Si la segunda es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[16. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 28: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("C. Si ambas son verdaderas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[17. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 24: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("C. Si ambas son verdaderas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[18. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 2: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("B. Si la segunda es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[19. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 8: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[B) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("B. Si la segunda es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[20. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 10: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("C. Si ambas son verdaderas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[21. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 20: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[B) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("B. Si la segunda es verdadera", block: false)]\
  ]
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("VERDADERO O FALSO COMPLEJAS", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Seleccione la opción correcta de acuerdo con la siguiente clave:", block: false)]\
#text(weight: "regular")[#raw("A: 1, 2 y 3 son verdaderas.", block: false)]\
#text(weight: "regular")[#raw("B: 1 y 3 son verdaderas.", block: false)]\
#text(weight: "regular")[#raw("C: 2 y 4 son verdaderas.", block: false)]\
#text(weight: "regular")[#raw("D: Solo 4 es verdadera.", block: false)]\
#text(weight: "regular")[#raw("E: Todas son verdaderas.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[22. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 17: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[C) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("1, 2 y 3 son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[23. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 3: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1, 2 y 3 son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[C) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("Todas son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[24. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 15: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[B) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[C) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("1, 2 y 3 son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[25. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 9: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[C) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[D) #raw("1, 2 y 3 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("2 y 4 son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[26. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 7: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1, 2 y 3 son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[C) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("1 y 3 son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[27. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 11: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[B) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[C) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("1, 2 y 3 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("Todas son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[28. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 25: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[C) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[D) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("1, 2 y 3 son correctas", block: false)]\
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
  #box[#text(weight: "bold")[29. #raw("___", block: false)]] #h(0.25em)#raw("Problema Difícil 3: Calcule la pérdida en el espacio libre (FSPL) para un enlace a 5 GHz a 10 km: ", block: false) + $  "FSPL" = 20 log(d) + 20 log(f) + 92.45  $\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("112.4 dB", block: false)]\
    #text(weight: "regular")[B) #raw("150.0 dB", block: false)]\
    #text(weight: "regular")[C) #raw("140.2 dB", block: false)]\
    #text(weight: "regular")[D) #raw("98.5 dB", block: false)]\
    #text(weight: "regular")[E) #raw("126.4 dB", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[30. #raw("___", block: false)]] #h(0.25em)#raw("Problema Difícil 4: Calcule la pérdida en el espacio libre (FSPL) para un enlace a 5 GHz a 10 km: ", block: false) + $  "FSPL" = 20 log(d) + 20 log(f) + 92.45  $\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("98.5 dB", block: false)]\
    #text(weight: "regular")[B) #raw("126.4 dB", block: false)]\
    #text(weight: "regular")[C) #raw("112.4 dB", block: false)]\
    #text(weight: "regular")[D) #raw("140.2 dB", block: false)]\
    #text(weight: "regular")[E) #raw("150.0 dB", block: false)]\
  ]
]

#pagebreak(to: "odd")
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
        #raw("PANIAGUA MUÑOZ CARLOS ALBERTO", block: false)\
        #text(size: 15pt, weight: "bold")[1112245]
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
  [NOMBRE: #raw("PANIAGUA MUÑOZ CARLOS ALBERTO", block: false)], [CARRERA: #raw("LICENCIATURA EN INGENIERÍA DE SISTEMAS", block: false)],
  [MATERIA: #raw("INGLÉS TÉCNICO II", block: false)], [GRUPO: #raw("TA-01", block: false)    SEMESTRE: #raw("2", block: false)],
  [DOCENTE: #raw("DOCENTE SEA (CI 5235947)", block: false)], [EXAMEN: #raw("1ER PARCIAL", block: false)],
  [FECHA: #raw("28/08/2026", block: false)], [HORA: #raw("12:45 - 14:15", block: false)],
  [FIRMA DEL ESTUDIANTE: #h(1em)........................................],
  [CODIGO: #text(size: 15pt)[#raw("1112245", block: false)]],
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
  #box[#text(weight: "bold")[1. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 3: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Cifrado de datos", block: false)]\
    #text(weight: "regular")[B) #raw("Direccionamiento físico (MAC) y control de flujo", block: false)]\
    #text(weight: "regular")[C) #raw("Compresión", block: false)]\
    #text(weight: "regular")[D) #raw("Control de sesiones", block: false)]\
    #text(weight: "regular")[E) #raw("Enrutamiento de paquetes", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[2. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 15: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Direccionamiento físico (MAC) y control de flujo", block: false)]\
    #text(weight: "regular")[B) #raw("Control de sesiones", block: false)]\
    #text(weight: "regular")[C) #raw("Cifrado de datos", block: false)]\
    #text(weight: "regular")[D) #raw("Enrutamiento de paquetes", block: false)]\
    #text(weight: "regular")[E) #raw("Compresión", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[3. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 7: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Compresión", block: false)]\
    #text(weight: "regular")[B) #raw("Control de sesiones", block: false)]\
    #text(weight: "regular")[C) #raw("Direccionamiento físico (MAC) y control de flujo", block: false)]\
    #text(weight: "regular")[D) #raw("Cifrado de datos", block: false)]\
    #text(weight: "regular")[E) #raw("Enrutamiento de paquetes", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[4. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 11: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Compresión", block: false)]\
    #text(weight: "regular")[B) #raw("Direccionamiento físico (MAC) y control de flujo", block: false)]\
    #text(weight: "regular")[C) #raw("Cifrado de datos", block: false)]\
    #text(weight: "regular")[D) #raw("Enrutamiento de paquetes", block: false)]\
    #text(weight: "regular")[E) #raw("Control de sesiones", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[5. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 6: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("80 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("64 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("106.6 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("128 Mbps", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[6. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 13: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("106.6 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("128 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("80 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("64 Mbps", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[7. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 11: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("64 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("106.6 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("128 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("80 Mbps", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[8. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 7: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("128 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("64 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("80 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("106.6 Mbps", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[9. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 14: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("80 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("64 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("128 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("106.6 Mbps", block: false)]\
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
  #box[#text(weight: "bold")[10. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 8: La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[11. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 14: La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[12. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 6: La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.", block: false)\
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
  #box[#text(weight: "bold")[13. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 26: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[D) #raw("D. Si ninguna es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[14. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 4: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[D) #raw("A. Si la primera es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[15. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 18: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[D) #raw("B. Si la segunda es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[16. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 28: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("C. Si ambas son verdaderas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[17. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 24: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("C. Si ambas son verdaderas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[18. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 2: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("B. Si la segunda es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[19. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 8: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[B) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("B. Si la segunda es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[20. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 10: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("C. Si ambas son verdaderas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[21. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 20: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[B) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("B. Si la segunda es verdadera", block: false)]\
  ]
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("VERDADERO O FALSO COMPLEJAS", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Seleccione la opción correcta de acuerdo con la siguiente clave:", block: false)]\
#text(weight: "regular")[#raw("A: 1, 2 y 3 son verdaderas.", block: false)]\
#text(weight: "regular")[#raw("B: 1 y 3 son verdaderas.", block: false)]\
#text(weight: "regular")[#raw("C: 2 y 4 son verdaderas.", block: false)]\
#text(weight: "regular")[#raw("D: Solo 4 es verdadera.", block: false)]\
#text(weight: "regular")[#raw("E: Todas son verdaderas.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[22. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 17: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[C) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("1, 2 y 3 son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[23. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 3: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1, 2 y 3 son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[C) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("Todas son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[24. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 15: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[B) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[C) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("1, 2 y 3 son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[25. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 9: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[C) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[D) #raw("1, 2 y 3 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("2 y 4 son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[26. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 7: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1, 2 y 3 son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[C) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("1 y 3 son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[27. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 11: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[B) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[C) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("1, 2 y 3 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("Todas son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[28. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 25: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[C) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[D) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("1, 2 y 3 son correctas", block: false)]\
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
  #box[#text(weight: "bold")[29. #raw("___", block: false)]] #h(0.25em)#raw("Problema Difícil 3: Calcule la pérdida en el espacio libre (FSPL) para un enlace a 5 GHz a 10 km: ", block: false) + $  "FSPL" = 20 log(d) + 20 log(f) + 92.45  $\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("112.4 dB", block: false)]\
    #text(weight: "regular")[B) #raw("150.0 dB", block: false)]\
    #text(weight: "regular")[C) #raw("140.2 dB", block: false)]\
    #text(weight: "regular")[D) #raw("98.5 dB", block: false)]\
    #text(weight: "regular")[E) #raw("126.4 dB", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[30. #raw("___", block: false)]] #h(0.25em)#raw("Problema Difícil 4: Calcule la pérdida en el espacio libre (FSPL) para un enlace a 5 GHz a 10 km: ", block: false) + $  "FSPL" = 20 log(d) + 20 log(f) + 92.45  $\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("98.5 dB", block: false)]\
    #text(weight: "regular")[B) #raw("126.4 dB", block: false)]\
    #text(weight: "regular")[C) #raw("112.4 dB", block: false)]\
    #text(weight: "regular")[D) #raw("140.2 dB", block: false)]\
    #text(weight: "regular")[E) #raw("150.0 dB", block: false)]\
  ]
]

#pagebreak(to: "odd")
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
        #raw("OQUENDO CORIA VALERIA YHISSEL", block: false)\
        #text(size: 15pt, weight: "bold")[1112461]
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
  [NOMBRE: #raw("OQUENDO CORIA VALERIA YHISSEL", block: false)], [CARRERA: #raw("LICENCIATURA EN INGENIERÍA DE SISTEMAS", block: false)],
  [MATERIA: #raw("INGLÉS TÉCNICO II", block: false)], [GRUPO: #raw("TA-01", block: false)    SEMESTRE: #raw("2", block: false)],
  [DOCENTE: #raw("DOCENTE SEA (CI 5235947)", block: false)], [EXAMEN: #raw("1ER PARCIAL", block: false)],
  [FECHA: #raw("28/08/2026", block: false)], [HORA: #raw("12:45 - 14:15", block: false)],
  [FIRMA DEL ESTUDIANTE: #h(1em)........................................],
  [CODIGO: #text(size: 15pt)[#raw("1112461", block: false)]],
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
  #box[#text(weight: "bold")[1. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 3: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Cifrado de datos", block: false)]\
    #text(weight: "regular")[B) #raw("Direccionamiento físico (MAC) y control de flujo", block: false)]\
    #text(weight: "regular")[C) #raw("Compresión", block: false)]\
    #text(weight: "regular")[D) #raw("Control de sesiones", block: false)]\
    #text(weight: "regular")[E) #raw("Enrutamiento de paquetes", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[2. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 15: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Direccionamiento físico (MAC) y control de flujo", block: false)]\
    #text(weight: "regular")[B) #raw("Control de sesiones", block: false)]\
    #text(weight: "regular")[C) #raw("Cifrado de datos", block: false)]\
    #text(weight: "regular")[D) #raw("Enrutamiento de paquetes", block: false)]\
    #text(weight: "regular")[E) #raw("Compresión", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[3. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 7: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Compresión", block: false)]\
    #text(weight: "regular")[B) #raw("Control de sesiones", block: false)]\
    #text(weight: "regular")[C) #raw("Direccionamiento físico (MAC) y control de flujo", block: false)]\
    #text(weight: "regular")[D) #raw("Cifrado de datos", block: false)]\
    #text(weight: "regular")[E) #raw("Enrutamiento de paquetes", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[4. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 11: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Compresión", block: false)]\
    #text(weight: "regular")[B) #raw("Direccionamiento físico (MAC) y control de flujo", block: false)]\
    #text(weight: "regular")[C) #raw("Cifrado de datos", block: false)]\
    #text(weight: "regular")[D) #raw("Enrutamiento de paquetes", block: false)]\
    #text(weight: "regular")[E) #raw("Control de sesiones", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[5. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 6: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("80 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("64 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("106.6 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("128 Mbps", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[6. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 13: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("106.6 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("128 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("80 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("64 Mbps", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[7. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 11: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("64 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("106.6 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("128 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("80 Mbps", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[8. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 7: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("128 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("64 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("80 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("106.6 Mbps", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[9. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 14: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("80 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("64 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("128 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("106.6 Mbps", block: false)]\
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
  #box[#text(weight: "bold")[10. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 8: La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[11. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 14: La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[12. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 6: La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.", block: false)\
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
  #box[#text(weight: "bold")[13. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 26: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[D) #raw("D. Si ninguna es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[14. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 4: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[D) #raw("A. Si la primera es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[15. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 18: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[D) #raw("B. Si la segunda es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[16. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 28: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("C. Si ambas son verdaderas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[17. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 24: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("C. Si ambas son verdaderas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[18. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 2: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("B. Si la segunda es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[19. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 8: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[B) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("B. Si la segunda es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[20. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 10: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("C. Si ambas son verdaderas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[21. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 20: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[B) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("B. Si la segunda es verdadera", block: false)]\
  ]
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("VERDADERO O FALSO COMPLEJAS", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Seleccione la opción correcta de acuerdo con la siguiente clave:", block: false)]\
#text(weight: "regular")[#raw("A: 1, 2 y 3 son verdaderas.", block: false)]\
#text(weight: "regular")[#raw("B: 1 y 3 son verdaderas.", block: false)]\
#text(weight: "regular")[#raw("C: 2 y 4 son verdaderas.", block: false)]\
#text(weight: "regular")[#raw("D: Solo 4 es verdadera.", block: false)]\
#text(weight: "regular")[#raw("E: Todas son verdaderas.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[22. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 17: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[C) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("1, 2 y 3 son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[23. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 3: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1, 2 y 3 son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[C) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("Todas son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[24. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 15: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[B) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[C) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("1, 2 y 3 son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[25. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 9: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[C) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[D) #raw("1, 2 y 3 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("2 y 4 son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[26. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 7: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1, 2 y 3 son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[C) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("1 y 3 son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[27. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 11: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[B) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[C) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("1, 2 y 3 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("Todas son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[28. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 25: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[C) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[D) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("1, 2 y 3 son correctas", block: false)]\
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
  #box[#text(weight: "bold")[29. #raw("___", block: false)]] #h(0.25em)#raw("Problema Difícil 3: Calcule la pérdida en el espacio libre (FSPL) para un enlace a 5 GHz a 10 km: ", block: false) + $  "FSPL" = 20 log(d) + 20 log(f) + 92.45  $\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("112.4 dB", block: false)]\
    #text(weight: "regular")[B) #raw("150.0 dB", block: false)]\
    #text(weight: "regular")[C) #raw("140.2 dB", block: false)]\
    #text(weight: "regular")[D) #raw("98.5 dB", block: false)]\
    #text(weight: "regular")[E) #raw("126.4 dB", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[30. #raw("___", block: false)]] #h(0.25em)#raw("Problema Difícil 4: Calcule la pérdida en el espacio libre (FSPL) para un enlace a 5 GHz a 10 km: ", block: false) + $  "FSPL" = 20 log(d) + 20 log(f) + 92.45  $\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("98.5 dB", block: false)]\
    #text(weight: "regular")[B) #raw("126.4 dB", block: false)]\
    #text(weight: "regular")[C) #raw("112.4 dB", block: false)]\
    #text(weight: "regular")[D) #raw("140.2 dB", block: false)]\
    #text(weight: "regular")[E) #raw("150.0 dB", block: false)]\
  ]
]

#pagebreak(to: "odd")
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
        #raw("SILES AGREDA MICAELA", block: false)\
        #text(size: 15pt, weight: "bold")[1112651]
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
  [NOMBRE: #raw("SILES AGREDA MICAELA", block: false)], [CARRERA: #raw("LICENCIATURA EN INGENIERÍA DE SISTEMAS", block: false)],
  [MATERIA: #raw("INGLÉS TÉCNICO II", block: false)], [GRUPO: #raw("TA-01", block: false)    SEMESTRE: #raw("2", block: false)],
  [DOCENTE: #raw("DOCENTE SEA (CI 5235947)", block: false)], [EXAMEN: #raw("1ER PARCIAL", block: false)],
  [FECHA: #raw("28/08/2026", block: false)], [HORA: #raw("12:45 - 14:15", block: false)],
  [FIRMA DEL ESTUDIANTE: #h(1em)........................................],
  [CODIGO: #text(size: 15pt)[#raw("1112651", block: false)]],
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
  #box[#text(weight: "bold")[1. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 3: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Cifrado de datos", block: false)]\
    #text(weight: "regular")[B) #raw("Direccionamiento físico (MAC) y control de flujo", block: false)]\
    #text(weight: "regular")[C) #raw("Compresión", block: false)]\
    #text(weight: "regular")[D) #raw("Control de sesiones", block: false)]\
    #text(weight: "regular")[E) #raw("Enrutamiento de paquetes", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[2. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 15: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Direccionamiento físico (MAC) y control de flujo", block: false)]\
    #text(weight: "regular")[B) #raw("Control de sesiones", block: false)]\
    #text(weight: "regular")[C) #raw("Cifrado de datos", block: false)]\
    #text(weight: "regular")[D) #raw("Enrutamiento de paquetes", block: false)]\
    #text(weight: "regular")[E) #raw("Compresión", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[3. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 7: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Compresión", block: false)]\
    #text(weight: "regular")[B) #raw("Control de sesiones", block: false)]\
    #text(weight: "regular")[C) #raw("Direccionamiento físico (MAC) y control de flujo", block: false)]\
    #text(weight: "regular")[D) #raw("Cifrado de datos", block: false)]\
    #text(weight: "regular")[E) #raw("Enrutamiento de paquetes", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[4. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 11: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Compresión", block: false)]\
    #text(weight: "regular")[B) #raw("Direccionamiento físico (MAC) y control de flujo", block: false)]\
    #text(weight: "regular")[C) #raw("Cifrado de datos", block: false)]\
    #text(weight: "regular")[D) #raw("Enrutamiento de paquetes", block: false)]\
    #text(weight: "regular")[E) #raw("Control de sesiones", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[5. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 6: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("80 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("64 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("106.6 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("128 Mbps", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[6. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 13: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("106.6 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("128 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("80 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("64 Mbps", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[7. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 11: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("64 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("106.6 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("128 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("80 Mbps", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[8. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 7: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("128 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("64 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("80 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("106.6 Mbps", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[9. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 14: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("80 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("64 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("128 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("106.6 Mbps", block: false)]\
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
  #box[#text(weight: "bold")[10. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 8: La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[11. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 14: La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[12. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 6: La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.", block: false)\
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
  #box[#text(weight: "bold")[13. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 26: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[D) #raw("D. Si ninguna es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[14. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 4: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[D) #raw("A. Si la primera es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[15. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 18: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[D) #raw("B. Si la segunda es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[16. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 28: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("C. Si ambas son verdaderas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[17. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 24: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("C. Si ambas son verdaderas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[18. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 2: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("B. Si la segunda es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[19. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 8: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[B) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("B. Si la segunda es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[20. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 10: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("C. Si ambas son verdaderas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[21. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 20: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[B) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("B. Si la segunda es verdadera", block: false)]\
  ]
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("VERDADERO O FALSO COMPLEJAS", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Seleccione la opción correcta de acuerdo con la siguiente clave:", block: false)]\
#text(weight: "regular")[#raw("A: 1, 2 y 3 son verdaderas.", block: false)]\
#text(weight: "regular")[#raw("B: 1 y 3 son verdaderas.", block: false)]\
#text(weight: "regular")[#raw("C: 2 y 4 son verdaderas.", block: false)]\
#text(weight: "regular")[#raw("D: Solo 4 es verdadera.", block: false)]\
#text(weight: "regular")[#raw("E: Todas son verdaderas.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[22. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 17: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[C) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("1, 2 y 3 son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[23. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 3: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1, 2 y 3 son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[C) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("Todas son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[24. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 15: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[B) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[C) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("1, 2 y 3 son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[25. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 9: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[C) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[D) #raw("1, 2 y 3 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("2 y 4 son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[26. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 7: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1, 2 y 3 son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[C) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("1 y 3 son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[27. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 11: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[B) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[C) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("1, 2 y 3 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("Todas son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[28. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 25: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[C) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[D) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("1, 2 y 3 son correctas", block: false)]\
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
  #box[#text(weight: "bold")[29. #raw("___", block: false)]] #h(0.25em)#raw("Problema Difícil 3: Calcule la pérdida en el espacio libre (FSPL) para un enlace a 5 GHz a 10 km: ", block: false) + $  "FSPL" = 20 log(d) + 20 log(f) + 92.45  $\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("112.4 dB", block: false)]\
    #text(weight: "regular")[B) #raw("150.0 dB", block: false)]\
    #text(weight: "regular")[C) #raw("140.2 dB", block: false)]\
    #text(weight: "regular")[D) #raw("98.5 dB", block: false)]\
    #text(weight: "regular")[E) #raw("126.4 dB", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[30. #raw("___", block: false)]] #h(0.25em)#raw("Problema Difícil 4: Calcule la pérdida en el espacio libre (FSPL) para un enlace a 5 GHz a 10 km: ", block: false) + $  "FSPL" = 20 log(d) + 20 log(f) + 92.45  $\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("98.5 dB", block: false)]\
    #text(weight: "regular")[B) #raw("126.4 dB", block: false)]\
    #text(weight: "regular")[C) #raw("112.4 dB", block: false)]\
    #text(weight: "regular")[D) #raw("140.2 dB", block: false)]\
    #text(weight: "regular")[E) #raw("150.0 dB", block: false)]\
  ]
]

#pagebreak(to: "odd")
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
        #raw("ORTUÑO GUTIERREZ ALEXANDER MAURICIO", block: false)\
        #text(size: 15pt, weight: "bold")[1112745]
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
  [NOMBRE: #raw("ORTUÑO GUTIERREZ ALEXANDER MAURICIO", block: false)], [CARRERA: #raw("LICENCIATURA EN INGENIERÍA DE SISTEMAS", block: false)],
  [MATERIA: #raw("INGLÉS TÉCNICO II", block: false)], [GRUPO: #raw("TA-01", block: false)    SEMESTRE: #raw("2", block: false)],
  [DOCENTE: #raw("DOCENTE SEA (CI 5235947)", block: false)], [EXAMEN: #raw("1ER PARCIAL", block: false)],
  [FECHA: #raw("28/08/2026", block: false)], [HORA: #raw("12:45 - 14:15", block: false)],
  [FIRMA DEL ESTUDIANTE: #h(1em)........................................],
  [CODIGO: #text(size: 15pt)[#raw("1112745", block: false)]],
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
  #box[#text(weight: "bold")[1. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 3: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Cifrado de datos", block: false)]\
    #text(weight: "regular")[B) #raw("Direccionamiento físico (MAC) y control de flujo", block: false)]\
    #text(weight: "regular")[C) #raw("Compresión", block: false)]\
    #text(weight: "regular")[D) #raw("Control de sesiones", block: false)]\
    #text(weight: "regular")[E) #raw("Enrutamiento de paquetes", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[2. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 15: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Direccionamiento físico (MAC) y control de flujo", block: false)]\
    #text(weight: "regular")[B) #raw("Control de sesiones", block: false)]\
    #text(weight: "regular")[C) #raw("Cifrado de datos", block: false)]\
    #text(weight: "regular")[D) #raw("Enrutamiento de paquetes", block: false)]\
    #text(weight: "regular")[E) #raw("Compresión", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[3. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 7: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Compresión", block: false)]\
    #text(weight: "regular")[B) #raw("Control de sesiones", block: false)]\
    #text(weight: "regular")[C) #raw("Direccionamiento físico (MAC) y control de flujo", block: false)]\
    #text(weight: "regular")[D) #raw("Cifrado de datos", block: false)]\
    #text(weight: "regular")[E) #raw("Enrutamiento de paquetes", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[4. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 11: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Compresión", block: false)]\
    #text(weight: "regular")[B) #raw("Direccionamiento físico (MAC) y control de flujo", block: false)]\
    #text(weight: "regular")[C) #raw("Cifrado de datos", block: false)]\
    #text(weight: "regular")[D) #raw("Enrutamiento de paquetes", block: false)]\
    #text(weight: "regular")[E) #raw("Control de sesiones", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[5. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 6: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("80 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("64 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("106.6 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("128 Mbps", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[6. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 13: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("106.6 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("128 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("80 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("64 Mbps", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[7. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 11: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("64 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("106.6 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("128 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("80 Mbps", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[8. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 7: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("128 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("64 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("80 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("106.6 Mbps", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[9. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Difícil 14: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("80 Mbps", block: false)]\
    #text(weight: "regular")[B) #raw("64 Mbps", block: false)]\
    #text(weight: "regular")[C) #raw("160 Mbps", block: false)]\
    #text(weight: "regular")[D) #raw("128 Mbps", block: false)]\
    #text(weight: "regular")[E) #raw("106.6 Mbps", block: false)]\
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
  #box[#text(weight: "bold")[10. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 8: La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[11. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 14: La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[12. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Fácil 6: La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.", block: false)\
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
  #box[#text(weight: "bold")[13. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 26: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[D) #raw("D. Si ninguna es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[14. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 4: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[D) #raw("A. Si la primera es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[15. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 18: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[D) #raw("B. Si la segunda es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[16. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 28: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("C. Si ambas son verdaderas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[17. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 24: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("C. Si ambas son verdaderas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[18. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 2: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("B. Si la segunda es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[19. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 8: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[B) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("B. Si la segunda es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[20. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 10: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("B. Si la segunda es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("C. Si ambas son verdaderas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[21. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 20: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("C. Si ambas son verdaderas", block: false)]\
    #text(weight: "regular")[B) #raw("D. Si ninguna es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("A. Si la primera es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("B. Si la segunda es verdadera", block: false)]\
  ]
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("VERDADERO O FALSO COMPLEJAS", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Seleccione la opción correcta de acuerdo con la siguiente clave:", block: false)]\
#text(weight: "regular")[#raw("A: 1, 2 y 3 son verdaderas.", block: false)]\
#text(weight: "regular")[#raw("B: 1 y 3 son verdaderas.", block: false)]\
#text(weight: "regular")[#raw("C: 2 y 4 son verdaderas.", block: false)]\
#text(weight: "regular")[#raw("D: Solo 4 es verdadera.", block: false)]\
#text(weight: "regular")[#raw("E: Todas son verdaderas.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[22. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 17: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[C) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("1, 2 y 3 son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[23. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 3: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1, 2 y 3 son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[C) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("Todas son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[24. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 15: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[B) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[C) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("1, 2 y 3 son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[25. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 9: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[C) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[D) #raw("1, 2 y 3 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("2 y 4 son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[26. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 7: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1, 2 y 3 son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[C) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("1 y 3 son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[27. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 11: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[B) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[C) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[D) #raw("1, 2 y 3 son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("Todas son correctas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[28. #raw("___", block: false)]] #h(0.25em)#raw("Pregunta Media 25: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1 y 3 son correctas", block: false)]\
    #text(weight: "regular")[B) #raw("2 y 4 son correctas", block: false)]\
    #text(weight: "regular")[C) #raw("Solo 4 es correcta", block: false)]\
    #text(weight: "regular")[D) #raw("Todas son correctas", block: false)]\
    #text(weight: "regular")[E) #raw("1, 2 y 3 son correctas", block: false)]\
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
  #box[#text(weight: "bold")[29. #raw("___", block: false)]] #h(0.25em)#raw("Problema Difícil 3: Calcule la pérdida en el espacio libre (FSPL) para un enlace a 5 GHz a 10 km: ", block: false) + $  "FSPL" = 20 log(d) + 20 log(f) + 92.45  $\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("112.4 dB", block: false)]\
    #text(weight: "regular")[B) #raw("150.0 dB", block: false)]\
    #text(weight: "regular")[C) #raw("140.2 dB", block: false)]\
    #text(weight: "regular")[D) #raw("98.5 dB", block: false)]\
    #text(weight: "regular")[E) #raw("126.4 dB", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[30. #raw("___", block: false)]] #h(0.25em)#raw("Problema Difícil 4: Calcule la pérdida en el espacio libre (FSPL) para un enlace a 5 GHz a 10 km: ", block: false) + $  "FSPL" = 20 log(d) + 20 log(f) + 92.45  $\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("98.5 dB", block: false)]\
    #text(weight: "regular")[B) #raw("126.4 dB", block: false)]\
    #text(weight: "regular")[C) #raw("112.4 dB", block: false)]\
    #text(weight: "regular")[D) #raw("140.2 dB", block: false)]\
    #text(weight: "regular")[E) #raw("150.0 dB", block: false)]\
  ]
]
