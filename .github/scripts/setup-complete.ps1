# ============================================================================
# 🚀 PREMIUM ECOSYSTEM - SETUP COMPLETO AUTOMATIZADO
# Script de configuración ultra-avanzada para máximo rendimiento
# ============================================================================

param(
    [switch]$SkipGitHubCLI,
    [switch]$SkipExtensions,
    [switch]$SkipAliases,
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$VerbosePreference = if ($Verbose) { "Continue" } else { "SilentlyContinue" }

# Colores para output
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Header { param($Message) Write-Host "`n🎯 $Message" -ForegroundColor Magenta -BackgroundColor Black }

Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🚀 PREMIUM ECOSYSTEM - CONFIGURACIÓN ULTRA AVANZADA 🚀      ║
║                                                                ║
║   Configurando VSCode, GitHub Copilot Enterprise & más...     ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# ============================================================================
# 1. VERIFICAR PREREQUISITOS
# ============================================================================
Write-Header "Verificando prerequisitos..."

# Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js instalado: $nodeVersion"
} catch {
    Write-Error "Node.js no encontrado. Instálalo desde: https://nodejs.org"
    exit 1
}

# npm
try {
    $npmVersion = npm --version
    Write-Success "npm instalado: v$npmVersion"
} catch {
    Write-Error "npm no encontrado"
    exit 1
}

# Git
try {
    $gitVersion = git --version
    Write-Success "Git instalado: $gitVersion"
} catch {
    Write-Error "Git no encontrado. Instálalo desde: https://git-scm.com"
    exit 1
}

# ============================================================================
# 2. GITHUB CLI & COPILOT
# ============================================================================
if (-not $SkipGitHubCLI) {
    Write-Header "Configurando GitHub CLI..."

    try {
        $ghVersion = gh --version | Select-Object -First 1
        Write-Success "GitHub CLI instalado: $ghVersion"

        # Verificar autenticación
        $authStatus = gh auth status 2>&1
        if ($authStatus -match "Logged in") {
            Write-Success "GitHub CLI autenticado correctamente"

            # Extraer usuario
            if ($authStatus -match "account (\w+)") {
                $githubUser = $matches[1]
                Write-Info "Usuario: $githubUser"
            }
        } else {
            Write-Warning "GitHub CLI no autenticado"
            Write-Info "Ejecuta: gh auth login"
        }

        # Verificar extensión Copilot
        $extensions = gh extension list 2>&1
        if ($extensions -match "gh-copilot") {
            Write-Success "Extensión gh-copilot instalada"

            # Actualizar extensión
            Write-Info "Actualizando gh-copilot..."
            gh extension upgrade gh-copilot 2>&1 | Out-Null
            Write-Success "gh-copilot actualizado"
        } else {
            Write-Info "Instalando gh-copilot..."
            gh extension install github/gh-copilot
            Write-Success "gh-copilot instalado"
        }

    } catch {
        Write-Warning "GitHub CLI no encontrado"
        Write-Info "Instala con: winget install --id GitHub.cli"
        Write-Info "O descarga desde: https://cli.github.com"
    }
}

# ============================================================================
# 3. NPM DEPENDENCIES
# ============================================================================
Write-Header "Verificando dependencias npm..."

if (Test-Path "package.json") {
    Write-Info "Verificando node_modules..."

    if (-not (Test-Path "node_modules")) {
        Write-Info "Instalando dependencias..."
        npm install
        Write-Success "Dependencias instaladas"
    } else {
        Write-Success "node_modules existe"

        # Verificar actualizaciones
        Write-Info "Verificando actualizaciones disponibles..."
        $outdated = npm outdated --json 2>&1 | ConvertFrom-Json
        if ($outdated) {
            $count = ($outdated | Get-Member -MemberType NoteProperty).Count
            Write-Warning "$count paquete(s) desactualizado(s)"
            Write-Info "Ejecuta 'npm update' para actualizar"
        } else {
            Write-Success "Todas las dependencias están actualizadas"
        }
    }
} else {
    Write-Warning "package.json no encontrado"
}

# ============================================================================
# 4. VSCODE EXTENSIONS
# ============================================================================
if (-not $SkipExtensions) {
    Write-Header "Verificando extensiones de VSCode..."

    # Leer extensiones recomendadas
    $extensionsFile = ".vscode\extensions.json"
    if (Test-Path $extensionsFile) {
        $extensions = Get-Content $extensionsFile | ConvertFrom-Json
        $recommended = $extensions.recommendations

        Write-Info "Extensiones recomendadas: $($recommended.Count)"

        # Verificar si code está disponible
        try {
            code --version | Out-Null

            # Listar extensiones instaladas
            $installed = code --list-extensions

            $toInstall = @()
            foreach ($ext in $recommended) {
                if ($installed -notcontains $ext) {
                    $toInstall += $ext
                }
            }

            if ($toInstall.Count -gt 0) {
                Write-Warning "$($toInstall.Count) extensión(es) faltante(s)"
                Write-Info "Extensiones faltantes:"
                $toInstall | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }

                $install = Read-Host "`n¿Instalar extensiones faltantes? (s/N)"
                if ($install -eq 's' -or $install -eq 'S') {
                    foreach ($ext in $toInstall) {
                        Write-Info "Instalando $ext..."
                        code --install-extension $ext --force
                    }
                    Write-Success "Extensiones instaladas"
                }
            } else {
                Write-Success "Todas las extensiones recomendadas están instaladas"
            }

        } catch {
            Write-Warning "VSCode CLI no disponible"
            Write-Info "Asegúrate de que 'code' esté en PATH"
        }
    }
}

# ============================================================================
# 5. POWERSHELL PROFILE & ALIASES
# ============================================================================
if (-not $SkipAliases) {
    Write-Header "Configurando aliases de PowerShell..."

    $profilePath = $PROFILE
    $aliasesContent = @"

# ============================================================================
# 🚀 PREMIUM ECOSYSTEM - ALIASES & FUNCTIONS
# ============================================================================

# GitHub Copilot CLI Shortcuts
function ghcs { gh copilot suggest `$args }
function ghce { gh copilot explain `$args }

# Git Shortcuts
function gs { git status }
function ga { git add . }
function gc { param(`$msg) git commit -m `$msg }
function gp { git push }
function gpl { git pull }
function gco { param(`$branch) git checkout `$branch }

# NPM Shortcuts
function ni { npm install }
function nd { npm run dev }
function nb { npm run build }
function nt { npm run test }
function nl { npm run lint }
function nf { npm run lint:fix }

# Project Shortcuts
function dev { npm run dev }
function build { npm run build }
function test { npm run test }
function deploy { npm run deploy }

# Copilot Tools (desde scripts)
function copilot-review {
    param(`$file)
    if (-not `$file) { `$file = `$PWD }
    pwsh -File ".github\scripts\copilot-cli-tools.ps1" -Action review -FilePath `$file
}

function copilot-test {
    param(`$file)
    pwsh -File ".github\scripts\copilot-cli-tools.ps1" -Action test -FilePath `$file
}

function copilot-optimize {
    param(`$file)
    pwsh -File ".github\scripts\copilot-cli-tools.ps1" -Action optimize -FilePath `$file
}

function copilot-docs {
    param(`$file)
    pwsh -File ".github\scripts\copilot-cli-tools.ps1" -Action docs -FilePath `$file
}

function copilot-security {
    param(`$file)
    pwsh -File ".github\scripts\copilot-cli-tools.ps1" -Action security -FilePath `$file
}

# Utility Functions
function Open-Project { code . }
Set-Alias -Name op -Value Open-Project

function Show-GitLog { git log --oneline --graph --decorate --all }
Set-Alias -Name glog -Value Show-GitLog

Write-Host "✅ Premium Ecosystem aliases cargados" -ForegroundColor Green

"@

    if (Test-Path $profilePath) {
        $currentProfile = Get-Content $profilePath -Raw
        if ($currentProfile -notmatch "PREMIUM ECOSYSTEM") {
            Write-Info "Añadiendo aliases al perfil..."
            Add-Content -Path $profilePath -Value $aliasesContent
            Write-Success "Aliases añadidos a $profilePath"
        } else {
            Write-Success "Aliases ya configurados"
        }
    } else {
        Write-Info "Creando perfil de PowerShell..."
        New-Item -Path $profilePath -ItemType File -Force | Out-Null
        Set-Content -Path $profilePath -Value $aliasesContent
        Write-Success "Perfil creado con aliases"
    }

    Write-Info "Recarga el perfil con: . `$PROFILE"
}

# ============================================================================
# 6. GIT CONFIGURATION
# ============================================================================
Write-Header "Verificando configuración de Git..."

$gitUser = git config user.name
$gitEmail = git config user.email

if ($gitUser -and $gitEmail) {
    Write-Success "Git configurado: $gitUser <$gitEmail>"
} else {
    Write-Warning "Git no configurado completamente"
    if (-not $gitUser) {
        Write-Info "Configura con: git config --global user.name 'Tu Nombre'"
    }
    if (-not $gitEmail) {
        Write-Info "Configura con: git config --global user.email 'tu@email.com'"
    }
}

# Configuraciones recomendadas
$gitConfigs = @{
    "core.autocrlf" = "false"
    "core.ignorecase" = "false"
    "pull.rebase" = "false"
    "init.defaultBranch" = "main"
    "core.editor" = "code --wait"
}

foreach ($config in $gitConfigs.GetEnumerator()) {
    $current = git config --global $config.Key
    if ($current -ne $config.Value) {
        git config --global $config.Key $config.Value
        Write-Info "Configurado: $($config.Key) = $($config.Value)"
    }
}

# ============================================================================
# 7. FIREBASE CLI
# ============================================================================
Write-Header "Verificando Firebase CLI..."

try {
    $fbVersion = firebase --version
    Write-Success "Firebase CLI instalado: $fbVersion"

    # Verificar login
    $fbProjects = firebase projects:list 2>&1
    if ($fbProjects -match "Error") {
        Write-Warning "Firebase CLI no autenticado"
        Write-Info "Ejecuta: firebase login"
    } else {
        Write-Success "Firebase CLI autenticado"
    }
} catch {
    Write-Warning "Firebase CLI no encontrado"
    Write-Info "Instala con: npm install -g firebase-tools"
}

# ============================================================================
# 8. PLAYWRIGHT
# ============================================================================
Write-Header "Verificando Playwright..."

if (Test-Path "node_modules\@playwright\test") {
    Write-Success "Playwright instalado"

    # Verificar browsers
    $browsersPath = "$env:USERPROFILE\AppData\Local\ms-playwright"
    if (Test-Path $browsersPath) {
        Write-Success "Navegadores de Playwright instalados"
    } else {
        Write-Info "Instalando navegadores de Playwright..."
        npx playwright install
        Write-Success "Navegadores instalados"
    }
} else {
    Write-Warning "Playwright no encontrado en node_modules"
}

# ============================================================================
# 9. DOCKER (Opcional)
# ============================================================================
Write-Header "Verificando Docker (opcional)..."

try {
    $dockerVersion = docker --version
    Write-Success "Docker instalado: $dockerVersion"

    # Verificar si está corriendo
    $dockerInfo = docker info 2>&1
    if ($dockerInfo -match "Server Version") {
        Write-Success "Docker está corriendo"
    } else {
        Write-Warning "Docker instalado pero no está corriendo"
        Write-Info "Inicia Docker Desktop"
    }
} catch {
    Write-Info "Docker no encontrado (opcional)"
}

# ============================================================================
# 10. RESUMEN FINAL
# ============================================================================
Write-Host @"

╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   ✅ CONFIGURACIÓN COMPLETADA                                 ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

📚 PRÓXIMOS PASOS:

1️⃣  Recarga tu perfil de PowerShell:
   . `$PROFILE

2️⃣  Verifica GitHub Copilot en VSCode:
   Ctrl + I  (Copilot Chat)
   Tab       (Sugerencias inline)

3️⃣  Prueba los comandos rápidos:
   ghcs "crear componente React"
   ghce "git rebase -i HEAD~5"

4️⃣  Ejecuta el servidor de desarrollo:
   npm run dev

5️⃣  Ejecuta tests:
   npm run test

📖 DOCUMENTACIÓN:
   - COPILOT_ENTERPRISE_GUIDE.md
   - GUIA_MAESTRA_ULTRA_COMPLETA.md
   - README.md

🔗 ALIASES DISPONIBLES:
   ghcs, ghce          - GitHub Copilot shortcuts
   gs, ga, gc, gp      - Git shortcuts
   dev, build, test    - Project shortcuts
   copilot-review      - Revisar código
   copilot-test        - Generar tests
   copilot-optimize    - Optimizar código

🚀 ¡TODO LISTO! Comienza a desarrollar con máxima productividad.

"@ -ForegroundColor Green

Write-Host "Presiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
