# Módulo de conciliación Remark vs. OMR

## Objetivo

Permitir que el personal de evaluaciones valide la coincidencia entre un PDF escaneado de cartillas y el archivo exportado por Remark. La operación compara únicamente códigos de estudiante y respuestas; no depende de la materia, carrera, grupo ni nota.

La funcionalidad está disponible en **Reportes → Conciliación Remark vs. OMR**.

## Flujo operativo

1. Seleccionar la evaluación del sistema que se desea validar.
2. Seleccionar el PDF escaneado de las cartillas y pulsar **Procesar OMR**.
3. El sistema envía el PDF al motor OMR en modo lectura, espera el resultado y obtiene únicamente códigos y respuestas detectadas.
4. Cuando el OMR termina correctamente, seleccionar el archivo `.xlsx`, `.xls` o `.csv` exportado desde Remark.
5. El sistema lee la primera hoja del archivo y valida que cada fila tenga un `COD_EST`.
6. Se comparan los registros usando `COD_EST` como clave principal.
7. Se comparan las respuestas `PREG1` a `PREG30`.
8. Revisar el resumen, abrir el detalle de un estudiante y exportar el resultado de conciliación si es necesario.

## Mapeo de datos

| Remark | Sistema de evaluaciones | Uso |
| --- | --- | --- |
| `COD_EST` | `codigoEstudiante` | Identidad oficial del estudiante. |
| `NOMBRE_EST` | Nombre detectado o vacío | Referencia visual, no clave de unión. |
| `PREG1`–`PREG30` | `respuestas` | Comparación de respuestas detectadas. |

También se aceptan variantes habituales de encabezados, por ejemplo `CODIGO_ESTUDIANTE`, `CODIGO_ALUMNO` y `NOMBRE_COMPLETO`. Las columnas de materia, grupo, fecha y nota pueden estar presentes, pero se ignoran.

## Normalización aplicada

- Los códigos de estudiante se leen como texto para conservar ceros iniciales y se elimina únicamente el sufijo numérico `.0` producido por Excel.
- Las respuestas se convierten a mayúsculas.
- `BLANK`, `BLANCO`, `VACIO`, `VACÍA`, guion y celda vacía se consideran respuesta en blanco.
- Una respuesta múltiple como `(A,B)` se normaliza como `AB` para evitar diferencias de formato.
- El nombre no se usa para identificar al estudiante porque las exportaciones de Remark pueden contener caracteres dañados por OCR o codificación.
- No se permiten códigos de estudiante duplicados en el archivo de entrada.

## Estados del resultado

| Estado | Significado |
| --- | --- |
| `Coincide` | Mismo estudiante y mismas respuestas. |
| `Diferencia en respuestas` | Existe al menos una diferencia entre `PREG1`–`PREG30`. |
| `Solo Remark` | El código existe en el archivo Remark, pero no en la lectura OMR del rol. |
| `Solo sistema` | El código existe en la lectura OMR, pero no en el archivo Remark. |

El detalle permite revisar las 30 preguntas y distingue visualmente los valores coincidentes y diferentes. Los estudiantes presentes únicamente en uno de los dos orígenes se conservan en el resultado para facilitar la investigación.

## Persistencia y seguridad

- El archivo Remark se procesa en el navegador y no se sube ni se almacena en el servidor.
- El PDF escaneado se envía al modo de lectura mediante `POST /api/omr/{rolExamenId}/procesar-lectura`; no exige mapeo estudiante–variante ni clave de respuestas y no crea calificaciones oficiales.
- El sistema espera el trabajo OMR con `GET /api/omr/jobs/{jobId}`. El resultado temporal del trabajo contiene las páginas, códigos y respuestas detectadas.
- La exportación se genera localmente en el navegador.
- No existe acción de sobrescritura automática ni sincronización destructiva.

## Verificación

1. Abrir el módulo de reportes y seleccionar **Conciliación Remark vs. OMR**.
2. Seleccionar un rol de examen.
3. Cargar el PDF escaneado y pulsar **Procesar OMR**.
4. Esperar el estado **OMR: procesado**.
5. Cargar un archivo Remark con encabezados `COD_EST` y `PREG1`–`PREG30`.
6. Confirmar que el sistema identifica correctamente los estudiantes por código.
7. Revisar un caso coincidente, un caso con respuestas distintas y un caso ausente en uno de los archivos.
8. Abrir el detalle y comprobar la comparación pregunta por pregunta.
9. Exportar el Excel de conciliación y verificar que incluya estados y valores Remark/Sistema de las 30 preguntas.
