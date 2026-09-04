$ErrorActionPreference = 'Stop'

$proyecto = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $proyecto

$dockerDesktop = Join-Path ${env:ProgramFiles} 'Docker\Docker\Docker Desktop.exe'
if (Test-Path -LiteralPath $dockerDesktop) {
  docker info *> $null
  if ($LASTEXITCODE -ne 0) {
    Start-Process -FilePath $dockerDesktop -WindowStyle Hidden
  }
}

$limite = (Get-Date).AddMinutes(3)
do {
  docker info *> $null
  if ($LASTEXITCODE -eq 0) { break }
  Start-Sleep -Seconds 5
} while ((Get-Date) -lt $limite)

docker info *> $null
if ($LASTEXITCODE -ne 0) {
  throw 'Docker no está disponible. Inicie Docker Desktop y vuelva a ejecutar este archivo.'
}

docker compose up -d
docker compose ps
