#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Setup local del sistema de automatización de CHRONOS
    
.DESCRIPTION
    Este script configura el entorno de desarrollo local instalando todas
    las dependencias necesarias y configurando las herramientas.
    
.NOTES
    Autor: CHRONOS System Team
    Versión: 1.0.0
#>

# Configuración
$ErrorActionPreference = "Stop"

# Colores para output
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Failure { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Header { param($Message) Write-Host "`n$Message" -ForegroundColor Magenta }

Write-Header "🚀 CONFIGURACIÓN LOCAL DE CHRONOS SYSTEM"

# ==============================================================================
# 1. VERIFICAR PREREQUISITOS
# ==============================================================================
Write-Header "🔍 Verificando prerequisitos..."

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js instalado: $nodeVersion"
    
    # Verificar versión mínima (18+)
    $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($versionNumber -lt 18) {
        Write-Warning "Se recomienda Node.js 18 o superior. Versión actual: $nodeVersion"
    }
} catch {
    Write-Failure "Node.js no está instalado. Instálalo desde https://nodejs.org/"
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version
    Write-Success "npm instalado: v$npmVersion"
} catch {
    Write-Failure "npm no está instalado"
    exit 1
}

# Verificar Git
try {
    $gitVersion = git --version
    Write-Success "Git instalado: $gitVersion"
} catch {
    Write-Failure "Git no está instalado. Instálalo desde https://git-scm.com/"
    exit 1
}

# ==============================================================================
# 2. INSTALAR DEPENDENCIAS
# ==============================================================================
Write-Header "📦 Instalando dependencias del proyecto..."

try {
    Write-Info "Ejecutando npm install..."
    npm install
    Write-Success "Dependencias instaladas correctamente"
} catch {
    Write-Failure "Error al instalar dependencias: $_"
    exit 1
}

# ==============================================================================
# 3. INSTALAR PLAYWRIGHT BROWSERS
# ==============================================================================
Write-Header "🎭 Instalando navegadores de Playwright..."

try {
    Write-Info "Esto puede tomar varios minutos..."
    npx playwright install
    Write-Success "Navegadores de Playwright instalados"
} catch {
    Write-Failure "Error al instalar navegadores de Playwright: $_"
    Write-Warning "Puedes instalarlo manualmente con: npx playwright install"
}

# ==============================================================================
# 4. CREAR ARCHIVO .env.local
# ==============================================================================
Write-Header "🔐 Configurando variables de entorno..."

if (-not (Test-Path ".env.local")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Success "Archivo .env.local creado desde .env.example"
        Write-Warning "¡IMPORTANTE! Edita .env.local con tus credenciales reales"
        Write-Info "Necesitas configurar al menos:"
        Write-Info "  - VITE_FIREBASE_API_KEY"
        Write-Info "  - VITE_FIREBASE_PROJECT_ID"
        Write-Info "  - VITE_FIREBASE_AUTH_DOMAIN"
    } else {
        Write-Warning ".env.example no encontrado, creando .env.local básico"
        @"
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
        Write-Success "Archivo .env.local básico creado"
        Write-Warning "Edita .env.local con tus credenciales de Firebase"
    }
} else {
    Write-Info "Archivo .env.local ya existe, no se sobrescribirá"
}

# ==============================================================================
# 5. VERIFICAR FIREBASE CLI (OPCIONAL)
# ==============================================================================
Write-Header "🔥 Verificando Firebase CLI..."

try {
    $firebaseVersion = firebase --version
    Write-Success "Firebase CLI instalado: $firebaseVersion"
} catch {
    Write-Warning "Firebase CLI no está instalado"
    Write-Info "Para instalarlo ejecuta: npm install -g firebase-tools"
    Write-Info "Esto es opcional pero recomendado para deploy"
}

# ==============================================================================
# 6. CREAR DIRECTORIOS NECESARIOS
# ==============================================================================
Write-Header "📁 Creando directorios necesarios..."

$dirs = @("tests/e2e", "scripts", "docs", "playwright-report")
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Success "Directorio creado: $dir"
    } else {
        Write-Info "Directorio ya existe: $dir"
    }
}

# ==============================================================================
# 7. VALIDAR INSTALACIÓN
# ==============================================================================
Write-Header "✅ Validando instalación..."

try {
    Write-Info "Verificando TypeScript..."
    npx tsc --version | Out-Null
    Write-Success "TypeScript disponible"
    
    Write-Info "Verificando Playwright..."
    npx playwright --version | Out-Null
    Write-Success "Playwright disponible"
    
    Write-Info "Verificando Vite..."
    npx vite --version | Out-Null
    Write-Success "Vite disponible"
} catch {
    Write-Warning "Algunas herramientas pueden no estar disponibles: $_"
}

# ==============================================================================
# RESUMEN FINAL
# ==============================================================================
Write-Header "📊 RESUMEN DE CONFIGURACIÓN"

Write-Success "✅ Configuración local completada exitosamente!"
Write-Info ""
Write-Info "Próximos pasos:"
Write-Info "1. Edita .env.local con tus credenciales de Firebase"
Write-Info "2. Ejecuta 'npm run dev' para iniciar el servidor de desarrollo"
Write-Info "3. Ejecuta 'npm run test' para correr los tests unitarios"
Write-Info "4. Ejecuta 'npm run test:e2e' para correr los tests E2E"
Write-Info ""
Write-Info "Comandos útiles:"
Write-Info "  npm run dev           - Servidor de desarrollo"
Write-Info "  npm run build         - Build de producción"
Write-Info "  npm run lint          - Linter"
Write-Info "  npm run test          - Tests unitarios"
Write-Info "  npm run test:e2e      - Tests E2E"
Write-Info "  npm run type-check    - Verificar tipos TypeScript"
Write-Info ""
Write-Success "¡Listo para desarrollar! 🚀"
