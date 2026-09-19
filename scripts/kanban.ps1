<#
.SYNOPSIS
    Sincronizador automatico del Tablero Kanban (docs/kanban-tareas.md y tasks.html)
.DESCRIPTION
    Permite a los agentes o desarrolladores mover, completar y consultar tareas
    del tablero sincronizando Markdown y HTML atomicamente.
.EXAMPLE
    powershell -ExecutionPolicy Bypass -File scripts/kanban.ps1 move T-005 progress
    powershell -ExecutionPolicy Bypass -File scripts/kanban.ps1 move T-005 review -Notes "Implementacion concluida"
    powershell -ExecutionPolicy Bypass -File scripts/kanban.ps1 done T-005 -Notes "Validado con usuario"
    powershell -ExecutionPolicy Bypass -File scripts/kanban.ps1 status
#>
param(
    [Parameter(Position=0, Mandatory=$true)]
    [string]$Action,

    [Parameter(Position=1)]
    [string]$TaskId,

    [Parameter(Position=2)]
    [string]$TargetStatus,

    [string]$Notes = '',
    [string]$Date = (Get-Date -Format 'yyyy-MM-dd')
)

$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$mdPath = Join-Path $root 'docs\kanban-tareas.md'
$htmlPath = Join-Path $root 'tasks.html'

if (-not (Test-Path $mdPath)) {
    Write-Error "No se encontro $mdPath"
    exit 1
}

$utf8 = [System.Text.Encoding]::UTF8

# Mapeo de estados a nombres de seccion en Markdown
$statusMap = @{
    'pending'       = 'Pendiente'
    'pendiente'     = 'Pendiente'
    'progress'      = 'En progreso'
    'progreso'      = 'En progreso'
    'en progreso'   = 'En progreso'
    'en-progreso'   = 'En progreso'
    'review'        = 'En revisi' + [char]0x00F3 + 'n'
    'revision'      = 'En revisi' + [char]0x00F3 + 'n'
    'en revision'   = 'En revisi' + [char]0x00F3 + 'n'
    'en-revision'   = 'En revisi' + [char]0x00F3 + 'n'
    'blocked'       = 'Bloqueada'
    'bloqueada'     = 'Bloqueada'
    'done'          = 'Completada'
    'completada'    = 'Completada'
}

$statusToKey = @{
    'Pendiente'                           = 'pending'
    'En progreso'                         = 'progress'
    ('En revisi' + [char]0x00F3 + 'n')     = 'review'
    'Bloqueada'                           = 'blocked'
    'Completada'                          = 'done'
}

$secPendiente = '### Pendiente'
$secProgreso  = '### En progreso'
$secRevision  = '### En revisi' + [char]0x00F3 + 'n'
$secBloqueada = '### Bloqueada'
$secCompletada= '### Completada'

$sectionHeaders = @($secPendiente, $secProgreso, $secRevision, $secBloqueada, $secCompletada)

function Get-KanbanStatus {
    $content = [System.IO.File]::ReadAllText($mdPath, $utf8)
    Write-Host '=== ESTADO ACTUAL DEL KANBAN ===' -ForegroundColor Cyan
    foreach ($section in $sectionHeaders) {
        $headerName = $section.Replace('### ', '')
        $secRegex = '(?s)' + [regex]::Escape($section) + '\r?\n(.*?)(?=\r?\n### |\r?\n## |\Z)'
        $match = [regex]::Match($content, $secRegex)
        if ($match.Success) {
            $sectionBody = $match.Groups[1].Value
            $taskRegex = '(?m)^####\s+(T-\d+)\s*[-—\u2014]\s*(.*)$'
            $tasks = [regex]::Matches($sectionBody, $taskRegex)
            Write-Host "$headerName ($($tasks.Count)):" -ForegroundColor Yellow
            foreach ($t in $tasks) {
                Write-Host "  - $($t.Groups[1].Value) -- $($t.Groups[2].Value.Trim())"
            }
        }
    }
}

if ($Action -eq 'status' -or $Action -eq 'list') {
    Get-KanbanStatus
    exit 0
}

if ($Action -eq 'done') {
    if (-not $TaskId) { Write-Error 'Debe especificar el TaskId (ej: T-005)'; exit 1 }
    $Action = 'move'
    $TargetStatus = 'done'
}

if ($Action -eq 'move') {
    if (-not $TaskId) { Write-Error 'Debe especificar el TaskId (ej: T-005)'; exit 1 }
    if (-not $TargetStatus) { Write-Error 'Debe especificar el estado de destino (pending, progress, review, blocked, done)'; exit 1 }
    
    $cleanStatusKey = $TargetStatus.ToLower().Trim()
    if (-not $statusMap.ContainsKey($cleanStatusKey)) {
        Write-Error "Estado invalido: '$TargetStatus'. Use: pending, progress, review, blocked, done."
        exit 1
    }
    $targetSectionName = $statusMap[$cleanStatusKey]
    $targetHtmlKey = $statusToKey[$targetSectionName]
    $cleanTaskId = $TaskId.ToUpper().Trim()

    # 1. ACTUALIZAR docs/kanban-tareas.md
    $mdRaw = [System.IO.File]::ReadAllText($mdPath, $utf8)

    # Buscar la tarjeta completa
    $cardPattern = '(?s)(?m)^####\s+' + [regex]::Escape($cleanTaskId) + '\b.*?(?=\r?\n####\s|\r?\n###\s|\Z)'
    $cardMatch = [regex]::Match($mdRaw, $cardPattern)
    if (-not $cardMatch.Success) {
        Write-Error "No se encontro la tarea $cleanTaskId en $mdPath"
        exit 1
    }

    $cardContent = $cardMatch.Value.TrimEnd()

    # Si se pasa a Completada, actualizar fecha limite
    if ($targetSectionName -eq 'Completada') {
        if ($cardContent -match '(?m)^- Fecha l' + [char]0x00ED + 'mite:.*$') {
            $cardContent = [regex]::Replace($cardContent, '(?m)^- Fecha l' + [char]0x00ED + 'mite:.*$', "- Fecha l" + [char]0x00ED + "mite: $Date")
        }
    }

    # Si hay notas nuevas, incorporarlas
    if ($Notes) {
        if ($cardContent -match '(?m)^- Notas:\s*(.*)$') {
            $oldNotes = $matches[1]
            $updatedNotes = "- Notas: $oldNotes $Notes".Trim()
            $cardContent = [regex]::Replace($cardContent, '(?m)^- Notas:.*$', $updatedNotes)
        } else {
            $cardContent += "`r`n- Notas: $Notes"
        }
    }

    # Remover la tarjeta de su ubicacion actual
    $removePattern = '(?s)(?m)^####\s+' + [regex]::Escape($cleanTaskId) + '\b.*?(?=\r?\n####\s|\r?\n###\s|\Z)(?:\r?\n)*'
    $mdWithoutCard = [regex]::Replace($mdRaw, $removePattern, '')

    # Insertar la tarjeta en la seccion de destino
    $targetSecPattern = '(?s)(### ' + [regex]::Escape($targetSectionName) + '\r?\n)(.*?)(?=\r?\n### |\r?\n## |\Z)'
    $targetMatch = [regex]::Match($mdWithoutCard, $targetSecPattern)
    if ($targetMatch.Success) {
        $existingBody = $targetMatch.Groups[2].Value
        $cleanExisting = $existingBody -replace '\s*\*\(Sin tareas activas\)\*\s*', '' -replace '\s*_Sin tareas\._\s*', ''
        $newBody = "`r`n" + $cardContent.Trim() + "`r`n`r`n" + $cleanExisting.Trim()
        $mdWithoutCard = [regex]::Replace($mdWithoutCard, $targetSecPattern, "`$1$newBody`r`n")
    } else {
        Write-Error "No se encontro la seccion '### $targetSectionName' en $mdPath"
        exit 1
    }

    # Asegurar que secciones vacias tengan su placeholder
    $emptyProgreso = '(?s)### En progreso\r?\n\s*(?=\r?\n### |\r?\n## |\Z)'
    if ($mdWithoutCard -match $emptyProgreso) {
        $mdWithoutCard = [regex]::Replace($mdWithoutCard, $emptyProgreso, "### En progreso`r`n`r`n*(Sin tareas activas)*`r`n")
    }
    $emptyBloqueada = '(?s)### Bloqueada\r?\n\s*(?=\r?\n### |\r?\n## |\Z)'
    if ($mdWithoutCard -match $emptyBloqueada) {
        $mdWithoutCard = [regex]::Replace($mdWithoutCard, $emptyBloqueada, "### Bloqueada`r`n`r`n_Sin tareas._`r`n")
    }

    # Recalcular conteos
    $counts = @{
        'Pendiente'                           = 0
        'En progreso'                         = 0
        ('En revisi' + [char]0x00F3 + 'n')     = 0
        'Bloqueada'                           = 0
        'Completada'                          = 0
    }

    foreach ($sec in $sectionHeaders) {
        $secName = $sec.Replace('### ', '')
        $secRegex = '(?s)' + [regex]::Escape($sec) + '\r?\n(.*?)(?=\r?\n### |\r?\n## |\Z)'
        $secM = [regex]::Match($mdWithoutCard, $secRegex)
        if ($secM.Success) {
            $body = $secM.Groups[1].Value
            $taskMatches = [regex]::Matches($body, '(?m)^####\s+T-\d+')
            $counts[$secName] = $taskMatches.Count
        }
    }

    # Actualizar tabla ## Resumen
    $cPending = $counts['Pendiente']
    $cProg    = $counts['En progreso']
    $cRev     = $counts['En revisi' + [char]0x00F3 + 'n']
    $cBlock   = $counts['Bloqueada']
    $cDone    = $counts['Completada']

    $resumenPattern = '(?s)## Resumen\s*\r?\n\r?\n\| Indicador \| Total \|\r?\n\|---\|---:\|\r?\n\| Pendientes \| \d+ \|\r?\n\| En progreso \| \d+ \|\r?\n\| En revisi' + [char]0x00F3 + 'n \| \d+ \|\r?\n\| Bloqueadas \| \d+ \|\r?\n\| Completadas \| \d+ \|'
    
    $pipe = '|'
    $strRev = 'En revisi' + [char]0x00F3 + 'n'
    $newResumen = "## Resumen`r`n`r`n$pipe Indicador $pipe Total $pipe`r`n$pipe---$pipe---:$pipe`r`n$pipe Pendientes $pipe $cPending $pipe`r`n$pipe En progreso $pipe $cProg $pipe`r`n$pipe $strRev $pipe $cRev $pipe`r`n$pipe Bloqueadas $pipe $cBlock $pipe`r`n$pipe Completadas $pipe $cDone $pipe"

    if ($mdWithoutCard -match $resumenPattern) {
        $mdWithoutCard = [regex]::Replace($mdWithoutCard, $resumenPattern, $newResumen)
    }

    [System.IO.File]::WriteAllText($mdPath, $mdWithoutCard, $utf8)
    Write-Host "[$cleanTaskId] movida a '$targetSectionName' en docs/kanban-tareas.md" -ForegroundColor Green

    # 2. ACTUALIZAR tasks.html
    if (Test-Path $htmlPath) {
        $htmlRaw = [System.IO.File]::ReadAllText($htmlPath, $utf8)

        # Extraer articulo de la tarjeta
        $cardHtmlPattern = '(?s)<article\s+class="card"\s+data-id="' + [regex]::Escape($cleanTaskId) + '".*?</article>'
        $cardHtmlMatch = [regex]::Match($htmlRaw, $cardHtmlPattern)
        if ($cardHtmlMatch.Success) {
            $cardHtml = $cardHtmlMatch.Value
            
            # Actualizar data-status
            $cardHtml = [regex]::Replace($cardHtml, 'data-status="[^"]*"', "data-status=""$targetHtmlKey""")

            # Actualizar seleccion de opcion en move-select
            $cardHtml = [regex]::Replace($cardHtml, ' selected(?=>)', '')
            $cardHtml = [regex]::Replace($cardHtml, "(<option\s+value=""$targetHtmlKey"")", '$1 selected')

            # Remover del html
            $htmlWithoutCard = [regex]::Replace($htmlRaw, $cardHtmlPattern, '')

            # Insertar en la columna adecuada
            $colPattern = '(<div\s+class="column\s+' + $targetHtmlKey + '"><div\s+class="column-heading">.*?</div>)'
            if ($htmlWithoutCard -match $colPattern) {
                $htmlWithoutCard = [regex]::Replace($htmlWithoutCard, $colPattern, "`$1`r`n        $cardHtml")
            }

            # Actualizar resumen superior en html
            $summaryPattern = '(?s)<div class="summary" aria-label="Resumen">\s*<span data-summary="pending">\d+ pendientes</span><span data-summary="progress">\d+ en progreso</span><span data-summary="review">\d+ en revisi' + [char]0x00F3 + 'n</span><span data-summary="blocked">\d+ bloqueadas</span><span data-summary="done">\d+ completadas</span>\s*</div>'
            $newSummary = "<div class=""summary"" aria-label=""Resumen"">`r`n<span data-summary=""pending"">$cPending pendientes</span><span data-summary=""progress"">$cProg en progreso</span><span data-summary=""review"">$cRev en revisi" + [char]0x00F3 + "n</span><span data-summary=""blocked"">$cBlock bloqueadas</span><span data-summary=""done"">$cDone completadas</span>`r`n      </div>"
            if ($htmlWithoutCard -match $summaryPattern) {
                $htmlWithoutCard = [regex]::Replace($htmlWithoutCard, $summaryPattern, $newSummary)
            }

            [System.IO.File]::WriteAllText($htmlPath, $htmlWithoutCard, $utf8)
            Write-Host "[$cleanTaskId] sincronizada en tasks.html (Columna: $targetHtmlKey)" -ForegroundColor Green
        }
    }
}
