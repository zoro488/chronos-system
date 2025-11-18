# 🔑 GitHub Copilot - Configuración con Tokens

## Guía Paso a Paso para Configurar Tokens

---

## 1️⃣ Crear Personal Access Token (PAT)

### En GitHub.com

1. **Ve a Settings**
   - https://github.com/settings/tokens

2. **Genera nuevo token**
   - Click en "Generate new token (classic)"
   - O usa: https://github.com/settings/tokens/new

3. **Configura el token**
   
   **Nombre**: `Copilot Enterprise CLI - Premium Ecosystem`
   
   **Scopes requeridos**:
   ```
   ✅ repo (Full control of private repositories)
      ✓ repo:status
      ✓ repo_deployment
      ✓ public_repo
      ✓ repo:invite
      ✓ security_events
   
   ✅ workflow (Update GitHub Action workflows)
   
   ✅ write:packages (Upload packages to GitHub Package Registry)
      ✓ read:packages
   
   ✅ read:org (Read org and team membership)
   
   ✅ copilot (Access to GitHub Copilot)
   
   ✅ user (Update ALL user data)
      ✓ read:user
      ✓ user:email
   ```

4. **Genera y copia el token**
   - Click "Generate token"
   - **⚠️ COPIA EL TOKEN INMEDIATAMENTE** (solo se muestra una vez)
   - Formato: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 2️⃣ Configurar Token en Local

### Opción A: Variable de Entorno (Recomendado)

#### PowerShell (Windows)

```powershell
# Temporal (sesión actual)
$env:GITHUB_TOKEN = "ghp_tu_token_aqui"

# Permanente (perfil de usuario)
[System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'ghp_tu_token_aqui', 'User')

# Verificar
echo $env:GITHUB_TOKEN
```

#### Bash (Linux/Mac)

```bash
# Temporal
export GITHUB_TOKEN="ghp_tu_token_aqui"

# Permanente (~/.bashrc o ~/.zshrc)
echo 'export GITHUB_TOKEN="ghp_tu_token_aqui"' >> ~/.bashrc
source ~/.bashrc

# Verificar
echo $GITHUB_TOKEN
```

### Opción B: Archivo .env

```bash
# En el root del proyecto
echo "GITHUB_TOKEN=ghp_tu_token_aqui" >> .env

# Asegúrate que .env está en .gitignore
echo ".env" >> .gitignore
```

### Opción C: GitHub CLI

```powershell
# Método interactivo
gh auth login

# Método con token
gh auth login --with-token < token.txt

# O directamente
echo "ghp_tu_token_aqui" | gh auth login --with-token
```

---

## 3️⃣ Configurar Token en CI/CD

### GitHub Actions

1. **Ve a Settings del repositorio**
   - https://github.com/YOUR_USER/premium-ecosystem/settings/secrets/actions

2. **Añadir secretos**
   
   Click "New repository secret":
   
   ```
   Name: GITHUB_TOKEN
   Value: ghp_tu_token_aqui
   ```
   
   Secretos adicionales útiles:
   ```
   FIREBASE_SERVICE_ACCOUNT: {...}
   CODECOV_TOKEN: xxx
   SENTRY_AUTH_TOKEN: xxx
   ```

3. **Usar en workflows**

```yaml
# .github/workflows/copilot-integration.yml
jobs:
  job-name:
    steps:
      - name: Use token
        run: gh auth status
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 4️⃣ Verificar Configuración

### Verificar Autenticación

```powershell
# GitHub CLI
gh auth status

# Debe mostrar:
# ✓ Logged in to github.com as YOUR_USERNAME
# ✓ Token: ghp_************************************
```

### Verificar Copilot

```powershell
# Listar extensiones
gh extension list

# Debe incluir:
# gh copilot  github/gh-copilot

# Test Copilot
gh copilot suggest "list files"
```

### Verificar API Access

```powershell
# Test API
gh api user

# Debe retornar tu perfil en JSON
```

---

## 5️⃣ Ejecutar Setup Script

```powershell
# Con token como parámetro
.\.github\scripts\setup-copilot-enterprise.ps1 -GithubToken "ghp_tu_token_aqui"

# O si ya está en variable de entorno
.\.github\scripts\setup-copilot-enterprise.ps1

# Con organización
.\.github\scripts\setup-copilot-enterprise.ps1 `
  -GithubToken "ghp_tu_token_aqui" `
  -Organization "tu-org" `
  -Repository "premium-ecosystem"
```

---

## 6️⃣ Configurar Enterprise Features

### Para Organizaciones

1. **Habilitar Copilot Enterprise**
   - https://github.com/organizations/YOUR_ORG/settings/copilot
   - Enable Copilot for organization

2. **Configurar Políticas**
   - https://github.com/organizations/YOUR_ORG/settings/copilot/policies
   
   ```
   ✅ Allow Copilot suggestions matching public code
   ✅ Allow Copilot suggestions from any source
   ✅ Enable Copilot Chat
   ✅ Enable Copilot for Pull Requests
   ✅ Enable Copilot for CLI
   ```

3. **Asignar Seats**
   - https://github.com/organizations/YOUR_ORG/settings/copilot/seats
   - Add yourself and team members

### Para Usuarios Individuales

1. **Suscripción Copilot**
   - https://github.com/settings/copilot
   - Subscribe to Copilot Individual/Business/Enterprise

2. **Configurar Features**
   - https://github.com/settings/copilot/features
   
   ```
   ✅ Enable MCP servers in Copilot
   ✅ Enable Copilot Chat
   ✅ Enable suggestions matching public code
   ```

---

## 7️⃣ Token Security Best Practices

### DO ✅

- **Usa variables de entorno** en lugar de hardcodear
- **Rota tokens regularmente** (cada 90 días)
- **Usa scopes mínimos necesarios**
- **Almacena en password manager** (1Password, LastPass, etc.)
- **Revoca tokens no usados**
- **Usa diferentes tokens** para diferentes proyectos
- **Añade .env a .gitignore**

### DON'T ❌

- **NUNCA** comitees tokens en Git
- **NUNCA** compartas tokens públicamente
- **NUNCA** uses tokens en URLs
- **NUNCA** logees tokens completos
- **NUNCA** envíes tokens por email/chat sin cifrar

---

## 8️⃣ Revocar y Regenerar Tokens

### Revocar Token

1. **Ve a Settings → Tokens**
   - https://github.com/settings/tokens

2. **Click "Delete"** junto al token

### Regenerar Token

1. **Crea nuevo token** (pasos del inicio)
2. **Actualiza en todos los lugares**:
   ```powershell
   # Local
   $env:GITHUB_TOKEN = "ghp_nuevo_token"
   
   # GitHub Secrets
   # Settings → Secrets → Actions → Update
   
   # CI/CD
   # Actualiza en tu pipeline
   ```

---

## 9️⃣ Troubleshooting

### Error: "authentication required"

```powershell
# Re-autenticar
gh auth login --with-token

# Verificar token
gh auth status

# Refresh token
gh auth refresh -h github.com -s copilot
```

### Error: "insufficient scopes"

```powershell
# Verifica scopes del token
gh api user -i | grep X-OAuth-Scopes

# Regenera token con scopes correctos
```

### Error: "rate limit exceeded"

```powershell
# Verifica rate limit
gh api rate_limit

# Espera o usa otro token
```

### Token no funciona en CLI

```powershell
# Limpiar credenciales
gh auth logout

# Re-login
gh auth login --with-token
```

---

## 🔟 Scripts de Utilidad

### Verificar Todo

```powershell
# Crear script: verify-setup.ps1
$checks = @{
    "GitHub CLI" = { gh --version }
    "Auth Status" = { gh auth status }
    "Copilot Extension" = { gh extension list | Select-String copilot }
    "API Access" = { gh api user -q .login }
    "Token Env" = { $env:GITHUB_TOKEN -ne $null }
}

foreach ($check in $checks.GetEnumerator()) {
    Write-Host "`nChecking: $($check.Key)" -ForegroundColor Cyan
    try {
        & $check.Value
        Write-Host "✓ OK" -ForegroundColor Green
    } catch {
        Write-Host "✗ FAIL" -ForegroundColor Red
    }
}
```

### Auto-Refresh Token

```powershell
# En tu perfil de PowerShell
function Update-GitHubToken {
    $token = Read-Host "Enter new GitHub token" -AsSecureString
    $plainToken = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
    )
    
    $env:GITHUB_TOKEN = $plainToken
    [System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', $plainToken, 'User')
    
    echo $plainToken | gh auth login --with-token
    
    Write-Host "✓ Token updated successfully" -ForegroundColor Green
}
```

---

## 📱 Quick Reference

```powershell
# Variables de entorno
$env:GITHUB_TOKEN = "ghp_..."         # Temporal
[Environment]::SetEnvironmentVariable(...)  # Permanente

# GitHub CLI
gh auth login --with-token           # Login
gh auth status                       # Verificar
gh auth refresh -s copilot          # Refresh

# Copilot
gh extension install github/gh-copilot  # Instalar
gh copilot suggest "..."            # Sugerir
gh copilot explain "..."            # Explicar

# API
gh api user                         # Tu perfil
gh api rate_limit                   # Rate limit
gh api user/copilot_seats          # Copilot access
```

---

## 🔗 Links Útiles

- **Tokens**: https://github.com/settings/tokens
- **Copilot Settings**: https://github.com/settings/copilot
- **Copilot Features**: https://github.com/settings/copilot/features
- **CLI Manual**: https://cli.github.com/manual/
- **Scopes Docs**: https://docs.github.com/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps

---

**¡Token configurado! Ahora explota Copilot al máximo! 🚀**
