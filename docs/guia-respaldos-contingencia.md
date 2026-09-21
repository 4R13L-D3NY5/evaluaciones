# Manual Operativo: Respaldos, Contingencia y Sincronización Local SEA/SISA

Manual técnico y operativo para el Administrador del Servidor y el equipo de desarrollo. Cubre la custodia de secretos, snapshots Restic deduplicados, restauración ante desastres (Disaster Recovery) y el procedimiento para traer la base de datos a entornos locales de desarrollo.

---

## 1. Resumen Arquitectónico

El sistema de respaldos del SEA/SISA implementa una estrategia de alta resiliencia basada en tres pilares:

1. **Snapshots Cifrados y Deduplicados (Restic):**
   - Repositorio Local: `./backups` (`/app/backups/repository`)
   - Repositorio Externo: `./backups-external` (`/app/backups-external/repository`)
   - Encriptación en reposo: Contraseña custodiada en `./vault/secrets/restic-password`.
2. **Cifrado de Bancos de Preguntas (Envelope Encryption con HashiCorp Vault Transit KMS):**
   - La base de datos almacena el texto sensible de los reactivos y variantes cifrado con AES-256-GCM.
   - Cada paquete de examen posee su propia DEK (Data Encryption Key), la cual está envuelta (*wrapped*) por la KEK institucional (`sea-banco-kek`) de Vault.
   - El respaldo de PostgreSQL contiene los esquemas, roles, usuarios, sedes, materias, calificaciones y metadatos completos, pero los reactivos solo pueden descifrarse con un Vault que posea la clave Transit correspondiente.
3. **Almacenamiento Persistente Compartido (`storage`):**
   - Archivos PDF oficiales de exámenes, escaneos OMR y carátulas generadas.
   - Manifiesto de integridad criptográfica (`manifest.json`) con hashes SHA-256 de cada archivo.

```
       +-------------------------------------------------------------+
       |                  EVALUACIONES-BACKEND                       |
       |  (API REST /api/backups - Solo ADMINISTRADOR_SISTEMA)      |
       +------------------------------+------------------------------+
                                      | RabbitMQ (evaluaciones.backups)
                                      v
       +-------------------------------------------------------------+
       |                 EVALUACIONES-WORKER-BACKUP                  |
       |  - pg_dump custom (-Fc) -> sea_evaluaciones.dump            |
       |  - SHA-256 manifest -> storage/manifest.json                |
       |  - Restic backup (deduplicación + cifrado)                  |
       |  - Restic check & restore aislado                           |
       +--------------+------------------------------+---------------+
                      |                              |
                      v                              v
           [Repositorio Local]             [Repositorio Externo]
            ./backups/repository          ./backups-external/repository
```

---

## 2. Ciclo de Vida de los Respaldos

| Estado | Significado | Acciones Permitidas |
|---|---|---|
| **`SOLICITADO`** | Petición encolada en RabbitMQ | Ninguna (en espera) |
| **`EN_PROCESO`** | `pg_dump` y creación de snapshot Restic local | Ninguna (en ejecución) |
| **`GENERADO`** | Snapshot local creado; dump exportable listo | `Copiar al externo`, `Descargar dump` |
| **`COPIANDO`** | Transfiriendo bloques deduplicados a repositorio externo | Ninguna (en ejecución) |
| **`COPIADO`** | Copia transferida al destino externo | `Verificar integridad` |
| **`VERIFICANDO`** | Ejecutando `restic check` de paridad | Ninguna (en ejecución) |
| **`VERIFICADO`** | Snapshot 100% certificado e íntegro | `Descargar dump`, `Eliminar copia local`, `Restaurar` |
| **`ELIMINADO`** | Copia local depurada; copia externa conservada | `Descargar dump` (vía worker), `Restaurar` |
| **`ERROR`** | Fallo registrado en auditoría con causa técnica | `Reintentar` |

---

## 3. Procedimiento para Traer la Base de Datos a Local (Desarrollo y Pruebas)

Para realizar pruebas en una máquina local con datos similares al servidor:

### Opción A: Descarga Directa desde la Interfaz Web (Recomendada)
1. Inicie sesión en el sistema como `ADMINISTRADOR_SISTEMA`.
2. Diríjase a **Administración** $\rightarrow$ **Respaldos y contingencia**.
3. En la tabla de historial, localice un respaldo en estado **`GENERADO`** o **`VERIFICADO`**.
4. Haga clic en el botón azul con icono de descarga (**Descargar dump de BD**).
5. El navegador descargará el archivo `sea_evaluaciones_BKP-XXX.dump`.
6. En su máquina local, abra PowerShell en la raíz del proyecto y ejecute:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/importar-db-local.ps1 -DumpPath "C:\ruta\sea_evaluaciones_BKP-XXX.dump"
   ```

### Opción B: Exportación por Script de Servidor
Si tiene acceso directo al servidor mediante SSH o consola:
1. Ejecute en la raíz del proyecto:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/exportar-db.ps1
   ```
2. El script generará un archivo `.dump` en `storage/dumps/sea_evaluaciones_YYYYMMDD_HHMMSS.dump`.
3. Copie ese archivo a su PC local.
4. En su PC local, restáurelo ejecutando:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/importar-db-local.ps1 -DumpPath ".\storage\dumps\sea_evaluaciones_YYYYMMDD_HHMMSS.dump" -Force
   ```

### ¿Qué datos se restauran y qué consideraciones aplican con Vault?
- **100% Funcional de Inmediato en Local:**
  - Todas las tablas académicas, carreras, asignaturas, planes y grupos.
  - El rol de exámenes completo, fechas, horarios y aulas.
  - Docentes, directores de carrera, verificadores y personal de evaluaciones.
  - Estudiantes inscritos, asistencias, notas sobre 60 puntos y planillas oficiales.
  - Auditoría del sistema, historial de cambios y configuraciones institucionales.
- **Bancos de Preguntas Cifrados:**
  - Como el servidor usa Vault Transit KMS, el contenido de los reactivos históricos del servidor requiere la KEK del servidor para descifrarse.
  - Si en local necesita leer las preguntas del servidor: copie el volumen `vaultdata` y el archivo `vault/secrets/unseal-keys` del servidor.
  - Si solo necesita probar flujos, calificación, reportes o subir nuevos exámenes: puede crear y validar nuevos bancos de preguntas locales libremente.

---

## 4. Procedimiento de Recuperación ante Desastres (Disaster Recovery)

Si el servidor principal queda completamente inoperativo o se requiere migrar a un nuevo hardware:

### Paso 1: Requisitos Previos en el Nuevo Servidor
- Docker Engine 24+ y Docker Compose v2.
- Repositorio del proyecto clonado en el nuevo servidor.
- Los secretos institucionales custodiados fuera del servidor:
  - `vault/secrets/unseal-keys` (las 3 llaves de desbloqueo de Vault).
  - `vault/secrets/restic-password` (la clave del repositorio Restic).
  - Copia del repositorio externo de respaldos (`./backups-external`).

### Paso 2: Despliegue de la Infraestructura Base
```powershell
docker compose up -d db rabbitmq vault vault-bootstrap
```
Verifique que los servicios estén saludables:
```powershell
docker compose ps
```

### Paso 3: Restauración de los Datos Cifrados de Vault
Si se dispone del respaldo del volumen de Vault (`vaultdata`):
```powershell
docker run --rm -v evaluaciones_vaultdata:/target -v ${PWD}/vault_backup:/source alpine cp -r /source/* /target/
docker compose restart vault vault-bootstrap
```

### Paso 4: Restauración de la Base de Datos y Almacenamiento
Inicie el worker de respaldos:
```powershell
docker compose up -d worker-backup
```
En el worker, ejecute la extracción del último snapshot verificado del repositorio externo:
```bash
docker exec -it evaluaciones-worker-backup bash
restic -r /app/backups-external/repository restore latest --target /tmp/recovery
# Restaurar la base de datos PostgreSQL:
pg_restore --clean --if-exists --no-owner --no-privileges -h db -U postgres -d sea_evaluaciones /tmp/recovery/app/backups/staging/*/sea_evaluaciones.dump
# Restaurar el almacenamiento de archivos:
cp -rn /tmp/recovery/app/storage/* /app/storage/
exit
```

### Paso 5: Levantamiento de Servicios de Aplicación
```powershell
docker compose up -d backend frontend worker-typst worker-omr
docker compose ps
```
Compruebe que `evaluaciones-backend` aplique migraciones Flyway pendientes (si hubiera) y pase a estado `healthy`.

---

## 5. Pruebas de Integridad y Corrupción Certificadas

El módulo cuenta con un suite automatizado que certifica:
1. **Validación de Checksums SHA-256:** Ningún archivo de `storage` es modificado o truncado.
2. **Detección de Corrupción Controlada:** Si un solo byte de cualquier archivo es alterado, `validate_manifest` lo detecta y aborta la restauración.
3. **Restauración Aislada:** La restauración se prueba periódicamente en una base de datos temporal (`sea_evaluaciones_restore_test`) garantizando que producción nunca sufra sobrescrituras accidentales.

Para ejecutar la prueba técnica de certificación en cualquier momento:
```bash
docker exec evaluaciones-worker-backup python /app/test_isolated_restore.py
```
Resultado certificado:
- **Paso 1:** Validación de integridad SHA-256 (354 archivos conformes).
- **Paso 2:** Detección de corrupción deliberada verificada al 100%.
- **Paso 3:** Base de datos temporal creada y restaurada con 35 tablas y Flyway V41.
- **Paso 4:** Admin activo, reactivos y bancos verificados; base temporal destruida sin efectos colaterales.
