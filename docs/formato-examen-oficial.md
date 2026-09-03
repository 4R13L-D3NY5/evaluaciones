# Formato oficial de exámenes

Documento vivo de referencia para el subproyecto Sistema de Evaluaciones de XpertiFlow. Toda modificación del generador debe actualizar este archivo y sus pruebas antes de desplegarse.

## Nota operativa de cartilla OMR

La cartilla OMR es un documento separado del examen. El cuadernillo no incluye cartilla, variante ni clave visible. Las cartillas preimpresas se gestionan desde [modulo-cartillas-omr.md](modulo-cartillas-omr.md): muestran N°, código de materia, grupo, código y nombre del estudiante; la variante se conserva exclusivamente en el mapeo interno del sistema.

## 1. Documento de salida

- La generación oficial del rol produce directamente un PDF oficial, sin una vista previa intermedia.
- Antes de aprobar un banco, el docente puede abrir una previsualización PDF real del examen para validar la diagramación; esa previsualización no persiste el banco ni contiene datos de estudiantes.
- Se genera un único PDF por rol de examen, con todos los estudiantes inscritos.
- Cada estudiante ocupa su propio examen dentro del PDF y recibe las preguntas correspondientes a su variante asignada.
- El PDF consolidado es el único documento operativo que se muestra en la columna `Documentos`.
- Los archivos fuente o artefactos técnicos de generación no se muestran al usuario como documentos oficiales.
- La hoja de respuestas institucional se entrega por separado. No se genera cartilla OMR dentro del examen.
- El PDF solo debe estar disponible después de que el rol alcance el estado `GENERADO` o uno posterior.

### Previsualización del banco

- La previsualización se construye como PDF Oficio, no como maqueta HTML.
- Siempre usa una sola columna, Times New Roman 11 pt, interlineado 1 em, separación de preguntas 1,5 em, sangría de incisos de 1 em y márgenes de 2 cm.
- No debe contener nombres, códigos ni otros datos ficticios de estudiantes. El pie queda reservado para `NOMBRE COMPLETO` y `CÓDIGO`, sin valores.
- La aprobación del banco solo se habilita después de generar y recorrer este PDF real hasta su última página; si el documento aún no se ha visualizado por completo, la interfaz debe mostrar el aviso y mantener bloqueado el registro.

## 2. Papel, márgenes y tipografía

- Papel: Oficio, folio UNITEPC, 21,59 cm x 33,02 cm.
- Márgenes: 2 cm en los cuatro lados.
- Fuente de todo el contenido textual: Times New Roman.
- Tamaño general: 11 pt.
- Única excepción de tamaño: el código del estudiante en la ficha de cabecera y en el pie de página, 15 pt.
- No se deben introducir tamaños adicionales para títulos, instrucciones, encabezados, opciones o datos institucionales.
- Interlineado (`leading`): 0,8 em.
- Separación entre preguntas: 1,2 em.
- Los bloques de preguntas no deben dividirse entre páginas.
- Una imagen opcional almacenada en `imagen_base64` se muestra debajo del enunciado, conservando su proporción y el tamaño seleccionado mediante el metadato interno `#sea-size=GRANDE|MEDIANA|PEQUENA`; la previsualización y el PDF oficial deben aplicar la misma escala.

## 3. Cabecera institucional

- La cabecera de cada examen contiene la identificación institucional, académica y del estudiante:
  - Una tabla superior con el logotipo institucional en la celda izquierda y la identificación académica en la celda derecha.
  - Universidad Técnica Privada Cosmos.
  - Gestión 2-2026.
  - Evaluación teórica y el parcial correspondiente.
  - Todo el texto de la cabecera debe estar en mayúsculas.
  - Debajo de la tabla debe aparecer la ficha del examen con nombre del estudiante, carrera, asignatura, grupo, semestre, docente, parcial, fecha, hora, firma y código.
  - Debajo de la ficha debe aparecer centrado `CUESTIONARIO DE PREGUNTAS (N)` y una línea horizontal de separación.
  - La ficha utiliza dos columnas y mantiene vacíos únicamente los campos que no correspondan al contexto oficial.
  - No mostrar la variante en ninguna parte visible del examen.
  - No mostrar el texto compuesto con código de materia, materia, parcial y variante.

## 4. Pie de página y paginación

- El pie de cada página debe mostrar el nombre completo del estudiante.
- Debajo del nombre, con salto de línea, debe mostrar el código del estudiante.
- El código del estudiante se presenta en 15 pt y es el único valor con ese tamaño.
- Debe existir paginación visible.
- La paginación se reinicia en 1 para cada estudiante.
- Cada nuevo examen debe comenzar en una página física impar.
- Si es necesario para cumplir la regla de página impar, se permite una página de separación en blanco.

## 5. Cuestionario

- Configuración por defecto vigente: 30 preguntas respondibles distribuidas en 7 fáciles, 16 medias y 7 difíciles. Las tarjetas de contexto de casos y emparejamientos no consumen esta cantidad.
- Después del número de cada pregunta se imprime `___` para que el estudiante marque el inciso elegido.
- El enunciado inicia de forma continua, en la misma línea después de esos tres guiones.
- Cada inciso aplicable se imprime en una línea independiente.
- Los incisos se desplazan un tab a la derecha, equivalente a 1 em.
- Los incisos y su texto no llevan negrita.
- No se debe forzar un salto de línea después de `___`; el salto se aplica únicamente cuando el texto alcanza el margen derecho.
- El primer inciso, cuando exista, se presenta debajo del enunciado y no en la línea del número ni de los guiones.
- Esta regla aplica a selección, premisas, casos prácticos y a las preguntas dependientes de un emparejamiento.
- Cada nueva sección debe destacarse con una línea superior gruesa, título en negrita y mayúsculas, una instrucción descriptiva y una línea inferior fina.
- En las instrucciones solo la palabra `INSTRUCCIONES:` se escribe en mayúsculas; el texto descriptivo conserva mayúsculas y minúsculas normales. Las claves de premisas, V/F complejas y emparejamiento preservan sus saltos de línea semánticos.
- Los bloques de sección deben conservar separación vertical suficiente para que el estudiante identifique con facilidad el cambio de tipo de reactivo.
- Los casos clínicos o problemas y los emparejamientos deben conservar sus bloques tipo tarjeta con borde; las preguntas internas respetan la numeración y los incisos del formato general.
- Si durante la selección de preguntas se incorpora un caso clínico, problema o emparejamiento, se debe incluir el bloque completo con todos sus subítems u opciones relacionadas; nunca se permite seleccionar solo una parte del grupo.
- El orden de los subítems u opciones relacionadas debe ser exactamente el orden original del banco validado, aunque las variantes cambien el orden de otros reactivos o de sus opciones.
- Los enunciados mantienen texto normal, sin negrita, salvo el número de pregunta y sus tres guiones `___`. El enunciado principal de un emparejamiento se mantiene dentro de su tarjeta de referencia.
- Las imágenes de apoyo no reemplazan el texto ni las opciones de respuesta y deben mantenerse dentro del ancho útil de la hoja, sin recortar ni deformar la proporción original.
- En `Emparejamiento Ampliado`, el enunciado principal y sus opciones de referencia A-E se imprimen dentro de la tarjeta, sin número de pregunta ni `___`. Las opciones relacionadas del grupo se imprimen después como preguntas numeradas y sí conservan `___`.
- Verdadero o falso simple no muestra incisos ni opciones impresas; el estudiante responde en el espacio `___` y la clave se conserva únicamente de forma interna para calificación.
- En verdadero o falso complejo, las cuatro afirmaciones de cada pregunta se identifican como `1`, `2`, `3` y `4`; debajo se presenta el grupo de respuestas A-E para que el estudiante marque una sola clave.
- En emparejamiento ampliado, después de la tarjeta de referencia se presenta el grupo de respuestas A-E debajo de cada pregunta relacionada.

## 6. Variantes y asignación

- Ratio institucional por defecto: 5 estudiantes por variante.
- La cantidad de variantes se calcula como `ceil(estudiantes / 5)`.
- Se utilizan las variantes A, B, C, D y E cuando el tamaño del grupo lo requiere.
- La asignación estudiante-variante se realiza aleatoriamente en cada generación.
- La distribución debe ser balanceada por grupos de hasta cinco estudiantes: por ejemplo, 12 estudiantes producen 5 de A, 5 de B y 2 de C.
- La asignación persistida en la base de datos es la fuente oficial para auditoría y control.
- El nombre completo y el código de cada estudiante deben provenir de la nómina oficial de SEA; nunca se deben usar estudiantes de ejemplo ni valores de relleno.
- Cada estudiante debe recibir en el PDF las preguntas y el orden de opciones de su variante asignada.
- La letra de la variante puede conservarse en metadatos internos y en la base de datos, pero nunca imprimirse en el examen.

## 7. Flujo operativo

1. El rol de examen debe estar registrado y validado.
2. El banco de preguntas debe estar cargado y validado en el backend.
3. El administrador solicita la generación desde el flujo oficial.
4. La solicitud se encola en RabbitMQ.
5. El worker obtiene los datos oficiales, selecciona reactivos, construye variantes y asigna aleatoriamente cada estudiante.
6. El worker compila un único PDF consolidado.
7. El backend registra variantes, mapeos estudiante-variante, patrón de respuestas y ruta del PDF.
8. El rol pasa a `GENERADO` y el PDF aparece en `Documentos`.
9. Si el proceso debe reiniciarse, solo se permite restablecer un rol posterior a `VALIDADO` y debe volver exactamente a `VALIDADO`.

## 8. Persistencia mínima

Debe conservarse en la base de datos:

- Rol de examen.
- Banco de preguntas utilizado.
- Variantes generadas y su patrón de respuestas.
- Orden de reactivos por variante.
- Mapeo de cada estudiante a su variante.
- Hash de control de seguridad.
- Ruta del PDF consolidado.
- Auditoría de la generación y de los restablecimientos.

## 9. Criterios de aceptación

- El PDF consolidado abre correctamente y contiene a todos los estudiantes inscritos.
- Cada estudiante inicia en página impar.
- El pie muestra nombre, código en 15 pt y paginación reiniciada.
- No aparece ninguna variante impresa.
- No aparece la cartilla OMR.
- No aparece el texto técnico de Typst como documento visible.
- La previsualización del banco no muestra nombres, códigos ni datos de ejemplo de estudiantes.
- La previsualización del banco se abre como PDF real y permanece en una sola columna.
- La previsualización debe reproducir la cabecera institucional, la ficha vacía, los separadores de sección, las instrucciones en mayúsculas con sus saltos de línea y los bloques tarjeta del documento oficial.
- La cabecera de previsualización debe mostrar la misma ficha, pero sin inventar estudiante, código, materia, grupo, docente ni variante; los campos reservados permanecen vacíos.
- No existen incisos en negrita.
- Las opciones de los tipos que las requieren están en líneas separadas y con sangría de 1 em; verdadero o falso simple no imprime opciones.
- El PDF usa Oficio y márgenes de 2 cm.
- El generador pasa las pruebas unitarias y se realiza inspección visual del PDF renderizado.

## 10. Historial de cambios

| Fecha | Cambio |
|---|---|
| 2026-08-29 | Enunciado continuo después de `___`, leading de 0,8 em, separación entre preguntas de 1,2 em, instrucciones en estilo oración y V/F simple sin opciones impresas. |
| 2026-08-29 | Ficha de cabecera por estudiante con datos oficiales y saltos explícitos en las instrucciones. Las reglas iniciales de salto después de `___` e incisos A/B de V/F simple fueron reemplazadas por la configuración vigente. |
| 2026-08-29 | Recuperación de cabecera institucional, separadores superior/inferior por sección, instrucciones en mayúsculas, numeración con `___` en negrita y tarjetas para casos/emparejamientos en el PDF oficial y la previsualización. |
| 2026-08-29 | Previsualización PDF real del banco, sin datos ficticios, una sola columna y normalización de etiquetas descriptivas oficiales del Excel. |
| 2026-08-30 | La aprobación de la previsualización queda bloqueada hasta recorrer todas las páginas del PDF real; se agrega un mensaje explícito y se aclara que las observaciones de opciones se corrigen en el Excel oficial. |
| 2026-08-30 | El enunciado principal de Emparejamiento Ampliado se presenta dentro de su tarjeta de referencia, sin `___`; las preguntas dependientes mantienen la numeración y los guiones. La previsualización usa los parámetros persistidos de Administración de Evaluaciones. |
| 2026-09-02 | Las imágenes opcionales del banco se incorporan tanto a la previsualización PDF como al PDF oficial, con escala consistente y sin deformación; las filas madre de casos/emparejamientos no consumen numeración. |
| 2026-09-02 | La selección de variantes trata los casos, problemas y emparejamientos como bloques indivisibles: incluye todos sus subítems y conserva su orden original. |
| 2026-08-29 | Un PDF consolidado por rol, un examen por estudiante, inicio en página impar, pie con identidad y paginación reiniciada, ratio 5 y asignación aleatoria. |
| 2026-08-28 | Times New Roman 11 pt, leading 1 em, separación 1,5 em, incisos con sangría, tres guiones por pregunta y eliminación de cartilla/vista previa. |
# Nota operativa de cartilla OMR

La cartilla OMR es un documento separado del examen. El cuadernillo no incluye cartilla, variante ni clave visible. Las cartillas preimpresas se gestionan desde el módulo documentado en [modulo-cartillas-omr.md](modulo-cartillas-omr.md): muestran N°, código de materia, grupo, código y nombre del estudiante; la variante se conserva exclusivamente en el mapeo interno del sistema.
