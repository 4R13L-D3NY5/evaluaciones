# Validación oficial del banco de preguntas

Documento vivo del módulo **Gestión y Validación de Evaluaciones**. Estas reglas son obligatorias para cualquier cambio en la carga de bancos `.xlsx`; el backend es la autoridad final y el frontend debe reflejar los mismos criterios.

## 1. Alcance y flujo

1. El usuario selecciona sede, carrera, asignatura, grupo y parcial.
2. Debe existir un rol oficial que coincida con materia, grupo y parcial.
3. La carga solo está disponible para roles en `PROGRAMADO` o `VALIDADO`.
4. El archivo se analiza primero en el navegador para mostrar observaciones por fila.
5. El backend repite las validaciones antes de guardar cualquier dato.
6. Solo un banco sin errores puede registrarse; la operación se realiza dentro de una transacción.
7. Al registrar correctamente, el banco queda en `VALIDADO` y el rol se actualiza a `VALIDADO`.

## 2. Archivo y hoja

- Solo se acepta un archivo Excel Open XML `.xlsx`.
- El archivo no puede estar vacío, superar 10 MB ni tener contenido HTML, `404` o estructura inválida.
- La hoja oficial es `Banco`; se acepta la misma etiqueta sin diferencias de mayúsculas. Si no existe, no se debe interpretar silenciosamente otra hoja como banco.
- La primera fila es el encabezado y debe contener, sin duplicados, las columnas oficiales:
  `tipo`, `grupo`, `enunciado`, `opcion_a`, `opcion_b`, `opcion_c`, `opcion_d`, `opcion_e`, `respuesta_correcta` y `dificultad`.
- `parcial`, `peso` y `observaciones` son columnas opcionales de control; cuando existen se validan, no se usan para reemplazar el contexto seleccionado.
- Las fórmulas de la plantilla se pueden evaluar para obtener el valor visible. Una fórmula con error (`#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?` o `#N/A`) invalida la fila.

## 3. Filas y contenido

- Las filas completamente vacías se ignoran.
- Una fila parcialmente diligenciada se considera un error y no se descarta.
- El tipo y el enunciado son obligatorios, salvo las filas madre cuyo texto se genere oficialmente por la tipología.
- El texto no debe exceder 10.000 caracteres en el enunciado ni 2.000 caracteres por opción.
- Las expresiones delimitadas con `$...$` deben tener delimitadores balanceados.
- No se aceptan caracteres de control ni contenidos con errores de fórmula.
- No se aceptan dos filas con el mismo tipo, grupo y enunciado normalizado.

## 4. Tipología, opciones y respuesta correcta

La respuesta correcta siempre es un único inciso `A`, `B`, `C`, `D` o `E`. En V/F simple también se aceptan `VERDADERO` y `FALSO`, que se normalizan a `A` y `B`. Valores como `AB`, `A/B`, `A: ...`, `Apple` o respuestas vacías son inválidos.

| Tipología | Opciones requeridas | Respuesta | Grupo |
| --- | --- | --- | --- |
| Selección de la mejor respuesta | A-E completas y distintas | Un inciso A-E | No obligatorio |
| V/F simple | A y B; C-E vacías | A/B o Verdadero/Falso | No obligatorio |
| V/F complejas | A-D; E vacía | Un inciso A-E | No obligatorio |
| Premisas A/B/Ambas/Ninguna | A-D; E vacía | Un inciso A-D | No obligatorio |
| Subítem de caso | A-E completas y distintas | Un inciso A-E | Obligatorio |
| Caso o problema madre | Sin opciones ni respuesta directa | Vacía | Obligatorio |
| Emparejamiento madre | Entre 2 y 5 claves A-E | Vacía | Obligatorio |
| Opción de emparejamiento | Sin opciones A-E | Un inciso A-E | Obligatorio |

No se permite que dos opciones de una misma fila tengan el mismo texto normalizado. La respuesta correcta debe apuntar a una opción activa, excepto en las tipologías que no tienen respuesta directa.

### Estructura de bloques agrupados

- Cada grupo de `Emparejamiento Ampliado` debe tener exactamente un enunciado principal y entre 2 y 10 filas de `Opción de Emparejamiento Ampliado`.
- Cada grupo de `Ítems agrupados por caso clínico o problema` debe tener exactamente un enunciado principal y entre 2 y 10 filas de `Subítem de caso o problema`.
- Las filas dependientes deben aparecer inmediatamente después del enunciado principal de su mismo grupo, sin filas intermedias.
- No se permite registrar una fila dependiente si no existe su enunciado principal con el mismo código de grupo.
- El código de grupo es obligatorio y debe repetirse exactamente en el enunciado principal y en todas sus filas dependientes.
- En un emparejamiento, las opciones de referencia del enunciado principal siguen usando las columnas A-E y deben ser entre 2 y 5; el límite de 2 a 10 corresponde a las filas que se relacionan con ese enunciado.

## 5. Dificultad, parcial y peso

- La dificultad válida es `1` Fácil, `2` Medio o `3` Difícil.
- No se debe convertir una dificultad vacía o inválida en `Medio` automáticamente.
- Casos madre y emparejamientos madre no llevan dificultad; las demás tipologías sí.
- Si existe la columna `parcial`, su valor debe corresponder al parcial seleccionado (`1P`, `2P`, `EF` o `2I`, admitiendo sus nombres oficiales equivalentes).
- El peso es opcional; si existe debe ser numérico, mayor que cero y no superar 100, con máximo dos decimales. Si no existe, se usa `1.00`.

## 6. Cuotas oficiales

- El banco debe contener como mínimo 60 reactivos; puede contener más.
- Debe contener como mínimo 15 fáciles, 30 medios y 15 difíciles; cada dificultad puede exceder su mínimo.
- El frontend y el backend deben usar comparación `mayor o igual` para las cuotas y el total mínimo.
- Ninguna fila con error permite registrar el banco.

## 7. Persistencia y seguridad

Al aprobarse se guarda el banco, sus reactivos, el JSON de contenido, el nombre del archivo, el hash SHA-256, el rol relacionado, el usuario aprobador y la fecha. Si una validación falla, no se guardan banco, reactivos ni cambio de estado.

En **Lista de Evaluaciones** y en **Gestión y Validación de Evaluaciones** se muestra el indicador `Banco de preguntas cargado` cuando existe un banco persistido para el rol; si no existe, se muestra `Sin banco`. El indicador se consulta por `rolExamenId` en backend, por lo que no depende de datos ficticios ni de `localStorage`. La eliminación exige escribir `ELIMINAR`, solo está disponible en estados `PROGRAMADO` o `VALIDADO`, elimina también los reactivos asociados y devuelve el rol a `PROGRAMADO`. La operación queda registrada en la bitácora.

## 8. Checklist de pruebas

- Archivo vacío, HTML renombrado, extensión no permitida y archivo mayor a 10 MB.
- Hoja `Banco` ausente, hoja duplicada o encabezado faltante/duplicado.
- Fila vacía, fila parcial y columnas desplazadas.
- Tipo desconocido y alias oficial con tildes.
- Enunciado u opción demasiado largos.
- Opciones duplicadas o respuesta que no apunta a una opción activa.
- Grupo de emparejamiento sin un solo enunciado principal, con menos de 2 o más de 10 filas relacionadas, o con filas separadas.
- Grupo de caso o problema sin un solo enunciado principal, con menos de 2 o más de 10 subítems, o con filas separadas.
- Opción de emparejamiento o subítem sin grupo o sin enunciado principal correspondiente.
- Respuestas `AB`, `A/B`, `A: texto`, `VERDADERO`, `FALSO` y vacía.
- Dificultades `1`, `2`, `3`, vacía, decimal y texto inválido.
- Pesos positivos, cero, negativos, texto y más de dos decimales.
- Enunciados duplicados, fórmulas con error y `$` sin cerrar.
- Totales 59, 60 y 61; cuotas 14/31/15 (inválido por faltar fáciles) y 15/30/15 (válido). Un total de 61 o más es válido si también cumple todos los mínimos.
- Rol en cada estado del flujo y segundo registro del mismo archivo.
- Indicador correcto con banco existente/ausente en ambas pantallas y eliminación rechazada sin confirmación `ELIMINAR`.
- Eliminación bloqueada desde `GENERADO` en adelante y eliminación correcta de banco/reactivos en `VALIDADO`.

## 9. Estado de implementación

En la primera aplicación de este documento se endurecen archivo, encabezados, filas parciales, respuestas de un solo inciso, opciones, duplicados, fórmulas con error, dificultad, peso, cuotas mínimas y consistencia frontend-backend. Quedan como siguiente bloque la validación avanzada de estructura de grupos/casos, control de duplicados de archivo por hash y pruebas de seguridad del contenedor Excel.
