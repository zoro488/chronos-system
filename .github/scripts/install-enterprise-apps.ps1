<#
.SYNOPSIS
  Script seguro para ejecutar operaciones administrativas de GitHub/Enterprise usando gh CLI.
.DESCRIPTION
  Este script NO contiene tokens embebidos. Lee el token desde una variable de entorno y
  realiza autenticación con `gh`. Incluye comandos seguros de verificación y plantillas
  (comentadas) para operaciones de instalación/configuración que requieren privilegios de
  org/enterprise. Ejecuta sólo las acciones de lectura por defecto.
.NOTES
  - Exporta tu token en una variable de entorno (ejemplos en la guía docs/INSTALL_ENTERPRISE_APPS.md).
  - Revisa y adapta las plantillas antes de activar operaciones de escritura (POST/PUT/DELETE).
#>

param(
  [string]$EnvVarName = "GITHUB_TOKEN"
)

function Write-Info { param($m) Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-Warn { param($m) Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Write-Err  { param($m) Write-Host "[ERROR] $m" -ForegroundColor Red }

# 1) Leer token desde variables de entorno seguras
$token = $null
$envCandidates = @($EnvVarName, 'GH_TOKEN', 'GH_ENTERPRISE_TOKEN')
foreach ($name in $envCandidates) {
  # Use .NET API to read environment variables dynamically (evita $env:<name> sintaxis inválida)
  $val = [Environment]::GetEnvironmentVariable($name)
  if ($null -ne $val -and $val.Trim() -ne '') {
    $token = $val
    Write-Info "Usando token de la variable de entorno: $name"
    break
  }
}

if (-not $token) {
  Write-Err "No se encontró token en ninguna de las variables de entorno: $($envCandidates -join ', ')"
  Write-Host "Sugerencia: en PowerShell ejecuta:`n`$env:GITHUB_TOKEN = 'TU_TOKEN_AQUI'`nLuego ejecuta este script en la misma sesión." -ForegroundColor Gray
  exit 1
}

# 2) Autenticar con gh (entrada por stdin para evitar exponer en args)
try {
  Write-Info "Autenticando con gh..."
  $token | gh auth login --with-token 2>$null
  gh auth status
} catch {
  Write-Err "Error autenticando con gh. Asegúrate de tener instalado 'gh' y que el token sea válido."
  throw
}

# 3) Operaciones seguras de lectura para verificar permisos y contexto
Write-Info "Verificando identidad y organizaciones a las que tienes acceso..."
try {
  $user = gh api user --jq '.login' 2>$null
  Write-Host "Autenticado como: $user" -ForegroundColor Green
} catch {
  Write-Warn "No se pudo obtener el usuario mediante gh api user"
}

# Listar organizaciones a las que perteneces (útil para saber en qué orgs puedes operar)
Write-Info "Listando organizaciones del usuario (si aplica):"
try {
  gh api -H "Accept: application/vnd.github+json" /user/orgs --jq '.[].login' 2>$null | ForEach-Object { Write-Host "  - $_" }
} catch {
  Write-Warn "No se pudieron listar las organizaciones (posible falta de permisos)."
}

# Plantilla: Mostrar instalaciones de GitHub Apps del enterprise/org (entrada manual requerida)
Write-Host "`n========== PLANTILLAS DE ACCIONES (REVISAR ANTES DE EJECUTAR) ==========" -ForegroundColor Magenta
Write-Host "Los siguientes comandos son ejemplos. Descomenta/ajusta y ejecuta sólo si tienes privilegios y sabes lo que haces." -ForegroundColor Yellow

@'
# EJEMPLO: Listar instalaciones de aplicaciones instaladas en una organización
# gh api /orgs/{org}/installation --jq '.'

# EJEMPLO: Instalar una GitHub App en una organización (plantilla - requiere app_id y permisos)
# gh api --method POST /orgs/{org}/installation-requests -f app_id=12345

# EJEMPLO: Habilitar Copilot para una organización (plantilla - requiere permisos de admin org)
# gh api --method PUT /orgs/{org}/settings/copilot -f enabled=true

# EJEMPLO: Llamada al API para crear una Marketplace Purchase (NO USAR sin validar)
# gh api --method POST /orgs/{org}/marketplace_listing/purchase -f plan='pro'
'@ | Write-Host -ForegroundColor Gray

# 4) Operaciones seguras opcionales: preguntar al usuario antes de hacer acciones de escritura
Write-Host "`n¿Deseas ejecutar alguna acción de configuración automática (solo lectura por defecto)? [y/N]" -NoNewline
$answer = Read-Host
if ($answer -match '^[Yy]') {
  Write-Info "Ejecutando comprobaciones adicionales..."
  # Aquí podrías añadir más verificaciones o invocar endpoints concretos
  Write-Warn "Este script solo realiza comprobaciones por defecto. Para instalar/configurar apps, usa las plantillas y ejecuta manualmente las llamadas con gh api después de revisar."
} else {
  Write-Info "Saliendo sin ejecutar acciones de escritura. Revisa docs/INSTALL_ENTERPRISE_APPS.md para pasos detallados."
}

Write-Host "`nOperación finalizada. Recuerda rotar cualquier token expuesto inmediatamente." -ForegroundColor Green

# NOTA: No almacenamos el token en archivos. Si deseas automatizar completamente, considera usar GitHub Apps o OIDC en vez de PATs.
