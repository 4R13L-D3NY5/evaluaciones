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
```

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

Después de configurar `.env`, Vault, Transit, políticas, tokens y
`vault/secrets/unseal-keys`:

```bash
docker compose config
docker compose up -d --build
```

`docker compose config` debe terminar sin errores de sintaxis ni variables
obligatorias ausentes. El comando `up -d --build` construye backend, frontend y
workers cuando sea necesario y deja los servicios en segundo plano.

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
- Workers: ejecutándose y escuchando sus respectivas colas.

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
docker compose build backend frontend worker-typst worker-omr
docker compose up -d
docker compose ps
```

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
docker compose exec -T db pg_dump -U postgres -d sea_evaluaciones -Fc > ".\backups\sea_evaluaciones_$fecha.dump"
```

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
- [ ] Se probó login, banco cifrado, generación, lectura OMR y descarga.
- [ ] Se realizó un respaldo de PostgreSQL, Vault y `storage/`.
- [ ] Se probó al menos una restauración en un ambiente separado.
- [ ] Docker inicia automáticamente según la política del servidor.
- [ ] Existe un responsable de guardia y un procedimiento de recuperación.
