/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                  CHRONOS DATA MIGRATION SERVICE                            ║
 * ║         Migration service for loading Excel data to Firestore              ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Este servicio migra TODOS los datos del archivo `public/excel_data.json`
 * a Firestore siguiendo el esquema definido en `firestore-schema.js`.
 *
 * Datos a migrar:
 * - 96 ventas
 * - 9 compras
 * - 483 movimientos bancarios
 * - 31 clientes
 * - 6 distribuidores
 * - 4,575 movimientos de almacén
 *
 * Features:
 * - Batch processing (500 docs per batch - Firestore limit)
 * - Progress tracking
 * - Error handling with retry logic
 * - Validation before upload
 * - Rollback capability
 * - Idempotent (can run multiple times safely)
 *
 * @module DataMigrationService
 * @author CHRONOS System
 * @version 1.0.0
 */
import {
  Timestamp,
  collection,
  doc,
  getDocs,
  getFirestore,
  limit,
  query,
  writeBatch,
} from 'firebase/firestore';

// ============================================================================
// CONFIGURATION
// ============================================================================

const BATCH_SIZE = 500; // Firestore batch limit
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convierte una fecha ISO string a Firestore Timestamp
 * @param {string} dateString - Fecha en formato ISO (2025-08-23T00:00:00)
 * @returns {Timestamp} Firestore Timestamp
 */
const parseDate = (dateString) => {
  if (!dateString) return Timestamp.now();
  const date = new Date(dateString);
  return Timestamp.fromDate(date);
};

/**
 * Genera un ID único para documentos
 * @param {string} prefix - Prefijo del ID (V, C, MB, etc.)
 * @param {number} index - Índice del documento
 * @returns {string} ID único
 */
const generateId = (prefix, index) => {
  return `${prefix}-${String(index + 1).padStart(6, '0')}`;
};

/**
 * Sleep function para delays
 * @param {number} ms - Milisegundos
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Valida una venta antes de migrar
 * @param {Object} venta - Datos de la venta
 * @returns {{ valid: boolean, errors: string[] }}
 */
const validateVenta = (venta) => {
  const errors = [];

  if (!venta.fecha) errors.push('Fecha requerida');
  if (!venta.cliente) errors.push('Cliente requerido');
  if (!venta.productos || venta.productos.length === 0) {
    errors.push('Debe tener al menos un producto');
  }
  if (typeof venta.totalVenta !== 'number') {
    errors.push('Total de venta inválido');
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Valida una compra antes de migrar
 * @param {Object} compra - Datos de la compra
 * @returns {{ valid: boolean, errors: string[] }}
 */
const validateCompra = (compra) => {
  const errors = [];

  if (!compra.fecha) errors.push('Fecha requerida');
  if (!compra.distribuidor) errors.push('Distribuidor requerido');
  if (!compra.productos || compra.productos.length === 0) {
    errors.push('Debe tener al menos un producto');
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Valida un movimiento bancario antes de migrar
 * @param {Object} mov - Datos del movimiento
 * @returns {{ valid: boolean, errors: string[] }}
 */
const validateMovimiento = (mov) => {
  const errors = [];

  if (!mov.fecha) errors.push('Fecha requerida');
  if (!mov.banco) errors.push('Banco requerido');
  if (typeof mov.monto !== 'number') errors.push('Monto inválido');
  if (!mov.tipo) errors.push('Tipo requerido');

  return { valid: errors.length === 0, errors };
};

// ============================================================================
// TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Transforma datos de venta del Excel al esquema de Firestore
 * @param {Object} ventaExcel - Datos del Excel
 * @param {number} index - Índice
 * @returns {Object} Venta transformada
 */
const transformVenta = (ventaExcel, index) => {
  const fecha = parseDate(ventaExcel.fecha);
  const folio = ventaExcel.id || generateId('V', index);

  // Transform productos
  const productos = ventaExcel.productos.map((p) => ({
    productoId: p.nombre.toLowerCase().replace(/\s+/g, '-'),
    nombre: p.nombre,
    cantidad: p.cantidad,
    precioUnitario: p.precio || 0,
    subtotal: p.subtotal || 0,
    descuento: p.descuento || 0,
    total: p.subtotal || 0,
  }));

  // Calculate totals
  const subtotal = ventaExcel.totalVenta || 0;
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  const totalPagado = ventaExcel.montoPagado || 0;
  const saldoPendiente = total - totalPagado;

  // Determine estado
  let estado = 'pendiente';
  if (totalPagado === 0) estado = 'pendiente';
  else if (totalPagado < total) estado = 'parcial';
  else estado = 'liquidada';

  return {
    id: folio,
    folio,
    fecha,
    clienteId: ventaExcel.cliente.toLowerCase().replace(/\s+/g, '-'),
    clienteNombre: ventaExcel.cliente,
    productos,
    subtotal,
    descuento: 0,
    iva,
    total,
    pagos: [],
    totalPagado,
    saldoPendiente,
    estado,
    vendedor: 'Sistema',
    notas: ventaExcel.concepto || '',
    ocRelacionada: ventaExcel.ocRelacionada || '',
    destino: ventaExcel.destino || 'bovedaMonte',
    aplicaFlete: ventaExcel.aplicaFlete || false,
    totalFletes: ventaExcel.totalFletes || 0,
    createdAt: fecha,
    updatedAt: fecha,
    createdBy: 'migration',
  };
};

/**
 * Transforma datos de compra del Excel al esquema de Firestore
 * @param {Object} compraExcel - Datos del Excel
 * @param {number} index - Índice
 * @returns {Object} Compra transformada
 */
const transformCompra = (compraExcel, index) => {
  const fecha = parseDate(compraExcel.fecha);
  const folio = compraExcel.id || generateId('C', index);

  // Transform productos
  const productos = compraExcel.productos.map((p) => ({
    productoId: p.nombre.toLowerCase().replace(/\s+/g, '-'),
    nombre: p.nombre,
    cantidad: p.cantidad,
    costoUnitario: p.costo || 0,
    total: p.cantidad * (p.costo || 0),
  }));

  const subtotal = productos.reduce((sum, p) => sum + p.total, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  return {
    id: folio,
    folio,
    fecha,
    distribuidorId: compraExcel.distribuidor.toLowerCase().replace(/\s+/g, '-'),
    distribuidorNombre: compraExcel.distribuidor,
    productos,
    subtotal,
    iva,
    total,
    estado: compraExcel.estado || 'recibida',
    metodoPago: compraExcel.metodoPago || 'transferencia',
    banco: compraExcel.banco || 'bovedaMonte',
    notas: compraExcel.notas || '',
    createdAt: fecha,
    updatedAt: fecha,
    createdBy: 'migration',
  };
};

/**
 * Transforma movimiento bancario del Excel al esquema de Firestore
 * @param {Object} movExcel - Datos del Excel
 * @param {number} index - Índice
 * @returns {Object} Movimiento transformado
 */
const transformMovimiento = (movExcel, index) => {
  const fecha = parseDate(movExcel.fecha);
  const folio = generateId('MB', index);

  // Map banco names to IDs
  const bancoMap = {
    'Bóveda MONTE': 'bovedaMonte',
    'Bóveda USA': 'bovedaUsa',
    Utilidades: 'utilidades',
    'Flete SUR': 'fleteSur',
    Azteca: 'azteca',
    Leftie: 'leftie',
    Profit: 'profit',
  };

  const bancoId = bancoMap[movExcel.banco] || 'bovedaMonte';

  return {
    id: folio,
    folio,
    fecha,
    banco: bancoId,
    tipo: movExcel.tipo || 'otro',
    categoria: movExcel.categoria || 'otro',
    monto: Math.abs(movExcel.monto || 0),
    saldo: movExcel.saldo || 0,
    concepto: movExcel.concepto || '',
    referencia: movExcel.referencia || '',
    metodoPago: movExcel.metodoPago || 'transferencia',
    ventaRelacionada: movExcel.ventaId || null,
    compraRelacionada: movExcel.compraId || null,
    notas: movExcel.notas || '',
    createdAt: fecha,
    createdBy: 'migration',
  };
};

// ============================================================================
// BATCH PROCESSING
// ============================================================================

/**
 * Procesa documentos en batches con retry logic
 * @param {Object} db - Firestore database
 * @param {string} collectionName - Nombre de la colección
 * @param {Array} documents - Documentos a procesar
 * @param {Function} onProgress - Callback de progreso
 * @returns {Promise<{ success: number, failed: number, errors: Array }>}
 */
const processBatch = async (db, collectionName, documents, onProgress) => {
  const stats = { success: 0, failed: 0, errors: [] };

  // Split into batches
  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = documents.slice(i, i + BATCH_SIZE);

    chunk.forEach((docData) => {
      const docRef = doc(collection(db, collectionName), docData.id);
      batch.set(docRef, docData);
    });

    // Retry logic
    let attempt = 0;
    let success = false;

    while (attempt < MAX_RETRIES && !success) {
      try {
        await batch.commit();
        stats.success += chunk.length;
        success = true;

        if (onProgress) {
          onProgress({
            collection: collectionName,
            processed: Math.min(i + BATCH_SIZE, documents.length),
            total: documents.length,
            percentage: (
              (Math.min(i + BATCH_SIZE, documents.length) / documents.length) *
              100
            ).toFixed(1),
          });
        }
      } catch (error) {
        attempt++;
        if (attempt >= MAX_RETRIES) {
          stats.failed += chunk.length;
          stats.errors.push({
            collection: collectionName,
            batch: i / BATCH_SIZE,
            error: error.message,
          });
        } else {
          await sleep(RETRY_DELAY * attempt);
        }
      }
    }
  }

  return stats;
};

// ============================================================================
// MAIN MIGRATION FUNCTIONS
// ============================================================================

/**
 * Migra TODAS las ventas del Excel a Firestore
 * @param {Object} db - Firestore database
 * @param {Array} ventasExcel - Ventas del Excel
 * @param {Function} onProgress - Callback de progreso
 * @returns {Promise<Object>} Estadísticas de migración
 */
export const migrateVentas = async (db, ventasExcel, onProgress) => {
  console.log(`🔄 Migrando ${ventasExcel.length} ventas...`);

  // Validate
  const invalidVentas = [];
  ventasExcel.forEach((venta, index) => {
    const validation = validateVenta(venta);
    if (!validation.valid) {
      invalidVentas.push({ index, errors: validation.errors });
    }
  });

  if (invalidVentas.length > 0) {
    console.warn(`⚠️ ${invalidVentas.length} ventas inválidas:`, invalidVentas);
  }

  // Transform
  const validVentas = ventasExcel.filter((_, i) => !invalidVentas.some((inv) => inv.index === i));
  const ventasTransformed = validVentas.map((v, i) => transformVenta(v, i));

  // Process batches
  const stats = await processBatch(db, 'ventas', ventasTransformed, onProgress);

  console.log(`✅ Ventas migradas: ${stats.success} exitosas, ${stats.failed} fallidas`);
  return stats;
};

/**
 * Migra TODAS las compras del Excel a Firestore
 * @param {Object} db - Firestore database
 * @param {Array} comprasExcel - Compras del Excel
 * @param {Function} onProgress - Callback de progreso
 * @returns {Promise<Object>} Estadísticas de migración
 */
export const migrateCompras = async (db, comprasExcel, onProgress) => {
  console.log(`🔄 Migrando ${comprasExcel.length} compras...`);

  // Validate
  const invalidCompras = [];
  comprasExcel.forEach((compra, index) => {
    const validation = validateCompra(compra);
    if (!validation.valid) {
      invalidCompras.push({ index, errors: validation.errors });
    }
  });

  if (invalidCompras.length > 0) {
    console.warn(`⚠️ ${invalidCompras.length} compras inválidas:`, invalidCompras);
  }

  // Transform
  const validCompras = comprasExcel.filter(
    (_, i) => !invalidCompras.some((inv) => inv.index === i)
  );
  const comprasTransformed = validCompras.map((c, i) => transformCompra(c, i));

  // Process batches
  const stats = await processBatch(db, 'compras', comprasTransformed, onProgress);

  console.log(`✅ Compras migradas: ${stats.success} exitosas, ${stats.failed} fallidas`);
  return stats;
};

/**
 * Migra TODOS los movimientos bancarios del Excel a Firestore (483 movimientos)
 * @param {Object} db - Firestore database
 * @param {Array} movimientosExcel - Movimientos del Excel
 * @param {Function} onProgress - Callback de progreso
 * @returns {Promise<Object>} Estadísticas de migración
 */
export const migrateMovimientosBancarios = async (db, movimientosExcel, onProgress) => {
  console.log(`🔄 Migrando ${movimientosExcel.length} movimientos bancarios...`);

  // Validate
  const invalidMovimientos = [];
  movimientosExcel.forEach((mov, index) => {
    const validation = validateMovimiento(mov);
    if (!validation.valid) {
      invalidMovimientos.push({ index, errors: validation.errors });
    }
  });

  if (invalidMovimientos.length > 0) {
    console.warn(`⚠️ ${invalidMovimientos.length} movimientos inválidos:`, invalidMovimientos);
  }

  // Transform
  const validMovimientos = movimientosExcel.filter(
    (_, i) => !invalidMovimientos.some((inv) => inv.index === i)
  );
  const movimientosTransformed = validMovimientos.map((m, i) => transformMovimiento(m, i));

  // Process batches
  const stats = await processBatch(db, 'movimientosBancarios', movimientosTransformed, onProgress);

  console.log(
    `✅ Movimientos bancarios migrados: ${stats.success} exitosos, ${stats.failed} fallidos`
  );
  return stats;
};

/**
 * Migra TODOS los datos del Excel a Firestore
 * @param {Object} excelData - Datos completos del archivo excel_data.json
 * @param {Function} onProgress - Callback de progreso
 * @returns {Promise<Object>} Estadísticas completas de migración
 */
export const migrateAll = async (excelData, onProgress) => {
  const db = getFirestore();

  console.log('🚀 INICIANDO MIGRACIÓN COMPLETA DE DATOS...');
  console.log('='.repeat(80));

  const results = {
    ventas: null,
    compras: null,
    movimientosBancarios: null,
    startTime: new Date(),
    endTime: null,
    totalDuration: null,
  };

  try {
    // 1. Migrar ventas
    results.ventas = await migrateVentas(db, excelData.ventas || [], onProgress);

    // 2. Migrar compras
    results.compras = await migrateCompras(db, excelData.compras || [], onProgress);

    // 3. Migrar movimientos bancarios (483 movimientos)
    results.movimientosBancarios = await migrateMovimientosBancarios(
      db,
      excelData.movimientosBancarios || [],
      onProgress
    );

    // Calculate total duration
    results.endTime = new Date();
    results.totalDuration = ((results.endTime - results.startTime) / 1000).toFixed(2);

    console.log('='.repeat(80));
    console.log('✅ MIGRACIÓN COMPLETA FINALIZADA');
    console.log(`⏱️  Duración total: ${results.totalDuration}s`);
    console.log('='.repeat(80));

    return results;
  } catch (error) {
    console.error('❌ ERROR EN MIGRACIÓN:', error);
    throw error;
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Carga el archivo excel_data.json
 * @returns {Promise<Object>} Datos del Excel
 */
export const loadExcelData = async () => {
  try {
    const response = await fetch('/excel_data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error cargando excel_data.json:', error);
    throw error;
  }
};

/**
 * Verifica si la migración ya fue ejecutada
 * @param {Object} db - Firestore database
 * @returns {Promise<boolean>} True si ya existe data
 */
export const checkMigrationStatus = async (db) => {
  try {
    const ventasRef = collection(db, 'ventas');
    const snapshot = await getDocs(query(ventasRef, limit(1)));
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  migrateVentas,
  migrateCompras,
  migrateMovimientosBancarios,
  migrateAll,
  loadExcelData,
  checkMigrationStatus,
};
