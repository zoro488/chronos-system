# 🚀 Pull Request

<!--
AUTOMATED EVALUATION: This PR will be evaluated by our comprehensive CI/CD pipeline
✅ Lint & Format | 📘 Type Check | 🧪 Tests | ⚡ Performance | 🔒 Security | ♿ Accessibility
-->

## 📋 PR Metadata
**Type:** <!-- Feature / Bug Fix / Refactor / Docs / Performance / Security -->
**Priority:** <!-- P0 - Critical / P1 - High / P2 - Medium / P3 - Low -->
**Estimated Effort:** <!-- S / M / L / XL -->
**Deployment Risk:** <!-- Low / Medium / High / Critical -->

## 📖 Description
<!-- Provide a detailed description of the changes -->


## 🎯 Type of Change
<!-- Mark with 'x' the type(s) that apply -->
- [ ] 🐛 **Bug Fix** - Non-breaking change which fixes an issue
- [ ] ✨ **New Feature** - Non-breaking change which adds functionality
- [ ] 💥 **Breaking Change** - Fix or feature that would cause existing functionality to not work
- [ ] 📝 **Documentation** - Documentation only changes
- [ ] ♻️ **Refactoring** - Code changes that neither fix a bug nor add a feature
- [ ] ⚡ **Performance** - Changes that improve performance
- [ ] 🧪 **Testing** - Adding or updating tests
- [ ] 🔧 **Configuration** - Changes to configuration files
- [ ] 🔒 **Security** - Security vulnerability fix or improvement

## 🎨 Applications Affected
<!-- Mark with 'x' all that apply -->
- [ ] **FlowDistributor** - Main business management system
- [ ] **SmartSales** - Intelligent sales system
- [ ] **ClientHub** - CRM system
- [ ] **AnalyticsPro** - Analytics dashboard
- [ ] **TeamSync** - Team collaboration
- [ ] **Shared Components** - Cross-app components
- [ ] **Backend/Firebase** - Database, auth, functions
- [ ] **CI/CD Pipeline** - Build, test, deployment
- [ ] **Infrastructure** - Configuration, Docker, etc.

## 🔗 Related Issues
<!-- Link related issues using #issue_number -->
Closes #
Fixes #
Related to #

## 📝 Changes Made
<!-- Provide a detailed list of changes -->

### Frontend Changes
-

### Backend Changes
-

### Configuration Changes
-

## ✅ Comprehensive Checklist

### 🎨 Code Quality (Required)
- [ ] Code follows project style guidelines (ESLint + Prettier)
- [ ] Self-review completed
- [ ] Code is well-commented (complex logic explained)
- [ ] Documentation updated (README, JSDoc, inline comments)
- [ ] No console.log or debugging code remaining
- [ ] No hardcoded values (use env variables/constants)

### 🧪 Testing (Required)
- [ ] Unit tests added/updated for new code
- [ ] E2E tests added for critical flows
- [ ] All tests passing locally
- [ ] Test coverage maintained or improved
- [ ] Edge cases considered and tested

**Test Results:**
```bash
npm test           # ✅ / ❌ Passing
npm run test:e2e   # ✅ / ❌ Passing
Coverage: __%      # Target: ≥80%
```

### 📘 TypeScript (if applicable)
- [ ] No TypeScript errors
- [ ] Type definitions added for new code
- [ ] No `any` type (or properly justified with comment)
- [ ] Strict mode compliance maintained
- [ ] Interface/Type definitions exported where needed

**TypeScript Check:**
```bash
npx tsc --noEmit   # ✅ / ❌ Errors: 0
```

### 🎨 Linting & Formatting (Required)
- [ ] ESLint passes with 0 errors, 0 warnings
- [ ] Prettier formatting applied
- [ ] Import statements organized
- [ ] Unused imports removed

**Lint Check:**
```bash
npm run lint       # ✅ / ❌
npm run format:check # ✅ / ❌
```

### ⚡ Performance (if applicable)
- [ ] Bundle size impact assessed (<1MB target)
- [ ] Lazy loading implemented where appropriate
- [ ] useMemo/useCallback used for expensive operations
- [ ] Images optimized (WebP format)
- [ ] No performance regressions

**Performance Metrics:**
```
Bundle Size Impact: +/- __ KB
Lighthouse Score: __/100 (target: ≥90)
FCP: __ms (target: <1.8s)
LCP: __ms (target: <2.5s)
```

### 🔒 Security (Required)
- [ ] No sensitive data exposed (API keys, passwords, tokens)
- [ ] Input validation implemented
- [ ] SQL injection / XSS vulnerabilities checked
- [ ] Dependencies scanned (npm audit)
- [ ] Firebase security rules updated (if schema change)
- [ ] Environment variables used for secrets

**Security Audit:**
```bash
npm audit          # ✅ / ❌
Critical: 0        # Target: 0
High: 0            # Target: 0
```

### ♿ Accessibility (for UI changes)
- [ ] ARIA labels added where needed
- [ ] Keyboard navigation tested
- [ ] Color contrast ≥4.5:1 (WCAG AA)
- [ ] Screen reader compatible
- [ ] Focus indicators visible
- [ ] Semantic HTML used

**Accessibility Score:**
```
axe-core violations: __ (target: 0 critical)
WCAG 2.1 Level: AA ✅ / ❌
```

### 📱 Responsive Design (for UI changes)
- [ ] Mobile tested (375px viewport)
- [ ] Tablet tested (768px viewport)
- [ ] Desktop tested (1920px viewport)
- [ ] Touch targets ≥44x44px
- [ ] Text legible at all sizes

**Cross-Browser Testing:**
- [ ] Chrome (latest) ✅ / ❌
- [ ] Firefox (latest) ✅ / ❌
- [ ] Safari (latest) ✅ / ❌
- [ ] Edge (latest) ✅ / ❌

### 🔥 Firebase/Backend (if applicable)
- [ ] Firestore security rules tested
- [ ] Composite indexes created for queries
- [ ] Cloud Functions tested locally (emulator)
- [ ] Data migrations documented
- [ ] Backup/rollback plan prepared

### 🚀 Deployment Readiness
- [ ] Environment variables documented
- [ ] Migration steps documented (if DB change)
- [ ] Rollback plan prepared (for risky changes)
- [ ] Monitoring/alerts configured
- [ ] Changelog updated
- [ ] E2E tests agregados/actualizados
- [ ] Testing manual realizado
- [ ] Testing en diferentes navegadores
- [ ] Testing responsive (mobile/tablet)

### Casos de Prueba
<!-- Describe los escenarios que probaste -->

1.
2.
3.

## Checklist
<!-- Marca con 'x' cuando hayas completado cada item -->

- [ ] Mi código sigue las convenciones del proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He comentado mi código en áreas complejas
- [ ] He actualizado la documentación correspondiente
- [ ] Mis cambios no generan nuevos warnings
- [ ] He agregado tests que prueban mi fix/funcionalidad
- [ ] Los tests unitarios pasan localmente (`npm run test`)
- [ ] Los tests E2E pasan localmente (`npm run test:e2e`)
- [ ] El build funciona correctamente (`npm run build`)
- [ ] El linter no muestra errores (`npm run lint`)

## Dependencias
<!-- ¿Este PR depende de otro PR? -->

- [ ] Este PR es independiente
- [ ] Depende de PR #(number)
- [ ] Debe mergearse antes de PR #(number)

## Consideraciones de Deploy
<!-- Información importante para el deployment -->

- [ ] No requiere cambios en variables de entorno
- [ ] Requiere nuevas variables de entorno (listar abajo)
- [ ] No requiere migración de datos
- [ ] Requiere migración de datos (explicar abajo)
- [ ] No hay breaking changes
- [ ] Hay breaking changes (documentar abajo)

### Variables de Entorno Nuevas
<!-- Si agregaste nuevas variables de entorno, lístalas aquí -->

```bash
# Variable: NOMBRE_VARIABLE
# Descripción: Para qué sirve
# Ejemplo: valor_ejemplo
```

### Migración de Datos
<!-- Si se requiere migración, explica el proceso -->

## Performance
<!-- ¿Hay impacto en el performance? -->

- [ ] Sin impacto en performance
- [ ] Mejora de performance (explicar abajo)
- [ ] Posible impacto en performance (explicar abajo)

## Seguridad
<!-- ¿Hay consideraciones de seguridad? -->

- [ ] Sin implicaciones de seguridad
- [ ] Mejora de seguridad
- [ ] Requiere revisión de seguridad

## Información Adicional
<!-- Cualquier información adicional relevante -->

## Reviewers
<!-- Menciona a las personas que deberían revisar este PR -->

@username
