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

#### T-009 — Continuar y concluir la implementación del módulo Auditoría y Bitácora

- Prioridad: Media
- Área: Auditoría y Bitácora
- Responsable: Por definir
- Creada: 2026-09-12
- Fecha límite: Por definir
- Dependencias: Revisar el estado actual del registro, consulta, filtros, detalle de eventos y permisos del módulo.
- Criterio de cierre: Completar la implementación funcional y visual del módulo, validar que las acciones relevantes queden registradas y que la consulta respete los permisos establecidos.
- Notas: Tarea creada desde el comando `=new`. Ajuste en formatearFechaHoraAuditoria para parsear UTC y proyectar en America/La_Paz

#### T-028 — Seguimiento de verificación para exámenes sin cartilla (alerta de documento no cargado y visualización)

- Prioridad: Alta
- Área: Verificación de Exámenes / Exámenes sin Cartilla
- Responsable: Antigravity
- Creada: 2026-09-20
- Fecha límite: 2026-09-20
- Dependencias: Módulo de verificación (`VerificacionExamenService.java`, `verificar-examenes.component.ts`), servicio y controlador de exámenes sin cartilla (`ExamenSinCartillaController.java`).
- Criterio de cierre: 1) Incorporar los exámenes presenciales sin cartilla (`PRESENCIAL_SIN_CARTILLA`) en la pestaña de seguimiento ("Sin banco / documento") cuando estén en `PROGRAMADO` y no tengan documento cargado; 2) Mostrar indicador visual de modalidad "Sin Cartilla" y estado "Sin documento cargado"; 3) Agregar filtro de modalidad "Sin Cartilla" en el módulo de verificación; 4) Habilitar permisos al rol `VERIFICADOR` en `ExamenSinCartillaController` para consultar y descargar el documento `.doc`/`.docx`; 5) Actualizar el modal de detalles con información contextual para exámenes sin cartilla.
- Notas: En progreso. Requerimiento solicitado por el usuario para integrar el seguimiento y control de exámenes sin cartilla en el módulo de verificadores. Seguimiento de exámenes sin cartilla integrado en módulo de verificadores: alerta de documento no cargado, filtro de modalidad Sin Cartilla, permisos de consulta y descarga para verificadores, y modal explicativo.

#### T-027 — Pestaña para Verificadores: Grupos con examen programado sin banco de preguntas cargado

- Prioridad: Alta
- Área: Verificación de Exámenes / Monitoreo
- Responsable: Por definir
- Creada: 2026-09-20
- Fecha límite: Por definir
- Dependencias: Módulo de verificación de exámenes en frontend (`verificar-examenes.component.ts`) y backend (`VerificacionExamenController`, `VerificacionExamenService`).
- Criterio de cierre: 1) Agregar una nueva pestaña "Sin banco de preguntas" en el módulo de Verificación de Exámenes; 2) Listar los grupos con examen programado para el día / rango filtrado que aún no han cargado ni validado su banco de preguntas; 3) Mostrar información detallada del grupo, asignatura, docente titular, fecha, horario, sede y carrera dentro del alcance del verificador; 4) Reflejar contador en el tab y filtros interactivos sincronizados.
- Notas: Tarea iniciada por comando `=new` para dar visibilidad preventiva a los verificadores sobre grupos que tienen examen programado sin banco cargado. Pestaña 'Sin banco de preguntas' agregada en módulo de verificadores con indicador visual ¡Hoy!, filtros rápidos por fecha, endpoint /api/verificacion-examenes/sin-banco y modal de detalles operativos.

#### T-005 — Continuar y concluir el módulo de respaldos y contingencia

- Prioridad: Crítica
- Área: Respaldos / Continuidad operativa
- Responsable: Por definir
- Creada: 2026-09-12
- Fecha límite: Por definir
- Dependencias: Secreto de Restic, montajes local y externo, worker `worker-backup`, entorno aislado y respaldo compatible de Vault.
- Plan: Diagnosticar el estado actual; generar snapshot local; copiarlo al repositorio externo; verificar integridad; probar corrupción controlada; validar retención; restaurar en una instancia aislada; comprobar PostgreSQL, `storage`, Flyway, bancos cifrados y Vault; revisar permisos, auditoría, mensajes y protección contra sobrescritura; actualizar la guía para el administrador del servidor.
- Criterio de cierre: Respaldo, copia, verificación y restauración aislada comprobados sin afectar producción, con auditoría completa y procedimiento operativo documentado.
- Notas: La funcionalidad base ya está implementada. La restauración no debe probarse directamente sobre producción. Ver [plan de continuación y cierre](plan-cierre-respaldos.md). Iniciando analisis y conclusion del modulo de respaldos, restauracion aislada y sincronizacion local Modulo de respaldos concluido y certificado. Validada restauracion aislada, deteccion de corrupcion controlada (manifest SHA-256), compatibilidad con Vault Transit KMS, descarga de dump desde UI/API y scripts de exportacion e importacion local.

#### T-026 — Homogenización integral de validaciones de Banco de Preguntas entre Frontend y Backend

- Prioridad: Alta
- Área: Banco de Preguntas / Validación Excel / Compatibilidad Typst
- Responsable: Antigravity
- Creada: 2026-09-20
- Fecha límite: 2026-09-20
- Dependencias: `banco-preguntas.component.ts`, `BancoPreguntasService.java`.
- Criterio de cierre: 1) Normalizar respuestas V/F simple reconociendo A, B, V, F, Verdadero, Falso y eliminando la asignación silenciosa a 'A'; 2) Exigir respuesta obligatoria si la celda está vacía en preguntas no macro; 3) Sincronizar catálogo de tipologías (EMPAREJAMIENTO -> OPCION_EMPAREJAMIENTO, PROBLEMA -> SUBITEM_CASO); 4) Validar sintaxis Typst de fórmulas inmediatamente al cargar el archivo con mensajes claros en texto rojo; 5) Validar opciones de preguntas hijas de emparejamiento contra las opciones definidas en la madre; 6) Exponer errores reales de compilación Typst si fallara la previsualización.
- Notas: En progreso. Implementando homogenización de validaciones en banco-preguntas.component.ts. Homogenizacion integral de validaciones de banco de preguntas completada y compilada con exito. Reflejar estado de verificacion devuelto/pendiente en tarjetas de rol y banco

#### T-025 — Notificación para docente de exámenes sin cartilla con notas pendientes de registro

- Prioridad: Alta
- Área: Notificaciones / Exámenes sin cartilla / Docentes
- Responsable: Antigravity
- Creada: 2026-09-19
- Fecha límite: 2026-09-19
- Dependencias: `notificaciones.service.ts`, `topbar.component.ts`, `banco-preguntas.component.ts`.
- Criterio de cierre: 1) Incorporar en `NotificacionesService._cargarNotificacionesDocente()` la detección de roles de examen modalidad `PRESENCIAL_SIN_CARTILLA` en estado `PENDIENTE_NOTAS`; 2) Generar alerta con tipo `NOTAS_SIN_CARTILLA_PENDIENTES` indicando que no subió notas aún, con enlace directo (`/banco-preguntas?rolId=...&abrirNotas=true`) y acción "Cargar notas"; 3) Reflejar la alerta en el contador de la campana del topbar (`totalAlertasCount`) e icono distintivo; 4) Al abrir la notificación, redirigir a `/banco-preguntas` y abrir automáticamente el modal de calificaciones; 5) Al guardar las calificaciones en `banco-preguntas`, refrescar automáticamente las notificaciones; 6) En la lista y modal del calendario del docente, destacar la insignia de "Notas pendientes" con acceso directo a calificar.
- Notas: En progreso. Iniciando implementación técnica. Notificacion de examen sin cartilla pendiente de notas implementada en Topbar, calendario y validador de Banco de Preguntas.

#### T-024 — Visibilidad y accesibilidad del botón "Aprobar y Guardar" en previsualización de examen en vista móvil

- Prioridad: Alta
- Área: Banco de Preguntas / Previsualización PDF / Responsividad Móvil
- Responsable: Antigravity
- Creada: 2026-09-19
- Fecha límite: 2026-09-19
- Dependencias: `banco-preguntas.component.ts`.
- Criterio de cierre: 1) Asegurar que en pantallas móviles o con altura reducida, el contenedor modal de previsualización de cuadernillo PDF mantenga visible el encabezado y el pie de página con sus acciones; 2) Flexibilizar el área de scroll del PDF con flex-1 min-h-0 para evitar que el visor desborde y oculte los botones; 3) Compactar insignias y texto del botón de aprobación en móvil evitando desbordes; 4) Calibrar el umbral de scroll de finalización a 100px para garantizar la detección de lectura completa en pantallas táctiles.
- Notas: En progreso. Implementando corrección de layout flexbox, scroll contenedor y umbral de lectura en banco-preguntas.component.ts. Corregido layout flexbox del modal de previsualización PDF oficial: contenedor ajustado a 94dvh/92vh, flex-1 min-h-0 en el visor de documentos, cabecera compacta y pie de página shrink-0 con botones visibles permanentemente y textos responsivos. Tolerancia de lectura calibrada a 100px para pantallas táctiles. Frontend compilado y verificado en Docker.

#### T-023 — Reconocimiento OCR Robusto y Multi-Zona del Código de Estudiante (Dentro y Fuera del Recuadro de Cartilla OMR)

- Prioridad: Alta
- Área: Calificación OMR / Motor Python / Detección OCR
- Responsable: Antigravity
- Creada: 2026-09-19
- Fecha límite: 2026-09-19
- Dependencias: `omr_engine.py`, `evaluaciones-dia.component.ts`.
- Criterio de cierre: 1) Ampliar la zona de búsqueda OMR a múltiples áreas: recuadro preimpreso con márgenes holgados, área manuscrita izquierda ("Código Estudiante") y escaneo de cabecera; 2) Corregir el corte de márgenes que truncaba el último dígito en el recuadro preimpreso; 3) Normalizar confusiones tipográficas OCR comunes (e.g. ¢ por 4, líneas divisorias por 4 o 1); 4) Implementar resolución inteligente y fuzzy contra la nómina oficial (`mapeos`) del examen para asignar automáticamente el estudiante cuando la coincidencia sea unívoca; 5) Habilitar en el frontend selección interactiva de los códigos OCR candidatos para autocompletar con un clic.
- Notas: En progreso. Implementando soporte para lectura de código fuera del recuadro y corrección de márgenes. Implementado reconocimiento OCR multi-zona (recuadro preimpreso calibrado, area manuscrita izquierda, cabecera global) con tolerancia fuzzy a errores OCR (¢ por 4, líneas divisorias) y cruce inteligente contra la nómina oficial del examen. Ajustando interfaz de inspección OMR: ocultar escaneados por defecto sin recuadros residuales, remover OCRs candidatos y estructurar respuestas en columnas 1-20, 21-40 y tab 41-60 Ajustes de interfaz OMR concluidos: 1) Ocultar previsualizaciones por defecto sin recuadros residuales oscuros; 2) Remoción de OCR candidatos; 3) Distribución en dos columnas verticales (1-20 y 21-40) y segundo tab para 41-60 tipo cartilla física. Contenedores frontend y worker-omr reconstruidos con éxito. Cartillas escaneadas visibles por defecto en cada página; modal ampliado a max-w-7xl y botón toggle funcional para ocultar/mostrar sin espacios residuales oscuros Diseño OMR fijo lado a lado: cartilla escaneada a la izquierda (lg:col-span-5) y respuestas/patrones a la derecha (lg:col-span-7) con columnas 1-20 y 21-40 y segundo tab 41-60

#### T-022 — Re-escaneo y Re-lectura OMR: Cargar nuevo archivo PDF de cartillas y actualizar calificaciones en evaluaciones calificadas o confirmadas

- Prioridad: Alta
- Área: Calificación OMR / Lista de Evaluaciones / Escaneo de Cartillas
- Responsable: Antigravity
- Creada: 2026-09-19
- Fecha límite: 2026-09-19
- Dependencias: `evaluaciones-dia.component.ts`, `OmrProcesamientoService.java`, `OmrProcesamientoController.java`.
- Criterio de cierre: 1) Permitir abrir el lector OMR (`abrirCalificacionOmr`) en evaluaciones que ya estén en etapa `Calificado` o `Confirmado`; 2) Al pulsar "Volver a calificar" o desde el visor de notas OMR, abrir directamente la interfaz de carga de nuevo archivo PDF escaneado; 3) Ejecutar lectura OMR con el motor OpenCV, previsualizar resultados y al guardar reemplazar/actualizar las calificaciones y cartillas de los estudiantes; 4) Registrar formalmente la auditoría del re-escaneo con usuario, fecha y cantidad de cartillas leídas.
- Notas: En progreso. Implementando acceso directo a re-escaneo OMR y carga de nuevo PDF en etapas Calificado y Confirmado. Habilitado re-escaneo OMR y carga de nuevo PDF en etapas Calificado y Confirmado con actualizacion automatica de calificaciones y auditoria formal. Frontend y backend reconstruidos y activos.

#### T-020 — Flujo de Estados para Exámenes Virtuales: Paso intermedio Sala Virtual e icono de computadora con estado Calificado al concluir

- Prioridad: Alta
- Área: Lista de Evaluaciones / Examen Virtual / Flujo de Estados
- Responsable: Antigravity
- Creada: 2026-09-19
- Fecha límite: 2026-09-19
- Dependencias: `evaluaciones-dia.component.ts`, `GeneracionTypstService.java`, `ExamenVirtualService.java`.
- Criterio de cierre: 1) Incorporar en el flujo de estados de modalidad VIRTUAL el paso intermedio "Sala Virtual" (`pi pi-desktop`) entre Validado y Calificado; 2) Permitir que al pulsar el paso Sala Virtual en Validado se abra la parametrización/generación o la gestión de sala virtual si ya existe; 3) Mantener el estado "Calificado" exclusivamente como el paso de finalización cuando el examen haya concluido en la sala virtual; 4) Habilitar apertura directa de resultados virtuales y descarga en Excel al pulsar Calificado; 5) Sincronizar transición en backend a GENERADO tras preparar variantes virtuales y a CALIFICADO al concluir sala.
- Notas: En revisión. Implementado paso intermedio Sala Virtual (pi pi-desktop) para exámenes virtuales en evaluaciones-dia y reservado Calificado para cuando concluye la sala. Incorporada copia de mensaje de acceso institucional completo para estudiantes (materia, grupo, docente, sala, token, link https://planificacion.unitepc.edu.bo/ e instrucciones paso a paso) con caché de sesión. Verificada compilación de frontend en Docker. Corrigiendo error 400 al finalizar y entregar examen virtual: soporte para variantes con cifrado KMS en calificar() Implementada corrección para examen virtual en ExamenVirtualService (desencriptación de patrón maestro mediante Vault Transit KMS en calificar y sincronización atómica de estado en enviar/guardarRespuesta) y frontend examen-virtual con estado de envío, spinner y alertas amigables. Tests unitarios aprobados (ExamenVirtualServiceTest) y contenedores reconstruidos.

#### T-021 — Descarga de patrón oficial de respuestas por docente desde Banco de Preguntas en estado Entregado o posterior

- Prioridad: Alta
- Área: Banco de Preguntas / Patrón de Respuestas / Rol Docente
- Responsable: Antigravity
- Creada: 2026-09-19
- Fecha límite: 2026-09-19
- Dependencias: `OmrProcesamientoController.java`, `OmrProcesamientoService.java`, `evaluaciones-dia.component.ts`, `banco-preguntas.component.ts`.
- Criterio de cierre: 1) Permitir al rol `DOCENTE` descargar el PDF del patrón oficial de respuestas (`/api/omr/{rolExamenId}/patron-calificado/pdf`) y consultar el patrón (`/patron-calificado`) para sus grupos asignados; 2) Habilitar la consulta y descarga a partir del estado `ENTREGADO` y etapas posteriores (`DEVUELTO`, `PENDIENTE_NOTAS`, `CALIFICADO`, `CONFIRMADO`); 3) En `banco-preguntas.component.ts`, mostrar tarjeta/botón institucional para descargar el PDF con las variantes para compartir con los estudiantes de su grupo asignado; 4) En `evaluaciones-dia.component.ts`, permitir visualización/descarga del patrón desde el estado `Entregado`.
- Notas: En progreso. Iniciando implementación técnica en backend y frontend. Descarga de patrones variantes habilitada para DOCENTE en ENTREGADO o posteriores desde Banco de Preguntas y Calendario. Tests unitarios aprobados y contenedores reconstruidos.

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
| Pendientes | 5 |
| En progreso | 0 |
| En revisión | 19 |
| Bloqueadas | 0 |
| Completadas | 4 |

## Decisiones del módulo

- Persistencia: archivo Markdown versionado con Git.
- Base de datos: no requerida.
- Backend y frontend: no requeridos para este seguimiento interno.
- Permisos: no aplican; el acceso depende de la rama y del repositorio.
- Auditoría: el historial de cambios queda en Git; los cierres deben conservar una nota breve en la tarjeta.
