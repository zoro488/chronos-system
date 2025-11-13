# 🚀 GUÍA RÁPIDA DE AUTOMATIZACIÓN

## ⚡ Inicio Rápido

### 1️⃣ Configurar Secrets

```bash
# Accede a: https://github.com/zoro488/chronos-system/settings/secrets/actions

# Añade estos secrets:
FIREBASE_SERVICE_ACCOUNT_STAGING
FIREBASE_SERVICE_ACCOUNT_PRODUCTION
FIREBASE_TOKEN
SLACK_WEBHOOK (opcional)
SNYK_TOKEN (opcional)
```

### 2️⃣ Habilitar GitHub Pages

```bash
gh api repos/zoro488/chronos-system/pages \
  --method POST \
  --field source='{"branch":"gh-pages","path":"/"}'
```

### 3️⃣ Proteger Branch Main

```bash
gh api repos/zoro488/chronos-system/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["lint","unit-tests"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1}'
```

---

## 🤖 Workflows Disponibles

### CI/CD Principal

| Workflow | Trigger | Propósito |
|----------|---------|-----------|
| `ci.yml` | Push/PR | Testing completo, linting, build |
| `deploy.yml` | Push a main/develop | Deploy multi-ambiente |
| `copilot-review.yml` | PR | Code review con IA |
| `dependabot-automerge.yml` | Dependabot PR | Auto-merge de dependencias |

### Monitoreo y Mantenimiento

| Workflow | Trigger | Propósito |
|----------|---------|-----------|
| `monitoring.yml` | Cada 15 min | Health checks, performance |
| `docs.yml` | Push a main | Documentación automática |
| `issue-automation.yml` | Issues/PRs | Gestión automática de issues |

---

## 📋 Comandos Útiles

### Ver Workflows

```bash
# Listar todos los workflows
gh workflow list

# Ver runs recientes
gh run list --limit 10

# Ver logs de un run específico
gh run view <run-id> --log

# Re-ejecutar workflow fallido
gh run rerun <run-id>
```

### Ejecutar Workflows Manualmente

```bash
# Deploy manual
gh workflow run deploy.yml -f environment=staging

# Generar documentación
gh workflow run docs.yml

# Health check manual
gh workflow run monitoring.yml
```

### Gestión de Issues

```bash
# Crear issue para Copilot Agent
gh issue create \
  --title "Implementar feature X" \
  --body "Descripción detallada..." \
  --label "copilot-agent,enhancement"

# Listar issues abiertos
gh issue list

# Ver issue específico
gh issue view <issue-number>
```

---

## 🎯 Flujo de Trabajo Típico

### 1. Desarrollo de Feature

```bash
# 1. Crear branch
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios
# ... editar archivos ...

# 3. Commit
git add .
git commit -m "feat: agregar nueva funcionalidad"

# 4. Push
git push origin feature/nueva-funcionalidad

# 5. Crear PR
gh pr create --title "Nueva funcionalidad" --body "Descripción..."

# ✅ Automáticamente:
# - Se ejecutan tests
# - Copilot revisa el código
# - Se genera preview deployment
```

### 2. Code Review

```bash
# Ver PR
gh pr view <pr-number>

# Aprobar
gh pr review <pr-number> --approve

# Merge
gh pr merge <pr-number> --squash
```

### 3. Deploy a Producción

```bash
# Merge a main (automático después de aprobar PR)
git checkout main
git pull origin main

# ✅ Automáticamente:
# - Build production
# - Tests E2E
# - Deploy a Firebase
# - Create release tag
# - Health checks
```

---

## 🤖 Copilot Agent

### Crear Issue para Agent

```bash
gh issue create \
  --title "Implementar validación de formulario" \
  --body "Necesito validación con Zod para el formulario de bancos" \
  --label "copilot-agent"

# ✅ El agent automáticamente:
# 1. Analiza el issue
# 2. Genera código
# 3. Crea tests
# 4. Abre PR
```

### Comandos de Copilot CLI

```bash
# Sugerir comando
gh copilot suggest "cómo hacer deploy a Firebase"

# Explicar comando
gh copilot explain "npm run build"

# Sugerir fix
gh copilot suggest -t git "resolver conflicto de merge"
```

---

## 📊 Monitoreo

### Ver Status de Servicios

```bash
# Health check manual
curl https://chronos-system.app/health

# Ver últimos deployments
gh api repos/zoro488/chronos-system/deployments

# Ver métricas de workflows
gh api repos/zoro488/chronos-system/actions/runs --jq '.workflow_runs[:5] | .[] | {id, status, conclusion}'
```

### Dashboards

- **GitHub Actions**: https://github.com/zoro488/chronos-system/actions
- **Deployments**: https://github.com/zoro488/chronos-system/deployments
- **Insights**: https://github.com/zoro488/chronos-system/pulse
- **Documentación**: https://docs.chronos-system.app (después de setup)

---

## 🔧 Troubleshooting

### Workflow Falla

```bash
# Ver logs
gh run view <run-id> --log

# Re-ejecutar
gh run rerun <run-id>

# Ver errores específicos
gh run view <run-id> --log-failed
```

### Build Falla

```bash
# Limpiar y rebuild local
npm run clean
npm ci
npm run build

# Ver errores detallados
npm run build -- --debug
```

### Tests Fallan

```bash
# Ejecutar tests localmente
npm run test:coverage

# E2E tests
npm run test:e2e

# Ver reporte de tests en CI
gh run view <run-id> --log | grep "FAIL"
```

---

## 📚 Recursos

- [GitHub Actions Docs](https://docs.github.com/actions)
- [Copilot Pro+ Features](https://github.com/features/copilot)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Dependabot](https://docs.github.com/code-security/dependabot)

---

## ✅ Checklist Post-Setup

- [ ] Secrets configurados
- [ ] GitHub Pages habilitado
- [ ] Branch protection en main
- [ ] Primer workflow ejecutado exitosamente
- [ ] Dependabot funcionando
- [ ] Deploy a staging exitoso
- [ ] Monitoreo activo
- [ ] Documentación generada

---

**¿Necesitas ayuda?** Crea un issue con el label `help-wanted`

**Version**: 1.0.0
**Última actualización**: November 2025
