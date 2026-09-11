# Continuidad en otra PC y despliegue seguro

Revisión: **2026-09-11**. Leer junto con [el contexto actual](../.context/context.md) y [la guía de despliegue](../guia_despliegue.md).

Los comandos son instrucciones para una operación futura: **no se ejecutaron respaldos, paradas, restauraciones ni despliegues al redactar esta guía**.

## 1. Elegir el alcance

| Objetivo | Qué necesita |
|---|---|
| Continuar editando código | Repositorio/historial, cambios pendientes, documentación y archivos de trabajo de outputs. Credenciales de desarrollo solo si se usarán servicios. |
| Conservar los mismos usuarios y exámenes locales | Lo anterior más PostgreSQL, Vault completo con sus llaves/tokens, `.env` y `storage` del mismo corte. |
| Actualizar producción existente | Código aprobado. **Conservar datos y secretos del servidor**, no reemplazarlos por los de esta PC. |

Copiar el proyecto no copia volúmenes Docker. Copiar solo la DB no recupera bancos cifrados si falta el Vault original. Una instalación vacía no equivale a restaurar la anterior.

## 2. Archivos y datos que deben acompañar el traslado

| Elemento | Tratamiento |
|---|---|
| Repositorio y `.git/` | Conservar código, historial y cambios pendientes. Alternativa: clon verificado más archivos no confirmados. El código contiene muestras institucionales: tratarlo como privado. |
| `.context/context.md`, `docs/`, `README.md`, `guia_despliegue.md`, `task.md` | Incluir esta actualización aunque todavía no tenga commit. |
| `.env` | Configuración real de la instancia; transferencia privada, nunca Git ni capturas. `.env.example` no recupera los secretos anteriores. |
| `vault/secrets/unseal-keys` | Llaves correspondientes al Vault respaldado. Custodia separada de los datos cifrados. |
| Volumen `evaluaciones_vaultdata` | Estado de Vault, claves Transit, políticas y autenticación. Obligatorio para conservar acceso a bancos cifrados. |
| Volumen `evaluaciones_pgdata` | Copia en frío de PostgreSQL, o respaldo lógico con restauración controlada. No copiar sus archivos mientras DB escribe. |
| `storage/` completo | Archivos persistentes, del mismo corte que DB y Vault. Conservar estructura. |
| `outputs/` | Excels y verificaciones fuera de Git, incluido `redaccion-derecho-etica-20260910/BANCO_REDACCION_DERECHO_ETICA_60_PREGUNTAS.xlsx` y `examen-10-por-tipo-20260909/`. |
| `bases/`, assets, plantillas, Dockerfiles, scripts, lockfiles | Conservar archivos versionados y cambios locales. No excluir indiscriminadamente PDF/XLSX: algunos son plantillas necesarias. |
| `vault/secrets/restic-password` | Contraseña de los repositorios Restic existentes. Si falta, pedirla al custodio. Una nueva contraseña no abre copias antiguas. |
| `backups/`, `backups-external/` o rutas configuradas | Para conservar historial de respaldos, copiar los repositorios completos. Revisar destinos reales en configuración/montajes. |
| Proxy institucional, TLS, DNS, firewall | Solicitar al administrador si también se traslada el servidor; pueden estar fuera del repositorio. Custodiar claves privadas por separado. |
| Adjuntos útiles del chat | Excel original o logs depurados necesarios para incidencias. Temp y `.codex/attachments` no viajan con Git. No copiar toda la cuenta de Codex ni sus credenciales. |

No es necesario llevar `node_modules`, `evaluaciones-backend/target`, cachés Angular/Python, herramientas descargadas o imágenes Docker si se pueden reconstruir. No eliminarlos en origen como parte del traslado. Revisar archivos no versionados antes de descartar carpetas temporales.

Separar paquete privado de código/documentos, paquete de datos y custodia de secretos. Proteger el medio de transferencia y limitar accesos. No adjuntar secretos a una conversación.

## 3. Inventario de origen

Desde la carpeta real de `evaluaciones`, no `simucasos`:

```powershell
git status --short
git branch --show-current
git rev-parse HEAD
git remote -v
docker compose -p evaluaciones ps --all
docker compose -p evaluaciones config --quiet
docker volume ls --filter label=com.docker.compose.project=evaluaciones
docker inspect evaluaciones-backend --format '{{json .Mounts}}'
```

No mostrar `docker compose config` sin `--quiet`, un `docker inspect` completo ni `.env`: pueden exponer secretos. Inspeccionar montajes de otros contenedores si difieren del Compose.

Estado observado: `main` / `28dcb37ab54f2f7c55eeaa766c4aa258d2826cfc`; ocho servicios ejecutándose, worker-backup ausente y restic-password no encontrado en su ruta predeterminada. También existe `evaluaciones_eval_storage`, pero el backend usa un bind de `./storage`: no borrar el volumen antiguo sin estudiar su contenido histórico.

La ruta `C:/laragon/www/evaluaciones` es una junction hacia `C:/Users/S1ST3M4S/XpertiFlow/projects/evaluaciones`. Copiar los archivos de la ruta real, no solo el enlace. La otra PC no necesita Laragon para Docker.

## 4. Transportar código e historial

Opción directa: copiar el repositorio incluida `.git` y sus cambios, con secretos/datos tratados por separado. Así se conservan revisiones locales no publicadas.

Para clonar desde GitLab, primero confirmar que contiene el commit requerido. Actualmente `origin` local apunta a GitHub: **no se verificó sincronización entre remotos**. Si falta una revisión, el responsable debe publicarla en el remoto autorizado o entregar el historial local. No elegir «la última» sin comparar.

Alternativa de transporte de historial, tras crear una carpeta privada nueva fuera del proyecto:

```powershell
git bundle create C:/traslado-evaluaciones/repositorio.bundle --all
git bundle verify C:/traslado-evaluaciones/repositorio.bundle
```

El bundle no incluye archivos ignorados ni cambios no confirmados. Llevar aparte estos documentos si aún no están confirmados, outputs, storage y secretos. No se creó un bundle en esta revisión.

En destino, en una carpeta nueva:

```powershell
git clone C:/traslado-evaluaciones/repositorio.bundle C:/proyectos/evaluaciones
```

Verificar después el remoto: un clon desde bundle puede apuntar al archivo, no a GitLab. Copiar `.git` conserva los remotos originales.

## 5. Trasladar datos: corte consistente autorizado

Requiere mantenimiento en origen. No realizarlo solo para continuar editando código.

1. Impedir nuevas operaciones y esperar que terminen generación, OMR y backups. RabbitMQ no tiene volumen persistente: no asumir recuperación de trabajos pendientes.
2. Preparar una carpeta privada nueva fuera del proyecto, con espacio suficiente. Los ejemplos usan `C:/traslado-evaluaciones` y no deben sobrescribir respaldos anteriores.
3. Obtener dump lógico adicional; después detener servicios y copiar volúmenes/archivos del mismo corte.

### 5.1 Dump lógico sin redirección binaria en PowerShell

Usa DB/usuario configurados dentro del contenedor:

```powershell
docker compose -p evaluaciones exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc -f /tmp/traslado-evaluaciones.dump'
docker compose -p evaluaciones exec -T db pg_restore --list /tmp/traslado-evaluaciones.dump
docker compose -p evaluaciones cp db:/tmp/traslado-evaluaciones.dump C:/traslado-evaluaciones/postgres.dump
```

Detenerse ante errores. Listar un dump comprueba su lectura, no una restauración completa. No transportar el dump binario con `>` desde Docker en Windows PowerShell.

### 5.2 Copia física en frío

Verificar nombres de volúmenes antes de usar estos ejemplos. Descargar previamente la imagen auxiliar y detener la instancia:

```powershell
docker pull alpine:3.20
docker compose -p evaluaciones stop
docker compose -p evaluaciones ps --all
```

Confirmar que no quedan procesos escribiendo en DB/Vault/storage. Con `C:/traslado-evaluaciones` ya creado:

```powershell
docker run --rm --network none --mount type=volume,src=evaluaciones_pgdata,dst=/source,readonly --mount type=bind,src=C:/traslado-evaluaciones,dst=/backup alpine:3.20 tar -C /source -czf /backup/pgdata.tar.gz .
docker run --rm --network none --mount type=volume,src=evaluaciones_vaultdata,dst=/source,readonly --mount type=bind,src=C:/traslado-evaluaciones,dst=/backup alpine:3.20 tar -C /source -czf /backup/vaultdata.tar.gz .
```

Comprobar salida exitosa de cada comando. Con servicios aún detenidos, copiar `storage/` completo, `.env`, secretos coincidentes y repositorios de respaldo si se incluyen. No ejecutar `vault operator init`.

Vault usa almacenamiento **file**: `vault operator raft snapshot` no corresponde aquí. No copiar `/vault/file` en caliente. Las llaves de desbloqueo no sustituyen el contenido del volumen.

La copia física PostgreSQL necesita Docker Linux compatible, PostgreSQL **16** y arquitectura compatible. Para cambiar versión/arquitectura, usar restauración lógica en una DB nueva; no colocar estos archivos en otro motor.

Tras completar la copia, el operador puede reiniciar origen si corresponde. Si recibe nuevos cambios, destino solo conserva el corte anterior. Una sustitución real del servidor requiere corte final y evitar dos instancias activas divergentes.

### 5.3 Integridad y manifiesto

```powershell
Get-FileHash C:/traslado-evaluaciones/pgdata.tar.gz -Algorithm SHA256
Get-FileHash C:/traslado-evaluaciones/vaultdata.tar.gz -Algorithm SHA256
Get-FileHash C:/traslado-evaluaciones/postgres.dump -Algorithm SHA256
```

Comparar hashes en destino. Inventariar también storage/outputs con tamaños y hashes cuando se necesite integridad completa. Mantener el manifiesto privado: puede incluir nombres de estudiantes o archivos de exámenes.

| Dato del manifiesto | Completar al ejecutar |
|---|---|
| Corte | Fecha/hora, instancia, responsable y objetivo del traslado. |
| Código | SHA, rama y lista de cambios no confirmados incluidos. |
| Compatibilidad | Imagen real PostgreSQL y plataforma/arquitectura. |
| Datos | Archivos/carpetas, tamaños y hashes de DB, Vault y storage. |
| Secretos | Referencia a custodia segura, nunca sus valores. |
| Restic | Repositorios incluidos y referencia a su contraseña. |
| Trabajos pendientes | Drenados o tratamiento de recuperación documentado. |
| Validación | Resultado de restauración/pruebas; inicialmente pendiente. |

## 6. Preparar la otra PC

Instalar Git y Docker con Compose v2 y contenedores Linux. En Windows, Docker Desktop/WSL2 debe acceder al disco del proyecto. Prever espacio para imágenes, reconstrucción, datos y respaldo. Los Dockerfiles describen runtimes; no se necesita instalar Java/Node/Python en el host si se trabaja íntegramente con Docker.

- Elegir ruta real, por ejemplo `C:/proyectos/evaluaciones`; recuperar código/documentación y verificar SHA.
- Recuperar la `.env` privada de la instancia trasladada, no de otra instalación. Cambiar solo rutas/puertos necesarios; no claves de cifrado ni nombre Transit para «hacer que arranque».
- Revisar `BACKUP_LOCAL_PATH`, `BACKUP_EXTERNAL_PATH`, `BACKUP_RESTIC_PASSWORD_FILE`: las rutas antiguas pueden no existir.
- Comprobar acceso autorizado al gateway SEA. Que los datos locales abran no garantiza conectividad institucional.
- Mantener `-p evaluaciones` para los nombres de volumen del ejemplo. Si se cambia el nombre Compose, planificar los volúmenes. Hay nombres fijos de contenedor: no iniciar dos copias en un mismo host sin resolver nombres/puertos.

### 6.1 Restaurar solo en un destino nuevo

No iniciar servicios antes de recuperar los volúmenes de una instancia existente. Verificar que no existen los volúmenes de destino:

```powershell
docker volume inspect evaluaciones_pgdata
docker volume inspect evaluaciones_vaultdata
```

Si alguno existe, **detener este procedimiento y pedir revisión, no borrarlo**. Solo si ambos están ausentes en el host nuevo autorizado:

```powershell
docker volume create --label com.docker.compose.project=evaluaciones --label com.docker.compose.volume=pgdata evaluaciones_pgdata
docker volume create --label com.docker.compose.project=evaluaciones --label com.docker.compose.volume=vaultdata evaluaciones_vaultdata
docker run --rm --network none --mount type=volume,src=evaluaciones_pgdata,dst=/dest --mount type=bind,src=C:/traslado-evaluaciones,dst=/backup,readonly alpine:3.20 sh -c 'test -z "$(ls -A /dest)" && tar -C /dest -xzf /backup/pgdata.tar.gz'
docker run --rm --network none --mount type=volume,src=evaluaciones_vaultdata,dst=/dest --mount type=bind,src=C:/traslado-evaluaciones,dst=/backup,readonly alpine:3.20 sh -c 'test -z "$(ls -A /dest)" && tar -C /dest -xzf /backup/vaultdata.tar.gz'
```

Verificar cada salida, no continuar tras error. Esta DB conserva esquema e historial Flyway: **no importar además el dump lógico encima**. El dump es una alternativa, no otro paso de la restauración física.

Recuperar `storage` dentro del proyecto y las llaves en `vault/secrets/unseal-keys` antes de arrancar. Mantener propiedad/permisos de los volúmenes; los tar preservan metadatos. No desempaquetarlos/reempaquetarlos con un archivador de Windows.

### 6.2 Arranque controlado

```powershell
docker compose -p evaluaciones config --quiet
docker compose -p evaluaciones up -d --build db rabbitmq vault vault-bootstrap backend frontend worker-typst worker-omr
docker compose -p evaluaciones ps --all
docker compose -p evaluaciones logs --tail=80 vault-bootstrap backend worker-typst worker-omr
```

Omite worker-backup hasta verificar montajes/contraseña. Si se conservaron repositorios Restic, usar la contraseña existente, no generar otra. Cuando estén preparados:

```powershell
docker compose -p evaluaciones up -d --build worker-backup
docker compose -p evaluaciones ps --all
```

El bootstrap solo desbloquea un Vault inicializado con llaves coincidentes. Si queda sellado o rechaza tokens, revisar respaldo, llaves, vigencia y políticas. No reinicializar ni crear otra clave Transit. Si expiraron tokens, su reemplazo corresponde al administrador de Vault conservando el mismo almacén/políticas.

Para una instancia nueva deliberadamente vacía y sin bancos cifrados anteriores, usar la inicialización de la guía general en un entorno independiente. No mezclarla con esta recuperación.

## 7. Actualizar producción existente

Otra operación distinta del traslado de desarrollo. Conservar `.env`, Vault, llaves, DB, storage, Restic y HTTPS del servidor. Respaldar y revisar migraciones Flyway antes del cambio. Esta guía no ejecuta ni autoriza por sí sola una actualización.

Con cambios locales resueltos y commit aprobado/verificado en el remoto:

```bash
git status --short
git remote -v
git fetch --all --prune --tags
git checkout <COMMIT_APROBADO_Y_DISPONIBLE_EN_EL_REMOTO>
docker compose config --quiet
docker compose up -d --build
docker compose ps --all
```

No ejecutar el marcador entre `< >` literalmente. No sustituir `.env` por desarrollo. Resolver requisitos de worker-backup antes del `up` global si no estaba configurado.

- **Nunca `docker compose down -v`, `docker volume prune`, borrar volúmenes o reinicializar Vault.**
- Volver al commit anterior no revierte Flyway. Cualquier reversión exige revisar compatibilidad y respaldo.
- No recrear frontend una segunda vez sin motivo si `up --build` ya aplicó su imagen/configuración.
- Nginx interno y proxy institucional son capas diferentes; ambos deben admitir el tamaño de PDF. 413 indica tamaño; 502 requiere investigar upstream, red y servicios con logs de la misma hora.
- No publicar DB, RabbitMQ, Vault o backend directamente a Internet. Puertos locales de Compose no sustituyen firewall/HTTPS de producción.

## 8. Aceptación del traslado

- [ ] Commit, cambios y documentación coinciden con inventario.
- [ ] Hashes coinciden y storage/outputs están completos.
- [ ] Servicios requeridos operativos; chequeos definidos saludables; sin reinicios continuos.
- [ ] Vault desbloqueado y **un banco previo se descifra correctamente**; no basta un puerto abierto.
- [ ] Usuarios, roles, programación, notas y auditoría conservan datos/conteos del corte.
- [ ] Login y SEA funcionan con gestión/identidad correctas.
- [ ] PDF y OMR verificados sobre datos de prueba, sin modificar una evaluación real.
- [ ] Usuarios sin permiso no pueden ajustar respuestas ni anular preguntas.
- [ ] Restic verificado si está en alcance; Vault respaldado aparte bajo custodia.
- [ ] Excel de redacción y demás archivos de trabajo accesibles.
- [ ] Conservar origen y respaldos hasta aceptar la recuperación.

Esta revisión fue de código, configuración y estado local. No probó una restauración ni examinó el servidor institucional. Completar el checklist en destino antes de dar el traslado por concluido.
