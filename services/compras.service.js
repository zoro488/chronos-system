/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                        COMPRAS SERVICE                                     ║
 * ║              Servicio completo para gestión de compras                     ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

// ✅ Importar db de la configuración de chronos-system
import { db } from '../config/firebase';
import { ajusteInventario } from './productos.service';

const COLLECTION = 'compras';

/**
 * Obtener todas las compras con filtros
 */
export const getCompras = async (filters = {}) => {
  try {
    let q = collection(db, COLLECTION);
    const constraints = [];

    if (filters.proveedorId) {
      constraints.push(where('proveedorId', '==', filters.proveedorId));
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
    const compras = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate?.() || doc.data().fecha,
    }));

    // Filtros del lado del cliente
    let result = compras;

    if (filters.montoMin) {
      result = result.filter((c) => c.total >= filters.montoMin);
    }

    if (filters.montoMax) {
      result = result.filter((c) => c.total <= filters.montoMax);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.proveedorNombre?.toLowerCase().includes(searchLower) ||
          c.numeroOrden?.toLowerCase().includes(searchLower) ||
          c.numeroFactura?.toLowerCase().includes(searchLower)
      );
    }

    return result;
  } catch (error) {
    console.error('Error al obtener compras:', error);
    throw error;
  }
};

/**
 * Obtener compra por ID
 */
export const getCompra = async (id) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Compra no encontrada');
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      fecha: docSnap.data().fecha?.toDate?.() || docSnap.data().fecha,
    };
  } catch (error) {
    console.error('Error al obtener compra:', error);
    throw error;
  }
};

/**
 * Obtener compras por proveedor
 */
export const getComprasByProveedor = async (proveedorId) => {
  try {
    return await getCompras({ proveedorId });
  } catch (error) {
    console.error('Error al obtener compras por proveedor:', error);
    throw error;
  }
};

/**
 * Crear nueva compra
 */
export const createCompra = async (compraData) => {
  try {
    const compra = {
      ...compraData,
      fecha: compraData.fecha || new Date(),
      estado: compraData.estado || 'pendiente',
      recibida: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION), compra);
    return docRef.id;
  } catch (error) {
    console.error('Error al crear compra:', error);
    throw error;
  }
};

/**
 * Actualizar compra
 */
export const updateCompra = async (id, updates) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al actualizar compra:', error);
    throw error;
  }
};

/**
 * Recibir compra (actualiza inventario)
 */
export const recibirCompra = async (id, recepcionData) => {
  try {
    const compra = await getCompra(id);

    // Actualizar inventario de productos
    for (const producto of compra.productos || []) {
      await ajusteInventario(
        producto.productoId,
        producto.cantidad,
        `Recepción de compra ${compra.numeroOrden || id}`,
        'entrada'
      );
    }

    // Actualizar estado de la compra
    await updateCompra(id, {
      estado: 'recibida',
      recibida: true,
      fechaRecepcion: recepcionData.fecha || new Date(),
      recibioPor: recepcionData.recibioPor || 'Sistema',
      notasRecepcion: recepcionData.notas || '',
    });
  } catch (error) {
    console.error('Error al recibir compra:', error);
    throw error;
  }
};

/**
 * Cancelar compra
 */
export const cancelCompra = async (id, motivo) => {
  try {
    await updateCompra(id, {
      estado: 'cancelada',
      motivoCancelacion: motivo,
      fechaCancelacion: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al cancelar compra:', error);
    throw error;
  }
};

/**
 * Eliminar compra (soft delete)
 */
export const deleteCompra = async (id) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      deletedAt: serverTimestamp(),
      estado: 'eliminada',
    });
  } catch (error) {
    console.error('Error al eliminar compra:', error);
    throw error;
  }
};

/**
 * Eliminar compra permanentemente
 */
export const hardDeleteCompra = async (id) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar compra permanentemente:', error);
    throw error;
  }
};

export default {
  getCompras,
  getCompra,
  getComprasByProveedor,
  createCompra,
  updateCompra,
  recibirCompra,
  cancelCompra,
  deleteCompra,
  hardDeleteCompra,
};
