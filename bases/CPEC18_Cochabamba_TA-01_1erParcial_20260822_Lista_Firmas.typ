#set page(
  paper: "us-legal",
  margin: 2cm,
  header: none,
  footer: [
    #line(length: 100%, stroke: 0.5pt + black)
    #v(-2pt)
    #grid(
      columns: (50%, 50%),
      align: (left, right),
      [#text(size: 8pt, fill: luma(80))[UNIVERSIDAD TÉCNICA PRIVADA COSMOS · SEA EVALUACIONES]],
      [#text(size: 8pt, fill: luma(80))[PÁGINA #counter(page).display()]]
    )
  ]
)
#set text(font: "Times New Roman", size: 10.5pt, lang: "es")
#set par(leading: 0.52em)

// Cabecera Oficial Institucional (Sin Fondos)
#table(
  columns: (22%, 78%),
  stroke: 0.75pt + black,
  fill: none,
  inset: (x: 5pt, y: 3.5pt),
  align: (center + horizon, center + horizon),
  [
    #image("logo_unitepc_clean.png", width: 85%)
  ],
  [
    #text(weight: "bold")[UNIVERSIDAD TECNICA PRIVADA COSMOS]\
    #text(weight: "bold")[GESTION 2-2026]\
    #v(-4.5pt)
    #line(length: 100%, stroke: 0.5pt + black)
    #v(-2.5pt)
    #text(weight: "bold")[PLANILLA OFICIAL DE ASISTENCIA Y FIRMAS DE EVALUACION]
  ]
)

#v(-4pt)

// Datos de la Asignatura y Examen (Sin Fondos)
#table(
  columns: (58%, 42%),
  stroke: 0.5pt + black,
  fill: none,
  inset: (x: 5pt, y: 2.2pt),
  [*CARRERA:* AUDITORÍA / CONTADURÍA],
  [*GRUPO:* TA-01],
  [*MATERIA:* [CPEC18] AUDITORÍA TRIBUTARIA],
  [*EXAMEN:* 1er Parcial],
  [*DOCENTE:* MAURICIO QUIROZ LAFUENTE],
  [*FECHA:* 22/08/2026],
  [*SEMESTRE:* 3],
  [*HORA:* 08:15:00 - 09:45:00],
  [*AULA / CAMPUS:* Aula Central · Cochabamba],
  [*MODALIDAD:* Presencial con Cartilla OMR]
)

#v(4pt)

#text(size: 9pt)[*INSTRUCCIONES PARA EL CONTROL DE ASISTENCIA:* Cada estudiante debe verificar sus datos, registrar su firma de puño y letra al recibir el examen y confirmar la variante asignada.]

#v(3pt)

// TABLA OFICIAL DE ESTUDIANTES Y FIRMAS (SIN FONDOS)
#table(
  columns: (6%, 15%, 39%, 12%, 28%),
  stroke: 0.5pt + black,
  fill: none,
  inset: (x: 4pt, y: 6pt),
  align: (center + horizon, center + horizon, left + horizon, center + horizon, center + horizon),
  
  // Encabezados
  [*N°*], [*CÓDIGO*], [*APELLIDOS Y NOMBRES*], [*VARIANTE*], [*FIRMA DEL ESTUDIANTE*],
  [1], [7849102], [JUAN CARLOS PÉREZ MAMANI], [*TIPO A*], [#box(width: 100%, baseline: 4pt, line(length: 100%, stroke: (dash: "dotted", thickness: 0.75pt)))],
  [2], [8392104], [MARÍA BELÉN QUISPE FLORES], [*TIPO B*], [#box(width: 100%, baseline: 4pt, line(length: 100%, stroke: (dash: "dotted", thickness: 0.75pt)))],
  [3], [6928103], [RODRIGO ALEJANDRO CONDORI RODRÍGUEZ], [*TIPO A*], [#box(width: 100%, baseline: 4pt, line(length: 100%, stroke: (dash: "dotted", thickness: 0.75pt)))],

)

#v(12pt)

// RESUMEN Y FIRMAS DE CONFORMIDAD
#table(
  columns: (50%, 50%),
  stroke: 0.5pt + black,
  fill: none,
  inset: 6pt,
  [
    #text(weight: "bold")[RESUMEN DE ASISTENCIA:]\
    #v(3pt)
    Total Estudiantes Matriculados: #strong[3]\
    Total Estudiantes Presentes: #box(width: 30pt, baseline: 3pt, line(length: 100%, stroke: 0.5pt + black))\
    Total Estudiantes Ausentes: #box(width: 30pt, baseline: 3pt, line(length: 100%, stroke: 0.5pt + black))
  ],
  [
    #align(center)[
      #v(20pt)
      #line(length: 75%, stroke: 0.75pt + black)
      #v(-2pt)
      #text(weight: "bold", size: 9pt)[FIRMA DOCENTE TITULAR]\
      #text(size: 8pt)[MAURICIO QUIROZ LAFUENTE]
    ]
  ]
)
