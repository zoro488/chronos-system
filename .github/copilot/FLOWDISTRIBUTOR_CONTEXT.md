# FlowDistributor 3.0 - Contexto para GitHub Copilot

## 🎯 Propósito del Sistema

FlowDistributor es un **sistema de administración empresarial** que replica y optimiza la lógica de un Excel de Administración General. Convierte procesos manuales en un sistema web profesional con cálculos automáticos, validaciones y una interfaz moderna.

---

## 📊 Datos del Sistema (Importados desde Excel)

### Fuente de Datos
- **Excel Original**: `Administación_General.xlsx`
- **Parser**: `scripts/excel_to_flowdistributor.py`
- **JSON Generado**: `public/excel_data.json` (233 KB)

### Datos Procesados
```javascript
{
  ventas: 80,              // Ventas desde 08/2025 a 10/2025
  clientes: 29,            // Con adeudos y abonos
  ordenesCompra: 9,        // De 6 distribuidores
  distribuidores: 6,       // Q-MAYA, PACMAN, A/X, etc.
  almacen: {
    entradas: 9,
    salidas: 80
  },
  bancos: {                // 6 cuentas con movimientos
    bovedaMonte: { ingresos: 51, gastos: 20 },
    utilidades: { ingresos: 37, gastos: 11 },
    fletes: { ingresos: 46, gastos: 83 },
    azteca: { ingresos: 6 },
    leftie: { ingresos: 7 },
    profit: { ingresos: 37 }
  }
}
```

---

## 🏗️ Arquitectura del Sistema

### Componente Principal
**Archivo**: `src/apps/FlowDistributor/FlowDistributor.jsx` (8000+ líneas)

### Estructura de Estados
```javascript
// Estados principales del sistema
const [ventas, setVentas] = useState([]);
const [clientes, setClientes] = useState([]);
const [ordenesCompra, setOrdenesCompra] = useState([]);
const [distribuidores, setDistribuidores] = useState([]);
const [almacen, setAlmacen] = useState({ stock: [], entradas: [], salidas: [] });
const [bancos, setBancos] = useState({
  bovedaMonte: {},
  utilidades: {},
  fletes: {},
  azteca: {},
  leftie: {},
  profit: {}
});
```

### Tecnologías Utilizadas
- **React 18** con Hooks (useState, useMemo, useCallback, useEffect)
- **Framer Motion** para animaciones
- **Recharts** para gráficas
- **Lucide React** para iconos
- **Tailwind CSS** para estilos
- **Vite** como bundler

---

## 🔄 Flujo de Negocio (Importante para Sugerencias)

### 1. Compra a Distribuidor
```javascript
// Crear Orden de Compra → Entrada a Almacén → Gasto en Banco
const flujoCompra = {
  entrada: 'Orden de Compra (OC)',
  proceso: [
    'Registrar OC con distribuidor, cantidad, costos',
    'Generar entrada automática en almacén',
    'Actualizar stock: stock += cantidad',
    'Registrar gasto en banco (pago a distribuidor)'
  ],
  salida: 'Stock disponible para ventas'
};
```

### 2. Venta a Cliente
```javascript
// Venta → Salida de Almacén → Cliente → Bancos
const flujoVenta = {
  entrada: 'Venta con productos',
  proceso: [
    'Calcular fletes: $500 × cantidad (si aplica)',
    'Calcular utilidades: ingreso - costo - fletes',
    'Restar stock: stock -= cantidad',
    'Crear/Actualizar cliente con adeudo',
    'Distribuir dinero a bancos (Bóveda, Fletes, Utilidades)',
    'Si pendiente: registrar adeudo'
  ],
  salida: 'Movimientos bancarios + Cliente actualizado'
};
```

### 3. Pago de Cliente
```javascript
// Abono → Banco → Cliente
const flujoPago = {
  entrada: 'Abono del cliente',
  proceso: [
    'Registrar ingreso en banco',
    'Reducir adeudo del cliente',
    'Actualizar estado de ventas pendientes'
  ],
  salida: 'Cliente con menos deuda'
};
```

---

## 💡 Cálculos Automáticos (Para Sugerencias de Código)

### Fórmulas del Excel Convertidas a JavaScript

#### 1. Costo Bóveda Monte
```javascript
// Excel: =PRODUCT(SUMIF(OC[OC],B4,OC[Costo Por Unidad]),C4)
const costoBoveda = ordenesCompra
  .filter(oc => oc.id === venta.ocRelacionada)
  .reduce((sum, oc) => sum + (oc.costoPorUnidad * venta.cantidad), 0);
```

#### 2. Fletes
```javascript
// Excel: =IF(H4="Aplica", C4 * 500, 0)
const fletes = fleteAplica === 'Aplica' ? cantidad * 500 : 0;
```

#### 3. Utilidades
```javascript
// Excel: =C4 * F4 - E4 - I4
const utilidades = (cantidad * precioVenta) - costoBoveda - fletes;
```

#### 4. Adeudo de Cliente
```javascript
// Excel: =SUMIFS(V_Monte[Ingreso],V_Monte[Cliente],E4,V_Monte[Estatus],"Pendiente")
const adeudoCliente = useMemo(() =>
  ventas
    .filter(v => v.cliente === nombreCliente && v.estadoPago !== 'completo')
    .reduce((sum, v) => sum + (v.adeudo || 0), 0)
, [ventas, nombreCliente]);
```

#### 5. Stock Actual
```javascript
// Excel: =A2-G2 (Ingresos - Salidas)
const stockActual = useMemo(() => {
  const entradas = almacen.entradas.reduce((s, e) => s + (e.cantidad || 0), 0);
  const salidas = almacen.salidas.reduce((s, e) => s + (e.cantidad || 0), 0);
  return entradas - salidas;
}, [almacen]);
```

#### 6. Capital Bancario
```javascript
// Excel: =A2-G2 (Ingresos - Gastos)
const capitalActual = useMemo(() => {
  const ingresos = banco.ingresos.reduce((s, i) => s + (i.cantidad || 0), 0);
  const gastos = banco.gastos.reduce((s, g) => s + (g.cantidad || 0), 0);
  return ingresos - gastos;
}, [banco]);
```

---

## 🎨 Patrones de Código (Para Mejores Sugerencias)

### Patrón: Función de Eliminación con Cascade
```javascript
/**
 * Elimina una venta y revierte todos los efectos en cascada
 * @param {string} ventaId - ID de la venta a eliminar
 * @returns {void}
 */
const deleteVenta = useCallback((ventaId) => {
  const venta = ventas.find(v => v.id === ventaId);
  if (!venta) {
    showNotification('Venta no encontrada', 'error');
    return;
  }

  // 1. Revertir salidas de almacén
  const nuevasSalidas = almacen.salidas.filter(s => s.ventaId !== ventaId);
  const salidasEliminadas = almacen.salidas.filter(s => s.ventaId === ventaId);

  // 2. Devolver productos al stock
  let nuevoStock = [...almacen.stock];
  salidasEliminadas.forEach(salida => {
    const idx = nuevoStock.findIndex(p => p.id === salida.productoId);
    if (idx !== -1) {
      nuevoStock[idx].cantidad += salida.cantidad;
    }
  });

  // 3. Actualizar adeudo del cliente
  const nuevosClientes = clientes.map(c => {
    if (c.nombre === venta.cliente) {
      return {
        ...c,
        adeudo: Math.max(0, c.adeudo - venta.adeudo),
        ventas: c.ventas.filter(v => v.id !== ventaId)
      };
    }
    return c;
  });

  // 4. Revertir movimientos bancarios si estaba pagado
  if (venta.estadoPago === 'completo') {
    // Revertir ingresos en bancos
  }

  // 5. Actualizar estados
  setVentas(ventas.filter(v => v.id !== ventaId));
  setAlmacen({ ...almacen, stock: nuevoStock, salidas: nuevasSalidas });
  setClientes(nuevosClientes);

  showNotification('Venta eliminada correctamente', 'success');
}, [ventas, almacen, clientes, bancos]);
```

### Patrón: Validación Defensiva
```javascript
// SIEMPRE usar optional chaining y valores por defecto
const total = (ventas || []).reduce((sum, v) => sum + (v.totalVenta || 0), 0);

// SIEMPRE validar antes de acceder a propiedades
const capital = bancos?.bovedaMonte?.capitalActual || 0;

// SIEMPRE usar Math.max para evitar negativos en cantidades
const adeudo = Math.max(0, totalComprado - totalPagado);
```

### Patrón: Cálculos con useMemo
```javascript
// Para cálculos que dependen de arrays grandes
const totalVentas = useMemo(() =>
  (ventas || []).reduce((sum, v) => sum + (v.totalVenta || 0), 0)
, [ventas]);

// Siempre incluir dependencias correctas
const clientesConAdeudo = useMemo(() =>
  (clientes || []).filter(c => (c.adeudo || 0) > 0)
, [clientes]);
```

---

## 🔑 Funciones Clave del Sistema

### Ubicación: `src/apps/FlowDistributor/FlowDistributor.jsx`

| Función | Línea | Propósito |
|---------|-------|-----------|
| `importFromExcel()` | 1666 | Importa datos desde JSON generado del Excel |
| `deleteVenta()` | 554 | Elimina venta con cascade updates |
| `deleteOrdenCompra()` | 646 | Elimina OC y actualiza todo |
| `registrarVenta()` | ~1800 | Crea venta nueva con cálculos |
| `clearAllData()` | 1726 | Reset completo del sistema |
| `createBackup()` | 1592 | Exporta datos a JSON |
| `restoreBackup()` | 1616 | Importa respaldo JSON |

---

## 🎯 Áreas Donde Copilot Puede Ayudar

### 1. Creación de Nuevas Ventas
```javascript
// Prompt sugerido:
// "Crear función para registrar venta que calcule automáticamente
//  fletes ($500/unidad), utilidades (ingreso-costo-flete),
//  actualice stock y distribuya a bancos"
```

### 2. Reportes y Análisis
```javascript
// Prompt sugerido:
// "Crear función que genere reporte de ventas por cliente
//  incluyendo total vendido, adeudo pendiente, y porcentaje de cobro"
```

### 3. Validaciones
```javascript
// Prompt sugerido:
// "Agregar validación que verifique stock disponible antes de vender
//  y muestre mensaje de error si no hay suficiente inventario"
```

### 4. Filtros Avanzados
```javascript
// Prompt sugerido:
// "Crear filtro que muestre ventas por rango de fechas
//  y calcule totales del período seleccionado"
```

---

## 📁 Estructura de Datos (Para Autocompletado)

### Venta
```typescript
interface Venta {
  id: string;                    // 'VENTA-2025-08-23-Cliente-4'
  fecha: string;                 // 'YYYY-MM-DD'
  ocRelacionada: string;         // 'OC0001'
  cliente: string;               // Nombre del cliente
  cantidad: number;              // Unidades vendidas
  precioVenta: number;           // Precio unitario
  totalVenta: number;            // cantidad × precioVenta
  costoBoveda: number;           // Calculado desde OC
  fletes: number;                // $500 × cantidad si aplica
  utilidades: number;            // totalVenta - costoBoveda - fletes
  estadoPago: 'completo' | 'pendiente';
  adeudo: number;                // 0 si completo, totalVenta si pendiente
  concepto: string;
  productos: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
}
```

### Cliente
```typescript
interface Cliente {
  id: string;                    // 'CLI-NombreCliente'
  nombre: string;
  adeudo: number;                // Total pendiente de pago
  totalComprado: number;         // Histórico de compras
  totalAbonado: number;          // Histórico de pagos
  estado: string;                // 'activo' | 'pendiente'
  observaciones: string;
  ventas: string[];              // IDs de ventas
}
```

### Orden de Compra
```typescript
interface OrdenCompra {
  id: string;                    // 'OC0001'
  fecha: string;
  distribuidor: string;
  cantidad: number;
  costoDistribuidor: number;
  costoTransporte: number;
  costoPorUnidad: number;        // costoDist + costoTrans
  costoTotal: number;            // costoPorUnidad × cantidad
  pagado: number;
  adeudo: number;                // costoTotal - pagado
  productos: Array<{
    nombre: string;
    cantidad: number;
    costo: number;
  }>;
}
```

### Banco
```typescript
interface Banco {
  capitalActual: number;         // Calculado: ingresos - gastos
  historico: number;             // Capital histórico
  registros: Array<Movimiento>;  // Todos los movimientos
  ingresos: Array<Movimiento>;
  gastos: Array<Movimiento>;
  transferencias: Array<Transferencia>;
}

interface Movimiento {
  id: string;                    // 'ING-banco-fecha-random'
  fecha: string;
  cliente: string;
  cantidad: number;
  concepto: string;
  tipo: 'ingreso' | 'gasto';
  tc?: number;                   // Tipo de cambio (opcional)
  pesos?: number;                // Equivalente en pesos (opcional)
}
```

---

## 🚀 Comandos Útiles

```bash
# Convertir Excel a JSON
python scripts/excel_to_flowdistributor.py

# O usar el script automático
IMPORTAR-EXCEL.bat

# Iniciar desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview

# Linter
npm run lint
```

---

## 📚 Documentación Disponible

| Archivo | Propósito |
|---------|-----------|
| `LEEME-AHORA.txt` | Inicio rápido visual |
| `INICIO-RAPIDO.md` | Guía de 5 minutos |
| `README_FLOWDISTRIBUTOR_EXCEL.md` | Manual completo |
| `GUIA_IMPORTACION_EXCEL.md` | Importación detallada |
| `ANALISIS_EXCEL_Y_ADAPTACION.md` | Análisis técnico |
| `RESUMEN_IMPLEMENTACION_COMPLETA.md` | Resumen ejecutivo |
| `INDICE-COMPLETO.md` | Índice maestro |

---

## 💡 Tips para Trabajar con Copilot en este Proyecto

### 1. Usa Comentarios Descriptivos
```javascript
// Calcular el total de ventas pendientes de todos los clientes
// considerando solo las ventas con estadoPago !== 'completo'
const ventasPendientes = useMemo(() => { ... });
```

### 2. Especifica Tipos en JSDoc
```javascript
/**
 * Registra una nueva venta en el sistema
 * @param {Object} ventaData - Datos de la venta
 * @param {string} ventaData.cliente - Nombre del cliente
 * @param {number} ventaData.cantidad - Cantidad de productos
 * @param {number} ventaData.precioVenta - Precio unitario
 * @param {boolean} ventaData.fleteAplica - Si aplica cargo por flete
 * @returns {Promise<void>}
 */
```

### 3. Usa Nombres Descriptivos
```javascript
// ✅ BIEN
const calcularUtilidadNeta = (ingreso, costo, flete) => ingreso - costo - flete;

// ❌ EVITAR
const calc = (i, c, f) => i - c - f;
```

### 4. Divide Funciones Grandes
```javascript
// Si una función hace múltiples cosas, divídela
const procesarVenta = (venta) => {
  const fletes = calcularFletes(venta);
  const utilidades = calcularUtilidades(venta, fletes);
  const adeudo = calcularAdeudo(venta);

  return { ...venta, fletes, utilidades, adeudo };
};
```

---

## 🎯 Próximas Mejoras Sugeridas (Para Copilot)

1. **Edición Inline**: Permitir editar registros sin eliminar
2. **Filtros por Fecha**: Agregar selectores de rango de fechas
3. **Exportación PDF**: Generar reportes en PDF
4. **Gráficas Avanzadas**: Más visualizaciones con Chart.js
5. **Búsqueda Avanzada**: Múltiples criterios simultáneos
6. **Notificaciones**: Alertas de stock bajo, pagos vencidos
7. **Multi-usuario**: Sincronización con base de datos
8. **Roles**: Admin, Vendedor, Contador con permisos

---

**Versión**: FlowDistributor 3.0.0
**Estado**: Producción - 100% Funcional
**Última Actualización**: 2025-10-20
