# 🚀 Quick Start - Sistema Autónomo Maestro

## ⚡ Inicio Rápido en 3 Pasos

### 1️⃣ Instalación (2 minutos)

```bash
# Clonar repositorio
git clone https://github.com/zoro488/chronos-system.git
cd chronos-system

# Instalar dependencias
npm install

# Instalar Firebase CLI globalmente
npm install -g firebase-tools
```

### 2️⃣ Ejecutar Tests Localmente (1 minuto)

```bash
# Terminal 1 - Iniciar Firebase Emulator
npm run emulator:start

# Terminal 2 - Ejecutar tests
npm test
```

### 3️⃣ Activar en GitHub Actions (30 segundos)

El sistema se activa automáticamente en GitHub Actions cuando:
- ✅ Haces push a `main` o `develop`
- ✅ Creas un Pull Request
- ✅ Se ejecuta el schedule (cada 6 horas)
- ✅ Lo ejecutas manualmente desde Actions tab

---

## 📋 Validación Completa

Para validar que todo está configurado correctamente:

```bash
# Windows PowerShell
.\scripts\validate-complete-system.ps1

# Linux/Mac con PowerShell instalado
pwsh scripts/validate-complete-system.ps1
```

Este script automáticamente:
1. ✅ Verifica prerrequisitos (Node.js, NPM, Firebase CLI)
2. ✅ Valida archivos de configuración
3. ✅ Instala dependencias
4. ✅ Inicia Firebase Emulator
5. ✅ Ejecuta tests de integración
6. ✅ Ejecuta tests E2E
7. ✅ Genera reporte completo

---

## 🎯 Comandos Esenciales

```bash
# Tests
npm test                    # Ejecutar todos los tests
npm run test:watch         # Tests en modo watch
npm run test:integration   # Solo tests de integración
npm run test:e2e          # Solo tests E2E

# Firebase Emulator
npm run emulator:start    # Iniciar emulador
npm run emulator:export   # Exportar datos del emulator
npm run emulator:import   # Importar datos al emulator

# Utilidades
npm run lint              # Linter
npm run build             # Build del proyecto
npm run type-check        # Verificar tipos TypeScript
```

---

## 🔥 Primer Test Manual

Después de instalar, prueba esto:

```bash
# 1. Iniciar emulator
npm run emulator:start

# 2. En otra terminal, ejecutar un test específico
npm test -- -t "debe crear un ingreso REAL"
```

Deberías ver:
```
✓ tests/integration/firebase-real.test.ts (1)
  ✓ 🔥 Firebase Real Integration Tests (1)
    ✓ ✅ CRUD Operations - Ingresos (1)
      ✓ debe crear un ingreso REAL en Firestore

Test Files  1 passed (1)
     Tests  1 passed (1)
```

---

## 🤖 Workflows Automáticos

### Workflow 1: Sistema Autónomo Maestro
- **Archivo**: `.github/workflows/autonomous-master-system.yml`
- **Trigger**: Push, PR, Manual, Schedule
- **Función**: Tests con auto-corrección (5 intentos)
- **Output**: PR si éxito, Issue si falla

### Workflow 2: E2E Data Validation
- **Archivo**: `.github/workflows/e2e-data-validation.yml`
- **Trigger**: Push, PR, Manual, Schedule diario
- **Función**: Validación completa Excel → Firestore → UI
- **Output**: Reporte detallado + comentario en PR

---

## 📊 Estructura de Tests

```
tests/
├── helpers/
│   └── firebase-test-helper.ts      # Helpers para Firebase Emulator
├── integration/
│   └── firebase-real.test.ts        # Tests REALES con Firestore
└── e2e/
    └── excel-to-ui.test.ts         # Tests E2E completos
```

### Tests de Integración (tests/integration/)
✅ CRUD Operations completas
✅ Múltiples bancos simultáneos
✅ Queries y ordenamiento
✅ Operaciones RF Actual
✅ Manejo de errores
✅ Tests de performance

### Tests E2E (tests/e2e/)
✅ Flujo Excel → Firestore → UI
✅ Cálculo de KPIs
✅ Validación de tablas
✅ Consistencia de datos
✅ Resúmenes y agregaciones

---

## 🔧 Solución de Problemas Comunes

### Problema: "Emulator no inicia"

```bash
# Detener procesos previos
pkill -f firebase

# Limpiar puerto 8080
sudo lsof -ti:8080 | xargs sudo kill -9  # Linux/Mac
netstat -ano | findstr :8080            # Windows

# Reiniciar
npm run emulator:start
```

### Problema: "Tests timeout"

Aumenta el timeout en `vitest.config.ts`:
```typescript
test: {
  testTimeout: 60000,  // 60 segundos
}
```

### Problema: "Firebase CLI no encontrado"

```bash
# Reinstalar globalmente
npm uninstall -g firebase-tools
npm install -g firebase-tools
firebase --version
```

---

## 📚 Documentación Adicional

- 📖 **Documentación Completa**: [docs/AUTONOMOUS_SYSTEM.md](./AUTONOMOUS_SYSTEM.md)
- 🔧 **Configuración Avanzada**: Ver sección de workflows
- 🐛 **Troubleshooting Detallado**: Ver sección en documentación completa
- ❓ **FAQ**: Ver sección de preguntas frecuentes

---

## 🎓 Tutorial Paso a Paso

### Crear tu Primer Test Real

1. **Crear archivo de test**
```typescript
// tests/integration/mi-test.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { initializeTestFirebase, getTestDb } from '../helpers/firebase-test-helper';
import { collection, addDoc } from 'firebase/firestore';

describe('Mi Primer Test Real', () => {
  let db;

  beforeAll(() => {
    const { db: testDb } = initializeTestFirebase();
    db = testDb;
  });

  it('debe crear un documento', async () => {
    const docRef = await addDoc(collection(db, 'test'), {
      nombre: 'Test',
      valor: 100
    });
    expect(docRef.id).toBeDefined();
  });
});
```

2. **Ejecutar el test**
```bash
# Iniciar emulator
npm run emulator:start

# Ejecutar test
npm test -- tests/integration/mi-test.test.ts
```

3. **Verificar resultado**
✅ Test pasa: El documento se creó en el emulator
❌ Test falla: Revisar logs de error

---

## 🚦 Indicadores de Estado

### ✅ Sistema Funcionando Correctamente
- Emulator inicia en puerto 8080
- Tests pasan sin errores
- Firebase CLI responde a comandos
- Workflows se ejecutan en GitHub

### ⚠️ Requiere Atención
- Tests lentos (>30 segundos)
- Warnings del emulator
- Algunos tests fallan esporádicamente

### ❌ Sistema con Problemas
- Emulator no inicia
- Todos los tests fallan
- Firebase CLI no encontrado
- Workflows fallan en GitHub

---

## 📞 Soporte

Si tienes problemas:

1. **Revisar logs**: `firebase-debug.log`, `firestore-debug.log`
2. **Consultar documentación**: [docs/AUTONOMOUS_SYSTEM.md](./AUTONOMOUS_SYSTEM.md)
3. **Verificar prerrequisitos**: Node.js 18+, NPM 9+
4. **Ejecutar validación**: `.\scripts\validate-complete-system.ps1`
5. **Crear issue**: Con logs y detalles del error

---

## 🎯 Siguiente Paso

Una vez que todo funciona localmente:

1. ✅ Commit y push tus cambios
2. ✅ El workflow se ejecuta automáticamente
3. ✅ Revisa los resultados en GitHub Actions
4. ✅ Si pasa: Se crea PR automático
5. ✅ Si falla: Se crea Issue con detalles

**¡Listo para producción!** 🚀

---

*Última actualización: 2025-11-18*
