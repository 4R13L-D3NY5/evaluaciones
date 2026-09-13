# Plan de continuación y cierre del módulo de respaldos

## Objetivo

Completar la validación operativa de **Respaldos y contingencia** para asegurar que la base de datos, el almacenamiento de archivos y la información cifrada puedan recuperarse de forma controlada, trazable y sin sobrescribir producción por accidente.

La base ya cuenta con pantalla administrativa, configuración de frecuencia y retención, generación de snapshots Restic, copia externa, verificación, eliminación controlada de la copia local y restauración mediante worker. La continuación se concentra en probar el flujo completo, endurecer sus controles y documentar la operación para el administrador del servidor.

## Actores y permisos

- **Administrador del Sistema:** único perfil autorizado actualmente para configurar, generar, copiar, verificar, eliminar la copia local y solicitar restauraciones.
- **Worker de respaldos:** ejecuta las operaciones encoladas y registra sus resultados; no recibe acciones directamente desde el navegador.
- **Administrador del servidor:** prepara montajes, secreto de Restic, permisos de archivos y el entorno aislado de restauración.

## Fases de continuación

### 1. Diagnóstico del ambiente

- Confirmar que la migración `V25__respaldos_administrables.sql` esté aplicada.
- Revisar estado de `worker-backup`, RabbitMQ, PostgreSQL y Vault.
- Confirmar existencia y permisos del secreto de Restic.
- Validar los montajes de `backups`, `backups-external` y `storage` contra las rutas configuradas.
- Verificar que no se incluyan `.env`, tokens, contraseñas ni llaves de Vault en el repositorio Restic.

### 2. Respaldo, copia y verificación

- Solicitar un respaldo manual y comprobar `SOLICITADO → EN_PROCESO → GENERADO`.
- Confirmar que el snapshot contenga el dump lógico de PostgreSQL, `manifest.json` y `storage`.
- Copiar al repositorio externo y comprobar `COPIANDO → COPIADO`.
- Ejecutar la verificación de integridad y comprobar `VERIFICANDO → VERIFICADO`.
- Probar reintentos, errores controlados y retención sin crear duplicados ni borrar copias fuera de la ventana configurada.

### 3. Integridad y corrupción controlada

- Restaurar una copia verificada en una carpeta temporal.
- Validar tamaños y SHA-256 de los archivos del manifiesto.
- Alterar únicamente una copia de prueba y confirmar que el sistema detecte el checksum inválido.
- Confirmar que no continúe si falta el dump, el manifiesto, el repositorio o la contraseña de Restic.

### 4. Restauración aislada

- Crear una instancia nueva de PostgreSQL y un `storage` nuevo para la prueba.
- Restaurar la base lógica y validar tablas, migraciones Flyway, usuarios y registros representativos.
- Restaurar los archivos y validar rutas, tamaños y hashes.
- Comprobar que el marcador de mantenimiento se active durante la operación y se retire solo después de una restauración exitosa.
- Probar una restauración fallida y confirmar que no borre el origen ni deje temporales sensibles.
- No ejecutar la restauración de prueba sobre producción.

### 5. Bancos cifrados y Vault

- Confirmar que los bancos cifrados se conserven en la base y el almacenamiento.
- Probar la lectura de un banco restaurado con el mismo Vault, la misma clave Transit y las llaves de desbloqueo correspondientes.
- Respaldar Vault de forma independiente: `vaultdata`, llaves de unseal y secretos bajo custodia separada.
- Documentar que una restauración de PostgreSQL sin el Vault compatible no equivale a recuperar los bancos cifrados.

### 6. Seguridad, auditoría y cierre operativo

- Confirmar que solo el Administrador del Sistema pueda ejecutar acciones críticas.
- Validar auditoría para solicitud, generación, copia, verificación, eliminación y restauración.
- Revisar estados, errores y acciones deshabilitadas en la interfaz.
- Confirmar la protección contra eliminación local prematura, restauración sin confirmación y sobrescritura accidental.
- Entregar una guía breve al administrador del servidor con rutas, secretos, diagnóstico y restauración aislada.

## Entidades y estados existentes

Tablas principales:

- `sea_configuracion_respaldos`: frecuencia, retención y destino.
- `sea_respaldos`: solicitudes, snapshots, rutas, tamaños, fechas y estado.
- `sea_auditoria_respaldos`: historial de acciones del backend y del worker.

Estados: `SOLICITADO`, `EN_PROCESO`, `GENERADO`, `COPIANDO`, `COPIADO`, `VERIFICANDO`, `VERIFICADO`, `RESTAURANDO`, `ELIMINADO` y `ERROR`.

## Operaciones API existentes

- `GET /api/backups/config`
- `PUT /api/backups/config`
- `GET /api/backups`
- `POST /api/backups`
- `POST /api/backups/{id}/copy-external`
- `POST /api/backups/{id}/verify`
- `DELETE /api/backups/{id}/local`
- `POST /api/backups/{id}/restore`

Todas están protegidas actualmente para `ADMINISTRADOR_SISTEMA`. No se deben exponer contraseñas de Restic, tokens, llaves de Vault ni contenido de bancos en la interfaz.

## Criterios de aceptación

- [ ] Respaldo manual completo generado y registrado.
- [ ] Copia externa realizada y `restic check` exitoso.
- [ ] Auditoría completa de las operaciones.
- [ ] Corrupción o checksum inválido detectado como error.
- [ ] Eliminación local bloqueada antes de verificar la copia externa.
- [ ] Restauración comprobada en un entorno aislado.
- [ ] Datos, migraciones, archivos y bancos cifrados validados con Vault compatible.
- [ ] Ninguna prueba destructiva ejecutada sobre producción.
- [ ] Guía operativa del servidor actualizada.
- [ ] Backend, worker y frontend verificados y saludables.

## Resultado esperado

Mover la tarea a **Completada** solo después de cumplir todos los criterios. Si falta el secreto de Restic, el repositorio externo, el worker o un Vault compatible, mantenerla en **En revisión** y registrar la dependencia exacta.
