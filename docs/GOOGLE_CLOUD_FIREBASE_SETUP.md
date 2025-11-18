# ☁️ Google Cloud & Firebase Setup Guide

## 📋 Requisitos Previos
- Cuenta de Google
- Node.js 18+ instalado
- PowerShell 7+ (Windows)
- Git instalado

---

## 1️⃣ Instalar Google Cloud CLI

### Opción A: Windows Installer (Recomendado)

#### Descargar e Instalar
```powershell
# Descargar el instalador
Invoke-WebRequest -Uri "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe" -OutFile "$env:TEMP\GoogleCloudSDKInstaller.exe"

# Ejecutar el instalador
Start-Process -FilePath "$env:TEMP\GoogleCloudSDKInstaller.exe" -Wait

# El instalador te guiará por los pasos
```

#### Componentes a Instalar
Durante la instalación, selecciona:
- ✅ Core Google Cloud SDK
- ✅ gcloud CLI
- ✅ gsutil (Google Storage)
- ✅ bq (BigQuery)

#### Verificar Instalación
```powershell
# Cerrar y reabrir PowerShell, luego:
gcloud --version

# Deberías ver:
# Google Cloud SDK 460.0.0
# bq 2.0.101
# core 2024.01.19
# gsutil 5.27
```

### Opción B: Chocolatey (Si ya lo tienes)
```powershell
choco install gcloudsdk -y
```

### Opción C: Manual Download
1. Descargar desde: https://cloud.google.com/sdk/docs/install
2. Extraer el ZIP
3. Ejecutar `install.bat`
4. Seguir las instrucciones

---

## 2️⃣ Configurar Google Cloud CLI

### Inicializar gcloud
```powershell
# Iniciar sesión y configurar proyecto
gcloud init

# Seleccionar opciones:
# 1. Login con tu cuenta de Google
# 2. Crear o seleccionar proyecto
# 3. Configurar región por defecto (us-central1 recomendado)
```

### Comandos de Configuración
```powershell
# Ver configuración actual
gcloud config list

# Establecer proyecto por defecto
gcloud config set project chronos-system-prod

# Establecer región por defecto
gcloud config set compute/region us-central1
gcloud config set compute/zone us-central1-a

# Listar proyectos
gcloud projects list

# Crear nuevo proyecto (si es necesario)
gcloud projects create chronos-system-prod --name="Chronos System Production"
```

### Habilitar APIs Necesarias
```powershell
# Habilitar Firebase, Firestore, Cloud Functions, Storage
gcloud services enable firebase.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable storage-api.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable serviceusage.googleapis.com

# Verificar APIs habilitadas
gcloud services list --enabled
```

---

## 3️⃣ Instalar Firebase CLI

### Instalación Global
```powershell
# Instalar Firebase Tools
npm install -g firebase-tools

# Verificar instalación
firebase --version

# Deberías ver: 14.24.2 (o superior)
```

### Login a Firebase
```powershell
# Iniciar sesión con tu cuenta de Google
firebase login

# Si ya estás logueado:
firebase login --reauth

# Para CI/CD, generar token:
firebase login:ci

# Copiar el token generado y guardarlo como secret:
# FIREBASE_TOKEN
```

### Verificar Acceso
```powershell
# Listar proyectos de Firebase
firebase projects:list

# Deberías ver tus proyectos
```

---

## 4️⃣ Inicializar Firebase en chronos-system

### Cambiar al directorio del proyecto
```powershell
cd C:\Users\xpovo\Documents\chronos-system
```

### Inicializar Firebase
```powershell
# Iniciar configuración interactiva
firebase init

# Seleccionar características:
# ✅ Firestore
# ✅ Functions (opcional, para Cloud Functions)
# ✅ Hosting
# ✅ Storage
# ✅ Emulators

# Responder las preguntas:
# - Proyecto: Seleccionar "chronos-system-prod" (o crear nuevo)
# - Firestore: Usar defaults (firestore.rules, firestore.indexes.json)
# - Hosting:
#   * Public directory: dist
#   * SPA: Yes
#   * GitHub Actions: No (ya tenemos workflows)
# - Storage: Usar defaults (storage.rules)
# - Emulators: Seleccionar Authentication, Firestore, Storage
```

---

## 5️⃣ Configurar Firestore

### Reglas de Seguridad (firestore.rules)
El archivo ya debería existir después de `firebase init`. Ejemplo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
    }

    // FlowDistributor collections
    match /workflows/{workflowId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }

    match /tasks/{taskId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }

    // SmartSales collections
    match /sales/{saleId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }

    // ClientHub collections
    match /clients/{clientId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }

    // AnalyticsPro collections
    match /analytics/{docId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }

    // TeamSync collections
    match /teams/{teamId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
  }
}
```

### Índices de Firestore (firestore.indexes.json)
```json
{
  "indexes": [
    {
      "collectionGroup": "workflows",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "workflowId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "dueDate", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "sales",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "clients",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "lastContact", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

### Desplegar Reglas e Índices
```powershell
# Desplegar solo reglas de Firestore
firebase deploy --only firestore:rules

# Desplegar solo índices
firebase deploy --only firestore:indexes

# Desplegar ambos
firebase deploy --only firestore
```

---

## 6️⃣ Configurar Firebase Authentication

### Habilitar Métodos de Autenticación
```powershell
# Opción 1: Firebase Console (Recomendado)
# 1. Ir a: https://console.firebase.google.com/
# 2. Seleccionar proyecto chronos-system-prod
# 3. Build > Authentication > Sign-in method
# 4. Habilitar:
#    - ✅ Email/Password
#    - ✅ Google
#    - ✅ GitHub (opcional)
```

---

## 7️⃣ Configurar Firebase Storage

### Reglas de Storage (storage.rules)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // User uploads
    match /users/{userId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) && request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }

    // Public assets
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if isAuthenticated();
    }

    // Workflow attachments
    match /workflows/{workflowId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.resource.size < 50 * 1024 * 1024; // 50MB limit
    }
  }
}
```

### Desplegar Reglas de Storage
```powershell
firebase deploy --only storage
```

---

## 8️⃣ Configurar Firebase Hosting

### firebase.json
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(html|json)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=0, must-revalidate"
          }
        ]
      }
    ],
    "cleanUrls": true,
    "trailingSlash": false
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true,
      "port": 4000
    },
    "singleProjectMode": true
  }
}
```

---

## 9️⃣ Usar Firebase Emulators (Desarrollo Local)

### Iniciar Emuladores
```powershell
# Iniciar todos los emuladores
firebase emulators:start

# Iniciar emuladores específicos
firebase emulators:start --only firestore,auth,storage

# Iniciar con datos de prueba
firebase emulators:start --import=./firebase-data --export-on-exit
```

### UI de Emuladores
Una vez iniciados, acceder a:
- **UI Principal**: http://localhost:4000
- **Firestore**: http://localhost:4000/firestore
- **Authentication**: http://localhost:4000/auth
- **Storage**: http://localhost:4000/storage

### Exportar/Importar Datos
```powershell
# Exportar datos actuales
firebase emulators:export ./firebase-data

# Importar datos guardados
firebase emulators:start --import=./firebase-data

# Exportar al cerrar
firebase emulators:start --export-on-exit=./firebase-data
```

---

## 🔟 Deploy a Firebase Hosting

### Build y Deploy
```powershell
# 1. Build de producción
npm run build

# 2. Desplegar todo
firebase deploy

# 3. Desplegar solo hosting
firebase deploy --only hosting

# 4. Preview antes de deploy
firebase hosting:channel:deploy preview

# 5. Deploy con mensaje
firebase deploy -m "Deploy version 1.0.0"
```

### Configurar Variables de Entorno
```powershell
# Configurar Firebase config en tu app
# Copiar de Firebase Console > Project Settings > General > Your apps

# Actualizar .env.production con:
# - apiKey
# - authDomain
# - projectId
# - storageBucket
# - messagingSenderId
# - appId
# - measurementId
```

---

## 1️⃣1️⃣ Comandos Útiles

### Google Cloud
```powershell
# Ver información del proyecto
gcloud projects describe chronos-system-prod

# Ver configuración
gcloud config list

# Cambiar proyecto
gcloud config set project otro-proyecto

# Ver logs
gcloud logging read "resource.type=cloud_function" --limit 50

# Ver cuotas
gcloud compute project-info describe --project=chronos-system-prod
```

### Firebase
```powershell
# Ver proyectos
firebase projects:list

# Cambiar proyecto activo
firebase use chronos-system-prod

# Ver configuración
firebase apps:sdkconfig web

# Ver funciones desplegadas
firebase functions:list

# Ver hosting sites
firebase hosting:sites:list

# Abrir consola
firebase open
```

---

## 🔧 Troubleshooting

### Problema: "gcloud not recognized"
```powershell
# Solución: Reiniciar PowerShell o agregar manualmente al PATH:
$env:Path += ";C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin"
```

### Problema: "Permission denied" en firebase deploy
```powershell
# Solución: Volver a autenticarse
firebase login --reauth

# Verificar permisos en Firebase Console
```

### Problema: CORS errors en emuladores
```powershell
# Solución: Configurar CORS en firebase.json
# O usar proxy en vite.config.ts
```

### Problema: "Project not found"
```powershell
# Verificar que el proyecto existe
gcloud projects list

# Crear si es necesario
gcloud projects create chronos-system-prod
```

---

## 📚 Recursos

- [Google Cloud CLI Docs](https://cloud.google.com/sdk/docs)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

## ✅ Checklist de Configuración

- [ ] Google Cloud CLI instalado y configurado
- [ ] Firebase CLI instalado
- [ ] Proyecto de Firebase creado
- [ ] `firebase init` ejecutado
- [ ] Reglas de Firestore configuradas
- [ ] Índices de Firestore creados
- [ ] Authentication habilitada (Email/Password, Google)
- [ ] Reglas de Storage configuradas
- [ ] Emuladores probados localmente
- [ ] Build de producción exitoso
- [ ] Deploy a Firebase Hosting exitoso
- [ ] Variables de entorno configuradas
- [ ] `.env.local` con config de Firebase

---

**Siguiente paso**: Configurar MCPs adicionales y crear componentes UI/UX premium
