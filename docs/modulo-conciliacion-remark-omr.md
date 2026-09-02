# Módulo de conciliación Remark vs. OMR

## Objetivo

Permitir que el personal de evaluaciones valide la coincidencia entre el archivo exportado por Remark y las lecturas OMR almacenadas por el sistema de evaluaciones. La operación es de solo lectura: no modifica respuestas, calificaciones ni estados oficiales.

La funcionalidad está disponible en **Reportes → Conciliación Remark vs. OMR**.

## Flujo operativo

1. Seleccionar la evaluación del sistema que se desea validar.
2. Seleccionar el archivo `.xlsx`, `.xls` o `.csv` exportado desde Remark.
3. El sistema lee la primera hoja del archivo y valida que cada fila tenga un `COD_EST`.
4. Se comparan los registros usando `COD_EST` como clave principal.
5. Se comparan las respuestas `PREG1` a `PREG30` y, cuando ambos valores existen, la nota sobre 60.
6. Revisar el resumen, abrir el detalle de un estudiante y exportar el resultado de conciliación si es necesario.

## Mapeo de datos

| Remark | Sistema de evaluaciones | Uso |
| --- | --- | --- |
| `COD_EST` | `codigoEstudiante` | Identidad oficial del estudiante. |
| `NOMBRE_EST` | `estudianteNombreCompleto` | Referencia visual, no clave de unión. |
| `PREG1`–`PREG30` | `respuestasDetectadasJson` | Comparación de respuestas detectadas. |
| `NOTA/60` | `notaSobre100 × 0.6` | Comparación de calificación en la misma escala. |
| `SIGLA_MAT`, `GRUPO`, `FECHA` | Datos del rol de examen | Validación de contexto y advertencias. |

También se aceptan variantes habituales de encabezados, por ejemplo `CODIGO_ESTUDIANTE`, `CODIGO_ALUMNO`, `NOMBRE_COMPLETO`, `CODIGO_MATERIA` y `FECHA_EVALUACION`.

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
| `Coincide` | Mismo estudiante, mismas respuestas y misma nota disponible. |
| `Diferencia en respuestas` | Existe al menos una diferencia entre `PREG1`–`PREG30`. |
| `Diferencia de nota` | Las respuestas coinciden, pero la nota sobre 60 difiere más de 0,01. |
| `Solo Remark` | El código existe en el archivo Remark, pero no en la lectura OMR del rol. |
| `Solo sistema` | El código existe en la lectura OMR, pero no en el archivo Remark. |

El detalle permite revisar las 30 preguntas y distingue visualmente los valores coincidentes y diferentes. Los estudiantes presentes únicamente en uno de los dos orígenes se conservan en el resultado para facilitar la investigación.

## Validación de contexto

La materia se compara contra la materia del rol seleccionado y se marca como inconsistencia si no coincide. Grupo y fecha se muestran como advertencias porque Remark puede representar el grupo como `1` mientras el sistema usa `TA-01`, y puede exportar la fecha como `15/4/2026` o `2026-04-15`.

Una advertencia de grupo o fecha no elimina filas, pero una materia distinta debe investigarse antes de tomar decisiones sobre los resultados.

## Persistencia y seguridad

- El archivo Remark se procesa en el navegador y no se sube ni se almacena en el servidor.
- El sistema consulta las calificaciones OMR mediante el endpoint existente `GET /api/omr/{rolExamenId}/calificaciones`.
- La exportación se genera localmente en el navegador.
- No existe acción de sobrescritura automática ni sincronización destructiva.

## Verificación

1. Abrir el módulo de reportes y seleccionar **Conciliación Remark vs. OMR**.
2. Seleccionar un rol con calificaciones OMR procesadas.
3. Cargar un archivo Remark con encabezados `COD_EST`, `NOTA/60` y `PREG1`–`PREG30`.
4. Confirmar que el sistema identifica correctamente los estudiantes por código.
5. Revisar un caso coincidente, un caso con respuestas distintas y un caso ausente en uno de los archivos.
6. Abrir el detalle y comprobar la comparación pregunta por pregunta.
7. Exportar el Excel de conciliación y verificar que incluya estados, notas y valores Remark/Sistema de las 30 preguntas.
