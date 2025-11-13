# 🚀 QUICK START - CHRONOS SYSTEM

**Tiempo de setup: 15-30 minutos**

---

## 📋 Pre-requisitos

- ✅ Node.js 18+ instalado
- ✅ npm 9+ instalado
- ✅ Git configurado
- ✅ GitHub CLI (gh) instalado (opcional)
- ✅ Cuenta de Firebase
- ✅ API Keys: Anthropic, OpenAI, Deepgram

---

## ⚡ Setup Rápido (3 pasos)

### 1️⃣ Instalar Dependencias

```bash
npm install
```

### 2️⃣ Configurar Variables de Entorno

Crea archivo `.env.local` en la raíz del proyecto:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# AI Agent Configuration
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
VITE_OPENAI_API_KEY=sk-proj-...
VITE_DEEPGRAM_API_KEY=...
```

**Obtener API Keys:**
- Anthropic: https://console.anthropic.com/settings/keys
- OpenAI: https://platform.openai.com/api-keys
- Deepgram: https://console.deepgram.com/

### 3️⃣ Iniciar Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:5173

---

## 🔍 Verificar Configuración

```bash
# Health check completo
npm run health:check

# Verificar AI Agent
npm run verify:ai

# Ver workflows de GitHub
npm run workflows:list
```

---

## 📊 Importar Datos desde Excel

### Preparar Archivo Excel

Coloca tu archivo `Administación_General.xlsx` en la raíz del proyecto con las siguientes hojas:

- **Control_Maestro** o **Ventas**: 96 ventas
- **Clientes**: 31 clientes
- **Distribuidores**: 9 órdenes de compra
- **Almacen_Monte** o **Bancos**: Movimientos bancarios

### Ejecutar Importación

```bash
# Importar todo
npm run import:excel

# Importar solo ventas
npm run import:excel -- --collection=ventas

# Importar solo clientes
npm run import:excel -- --collection=clientes

# Usar archivo personalizado
npm run import:excel -- --file=mi-archivo.xlsx
```

---

## 🧪 Testing

```bash
# Tests unitarios
npm test

# Tests con cobertura
npm run test:coverage

# Tests E2E
npm run test:e2e

# Tests E2E con UI
npm run test:e2e:ui
```

---

## 🏗️ Build y Deploy

### Build Local

```bash
npm run build
npm run preview
```

### Deploy a Firebase

```bash
# Deploy a staging
npm run deploy:staging

# Deploy a production
npm run deploy:production
```

### Deploy con GitHub Actions

```bash
# Ejecutar workflow de deploy
npm run workflows:deploy

# Ver estado de workflows
gh run list

# Ver logs de un workflow
gh run view <run-id> --log
```

---

## 📁 Estructura del Proyecto

```
chronos-system/
├── components/           # Componentes React
│   ├── ui/              # Componentes base
│   ├── layout/          # Layout components
│   ├── animations/      # Sistema de animaciones
│   └── ai/              # AI Agent components
├── services/            # Servicios backend
│   ├── MegaAIAgent.js   # AI Agent principal
│   ├── VoiceService.js  # Servicio de voz
│   └── *.service.js     # Servicios de negocio
├── pages/               # Páginas de la app
├── hooks/               # Custom React hooks
├── schemas/             # Validaciones con Zod
├── stores/              # Estado global (Zustand)
├── config/              # Configuración
│   └── firebase.js      # Config de Firebase
├── scripts/             # Scripts de utilidad
│   ├── importar-excel.js
│   ├── verify-ai-agent.js
│   └── health-check.js
└── .github/workflows/   # GitHub Actions
```

---

## 🤖 Mega AI Agent - Características

### Capacidades Implementadas

✅ **Entrada por voz y texto conversacional**
- Reconocimiento de voz con Deepgram
- Procesamiento natural del lenguaje
- Respuestas contextuales

✅ **Generación automática de registros**
- "Registra una venta de $1000 para Juan"
- "Agrega un gasto de gasolina por $500"
- "Crea un abono de $200 al cliente María"

✅ **Análisis de datos en tiempo real**
- GPT-4 y Claude 3.5 Sonnet
- Consultas complejas: "¿Cuáles fueron las ventas del mes?"
- Insights automáticos

✅ **Exportaciones avanzadas**
- PDF con jsPDF
- Excel con XLSX
- Gráficos y reportes

✅ **Aprendizaje adaptativo**
- UserLearningService guarda preferencias
- Mejora con el uso
- Personalización por usuario

### Uso del AI Agent

```javascript
// En tu componente React
import { MegaAIAgent } from './services/MegaAIAgent';

const agent = new MegaAIAgent(userId);

// Procesar input conversacional
const response = await agent.processConversationalInput(
  'Muéstrame las ventas de hoy'
);

// Exportar a PDF
await agent.exportBasicPDF({
  titulo: 'Reporte de Ventas',
  data: ventasData
});

// Exportar a Excel
await agent.exportToExcel(ventasData, 'ventas.xlsx');
```

---

## 🔧 Comandos Útiles

### Desarrollo

```bash
npm run dev              # Servidor de desarrollo
npm run build            # Build para producción
npm run preview          # Preview del build
npm run lint             # Lint del código
npm run lint:fix         # Fix automático de lint
npm run format           # Formatear código con Prettier
npm run type-check       # Verificar tipos TypeScript
```

### Testing

```bash
npm test                 # Tests en modo watch
npm run test:ui          # Tests con UI de Vitest
npm run test:coverage    # Cobertura de tests
npm run test:e2e         # Tests E2E con Playwright
npm run test:e2e:ui      # E2E con UI de Playwright
```

### Utilidades

```bash
npm run clean            # Limpiar dist y cache
npm run health:check     # Health check del sistema
npm run verify:ai        # Verificar AI Agent
npm run import:excel     # Importar datos desde Excel
```

### GitHub Actions

```bash
npm run workflows:list   # Listar workflows
npm run workflows:ci     # Ejecutar CI
npm run workflows:deploy # Ejecutar deploy
npm run pr:create        # Crear Pull Request
```

---

## 🎯 Flujo de Trabajo Típico

### 1. Desarrollo de Feature

```bash
# 1. Crear branch
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios
# ... editar archivos ...

# 3. Verificar que todo funciona
npm run lint
npm run test
npm run health:check

# 4. Commit y push
git add .
git commit -m "feat: agregar nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# 5. Crear PR
npm run pr:create
```

### 2. Code Review y Deploy

```bash
# Ver PRs
gh pr list

# Review de PR
gh pr review <pr-number> --approve

# Merge
gh pr merge <pr-number> --squash

# Deploy automático a staging/production
# (se ejecuta automáticamente via GitHub Actions)
```

---

## 🐛 Troubleshooting

### Error: "Firebase not initialized"

**Solución:** Verifica que `.env.local` esté configurado correctamente.

```bash
# Verificar configuración
npm run verify:ai
```

### Error: "Module not found"

**Solución:** Reinstala dependencias.

```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "API Key invalid"

**Solución:** Verifica que las API keys sean válidas y estén activas.

- Anthropic: https://console.anthropic.com/settings/keys
- OpenAI: https://platform.openai.com/api-keys
- Deepgram: https://console.deepgram.com/

### Tests Fallan

**Solución:** Asegúrate de que las dependencias de test estén instaladas.

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
npm run test
```

### Build Falla

**Solución:** Verifica errores de TypeScript.

```bash
npm run type-check
npm run lint:fix
npm run build
```

---

## 📚 Documentación Adicional

- **README.md**: Documentación completa del proyecto
- **AUTOMATIZACION_COMPLETA.md**: Guía de automatización
- **SETUP_RAPIDO.md**: Comandos rápidos
- **IMPLEMENTATION_ROADMAP.md**: Hoja de ruta de implementación
- **PROGRESO_ACTUAL.md**: Estado actual del proyecto

---

## 🎓 Recursos

### Firebase
- Docs: https://firebase.google.com/docs
- Console: https://console.firebase.google.com

### GitHub Actions
- Docs: https://docs.github.com/actions
- Marketplace: https://github.com/marketplace

### APIs de IA
- Anthropic Claude: https://docs.anthropic.com
- OpenAI GPT: https://platform.openai.com/docs
- Deepgram: https://developers.deepgram.com

### Testing
- Vitest: https://vitest.dev
- Playwright: https://playwright.dev
- Testing Library: https://testing-library.com

---

## 💡 Tips Pro

### 1. Usar Alias de npm

Agrega a tu `.bashrc` o `.zshrc`:

```bash
alias nd="npm run dev"
alias nb="npm run build"
alias nt="npm run test"
alias nhc="npm run health:check"
alias nva="npm run verify:ai"
```

### 2. Pre-commit Hooks

Instala husky para ejecutar tests antes de commit:

```bash
npm install --save-dev husky
npx husky init
echo "npm run lint && npm test" > .husky/pre-commit
```

### 3. Watch Mode para Testing

Durante desarrollo, mantén tests en watch mode:

```bash
npm test
```

### 4. Usar GitHub CLI

Instala GitHub CLI para workflow más rápido:

```bash
# Instalar (macOS)
brew install gh

# Instalar (Linux)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Login
gh auth login
```

---

## ✅ Checklist de Setup Completo

- [ ] Node.js y npm instalados
- [ ] Repositorio clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Variables de entorno configuradas (`.env.local`)
- [ ] Firebase configurado
- [ ] API Keys obtenidas y configuradas
- [ ] Health check pasando (`npm run health:check`)
- [ ] AI Agent verificado (`npm run verify:ai`)
- [ ] App corriendo en desarrollo (`npm run dev`)
- [ ] Tests pasando (`npm test`)
- [ ] Datos importados (opcional, `npm run import:excel`)
- [ ] GitHub CLI configurado (opcional)
- [ ] Primer commit hecho

---

**🌌 CHRONOS SYSTEM - Building the Future**

_¿Necesitas ayuda? Revisa la documentación completa o crea un issue en GitHub._

**Versión**: 2.0.0  
**Última actualización**: November 2025
