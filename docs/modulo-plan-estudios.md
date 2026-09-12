# Módulo Plan de Estudios

## Resumen funcional

La vista **Plan de Estudios** consulta el catálogo oficial de SEA y muestra las asignaturas de la sede y carrera seleccionadas. Cada grupo se presenta en una fila independiente, porque cada grupo puede tener su propio rol, banco de preguntas y estado de evaluación. Los grupos, docentes y sus identificadores se consultan directamente desde el servicio SEA de grupos y horarios, sin depender de que exista un rol de examen. Los roles registrados se usan únicamente para completar el seguimiento de cada parcial del grupo correspondiente.

## Información de exámenes

Para cada asignatura se muestra la información del parcial seleccionado en los filtros. El docente puede cambiar el parcial mediante los botones de seguimiento:

La vista también permite generar el **Reporte diario de seguimiento de evaluaciones** como un PDF horizontal tamaño oficio (8,5 x 13 pulgadas). El documento conserva la fecha y los filtros seleccionados, ordena las evaluaciones por el resultado visible en la lista y presenta una fila por evaluación con materia/grupo, docente, modalidad y espacios manuales para registrar hora y cantidad de recojo, firmas, devolución y observaciones. Cuando el volumen supera la capacidad de una página, el encabezado se repite automáticamente.

- 1er Parcial.
- 2do Parcial.
- Examen Final.
- 2da Instancia.

El parcial seleccionado informa:

- fecha programada del examen, tomada del rol correspondiente a la gestión,
  carrera, asignatura y grupo seleccionados;
- cantidad de preguntas fáciles, medias y difíciles del banco cargado;
- total de preguntas;
- modalidad: con cartilla, sin cartilla o virtual;
- estado del rol de examen;
- disponibilidad del banco de preguntas.

## Regla del indicador OK

El indicador verde **OK** aparece únicamente cuando existe un rol de examen y su banco de preguntas registrado contiene exactamente:

- 60 preguntas en total;
- 15 preguntas fáciles;
- 30 preguntas medias;
- 15 preguntas difíciles.

Cuando todavía no existe el examen se muestra **Sin examen**. Si existe el examen pero no se encuentra su banco, se muestra **Banco pendiente**. Si el banco está cargado pero no cumple la distribución, se muestra **Pendiente**.

## Catálogos y endpoints utilizados

- `GET /api/catalogo-academico/sedes`
- `GET /api/catalogo-academico/carreras?branchOfficeCode={codigo}`
- `GET /api/catalogo-academico/asignaturas?branchOfficeCode={codigo}&careerId={uuid}` (el UUID se envía a SEA; el código se usa únicamente para autorización interna)
- `GET /api/catalogo-academico/grupos?term={gestion}&branchOfficeId={uuid}&careerId={uuid}`
- `GET /api/roles-examen?sedeCodigo={codigo}&carreraCodigo={codigo}`
- `GET /api/bancos-preguntas/{rolExamenId}`

El filtro **Plan Curricular** utiliza únicamente el campo `planCurricular` que
entrega el catálogo SEA. Si la respuesta oficial no contiene ese dato, el
selector permanece sin opciones y muestra que SEA no informó planes
curriculares; no se presentan planes fijos o inventados.

## Criterios de implementación

- No se usan sedes, carreras, materias ni bancos ficticios para esta vista.
- La sede Cochabamba y la carrera de Sistemas solo se usan como selección inicial si están disponibles en el catálogo oficial; el usuario puede cambiar ambas.
- Si una carrera no tiene roles registrados, sus asignaturas siguen visibles y muestran el grupo/docente entregado por SEA; solo el parcial se muestra como **Sin examen**.
- El catálogo institucional entrega el nombre del docente en `teacherFullName`; el sistema lo normaliza como nombre del docente para mostrarlo en todas las vistas. Si excepcionalmente no llega el nombre pero sí el CI, se muestra **Nombre no disponible (CI ...)** y no un nombre inventado.
- La información de cada parcial se construye con el rol y banco que corresponden a esa asignatura y grupo; nunca se mezclan bancos o estados de grupos distintos en una misma fila.
- Cuando una asignatura tiene varios grupos, se generan varias filas con el mismo código y nombre de asignatura, pero con docente, grupo, rol y banco independientes.
- Los grupos se consultan usando la gestión seleccionada. Los roles se
  intersectan con esos grupos por `seaGroupId` para evitar mostrar la fecha de
  otra gestión; si SEA no devuelve grupos vigentes, no se muestran roles ni
  fechas sin una asociación confiable con la gestión seleccionada.
- La fecha se muestra por parcial desde `fechaDisplay`, con respaldo en
  `fecha`; cuando no existe un examen o fecha, la interfaz muestra `—`.

## Verificación

- Build Angular de producción correcto.
- Imagen Docker del frontend reconstruida y levantada correctamente.
- Validación manual de los endpoints oficiales con la instancia local.
- Filtro de búsqueda, plan curricular y ocultamiento de asignaturas sin
  asignar conectados a señales reactivas para actualizar la tabla al cambiar.
- La fecha visible cambia al seleccionar 1er parcial, 2do parcial, examen
  final o 2da instancia y se reconstruye al recargar la combinación de gestión,
  sede y carrera.

## Pendiente

- Conectar el cambio de modalidad de la vista con una operación persistente del rol, si se decide que esa acción debe modificar también el calendario oficial.
- Agregar pruebas automatizadas del adaptador de roles y bancos cuando se defina el contrato estable de datos de SEA.
