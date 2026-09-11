# Contexto de continuidad — Evaluaciones UNITEPC

Revisión: **2026-09-11**. Sustituye el contexto genérico de XF y las descripciones históricas de agosto. Describe evidencia local, no certifica producción.

## 1. Proyecto y versión

- Trabajar en `evaluaciones`, no `simucasos`, aunque una sesión nueva se abra allí.
- Ruta real de origen: `C:/Users/S1ST3M4S/XpertiFlow/projects/evaluaciones`.
- `C:/laragon/www/evaluaciones` es una junction hacia esa misma carpeta. Los contenedores activos muestran montajes con esta ruta antigua; en otra PC recrearlos desde la ruta real elegida. No copiar la junction como si contuviera otra instalación.
- Rama local `main`; commit observado `28dcb37ab54f2f7c55eeaa766c4aa258d2826cfc`, mensaje «falta trasladar anulados a la vista lista de evaluaciones».
- Árbol limpio antes de esta actualización documental. Estos documentos son posteriores a ese commit: llevarlos aunque todavía no estén confirmados/publicados.
- Único remoto local observado: `origin` = `https://github.com/4R13L-D3NY5/evaluaciones.git`.
- Distribución institucional: `https://git.unitepc.solutions/investigacion/sisa-evaluacion.git`. **No se verificó que tenga este commit ni que coincida con GitHub.** No publicar ni cambiar remotos sin autorización.
- La referencia histórica V1.0.5 / `085b03d1bf1170a5b2dfe1446752eca65227181f` no demuestra la versión actual de producción. Solicitar su SHA al administrador.

## 2. Arquitectura real

| Componente | Implementación |
|---|---|
| Frontend | Angular 18.2, TypeScript, PrimeNG 17, Tailwind; Nginx en Docker. |
| Backend | Java 21, Spring Boot 3.3.2, Maven, PostgreSQL 16, Flyway. |
| Workers | Python; Typst para documentos, OpenCV/Tesseract para OMR. Carpeta `evaluaciones-workers`. |
| Colas | RabbitMQ; este Compose no le asigna volumen persistente. Los trabajos pendientes no viajan en el respaldo de DB. |
| Cifrado | Vault 1.17, Transit, almacenamiento **file** en `/vault/file`; no Raft. |
| Archivos | `./storage` enlazado a `/app/storage`, fuera de Git. |
| Respaldos | Worker Restic para DB/archivos. Compose no le monta el estado de Vault: necesita respaldo independiente. |
| Institucional | Datos oficiales de sedes, carreras, asignaturas, grupos, docentes y estudiantes por SEA/SISA. Requiere red y credenciales autorizadas. |

Fuentes primarias: `docker-compose.yml`, Dockerfiles, `evaluaciones-backend/pom.xml`, `evaluaciones-frontend/package.json`, `vault/config.hcl`, `.env.example` y código. No usar documentos de agosto como prueba del estado actual.

### Estado local observado

Ocho servicios ejecutándose: `db`, `rabbitmq`, `vault`, `vault-bootstrap`, `backend`, `frontend`, `worker-typst`, `worker-omr`. Los cuatro con chequeo declarado (`db`, `rabbitmq`, `vault-bootstrap`, `backend`) aparecían saludables. El chequeo del backend comprueba su puerto, no el funcionamiento integral.

`worker-backup` está definido, pero no aparecía creado. Existe `vault/secrets/unseal-keys`; falta `vault/secrets/restic-password` en la ubicación predeterminada inspeccionada. No afirmar que los respaldos automáticos estén funcionando.

Puertos locales observados: frontend `4200`, backend **8081**, DB `5432`; perfil Spring `dev`. Vault publicado en `127.0.0.1:8200`. No confundir puerto del host 8081 con puerto interno 8080 ni copiar estos valores ciegamente a producción.

Volúmenes encontrados: `evaluaciones_pgdata`, `evaluaciones_vaultdata`, `evaluaciones_eval_storage`. El backend activo usa un bind de `storage`, no ese último volumen. Revisar su contenido/uso histórico antes de excluirlo de una conservación; no borrarlo.

## 3. Reglas funcionales que deben preservarse

- No alterar bancos cifrados, claves, notas ni exámenes aplicados por una mejora de interfaz.
- Los grupos docentes deben corresponder a la identidad oficial SEA y gestión; no inventar CI para solucionar colisiones de cuentas.
- Los enunciados generales de casos y emparejamiento no son preguntas calificables. Usar «preguntas», no «reactivos», en interfaz.
- V/F simple: no barajar incisos. V/F complejo: mantener orden de las cuatro proposiciones; `opcion_a` a `opcion_d` contienen proposiciones, `respuesta_correcta` es clave A–E y `opcion_e` debe quedar vacía. E no exige una quinta proposición.
- A/B/ambas/ninguna: no cambiar el significado/orden de las claves. Las respuestas fijas se explican en instrucciones de sección, sin repetirlas en cada pregunta.
- Mejor respuesta: barajar alternativas y remapear la correcta.
- Casos: mantener orden de subpreguntas, permitir barajar sus alternativas. Emparejamiento: barajar opciones compartidas conservando correspondencias.
- Patrones solicitados: vertical 8,5 × 13 pulgadas, variantes consecutivas, 15 respuestas por fila, número/inciso, logo UNITEPC y una firma/sello al final de todos los patrones. Auditoría de pregunta/alternativa original separada.
- Importación de roles: correspondencia código/grupo institucional; no sobrescribir automáticamente una programación existente. Cambios excepcionales de fecha/hora manuales.

Son reglas a preservar y comprobar, no certificación de todos los casos extremos.

## 4. Anulación y ajuste OMR: punto prioritario de continuación

Archivos de entrada:

- `evaluaciones-frontend/src/app/pages/evaluaciones-dia/evaluaciones-dia.component.ts`.
- `evaluaciones-frontend/src/app/core/services/omr-procesamiento.service.ts`.
- `evaluaciones-backend/src/main/java/com/xpertiflow/evaluaciones/api/controller/OmrProcesamientoController.java`.
- `evaluaciones-backend/src/main/java/com/xpertiflow/evaluaciones/application/OmrProcesamientoService.java`.
- `evaluaciones-backend/src/main/resources/db/migration/V36__anulaciones_preguntas_omr.sql`.

La interfaz contiene selectores de corrección y botones anular/reactivar **dentro del detalle OMR por estudiante/pregunta**, no como entrada independiente evidente en la fila principal. Revisar `abrirCalificacionOmr`, `puedeAjustarIncisosOmr`, `puedeGestionarAnulacionOmr`, `gestionarAnulacionOmr` y `confirmarAnulacionOmr`.

- Ajuste visible para `RESPONSABLE_EVALUACIONES`, en `Devuelto` o `Pendiente de notas`.
- Anulación visible para administrador o responsable, en esos estados.
- La anulación pertenece a una pregunta de una variante, no solo a un estudiante. Comprobar alcance, motivo, recálculo y auditoría antes de operar datos reales.
- Existe el evento `CALIFICACION_OMR_AJUSTADA` en servidor.
- El último commit y las preguntas del usuario muestran un pendiente de **acceso/visibilidad desde Lista de Evaluaciones**. Código interno no equivale a funcionalidad accesible en todos los momentos del flujo.

### Riesgos detectados; pendientes de prueba

1. El servicio condiciona `validarAjusteManual` y el evento específico a `request.isAjusteManual()`, y acepta `respuestasOriginales` del cliente. Revisar el flujo y probar peticiones manipuladas: permisos y trazabilidad no deben depender solo de una bandera ni de valores originales enviados por navegador. No se ejecutó una prueba de explotación.
2. `abrirCalificacionOmr` pide las anulaciones al abrir. Verificar que el permiso de consulta no bloquee al personal que puede calificar pero no anular.
3. Probar cierre en Calificado, aislamiento entre variantes/roles y cálculo de nota tras anulación. No volver a barajar un examen emitido.

## 5. Incidencias y pendientes que conservar

| Asunto | Estado / siguiente paso |
|---|---|
| Cuenta docente convertida a director con CI modificado | V22 define unicidad de CI y de `(proveedor_identidad, identidad_externa)`. Una identidad SEA conservada puede colisionar al sincronizar otra cuenta. Hipótesis fundada, no causa confirmada del 400 de producción. Revisar edición/sincronización y logs; no borrar cuentas ni inventar CI. |
| Recuperar grupos docentes | Comprobar CI, identidad externa, rol, alcances persistidos y gestión. Cambiar el rol no garantiza limpiar restricciones anteriores. |
| 502 de producción | Sin logs contemporáneos de proxy, contenedores y recursos no hay causa demostrada. `client_max_body_size 50m` atiende tamaño de carga, no explica por sí solo un 502. |
| 400 / PDF del banco | Distinguir Excel, versión del rol/banco y generación PDF. Obtener respuesta completa y muestra autorizada; no deducir causa solo del estado HTTP. |
| OK en Plan de Estudios | Verificar estados posteriores a Validado y resumen por grupo/parcial. Etiqueta visual no sustituye estado persistido. |
| Respaldos | Falta acreditar recuperación aislada completa y descifrado con el Vault restaurado. Worker local de backups ausente en esta inspección. |

El histórico está en `docs/pendientes-sistema.md`; no todos sus puntos fueron reevaluados. No cerrar pendientes solo por existir código.

## 6. Material que un clon no recupera

- `outputs/redaccion-derecho-etica-20260910/BANCO_REDACCION_DERECHO_ETICA_60_PREGUNTAS.xlsx` y auxiliares.
- `outputs/examen-10-por-tipo-20260909/` y demás bancos de trabajo.
- `.env`, `vault/secrets/`, `storage/`, repositorios de respaldo y volúmenes de DB/Vault.

El Excel de redacción no fue revalidado con el importador actual durante este traspaso. `outputs` se ignora en Git. Consultar `docs/continuidad-otra-pc.md` para copia y custodia.

## 7. Comprobaciones en la siguiente PC

1. Leer la guía de continuidad, elegir solo código o datos completos y verificar SHA/cambios. No apuntar pruebas destructivas a producción.
2. Arrancar entorno aislado y comprobar login, SEA, lectura de banco existente, PDF y cartilla de prueba.
3. Revisar pruebas Java en `evaluaciones-backend/src/test`; scripts `test_generator_shuffle_rules.py`, `test_generator_grouping.py` y `test_preview_all_questions.py` en `evaluaciones-workers`. Leer dependencias antes de ejecutar: algunas generan archivos.
4. Frontend: `npm ci` y `npm run build` dentro de `evaluaciones-frontend`; no hay script `npm test` en package.json. Backend: Maven/Java 21 según Dockerfile/pom.
5. Probar perfiles diferentes, usuarios fuera de campus, estados cerrados, notas conocidas y auditoría.

## 8. Mensaje para retomar

«Trabaja en evaluaciones. Lee `.context/context.md`, `docs/continuidad-otra-pc.md`, `docs/pendientes-sistema.md` y Git antes de modificar archivos. No asumas que producción coincide con esta copia. Conserva `.env`, Vault, volúmenes, bancos y notas. Primero verifica acceso a anulación y corrección OMR en Lista de Evaluaciones y permisos reales de servidor. Distingue código existente de funcionalidad validada. No despliegues ni restaures sin que se solicite.»

Esta revisión solo actualiza documentación. No ejecutó restauraciones, pruebas de calificación ni cambios en producción.
