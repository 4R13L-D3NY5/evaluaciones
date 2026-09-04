# Flujo de examen sin cartilla

## Objetivo

Permitir que un examen presencial sin cartilla se gestione desde la carga del documento por el docente hasta el registro y reporte de notas.

## Flujo operativo

1. Evaluaciones registra o importa el rol con modalidad **Presencial sin cartilla**. El rol queda en `PROGRAMADO`.
2. El docente entra a **Banco de preguntas**, selecciona el rol y carga el examen en formato `.doc` o `.docx`.
3. El sistema almacena el documento, calcula su huella de integridad y cambia automáticamente el rol a `VALIDADO`.
4. El personal de Evaluaciones administra la secuencia desde **Lista de evaluaciones**:
   `VALIDADO` → `IMPRESO` → `ENTREGADO` → `DEVUELTO` → `PENDIENTE_NOTAS`.
5. Al marcar `PENDIENTE_NOTAS`, el docente puede abrir el registro de notas y visualizar la nómina oficial del grupo obtenida del SEA.
6. El docente registra una nota sobre 30 para cada estudiante y guarda. El sistema calcula también la nota sobre 100, cambia el rol a `CALIFICADO` y conserva la auditoría.
7. El personal autorizado puede imprimir el reporte de notas desde el mismo apartado.

## Reglas principales

- La nómina y los nombres de estudiantes se consultan desde el SEA; no se usan nombres locales para construir el listado de calificación.
- No se generan variantes ni PDF para esta modalidad.
- El documento debe ser `.doc` o `.docx` y no superar 5 MB.
- El docente debe preparar el documento en tamaño oficio de **8,5 × 13 pulgadas**. Este requisito se muestra en la carga y debe verificarse antes de enviarlo, porque el sistema no garantiza de forma automática el tamaño de página para ambos formatos de Word.
- Para calificar se exige una nota entre 0 y 30 para cada estudiante oficial del grupo.
- No se aceptan estudiantes que no pertenezcan a la nómina oficial devuelta por el SEA.
- Mientras el rol está `PENDIENTE_NOTAS`, el docente puede editar y guardar las notas. En `CALIFICADO` el reporte queda disponible en modo consulta.

## Servicios implementados

| Operación | Método | Ruta |
| --- | --- | --- |
| Consultar documento | GET | `/api/examenes-sin-cartilla/{rolExamenId}/documento` |
| Cargar y validar documento | POST | `/api/examenes-sin-cartilla/{rolExamenId}/documento` |
| Descargar documento | GET | `/api/examenes-sin-cartilla/{rolExamenId}/documento/archivo` |
| Consultar nómina y notas | GET | `/api/examenes-sin-cartilla/{rolExamenId}/notas` |
| Guardar notas y calificar | POST | `/api/examenes-sin-cartilla/{rolExamenId}/notas` |

## Resultado esperado

Para cada estudiante se conserva el código oficial, la nota sobre 30 y la nota calculada sobre 100. El reporte impreso incluye materia, grupo, parcial, docente, estado, código de estudiante y ambas notas.
