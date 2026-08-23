#set page(
  paper: "us-legal", // 8.5in x 13in (Oficio UNITEPC)
  margin: 2cm,
  header: none,
  footer: none
)
#set text(font: "Times New Roman", size: 11pt, lang: "es")
#set par(leading: 0.7em, justify: true)

// ============================================================================
// EXAMEN OFICIAL UNITEPC - CARLOS EDUARDO ROCHA GUZMÁN (ID: 6549812)
// VARIANTE ASIGNADA: TIPO A (CONFIDENCIAL)
// ============================================================================

#grid(
  columns: (83.5%, 16.5%),
  column-gutter: 10pt,
  [
    // Cabecera Oficial Idéntica a Sistema Macro (Sin fondo negro en logo)
    #table(
      columns: (22%, 58%, 20%),
      stroke: 0.75pt + black,
      align: (center + horizon, center + horizon, center + horizon),
      fill: (x, y) => if x == 2 and y == 0 { rgb("#fff7ed") } else { none },
      [
        #image("logo_unitepc_clean.png", width: 90%)
      ],
      [
        #text(size: 11pt, weight: "bold")[UNIVERSIDAD TECNICA PRIVADA COSMOS]\
        #text(size: 9.5pt, weight: "bold")[GESTION 2-2026]\
        #v(-4pt)
        #line(length: 100%, stroke: 0.5pt + black)
        #v(-2pt)
        #text(size: 9.5pt, weight: "bold")[EVALUACION TEORICA 1ER PARCIAL]
      ],
      [
        #text(size: 8pt, weight: "bold", fill: rgb("#9a3412"))[TIPO /\ VARIANTE]\
        #v(-2pt)
        #text(size: 11pt, weight: "bold", fill: rgb("#9a3412"))[A]
      ]
    )

    #v(-4pt)

    // Datos del Estudiante Oficiales
    #table(
      columns: (65%, 35%),
      stroke: 0.5pt + black,
      [#text(size: 9pt)[*NOMBRE:* CARLOS EDUARDO ROCHA GUZMÁN]],
      [#text(size: 9pt)[*CODIGO:* 6549812]],
      [#text(size: 9pt)[*CARRERA:* LICENCIATURA EN AUDITORÍA / CONTADURÍA]],
      [#text(size: 9pt)[*GRUPO:* TA-01]],
      [#text(size: 9pt)[*DOCENTE:* MAURICIO QUIROZ LAFUENTE]],
      [#text(size: 9pt)[*TIPO DE EXAMEN:* 1er Parcial]],
      [#text(size: 9pt)[*MATERIA:* [CPEC18] AUDITORÍA TRIBUTARIA]],
      [#text(size: 9pt)[*FECHA:* 22/08/2026]],
      [#text(size: 9pt)[*SEMESTRE:* 3]],
      [#text(size: 9pt)[*HORA:* 08:15:00 - 09:45:00]],
      table.cell(colspan: 2)[
        #align(center)[
          #text(size: 8pt, weight: "bold", fill: rgb("#b91c1c"))[IMPORTANTE: Completar obligatoriamente NOMBRE, CODIGO y marcar el TIPO/VARIANTE en la cartilla.]
        ]
      ]
    )

    #v(2pt)
    #line(length: 100%, stroke: 2pt + black)
    #v(-4pt)
    #text(size: 10.5pt, weight: "bold")[SELECCION DE LA MEJOR RESPUESTA]
    #v(-2pt)
    #text(size: 8pt, style: "italic")[Instrucciones: Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles. Puede marcar sus respuestas en el texto con lapicero azul o negro, y debe rellenar con delicadeza y cuidado la opción en la Cartilla OMR.]
    #v(-2pt)
    #line(length: 100%, stroke: 0.5pt + black)
    #v(2pt)

    #block(spacing: 8pt)[
      *1.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la responsabilidad solidaria de los administradores y directores, señale el criterio técnico y legal correcto:
      #v(2pt)
      #pad(left: 14pt)[
        A) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
        B) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
        C) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
        D) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
        E) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
      ]
    ]

    #block(spacing: 8pt)[
      *2.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el devengamiento de intereses moratorios a favor de la Administración, señale el criterio técnico y legal correcto:
      #v(2pt)
      #pad(left: 14pt)[
        A) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
        B) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
        C) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
        D) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
        E) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
      ]
    ]

    #block(spacing: 8pt)[
      *3.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el Impuesto a los Consumos Específicos (ICE) en bebidas alcohólicas, señale el criterio técnico y legal correcto:
      #v(2pt)
      #pad(left: 14pt)[
        A) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
        B) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
        C) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
        D) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
        E) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
      ]
    ]

  ],
  [
    // CARTILLA OMR 100% VERTICAL EN HOJA OFICIO (60 FILAS BALANCEADAS)
    #rect(width: 100%, stroke: 0.85pt + black, fill: rgb("#fafafa"), inset: (x: 1.5pt, y: 4pt), radius: 2pt)[
      #align(center)[
        #text(size: 8pt, weight: "bold")[CARTILLA OMR]\
        #text(size: 6pt, fill: luma(80))[60 Reactivos (A-E)]
      ]
      #v(1pt)
      #line(length: 100%, stroke: 0.5pt + black)
      #v(1pt)

      #table(
        columns: (18%, 16.4%, 16.4%, 16.4%, 16.4%, 16.4%),
        stroke: none,
        inset: (x: 0.5pt, y: 1.6pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        [#text(size: 6pt, weight: "bold")[1.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[2.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[3.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[4.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[5.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[6.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[7.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[8.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[9.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[10.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[11.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[12.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[13.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[14.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[15.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[16.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[17.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[18.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[19.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[20.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[21.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[22.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[23.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[24.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[25.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[26.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[27.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[28.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[29.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[30.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[31.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[32.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[33.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[34.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[35.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[36.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[37.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[38.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[39.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[40.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[41.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[42.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[43.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[44.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[45.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[46.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[47.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[48.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[49.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[50.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[51.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[52.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[53.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[54.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[55.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[56.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[57.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[58.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[59.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],
        [#text(size: 6pt, weight: "bold")[60.]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[A]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[B]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[C]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[D]]]],
        [#circle(radius: 3pt, stroke: 0.35pt + black)[#align(center + horizon)[#text(size: 4.5pt)[E]]]],

      )

      #v(3pt)
      #line(length: 100%, stroke: 0.5pt + black)
      #v(6pt)
      #line(length: 85%, stroke: (dash: "dashed", thickness: 0.5pt))
      #align(center)[
        #text(size: 6pt, weight: "bold")[FIRMA ESTUDIANTE]\
        #text(size: 5.5pt, fill: luma(100))[ID: 6549812]
      ]
    ]
  ]
)

#pagebreak()

// ============================================================================
// PÁGINAS SUBSIGUIENTES: PREGUNTAS 4 A 60 EN 1 SOLA COLUMNA (FORMATO MACRO)
// ============================================================================

#block(spacing: 8pt)[
  *4.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a las exenciones tributarias a colegios, universidades y entidades educativas, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    B) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    C) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    D) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    E) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
  ]
]

#block(spacing: 8pt)[
  *5.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la exclusión de crédito fiscal por compras en zonas francas, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    B) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    C) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    D) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    E) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
  ]
]

#block(spacing: 8pt)[
  *6.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el procedimiento de Determinación de Oficio y la Vista de Cargo, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    B) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    C) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    D) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    E) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
  ]
]

#block(spacing: 8pt)[
  *7.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el pago indebido o en exceso y la Acción de Repetición, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    B) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    C) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    D) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    E) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
  ]
]

#block(spacing: 8pt)[
  *8.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la deducibilidad de sueldos pagados al cónyuge o parientes, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    B) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    C) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    D) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    E) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
  ]
]

#block(spacing: 8pt)[
  *9.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a las diferencias temporales y permanentes en la Norma Contable 6, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    B) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    C) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    D) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    E) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
  ]
]

#block(spacing: 8pt)[
  *10.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la determinación del Débito Fiscal IVA en notas de crédito y débito, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    B) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    C) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    D) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    E) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
  ]
]

#block(spacing: 8pt)[
  *11.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la auditoría de ingresos extraordinarios y diferencias de cambio, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    B) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    C) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    D) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    E) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
  ]
]

#block(spacing: 8pt)[
  *12.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el Impuesto Especial a los Hidrocarburos y sus Derivados (IEHD), señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    B) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    C) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    D) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    E) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
  ]
]

#block(spacing: 8pt)[
  *13.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el informe de procedimientos acordados en auditoría fiscal, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    B) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    C) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    D) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    E) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
  ]
]

#block(spacing: 8pt)[
  *14.*  Las compensaciones del IUE efectivamente pagado contra el Impuesto a las Transacciones (IT) operan:
  #v(2pt)
  #pad(left: 14pt)[
    A) Ninguna de las anteriores \
    B) Únicamente contra el Impuesto al Valor Agregado \
    C) A partir del mes siguiente al pago del IUE hasta su total agotamiento \
    D) De forma retroactiva a períodos anteriores \
    E) Todas las anteriores \
  ]
]

#block(spacing: 8pt)[
  *15.*  En una auditoría tributaria, la técnica de confirmación de saldos con terceros verifica principalmente:
  #v(2pt)
  #pad(left: 14pt)[
    A) Estructura societaria y tenencia accionaria \
    B) Ninguna de las anteriores \
    C) Capacidad de pago futura de la entidad \
    D) Existencia, integridad y exactitud de cuentas por cobrar y pagar \
    E) Todas las anteriores \
  ]
]

#block(spacing: 8pt)[
  *16.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el recurso jerárquico ante la Autoridad General de Impugnación, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    B) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    C) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    D) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    E) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
  ]
]

#block(spacing: 8pt)[
  *17.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el cómputo del mantenimiento de valor en UFV según Código Tributario, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    B) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    C) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    D) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    E) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
  ]
]

#block(spacing: 8pt)[
  *18.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el Régimen Tributario Simplificado y sus límites de capital, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    B) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    C) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    D) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    E) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
  ]
]

#block(spacing: 8pt)[
  *19.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la validez de la firma digital en documentos tributarios electrónicos, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    B) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    C) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    D) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    E) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
  ]
]

#block(spacing: 8pt)[
  *20.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a las pruebas periciales en procesos contenciosos tributarios, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    B) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    C) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    D) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    E) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
  ]
]

#block(spacing: 8pt)[
  *21.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a las provisiones y previsiones deducibles para incobrabilidad, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    B) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    C) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    D) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    E) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
  ]
]

#block(spacing: 8pt)[
  *22.*  Al final de cada proceso de auditoría tributaria para determinar la base imponible del IUE se debe:
  #v(2pt)
  #pad(left: 14pt)[
    A) Depreciar conforme a la tabla oficial del D.S. 24051 \
    B) Ninguna de las anteriores \
    C) Todas las anteriores \
    D) Excluir los gastos personales sin respaldo de factura legal \
    E) Deducir únicamente las compras vinculadas a la actividad gravada \
  ]
]

#block(spacing: 8pt)[
  *23.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la calificación de la conducta tributaria omisión de pago vs defraudación, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    B) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    C) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    D) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    E) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
  ]
]

#block(spacing: 8pt)[
  *24.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la auditoría tributaria preventiva y la matriz de riesgos impositivos, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    B) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    C) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    D) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    E) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
  ]
]

#block(spacing: 8pt)[
  *25.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el Libro de Ventas Menores del día para comerciantes minoristas, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    B) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    C) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    D) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    E) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
  ]
]

#block(spacing: 8pt)[
  *26.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la clausura por no emisión de factura o documento equivalente, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    B) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    C) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    D) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    E) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
  ]
]

#block(spacing: 8pt)[
  *27.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el tratamiento impositivo de las cooperativas de servicios, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    B) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    C) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    D) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    E) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
  ]
]

#block(spacing: 8pt)[
  *28.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a los inventarios físicos y las mermas o desmedros justificados, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    B) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    C) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    D) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    E) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
  ]
]

#block(spacing: 8pt)[
  *29.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el acta de recepción final de la fiscalización tributaria, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    B) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    C) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    D) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    E) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
  ]
]

#block(spacing: 8pt)[
  *30.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el procedimiento de cobro coactivo y las medidas precautorias, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    B) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    C) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    D) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    E) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
  ]
]

#block(spacing: 8pt)[
  *31.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a las fiscalizaciones electrónicas y cruces masivos de información, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    B) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    C) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    D) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    E) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
  ]
]

#block(spacing: 8pt)[
  *32.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a las retenciones tributarias del IUE e IT por servicios de personas no inscritas, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    B) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    C) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    D) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    E) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
  ]
]

#block(spacing: 8pt)[
  *33.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el acta de custodia de cuadernillos y exámenes institucionales, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    B) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    C) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    D) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    E) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
  ]
]

#block(spacing: 8pt)[
  *34.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la fiscalización integral y la fiscalización puntual externa, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    B) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    C) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    D) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    E) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
  ]
]

#block(spacing: 8pt)[
  *35.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el Recurso de Alzada ante la Autoridad de Impugnación Tributaria, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    B) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    C) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    D) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    E) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
  ]
]

#block(spacing: 8pt)[
  *36.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la verificación del cumplimiento de la Ley 843 y decretos, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    B) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    C) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    D) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    E) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
  ]
]

#block(spacing: 8pt)[
  *37.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la determinación de la tasa efectiva de tributación (TET), señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    B) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    C) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    D) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    E) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
  ]
]

#block(spacing: 8pt)[
  *38.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el valor probatorio de los libros de contabilidad manuales y electrónicos, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    B) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    C) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    D) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    E) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
  ]
]

#block(spacing: 8pt)[
  *39.*  La alícuota general del Impuesto a las Transacciones (IT) según la Ley 843 es del:
  #v(2pt)
  #pad(left: 14pt)[
    A) 13% sobre el valor neto de la factura \
    B) 25% sobre la utilidad neta imponible \
    C) Todas las anteriores \
    D) 3% sobre los ingresos brutos devengados o percibidos \
    E) Ninguna de las anteriores \
  ]
]

#block(spacing: 8pt)[
  *40.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el tratamiento tributario de las pérdidas no compensadas del IUE, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    B) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    C) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    D) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    E) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
  ]
]

#block(spacing: 8pt)[
  *41.*  El Régimen Complementario al IVA (RC-IVA) para dependientes permite el descargo con facturas de antigüedad no mayor a:
  #v(2pt)
  #pad(left: 14pt)[
    A) 30 días calendario \
    B) 60 días corridos \
    C) Todas las anteriores \
    D) 120 días calendario anteriores a la presentación \
    E) Ninguna de las anteriores \
  ]
]

#block(spacing: 8pt)[
  *42.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el Impuesto a las Salidas Aéreas al Exterior (ISAE), señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    B) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    C) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    D) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    E) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
  ]
]

#block(spacing: 8pt)[
  *43.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el tratamiento impositivo de dividendos y remesas al exterior, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    B) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    C) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    D) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    E) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
  ]
]

#block(spacing: 8pt)[
  *44.*  Según el Código Tributario Boliviano (Ley 2492), el término de prescripción de las facultades de fiscalización es de:
  #v(2pt)
  #pad(left: 14pt)[
    A) 2 años calendario continuos \
    B) Ninguna de las anteriores \
    C) 8 años para tributos y contravenciones \
    D) Todas las anteriores \
    E) 4 años improrrogables \
  ]
]

#block(spacing: 8pt)[
  *45.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el cálculo de la alícuota adicional del IUE para entidades financieras, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    B) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    C) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    D) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    E) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
  ]
]

#block(spacing: 8pt)[
  *46.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el régimen de incentivos tributarios para la industrialización, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    B) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    C) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    D) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    E) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
  ]
]

#block(spacing: 8pt)[
  *47.*  La bancarización obligatoria según normativa tributaria aplica a operaciones iguales o superiores a:
  #v(2pt)
  #pad(left: 14pt)[
    A) Bs. 50.000 (Cincuenta mil bolivianos) \
    B) Bs. 25.000 (Veinticinco mil bolivianos) \
    C) Ninguna de las anteriores \
    D) Bs. 10.000 (Diez mil bolivianos) \
    E) Todas las anteriores \
  ]
]

#block(spacing: 8pt)[
  *48.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la deducibilidad de donaciones a entidades sin fines de lucro, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    B) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    C) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    D) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    E) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
  ]
]

#block(spacing: 8pt)[
  *49.*  El método de determinación de la base imponible sobre base presunta procede cuando:
  #v(2pt)
  #pad(left: 14pt)[
    A) El sujeto pasivo no presenta libros ni documentación fidedigna \
    B) El contribuyente presenta todos sus libros notariados \
    C) Todas las anteriores \
    D) Ninguna de las anteriores \
    E) Se cuenta con estados financieros auditados limpios \
  ]
]

#block(spacing: 8pt)[
  *50.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la conciliación tributaria en el dictamen sobre información complementaria, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    B) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    C) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    D) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    E) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
  ]
]

#block(spacing: 8pt)[
  *51.*  Para el cómputo del Crédito Fiscal IVA en compras de bienes y servicios, el documento fiscal debe:
  #v(2pt)
  #pad(left: 14pt)[
    A) Ninguna de las anteriores \
    B) Estar vinculado a la actividad gravada y a nombre del sujeto pasivo \
    C) Ser cancelado únicamente en efectivo \
    D) Haber sido emitido exclusivamente en moneda extranjera \
    E) Todas las anteriores \
  ]
]

#block(spacing: 8pt)[
  *52.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el tratamiento contable-tributario del arrendamiento financiero Leasing, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    B) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    C) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    D) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    E) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
  ]
]

#block(spacing: 8pt)[
  *53.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la resolución determinativa y sus requisitos de validez legal, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    B) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    C) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    D) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    E) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
  ]
]

#block(spacing: 8pt)[
  *54.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el Sistema de Facturación Electrónica en Línea y sus modalidades, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    B) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    C) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    D) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    E) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
  ]
]

#block(spacing: 8pt)[
  *55.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la prescripción de sanciones pecuniarias por contravenciones, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    B) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    C) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    D) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    E) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
  ]
]

#block(spacing: 8pt)[
  *56.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a los precios de transferencia y operaciones entre partes vinculadas, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    B) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    C) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    D) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    E) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
  ]
]

#block(spacing: 8pt)[
  *57.*  En el examen de pasivos tributarios, la omisión de pago se configura cuando:
  #v(2pt)
  #pad(left: 14pt)[
    A) Se solicita facilidad de pago antes del vencimiento \
    B) El contribuyente presenta y cancela en fecha \
    C) Ninguna de las anteriores \
    D) El sujeto pasivo no paga el tributo dentro de los plazos legales \
    E) Todas las anteriores \
  ]
]

#block(spacing: 8pt)[
  *58.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a las multas por Incumplimiento a Deberes Formales (IDF), señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    B) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    C) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    D) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    E) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
  ]
]

#block(spacing: 8pt)[
  *59.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a la auditoría de activos fijos y su revalúo técnico tributario, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    B) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
    C) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    D) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    E) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
  ]
]

#block(spacing: 8pt)[
  *60.*  En el marco de la normativa tributaria vigente y los principios de auditoría fiscal, respecto a el Registro de Compras y Ventas (RCV) y sus plazos de confirmación, señale el criterio técnico y legal correcto:
  #v(2pt)
  #pad(left: 14pt)[
    A) El procedimiento exige registro fehaciente, sustento documental y cumplimiento estricto del D.S. 24051 \
    B) Requiere autorización previa expresa de la Administración Tributaria mediante Resolución Administrativa \
    C) Constituye crédito fiscal computable únicamente en el período de liquidación y cierre definitivo \
    D) Aplica la alícuota general con respaldo en extractos bancarios y comprobantes debidamente foliados \
    E) Se debe imputar directamente a resultados acumulados sin afectar la base imponible del ejercicio \
  ]
]

#v(10pt)
#rect(width: 100%, stroke: 0.75pt + black, fill: rgb("#f8fafc"), inset: 8pt, radius: 3pt)[
  #align(center)[
    #text(size: 10pt, weight: "bold")[*** FIN DE LA EVALUACIÓN TEÓRICA OFICIAL (60 PREGUNTAS) ***]\
    #v(2pt)
    #text(size: 9pt, fill: luma(80))[Verifique que todas sus 60 respuestas se encuentren correctamente rellenadas con lapicero o lápiz en la Cartilla OMR de la Página 1.]
  ]
]
