# 🔥 Guía de Configuración de Firebase

## 📋 Tabla de Contenidos

- [Creación del Proyecto](#creación-del-proyecto)
- [Service Account Setup](#service-account-setup)
- [Configuración de Servicios](#configuración-de-servicios)
- [Security Rules](#security-rules)
- [Indexes de Firestore](#indexes-de-firestore)
- [Testing Local](#testing-local)

---

## 🚀 Creación del Proyecto

### Paso 1: Crear Proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Add project" o "Create a project"
3. Ingresa el nombre del proyecto: `chronos-system-prod`
4. (Opcional) Habilita Google Analytics
5. Click en "Create project"
6. Espera a que se complete la creación (~1 minuto)

### Paso 2: Crear Proyectos Adicionales (Opcional)

Para staging y development:

- `chronos-system-staging`
- `chronos-system-dev`

Repite el proceso para cada ambiente.

### Paso 3: Actualizar .firebaserc

El archivo `.firebaserc` ya está configurado:

```json
{
  "projects": {
    "default": "chronos-system-prod",
    "staging": "chronos-system-staging",
    "development": "chronos-system-dev"
  }
}
```

---

## 🔐 Service Account Setup

### Para GitHub Actions

1. Ve a Firebase Console > Project Settings > Service Accounts
2. Click en "Generate new private key"
3. Guarda el archivo JSON (mantenerlo seguro)
4. Ve a GitHub: `Settings > Secrets and variables > Actions`
5. Click en "New repository secret"
6. Nombre: `FIREBASE_SERVICE_ACCOUNT`
7. Valor: Todo el contenido del JSON (incluye `{ }`)
8. Click en "Add secret"

### Para Desarrollo Local

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login a Firebase
firebase login

# Verificar proyectos
firebase projects:list

# Cambiar proyecto activo
firebase use chronos-system-prod
```

---

## ⚙️ Configuración de Servicios

### 1. Firestore Database

#### Crear la Base de Datos

1. En Firebase Console, ve a "Firestore Database"
2. Click en "Create database"
3. Selecciona modo: **Production mode**
4. Elige ubicación: `us-central1` (o más cercana)
5. Click en "Enable"

#### Desplegar Rules

```bash
firebase deploy --only firestore:rules
```

El archivo `firestore.rules` ya está configurado con:
- Autenticación requerida para todas las operaciones
- Permisos basados en roles (admin, user)
- Validación de ownership para recursos

#### Desplegar Indexes

```bash
firebase deploy --only firestore:indexes
```

Los índices están definidos en `firestore.indexes.json` para:
- Consultas de clientes por fecha y estado
- Consultas de productos por categoría y stock
- Transacciones por usuario y fecha
- Movimientos bancarios por banco y fecha

---

### 2. Authentication

#### Habilitar Email/Password

1. Ve a "Authentication" en Firebase Console
2. Click en "Get started"
3. En la pestaña "Sign-in method"
4. Habilita "Email/Password"
5. (Opcional) Habilita "Email link (passwordless sign-in)"

#### Otros Proveedores (Opcional)

- Google
- Facebook
- GitHub
- Twitter

#### Configurar Dominio Autorizado

1. En "Authentication > Settings"
2. Agrega tu dominio de producción
3. Ejemplo: `chronos-system-prod.web.app`

---

### 3. Firebase Hosting

#### Inicializar Hosting

```bash
firebase init hosting
```

Responde:
- Public directory: `dist`
- Single-page app: `Yes`
- GitHub Actions: `No` (ya tenemos workflows)

#### Desplegar

```bash
# Build primero
npm run build

# Deploy
firebase deploy --only hosting
```

#### Configuración de Hosting

El archivo `firebase.json` ya está configurado con:
- SPA rewrites
- Cache headers optimizados
- Security headers (CSP, X-Frame-Options, etc.)

---

### 4. Storage (Opcional)

Si necesitas almacenar archivos:

1. Ve a "Storage" en Firebase Console
2. Click en "Get started"
3. Acepta las reglas predeterminadas
4. Elige ubicación (misma que Firestore)

#### Storage Rules Básicas

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🔒 Security Rules

### Firestore Rules

El archivo `firestore.rules` incluye:

#### Helper Functions

```javascript
function isAuthenticated() {
  return request.auth != null;
}

function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}

function isAdmin() {
  return hasRole('admin');
}
```

#### Colecciones Protegidas

| Colección | Read | Write |
|-----------|------|-------|
| clientes | Auth | Auth + Owner/Admin |
| productos | Auth | Auth + Owner/Admin |
| inventario | Auth | Auth + Owner/Admin |
| ventas | Auth | Auth + Owner/Admin |
| compras | Auth | Auth + Owner/Admin |
| movimientosBancarios | Auth | Auth + Owner/Admin |
| usuarios | Auth | Owner/Admin |
| configuracion | Auth | Admin only |

### Testing Rules

```bash
# Instalar emuladores
firebase init emulators

# Ejecutar emuladores
firebase emulators:start

# En otra terminal, ejecutar tests
npm run test
```

---

## 📊 Indexes de Firestore

### Índices Automáticos

Firestore crea automáticamente índices para:
- Queries de campo único
- Queries simples de igualdad

### Índices Compuestos

Definidos en `firestore.indexes.json`:

#### Clientes
```json
{
  "collectionGroup": "clientes",
  "fields": [
    { "fieldPath": "createdAt", "order": "DESCENDING" },
    { "fieldPath": "estado", "order": "ASCENDING" }
  ]
}
```

#### Productos
```json
{
  "collectionGroup": "productos",
  "fields": [
    { "fieldPath": "categoria", "order": "ASCENDING" },
    { "fieldPath": "stock", "order": "DESCENDING" }
  ]
}
```

#### Transactions
```json
{
  "collectionGroup": "transactions",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "fecha", "order": "DESCENDING" }
  ]
}
```

### Crear Índices

```bash
firebase deploy --only firestore:indexes
```

---

## 🧪 Testing Local con Emuladores

### Instalar Emuladores

```bash
firebase init emulators
```

Selecciona:
- ✅ Firestore
- ✅ Authentication
- ✅ Hosting (opcional)
- ✅ Storage (opcional)

### Configurar Puertos

```json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "hosting": {
      "port": 5000
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

### Ejecutar Emuladores

```bash
firebase emulators:start
```

### Conectar App a Emuladores

En tu código:

```typescript
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const db = getFirestore(app);
const auth = getAuth(app);

if (location.hostname === 'localhost') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

---

## 🔄 Migración de Datos

### Exportar Datos de Firestore

```bash
# Exportar a bucket de Cloud Storage
gcloud firestore export gs://[BUCKET_NAME]

# O usar script personalizado
node scripts/export-firestore.js
```

### Importar Datos

```bash
# Importar desde bucket
gcloud firestore import gs://[BUCKET_NAME]/[EXPORT_FOLDER]

# O usar script personalizado
node scripts/import-firestore.js
```

---

## 📈 Monitoreo y Analytics

### Firebase Analytics

1. Ve a "Analytics" en Firebase Console
2. Habilita Analytics
3. Configura eventos personalizados en el código:

```typescript
import { logEvent } from 'firebase/analytics';

logEvent(analytics, 'purchase', {
  transaction_id: 'T12345',
  value: 30.03,
  currency: 'USD'
});
```

### Performance Monitoring

```bash
npm install firebase
```

```typescript
import { getPerformance } from 'firebase/performance';

const perf = getPerformance(app);
```

---

## 💰 Costos y Límites

### Plan Spark (Gratis)

- Firestore: 1GB storage, 50K reads, 20K writes
- Authentication: Ilimitado
- Hosting: 10GB bandwidth/mes

### Plan Blaze (Pay as you go)

- Firestore: $0.18/GB, $0.06/100K reads
- Hosting: $0.15/GB después de 10GB

### Monitorear Uso

1. Ve a "Usage and billing" en Firebase Console
2. Configura alertas de presupuesto
3. Revisa métricas diariamente

---

## 🐛 Troubleshooting

### Error: "Permission denied"

**Causa:** Rules de Firestore muy restrictivas

**Solución:**
1. Verifica que el usuario esté autenticado
2. Revisa las rules en Firebase Console
3. Usa emulador para debug: `firebase emulators:start`

### Error: "Index required"

**Causa:** Falta un índice compuesto

**Solución:**
1. Click en el link del error (te lleva a crear el índice)
2. O agrega el índice en `firestore.indexes.json`
3. Deploy: `firebase deploy --only firestore:indexes`

### Error: "Project not found"

**Causa:** `.firebaserc` no configurado o proyecto incorrecto

**Solución:**
```bash
firebase use chronos-system-prod
```

---

## 📚 Referencias

- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

**Última actualización:** 2025-11-18
