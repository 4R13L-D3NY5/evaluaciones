# Kanban de tareas del proyecto

Tablero documental para dar seguimiento a las tareas pendientes de `evaluaciones`. Este archivo es la fuente de verdad del seguimiento operativo y puede actualizarse desde cualquier conversación que esté trabajando sobre este proyecto y esta rama.

Vista visual: [Abrir tablero de tarjetas](../tasks.html). La página permite mover tarjetas visualmente, conservar su posición en este navegador y copiar el comando `=move` para sincronizar el cambio en este archivo.

## Cómo usarlo desde el chat

- `=task`: mostrar el tablero actual, el resumen por estado y las tareas bloqueadas o vencidas.
- `=new <descripción>`: crear una tarjeta nueva en **Pendiente** con el siguiente identificador disponible.
- `=move <ID> <estado>`: mover una tarjeta a `Pendiente`, `En progreso`, `En revisión`, `Bloqueada` o `Completada`.
- `=edit <ID> <cambio>`: modificar título, prioridad, responsable, fecha límite, dependencia o notas.
- `=done <ID>`: marcar una tarea como **Completada** y registrar la fecha de cierre.
- **Sincronización automática entre chats**: Cualquier agente que opere en este proyecto actualiza el estado de la tarea automáticamente (`En progreso` al iniciar el trabajo, `En revisión` al finalizar la implementación técnica y `Completada` al ser validada por el usuario). Puede utilizarse el utilitario `powershell -ExecutionPolicy Bypass -File scripts/kanban.ps1 move <ID> <estado>`.

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

#### T-015 — Corregir la asignación de carreras o sedes al crear usuario verificador

- Prioridad: Alta
- Área: Usuarios y accesos / Verificadores
- Responsable: Por definir
- Creada: 2026-09-13
- Fecha límite: Por definir
- Dependencias: Revisar el formulario de usuarios, la persistencia de alcances y la validación de acceso del rol `VERIFICADOR`.
- Criterio de cierre: Crear o editar un usuario verificador y guardar correctamente las sedes completas y las carreras específicas seleccionadas, asegurando que el verificador solo consulte los exámenes de su alcance.
- Notas: Tarea creada desde el comando `=new`.

### En progreso

*(Sin tareas activas)*

### En revisión

#### T-002 — Flujo completo de notas docente sin cartilla, planilla PDF y estado Confirmado

- Prioridad: Alta
- Área: Exámenes sin cartilla / Docentes / Evaluaciones
- Responsable: Por definir
- Creada: 2026-09-12
- Fecha límite: Por definir
- Dependencias: Migración Flyway V40 (estado `CONFIRMADO`), PDFBox, endpoints de carga de notas y frontend `banco-preguntas` y `evaluaciones-dia`.
- Criterio de cierre: 1) Permitir al docente registrar notas sobre 60 puntos desde `/banco-preguntas` cuando el examen está en `PENDIENTE_NOTAS`; 2) Transicionar automáticamente a `CALIFICADO` al guardar notas; 3) Generar la Planilla Oficial de Calificaciones en PDF con membrete institucional, notas sobre 60 y 100, y espacios de firma/sello de Docente y Recepción de Evaluaciones; 4) Incorporar el estado `CONFIRMADO` para que Evaluaciones confirme la entrega física firmada desde `/evaluaciones-dia`; 5) Actualizar selectores y etiquetas en roles y reportes sin afectar datos productivos existentes.
- Notas: Implementación completada con migración V40, `ReporteNotasSinCartillaPdfService`, tests unitarios en backend y vistas actualizadas en frontend. Se corrigió la alerta nativa del navegador al eliminar examen sin cartilla sustituyéndola por un modal institucional de confirmación.

#### T-018 — Políticas de reprogramación de exámenes, candado 72h y reprogramación masiva por rango

- Prioridad: Alta
- Área: Rol de Exámenes / Reprogramación y Seguridad
- Responsable: Por definir
- Creada: 2026-09-18
- Fecha límite: Por definir
- Dependencias: Parámetro dinámico `horasCandado72`, endpoints de reprogramación y bitácora en backend y modal en frontend.
- Criterio de cierre: 1) Carga Excel, registro manual y vaciado de rol exclusivos para `ADMINISTRADOR_SISTEMA`; 2) Directores solo reprograman a fechas futuras (> hoy) y con candado de 72h dinámico; 3) Administrador puede reprogramar exámenes en estados avanzados (`GENERADO`, `IMPRESO`, etc.) registrando auditoría oficial; 4) Modal de reprogramación masiva por rango de fechas (por suspensión de actividades) con selector de carrera (o todas las de la sede), cálculo correlativo día por día y auditoría individual.
- Notas: Implementado completamente en frontend y backend. Pruebas unitarias aprobadas, imágenes Docker compiladas y desplegadas.

#### T-017 — Notificaciones para Director de Carrera: Grupos observados y exámenes sin banco validado (< 72h)

- Prioridad: Alta
- Área: Notificaciones / Dirección de Carrera
- Responsable: Por definir
- Creada: 2026-09-18
- Fecha límite: Por definir
- Dependencias: Integración en `NotificacionesService`, `TopbarComponent` y navegación reactiva hacia `RolExamenesComponent`.
- Criterio de cierre: 1) Mostrar en la campana del topbar alertas rojas para grupos con `DEVUELTO` con datos del docente titular; 2) Mostrar alertas rojas para exámenes a menos de 72 horas sin banco de preguntas validado, calculando tiempo restante y docente titular; 3) Sincronizar búsqueda instantánea al navegar a Rol de Exámenes.
- Notas: Implementado en `notificaciones.service.ts`, `topbar.component.ts` y `rol-examenes.component.ts`. Compilación y despliegue en ejecución.

#### T-016 — Corregir presentación de tipologías complejas, numeración de enunciados y filtro de estados en Verificación

- Prioridad: Alta
- Área: Verificación de Exámenes / Tipologías de Preguntas
- Responsable: Por definir
- Creada: 2026-09-18
- Fecha límite: Por definir
- Dependencias: Revisar componentes de renderizado de tipologías en `verificar-examenes.component.ts`, directivas matemáticas/enunciados, endpoints de listado del módulo de verificación y modelos de preguntas compuestas.
- Criterio de cierre: 1) Corregir el formato y visualización de preguntas de Verdadero/Falso complejas y de A/B/Ambas/Ninguna en la vista del verificador; 2) Asegurar que en este módulo únicamente se listen evaluaciones en estado VALIDADO y VERIFICADO; 3) Evitar asignar número de pregunta individual a los enunciados de emparejamiento ampliado e ítems agrupados, tratándolos como contextos de grupo sin numeración correlativa de reactivo.
- Notas: Implementado completamente en backend (`VerificacionExamenService`, `VerificacionPreguntaDto`, pruebas unitarias aprobadas) y frontend (`verificar-examenes.component.ts`, `examenes-aprobados.component.ts`, `verificacion-examen.service.ts`). Contenedores Docker de backend y frontend reconstruidos y operativos. Pendiente de validación visual por el usuario.

#### T-012 — Confirmar la contraseña actual antes de habilitar el cambio

- Prioridad: Alta
- Área: Seguridad y autenticación / Cambio de contraseña
- Responsable: Por definir
- Creada: 2026-09-12
- Fecha límite: Por definir
- Dependencias: Validar el primer ingreso con contraseña correcta e incorrecta.
- Criterio de cierre: Verificar primero la contraseña actual en el servidor, habilitar la nueva contraseña únicamente cuando sea correcta y conservar la validación final al guardar.
- Notas: Implementado localmente; frontend compilado y backend construido en Docker. Pendiente de validación funcional con una cuenta real.

#### T-014 — Aplicar los parámetros cronológicos al personal de evaluaciones

- Prioridad: Alta
- Área: Administración de Evaluaciones / Lista de Evaluaciones
- Responsable: Por definir
- Creada: 2026-09-12
- Fecha límite: Por definir
- Dependencias: Validación funcional con una cuenta `PERSONAL_EVALUACIONES` y roles en distintas ventanas horarias.
- Criterio de cierre: Respetar en lista, generación, entrega y consulta del patrón los parámetros configurados, usando la hora del servidor y manteniendo los permisos actuales de Administrador y Responsable.
- Notas: Implementado localmente; frontend compilado y backend construido en Docker. Pruebas automatizadas específicas aprobadas; pendiente validación funcional con una cuenta real y despliegue al servidor.

#### T-004 — Integrar la anulación de preguntas de OMR en la calificación

- Prioridad: Alta
- Área: Calificación OMR / Anulación de preguntas
- Responsable: Por definir
- Creada: 2026-09-12
- Fecha límite: Por definir
- Dependencias: Validación funcional con un rol en estado `DEVUELTO` o `PENDIENTE_NOTAS`.
- Criterio de cierre: Permitir que los roles Responsable de Evaluaciones y Administrador del Sistema anulen preguntas desde el flujo de calificación, conservando la trazabilidad y recalculando correctamente los resultados.
- Notas: Integrado en la pantalla dedicada de Calificación OMR. La persistencia, autorización, auditoría y recálculo del backend existente se reutilizan. Ver [documentación del módulo](modulo-anulacion-preguntas-omr.md).

#### T-006 — Regla histórica de banco sin fecha de rol (revertida)

- Prioridad: Alta
- Área: Banco de Preguntas / Plan de Estudios
- Responsable: Por definir
- Creada: 2026-09-12
- Fecha límite: Por definir
- Dependencias: Regla histórica reemplazada; la validación actual exige un rol oficial con fecha programada.
- Criterio de cierre: Mantener la carga bloqueada hasta que exista un rol oficial con fecha programada y consultar el banco únicamente por `rolExamenId`.
- Notas: Esta regla fue revertida por generar falsos positivos entre docentes del mismo grupo. La carga requiere ahora un rol oficial y el banco se consulta únicamente por `rolExamenId`; los registros históricos sin rol no se eliminan automáticamente.

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

#### T-013 — Actualizar el catálogo de usuarios con los nuevos roles integrados

- Prioridad: Alta
- Área: Usuarios y accesos / Roles y permisos
- Responsable: Por definir
- Creada: 2026-09-13
- Fecha límite: 2026-09-13
- Dependencias: Confirmar los nombres definitivos, permisos y alcance académico de los roles integrados en `main`.
- Criterio de cierre: Mostrar en el apartado de Usuarios y accesos todos los roles integrados, especialmente `VERIFICADOR`, con su descripción, alcance y permisos coherentes con el backend.
#### T-007 — Optimizar y concluir el examen tipo virtual

- Prioridad: Alta
- Área: Examen Virtual
- Responsable: Antigravity
- Creada: 2026-09-12
- Fecha límite: 2026-09-18
- Dependencias: Revisar el flujo actual de generación, publicación, acceso del estudiante, respuestas, calificación y cierre.
- Criterio de cierre: Completar la optimización funcional y visual del examen virtual, validar el flujo integral y dejar documentados los pendientes o ajustes finales.
- Notas: Completada con éxito. Implementación de PIN numérico corto de 6 dígitos retrocompatible (SHA-256), auto-recuperación de respuestas al recargar (F5), fórmulas KaTeX, diseño institucional moderno con minimapa y timer adaptativo, cierre/calificación directa de sala y exportación a Excel (.xlsx).

#### T-019 — Mejoras en Calificación OMR: Visualización de marcajes, examen anulado, edición de clave, anulación con propagación y recalificación

- Prioridad: Alta
- Área: Calificación OMR / Lista de Evaluaciones / Clave de Respuestas
- Responsable: Antigravity
- Creada: 2026-09-18
- Fecha límite: 2026-09-19
- Dependencias: Módulo OMR existente, tablas `sea_calificaciones_omr` y `sea_auditoria_evaluaciones`.
- Criterio de cierre: 1) Visualización clara de marcajes sin selects truncados con insignias legibles (`Est: [ A ]`, `Pat: [ A ]`, badges de estado semántico); 2) Previsualización directa y visible de escaneados en inspección y apertura de notas; 3) Anulación de examen individual con nota 0/60 forzada y soporte de restauración; 4) Corrección de clave de respuestas oficial del docente con propagación opcional y recálculo automático; 5) Anulación de preguntas con detección y propagación transversal automática a todas las variantes vinculadas (`A`, `B`, `C`, `D`); 6) Botón "Volver a calificar" (Recalificación OMR) para Responsable y Administrador con motivo obligatorio y auditoría integral (`RECALIFICACION_OMR`).
- Notas: Completada con éxito. Implementación completa en backend Spring Boot (tests unitarios `OmrProcesamientoServiceTest` aprobados) y frontend Angular 18 (compilación de producción verificada). Cero migraciones de base de datos requeridas.

## Resumen

| Indicador | Total |
|---|---:|
| Pendientes | 7 |
| En progreso | 0 |
| En revisión | 8 |
| Bloqueadas | 0 |
| Completadas | 4 |

## Decisiones del módulo

- Persistencia: archivo Markdown versionado con Git.
- Base de datos: no requerida.
- Backend y frontend: no requeridos para este seguimiento interno.
- Permisos: no aplican; el acceso depende de la rama y del repositorio.
- Auditoría: el historial de cambios queda en Git; los cierres deben conservar una nota breve en la tarjeta.
