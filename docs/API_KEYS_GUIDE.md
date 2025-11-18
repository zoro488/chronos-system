# 🔐 API Keys Guide - chronos-system

## 📋 Checklist de API Keys (22 Total)

### ✅ AI/ML Services (6 Keys)

#### 1. OpenAI API Key
- **Servicio**: GPT-4, GPT-3.5-turbo, DALL-E, Whisper
- **Obtener en**: https://platform.openai.com/api-keys
- **Pasos**:
  1. Crear cuenta en OpenAI
  2. Ir a "API Keys"
  3. Click "Create new secret key"
  4. Copiar la key (empieza con `sk-proj-`)
- **Costo**: Pay-as-you-go ($0.03 per 1K tokens GPT-4)
- **Variables**: `OPENAI_API_KEY`, `VITE_OPENAI_API_KEY`

#### 2. Anthropic API Key (Claude)
- **Servicio**: Claude 3.5 Sonnet, Claude 3 Opus
- **Obtener en**: https://console.anthropic.com/settings/keys
- **Pasos**:
  1. Crear cuenta en Anthropic
  2. Ir a "API Keys"
  3. Click "Create Key"
  4. Copiar la key (empieza con `sk-ant-`)
- **Costo**: Pay-as-you-go ($3 per 1M tokens Claude Sonnet)
- **Variables**: `ANTHROPIC_API_KEY`, `VITE_ANTHROPIC_API_KEY`

#### 3. Google AI Studio Key (Gemini)
- **Servicio**: Gemini Pro, Gemini Pro Vision
- **Obtener en**: https://makersuite.google.com/app/apikey
- **Pasos**:
  1. Iniciar sesión con cuenta Google
  2. Click "Get API Key"
  3. Click "Create API Key in new project"
  4. Copiar la key (empieza con `AIzaSy`)
- **Costo**: Gratis hasta 60 req/min
- **Variables**: `GOOGLE_AI_KEY`, `VITE_GOOGLE_AI_KEY`

#### 4. HuggingFace Token
- **Servicio**: Models Hub, Inference API
- **Obtener en**: https://huggingface.co/settings/tokens
- **Pasos**:
  1. Crear cuenta en HuggingFace
  2. Ir a Settings > Access Tokens
  3. Click "New token"
  4. Seleccionar "Read" permisos
  5. Copiar el token (empieza con `hf_`)
- **Costo**: Gratis (con rate limits)
- **Variables**: `HUGGINGFACE_TOKEN`, `VITE_HUGGINGFACE_TOKEN`

#### 5. Cohere API Key
- **Servicio**: Command, Embed, Rerank models
- **Obtener en**: https://dashboard.cohere.com/api-keys
- **Pasos**:
  1. Crear cuenta en Cohere
  2. Ir a "API Keys"
  3. Copiar la "Trial Key" o crear una nueva
- **Costo**: Trial gratis, luego pay-as-you-go
- **Variables**: `COHERE_API_KEY`, `VITE_COHERE_API_KEY`

#### 6. Pinecone API Key
- **Servicio**: Vector Database for embeddings
- **Obtener en**: https://app.pinecone.io/
- **Pasos**:
  1. Crear cuenta en Pinecone
  2. Ir a "API Keys"
  3. Copiar la key existente o crear nueva
  4. Crear un Index (nombre: `chronos-embeddings`)
- **Costo**: Gratis hasta 1M vectores
- **Variables**: `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT`, `PINECONE_INDEX_NAME`

---

### 🛡️ Code Quality & Security (5 Keys)

#### 7. SonarCloud Token
- **Servicio**: Code quality analysis
- **Obtener en**: https://sonarcloud.io/account/security
- **Pasos**:
  1. Crear cuenta en SonarCloud (login con GitHub)
  2. Importar repositorio chronos-system
  3. Ir a "My Account" > "Security"
  4. Generar nuevo token
- **Costo**: Gratis para proyectos públicos
- **Variables**: `SONAR_TOKEN`

#### 8. Snyk Token
- **Servicio**: Security vulnerability scanning
- **Obtener en**: https://app.snyk.io/account
- **Pasos**:
  1. Crear cuenta en Snyk (login con GitHub)
  2. Ir a Account Settings
  3. Click "General" > "Auth Token"
  4. Copiar el token
- **Costo**: Gratis para proyectos open source
- **Variables**: `SNYK_TOKEN`

#### 9. CodeClimate Token
- **Servicio**: Code maintainability metrics
- **Obtener en**: https://codeclimate.com/oss/dashboard
- **Pasos**:
  1. Crear cuenta en CodeClimate
  2. Agregar repo chronos-system
  3. Ir a Repo Settings > Test Coverage
  4. Copiar el "Test Reporter ID"
- **Costo**: Gratis para open source
- **Variables**: `CODECLIMATE_TOKEN`

#### 10. DeepSource DSN
- **Servicio**: Automated code review
- **Obtener en**: https://deepsource.io/
- **Pasos**:
  1. Crear cuenta en DeepSource
  2. Activar repositorio chronos-system
  3. Copiar el DSN URL
- **Costo**: Gratis para open source
- **Variables**: `DEEPSOURCE_DSN`

#### 11. Codecov Token
- **Servicio**: Code coverage reports
- **Obtener en**: https://codecov.io/
- **Pasos**:
  1. Login con GitHub en Codecov
  2. Agregar repo chronos-system
  3. Copiar el "Upload Token"
- **Costo**: Gratis para open source
- **Variables**: `CODECOV_TOKEN`

---

### 📊 Monitoring & Analytics (3 Keys)

#### 12-14. Sentry (3 valores)
- **Servicio**: Error tracking & performance monitoring
- **Obtener en**: https://sentry.io/
- **Pasos**:
  1. Crear cuenta en Sentry
  2. Crear nuevo proyecto "chronos-system"
  3. Copiar DSN de la configuración
  4. Ir a Settings > Auth Tokens > Create Token
  5. Copiar organización y nombre del proyecto
- **Costo**: Gratis hasta 5K events/mes
- **Variables**: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `VITE_SENTRY_DSN`

---

### 🚀 Deployment Platforms (4 Keys)

#### 15-17. Vercel (3 valores)
- **Servicio**: Deployment platform
- **Obtener en**: https://vercel.com/
- **Pasos**:
  1. Importar repo chronos-system en Vercel
  2. Ir a Account Settings > Tokens
  3. Crear nuevo token
  4. Para ORG_ID y PROJECT_ID: `vercel link` en terminal
- **Costo**: Gratis para hobby projects
- **Variables**: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

#### 18. Lighthouse CI Token
- **Servicio**: Performance monitoring
- **Obtener en**: https://github.com/apps/lighthouse-ci
- **Pasos**:
  1. Instalar Lighthouse CI GitHub App
  2. Configurar en repo chronos-system
  3. El token se genera automáticamente
- **Costo**: Gratis
- **Variables**: `LIGHTHOUSE_TOKEN`

---

### 🔥 Firebase (4 Keys)

#### 19-22. Firebase Configuration
- **Servicio**: Backend services (Auth, Firestore, Storage, Hosting)
- **Obtener en**: https://console.firebase.google.com/
- **Pasos**:
  1. Crear proyecto "chronos-system" en Firebase Console
  2. Agregar app web
  3. Copiar toda la configuración Firebase:
     - apiKey
     - authDomain
     - projectId
     - storageBucket
     - messagingSenderId
     - appId
     - measurementId
  4. Para Firebase Token (CI/CD):
     ```bash
     npm install -g firebase-tools
     firebase login:ci
     ```
- **Costo**: Gratis en Spark plan (con límites)
- **Variables**:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_PROJECT_ID`
  - `FIREBASE_TOKEN` (para CI/CD)
  - Y otros 4 valores de configuración

---

## 🔧 Configuración Rápida

### 1. Copiar plantilla
```bash
cp .env.example .env.local
```

### 2. Editar .env.local
Abrir el archivo y reemplazar todos los placeholders con las keys reales obtenidas.

### 3. Configurar en GitHub Secrets
Para CI/CD, configurar secrets en GitHub:
```bash
gh secret set OPENAI_API_KEY --body "tu-key-real"
gh secret set ANTHROPIC_API_KEY --body "tu-key-real"
# ... repetir para todas las 22 keys
```

### 4. Configurar en Vercel
Para deployment en Vercel:
1. Ir a Project Settings > Environment Variables
2. Agregar todas las variables con prefijo `VITE_`
3. Seleccionar environments: Production, Preview, Development

---

## 💰 Costos Estimados (Mensual)

### Gratis / Open Source
- ✅ Firebase (Spark): $0
- ✅ Vercel (Hobby): $0
- ✅ SonarCloud: $0 (público)
- ✅ Snyk: $0 (open source)
- ✅ Codecov: $0 (open source)
- ✅ CodeClimate: $0 (open source)
- ✅ DeepSource: $0 (open source)
- ✅ HuggingFace: $0 (con límites)
- ✅ Google Gemini: $0 (60 req/min)
- ✅ Pinecone: $0 (hasta 1M vectores)

### Pay-as-you-go (Bajo uso)
- 💵 OpenAI: ~$10-50 (desarrollo)
- 💵 Anthropic Claude: ~$5-30 (desarrollo)
- 💵 Cohere: ~$5-20 (trial luego pago)
- 💵 Sentry: $0-26 (hasta 5K events gratis)

**Total Estimado Desarrollo**: $20-126/mes
**Total Estimado Producción**: $100-500/mes (depende de tráfico)

---

## 🔒 Seguridad

### ⚠️ NUNCA Commitear:
- ❌ `.env.local`
- ❌ `.env.production` (si tiene keys reales)
- ❌ Archivos con keys hardcodeadas

### ✅ SIEMPRE:
- ✅ Usar `.env.example` para plantillas
- ✅ Agregar `.env.local` a `.gitignore`
- ✅ Rotar keys cada 90 días
- ✅ Usar diferentes keys para dev/prod
- ✅ Configurar rate limiting
- ✅ Monitorear uso de APIs

---

## 📞 Soporte

Si tienes problemas obteniendo alguna key:
1. Revisa la documentación oficial del servicio
2. Verifica que tu cuenta esté verificada
3. Revisa límites de free tier
4. Contacta soporte del servicio específico

---

## 🔗 Links Rápidos

- [OpenAI Platform](https://platform.openai.com/)
- [Anthropic Console](https://console.anthropic.com/)
- [Google AI Studio](https://makersuite.google.com/)
- [HuggingFace](https://huggingface.co/)
- [Cohere Dashboard](https://dashboard.cohere.com/)
- [Pinecone Console](https://app.pinecone.io/)
- [Firebase Console](https://console.firebase.google.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [SonarCloud](https://sonarcloud.io/)
- [Snyk](https://app.snyk.io/)
- [Sentry](https://sentry.io/)
- [Codecov](https://codecov.io/)

---

**Última actualización**: 2024-01-XX
**Versión**: 1.0.0
