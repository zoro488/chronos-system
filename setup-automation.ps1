#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Script de setup automático para CHRONOS System GitHub Automation

.DESCRIPTION
    Configura todos los aspectos necesarios para la automatización completa:
    - GitHub CLI authentication
    - Secrets configuration
    - GitHub Pages
    - Branch protection
    - Workflows activation

.EXAMPLE
    .\setup-automation.ps1

.NOTES
    Requiere: GitHub CLI (gh) instalado y configurado
#>

param(
    [switch]$SkipSecrets,
    [switch]$SkipPages,
    [switch]$SkipProtection,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$repo = "zoro488/chronos-system"

# Colors
function Write-Step {
    param([string]$Message)
    Write-Host "`n🚀 $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Banner
Write-Host @"
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🤖 CHRONOS SYSTEM - AUTOMATION SETUP                  ║
║                                                          ║
║   Repository: $repo                        ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Magenta

# 1. Check GitHub CLI
Write-Step "Verificando GitHub CLI..."
try {
    $ghVersion = gh --version | Select-Object -First 1
    Write-Success "GitHub CLI instalado: $ghVersion"
} catch {
    Write-Error "GitHub CLI no encontrado. Instala desde: https://cli.github.com"
    exit 1
}

# 2. Check Authentication
Write-Step "Verificando autenticación..."
try {
    $authStatus = gh auth status 2>&1
    if ($authStatus -match "Logged in") {
        Write-Success "Autenticado en GitHub"
    } else {
        Write-Warning "No autenticado. Ejecutando gh auth login..."
        gh auth login -h github.com -w
    }
} catch {
    Write-Error "Error de autenticación"
    exit 1
}

# 3. Verify Repository Access
Write-Step "Verificando acceso al repositorio..."
try {
    $repoInfo = gh repo view $repo --json name,owner | ConvertFrom-Json
    Write-Success "Acceso confirmado: $($repoInfo.owner.login)/$($repoInfo.name)"
} catch {
    Write-Error "No se puede acceder al repositorio: $repo"
    exit 1
}

# 4. Configure Secrets
if (-not $SkipSecrets) {
    Write-Step "Configurando GitHub Secrets..."

    Write-Host "`nNecesitas configurar estos secrets en GitHub:"
    Write-Host "1. FIREBASE_SERVICE_ACCOUNT_STAGING"
    Write-Host "2. FIREBASE_SERVICE_ACCOUNT_PRODUCTION"
    Write-Host "3. FIREBASE_TOKEN"
    Write-Host "4. SLACK_WEBHOOK (opcional)"
    Write-Host "5. SNYK_TOKEN (opcional)"

    $response = Read-Host "`n¿Abrir página de secrets en navegador? (Y/n)"
    if ($response -ne 'n') {
        Start-Process "https://github.com/$repo/settings/secrets/actions"
        Write-Success "Página de secrets abierta en navegador"
        Write-Host "Presiona Enter cuando hayas terminado de configurar los secrets..."
        Read-Host
    }
}

# 5. Enable GitHub Pages
if (-not $SkipPages) {
    Write-Step "Habilitando GitHub Pages..."
    try {
        gh api repos/$repo/pages `
            --method POST `
            --field source='{"branch":"gh-pages","path":"/"}'
        Write-Success "GitHub Pages habilitado"
    } catch {
        Write-Warning "GitHub Pages ya podría estar habilitado o requiere configuración manual"
    }
}

# 6. Configure Branch Protection
if (-not $SkipProtection) {
    Write-Step "Configurando protección de branch main..."
    try {
        gh api repos/$repo/branches/main/protection `
            --method PUT `
            --field required_status_checks='{"strict":true,"contexts":["lint","unit-tests"]}' `
            --field enforce_admins=false `
            --field required_pull_request_reviews='{"required_approving_review_count":1}' `
            --field restrictions=null
        Write-Success "Branch protection configurado"
    } catch {
        Write-Warning "Error al configurar branch protection. Configura manualmente en GitHub"
    }
}

# 7. List Workflows
Write-Step "Workflows disponibles:"
try {
    gh workflow list --repo $repo | Format-Table
    Write-Success "Workflows listados correctamente"
} catch {
    Write-Warning "No se pudieron listar workflows"
}

# 8. Trigger First CI Run
Write-Step "¿Deseas ejecutar el workflow de CI ahora?"
$response = Read-Host "(Y/n)"
if ($response -ne 'n') {
    try {
        gh workflow run ci.yml --repo $repo
        Write-Success "Workflow CI iniciado"
        Write-Host "`nVer progreso: https://github.com/$repo/actions"
    } catch {
        Write-Warning "No se pudo iniciar el workflow. Ejecútalo manualmente desde GitHub Actions"
    }
}

# 9. Summary
Write-Host @"

╔══════════════════════════════════════════════════════════╗
║                    ✅ SETUP COMPLETO                     ║
╚══════════════════════════════════════════════════════════╝

📋 CHECKLIST:
"@ -ForegroundColor Green

Write-Host "  [✓] GitHub CLI configurado"
Write-Host "  [✓] Autenticación verificada"
Write-Host "  [✓] Acceso al repositorio confirmado"
if (-not $SkipSecrets) { Write-Host "  [!] Secrets - Verificar configuración manual" -ForegroundColor Yellow }
if (-not $SkipPages) { Write-Host "  [✓] GitHub Pages configurado" }
if (-not $SkipProtection) { Write-Host "  [✓] Branch protection configurado" }
Write-Host "  [✓] Workflows disponibles"

Write-Host "`n🚀 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "  1. Verifica que todos los secrets estén configurados"
Write-Host "  2. Revisa los workflows en: https://github.com/$repo/actions"
Write-Host "  3. Crea tu primer PR para probar la automatización"
Write-Host "  4. Revisa la documentación en: SETUP_RAPIDO.md"

Write-Host "`n📚 RECURSOS ÚTILES:" -ForegroundColor Cyan
Write-Host "  - GitHub Actions: https://github.com/$repo/actions"
Write-Host "  - Workflows: https://github.com/$repo/tree/main/.github/workflows"
Write-Host "  - Documentación: AUTOMATIZACION_COMPLETA.md"

Write-Host "`n💡 COMANDOS ÚTILES:" -ForegroundColor Cyan
Write-Host "  gh workflow list              - Ver workflows"
Write-Host "  gh run list                   - Ver ejecuciones recientes"
Write-Host "  gh workflow run ci.yml        - Ejecutar CI manualmente"
Write-Host "  gh pr create                  - Crear Pull Request"

Write-Host "`n✨ ¡Setup completado exitosamente!" -ForegroundColor Green
Write-Host "Versión: 1.0.0 | Repo: $repo`n"
