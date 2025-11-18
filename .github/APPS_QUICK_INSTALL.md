# 🚀 INSTALACIÓN RÁPIDA - MARKETPLACE APPS

Este script te guiará para instalar todas las apps del GitHub Marketplace en orden de prioridad.

---

## ⚡ APPS ALTA PRIORIDAD (INSTALAR HOY)

### 1. Codecov
**URL:** https://github.com/apps/codecov
1. Click en "Install"
2. Selecciona "Only select repositories"
3. Elige `zoro488/chronos-system`
4. Click en "Install & Authorize"
5. Copia el token de Codecov
6. Ejecuta:
```bash
gh secret set CODECOV_TOKEN --body "YOUR_TOKEN_HERE" --repo zoro488/chronos-system
```

### 2. Sentry
**URL:** https://github.com/apps/sentry
1. Click en "Install"
2. Autoriza la app
3. Crea un nuevo proyecto "chronos-system"
4. Copia el Auth Token
5. Ejecuta:
```bash
gh secret set SENTRY_AUTH_TOKEN --body "YOUR_TOKEN_HERE" --repo zoro488/chronos-system
gh secret set SENTRY_ORG --body "your-org-name" --repo zoro488/chronos-system
gh secret set SENTRY_PROJECT --body "chronos-system" --repo zoro488/chronos-system
```

### 3. Snyk
**URL:** https://github.com/apps/snyk
1. Click en "Install"
2. Selecciona `zoro488/chronos-system`
3. Autoriza permisos
4. Snyk empezará a escanear automáticamente
5. No requiere configuración adicional

### 4. Mergify
**URL:** https://github.com/apps/mergify
1. Click en "Install"
2. Selecciona `zoro488/chronos-system`
3. Autoriza permisos
4. ✅ Ya configurado en `.mergify.yml`

### 5. CodeFactor
**URL:** https://github.com/apps/codefactor
1. Click en "Install"
2. Selecciona `zoro488/chronos-system`
3. Análisis automático se iniciará
4. No requiere configuración adicional

---

## 📅 APPS MEDIA PRIORIDAD (INSTALAR ESTA SEMANA)

### 6. Vercel
**URL:** https://github.com/apps/vercel
1. Crea cuenta en https://vercel.com
2. Click en "New Project"
3. Importa `zoro488/chronos-system`
4. Configura build:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Copia tokens:
```bash
gh secret set VERCEL_TOKEN --body "YOUR_TOKEN" --repo zoro488/chronos-system
gh secret set VERCEL_ORG_ID --body "YOUR_ORG_ID" --repo zoro488/chronos-system
gh secret set VERCEL_PROJECT_ID --body "YOUR_PROJECT_ID" --repo zoro488/chronos-system
```

### 7. Renovate
**URL:** https://github.com/apps/renovate
1. Click en "Install"
2. Selecciona `zoro488/chronos-system`
3. Renovate creará un PR inicial con configuración
4. Merge el PR para activar

### 8. ImgBot
**URL:** https://github.com/apps/imgbot
1. Click en "Install"
2. Selecciona `zoro488/chronos-system`
3. ImgBot escaneará y optimizará imágenes automáticamente

### 9. WIP
**URL:** https://github.com/apps/wip
1. Click en "Install"
2. Selecciona `zoro488/chronos-system`
3. Bloquea automáticamente PRs con [WIP] en título

### 10. GitGuardian
**URL:** https://github.com/apps/gitguardian
1. Click en "Install"
2. Selecciona `zoro488/chronos-system`
3. Escaneo de secretos se activa automáticamente

---

## 💡 APPS BAJA PRIORIDAD (OPCIONAL)

### 11. Code Climate
**URL:** https://github.com/apps/codeclimate
- Trial de 14 días, luego $50/mes
- Análisis de mantenibilidad avanzado

### 12. Percy
**URL:** https://github.com/apps/percy
- FREE 5K snapshots/mes
- Visual regression testing

### 13. BrowserStack
**URL:** https://github.com/apps/browserstack-test
- FREE para open source
- Cross-browser testing

---

## ✅ CHECKLIST DE INSTALACIÓN

```markdown
### ALTA PRIORIDAD (HOY)
- [ ] Codecov instalado y token configurado
- [ ] Sentry instalado y secrets configurados
- [ ] Snyk instalado y escaneando
- [ ] Mergify instalado (ya configurado)
- [ ] CodeFactor instalado y analizando

### MEDIA PRIORIDAD (ESTA SEMANA)
- [ ] Vercel instalado y tokens configurados
- [ ] Renovate instalado y activo
- [ ] ImgBot instalado
- [ ] WIP instalado
- [ ] GitGuardian instalado

### BAJA PRIORIDAD (OPCIONAL)
- [ ] Code Climate evaluado
- [ ] Percy evaluado
- [ ] BrowserStack evaluado
```

---

## 🔍 VERIFICACIÓN POST-INSTALACIÓN

Después de instalar cada app, verifica que funciona:

### 1. Crea un PR de prueba
```bash
git checkout -b test/apps-verification
echo "# Testing GitHub Apps" > TEST_APPS.md
git add TEST_APPS.md
git commit -m "test: Verify GitHub Apps integration"
git push origin test/apps-verification
gh pr create --title "test: Verify GitHub Apps" --body "Testing all installed apps"
```

### 2. Verifica que aparezcan:
- ✅ Codecov report
- ✅ Snyk security check
- ✅ CodeFactor analysis
- ✅ Mergify auto-label
- ✅ Sentry monitoring (en errores)

### 3. Verifica en Settings > Integrations
```bash
gh api repos/zoro488/chronos-system/installations
```

---

## 📊 DASHBOARD DE APPS

| App         | Instalado | Configurado | URL Dashboard                                                      |
| ----------- | --------- | ----------- | ------------------------------------------------------------------ |
| Codecov     | ⏳         | ⏳           | https://codecov.io/gh/zoro488/chronos-system                       |
| Sentry      | ⏳         | ⏳           | https://sentry.io/organizations/YOUR_ORG/projects/chronos-system/  |
| Snyk        | ⏳         | ⏳           | https://app.snyk.io/                                               |
| Mergify     | ⏳         | ✅           | https://dashboard.mergify.io/                                      |
| CodeFactor  | ⏳         | ⏳           | https://www.codefactor.io/repository/github/zoro488/chronos-system |
| Vercel      | ⏳         | ⏳           | https://vercel.com/dashboard                                       |
| Renovate    | ⏳         | ⏳           | https://app.renovatebot.com/                                       |
| ImgBot      | ⏳         | ⏳           | No dashboard                                                       |
| WIP         | ⏳         | ⏳           | No dashboard                                                       |
| GitGuardian | ⏳         | ⏳           | https://dashboard.gitguardian.com/                                 |

---

## 🆘 TROUBLESHOOTING

### App no aparece en PR
1. Verifica instalación: `gh api repos/zoro488/chronos-system/installations`
2. Revisa permisos en GitHub Settings > Integrations
3. Re-instala la app

### Secrets no funcionan
```bash
# Verificar secrets
gh secret list --repo zoro488/chronos-system

# Actualizar secret
gh secret set SECRET_NAME --body "NEW_VALUE" --repo zoro488/chronos-system
```

### Workflow falla
1. Ve a Actions tab
2. Click en workflow fallido
3. Revisa logs
4. Verifica que todos los secrets estén configurados

---

## 📝 NOTAS FINALES

- **Todas las apps gratuitas** están marcadas como FREE
- **Apps de pago** tienen trial period
- **Open source benefits**: Muchas apps FREE para repos públicos
- **Actualizar dashboard**: Marca cada app como instalada/configurada

---

**🚀 Una vez instaladas todas, tendrás un ecosistema completo de automatización y monitoreo! 🚀**

---

**Última actualización:** 2025-01-24
**Mantenido por:** @zoro488
