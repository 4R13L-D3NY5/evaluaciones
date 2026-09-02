# ESPECIFICACIÓN TÉCNICA — SISTEMA DE EVALUACIONES SEA/XPERTIFLOW
## Estado al corte: Fase 4 en cierre (agosto 2026)

Documento para continuar el desarrollo en otro equipo. Incluye arquitectura, stack, estado actual, bugs conocidos y próximos pasos.

---

## 1. VISIÓN GENERAL

El **Sistema de Evaluaciones (SEA / SISA)** automatiza el ciclo completo de exámenes presenciales de UNITEPC:

```
PROGRAMADO → VALIDADO → GENERADO → IMPRESO → ENTREGADO → DEVUELTO → PENDIENTE_NOTAS → CALIFICADO
```

Actualmente el backend Spring Boot + frontend Angular + worker Python Typst ya generan exámenes reales en PDF a partir de un banco de preguntas Excel de 60 reactivos.

**Rama / carpeta de trabajo:**

```
C:/laragon/www/evaluaciones/
```

---

## 2. STACK TECNOLÓGICO

| Capa | Tecnología | Versión | Ubicación |
|------|-----------|---------|-----------|
| Frontend SPA | Angular (standalone, signals, TailwindCSS, PrimeNG icons) | 17+ | `evaluaciones-frontend/` |
| Backend API | Spring Boot | 3.3.2 (Java 21) | `evaluaciones-backend/` |
| Base de datos | PostgreSQL | 16.x | Docker / localhost:5432 — base `sea_evaluaciones` |
| Cola de mensajes | RabbitMQ | 3.x | Docker / localhost:5672 |
| Motor de diagramación | Typst (binario CLI) | 0.15 | `typst.exe` en raíz |
| Worker de generación | Python | 3.10+ | `evaluaciones-workers/` |
| Motor OMR (pendiente) | Python + OpenCV | 4.x | `bases/procesar_omr.py` (Fase 5) |
| Infraestructura local | Laragon + Docker Desktop | — | Windows 10/11 |

---

## 3. ESTRUCTURA DEL PROYECTO

```
C:/laragon/www/evaluaciones/
├── .env                              # Variables de entorno compartidas
├── .tools/                           # JDK 21 + Maven 3.9.8 (auto-descargados)
├── typst.exe                         # Binario Typst v0.15
├── backend.log                       # Log del backend Spring Boot
├── docker-compose.yml                # PostgreSQL + RabbitMQ
├── evaluaciones-backend/             # Spring Boot API
│   ├── src/main/java/...             # Código Java
│   ├── src/main/resources/
│   │   ├── application.yml           # Configuración BD, RabbitMQ, storage
│   │   └── db/migration/V1__init_schema.sql
│   └── pom.xml
├── evaluaciones-frontend/            # Angular SPA
│   ├── src/app/
│   │   ├── pages/
│   │   │   ├── banco-preguntas/      # Carga/validación Excel (sin generación Typst)
│   │   │   ├── evaluaciones-dia/     # Lista de evaluaciones + generación real
│   │   │   ├── calificacion-omr/     # Fase 5 (pendiente)
│   │   │   └── ...
│   │   └── core/services/
│   └── package.json
├── evaluaciones-workers/             # Worker Python Typst
│   ├── main.py
│   ├── src/
│   │   ├── config.py
│   │   ├── db.py
│   │   ├── generator.py              # Genera variantes y cuadernillos
│   │   ├── messaging.py              # RabbitMQ consumer/publisher
│   │   └── orchestrator.py
│   └── requirements.txt
├── bases/                            # Assets y scripts
│   ├── logo_unitepc_clean.png
│   ├── compilar_examenes_oficiales.py
│   └── procesar_omr.py
└── storage/                          # PDFs y archivos generados
    └── generados/
        └── ROL-.../
            ├── variantes/
            └── cuadernillos/
```

---

## 4. ESTADO POR FASES

| Fase | Estado | Notas |
|------|--------|-------|
| Fase 0: Fundamentos | ✅ Listo | Entorno, Docker, BD, Typst, JDK, Maven |
| Fase 1: Backend dominio base | ✅ Listo | Entidades, repos, controllers base |
| Fase 2: Gateway UNITEPC | ✅ Listo | Sincronización sedes/carreras/asignaturas/grupos/estudiantes |
| Fase 3: Generación Typst con workers | ✅ Listo | Worker Python genera PDFs vía RabbitMQ |
| Fase 4: Banco de preguntas y variantes | ✅ Listo | Carga Excel al backend, generación real desde Lista de Evaluaciones, persistencia de variantes/mapeos en BD, descarga de PDFs reales |
| Fase 5: Motor OMR y calificación | ⏳ Pendiente | `bases/procesar_omr.py` + endpoint OMR. Worker OMR ya está aislado en su propia cola (`evaluaciones.omr.procesar`) |
| Fase 6: Refactorización frontend Angular | 🟡 En cierre | `evaluaciones-dia` ya lee roles del backend. `banco-preguntas.component.ts` sube Excel realmente, pero aún es monolítico (~4500 líneas) y usa `localStorage` para datos auxiliares |
| Fase 7: Reportes, admin y auditoría | ⏳ Pendiente | — |
| Fase 8: Examen virtual (opcional) | ⏳ Pendiente | — |
| Fase 9: Docker, deploy y calidad | ⏳ Pendiente | — |

---

## 5. ENTORNO Y REQUISITOS

### 5.1. Herramientas necesarias
- Windows 10/11
- Docker Desktop con WSL2
- Laragon (opcional, ya no es estricto porque PostgreSQL/RabbitMQ están en Docker)
- Git Bash (para ejecutar los comandos con paths `/c/...`)
- Node.js 20+ + npm
- Python 3.10+ con pip

### 5.2. Dependencias Python del worker

```bash
cd /c/laragon/www/evaluaciones/evaluaciones-workers
pip install -r requirements.txt
```

Contenido típico de `requirements.txt`:

```
typst
opencv-python
numpy
openpyxl
pika
```

### 5.3. Variables de entorno (`.env`)

Ejemplo mínimo:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sea_evaluaciones
DB_USER=postgres
DB_PASSWORD=postgres
DB_USERNAME=postgres
DB_PASSWORD=postgres
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASS=guest
RABBITMQ_PASSWORD=guest
SERVER_PORT=8081
JWT_SECRET=change-me-in-production
JWT_EXPIRATION_MS=86400000
UNITEPC_GATEWAY_BASE_URL=https://gw-dev.unitepc.solutions
UNITEPC_CLIENT_ID=...
UNITEPC_CLIENT_SECRET=...
UNITEPC_SYSTEM_CLIENT_ID=sea-evaluaciones
STORAGE_BASE_PATH=C:/laragon/www/evaluaciones/storage
```

> **Importante:** El backend usa `STORAGE_BASE_PATH` desde `application.yml`. Asegurarse de que sea una ruta Windows absoluta (`C:/...`), no `/app/storage/...`.

### 5.4. Levantar infraestructura

```bash
cd /c/laragon/www/evaluaciones
docker-compose up -d
```

Esto levanta PostgreSQL en `5432` y RabbitMQ en `5672` (management en `15672`).

### 5.5. Levantar backend

```bash
cd /c/laragon/www/evaluaciones/evaluaciones-backend
export JAVA_HOME=/c/laragon/www/evaluaciones/.tools/jdk-21.0.4+7
export PATH=$JAVA_HOME/bin:/c/laragon/www/evaluaciones/.tools/apache-maven-3.9.8/bin:$PATH
export $(grep -v '^#' /c/laragon/www/evaluaciones/.env | xargs)
mvn spring-boot:run
```

El backend escucha en `http://localhost:8081`.

### 5.6. Levantar frontend

```bash
cd /c/laragon/www/evaluaciones/evaluaciones-frontend
npm install
npm start
```

El frontend escucha en `http://localhost:4200`.

### 5.7. Levantar worker Typst (cuando se quiera generar)

```bash
cd /c/laragon/www/evaluaciones/evaluaciones-workers
export RABBITMQ_HOST=localhost RABBITMQ_PORT=5672 RABBITMQ_USER=guest RABBITMQ_PASS=guest
export DB_HOST=localhost DB_PORT=5432 DB_NAME=sea_evaluaciones DB_USER=postgres DB_PASSWORD=postgres
export LOGO_PATH=/c/laragon/www/evaluaciones/bases/logo_unitepc_clean.png
export TYPST_BIN=/c/laragon/www/evaluaciones/typst.exe
python main.py
```

---

## 6. APIs IMPLEMENTADAS

### 6.1. Roles de examen

```
GET    /api/roles-examen?sedeCodigo=...&carreraCodigo=...
GET    /api/roles-examen/{id}
POST   /api/roles-examen
POST   /api/roles-examen/{id}/transicion
GET    /api/roles-examen/{id}/auditoria
```

### 6.2. Catálogo académico (gateway UNITEPC)

```
GET /api/catalogo-academico/sedes
GET /api/catalogo-academico/carreras
GET /api/catalogo-academico/asignaturas
GET /api/catalogo-academico/grupos
GET /api/catalogo-academico/estudiantes?groupId=...
GET /api/catalogo-academico/campus
GET /api/catalogo-academico/gestiones
GET /api/catalogo-academico/gestiones/activa
```

### 6.3. Banco de preguntas

```
GET    /api/bancos-preguntas/{rolExamenId}       # NUEVO: obtener banco cargado para un rol
POST   /api/bancos-preguntas/{rolExamenId}/upload # Cargar Excel de 60 reactivos
```

El Excel debe tener una hoja llamada `Banco` con las columnas:

| Col | Campo |
|-----|-------|
| 0 | tipo_reactivo |
| 1 | grupo_contexto |
| 2 | enunciado |
| 3-7 | opciones A-E |
| 8 | respuesta_correcta |
| 9 | nivel_dificultad (1=Fácil, 2=Medio, 3=Difícil) |

Cuotas requeridas: 15 fáciles, 30 medios, 15 difíciles = 60 reactivos.

### 6.4. Generación Typst

```
POST /api/generacion-typst
GET  /api/generacion-typst/{jobId}/resultado
```

Body del POST:

```json
{
  "rolExamenId": "ROL-SIS413-TA01-1P",
  "bancoPreguntasId": "BANCO-A986285D",
  "variantes": ["A", "B", "C"]
}
```

El `outputBasePath` ya no es necesario; el backend usa `app.storage.base-path` + `/generados`.

### 6.5. Descarga de archivos

```
GET /api/archivos?path=C:/laragon/www/evaluaciones/storage/generados/ROL-.../variantes/....pdf
```

Acepta paths con `/` o `\` (se normalizan internamente). Tiene protección contra path traversal.

---

## 7. FLUJO DE GENERACIÓN REAL (FUNCIONANDO)

1. El rol de examen debe existir en `sea_roles_evaluaciones` (estado `PROGRAMADO`).
2. Se carga el banco Excel:
   ```bash
   curl -X POST "http://localhost:8081/api/bancos-preguntas/ROL-SIS413-TA01-1P/upload" \
        -F "file=@BANCO_PRUEBA_VALIDO_60PREGUNTAS.xlsx"
   ```
3. El rol pasa a `VALIDADO`.
4. Desde el frontend, en **Lista de Evaluaciones** (`/evaluaciones-dia`), se hace clic en el paso `Generado`.
5. El frontend consulta `GET /api/bancos-preguntas/{rolExamenId}` para obtener el `bancoPreguntasId`.
6. Al hacer clic en **Compilar Exámenes Typst**, se envía `POST /api/generacion-typst`.
7. El backend publica el job en RabbitMQ (`evaluaciones.generacion.typst`).
8. El worker Python consume, genera variantes + cuadernillos y publica el resultado en `evaluaciones.generacion.resultado`.
9. El backend escucha la cola `evaluaciones.generacion.resultado`, persiste las `ExamenVariante` y `MapeoEstudianteVariante` en PostgreSQL, actualiza contadores y transiciona automáticamente el rol a `GENERADO`.
10. El frontend consulta el estado por polling y, al completarse, muestra los PDFs reales vía `GET /api/archivos?path=...`.
11. Los PDFs quedan en `storage/generados/{rolExamenId}/variantes/` y `/cuadernillos/`.

---

## 8. FRONTEND — PÁGINAS RELEVANTES

### 8.1. `banco-preguntas.component.ts`
- Valida el Excel localmente con `xlsx`.
- Muestra previsualización del banco.
- Permite descargar un paquete encriptado `.pkg`.
- **Ya NO genera exámenes Typst** (se quitó esa sección).
- **Sí sube el archivo Excel real al backend** vía `POST /api/bancos-preguntas/upload?materiaCodigo=...&grupo=...&tipoParcial=...`.
- **Pendiente técnico:** sigue guardando datos auxiliares en `localStorage` y el componente es monolítico (~4500 líneas). Se recomienda refactorizar en Fase 6.

### 8.2. `evaluaciones-dia.component.ts`
- Muestra la lista de evaluaciones obtenida del backend (`GET /api/roles-examen?sedeCodigo=...&carreraCodigo=...`) con pipeline de estados.
- Al pasar a `Generado` abre modal de parametrización.
- Consulta el banco real del backend.
- Envía la generación a `GeneracionTypstService`.
- Muestra modal de progreso (worker) y visor de examen.
- **El visor de examen ya muestra PDFs reales** generados por el worker, accediendo a `/api/archivos?path=...`.

---

## 9. WORKER TYPST — ARCHIVOS CLAVE

### 9.1. `evaluaciones-workers/src/generator.py`
- `seleccionar_preguntas(reactivos, seed)`: selecciona 7F + 16M + 7D = 30 reactivos.
- `generar_variante(...)`: crea el `.typ` y compila el PDF.
- `generar_cuadernillo(...)`: crea PDF individualizado por estudiante.

### 9.2. Semillas deterministas

```python
SEED_POR_VARIANTE = {"A": 100, "B": 153, "C": 206, "D": 259, "E": 312}
```

### 9.3. Cuotas

```python
CUOTA_FACILES = 7
CUOTA_MEDIAS = 16
CUOTA_DIFICILES = 7
TOTAL_PREGUNTAS = 30
```

---

## 10. BUGS CONOCIDOS Y PENDIENTES

### ✅ Resueltos en este cierre de Fase 4

- ~~Fórmulas matemáticas en Typst~~ → `_sanitize_math()` en `generator.py` separa texto plano (`#raw`) de bloques `$...$`.
- ~~Barajado de opciones fijo~~ → `_barajar_opciones_pregunta()` con semilla `seed + idx` por pregunta.
- ~~Carga de Excel solo en localStorage~~ → `banco-preguntas.component.ts` sube el archivo real al backend.
- ~~Visor con PDFs locales~~ → `evaluaciones-dia.component.ts` abre PDFs reales por `/api/archivos?path=...`.
- ~~Worker OMR consumía la cola Typst~~ → `Dockerfile.omr` ahora usa `main_omr.py` y el compose le asigna colas aisladas (`evaluaciones.omr.procesar` / `evaluaciones.omr.resultado`).

### 🔴 Críticos pendientes

#### 10.1. Seguridad: endpoints `/api/**` abiertos
- **Archivo:** `evaluaciones-backend/src/main/java/com/xpertiflow/evaluaciones/config/SecurityConfig.java`
- **Estado:** `requestMatchers("/api/**").permitAll()` desactiva toda autenticación.
- **Impacto:** cualquier cliente puede crear roles, cargar bancos, generar exámenes.
- **Solución:** implementar JWT + roles (ADMIN, DOCENTE, JEFE_CARRERA) antes de producción.

#### 10.2. Banco de preguntas no está encriptado realmente
- **Archivo:** `BancoPreguntasService.java`
- **Estado:** `paqueteJsonEncriptado` solo contiene JSON plano serializado.
- **Solución:** cifrar el payload con AES-256-GCM y guardar el IV junto al campo.

### 🟡 Funcionales / integración

#### 10.3. Worker genera cuadernillos placeholder cuando no hay estudiantes
- Si el gateway UNITEPC no devuelve estudiantes para el grupo, el worker genera cuadernillos placeholder (`PLA-A`, `PLA-B`, etc.). Esto es aceptable para pruebas, pero en producción debe sincronizar estudiantes reales.

#### 10.4. Cartilla OMR del PDF tiene 60 espacios pero el examen evalúa 30
- **Archivo:** `evaluaciones-workers/src/generator.py` (`_generar_grid_cartilla`)
- **Estado:** la cartilla impresa tiene 60 preguntas; el motor OMR (`bases/procesar_omr.py`) solo califica 30.
- **Solución:** alinear a 30 preguntas o preparar el OMR para leer 60 y mapear a las 30 seleccionadas.

#### 10.5. Datos inconsistentes en BD del rol piloto CPEC18
- **Estado:** las variantes seed apuntaban a reactivos IDs 1-30 que ya no existen (el banco actual tiene IDs 31-90).
- **Solución aplicada:** script `limpiar_bd_cpec18.py` para borrar variantes/mapeos/calificaciones inconsistentes y resetear el rol a `VALIDADO`. Debe ejecutarse en el entorno con Docker/PostgreSQL corriendo.

---

## 11. PRUEBAS RÁPIDAS PARA OTRO EQUIPO

### 11.1. Verificar backend

```bash
curl http://localhost:8081/api/roles-examen/ROL-SIS413-TA01-1P
curl http://localhost:8081/api/bancos-preguntas/ROL-SIS413-TA01-1P
```

### 11.2. Cargar un banco de prueba

```bash
curl -X POST "http://localhost:8081/api/bancos-preguntas/ROL-SIS413-TA01-1P/upload" \
     -F "file=@/c/laragon/www/evaluaciones/BANCO_PRUEBA_VALIDO_60PREGUNTAS.xlsx"
```

### 11.3. Generar exámenes

```bash
curl -X POST http://localhost:8081/api/generacion-typst \
     -H "Content-Type: application/json" \
     -d '{"rolExamenId":"ROL-SIS413-TA01-1P","bancoPreguntasId":"BANCO-XXXX","variantes":["A","B","C"]}'
```

Luego levantar el worker Python (sección 5.7) y consultar:

```bash
curl http://localhost:8081/api/generacion-typst/{jobId}/resultado
```

### 11.4. Descargar un PDF

```bash
curl -O -J "http://localhost:8081/api/archivos?path=C:/laragon/www/evaluaciones/storage/generados/ROL-SIS413-TA01-1P/variantes/SIS-413_CBA_TA-01_1ER_PARCIAL_VarA_22082026_Examen.pdf"
```

---

## 12. PRÓXIMOS PASOS RECOMENDADOS

### Inmediatos (validación de Fase 4)
1. Ejecutar `limpiar_bd_cpec18.py` en el entorno con Docker/PostgreSQL corriendo.
2. Levantar todo el stack (`docker-compose up -d --build`).
3. Probar flujo end-to-end:
   - Crear o seleccionar rol `PROGRAMADO`.
   - Subir banco Excel desde `/banco-preguntas`.
   - Generar exámenes desde `/evaluaciones-dia` → paso `Generado`.
   - Verificar que el rol pase a `GENERADO`, que existan registros en `sea_examenes_variantes` y `sea_mapeo_estudiantes_variantes`, y que los PDFs se abran correctamente.

### Fase 5: Motor OMR
1. Desarrollar `main_omr.py` para consumir imágenes escaneadas de `evaluaciones.omr.procesar`.
2. Integrar `bases/procesar_omr.py` (o reescribirlo) para leer patrones oficiales desde `sea_examenes_variantes.patron_claves_json`.
3. Crear endpoint `POST /api/calificacion-omr` para subir escaneos de cartillas.
4. Crear entidad JPA `CalificacionOmr` y guardar calificaciones en `sea_calificaciones_omr`.
5. Agregar dependencias OMR a `requirements.txt`: `opencv-python`, `numpy`, `openpyxl`.

### Fase 6: Frontend
1. Refactorizar `banco-preguntas.component.ts` en sub-componentes y eliminar dependencia de `localStorage` para datos del negocio.
2. Implementar creación de roles de examen desde el frontend.
3. Mejorar el visor de exámenes (zoom, descarga masiva, lista de estudiantes).

### Fase 9: Docker, deploy y calidad
1. Automatizar build multi-stage de frontend/backend/workers en `docker-compose.yml`.
2. Implementar healthchecks y restart policies.
3. Persistir estado de jobs de generación en BD (actualmente solo en memoria).
4. Agregar tests unitarios y de integración.

---

## 13. NOTAS PARA OTRO EQUIPO

- **No usar `/app/storage/...` en Windows.** El backend ahora normaliza la ruta desde `STORAGE_BASE_PATH`. Si se ejecuta en Linux/Docker, cambiar la variable de entorno.
- **Los workers ahora corren con `docker-compose up -d`.** `worker-typst` consume `evaluaciones.generacion.typst` y `worker-omr` consume `evaluaciones.omr.procesar` (actualmente en modo stub).
- **El backend guarda estados de generación en memoria.** Si se reinicia el backend, los jobs antiguos desaparecen del endpoint `/api/generacion-typst/{jobId}/resultado`. Los archivos PDF y los registros en BD (`sea_examenes_variantes`, `sea_mapeo_estudiantes_variantes`) persisten.
- **RabbitMQ management:** `http://localhost:15672` (guest/guest) para monitorear colas.
- **Base de datos:** conectar con cualquier cliente PostgreSQL a `localhost:5432/sea_evaluaciones`.
- **Limpieza de datos piloto:** ejecutar `python limpiar_bd_cpec18.py` cuando PostgreSQL esté accesible en `localhost:5432` antes de probar el flujo con CPEC18.

---

## 14. CONTACTO / AUTORÍA

- Autor original del contexto maestro: Ariel Camara / XpertiFlow
- Documento generado por: Kimi Code CLI — continuidad de Fase 4
- Fecha: agosto 2026
