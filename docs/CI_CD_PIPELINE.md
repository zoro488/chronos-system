# 🔄 Documentación del Pipeline CI/CD

## 📋 Tabla de Contenidos

- [Arquitectura del Pipeline](#arquitectura-del-pipeline)
- [Workflow Principal](#workflow-principal)
- [Stages del Pipeline](#stages-del-pipeline)
- [Triggers y Condiciones](#triggers-y-condiciones)
- [Proceso de Deployment](#proceso-de-deployment)
- [Rollback](#rollback)

---

## 🏗️ Arquitectura del Pipeline

El pipeline CI/CD de CHRONOS está diseñado para garantizar la calidad del código y automatizar el proceso de deployment.

```
┌─────────────────────────────────────────────────────────────┐
│                    PUSH / PULL REQUEST                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │   Lint & Type Check        │
         │   - ESLint                 │
         │   - TypeScript             │
         │   - Prettier               │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │   Unit Tests               │
         │   - Vitest                 │
         │   - Coverage Report        │
         │   - Upload to Codecov      │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │   Build                    │
         │   - Vite Build             │
         │   - Production Assets      │
         │   - Upload Artifacts       │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │   E2E Tests (Matrix)       │
         │   - Chromium               │
         │   - Firefox                │
         │   - WebKit                 │
         └────────────┬───────────────┘
                      │
           ┌──────────┴──────────┐
           │                     │
           ▼                     ▼
    ┌──────────┐         ┌─────────────┐
    │   PR     │         │    MAIN     │
    └──────────┘         └──────┬──────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   Deploy to Firebase   │
                    │   - Production         │
                    └────────────────────────┘
```

---

## 🚀 Workflow Principal

### Archivo: `.github/workflows/ci-cd-complete.yml`

Este workflow se ejecuta en cada push y pull request a las ramas `main` y `develop`.

### Jobs

1. **lint** - Validación de código
2. **unit-tests** - Tests unitarios con cobertura
3. **build** - Build de producción
4. **e2e-tests** - Tests end-to-end (matriz de navegadores)
5. **deploy** - Deployment a Firebase (solo en `main`)
6. **ci-status** - Verificación final del estado

---

## 📊 Stages del Pipeline

### 1. Lint & Type Check

**Duración esperada:** ~2 minutos

**Qué se verifica:**
- Sintaxis y estilo de código (ESLint)
- Formato de código (Prettier)
- Tipos de TypeScript (tsc --noEmit)

**Fallo común:**
- Código no formateado → Ejecuta `npm run lint:fix`
- Errores de tipo → Revisa los errores de TypeScript

**Comando local:**
```bash
npm run lint
npm run type-check
npx prettier --check "src/**/*.{ts,tsx,js,jsx}"
```

---

### 2. Unit Tests

**Duración esperada:** ~3 minutos

**Qué se ejecuta:**
- Tests unitarios con Vitest
- Reporte de cobertura
- Upload a Codecov

**Métricas:**
- Cobertura mínima esperada: 80%
- Tests deben pasar sin errores

**Comando local:**
```bash
npm run test:coverage
```

**Artifacts generados:**
- `coverage/lcov.info` - Reporte de cobertura

---

### 3. Build

**Duración esperada:** ~4 minutos

**Qué se genera:**
- Build optimizado de producción
- Assets minificados y comprimidos
- Source maps

**Configuración:**
- Output: `dist/`
- Mode: `production`
- Optimizaciones: tree-shaking, minificación

**Comando local:**
```bash
npm run build
```

**Artifacts generados:**
- `dist/` - Build completo (se sube como artifact)

---

### 4. E2E Tests

**Duración esperada:** ~10-15 minutos

**Matriz de navegadores:**
- Chromium (desktop)
- Firefox (desktop)
- WebKit (desktop)
- Mobile Chrome
- Mobile Safari
- Tablet iPad

**Qué se prueba:**
- Navegación básica
- Formularios
- Interacciones de usuario
- Responsive design

**Comando local:**
```bash
# Todos los navegadores
npm run test:e2e

# Un navegador específico
npx playwright test --project=chromium
```

**Artifacts generados:**
- `playwright-report-{browser}/` - Reportes HTML
- `test-results-{browser}/` - Screenshots y videos de fallos

---

### 5. Deploy

**Duración esperada:** ~3 minutos

**Condiciones:**
- ✅ Rama: `main`
- ✅ Tipo de evento: `push`
- ✅ Todos los tests pasaron

**Proceso:**
1. Descarga el artifact `dist/`
2. Autentica con Firebase usando Service Account
3. Deploya a Firebase Hosting
4. Genera preview URL

**Comando local:**
```bash
npm run build
firebase deploy --only hosting
```

---

## ⚡ Triggers y Condiciones

### Push Events

```yaml
on:
  push:
    branches: [main, develop]
```

**Comportamiento:**
- **main:** Pipeline completo + deploy
- **develop:** Pipeline completo sin deploy

### Pull Request Events

```yaml
on:
  pull_request:
    branches: [main, develop]
```

**Comportamiento:**
- Pipeline completo
- Sin deploy
- Comentarios en PR con resultados

---

## 🚢 Proceso de Deployment

### Deployment a Producción

1. **Merge a main:** Hacer merge del PR a `main`
2. **Trigger automático:** El pipeline se ejecuta automáticamente
3. **Validación:** Todos los tests deben pasar
4. **Build:** Se genera el build de producción
5. **Deploy:** Se deploya a Firebase Hosting
6. **Verificación:** Visitar el sitio y verificar cambios

### Environments

- **Production:** `chronos-system-prod` (main branch)
- **Staging:** `chronos-system-staging` (manual)
- **Development:** `chronos-system-dev` (manual)

### URLs

- Production: `https://chronos-system-prod.web.app`
- Staging: `https://chronos-system-staging.web.app`
- Development: `https://chronos-system-dev.web.app`

---

## 🔄 Rollback

Si necesitas hacer rollback a una versión anterior:

### Opción 1: Revert del Commit

```bash
# 1. Revertir el commit problemático
git revert <commit-hash>

# 2. Push a main
git push origin main

# 3. El pipeline se ejecutará automáticamente y deployará la versión anterior
```

### Opción 2: Deploy Manual de Versión Anterior

```bash
# 1. Checkout del commit anterior
git checkout <commit-hash>

# 2. Build
npm run build

# 3. Deploy manual
firebase deploy --only hosting

# 4. Volver a main
git checkout main
```

### Opción 3: Firebase Hosting Rollback

```bash
# Ver versiones anteriores
firebase hosting:releases list

# Rollback a una versión anterior
firebase hosting:clone <version-id> chronos-system-prod
```

---

## 📈 Métricas del Pipeline

### Performance Targets

| Stage | Target | Current |
|-------|--------|---------|
| Lint | < 2 min | ~1 min |
| Unit Tests | < 5 min | ~3 min |
| Build | < 5 min | ~4 min |
| E2E Tests | < 20 min | ~15 min |
| Deploy | < 5 min | ~3 min |
| **Total** | **< 30 min** | **~25 min** |

### Success Rate

- Target: > 95%
- Current: Monitorear en GitHub Actions

---

## 🔔 Notificaciones

### GitHub Checks

- Cada job reporta su estado en el PR
- Fallo en cualquier stage bloquea el merge

### Emails

- GitHub envía emails automáticos en caso de fallo
- Configurar en: Settings > Notifications

---

## 🐛 Debugging Pipeline Failures

### Lint Failures

```bash
# Ver errores
npm run lint

# Autofix
npm run lint:fix
```

### Test Failures

```bash
# Ver tests que fallan
npm run test

# Ver con UI
npm run test:ui
```

### Build Failures

```bash
# Ver errores de build
npm run build

# Verificar tipos
npm run type-check
```

### E2E Failures

```bash
# Ejecutar localmente
npm run test:e2e:headed

# Ver reporte
npm run test:e2e:report
```

### Revisar Logs en GitHub

1. Ve a la pestaña "Actions"
2. Click en el workflow que falló
3. Click en el job específico
4. Revisa los logs detallados

---

## 🔧 Configuración Avanzada

### Modificar Timeouts

```yaml
# En el workflow
jobs:
  e2e-tests:
    timeout-minutes: 30  # Modificar según necesidad
```

### Agregar Nuevo Stage

1. Edita `.github/workflows/ci-cd-complete.yml`
2. Agrega el nuevo job
3. Define dependencias con `needs: [job1, job2]`
4. Haz commit y push

### Cache de Dependencies

El pipeline ya usa cache de npm:

```yaml
- uses: actions/setup-node@v6
  with:
    node-version: '20'
    cache: 'npm'  # Cache automático
```

---

## 📚 Referencias

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Playwright CI](https://playwright.dev/docs/ci)
- [Vitest Guide](https://vitest.dev/guide/)

---

**Última actualización:** 2025-11-18
