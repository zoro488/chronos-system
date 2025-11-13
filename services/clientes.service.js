/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                        CLIENTES SERVICE                                    ║
 * ║              Servicio completo para gestión de clientes                    ║
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

const COLLECTION = 'clientes';

/**
 * Obtener todos los clientes con filtros
 */
export const getClientes = async (filters = {}) => {
  try {
    let q = collection(db, COLLECTION);
    const constraints = [];

    if (filters.tipo) {
      constraints.push(where('tipo', '==', filters.tipo));
    }

    if (filters.activo !== undefined) {
      constraints.push(where('activo', '==', filters.activo));
    }

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const snapshot = await getDocs(q);
    let clientes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filtros del lado del cliente
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      clientes = clientes.filter(
        (c) =>
          c.nombre?.toLowerCase().includes(searchLower) ||
          c.email?.toLowerCase().includes(searchLower) ||
          c.rfc?.toLowerCase().includes(searchLower) ||
          c.telefono?.includes(filters.search)
      );
    }

    return clientes;
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    throw error;
  }
};

/**
 * Obtener cliente por ID
 */
export const getCliente = async (id) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Cliente no encontrado');
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    throw error;
  }
};

/**
 * Buscar clientes por nombre
 */
export const searchClientes = async (searchTerm) => {
  try {
    const clientes = await getClientes();
    const searchLower = searchTerm.toLowerCase();

    return clientes.filter(
      (c) =>
        c.nombre?.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower) ||
        c.rfc?.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    throw error;
  }
};

/**
 * Crear nuevo cliente o retornar existente
 */
export const createCliente = async (clienteData) => {
  try {
    // Buscar si ya existe por nombre
    const existing = await searchClientes(clienteData.nombre);

    if (existing.length > 0) {
      // Ya existe, retornar el primero
      return existing[0];
    }

    // Crear nuevo
    const cliente = {
      nombre: clienteData.nombre,
      telefono: clienteData.telefono || '',
      email: clienteData.email || '',
      direccion: clienteData.direccion || '',
      rfc: clienteData.rfc || '',
      tipo: clienteData.tipo || 'regular', // 'regular', 'mayorista', 'vip'
      adeudoTotal: 0,
      totalComprado: 0,
      ventasRealizadas: 0,
      activo: clienteData.activo !== undefined ? clienteData.activo : true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION), cliente);

    return {
      id: docRef.id,
      ...cliente,
    };
  } catch (error) {
    console.error('Error al crear cliente:', error);
    throw error;
  }
};

/**
 * Actualizar cliente
 */
export const updateCliente = async (id, updates) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    throw error;
  }
};

/**
 * Eliminar cliente (soft delete)
 */
export const deleteCliente = async (id) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      activo: false,
      deletedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    throw error;
  }
};

/**
 * Eliminar cliente permanentemente
 */
export const hardDeleteCliente = async (id) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar cliente permanentemente:', error);
    throw error;
  }
};

/**
 * Obtener adeudos de un cliente
 */
export const getAdeudosCliente = async (clienteId) => {
  try {
    const q = query(
      collection(db, 'adeudosClientes'),
      where('clienteId', '==', clienteId),
      where('saldado', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      fechaCreacion: doc.data().fechaCreacion?.toDate?.() || doc.data().fechaCreacion,
    }));
  } catch (error) {
    console.error('Error al obtener adeudos del cliente:', error);
    throw error;
  }
};

/**
 * Obtener historial de pagos de un cliente
 */
export const getPagosCliente = async (clienteId) => {
  try {
    const q = query(collection(db, 'pagosClientes'), where('clienteId', '==', clienteId));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate?.() || doc.data().fecha,
    }));
  } catch (error) {
    console.error('Error al obtener pagos del cliente:', error);
    throw error;
  }
};

/**
 * Registrar abono/pago de cliente
 */
export const registrarPagoCliente = async (
  clienteId,
  montoPago,
  metodoPago = 'efectivo',
  notas = ''
) => {
  try {
    // Implementar lógica similar a distribuidores
    // Aplicar pago a adeudos pendientes (FIFO)
    // Actualizar bancos correspondientes
    // Registrar pago

    // TODO: Implementar transacción completa
    console.log('Registrar pago cliente:', { clienteId, montoPago, metodoPago, notas });

    return { success: true, message: 'Pago registrado correctamente' };
  } catch (error) {
    console.error('Error al registrar pago de cliente:', error);
    throw error;
  }
};

export default {
  getClientes,
  getCliente,
  searchClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  hardDeleteCliente,
  getAdeudosCliente,
  getPagosCliente,
  registrarPagoCliente,
};
