# Pendientes del Sistema de Evaluaciones

Fecha de registro: 2026-09-06  
Repositorio: `sisa-evaluacion`  
Alcance: seguimiento funcional, técnico y de pruebas del sistema.

## Objetivo

Consolidar los trabajos pendientes del Sistema de Evaluaciones y definir el criterio mínimo para considerar cada punto cerrado. La lista distingue entre funcionalidades que todavía requieren desarrollo y funcionalidades que ya tienen componentes implementados, pero necesitan validación integral en el ambiente de pruebas.

Una funcionalidad no se considerará terminada únicamente porque aparezca en pantalla. Para cerrarla se debe comprobar también el endpoint, los permisos, la persistencia de datos, la auditoría, los mensajes de error y el comportamiento con datos reales o representativos.

## Estados utilizados

- **Pendiente de implementación:** todavía falta construir la funcionalidad o una parte esencial de ella.
- **Parcialmente implementado:** existe una parte funcional, pero falta completar reglas, permisos, integración o experiencia de usuario.
- **Pendiente de validación:** la funcionalidad existe en el sistema, pero requiere pruebas formales antes de darla por concluida.

## Lista priorizada

| N.º | Pendiente | Estado actual | Prioridad | Criterio mínimo de cierre |
|---:|---|---|---|---|
| 1 | Visualización de patrones después de calificar | Implementado; pendiente de validación | Alta | El personal de evaluaciones autorizado puede abrir un examen en estado **Calificado** y consultar el patrón de respuestas con una vista equivalente a la utilizada durante la calificación. La consulta debe ser de solo lectura, respetar el campus asignado y no exponer claves a perfiles no autorizados. |
| 2 | Impresión de notas de exámenes sin cartilla por parte del docente | Implementado; pendiente de validación | Alta | El docente puede imprimir el reporte de notas de sus propios exámenes sin cartilla. El reporte debe incluir estudiante, CI, nota obtenida, escala correspondiente, fecha, materia y grupo; debe respetar el alcance del usuario y no permitir modificaciones desde la impresión. |
| 3 | Carga de notas de exámenes sin cartilla por parte del docente | Implementado; pendiente de validación | Alta | El docente puede ingresar notas únicamente de sus exámenes presenciales sin cartilla y del padrón oficial SEA correspondiente. La nota debe validarse en el rango permitido, calcular la escala institucional, registrar usuario y fecha, generar auditoría y cambiar el examen a **Calificado** cuando corresponda. |
| 4 | Fecha del examen en el módulo Plan de Estudios | Implementado; pendiente de validación | Media | La fecha debe mostrarse correctamente para 1.er parcial, 2.º parcial y examen final, según carrera, grupo y gestión. Debe conservarse después de recargar, mostrar un valor vacío cuando no exista y evitar mezclar fechas de otra carrera o gestión. |
| 5 | Optimización del módulo de Reportes | Pendiente de análisis y optimización | Media | Alinear el reporte principal con el modelo de SIDOPA, revisar filtros por gestión, sede, campus, carrera, estado y fechas, corregir resultados duplicados o incompletos, mejorar paginación/exportación y comprobar tiempos de respuesta con un volumen representativo. Los reportes secundarios quedan como trabajo posterior. |
| 6 | Pruebas del módulo de Respaldos y contingencia | Pendiente de pruebas integrales | Crítica | Verificar creación o solicitud de respaldo, copia externa, validación de integridad, detección de checksum inválido, restauración en un entorno aislado, registro de auditoría y protección contra sobrescritura accidental. La restauración no debe probarse directamente sobre producción. |
| 7 | Optimización del módulo de Auditoría | Pendiente de análisis y optimización | Media | Permitir consultar eventos por módulo, acción, usuario, fecha, resultado y entidad afectada; mostrar el detalle sin exponer secretos; mantener paginación y filtros consistentes; restringir el acceso según rol; revisar índices y tiempos de respuesta; y confirmar que las acciones sensibles quedan registradas. |
| 8 | Permiso configurable para importación de bancos por Directores de Carrera | Pendiente de implementación | Alta | En Administración de Evaluaciones, un administrador o responsable puede habilitar o deshabilitar esta capacidad. El valor predeterminado debe ser **deshabilitado**. Cuando esté habilitada, el Director de Carrera podrá importar bancos únicamente dentro de su sede/carrera y el sistema debe registrar el cambio y cada importación en auditoría. |
| 9 | Configuración de períodos de examen activos y período predeterminado | Pendiente de implementación | Alta | En la configuración administrativa se pueden activar o desactivar **1.er parcial, 2.º parcial, final y las instancias** disponibles. Debe existir un único período predeterminado, inicialmente **1.er parcial**; los selectores y formularios deben mostrar solo períodos activos y conservar la configuración por gestión. |

## Avance inicial

Se inició el bloque de notas sin cartilla con los siguientes ajustes de seguridad:

- Las operaciones de documento y notas validan en el servidor que el usuario tenga acceso al examen seleccionado.
- La carga de notas registra como responsable al usuario autenticado, sin confiar en el nombre enviado desde el navegador.
- Se rechazan códigos de estudiante duplicados en una misma carga.
- Se mantienen las validaciones existentes: examen sin cartilla, estado **PENDIENTE_NOTAS**, nómina oficial SEA y notas entre 0 y 60.
- La impresión se habilita únicamente cuando la nómina está completa y muestra las notas sobre 60 y sobre 100.

Para la visualización posterior del patrón se agregó una consulta protegida. El servidor exige el estado `CALIFICADO`, valida el acceso académico al rol —incluido el campus asignado al personal de evaluaciones— y descifra internamente el patrón de cada variante. La interfaz solo muestra las respuestas en modo lectura; no entrega el contenido cifrado ni las claves de protección a perfiles no autorizados.

Este bloque queda en **Pendiente de validación** hasta comprobarlo con una evaluación calificada, una evaluación aún no calificada, un usuario operativo fuera del campus y un perfil sin permisos operativos.

Este bloque permanece en **Pendiente de validación** hasta probarlo con un docente, un examen propio, un examen de otro docente y los perfiles de responsable y administrador.

## Orden sugerido de atención

1. Cerrar los flujos de notas sin cartilla, incluyendo carga por docente, impresión y permisos.
2. Cerrar la visualización de patrones después de calificar.
3. Implementar el permiso configurable de importación de bancos para Directores de Carrera.
4. Implementar los períodos activos y el período predeterminado por gestión.
5. Validar la fecha del examen en Plan de Estudios con datos de varias gestiones y grupos.
6. Probar respaldos y restauración en un entorno aislado, por el riesgo operativo que implica.
7. Optimizar Reportes tomando SIDOPA como referencia principal.
8. Optimizar Auditoría y verificar que todas las acciones nuevas queden registradas.

## Checklist de cierre para cada pendiente

- [ ] Regla funcional definida y comprobada.
- [ ] Endpoint o servicio probado.
- [ ] Permisos verificados por rol y alcance de sede/campus/carrera.
- [ ] Datos persistidos y recuperados correctamente.
- [ ] Auditoría generada cuando corresponda.
- [ ] Mensajes de validación y error revisados.
- [ ] Prueba con datos válidos, incompletos y no autorizados.
- [ ] Prueba de recarga, repetición y concurrencia cuando aplique.
- [ ] Documentación actualizada.

## Referencias internas

- [Flujo y secuencia de uso de exámenes](flujo-secuencia-uso-examenes.md)
- [Exámenes presenciales sin cartilla](modulo-examen-sin-cartilla.md)
- [Cartillas y procesamiento OMR](modulo-cartillas-omr.md)
- [Plan de Estudios](modulo-plan-estudios.md)
- [Configuración de evaluaciones](modulo-configuracion-evaluaciones.md)
- [Usuarios y accesos](modulo-usuarios-accesos.md)
- [Seguridad y acceso](modulo-seguridad-acceso.md)
