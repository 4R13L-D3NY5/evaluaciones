#set page(
  paper: "us-letter",
  margin: (top: 1.2cm, bottom: 1.2cm, left: 1.2cm, right: 1.2cm),
  header: context {
    let p = counter(page).get().first()
    if p > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [#text(size: 8pt, fill: luma(90))[MARCELO ANDRES SUAREZ MEDINA · #text(font: "Courier", weight: "bold")[7928104]]],
        [#text(size: 8pt, fill: luma(90))[Pág. #p]]
      )
      v(-4pt)
      line(length: 100%, stroke: 0.4pt + luma(150))
    }
  },
  footer: none
)
#set text(font: "Times New Roman", size: 10pt, lang: "es")
#set par(leading: 0.55em, justify: true)

// ========================================================
// PÁGINA 1: CABECERA OFICIAL + TABLA ESTUDIANTE + CARTILLA OMR HORIZONTAL (1 A 60)
// ========================================================

// 1. Cabecera Oficial UNITEPC
#table(
  columns: (22%, 78%),
  stroke: 0.75pt + black,
  inset: 4pt,
  align: (center + horizon, center + horizon),
  [
    #image("logo_unitepc_clean.png", width: 85%)
  ],
  [
    #text(weight: "bold", size: 10.5pt)[UNIVERSIDAD TÉCNICA PRIVADA COSMOS]\
    #text(weight: "bold", size: 9pt)[GESTIÓN 2-2026]\
    #v(-3pt)
    #line(length: 100%, stroke: 0.5pt + black)
    #v(-2pt)
    #text(weight: "bold", size: 9.5pt)[EVALUACIÓN TEÓRICA 1ER PARCIAL]
  ]
)

#v(-3pt)

// 2. Ficha de Datos del Estudiante
#table(
  columns: (60%, 40%),
  stroke: 0.5pt + black,
  inset: (x: 4pt, y: 3pt),
  [*NOMBRE:* MARCELO ANDRES SUAREZ MEDINA],
  [*CARRERA:* AUDITORÍA / CONTADURÍA],
  [*MATERIA:* [CPEC18] AUDITORÍA TRIBUTARIA],
  [*GRUPO:* TA-01 #h(1cm) *SEMESTRE:* 3],
  [*DOCENTE:* MAURICIO QUIROZ LAFUENTE],
  [*EXAMEN:* 1er Parcial · VARIANTE A],
  [*FECHA:* 22/08/2026],
  [*HORA:* 08:15:00 - 09:45:00],
  [
    #grid(
      columns: (auto, 1fr),
      column-gutter: 4pt,
      align: (bottom + left, bottom),
      [*FIRMA DEL ESTUDIANTE:*],
      [#box(width: 1fr, baseline: 3.5pt, line(length: 100%, stroke: (dash: "dotted", thickness: 0.75pt)))]
    )
  ],
  [
    #align(center)[
      #text(size: 8pt)[*CÓDIGO:*]\
      #v(-2pt)
      #text(size: 13pt, font: "Courier", weight: "bold")[7928104]
    ]
  ]
)

#v(2pt)
#text(size: 8.5pt)[*INSTRUCCIÓN DE COMPLETADO DE CARTILLA:* Rellene con cuidado la opción correcta con bolígrafo AZUL o NEGRO. Ejemplos: [• Correcto] [X Incorrecto] [- Incorrecto] [O Incorrecto]]
#v(2pt)

// 3. CARTILLA HORIZONTAL DE RESPUESTAS (1 A 60) - 4 COLUMNAS DE 15 FILAS
#rect(width: 100%, stroke: 0.85pt + black, fill: rgb("#fafafa"), inset: (x: 5pt, y: 4pt), radius: 2pt)[
  // Marcadores de timing negros en las 4 esquinas
  #place(top + left, dx: -2pt, dy: -2pt)[#rect(width: 8pt, height: 8pt, fill: black)]
  #place(top + right, dx: 2pt, dy: -2pt)[#rect(width: 8pt, height: 8pt, fill: black)]
  #place(bottom + left, dx: -2pt, dy: 2pt)[#rect(width: 8pt, height: 8pt, fill: black)]
  #place(bottom + right, dx: 2pt, dy: 2pt)[#rect(width: 8pt, height: 8pt, fill: black)]

  #align(center)[
    #text(weight: "bold", size: 9pt)[CARTILLA DE RESPUESTAS (1 A 60) --- VARIANTE A]
  ]
  #v(-2pt)
  #grid(
    columns: (25%, 25%, 25%, 25%),
    column-gutter: 6pt,
    [
      #table(
        columns: (18%, 16.4%, 16.4%, 16.4%, 16.4%, 16.4%),
        stroke: none,
        inset: (x: 0.2pt, y: 2.2pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        ..range(1, 16).map(n => (
          [#text(size: 7.5pt, weight: "bold")[#n.]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        )).flatten()
      )
    ],
    [
      #table(
        columns: (18%, 16.4%, 16.4%, 16.4%, 16.4%, 16.4%),
        stroke: none,
        inset: (x: 0.2pt, y: 2.2pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        ..range(16, 31).map(n => (
          [#text(size: 7.5pt, weight: "bold")[#n.]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        )).flatten()
      )
    ],
    [
      #table(
        columns: (18%, 16.4%, 16.4%, 16.4%, 16.4%, 16.4%),
        stroke: none,
        inset: (x: 0.2pt, y: 2.2pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        ..range(31, 46).map(n => (
          [#text(size: 7.5pt, weight: "bold")[#n.]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        )).flatten()
      )
    ],
    [
      #table(
        columns: (18%, 16.4%, 16.4%, 16.4%, 16.4%, 16.4%),
        stroke: none,
        inset: (x: 0.2pt, y: 2.2pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        ..range(46, 61).map(n => (
          [#text(size: 7.5pt, weight: "bold")[#n.]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        )).flatten()
      )
    ]
  )
]

#pagebreak()

// ========================================================
// PÁGINA 2 EN ADELANTE: CUESTIONARIO OFICIAL DE PREGUNTAS (60 REACTIVOS)
// ========================================================

#align(center)[
  #text(size: 11pt, weight: "bold")[CUESTIONARIO DE PREGUNTAS (60 REACTIVOS)]\
  #text(size: 9pt, weight: "bold", fill: luma(60))[[CPEC18] AUDITORÍA TRIBUTARIA · EVALUACIÓN TEÓRICA 1ER PARCIAL · VARIANTE A]
]

#v(-3pt)
#line(length: 100%, stroke: 0.75pt + black)
#v(3pt)

#text(weight: "bold", size: 10pt)[SELECCIÓN DE LA MEJOR RESPUESTA (Preguntas 1 a 15)]\
#text(size: 8.5pt, style: "italic")[*Instrucciones:* Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.]
#v(2pt)

#block(spacing: 4.5pt)[
  *1.* En la auditoría tributaria para determinar la base imponible del IUE se debe considerar como gasto no deducible:
  #h(12pt) *A)* Excluir los gastos personales de los socios sin respaldo de factura legal\
  #h(12pt) *B)* Deducir únicamente las compras vinculadas a la actividad gravada\
  #h(12pt) *C)* Depreciar conforme a la tabla oficial del D.S. 24051\
  #h(12pt) *D)* Registrar contablemente los sueldos del personal de planta\
  #h(12pt) *E)* Computar los aportes patronales devengados en el ejercicio\
]

#block(spacing: 4.5pt)[
  *2.* Según el Código Tributario Boliviano (Ley 2492), el término de prescripción de las facultades de fiscalización es de:
  #h(12pt) *A)* 2 años calendario continuos\
  #h(12pt) *B)* 4 años improrrogables\
  #h(12pt) *C)* 5 años para personas naturales únicamente\
  #h(12pt) *D)* 20 años en materia de contravenciones aduaneras\
  #h(12pt) *E)* 8 años para tributos de periodicidad anual y contravenciones\
]

#block(spacing: 4.5pt)[
  *3.* Para el cómputo del Crédito Fiscal IVA en compras de bienes y servicios, el documento fiscal debe:
  #h(12pt) *A)* Ser emitido exclusivamente en moneda extranjera\
  #h(12pt) *B)* Ser cancelado únicamente en efectivo al momento de la entrega\
  #h(12pt) *C)* Contar con autorización del Ministerio de Economía\
  #h(12pt) *D)* Estar vinculado a la actividad gravada, a nombre y NIT del sujeto pasivo y respaldado\
  #h(12pt) *E)* Tener una antigüedad mayor a 180 días calendario\
]

#block(spacing: 4.5pt)[
  *4.* En una auditoría tributaria, la técnica de confirmación de saldos con terceros verifica principalmente:
  #h(12pt) *A)* Estructura societaria y tenencia accionaria\
  #h(12pt) *B)* Existencia, integridad y exactitud de cuentas por cobrar y pagar comerciales\
  #h(12pt) *C)* Capacidad de pago futura y solvencia de la entidad\
  #h(12pt) *D)* Coeficiente de liquidez ácida del período\
  #h(12pt) *E)* Depreciación acumulada de activos intangibles\
]

#block(spacing: 4.5pt)[
  *5.* El método de determinación de la base imponible sobre base presunta procede cuando:
  #h(12pt) *A)* Se cuenta con estados financieros auditados con dictamen limpio\
  #h(12pt) *B)* El sujeto pasivo no presenta libros contables ni documentación fidedigna\
  #h(12pt) *C)* Las ventas superan los límites del régimen simplificado\
  #h(12pt) *D)* Se solicita una prórroga para el pago de la deuda\
  #h(12pt) *E)* El contribuyente presenta todos sus libros notariados\
]

#block(spacing: 4.5pt)[
  *6.* La alícuota general del Impuesto a las Transacciones (IT) según la Ley 843 es del:
  #h(12pt) *A)* 3% sobre los ingresos brutos devengados o percibidos\
  #h(12pt) *B)* 13% sobre el valor neto de la factura\
  #h(12pt) *C)* 25% sobre la utilidad neta imponible\
  #h(12pt) *D)* 1.5% sobre transacciones comerciales al por mayor\
  #h(12pt) *E)* 0.30% aplicable al débito y crédito bancario\
]

#block(spacing: 4.5pt)[
  *7.* Las compensaciones del IUE efectivamente pagado contra el IT operan:
  #h(12pt) *A)* A partir del mes siguiente al pago del IUE hasta su total agotamiento o nuevo vencimiento\
  #h(12pt) *B)* De manera retroactiva a los períodos del año anterior\
  #h(12pt) *C)* Únicamente contra el débito fiscal IVA compras\
  #h(12pt) *D)* Hasta un máximo del 50% de las ventas brutas declaradas\
  #h(12pt) *E)* Exclusivamente en empresas del sector minero y petrolero\
]

#block(spacing: 4.5pt)[
  *8.* El plazo reglamentario para la presentación de descargos ante una Vista de Cargo emitida por el SIN es de:
  #h(12pt) *A)* 30 días calendario improrrogables computables a partir de su notificación\
  #h(12pt) *B)* 10 días hábiles administrativos\
  #h(12pt) *C)* 60 días calendario continuos\
  #h(12pt) *D)* 15 días hábiles según Ley 2492\
  #h(12pt) *E)* 5 días hábiles a partir de la publicación en prensa\
]

#block(spacing: 4.5pt)[
  *9.* La bancarización obligatoria establecida por el SIN es exigible para transacciones iguales o mayores a:
  #h(12pt) *A)* Bs 10.000\
  #h(12pt) *B)* Bs 50.000\
  #h(12pt) *C)* Bs 100.000\
  #h(12pt) *D)* Bs 25.000\
  #h(12pt) *E)* Bs 5.000\
]

#block(spacing: 4.5pt)[
  *10.* La no emisión de factura en una venta de bienes o servicios constituye una contravención tributaria sancionada con:
  #h(12pt) *A)* Clausura del establecimiento comercial de acuerdo a la reincidencia\
  #h(12pt) *B)* Pérdida automática de la personería jurídica\
  #h(12pt) *C)* Decomiso definitivo de la mercadería sin reclamo\
  #h(12pt) *D)* Prisión de 1 a 3 años para el representante legal\
  #h(12pt) *E)* Suspensión definitiva del Registro Tributario (NIT)\
]

#block(spacing: 4.5pt)[
  *11.* En el Régimen Complementario al IVA (RC-IVA) para dependientes, el Formulario 110 admite facturas de hasta:
  #h(12pt) *A)* 120 días anteriores a la fecha de presentación al empleador\
  #h(12pt) *B)* 30 días anteriores a la fecha de presentación\
  #h(12pt) *C)* 60 días calendario improrrogables\
  #h(12pt) *D)* 180 días del año fiscal\
  #h(12pt) *E)* Exclusivamente del mes en curso\
]

#block(spacing: 4.5pt)[
  *12.* El ajuste por inflación y tenencia de bienes (AITB) de los activos fijos según la NC 3 tiene efecto fiscal de:
  #h(12pt) *A)* Ingreso o gasto gravable/deducible en la determinación del IUE\
  #h(12pt) *B)* No deducible en un 100% bajo ninguna circunstancia\
  #h(12pt) *C)* Exento de todo tributo de dominio nacional\
  #h(12pt) *D)* Compensable directamente contra el IVA compras\
  #h(12pt) *E)* Gravado exclusivamente por el Impuesto a las Grandes Fortunas\
]

#block(spacing: 4.5pt)[
  *13.* La alícuota por remesas de utilidades a beneficiarios del exterior por servicios prestados desde el extranjero es del:
  #h(12pt) *A)* 25% sobre el 50% presunto (Tasa efectiva 12.5%)\
  #h(12pt) *B)* 13% sobre el total remesado\
  #h(12pt) *C)* 3% por concepto de retención IT\
  #h(12pt) *D)* 25% sobre el 10% presunto (Tasa efectiva 2.5%)\
  #h(12pt) *E)* Exención total por tratados de doble tributación\
]

#block(spacing: 4.5pt)[
  *14.* En auditoría fiscal, las previsiones para incobrables no admitidas por el D.S. 24051 generan:
  #h(12pt) *A)* Un activo por impuesto diferido\
  #h(12pt) *B)* Un pasivo por impuesto diferido\
  #h(12pt) *C)* La nulidad de los estados financieros\
  #h(12pt) *D)* Un crédito fiscal trasladable al IT\
  #h(12pt) *E)* Una contingencia penal tributaria\
]

#block(spacing: 4.5pt)[
  *15.* El recurso de alzada ante la Autoridad Regional de Impugnación Tributaria (ARIT) debe interponerse en el plazo perentorio de:
  #h(12pt) *A)* 20 días improrrogables computables a partir de la notificación legal\
  #h(12pt) *B)* 15 días hábiles administrativos\
  #h(12pt) *C)* 30 días calendario continuos\
  #h(12pt) *D)* 45 días hábiles procesales\
  #h(12pt) *E)* 60 días calendario según Ley 2492\
]

#v(6pt)
#text(weight: "bold", size: 10pt)[FALSO O VERDADERO (Preguntas 16 a 25)]\
#text(size: 8.5pt, style: "italic")[*Instrucciones:* Determine si cada afirmación es verdadera (A) o falsa (B).]
#v(2pt)

#block(spacing: 4.5pt)[
  *16.* El principio de devengado tributario reconoce ingresos y gastos cuando se generan legalmente, con independencia del cobro o pago.
  #h(12pt) *A)* Verdadero\
  #h(12pt) *B)* Falso\
]

#block(spacing: 4.5pt)[
  *17.* Las donaciones a instituciones no lucrativas autorizadas son deducibles del IUE hasta el límite del 10% de la utilidad imponible.
  #h(12pt) *A)* Verdadero\
  #h(12pt) *B)* Falso\
]

#block(spacing: 4.5pt)[
  *18.* Las multas pagadas por contravenciones tributarias al SIN son consideradas gastos deducibles en la liquidación del IUE.
  #h(12pt) *A)* Verdadero\
  #h(12pt) *B)* Falso\
]

#block(spacing: 4.5pt)[
  *19.* El débito fiscal IVA se genera en la venta de bienes muebles en el momento de la entrega del bien o emisión de factura, lo que ocurra primero.
  #h(12pt) *A)* Verdadero\
  #h(12pt) *B)* Falso\
]

#block(spacing: 4.5pt)[
  *20.* Los contribuyentes del Régimen Tributario Simplificado (RTS) están obligados a emitir facturas oficiales y llevar libros de compras.
  #h(12pt) *A)* Verdadero\
  #h(12pt) *B)* Falso\
]

#block(spacing: 4.5pt)[
  *21.* La depreciación de inmuebles bajo el método de línea recta tiene un coeficiente anual del 2.5% según el D.S. 24051.
  #h(12pt) *A)* Verdadero\
  #h(12pt) *B)* Falso\
]

#block(spacing: 4.5pt)[
  *22.* El Impuesto a las Grandes Fortunas (IGF) aplica a personas naturales con patrimonio superior a Bs 30 millones en territorio nacional y extranjero.
  #h(12pt) *A)* Verdadero\
  #h(12pt) *B)* Falso\
]

#block(spacing: 4.5pt)[
  *23.* Las pérdidas tributarias acumuladas en el IUE pueden compensarse de manera indefinida sin límite temporal en empresas no productivas.
  #h(12pt) *A)* Verdadero\
  #h(12pt) *B)* Falso\
]

#block(spacing: 4.5pt)[
  *24.* La rectificatoria de una declaración jurada que incrementa el saldo a favor del contribuyente requiere aprobación previa mediante Resolución Administrativa del SIN.
  #h(12pt) *A)* Verdadero\
  #h(12pt) *B)* Falso\
]

#block(spacing: 4.5pt)[
  *25.* El crédito fiscal generado en compras de combustible (gasolina y diésel) es computable al 100% del valor total de la factura.
  #h(12pt) *A)* Verdadero\
  #h(12pt) *B)* Falso\
]

#v(6pt)
#text(weight: "bold", size: 10pt)[PREMISAS A / B / AMBAS / NINGUNA (Preguntas 26 a 35)]\
#text(size: 8.5pt, style: "italic")[*Instrucciones:* Analice las dos premisas planteadas y elija la opción correcta.]
#v(2pt)

#block(spacing: 4.5pt)[
  *26.* I. El crédito fiscal IVA respaldado por compras vinculadas a la actividad gravada es computable.\
II. Las retenciones tributarias no liberan al sujeto pasivo de su obligación formal.
  #h(12pt) *A)* Si la primera premisa es verdadera\
  #h(12pt) *B)* Si la segunda premisa es verdadera\
  #h(12pt) *C)* Si ambas premisas son verdaderas\
  #h(12pt) *D)* Si ninguna de las premisas es verdadera\
]

#block(spacing: 4.5pt)[
  *27.* I. Los profesionales independientes liquidan el IUE mediante el Formulario 510 aplicando la alícuota del 25% sobre el 50% presunto.\
II. El IT pagado por profesionales independientes es acreditable al 100% contra el IVA débito.
  #h(12pt) *A)* Si la primera premisa es verdadera\
  #h(12pt) *B)* Si la segunda premisa es verdadera\
  #h(12pt) *C)* Si ambas premisas son verdaderas\
  #h(12pt) *D)* Si ninguna de las premisas es verdadera\
]

#block(spacing: 4.5pt)[
  *28.* I. Los gastos de representación con respaldo de factura son 100% deducibles en el IUE sin ningún tope reglamentario.\
II. Los sueldos pagados a socios que no trabajan efectivamente en la empresa son deducibles.
  #h(12pt) *A)* Si la primera premisa es verdadera\
  #h(12pt) *B)* Si la segunda premisa es verdadera\
  #h(12pt) *C)* Si ambas premisas son verdaderas\
  #h(12pt) *D)* Si ninguna de las premisas es verdadera\
]

#block(spacing: 4.5pt)[
  *29.* I. La prescripción tributaria se interrumpe con la notificación de la Resolución Determinativa.\
II. El pago parcial de la deuda tributaria suspende el cómputo de la prescripción.
  #h(12pt) *A)* Si la primera premisa es verdadera\
  #h(12pt) *B)* Si la segunda premisa es verdadera\
  #h(12pt) *C)* Si ambas premisas son verdaderas\
  #h(12pt) *D)* Si ninguna de las premisas es verdadera\
]

#block(spacing: 4.5pt)[
  *30.* I. Las exportaciones definitivas de bienes están gravadas con tasa cero en el IVA.\
II. Los exportadores pueden solicitar la devolución del crédito fiscal mediante CEDEIMs.
  #h(12pt) *A)* Si la primera premisa es verdadera\
  #h(12pt) *B)* Si la segunda premisa es verdadera\
  #h(12pt) *C)* Si ambas premisas son verdaderas\
  #h(12pt) *D)* Si ninguna de las premisas es verdadera\
]

#block(spacing: 4.5pt)[
  *31.* I. Las compras de servicios a personas naturales no inscritas generan retención del 12.5% por IUE y 3% por IT.\
II. Las retenciones por compra de bienes son del 5% por IUE y 3% por IT.
  #h(12pt) *A)* Si la primera premisa es verdadera\
  #h(12pt) *B)* Si la segunda premisa es verdadera\
  #h(12pt) *C)* Si ambas premisas son verdaderas\
  #h(12pt) *D)* Si ninguna de las premisas es verdadera\
]

#block(spacing: 4.5pt)[
  *32.* I. El valor residual de los activos fijos totalmente depreciados se mantiene contablemente en Bs 1.\
II. La revalorización técnica de activos fijos genera crédito fiscal IVA automático.
  #h(12pt) *A)* Si la primera premisa es verdadera\
  #h(12pt) *B)* Si la segunda premisa es verdadera\
  #h(12pt) *C)* Si ambas premisas son verdaderas\
  #h(12pt) *D)* Si ninguna de las premisas es verdadera\
]

#block(spacing: 4.5pt)[
  *33.* I. Las notas fiscales emitidas por el Sistema Electrónico no requieren impresión física para su validez.\
II. El código QR impreso en facturas contiene información fiscal validada por el SIN.
  #h(12pt) *A)* Si la primera premisa es verdadera\
  #h(12pt) *B)* Si la segunda premisa es verdadera\
  #h(12pt) *C)* Si ambas premisas son verdaderas\
  #h(12pt) *D)* Si ninguna de las premisas es verdadera\
]

#block(spacing: 4.5pt)[
  *34.* I. La Vista de Cargo fija la liquidación previa de la deuda tributaria y abre el período probatorio.\
II. La Resolución Determinativa es el acto definitivo que pone fin al procedimiento de fiscalización.
  #h(12pt) *A)* Si la primera premisa es verdadera\
  #h(12pt) *B)* Si la segunda premisa es verdadera\
  #h(12pt) *C)* Si ambas premisas son verdaderas\
  #h(12pt) *D)* Si ninguna de las premisas es verdadera\
]

#block(spacing: 4.5pt)[
  *35.* I. La alícuota del ICE es idéntica para bebidas alcohólicas y vehículos automotores.\
II. El ICE pagado en importaciones es computable como crédito fiscal IVA.
  #h(12pt) *A)* Si la primera premisa es verdadera\
  #h(12pt) *B)* Si la segunda premisa es verdadera\
  #h(12pt) *C)* Si ambas premisas son verdaderas\
  #h(12pt) *D)* Si ninguna de las premisas es verdadera\
]

#v(6pt)
#text(weight: "bold", size: 10pt)[PREGUNTAS CON CLAVE DE RESPUESTA (Preguntas 36 a 45)]\
#text(size: 8.5pt, style: "italic")[*Instrucciones:* Marque: A si 1, 2 y 3 son correctas; B si 1 y 3; C si 2 y 4; D si solo 4; E si todas son correctas.]
#v(2pt)

#block(spacing: 4.5pt)[
  *36.* En una auditoría fiscal determine los reparos aplicables por incumplimiento a la normativa tributaria:\
1. Omisión de ingresos reales en estados financieros auditados.\
2. Gastos no deducibles por falta de documento de bancarización fehaciente.\
3. Crédito fiscal computado sin factura original o electrónica autorizada.\
4. Errores aritméticos en libros de compras y ventas IVA del período.
  #h(12pt) *A)* 1, 2 y 3 son correctas\
  #h(12pt) *B)* 1 y 3 son correctas\
  #h(12pt) *C)* 2 y 4 son correctas\
  #h(12pt) *D)* Solo 4 es correcta\
  #h(12pt) *E)* Todas son correctas\
]

#block(spacing: 4.5pt)[
  *37.* Son condiciones formales para la deducción de sueldos y salarios en la liquidación del IUE:\
1. Planillas de sueldos debidamente visadas por el Ministerio de Trabajo.\
2. Pago de aportes patronales y laborales a las entidades de seguridad social.\
3. Contratos de trabajo registrados ante la autoridad competente.\
4. Comprobante de retención del RC-IVA debidamente declarado en Formulario 608.
  #h(12pt) *A)* 1, 2 y 3 son correctas\
  #h(12pt) *B)* 1 y 3 son correctas\
  #h(12pt) *C)* 2 y 4 son correctas\
  #h(12pt) *D)* Solo 4 es correcta\
  #h(12pt) *E)* Todas son correctas\
]

#block(spacing: 4.5pt)[
  *38.* Constituyen hechos generadores del Impuesto a las Transacciones (IT):\
1. Venta de bienes muebles e inmuebles en territorio nacional.\
2. Prestación de servicios comerciales y profesionales de toda índole.\
3. Alquiler de bienes muebles e inmuebles.\
4. Transferencias a título gratuito de bienes y derechos.
  #h(12pt) *A)* 1, 2 y 3 son correctas\
  #h(12pt) *B)* 1 y 3 son correctas\
  #h(12pt) *C)* 2 y 4 son correctas\
  #h(12pt) *D)* Solo 4 es correcta\
  #h(12pt) *E)* Todas son correctas\
]

#block(spacing: 4.5pt)[
  *39.* Respecto a los métodos de depreciación admitidos por el D.S. 24051 determine su validez:\
1. Método de línea recta según tabla oficial de vida útil.\
2. Método de unidades producidas con aprobación previa del SIN.\
3. Método de horas de trabajo para maquinaria pesada.\
4. Depreciación libre elegida discrecionalmente por la empresa.
  #h(12pt) *A)* 1, 2 y 3 son correctas\
  #h(12pt) *B)* 1 y 3 son correctas\
  #h(12pt) *C)* 2 y 4 son correctas\
  #h(12pt) *D)* Solo 4 es correcta\
  #h(12pt) *E)* Todas son correctas\
]

#block(spacing: 4.5pt)[
  *40.* Son facultades específicas de la Administración Tributaria según la Ley 2492:\
1. Control, comprobación, verificación, fiscalización e investigación.\
2. Determinación de tributos sobre base cierta o presunta.\
3. Imposición de sanciones y ejecución de la deuda tributaria.\
4. Emisión de normas reglamentarias de carácter general.
  #h(12pt) *A)* 1, 2 y 3 son correctas\
  #h(12pt) *B)* 1 y 3 son correctas\
  #h(12pt) *C)* 2 y 4 son correctas\
  #h(12pt) *D)* Solo 4 es correcta\
  #h(12pt) *E)* Todas son correctas\
]

#block(spacing: 4.5pt)[
  *41.* Constituyen causales de nulidad absoluta en los actos administrativos tributarios:\
1. Actos dictados por autoridad incompetente por razón de materia o territorio.\
2. Omisión de la fundamentación técnica y legal del reparo.\
3. Actos dictados prescindiendo total y absolutamente del procedimiento legalmente establecido.\
4. Errores mecanográficos en el domicilio fiscal del contribuyente.
  #h(12pt) *A)* 1, 2 y 3 son correctas\
  #h(12pt) *B)* 1 y 3 son correctas\
  #h(12pt) *C)* 2 y 4 son correctas\
  #h(12pt) *D)* Solo 4 es correcta\
  #h(12pt) *E)* Todas son correctas\
]

#block(spacing: 4.5pt)[
  *42.* Son elementos que componen la Deuda Tributaria (DT) según el Artículo 47 del CTB:\
1. Tributo Omitido expresado en Unidades de Fomento de Vivienda (UFV).\
2. Intereses moratorios calculados con la tasa activa oficial.\
3. Multa por incumplimiento a deberes formales (IDF).\
4. Sanción por omisión de pago o defraudación tributaria.
  #h(12pt) *A)* 1, 2 y 3 son correctas\
  #h(12pt) *B)* 1 y 3 son correctas\
  #h(12pt) *C)* 2 y 4 son correctas\
  #h(12pt) *D)* Solo 4 es correcta\
  #h(12pt) *E)* Todas son correctas\
]

#block(spacing: 4.5pt)[
  *43.* Tratamiento de las mermas y desmedros en la auditoría de inventarios para el IUE:\
1. Las mermas normales no requieren informe técnico de perito independiente.\
2. Los desmedros deben ser comunicados al SIN con 10 días de anticipación a su destrucción.\
3. Las pérdidas extraordinarias por caso fortuito son deducibles si existe denuncia policial.\
4. La destrucción de mercaderías requiere presencia obligatoria de Notario de Fe Pública.
  #h(12pt) *A)* 1, 2 y 3 son correctas\
  #h(12pt) *B)* 1 y 3 son correctas\
  #h(12pt) *C)* 2 y 4 son correctas\
  #h(12pt) *D)* Solo 4 es correcta\
  #h(12pt) *E)* Todas son correctas\
]

#block(spacing: 4.5pt)[
  *44.* Requisitos para la deducibilidad de intereses por deudas financieras contraídas en el exterior:\
1. Que la deuda esté vinculada directamente a la obtención de rentas gravadas.\
2. Que la tasa de interés no supere la tasa LIBOR/SOFR más 3 puntos porcentuales.\
3. Que se efectúe la retención del IUE-BE por remesas al exterior.\
4. Que el acreedor sea una empresa filial del mismo grupo económico sin contrato.
  #h(12pt) *A)* 1, 2 y 3 son correctas\
  #h(12pt) *B)* 1 y 3 son correctas\
  #h(12pt) *C)* 2 y 4 son correctas\
  #h(12pt) *D)* Solo 4 es correcta\
  #h(12pt) *E)* Todas son correctas\
]

#block(spacing: 4.5pt)[
  *45.* Son documentos soporte indispensables en el legajo de auditoría tributaria permanente:\
1. Testimonio de constitución social y poderes de representación legal.\
2. Número de Identificación Tributaria (NIT) y certificados de inscripción.\
3. Estados Financieros auditados y dictámenes tributarios de gestiones anteriores.\
4. Resoluciones Administrativas de exención o autorización de sistemas computarizados.
  #h(12pt) *A)* 1, 2 y 3 son correctas\
  #h(12pt) *B)* 1 y 3 son correctas\
  #h(12pt) *C)* 2 y 4 son correctas\
  #h(12pt) *D)* Solo 4 es correcta\
  #h(12pt) *E)* Todas son correctas\
]

#v(6pt)
#text(weight: "bold", size: 10pt)[CASOS PRÁCTICOS Y PROBLEMAS APLICADOS (Preguntas 46 a 55)]\
#rect(width: 100%, stroke: 0.5pt + luma(100), fill: rgb("#f8fafc"), inset: 4pt)[
  #text(size: 9pt)[*CASO PRÁCTICO N° 1 (Comercial Andina S.R.L.):* En la fiscalización integral se detectaron compras no bancarizadas por Bs 150.000 y retenciones de servicios no declaradas.]
]
#v(2pt)

#block(spacing: 4.5pt)[
  *46.* Calcule el reparo impositivo aplicable por IUE no deducible al detectarse facturas sin bancarización por Bs 150.000:
  #h(12pt) *A)* Reparo IUE Bs 37.500 (25%) + Sanción formal 500 UFV\
  #h(12pt) *B)* Reparo IUE Bs 19.500 (13%) + Sanción formal 200 UFV\
  #h(12pt) *C)* Crédito Fiscal IVA a reintegrar de Bs 19.500 (13%)\
  #h(12pt) *D)* No procede reparo si la factura tiene código de autorización vigente\
  #h(12pt) *E)* Reparo total acumulado consolidado de Bs 75.000\
]

#block(spacing: 4.5pt)[
  *47.* Al no haber bancarizado las compras de Bs 150.000, ¿cuál es el Crédito Fiscal IVA indebidamente apropiado a reintegrar?
  #h(12pt) *A)* Bs 37.500 calculados al 25%\
  #h(12pt) *B)* Bs 4.500 correspondiente al IT\
  #h(12pt) *C)* Bs 19.500 correspondiente al 13% del valor total facturado\
  #h(12pt) *D)* No se reintegra si el proveedor declaró la venta\
  #h(12pt) *E)* Bs 150.000 reintegrable en su totalidad\
]

#block(spacing: 4.5pt)[
  *48.* Determine la sanción por omisión de pago si la empresa no rectifica voluntariamente antes de la Vista de Cargo:
  #h(12pt) *A)* 100% del tributo omitido actualizado en UFV al día del pago\
  #h(12pt) *B)* 20% del tributo si cancela en etapa preliminar\
  #h(12pt) *C)* 40% del tributo según el Artículo 156 del CTB\
  #h(12pt) *D)* 60% del tributo en caso de reincidencia\
  #h(12pt) *E)* Sanción fija de 5.000 UFV sin actualización\
]

#block(spacing: 4.5pt)[
  *49.* Calcule el interés moratorio generado si transcurrieron 500 días con una tasa de interés del 4% anual sobre el tributo omitido:
  #h(12pt) *A)* Bs 5.200 calculados con interés simple\
  #h(12pt) *B)* Interés moratorio compuesto según fórmula oficial del Artículo 47 CTB\
  #h(12pt) *C)* Tasa fija mensual del 1.5%\
  #h(12pt) *D)* Exención de intereses por caso de fuerza mayor\
  #h(12pt) *E)* Interés bancario comercial del 12% anual\
]

#block(spacing: 4.5pt)[
  *50.* Determine la Deuda Tributaria consolidada total expresada en Unidades de Fomento de Vivienda (UFV):
  #h(12pt) *A)* DT = Tributo Omitido (UFV) + Intereses (UFV) + Sanción Omisión Pago\
  #h(12pt) *B)* DT = Solo Tributo Omitido histórico en moneda nacional\
  #h(12pt) *C)* DT = Tributo Omitido x Cotización del Dólar Oficial\
  #h(12pt) *D)* DT = Intereses moratorios sin considerar la sanción pecuniaria\
  #h(12pt) *E)* DT = Monto de las facturas no bancarizadas de Bs 150.000\
]

#v(6pt)
#rect(width: 100%, stroke: 0.5pt + luma(100), fill: rgb("#f8fafc"), inset: 4pt)[
  #text(size: 9pt)[*CASO PRÁCTICO N° 2 (Constructora del Valle S.A.):* Contrato de obra pública de Bs 2.000.000 con 60% de avance físico certificado y retención del 7% de garantía.]
]
#v(2pt)

#block(spacing: 4.5pt)[
  *51.* En una constructora con contrato de Bs 2.000.000 y 60% de avance físico certificado, ¿cuál es el ingreso gravado devengado en el IUE?
  #h(12pt) *A)* Ingreso devengado de Bs 1.200.000 sujeto a facturación y cómputo de IUE\
  #h(12pt) *B)* Ingreso total diferido de Bs 2.000.000 al inicio de la obra\
  #h(12pt) *C)* Solo los anticipos financieros cobrados en efectivo\
  #h(12pt) *D)* Bs 800.000 correspondiente al saldo pendiente de ejecución\
  #h(12pt) *E)* Exención total hasta la entrega definitiva de la obra\
]

#block(spacing: 4.5pt)[
  *52.* Si los costos reales acumulados fueron de Bs 800.000, determine la Utilidad Bruta Imponible devengada en el ejercicio:
  #h(12pt) *A)* Bs 1.200.000 sin deducir costos directos\
  #h(12pt) *B)* Utilidad Bruta Imponible de Bs 400.000 (Bs 1.200.000 - Bs 800.000)\
  #h(12pt) *C)* Pérdida tributaria de Bs 800.000\
  #h(12pt) *D)* Bs 600.000 aplicando margen presunto de utilidad\
  #h(12pt) *E)* Bs 200.000 descontando retenciones de garantía\
]

#block(spacing: 4.5pt)[
  *53.* Tratamiento tributario de la retención de garantía del 7% efectuada por el contratante en planillas de avance:
  #h(12pt) *A)* Reduce directamente el Débito Fiscal IVA del mes\
  #h(12pt) *B)* Exime del pago del Impuesto a las Transacciones\
  #h(12pt) *C)* No reduce la base imponible del IVA ni del IT y se factura sobre el monto total\
  #h(12pt) *D)* Se deduce como gasto no deducible en el IUE\
  #h(12pt) *E)* Constituye un pago a cuenta del IUE anual\
]

#block(spacing: 4.5pt)[
  *54.* Cálculo del Impuesto a las Transacciones (IT) generado sobre la planilla certificada de Bs 1.200.000:
  #h(12pt) *A)* Bs 36.000 (3% sobre el total de la planilla devengada)\
  #h(12pt) *B)* Bs 156.000 (13% por concepto de IVA e IT)\
  #h(12pt) *C)* Bs 12.000 descontando el anticipo\
  #h(12pt) *D)* Bs 300.000 aplicando alícuota del IUE\
  #h(12pt) *E)* Exento por tratarse de obra pública estatal\
]

#block(spacing: 4.5pt)[
  *55.* Efecto de la provisión por garantías de post-construcción en la liquidación del IUE:
  #h(12pt) *A)* Deducción automática al 100% en el ejercicio de suscripción\
  #h(12pt) *B)* Crédito fiscal computable en el periodo siguiente\
  #h(12pt) *C)* Exención impositiva reglamentaria\
  #h(12pt) *D)* Constituye gasto no deducible hasta que se ejecute el desembolso efectivo\
  #h(12pt) *E)* Compensable contra el Impuesto a las Transacciones\
]

#v(6pt)
#text(weight: "bold", size: 10pt)[EMPAREJAMIENTO DE CONCEPTOS (Preguntas 56 a 60)]\
#rect(width: 100%, stroke: 0.5pt + luma(100), fill: rgb("#f8fafc"), inset: 4pt)[
  #text(size: 8.5pt)[*OPCIONES DE REFERENCIA:*\
  *A)* Determinación sobre Base Presunta #h(0.5cm) *B)* Crédito Fiscal IVA Trasladable\
  *C)* Alícuota Adicional IUE Financiero #h(0.5cm) *D)* Exención Tributaria Subjetiva\
  *E)* Determinación sobre Base Cierta]
  #v(1pt)
  #text(size: 8pt, style: "italic")[Relacione cada uno de los siguientes enunciados con la opción correspondiente:]
]
#v(2pt)

#block(spacing: 4.5pt)[
  *56.* Procedimiento de fiscalización directa con libros contables y documentos de respaldo fidedignos.
  #h(12pt) *A)* Determinación sobre Base Presunta\
  #h(12pt) *B)* Crédito Fiscal IVA Trasladable\
  #h(12pt) *C)* Alícuota Adicional IUE Financiero\
  #h(12pt) *D)* Exención Tributaria Subjetiva\
  #h(12pt) *E)* Determinación sobre Base Cierta\
]

#block(spacing: 4.5pt)[
  *57.* Tratamiento fiscal del saldo a favor del contribuyente que se actualiza con la variación de la UFV.
  #h(12pt) *A)* Determinación sobre Base Presunta\
  #h(12pt) *B)* Crédito Fiscal IVA Trasladable\
  #h(12pt) *C)* Alícuota Adicional IUE Financiero\
  #h(12pt) *D)* Exención Tributaria Subjetiva\
  #h(12pt) *E)* Determinación sobre Base Cierta\
]

#block(spacing: 4.5pt)[
  *58.* Método de liquidación tributaria aplicable cuando el contribuyente oculta ventas y no tiene registros contables.
  #h(12pt) *A)* Determinación sobre Base Presunta\
  #h(12pt) *B)* Crédito Fiscal IVA Trasladable\
  #h(12pt) *C)* Alícuota Adicional IUE Financiero\
  #h(12pt) *D)* Exención Tributaria Subjetiva\
  #h(12pt) *E)* Determinación sobre Base Cierta\
]

#block(spacing: 4.5pt)[
  *59.* Beneficio tributario otorgado a fundaciones y asociaciones civiles sin fines de lucro debidamente registradas.
  #h(12pt) *A)* Determinación sobre Base Presunta\
  #h(12pt) *B)* Crédito Fiscal IVA Trasladable\
  #h(12pt) *C)* Alícuota Adicional IUE Financiero\
  #h(12pt) *D)* Exención Tributaria Subjetiva\
  #h(12pt) *E)* Determinación sobre Base Cierta\
]

#block(spacing: 4.5pt)[
  *60.* Sobretasa impositiva del 25% aplicada a entidades de intermediación financiera con rentabilidad superior al 6%.
  #h(12pt) *A)* Determinación sobre Base Presunta\
  #h(12pt) *B)* Crédito Fiscal IVA Trasladable\
  #h(12pt) *C)* Alícuota Adicional IUE Financiero\
  #h(12pt) *D)* Exención Tributaria Subjetiva\
  #h(12pt) *E)* Determinación sobre Base Cierta\
]
