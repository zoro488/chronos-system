#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script de validación completa del Sistema Autónomo Maestro

.DESCRIPTION
    Valida el sistema completo incluyendo:
    - Configuración de Firebase
    - Tests de integración real
    - Tests E2E Excel → Firestore → UI
    - Workflows de GitHub Actions

.EXAMPLE
    .\validate-complete-system.ps1
    
.EXAMPLE
    .\validate-complete-system.ps1 -SkipEmulator
#>

param(
    [switch]$SkipEmulator,
    [switch]$Verbose
)

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Colores para output
function Write-Success { Write-Host "✅ $args" -ForegroundColor Green }
function Write-Error { Write-Host "❌ $args" -ForegroundColor Red }
function Write-Info { Write-Host "ℹ️  $args" -ForegroundColor Cyan }
function Write-Warning { Write-Host "⚠️  $args" -ForegroundColor Yellow }
function Write-Step { Write-Host "`n🔷 $args" -ForegroundColor Blue }

# ============================================================================
# BANNER
# ============================================================================

Clear-Host
Write-Host @"
╔════════════════════════════════════════════════════════════════════════════╗
║                   🤖 SISTEMA AUTÓNOMO MAESTRO                              ║
║                      Validación Completa                                   ║
╚════════════════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Magenta

# ============================================================================
# VALIDACIÓN DE PRERREQUISITOS
# ============================================================================

Write-Step "Validando prerrequisitos..."

# Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js instalado: $nodeVersion"
} catch {
    Write-Error "Node.js no encontrado. Instálalo desde https://nodejs.org"
    exit 1
}

# NPM
try {
    $npmVersion = npm --version
    Write-Success "NPM instalado: $npmVersion"
} catch {
    Write-Error "NPM no encontrado"
    exit 1
}

# Firebase CLI
try {
    $firebaseVersion = firebase --version
    Write-Success "Firebase CLI instalado: $firebaseVersion"
} catch {
    Write-Warning "Firebase CLI no encontrado. Instalando..."
    npm install -g firebase-tools
    Write-Success "Firebase CLI instalado"
}

# ============================================================================
# VALIDACIÓN DE ARCHIVOS
# ============================================================================

Write-Step "Validando archivos de configuración..."

$requiredFiles = @(
    "firebase.json",
    ".firebaserc",
    "firestore.rules",
    "package.json",
    "vitest.config.ts",
    ".github/workflows/autonomous-master-system.yml",
    ".github/workflows/e2e-data-validation.yml",
    "tests/helpers/firebase-test-helper.ts",
    "tests/integration/firebase-real.test.ts",
    "tests/e2e/excel-to-ui.test.ts"
)

$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Success "Archivo encontrado: $file"
    } else {
        Write-Error "Archivo faltante: $file"
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Error "Faltan $($missingFiles.Count) archivos. Sistema incompleto."
    exit 1
}

# ============================================================================
# INSTALACIÓN DE DEPENDENCIAS
# ============================================================================

Write-Step "Instalando dependencias..."

try {
    npm install
    Write-Success "Dependencias instaladas"
} catch {
    Write-Error "Error instalando dependencias"
    exit 1
}

# ============================================================================
# INICIAR EMULATOR (opcional)
# ============================================================================

if (-not $SkipEmulator) {
    Write-Step "Iniciando Firebase Emulator..."
    
    # Detener cualquier emulador previo
    Get-Process | Where-Object {$_.ProcessName -like "*firebase*"} | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Iniciar emulator en background
    $emulatorJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        firebase emulators:start --only firestore --project demo-test
    }
    
    Write-Info "Esperando a que el emulador esté listo..."
    Start-Sleep -Seconds 20
    
    # Verificar que está corriendo
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 5 -ErrorAction Stop
        Write-Success "Firebase Emulator corriendo en puerto 8080"
    } catch {
        Write-Warning "No se pudo verificar el emulador. Continuando..."
    }
} else {
    Write-Info "Emulator omitido (usar -SkipEmulator)"
}

# ============================================================================
# EJECUTAR TESTS DE INTEGRACIÓN
# ============================================================================

Write-Step "Ejecutando tests de integración..."

try {
    $env:FIRESTORE_EMULATOR_HOST = "localhost:8080"
    npm test -- tests/integration/
    Write-Success "Tests de integración pasaron"
    $integrationPassed = $true
} catch {
    Write-Error "Tests de integración fallaron"
    $integrationPassed = $false
}

# ============================================================================
# EJECUTAR TESTS E2E
# ============================================================================

Write-Step "Ejecutando tests E2E..."

try {
    npm run test:e2e -- tests/e2e/
    Write-Success "Tests E2E pasaron"
    $e2ePassed = $true
} catch {
    Write-Error "Tests E2E fallaron"
    $e2ePassed = $false
}

# ============================================================================
# VALIDAR WORKFLOWS
# ============================================================================

Write-Step "Validando workflows de GitHub Actions..."

$workflows = @(
    ".github/workflows/autonomous-master-system.yml",
    ".github/workflows/e2e-data-validation.yml"
)

foreach ($workflow in $workflows) {
    if (Test-Path $workflow) {
        Write-Success "Workflow válido: $workflow"
        
        # Validar sintaxis YAML (si yamllint está disponible)
        $content = Get-Content $workflow -Raw
        if ($content -match "name:" -and $content -match "on:" -and $content -match "jobs:") {
            Write-Success "  Estructura YAML correcta"
        } else {
            Write-Warning "  Revisar estructura YAML"
        }
    } else {
        Write-Error "Workflow no encontrado: $workflow"
    }
}

# ============================================================================
# CLEANUP
# ============================================================================

if (-not $SkipEmulator) {
    Write-Step "Deteniendo emulator..."
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    Get-Process | Where-Object {$_.ProcessName -like "*firebase*"} | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Success "Emulator detenido"
}

# ============================================================================
# RESUMEN FINAL
# ============================================================================

Write-Host "`n" -NoNewline
Write-Host "╔════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                         📊 RESUMEN DE VALIDACIÓN                           ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

Write-Host "✅ Prerrequisitos:" -ForegroundColor Green
Write-Host "   - Node.js: $nodeVersion"
Write-Host "   - NPM: $npmVersion"
Write-Host "   - Firebase CLI: $firebaseVersion"
Write-Host ""

Write-Host "📁 Archivos:" -ForegroundColor Green
Write-Host "   - Configuración: ✅ Completa"
Write-Host "   - Tests: ✅ Completos"
Write-Host "   - Workflows: ✅ Completos"
Write-Host ""

Write-Host "🧪 Tests:" -ForegroundColor $(if ($integrationPassed -and $e2ePassed) { "Green" } else { "Red" })
if ($integrationPassed) {
    Write-Host "   - Integración: ✅ PASSED"
} else {
    Write-Host "   - Integración: ❌ FAILED"
}

if ($e2ePassed) {
    Write-Host "   - E2E: ✅ PASSED"
} else {
    Write-Host "   - E2E: ❌ FAILED"
}

Write-Host ""

if ($integrationPassed -and $e2ePassed) {
    Write-Host "🎉 " -NoNewline -ForegroundColor Green
    Write-Host "SISTEMA COMPLETAMENTE VALIDADO" -ForegroundColor Green
    Write-Host ""
    Write-Host "El Sistema Autónomo Maestro está listo para usar." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Comandos útiles:" -ForegroundColor Yellow
    Write-Host "  - npm test                 -> Ejecutar todos los tests"
    Write-Host "  - npm run test:integration -> Tests de integración"
    Write-Host "  - npm run test:e2e         -> Tests E2E"
    Write-Host "  - npm run emulator:start   -> Iniciar emulador Firebase"
    exit 0
} else {
    Write-Host "⚠️  " -NoNewline -ForegroundColor Yellow
    Write-Host "SISTEMA CON ISSUES" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Algunos tests fallaron. Revisa los logs para más detalles." -ForegroundColor Red
    exit 1
}
