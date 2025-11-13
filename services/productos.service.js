/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                       PRODUCTOS SERVICE                                    ║
 * ║             Servicio completo para gestión de productos                    ║
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

const COLLECTION = 'productos';

/**
 * Obtener todos los productos con filtros
 */
export const getProductos = async (filters = {}) => {
  try {
    let q = collection(db, COLLECTION);
    const constraints = [];

    if (filters.categoria) {
      constraints.push(where('categoria', '==', filters.categoria));
    }

    if (filters.activo !== undefined) {
      constraints.push(where('activo', '==', filters.activo));
    }

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const snapshot = await getDocs(q);
    let productos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filtros del lado del cliente
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      productos = productos.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(searchLower) ||
          p.sku?.toLowerCase().includes(searchLower) ||
          p.codigoBarras?.includes(filters.search)
      );
    }

    if (filters.stockMin !== undefined) {
      productos = productos.filter((p) => (p.stock || 0) >= filters.stockMin);
    }

    if (filters.stockMax !== undefined) {
      productos = productos.filter((p) => (p.stock || 0) <= filters.stockMax);
    }

    return productos;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

/**
 * Obtener producto por ID
 */
export const getProducto = async (id) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Producto no encontrado');
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error('Error al obtener producto:', error);
    throw error;
  }
};

/**
 * Obtener productos por categoría
 */
export const getProductosByCategoria = async (categoria) => {
  try {
    return await getProductos({ categoria });
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    throw error;
  }
};

/**
 * Obtener productos con stock bajo
 */
export const getProductosLowStock = async (threshold = 10) => {
  try {
    const productos = await getProductos();
    return productos.filter((p) => (p.stock || 0) < threshold && p.activo !== false);
  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);
    throw error;
  }
};

/**
 * Crear nuevo producto
 */
export const createProducto = async (productoData) => {
  try {
    const producto = {
      ...productoData,
      activo: productoData.activo !== undefined ? productoData.activo : true,
      stock: productoData.stock || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION), producto);
    return docRef.id;
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }
};

/**
 * Actualizar producto
 */
export const updateProducto = async (id, updates) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw error;
  }
};

/**
 * Ajustar inventario de producto
 */
export const ajusteInventario = async (id, cantidad, motivo, tipo = 'entrada') => {
  try {
    const producto = await getProducto(id);
    const nuevoStock =
      tipo === 'entrada' ? (producto.stock || 0) + cantidad : (producto.stock || 0) - cantidad;

    await updateProducto(id, {
      stock: Math.max(0, nuevoStock),
      ultimoAjuste: {
        fecha: serverTimestamp(),
        cantidad,
        motivo,
        tipo,
        stockAnterior: producto.stock || 0,
        stockNuevo: Math.max(0, nuevoStock),
      },
    });
  } catch (error) {
    console.error('Error al ajustar inventario:', error);
    throw error;
  }
};

/**
 * Eliminar producto (soft delete)
 */
export const deleteProducto = async (id) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      activo: false,
      deletedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    throw error;
  }
};

/**
 * Eliminar producto permanentemente
 */
export const hardDeleteProducto = async (id) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar producto permanentemente:', error);
    throw error;
  }
};

export default {
  getProductos,
  getProducto,
  getProductosByCategoria,
  getProductosLowStock,
  createProducto,
  updateProducto,
  ajusteInventario,
  deleteProducto,
  hardDeleteProducto,
};
