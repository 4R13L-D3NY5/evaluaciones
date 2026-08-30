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
        #raw("PORTUGUEZ MATIAS JUAN GABRIEL", block: false)\
        #text(size: 15pt, weight: "bold")[1107142]
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
  [NOMBRE: #raw("PORTUGUEZ MATIAS JUAN GABRIEL", block: false)], [CARRERA: #raw("LICENCIATURA EN INGENIERÍA DE SISTEMAS", block: false)],
  [MATERIA: #raw("TALLER DE INGENIERÍA DE SOFTWARE", block: false)], [GRUPO: #raw("TA-01", block: false)    SEMESTRE: #raw("8", block: false)],
  [DOCENTE: #raw("DOCENTE SEA (CI 9465510)", block: false)], [EXAMEN: #raw("1ER PARCIAL", block: false)],
  [FECHA: #raw("29/08/2026", block: false)], [HORA: #raw("15:45 - 17:15", block: false)],
  [FIRMA DEL ESTUDIANTE: #h(1em)........................................],
  [CODIGO: #text(size: 15pt)[#raw("1107142", block: false)]],
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
  #box[#text(weight: "bold")[1. #raw("___", block: false)]] #h(0.25em)#raw("El plazo reglamentario para la presentación de descargos ante una Vista de Cargo emitida por el SIN es de:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("60 días calendario continuos", block: false)]\
    #text(weight: "regular")[B) #raw("10 días hábiles administrativos", block: false)]\
    #text(weight: "regular")[C) #raw("5 días hábiles a partir de la publicación en prensa", block: false)]\
    #text(weight: "regular")[D) #raw("30 días calendario improrrogables computables a partir de su notificación", block: false)]\
    #text(weight: "regular")[E) #raw("15 días hábiles según Ley 2492", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[2. #raw("___", block: false)]] #h(0.25em)#raw("Según el Código Tributario Boliviano (Ley 2492), el término de prescripción de las facultades de fiscalización es de:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("5 años para personas naturales únicamente", block: false)]\
    #text(weight: "regular")[B) #raw("2 años calendario continuos", block: false)]\
    #text(weight: "regular")[C) #raw("8 años para tributos de periodicidad anual y contravenciones", block: false)]\
    #text(weight: "regular")[D) #raw("20 años en materia de contravenciones aduaneras", block: false)]\
    #text(weight: "regular")[E) #raw("4 años improrrogables", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[3. #raw("___", block: false)]] #h(0.25em)#raw("En la auditoría tributaria para determinar la base imponible del IUE se debe considerar como gasto no deducible:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Excluir los gastos personales de los socios sin respaldo de factura legal", block: false)]\
    #text(weight: "regular")[B) #raw("Deducir únicamente las compras vinculadas a la actividad gravada", block: false)]\
    #text(weight: "regular")[C) #raw("Registrar contablemente los sueldos del personal de planta", block: false)]\
    #text(weight: "regular")[D) #raw("Depreciar conforme a la tabla oficial del D.S. 24051", block: false)]\
    #text(weight: "regular")[E) #raw("Computar los aportes patronales devengados en el ejercicio", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[4. #raw("___", block: false)]] #h(0.25em)#raw("El método de determinación de la base imponible sobre base presunta procede cuando:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("El sujeto pasivo no presenta libros contables ni documentación fidedigna", block: false)]\
    #text(weight: "regular")[B) #raw("Se cuenta con estados financieros auditados con dictamen limpio", block: false)]\
    #text(weight: "regular")[C) #raw("Las ventas superan los límites del régimen simplificado", block: false)]\
    #text(weight: "regular")[D) #raw("El contribuyente presenta todos sus libros notariados", block: false)]\
    #text(weight: "regular")[E) #raw("Se solicita una prórroga para el pago de la deuda", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[5. #raw("___", block: false)]] #h(0.25em)#raw("Las compensaciones del IUE efectivamente pagado contra el IT operan:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("De manera retroactiva a los períodos del año anterior", block: false)]\
    #text(weight: "regular")[B) #raw("Únicamente contra el débito fiscal IVA compras", block: false)]\
    #text(weight: "regular")[C) #raw("A partir del mes siguiente al pago del IUE hasta su total agotamiento o nuevo vencimiento", block: false)]\
    #text(weight: "regular")[D) #raw("Hasta un máximo del 50% de las ventas brutas declaradas", block: false)]\
    #text(weight: "regular")[E) #raw("Exclusivamente en empresas del sector minero y petrolero", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[6. #raw("___", block: false)]] #h(0.25em)#raw("La no emisión de factura en una venta de bienes o servicios constituye una contravención tributaria sancionada con:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Decomiso definitivo de la mercadería sin reclamo", block: false)]\
    #text(weight: "regular")[B) #raw("Suspensión definitiva del Registro Tributario (NIT)", block: false)]\
    #text(weight: "regular")[C) #raw("Prisión de 1 a 3 años para el representante legal", block: false)]\
    #text(weight: "regular")[D) #raw("Clausura del establecimiento comercial de acuerdo a la reincidencia", block: false)]\
    #text(weight: "regular")[E) #raw("Pérdida automática de la personería jurídica", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[7. #raw("___", block: false)]] #h(0.25em)#raw("La bancarización obligatoria establecida por el SIN es exigible para transacciones iguales o mayores a:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Bs 10.000", block: false)]\
    #text(weight: "regular")[B) #raw("Bs 5.000", block: false)]\
    #text(weight: "regular")[C) #raw("Bs 100.000", block: false)]\
    #text(weight: "regular")[D) #raw("Bs 50.000", block: false)]\
    #text(weight: "regular")[E) #raw("Bs 25.000", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[8. #raw("___", block: false)]] #h(0.25em)#raw("La alícuota por remesas de utilidades a beneficiarios del exterior por servicios prestados desde el extranjero es del:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("25% sobre el 10% presunto (Tasa efectiva 2.5%)", block: false)]\
    #text(weight: "regular")[B) #raw("Exención total por tratados de doble tributación", block: false)]\
    #text(weight: "regular")[C) #raw("13% sobre el total remesado", block: false)]\
    #text(weight: "regular")[D) #raw("3% por concepto de retención IT", block: false)]\
    #text(weight: "regular")[E) #raw("25% sobre el 50% presunto (Tasa efectiva 12.5%)", block: false)]\
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
  #box[#text(weight: "bold")[9. #raw("___", block: false)]] #h(0.25em)#raw("Las pérdidas tributarias acumuladas en el IUE pueden compensarse de manera indefinida sin límite temporal en empresas no productivas.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[10. #raw("___", block: false)]] #h(0.25em)#raw("El Impuesto a las Grandes Fortunas (IGF) aplica a personas naturales con patrimonio superior a Bs 30 millones en territorio nacional y extranjero.", block: false)\
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
  #box[#text(weight: "bold")[11. #raw("___", block: false)]] #h(0.25em)#raw("I. El crédito fiscal IVA respaldado por compras vinculadas a la actividad gravada es computable.
II. Las retenciones tributarias no liberan al sujeto pasivo de su obligación formal.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Si la segunda premisa es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("Si la primera premisa es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("Si ambas premisas son verdaderas", block: false)]\
    #text(weight: "regular")[D) #raw("Si ninguna de las premisas es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[12. #raw("___", block: false)]] #h(0.25em)#raw("I. La prescripción tributaria se interrumpe con la notificación de la Resolución Determinativa.
II. El pago parcial de la deuda tributaria suspende el cómputo de la prescripción.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Si ninguna de las premisas es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("Si la segunda premisa es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("Si ambas premisas son verdaderas", block: false)]\
    #text(weight: "regular")[D) #raw("Si la primera premisa es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[13. #raw("___", block: false)]] #h(0.25em)#raw("I. El valor residual de los activos fijos totalmente depreciados se mantiene contablemente en Bs 1.
II. La revalorización técnica de activos fijos genera crédito fiscal IVA automático.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Si ambas premisas son verdaderas", block: false)]\
    #text(weight: "regular")[B) #raw("Si la segunda premisa es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("Si ninguna de las premisas es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("Si la primera premisa es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[14. #raw("___", block: false)]] #h(0.25em)#raw("I. La alícuota del ICE es idéntica para bebidas alcohólicas y vehículos automotores.
II. El ICE pagado en importaciones es computable como crédito fiscal IVA.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Si la primera premisa es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("Si ninguna de las premisas es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("Si ambas premisas son verdaderas", block: false)]\
    #text(weight: "regular")[D) #raw("Si la segunda premisa es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[15. #raw("___", block: false)]] #h(0.25em)#raw("I. La Vista de Cargo fija la liquidación previa de la deuda tributaria y abre el período probatorio.
II. La Resolución Determinativa es el acto definitivo que pone fin al procedimiento de fiscalización.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Si ambas premisas son verdaderas", block: false)]\
    #text(weight: "regular")[B) #raw("Si ninguna de las premisas es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("Si la primera premisa es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("Si la segunda premisa es verdadera", block: false)]\
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
  #box[#text(weight: "bold")[16. #raw("___", block: false)]] #h(0.25em)#raw("Son elementos que componen la Deuda Tributaria (DT) según el Artículo 47 del CTB:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("4. Errores aritméticos en libros de compras y ventas IVA del período.", block: false)]\
    #text(weight: "regular")[B) #raw("2. Gastos no deducibles por falta de documento de bancarización fehaciente.", block: false)]\
    #text(weight: "regular")[C) #raw("3. Crédito fiscal computado sin factura original o electrónica autorizada.", block: false)]\
    #text(weight: "regular")[D) #raw("1. Omisión de ingresos reales en estados financieros auditados.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[17. #raw("___", block: false)]] #h(0.25em)#raw("Constituyen causales de nulidad absoluta en los actos administrativos tributarios:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("2. Gastos no deducibles por falta de documento de bancarización fehaciente.", block: false)]\
    #text(weight: "regular")[B) #raw("1. Omisión de ingresos reales en estados financieros auditados.", block: false)]\
    #text(weight: "regular")[C) #raw("4. Errores aritméticos en libros de compras y ventas IVA del período.", block: false)]\
    #text(weight: "regular")[D) #raw("3. Crédito fiscal computado sin factura original o electrónica autorizada.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[18. #raw("___", block: false)]] #h(0.25em)#raw("Son facultades específicas de la Administración Tributaria según la Ley 2492:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1. Omisión de ingresos reales en estados financieros auditados.", block: false)]\
    #text(weight: "regular")[B) #raw("2. Gastos no deducibles por falta de documento de bancarización fehaciente.", block: false)]\
    #text(weight: "regular")[C) #raw("4. Errores aritméticos en libros de compras y ventas IVA del período.", block: false)]\
    #text(weight: "regular")[D) #raw("3. Crédito fiscal computado sin factura original o electrónica autorizada.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[19. #raw("___", block: false)]] #h(0.25em)#raw("Requisitos para la deducibilidad de intereses por deudas financieras contraídas en el exterior:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("3. Crédito fiscal computado sin factura original o electrónica autorizada.", block: false)]\
    #text(weight: "regular")[B) #raw("1. Omisión de ingresos reales en estados financieros auditados.", block: false)]\
    #text(weight: "regular")[C) #raw("2. Gastos no deducibles por falta de documento de bancarización fehaciente.", block: false)]\
    #text(weight: "regular")[D) #raw("4. Errores aritméticos en libros de compras y ventas IVA del período.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[20. #raw("___", block: false)]] #h(0.25em)#raw("Son condiciones formales para la deducción de sueldos y salarios en la liquidación del IUE:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("2. Gastos no deducibles por falta de documento de bancarización fehaciente.", block: false)]\
    #text(weight: "regular")[B) #raw("4. Errores aritméticos en libros de compras y ventas IVA del período.", block: false)]\
    #text(weight: "regular")[C) #raw("1. Omisión de ingresos reales en estados financieros auditados.", block: false)]\
    #text(weight: "regular")[D) #raw("3. Crédito fiscal computado sin factura original o electrónica autorizada.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[21. #raw("___", block: false)]] #h(0.25em)#raw("Son documentos soporte indispensables en el legajo de auditoría tributaria permanente:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1. Omisión de ingresos reales en estados financieros auditados.", block: false)]\
    #text(weight: "regular")[B) #raw("4. Errores aritméticos en libros de compras y ventas IVA del período.", block: false)]\
    #text(weight: "regular")[C) #raw("2. Gastos no deducibles por falta de documento de bancarización fehaciente.", block: false)]\
    #text(weight: "regular")[D) #raw("3. Crédito fiscal computado sin factura original o electrónica autorizada.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[22. #raw("___", block: false)]] #h(0.25em)#raw("Tratamiento de las mermas y desmedros en la auditoría de inventarios para el IUE:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("3. Crédito fiscal computado sin factura original o electrónica autorizada.", block: false)]\
    #text(weight: "regular")[B) #raw("4. Errores aritméticos en libros de compras y ventas IVA del período.", block: false)]\
    #text(weight: "regular")[C) #raw("2. Gastos no deducibles por falta de documento de bancarización fehaciente.", block: false)]\
    #text(weight: "regular")[D) #raw("1. Omisión de ingresos reales en estados financieros auditados.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[23. #raw("___", block: false)]] #h(0.25em)#raw("Constituyen hechos generadores del Impuesto a las Transacciones (IT):", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("2. Gastos no deducibles por falta de documento de bancarización fehaciente.", block: false)]\
    #text(weight: "regular")[B) #raw("3. Crédito fiscal computado sin factura original o electrónica autorizada.", block: false)]\
    #text(weight: "regular")[C) #raw("1. Omisión de ingresos reales en estados financieros auditados.", block: false)]\
    #text(weight: "regular")[D) #raw("4. Errores aritméticos en libros de compras y ventas IVA del período.", block: false)]\
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
  #box[#text(weight: "bold")[24. #raw("___", block: false)]] #h(0.25em)#raw("Determine la Deuda Tributaria consolidada total expresada en Unidades de Fomento de Vivienda (UFV):", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Reparo IUE Bs 19.500 (13%) + Sanción formal 200 UFV", block: false)]\
    #text(weight: "regular")[B) #raw("Crédito Fiscal IVA a reintegrar de Bs 19.500 (13%)", block: false)]\
    #text(weight: "regular")[C) #raw("No procede reparo si la factura tiene código de autorización vigente", block: false)]\
    #text(weight: "regular")[D) #raw("Reparo total acumulado consolidado de Bs 75.000", block: false)]\
    #text(weight: "regular")[E) #raw("Reparo IUE Bs 37.500 (25%) + Sanción formal 500 UFV", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[25. #raw("___", block: false)]] #h(0.25em)#raw("Calcule el interés moratorio generado si transcurrieron 500 días con una tasa de interés del 4% anual:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Crédito Fiscal IVA a reintegrar de Bs 19.500 (13%)", block: false)]\
    #text(weight: "regular")[B) #raw("Reparo IUE Bs 37.500 (25%) + Sanción formal 500 UFV", block: false)]\
    #text(weight: "regular")[C) #raw("Reparo total acumulado consolidado de Bs 75.000", block: false)]\
    #text(weight: "regular")[D) #raw("No procede reparo si la factura tiene código de autorización vigente", block: false)]\
    #text(weight: "regular")[E) #raw("Reparo IUE Bs 19.500 (13%) + Sanción formal 200 UFV", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[26. #raw("___", block: false)]] #h(0.25em)#raw("En una constructora con contrato de Bs 2.000.000 y 60% de avance físico certificado, ¿cuál es el ingreso gravado devengado en el IUE?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Utilidad Bruta Imponible de Bs 400.000 (Bs 1.200.000 - Bs 800.000)", block: false)]\
    #text(weight: "regular")[B) #raw("Deducción automática al 100% en el ejercicio de suscripción", block: false)]\
    #text(weight: "regular")[C) #raw("No reduce la base imponible del IVA ni del IT y se factura sobre el monto total", block: false)]\
    #text(weight: "regular")[D) #raw("Constituye gasto no deducible hasta que se ejecute el desembolso efectivo", block: false)]\
    #text(weight: "regular")[E) #raw("Ingreso devengado de Bs 1.200.000 sujeto a facturación y cómputo de IUE", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[27. #raw("___", block: false)]] #h(0.25em)#raw("Calcule el reparo impositivo aplicable por IUE no deducible al detectarse facturas sin bancarización por Bs 150.000:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Reparo total acumulado consolidado de Bs 75.000", block: false)]\
    #text(weight: "regular")[B) #raw("Crédito Fiscal IVA a reintegrar de Bs 19.500 (13%)", block: false)]\
    #text(weight: "regular")[C) #raw("No procede reparo si la factura tiene código de autorización vigente", block: false)]\
    #text(weight: "regular")[D) #raw("Reparo IUE Bs 37.500 (25%) + Sanción formal 500 UFV", block: false)]\
    #text(weight: "regular")[E) #raw("Reparo IUE Bs 19.500 (13%) + Sanción formal 200 UFV", block: false)]\
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
  #box[#text(weight: "bold")[28. #raw("___", block: false)]] #h(0.25em)#raw("Beneficio tributario otorgado a fundaciones y asociaciones civiles sin fines de lucro debidamente registradas.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[29. #raw("___", block: false)]] #h(0.25em)#raw("Método de liquidación tributaria aplicable cuando el contribuyente oculta ventas y no tiene registros contables.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[30. #raw("___", block: false)]] #h(0.25em)#raw("Sobretasa impositiva del 25% aplicada a entidades de intermediación financiera con rentabilidad superior al 6%.", block: false)\
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
        #raw("GODOY GUTIERREZ DENILSON JHAIR", block: false)\
        #text(size: 15pt, weight: "bold")[1108039]
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
  [NOMBRE: #raw("GODOY GUTIERREZ DENILSON JHAIR", block: false)], [CARRERA: #raw("LICENCIATURA EN INGENIERÍA DE SISTEMAS", block: false)],
  [MATERIA: #raw("TALLER DE INGENIERÍA DE SOFTWARE", block: false)], [GRUPO: #raw("TA-01", block: false)    SEMESTRE: #raw("8", block: false)],
  [DOCENTE: #raw("DOCENTE SEA (CI 9465510)", block: false)], [EXAMEN: #raw("1ER PARCIAL", block: false)],
  [FECHA: #raw("29/08/2026", block: false)], [HORA: #raw("15:45 - 17:15", block: false)],
  [FIRMA DEL ESTUDIANTE: #h(1em)........................................],
  [CODIGO: #text(size: 15pt)[#raw("1108039", block: false)]],
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
  #box[#text(weight: "bold")[1. #raw("___", block: false)]] #h(0.25em)#raw("En la auditoría tributaria para determinar la base imponible del IUE se debe considerar como gasto no deducible:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Depreciar conforme a la tabla oficial del D.S. 24051", block: false)]\
    #text(weight: "regular")[B) #raw("Registrar contablemente los sueldos del personal de planta", block: false)]\
    #text(weight: "regular")[C) #raw("Deducir únicamente las compras vinculadas a la actividad gravada", block: false)]\
    #text(weight: "regular")[D) #raw("Computar los aportes patronales devengados en el ejercicio", block: false)]\
    #text(weight: "regular")[E) #raw("Excluir los gastos personales de los socios sin respaldo de factura legal", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[2. #raw("___", block: false)]] #h(0.25em)#raw("Según el Código Tributario Boliviano (Ley 2492), el término de prescripción de las facultades de fiscalización es de:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("20 años en materia de contravenciones aduaneras", block: false)]\
    #text(weight: "regular")[B) #raw("2 años calendario continuos", block: false)]\
    #text(weight: "regular")[C) #raw("5 años para personas naturales únicamente", block: false)]\
    #text(weight: "regular")[D) #raw("4 años improrrogables", block: false)]\
    #text(weight: "regular")[E) #raw("8 años para tributos de periodicidad anual y contravenciones", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[3. #raw("___", block: false)]] #h(0.25em)#raw("El método de determinación de la base imponible sobre base presunta procede cuando:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("El contribuyente presenta todos sus libros notariados", block: false)]\
    #text(weight: "regular")[B) #raw("Se solicita una prórroga para el pago de la deuda", block: false)]\
    #text(weight: "regular")[C) #raw("Se cuenta con estados financieros auditados con dictamen limpio", block: false)]\
    #text(weight: "regular")[D) #raw("El sujeto pasivo no presenta libros contables ni documentación fidedigna", block: false)]\
    #text(weight: "regular")[E) #raw("Las ventas superan los límites del régimen simplificado", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[4. #raw("___", block: false)]] #h(0.25em)#raw("En una auditoría tributaria, la técnica de confirmación de saldos con terceros verifica principalmente:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Capacidad de pago futura y solvencia de la entidad", block: false)]\
    #text(weight: "regular")[B) #raw("Existencia, integridad y exactitud de cuentas por cobrar y pagar comerciales", block: false)]\
    #text(weight: "regular")[C) #raw("Coeficiente de liquidez ácida del período", block: false)]\
    #text(weight: "regular")[D) #raw("Estructura societaria y tenencia accionaria", block: false)]\
    #text(weight: "regular")[E) #raw("Depreciación acumulada de activos intangibles", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[5. #raw("___", block: false)]] #h(0.25em)#raw("Para el cómputo del Crédito Fiscal IVA en compras de bienes y servicios, el documento fiscal debe:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Tener una antigüedad mayor a 180 días calendario", block: false)]\
    #text(weight: "regular")[B) #raw("Ser cancelado únicamente en efectivo al momento de la entrega", block: false)]\
    #text(weight: "regular")[C) #raw("Contar con autorización del Ministerio de Economía", block: false)]\
    #text(weight: "regular")[D) #raw("Ser emitido exclusivamente en moneda extranjera", block: false)]\
    #text(weight: "regular")[E) #raw("Estar vinculado a la actividad gravada, a nombre y NIT del sujeto pasivo y respaldado", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[6. #raw("___", block: false)]] #h(0.25em)#raw("El recurso de alzada ante la Autoridad Regional de Impugnación Tributaria (ARIT) debe interponerse en el plazo perentorio de:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("15 días hábiles administrativos", block: false)]\
    #text(weight: "regular")[B) #raw("20 días improrrogables computables a partir de la notificación legal", block: false)]\
    #text(weight: "regular")[C) #raw("45 días hábiles procesales", block: false)]\
    #text(weight: "regular")[D) #raw("30 días calendario continuos", block: false)]\
    #text(weight: "regular")[E) #raw("60 días calendario según Ley 2492", block: false)]\
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
  #box[#text(weight: "bold")[7. #raw("___", block: false)]] #h(0.25em)#raw("Las donaciones a instituciones no lucrativas autorizadas son deducibles del IUE hasta el límite del 10% de la utilidad imponible.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[8. #raw("___", block: false)]] #h(0.25em)#raw("El principio de devengado tributario reconoce ingresos y gastos cuando se generan legalmente, con independencia del cobro o pago.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[9. #raw("___", block: false)]] #h(0.25em)#raw("Las pérdidas tributarias acumuladas en el IUE pueden compensarse de manera indefinida sin límite temporal en empresas no productivas.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[10. #raw("___", block: false)]] #h(0.25em)#raw("La depreciación de inmuebles bajo el método de línea recta tiene un coeficiente anual del 2.5% según el D.S. 24051.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[11. #raw("___", block: false)]] #h(0.25em)#raw("La rectificatoria de una declaración jurada que incrementa el saldo a favor del contribuyente requiere aprobación previa mediante Resolución Administrativa del SIN.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[12. #raw("___", block: false)]] #h(0.25em)#raw("El Impuesto a las Grandes Fortunas (IGF) aplica a personas naturales con patrimonio superior a Bs 30 millones en territorio nacional y extranjero.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[13. #raw("___", block: false)]] #h(0.25em)#raw("El crédito fiscal generado en compras de combustible (gasolina y diésel) es computable al 100% del valor total de la factura.", block: false)\
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
  #box[#text(weight: "bold")[14. #raw("___", block: false)]] #h(0.25em)#raw("I. El crédito fiscal IVA respaldado por compras vinculadas a la actividad gravada es computable.
II. Las retenciones tributarias no liberan al sujeto pasivo de su obligación formal.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Si la segunda premisa es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("Si la primera premisa es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("Si ninguna de las premisas es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("Si ambas premisas son verdaderas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[15. #raw("___", block: false)]] #h(0.25em)#raw("I. El valor residual de los activos fijos totalmente depreciados se mantiene contablemente en Bs 1.
II. La revalorización técnica de activos fijos genera crédito fiscal IVA automático.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Si ninguna de las premisas es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("Si la primera premisa es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("Si ambas premisas son verdaderas", block: false)]\
    #text(weight: "regular")[D) #raw("Si la segunda premisa es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[16. #raw("___", block: false)]] #h(0.25em)#raw("I. La prescripción tributaria se interrumpe con la notificación de la Resolución Determinativa.
II. El pago parcial de la deuda tributaria suspende el cómputo de la prescripción.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Si ambas premisas son verdaderas", block: false)]\
    #text(weight: "regular")[B) #raw("Si la primera premisa es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("Si ninguna de las premisas es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("Si la segunda premisa es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[17. #raw("___", block: false)]] #h(0.25em)#raw("I. Las compras de servicios a personas naturales no inscritas generan retención del 12.5% por IUE y 3% por IT.
II. Las retenciones por compra de bienes son del 5% por IUE y 3% por IT.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Si ambas premisas son verdaderas", block: false)]\
    #text(weight: "regular")[B) #raw("Si la segunda premisa es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("Si ninguna de las premisas es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("Si la primera premisa es verdadera", block: false)]\
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
  #box[#text(weight: "bold")[18. #raw("___", block: false)]] #h(0.25em)#raw("En una auditoría fiscal determine los reparos aplicables por incumplimiento a la normativa tributaria:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1. Omisión de ingresos reales en estados financieros auditados.", block: false)]\
    #text(weight: "regular")[B) #raw("4. Errores aritméticos en libros de compras y ventas IVA del período.", block: false)]\
    #text(weight: "regular")[C) #raw("2. Gastos no deducibles por falta de documento de bancarización fehaciente.", block: false)]\
    #text(weight: "regular")[D) #raw("3. Crédito fiscal computado sin factura original o electrónica autorizada.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[19. #raw("___", block: false)]] #h(0.25em)#raw("Constituyen causales de nulidad absoluta en los actos administrativos tributarios:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("3. Crédito fiscal computado sin factura original o electrónica autorizada.", block: false)]\
    #text(weight: "regular")[B) #raw("2. Gastos no deducibles por falta de documento de bancarización fehaciente.", block: false)]\
    #text(weight: "regular")[C) #raw("4. Errores aritméticos en libros de compras y ventas IVA del período.", block: false)]\
    #text(weight: "regular")[D) #raw("1. Omisión de ingresos reales en estados financieros auditados.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[20. #raw("___", block: false)]] #h(0.25em)#raw("Son facultades específicas de la Administración Tributaria según la Ley 2492:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("4. Errores aritméticos en libros de compras y ventas IVA del período.", block: false)]\
    #text(weight: "regular")[B) #raw("3. Crédito fiscal computado sin factura original o electrónica autorizada.", block: false)]\
    #text(weight: "regular")[C) #raw("1. Omisión de ingresos reales en estados financieros auditados.", block: false)]\
    #text(weight: "regular")[D) #raw("2. Gastos no deducibles por falta de documento de bancarización fehaciente.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[21. #raw("___", block: false)]] #h(0.25em)#raw("Son documentos soporte indispensables en el legajo de auditoría tributaria permanente:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("2. Gastos no deducibles por falta de documento de bancarización fehaciente.", block: false)]\
    #text(weight: "regular")[B) #raw("3. Crédito fiscal computado sin factura original o electrónica autorizada.", block: false)]\
    #text(weight: "regular")[C) #raw("1. Omisión de ingresos reales en estados financieros auditados.", block: false)]\
    #text(weight: "regular")[D) #raw("4. Errores aritméticos en libros de compras y ventas IVA del período.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[22. #raw("___", block: false)]] #h(0.25em)#raw("Son elementos que componen la Deuda Tributaria (DT) según el Artículo 47 del CTB:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1. Omisión de ingresos reales en estados financieros auditados.", block: false)]\
    #text(weight: "regular")[B) #raw("2. Gastos no deducibles por falta de documento de bancarización fehaciente.", block: false)]\
    #text(weight: "regular")[C) #raw("3. Crédito fiscal computado sin factura original o electrónica autorizada.", block: false)]\
    #text(weight: "regular")[D) #raw("4. Errores aritméticos en libros de compras y ventas IVA del período.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[23. #raw("___", block: false)]] #h(0.25em)#raw("Son condiciones formales para la deducción de sueldos y salarios en la liquidación del IUE:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("4. Errores aritméticos en libros de compras y ventas IVA del período.", block: false)]\
    #text(weight: "regular")[B) #raw("1. Omisión de ingresos reales en estados financieros auditados.", block: false)]\
    #text(weight: "regular")[C) #raw("3. Crédito fiscal computado sin factura original o electrónica autorizada.", block: false)]\
    #text(weight: "regular")[D) #raw("2. Gastos no deducibles por falta de documento de bancarización fehaciente.", block: false)]\
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
  #box[#text(weight: "bold")[24. #raw("___", block: false)]] #h(0.25em)#raw("Al no haber bancarizado las compras de Bs 150.000, ¿cuál es el Crédito Fiscal IVA indebidamente apropiado a reintegrar?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Crédito Fiscal IVA a reintegrar de Bs 19.500 (13%)", block: false)]\
    #text(weight: "regular")[B) #raw("No procede reparo si la factura tiene código de autorización vigente", block: false)]\
    #text(weight: "regular")[C) #raw("Reparo IUE Bs 37.500 (25%) + Sanción formal 500 UFV", block: false)]\
    #text(weight: "regular")[D) #raw("Reparo IUE Bs 19.500 (13%) + Sanción formal 200 UFV", block: false)]\
    #text(weight: "regular")[E) #raw("Reparo total acumulado consolidado de Bs 75.000", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[25. #raw("___", block: false)]] #h(0.25em)#raw("Cálculo del Impuesto a las Transacciones (IT) generado sobre la planilla certificada de Bs 1.200.000:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Deducción automática al 100% en el ejercicio de suscripción", block: false)]\
    #text(weight: "regular")[B) #raw("Ingreso devengado de Bs 1.200.000 sujeto a facturación y cómputo de IUE", block: false)]\
    #text(weight: "regular")[C) #raw("Constituye gasto no deducible hasta que se ejecute el desembolso efectivo", block: false)]\
    #text(weight: "regular")[D) #raw("No reduce la base imponible del IVA ni del IT y se factura sobre el monto total", block: false)]\
    #text(weight: "regular")[E) #raw("Utilidad Bruta Imponible de Bs 400.000 (Bs 1.200.000 - Bs 800.000)", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[26. #raw("___", block: false)]] #h(0.25em)#raw("Determine la Deuda Tributaria consolidada total expresada en Unidades de Fomento de Vivienda (UFV):", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Reparo total acumulado consolidado de Bs 75.000", block: false)]\
    #text(weight: "regular")[B) #raw("Crédito Fiscal IVA a reintegrar de Bs 19.500 (13%)", block: false)]\
    #text(weight: "regular")[C) #raw("No procede reparo si la factura tiene código de autorización vigente", block: false)]\
    #text(weight: "regular")[D) #raw("Reparo IUE Bs 19.500 (13%) + Sanción formal 200 UFV", block: false)]\
    #text(weight: "regular")[E) #raw("Reparo IUE Bs 37.500 (25%) + Sanción formal 500 UFV", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[27. #raw("___", block: false)]] #h(0.25em)#raw("En una constructora con contrato de Bs 2.000.000 y 60% de avance físico certificado, ¿cuál es el ingreso gravado devengado en el IUE?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Utilidad Bruta Imponible de Bs 400.000 (Bs 1.200.000 - Bs 800.000)", block: false)]\
    #text(weight: "regular")[B) #raw("Deducción automática al 100% en el ejercicio de suscripción", block: false)]\
    #text(weight: "regular")[C) #raw("Constituye gasto no deducible hasta que se ejecute el desembolso efectivo", block: false)]\
    #text(weight: "regular")[D) #raw("Ingreso devengado de Bs 1.200.000 sujeto a facturación y cómputo de IUE", block: false)]\
    #text(weight: "regular")[E) #raw("No reduce la base imponible del IVA ni del IT y se factura sobre el monto total", block: false)]\
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
  #box[#text(weight: "bold")[28. #raw("___", block: false)]] #h(0.25em)#raw("Procedimiento de fiscalización directa con libros contables y documentos de respaldo fidedignos.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[29. #raw("___", block: false)]] #h(0.25em)#raw("Beneficio tributario otorgado a fundaciones y asociaciones civiles sin fines de lucro debidamente registradas.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[30. #raw("___", block: false)]] #h(0.25em)#raw("Sobretasa impositiva del 25% aplicada a entidades de intermediación financiera con rentabilidad superior al 6%.", block: false)\
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
        #raw("BUTRON LOPEZ ALEX", block: false)\
        #text(size: 15pt, weight: "bold")[1111869]
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
  [NOMBRE: #raw("BUTRON LOPEZ ALEX", block: false)], [CARRERA: #raw("LICENCIATURA EN INGENIERÍA DE SISTEMAS", block: false)],
  [MATERIA: #raw("TALLER DE INGENIERÍA DE SOFTWARE", block: false)], [GRUPO: #raw("TA-01", block: false)    SEMESTRE: #raw("8", block: false)],
  [DOCENTE: #raw("DOCENTE SEA (CI 9465510)", block: false)], [EXAMEN: #raw("1ER PARCIAL", block: false)],
  [FECHA: #raw("29/08/2026", block: false)], [HORA: #raw("15:45 - 17:15", block: false)],
  [FIRMA DEL ESTUDIANTE: #h(1em)........................................],
  [CODIGO: #text(size: 15pt)[#raw("1111869", block: false)]],
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
  #box[#text(weight: "bold")[1. #raw("___", block: false)]] #h(0.25em)#raw("Para el cómputo del Crédito Fiscal IVA en compras de bienes y servicios, el documento fiscal debe:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Contar con autorización del Ministerio de Economía", block: false)]\
    #text(weight: "regular")[B) #raw("Ser emitido exclusivamente en moneda extranjera", block: false)]\
    #text(weight: "regular")[C) #raw("Tener una antigüedad mayor a 180 días calendario", block: false)]\
    #text(weight: "regular")[D) #raw("Estar vinculado a la actividad gravada, a nombre y NIT del sujeto pasivo y respaldado", block: false)]\
    #text(weight: "regular")[E) #raw("Ser cancelado únicamente en efectivo al momento de la entrega", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[2. #raw("___", block: false)]] #h(0.25em)#raw("El plazo reglamentario para la presentación de descargos ante una Vista de Cargo emitida por el SIN es de:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("30 días calendario improrrogables computables a partir de su notificación", block: false)]\
    #text(weight: "regular")[B) #raw("15 días hábiles según Ley 2492", block: false)]\
    #text(weight: "regular")[C) #raw("60 días calendario continuos", block: false)]\
    #text(weight: "regular")[D) #raw("10 días hábiles administrativos", block: false)]\
    #text(weight: "regular")[E) #raw("5 días hábiles a partir de la publicación en prensa", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[3. #raw("___", block: false)]] #h(0.25em)#raw("Las compensaciones del IUE efectivamente pagado contra el IT operan:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Exclusivamente en empresas del sector minero y petrolero", block: false)]\
    #text(weight: "regular")[B) #raw("Hasta un máximo del 50% de las ventas brutas declaradas", block: false)]\
    #text(weight: "regular")[C) #raw("A partir del mes siguiente al pago del IUE hasta su total agotamiento o nuevo vencimiento", block: false)]\
    #text(weight: "regular")[D) #raw("Únicamente contra el débito fiscal IVA compras", block: false)]\
    #text(weight: "regular")[E) #raw("De manera retroactiva a los períodos del año anterior", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[4. #raw("___", block: false)]] #h(0.25em)#raw("La alícuota general del Impuesto a las Transacciones (IT) según la Ley 843 es del:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("0.30% aplicable al débito y crédito bancario", block: false)]\
    #text(weight: "regular")[B) #raw("3% sobre los ingresos brutos devengados o percibidos", block: false)]\
    #text(weight: "regular")[C) #raw("25% sobre la utilidad neta imponible", block: false)]\
    #text(weight: "regular")[D) #raw("13% sobre el valor neto de la factura", block: false)]\
    #text(weight: "regular")[E) #raw("1.5% sobre transacciones comerciales al por mayor", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[5. #raw("___", block: false)]] #h(0.25em)#raw("En auditoría fiscal, las previsiones para incobrables no admitidas por el D.S. 24051 generan:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Un crédito fiscal trasladable al IT", block: false)]\
    #text(weight: "regular")[B) #raw("Una contingencia penal tributaria", block: false)]\
    #text(weight: "regular")[C) #raw("La nulidad de los estados financieros", block: false)]\
    #text(weight: "regular")[D) #raw("Un pasivo por impuesto diferido", block: false)]\
    #text(weight: "regular")[E) #raw("Un activo por impuesto diferido", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[6. #raw("___", block: false)]] #h(0.25em)#raw("La alícuota por remesas de utilidades a beneficiarios del exterior por servicios prestados desde el extranjero es del:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("13% sobre el total remesado", block: false)]\
    #text(weight: "regular")[B) #raw("25% sobre el 50% presunto (Tasa efectiva 12.5%)", block: false)]\
    #text(weight: "regular")[C) #raw("25% sobre el 10% presunto (Tasa efectiva 2.5%)", block: false)]\
    #text(weight: "regular")[D) #raw("3% por concepto de retención IT", block: false)]\
    #text(weight: "regular")[E) #raw("Exención total por tratados de doble tributación", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[7. #raw("___", block: false)]] #h(0.25em)#raw("El ajuste por inflación y tenencia de bienes (AITB) de los activos fijos según la NC 3 tiene efecto fiscal de:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Gravado exclusivamente por el Impuesto a las Grandes Fortunas", block: false)]\
    #text(weight: "regular")[B) #raw("No deducible en un 100% bajo ninguna circunstancia", block: false)]\
    #text(weight: "regular")[C) #raw("Exento de todo tributo de dominio nacional", block: false)]\
    #text(weight: "regular")[D) #raw("Ingreso o gasto gravable/deducible en la determinación del IUE", block: false)]\
    #text(weight: "regular")[E) #raw("Compensable directamente contra el IVA compras", block: false)]\
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
  #box[#text(weight: "bold")[8. #raw("___", block: false)]] #h(0.25em)#raw("El débito fiscal IVA se genera en la venta de bienes muebles en el momento de la entrega del bien o emisión de factura, lo que ocurra primero.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[9. #raw("___", block: false)]] #h(0.25em)#raw("Los contribuyentes del Régimen Tributario Simplificado (RTS) están obligados a emitir facturas oficiales y llevar libros de compras.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[10. #raw("___", block: false)]] #h(0.25em)#raw("El principio de devengado tributario reconoce ingresos y gastos cuando se generan legalmente, con independencia del cobro o pago.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[11. #raw("___", block: false)]] #h(0.25em)#raw("La rectificatoria de una declaración jurada que incrementa el saldo a favor del contribuyente requiere aprobación previa mediante Resolución Administrativa del SIN.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[12. #raw("___", block: false)]] #h(0.25em)#raw("El Impuesto a las Grandes Fortunas (IGF) aplica a personas naturales con patrimonio superior a Bs 30 millones en territorio nacional y extranjero.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[13. #raw("___", block: false)]] #h(0.25em)#raw("Las pérdidas tributarias acumuladas en el IUE pueden compensarse de manera indefinida sin límite temporal en empresas no productivas.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[14. #raw("___", block: false)]] #h(0.25em)#raw("El crédito fiscal generado en compras de combustible (gasolina y diésel) es computable al 100% del valor total de la factura.", block: false)\
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
  #box[#text(weight: "bold")[15. #raw("___", block: false)]] #h(0.25em)#raw("I. El valor residual de los activos fijos totalmente depreciados se mantiene contablemente en Bs 1.
II. La revalorización técnica de activos fijos genera crédito fiscal IVA automático.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Si ninguna de las premisas es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("Si la primera premisa es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("Si ambas premisas son verdaderas", block: false)]\
    #text(weight: "regular")[D) #raw("Si la segunda premisa es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[16. #raw("___", block: false)]] #h(0.25em)#raw("I. Las notas fiscales emitidas por el Sistema Electrónico no requieren impresión física para su validez.
II. El código QR impreso en facturas contiene información fiscal validada por el SIN.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Si la segunda premisa es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("Si ninguna de las premisas es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("Si la primera premisa es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("Si ambas premisas son verdaderas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[17. #raw("___", block: false)]] #h(0.25em)#raw("I. Las exportaciones definitivas de bienes están gravadas con tasa cero en el IVA.
II. Los exportadores pueden solicitar la devolución del crédito fiscal mediante CEDEIMs.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Si la segunda premisa es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("Si ninguna de las premisas es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("Si la primera premisa es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("Si ambas premisas son verdaderas", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[18. #raw("___", block: false)]] #h(0.25em)#raw("I. El crédito fiscal IVA respaldado por compras vinculadas a la actividad gravada es computable.
II. Las retenciones tributarias no liberan al sujeto pasivo de su obligación formal.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Si ninguna de las premisas es verdadera", block: false)]\
    #text(weight: "regular")[B) #raw("Si ambas premisas son verdaderas", block: false)]\
    #text(weight: "regular")[C) #raw("Si la primera premisa es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("Si la segunda premisa es verdadera", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[19. #raw("___", block: false)]] #h(0.25em)#raw("I. La alícuota del ICE es idéntica para bebidas alcohólicas y vehículos automotores.
II. El ICE pagado en importaciones es computable como crédito fiscal IVA.", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Si ambas premisas son verdaderas", block: false)]\
    #text(weight: "regular")[B) #raw("Si la primera premisa es verdadera", block: false)]\
    #text(weight: "regular")[C) #raw("Si ninguna de las premisas es verdadera", block: false)]\
    #text(weight: "regular")[D) #raw("Si la segunda premisa es verdadera", block: false)]\
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
  #box[#text(weight: "bold")[20. #raw("___", block: false)]] #h(0.25em)#raw("Constituyen causales de nulidad absoluta en los actos administrativos tributarios:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("4. Errores aritméticos en libros de compras y ventas IVA del período.", block: false)]\
    #text(weight: "regular")[B) #raw("2. Gastos no deducibles por falta de documento de bancarización fehaciente.", block: false)]\
    #text(weight: "regular")[C) #raw("1. Omisión de ingresos reales en estados financieros auditados.", block: false)]\
    #text(weight: "regular")[D) #raw("3. Crédito fiscal computado sin factura original o electrónica autorizada.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[21. #raw("___", block: false)]] #h(0.25em)#raw("Tratamiento de las mermas y desmedros en la auditoría de inventarios para el IUE:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("3. Crédito fiscal computado sin factura original o electrónica autorizada.", block: false)]\
    #text(weight: "regular")[B) #raw("4. Errores aritméticos en libros de compras y ventas IVA del período.", block: false)]\
    #text(weight: "regular")[C) #raw("1. Omisión de ingresos reales en estados financieros auditados.", block: false)]\
    #text(weight: "regular")[D) #raw("2. Gastos no deducibles por falta de documento de bancarización fehaciente.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[22. #raw("___", block: false)]] #h(0.25em)#raw("Respecto a los métodos de depreciación admitidos por el D.S. 24051 determine su validez:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("3. Crédito fiscal computado sin factura original o electrónica autorizada.", block: false)]\
    #text(weight: "regular")[B) #raw("2. Gastos no deducibles por falta de documento de bancarización fehaciente.", block: false)]\
    #text(weight: "regular")[C) #raw("4. Errores aritméticos en libros de compras y ventas IVA del período.", block: false)]\
    #text(weight: "regular")[D) #raw("1. Omisión de ingresos reales en estados financieros auditados.", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[23. #raw("___", block: false)]] #h(0.25em)#raw("Son facultades específicas de la Administración Tributaria según la Ley 2492:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1. Omisión de ingresos reales en estados financieros auditados.", block: false)]\
    #text(weight: "regular")[B) #raw("4. Errores aritméticos en libros de compras y ventas IVA del período.", block: false)]\
    #text(weight: "regular")[C) #raw("3. Crédito fiscal computado sin factura original o electrónica autorizada.", block: false)]\
    #text(weight: "regular")[D) #raw("2. Gastos no deducibles por falta de documento de bancarización fehaciente.", block: false)]\
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
  #box[#text(weight: "bold")[24. #raw("___", block: false)]] #h(0.25em)#raw("Determine la sanción por omisión de pago si la empresa no rectifica voluntariamente antes de la Vista de Cargo:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("No procede reparo si la factura tiene código de autorización vigente", block: false)]\
    #text(weight: "regular")[B) #raw("Reparo IUE Bs 19.500 (13%) + Sanción formal 200 UFV", block: false)]\
    #text(weight: "regular")[C) #raw("Reparo total acumulado consolidado de Bs 75.000", block: false)]\
    #text(weight: "regular")[D) #raw("Crédito Fiscal IVA a reintegrar de Bs 19.500 (13%)", block: false)]\
    #text(weight: "regular")[E) #raw("Reparo IUE Bs 37.500 (25%) + Sanción formal 500 UFV", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[25. #raw("___", block: false)]] #h(0.25em)#raw("Calcule el interés moratorio generado si transcurrieron 500 días con una tasa de interés del 4% anual:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Reparo IUE Bs 19.500 (13%) + Sanción formal 200 UFV", block: false)]\
    #text(weight: "regular")[B) #raw("Reparo total acumulado consolidado de Bs 75.000", block: false)]\
    #text(weight: "regular")[C) #raw("No procede reparo si la factura tiene código de autorización vigente", block: false)]\
    #text(weight: "regular")[D) #raw("Reparo IUE Bs 37.500 (25%) + Sanción formal 500 UFV", block: false)]\
    #text(weight: "regular")[E) #raw("Crédito Fiscal IVA a reintegrar de Bs 19.500 (13%)", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[26. #raw("___", block: false)]] #h(0.25em)#raw("En una constructora con contrato de Bs 2.000.000 y 60% de avance físico certificado, ¿cuál es el ingreso gravado devengado en el IUE?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Ingreso devengado de Bs 1.200.000 sujeto a facturación y cómputo de IUE", block: false)]\
    #text(weight: "regular")[B) #raw("Constituye gasto no deducible hasta que se ejecute el desembolso efectivo", block: false)]\
    #text(weight: "regular")[C) #raw("No reduce la base imponible del IVA ni del IT y se factura sobre el monto total", block: false)]\
    #text(weight: "regular")[D) #raw("Deducción automática al 100% en el ejercicio de suscripción", block: false)]\
    #text(weight: "regular")[E) #raw("Utilidad Bruta Imponible de Bs 400.000 (Bs 1.200.000 - Bs 800.000)", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[27. #raw("___", block: false)]] #h(0.25em)#raw("Si los costos reales acumulados fueron de Bs 800.000, determine la Utilidad Bruta Imponible devengada en el ejercicio:", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Constituye gasto no deducible hasta que se ejecute el desembolso efectivo", block: false)]\
    #text(weight: "regular")[B) #raw("Utilidad Bruta Imponible de Bs 400.000 (Bs 1.200.000 - Bs 800.000)", block: false)]\
    #text(weight: "regular")[C) #raw("No reduce la base imponible del IVA ni del IT y se factura sobre el monto total", block: false)]\
    #text(weight: "regular")[D) #raw("Ingreso devengado de Bs 1.200.000 sujeto a facturación y cómputo de IUE", block: false)]\
    #text(weight: "regular")[E) #raw("Deducción automática al 100% en el ejercicio de suscripción", block: false)]\
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
  #box[#text(weight: "bold")[28. #raw("___", block: false)]] #h(0.25em)#raw("Método de liquidación tributaria aplicable cuando el contribuyente oculta ventas y no tiene registros contables.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[29. #raw("___", block: false)]] #h(0.25em)#raw("Procedimiento de fiscalización directa con libros contables y documentos de respaldo fidedignos.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[30. #raw("___", block: false)]] #h(0.25em)#raw("Beneficio tributario otorgado a fundaciones y asociaciones civiles sin fines de lucro debidamente registradas.", block: false)\
]
