# Kanban de tareas del proyecto

Tablero documental para dar seguimiento a las tareas pendientes de `evaluaciones`. Este archivo es la fuente de verdad del seguimiento operativo y puede actualizarse desde cualquier conversación que esté trabajando sobre este proyecto y esta rama.

Vista visual: [Abrir tablero de tarjetas](../tasks.html). La página permite mover tarjetas visualmente, conservar su posición en este navegador y copiar el comando `=move` para sincronizar el cambio en este archivo.

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

#### T-005 — Continuar y concluir el módulo de respaldos y contingencia

- Prioridad: Crítica
- Área: Respaldos / Continuidad operativa
- Responsable: Por definir
- Creada: 2026-09-12
- Fecha límite: Por definir
- Dependencias: Secreto de Restic, montajes local y externo, worker `worker-backup`, entorno aislado y respaldo compatible de Vault.
- Plan: Diagnosticar el estado actual; generar snapshot local; copiarlo al repositorio externo; verificar integridad; probar corrupción controlada; validar retención; restaurar en una instancia aislada; comprobar PostgreSQL, `storage`, Flyway, bancos cifrados y Vault; revisar permisos, auditoría, mensajes y protección contra sobrescritura; actualizar la guía para el administrador del servidor.
- Criterio de cierre: Respaldo, copia, verificación y restauración aislada comprobados sin afectar producción, con auditoría completa y procedimiento operativo documentado.
- Notas: La funcionalidad base ya está implementada. La restauración no debe probarse directamente sobre producción. Ver [plan de continuación y cierre](plan-cierre-respaldos.md).

#### T-007 — Optimizar y concluir el examen tipo virtual

- Prioridad: Alta
- Área: Examen Virtual
- Responsable: Por definir
- Creada: 2026-09-12
- Fecha límite: Por definir
- Dependencias: Revisar el flujo actual de generación, publicación, acceso del estudiante, respuestas, calificación y cierre.
- Criterio de cierre: Completar la optimización funcional y visual del examen virtual, validar el flujo integral y dejar documentados los pendientes o ajustes finales.
- Notas: Tarea creada desde el comando `=new`.

#### T-009 — Continuar y concluir la implementación del módulo Auditoría y Bitácora

- Prioridad: Media
- Área: Auditoría y Bitácora
- Responsable: Por definir
- Creada: 2026-09-12
- Fecha límite: Por definir
- Dependencias: Revisar el estado actual del registro, consulta, filtros, detalle de eventos y permisos del módulo.
- Criterio de cierre: Completar la implementación funcional y visual del módulo, validar que las acciones relevantes queden registradas y que la consulta respete los permisos establecidos.
- Notas: Tarea creada desde el comando `=new`.

#### T-010 — Optimizar el módulo de Reportes y priorizar los reportes de mayor aporte

- Prioridad: Media
- Área: Reportes / Indicadores y toma de decisiones
- Responsable: Por definir
- Creada: 2026-09-12
- Fecha límite: Por definir
- Dependencias: Revisar los reportes actuales, usuarios destinatarios, fuentes de datos y necesidades operativas por módulo.
- Criterio de cierre: Identificar y priorizar los reportes de mayor valor, definir sus indicadores, filtros, niveles de detalle, exportaciones y permisos, y optimizar o implementar el conjunto priorizado.
- Notas: Tarea creada desde el comando `=new`; considerar utilidad para dirección, responsables académicos, docentes y seguimiento operativo.

#### T-011 — Generar endpoints de consulta para estudiantes según su matrícula

- Prioridad: Alta
- Área: Integración institucional / Portal del estudiante
- Responsable: Por definir
- Creada: 2026-09-12
- Fecha límite: Por definir
- Dependencias: Definir el mecanismo de autenticación del estudiante, validar la matrícula contra SEA/SISA y revisar las entidades de rol, examen, marcajes, variantes y notas.
- Criterio de cierre: Diseñar y generar endpoints seguros para que cada estudiante consulte por su matrícula el rol de exámenes que le corresponde, el examen asignado, sus marcajes y el patrón de la variante; además, analizar y documentar qué información adicional puede compartirse, incluyendo si corresponde publicar notas.
- Notas: No exponer bancos de preguntas, claves de respuestas ni información de otros estudiantes. La publicación de notas debe considerar estados de liberación, permisos y trazabilidad.

### En progreso

_Sin tareas._

### En revisión

#### T-012 — Confirmar la contraseña actual antes de habilitar el cambio

- Prioridad: Alta
- Área: Seguridad y autenticación / Cambio de contraseña
- Responsable: Por definir
- Creada: 2026-09-12
- Fecha límite: Por definir
- Dependencias: Validar el primer ingreso con contraseña correcta e incorrecta.
- Criterio de cierre: Verificar primero la contraseña actual en el servidor, habilitar la nueva contraseña únicamente cuando sea correcta y conservar la validación final al guardar.
- Notas: Implementado localmente; frontend compilado y backend construido en Docker. Pendiente de validación funcional con una cuenta real.

#### T-004 — Integrar la anulación de preguntas de OMR en la calificación

- Prioridad: Alta
- Área: Calificación OMR / Anulación de preguntas
- Responsable: Por definir
- Creada: 2026-09-12
- Fecha límite: Por definir
- Dependencias: Validación funcional con un rol en estado `DEVUELTO` o `PENDIENTE_NOTAS`.
- Criterio de cierre: Permitir que los roles Responsable de Evaluaciones y Administrador del Sistema anulen preguntas desde el flujo de calificación, conservando la trazabilidad y recalculando correctamente los resultados.
- Notas: Integrado en la pantalla dedicada de Calificación OMR. La persistencia, autorización, auditoría y recálculo del backend existente se reutilizan. Ver [documentación del módulo](modulo-anulacion-preguntas-omr.md).

#### T-006 — Mostrar si el docente ya cargó el banco del grupo aunque no exista fecha de rol

- Prioridad: Alta
- Área: Banco de Preguntas / Plan de Estudios
- Responsable: Por definir
- Creada: 2026-09-12
- Fecha límite: Por definir
- Dependencias: Validación funcional con un banco pendiente de rol y un grupo sin fecha programada.
- Criterio de cierre: Permitir consultar el estado de carga del banco de preguntas por grupo y docente, aunque el director todavía no haya registrado una fecha en el rol de examen.
- Notas: Implementado; falta validar visualmente con datos reales. La ausencia de fecha se muestra como advertencia y no oculta el banco cargado.

### Bloqueada

_Sin tareas._

### Completada

#### T-008 — Traer a main la funcionalidad previamente subida de verificador_1

- Prioridad: Alta
- Área: Integración de ramas / Publicación
- Responsable: Por definir
- Creada: 2026-09-12
- Fecha límite: 2026-09-12
- Dependencias: Rama `verficicador_v1` disponible en el repositorio remoto y cambios previamente guardados.
- Criterio de cierre: Integrar en `main` la funcionalidad de `verificador_1`, resolver conflictos si aparecen, compilar y verificar que no se pierdan los cambios actuales de `main`.
- Notas: Integrada sin conflictos desde `verficicador_v1`; la compilación del backend en Docker, la compilación del frontend y las pruebas del worker finalizaron correctamente. Merge registrado en `main`.

## Resumen

| Indicador | Total |
|---|---:|
| Pendientes | 8 |
| En progreso | 0 |
| En revisión | 3 |
| Bloqueadas | 0 |
| Completadas | 1 |

## Decisiones del módulo

- Persistencia: archivo Markdown versionado con Git.
- Base de datos: no requerida.
- Backend y frontend: no requeridos para este seguimiento interno.
- Permisos: no aplican; el acceso depende de la rama y del repositorio.
- Auditoría: el historial de cambios queda en Git; los cierres deben conservar una nota breve en la tarjeta.
