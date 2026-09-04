# Guía de despliegue del Sistema de Evaluaciones

Guía operativa para instalar, iniciar, actualizar, respaldar y recuperar el
Sistema de Evaluaciones SEA con Docker. Está escrita para el servidor de
producción y para el entorno Windows de desarrollo.

> Importante: esta guía contiene comandos para operar servicios y secretos.
> Nunca se deben copiar llaves de Vault, contraseñas, tokens, `JWT_SECRET` ni
> credenciales del SEA en Git, capturas, tickets, chats o archivos de log.

## 1. Arquitectura desplegada

El archivo `docker-compose.yml` levanta el conjunto completo:

| Servicio | Función | Persistencia / dependencia |
| --- | --- | --- |
| `db` | PostgreSQL 16 y datos del sistema | Volumen `pgdata` |
| `rabbitmq` | Colas de generación y OMR | Mensajería entre backend y workers |
| `vault` | Vault Transit para envolver las claves AES de los bancos | Volumen `vaultdata` |
| `vault-bootstrap` | Desbloqueo automático de Vault tras reinicios | Lee solo las llaves locales protegidas |
| `backend` | API Spring Boot, autenticación y reglas de negocio | Espera DB, RabbitMQ y Vault desbloqueado |
| `worker-typst` | Generación de exámenes y documentos | Espera backend, DB, RabbitMQ y Vault |
| `worker-omr` | Lectura OMR y procesamiento de cartillas | Espera backend, DB, RabbitMQ y Vault |
| `worker-backup` | Respaldos y restauración mediante Restic | Espera backend, DB, RabbitMQ y Vault; usa `backups/` y `backups-external/` |
| `frontend` | Interfaz Angular servida por Nginx | Espera backend saludable |

El flujo de inicio es:

```text
Docker Engine
  ├─ PostgreSQL saludable
  ├─ RabbitMQ saludable
  └─ Vault iniciado
       └─ vault-bootstrap desbloquea Vault
            └─ backend saludable
                 ├─ worker-typst
                 ├─ worker-omr
                 ├─ worker-backup
                 └─ frontend
```

Todos los servicios tienen `restart: unless-stopped`. Por lo tanto, Docker
los vuelve a iniciar después de una caída o reinicio del equipo, siempre que
no se hayan detenido manualmente con `docker compose down` o `docker compose
stop`.

## 2. Requisitos del servidor

### 2.1 Requisitos generales

- Docker Engine 24 o posterior.
- Docker Compose v2 (`docker compose`, no el comando antiguo
  `docker-compose`).
- Mínimo recomendado para producción: 4 CPU, 8 GB de RAM y 50 GB libres.
- SSD con respaldo externo para PostgreSQL, Vault y archivos generados.
- DNS o IP fija para el acceso de usuarios.
- Acceso saliente HTTPS al gateway oficial SEA/SISA, si el entorno lo requiere.
- Hora del servidor sincronizada mediante NTP.
- Para producción: un proxy inverso institucional con HTTPS y un certificado
  válido. La publicación directa de los puertos de desarrollo no es el diseño
  recomendado.

### 2.2 Windows de desarrollo

- Windows 10/11 actualizado.
- Docker Desktop con motor WSL2.
- Docker Desktop configurado para iniciar sesión automáticamente con Windows.
- PowerShell 5.1 o posterior.
- Puertos libres: 4200, 5432, 5672, 8080, 8200 y 15672.

### 2.3 Producción en Windows

Es posible ejecutar Docker Desktop, pero para un servidor institucional se
prefiere Docker Engine como servicio o una máquina Linux administrada. Si se
usa Windows, el usuario del servicio debe tener acceso a la carpeta del
proyecto y Docker Desktop debe iniciarse antes de ejecutar Compose.

## 3. Preparar el proyecto

Copie el proyecto completo al servidor en una ruta estable, por ejemplo:

```text
C:\Servicios\evaluaciones
```

En Linux, una ruta equivalente sería:

```text
/opt/evaluaciones
```

El código fuente se mantiene en el GitLab institucional compartido:

```text
https://git.unitepc.solutions/investigacion/sisa-evaluacion
```

El tercero debe contar con una cuenta institucional o un token de acceso con
permiso de lectura. No se debe compartir una contraseña personal ni crear una
copia pública del proyecto.

Si se entrega mediante GitLab, el tercero debe fijar explícitamente la versión
aprobada y no desplegar automáticamente la rama de trabajo:

```bash
git clone https://git.unitepc.solutions/investigacion/sisa-evaluacion.git /opt/evaluaciones
cd /opt/evaluaciones
git fetch --tags
git checkout <TAG_O_COMMIT_APROBADO>
```

La rama compartida `develop` puede utilizarse para validación cuando el equipo
lo autorice:

```bash
git clone --branch develop --single-branch https://git.unitepc.solutions/investigacion/sisa-evaluacion.git /opt/evaluaciones
```

Para producción se recomienda desplegar un tag o commit aprobado, dejando
registrado cuál fue la versión recibida desde GitLab.

En Windows, use la misma secuencia desde PowerShell y cambie la ruta por la
carpeta institucional definida para el servicio. Si se entrega como archivo
ZIP, registre igualmente el commit o versión que contiene.

### 3.1 Paquete que debe recibir el tercero

Entregue el proyecto desde una versión identificable (tag o commit aprobado),
junto con esta guía y el archivo `docker-compose.yml`. El paquete debe incluir
los fuentes de `evaluaciones-backend/`, `evaluaciones-frontend/`,
`evaluaciones-workers/`, `bases/`, `vault/` y `scripts/`, además de los archivos
de configuración versionados como `.env.example` y `nginx.conf`.

Entregue por un canal seguro y separado del código:

- los valores de producción del `.env` o el acceso al gestor de secretos;
- las credenciales OAuth del gateway institucional;
- los tokens técnicos de Vault, según la política aprobada;
- las llaves de desbloqueo de Vault, bajo custodia institucional;
- la contraseña de Restic y el destino de respaldos externos;
- el dominio, certificado HTTPS y reglas del proxy inverso.

No incluya en el ZIP o repositorio `.env`, `vault/secrets/`, `storage/`,
`backups/`, `backups-external/`, `node_modules/`, `target/`, logs ni bases de
datos de prueba. El tercero debe confirmar por escrito el commit desplegado y
los responsables de custodiar los secretos y respaldos.

La carpeta debe contener, como mínimo:

```text
docker-compose.yml
.env
evaluaciones-backend/
evaluaciones-frontend/
evaluaciones-workers/
bases/
storage/
vault/
```

No copie la carpeta `node_modules`, archivos de compilación temporales ni
respaldos de secretos al servidor de producción.

Las siguientes carpetas deben existir antes del primer `docker compose up`.
Las carpetas de datos pueden estar vacías, pero no deben apuntar a una ruta
temporal:

```text
bases/
storage/
backups/
backups-external/
vault/secrets/
```

`vault/secrets/unseal-keys` y `vault/secrets/restic-password` no vienen en Git
porque contienen secretos. Deben crearse manualmente antes del despliegue
completo. Si no se activa el módulo de respaldos, el servicio
`worker-backup` igualmente se inicia y necesita que el archivo de contraseña
exista para poder operar cuando se solicite un respaldo.

En Windows:

```powershell
New-Item -ItemType Directory -Force -Path .\bases, .\storage, .\backups, .\backups-external, .\vault\secrets
New-Item -ItemType File -Force -Path .\vault\secrets\unseal-keys, .\vault\secrets\restic-password
```

Después de crear los archivos, complételos con un editor protegido y aplique
los permisos descritos en la sección de Vault. No los complete con valores de
ejemplo.

En Linux:

```bash
mkdir -p bases storage backups backups-external vault/secrets
touch vault/secrets/unseal-keys vault/secrets/restic-password
chmod 600 vault/secrets/unseal-keys vault/secrets/restic-password
```

## 4. Configurar variables de entorno

Copie `.env.example` como `.env` y complete los valores del ambiente. En
Windows:

```powershell
Copy-Item .env.example .env
notepad .env
```

En Linux:

```bash
cp .env.example .env
nano .env
```

Debe configurar especialmente:

```dotenv
DB_NAME=sea_evaluaciones
DB_USERNAME=postgres
DB_PASSWORD=<contraseña-larga-y-unica>

RABBITMQ_USER=<usuario-no-predeterminado>
RABBITMQ_PASSWORD=<contraseña-larga-y-unica>

UNITEPC_GATEWAY_BASE_URL=<url-oficial-del-gateway>
UNITEPC_CLIENT_ID=<cliente-m2m>
UNITEPC_CLIENT_SECRET=<secreto-m2m>
UNITEPC_SYSTEM_CLIENT_ID=sea-evaluaciones

JWT_SECRET=<secreto-aleatorio-de-alta-entropia>

VAULT_BACKEND_TOKEN=<token-tecnico-con-politica-sea-backend>
VAULT_WORKER_TOKEN=<token-tecnico-con-politica-sea-worker>
VAULT_OMR_TOKEN=<token-tecnico-con-politica-sea-omr>
VAULT_TRANSIT_KEY_NAME=sea-banco-kek

BACKUP_LOCAL_PATH=./backups
BACKUP_EXTERNAL_PATH=./backups-external
BACKUP_RESTIC_PASSWORD_FILE=./vault/secrets/restic-password
```

`.env.example` es una plantilla de desarrollo, no una configuración de
producción. En producción se deben reemplazar, como mínimo, la URL de gateway
de desarrollo, el cliente y secreto OAuth, `DB_PASSWORD`, las credenciales de
RabbitMQ, `JWT_SECRET` y los tres tokens de Vault. No se deben dejar los
valores `postgres`, `guest` ni `cambia_este_*`.

`docker compose config` comprueba la sintaxis y la interpolación del archivo,
pero no puede saber si un secreto vacío o de ejemplo es válido. La revisión de
los valores obligatorios del `.env` es responsabilidad del operador antes de
iniciar los servicios. Nunca use `docker compose config` para mostrar la
configuración completa en un ticket o log, porque puede imprimir secretos.

Al ejecutar con este Compose, los servicios se comunican por la red interna de
Docker. Por eso `DB_HOST`, `RABBITMQ_HOST`, `VAULT_ADDR` y `STORAGE_BASE_PATH`
se reemplazan dentro de los contenedores por `db`, `rabbitmq`, `vault` y
`/app/storage`, respectivamente; no los cambie a la IP pública del servidor.
El frontend usa el proxy Nginx de `/api`, por lo que `API_BASE_URL` de la
plantilla no es necesario para la imagen de producción.

Reglas para `.env`:

1. No reutilizar contraseñas entre DB, RabbitMQ, JWT y SEA.
2. No usar `guest` en producción.
3. No incluir llaves de desbloqueo de Vault dentro de `.env`.
4. Restringir el archivo al usuario que ejecuta Docker.
5. Rotar los tokens técnicos si se sospecha exposición.

## 5. Vault y cifración

### 5.1 Qué protege Vault

Los bancos de preguntas y los patrones de variantes se cifran con AES-256-GCM.
La clave de datos se envuelve mediante Vault Transit. La clave maestra
institucional (`sea-banco-kek`) no debe exportarse ni guardarse en PostgreSQL,
RabbitMQ, la aplicación o los workers.

### 5.2 Inicialización inicial de un Vault nuevo

La inicialización se realiza una sola vez por custodios autorizados. No ejecute
estos pasos contra un Vault que ya esté inicializado.

1. Inicie únicamente los servicios base y Vault:

   ```bash
   docker compose up -d db rabbitmq vault
   ```

2. Compruebe el estado:

   ```bash
   docker compose exec vault sh -c 'VAULT_ADDR=http://127.0.0.1:8200 vault status'
   ```

3. Inicialice con cinco llaves y umbral de tres:

   ```bash
   docker compose exec vault sh -c 'VAULT_ADDR=http://127.0.0.1:8200 vault operator init -key-shares=5 -key-threshold=3'
   ```

4. Entregue cada llave de desbloqueo a custodios institucionales distintos.
   Conserve al menos tres custodias independientes. El token inicial de
   administración debe guardarse por separado y revocarse cuando se creen los
   tokens técnicos.

5. Desbloquee Vault con tres llaves distintas:

   ```bash
   docker compose exec vault sh -c 'VAULT_ADDR=http://127.0.0.1:8200 vault operator unseal <LLAVE_1>'
   docker compose exec vault sh -c 'VAULT_ADDR=http://127.0.0.1:8200 vault operator unseal <LLAVE_2>'
   docker compose exec vault sh -c 'VAULT_ADDR=http://127.0.0.1:8200 vault operator unseal <LLAVE_3>'
   ```

6. Habilite Transit y cree la clave no exportable:

   ```bash
   docker compose exec vault sh -c 'VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=<TOKEN_ADMIN> vault secrets enable transit'
   docker compose exec vault sh -c 'VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=<TOKEN_ADMIN> vault write -f transit/keys/sea-banco-kek type=aes256-gcm96 exportable=false allow_plaintext_backup=false deletion_allowed=false'
   ```

   Si Transit ya existe, el primer comando devolverá un aviso; no lo habilite
   nuevamente.

7. Aplique las políticas incluidas:

   ```bash
   docker compose exec vault sh -c 'VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=<TOKEN_ADMIN> vault policy write sea-backend /vault/policies/backend.hcl'
   docker compose exec vault sh -c 'VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=<TOKEN_ADMIN> vault policy write sea-worker /vault/policies/worker.hcl'
   docker compose exec vault sh -c 'VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=<TOKEN_ADMIN> vault policy write sea-omr /vault/policies/omr.hcl'
   ```

8. Cree un token técnico por servicio y registre cada resultado únicamente en
   el `.env` protegido:

   ```bash
   docker compose exec vault sh -c 'VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=<TOKEN_ADMIN> vault token create -policy=sea-backend'
   docker compose exec vault sh -c 'VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=<TOKEN_ADMIN> vault token create -policy=sea-worker'
   docker compose exec vault sh -c 'VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=<TOKEN_ADMIN> vault token create -policy=sea-omr'
   ```

9. Revise las políticas y revoque el token administrativo inicial cuando exista
   un procedimiento institucional alternativo para administración de Vault.

Los tokens técnicos deben ser independientes por servicio y contar con una
política de expiración/renovación definida por la institución. Documente el
procedimiento de rotación antes de revocar un token en uso: actualice primero
el `.env`, reinicie el servicio correspondiente y valide su operación.

### 5.3 Activar el desbloqueo automático local

El servicio `vault-bootstrap` no inicializa Vault, no crea una nueva clave y no
borra datos. Solo intenta desbloquear un Vault ya inicializado y sellado.

Cree el archivo:

```text
vault/secrets/unseal-keys
```

Contenido esperado, sin encabezados ni comillas:

```text
<LLAVE_DE_DESBLOQUEO_1>
<LLAVE_DE_DESBLOQUEO_2>
<LLAVE_DE_DESBLOQUEO_3>
```

En Windows, restrinja el archivo al usuario que administra Docker:

```powershell
icacls .\vault\secrets\unseal-keys /inheritance:r
icacls .\vault\secrets\unseal-keys /grant:r "$env:USERNAME:(R)"
```

En Linux:

```bash
chmod 600 vault/secrets/unseal-keys
```

Este mecanismo permite una recuperación automática, pero concentra en el mismo
servidor el material necesario para abrir Vault. Para producción se recomienda
auto-unseal con KMS/HSM externo, donde las llaves no residan junto al servidor
de aplicaciones.

## 6. Primer despliegue completo

Si el servidor ya contiene los volúmenes `pgdata` o `vaultdata`, trátelo como
una instalación existente: no vuelva a ejecutar `vault operator init`, no
borre los volúmenes y confirme primero que las llaves corresponden a ese
Vault. En una instalación nueva, complete la inicialización de Vault de la
sección 5 antes de continuar.

La creación del esquema inicial de PostgreSQL mediante el archivo montado de
Flyway solo ocurre cuando el volumen de PostgreSQL es nuevo. En instalaciones
existentes, el backend aplica únicamente las migraciones pendientes al
arrancar; revise siempre `flyway_schema_history` y los logs del backend.

Después de configurar `.env`, Vault, Transit, políticas, tokens y
`vault/secrets/unseal-keys`:

```bash
docker compose config
docker compose up -d --build
```

`docker compose config` debe terminar sin errores de sintaxis. Recuerde que
esta comprobación no valida la presencia, calidad
ni la vigencia de los secretos. El comando `up -d --build` construye backend,
frontend y todos los workers, incluido `worker-backup`, cuando sea necesario y
deja los servicios en segundo plano.

Compruebe el estado:

```bash
docker compose ps
docker compose exec vault sh -c 'VAULT_ADDR=http://127.0.0.1:8200 vault status'
```

El resultado esperado es:

- DB: `healthy`.
- RabbitMQ: `healthy`.
- Vault: inicializado y `Sealed: false`.
- `vault-bootstrap`: `healthy`.
- Backend: `healthy`.
- Frontend: ejecutándose.
- `worker-typst`, `worker-omr` y `worker-backup`: ejecutándose y conectados a
  sus respectivas colas.

Verifique también que el frontend responda desde el host:

```bash
curl -f http://127.0.0.1:${FRONTEND_PORT:-4200}/
```

En Windows:

```powershell
Invoke-WebRequest http://127.0.0.1:4200/ -UseBasicParsing
```

El endpoint de salud del backend puede estar protegido y devolver `403` desde
fuera; para esta comprobación use el estado `healthy` de `docker compose ps` y
los logs del backend, no una URL pública inventada.

### 6.1 Usuario inicial y carga de usuarios operativos

En una base de datos nueva, las migraciones crean los roles del sistema y una
única cuenta local inicial con rol `ADMINISTRADOR_SISTEMA`. La credencial
temporal debe entregarse por un canal seguro y cambiarse inmediatamente en el
primer ingreso; no se documenta ni se envía dentro del paquete de despliegue.

El despliegue no crea automáticamente cuentas de docentes, directores de
carrera, vicerrectores, responsables ni personal de evaluaciones. Después del
primer ingreso del administrador:

1. Cambie la contraseña temporal.
2. Cree los usuarios institucionales desde **Usuarios y accesos** o importe
   la plantilla autorizada.
3. Asigne el rol correspondiente y sus sedes, carreras, asignaciones o campus.
4. Para el personal de evaluaciones, revise además qué campus quedan
   **Habilitados**.
5. Haga que cada usuario cambie su contraseña temporal en su primer ingreso.

Si el servidor ya tenía el volumen `pgdata`, no se vuelve a crear ni reemplazar
la cuenta inicial: se conservan los usuarios y datos existentes. Nunca borre
ese volumen para “reiniciar” las cuentas.

URLs habituales:

```text
Frontend:  http://<servidor>:4200
Backend:   http://<servidor>:8080
RabbitMQ:  http://<servidor>:15672   (no exponer públicamente en producción)
Vault:     solo localhost:8200
```

## 7. Arranque normal y contingencia

### 7.1 Arranque manual del conjunto

```bash
docker compose up -d
```

No use `docker compose down -v`. La opción `-v` elimina volúmenes y puede
destruir PostgreSQL y Vault.

### 7.2 Qué ocurre después de reiniciar Docker

1. Docker reinicia los contenedores marcados como `unless-stopped`.
2. PostgreSQL y RabbitMQ realizan sus comprobaciones de salud.
3. Vault inicia con su volumen persistente.
4. `vault-bootstrap` detecta si Vault está sellado y aplica las llaves locales.
5. Backend espera a que `vault-bootstrap` esté saludable.
6. Los workers esperan al backend, RabbitMQ, DB y Vault desbloqueado.
7. Frontend espera al backend saludable.

### 7.3 Diagnóstico de una contingencia

```bash
docker compose ps
docker compose logs --tail=100 vault
docker compose logs --tail=100 vault-bootstrap
docker compose logs --tail=100 backend
docker compose logs --tail=100 worker-typst
docker compose logs --tail=100 worker-omr
docker compose logs --tail=100 worker-backup
```

Si `vault-bootstrap` indica que faltan llaves, no intente reinicializar Vault.
Restaure el archivo `vault/secrets/unseal-keys` desde la custodia institucional
y vuelva a ejecutar:

```bash
docker compose up -d
```

Si el archivo existe pero Vault no se desbloquea, detenga la investigación y
verifique con los custodios que las llaves correspondan al volumen `vaultdata`.
No elimine el volumen para “probar”.

## 8. Arranque automático en Windows de desarrollo

El proyecto incluye:

```text
scripts/iniciar-evaluaciones.ps1
```

El script inicia Docker Desktop si no está disponible, espera al motor Docker y
ejecuta `docker compose up -d` desde la carpeta correcta.

Para probarlo manualmente:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
.\scripts\iniciar-evaluaciones.ps1
```

Para iniciarlo con cada sesión de Windows:

1. Abra **Programador de tareas**.
2. Cree una tarea básica llamada `Sistema de Evaluaciones - Docker`.
3. Seleccione **Al iniciar sesión** como desencadenador.
4. Configure como programa `powershell.exe`.
5. Use como argumentos:

   ```text
   -NoProfile -ExecutionPolicy Bypass -File "C:\Servicios\evaluaciones\scripts\iniciar-evaluaciones.ps1"
   ```

6. Marque **Ejecutar solo cuando el usuario haya iniciado sesión** si se utiliza
   Docker Desktop; Docker Desktop necesita la sesión del usuario.
7. Pruebe la tarea con clic derecho → **Ejecutar**.

Antes de probar un reinicio automático, confirme que `unseal-keys` contiene las
llaves correctas. Si no existe, el sistema se detendrá de forma segura esperando
Vault y no procesará bancos cifrados.

## 9. Actualizaciones

### 9.1 Actualización de código sin destruir datos

```bash
git pull
docker compose build backend frontend worker-typst worker-omr worker-backup
docker compose up -d
docker compose ps
```

En producción, actualice desde una versión o tag aprobado y conserve el
`.env`, `vault/secrets/`, `storage/`, `backups/` y `backups-external/` fuera del
proceso de actualización. Antes de aplicar una versión con migraciones,
realice el respaldo indicado en la siguiente sección.

Si se cambió únicamente el frontend, basta con construir `frontend` y volver a
levantarlo. Si se modificó el backend, espere a que vuelva a estar saludable
antes de probar la interfaz.

### 9.2 Migraciones de base de datos

Las migraciones Flyway se ejecutan al arrancar el backend. Antes de una versión
que cambie el modelo:

1. Realice un respaldo de PostgreSQL.
2. Anote la versión desplegada.
3. Actualice el backend.
4. Revise los logs y `flyway_schema_history`.
5. Pruebe autenticación, carga de banco, generación y OMR.

## 10. Respaldos y restauración

### 10.1 PostgreSQL

Respaldo:

```bash
docker compose exec -T db pg_dump -U <DB_USERNAME> -d <DB_NAME> -Fc > sea_evaluaciones_$(date +%Y%m%d).dump
```

En PowerShell:

```powershell
$fecha = Get-Date -Format yyyyMMdd
$dbUser = "<DB_USERNAME>"
$dbName = "<DB_NAME>"
docker compose exec -T db pg_dump -U $dbUser -d $dbName -Fc > ".\backups\sea_evaluaciones_$fecha.dump"
```

Reemplace los dos marcadores por los valores reales del `.env`; no suponga que
el servidor de producción usa `postgres` o `sea_evaluaciones`.

Restauración controlada:

```bash
cat sea_evaluaciones_YYYYMMDD.dump | docker compose exec -T db pg_restore -U <DB_USERNAME> -d <DB_NAME> --clean --if-exists
```

La restauración debe ejecutarse en una ventana autorizada y con el backend
detenido para evitar escrituras simultáneas.

### 10.2 Vault

Para producción, respalde Vault mediante el mecanismo oficial de snapshots de
su backend de almacenamiento y conserve las llaves de desbloqueo en una
custodia independiente. No copie manualmente archivos internos de `vaultdata`
como sustituto de un respaldo consistente.

### 10.3 Archivos generados

Respalde periódicamente la carpeta `storage/`, especialmente si los exámenes,
cartillas o archivos de conciliación deben conservarse para auditoría.

### 10.4 Regla de copias

Mantenga al menos tres copias, en dos medios diferentes y una fuera del
servidor. Pruebe la restauración periódicamente; un respaldo que nunca se ha
restaurado no está verificado.

## 11. Seguridad de red

- Publique el frontend detrás de HTTPS y un proxy institucional.
- No publique PostgreSQL, RabbitMQ Management ni Vault a Internet.
- Vault ya está limitado a `127.0.0.1` en el host; mantenga esa restricción.
- Permita el acceso al backend solo desde el frontend o el proxy autorizado.
- Cambie los secretos de ejemplo antes de producción.
- Use cuentas técnicas separadas para backend, worker Typst y worker OMR.
- Revise periódicamente logs de autenticación, auditoría y operaciones sensibles.
- No active `KMS_ROTATION_ENABLED` sin respaldo, ventana de mantenimiento y
  validación de descifrado.

El Compose incluido publica algunos puertos para facilitar el desarrollo
(`5432`, `5672`, `15672`, `8080` y `4200`). Antes de exponer el servidor a una
red institucional, aplique reglas de firewall para bloquear desde redes no
autorizadas los puertos de DB, RabbitMQ, backend y administración; publique
solo el frontend a través del proxy HTTPS. Si el equipo de infraestructura
necesita cambiar los mapeos, debe mantener los nombres internos `db`,
`rabbitmq`, `vault` y `backend`, porque son los que usan los contenedores.

## 12. Errores frecuentes

### Backend no inicia

Revise, en este orden:

```bash
docker compose ps
docker compose logs --tail=150 vault-bootstrap
docker compose logs --tail=150 backend
```

Las causas habituales son Vault sellado, token técnico inválido, PostgreSQL no
saludable o variables ausentes en `.env`.

### Workers aparecen detenidos

```bash
docker compose logs --tail=150 worker-typst
docker compose logs --tail=150 worker-omr
```

Verifique que RabbitMQ esté saludable y que cada worker utilice el token de
Vault correcto. Los workers tienen reconexión ante una caída temporal del
broker.

### `worker-backup` no aparece en `docker compose ps`

Confirme primero que exista el archivo configurado en
`BACKUP_RESTIC_PASSWORD_FILE` y que sea un archivo legible, no una carpeta:

```powershell
Get-Item .\vault\secrets\restic-password | Select-Object FullName,Length,PSIsContainer
docker compose up -d --build worker-backup
docker compose logs --tail=150 worker-backup
```

En Linux:

```bash
test -f vault/secrets/restic-password && test -r vault/secrets/restic-password
docker compose up -d --build worker-backup
docker compose logs --tail=150 worker-backup
```

Si el archivo no existe, créelo con una contraseña de Restic nueva y segura;
no use una contraseña vacía ni la de PostgreSQL. Si el servicio fue agregado
después de la última actualización, `docker compose up -d` debe ejecutarse de
nuevo para crear el contenedor.

### Vault aparece sellado

No borre `vaultdata`. Verifique que `vault/secrets/unseal-keys` tenga tres
llaves distintas de la misma inicialización y que el custodio confirme su
validez. Después:

```bash
docker compose up -d vault vault-bootstrap
docker compose logs -f vault-bootstrap
```

### El frontend muestra una versión anterior

```bash
docker compose build frontend
docker compose up -d frontend
```

Luego recargue el navegador con `Ctrl + F5`.

## 13. Operaciones que no deben ejecutarse en producción

No ejecutar sin autorización y respaldo verificado:

```bash
docker compose down -v
docker volume rm evaluaciones_pgdata evaluaciones_vaultdata
docker system prune --volumes
vault operator init
```

Las primeras tres pueden eliminar datos; `vault operator init` no debe
ejecutarse contra un Vault ya inicializado.

## 14. Lista de aceptación antes de entregar producción

- [ ] `.env` contiene secretos únicos y no está versionado.
- [ ] Vault está inicializado, Transit habilitado y `sea-banco-kek` existe.
- [ ] Las políticas de backend, worker y OMR fueron aplicadas.
- [ ] Los tokens técnicos funcionan y no se usa el token raíz en los servicios.
- [ ] Las llaves de desbloqueo tienen custodia institucional independiente.
- [ ] `vault-bootstrap` desbloquea Vault después de un reinicio controlado.
- [ ] DB, RabbitMQ, backend y frontend aparecen saludables o ejecutándose.
- [ ] Worker Typst escucha `evaluaciones.generacion.typst`.
- [ ] Worker OMR escucha `evaluaciones.omr.procesar`.
- [ ] Worker de respaldos escucha `evaluaciones.backups` y puede escribir en
      `backups/` y `backups-external/`.
- [ ] Se probó login, banco cifrado, generación, lectura OMR y descarga.
- [ ] Se realizó un respaldo de PostgreSQL, Vault y `storage/`.
- [ ] Se probó al menos una restauración en un ambiente separado.
- [ ] Docker inicia automáticamente según la política del servidor.
- [ ] Existe un responsable de guardia y un procedimiento de recuperación.
## 15. Respaldos administrables de base de datos y archivos

El sistema incorpora el módulo administrativo **Respaldos y contingencia**. Está disponible únicamente para `ADMINISTRADOR_SISTEMA` y permite generar, copiar, verificar, conservar, eliminar localmente y restaurar snapshots cifrados.

### 15.1 Qué se respalda y dónde se almacena

| Contenido | Ubicación de origen | Incluido |
|---|---|---|
| Base PostgreSQL completa | Servicio `db` | Sí, como `pg_dump` lógico en formato custom |
| Exámenes, cartillas y documentos | `storage/generados` | Sí |
| Escaneos y resultados OMR | `storage/omr` | Sí |
| Imágenes materializadas | Dentro de `storage` | Sí |
| Imágenes originales de preguntas | Banco cifrado en PostgreSQL | Sí, a través del dump de la base |
| Manifiesto e integridad | Cada snapshot | Sí |
| `.env`, tokens y contraseñas | Configuración del servidor | No |
| Llaves de desbloqueo y secretos de Vault | `vaultdata`/secreto técnico | No |

En Docker, `storage` se monta como `/app/storage`, el repositorio local como `/app/backups` y la carpeta externa como `/app/backups-external`. PostgreSQL conserva sus datos en el volumen Docker `pgdata`; Vault conserva su estado en `vaultdata`.

Restic guarda snapshots deduplicados. Cada ejecución genera el dump lógico completo, pero el repositorio solo almacena bloques nuevos o modificados. Por eso cada snapshot permite recuperación completa sin duplicar todo el contenido.

### 15.2 Preparación inicial del servidor

1. Crear las carpetas persistentes junto al archivo `docker-compose.yml`:

   ```text
   backups/
   backups-external/
   ```

2. Definir en `.env` el destino externo. Puede ser una carpeta local, un disco montado o una ruta compartida que Docker pueda montar:

   ```dotenv
   BACKUP_EXTERNAL_PATH=./backups-external
   BACKUP_LOCAL_PATH=./backups
   BACKUP_RESTIC_PASSWORD_FILE=./vault/secrets/restic-password
   ```

   En Windows se puede usar una ruta absoluta, por ejemplo `D:/SEA/respaldos-externos`. La ruta se configura durante el despliegue; no se acepta una ruta arbitraria desde la interfaz.

3. Crear el archivo `vault/secrets/restic-password` con una contraseña larga y aleatoria. No debe enviarse por el chat, incluirse en Git ni guardarse en PostgreSQL. En producción se recomienda administrar este archivo mediante Docker Secrets o el almacén seguro del servidor.

4. Restringir los permisos del archivo de contraseña para que solo el usuario que ejecuta Docker pueda leerlo.

5. Verificar que el volumen externo tenga espacio suficiente y que el usuario de Docker pueda escribir en él.

6. No borrar `pgdata`, `vaultdata`, `storage`, `backups` ni `backups-external` durante un reinicio normal.

### 15.3 Puesta en marcha

Desde la carpeta del proyecto:

```text
docker compose config --quiet
docker compose build worker-backup
docker compose up -d
docker compose ps
```

El servicio `worker-backup` tiene `restart: unless-stopped`, espera a PostgreSQL, RabbitMQ, backend y Vault disponibles, y vuelve a conectarse si RabbitMQ o el servidor se reinician.

El primer respaldo inicializa automáticamente los repositorios Restic local y externo. Si el destino externo no está disponible, el respaldo local puede quedar generado, pero la copia no se marcará como verificada y nunca se eliminará localmente.

### 15.4 Programación y retención

En **Respaldos y contingencia** se puede activar o desactivar la ejecución automática, definir la frecuencia en minutos y establecer los días de retención. Los valores deben ser mayores que cero.

El programador revisa la configuración cada minuto. No crea otro snapshot mientras existe una operación activa. La limpieza local usa la retención definida en el sistema y no elimina copias externas verificadas.

### 15.5 Flujo operativo recomendado

1. Seleccionar **Generar respaldo ahora** o activar la programación.
2. Esperar el estado `Generado`.
3. Seleccionar **Copiar al destino externo**.
4. Esperar el estado `Copiado`.
5. Seleccionar **Verificar integridad** y esperar `Verificado`.
6. Solo después de `Verificado` se habilita **Eliminar copia local**.
7. Conservar al menos una copia externa verificada fuera del servidor principal.

Los estados `Solicitado`, `En proceso`, `Copiando`, `Verificando` y `Restaurando` indican que la operación sigue en curso. Si aparece `Error`, revisar el log del worker y corregir el problema antes de reintentar desde el módulo.

### 15.6 Restauración controlada

La restauración está restringida al administrador y solo acepta un snapshot externo verificado.

1. Seleccionar **Restaurar respaldo**.
2. Confirmar la advertencia inicial.
3. Escribir manualmente `RESTAURAR <identificador>`; por ejemplo `RESTAURAR BKP-...`.
4. Confirmar la segunda advertencia.
5. El worker restaura el dump PostgreSQL y los archivos de `storage`.
6. El worker verifica el repositorio Restic, valida los hashes del manifiesto, confirma que la migración de respaldos esté aplicada y comprueba que exista un administrador activo.
7. Revisar los logs de backend, workers, PostgreSQL y Vault antes de habilitar la operación normal.

Durante la restauración el sistema debe considerarse en mantenimiento. No iniciar cargas, generaciones, lecturas OMR ni cambios de configuración desde otros usuarios. Si la restauración falla, el respaldo original externo permanece intacto y el registro queda auditado con estado `Error`.

### 15.7 Vault y recuperación de bancos cifrados

El módulo de respaldos no reemplaza el respaldo técnico de Vault. Restaurar PostgreSQL y `storage` no permite descifrar bancos de preguntas si se perdió el estado de Vault o su material de desbloqueo.

También deben conservarse, por un procedimiento independiente y seguro:

- Snapshot o copia del volumen `vaultdata`.
- Las llaves de desbloqueo de Vault.
- La clave Transit `sea-banco-kek`.
- Las políticas y tokens técnicos necesarios.
- El registro de qué versión de Vault estaba activa.

Después de levantar Vault se debe comprobar que esté inicializado y desbloqueado, restaurar sus políticas y validar la clave Transit antes de arrancar backend y workers. Nunca se deben introducir llaves de Vault en la interfaz de respaldos ni en la base de datos.

### 15.8 Contingencias frecuentes

| Situación | Comportamiento esperado |
|---|---|
| PostgreSQL no disponible | El worker reintenta al recuperar la conexión; no genera un respaldo incompleto |
| RabbitMQ no disponible | El worker vuelve a conectarse; las solicitudes permanecen en la cola durable |
| Vault sellado o sin secreto | Backend y workers no deben operar con bancos cifrados; primero se desbloquea Vault |
| Destino externo caído | Se conserva la copia local y no se habilita su eliminación |
| Disco local lleno | La operación queda en error; no se presenta como respaldo válido |
| Reinicio de Docker | Los repositorios y datos permanecen en sus carpetas/volúmenes; los servicios vuelven a iniciar |
| Restauración incompleta | Se conserva el snapshot externo y debe intervenir el administrador técnico |

### 15.9 Auditoría y comprobaciones

Cada cambio de configuración y cada solicitud de generación, copia, verificación, eliminación o restauración se registra en `sea_auditoria_respaldos`. El historial del módulo conserva fechas, estado, snapshots, tamaño, cantidad de archivos y errores sin incluir contraseñas ni contenido sensible.

Para una prueba controlada:

1. Crear un respaldo manual.
2. Confirmar que incluya la base, un PDF generado, un escaneo OMR y un archivo de imagen.
3. Modificar o agregar un archivo y ejecutar un segundo respaldo.
4. Comparar el tamaño del repositorio y confirmar deduplicación.
5. Copiar y verificar ambos snapshots en el destino externo.
6. Intentar eliminar una copia no verificada y confirmar que la interfaz la bloquee.
7. Restaurar únicamente en una ventana de contingencia autorizada.
8. Reiniciar Docker y confirmar que el historial y los repositorios continúen disponibles.
