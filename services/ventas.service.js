/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                         VENTAS SERVICE                                     ║
 * ║              Servicio completo para gestión de ventas                      ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * @module VentasService
 * @author CHRONOS System
 * @version 1.0.0
 */
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

// ✅ Importar db de la configuración de chronos-system
import { db } from '../config/firebase';
import { registrarSalida } from './almacen.service';
import { createCliente } from './clientes.service';

const COLLECTION = 'ventas';

// ============================================================================
// CONSULTAS (READ)
// ============================================================================

/**
 * Obtener todas las ventas con filtros opcionales
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Array>} Lista de ventas
 */
export const getVentas = async (filters = {}) => {
  try {
    let q = collection(db, COLLECTION);

    // Aplicar filtros
    const constraints = [];

    if (filters.clienteId) {
      constraints.push(where('clienteId', '==', filters.clienteId));
    }

    if (filters.metodoPago) {
      constraints.push(where('metodoPago', '==', filters.metodoPago));
    }

    if (filters.estado) {
      constraints.push(where('estado', '==', filters.estado));
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
    const ventas = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate?.() || doc.data().fecha,
    }));

    // Filtros del lado del cliente (no soportados por índices)
    let result = ventas;

    if (filters.montoMin) {
      result = result.filter((v) => v.total >= filters.montoMin);
    }

    if (filters.montoMax) {
      result = result.filter((v) => v.total <= filters.montoMax);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (v) =>
          v.clienteNombre?.toLowerCase().includes(searchLower) ||
          v.notas?.toLowerCase().includes(searchLower) ||
          v.id.includes(searchLower)
      );
    }

    return result;
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    throw error;
  }
};

/**
 * Obtener una venta por ID
 * @param {string} id - ID de la venta
 * @returns {Promise<Object>} Venta
 */
export const getVenta = async (id) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Venta no encontrada');
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      fecha: docSnap.data().fecha?.toDate?.() || docSnap.data().fecha,
    };
  } catch (error) {
    console.error('Error al obtener venta:', error);
    throw error;
  }
};

/**
 * Obtener ventas por mes
 * @param {number} month - Mes (1-12)
 * @param {number} year - Año
 * @returns {Promise<Array>} Ventas del mes
 */
export const getVentasByMonth = async (month, year = new Date().getFullYear()) => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const q = query(
      collection(db, COLLECTION),
      where('fecha', '>=', startDate),
      where('fecha', '<=', endDate)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate?.() || doc.data().fecha,
    }));
  } catch (error) {
    console.error('Error al obtener ventas por mes:', error);
    throw error;
  }
};

/**
 * Obtener ventas por cliente
 * @param {string} clienteId - ID del cliente
 * @returns {Promise<Array>} Ventas del cliente
 */
export const getVentasByCliente = async (clienteId) => {
  try {
    const q = query(collection(db, COLLECTION), where('clienteId', '==', clienteId));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate?.() || doc.data().fecha,
    }));
  } catch (error) {
    console.error('Error al obtener ventas por cliente:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de ventas
 * @returns {Promise<Object>} KPIs y estadísticas
 */
export const getVentasStats = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    // Obtener todas las ventas del mes
    const ventasMes = await getVentasByMonth(today.getMonth() + 1, today.getFullYear());

    // Ventas de hoy
    const ventasHoy = ventasMes.filter((v) => {
      const ventaDate = v.fecha instanceof Date ? v.fecha : new Date(v.fecha);
      return ventaDate >= today;
    });

    // Ventas de la semana
    const ventasSemana = ventasMes.filter((v) => {
      const ventaDate = v.fecha instanceof Date ? v.fecha : new Date(v.fecha);
      return ventaDate >= startOfWeek;
    });

    // Totales
    const totalVentasHoy = ventasHoy.reduce((sum, v) => sum + (v.total || 0), 0);
    const totalVentasSemana = ventasSemana.reduce((sum, v) => sum + (v.total || 0), 0);
    const totalVentasMes = ventasMes.reduce((sum, v) => sum + (v.total || 0), 0);

    // Ventas pendientes (todas, no solo del mes)
    const allVentas = await getVentas();
    const ventasPendientes = allVentas.filter(
      (v) => v.estado === 'pendiente' || v.estado === 'parcial'
    );

    // Clientes únicos del mes
    const clientesUnicos = new Set(ventasMes.filter((v) => v.clienteId).map((v) => v.clienteId));

    // Productos más vendidos
    const productosVendidos = {};
    ventasMes.forEach((v) => {
      v.productos?.forEach((p) => {
        const key = p.productoId || p.nombre;
        if (!productosVendidos[key]) {
          productosVendidos[key] = {
            id: p.productoId,
            nombre: p.nombre || p.productoNombre,
            cantidad: 0,
            total: 0,
          };
        }
        productosVendidos[key].cantidad += p.cantidad || 0;
        productosVendidos[key].total += (p.cantidad || 0) * (p.precioUnitario || 0);
      });
    });

    const topProductos = Object.values(productosVendidos)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Promedio por venta
    const promedioVenta = ventasMes.length > 0 ? totalVentasMes / ventasMes.length : 0;

    // Ticket promedio
    const ticketPromedio = promedioVenta;

    return {
      // Contadores
      ventasHoy: ventasHoy.length,
      ventasSemana: ventasSemana.length,
      ventasMes: ventasMes.length,
      ventasPendientes: ventasPendientes.length,
      clientesActivos: clientesUnicos.size,

      // Montos
      totalVentasHoy,
      totalVentasSemana,
      totalVentasMes,
      promedioVenta,
      ticketPromedio,

      // Deuda pendiente
      deudaPendiente: ventasPendientes.reduce((sum, v) => sum + (v.saldoPendiente || 0), 0),

      // Top productos
      topProductos,

      // Comparación mes anterior (simplificado)
      crecimientoMes: 0, // TODO: implementar comparación
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de ventas:', error);
    throw error;
  }
};

// ============================================================================
// MUTACIONES (CREATE, UPDATE, DELETE)
// ============================================================================

/**
 * Generar siguiente folio de venta
 */
const generarFolioVenta = async () => {
  try {
    const ventas = await getVentas();
    const ultimoNumero = ventas.length;
    return `V-${String(ultimoNumero + 1).padStart(4, '0')}`;
  } catch (error) {
    return 'V-0001';
  }
};

/**
 * Crear nueva venta completa con integración total
 * Este método realiza todas las operaciones necesarias:
 * 1. Crea/obtiene el cliente
 * 2. Crea la venta con estado de pago
 * 3. Registra salida de almacén
 * 4. Registra en bancos (Bóveda Monte, Utilidades, Fletes)
 * 5. Maneja adeudos de cliente según estado de pago
 *
 * @param {Object} ventaData - Datos de la venta
 * @returns {Promise<Object>} Venta creada
 */
export const createVenta = async (ventaData) => {
  try {
    return await runTransaction(db, async (transaction) => {
      // 1. Crear o obtener cliente
      let cliente;
      if (ventaData.clienteId) {
        const clienteRef = doc(db, 'clientes', ventaData.clienteId);
        const clienteSnap = await transaction.get(clienteRef);
        if (!clienteSnap.exists()) {
          throw new Error('Cliente no encontrado');
        }
        cliente = { id: clienteSnap.id, ...clienteSnap.data() };
      } else {
        // Crear nuevo cliente
        cliente = await createCliente({
          nombre: ventaData.clienteNombre,
          telefono: ventaData.clienteTelefono || '',
          email: ventaData.clienteEmail || '',
          tipo: 'regular',
        });
      }

      // 2. Generar folio
      const folio = await generarFolioVenta();

      // 3. Calcular totales con flete
      const productos = ventaData.productos || [];
      const precioFlete = ventaData.precioFlete || 500; // USD por defecto

      let subtotal = 0;
      let totalFlete = 0;
      let totalUtilidad = 0;

      const productosConFlete = productos.map((p) => {
        const precioBase = p.precioUnitario || 0;
        const fleteUnitario = p.aplicaFlete ? precioFlete : 0;
        const precioTotal = precioBase + fleteUnitario;
        const subtotalProducto = precioTotal * p.cantidad;

        // Calcular utilidad (precio venta - costo)
        const costoUnitario = p.costoUnitario || 0;
        const utilidadUnitaria = precioBase - costoUnitario;
        const utilidadProducto = utilidadUnitaria * p.cantidad;

        subtotal += subtotalProducto;
        totalFlete += fleteUnitario * p.cantidad;
        totalUtilidad += utilidadProducto;

        return {
          ...p,
          precioFlete: fleteUnitario,
          precioTotal,
          subtotal: subtotalProducto,
          utilidad: utilidadProducto,
        };
      });

      const total = subtotal;

      // 4. Determinar montos según estado de pago
      const estadoPago = ventaData.estadoPago || 'pagado'; // 'pagado', 'parcial', 'pendiente'
      const montoPagado =
        estadoPago === 'pagado' ? total : estadoPago === 'parcial' ? ventaData.montoPagado || 0 : 0;
      const saldoPendiente = total - montoPagado;

      // 5. Crear venta
      const ventaRef = doc(collection(db, COLLECTION));
      const ventaDoc = {
        folio,
        clienteId: cliente.id,
        clienteNombre: cliente.nombre,
        productos: productosConFlete,
        subtotal,
        total,
        totalFlete,
        totalUtilidad,
        precioFlete,
        estadoPago,
        montoPagado,
        saldoPendiente,
        metodoPago: ventaData.metodoPago || 'efectivo',
        notas: ventaData.notas || '',
        fecha: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      transaction.set(ventaRef, ventaDoc);

      // 6. Registrar salidas de almacén
      for (const producto of productosConFlete) {
        await registrarSalida({
          productoId: producto.productoId,
          productoNombre: producto.nombre,
          cantidad: producto.cantidad,
          unidad: producto.unidad || 'pza',
          precioUnitario: producto.precioTotal,
          total: producto.subtotal,
          ventaId: ventaRef.id,
          ventaFolio: folio,
          clienteId: cliente.id,
          clienteNombre: cliente.nombre,
          notas: `Salida por venta ${folio}`,
        });
      }

      // 7. Registrar en Bóveda Monte (solo monto pagado)
      if (montoPagado > 0) {
        const ingresoBovedaRef = doc(collection(db, 'ingresosBancos'));
        transaction.set(ingresoBovedaRef, {
          bancoId: 'bovedaMonte',
          bancoNombre: 'Bóveda Monte',
          tipo: 'venta',
          concepto: `Venta ${folio}`,
          monto: montoPagado,
          estadoPago,
          ventaId: ventaRef.id,
          ventaFolio: folio,
          clienteId: cliente.id,
          clienteNombre: cliente.nombre,
          fecha: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
      }

      // 8. Registrar en Fletes (solo monto pagado proporcionalmente)
      if (totalFlete > 0) {
        const proporcionPagada = montoPagado / total;
        const fletePagado = totalFlete * proporcionPagada;

        const ingresoFleteRef = doc(collection(db, 'ingresosBancos'));
        transaction.set(ingresoFleteRef, {
          bancoId: 'fletes',
          bancoNombre: 'Fletes',
          tipo: 'flete_venta',
          concepto: `Flete venta ${folio}`,
          monto: fletePagado,
          montoTotal: totalFlete,
          estadoPago,
          ventaId: ventaRef.id,
          ventaFolio: folio,
          clienteId: cliente.id,
          clienteNombre: cliente.nombre,
          fecha: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
      }

      // 9. Registrar en Utilidades (solo monto pagado proporcionalmente)
      if (totalUtilidad > 0) {
        const proporcionPagada = montoPagado / total;
        const utilidadPagada = totalUtilidad * proporcionPagada;

        const ingresoUtilidadRef = doc(collection(db, 'ingresosBancos'));
        transaction.set(ingresoUtilidadRef, {
          bancoId: 'utilidades',
          bancoNombre: 'Utilidades',
          tipo: 'utilidad_venta',
          concepto: `Utilidad venta ${folio}`,
          monto: utilidadPagada,
          montoTotal: totalUtilidad,
          estadoPago,
          ventaId: ventaRef.id,
          ventaFolio: folio,
          clienteId: cliente.id,
          clienteNombre: cliente.nombre,
          fecha: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
      }

      // 10. Registrar adeudo de cliente si es necesario
      if (saldoPendiente > 0) {
        const adeudoRef = doc(collection(db, 'adeudosClientes'));
        transaction.set(adeudoRef, {
          clienteId: cliente.id,
          clienteNombre: cliente.nombre,
          ventaId: ventaRef.id,
          ventaFolio: folio,
          montoInicial: total,
          montoRestante: saldoPendiente,
          montoPagado,
          saldado: false,
          fechaCreacion: serverTimestamp(),
          createdAt: serverTimestamp(),
        });

        // Actualizar total de adeudo del cliente
        const clienteRef = doc(db, 'clientes', cliente.id);
        transaction.update(clienteRef, {
          adeudoTotal: increment(saldoPendiente),
          updatedAt: serverTimestamp(),
        });
      }

      // 11. Actualizar contadores históricos de bancos
      // Bóveda Monte - Histórico siempre se acumula
      const contadorBovedaRef = doc(db, 'contadoresBancos', 'bovedaMonte');
      const bovedaSnap = await transaction.get(contadorBovedaRef);

      if (!bovedaSnap.exists()) {
        transaction.set(contadorBovedaRef, {
          totalHistorico: total,
          totalCapital: montoPagado,
          totalVentas: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        transaction.update(contadorBovedaRef, {
          totalHistorico: increment(total),
          totalCapital: increment(montoPagado),
          totalVentas: increment(1),
          updatedAt: serverTimestamp(),
        });
      }

      // Fletes - Histórico siempre se acumula
      if (totalFlete > 0) {
        const contadorFleteRef = doc(db, 'contadoresBancos', 'fletes');
        const fleteSnap = await transaction.get(contadorFleteRef);
        const fletePagado = totalFlete * (montoPagado / total);

        if (!fleteSnap.exists()) {
          transaction.set(contadorFleteRef, {
            totalHistorico: totalFlete,
            totalCapital: fletePagado,
            totalVentas: 1,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          transaction.update(contadorFleteRef, {
            totalHistorico: increment(totalFlete),
            totalCapital: increment(fletePagado),
            totalVentas: increment(1),
            updatedAt: serverTimestamp(),
          });
        }
      }

      // Utilidades - Histórico siempre se acumula
      if (totalUtilidad > 0) {
        const contadorUtilidadRef = doc(db, 'contadoresBancos', 'utilidades');
        const utilidadSnap = await transaction.get(contadorUtilidadRef);
        const utilidadPagada = totalUtilidad * (montoPagado / total);

        if (!utilidadSnap.exists()) {
          transaction.set(contadorUtilidadRef, {
            totalHistorico: totalUtilidad,
            totalCapital: utilidadPagada,
            totalVentas: 1,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          transaction.update(contadorUtilidadRef, {
            totalHistorico: increment(totalUtilidad),
            totalCapital: increment(utilidadPagada),
            totalVentas: increment(1),
            updatedAt: serverTimestamp(),
          });
        }
      }

      return {
        id: ventaRef.id,
        ...ventaDoc,
        clienteId: cliente.id,
      };
    });
  } catch (error) {
    console.error('Error al crear venta:', error);
    throw error;
  }
};

/**
 * Actualizar venta existente
 * @param {string} id - ID de la venta
 * @param {Object} updates - Datos a actualizar
 * @returns {Promise<void>}
 */
export const updateVenta = async (id, updates) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al actualizar venta:', error);
    throw error;
  }
};

/**
 * Cancelar venta
 * @param {string} id - ID de la venta
 * @param {string} motivo - Motivo de cancelación
 * @returns {Promise<void>}
 */
export const cancelVenta = async (id, motivo) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      estado: 'cancelada',
      motivoCancelacion: motivo,
      fechaCancelacion: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al cancelar venta:', error);
    throw error;
  }
};

/**
 * Eliminar venta (soft delete)
 * @param {string} id - ID de la venta
 * @returns {Promise<void>}
 */
export const deleteVenta = async (id) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      deletedAt: serverTimestamp(),
      estado: 'eliminada',
    });
  } catch (error) {
    console.error('Error al eliminar venta:', error);
    throw error;
  }
};

/**
 * Eliminar venta permanentemente
 * @param {string} id - ID de la venta
 * @returns {Promise<void>}
 */
export const hardDeleteVenta = async (id) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar venta permanentemente:', error);
    throw error;
  }
};

/**
 * Registrar pago parcial
 * @param {string} ventaId - ID de la venta
 * @param {Object} pagoData - Datos del pago
 * @returns {Promise<void>}
 */
export const registrarPagoParcial = async (ventaId, pagoData) => {
  try {
    const venta = await getVenta(ventaId);

    const pago = {
      monto: pagoData.monto,
      metodoPago: pagoData.metodoPago,
      fecha: pagoData.fecha || new Date(),
      notas: pagoData.notas || '',
      registradoEn: serverTimestamp(),
    };

    const nuevoSaldoPendiente = (venta.saldoPendiente || venta.total) - pagoData.monto;
    const nuevoEstado = nuevoSaldoPendiente <= 0 ? 'pagada' : 'parcial';

    await updateVenta(ventaId, {
      pagos: [...(venta.pagos || []), pago],
      saldoPendiente: Math.max(0, nuevoSaldoPendiente),
      estado: nuevoEstado,
    });
  } catch (error) {
    console.error('Error al registrar pago parcial:', error);
    throw error;
  }
};

export default {
  // Queries
  getVentas,
  getVenta,
  getVentasByMonth,
  getVentasByCliente,
  getVentasStats,

  // Mutations
  createVenta,
  updateVenta,
  cancelVenta,
  deleteVenta,
  hardDeleteVenta,
  registrarPagoParcial,
};
