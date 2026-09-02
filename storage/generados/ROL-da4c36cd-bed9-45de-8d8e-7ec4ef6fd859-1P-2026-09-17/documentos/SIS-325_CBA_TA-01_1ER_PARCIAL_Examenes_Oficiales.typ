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
        #raw("FLORES RODRIGUEZ ELIAS JOSUE", block: false)\
        #text(size: 15pt, weight: "bold")[1108624]
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
  [NOMBRE: #raw("FLORES RODRIGUEZ ELIAS JOSUE", block: false)], [CARRERA: #raw("LICENCIATURA EN INGENIERÍA DE SISTEMAS", block: false)],
  [MATERIA: #raw("TALLER DE REDES", block: false)], [GRUPO: #raw("TA-01", block: false)    SEMESTRE: #raw("6", block: false)],
  [DOCENTE: #raw("AMILKAR JESUS MIRANDA ROMERO", block: false)], [EXAMEN: #raw("1ER PARCIAL", block: false)],
  [FECHA: #raw("01/09/2026", block: false)], [HORA: #raw("08:15 - 09:45", block: false)],
  [FIRMA DEL ESTUDIANTE: #h(1em)........................................],
  [CODIGO: #text(size: 15pt)[#raw("1108624", block: false)]],
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
  #box[#text(weight: "bold")[1. #raw("___", block: false)]] #h(0.25em)#raw("¿Cómo se denomina al lado opuesto al ángulo recto en un triángulo rectángulo?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Hipotenusa", block: false)]\
    #text(weight: "regular")[B) #raw("Cateto adyacente", block: false)]\
    #text(weight: "regular")[C) #raw("Bisectriz", block: false)]\
    #text(weight: "regular")[D) #raw("Segmento de recta", block: false)]\
    #text(weight: "regular")[E) #raw("Cateto opuesto", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[2. #raw("___", block: false)]] #h(0.25em)#raw("En un triángulo rectángulo, si conoces la longitud de la hipotenusa y uno de los catetos, ¿qué procedimiento matemático aplicarías para hallar el cateto faltante?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Sumar los cuadrados de los lados conocidos.", block: false)]\
    #text(weight: "regular")[B) #raw("Multiplicar los lados conocidos.", block: false)]\
    #text(weight: "regular")[C) #raw("Dividir la hipotenusa entre el cateto.", block: false)]\
    #text(weight: "regular")[D) #raw("Restar el cuadrado del cateto conocido al cuadrado de la hipotenusa y extraer la raíz cuadrada.", block: false)]\
    #text(weight: "regular")[E) #raw("Ninguna opcion es correcta", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[3. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es el rango (conjunto de valores posibles) de las funciones seno y coseno en su forma básica?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("De 1/2 π a 3/2 π.", block: false)]\
    #text(weight: "regular")[B) #raw("De -π a π.", block: false)]\
    #text(weight: "regular")[C) #raw("De menos infinito a infinito.", block: false)]\
    #text(weight: "regular")[D) #raw("De 0 a 1, incluyendo ambos valores.", block: false)]\
    #text(weight: "regular")[E) #raw("De -1 a 1, incluyendo ambos valores.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[4. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué diferencia principal existe entre una inecuación con símbolo \"mayor o igual que\" frente a una con \"mayor que\"?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Depende de la funcion", block: false)]\
    #text(weight: "regular")[B) #raw("La primera incluye los puntos de la recta límite en la solución, la segunda no.", block: false)]\
    #text(weight: "regular")[C) #raw("No hay diferencia, ambas representan exactamente lo mismo.", block: false)]\
    #text(weight: "regular")[D) #raw("La primera requiere una línea punteada y la segunda una línea sólida.", block: false)]\
    #text(weight: "regular")[E) #raw("La primera siempre se sombra hacia la derecha y la segunda hacia la izquierda.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[5. #raw("___", block: false)]] #h(0.25em)#raw("Si se afirma que el logaritmo de un número es una \"herramienta de búsqueda\", ¿qué es exactamente lo que estamos intentando encontrar al calcular un logaritmo?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("No tiene relacion", block: false)]\
    #text(weight: "regular")[B) #raw("El valor de la base que, al elevarse a una potencia dada, resulta en el número original.", block: false)]\
    #text(weight: "regular")[C) #raw("La relación inversa entre la potencia y la raíz cuadrada del número.", block: false)]\
    #text(weight: "regular")[D) #raw("El número de veces que la base debe multiplicarse por sí misma para obtener el logaritmo.", block: false)]\
    #text(weight: "regular")[E) #raw("El exponente necesario para que una base dada, al ser elevada a ese valor, resulte en el número original.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[6. #raw("___", block: false)]] #h(0.25em)#raw("Si un punto tiene una coordenada polar con un ángulo de 225°, ¿en qué cuadrante del plano cartesiano se encuentra?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Cuadrante II", block: false)]\
    #text(weight: "regular")[B) #raw("Cuadrante I", block: false)]\
    #text(weight: "regular")[C) #raw("Cuadrante IV", block: false)]\
    #text(weight: "regular")[D) #raw("Cuadrante III", block: false)]\
    #text(weight: "regular")[E) #raw("Cuadrante III y IV", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[7. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué ocurre con el valor de la función tangente si el ángulo se acerca progresivamente a noventa grados?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Su valor se vuelve positivo.", block: false)]\
    #text(weight: "regular")[B) #raw("Su valor se mantiene constante.", block: false)]\
    #text(weight: "regular")[C) #raw("Su valor crece indefinidamente hacia el infinito.", block: false)]\
    #text(weight: "regular")[D) #raw("Su valor disminuye acercándose a cero.", block: false)]\
    #text(weight: "regular")[E) #raw("Su valor se vuelve negativo.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[8. #raw("___", block: false)]] #h(0.25em)#raw("Si tenemos una inecuación que involucra una fracción donde la variable está en el denominador, ¿por qué es peligroso multiplicar ambos lados por el denominador para despejar?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Porque el denominador siempre es un número primo.", block: false)]\
    #text(weight: "regular")[B) #raw("Porque las fracciones no pueden compararse mediante desigualdades.", block: false)]\
    #text(weight: "regular")[C) #raw("Errores de suma", block: false)]\
    #text(weight: "regular")[D) #raw("Porque siempre es más fácil trabajar con números decimales.", block: false)]\
    #text(weight: "regular")[E) #raw("Porque el denominador podría ser negativo, lo que obligaría a invertir la desigualdad, o podría ser cero, lo cual está prohibido.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[9. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué ocurre con el signo de la función coseno a medida que un ángulo aumenta desde 0° hasta 180°?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Pasa de ser negativo a ser positivo.", block: false)]\
    #text(weight: "regular")[B) #raw("Ninguna opcion es correcta", block: false)]\
    #text(weight: "regular")[C) #raw("Pasa de ser positivo a ser negativo.", block: false)]\
    #text(weight: "regular")[D) #raw("Siempre es positivo.", block: false)]\
    #text(weight: "regular")[E) #raw("Siempre es negativo.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[10. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué sucede con el conjunto solución cuando se elevan ambos miembros de una inecuación al cuadrado, asumiendo que ambos lados son positivos?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("La relación de orden se preserva.", block: false)]\
    #text(weight: "regular")[B) #raw("Los números positivos aparecen automáticamente en la solución.", block: false)]\
    #text(weight: "regular")[C) #raw("Los números negativos aparecen automáticamente en la solución.", block: false)]\
    #text(weight: "regular")[D) #raw("La relación de orden siempre se invierte.", block: false)]\
    #text(weight: "regular")[E) #raw("El resultado siempre es una contradicción.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[11. #raw("___", block: false)]] #h(0.25em)#raw("Si un ángulo se encuentra en el segundo cuadrante, ¿qué signos tienen respectivamente el seno y el coseno de dicho ángulo?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Positivo y positivo.", block: false)]\
    #text(weight: "regular")[B) #raw("Negativo y positivo.", block: false)]\
    #text(weight: "regular")[C) #raw("Positivo e indeterminado", block: false)]\
    #text(weight: "regular")[D) #raw("Positivo y negativo.", block: false)]\
    #text(weight: "regular")[E) #raw("Negativo y negativo.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[12. #raw("___", block: false)]] #h(0.25em)#raw("Si tienes el sistema formado por x + y = 5 y x - y = 1, ¿cuál es el valor de x?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("cuatro", block: false)]\
    #text(weight: "regular")[B) #raw("uno", block: false)]\
    #text(weight: "regular")[C) #raw("cinco", block: false)]\
    #text(weight: "regular")[D) #raw("tres", block: false)]\
    #text(weight: "regular")[E) #raw("dos", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[13. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué representa la solución de un sistema de inecuaciones con dos incógnitas?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Una línea recta específica en el plano cartesiano.", block: false)]\
    #text(weight: "regular")[B) #raw("Un único punto exacto donde se cruzan dos rectas.", block: false)]\
    #text(weight: "regular")[C) #raw("Todos los puntos que están sobre los ejes coordenados.", block: false)]\
    #text(weight: "regular")[D) #raw("Una región del plano donde se cumplen todas las desigualdades simultáneamente.", block: false)]\
    #text(weight: "regular")[E) #raw("Una región del plano donde la zonas pintadas son solucion.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[14. #raw("___", block: false)]] #h(0.25em)#raw("Considera una inecuación donde la expresión es un polinomio mayor que cero. Si el conjunto solución incluye el infinito positivo y negativo, pero excluye los puntos críticos, ¿qué característica debe tener el polinomio?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Debe tener al menos una raíz real.", block: false)]\
    #text(weight: "regular")[B) #raw("Debe tener todos sus puntos críticos con multiplicidad par.", block: false)]\
    #text(weight: "regular")[C) #raw("No existe solucion", block: false)]\
    #text(weight: "regular")[D) #raw("Debe ser una expresión que nunca sea negativa y que no se anule en ningún valor real.", block: false)]\
    #text(weight: "regular")[E) #raw("Debe ser de grado impar.", block: false)]\
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
  #box[#text(weight: "bold")[15. #raw("___", block: false)]] #h(0.25em)#raw("En una ecuación exponencial, la incógnita se encuentra exclusivamente en la base de la potencia.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[16. #raw("___", block: false)]] #h(0.25em)#raw("Si el número al que se le aplica el logaritmo es igual a la base, el resultado es siempre igual a uno.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[17. #raw("___", block: false)]] #h(0.25em)#raw("La base de un logaritmo convencional siempre puede ser cualquier número real, incluyendo los negativos.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[18. #raw("___", block: false)]] #h(0.25em)#raw("El resultado de un logaritmo nunca puede ser un número negativo, sin importar la base o el argumento", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[19. #raw("___", block: false)]] #h(0.25em)#raw("El logaritmo de un número negativo no está definido dentro del conjunto de los números reales.", block: false)\
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
  #box[#text(weight: "bold")[20. #raw("___", block: false)]] #h(0.25em)#raw("Seleccione los incisos correctos sobre propiedades de los logaritmos.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("La base de un logaritmo puede ser cualquier número positivo, incluido el número uno.", block: false)]\
    #text(weight: "regular")[B) #raw("Si cambias la base de un logaritmo, el resultado final del valor numérico cambia drásticamente, por lo que no existe una relación proporcional entre bases distintas.", block: false)]\
    #text(weight: "regular")[C) #raw("El logaritmo de un producto de dos números es igual a la suma de los logaritmos de cada uno de esos números por separado.", block: false)]\
    #text(weight: "regular")[D) #raw("No existen logaritmos de números negativos ni de cero en el conjunto de los números reales.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[21. #raw("___", block: false)]] #h(0.25em)#raw("Seleccione los incisos correctos sobre trigonometria:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Un radián es una unidad de medida angular equivalente a 180 grados.", block: false)]\
    #text(weight: "regular")[B) #raw("Si dos ángulos son complementarios, el seno de uno es igual al coseno del otro.", block: false)]\
    #text(weight: "regular")[C) #raw("El valor del seno de un ángulo puede ser mayor que 1.", block: false)]\
    #text(weight: "regular")[D) #raw("La función coseno es positiva en el primer y cuarto cuadrante.", block: false)]\
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
  [#text(weight: "regular")[#raw("De la lista de opciones, seleccione la respuesta correcta para cada enunciado", block: false)]]\\
  [#text(weight: "regular")[#raw("A) Secante", block: false)]]\\
  [#text(weight: "regular")[#raw("B) Coseno", block: false)]]\\
  [#text(weight: "regular")[#raw("C) Seno", block: false)]]\\
  [#text(weight: "regular")[#raw("D) Cosecante", block: false)]]\\
  [#text(weight: "regular")[#raw("E) Cotangente", block: false)]]
]
#v(1em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[22. #raw("___", block: false)]] #h(0.25em)#raw("Relación entre el cateto adyacente y la hipotenusa.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[23. #raw("___", block: false)]] #h(0.25em)#raw("Inverso multiplicativo del coseno.", block: false)\
]

#rect(width: 100%, stroke: 0.5pt + black, fill: rgb("#f8fafc"), inset: 3.5pt)[
  [#text(weight: "regular")[#raw("De la lista de opciones, seleccione la respuesta correcta para cada enunciado", block: false)]]\\
  [#text(weight: "regular")[#raw("A) x >=a", block: false)]]\\
  [#text(weight: "regular")[#raw("B) El conjunto solución de una inecuación", block: false)]]\\
  [#text(weight: "regular")[#raw("C) La propiedad de orden", block: false)]]\\
  [#text(weight: "regular")[#raw("D) x < a", block: false)]]\\
  [#text(weight: "regular")[#raw("E) a <= x <= b", block: false)]]
]
#v(1em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[24. #raw("___", block: false)]] #h(0.25em)#raw("Representa un intervalo cerrado, incluyendo ambos extremos.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[25. #raw("___", block: false)]] #h(0.25em)#raw("Gráficamente, se representa con un círculo abierto en a y una flecha hacia la izquierda.", block: false)\
]

#rect(width: 100%, stroke: 0.5pt + black, fill: rgb("#f8fafc"), inset: 3.5pt)[
  [#text(weight: "regular")[#raw("De la lista de opciones, seleccione la respuesta correcta para cada enunciado", block: false)]]\\
  [#text(weight: "regular")[#raw("A) Sistema incompatible", block: false)]]\\
  [#text(weight: "regular")[#raw("B) Sistema compatible indeterminado", block: false)]]\\
  [#text(weight: "regular")[#raw("C) Método de sustitución", block: false)]]\\
  [#text(weight: "regular")[#raw("D) Método de reducción", block: false)]]\\
  [#text(weight: "regular")[#raw("E) Sistema compatible determinado", block: false)]]
]
#v(1em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[26. #raw("___", block: false)]] #h(0.25em)#raw("Cuando las rectas son coincidentes y existen infinitas soluciones.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[27. #raw("___", block: false)]] #h(0.25em)#raw("El método que consiste en eliminar una variable mediante la suma o resta.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[28. #raw("___", block: false)]] #h(0.25em)#raw("Cuando las rectas se cortan en un único punto, existiendo una solución única", block: false)\
]

#rect(width: 100%, stroke: 0.5pt + black, fill: rgb("#f8fafc"), inset: 3.5pt)[
  [#text(weight: "regular")[#raw("Cuando las rectas se cortan en un único punto, existiendo una solución única", block: false)]]\\
  [#text(weight: "regular")[#raw("A) Ecuación lineal", block: false)]]\\
  [#text(weight: "regular")[#raw("B) Incógnita", block: false)]]\\
  [#text(weight: "regular")[#raw("C) Ecuación cuadrática", block: false)]]\\
  [#text(weight: "regular")[#raw("D) Sistema de ecuaciones", block: false)]]\\
  [#text(weight: "regular")[#raw("E) Raíz o solución", block: false)]]
]
#v(1em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[29. #raw("___", block: false)]] #h(0.25em)#raw("Conjunto de dos o más igualdades que comparten variables.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[30. #raw("___", block: false)]] #h(0.25em)#raw("Expresión de primer grado cuya representación gráfica es una recta.", block: false)\
]
