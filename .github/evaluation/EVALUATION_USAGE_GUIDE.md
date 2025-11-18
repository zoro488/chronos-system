# 📚 Guía de Uso - Sistema de Evaluación Completo

## 🎯 Índice

1. [Introducción](#introducción)
2. [Configuración Inicial](#configuración-inicial)
3. [Ejecución de Evaluaciones](#ejecución-de-evaluaciones)
4. [Interpretación de Resultados](#interpretación-de-resultados)
5. [Workflows Automatizados](#workflows-automatizados)
6. [Pull Request Guidelines](#pull-request-guidelines)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Introducción

Este sistema de evaluación proporciona una suite completa de herramientas para garantizar la calidad, rendimiento y seguridad del código en **Premium Ecosystem**.

### Componentes Principales

```
premium-ecosystem/
├── .github/
│   ├── evaluation/
│   │   └── EVALUATION_FRAMEWORK.md  # 📊 Métricas y criterios
│   ├── workflows/
│   │   ├── evaluation-pipeline.yml  # 🔄 Pipeline principal
│   │   ├── auto-healing.yml        # 🤖 Auto-reparación
│   │   └── multi-task-automation.yml # 🎯 Tasks múltiples
│   └── PULL_REQUEST_TEMPLATE.md    # ✅ Template de PR
├── .lighthouserc.json              # 🔦 Config performance
└── .pa11yci.json                   # ♿ Config accesibilidad
```

---

## ⚙️ Configuración Inicial

### 1. Instalar Dependencias de Desarrollo

```bash
# Herramientas de testing
npm install -D vitest @vitest/ui @vitest/coverage-v8
npm install -D @playwright/test
npm install -D @testing-library/react @testing-library/jest-dom

# Herramientas de calidad
npm install -D eslint prettier
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Herramientas de performance
npm install -D @lhci/cli

# Herramientas de accesibilidad
npm install -D pa11y-ci axe-core
```

### 2. Configurar Variables de Entorno

Crear archivo `.env.local`:

```env
# GitHub Actions
GITHUB_TOKEN=your_github_token

# Firebase (para testing)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id

# Lighthouse CI (opcional)
LHCI_GITHUB_APP_TOKEN=your_lhci_token

# Sentry (monitoring)
SENTRY_DSN=your_sentry_dsn
```

### 3. Configurar Firebase Emulators

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Inicializar emulators
firebase init emulators

# Iniciar emulators
firebase emulators:start
```

---

## 🧪 Ejecución de Evaluaciones

### Evaluación Local Completa

```bash
# 1. Linting y formato
npm run lint              # ESLint check
npm run format:check      # Prettier check
npm run lint:fix          # Auto-fix lint issues
npm run format            # Auto-format code

# 2. Type checking
npx tsc --noEmit         # TypeScript errors

# 3. Unit tests
npm test                  # Run once
npm run test:ui           # Interactive UI
npm run test:coverage     # With coverage report

# 4. E2E tests
npm run test:e2e          # Headless mode
npm run test:e2e:ui       # Interactive mode

# 5. Performance audit
npm run build
npx lhci autorun          # Lighthouse CI

# 6. Accessibility audit
npm install -g pa11y-ci
pa11y-ci                  # Run accessibility tests

# 7. Security audit
npm audit                 # Vulnerability scan
npm audit fix             # Auto-fix vulnerabilities
```

### Evaluación Rápida (Pre-commit)

```bash
# Script recomendado para pre-commit
npm run lint && \
npm run format:check && \
npm test --passWithNoTests && \
npx tsc --noEmit
```

### Evaluación Completa (Pre-push)

```bash
# Script para antes de hacer push
npm run lint:fix && \
npm run format && \
npm run test:coverage && \
npm run build && \
npm run test:e2e
```

---

## 📊 Interpretación de Resultados

### 1. Resultados de Linting

#### ✅ Éxito
```
✨ 0 errors, 0 warnings

Estado: APROBADO
Acción: Continuar con siguientes checks
```

#### ⚠️ Advertencias
```
⚠️ 5 errors, 12 warnings

Errores comunes:
- 'variable' is defined but never used
- Unexpected console statement
- Missing return type on function

Acción: Revisar y corregir con `npm run lint:fix`
```

#### ❌ Errores Críticos
```
❌ 25 errors, 50 warnings

Errores bloqueantes:
- Parsing error: Unexpected token
- 'React' must be in scope when using JSX
- Type 'any' is not assignable to type 'string'

Acción: Corrección manual requerida
```

### 2. Resultados de Tests

#### Coverage Report
```
File                    | % Stmts | % Branch | % Funcs | % Lines |
------------------------|---------|----------|---------|---------|
All files               |   82.34 |    75.67 |   79.23 |   83.45 |
 src/                   |   85.12 |    78.92 |   82.34 |   86.23 |
 src/components/        |   88.45 |    82.67 |   85.89 |   89.12 |
 src/hooks/             |   76.23 |    68.45 |   72.11 |   77.89 |
 src/utils/             |   69.12 |    62.34 |   65.78 |   70.45 |
```

**Interpretación:**
- ✅ **>80%**: Excelente cobertura
- 🟡 **70-80%**: Aceptable, mejorar
- 🔴 **<70%**: Crítico, añadir tests

#### Test Failures
```
FAIL src/components/FormVenta.test.tsx
  ● FormVenta › should validate required fields

    expect(received).toBe(expected)

    Expected: "Campo requerido"
    Received: undefined

      at Object.<anonymous> (src/components/FormVenta.test.tsx:45:23)
```

**Acción:**
1. Revisar implementación de validación
2. Verificar que el mensaje de error esté definido
3. Actualizar test o código según corresponda

### 3. Resultados de Performance (Lighthouse)

```json
{
  "performance": 92,
  "accessibility": 95,
  "best-practices": 88,
  "seo": 91
}
```

**Criterios:**
- 🟢 **90-100**: Excelente
- 🟡 **70-89**: Bueno, optimizable
- 🔴 **<70**: Requiere optimización urgente

**Métricas Clave:**
```
First Contentful Paint (FCP): 1.2s    ✅ <1.8s
Largest Contentful Paint (LCP): 2.1s  ✅ <2.5s
Cumulative Layout Shift (CLS): 0.05   ✅ <0.1
Total Blocking Time (TBT): 150ms      ✅ <200ms
Speed Index: 2.8s                     ✅ <3.8s
```

### 4. Resultados de Seguridad

```bash
# npm audit output
┌───────────────┬──────────────────┐
│ Severity      │ Count            │
├───────────────┼──────────────────┤
│ Critical      │ 0 ✅             │
│ High          │ 2 ⚠️             │
│ Moderate      │ 5 🟡             │
│ Low           │ 12 🟢            │
└───────────────┴──────────────────┘

High vulnerabilities:
- semver (<7.5.2): Regular Expression Denial of Service
  Fix available: npm audit fix --force

- postcss (<8.4.31): Line return parsing error
  Fix available: npm update postcss
```

**Acción Inmediata:**
```bash
# 1. Intentar fix automático
npm audit fix

# 2. Si persisten críticos/high
npm audit fix --force

# 3. Verificar que todo sigue funcionando
npm test && npm run build
```

### 5. Resultados de Accesibilidad

```
Pa11y CI Results:
✓ http://localhost:3001/ - 0 errors
✓ http://localhost:3001/flowdistributor - 3 warnings
✗ http://localhost:3001/smartsales - 2 errors

Errors:
1. Button has no accessible text (WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.Button.Name)
   Fix: Add aria-label or text content to button

2. Color contrast ratio of 3.2:1 is less than 4.5:1 (WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail)
   Fix: Increase contrast between text and background
```

**Prioridades de Corrección:**
1. **Errors (P0)**: Deben corregirse antes de merge
2. **Warnings (P1)**: Corregir en próximo sprint
3. **Notices (P2)**: Mejoras opcionales

---

## 🔄 Workflows Automatizados

### 1. Evaluation Pipeline (Automático en PR)

**Trigger:** Pull Request a `main` o `develop`

**Fases:**
```
Phase 1: Code Quality (5 min)
  ├── Lint & Format Check
  ├── TypeScript Type Check
  └── Code Complexity Analysis

Phase 2: Testing (15 min)
  ├── Unit Tests + Coverage
  ├── E2E Tests (3 navegadores)
  └── Component Tests

Phase 3: Performance (10 min)
  ├── Lighthouse Audit
  ├── Bundle Size Analysis
  └── Load Time Measurement

Phase 4: Security (5 min)
  ├── Dependency Audit
  ├── Secret Scanning
  └── OWASP Check

Phase 5: Accessibility (5 min)
  ├── axe-core
  ├── Pa11y CI
  └── WCAG 2.1 AA Compliance

Phase 6: Quality Gate (2 min)
  └── Aggregate Results & Decision

Phase 7: Deployment (5 min)
  └── Preview Deploy (si pasa quality gate)
```

**Acceso a Resultados:**
- GitHub Actions tab → Workflow run
- Artifacts descargables (reports)
- Comentario automático en PR con resumen

### 2. Auto-Healing Workflow

**Trigger:**
- Scheduled (cada 6 horas)
- Manual dispatch

**Capacidades:**
```
🏥 Health Check
  ├── Dependencies outdated?
  ├── Security vulnerabilities?
  ├── Test failures?
  ├── Type errors?
  └── Lint errors?

🔧 Auto-Fix (si detecta issues)
  ├── npm update (patch versions)
  ├── npm audit fix
  ├── npm run lint:fix
  ├── Auto-import missing types
  └── Format code

🚨 Create Issues (si no puede auto-fix)
  └── Manual intervention required
```

**Ver Resultados:**
```bash
# GitHub Issues con label "auto-healing"
# Contiene: reporte detallado de issues y fixes aplicados
```

### 3. Multi-Task Automation

**Trigger:** Manual dispatch con selección de task

**Tasks Disponibles:**

#### 📊 Full Audit
```bash
# Análisis completo del sistema
- Code quality metrics
- Test coverage report
- Security scan
- Performance benchmarks
- Dependency analysis
```

#### ⚡ Frontend Optimization
```bash
# Optimización automática de frontend
- Image compression
- CSS purging
- Bundle analysis
- Lazy loading check
```

#### 🔥 Backend Optimization
```bash
# Optimización de Firestore
- Query analysis
- Index recommendations
- Security rules validation
- Transaction usage audit
```

#### 🧪 Testing Suite
```bash
# Suite completa de tests
- Unit tests (con coverage)
- E2E tests (todos los navegadores)
- Accessibility tests
- Visual regression
```

#### 🛡️ Deep Security Scan
```bash
# Escaneo profundo de seguridad
- npm audit detallado
- Secret detection (TruffleHog)
- OWASP dependency check
- Snyk vulnerability scan
```

#### 📚 Documentation Update
```bash
# Actualización automática de docs
- TypeDoc API generation
- Component documentation
- Changelog update
- README metrics refresh
```

#### 📦 Dependency Update
```bash
# Actualización inteligente de dependencias
- Update patch versions (automático)
- Create PR for major updates
- Test compatibility
```

#### ⚡ Performance Benchmark
```bash
# Benchmark de rendimiento
- Lighthouse CI (todas las páginas)
- Bundle size tracking
- Load time analysis
- Core Web Vitals
```

**Ejecutar Manualmente:**
```
GitHub Actions → Multi-Workflow Task Automation → Run workflow
→ Seleccionar task → Run workflow
```

---

## ✅ Pull Request Guidelines

### Antes de Crear el PR

```bash
# 1. Sincronizar con main
git checkout main
git pull origin main
git checkout tu-rama
git merge main

# 2. Ejecutar evaluación local
npm run lint:fix
npm run format
npm test
npm run build

# 3. Commit final
git add .
git commit -m "feat: descripción del cambio"
git push origin tu-rama
```

### Completar el Template de PR

**Secciones Obligatorias:**

1. **📋 PR Metadata**
   - Type: Feature / Bug Fix / Refactor / etc.
   - Priority: P0-P3
   - Estimated Effort: S / M / L / XL
   - Deployment Risk: Low / Medium / High

2. **📖 Description**
   - ¿Qué problema resuelve?
   - ¿Cómo lo resuelve?
   - ¿Hay alternativas consideradas?

3. **✅ Comprehensive Checklist**
   - Marcar TODAS las casillas aplicables
   - NO mergear si quedan P0 sin marcar

4. **📊 Test Results**
   - Copiar output de tests locales
   - Incluir coverage percentage
   - Screenshots de E2E si aplica

5. **🔒 Security Check**
   - Confirmar npm audit limpio
   - No secrets expuestos
   - Input validation implementada

### Proceso de Review

```
1. PR creado → Evaluation Pipeline se ejecuta automáticamente

2. Reviewer recibe notificación con:
   ├── Código diff
   ├── Checklist completado
   ├── Test results
   ├── CI/CD status
   └── Preview deployment link

3. Review criteria:
   ├── ✅ All automated checks pass
   ├── ✅ Code quality meets standards
   ├── ✅ Tests cover changes
   ├── ✅ Documentation updated
   └── ✅ No security concerns

4. Approval → Merge to main → Production deploy
```

### Estados del PR

| Estado | Descripción | Acción |
|--------|-------------|--------|
| 🟢 **All checks passed** | Listo para review | Asignar reviewers |
| 🟡 **Some checks failed** | Requiere correcciones | Fix issues y push |
| 🔴 **Multiple failures** | Problemas serios | Revisar cambios, posible revert |
| ⏸️ **Draft** | Work in progress | No asignar reviewers aún |

---

## 🔧 Troubleshooting

### Problema: Tests Fallando Localmente pero Pasando en CI

**Posibles Causas:**
```
1. Diferencia en versiones de Node.js
2. Variables de entorno diferentes
3. Cache corrupto local
```

**Solución:**
```bash
# 1. Verificar versión de Node
node --version  # Debe ser v20.x

# 2. Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
rm -rf .vite dist coverage
npm install

# 3. Ejecutar tests con env variables
npm test -- --no-cache
```

### Problema: Lighthouse Score Bajo en CI

**Diagnóstico:**
```bash
# Ejecutar Lighthouse localmente
npm run build
npx vite preview --port 3001

# En otra terminal
npx lhci autorun --config=.lighthouserc.json
```

**Optimizaciones Comunes:**
```javascript
// 1. Lazy load componentes pesados
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// 2. Optimizar imágenes
<img src="image.jpg" loading="lazy" decoding="async" />

// 3. Code splitting por ruta
const routes = [
  {
    path: '/dashboard',
    component: lazy(() => import('./pages/Dashboard'))
  }
];

// 4. Preload assets críticos
<link rel="preload" href="critical.css" as="style" />
```

### Problema: TypeScript Errors en node_modules

**Solución:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true  // ✅ Ignorar errores en node_modules
  },
  "exclude": [
    "node_modules",
    "dist",
    "coverage"
  ]
}
```

### Problema: E2E Tests Flakey (intermitentes)

**Mejores Prácticas:**
```javascript
// ❌ Mal: Espera fija
await page.waitForTimeout(5000);

// ✅ Bien: Espera por condición
await page.waitForSelector('#data-loaded');

// ✅ Mejor: Retry automático con timeout
await expect(page.locator('.success')).toBeVisible({ timeout: 10000 });

// ✅ Aún mejor: Multiple assertions
await Promise.all([
  expect(page.locator('.title')).toBeVisible(),
  expect(page.locator('.content')).toContainText('Expected text')
]);
```

### Problema: Bundle Size Demasiado Grande

**Análisis:**
```bash
# Generar reporte visual
npm run build
npx vite-bundle-visualizer
```

**Optimizaciones:**
```javascript
// 1. Tree-shake imports
import { specific } from 'library';  // ✅
import * as all from 'library';      // ❌

// 2. Dynamic imports
const Chart = await import('recharts');

// 3. Reemplazar librerías pesadas
// recharts (187KB) → chart.js (60KB)
// moment (67KB) → date-fns (13KB)
// lodash (71KB) → lodash-es + tree-shaking
```

---

## 📈 Métricas de Éxito

### KPIs a Monitorear

```javascript
const successMetrics = {
  technical: {
    buildTime: '<200ms',
    testCoverage: '>80%',
    typeScriptErrors: '0',
    bundleSize: '<1MB',
    lighthouseScore: '>90'
  },
  process: {
    prMergeTime: '<4 hours',
    cicdSuccessRate: '>95%',
    deploymentFrequency: '10/week',
    rollbackRate: '<5%'
  },
  quality: {
    productionBugs: '<5/sprint',
    securityVulnerabilities: '0 critical',
    accessibilityScore: '>90',
    performanceScore: '>90'
  }
};
```

### Dashboard Recomendado

```
📊 Quality Dashboard (actualizado semanalmente)
├── Code Coverage Trend
├── Test Success Rate
├── Performance Scores
├── Security Vulnerabilities
├── Build Time Trend
└── Deployment Frequency
```

---

## 🎓 Recursos Adicionales

### Documentación
- [Evaluation Framework](./EVALUATION_FRAMEWORK.md)
- [Testing Guide](../docs/TESTING_GUIDE.md)
- [Performance Guide](../docs/PERFORMANCE_GUIDE.md)
- [Security Checklist](../docs/SECURITY_CHECKLIST.md)

### Herramientas Externas
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Vitest Guide](https://vitest.dev/guide/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Soporte
- Issues de GitHub para bugs
- Discussions para preguntas
- Slack #engineering para consultas rápidas

---

**Última Actualización:** 2025-11-14
**Mantenido por:** Engineering Team
**Versión:** 1.0.0
