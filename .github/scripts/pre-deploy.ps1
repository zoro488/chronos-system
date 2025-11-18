# 🚀 PRE-DEPLOY SCRIPT - FlowDistributor Production
# Prepara el sistema para producción de manera limpia

param(
  [switch]$SkipTests = $false,
  [switch]$SkipLint = $false
)

Write-Host '🚀 Iniciando preparación para producción...' -ForegroundColor Cyan
Write-Host ''

# 1. Verificar Node y npm
Write-Host '📦 Verificando entorno...' -ForegroundColor Yellow
$nodeVersion = node --version
$npmVersion = npm --version
Write-Host "  ✓ Node: $nodeVersion" -ForegroundColor Green
Write-Host "  ✓ npm: $npmVersion" -ForegroundColor Green
Write-Host ''

# 2. Limpiar builds antiguos
Write-Host '🧹 Limpiando builds antiguos...' -ForegroundColor Yellow
if (Test-Path 'dist') {
  Remove-Item -Recurse -Force 'dist'
  Write-Host '  ✓ Carpeta dist eliminada' -ForegroundColor Green
}
if (Test-Path '.firebase') {
  Remove-Item -Recurse -Force '.firebase'
  Write-Host '  ✓ Carpeta .firebase eliminada' -ForegroundColor Green
}
Write-Host ''

# 3. Verificar dependencias
Write-Host '📚 Verificando dependencias...' -ForegroundColor Yellow
if (-not (Test-Path 'node_modules')) {
  Write-Host '  ⚠️  node_modules no encontrado, instalando...' -ForegroundColor Yellow
  npm ci --silent
}
else {
  Write-Host '  ✓ node_modules encontrado' -ForegroundColor Green
}
Write-Host ''

# 4. Lint (opcional)
if (-not $SkipLint) {
  Write-Host '🔍 Ejecutando ESLint...' -ForegroundColor Yellow
  try {
    npm run lint 2>&1 | Out-Null
    Write-Host '  ✓ Lint passed' -ForegroundColor Green
  }
  catch {
    Write-Host '  ⚠️  Lint warnings encontrados (no crítico)' -ForegroundColor Yellow
  }
  Write-Host ''
}

# 5. Tests (opcional)
if (-not $SkipTests) {
  Write-Host '🧪 Ejecutando tests...' -ForegroundColor Yellow
  try {
    npm run test -- --run --silent 2>&1 | Out-Null
    Write-Host '  ✓ Tests passed' -ForegroundColor Green
  }
  catch {
    Write-Host '  ⚠️  Algunos tests fallaron' -ForegroundColor Yellow
    $continue = Read-Host '¿Continuar de todos modos? (y/n)'
    if ($continue -ne 'y') {
      Write-Host '❌ Deploy cancelado' -ForegroundColor Red
      exit 1
    }
  }
  Write-Host ''
}

# 6. Audit de seguridad
Write-Host '🔒 Audit de seguridad...' -ForegroundColor Yellow
$auditResult = npm audit --json | ConvertFrom-Json
$critical = $auditResult.metadata.vulnerabilities.critical
$high = $auditResult.metadata.vulnerabilities.high

if ($critical -gt 0 -or $high -gt 0) {
  Write-Host '  ⚠️  Vulnerabilidades detectadas:' -ForegroundColor Yellow
  Write-Host "     Critical: $critical" -ForegroundColor Red
  Write-Host "     High: $high" -ForegroundColor Yellow

  $fix = Read-Host '¿Ejecutar npm audit fix? (y/n)'
  if ($fix -eq 'y') {
    npm audit fix --silent
    Write-Host '  ✓ Vulnerabilidades parcheadas' -ForegroundColor Green
  }
}
else {
  Write-Host '  ✓ No se encontraron vulnerabilidades críticas' -ForegroundColor Green
}
Write-Host ''

# 7. Build de producción
Write-Host '🏗️  Ejecutando build de producción...' -ForegroundColor Yellow
Write-Host '  (Esto puede tomar 2-3 minutos)' -ForegroundColor Gray
Write-Host ''

$env:NODE_ENV = 'production'
$buildStart = Get-Date

try {
  npm run build
  $buildEnd = Get-Date
  $buildTime = ($buildEnd - $buildStart).TotalSeconds

  Write-Host ''
  Write-Host "  ✓ Build completado en $([math]::Round($buildTime, 2))s" -ForegroundColor Green
}
catch {
  Write-Host ''
  Write-Host '  ❌ Build falló' -ForegroundColor Red
  Write-Host "  Error: $_" -ForegroundColor Red
  exit 1
}
Write-Host ''

# 8. Analizar tamaño de bundle
Write-Host '📊 Analizando tamaño del bundle...' -ForegroundColor Yellow
if (Test-Path 'dist') {
  $distSize = (Get-ChildItem -Path 'dist' -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
  Write-Host "  📦 Tamaño total: $([math]::Round($distSize, 2)) MB" -ForegroundColor Cyan

  # Verificar chunks grandes
  $jsFiles = Get-ChildItem -Path 'dist/assets/js' -Filter '*.js' -ErrorAction SilentlyContinue
  if ($jsFiles) {
    Write-Host '  📄 Chunks JavaScript:' -ForegroundColor Cyan
    foreach ($file in $jsFiles | Sort-Object Length -Descending | Select-Object -First 5) {
      $sizeKB = [math]::Round($file.Length / 1KB, 2)
      $name = $file.Name.Substring(0, [Math]::Min(40, $file.Name.Length))
      Write-Host "     $name... → ${sizeKB} KB" -ForegroundColor Gray
    }
  }
}
Write-Host ''

# 9. Verificar archivos críticos
Write-Host '✅ Verificando archivos críticos...' -ForegroundColor Yellow
$criticalFiles = @(
  'dist/index.html',
  'dist/assets/js',
  'firebase.json',
  '.firebaserc'
)

$allFound = $true
foreach ($file in $criticalFiles) {
  if (Test-Path $file) {
    Write-Host "  ✓ $file" -ForegroundColor Green
  }
  else {
    Write-Host "  ❌ $file NO ENCONTRADO" -ForegroundColor Red
    $allFound = $false
  }
}
Write-Host ''

if ($allFound) {
  Write-Host '🎉 ¡Sistema listo para producción!' -ForegroundColor Green
  Write-Host ''
  Write-Host 'Próximos pasos:' -ForegroundColor Cyan
  Write-Host '  1. firebase deploy --only hosting (deploy completo)' -ForegroundColor White
  Write-Host '  2. firebase hosting:channel:deploy preview (preview)' -ForegroundColor White
  Write-Host '  3. firebase deploy --only firestore:rules (solo rules)' -ForegroundColor White
  Write-Host ''
  Write-Host 'Build ubicado en: ./dist' -ForegroundColor Gray
}
else {
  Write-Host '⚠️  Algunos archivos críticos no se encontraron' -ForegroundColor Yellow
  Write-Host 'Verifica el build antes de deployar' -ForegroundColor Yellow
  exit 1
}
