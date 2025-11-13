/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    ÓRDENES DE COMPRA SERVICE                               ║
 * ║        Servicio completo para gestión de órdenes de compra                 ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    runTransaction,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';

import { db } from '../config/firebase';
import { registrarMovimientoAlmacen } from './almacen.service';
import { createDistribuidor, registrarAdeudo } from './distribuidores.service';

const COLLECTION = 'ordenesCompra';

// ============================================================================
// CONSULTAS (READ)
// ============================================================================

/**
 * Obtener todas las órdenes de compra con filtros
 */
export const getOrdenesCompra = async (filters = {}) => {
  try {
    let q = collection(db, COLLECTION);
    const constraints = [];

    if (filters.distribuidorId) {
      constraints.push(where('distribuidorId', '==', filters.distribuidorId));
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
    let ordenes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate?.() || doc.data().fecha,
    }));

    // Filtros del lado del cliente
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      ordenes = ordenes.filter(
        (o) =>
          o.folio?.toLowerCase().includes(searchLower) ||
          o.distribuidorNombre?.toLowerCase().includes(searchLower) ||
          o.numeroOrden?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.montoMin) {
      ordenes = ordenes.filter((o) => o.total >= filters.montoMin);
    }

    if (filters.montoMax) {
      ordenes = ordenes.filter((o) => o.total <= filters.montoMax);
    }

    return ordenes;
  } catch (error) {
    console.error('Error al obtener órdenes de compra:', error);
    throw error;
  }
};

/**
 * Obtener orden de compra por ID
 */
export const getOrdenCompra = async (id) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Orden de compra no encontrada');
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      fecha: docSnap.data().fecha?.toDate?.() || docSnap.data().fecha,
    };
  } catch (error) {
    console.error('Error al obtener orden de compra:', error);
    throw error;
  }
};

/**
 * Generar siguiente folio de OC
 */
const generarFolioOC = async () => {
  try {
    const ordenes = await getOrdenesCompra();
    const ultimoNumero = ordenes.length;
    return `OC${String(ultimoNumero + 1).padStart(4, '0')}`;
  } catch (error) {
    return 'OC0001';
  }
};

// ============================================================================
// CREACIÓN (CREATE)
// ============================================================================

/**
 * Crear orden de compra completa
 * Este método realiza todas las operaciones necesarias:
 * 1. Crea/obtiene el distribuidor
 * 2. Crea la orden de compra
 * 3. Registra el adeudo al distribuidor
 * 4. Registra la entrada en almacén
 */
export const createOrdenCompra = async (ordenData) => {
  try {
    return await runTransaction(db, async (transaction) => {
      // 1. Crear o obtener distribuidor
      let distribuidor;
      if (ordenData.distribuidorId) {
        const distRef = doc(db, 'distribuidores', ordenData.distribuidorId);
        const distSnap = await transaction.get(distRef);
        if (!distSnap.exists()) {
          throw new Error('Distribuidor no encontrado');
        }
        distribuidor = { id: distSnap.id, ...distSnap.data() };
      } else {
        // Crear nuevo distribuidor
        distribuidor = await createDistribuidor({
          nombre: ordenData.distribuidorNombre,
          contacto: ordenData.distribuidorContacto || '',
          telefono: ordenData.distribuidorTelefono || '',
          email: ordenData.distribuidorEmail || '',
          direccion: ordenData.distribuidorDireccion || '',
        });
      }

      // 2. Generar folio
      const folio = await generarFolioOC();

      // 3. Calcular total
      const productos = ordenData.productos || [];
      const subtotal = productos.reduce(
        (sum, p) => sum + (p.precioUnitario || 0) * (p.cantidad || 0),
        0
      );
      const iva = subtotal * 0.16;
      const total = subtotal + iva;

      // 4. Crear orden de compra
      const ocRef = doc(collection(db, COLLECTION));
      const ocData = {
        folio,
        numeroOrden: ordenData.numeroOrden || folio,
        distribuidorId: distribuidor.id,
        distribuidorNombre: distribuidor.nombre,
        productos: productos.map((p) => ({
          productoId: p.productoId || null,
          nombre: p.nombre,
          descripcion: p.descripcion || '',
          cantidad: p.cantidad,
          unidad: p.unidad || 'pza',
          precioUnitario: p.precioUnitario,
          subtotal: p.precioUnitario * p.cantidad,
        })),
        subtotal,
        iva,
        total,
        metodoPago: ordenData.metodoPago || 'credito',
        condicionesPago: ordenData.condicionesPago || 'A crédito',
        fechaEntregaEstimada: ordenData.fechaEntregaEstimada || null,
        notas: ordenData.notas || '',
        estado: 'pendiente', // pendiente, recibida, cancelada
        fecha: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      transaction.set(ocRef, ocData);

      // 5. Registrar adeudo al distribuidor
      await registrarAdeudo(distribuidor.id, ocRef.id, total, {
        folio,
        descripcion: `Orden de compra ${folio}`,
      });

      // 6. Registrar entrada en almacén
      for (const producto of productos) {
        await registrarMovimientoAlmacen({
          tipo: 'entrada',
          motivo: 'compra',
          productoId: producto.productoId,
          productoNombre: producto.nombre,
          cantidad: producto.cantidad,
          unidad: producto.unidad || 'pza',
          precioUnitario: producto.precioUnitario,
          total: producto.precioUnitario * producto.cantidad,
          ordenCompraId: ocRef.id,
          ordenCompraFolio: folio,
          distribuidorId: distribuidor.id,
          distribuidorNombre: distribuidor.nombre,
          notas: `Entrada por OC ${folio}`,
        });
      }

      return { id: ocRef.id, ...ocData, distribuidorId: distribuidor.id };
    });
  } catch (error) {
    console.error('Error al crear orden de compra:', error);
    throw error;
  }
};

/**
 * Actualizar orden de compra
 */
export const updateOrdenCompra = async (id, updates) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return await getOrdenCompra(id);
  } catch (error) {
    console.error('Error al actualizar orden de compra:', error);
    throw error;
  }
};

/**
 * Marcar orden como recibida
 */
export const marcarOrdenRecibida = async (id, fechaRecepcion = new Date()) => {
  try {
    return await updateOrdenCompra(id, {
      estado: 'recibida',
      fechaRecepcion,
    });
  } catch (error) {
    console.error('Error al marcar orden como recibida:', error);
    throw error;
  }
};

/**
 * Cancelar orden de compra
 */
export const cancelarOrdenCompra = async (id, motivo = '') => {
  try {
    // TODO: Revertir entrada en almacén y adeudo si es necesario
    return await updateOrdenCompra(id, {
      estado: 'cancelada',
      motivoCancelacion: motivo,
      fechaCancelacion: new Date(),
    });
  } catch (error) {
    console.error('Error al cancelar orden de compra:', error);
    throw error;
  }
};

// ============================================================================
// ELIMINACIÓN (DELETE)
// ============================================================================

/**
 * Eliminar orden de compra (solo si está en estado borrador o cancelada)
 */
export const deleteOrdenCompra = async (id) => {
  try {
    const orden = await getOrdenCompra(id);

    if (orden.estado !== 'cancelada' && orden.estado !== 'borrador') {
      throw new Error('Solo se pueden eliminar órdenes canceladas o en borrador');
    }

    await deleteDoc(doc(db, COLLECTION, id));
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar orden de compra:', error);
    throw error;
  }
};

export default {
  getOrdenesCompra,
  getOrdenCompra,
  createOrdenCompra,
  updateOrdenCompra,
  marcarOrdenRecibida,
  cancelarOrdenCompra,
  deleteOrdenCompra,
};
