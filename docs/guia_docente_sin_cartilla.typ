#set document(
  title: "Guía Docente: Carga y Entrega de Calificaciones (Exámenes Sin Cartilla)",
  author: "Universidad UNITEPC · Departamento de Evaluaciones",
  date: auto
)

#set page(
  paper: "us-letter",
  margin: (top: 2.4cm, bottom: 2.0cm, x: 1.9cm),
  header: context {
    if counter(page).get().first() > 1 [
      #grid(
        columns: (1fr, auto),
        align: (left + horizon, right + horizon),
        [
          #text(size: 8pt, fill: rgb("#64748b"), weight: "bold")[
            UNIVERSIDAD UNITEPC · SISTEMA DE EVALUACIONES
          ]
        ],
        [
          #text(size: 8pt, fill: rgb("#94a3b8"))[
            Guía Docente · Exámenes Sin Cartilla
          ]
        ]
      )
      #v(-3pt)
      #line(length: 100%, stroke: 0.5pt + rgb("#cbd5e1"))
    ]
  },
  footer: context [
    #line(length: 100%, stroke: 0.5pt + rgb("#cbd5e1"))
    #v(2pt)
    #grid(
      columns: (1fr, auto),
      align: (left + horizon, right + horizon),
      [
        #text(size: 7.5pt, fill: rgb("#94a3b8"))[
          Documento Institucional Oficial · Gestión Académica II-2026
        ]
      ],
      [
        #text(size: 8pt, fill: rgb("#64748b"), weight: "bold")[
          Página #counter(page).display()
        ]
      ]
    )
  ]
)

#set text(
  font: ("Segoe UI", "Arial", "Liberation Sans"),
  size: 9.3pt,
  lang: "es",
  fill: rgb("#1e293b")
)

#set par(justify: true, leading: 0.58em)

// =============================================================
// PÁGINA 1: PORTADA, RESUMEN Y PASO 1 (ACCESO)
// =============================================================

#block(
  fill: rgb("#f8fafc"),
  stroke: 1pt + rgb("#e2e8f0"),
  radius: 7pt,
  inset: 10pt,
  width: 100%,
  [
    #grid(
      columns: (55pt, 1fr),
      gutter: 12pt,
      align: (center + horizon, left + horizon),
      [
        #image("guia-docente-recursos/logo_unitepc.png", width: 50pt)
      ],
      [
        #text(size: 8.5pt, weight: "bold", fill: rgb("#0369a1"))[
          UNIVERSIDAD PRIVADA UNITEPC
        ]\
        #text(size: 13.5pt, weight: "black", fill: rgb("#0f172a"))[
          GUÍA DEL DOCENTE: CALIFICACIONES SIN CARTILLA
        ]\
        #text(size: 8.5pt, fill: rgb("#475569"))[
          Sistema de Evaluaciones · Procedimiento de Carga de Notas, Emisión de Planilla y Entrega Física
        ]
      ]
    )
  ]
)

#v(4pt)

#text(size: 10pt, weight: "bold", fill: rgb("#0f172a"))[1. Resumen del Flujo Operativo]

En las evaluaciones presenciales de modalidad *Sin Cartilla*, el docente titular califica los exámenes en aula y registra las notas en el *Sistema de Evaluaciones*. Al completar la nómina, el sistema emite la *Planilla Oficial de Calificaciones*, la cual debe imprimirse, firmarse y entregarse en el *Departamento de Evaluaciones* junto con las pruebas físicas.

#v(3pt)

#table(
  columns: (30pt, 100pt, 1fr, 80pt),
  stroke: 0.5pt + rgb("#cbd5e1"),
  fill: (x, y) => if y == 0 { rgb("#0f172a") } else if calc.even(y) { rgb("#f8fafc") } else { rgb("#ffffff") },
  align: (center, left, left, center),
  table.header(
    [*#text(fill: white, size: 7.5pt)[Paso]*],
    [*#text(fill: white, size: 7.5pt)[Etapa]*],
    [*#text(fill: white, size: 7.5pt)[Acción del Docente]*],
    [*#text(fill: white, size: 7.5pt)[Estado Sistema]*],
  ),
  [1], [*Acceso / Notificación*], [Clic en alerta de campana o en _Banco de Preguntas_], [Entregado],
  [2], [*Carga de Notas*], [Ingresar calificaciones sobre *60 puntos* en nómina oficial], [En registro],
  [3], [*Cierre y Calificación*], [Pulsar _"Guardar y Calificar Examen"_ (cierre definitivo)], [Calificado],
  [4], [*Firma de Planilla*], [Imprimir PDF oficial generado y estampar firma y sello], [Pend. Respaldo],
  [5], [*Entrega Física*], [Presentar planilla + exámenes físicos en Evaluaciones], [Confirmado ✓],
)

#v(4pt)

#text(size: 10pt, weight: "bold", fill: rgb("#0f172a"))[2. Paso 1: Ingreso a la Planilla de Calificaciones]

El docente puede acceder a registrar calificaciones tan pronto el examen se encuentre en estado *Entregado* o *Pendiente de Notas*:

+ *Vía Campana de Notificaciones (Recomendada):* En la barra superior aparece la alerta: _"Examen sin cartilla con notas pendientes de registro"_. Al hacer clic, el sistema lo dirige directamente a la planilla.
+ *Vía Módulo Banco de Preguntas:* Ingrese a *Banco de Preguntas* (`/banco-preguntas`), seleccione *Sede, Carrera, Materia, Grupo y Parcial*. En la tarjeta principal pulse el botón *Cargar y Calificar Notas*.

#v(2pt)

#figure(
  image("guia-docente-recursos/figura_1_notificacion_acceso.png", width: 92%),
  caption: [Alerta en la campana de notificaciones y botón de acceso en la tarjeta del examen.]
)

#pagebreak()

// =============================================================
// PÁGINA 2: PASO 2 (CARGA DE NOTAS Y CÁLCULO SOBRE 100)
// =============================================================

#text(size: 10pt, weight: "bold", fill: rgb("#0f172a"))[3. Paso 2: Registro de Calificaciones en la Nómina Oficial]

Al abrir la ventana emergente *Planilla Oficial de Calificaciones*, el sistema presenta la nómina oficial del grupo:

- *Casilla "Nota / 60":* Digite la calificación del estudiante en escala de *0 a 60 puntos*.
- *Columna "Nota / 100":* El sistema calcula en tiempo real la equivalencia oficial:
  $ "Nota"_(100) = ("Nota"_(60) times 100) / 60 $
- *Regla de nómina completa:* Se deben calificar todos los estudiantes del grupo. Si un estudiante no rindió la prueba, debe asignársele `0`.
- *Verificación de progreso:* El contador indicará cuando todas las notas estén cargadas mostrando la insignia verde *COMPLETAS 4/4*.

#v(2pt)

#figure(
  image("guia-docente-recursos/captura_real_modal.png", width: 88%),
  caption: [Captura real del sistema mostrando la ventana oficial de calificaciones (SIS-413 Telecomunicaciones).]
)

#v(2pt)

#figure(
  image("guia-docente-recursos/figura_2_modal_lleno.png", width: 88%),
  caption: [Detalle de notas registradas con cálculo automático sobre 100 y botón de guardado habilitado.]
)

#pagebreak()

// =============================================================
// PÁGINA 3: PASOS 3, 4 Y 5 (GUARDADO, PLANILLA Y ENTREGA)
// =============================================================

#text(size: 10pt, weight: "bold", fill: rgb("#0f172a"))[4. Paso 3: Guardado y Consolidación Definitiva]

Al completar la nómina, pulse el botón verde *Guardar y Calificar Examen*.

#block(
  fill: rgb("#eff6ff"),
  stroke: 0.8pt + rgb("#93c5fd"),
  radius: 6pt,
  inset: 7pt,
  [
    #text(weight: "bold", fill: rgb("#1e3a8a"))[Regla de Inmutabilidad Docente:]
    El guardado realizado por el docente es definitivo. Una vez guardadas las notas, el examen pasa a estado *CALIFICADO* y las notas no pueden modificarse desde el perfil docente. Cualquier rectificación posterior debe gestionarse a través de Dirección de Carrera.
  ]
)

#v(2pt)

#text(size: 10pt, weight: "bold", fill: rgb("#0f172a"))[5. Paso 4: Impresión y Firma de la Planilla Oficial]

Tras guardar, el sistema descarga automáticamente el PDF: `Planilla_Notas_[SIGLA]_[GRUPO].pdf` (también disponible mediante el botón *Imprimir Planilla Oficial*).

+ *Imprima la planilla en formato papel.*
+ *Verifique los datos:* Sigla, materia, grupo, parcial, fecha y calificaciones sobre 60 y 100.
+ *Firme y selle:* Estampe su firma manuscrita y pie de sello en el recuadro *Docente Titular*.

#v(1pt)

#figure(
  image("guia-docente-recursos/figura_4_planilla_oficial_preview.png", width: 75%),
  caption: [Estructura de la Planilla Oficial con resumen estadístico y recuadros de firma institucional.]
)

#v(2pt)

#text(size: 10pt, weight: "bold", fill: rgb("#0f172a"))[6. Paso 5: Entrega Física en el Departamento de Evaluaciones]

Para formalizar y concluir el registro del examen:

+ Diríjase a las oficinas del *Departamento de Evaluaciones* de su sede.
+ Entregue al personal de Evaluaciones:
  - La *Planilla Oficial de Calificaciones impresa, firmada y sellada*.
  - Los *exámenes físicos calificados* de los estudiantes.
+ El personal de Evaluaciones verificará los documentos contra el sistema y registrará la recepción física, pasando el examen al estado final *CONFIRMADO ✓*.

#v(1pt)

#figure(
  image("guia-docente-recursos/figura_5_etapa_confirmado.png", width: 85%),
  caption: [Estado final Confirmado que valida el archivo formal y concluye el parcial.]
)
