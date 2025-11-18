#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Validación del sistema de automatización de CHRONOS
    
.DESCRIPTION
    Este script valida que todos los archivos de automatización requeridos
    existan y tengan la configuración correcta.
    
.NOTES
    Autor: CHRONOS System Team
    Versión: 1.0.0
#>

# Configuración
$ErrorActionPreference = "Continue"
$script:errorCount = 0
$script:warningCount = 0

# Colores para output
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Failure { param($Message) Write-Host "❌ $Message" -ForegroundColor Red; $script:errorCount++ }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow; $script:warningCount++ }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Header { param($Message) Write-Host "`n$Message" -ForegroundColor Magenta }

Write-Header "🔍 VALIDACIÓN DEL SISTEMA DE AUTOMATIZACIÓN"

# ==============================================================================
# 1. VALIDAR ARCHIVOS DE CONFIGURACIÓN
# ==============================================================================
Write-Header "📁 Validando archivos de configuración..."

$requiredFiles = @(
    "firebase.json",
    ".firebaserc",
    "firestore.rules",
    "firestore.indexes.json",
    "playwright.config.ts",
    "lighthouserc.json",
    ".prettierrc",
    "package.json",
    ".env.example"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Success "Archivo encontrado: $file"
    } else {
        Write-Failure "Archivo faltante: $file"
    }
}

# ==============================================================================
# 2. VALIDAR WORKFLOWS DE GITHUB ACTIONS
# ==============================================================================
Write-Header "⚙️  Validando workflows de GitHub Actions..."

$requiredWorkflows = @(
    ".github/workflows/ci-cd-complete.yml",
    ".github/workflows/dependabot-auto-merge.yml",
    ".github/workflows/performance-monitoring.yml"
)

foreach ($workflow in $requiredWorkflows) {
    if (Test-Path $workflow) {
        Write-Success "Workflow encontrado: $workflow"
        
        # Validar sintaxis YAML básica
        try {
            $content = Get-Content $workflow -Raw
            if ($content -match "name:" -and $content -match "on:") {
                Write-Info "  Sintaxis YAML básica correcta"
            } else {
                Write-Warning "  Sintaxis YAML puede tener problemas"
            }
        } catch {
            Write-Failure "  Error al leer el workflow: $_"
        }
    } else {
        Write-Failure "Workflow faltante: $workflow"
    }
}

# ==============================================================================
# 3. VALIDAR DEPENDABOT
# ==============================================================================
Write-Header "🤖 Validando configuración de Dependabot..."

if (Test-Path ".github/dependabot.yml") {
    Write-Success "Archivo dependabot.yml encontrado"
    
    $depContent = Get-Content ".github/dependabot.yml" -Raw
    $ecosystems = @("npm", "github-actions")
    
    foreach ($ecosystem in $ecosystems) {
        if ($depContent -match "package-ecosystem: `"$ecosystem`"") {
            Write-Success "  Ecosistema configurado: $ecosystem"
        } else {
            Write-Failure "  Ecosistema faltante: $ecosystem"
        }
    }
    
    # Verificar grupos
    if ($depContent -match "groups:") {
        Write-Success "  Grupos de dependencias configurados"
    } else {
        Write-Warning "  No se encontraron grupos de dependencias"
    }
} else {
    Write-Failure "Archivo dependabot.yml no encontrado"
}

# ==============================================================================
# 4. VALIDAR ESTRUCTURA DE DIRECTORIOS
# ==============================================================================
Write-Header "📂 Validando estructura de directorios..."

$requiredDirs = @(
    "scripts",
    "tests/e2e",
    "docs"
)

foreach ($dir in $requiredDirs) {
    if (Test-Path $dir -PathType Container) {
        Write-Success "Directorio encontrado: $dir"
    } else {
        Write-Failure "Directorio faltante: $dir"
    }
}

# ==============================================================================
# 5. VALIDAR TESTS E2E
# ==============================================================================
Write-Header "🧪 Validando tests E2E..."

$requiredTests = @(
    "tests/e2e/chronos-basic.spec.ts",
    "tests/e2e/chronos-forms.spec.ts",
    "tests/e2e/chronos-navigation.spec.ts"
)

foreach ($test in $requiredTests) {
    if (Test-Path $test) {
        Write-Success "Test encontrado: $test"
    } else {
        Write-Failure "Test faltante: $test"
    }
}

# ==============================================================================
# 6. VALIDAR DOCUMENTACIÓN
# ==============================================================================
Write-Header "📚 Validando documentación..."

$requiredDocs = @(
    "docs/AUTOMATION_SETUP.md",
    "docs/CI_CD_PIPELINE.md",
    "docs/FIREBASE_SETUP.md",
    "docs/TESTING_GUIDE.md"
)

foreach ($doc in $requiredDocs) {
    if (Test-Path $doc) {
        Write-Success "Documento encontrado: $doc"
    } else {
        Write-Warning "Documento faltante: $doc (se creará después)"
    }
}

# ==============================================================================
# 7. VALIDAR PACKAGE.JSON SCRIPTS
# ==============================================================================
Write-Header "📦 Validando scripts en package.json..."

if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    
    $requiredScripts = @(
        "dev",
        "build",
        "preview",
        "lint",
        "lint:fix",
        "test",
        "test:coverage",
        "test:e2e",
        "type-check"
    )
    
    foreach ($script in $requiredScripts) {
        if ($packageJson.scripts.PSObject.Properties.Name -contains $script) {
            Write-Success "  Script encontrado: $script"
        } else {
            Write-Failure "  Script faltante: $script"
        }
    }
} else {
    Write-Failure "package.json no encontrado"
}

# ==============================================================================
# 8. VERIFICAR SECRETS (WARNING ONLY)
# ==============================================================================
Write-Header "🔐 Verificando secrets de GitHub..."

Write-Warning "Secrets deben configurarse manualmente en GitHub:"
Write-Info "  - FIREBASE_SERVICE_ACCOUNT"
Write-Info "  - CODECOV_TOKEN (opcional)"
Write-Info "Visita: https://github.com/zoro488/chronos-system/settings/secrets/actions"

# ==============================================================================
# RESUMEN FINAL
# ==============================================================================
Write-Header "📊 RESUMEN DE VALIDACIÓN"

$totalChecks = $script:errorCount + $script:warningCount
if ($script:errorCount -eq 0 -and $script:warningCount -eq 0) {
    Write-Success "¡Todo está configurado correctamente! ✨"
    exit 0
} elseif ($script:errorCount -eq 0) {
    Write-Warning "Validación completada con $script:warningCount advertencia(s)"
    Write-Info "Las advertencias no son críticas pero deben revisarse"
    exit 0
} else {
    Write-Failure "Validación falló con $script:errorCount error(es) y $script:warningCount advertencia(s)"
    Write-Info "Corrige los errores antes de continuar"
    exit 1
}
