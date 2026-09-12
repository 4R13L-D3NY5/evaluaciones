# Kanban de tareas del proyecto

Tablero documental para dar seguimiento a las tareas pendientes de `evaluaciones`. Este archivo es la fuente de verdad del seguimiento operativo y puede actualizarse desde cualquier conversación que esté trabajando sobre este proyecto y esta rama.

Vista visual: [Abrir tablero de tarjetas](../tasks.html). La página es solo de consulta y permite copiar el contenido de cada tarjeta.

## Cómo usarlo desde el chat

- `=task`: mostrar el tablero actual, el resumen por estado y las tareas bloqueadas o vencidas.
- `=new <descripción>`: crear una tarjeta nueva en **Pendiente** con el siguiente identificador disponible.
- `=move <ID> <estado>`: mover una tarjeta a `Pendiente`, `En progreso`, `En revisión`, `Bloqueada` o `Completada`.
- `=edit <ID> <cambio>`: modificar título, prioridad, responsable, fecha límite, dependencia o notas.
- `=done <ID>`: marcar una tarea como **Completada** y registrar la fecha de cierre.

Si el usuario escribe una tarea sin usar un comando, se puede registrar como nueva cuando la intención sea clara. No se deben inventar fechas, responsables ni dependencias; se dejan como `Por definir`.

## Estados

| Estado | Uso |
|---|---|
| Pendiente | Tarea identificada, todavía no iniciada. |
| En progreso | Trabajo activo. |
| En revisión | Implementación terminada, pendiente de validación o aprobación. |
| Bloqueada | No puede avanzar hasta resolver una dependencia o recibir información. |
| Completada | Verificada y cerrada. |

## Tablero

### Pendiente

#### T-001 — Desplegar y validar en servidor la actualización de roles por Excel

- Prioridad: Alta
- Área: Rol de Exámenes / Importación Excel
- Responsable: Por definir
- Creada: 2026-09-12
- Fecha límite: Por definir
- Dependencias: Publicar la versión actual de `main` en el servidor.
- Criterio de cierre: Confirmar que una programación existente en `PROGRAMADO` o `VALIDADO` se actualiza con la fecha y horario del Excel, y que los estados posteriores permanecen protegidos.
- Notas: La corrección ya fue implementada y verificada localmente.

#### T-002 — Revisar carga de exámenes sin cartilla por parte del docente

- Prioridad: Alta
- Área: Exámenes sin cartilla / Docentes
- Responsable: Por definir
- Creada: 2026-09-12
- Fecha límite: Por definir
- Dependencias: Por definir
- Criterio de cierre: Confirmar el flujo que debe utilizar el docente, reproducir la operación y documentar o corregir cualquier bloqueo encontrado.
- Notas: Tarea creada desde el comando `=new`.

#### T-003 — Revisar error al cargar el PDF de escaneados para calificar un examen en el servidor

- Prioridad: Alta
- Área: Calificación OMR / Servidor
- Responsable: Por definir
- Creada: 2026-09-12
- Fecha límite: Por definir
- Dependencias: Acceso a los registros del servidor y al archivo PDF que provoca el error.
- Criterio de cierre: Identificar la causa del error, corregir la configuración o el código correspondiente y validar que el PDF de escaneados pueda procesarse correctamente.
- Notas: Revisar especialmente el error HTTP 413 (`Request Entity Too Large`) y la respuesta HTML que aparece como `Unexpected token '<'`.

#### T-004 — Integrar la anulación de preguntas de OMR en la calificación

- Prioridad: Alta
- Área: Calificación OMR / Anulación de preguntas
- Responsable: Por definir
- Creada: 2026-09-12
- Fecha límite: Por definir
- Dependencias: Revisar la funcionalidad de anulación existente en el módulo OMR.
- Criterio de cierre: Permitir que los roles Responsable de Evaluaciones y Administrador del Sistema anulen preguntas desde el flujo de calificación, conservando la trazabilidad y recalculando correctamente los resultados.
- Notas: La funcionalidad base ya existe en OMR y debe integrarse al proceso de calificación.

### En progreso

_Sin tareas._

### En revisión

_Sin tareas._

### Bloqueada

_Sin tareas._

### Completada

_Sin tareas._

## Resumen

| Indicador | Total |
|---|---:|
| Pendientes | 4 |
| En progreso | 0 |
| En revisión | 0 |
| Bloqueadas | 0 |
| Completadas | 0 |

## Decisiones del módulo

- Persistencia: archivo Markdown versionado con Git.
- Base de datos: no requerida.
- Backend y frontend: no requeridos para este seguimiento interno.
- Permisos: no aplican; el acceso depende de la rama y del repositorio.
- Auditoría: el historial de cambios queda en Git; los cierres deben conservar una nota breve en la tarjeta.
