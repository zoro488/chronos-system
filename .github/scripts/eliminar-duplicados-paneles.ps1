# ==========================================
# 🗑️ ELIMINAR PANELES DUPLICADOS OBSOLETOS
# ==========================================
# Este script elimina versiones antiguas de paneles
# manteniendo SOLO las versiones Ultra TypeScript

param(
  [switch]$DryRun = $false,  # Solo muestra qué se eliminará
  [switch]$Backup = $true     # Crear backup antes de eliminar
)

$ErrorActionPreference = 'Stop'
$rootPath = 'C:\Users\xpovo\Documents\premium-ecosystem'
$componentsPath = "$rootPath\src\apps\FlowDistributor\components"
$backupPath = "$rootPath\.backup-paneles-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# Colores para output
function Write-ColorOutput($ForegroundColor) {
  $fc = $host.UI.RawUI.ForegroundColor
  $host.UI.RawUI.ForegroundColor = $ForegroundColor
  if ($args) {
    Write-Output $args
  }
  $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Yellow '=================================================='
Write-ColorOutput Yellow '🗑️  ELIMINACIÓN DE PANELES DUPLICADOS OBSOLETOS'
Write-ColorOutput Yellow '=================================================='
Write-Output ''

# Archivos a ELIMINAR (versiones antiguas)
$archivosAEliminar = @(
  # ===== PANEL GYA (5 VERSIONES) =====
  'PanelGYA.jsx',                  # Original Firebase
  'PanelGYAReal.jsx',              # Con CRUD
  'PanelGYA.OLD.jsx',              # Backup viejo
  'PanelGYA.backup.jsx',           # Backup 1
  'PanelGYAReal.backup2.jsx',      # Backup 2

  # ===== BÓVEDA MONTE (4 VERSIONES) =====
  'PanelBovedaMonte.jsx',          # Original
  'PanelBovedaMonteNuevo.jsx',     # Con GraficoMaestro
  'PanelBovedaMonteV2.tsx',        # V2

  # ===== BÓVEDA USA (3 VERSIONES) =====
  'PanelBovedaUSA.jsx',            # Original
  'PanelBovedaUSASupremo.jsx',     # Supremo
  'PanelBovedaUSAV2.tsx',          # V2

  # ===== UTILIDADES (2 VERSIONES) =====
  'PanelUtilidades.jsx',           # Original
  'PanelUtilidadesNuevo.jsx',      # Nuevo

  # ===== AZTECA (2 VERSIONES) =====
  'PanelAzteca.jsx',               # Original
  'PanelAztecaV2.tsx',             # V2

  # ===== FLETES =====
  'PanelFletes.jsx',               # Original (FletesSurUltra existe)

  # ===== LEFTIE =====
  'PanelLeftie.jsx',               # Original (LeftieUltra existe)

  # ===== PROFIT =====
  'PanelProfit.jsx'                # Original (ProfitUltra existe)
)

# Versiones ULTRA que SE MANTIENEN (NO eliminar)
$archivosMantener = @(
  'PanelGYAUltra.tsx',
  'PanelBovedaMonteUltra.tsx',
  'PanelBovedaUSAUltra.tsx',
  'PanelUtilidadesUltra.tsx',
  'PanelFletesSurUltra.tsx',
  'PanelAztecaUltra.tsx',
  'PanelLeftieUltra.tsx',
  'PanelProfitUltra.tsx'
)

Write-ColorOutput Cyan "📋 Archivos a eliminar: $($archivosAEliminar.Count)"
Write-ColorOutput Green "✅ Versiones Ultra a mantener: $($archivosMantener.Count)"
Write-Output ''

# Verificar que existen las versiones Ultra
Write-ColorOutput Yellow '🔍 Verificando versiones Ultra...'
$todasExisten = $true
foreach ($archivo in $archivosMantener) {
  $path = Join-Path $componentsPath $archivo
  if (Test-Path $path) {
    Write-ColorOutput Green "  ✅ $archivo"
  }
  else {
    Write-ColorOutput Red "  ❌ $archivo NO EXISTE!"
    $todasExisten = $false
  }
}

if (-not $todasExisten) {
  Write-ColorOutput Red '❌ ERROR: Faltan archivos Ultra. Abortando...'
  exit 1
}

Write-Output ''
Write-ColorOutput Yellow '🗑️ Archivos duplicados a eliminar:'
foreach ($archivo in $archivosAEliminar) {
  $path = Join-Path $componentsPath $archivo
  if (Test-Path $path) {
    $size = (Get-Item $path).Length / 1KB
    Write-ColorOutput Red "  🗑️ $archivo ($([math]::Round($size, 2)) KB)"
  }
  else {
    Write-ColorOutput Gray "  ⏭️ $archivo (ya no existe)"
  }
}

if ($DryRun) {
  Write-Output ''
  Write-ColorOutput Yellow '⚠️ DRY RUN MODE - No se eliminará nada'
  Write-ColorOutput Cyan 'Ejecuta sin -DryRun para eliminar realmente'
  exit 0
}

# Crear backup
if ($Backup) {
  Write-Output ''
  Write-ColorOutput Yellow "📦 Creando backup en: $backupPath"
  New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

  foreach ($archivo in $archivosAEliminar) {
    $sourcePath = Join-Path $componentsPath $archivo
    if (Test-Path $sourcePath) {
      Copy-Item $sourcePath $backupPath -Force
      Write-ColorOutput Cyan "  📋 Copiado: $archivo"
    }
  }
  Write-ColorOutput Green '✅ Backup creado exitosamente'
}

# Eliminar archivos
Write-Output ''
Write-ColorOutput Red '🗑️ ELIMINANDO ARCHIVOS DUPLICADOS...'
$eliminados = 0
foreach ($archivo in $archivosAEliminar) {
  $path = Join-Path $componentsPath $archivo
  if (Test-Path $path) {
    try {
      Remove-Item $path -Force
      Write-ColorOutput Green "  ✅ Eliminado: $archivo"
      $eliminados++
    }
    catch {
      Write-ColorOutput Red "  ❌ Error eliminando $archivo : $_"
    }
  }
}

Write-Output ''
Write-ColorOutput Green '=================================================='
Write-ColorOutput Green '✅ PROCESO COMPLETADO'
Write-ColorOutput Green '=================================================='
Write-ColorOutput Cyan "Archivos eliminados: $eliminados / $($archivosAEliminar.Count)"
if ($Backup) {
  Write-ColorOutput Cyan "Backup guardado en: $backupPath"
}
Write-ColorOutput Yellow "Versiones Ultra activas: $($archivosMantener.Count)"
Write-Output ''
Write-ColorOutput Magenta '🚀 Ahora los imports en FlowDistributor.jsx usan SOLO versiones Ultra'
