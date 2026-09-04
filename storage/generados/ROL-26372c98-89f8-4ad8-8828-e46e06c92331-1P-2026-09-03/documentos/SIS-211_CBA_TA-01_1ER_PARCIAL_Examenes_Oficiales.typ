#set text(
  font: "Libertinus Serif",
  size: 11pt,
  lang: "es"
)

#show raw: set text(font: "Libertinus Serif")

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
        #raw("PEREZ VALLEJOS GABRIELA", block: false)\
        #text(size: 15pt, weight: "bold")[1111448]
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
  [NOMBRE: #raw("PEREZ VALLEJOS GABRIELA", block: false)], [CARRERA: #raw("LICENCIATURA EN INGENIERÍA DE SISTEMAS", block: false)],
  [MATERIA: #raw("ECUACIONES DIFERENCIALES", block: false)], [GRUPO: #raw("TA-01", block: false)    SEMESTRE: #raw("3", block: false)],
  [DOCENTE: #raw("MAURICIO QUIROZ LAFUENTE", block: false)], [EXAMEN: #raw("1ER PARCIAL", block: false)],
  [FECHA: #raw("03/09/2026", block: false)], [HORA: #raw("08:15", block: false)],
  [FIRMA DEL ESTUDIANTE: #h(1em)........................................],
  [CODIGO: #text(size: 15pt)[#raw("1111448", block: false)]],
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
  #box[#text(weight: "bold")[1. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es el rango (conjunto de valores posibles) de las funciones seno y coseno en su forma básica?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("De 0 a 1, incluyendo ambos valores.", block: false)]\
    #text(weight: "regular")[B) #raw("De menos infinito a infinito.", block: false)]\
    #text(weight: "regular")[C) #raw("De 1/2 π a 3/2 π.", block: false)]\
    #text(weight: "regular")[D) #raw("De -π a π.", block: false)]\
    #text(weight: "regular")[E) #raw("De -1 a 1, incluyendo ambos valores.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[2. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál de las siguientes funciones trigonométricas presenta asíntotas verticales?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Tangente", block: false)]\
    #text(weight: "regular")[B) #raw("Cosecante", block: false)]\
    #text(weight: "regular")[C) #raw("Seno", block: false)]\
    #text(weight: "regular")[D) #raw("Coseno", block: false)]\
    #text(weight: "regular")[E) #raw("Secante", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[3. #raw("___", block: false)]] #h(0.25em)#raw("Si al graficar un sistema de inecuaciones observas que las áreas sombreadas de cada inecuación no se cruzan en ningún punto, ¿qué significa esto?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Las sobreas siempre se intersectan", block: false)]\
    #text(weight: "regular")[B) #raw("Que hubo un error al despejar las variables.", block: false)]\
    #text(weight: "regular")[C) #raw("Que el sistema tiene infinitas soluciones.", block: false)]\
    #text(weight: "regular")[D) #raw("Que el sistema tiene una única solución.", block: false)]\
    #text(weight: "regular")[E) #raw("Que el sistema no tiene solución (es inconsistente).", block: false)]\
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
  #box[#text(weight: "bold")[5. #raw("___", block: false)]] #h(0.25em)#raw("¿En qué cuadrante(s) el valor de la secante es negativo?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1ro y 4to", block: false)]\
    #text(weight: "regular")[B) #raw("2do y 3ro", block: false)]\
    #text(weight: "regular")[C) #raw("3do y 4ro", block: false)]\
    #text(weight: "regular")[D) #raw("1ro y 3ro", block: false)]\
    #text(weight: "regular")[E) #raw("1ro y 2do", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[6. #raw("___", block: false)]] #h(0.25em)#raw("Si una ecuación trigonométrica te lleva a un punto donde el seno es negativo y la tangente es positiva, ¿en qué cuadrante se sitúa la solución?", block: false)\
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
  #box[#text(weight: "bold")[7. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué representa la solución de un sistema de inecuaciones con dos incógnitas?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Todos los puntos que están sobre los ejes coordenados.", block: false)]\
    #text(weight: "regular")[B) #raw("Un único punto exacto donde se cruzan dos rectas.", block: false)]\
    #text(weight: "regular")[C) #raw("Una región del plano donde se cumplen todas las desigualdades simultáneamente.", block: false)]\
    #text(weight: "regular")[D) #raw("Una línea recta específica en el plano cartesiano.", block: false)]\
    #text(weight: "regular")[E) #raw("Una región del plano donde la zonas pintadas son solucion.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[8. #raw("___", block: false)]] #h(0.25em)#raw("Al analizar una inecuación de grado superior, ¿cuál es el significado geométrico de los puntos críticos encontrados tras factorizar el polinomio?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Son los puntos donde la expresión siempre es igual a cero.", block: false)]\
    #text(weight: "regular")[B) #raw("Son los puntos donde la gráfica de la función cruza o toca el eje horizontal, delimitando los intervalos donde el signo de la expresión puede cambiar.", block: false)]\
    #text(weight: "regular")[C) #raw("Son los puntos donde la gráfica de la función cruza o toca el eje vertical, delimitando los intervalos donde el signo de la expresión puede cambiar.", block: false)]\
    #text(weight: "regular")[D) #raw("Representan el valor máximo y mínimo absoluto de la función.", block: false)]\
    #text(weight: "regular")[E) #raw("Son los únicos valores que hacen que la inecuación sea negativa.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[9. #raw("___", block: false)]] #h(0.25em)#raw("Considera una inecuación donde la expresión es un polinomio mayor que cero. Si el conjunto solución incluye el infinito positivo y negativo, pero excluye los puntos críticos, ¿qué característica debe tener el polinomio?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Debe tener al menos una raíz real.", block: false)]\
    #text(weight: "regular")[B) #raw("No existe solucion", block: false)]\
    #text(weight: "regular")[C) #raw("Debe ser una expresión que nunca sea negativa y que no se anule en ningún valor real.", block: false)]\
    #text(weight: "regular")[D) #raw("Debe ser de grado impar.", block: false)]\
    #text(weight: "regular")[E) #raw("Debe tener todos sus puntos críticos con multiplicidad par.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[10. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es la implicación lógica de afirmar que el cociente de dos expresiones es mayor que cero?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Que ambas expresiones deben ser positivas al mismo tiempo, o ambas negativas al mismo tiempo.", block: false)]\
    #text(weight: "regular")[B) #raw("No existe solucion", block: false)]\
    #text(weight: "regular")[C) #raw("Que el resultado es siempre un número entero.", block: false)]\
    #text(weight: "regular")[D) #raw("Que el numerador es obligatoriamente positivo y el denominador negativo.", block: false)]\
    #text(weight: "regular")[E) #raw("Que el numerador debe ser mayor que el denominador.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[11. #raw("___", block: false)]] #h(0.25em)#raw("Si en un triángulo rectángulo uno de sus ángulos agudos mide el doble que el otro, ¿cuál es la relación entre las longitudes de los catetos?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Los catetos son iguales.", block: false)]\
    #text(weight: "regular")[B) #raw("El cateto mayor es raiz cuadrada de 3 veces el cateto menor.", block: false)]\
    #text(weight: "regular")[C) #raw("No se puede calcular", block: false)]\
    #text(weight: "regular")[D) #raw("El cateto mayor es el doble del cateto menor.", block: false)]\
    #text(weight: "regular")[E) #raw("La hipotenusa es el triple del cateto menor.", block: false)]\
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
  #box[#text(weight: "bold")[12. #raw("___", block: false)]] #h(0.25em)#raw("Seleccione los incisos correctos sobre las identidades trigonometricas:", block: false)\\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[1) #raw("Si se suma o resta un mismo número real a ambos lados de una inecuación, el sentido de la desigualdad no cambia.", block: false)]\\
    #text(weight: "regular")[2) #raw("Al multiplicar o dividir los dos miembros de una inecuación por un número negativo, la dirección de la desigualdad debe cambiarse para mantener la validez de la relación.", block: false)]\\
    #text(weight: "regular")[3) #raw("Si elevamos ambos miembros de una inecuación al cuadrado, el sentido de la desigualdad nunca cambia, independientemente del signo de los valores originales.", block: false)]\\
    #text(weight: "regular")[4) #raw("Si se multiplica o divide ambos lados de una inecuación por un número positivo, el sentido de la desigualdad se invierte.", block: false)]\\
  ]\\
  #v(0.4em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1, 2 y 3 son verdaderas.", block: false)]\\
    #text(weight: "regular")[B) #raw("1 y 3 son verdaderas.", block: false)]\\
    #text(weight: "regular")[C) #raw("2 y 4 son verdaderas.", block: false)]\\
    #text(weight: "regular")[D) #raw("Solo 4 es verdadera.", block: false)]\\
    #text(weight: "regular")[E) #raw("Todas son verdaderas.", block: false)]\\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[13. #raw("___", block: false)]] #h(0.25em)#raw("Seleccione los incisos correctos sobre trigonometria:", block: false)\\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[1) #raw("El valor del seno de un ángulo puede ser mayor que 1.", block: false)]\\
    #text(weight: "regular")[2) #raw("La función coseno es positiva en el primer y cuarto cuadrante.", block: false)]\\
    #text(weight: "regular")[3) #raw("Un radián es una unidad de medida angular equivalente a 180 grados.", block: false)]\\
    #text(weight: "regular")[4) #raw("Si dos ángulos son complementarios, el seno de uno es igual al coseno del otro.", block: false)]\\
  ]\\
  #v(0.4em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1, 2 y 3 son verdaderas.", block: false)]\\
    #text(weight: "regular")[B) #raw("1 y 3 son verdaderas.", block: false)]\\
    #text(weight: "regular")[C) #raw("2 y 4 son verdaderas.", block: false)]\\
    #text(weight: "regular")[D) #raw("Solo 4 es verdadera.", block: false)]\\
    #text(weight: "regular")[E) #raw("Todas son verdaderas.", block: false)]\\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[14. #raw("___", block: false)]] #h(0.25em)#raw("Seleccione los incisos correctos sobre sistemas de ecuaciones:", block: false)\\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[1) #raw("En un sistema de ecuaciones lineales, el punto de intersección de las gráficas representa los valores que satisfacen simultáneamente todas las ecuaciones.", block: false)]\\
    #text(weight: "regular")[2) #raw("Un sistema de dos ecuaciones con dos incógnitas siempre tiene al menos una solución.", block: false)]\\
    #text(weight: "regular")[3) #raw("Si multiplicamos ambos lados de una ecuación por un número distinto de cero, la solución del sistema cambia.", block: false)]\\
    #text(weight: "regular")[4) #raw("Un sistema de ecuaciones lineales tiene solución única si las rectas que representan a las ecuaciones son paralelas y distintas.", block: false)]\\
  ]\\
  #v(0.4em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1, 2 y 3 son verdaderas.", block: false)]\\
    #text(weight: "regular")[B) #raw("1 y 3 son verdaderas.", block: false)]\\
    #text(weight: "regular")[C) #raw("2 y 4 son verdaderas.", block: false)]\\
    #text(weight: "regular")[D) #raw("Solo 4 es verdadera.", block: false)]\\
    #text(weight: "regular")[E) #raw("Todas son verdaderas.", block: false)]\\
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
  #text(weight: "regular")[#raw("De la lista de opciones, seleccione la respuesta correcta para cada enunciado", block: false)]\
  #text(weight: "regular")[#raw("A) Seno", block: false)]\
  #text(weight: "regular")[#raw("B) Coseno", block: false)]\
  #text(weight: "regular")[#raw("C) Secante", block: false)]\
  #text(weight: "regular")[#raw("D) Cotangente", block: false)]\
  #text(weight: "regular")[#raw("E) Cosecante", block: false)]
]
#v(1em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[15. #raw("___", block: false)]] #h(0.25em)#raw("Relación entre el cateto adyacente y el opuesto.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[16. #raw("___", block: false)]] #h(0.25em)#raw("Inverso multiplicativo del seno.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[17. #raw("___", block: false)]] #h(0.25em)#raw("Relación entre el cateto opuesto y la hipotenusa.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[18. #raw("___", block: false)]] #h(0.25em)#raw("Relación entre el cateto adyacente y la hipotenusa.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[19. #raw("___", block: false)]] #h(0.25em)#raw("Inverso multiplicativo del coseno.", block: false)\
]

#rect(width: 100%, stroke: 0.5pt + black, fill: rgb("#f8fafc"), inset: 3.5pt)[
  #text(weight: "regular")[#raw("De la lista de opciones, seleccione la respuesta correcta para cada enunciado", block: false)]\
  #text(weight: "regular")[#raw("A) a <= x <= b", block: false)]\
  #text(weight: "regular")[#raw("B) La propiedad de orden", block: false)]\
  #text(weight: "regular")[#raw("C) x < a", block: false)]\
  #text(weight: "regular")[#raw("D) x >=a", block: false)]\
  #text(weight: "regular")[#raw("E) El conjunto solución de una inecuación", block: false)]
]
#v(1em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[20. #raw("___", block: false)]] #h(0.25em)#raw("Representa un intervalo cerrado, incluyendo ambos extremos.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[21. #raw("___", block: false)]] #h(0.25em)#raw("Al multiplicar o dividir ambos lados por un número negativo, este símbolo se invierte.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[22. #raw("___", block: false)]] #h(0.25em)#raw("Gráficamente, se representa con un círculo abierto en a y una flecha hacia la izquierda.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[23. #raw("___", block: false)]] #h(0.25em)#raw("Gráficamente, se representa con un círculo cerrado en a y una flecha hacia la derecha.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[24. #raw("___", block: false)]] #h(0.25em)#raw("Puede ser un conjunto vacío, un único valor, un intervalo o una unión de intervalos.", block: false)\
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
  #box[#text(weight: "bold")[25. #raw("___", block: false)]] #h(0.25em)#raw("Una ecuación no lineal es aquella en la que las variables tienen un exponente distinto de 1 o están involucradas en funciones trascendentes (como sen, log, exp). ", block: false)#linebreak()$  "Reparo" = 150.000 times 25%  $\
#block(width: 100%)[#align(center)[#image("imagen_reactivo_26_e0a19fd5573a.png", width: 100%)]]\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[26. #raw("___", block: false)]] #h(0.25em)#raw("Una ecuación no lineal siempre tiene al menos una solución real. ", block: false)#linebreak()$  x = (-b plus.minus sqrt(b^2 - 4a c)) / (2a)  $\
#block(width: 100%)[#align(center)[#image("imagen_reactivo_27_e0a19fd5573a.png", width: 70%)]]\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[27. #raw("___", block: false)]] #h(0.25em)#raw("En una ecuación exponencial, la incógnita se encuentra exclusivamente en la base de la potencia. ", block: false)#linebreak()$  H_2 S O_4 + 2 N a O H arrow N a_2 S O_4  $\
#block(width: 100%)[#align(center)[#image("imagen_reactivo_28_e0a19fd5573a.png", width: 45%)]]\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[28. #raw("___", block: false)]] #h(0.25em)#raw("Una ecuación exponencial puede tener más de una solución real si, al transformarla, se convierte en una ecuación de segundo grado.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[29. #raw("___", block: false)]] #h(0.25em)#raw("Si la base de una función exponencial es un número mayor que uno, a medida que el exponente aumenta, el valor total de la expresión crece.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[30. #raw("___", block: false)]] #h(0.25em)#raw("El resultado de un logaritmo nunca puede ser un número negativo, sin importar la base o el argumento", block: false)\
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
        #raw("MENDOZA RAMIREZ MANUEL", block: false)\
        #text(size: 15pt, weight: "bold")[1111491]
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
  [NOMBRE: #raw("MENDOZA RAMIREZ MANUEL", block: false)], [CARRERA: #raw("LICENCIATURA EN INGENIERÍA DE SISTEMAS", block: false)],
  [MATERIA: #raw("ECUACIONES DIFERENCIALES", block: false)], [GRUPO: #raw("TA-01", block: false)    SEMESTRE: #raw("3", block: false)],
  [DOCENTE: #raw("MAURICIO QUIROZ LAFUENTE", block: false)], [EXAMEN: #raw("1ER PARCIAL", block: false)],
  [FECHA: #raw("03/09/2026", block: false)], [HORA: #raw("08:15", block: false)],
  [FIRMA DEL ESTUDIANTE: #h(1em)........................................],
  [CODIGO: #text(size: 15pt)[#raw("1111491", block: false)]],
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
  #text(weight: "bold")[#raw("VERDADERO O FALSO SIMPLE", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Marque la respuesta correcta.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[1. #raw("___", block: false)]] #h(0.25em)#raw("Una ecuación no lineal es aquella en la que las variables tienen un exponente distinto de 1 o están involucradas en funciones trascendentes (como sen, log, exp). ", block: false)#linebreak()$  "Reparo" = 150.000 times 25%  $\
#block(width: 100%)[#align(center)[#image("imagen_reactivo_0_e0a19fd5573a.png", width: 100%)]]\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[2. #raw("___", block: false)]] #h(0.25em)#raw("Una ecuación no lineal siempre tiene al menos una solución real. ", block: false)#linebreak()$  x = (-b plus.minus sqrt(b^2 - 4a c)) / (2a)  $\
#block(width: 100%)[#align(center)[#image("imagen_reactivo_1_e0a19fd5573a.png", width: 70%)]]\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[3. #raw("___", block: false)]] #h(0.25em)#raw("El uso de logaritmos es un método válido y necesario cuando las bases de ambos lados de la ecuación no pueden expresarse como potencias de un mismo número.", block: false)\
#block(width: 100%)[#align(center)[#image("imagen_reactivo_2_e0a19fd5573a.png", width: 28%)]]\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[4. #raw("___", block: false)]] #h(0.25em)#raw("La base de un logaritmo convencional siempre puede ser cualquier número real, incluyendo los negativos.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[5. #raw("___", block: false)]] #h(0.25em)#raw("Si la base de una función exponencial es un número mayor que uno, a medida que el exponente aumenta, el valor total de la expresión crece.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[6. #raw("___", block: false)]] #h(0.25em)#raw("El resultado de un logaritmo nunca puede ser un número negativo, sin importar la base o el argumento", block: false)\
]

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
  #box[#text(weight: "bold")[7. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es el rango (conjunto de valores posibles) de las funciones seno y coseno en su forma básica?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("De menos infinito a infinito.", block: false)]\
    #text(weight: "regular")[B) #raw("De 1/2 π a 3/2 π.", block: false)]\
    #text(weight: "regular")[C) #raw("De 0 a 1, incluyendo ambos valores.", block: false)]\
    #text(weight: "regular")[D) #raw("De -1 a 1, incluyendo ambos valores.", block: false)]\
    #text(weight: "regular")[E) #raw("De -π a π.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[8. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál de las siguientes funciones trigonométricas presenta asíntotas verticales?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Cosecante", block: false)]\
    #text(weight: "regular")[B) #raw("Secante", block: false)]\
    #text(weight: "regular")[C) #raw("Coseno", block: false)]\
    #text(weight: "regular")[D) #raw("Seno", block: false)]\
    #text(weight: "regular")[E) #raw("Tangente", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[9. #raw("___", block: false)]] #h(0.25em)#raw("Si tenemos una inecuación que involucra una fracción donde la variable está en el denominador, ¿por qué es peligroso multiplicar ambos lados por el denominador para despejar?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Porque siempre es más fácil trabajar con números decimales.", block: false)]\
    #text(weight: "regular")[B) #raw("Porque el denominador siempre es un número primo.", block: false)]\
    #text(weight: "regular")[C) #raw("Porque las fracciones no pueden compararse mediante desigualdades.", block: false)]\
    #text(weight: "regular")[D) #raw("Porque el denominador podría ser negativo, lo que obligaría a invertir la desigualdad, o podría ser cero, lo cual está prohibido.", block: false)]\
    #text(weight: "regular")[E) #raw("Errores de suma", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[10. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué sucede con el conjunto solución cuando se elevan ambos miembros de una inecuación al cuadrado, asumiendo que ambos lados son positivos?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Los números negativos aparecen automáticamente en la solución.", block: false)]\
    #text(weight: "regular")[B) #raw("Los números positivos aparecen automáticamente en la solución.", block: false)]\
    #text(weight: "regular")[C) #raw("El resultado siempre es una contradicción.", block: false)]\
    #text(weight: "regular")[D) #raw("La relación de orden siempre se invierte.", block: false)]\
    #text(weight: "regular")[E) #raw("La relación de orden se preserva.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[11. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué ocurre con el valor de la función tangente si el ángulo se acerca progresivamente a noventa grados?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Su valor se mantiene constante.", block: false)]\
    #text(weight: "regular")[B) #raw("Su valor disminuye acercándose a cero.", block: false)]\
    #text(weight: "regular")[C) #raw("Su valor crece indefinidamente hacia el infinito.", block: false)]\
    #text(weight: "regular")[D) #raw("Su valor se vuelve negativo.", block: false)]\
    #text(weight: "regular")[E) #raw("Su valor se vuelve positivo.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[12. #raw("___", block: false)]] #h(0.25em)#raw("Si un ángulo se encuentra en el segundo cuadrante, ¿qué signos tienen respectivamente el seno y el coseno de dicho ángulo?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Positivo e indeterminado", block: false)]\
    #text(weight: "regular")[B) #raw("Negativo y negativo.", block: false)]\
    #text(weight: "regular")[C) #raw("Positivo y negativo.", block: false)]\
    #text(weight: "regular")[D) #raw("Negativo y positivo.", block: false)]\
    #text(weight: "regular")[E) #raw("Positivo y positivo.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[13. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué ocurre con el signo de la función coseno a medida que un ángulo aumenta desde 0° hasta 180°?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Pasa de ser negativo a ser positivo.", block: false)]\
    #text(weight: "regular")[B) #raw("Siempre es negativo.", block: false)]\
    #text(weight: "regular")[C) #raw("Pasa de ser positivo a ser negativo.", block: false)]\
    #text(weight: "regular")[D) #raw("Ninguna opcion es correcta", block: false)]\
    #text(weight: "regular")[E) #raw("Siempre es positivo.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[14. #raw("___", block: false)]] #h(0.25em)#raw("En el contexto de las ecuaciones trigonométricas, ¿por qué suelen aparecer dos soluciones en el intervalo de una vuelta completa (0° a 360°)?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("orque es un requisito matemático independiente del valor de la función.", block: false)]\
    #text(weight: "regular")[B) #raw("Porque las funciones trigonométricas son lineales.", block: false)]\
    #text(weight: "regular")[C) #raw("Porque el valor de la función trigonométrica se repite en dos cuadrantes diferentes dentro de una circunferencia.", block: false)]\
    #text(weight: "regular")[D) #raw("Porque el valor del ángulo debe ser siempre positivo.", block: false)]\
    #text(weight: "regular")[E) #raw("Porque los angulos se miden al lado del reloj", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[15. #raw("___", block: false)]] #h(0.25em)#raw("En el plano cartesiano (rectangular), ¿cuál es la característica principal de un punto ubicado en el segundo cuadrante?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("La coordenada horizontal es negativa y la vertical es positiva.", block: false)]\
    #text(weight: "regular")[B) #raw("No se puede definir", block: false)]\
    #text(weight: "regular")[C) #raw("La coordenada horizontal es positiva y la vertical es negativa.", block: false)]\
    #text(weight: "regular")[D) #raw("Ambas coordenadas son positivas.", block: false)]\
    #text(weight: "regular")[E) #raw("Ambas coordenadas son negativas.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[16. #raw("___", block: false)]] #h(0.25em)#raw("Si un punto tiene una coordenada polar con un ángulo de 225°, ¿en qué cuadrante del plano cartesiano se encuentra?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Cuadrante IV", block: false)]\
    #text(weight: "regular")[B) #raw("Cuadrante III y IV", block: false)]\
    #text(weight: "regular")[C) #raw("Cuadrante II", block: false)]\
    #text(weight: "regular")[D) #raw("Cuadrante III", block: false)]\
    #text(weight: "regular")[E) #raw("Cuadrante I", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[17. #raw("___", block: false)]] #h(0.25em)#raw("Si al graficar un sistema de inecuaciones observas que las áreas sombreadas de cada inecuación no se cruzan en ningún punto, ¿qué significa esto?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Que hubo un error al despejar las variables.", block: false)]\
    #text(weight: "regular")[B) #raw("Que el sistema tiene infinitas soluciones.", block: false)]\
    #text(weight: "regular")[C) #raw("Las sobreas siempre se intersectan", block: false)]\
    #text(weight: "regular")[D) #raw("Que el sistema no tiene solución (es inconsistente).", block: false)]\
    #text(weight: "regular")[E) #raw("Que el sistema tiene una única solución.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[18. #raw("___", block: false)]] #h(0.25em)#raw("Si se afirma que el logaritmo de un número es una \"herramienta de búsqueda\", ¿qué es exactamente lo que estamos intentando encontrar al calcular un logaritmo?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("No tiene relacion", block: false)]\
    #text(weight: "regular")[B) #raw("El exponente necesario para que una base dada, al ser elevada a ese valor, resulte en el número original.", block: false)]\
    #text(weight: "regular")[C) #raw("El número de veces que la base debe multiplicarse por sí misma para obtener el logaritmo.", block: false)]\
    #text(weight: "regular")[D) #raw("El valor de la base que, al elevarse a una potencia dada, resulta en el número original.", block: false)]\
    #text(weight: "regular")[E) #raw("La relación inversa entre la potencia y la raíz cuadrada del número.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[19. #raw("___", block: false)]] #h(0.25em)#raw("Considera dos logaritmos con la misma base. Si el logaritmo del primer número es mayor que el logaritmo del segundo número, ¿qué relación existe entre los números originales?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("El primer número es igual al segundo.", block: false)]\
    #text(weight: "regular")[B) #raw("El primer número es necesariamente mayor que el segundo.", block: false)]\
    #text(weight: "regular")[C) #raw("El primer número es necesariamente menor que el segundo.", block: false)]\
    #text(weight: "regular")[D) #raw("No existe una relación directa entre los números originales.", block: false)]\
    #text(weight: "regular")[E) #raw("Los dos sin iguales a pesar de la diferencia", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[20. #raw("___", block: false)]] #h(0.25em)#raw("Si tienes el sistema formado por x + y = 5 y x - y = 1, ¿cuál es el valor de x?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("cinco", block: false)]\
    #text(weight: "regular")[B) #raw("cuatro", block: false)]\
    #text(weight: "regular")[C) #raw("uno", block: false)]\
    #text(weight: "regular")[D) #raw("dos", block: false)]\
    #text(weight: "regular")[E) #raw("tres", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[21. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es la implicación lógica de afirmar que el cociente de dos expresiones es mayor que cero?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Que ambas expresiones deben ser positivas al mismo tiempo, o ambas negativas al mismo tiempo.", block: false)]\
    #text(weight: "regular")[B) #raw("Que el numerador es obligatoriamente positivo y el denominador negativo.", block: false)]\
    #text(weight: "regular")[C) #raw("No existe solucion", block: false)]\
    #text(weight: "regular")[D) #raw("Que el resultado es siempre un número entero.", block: false)]\
    #text(weight: "regular")[E) #raw("Que el numerador debe ser mayor que el denominador.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[22. #raw("___", block: false)]] #h(0.25em)#raw("Si en un triángulo rectángulo uno de sus ángulos agudos mide el doble que el otro, ¿cuál es la relación entre las longitudes de los catetos?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("El cateto mayor es raiz cuadrada de 3 veces el cateto menor.", block: false)]\
    #text(weight: "regular")[B) #raw("El cateto mayor es el doble del cateto menor.", block: false)]\
    #text(weight: "regular")[C) #raw("No se puede calcular", block: false)]\
    #text(weight: "regular")[D) #raw("La hipotenusa es el triple del cateto menor.", block: false)]\
    #text(weight: "regular")[E) #raw("Los catetos son iguales.", block: false)]\
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
  #text(weight: "regular")[#raw("De la lista de opciones, seleccione la respuesta correcta para cada enunciado", block: false)]\
  #text(weight: "regular")[#raw("A) Método de reducción", block: false)]\
  #text(weight: "regular")[#raw("B) Sistema compatible indeterminado", block: false)]\
  #text(weight: "regular")[#raw("C) Sistema compatible determinado", block: false)]\
  #text(weight: "regular")[#raw("D) Sistema incompatible", block: false)]\
  #text(weight: "regular")[#raw("E) Método de sustitución", block: false)]
]
#v(1em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[23. #raw("___", block: false)]] #h(0.25em)#raw("Cuando las rectas son coincidentes y existen infinitas soluciones.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[24. #raw("___", block: false)]] #h(0.25em)#raw("El procedimiento de despejar una variable e introducirla en la otra ecuación.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[25. #raw("___", block: false)]] #h(0.25em)#raw("El método que consiste en eliminar una variable mediante la suma o resta.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[26. #raw("___", block: false)]] #h(0.25em)#raw("Cuando el sistema no posee ninguna solución porque las rectas son paralelas.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[27. #raw("___", block: false)]] #h(0.25em)#raw("Cuando las rectas se cortan en un único punto, existiendo una solución única", block: false)\
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
  #box[#text(weight: "bold")[28. #raw("___", block: false)]] #h(0.25em)#raw("Seleccione los incisos correctos sobre propiedades de los logaritmos.", block: false)\\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[1) #raw("No existen logaritmos de números negativos ni de cero en el conjunto de los números reales.", block: false)]\\
    #text(weight: "regular")[2) #raw("Si cambias la base de un logaritmo, el resultado final del valor numérico cambia drásticamente, por lo que no existe una relación proporcional entre bases distintas.", block: false)]\\
    #text(weight: "regular")[3) #raw("La base de un logaritmo puede ser cualquier número positivo, incluido el número uno.", block: false)]\\
    #text(weight: "regular")[4) #raw("El logaritmo de un producto de dos números es igual a la suma de los logaritmos de cada uno de esos números por separado.", block: false)]\\
  ]\\
  #v(0.4em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1, 2 y 3 son verdaderas.", block: false)]\\
    #text(weight: "regular")[B) #raw("1 y 3 son verdaderas.", block: false)]\\
    #text(weight: "regular")[C) #raw("2 y 4 son verdaderas.", block: false)]\\
    #text(weight: "regular")[D) #raw("Solo 4 es verdadera.", block: false)]\\
    #text(weight: "regular")[E) #raw("Todas son verdaderas.", block: false)]\\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[29. #raw("___", block: false)]] #h(0.25em)#raw("Seleccione los incisos correctos sobre trigonometria:", block: false)\\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[1) #raw("Un radián es una unidad de medida angular equivalente a 180 grados.", block: false)]\\
    #text(weight: "regular")[2) #raw("El valor del seno de un ángulo puede ser mayor que 1.", block: false)]\\
    #text(weight: "regular")[3) #raw("La función coseno es positiva en el primer y cuarto cuadrante.", block: false)]\\
    #text(weight: "regular")[4) #raw("Si dos ángulos son complementarios, el seno de uno es igual al coseno del otro.", block: false)]\\
  ]\\
  #v(0.4em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1, 2 y 3 son verdaderas.", block: false)]\\
    #text(weight: "regular")[B) #raw("1 y 3 son verdaderas.", block: false)]\\
    #text(weight: "regular")[C) #raw("2 y 4 son verdaderas.", block: false)]\\
    #text(weight: "regular")[D) #raw("Solo 4 es verdadera.", block: false)]\\
    #text(weight: "regular")[E) #raw("Todas son verdaderas.", block: false)]\\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[30. #raw("___", block: false)]] #h(0.25em)#raw("Seleccione los incisos correctos sobre sistemas de ecuaciones:", block: false)\\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[1) #raw("Un sistema de dos ecuaciones con dos incógnitas siempre tiene al menos una solución.", block: false)]\\
    #text(weight: "regular")[2) #raw("Si multiplicamos ambos lados de una ecuación por un número distinto de cero, la solución del sistema cambia.", block: false)]\\
    #text(weight: "regular")[3) #raw("En un sistema de ecuaciones lineales, el punto de intersección de las gráficas representa los valores que satisfacen simultáneamente todas las ecuaciones.", block: false)]\\
    #text(weight: "regular")[4) #raw("Un sistema de ecuaciones lineales tiene solución única si las rectas que representan a las ecuaciones son paralelas y distintas.", block: false)]\\
  ]\\
  #v(0.4em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1, 2 y 3 son verdaderas.", block: false)]\\
    #text(weight: "regular")[B) #raw("1 y 3 son verdaderas.", block: false)]\\
    #text(weight: "regular")[C) #raw("2 y 4 son verdaderas.", block: false)]\\
    #text(weight: "regular")[D) #raw("Solo 4 es verdadera.", block: false)]\\
    #text(weight: "regular")[E) #raw("Todas son verdaderas.", block: false)]\\
  ]
]
