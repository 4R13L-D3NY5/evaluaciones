#set page(
  width: 21.59cm,
  height: 33.02cm,
  margin: (x: 1.8cm, top: 1.4cm, bottom: 1.4cm),
  header: context {
    let p = counter(page).get().first()
    if p > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [#text(fill: luma(90))[EXAMEN OFICIAL · #text(weight: "bold")[0000000]]],
        [#text(fill: luma(90))[PÁG. #p]]
      )
      v(-4pt)
      line(length: 100%, stroke: 0.4pt + luma(150))
    }
  },
  footer: none
)

#set text(
  font: "Times New Roman",
  size: 11pt,
  lang: "es"
)

#set par(leading: 1em, spacing: 1em)

// CABECERA INSTITUCIONAL + DATOS DEL ESTUDIANTE
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

#v(-5pt)

#table(
  columns: (58%, 42%),
  stroke: 0.5pt + black,
  fill: none,
  inset: (x: 5pt, y: 2.2pt),
  [*NOMBRE:* EXAMEN OFICIAL],
  [*CARRERA:* LICENCIATURA EN INGENIERÍA DE SISTEMAS],
  [*MATERIA:* [SIS-125] INGLÉS TÉCNICO II],
  [*GRUPO:* TA-01 #h(10pt) *SEMESTRE:* 2],
  [*DOCENTE:* DOCENTE SEA (CI 5235947)],
  [*EXAMEN:* 1ER PARCIAL],
  [*FECHA:* 28/08/2026],
  [*HORA:* 12:45 - 14:15],
  [
    *FIRMA DEL ESTUDIANTE:* \
    #v(10pt)
    #line(length: 100%, stroke: (dash: "dotted", thickness: 0.85pt))
  ],
  [
    *CODIGO:* \
    #v(-2pt)
    #align(center)[#text(weight: "bold")[0000000]]
  ]
)

#v(0.8em)
#align(center)[
  #text(weight: "bold")[CUESTIONARIO DE PREGUNTAS (30)]
]

#v(0.35em)
#line(length: 100%, stroke: 0.75pt + black)
#v(1em)

#v(4pt)
#text(weight: "bold")[SELECCIÓN DE LA MEJOR RESPUESTA]\
#text(style: "italic")[Instrucciones: Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.]
#v(1.5pt)

#block(breakable: false, spacing: 1.5em)[
  *1.* #raw("___", block: false) #raw("Pregunta Fácil 1: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #h(1em) *A)* #raw("Cifrado de datos", block: false)\
  #h(1em) *B)* #raw("Control de sesiones", block: false)\
  #h(1em) *C)* #raw("Enrutamiento de paquetes", block: false)\
  #h(1em) *D)* #raw("Compresión", block: false)\
  #h(1em) *E)* #raw("Direccionamiento físico (MAC) y control de flujo", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *2.* #raw("___", block: false) #raw("Pregunta Fácil 5: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #h(1em) *A)* #raw("Control de sesiones", block: false)\
  #h(1em) *B)* #raw("Direccionamiento físico (MAC) y control de flujo", block: false)\
  #h(1em) *C)* #raw("Cifrado de datos", block: false)\
  #h(1em) *D)* #raw("Enrutamiento de paquetes", block: false)\
  #h(1em) *E)* #raw("Compresión", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *3.* #raw("___", block: false) #raw("Pregunta Fácil 3: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #h(1em) *A)* #raw("Compresión", block: false)\
  #h(1em) *B)* #raw("Control de sesiones", block: false)\
  #h(1em) *C)* #raw("Direccionamiento físico (MAC) y control de flujo", block: false)\
  #h(1em) *D)* #raw("Enrutamiento de paquetes", block: false)\
  #h(1em) *E)* #raw("Cifrado de datos", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *4.* #raw("___", block: false) #raw("Pregunta Fácil 11: ¿Cuál es la función principal de la capa de enlace de datos en el modelo OSI?", block: false)\
  #h(1em) *A)* #raw("Cifrado de datos", block: false)\
  #h(1em) *B)* #raw("Enrutamiento de paquetes", block: false)\
  #h(1em) *C)* #raw("Control de sesiones", block: false)\
  #h(1em) *D)* #raw("Direccionamiento físico (MAC) y control de flujo", block: false)\
  #h(1em) *E)* #raw("Compresión", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *5.* #raw("___", block: false) #raw("Pregunta Difícil 11: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #h(1em) *A)* #raw("64 Mbps", block: false)\
  #h(1em) *B)* #raw("106.6 Mbps", block: false)\
  #h(1em) *C)* #raw("160 Mbps", block: false)\
  #h(1em) *D)* #raw("128 Mbps", block: false)\
  #h(1em) *E)* #raw("80 Mbps", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *6.* #raw("___", block: false) #raw("Pregunta Difícil 14: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #h(1em) *A)* #raw("106.6 Mbps", block: false)\
  #h(1em) *B)* #raw("128 Mbps", block: false)\
  #h(1em) *C)* #raw("80 Mbps", block: false)\
  #h(1em) *D)* #raw("160 Mbps", block: false)\
  #h(1em) *E)* #raw("64 Mbps", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *7.* #raw("___", block: false) #raw("Pregunta Difícil 9: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #h(1em) *A)* #raw("106.6 Mbps", block: false)\
  #h(1em) *B)* #raw("64 Mbps", block: false)\
  #h(1em) *C)* #raw("160 Mbps", block: false)\
  #h(1em) *D)* #raw("128 Mbps", block: false)\
  #h(1em) *E)* #raw("80 Mbps", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *8.* #raw("___", block: false) #raw("Pregunta Difícil 15: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #h(1em) *A)* #raw("160 Mbps", block: false)\
  #h(1em) *B)* #raw("64 Mbps", block: false)\
  #h(1em) *C)* #raw("128 Mbps", block: false)\
  #h(1em) *D)* #raw("80 Mbps", block: false)\
  #h(1em) *E)* #raw("106.6 Mbps", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *9.* #raw("___", block: false) #raw("Pregunta Difícil 6: En una modulación 256-QAM con ancho de banda de 20 MHz y factor roll-off 0.25, la tasa binaria neta alcanzable es:", block: false)\
  #h(1em) *A)* #raw("128 Mbps", block: false)\
  #h(1em) *B)* #raw("80 Mbps", block: false)\
  #h(1em) *C)* #raw("106.6 Mbps", block: false)\
  #h(1em) *D)* #raw("160 Mbps", block: false)\
  #h(1em) *E)* #raw("64 Mbps", block: false)\
]

#v(4pt)
#text(weight: "bold")[FALSO O VERDADERO]\
#text(style: "italic")[Instrucciones: Determine si cada afirmación es verdadera (A) o falsa (B).]
#v(1.5pt)

#block(breakable: false, spacing: 1.5em)[
  *10.* #raw("___", block: false) #raw("Pregunta Fácil 2: La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.", block: false)\
  #h(1em) *A)* #raw("Falso", block: false)\
  #h(1em) *B)* #raw("Verdadero", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *11.* #raw("___", block: false) #raw("Pregunta Fácil 12: La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.", block: false)\
  #h(1em) *A)* #raw("Falso", block: false)\
  #h(1em) *B)* #raw("Verdadero", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *12.* #raw("___", block: false) #raw("Pregunta Fácil 4: La fibra óptica monomodo presenta menor atenuación que la multimodo a largas distancias.", block: false)\
  #h(1em) *A)* #raw("Verdadero", block: false)\
  #h(1em) *B)* #raw("Falso", block: false)\
]

#v(4pt)
#text(weight: "bold")[PREMISAS A / B / AMBAS / NINGUNA]\
#text(style: "italic")[Instrucciones: Analice las dos premisas planteadas y elija la opción correcta.]
#v(1.5pt)

#block(breakable: false, spacing: 1.5em)[
  *13.* #raw("___", block: false) #raw("Pregunta Media 8: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #h(1em) *A)* #raw("B. Si la segunda es verdadera", block: false)\
  #h(1em) *B)* #raw("D. Si ninguna es verdadera", block: false)\
  #h(1em) *C)* #raw("A. Si la primera es verdadera", block: false)\
  #h(1em) *D)* #raw("C. Si ambas son verdaderas", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *14.* #raw("___", block: false) #raw("Pregunta Media 6: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #h(1em) *A)* #raw("B. Si la segunda es verdadera", block: false)\
  #h(1em) *B)* #raw("A. Si la primera es verdadera", block: false)\
  #h(1em) *C)* #raw("D. Si ninguna es verdadera", block: false)\
  #h(1em) *D)* #raw("C. Si ambas son verdaderas", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *15.* #raw("___", block: false) #raw("Pregunta Media 26: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #h(1em) *A)* #raw("D. Si ninguna es verdadera", block: false)\
  #h(1em) *B)* #raw("A. Si la primera es verdadera", block: false)\
  #h(1em) *C)* #raw("C. Si ambas son verdaderas", block: false)\
  #h(1em) *D)* #raw("B. Si la segunda es verdadera", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *16.* #raw("___", block: false) #raw("Pregunta Media 30: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #h(1em) *A)* #raw("C. Si ambas son verdaderas", block: false)\
  #h(1em) *B)* #raw("A. Si la primera es verdadera", block: false)\
  #h(1em) *C)* #raw("D. Si ninguna es verdadera", block: false)\
  #h(1em) *D)* #raw("B. Si la segunda es verdadera", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *17.* #raw("___", block: false) #raw("Pregunta Media 14: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #h(1em) *A)* #raw("C. Si ambas son verdaderas", block: false)\
  #h(1em) *B)* #raw("B. Si la segunda es verdadera", block: false)\
  #h(1em) *C)* #raw("D. Si ninguna es verdadera", block: false)\
  #h(1em) *D)* #raw("A. Si la primera es verdadera", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *18.* #raw("___", block: false) #raw("Pregunta Media 10: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #h(1em) *A)* #raw("A. Si la primera es verdadera", block: false)\
  #h(1em) *B)* #raw("D. Si ninguna es verdadera", block: false)\
  #h(1em) *C)* #raw("B. Si la segunda es verdadera", block: false)\
  #h(1em) *D)* #raw("C. Si ambas son verdaderas", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *19.* #raw("___", block: false) #raw("Pregunta Media 16: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #h(1em) *A)* #raw("C. Si ambas son verdaderas", block: false)\
  #h(1em) *B)* #raw("B. Si la segunda es verdadera", block: false)\
  #h(1em) *C)* #raw("D. Si ninguna es verdadera", block: false)\
  #h(1em) *D)* #raw("A. Si la primera es verdadera", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *20.* #raw("___", block: false) #raw("Pregunta Media 22: I. El retardo de propagación depende de la distancia.
II. El retardo de transmisión depende de la tasa de bits.", block: false)\
  #h(1em) *A)* #raw("D. Si ninguna es verdadera", block: false)\
  #h(1em) *B)* #raw("C. Si ambas son verdaderas", block: false)\
  #h(1em) *C)* #raw("A. Si la primera es verdadera", block: false)\
  #h(1em) *D)* #raw("B. Si la segunda es verdadera", block: false)\
]

#v(4pt)
#text(weight: "bold")[PREGUNTAS CON CLAVE DE RESPUESTA]\
#text(style: "italic")[Instrucciones: Marque: A si 1, 2 y 3 son correctas; B si 1 y 3; C si 2 y 4; D si solo 4; E si todas son correctas.]
#v(1.5pt)

#block(breakable: false, spacing: 1.5em)[
  *21.* #raw("___", block: false) #raw("Pregunta Media 11: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #h(1em) *A)* #raw("1 y 3 son correctas", block: false)\
  #h(1em) *B)* #raw("Todas son correctas", block: false)\
  #h(1em) *C)* #raw("2 y 4 son correctas", block: false)\
  #h(1em) *D)* #raw("1, 2 y 3 son correctas", block: false)\
  #h(1em) *E)* #raw("Solo 4 es correcta", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *22.* #raw("___", block: false) #raw("Pregunta Media 9: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #h(1em) *A)* #raw("Todas son correctas", block: false)\
  #h(1em) *B)* #raw("1 y 3 son correctas", block: false)\
  #h(1em) *C)* #raw("1, 2 y 3 son correctas", block: false)\
  #h(1em) *D)* #raw("2 y 4 son correctas", block: false)\
  #h(1em) *E)* #raw("Solo 4 es correcta", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *23.* #raw("___", block: false) #raw("Pregunta Media 17: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #h(1em) *A)* #raw("2 y 4 son correctas", block: false)\
  #h(1em) *B)* #raw("Solo 4 es correcta", block: false)\
  #h(1em) *C)* #raw("1, 2 y 3 son correctas", block: false)\
  #h(1em) *D)* #raw("Todas son correctas", block: false)\
  #h(1em) *E)* #raw("1 y 3 son correctas", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *24.* #raw("___", block: false) #raw("Pregunta Media 5: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #h(1em) *A)* #raw("2 y 4 son correctas", block: false)\
  #h(1em) *B)* #raw("Solo 4 es correcta", block: false)\
  #h(1em) *C)* #raw("1, 2 y 3 son correctas", block: false)\
  #h(1em) *D)* #raw("1 y 3 son correctas", block: false)\
  #h(1em) *E)* #raw("Todas son correctas", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *25.* #raw("___", block: false) #raw("Pregunta Media 21: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #h(1em) *A)* #raw("Todas son correctas", block: false)\
  #h(1em) *B)* #raw("1, 2 y 3 son correctas", block: false)\
  #h(1em) *C)* #raw("Solo 4 es correcta", block: false)\
  #h(1em) *D)* #raw("2 y 4 son correctas", block: false)\
  #h(1em) *E)* #raw("1 y 3 son correctas", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *26.* #raw("___", block: false) #raw("Pregunta Media 7: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #h(1em) *A)* #raw("Todas son correctas", block: false)\
  #h(1em) *B)* #raw("2 y 4 son correctas", block: false)\
  #h(1em) *C)* #raw("Solo 4 es correcta", block: false)\
  #h(1em) *D)* #raw("1 y 3 son correctas", block: false)\
  #h(1em) *E)* #raw("1, 2 y 3 son correctas", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *27.* #raw("___", block: false) #raw("Pregunta Media 25: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #h(1em) *A)* #raw("1 y 3 son correctas", block: false)\
  #h(1em) *B)* #raw("Todas son correctas", block: false)\
  #h(1em) *C)* #raw("Solo 4 es correcta", block: false)\
  #h(1em) *D)* #raw("1, 2 y 3 son correctas", block: false)\
  #h(1em) *E)* #raw("2 y 4 son correctas", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *28.* #raw("___", block: false) #raw("Pregunta Media 27: Características de la modulación OFDM: 1. Alta eficiencia espectral, 2. Resistencia al desvanecimiento, 3. Baja ISI, 4. Nula PAPR.", block: false)\
  #h(1em) *A)* #raw("2 y 4 son correctas", block: false)\
  #h(1em) *B)* #raw("1, 2 y 3 son correctas", block: false)\
  #h(1em) *C)* #raw("Solo 4 es correcta", block: false)\
  #h(1em) *D)* #raw("Todas son correctas", block: false)\
  #h(1em) *E)* #raw("1 y 3 son correctas", block: false)\
]

#v(4pt)
#text(weight: "bold")[CASOS PRÁCTICOS Y PROBLEMAS APLICADOS]\
#rect(width: 100%, stroke: 0.5pt + luma(100), fill: rgb("#f8fafc"), inset: 3.5pt)[
  [*CASO PRÁCTICO:* Resuelva el caso planteado aplicando la normativa y procedimientos correspondientes.]
]
#v(1.5pt)

#block(breakable: false, spacing: 1.5em)[
  *29.* #raw("___", block: false) #raw("Problema Difícil 2: Calcule la pérdida en el espacio libre (FSPL) para un enlace a 5 GHz a 10 km: ", block: false) + $  "FSPL" = 20 log(d) + 20 log(f) + 92.45  $\
  #h(1em) *A)* #raw("98.5 dB", block: false)\
  #h(1em) *B)* #raw("126.4 dB", block: false)\
  #h(1em) *C)* #raw("112.4 dB", block: false)\
  #h(1em) *D)* #raw("150.0 dB", block: false)\
  #h(1em) *E)* #raw("140.2 dB", block: false)\
]

#block(breakable: false, spacing: 1.5em)[
  *30.* #raw("___", block: false) #raw("Problema Difícil 5: Calcule la pérdida en el espacio libre (FSPL) para un enlace a 5 GHz a 10 km: ", block: false) + $  "FSPL" = 20 log(d) + 20 log(f) + 92.45  $\
  #h(1em) *A)* #raw("126.4 dB", block: false)\
  #h(1em) *B)* #raw("150.0 dB", block: false)\
  #h(1em) *C)* #raw("98.5 dB", block: false)\
  #h(1em) *D)* #raw("112.4 dB", block: false)\
  #h(1em) *E)* #raw("140.2 dB", block: false)\
]
