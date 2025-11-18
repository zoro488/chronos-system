# 🚀 Guía Completa de GitHub Actions Workflows

## 📋 Workflows Creados

### 1. ✅ **Validación Continua** (`continuous-validation.yml`)
**Propósito:** Ejecutar tests automáticamente cada 3 horas y en cada push/PR

**Características:**
- Tests unitarios, de integración y E2E en paralelo
- Lint y formateo de código
- Type checking de TypeScript
- Build de producción
- Coverage reporting
- Notificaciones automáticas

**Ejecución:**
- Automático: Cada 3 horas
- Manual: Workflow dispatch con suite específico
- Push/PR: En branches main, develop y feature/*

---

### 2. 🔄 **Sincronización de Datos** (`data-sync.yml`)
**Propósito:** Sincronizar Excel ↔ Firestore automáticamente

**Características:**
- Sincronización bidireccional
- Modo dry-run para simular cambios
- Validación de archivos Excel
- Reportes detallados de sincronización
- Commit automático de reportes
- Notificaciones de fallos

**Ejecución:**
- Automático: Diariamente a medianoche y 12:00 UTC
- Manual: Workflow dispatch con dirección de sync

---

### 3. 🏥 **Health Check** (`health-check.yml`)
**Propósito:** Monitorear salud del sistema cada hora

**Características:**
- Verificación de Firestore, Auth y Storage
- Chequeo de endpoints API
- Validación de índices de base de datos
- Consistencia de datos
- Métricas de rendimiento
- Alertas automáticas en fallos
- Badge de estado actualizado

**Ejecución:**
- Automático: Cada hora
- Manual: Workflow dispatch con deep check opcional

---

### 4. 💾 **Backup Automatizado** (`automated-backup.yml`)
**Propósito:** Respaldo diario completo del sistema

**Características:**
- Backup de Firestore (todas las colecciones)
- Backup de usuarios (Auth)
- Backup de Storage (archivos críticos)
- Backup de configuraciones
- Consolidación y compresión
- Upload a Cloud Storage
- Verificación de integridad
- Limpieza de backups antiguos (30 días)

**Ejecución:**
- Automático: Diario a las 02:00 UTC
- Semanal completo: Domingos 03:00 UTC
- Manual: Workflow dispatch con tipo de backup

---

### 5. 🔒 **Security Audit** (`security-audit.yml`)
**Propósito:** Auditoría de seguridad completa

**Características:**
- Escaneo de dependencias (npm audit, Snyk)
- Análisis de código (CodeQL)
- Detección de secretos (TruffleHog, GitLeaks)
- Validación de reglas de Firestore
- OWASP Dependency Check
- Compliance verification
- Penetration testing básico
- Reportes consolidados

**Ejecución:**
- Automático: Semanal (lunes 04:00 UTC), diario ligero (06:00 UTC)
- Push/PR: En branches main y develop
- Manual: Workflow dispatch con tipo de escaneo

---

### 6. 📈 **Performance Monitoring** (`performance-monitoring.yml`)
**Propósito:** Monitoreo de rendimiento continuo

**Características:**
- Lighthouse audit de todas las apps
- Análisis de bundle size
- Benchmarks de API
- Performance de base de datos
- Métricas de frontend
- Detección de anti-patterns
- Reportes consolidados
- Alertas de degradación

**Ejecución:**
- Automático: Cada 6 horas
- Push/PR: En branch main
- Manual: Workflow dispatch con tipo específico

---

### 7. 🚀 **Pre-Deployment Checklist** (`pre-deployment-checklist.yml`)
**Propósito:** Validación completa antes de despliegue

**Características:**
- Verificación de variables de entorno
- Audit de dependencias
- Validación de build
- Suite completa de tests
- Lint y type checking
- Validación de Firebase config
- Security headers check
- Bundle size validation
- Documentation check
- Reporte de deployment

**Ejecución:**
- Manual: Workflow dispatch antes de deploy
- PR: Cuando tiene label 'ready-to-deploy'

---

### 8. 🔄 **Database Migration** (`database-migration.yml`)
**Propósito:** Gestión de migraciones y validación de BD

**Características:**
- Validación de esquemas
- Verificación de índices
- Chequeo de integridad de datos
- Ejecución de migraciones
- Backup pre-migración
- Plan de rollback automático
- Modo dry-run
- Reportes detallados

**Ejecución:**
- Automático: Validación diaria (03:00 UTC)
- Manual: Workflow dispatch con tipo de migración

---

## 🔐 Secrets Requeridos en GitHub

### Obligatorios

```yaml
FIREBASE_SERVICE_ACCOUNT: |
  {
    "type": "service_account",
    "project_id": "your-project-id",
    "private_key_id": "...",
    "private_key": "...",
    "client_email": "...",
    ...
  }

VITE_FIREBASE_API_KEY: "AIza..."
VITE_FIREBASE_PROJECT_ID: "premium-ecosystem"
VITE_FIREBASE_AUTH_DOMAIN: "premium-ecosystem.firebaseapp.com"
VITE_FIREBASE_STORAGE_BUCKET: "premium-ecosystem.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID: "123456789"
VITE_FIREBASE_APP_ID: "1:123456:web:..."
```

### Opcionales (para notificaciones)

```yaml
MAIL_USERNAME: "notifications@company.com"
MAIL_PASSWORD: "your-app-password"
NOTIFICATION_EMAIL: "team@company.com"
SLACK_WEBHOOK: "https://hooks.slack.com/services/..."
```

### Opcionales (para herramientas externas)

```yaml
CODECOV_TOKEN: "..."
SNYK_TOKEN: "..."
GITLEAKS_LICENSE: "..."
```

---

## 📝 Configuración de Secrets en GitHub

### Paso 1: Ir a Settings
1. Abre tu repositorio en GitHub
2. Ve a **Settings** → **Secrets and variables** → **Actions**

### Paso 2: Agregar Secrets
1. Click en **"New repository secret"**
2. Nombre: `FIREBASE_SERVICE_ACCOUNT`
3. Value: Pega el JSON completo de tu service account
4. Click **"Add secret"**

### Paso 3: Repetir para cada secret

---

## 🎯 Scripts NPM Necesarios

Agrega estos scripts a tu `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest run --mode unit",
    "test:integration": "vitest run --mode integration",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage",
    "test:firestore-rules": "firebase emulators:exec --only firestore 'npm run test:rules'",

    "lint": "eslint . --ext js,jsx,ts,tsx",
    "lint:fix": "eslint . --ext js,jsx,ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "type-check": "tsc --noEmit",

    "build": "vite build",
    "build:analyze": "vite build --mode analyze",

    "validate:excel": "node scripts/validate-excel.js",
    "validate:schema": "node scripts/validate-schema.js",
    "validate:sync": "node scripts/validate-sync.js",

    "import:excel": "node scripts/import-excel.js",
    "export:excel": "node scripts/export-excel.js",
    "report:sync": "node scripts/sync-report.js",

    "health:firestore": "node scripts/health-firestore.js",
    "health:auth": "node scripts/health-auth.js",
    "health:storage": "node scripts/health-storage.js",
    "health:api": "node scripts/health-api.js",
    "health:indexes": "node scripts/check-indexes.js",
    "health:data-consistency": "node scripts/check-consistency.js",

    "metrics:collect": "node scripts/collect-metrics.js",
    "metrics:analyze": "node scripts/analyze-metrics.js",
    "metrics:report": "node scripts/metrics-report.js",

    "db:stats": "node scripts/db-stats.js",
    "db:check-sizes": "node scripts/check-collection-sizes.js",
    "db:analyze-queries": "node scripts/analyze-queries.js",
    "db:backup": "node scripts/backup-firestore.js",
    "db:restore": "node scripts/restore-firestore.js",
    "db:verify": "node scripts/verify-data.js",
    "db:check-orphans": "node scripts/check-orphans.js",
    "db:validate-relationships": "node scripts/validate-relationships.js",
    "db:validation-report": "node scripts/validation-report.js",
    "db:check-consistency": "node scripts/check-consistency.js",
    "db:validate-foreign-keys": "node scripts/validate-foreign-keys.js",
    "db:check-duplicates": "node scripts/check-duplicates.js",
    "db:integrity-report": "node scripts/integrity-report.js",
    "db:verify-migration": "node scripts/verify-migration.js",
    "db:analyze-performance": "node scripts/analyze-db-performance.js",
    "db:check-indexes": "node scripts/check-db-indexes.js",
    "db:query-patterns": "node scripts/query-patterns.js",

    "firestore:export": "node scripts/firestore-export.js",
    "firestore:list-collections": "node scripts/list-collections.js",
    "firestore:list-indexes": "firebase firestore:indexes",
    "firestore:check-missing-indexes": "node scripts/check-missing-indexes.js",

    "auth:export-users": "node scripts/export-users.js",

    "storage:list": "node scripts/list-storage.js",
    "storage:download": "node scripts/download-storage.js",

    "migrate:schema": "node scripts/migrate-schema.js",
    "migrate:data": "node scripts/migrate-data.js",
    "migrate:indexes": "node scripts/migrate-indexes.js",

    "setup:test": "node scripts/setup-test-env.js"
  }
}
```

---

## 🚀 Activación de Workflows

### 1. Commit y Push
```bash
git add .github/workflows/
git commit -m "🚀 Add complete CI/CD workflows"
git push origin main
```

### 2. Configurar Secrets
- Seguir pasos en sección anterior

### 3. Habilitar Actions
1. Ve a **Actions** tab en GitHub
2. Si está deshabilitado, click **"Enable Actions"**

### 4. Ejecutar Workflow Manual
1. Ve a **Actions**
2. Selecciona un workflow
3. Click **"Run workflow"**
4. Configura parámetros
5. Click **"Run workflow"** verde

---

## 📊 Monitoreo de Workflows

### Ver Ejecuciones
- **Actions** tab → Selecciona workflow → Ver runs

### Ver Reportes
- Cada workflow genera artifacts descargables
- Incluyen reportes en formato JSON y Markdown

### Recibir Notificaciones
- Configura `NOTIFICATION_EMAIL` para alertas
- Opcional: Configura Slack con `SLACK_WEBHOOK`

---

## 🔧 Troubleshooting

### Workflow Falla por Secrets Faltantes
1. Verifica que todos los secrets estén configurados
2. Los nombres deben coincidir exactamente
3. El JSON de service account debe ser válido

### Tests Fallan en CI
1. Asegúrate de que los scripts NPM existan
2. Verifica que las dependencias estén en `package.json`
3. Revisa los logs del workflow

### Backup Falla
1. Verifica permisos del service account
2. Confirma que el bucket de Cloud Storage existe
3. Revisa logs de Firebase

---

## 📚 Documentación Adicional

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Firebase CI/CD](https://firebase.google.com/docs/cli#ci)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)

---

## ✅ Checklist Final

- [ ] Todos los workflows creados
- [ ] Secrets configurados en GitHub
- [ ] Scripts NPM agregados a package.json
- [ ] Firebase service account con permisos correctos
- [ ] Cloud Storage bucket creado para backups
- [ ] Email de notificaciones configurado
- [ ] Workflows ejecutados manualmente para verificar
- [ ] Documentación revisada por el equipo

---

**🎉 ¡Sistema de CI/CD Completo y Listo para Producción!**
