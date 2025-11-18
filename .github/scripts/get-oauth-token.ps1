#!/usr/bin/env pwsh
# GitHub OAuth Token - Generador Automático
# Obtiene un OAuth token válido para GitHub Copilot CLI

Write-Host "`n🔐 GitHub OAuth Token Generator" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray

# Método 1: Autenticación Web (Recomendado)
Write-Host "`n📌 MÉTODO 1: Autenticación Web (Recomendado)" -ForegroundColor Yellow
Write-Host "Este método abrirá tu navegador para autenticación segura.`n" -ForegroundColor White

$response = Read-Host "¿Deseas usar autenticación web? (S/n)"
if ($response -ne 'n' -and $response -ne 'N') {
    Write-Host "`n🌐 Iniciando autenticación web..." -ForegroundColor Cyan
    Write-Host "1. Se abrirá tu navegador" -ForegroundColor Gray
    Write-Host "2. Autoriza GitHub CLI" -ForegroundColor Gray
    Write-Host "3. El token se guardará automáticamente`n" -ForegroundColor Gray
    
    # Autenticar con scopes necesarios para Copilot
    gh auth login --web --scopes "copilot,read:user,user:email,read:org"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ ¡Autenticación exitosa!" -ForegroundColor Green
        
        # Verificar autenticación
        Write-Host "`n📊 Estado de autenticación:" -ForegroundColor Cyan
        gh auth status
        
        # Obtener el token
        Write-Host "`n🔑 Obteniendo token OAuth..." -ForegroundColor Cyan
        $token = gh auth token
        
        if ($token) {
            Write-Host "`n✅ Token OAuth obtenido:" -ForegroundColor Green
            Write-Host $token -ForegroundColor Yellow
            
            # Guardar en variable de entorno
            $env:GITHUB_OAUTH_TOKEN = $token
            
            Write-Host "`n💾 Token guardado en:" -ForegroundColor Cyan
            Write-Host "  Variable de entorno: `$env:GITHUB_OAUTH_TOKEN" -ForegroundColor White
            
            # Guardar en archivo seguro
            $tokenPath = "$env:USERPROFILE\.github-oauth-token"
            $token | Out-File -FilePath $tokenPath -NoNewline
            Write-Host "  Archivo seguro: $tokenPath" -ForegroundColor White
            
            # Probar Copilot
            Write-Host "`n🧪 Probando GitHub Copilot CLI..." -ForegroundColor Cyan
            gh copilot suggest "list directory contents"
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "`n🎉 ¡GitHub Copilot CLI funcionando correctamente!" -ForegroundColor Green
            }
        }
    }
    else {
        Write-Host "`n❌ Error en la autenticación web" -ForegroundColor Red
        Write-Host "Intenta el Método 2 (Manual)" -ForegroundColor Yellow
    }
    
    exit 0
}

# Método 2: Token Manual
Write-Host "`n📌 MÉTODO 2: Crear Token OAuth Manualmente" -ForegroundColor Yellow
Write-Host "`nPasos para crear un OAuth token:" -ForegroundColor White
Write-Host "1. Ve a: https://github.com/login/oauth/authorize?client_id=Iv1.b507a08c87ecfe98&scope=copilot+read:user+user:email" -ForegroundColor Cyan
Write-Host "2. Autoriza la aplicación 'GitHub CLI'" -ForegroundColor Gray
Write-Host "3. Copia el código de autorización" -ForegroundColor Gray
Write-Host "4. Pégalo aquí cuando se solicite`n" -ForegroundColor Gray

$manualAuth = Read-Host "¿Deseas crear el token manualmente? (S/n)"
if ($manualAuth -ne 'n' -and $manualAuth -ne 'N') {
    Write-Host "`n🌐 Abriendo navegador..." -ForegroundColor Cyan
    Start-Process "https://github.com/login/oauth/authorize?client_id=Iv1.b507a08c87ecfe98&scope=copilot+read:user+user:email+read:org"
    
    Write-Host "`nEsperando código de autorización..." -ForegroundColor Yellow
    $authCode = Read-Host "Pega el código de autorización aquí"
    
    if ($authCode) {
        Write-Host "`n🔄 Intercambiando código por token..." -ForegroundColor Cyan
        
        # Nota: Este paso normalmente lo hace gh CLI automáticamente
        Write-Host "⚠️  El intercambio de código debe hacerse a través de gh CLI" -ForegroundColor Yellow
        Write-Host "Ejecutando: gh auth login con el código..." -ForegroundColor Gray
        
        echo $authCode | gh auth login --with-token 2>&1
    }
}

# Método 3: Usar Token PAT existente y agregar scopes
Write-Host "`n📌 MÉTODO 3: Convertir PAT a OAuth (Alternativa)" -ForegroundColor Yellow
Write-Host "`nSi ya tienes un Personal Access Token (PAT):" -ForegroundColor White

$usePAT = Read-Host "¿Tienes un PAT y quieres agregarlo? (S/n)"
if ($usePAT -ne 'n' -and $usePAT -ne 'N') {
    Write-Host "`n🔑 Ingresa tu Personal Access Token (PAT):" -ForegroundColor Cyan
    Write-Host "Debe tener estos scopes: repo, workflow, copilot, read:org" -ForegroundColor Gray
    
    $pat = Read-Host "Token PAT" -AsSecureString
    $plainPAT = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($pat)
    )
    
    if ($plainPAT) {
        Write-Host "`n🔄 Configurando token..." -ForegroundColor Cyan
        
        # Configurar en variable de entorno
        $env:GITHUB_TOKEN = $plainPAT
        
        # Intentar login con el token
        echo $plainPAT | gh auth login --with-token
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Token configurado" -ForegroundColor Green
            
            # Verificar
            gh auth status
            
            # Intentar agregar scopes de Copilot
            Write-Host "`n🔄 Intentando agregar scopes de Copilot..." -ForegroundColor Cyan
            gh auth refresh -s copilot 2>&1
        }
    }
}

Write-Host "`n" -NoNewline
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host "`n📚 INFORMACIÓN ADICIONAL:" -ForegroundColor Cyan
Write-Host "`n🔗 URLs Útiles:" -ForegroundColor Yellow
Write-Host "  • GitHub Tokens: https://github.com/settings/tokens" -ForegroundColor White
Write-Host "  • Copilot Settings: https://github.com/settings/copilot" -ForegroundColor White
Write-Host "  • OAuth Apps: https://github.com/settings/applications" -ForegroundColor White

Write-Host "`n💡 Comandos Útiles:" -ForegroundColor Yellow
Write-Host "  • Ver token actual: gh auth token" -ForegroundColor White
Write-Host "  • Ver estado: gh auth status" -ForegroundColor White
Write-Host "  • Logout: gh auth logout" -ForegroundColor White
Write-Host "  • Refresh scopes: gh auth refresh -s copilot" -ForegroundColor White

Write-Host "`n🔐 Scopes Necesarios para Copilot:" -ForegroundColor Yellow
Write-Host "  • copilot (acceso a Copilot)" -ForegroundColor White
Write-Host "  • read:user (leer perfil)" -ForegroundColor White
Write-Host "  • user:email (leer email)" -ForegroundColor White
Write-Host "  • read:org (leer organización)" -ForegroundColor White

Write-Host "`n"
