# 🔐 Guía: Obtener OAuth Token para GitHub Copilot CLI

## 🎯 Objetivo
Obtener un OAuth token válido para usar GitHub Copilot desde la línea de comandos (CLI).

---

## ⚡ Método Rápido (RECOMENDADO)

### Opción A: Script Automático

```powershell
# Ejecutar el script generador de OAuth token
.\.github\scripts\get-oauth-token.ps1
```

Este script te guiará paso a paso para:
1. Autenticar con GitHub vía web
2. Obtener automáticamente el OAuth token
3. Configurar todo correctamente
4. Probar que Copilot funcione

### Opción B: Comando Directo

```powershell
# Autenticación web con scopes necesarios
gh auth login --web --scopes "copilot,read:user,user:email,read:org"
```

---

## 📋 Métodos Disponibles

### 1️⃣ Autenticación Web OAuth (Recomendado)

Este es el método más seguro y simple:

```powershell
# Método interactivo
gh auth login --web

# O con scopes específicos
gh auth login --web --scopes "copilot,read:user,user:email,read:org"
```

**Pasos:**
1. Ejecuta el comando
2. Se abre tu navegador
3. Autoriza "GitHub CLI"
4. ¡Listo! El token se guarda automáticamente

**Verificar:**
```powershell
gh auth status
gh auth token
```

---

### 2️⃣ Crear OAuth App Personalizada

Si necesitas más control:

#### Paso 1: Crear OAuth App

1. Ve a: https://github.com/settings/developers
2. Click en "New OAuth App"
3. Configura:
   ```
   Application name: Copilot CLI Local
   Homepage URL: http://localhost
   Authorization callback URL: http://localhost:8080/callback
   ```
4. Copia el **Client ID** y genera un **Client Secret**

#### Paso 2: Autorizar la App

```powershell
# Reemplaza CLIENT_ID con tu Client ID
$clientId = "tu_client_id_aqui"
$scopes = "copilot+read:user+user:email+read:org"
$url = "https://github.com/login/oauth/authorize?client_id=$clientId&scope=$scopes"

# Abrir navegador
Start-Process $url
```

#### Paso 3: Intercambiar código por token

Después de autorizar, GitHub redirige a tu callback URL con un `code`:

```powershell
# Extraer el código de la URL de callback
$code = "código_recibido_en_callback"

# Intercambiar por token (requiere Client Secret)
$clientSecret = "tu_client_secret"
$body = @{
    client_id = $clientId
    client_secret = $clientSecret
    code = $code
}

$response = Invoke-RestMethod -Uri "https://github.com/login/oauth/access_token" `
    -Method POST -Body $body -Headers @{"Accept"="application/json"}

$oauthToken = $response.access_token
echo $oauthToken
```

---

### 3️⃣ Usar Token PAT con Scopes de Copilot

Si ya tienes un Personal Access Token (PAT):

#### Actualizar Scopes del PAT

1. Ve a: https://github.com/settings/tokens
2. Edita tu token existente o crea uno nuevo
3. Asegúrate de tener estos scopes:
   ```
   ✅ repo
   ✅ workflow
   ✅ read:org
   ✅ copilot
   ✅ user:email
   ```
4. Regenera el token si es necesario

#### Configurar el PAT actualizado

```powershell
# Configurar token
$env:GITHUB_TOKEN = "ghp_tu_token_con_copilot_scope"

# Login con el token
echo $env:GITHUB_TOKEN | gh auth login --with-token

# Intentar agregar scopes de Copilot
gh auth refresh -s copilot
```

---

### 4️⃣ Device Flow (Para servidores sin navegador)

```powershell
# Iniciar device flow
gh auth login --with-device-code
```

**Pasos:**
1. El comando muestra un código
2. Ve a: https://github.com/login/device
3. Ingresa el código
4. Autoriza la aplicación
5. Vuelve a la terminal

---

## 🔍 Verificar Token OAuth

### Obtener el token actual

```powershell
# Ver token
gh auth token

# Ver con detalles
$token = gh auth token
echo "Token: $token"
```

### Verificar scopes

```powershell
# Usar GitHub API para ver scopes
$token = gh auth token
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
}

Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers -Method Get
```

### Probar Copilot

```powershell
# Comando de prueba
gh copilot suggest "list directory contents"

# Si funciona, verás sugerencias de Copilot
```

---

## 💾 Guardar el Token OAuth

### Opción 1: Variable de Entorno (Temporal)

```powershell
# Sesión actual
$env:GITHUB_OAUTH_TOKEN = (gh auth token)
echo $env:GITHUB_OAUTH_TOKEN
```

### Opción 2: Variable de Entorno (Permanente)

```powershell
# Guardar permanentemente
$token = gh auth token
[System.Environment]::SetEnvironmentVariable('GITHUB_OAUTH_TOKEN', $token, 'User')
```

### Opción 3: Archivo Seguro

```powershell
# Guardar en archivo
$token = gh auth token
$tokenPath = "$env:USERPROFILE\.github-oauth-token"
$token | Out-File -FilePath $tokenPath -NoNewline

# Leer después
$savedToken = Get-Content $tokenPath -Raw
```

### Opción 4: PowerShell Profile

```powershell
# Agregar al perfil de PowerShell
$profilePath = $PROFILE
$tokenCommand = "`$env:GITHUB_OAUTH_TOKEN = (gh auth token 2>`$null)"
Add-Content -Path $profilePath -Value $tokenCommand

# Recargar perfil
. $PROFILE
```

---

## 🔧 Solución de Problemas

### Error: "No valid GitHub CLI OAuth token detected"

**Solución:**
```powershell
# Logout y re-login
gh auth logout
gh auth login --web --scopes "copilot,read:user,user:email,read:org"
```

### Error: "insufficient scopes"

**Solución:**
```powershell
# Agregar scopes necesarios
gh auth refresh -s copilot -s read:user -s user:email -s read:org
```

### Token funciona para API pero no para Copilot CLI

**Causa:** Los tokens PAT no funcionan para `gh copilot`, solo OAuth tokens.

**Solución:**
```powershell
# Usar autenticación web para obtener OAuth token
gh auth logout
gh auth login --web
```

### Verificar tipo de token

```powershell
# Ver información del token
gh auth status

# Si dice "GITHUB_TOKEN" es un PAT
# Si dice "oauth_token" es OAuth (lo que necesitas)
```

---

## 📊 Diferencias: PAT vs OAuth Token

| Característica | Personal Access Token (PAT) | OAuth Token |
|----------------|----------------------------|-------------|
| Formato | `ghp_...` | Varía |
| Creación | Manual en GitHub | A través de OAuth flow |
| Scopes | Configurables manualmente | Se solicitan durante auth |
| Expiración | Configurable (30-90 días) | Normalmente no expira |
| Uso en CLI | ✅ Comandos API | ✅ Todos los comandos |
| Copilot CLI | ❌ No funciona | ✅ Funciona |
| Refresh | ❌ Manual | ✅ Automático |

---

## 🎯 Quick Start Completo

```powershell
# 1. Autenticar con OAuth
gh auth login --web --scopes "copilot,read:user,user:email,read:org"

# 2. Verificar
gh auth status

# 3. Obtener token
$oauthToken = gh auth token
echo "Token OAuth: $oauthToken"

# 4. Guardar (opcional)
$env:GITHUB_OAUTH_TOKEN = $oauthToken

# 5. Probar Copilot
gh copilot suggest "deploy to Firebase"

# 6. Usar extensión Copilot
gh extension list
gh copilot --help
```

---

## 🔗 URLs Importantes

- **OAuth Apps**: https://github.com/settings/applications
- **Personal Tokens**: https://github.com/settings/tokens
- **Copilot Settings**: https://github.com/settings/copilot
- **Device Activation**: https://github.com/login/device
- **GitHub CLI Docs**: https://cli.github.com/manual/gh_auth_login

---

## 💡 Comandos Útiles

```powershell
# Ver token actual
gh auth token

# Ver estado completo
gh auth status

# Cambiar scopes
gh auth refresh -s copilot

# Logout
gh auth logout

# Lista de hosts autenticados
gh auth status --show-token

# Verificar Copilot
gh extension list
gh copilot suggest "test"
```

---

## 🎉 Siguiente Paso

Una vez que tengas el OAuth token funcionando:

1. ✅ Prueba `gh copilot suggest "tu comando"`
2. ✅ Usa el módulo PowerShell: `Import-Module .\.github\scripts\copilot-cli-tools.ps1`
3. ✅ Ejecuta las Tasks de VS Code
4. ✅ Aprovecha la automatización completa

---

**¡Ya tienes todo lo necesario para obtener y usar tu OAuth token! 🚀**
