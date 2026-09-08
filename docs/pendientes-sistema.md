# Pendientes del Sistema de Evaluaciones

Fecha de registro: 2026-09-06  
Última actualización: 2026-09-07
Repositorio: `sisa-evaluacion`  
Alcance: seguimiento funcional, técnico y de pruebas del sistema.

## Objetivo

Consolidar los trabajos pendientes del Sistema de Evaluaciones y definir el criterio mínimo para considerar cada punto cerrado. La lista distingue entre funcionalidades que todavía requieren desarrollo y funcionalidades que ya tienen componentes implementados, pero necesitan validación integral en el ambiente de pruebas.

Una funcionalidad no se considerará terminada únicamente porque aparezca en pantalla. Para cerrarla se debe comprobar también el endpoint, los permisos, la persistencia de datos, la auditoría, los mensajes de error y el comportamiento con datos reales o representativos.

## Estados utilizados

- **Pendiente de implementación:** todavía falta construir la funcionalidad o una parte esencial de ella.
- **Parcialmente implementado:** existe una parte funcional, pero falta completar reglas, permisos, integración o experiencia de usuario.
- **Pendiente de validación:** la funcionalidad existe en el sistema, pero requiere pruebas formales antes de darla por concluida.
- **Incidencia reportada; pendiente de diagnóstico:** se informó un fallo que debe reproducirse y corregirse antes de validar el flujo.
- **Pendiente de aclaración:** falta precisar el alcance funcional antes de implementar.

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
| 10 | Permitir restablecer un rol de examen a Validado desde la Lista de Evaluaciones | Pendiente de implementación y validación | Alta | Habilitar la acción **Restablecer a Validado** para todos los perfiles que gestionan roles de examen, siempre dentro de su alcance autorizado de sede, campus, carrera y exámenes propios cuando corresponda. Se refiere al rol de examen, no al rol de acceso del usuario ni a su contraseña. Antes de ejecutar, mostrar una confirmación con los efectos sobre estados, documentos, patrones y calificaciones; definir y comprobar qué datos se conservan o invalidan. Validar permisos en el servidor y registrar el usuario autenticado, fecha, examen y estados anterior y posterior en la bitácora. Probar exámenes con y sin cartilla y evitar afectar otros roles de examen. |
| 11 | Corregir el funcionamiento del examen sin cartilla | Incidencia reportada; pendiente de diagnóstico | Alta | Reproducir el fallo reportado «no está dando el examen sin cartilla», identificar la etapa afectada y corregirla. Validar el flujo completo: generación y acceso al examen, carga de notas por el docente sobre 60, previsualización sobre 100 e impresión del reporte. Comprobar permisos, persistencia y cambio de estado; coordinar el cierre con los pendientes 2 y 3. |
| 12 | Impresión de patrones de respuestas | Implementado; pendiente de validación | Alta | Los perfiles autorizados pueden imprimir el patrón correspondiente al examen y a su variante, también después de calificar. El documento identifica examen, materia, grupo, período y variante, mantiene la correspondencia entre número de pregunta y respuesta, y se genera temporalmente desde el contenido protegido. Respetar las restricciones de acceso y liberación del patrón; registrar la operación en auditoría en la validación integral. Complementa el pendiente 1; visualizar no equivale a imprimir. |
| 13 | Agregar observaciones a la lista de firmas de estudiantes | Implementado; pendiente de validación | Alta | La lista de firmas impresa incluye una columna de observaciones por estudiante, con espacio para anotaciones y sin recortar los datos ni el espacio de firma. Verificar la legibilidad y la paginación con nóminas extensas, tanto con cartilla como sin cartilla. |
| 14 | No exigir impresión de marcas en exámenes sin cartilla | Implementado; pendiente de validación | Alta | El flujo sin cartilla puede abrir e imprimir la lista de firmas sin imprimir marcas OMR. El backend rechaza la solicitud directa de marcas para esta modalidad y la interfaz no muestra la operación como requisito. Mantener la impresión de marcas y sus controles exclusivamente para exámenes con cartilla; comprobar que ambos flujos conservan sus documentos y estados correctos. |
| 15 | Corregir la identificación del usuario autenticado en la bitácora | Incidencia reportada; pendiente de diagnóstico | Alta | Reproducir los eventos que no registran al usuario logueado y revisar las acciones auditables de los módulos. Obtener la identidad desde la sesión autenticada en el servidor, sin confiar en un nombre enviado por el cliente. Verificar con usuarios y roles distintos que cada acción registra al actor correcto; distinguir las tareas automáticas de las acciones humanas. Complementa el pendiente 7 y debe atenderse antes de la optimización general. |
| 16 | Revisar OMR en la calificación de notas del examen | Pendiente de diagnóstico y validación integral | Alta | Contrastar cartillas de prueba con respuestas conocidas: lectura de marcas, identificación del estudiante y variante, correspondencia con el patrón y tratamiento de marcas vacías, múltiples o ambiguas. Comprobar el cálculo de la nota sobre 60 y su previsualización sobre 100, persistencia, reporte y ausencia de duplicación de resultados al repetir el procesamiento. Documentar y corregir las diferencias encontradas. |

### Incidencias de prioridad alta registradas el 7 de septiembre de 2026

Los puntos 10 a 16 se incorporan por solicitud del usuario. Son pendientes de trabajo, no funcionalidades verificadas ni correcciones ya realizadas. El fallo reportado en el examen sin cartilla obliga a volver a comprobar los puntos 2 y 3 antes de cerrarlos, aunque existan componentes implementados. El usuario aclaró que el punto 10 corresponde a **restablecer un rol de examen a Validado**, mediante la acción mostrada en la Lista de Evaluaciones; no se trata de restablecer contraseñas ni perfiles de acceso.

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

1. Corregir el examen sin cartilla y cerrar carga de notas, impresión y permisos; eliminar la exigencia de imprimir marcas en esta modalidad (2, 3, 11 y 14).
2. Revisar y validar la calificación OMR y sus escalas de notas (16).
3. Corregir la identificación del usuario autenticado en la bitácora (15).
4. Cerrar la visualización e impresión de patrones después de calificar (1 y 12).
5. Agregar observaciones a la lista de firmas y habilitar el restablecimiento del rol de examen a Validado para los perfiles que lo gestionan, respetando su alcance autorizado (13 y 10).
6. Probar respaldos y restauración en un entorno aislado, por el riesgo operativo que implica.
7. Implementar el permiso configurable de importación de bancos para Directores de Carrera (8).
8. Implementar los períodos activos y el período predeterminado por gestión (9).
9. Validar la fecha del examen en Plan de Estudios con datos de varias gestiones y grupos (4).
10. Optimizar Reportes tomando SIDOPA como referencia principal (5).
11. Optimizar Auditoría y verificar que todas las acciones nuevas queden registradas (7), sin postergar la corrección prioritaria del usuario autenticado del punto 15.

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
