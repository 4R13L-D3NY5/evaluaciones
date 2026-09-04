# Sistema de Evaluaciones SEA / SISA

Sistema institucional para administrar el ciclo completo de evaluaciones académicas de UNITEPC: programación, bancos de preguntas, generación de exámenes, cartillas OMR, exámenes virtuales, procesamiento de escaneos, calificación, reportes, usuarios, auditoría y respaldos.

El proyecto está preparado para ejecutarse con Docker Compose y para consumir datos académicos oficiales desde los servicios SEA/SISA a través del gateway institucional.

> Este README es la guía general del sistema. Para instalarlo en producción también debe leerse [guia_despliegue.md](guia_despliegue.md), especialmente las secciones de secretos, Vault, respaldos y recuperación.

## Contenido

- [1. Información general](#1-información-general)
- [2. Funcionalidades](#2-funcionalidades)
- [3. Arquitectura](#3-arquitectura)
- [4. Roles y alcance](#4-roles-y-alcance)
- [5. Flujo de una evaluación](#5-flujo-de-una-evaluación)
- [6. Estructura del repositorio](#6-estructura-del-repositorio)
- [7. Requisitos](#7-requisitos)
- [8. Puertos y dominio](#8-puertos-y-dominio)
- [9. Variables de entorno](#9-variables-de-entorno)
- [10. Secretos y cifrado](#10-secretos-y-cifrado)
- [11. Instalación](#11-instalación)
- [12. Verificación](#12-verificación)
- [13. Operación diaria](#13-operación-diaria)
- [14. Actualización y reversión](#14-actualización-y-reversión)
- [15. Respaldos y recuperación](#15-respaldos-y-recuperación)
- [16. Desarrollo y pruebas](#16-desarrollo-y-pruebas)
- [17. API principal](#17-api-principal)
- [18. Seguridad](#18-seguridad)
- [19. Problemas frecuentes](#19-problemas-frecuentes)
- [20. Limitaciones y pendientes](#20-limitaciones-y-pendientes)
- [21. Documentación complementaria](#21-documentación-complementaria)

---

## 1. Información general

| Dato | Valor |
| --- | --- |
| Nombre | Sistema de Evaluaciones SEA / SISA |
| Institución | Universidad Técnica Privada Cosmos (UNITEPC) |
| Repositorio | https://git.unitepc.solutions/investigacion/sisa-evaluacion |
| Rama de integración | develop |
| Modalidades | Presencial con cartilla OMR, presencial sin cartilla y virtual |
| Idioma | Español |
| Base de datos | PostgreSQL 16 |
| Backend | Spring Boot 3.3.2 sobre Java 21 |
| Frontend | Angular 18, PrimeNG y Tailwind CSS |
| Workers | Python 3.10/3.12, Typst, OMR y Restic |
| Mensajería | RabbitMQ 3 |
| Cifrado | AES-256-GCM y Vault Transit |
| Servidor web | Nginx |
| Despliegue | Docker Engine y Docker Compose v2 |

### Propósito

El sistema relaciona gestión, sede, carrera, asignatura, grupo, docente, estudiantes, banco de preguntas, variantes, documentos, respuestas, notas y auditoría dentro de un mismo proceso.

### Fuente oficial de datos

Sedes, campus, carreras, asignaturas, grupos, docentes, estudiantes y horarios deben provenir de SEA/SISA. El sistema conserva datos locales de operación, pero no debe sustituir la información oficial por listas ficticias en producción.

---

## 2. Funcionalidades

### 2.1. Plan de Estudios

- Consulta de gestiones académicas.
- Consulta de sedes, campus, carreras, asignaturas y grupos.
- Visualización del plan por sede, carrera y gestión.
- Visualización del docente oficial.
- Seguimiento del banco y estado del examen por parcial.
- Filtros según alcance del usuario.

### 2.2. Rol de Exámenes

Permite registrar un rol con gestión, sede, carrera, asignatura, grupo, docente oficial, parcial, modalidad, fecha, hora y aula.

Tipos de evaluación:

- 1er Parcial;
- 2do Parcial;
- Examen Final;
- 2da Instancia.

Cada rol tiene una versión y trazabilidad de cambios. Una nueva importación no debe sobrescribir silenciosamente una versión que ya fue utilizada.

### 2.3. Banco de Preguntas

El docente carga el banco mediante Excel. El sistema valida hoja, columnas, tipología, enunciado, opciones, respuesta correcta, dificultad, parcial, agrupaciones, observaciones, imágenes y fórmulas.

Tipologías oficiales:

1. Verdadero o Falso Simple.
2. Respuesta A/B/Ambas/Ninguna.
3. Verdadero o Falso Complejas.
4. Selección de la mejor respuesta.
5. Ítems agrupados por caso clínico o problema.
6. Emparejamiento Ampliado.

Distribución mínima vigente:

| Dificultad | Cantidad mínima |
| --- | ---: |
| Fácil | 15 |
| Media | 30 |
| Difícil | 15 |
| Total | 60 |

El banco puede contener más reactivos. La plantilla incorpora contadores y una hoja de validaciones protegida para evitar modificaciones accidentales.

#### Fórmulas, química e imágenes

Las expresiones matemáticas o químicas se delimitan con el signo dólar:

~~~text
$ x = (-b + sqrt(b^2 - 4 a c)) / (2 a) $
$ H_2SO_4 + 2 NaOH -> Na_2SO_4 $
~~~

Las expresiones largas deben colocarse en una línea independiente. La previsualización del banco y del examen es la verificación final antes de aprobar o generar.

No se deben pegar manualmente prefijos como A., B) o C. al inicio de las opciones. El generador aplica la rotulación uniformemente para evitar duplicación o mezcla de incisos.

### 2.4. Generación de documentos

El worker Typst genera, según modalidad y configuración:

- examen oficial;
- variantes A, B, C, D o E;
- patrón oficial de respuestas;
- cuadernillos personalizados;
- lista de estudiantes y firmas;
- archivos de apoyo para OMR;
- documentos para impresión.

La relación estudiante-variante es interna. La clave y la variante no deben quedar expuestas en la cartilla física.

### 2.5. Presencial con cartilla OMR

El sistema genera las marcas de identificación por separado del examen. La cartilla institucional puede ser preimpresa y el PDF contiene la sobreimpresión de datos.

El worker OMR puede recibir PDF o imágenes, detectar la grilla, leer el código, identificar respuestas, recuperar la variante, comparar contra el patrón, calcular aciertos y dejar páginas ambiguas en revisión manual.

El número de páginas escaneadas debe coincidir con el número de cartillas/estudiantes entregados. Una página sin código válido no se asigna por posición u orden del archivo.

### 2.6. Presencial sin cartilla

Genera el cuadernillo sin cartilla OMR. Antes de pasar a IMPRESO, se muestra un modal para descargar el documento o cancelar la acción.

Esta modalidad no utiliza OMR. Las respuestas o notas deben registrarse mediante el flujo manual autorizado. Mientras no se confirme la calificación, el rol permanece pendiente de notas.

### 2.7. Examen virtual

Permite preparar una sala, generar código y token, validar estudiantes, abrir e iniciar la sala, aplicar duración, guardar respuestas, enviar o cerrar intentos, calificar y consultar resultados.

La sala virtual no utiliza los estados físicos de impresión, entrega y devolución.

### 2.8. Usuarios y accesos

- Cuentas internas identificadas por CI.
- Contraseña temporal y cambio obligatorio en el primer ingreso.
- Importación masiva desde Excel.
- Asignación de roles.
- Alcance por sede, carrera, asignatura, campus y estado.
- Sincronización de docentes con SEA.
- Restablecimiento de contraseña.
- Auditoría de operaciones.

### 2.9. Reportes y respaldos

- Reportes de evaluaciones.
- Resultados OMR y virtuales.
- Conciliación Remark vs. OMR.
- Bitácora de acciones.
- Respaldos locales y externos con Restic.
- Restauración controlada por el administrador.

---

## 3. Arquitectura

~~~mermaid
flowchart LR
    U[Usuarios] --> F[Frontend Angular + Nginx]
    F --> B[Backend Spring Boot]
    B --> D[(PostgreSQL)]
    B --> Q[RabbitMQ]
    B --> V[Vault Transit]
    B --> S[(Storage)]
    B --> SEA[Gateway SEA/SISA]
    Q --> T[Worker Typst]
    Q --> O[Worker OMR]
    Q --> R[Worker Backups]
    T --> S
    O --> S
    R --> BK[(Respaldos)]
~~~

### 3.1. Servicios Docker

| Servicio | Contenedor | Función | Persistencia o dependencia |
| --- | --- | --- | --- |
| db | evaluaciones-db | PostgreSQL 16 | Volumen pgdata |
| rabbitmq | evaluaciones-rabbitmq | Colas | Mensajería interna |
| vault | evaluaciones-vault | Transit y claves | Volumen vaultdata |
| vault-bootstrap | evaluaciones-vault-bootstrap | Desbloqueo de Vault | Llaves locales |
| backend | evaluaciones-backend | API, sesión y reglas | DB, RabbitMQ, Vault y storage |
| frontend | evaluaciones-frontend | Angular servido por Nginx | Backend saludable |
| worker-typst | evaluaciones-worker-typst | Generación | RabbitMQ, DB, Vault y storage |
| worker-omr | evaluaciones-worker-omr | Lectura y calificación OMR | RabbitMQ, DB, Vault y storage |
| worker-backup | evaluaciones-worker-backup | Restic y recuperación | Repositorios y contraseña Restic |

### 3.2. Comunicación interna

~~~text
db       -> PostgreSQL:5432
rabbitmq -> AMQP:5672
vault    -> Vault:8200
backend  -> API:8080
frontend -> Nginx:80
~~~

Dentro de Docker se utilizan los nombres db, rabbitmq y vault. No cambiarlos por IP pública. El frontend reenvía las rutas /api/ al backend mediante Nginx.

### 3.3. Persistencia

| Elemento | Contenido | Criticidad |
| --- | --- | --- |
| pgdata | Base PostgreSQL | Crítica |
| vaultdata | Estado de Vault y Transit | Crítica |
| storage/ | Documentos, imágenes y archivos de operación | Alta |
| backups/ | Repositorio Restic local | Alta |
| backups-external/ | Repositorio externo | Alta |
| vault/secrets/ | Llaves y contraseña Restic | Secreto crítico |

Nunca ejecutar docker compose down -v en un ambiente con datos institucionales.

---

## 4. Roles y alcance

La autorización se aplica en la interfaz y en el backend. Ocultar un botón no reemplaza la validación del servidor.

| Rol | Acceso principal |
| --- | --- |
| ADMINISTRADOR_SISTEMA | Acceso total, usuarios, configuración, auditoría y respaldos |
| RESPONSABLE_EVALUACIONES | Administración operativa, evaluaciones, generación, impresión, OMR, reportes y usuarios operativos |
| PERSONAL_EVALUACIONES | Lista y operación de evaluaciones de sedes/campus habilitados |
| DOCENTE | Bancos y salas virtuales propias, limitados por CI, grupo, sede y carrera |
| VICERRECTOR | Consulta y reportes de las sedes asignadas |
| DIRECTOR_CARRERA | Plan, rol, lista y reportes de las relaciones sede-carrera asignadas |

### Reglas de alcance

- El director selecciona únicamente las relaciones de sede y carrera asignadas.
- El vicerrector trabaja a nivel de una o más sedes asignadas.
- El personal de evaluaciones trabaja por sedes y campus asociados.
- Cada campus del personal puede estar HABILITADO o DESHABILITADO.
- El docente se valida contra el CI oficial devuelto por SEA.
- Una cuenta sin alcance no debe consultar información académica fuera de su responsabilidad.
- Una cuenta inactiva no puede iniciar sesión ni operar.

### Autenticación

La implementación actual utiliza sesión HTTP interna. El frontend no guarda contraseñas ni tokens en localStorage.

Las cuentas nuevas utilizan el CI como contraseña temporal, exigen cambio en el primer ingreso y guardan la contraseña final como hash BCrypt. La integración con Keycloak/SSO está prevista para una fase posterior.

---

## 5. Flujo de una evaluación

~~~mermaid
sequenceDiagram
    actor Responsable as Director/Vicerrector
    actor Docente as Docente
    actor Evaluaciones as Personal de evaluaciones
    participant App as Sistema
    participant SEA as SEA/SISA
    participant OMR as Worker OMR

    Responsable->>App: Registra rol
    App->>SEA: Valida grupo y docente
    Docente->>App: Carga banco
    App->>App: Valida estructura y cuotas
    Evaluaciones->>App: Genera examen y variantes
    App->>SEA: Consulta nómina
    App-->>Evaluaciones: Entrega documentos
    Evaluaciones->>App: Confirma impresión y entrega
    Evaluaciones->>OMR: Carga escaneado
    OMR-->>App: Devuelve lecturas
    App->>App: Califica y audita
~~~

### 5.1. Estados

| Estado | Significado | Acción habitual |
| --- | --- | --- |
| PROGRAMADO | Rol registrado | Cargar o reemplazar banco |
| VALIDADO | Banco aprobado | Generar examen o sala |
| GENERADO | Variantes/documentos preparados | Preparar impresión |
| IMPRESO | Impresión confirmada | Registrar entrega |
| ENTREGADO | Examen entregado | Registrar devolución |
| DEVUELTO | Material devuelto | Procesar OMR o notas |
| PENDIENTE_NOTAS | Falta calificación manual o revisión OMR | Registrar y confirmar |
| CALIFICADO | Resultado confirmado | Consultar y reportar |

### 5.2. Precondiciones

Antes de generar se debe confirmar:

1. sede, carrera, asignatura, grupo y docente válidos;
2. banco cargado y validado;
3. mínimo de 60 reactivos con distribución 15/30/15;
4. nómina oficial disponible;
5. Vault desbloqueado;
6. tokens técnicos vigentes;
7. workers conectados a RabbitMQ;
8. previsualización revisada cuando existan fórmulas, imágenes o casos.

---

## 6. Estructura del repositorio

~~~text
.
├── docker-compose.yml
├── .env.example
├── README.md
├── guia_despliegue.md
├── alcance.md
├── docs/
├── evaluaciones-backend/
├── evaluaciones-frontend/
├── evaluaciones-workers/
├── vault/
├── bases/
├── storage/
├── backups/
└── backups-external/
~~~

- evaluaciones-backend/: API Spring Boot, seguridad, persistencia y migraciones Flyway.
- evaluaciones-frontend/: Angular, navegación, formularios, modales y previsualización.
- evaluaciones-workers/: generación Typst, OMR, mensajería y respaldos.
- vault/: configuración, políticas y desbloqueo.
- bases/: recursos y archivos de apoyo.
- docs/: documentación funcional y técnica.
- storage/: archivos operativos del ambiente.
- backups/ y backups-external/: repositorios de respaldo.

### Archivos que nunca deben publicarse

- .env;
- vault/secrets/;
- tokens, contraseñas y llaves;
- dumps PostgreSQL;
- documentos de estudiantes;
- escaneos reales;
- node_modules/, target/ y logs.

---

## 7. Requisitos

### Producción recomendada

- Docker Engine 24 o superior.
- Docker Compose v2.
- Linux administrado preferentemente.
- 4 CPU como mínimo recomendado.
- 8 GB de RAM como mínimo recomendado.
- 50 GB libres como base, más crecimiento de documentos y respaldos.
- SSD y almacenamiento externo.
- DNS o IP fija.
- Hora sincronizada mediante NTP.
- Acceso HTTPS saliente al gateway SEA/SISA.
- Proxy inverso institucional con TLS.

### Desarrollo en Windows

- Windows 10/11.
- Docker Desktop con WSL2.
- PowerShell 5.1 o superior.
- Puertos libres.
- Docker Desktop configurado para iniciar con el sistema si se requiere arranque automático.

### Desarrollo sin Docker

- Java 21 y Maven.
- Node.js 20 y npm.
- Python 3.10 para Typst/OMR.
- Python 3.12 para respaldos.
- Typst CLI.
- Tesseract OCR.
- PostgreSQL, RabbitMQ y Vault accesibles.

Para un servidor institucional se recomienda Docker Compose, porque los Dockerfiles fijan las dependencias.

---

## 8. Puertos y dominio

### 8.1. Puertos de Compose

| Puerto | Servicio | Uso | Recomendación |
| ---: | --- | --- | --- |
| 4200 | Frontend | Acceso web directo | Solo red institucional o proxy |
| 8080 | Backend | API directa | No publicar a usuarios |
| 5432 | PostgreSQL | Administración técnica | Solo localhost/DBA |
| 5672 | RabbitMQ | AMQP | No publicar |
| 15672 | RabbitMQ | Consola | Solo administradores |
| 8200 | Vault | Administración | Solo localhost |

El Compose actual publica puertos para facilitar desarrollo. En producción deben restringirse mediante firewall, bind local o una modificación aprobada.

### 8.2. Dominio institucional

~~~text
Usuarios
   |
   v
Proxy inverso HTTPS (443)
   |
   v
Frontend Nginx (127.0.0.1:4200)
   |
   v
Backend interno (backend:8080)
~~~

El equipo de infraestructura debe:

1. crear un DNS, por ejemplo evaluaciones.unitepc.edu.bo;
2. apuntarlo a la IP o balanceador institucional;
3. instalar y renovar el certificado TLS;
4. permitir externamente únicamente 443 y, si corresponde, redirigir 80;
5. mantener DB, RabbitMQ, Vault y backend fuera de Internet;
6. restringir 4200 a localhost o a la red del proxy.

El navegador utiliza el mismo origen y Nginx reenvía /api/. No es necesario exponer otra URL pública para el backend.

---

## 9. Variables de entorno

Crear el archivo real a partir de .env.example:

Linux:

~~~bash
cp .env.example .env
chmod 600 .env
~~~

Windows PowerShell:

~~~powershell
Copy-Item .env.example .env
notepad .env
~~~

### Variables importantes

| Variable | Producción | Descripción |
| --- | :---: | --- |
| DB_NAME | Sí | Base PostgreSQL |
| DB_USERNAME | Sí | Usuario PostgreSQL |
| DB_PASSWORD | Sí | Contraseña de DB |
| SERVER_PORT | No | Puerto publicado del backend |
| FRONTEND_PORT | No | Puerto publicado del frontend |
| SPRING_PROFILES_ACTIVE | Sí | Perfil Spring |
| JWT_SECRET | Sí | Secreto aleatorio de alta entropía |
| JWT_EXPIRATION_MS | No | Duración de sesión/token |
| UNITEPC_GATEWAY_BASE_URL | Sí | URL del gateway SEA/SISA |
| UNITEPC_CLIENT_ID | Sí | Cliente OAuth técnico |
| UNITEPC_CLIENT_SECRET | Sí | Secreto OAuth técnico |
| UNITEPC_SYSTEM_CLIENT_ID | Sí | Identificador del sistema |
| RABBITMQ_USER | Sí | Usuario RabbitMQ |
| RABBITMQ_PASSWORD | Sí | Contraseña RabbitMQ |
| VAULT_BACKEND_TOKEN | Sí | Token de política backend |
| VAULT_WORKER_TOKEN | Sí | Token de política Typst |
| VAULT_OMR_TOKEN | Sí | Token de política OMR |
| VAULT_TRANSIT_KEY_NAME | Sí | Normalmente sea-banco-kek |
| KMS_MIGRATION_ENABLED | No | Debe ser false normalmente |
| KMS_ROTATION_ENABLED | No | Debe ser false normalmente |
| BACKUP_LOCAL_PATH | Sí | Ruta de respaldo local |
| BACKUP_EXTERNAL_PATH | Sí | Ruta de respaldo externo |
| BACKUP_RESTIC_PASSWORD_FILE | Sí | Archivo protegido de Restic |

### Reglas

- No usar postgres, guest ni cambia_este_* en producción.
- No reutilizar contraseñas.
- No poner llaves de Vault en .env.
- No enviar .env por GitLab, correo, chats o tickets.
- docker compose config valida sintaxis, pero no valida que los secretos sean correctos.
- No mostrar la salida completa de docker compose config.

Dentro de Docker se utilizan los hosts db, rabbitmq y vault. No sustituirlos por IP pública.

---

## 10. Secretos y cifrado

### 10.1. Explicación sencilla

Cada banco o documento sensible se cifra con una clave de datos propia. Esa clave se protege con una clave maestra administrada por Vault.

~~~text
Banco de preguntas
       |
       v
AES-256-GCM + DEK
       |
       v
DEK protegida por Vault Transit
       |
       v
KEK institucional dentro de Vault
~~~

- DEK: clave de datos usada para un banco o documento concreto.
- KEK: clave maestra que protege las DEK.
- Vault Transit: servicio que protege las DEK sin entregar la KEK a la aplicación.

La KEK no debe estar en PostgreSQL, RabbitMQ, logs, imágenes Docker, código ni archivos entregados al tercero. Los workers descifran en memoria durante una operación autorizada.

### 10.2. Vault

La inicialización de un Vault nuevo se ejecuta una sola vez. No ejecutar vault operator init si el volumen ya tiene información.

Resumen:

1. iniciar DB, RabbitMQ y Vault;
2. inicializar Vault con el umbral institucional;
3. entregar las llaves a custodios separados;
4. desbloquear Vault;
5. habilitar Transit;
6. crear sea-banco-kek como clave AES-256-GCM no exportable;
7. aplicar políticas de backend, worker y OMR;
8. crear tokens independientes;
9. guardar tokens fuera del repositorio.

El procedimiento exacto está en guia_despliegue.md, sección Vault y cifración.

### 10.3. Desbloqueo después de reinicio

vault-bootstrap no inicializa ni borra Vault. Solo intenta desbloquear un Vault ya inicializado usando vault/secrets/unseal-keys.

Este mecanismo es práctico, pero concentra material sensible en el mismo servidor. En ambientes críticos se recomienda KMS/HSM externo.

### 10.4. Migración y rotación

KMS_MIGRATION_ENABLED y KMS_ROTATION_ENABLED solo deben activarse en una ventana controlada, con respaldo y revisión de logs. Al finalizar se vuelven a false.

Si Vault está sellado o caído, la generación, OMR y lectura de bancos deben fallar de forma segura. Nunca crear una KEK alternativa ni borrar el volumen para probar.

---

## 11. Instalación

### 11.1. Obtener el proyecto

El tercero debe contar con una cuenta institucional o token de lectura:

~~~bash
git clone --branch develop --single-branch \
  https://git.unitepc.solutions/investigacion/sisa-evaluacion.git \
  /opt/evaluaciones
cd /opt/evaluaciones
~~~

Para producción:

~~~bash
git fetch --tags
git checkout <TAG_O_COMMIT_APROBADO>
~~~

Registrar el commit instalado en el documento de entrega.

### 11.2. Crear carpetas

Linux:

~~~bash
cd /opt/evaluaciones
mkdir -p bases storage backups backups-external vault/secrets
touch vault/secrets/unseal-keys vault/secrets/restic-password
chmod 700 vault/secrets
chmod 600 vault/secrets/unseal-keys vault/secrets/restic-password
~~~

Windows PowerShell:

~~~powershell
New-Item -ItemType Directory -Force -Path .\bases, .\storage, .\backups, .\backups-external, .\vault\secrets
New-Item -ItemType File -Force -Path .\vault\secrets\unseal-keys, .\vault\secrets\restic-password
~~~

Completar los archivos por un canal seguro. unseal-keys contiene las llaves de desbloqueo, una por línea. restic-password contiene únicamente la contraseña de Restic.

### 11.3. Configurar variables

~~~bash
cp .env.example .env
chmod 600 .env
~~~

Completar DB, RabbitMQ, gateway SEA/SISA, JWT, Vault y respaldos.

### 11.4. Inicializar Vault

Seguir la sección de Vault de guia_despliegue.md. El backend y los workers dependen de Vault.

### 11.5. Construir y levantar

~~~bash
docker compose config
docker compose up -d --build
~~~

El primer build descarga imágenes, dependencias Maven/npm/Python y Typst.

### 11.6. Primer usuario

En una base nueva, las migraciones crean:

~~~text
Usuario: admin
Contraseña temporal: Admin123!
~~~

Cambiar la contraseña inmediatamente. No usar esta cuenta como usuario operativo cotidiano.

El despliegue no crea automáticamente docentes, directores, vicerrectores ni personal de evaluaciones. Después del primer ingreso:

1. cambiar la contraseña de admin;
2. abrir Usuarios y accesos o Administración de Evaluaciones;
3. crear o importar usuarios;
4. asignar rol, sede, carrera, campus y estado;
5. entregar credenciales temporales por canal separado;
6. exigir el cambio de contraseña.

Si pgdata ya existe, se conservan usuarios y datos. No borrar el volumen para recrear cuentas.

---

## 12. Verificación

### 12.1. Contenedores

~~~bash
docker compose ps
~~~

Esperado:

- DB saludable;
- RabbitMQ saludable;
- Vault ejecutándose y desbloqueado;
- vault-bootstrap saludable;
- backend saludable;
- frontend ejecutándose;
- workers Typst, OMR y backup ejecutándose.

### 12.2. Vault

~~~bash
docker compose exec vault sh -c \
  'VAULT_ADDR=http://127.0.0.1:8200 vault status'
~~~

Debe indicar que Vault está inicializado y Sealed: false.

### 12.3. Frontend

~~~bash
curl -f http://127.0.0.1:4200/
~~~

Windows:

~~~powershell
Invoke-WebRequest http://127.0.0.1:4200/ -UseBasicParsing
~~~

Abrir el dominio institucional, iniciar sesión y revisar la carga de módulos.

### 12.4. Recorrido mínimo

1. Iniciar sesión como administrador.
2. Cambiar la contraseña inicial.
3. Consultar sedes, carreras y gestiones.
4. Crear un usuario de prueba por cada rol.
5. Confirmar alcance de director, vicerrector y personal de evaluaciones.
6. Registrar un rol de prueba.
7. Cargar BANCO_PRUEBA_VALIDO_60PREGUNTAS.xlsx.
8. Revisar previsualización, fórmulas, subíndices, imágenes y casos.
9. Generar un documento.
10. En cartilla, verificar páginas contra la nómina.
11. En virtual, crear sala, validar acceso y cerrar ciclo.
12. Revisar auditoría y confirmar que no existan secretos en logs.

### 12.5. Logs

~~~bash
docker compose logs --tail=100 backend
docker compose logs --tail=100 worker-typst
docker compose logs --tail=100 worker-omr
docker compose logs --tail=100 worker-backup
docker compose logs --tail=100 vault-bootstrap
~~~

Los logs son para diagnóstico, no para guardar bancos, claves, tokens o documentos.

---

## 13. Operación diaria

### Iniciar

~~~bash
docker compose up -d
~~~

### Ver estado

~~~bash
docker compose ps
~~~

### Detener sin borrar datos

~~~bash
docker compose stop
~~~

Volver a iniciar:

~~~bash
docker compose start
~~~

### Reiniciar un servicio

~~~bash
docker compose restart backend
docker compose restart worker-typst
docker compose restart worker-omr
~~~

### Reinicio del servidor

Los servicios tienen restart: unless-stopped. El orden esperado es:

1. Docker inicia DB, RabbitMQ y Vault.
2. vault-bootstrap desbloquea Vault.
3. backend espera dependencias saludables.
4. workers esperan backend, DB, RabbitMQ y Vault.
5. frontend inicia cuando backend está saludable.

Si algo no se recupera, revisar docker compose ps y logs. No borrar volúmenes.

---

## 14. Actualización y reversión

### 14.1. Actualización

Antes de actualizar:

1. confirmar ventana de mantenimiento;
2. realizar y verificar respaldo;
3. registrar commit actual;
4. confirmar que no haya generación, OMR o examen en curso.

~~~bash
git fetch origin
git checkout <TAG_O_COMMIT_APROBADO>
docker compose config
docker compose up -d --build
docker compose ps
~~~

Flyway aplica migraciones pendientes al iniciar. No ejecutar SQL manualmente sin revisar el historial.

### 14.2. Solo frontend

~~~bash
docker compose build frontend
docker compose up -d --no-deps frontend
~~~

Después probar con Ctrl + F5.

### 14.3. Reversión

La reversión del código no revierte automáticamente una migración de base de datos. Si hubo cambios de esquema:

1. detener operaciones;
2. conservar logs y commit;
3. revisar migraciones aplicadas;
4. restaurar DB, storage y Vault solo con procedimiento aprobado;
5. volver a una versión compatible;
6. verificar antes de habilitar usuarios.

No usar git reset --hard ni docker compose down -v como rollback.

---

## 15. Respaldos y recuperación

### 15.1. Elementos

Se deben proteger:

- PostgreSQL;
- volumen vaultdata;
- llaves de recuperación de Vault;
- storage/;
- repositorio Restic local;
- repositorio Restic externo;
- configuración operativa en almacén seguro.

### 15.2. Dump PostgreSQL

Linux:

~~~bash
mkdir -p backups/sql
docker compose exec -T db pg_dump \
  -U "$DB_USERNAME" \
  -d "$DB_NAME" \
  > "backups/sql/sea_evaluaciones_$(date +%Y%m%d_%H%M%S).sql"
~~~

Windows:

~~~powershell
New-Item -ItemType Directory -Force .\backups\sql
docker compose exec -T db pg_dump -U postgres -d sea_evaluaciones > .\backups\sql\sea_evaluaciones_$(Get-Date -Format yyyyMMdd_HHmmss).sql
~~~

Ajustar usuario y base a la configuración real. No publicar el dump.

### 15.3. Restic

El módulo Respaldos y contingencia permite consultar configuración, crear respaldos, copiar al destino externo, verificar snapshots y solicitar restauración según el permiso del administrador.

La contraseña Restic se lee desde BACKUP_RESTIC_PASSWORD_FILE. Nunca debe mostrarse en interfaz, comandos compartidos o logs.

### 15.4. Recuperar Vault

Si Vault está sellado:

1. revisar logs de vault-bootstrap;
2. confirmar que unseal-keys corresponda a vaultdata;
3. consultar a los custodios;
4. iniciar el conjunto;
5. comprobar Sealed: false;
6. verificar backend y workers.

No ejecutar una nueva inicialización contra el mismo volumen.

### 15.5. Prueba de recuperación

La institución debe probar periódicamente una restauración aislada y comprobar apertura de DB, desbloqueo de Vault, lectura de banco protegido, generación de documento, procesamiento OMR y conservación de usuarios/auditoría.

Un respaldo que nunca se restauró no debe considerarse verificado.

---

## 16. Desarrollo y pruebas

### Frontend

~~~bash
cd evaluaciones-frontend
npm ci
npm start
~~~

URL habitual: http://localhost:4200.

Build de producción:

~~~bash
npm run build -- --configuration production
~~~

### Backend

~~~bash
cd evaluaciones-backend
mvn test
mvn spring-boot:run
~~~

Requiere Java 21, PostgreSQL, RabbitMQ, Vault y variables correspondientes.

### Workers

~~~bash
cd evaluaciones-workers
python -m unittest discover -s . -p "test*.py"
~~~

El contenedor Typst incorpora Typst; el contenedor OMR incorpora Tesseract y las dependencias de imagen; el contenedor backup incorpora cliente PostgreSQL y Restic.

### Verificación de entrega

~~~bash
docker compose build
docker compose up -d
docker compose ps
~~~

Completar después el recorrido funcional de la sección Verificación.

---

## 17. API principal

Las rutas operativas requieren sesión y permiso apropiado, salvo las rutas públicas explícitas de autenticación y acceso virtual.

### Autenticación

| Método | Ruta | Uso |
| --- | --- | --- |
| POST | /api/auth/login | Iniciar sesión |
| GET | /api/auth/session | Consultar sesión |
| POST | /api/auth/logout | Cerrar sesión |
| POST | /api/auth/cambiar-contrasena | Cambiar contraseña temporal |

### Catálogo académico

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | /api/catalogo-academico/sedes | Sedes |
| GET | /api/catalogo-academico/carreras | Carreras por sede |
| GET | /api/catalogo-academico/asignaturas | Asignaturas |
| GET | /api/catalogo-academico/grupos | Grupos y docentes |
| GET | /api/catalogo-academico/estudiantes | Nómina |
| GET | /api/catalogo-academico/campus | Campus |
| GET | /api/catalogo-academico/gestiones | Gestiones |

### Roles y bancos

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | /api/roles-examen | Listar roles según alcance |
| POST | /api/roles-examen | Registrar rol |
| PUT | /api/roles-examen/{id} | Actualizar rol |
| POST | /api/roles-examen/{id}/transicion | Cambiar estado |
| POST | /api/roles-examen/{id}/restablecer | Restablecer con auditoría |
| GET | /api/roles-examen/{id}/auditoria | Bitácora |
| GET | /api/bancos-preguntas/{rolExamenId} | Consultar banco |
| POST | /api/bancos-preguntas/{rolExamenId}/upload | Cargar banco |
| POST | /api/bancos-preguntas/upload | Carga autorizada |
| DELETE | /api/bancos-preguntas/{rolExamenId} | Eliminar según estado y permiso |

### Generación Typst

| Método | Ruta | Uso |
| --- | --- | --- |
| POST | /api/generacion-typst | Encolar generación |
| POST | /api/generacion-typst/previsualizacion | Previsualizar |
| GET | /api/generacion-typst/cola | Consultar cola |
| GET | /api/generacion-typst/roles/{id}/documento | Obtener documento |
| GET | /api/generacion-typst/roles/{id}/configuracion | Configuración |
| GET | /api/generacion-typst/{jobId}/resultado | Resultado del trabajo |

### Cartillas y OMR

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | /api/roles-examen/{id}/cartillas/preparacion | Nómina y preparación |
| POST | /api/roles-examen/{id}/cartillas/imprimir | PDF de marcas |
| POST | /api/roles-examen/{id}/cartillas/imprimir-lista | Lista de firmas |
| POST | /api/roles-examen/{id}/cartillas/marcar-impreso | Confirmar marcas |
| POST | /api/roles-examen/{id}/cartillas/marcar-lista-impresa | Confirmar lista |
| POST | /api/omr/{id}/procesar | Procesar escaneo |
| POST | /api/omr/{id}/procesar-lectura | Lectura para conciliación |
| GET | /api/omr/jobs/{jobId} | Estado OMR |
| GET | /api/omr/{id}/calificaciones | Calificaciones |
| GET | /api/omr/configuracion | Parámetros OMR |
| PUT | /api/omr/configuracion | Actualizar parámetros |

### Sin cartilla y virtual

| Método | Ruta | Uso |
| --- | --- | --- |
| GET/POST | /api/examenes-sin-cartilla/{id}/documento | Consultar o cargar documento |
| GET | /api/examenes-sin-cartilla/{id}/documento/archivo | Descargar documento |
| GET/POST | /api/examenes-sin-cartilla/{id}/notas | Consultar o registrar notas |
| POST | /api/examenes-virtuales/salas | Crear sala |
| POST | /api/examenes-virtuales/salas/{id}/abrir | Abrir sala |
| POST | /api/examenes-virtuales/salas/{id}/iniciar | Iniciar examen |
| POST | /api/examenes-virtuales/salas/{id}/cerrar | Cerrar sala |
| POST | /api/examenes-virtuales/salas/{id}/restablecer | Restablecer sala |
| POST | /api/acceso-virtual/validar | Validar acceso |
| PUT | /api/examen-virtual/respuestas | Guardar respuestas |
| POST | /api/examen-virtual/enviar | Enviar intento |
| GET | /api/examenes-virtuales/roles/{id}/resultados | Resultados |

### Usuarios y respaldos

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | /api/usuarios | Usuarios y alcances |
| POST | /api/usuarios | Crear usuario |
| PUT | /api/usuarios/{id} | Editar usuario |
| POST | /api/usuarios/importar | Importar por lote |
| GET | /api/usuarios/plantilla | Descargar plantilla |
| POST | /api/usuarios/{id}/restablecer-contrasena | Restablecer contraseña |
| GET | /api/usuarios/docentes-sea | Analizar docentes SEA |
| POST | /api/usuarios/docentes-sea/sincronizar | Sincronizar docentes |
| GET/PUT | /api/backups/config | Configurar respaldos |
| GET/POST | /api/backups | Consultar o crear respaldo |
| POST | /api/backups/{id}/verify | Verificar respaldo |
| POST | /api/backups/{id}/restore | Restaurar respaldo |

---

## 18. Seguridad

### Lista previa a producción

- [ ] Usar tag o commit aprobado.
- [ ] Cambiar contraseña inicial de admin.
- [ ] Cambiar DB password, RabbitMQ password y JWT secret.
- [ ] Configurar credenciales reales de SEA/SISA.
- [ ] Crear tokens Vault separados por servicio.
- [ ] Custodiar llaves de desbloqueo con responsables separados.
- [ ] Configurar TLS en el proxy inverso.
- [ ] No publicar DB, RabbitMQ ni Vault.
- [ ] Configurar respaldos externos.
- [ ] Probar restauración.
- [ ] Aplicar permisos restrictivos a .env y vault/secrets/.
- [ ] Revisar sedes, carreras, campus y usuarios.
- [ ] Buscar secretos en árbol e historial Git.
- [ ] Confirmar que los logs no impriman preguntas ni claves.

### Si se expone un secreto

1. revocar o rotar el secreto;
2. registrar el incidente;
3. eliminarlo del árbol e historial según política institucional;
4. emitir credenciales nuevas;
5. validar los servicios.

Eliminarlo del último commit no invalida un token que ya quedó expuesto: primero debe rotarse.

---

## 19. Problemas frecuentes

### Frontend antiguo

~~~bash
docker compose build frontend
docker compose up -d --no-deps frontend
~~~

Después usar Ctrl + F5.

### Login o módulos no disponibles

Revisar estado del backend, cuenta activa, rol, contraseña temporal, alcance y expiración de sesión.

### Importación con 403 Forbidden

Normalmente significa sesión expirada, rol insuficiente o usuario fuera del permiso requerido. Revisar primero la cuenta y el rol. Luego comprobar que se utilice la plantilla descargada desde Usuarios y accesos -> Plantilla Excel.

### Plan sin carreras

Revisar gateway SEA/SISA, sede seleccionada y asignaciones de sede-carrera. Los códigos deben coincidir exactamente con SEA.

### Vault sellado

~~~bash
docker compose logs --tail=100 vault-bootstrap
docker compose logs --tail=100 vault
~~~

Confirmar unseal-keys y vaultdata. No reinicializar ni borrar volumen.

### Backend reiniciándose

~~~bash
docker compose logs --tail=200 backend
~~~

Revisar DB, RabbitMQ, Vault, gateway, variables, migraciones y permisos de storage/.

### Examen no generado

Revisar estado del rol, banco validado, worker-typst, RabbitMQ, VAULT_WORKER_TOKEN, logo, espacio en disco y resultado del job.

### OMR no procesa

Revisar worker-omr, Tesseract, grilla completa, código dentro de la nómina, cantidad de páginas y calidad del escaneo. Los códigos no reconocidos quedan en revisión manual.

### Fórmulas o subíndices incorrectos

Revisar sintaxis dentro de $...$, evitar prefijos de incisos y poner expresiones largas en línea independiente. Siempre revisar la previsualización.

### Sin cartilla pendiente de notas

Es esperado si todavía no se registró y confirmó la calificación manual. No forzar CALIFICADO sin resultados verificados.

---

## 20. Limitaciones y pendientes

- La autenticación local está preparada para evolucionar a Keycloak, pero el SSO institucional requiere configuración y pruebas.
- Vault está en el mismo servidor en la configuración actual; para ambientes críticos se recomienda KMS/HSM y TLS externo.
- La sobreimpresión OMR debe probarse físicamente con la impresora y la cartilla institucional.
- Cambiar parámetros OMR aplica a nuevos procesamientos; no recalcula automáticamente históricos.
- Debe definirse la política de retención de documentos y escaneos.
- Los respaldos deben restaurarse periódicamente en ambiente aislado.
- Las advertencias de tamaño de bundle Angular y dependencias CommonJS son optimizaciones pendientes; no impiden la compilación.
- Una pantalla visible no equivale a una funcionalidad productiva: deben verificarse endpoint, permiso, persistencia, auditoría y recuperación.

---

## 21. Documentación complementaria

| Documento | Contenido |
| --- | --- |
| [guia_despliegue.md](guia_despliegue.md) | Instalación, Vault, arranque, actualización, respaldos y contingencia |
| [alcance.md](alcance.md) | Alcance funcional y hoja de ruta |
| [docs/validacion-banco-preguntas.md](docs/validacion-banco-preguntas.md) | Formato Excel, tipologías y validaciones |
| [docs/cifrado-banco-preguntas.md](docs/cifrado-banco-preguntas.md) | DEK, KEK, Vault, migración y rotación |
| [docs/modulo-usuarios-accesos.md](docs/modulo-usuarios-accesos.md) | Usuarios, roles, sedes, carreras y campus |
| [docs/modulo-plan-estudios.md](docs/modulo-plan-estudios.md) | Plan y catálogos SEA |
| [docs/modulo-rol-examenes.md](docs/modulo-rol-examenes.md) | Roles, versiones y estados |
| [docs/modulo-cartillas-omr.md](docs/modulo-cartillas-omr.md) | Cartillas, escaneo y calibración OMR |
| [docs/modulo-conciliacion-remark-omr.md](docs/modulo-conciliacion-remark-omr.md) | Conciliación Remark vs. OMR |
| [docs/modulo-examen-sin-cartilla.md](docs/modulo-examen-sin-cartilla.md) | Flujo sin cartilla |
| [docs/modulo-examen-virtual.md](docs/modulo-examen-virtual.md) | Salas, acceso y resultados |
| [docs/modulo-seguridad-acceso.md](docs/modulo-seguridad-acceso.md) | Sesión, roles y credenciales |
| [docs/flujo-secuencia-uso-examenes.md](docs/flujo-secuencia-uso-examenes.md) | Secuencia operativa completa |
| [evaluaciones-workers/README.md](evaluaciones-workers/README.md) | Ejecución y pruebas de workers |

## Uso institucional

El código, la configuración, los documentos y los datos de estudiantes son de uso institucional. La distribución, copia, publicación, acceso a secretos y tratamiento de información académica deben sujetarse a las políticas de UNITEPC y de seguridad de la información.

