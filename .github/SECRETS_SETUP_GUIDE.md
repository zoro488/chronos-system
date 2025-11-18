# 🔐 Configuración de GitHub Secrets - Guía Paso a Paso

## 🎯 Objetivo
Esta guía te ayudará a configurar todos los secrets necesarios para que los workflows de GitHub Actions funcionen correctamente.

---

## 📋 Lista de Secrets Requeridos

### 🔴 CRÍTICOS (Sin estos, NINGÚN workflow funcionará)

| Secret | Descripción | Ejemplo | Dónde obtenerlo |
|--------|-------------|---------|-----------------|
| `FIREBASE_SERVICE_ACCOUNT` | JSON completo del service account | `{"type": "service_account"...}` | Firebase Console → Project Settings → Service Accounts |
| `VITE_FIREBASE_API_KEY` | API Key de Firebase | `AIzaSyC...` | Firebase Console → Project Settings → General |
| `VITE_FIREBASE_PROJECT_ID` | ID del proyecto Firebase | `premium-ecosystem` | Firebase Console → Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | Dominio de Auth | `premium-ecosystem.firebaseapp.com` | Firebase Console → Project Settings |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de Storage | `premium-ecosystem.appspot.com` | Firebase Console → Project Settings |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID para messaging | `123456789` | Firebase Console → Project Settings |
| `VITE_FIREBASE_APP_ID` | App ID de Firebase | `1:123456:web:abc123` | Firebase Console → Project Settings |

### 🟡 RECOMENDADOS (Para notificaciones y alertas)

| Secret | Descripción | Ejemplo | Dónde obtenerlo |
|--------|-------------|---------|-----------------|
| `MAIL_USERNAME` | Email para enviar notificaciones | `notifications@company.com` | Tu proveedor de email |
| `MAIL_PASSWORD` | App password del email | `abcd efgh ijkl mnop` | Gmail: Cuenta → Seguridad → Contraseñas de aplicación |
| `NOTIFICATION_EMAIL` | Email que recibirá alertas | `team@company.com` | Tu email del equipo |
| `SLACK_WEBHOOK` | Webhook de Slack | `https://hooks.slack.com/...` | Slack → Apps → Incoming Webhooks |

### 🟢 OPCIONALES (Para herramientas externas)

| Secret | Descripción | Dónde obtenerlo |
|--------|-------------|-----------------|
| `CODECOV_TOKEN` | Token de Codecov | codecov.io |
| `SNYK_TOKEN` | Token de Snyk | snyk.io |
| `GITLEAKS_LICENSE` | Licencia de GitLeaks | gitleaks.io |

---

## 🚀 Configuración Paso a Paso

### Paso 1: Acceder a GitHub Secrets

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (⚙️)
3. En el menú lateral, ve a **Secrets and variables** → **Actions**
4. Verás una pantalla con "Repository secrets"

**URL directa:** `https://github.com/[tu-usuario]/premium-ecosystem/settings/secrets/actions`

---

### Paso 2: Obtener Firebase Service Account (CRÍTICO)

#### Opción A: Desde Firebase Console (Recomendado)

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto **premium-ecosystem**
3. Click en **⚙️ Project Settings**
4. Ve a la pestaña **Service Accounts**
5. Click en **Generate New Private Key**
6. Se descargará un archivo JSON
7. **Abre el archivo y copia TODO su contenido**

#### Opción B: Desde Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **IAM & Admin** → **Service Accounts**
4. Click en tu service account
5. Ve a **Keys** → **Add Key** → **Create new key**
6. Selecciona **JSON** y descarga

#### ⚠️ IMPORTANTE
- El JSON debe estar completo, con todas las llaves
- Incluye las comillas y formato exacto
- No compartas este archivo públicamente

**Ejemplo del JSON:**
```json
{
  "type": "service_account",
  "project_id": "premium-ecosystem",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk@premium-ecosystem.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

---

### Paso 3: Obtener Firebase Config Variables

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Click en **⚙️ Project Settings**
4. Scroll down a **Your apps**
5. Selecciona tu web app (o créala si no existe)
6. En **SDK setup and configuration**, selecciona **Config**
7. Copia los valores:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",           // ← VITE_FIREBASE_API_KEY
  authDomain: "premium-ecosystem.firebaseapp.com",  // ← VITE_FIREBASE_AUTH_DOMAIN
  projectId: "premium-ecosystem",  // ← VITE_FIREBASE_PROJECT_ID
  storageBucket: "premium-ecosystem.appspot.com",  // ← VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",  // ← VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456:web:abc123"     // ← VITE_FIREBASE_APP_ID
};
```

---

### Paso 4: Configurar Email para Notificaciones (Gmail)

#### Para Gmail:

1. Ve a tu cuenta de Gmail
2. Click en tu foto de perfil → **Manage your Google Account**
3. Ve a **Security**
4. Habilita **2-Step Verification** (si no está habilitado)
5. Busca **App passwords** (Contraseñas de aplicación)
6. Selecciona app: **Mail**
7. Selecciona device: **Other** → escribe "GitHub Actions"
8. Click **Generate**
9. Copia la contraseña generada (16 caracteres sin espacios)

**Secrets a crear:**
- `MAIL_USERNAME`: tu-email@gmail.com
- `MAIL_PASSWORD`: la contraseña de aplicación generada
- `NOTIFICATION_EMAIL`: el email que recibirá las alertas

---

### Paso 5: Agregar Secrets a GitHub

Para cada secret:

1. En la página de Secrets, click **"New repository secret"**
2. **Name:** Nombre del secret (ej: `FIREBASE_SERVICE_ACCOUNT`)
3. **Secret:** El valor correspondiente
4. Click **"Add secret"**

#### Ejemplo: Agregar FIREBASE_SERVICE_ACCOUNT

```
Name: FIREBASE_SERVICE_ACCOUNT

Secret:
{
  "type": "service_account",
  "project_id": "premium-ecosystem",
  ...todo el JSON completo...
}
```

#### Ejemplo: Agregar VITE_FIREBASE_API_KEY

```
Name: VITE_FIREBASE_API_KEY

Secret: AIzaSyC-xxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ✅ Verificación

### Checklist de Secrets Configurados

Copia esta lista y marca cada secret que configures:

```
CRÍTICOS:
[ ] FIREBASE_SERVICE_ACCOUNT
[ ] VITE_FIREBASE_API_KEY
[ ] VITE_FIREBASE_PROJECT_ID
[ ] VITE_FIREBASE_AUTH_DOMAIN
[ ] VITE_FIREBASE_STORAGE_BUCKET
[ ] VITE_FIREBASE_MESSAGING_SENDER_ID
[ ] VITE_FIREBASE_APP_ID

NOTIFICACIONES:
[ ] MAIL_USERNAME
[ ] MAIL_PASSWORD
[ ] NOTIFICATION_EMAIL

OPCIONALES:
[ ] SLACK_WEBHOOK
[ ] CODECOV_TOKEN
[ ] SNYK_TOKEN
```

---

## 🧪 Probar Configuración

Una vez configurados los secrets, prueba que funcionan:

### 1. Ejecutar Workflow Manualmente

1. Ve a **Actions** en GitHub
2. Selecciona **"Pre-Deployment Checklist"**
3. Click **"Run workflow"**
4. Selecciona branch: **main**
5. Click **"Run workflow"** (botón verde)

### 2. Verificar Resultado

- ✅ Si pasa: Los secrets están configurados correctamente
- ❌ Si falla: Revisa los logs para ver qué secret falta o está mal

---

## 🔍 Troubleshooting

### Error: "Context access might be invalid: FIREBASE_SERVICE_ACCOUNT"

**Solución:** Este es solo un warning del linter, no afecta la funcionalidad.

### Error: "Secret FIREBASE_SERVICE_ACCOUNT not found"

**Solución:**
1. Verifica que el nombre del secret sea exactamente `FIREBASE_SERVICE_ACCOUNT`
2. Verifica que esté en "Repository secrets" no en "Environment secrets"
3. Espera 1-2 minutos después de crear el secret

### Error: "Invalid Firebase credentials"

**Solución:**
1. Verifica que el JSON del service account esté completo
2. Asegúrate de no tener espacios extra al inicio o final
3. Verifica que las comillas sean las correctas (no smart quotes)

### Error: "Failed to send email notification"

**Solución:**
1. Verifica que `MAIL_USERNAME` sea tu email completo
2. Usa una "App Password" no tu contraseña normal de Gmail
3. Verifica que 2FA esté habilitado en tu cuenta de Google

---

## 📝 Notas Importantes

### Seguridad

- ❌ **NUNCA** commites secrets al código
- ❌ **NUNCA** compartas secrets públicamente
- ✅ Usa GitHub Secrets para almacenarlos
- ✅ Rota secrets periódicamente (cada 3-6 meses)
- ✅ Usa service accounts con permisos mínimos

### Environments

Si trabajas con múltiples ambientes (staging, production):

1. Crea environments en GitHub:
   - Settings → Environments → New environment
2. Agrega secrets específicos por environment
3. Configura protection rules

---

## 🆘 Soporte

Si tienes problemas:

1. **Revisa los logs del workflow** - Tienen información detallada del error
2. **Verifica la documentación oficial:**
   - [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
   - [Firebase Service Account](https://firebase.google.com/docs/admin/setup)
3. **Contacta al equipo:** support@company.com

---

## ✅ Siguiente Paso

Una vez configurados todos los secrets críticos:

1. ✅ Ejecuta el workflow **"Pre-Deployment Checklist"**
2. ✅ Verifica que pase exitosamente
3. ✅ Revisa los artifacts generados
4. ✅ Continúa con la creación de scripts NPM

**📚 Siguiente documento:** `.github/WORKFLOWS_GUIDE.md`

---

**🎉 Con los secrets configurados, tus workflows están listos para funcionar!**
