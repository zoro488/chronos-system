/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                          GASTOS SERVICE                                    ║
 * ║              Servicio completo para gestión de gastos                      ║
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

const COLLECTION = 'gastos';

/**
 * Obtener todos los gastos con filtros
 */
export const getGastos = async (filters = {}) => {
  try {
    let q = collection(db, COLLECTION);
    const constraints = [];

    if (filters.categoria) {
      constraints.push(where('categoria', '==', filters.categoria));
    }

    if (filters.tipo) {
      constraints.push(where('tipo', '==', filters.tipo));
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
    const gastos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate?.() || doc.data().fecha,
    }));

    // Filtros del lado del cliente
    let result = gastos;

    if (filters.montoMin) {
      result = result.filter((g) => g.monto >= filters.montoMin);
    }

    if (filters.montoMax) {
      result = result.filter((g) => g.monto <= filters.montoMax);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (g) =>
          g.concepto?.toLowerCase().includes(searchLower) ||
          g.proveedor?.toLowerCase().includes(searchLower) ||
          g.notas?.toLowerCase().includes(searchLower)
      );
    }

    return result;
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    throw error;
  }
};

/**
 * Obtener gasto por ID
 */
export const getGasto = async (id) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Gasto no encontrado');
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      fecha: docSnap.data().fecha?.toDate?.() || docSnap.data().fecha,
    };
  } catch (error) {
    console.error('Error al obtener gasto:', error);
    throw error;
  }
};

/**
 * Obtener gastos por mes
 */
export const getGastosByMonth = async (month, year = new Date().getFullYear()) => {
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
    console.error('Error al obtener gastos por mes:', error);
    throw error;
  }
};

/**
 * Obtener gastos por categoría
 */
export const getGastosByCategoria = async (categoria) => {
  try {
    return await getGastos({ categoria });
  } catch (error) {
    console.error('Error al obtener gastos por categoría:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de gastos
 */
export const getGastosStats = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Gastos del mes
    const gastosMes = await getGastosByMonth(today.getMonth() + 1, today.getFullYear());

    // Total del mes
    const totalMes = gastosMes.reduce((sum, g) => sum + (g.monto || 0), 0);

    // Gastos de hoy
    const gastosHoy = gastosMes.filter((g) => {
      const gastoDate = g.fecha instanceof Date ? g.fecha : new Date(g.fecha);
      return gastoDate >= today;
    });

    const totalHoy = gastosHoy.reduce((sum, g) => sum + (g.monto || 0), 0);

    // Gastos por categoría
    const gastosPorCategoria = {};
    gastosMes.forEach((g) => {
      const cat = g.categoria || 'Sin categoría';
      if (!gastosPorCategoria[cat]) {
        gastosPorCategoria[cat] = { categoria: cat, total: 0, cantidad: 0 };
      }
      gastosPorCategoria[cat].total += g.monto || 0;
      gastosPorCategoria[cat].cantidad += 1;
    });

    const topCategorias = Object.values(gastosPorCategoria)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Promedio diario
    const diasTranscurridos = Math.ceil((today - startOfMonth) / (1000 * 60 * 60 * 24)) + 1;
    const promedioDiario = totalMes / diasTranscurridos;

    return {
      // Contadores
      gastosHoy: gastosHoy.length,
      gastosMes: gastosMes.length,

      // Montos
      totalHoy,
      totalMes,
      promedioDiario,

      // Detalles
      topCategorias,
      gastosPorCategoria: Object.values(gastosPorCategoria),
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de gastos:', error);
    throw error;
  }
};

/**
 * Crear nuevo gasto
 */
export const createGasto = async (gastoData) => {
  try {
    const gasto = {
      ...gastoData,
      fecha: gastoData.fecha || new Date(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION), gasto);
    return docRef.id;
  } catch (error) {
    console.error('Error al crear gasto:', error);
    throw error;
  }
};

/**
 * Actualizar gasto
 */
export const updateGasto = async (id, updates) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al actualizar gasto:', error);
    throw error;
  }
};

/**
 * Eliminar gasto (soft delete)
 */
export const deleteGasto = async (id) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      deletedAt: serverTimestamp(),
      activo: false,
    });
  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    throw error;
  }
};

/**
 * Eliminar gasto permanentemente
 */
export const hardDeleteGasto = async (id) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar gasto permanentemente:', error);
    throw error;
  }
};

export default {
  getGastos,
  getGasto,
  getGastosByMonth,
  getGastosByCategoria,
  getGastosStats,
  createGasto,
  updateGasto,
  deleteGasto,
  hardDeleteGasto,
};
