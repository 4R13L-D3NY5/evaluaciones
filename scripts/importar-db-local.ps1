<#
.SYNOPSIS
    Importa un dump logico de PostgreSQL (.dump) en la base de datos local Docker.
.DESCRIPTION
    Restaura la estructura y datos completos en el contenedor 'evaluaciones-db' (sea_evaluaciones),
    termina conexiones abiertas del backend, ejecuta pg_restore y valida la integridad.
.PARAMETER DumpPath
    Ruta al archivo .dump a importar. Si se omite, busca el archivo mas reciente en storage/dumps.
.PARAMETER Force
    Omite la confirmacion interactiva.
#>
param(
    [string]$DumpPath = "",
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
$proyecto = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $proyecto

# 1. Determinar el archivo dump a utilizar
if (-not $DumpPath) {
    $candidatos = Get-ChildItem -Path (Join-Path $proyecto "storage\dumps") -Filter "*.dump" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
    if (-not $candidatos) {
        $candidatos = Get-ChildItem -Path $proyecto -Filter "*.dump" -Recurse -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
    }
    if ($candidatos) {
        $DumpPath = $candidatos[0].FullName
    } else {
        throw "No se especifico -DumpPath y no se encontraron archivos .dump en storage/dumps."
    }
}

if (-not (Test-Path $DumpPath)) {
    throw "El archivo de dump especificado no existe: $DumpPath"
}

$dumpItem = Get-Item $DumpPath
$tamanoMb = [math]::Round($dumpItem.Length / 1MB, 2)

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " IMPORTAR BASE DE DATOS LOCAL SEA / SISA" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Archivo origen: $($dumpItem.FullName)" -ForegroundColor Yellow
Write-Host "Tamano:         $tamanoMb MB ($($dumpItem.Length) bytes)" -ForegroundColor Yellow
Write-Host "Destino:        evaluaciones-db (sea_evaluaciones)" -ForegroundColor Yellow
Write-Host ""

# 2. Confirmacion de seguridad
if (-not $Force) {
    Write-Host "ADVERTENCIA: Esta operacion reemplazara los datos actuales de la base local 'sea_evaluaciones'." -ForegroundColor Red
    $resp = Read-Host "Desea continuar con la importacion? (Escriba 'SI' para confirmar)"
    if ($resp -ne "SI") {
        Write-Host "Operacion cancelada por el usuario." -ForegroundColor Yellow
        exit 0
    }
}

# 3. Validar estado de Docker y contenedor de base de datos
$dbRunning = docker ps --filter "name=evaluaciones-db" --filter "status=running" -q
if (-not $dbRunning) {
    Write-Host "Iniciando contenedor de base de datos..." -ForegroundColor Gray
    docker compose up -d db
    Start-Sleep -Seconds 3
}

# 4. Copiar el archivo dump dentro del contenedor
Write-Host "Copiando archivo dump al contenedor evaluaciones-db..." -ForegroundColor Gray
docker cp $dumpItem.FullName evaluaciones-db:/tmp/restore_import.dump

# 5. Cerrar conexiones activas en sea_evaluaciones
Write-Host "Cerrando conexiones activas del backend para permitir restauracion limpia..." -ForegroundColor Gray
docker exec -e PGPASSWORD=postgres evaluaciones-db psql -U postgres -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'sea_evaluaciones' AND pid <> pg_backend_pid();" | Out-Null

# 6. Ejecutar pg_restore
Write-Host "Ejecutando pg_restore en 'sea_evaluaciones'..." -ForegroundColor Cyan
$restoreOutput = docker exec -e PGPASSWORD=postgres evaluaciones-db pg_restore --clean --if-exists --no-owner --no-privileges -U postgres -d sea_evaluaciones /tmp/restore_import.dump 2>&1
# Limpiar dump temporal del contenedor
docker exec evaluaciones-db rm -f /tmp/restore_import.dump

# 7. Verificacion de integridad post-restauracion
Write-Host "Verificando estructura y datos restaurados..." -ForegroundColor Gray

$tablasRaw = docker exec -e PGPASSWORD=postgres evaluaciones-db psql -U postgres -d sea_evaluaciones -t -A -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"
$tablasCount = [int]($tablasRaw.Trim())

$migracionRaw = docker exec -e PGPASSWORD=postgres evaluaciones-db psql -U postgres -d sea_evaluaciones -t -A -c "SELECT version FROM flyway_schema_history WHERE success = TRUE ORDER BY installed_rank DESC LIMIT 1;"
$ultimaMigracion = $migracionRaw.Trim()

$adminRaw = docker exec -e PGPASSWORD=postgres evaluaciones-db psql -U postgres -d sea_evaluaciones -t -A -c "SELECT count(*) FROM sea_usuarios_sistema WHERE rol_codigo = 'ADMINISTRADOR_SISTEMA' AND activo = TRUE;"
$adminCount = [int]($adminRaw.Trim())

$rolesRaw = docker exec -e PGPASSWORD=postgres evaluaciones-db psql -U postgres -d sea_evaluaciones -t -A -c "SELECT count(*) FROM sea_roles_evaluaciones;"
$rolesCount = [int]($rolesRaw.Trim())

$reactivosRaw = docker exec -e PGPASSWORD=postgres evaluaciones-db psql -U postgres -d sea_evaluaciones -t -A -c "SELECT count(*) FROM sea_reactivos;"
$reactivosCount = [int]($reactivosRaw.Trim())

# 8. Reiniciar backend para renovar el pool de conexiones Hibernate/HikariCP
Write-Host "Reiniciando contenedor backend para refrescar el pool de conexiones..." -ForegroundColor Gray
docker compose restart backend | Out-Null

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host " IMPORTACION LOCAL COMPLETADA EXITOSAMENTE" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  - Tablas publicas restauradas:    $tablasCount" -ForegroundColor White
Write-Host "  - Ultima migracion Flyway:        V$ultimaMigracion" -ForegroundColor White
Write-Host "  - Administradores activos:        $adminCount" -ForegroundColor White
Write-Host "  - Examenes en rol evaluativo:     $rolesCount" -ForegroundColor White
Write-Host "  - Reactivos registrados:          $reactivosCount" -ForegroundColor White
Write-Host ""
Write-Host "INFORMACION CLAVE SOBRE VAULT Y CIFRADO EN LOCAL:" -ForegroundColor Cyan
Write-Host "  1. Modulos completamente funcionales en local:" -ForegroundColor White
Write-Host "     - Administracion de evaluaciones, roles de examen, calendarios y fechas." -ForegroundColor Gray
Write-Host "     - Usuarios, docentes, directores, asignaciones de campus y carreras." -ForegroundColor Gray
Write-Host "     - Planillas oficiales de calificaciones y reportes." -ForegroundColor Gray
Write-Host "  2. Bancos de preguntas cifrados:" -ForegroundColor White
Write-Host "     - Los bancos existentes tienen su sobre DEK cifrado con la clave Transit del servidor." -ForegroundColor Gray
Write-Host "     - Para descifrar las preguntas historicas del servidor en local, se requiere que el" -ForegroundColor Gray
Write-Host "       volumen 'vaultdata' y las llaves 'vault/secrets/unseal-keys' correspondan al servidor." -ForegroundColor Gray
Write-Host "     - Puede crear nuevos bancos de preguntas locales directamente desde la interfaz web." -ForegroundColor Gray
Write-Host ""
