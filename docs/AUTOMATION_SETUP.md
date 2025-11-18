# 🤖 Guía Completa de Configuración de Automatización

## 📋 Tabla de Contenidos

- [Prerequisitos](#prerequisitos)
- [Configuración de GitHub Secrets](#configuración-de-github-secrets)
- [Configuración de Firebase](#configuración-de-firebase)
- [Setup Local](#setup-local)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

### Software Requerido

- **Node.js** v18 o superior ([Descargar](https://nodejs.org/))
- **npm** v9 o superior (incluido con Node.js)
- **Git** ([Descargar](https://git-scm.com/))
- **PowerShell** 7+ (opcional, para scripts) ([Descargar](https://github.com/PowerShell/PowerShell))

### Cuentas Necesarias

- Cuenta de GitHub con permisos de escritura en el repositorio
- Proyecto de Firebase configurado
- Cuenta de Codecov (opcional, para reportes de cobertura)

---

## 🔐 Configuración de GitHub Secrets

Los secrets son necesarios para que los workflows de GitHub Actions funcionen correctamente.

### 1. Acceder a la Configuración de Secrets

Ve a: `https://github.com/zoro488/chronos-system/settings/secrets/actions`

### 2. Secrets Requeridos

#### `FIREBASE_SERVICE_ACCOUNT` (Requerido)

**Propósito:** Autenticar deployments a Firebase Hosting

**Cómo obtenerlo:**

```bash
# 1. Instalar Firebase CLI
npm install -g firebase-tools

# 2. Login a Firebase
firebase login

# 3. Inicializar el proyecto (si no está inicializado)
firebase init hosting

# 4. Generar service account key
# Ve a: Firebase Console > Project Settings > Service Accounts
# Click "Generate New Private Key"
# Guarda el JSON completo como secret
```

**Formato del secret:** Todo el contenido del archivo JSON (incluye las llaves { })

#### `CODECOV_TOKEN` (Opcional)

**Propósito:** Subir reportes de cobertura de código a Codecov

**Cómo obtenerlo:**

1. Ve a [Codecov](https://codecov.io/)
2. Conecta tu repositorio de GitHub
3. Copia el token que aparece en la configuración del proyecto

#### `GITHUB_TOKEN` (Automático)

Este token se proporciona automáticamente por GitHub Actions, no necesitas configurarlo.

### 3. Agregar un Secret

1. Click en "New repository secret"
2. Ingresa el nombre del secret (ej: `FIREBASE_SERVICE_ACCOUNT`)
3. Pega el valor del secret
4. Click en "Add secret"

---

## 🔥 Configuración de Firebase

### 1. Crear Proyecto de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Add project"
3. Ingresa el nombre: `chronos-system-prod`
4. Sigue el asistente de configuración

### 2. Habilitar Servicios

En Firebase Console, habilita:

- **Authentication** (Email/Password)
- **Firestore Database**
- **Hosting**
- **Storage** (opcional)

### 3. Configurar Firestore

```bash
# Desde la raíz del proyecto
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 4. Configurar Hosting

El archivo `firebase.json` ya está configurado. Para hacer el primer deploy:

```bash
npm run build
firebase deploy --only hosting
```

### 5. Obtener Credenciales para el Frontend

1. En Firebase Console, ve a Project Settings
2. En "Your apps", agrega una Web App
3. Copia las credenciales y pégalas en `.env.local`:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=chronos-system-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=chronos-system-prod
VITE_FIREBASE_STORAGE_BUCKET=chronos-system-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## 💻 Setup Local

### Opción 1: Script Automático (Recomendado)

```bash
# Windows PowerShell
.\scripts\setup-local.ps1

# Linux/Mac (con pwsh instalado)
pwsh ./scripts/setup-local.ps1
```

### Opción 2: Setup Manual

```bash
# 1. Instalar dependencias
npm install

# 2. Instalar navegadores de Playwright
npx playwright install

# 3. Crear archivo de variables de entorno
cp .env.example .env.local

# 4. Editar .env.local con tus credenciales
nano .env.local  # o tu editor favorito

# 5. Verificar que todo funciona
npm run dev
```

### Verificar Instalación

```bash
# Ejecutar validación
pwsh ./scripts/validate-automation.ps1

# O manualmente:
npm run lint
npm run type-check
npm run build
npm run test
npm run test:e2e
```

---

## 🧪 Testing Local

### Tests Unitarios

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests en modo watch
npm run test

# Ejecutar tests con cobertura
npm run test:coverage

# Ejecutar tests con UI
npm run test:ui
```

### Tests E2E con Playwright

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar tests en modo UI (interactivo)
npm run test:e2e:ui

# Ejecutar tests en modo headed (ver el navegador)
npm run test:e2e:headed

# Ver reporte de tests
npm run test:e2e:report
```

---

## 🐛 Troubleshooting

### Error: "Firebase CLI not found"

**Solución:**
```bash
npm install -g firebase-tools
```

### Error: "Playwright browsers not installed"

**Solución:**
```bash
npx playwright install --with-deps
```

### Error: "Module not found" al correr tests

**Solución:**
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error en workflow "FIREBASE_SERVICE_ACCOUNT not found"

**Solución:**
1. Verifica que el secret esté configurado en GitHub
2. Asegúrate de que el nombre sea exactamente `FIREBASE_SERVICE_ACCOUNT`
3. Verifica que el JSON sea válido

### Tests E2E fallan localmente

**Solución:**
```bash
# 1. Asegurarte de que el servidor esté corriendo
npm run dev

# 2. En otra terminal, ejecutar tests
npm run test:e2e

# O usar el servidor automático (recomendado)
# El playwright.config.ts ya está configurado para esto
```

### Error: "Port 5173 already in use"

**Solución:**
```bash
# Matar el proceso que usa el puerto
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5173 | xargs kill -9
```

---

## 📚 Recursos Adicionales

- [Documentación de Firebase](https://firebase.google.com/docs)
- [Playwright Docs](https://playwright.dev/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vitest Docs](https://vitest.dev/)

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa la sección de [Troubleshooting](#troubleshooting)
2. Busca en los [Issues del repositorio](https://github.com/zoro488/chronos-system/issues)
3. Crea un nuevo issue con:
   - Descripción del problema
   - Pasos para reproducir
   - Logs de error
   - Versión de Node.js y npm
   - Sistema operativo

---

**Última actualización:** 2025-11-18
