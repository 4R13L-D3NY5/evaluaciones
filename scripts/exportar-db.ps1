<#
.SYNOPSIS
    Exporta un dump logico de PostgreSQL (.dump formato custom) desde el contenedor Docker.
.DESCRIPTION
    Genera una copia completa de la base de datos sea_evaluaciones para pruebas locales
    o traslado de entorno. El archivo resultante es compatible con scripts/importar-db-local.ps1.
.PARAMETER OutputPath
    Ruta de destino del archivo .dump. Por defecto guarda en storage/dumps con timestamp.
#>
param(
    [string]$OutputPath = ""
)

$ErrorActionPreference = 'Stop'
$proyecto = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $proyecto

# Validar contenedor de base de datos
$dbRunning = docker ps --filter "name=evaluaciones-db" --filter "status=running" -q
if (-not $dbRunning) {
    throw "El contenedor 'evaluaciones-db' no esta en ejecucion. Inicie los contenedores con 'docker compose up -d' primero."
}

if (-not $OutputPath) {
    $dumpsDir = Join-Path $proyecto "storage\dumps"
    if (-not (Test-Path $dumpsDir)) {
        New-Item -ItemType Directory -Path $dumpsDir -Force | Out-Null
    }
    $fecha = Get-Date -Format "yyyyMMdd_HHmmss"
    $OutputPath = Join-Path $dumpsDir "sea_evaluaciones_$fecha.dump"
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " EXPORTAR BASE DE DATOS SEA / SISA (.DUMP)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Destino: $OutputPath" -ForegroundColor Yellow

# Ejecutar pg_dump dentro del contenedor de PostgreSQL
Write-Host "Generando dump logico de PostgreSQL (formato custom comprimido)..." -ForegroundColor Gray
docker exec -e PGPASSWORD=postgres evaluaciones-db pg_dump -U postgres -d sea_evaluaciones --format=custom --no-owner --no-privileges --file=/tmp/export_db.dump

# Extraer del contenedor al host
docker cp evaluaciones-db:/tmp/export_db.dump $OutputPath
docker exec evaluaciones-db rm -f /tmp/export_db.dump

if (Test-Path $OutputPath) {
    $item = Get-Item $OutputPath
    $tamanoMb = [math]::Round($item.Length / 1MB, 2)
    Write-Host ""
    Write-Host "EXPORTACION EXITOSA" -ForegroundColor Green
    Write-Host "  - Archivo: $($item.FullName)"
    Write-Host "  - Tamano:  $($item.Length) bytes ($tamanoMb MB)"
    Write-Host ""
    Write-Host "Para importar este dump en otra PC o entorno local, ejecute:" -ForegroundColor Cyan
    Write-Host "  powershell -ExecutionPolicy Bypass -File scripts/importar-db-local.ps1 -DumpPath `"$($item.FullName)`"" -ForegroundColor White
} else {
    throw "No se pudo generar el archivo de exportacion."
}
