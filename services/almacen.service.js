/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                        ALMACÉN SERVICE                                     ║
 * ║           Servicio completo para gestión de almacén                        ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import {
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    query,
    runTransaction,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';

import { db } from '../config/firebase';

const MOVIMIENTOS_COLLECTION = 'movimientosAlmacen';
const STOCK_COLLECTION = 'stock';

// ============================================================================
// CONSULTAS (READ)
// ============================================================================

/**
 * Obtener todos los movimientos de almacén con filtros
 */
export const getMovimientosAlmacen = async (filters = {}) => {
  try {
    let q = collection(db, MOVIMIENTOS_COLLECTION);
    const constraints = [];

    if (filters.tipo) {
      constraints.push(where('tipo', '==', filters.tipo));
    }

    if (filters.motivo) {
      constraints.push(where('motivo', '==', filters.motivo));
    }

    if (filters.productoId) {
      constraints.push(where('productoId', '==', filters.productoId));
    }

    if (filters.fechaInicio) {
      constraints.push(where('fecha', '>=', new Date(filters.fechaInicio)));
    }

    if (filters.fechaFin) {
      constraints.push(where('fecha', '<=', new Date(filters.fechaFin)));
    }

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate?.() || doc.data().fecha,
    }));
  } catch (error) {
    console.error('Error al obtener movimientos de almacén:', error);
    throw error;
  }
};

/**
 * Obtener stock actual de todos los productos
 */
export const getStock = async (filters = {}) => {
  try {
    let q = collection(db, STOCK_COLLECTION);
    const constraints = [];

    if (filters.productoId) {
      constraints.push(where('productoId', '==', filters.productoId));
    }

    if (filters.agotado) {
      constraints.push(where('cantidad', '<=', 0));
    }

    if (filters.bajoStock) {
      constraints.push(where('cantidad', '<=', where('stockMinimo', '>=', 0)));
    }

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const snapshot = await getDocs(q);
    let stock = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filtros del lado del cliente
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      stock = stock.filter(
        (s) =>
          s.productoNombre?.toLowerCase().includes(searchLower) ||
          s.productoSKU?.toLowerCase().includes(searchLower)
      );
    }

    return stock;
  } catch (error) {
    console.error('Error al obtener stock:', error);
    throw error;
  }
};

/**
 * Obtener stock de un producto específico
 */
export const getStockProducto = async (productoId) => {
  try {
    const q = query(
      collection(db, STOCK_COLLECTION),
      where('productoId', '==', productoId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        productoId,
        cantidad: 0,
        stockMinimo: 0,
        stockMaximo: 0,
      };
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error('Error al obtener stock del producto:', error);
    throw error;
  }
};

/**
 * Obtener resumen de almacén
 */
export const getResumenAlmacen = async () => {
  try {
    const stock = await getStock();
    const movimientos = await getMovimientosAlmacen();

    const totalProductos = stock.length;
    const totalCantidad = stock.reduce((sum, s) => sum + (s.cantidad || 0), 0);
    const valorTotal = stock.reduce((sum, s) => sum + (s.cantidad || 0) * (s.precioPromedio || 0), 0);

    const productosAgotados = stock.filter((s) => s.cantidad <= 0).length;
    const productosBajoStock = stock.filter((s) => s.cantidad <= s.stockMinimo && s.cantidad > 0).length;

    // Movimientos del mes actual
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const movimientosMes = movimientos.filter((m) => {
      const fecha = m.fecha instanceof Date ? m.fecha : new Date(m.fecha);
      return fecha >= inicioMes;
    });

    const entradasMes = movimientosMes.filter((m) => m.tipo === 'entrada').length;
    const salidasMes = movimientosMes.filter((m) => m.tipo === 'salida').length;

    return {
      totalProductos,
      totalCantidad,
      valorTotal,
      productosAgotados,
      productosBajoStock,
      entradasMes,
      salidasMes,
      movimientosMes: movimientosMes.length,
    };
  } catch (error) {
    console.error('Error al obtener resumen de almacén:', error);
    throw error;
  }
};

// ============================================================================
// OPERACIONES DE STOCK
// ============================================================================

/**
 * Registrar movimiento de almacén y actualizar stock
 */
export const registrarMovimientoAlmacen = async (movimientoData) => {
  try {
    return await runTransaction(db, async (transaction) => {
      const {
        tipo, // 'entrada' | 'salida' | 'ajuste'
        motivo, // 'compra' | 'venta' | 'devolucion' | 'merma' | 'ajuste_inventario'
        productoId,
        productoNombre,
        cantidad,
        unidad = 'pza',
        precioUnitario = 0,
        total = 0,
        ordenCompraId,
        ordenCompraFolio,
        ventaId,
        ventaFolio,
        distribuidorId,
        distribuidorNombre,
        clienteId,
        clienteNombre,
        notas = '',
      } = movimientoData;

      // 1. Crear movimiento
      const movimientoRef = doc(collection(db, MOVIMIENTOS_COLLECTION));
      const movimientoDoc = {
        tipo,
        motivo,
        productoId,
        productoNombre,
        cantidad,
        unidad,
        precioUnitario,
        total,
        ordenCompraId: ordenCompraId || null,
        ordenCompraFolio: ordenCompraFolio || null,
        ventaId: ventaId || null,
        ventaFolio: ventaFolio || null,
        distribuidorId: distribuidorId || null,
        distribuidorNombre: distribuidorNombre || null,
        clienteId: clienteId || null,
        clienteNombre: clienteNombre || null,
        notas,
        fecha: serverTimestamp(),
        createdAt: serverTimestamp(),
      };
      transaction.set(movimientoRef, movimientoDoc);

      // 2. Actualizar stock
      const stockQuery = query(
        collection(db, STOCK_COLLECTION),
        where('productoId', '==', productoId)
      );

      const stockSnapshot = await getDocs(stockQuery);

      let stockRef;
      let cantidadActual = 0;

      if (stockSnapshot.empty) {
        // Crear nuevo registro de stock
        stockRef = doc(collection(db, STOCK_COLLECTION));
        const nuevoStock = {
          productoId,
          productoNombre,
          productoSKU: `SKU-${productoId}`,
          cantidad: 0,
          unidad,
          precioPromedio: precioUnitario,
          stockMinimo: 10,
          stockMaximo: 1000,
          ubicacion: 'Almacén Principal',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        transaction.set(stockRef, nuevoStock);
      } else {
        const stockDoc = stockSnapshot.docs[0];
        stockRef = stockDoc.ref;
        cantidadActual = stockDoc.data().cantidad || 0;
      }

      // Calcular nueva cantidad según tipo de movimiento
      let nuevaCantidad = cantidadActual;
      if (tipo === 'entrada') {
        nuevaCantidad = cantidadActual + cantidad;
      } else if (tipo === 'salida') {
        nuevaCantidad = cantidadActual - cantidad;
        if (nuevaCantidad < 0) {
          throw new Error('Stock insuficiente para realizar la salida');
        }
      } else if (tipo === 'ajuste') {
        nuevaCantidad = cantidad; // En ajuste, la cantidad es el valor absoluto
      }

      // Actualizar stock
      transaction.update(stockRef, {
        cantidad: nuevaCantidad,
        precioPromedio: precioUnitario || transaction.get(stockRef).then(d => d.data().precioPromedio),
        updatedAt: serverTimestamp(),
      });

      // 3. Actualizar contadores históricos
      const contadorRef = doc(db, 'contadoresAlmacen', 'principal');
      const contadorSnap = await transaction.get(contadorRef);

      if (!contadorSnap.exists()) {
        transaction.set(contadorRef, {
          totalEntradas: tipo === 'entrada' ? cantidad : 0,
          totalSalidas: tipo === 'salida' ? cantidad : 0,
          totalMovimientos: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        transaction.update(contadorRef, {
          totalEntradas: tipo === 'entrada' ? increment(cantidad) : contadorSnap.data().totalEntradas,
          totalSalidas: tipo === 'salida' ? increment(cantidad) : contadorSnap.data().totalSalidas,
          totalMovimientos: increment(1),
          updatedAt: serverTimestamp(),
        });
      }

      return {
        id: movimientoRef.id,
        ...movimientoDoc,
        stockActual: nuevaCantidad,
      };
    });
  } catch (error) {
    console.error('Error al registrar movimiento de almacén:', error);
    throw error;
  }
};

/**
 * Registrar entrada por compra
 */
export const registrarEntrada = async (entradaData) => {
  return await registrarMovimientoAlmacen({
    tipo: 'entrada',
    motivo: 'compra',
    ...entradaData,
  });
};

/**
 * Registrar salida por venta
 */
export const registrarSalida = async (salidaData) => {
  return await registrarMovimientoAlmacen({
    tipo: 'salida',
    motivo: 'venta',
    ...salidaData,
  });
};

/**
 * Registrar ajuste de inventario
 */
export const registrarAjuste = async (ajusteData) => {
  return await registrarMovimientoAlmacen({
    tipo: 'ajuste',
    motivo: 'ajuste_inventario',
    ...ajusteData,
  });
};

/**
 * Actualizar stock mínimo y máximo
 */
export const actualizarNivelesStock = async (productoId, stockMinimo, stockMaximo) => {
  try {
    const q = query(
      collection(db, STOCK_COLLECTION),
      where('productoId', '==', productoId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('Producto no encontrado en stock');
    }

    const stockRef = snapshot.docs[0].ref;
    await updateDoc(stockRef, {
      stockMinimo,
      stockMaximo,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error al actualizar niveles de stock:', error);
    throw error;
  }
};

/**
 * Obtener contadores históricos de almacén
 */
export const getContadoresHistoricos = async () => {
  try {
    const contadorRef = doc(db, 'contadoresAlmacen', 'principal');
    const contadorSnap = await getDoc(contadorRef);

    if (!contadorSnap.exists()) {
      return {
        totalEntradas: 0,
        totalSalidas: 0,
        totalMovimientos: 0,
      };
    }

    return contadorSnap.data();
  } catch (error) {
    console.error('Error al obtener contadores históricos:', error);
    throw error;
  }
};

export default {
  getMovimientosAlmacen,
  getStock,
  getStockProducto,
  getResumenAlmacen,
  registrarMovimientoAlmacen,
  registrarEntrada,
  registrarSalida,
  registrarAjuste,
  actualizarNivelesStock,
  getContadoresHistoricos,
};
