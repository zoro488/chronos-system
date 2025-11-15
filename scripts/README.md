# 📜 CHRONOS SYSTEM - SCRIPTS

Utilidades y herramientas de automatización para el sistema CHRONOS.

---

## 📋 Scripts Disponibles

### 🔍 `health-check.js`

**Propósito**: Verificación completa de salud del sistema

**Uso**:
```bash
node scripts/health-check.js
node scripts/health-check.js --detailed
```

**Verifica**:
- ✅ Archivos esenciales del proyecto
- ✅ Dependencias npm instaladas
- ✅ Servicios principales (MegaAIAgent, VoiceService, etc.)
- ✅ Componentes UI
- ✅ GitHub Actions workflows
- ✅ Estado del repositorio Git
- ✅ Scripts disponibles

**Salida**:
```
╔════════════════════════════════════════════════════════════════════╗
║                    HEALTH CHECK                                     ║
║                 CHRONOS SYSTEM v2.0                                ║
╚════════════════════════════════════════════════════════════════════╝

═══ ARCHIVOS DEL PROYECTO ═══
✓ Package.json
✓ App.tsx (Entry point)
✓ Firebase Config
✓ CI Workflow
✓ Deploy Workflow

...

SALUD GENERAL DEL SISTEMA: ████████████████████ 95%
✓ Sistema en excelente estado
```

**Exit Codes**:
- `0` - Sistema saludable (≥70%)
- `1` - Sistema requiere atención (<70%)

---

### 🤖 `verify-ai-agent.js`

**Propósito**: Verificación de integración del Mega AI Agent

**Uso**:
```bash
node scripts/verify-ai-agent.js
node scripts/verify-ai-agent.js --verbose
```

**Verifica**:
1. **Variables de Entorno**
   - VITE_ANTHROPIC_API_KEY
   - VITE_OPENAI_API_KEY
   - VITE_DEEPGRAM_API_KEY
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_PROJECT_ID

2. **Archivos de Servicio**
   - services/MegaAIAgent.js
   - services/VoiceService.js
   - services/UserLearningService.js
   - config/firebase.js

3. **Dependencias NPM**
   - @anthropic-ai/sdk
   - openai
   - jspdf
   - xlsx
   - firebase

4. **Integraciones**
   - Anthropic Integration
   - OpenAI Integration
   - PDF Export
   - Excel Export
   - Deepgram Integration
   - Firestore Integration

**Salida**:
```
╔════════════════════════════════════════════════════════════════════╗
║            VERIFICADOR DE MEGA AI AGENT                            ║
║                   CHRONOS SYSTEM v2.0                              ║
╚════════════════════════════════════════════════════════════════════╝

1. VERIFICANDO VARIABLES DE ENTORNO
✓ Anthropic Claude API
✓ OpenAI GPT API
✓ Deepgram Voice API
✓ Firebase API Key
✓ Firebase Project ID

✓ Todas las variables de entorno configuradas (5/5)

...

TOTAL: 14/14 (100%)
✓ Sistema completamente configurado y listo para usar
```

**Guía de Configuración**:
Si faltan configuraciones, el script proporciona una guía completa para:
- Dónde obtener cada API key
- Cómo configurar .env
- Pasos siguientes

**Exit Codes**:
- `0` - Configuración completa (100%)
- `1` - Configuración incompleta

---

### 📊 `importar-excel.js`

**Propósito**: Importación masiva de datos desde Excel a Firestore

**Uso**:
```bash
# Importar todo
node scripts/importar-excel.js

# Importar solo ventas
node scripts/importar-excel.js --collection=ventas

# Importar solo clientes
node scripts/importar-excel.js --collection=clientes

# Importar solo distribuidores/compras
node scripts/importar-excel.js --collection=distribuidores

# Importar solo bancos/movimientos
node scripts/importar-excel.js --collection=bancos

# Usar archivo personalizado
node scripts/importar-excel.js --file=mi-archivo.xlsx
```

**Archivo Excel Esperado**: `Administación_General.xlsx`

**Hojas Esperadas**:
- **Control_Maestro** o **Ventas**: Datos de ventas
  - Columnas: Folio, Fecha, Cliente, Monto, Abonos, Saldo, Estado, Productos, Método Pago, Notas
  
- **Clientes**: Datos de clientes
  - Columnas: Nombre, Teléfono, Email, Dirección, Deuda, Límite Crédito, Estado, Notas
  
- **Distribuidores**: Órdenes de compra
  - Columnas: Folio, Fecha, Proveedor/Distribuidor, Monto, Productos, Estado, Notas
  
- **Bancos** / **Bóveda** / **Almacen**: Movimientos bancarios
  - Columnas: Fecha, Concepto/Descripción, Ingresos/Ingreso, Egresos/Egreso, Saldo, Referencia, Tipo

**Características**:
- ✅ Batch processing (500 documentos por lote)
- ✅ Validación de datos antes de importar
- ✅ Progress tracking en tiempo real
- ✅ Conversión automática de fechas de Excel
- ✅ Limpieza y normalización de datos
- ✅ Manejo de errores robusto
- ✅ Rollback automático en caso de fallo

**Salida**:
```
╔════════════════════════════════════════════════════════════════════╗
║         IMPORTADOR MASIVO EXCEL → FIRESTORE                        ║
║                  CHRONOS SYSTEM v2.0                               ║
╚════════════════════════════════════════════════════════════════════╝

ℹ Leyendo archivo Excel: Administación_General.xlsx
✓ Archivo leído: 8 hojas encontradas

📊 Importando VENTAS...
96 ventas encontradas
✓ 96 ventas importadas exitosamente

👥 Importando CLIENTES...
31 clientes encontrados
✓ 31 clientes importados exitosamente

📦 Importando DISTRIBUIDORES...
9 órdenes de compra encontradas
✓ 9 órdenes de compra importadas

🏦 Importando BANCOS Y MOVIMIENTOS...
Encontradas 7 hojas de bancos
✓ Total: 483 movimientos bancarios importados

╔════════════════════════════════════════════════════════════════════╗
║                      ✓ IMPORTACIÓN COMPLETADA                      ║
╚════════════════════════════════════════════════════════════════════╝

📊 RESUMEN:
  • Ventas importadas: 96
  • Clientes importados: 31
  • Órdenes de compra: 9
  • Movimientos bancarios: 483
  
  TOTAL: 619 documentos
  
✨ Datos importados exitosamente a Firestore
```

**Colecciones de Firestore**:
- `ventas`: Ventas importadas
- `clientes`: Clientes con deudas
- `compras`: Órdenes de compra a distribuidores
- `movimientosBancarios`: Movimientos de todos los bancos
- `bancos`: Información de bancos (si existe en Excel)

**Notas**:
- Los IDs de documentos se generan automáticamente
- Se añade `createdAt: Timestamp.now()` a cada documento
- Las fechas de Excel se convierten a Firestore Timestamp
- Se validan datos mínimos antes de importar

---

## 🔧 Desarrollo de Nuevos Scripts

### Template Básico

```javascript
#!/usr/bin/env node
/**
 * Descripción del script
 */

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

// Utilidades
const logger = {
  info: (msg) => console.log(`\x1b[36mℹ ${msg}\x1b[0m`),
  success: (msg) => console.log(`\x1b[32m✓ ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m✗ ${msg}\x1b[0m`),
  warning: (msg) => console.log(`\x1b[33m⚠ ${msg}\x1b[0m`),
};

// Función principal
async function main() {
  console.log('Script iniciando...');
  
  try {
    // Tu lógica aquí
    logger.success('Script completado');
    process.exit(0);
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
```

### Buenas Prácticas

1. **Usa ES Modules** (`import/export` en lugar de `require`)
2. **Agrega shebang** (`#!/usr/bin/env node`)
3. **Maneja errores** con try/catch
4. **Exit codes apropiados** (0 = éxito, 1 = error)
5. **Coloriza output** para mejor UX
6. **Documenta** con JSDoc y comentarios
7. **Valida inputs** antes de procesar
8. **Progress tracking** para operaciones largas

---

## 📚 Recursos

### Firebase
- Batch Writes: https://firebase.google.com/docs/firestore/manage-data/transactions
- Limits: 500 writes per batch

### Node.js
- ESM Modules: https://nodejs.org/api/esm.html
- File System: https://nodejs.org/api/fs.html
- Path: https://nodejs.org/api/path.html

### XLSX
- Docs: https://docs.sheetjs.com/
- Reading Files: https://docs.sheetjs.com/docs/api/parse-options

---

## 🤝 Contribuir

Para agregar un nuevo script:

1. Crear archivo en `scripts/`
2. Agregar entrada en `package.json` scripts
3. Documentar en este README
4. Agregar tests si aplica
5. Crear PR con descripción

---

**Última actualización**: November 2025  
**Versión**: 1.0.0
