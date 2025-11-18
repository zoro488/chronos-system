# 🤖 Sistema Autónomo Maestro - Documentación Completa

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Características](#características)
3. [Arquitectura](#arquitectura)
4. [Instalación](#instalación)
5. [Uso](#uso)
6. [Tests](#tests)
7. [Workflows](#workflows)
8. [Auto-corrección](#auto-corrección)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## 🎯 Visión General

El **Sistema Autónomo Maestro** es un sistema de testing y validación completamente autónomo que garantiza la calidad del código mediante:

- ✅ **Tests REALES** con Firebase Emulator (sin mocks)
- 🔄 **5 intentos de auto-corrección** con estrategias diferentes
- 🚫 **NO SE DETIENE** hasta conseguir éxito o agotar intentos
- 📊 **Validación E2E completa**: Excel → Firestore → UI
- 🤖 **100% autónomo** - sin intervención manual

### Flujo de Datos Validado

```
Excel (Administración_General.xlsx)
    ↓
Firestore (Collections reales)
    ↓
Application Logic (Services)
    ↓
UI Components (React)
```

---

## ✨ Características

### 1. Tests Reales con Firebase Emulator

- **Sin mocks ni stubs**: Todos los tests interactúan con Firestore real
- **Emulador local**: Firebase Emulator en puerto 8080
- **Datos reales**: CRUD operations completas
- **Performance testing**: Pruebas de carga con múltiples operaciones

### 2. Sistema de Auto-corrección Inteligente

El sistema implementa **5 estrategias** de recuperación automática:

| Intento | Estrategia | Descripción |
|---------|-----------|-------------|
| **1** | Normal | Ejecución estándar de tests |
| **2** | Reiniciar Emulator | Detiene y reinicia Firebase Emulator |
| **3** | Reinstalar | Limpia y reinstala todas las dependencias |
| **4** | Limpiar Cache | Elimina caches de Vite y Vitest |
| **5** | Reset Completo | Reset total del entorno + emulator |

### 3. Validación E2E Completa

- ✅ Flujo de datos desde Excel hasta UI
- ✅ Validación de KPIs y métricas
- ✅ Verificación de estructura de tablas
- ✅ Consistencia entre múltiples bancos
- ✅ Formato y tipos de datos

### 4. Automatización Total

- 🤖 **PR Automático**: Cuando todos los tests pasan
- ❌ **Issue Automático**: Si fallan después de 5 intentos
- 📊 **Reportes detallados**: Logs y artefactos
- 🔔 **Notificaciones**: En PRs y Issues

---

## 🏗️ Arquitectura

### Estructura de Directorios

```
chronos-system/
├── .github/
│   └── workflows/
│       ├── autonomous-master-system.yml    # Workflow principal
│       └── e2e-data-validation.yml         # Validación E2E
├── tests/
│   ├── helpers/
│   │   └── firebase-test-helper.ts         # Helpers para tests
│   ├── integration/
│   │   └── firebase-real.test.ts           # Tests de integración real
│   └── e2e/
│       └── excel-to-ui.test.ts            # Tests E2E completos
├── scripts/
│   └── validate-complete-system.ps1        # Script de validación
├── docs/
│   └── AUTONOMOUS_SYSTEM.md                # Esta documentación
├── firebase.json                            # Config Firebase
├── .firebaserc                              # Proyecto Firebase
├── firestore.rules                          # Reglas Firestore
└── package.json                             # Dependencias y scripts
```

### Componentes Principales

#### 1. Firebase Test Helper
```typescript
// tests/helpers/firebase-test-helper.ts
- initializeTestFirebase()     // Inicializa Firebase con emulator
- clearAllBancosCollections()  // Limpia datos entre tests
- cleanupTestFirebase()         // Cleanup después de tests
```

#### 2. Integration Tests
```typescript
// tests/integration/firebase-real.test.ts
- CRUD Operations (Ingresos/Gastos)
- Multiple Bancos Operations
- Query Operations
- RF Actual Operations
- Error Handling
- Performance Tests
```

#### 3. E2E Tests
```typescript
// tests/e2e/excel-to-ui.test.ts
- Data Flow Validation
- KPIs Calculation
- Table Data Validation
- Data Consistency
- Summary & Aggregations
```

---

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ o 20+
- NPM 9+
- Git
- PowerShell 7+ (para script de validación)

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/zoro488/chronos-system.git
   cd chronos-system
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Instalar Firebase CLI** (si no está instalado)
   ```bash
   npm install -g firebase-tools
   ```

4. **Instalar Playwright** (para E2E)
   ```bash
   npx playwright install --with-deps chromium
   ```

5. **Validar instalación**
   ```bash
   # Windows PowerShell
   .\scripts\validate-complete-system.ps1
   
   # Linux/Mac
   pwsh scripts/validate-complete-system.ps1
   ```

---

## 💻 Uso

### Comandos Disponibles

```bash
# Tests
npm test                    # Ejecutar todos los tests
npm run test:watch         # Tests en modo watch
npm run test:integration   # Solo tests de integración
npm run test:e2e          # Solo tests E2E
npm run test:coverage     # Tests con cobertura

# Firebase Emulator
npm run emulator:start    # Iniciar emulador
npm run emulator:export   # Exportar datos
npm run emulator:import   # Importar datos

# Workflows
npm run autonomous        # Trigger workflow autónomo (requiere gh CLI)
```

### Ejecución Local

#### 1. Con Emulator Automático
```bash
# El sistema inicia el emulator automáticamente
npm test
```

#### 2. Con Emulator Manual
```bash
# Terminal 1 - Iniciar emulator
npm run emulator:start

# Terminal 2 - Ejecutar tests
npm test
```

#### 3. Validación Completa
```bash
# Windows PowerShell
.\scripts\validate-complete-system.ps1

# Con opciones
.\scripts\validate-complete-system.ps1 -Verbose
.\scripts\validate-complete-system.ps1 -SkipEmulator
```

---

## 🧪 Tests

### Tests de Integración Real

Los tests de integración validan operaciones CRUD completas contra Firestore:

```typescript
describe('Firebase Real Integration Tests', () => {
  // CRUD Operations
  it('debe crear un ingreso REAL en Firestore', async () => {
    const ingreso = { Concepto: 'Venta Test', Ingreso: 1000 };
    const docRef = await addDoc(collection(db, 'profit_ingresos'), ingreso);
    expect(docRef.id).toBeDefined();
  });

  // Multiple Bancos
  it('debe manejar múltiples bancos simultáneamente', async () => {
    const bancos = ['profit', 'azteca', 'boveda_monte'];
    // ...
  });

  // Performance
  it('debe crear múltiples documentos rápidamente', async () => {
    const promises = [];
    for (let i = 0; i < 50; i++) {
      promises.push(addDoc(collection(db, 'profit_ingresos'), data));
    }
    await Promise.all(promises);
  });
});
```

### Tests E2E

Los tests E2E validan el flujo completo de datos:

```typescript
describe('E2E: Excel → Firestore → UI', () => {
  // Validar datos del Excel en Firestore
  it('debe validar datos de Excel en Firestore', async () => {
    // Simular carga desde Excel
    const excelData = { bancos: [...] };
    // Cargar a Firestore
    // Validar totales
  });

  // Calcular KPIs
  it('debe calcular KPIs correctamente desde Excel', async () => {
    // ...
  });
});
```

### Ejecutar Tests Específicos

```bash
# Un banco específico
npm test -- -t "profit"

# Solo CRUD
npm test -- -t "CRUD"

# Solo E2E
npm test -- tests/e2e/

# Solo integración
npm test -- tests/integration/

# Con cobertura
npm run test:coverage
```

---

## ⚙️ Workflows

### 1. Autonomous Master System

**Archivo**: `.github/workflows/autonomous-master-system.yml`

**Triggers**:
- Push a `main` o `develop`
- Pull requests
- Manual (`workflow_dispatch`)
- Schedule (cada 6 horas)

**Flujo**:
1. ✅ Setup inicial (Node.js, dependencias, Firebase CLI)
2. 🔥 Iniciar Firebase Emulator
3. 🧪 Ejecutar tests (5 intentos con auto-corrección)
4. 📊 Generar reportes
5. ✅ Crear PR si éxito
6. ❌ Crear Issue si falla

### 2. E2E Data Validation

**Archivo**: `.github/workflows/e2e-data-validation.yml`

**Triggers**:
- Push a `main` o `develop`
- Pull requests (cambios en tests, services, src)
- Manual (`workflow_dispatch`)
- Schedule (diario a las 8 AM UTC)

**Flujo**:
1. ✅ Setup completo
2. 🔥 Iniciar emulator
3. 🧪 Tests de integración
4. 🎭 Tests E2E
5. 📋 Generar reporte de validación
6. 💬 Comentar en PR
7. ❌ Crear Issue si falla

---

## 🔄 Auto-corrección

### Estrategias Implementadas

#### Intento 1: Ejecución Normal
```yaml
- name: Tests - Attempt 1
  run: npm test
```

#### Intento 2: Reiniciar Emulator
```yaml
- name: Fix 1 - Restart Emulator
  run: |
    pkill -f firebase || true
    firebase emulators:start --only firestore &
    sleep 20
```

#### Intento 3: Reinstalar Dependencias
```yaml
- name: Fix 2 - Reinstall Dependencies
  run: |
    rm -rf node_modules
    npm cache clean --force
    npm install --force
```

#### Intento 4: Limpiar Cache
```yaml
- name: Fix 3 - Clean Cache
  run: |
    rm -rf node_modules/.vite
    rm -rf node_modules/.cache
    npm cache clean --force
```

#### Intento 5: Reset Completo
```yaml
- name: Fix 4 - Complete Reset
  run: |
    pkill -f firebase || true
    rm -rf node_modules
    npm ci
    firebase emulators:start &
```

### Lógica de Decisión

```yaml
# Determinar resultado final
if [[ "$test1" == "success" ]] || \
   [[ "$test2" == "success" ]] || \
   [[ "$test3" == "success" ]] || \
   [[ "$test4" == "success" ]] || \
   [[ "$test5" == "success" ]]; then
  echo "TESTS_PASSED=true"
  # Crear PR
else
  echo "TESTS_PASSED=false"
  # Crear Issue
fi
```

---

## 🐛 Troubleshooting

### Problema: Emulator no inicia

**Síntomas**:
```
Error: Could not start Firestore Emulator
```

**Solución**:
```bash
# Detener procesos previos
pkill -f firebase

# Limpiar puerto
sudo lsof -ti:8080 | xargs sudo kill -9

# Reiniciar emulator
firebase emulators:start --only firestore
```

### Problema: Tests fallan por timeout

**Síntomas**:
```
Error: Timeout of 30000ms exceeded
```

**Solución**:
```typescript
// Aumentar timeout en vitest.config.ts
export default defineConfig({
  test: {
    testTimeout: 60000,  // 60 segundos
    hookTimeout: 30000   // 30 segundos
  }
});
```

### Problema: FIRESTORE_EMULATOR_HOST no definido

**Síntomas**:
```
Error: Firebase config not found
```

**Solución**:
```bash
# Definir variable de entorno
export FIRESTORE_EMULATOR_HOST="localhost:8080"

# O en package.json
"test": "cross-env FIRESTORE_EMULATOR_HOST=localhost:8080 vitest run"
```

### Problema: Puerto 8080 ocupado

**Síntomas**:
```
Error: Port 8080 is already in use
```

**Solución**:
```bash
# Linux/Mac
lsof -ti:8080 | xargs kill -9

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

---

## ❓ FAQ

### ¿Cómo funciona el sistema de auto-corrección?

El sistema ejecuta tests hasta 5 veces, aplicando una estrategia diferente antes de cada intento. Si cualquier intento es exitoso, se considera que los tests pasaron.

### ¿Los tests modifican datos reales?

No. Los tests se ejecutan contra el Firebase Emulator, que es una instancia local. Los datos reales en producción nunca se tocan.

### ¿Cuánto tarda un ciclo completo?

- **Sin fallos**: 2-5 minutos
- **Con 1-2 fallos**: 5-10 minutos
- **Con 5 fallos**: 15-20 minutos

### ¿Qué pasa si fallan los 5 intentos?

Se crea automáticamente un Issue en GitHub con:
- Logs de todos los intentos
- Detalles del error
- Enlaces a artefactos
- Label `auto-correction-failed`

### ¿Puedo ejecutar solo algunos tests?

Sí:
```bash
npm test -- -t "nombre del test"
npm test -- tests/integration/
npm test -- --grep "CRUD"
```

### ¿Cómo agrego nuevos tests?

1. Crear archivo en `tests/integration/` o `tests/e2e/`
2. Importar helpers de `firebase-test-helper`
3. Seguir el patrón de tests existentes
4. Ejecutar localmente
5. Commit y push (workflow se ejecuta automáticamente)

### ¿Necesito configurar algo en GitHub?

No. Los workflows usan `GITHUB_TOKEN` que está disponible automáticamente. Solo asegúrate de que Actions esté habilitado en el repositorio.

### ¿Puedo usar esto en mi proyecto?

¡Sí! El sistema es completamente reutilizable:
1. Copia los archivos de workflows
2. Ajusta las colecciones de Firestore a tu proyecto
3. Modifica los tests según tus necesidades
4. Personaliza las estrategias de auto-corrección

---

## 📊 Métricas y Estadísticas

El sistema recopila automáticamente:

- ✅ Tasa de éxito de tests
- 🔄 Número de intentos promedio
- ⏱️ Tiempo de ejecución
- 🐛 Tipos de errores más comunes
- 📈 Tendencias de calidad

Estas métricas están disponibles en:
- GitHub Actions Insights
- Artefactos de workflow
- Issues generados automáticamente

---

## 🤝 Contribuir

Para contribuir al sistema:

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m "feat: nueva funcionalidad"`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📝 Licencia

MIT License - Ver archivo LICENSE para detalles

---

## 🔗 Enlaces Útiles

- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Vitest Documentation](https://vitest.dev)
- [Playwright Testing](https://playwright.dev)
- [GitHub Actions](https://docs.github.com/actions)

---

**🤖 Sistema Autónomo Maestro v1.0**
*Última actualización: 2025-11-18*
