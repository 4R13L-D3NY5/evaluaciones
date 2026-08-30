# Worker Typst - Sistema de Evaluaciones SEA/SISA

Worker Python que consume trabajos de generación de exámenes desde RabbitMQ, genera variantes (A/B/C) y cuadernillos individuales en Typst/PDF, y publica el resultado.

## Contrato

- **Cola entrada:** `evaluaciones.generacion.typst`
- **Cola salida:** `evaluaciones.generacion.resultado`
- **Mensaje solicitud:** `{jobId, rolExamenId, bancoPreguntasId, variantes:["A","B","C"], outputBasePath:"/app/storage/generados"}`
- **Mensaje resultado:** `{jobId, rolExamenId, estado:"COMPLETADO"|"ERROR", mensaje, variantes:[...], mapeos:[...]}`

## Variables de entorno

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `RABBITMQ_HOST` | `localhost` | Host de RabbitMQ |
| `RABBITMQ_PORT` | `5672` | Puerto AMQP |
| `RABBITMQ_USER` | `guest` | Usuario |
| `RABBITMQ_PASS` | `guest` | Contraseña |
| `RABBITMQ_QUEUE_IN` | `evaluaciones.generacion.typst` | Cola de entrada |
| `RABBITMQ_QUEUE_OUT` | `evaluaciones.generacion.resultado` | Cola de salida |
| `DB_HOST` | `localhost` | Host PostgreSQL |
| `DB_PORT` | `5432` | Puerto PostgreSQL |
| `DB_NAME` | `sea_evaluaciones` | Base de datos |
| `DB_USER` | `postgres` | Usuario PostgreSQL |
| `DB_PASSWORD` | `postgres` | Contraseña PostgreSQL |
| `LOGO_PATH` | `/app/bases/logo_unitepc_clean.png` | Logo UNITEPC para el PDF |
| `TYPST_BIN` | `` | Ruta opcional al binario `typst`; si está vacío usa el paquete Python |

## Ejecución local

```bash
# Instalar dependencias
python -m pip install -r requirements.txt

# Ejecutar worker conectado a RabbitMQ
python main.py

# Ejecutar prueba local sin RabbitMQ (lee reactivos de PostgreSQL)
python main.py --local-test
```

## Ejecución con Docker

El `docker-compose.yml` del proyecto espera el archivo `Dockerfile.typst`:

```bash
docker build -f Dockerfile.typst -t evaluaciones-typst-worker .
docker run --rm \
  -e RABBITMQ_HOST=rabbitmq \
  -e DB_HOST=postgres \
  -e DB_PASSWORD=postgres \
  -v $(pwd)/../bases:/app/bases:ro \
  -v $(pwd)/storage:/app/storage \
  evaluaciones-typst-worker
```

## Integración con docker-compose

El servicio `worker-typst` del `docker-compose.yml` debe recibir las variables de entorno de PostgreSQL (`DB_HOST=db`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) y montar el volumen con los recursos compartidos, por ejemplo:

```yaml
worker-typst:
  environment:
    RABBITMQ_HOST: rabbitmq
    DB_HOST: db
    DB_NAME: ${DB_NAME:-sea_evaluaciones}
    DB_USER: ${DB_USERNAME:-postgres}
    DB_PASSWORD: ${DB_PASSWORD:-postgres}
  volumes:
    - eval_storage:/app/storage
    - ./bases:/app/bases:ro
```

## Notas de implementación

- Lee los reactivos desde la tabla `sea_reactivos` filtrando por `banco_id`.
- Lee los estudiantes desde `sea_mapeo_estudiantes_variantes` filtrando por `rol_examen_id`. Si no existen estudiantes para el rol, genera un cuadernillo placeholder por variante para cumplir el contrato de salida.
- Aplica el algoritmo de selección `7F/16M/7D` (7 fáciles, 16 medios, 7 difíciles) y ordena por tipología.
- El motor Typst puede usar el binario definido en `TYPST_BIN` o el paquete Python `typst`.
- En caso de error siempre publica un mensaje de resultado con `estado: ERROR`.
