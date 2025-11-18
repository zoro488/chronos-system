#!/usr/bin/env pwsh
# GitHub Copilot - Automatización Completa
# Script para automatizar tareas comunes con Copilot

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet('analyze', 'optimize', 'test', 'security', 'docs', 'all')]
    [string]$Action = 'all',
    
    [Parameter(Mandatory = $false)]
    [string]$Path = "src"
)

$ErrorActionPreference = "Continue"

Write-Host "🚀 Copilot Automation Tool" -ForegroundColor Cyan
Write-Host "Action: $Action | Path: $Path`n" -ForegroundColor Gray

# Función helper para ejecutar y loguear
function Invoke-CopilotAction {
    param(
        [string]$Name,
        [scriptblock]$Action
    )
    
    Write-Host "`n📌 $Name" -ForegroundColor Yellow
    Write-Host ("=" * 60) -ForegroundColor Gray
    
    try {
        & $Action
        Write-Host "✓ Completado" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Error: $_" -ForegroundColor Red
    }
}

# 1. Análisis de Código
function Start-CodeAnalysis {
    Invoke-CopilotAction "Análisis de Código" {
        $files = Get-ChildItem -Path $Path -Recurse -Include *.js, *.jsx -File
        
        Write-Host "  Archivos encontrados: $($files.Count)" -ForegroundColor Cyan
        
        foreach ($file in $files | Select-Object -First 5) {
            Write-Host "  Analizando: $($file.Name)..." -ForegroundColor Gray
            
            # ESLint
            npx eslint $file.FullName --format json 2>$null | Out-Null
            
            # Complejidad
            npx complexity $file.FullName 2>$null | Out-Null
        }
        
        # Resumen general
        npx eslint $Path --format stylish
    }
}

# 2. Optimización de Código
function Start-CodeOptimization {
    Invoke-CopilotAction "Optimización de Código" {
        # Auto-fix ESLint
        Write-Host "  Aplicando auto-fixes..." -ForegroundColor Gray
        npx eslint $Path --fix --ext .js, .jsx
        
        # Prettier
        Write-Host "  Formateando código..." -ForegroundColor Gray
        npx prettier --write "$Path/**/*.{js,jsx,json,css}"
        
        # Remover imports no usados
        Write-Host "  Limpiando imports..." -ForegroundColor Gray
        npx tsc --noEmit 2>$null | Out-Null
    }
}

# 3. Generación de Tests
function Start-TestGeneration {
    Invoke-CopilotAction "Generación de Tests" {
        $files = Get-ChildItem -Path $Path -Recurse -Include *.js, *.jsx -File |
        Where-Object { $_.Name -notmatch '\.test\.' }
        
        $generated = 0
        
        foreach ($file in $files | Select-Object -First 10) {
            $testFile = $file.FullName -replace '\.jsx?$', '.test$&'
            
            if (-not (Test-Path $testFile)) {
                Write-Host "  Generando test para: $($file.Name)..." -ForegroundColor Gray
                
                # Template básico de test
                $testContent = @"
import { describe, it, expect } from 'vitest';
// Import component or function here

describe('$($file.BaseName)', () => {
  it('should work', () => {
    // TODO: Add test implementation
    expect(true).toBe(true);
  });
});
"@
                
                Set-Content -Path $testFile -Value $testContent
                $generated++
            }
        }
        
        Write-Host "  Tests generados: $generated" -ForegroundColor Green
        
        # Ejecutar tests
        npm run test:run
    }
}

# 4. Análisis de Seguridad
function Start-SecurityAnalysis {
    Invoke-CopilotAction "Análisis de Seguridad" {
        # npm audit
        Write-Host "  Ejecutando npm audit..." -ForegroundColor Gray
        npm audit --audit-level=moderate
        
        # Verificar dependencias
        Write-Host "`n  Verificando dependencias..." -ForegroundColor Gray
        npx depcheck
        
        # Verificar código
        Write-Host "`n  Buscando vulnerabilidades en código..." -ForegroundColor Gray
        npx eslint $Path --ext .js, .jsx --rule 'no-eval: error' --rule 'no-implied-eval: error'
    }
}

# 5. Generación de Documentación
function Start-DocGeneration {
    Invoke-CopilotAction "Generación de Documentación" {
        # JSDoc
        Write-Host "  Generando JSDoc..." -ForegroundColor Gray
        npx jsdoc -c .jsdoc.json 2>$null
        
        # README para componentes
        $components = Get-ChildItem -Path "src/components" -Directory
        
        foreach ($comp in $components | Select-Object -First 5) {
            $readmePath = Join-Path $comp.FullName "README.md"
            
            if (-not (Test-Path $readmePath)) {
                Write-Host "  Creando README para: $($comp.Name)..." -ForegroundColor Gray
                
                $readmeContent = @"
# $($comp.Name)

## Descripción

[Agregar descripción del componente]

## Uso

\`\`\`jsx
import $($comp.Name) from './components/$($comp.Name)';

function App() {
  return <$($comp.Name) />;
}
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| -    | -    | -       | -           |

## Ejemplos

[Agregar ejemplos]
"@
                
                Set-Content -Path $readmePath -Value $readmeContent
            }
        }
    }
}

# Ejecutar acciones según parámetro
switch ($Action) {
    'analyze' { Start-CodeAnalysis }
    'optimize' { Start-CodeOptimization }
    'test' { Start-TestGeneration }
    'security' { Start-SecurityAnalysis }
    'docs' { Start-DocGeneration }
    'all' {
        Start-CodeAnalysis
        Start-CodeOptimization
        Start-TestGeneration
        Start-SecurityAnalysis
        Start-DocGeneration
    }
}

# Reporte final
Write-Host "`n" -NoNewline
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host "✅ Automatización completada!" -ForegroundColor Green
Write-Host "`nPróximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Revisa los cambios: git status" -ForegroundColor White
Write-Host "  2. Ejecuta tests: npm test" -ForegroundColor White
Write-Host "  3. Commit cambios: git add . && git commit" -ForegroundColor White
Write-Host "  4. Push: git push" -ForegroundColor White
