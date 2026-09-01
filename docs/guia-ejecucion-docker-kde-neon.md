# Guía de ejecución con Docker en KDE neon

Esta guía permite ejecutar el sistema de evaluaciones en KDE neon usando Docker Compose.

## 1. Requisitos del equipo

KDE neon está basado en Ubuntu. Instala Git, certificados y Docker Engine con el complemento de Compose:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git openssl

sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

. /etc/os-release
DOCKER_CODENAME="${UBUNTU_CODENAME:-$VERSION_CODENAME}"
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${DOCKER_CODENAME} stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
```

Cierra la sesión y vuelve a entrar, o ejecuta `newgrp docker`. Verifica:

```bash
docker --version
docker compose version
docker run --rm hello-world
```

## 2. Descargar el repositorio

```bash
mkdir -p ~/proyectos
cd ~/proyectos
git clone https://github.com/4R13L-D3NY5/evaluaciones.git
cd evaluaciones
```

## 3. Preparar las variables locales

No uses credenciales copiadas del repositorio público. Crea tu archivo local:

```bash
cp .env.example .env
chmod 600 .env
nano .env
```

Como mínimo, revisa estos valores:

```dotenv
DB_NAME=sea_evaluaciones
DB_USERNAME=postgres
DB_PASSWORD=pon_una_clave_segura

JWT_SECRET=pon_una_cadena_aleatoria_de_64_caracteres_o_mas

UNITEPC_GATEWAY_BASE_URL=https://gw-dev.unitepc.solutions
UNITEPC_CLIENT_ID=tu_client_id_del_gateway
UNITEPC_CLIENT_SECRET=tu_client_secret_del_gateway
UNITEPC_SYSTEM_CLIENT_ID=sea-evaluaciones

RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

FRONTEND_PORT=4200
SERVER_PORT=8080
```

Genera un secreto JWT sin inventarlo manualmente:

```bash
openssl rand -hex 48
```

El acceso al gateway institucional es necesario para consultar los datos oficiales del SEA. Si no se tienen `UNITEPC_CLIENT_ID` y `UNITEPC_CLIENT_SECRET` válidos, el sistema puede levantar, pero las consultas al servicio institucional fallarán.

En Docker no uses rutas de Windows como `C:/laragon/...`; el Compose monta el almacenamiento en `/app/storage` dentro de los contenedores.

## 4. Construir y levantar todos los servicios

Desde la carpeta raíz del repositorio:

```bash
docker compose config
docker compose up -d --build
```

La primera construcción puede tardar porque prepara el backend Java, el frontend, Typst y el procesador OMR.

Servicios levantados:

| Servicio | Función | Acceso local |
|---|---|---|
| `frontend` | Interfaz web | http://localhost:4200 |
| `backend` | API y autenticación | http://localhost:8080 |
| `db` | PostgreSQL | puerto 5432 |
| `rabbitmq` | Cola de trabajos | http://localhost:15672 |
| `worker-typst` | Generación de documentos | interno |
| `worker-omr` | Lectura/calificación OMR | interno |

Para usar el sistema, abre:

```text
http://localhost:4200
```

El usuario inicial de desarrollo es `admin` con contraseña `Admin123!`, creada por las migraciones. Cámbiala inmediatamente y no uses esa contraseña en un servidor compartido.

## 5. Comprobar el estado

```bash
docker compose ps
docker compose logs --tail=100 backend
docker compose logs --tail=100 worker-typst worker-omr
curl -I http://localhost:4200
```

Todos los contenedores principales deberían aparecer como `running` o `healthy`. Las migraciones de PostgreSQL se aplican automáticamente cuando inicia el backend.

RabbitMQ puede revisarse en http://localhost:15672 usando las credenciales configuradas en `.env`.

## 6. Operación diaria

Ver logs en tiempo real:

```bash
docker compose logs -f backend
```

Reiniciar sin reconstruir:

```bash
docker compose restart
```

Actualizar el código y reconstruir:

```bash
git pull --ff-only
docker compose up -d --build
```

Detener los servicios conservando la base de datos:

```bash
docker compose stop
```

Para volver a iniciarlos:

```bash
docker compose start
```

No ejecutes `docker compose down -v` salvo que quieras borrar el volumen `pgdata` y perder la base de datos local.

## 7. Problemas frecuentes

### Docker indica permiso denegado

```bash
newgrp docker
docker compose ps
```

### Un puerto ya está ocupado

Edita `.env`, por ejemplo:

```dotenv
FRONTEND_PORT=4300
SERVER_PORT=8081
```

Luego reconstruye:

```bash
docker compose up -d --build
```

### El backend se reinicia o no consulta el SEA

```bash
docker compose logs --tail=200 backend
```

Revisa la URL del gateway, el `client id`, el `client secret` y la conectividad a Internet.

### Los documentos o el OMR no se procesan

```bash
docker compose logs --tail=200 worker-typst worker-omr rabbitmq
docker compose restart worker-typst worker-omr
```

### La interfaz no muestra cambios después de actualizar

```bash
docker compose up -d --build frontend
```

Después, recarga el navegador con `Ctrl+F5`.

## 8. Respaldo básico de la base de datos

Con el usuario configurado en `.env`:

```bash
docker compose exec -T db pg_dump -U postgres -d sea_evaluaciones > backup_$(date +%F).sql
```

Guarda el respaldo fuera del repositorio. No lo publiques junto con el código.

## 9. Advertencia de seguridad del repositorio público

El repositorio actual contiene un archivo `.env` versionado. Antes de compartirlo o desplegarlo, ese archivo debe dejar de estar versionado y se deben cambiar todas las credenciales que hayan sido expuestas, especialmente las del gateway institucional, JWT, PostgreSQL y RabbitMQ. El archivo local `.env` debe permanecer fuera del repositorio público.

