/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    DISTRIBUIDORES SERVICE                                  ║
 * ║          Servicio completo para gestión de distribuidores                  ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import {
    addDoc,
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

import { db } from '../config/firebase';

const COLLECTION = 'distribuidores';
const PAGOS_COLLECTION = 'pagosDistribuidores';
const ADEUDOS_COLLECTION = 'adeudosDistribuidores';

// ============================================================================
// CONSULTAS (READ)
// ============================================================================

/**
 * Obtener todos los distribuidores con filtros
 */
export const getDistribuidores = async (filters = {}) => {
  try {
    let q = collection(db, COLLECTION);
    const constraints = [];

    if (filters.activo !== undefined) {
      constraints.push(where('activo', '==', filters.activo));
    }

    if (filters.conAdeudo) {
      constraints.push(where('adeudoTotal', '>', 0));
    }

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const snapshot = await getDocs(q);
    let distribuidores = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filtros del lado del cliente
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      distribuidores = distribuidores.filter(
        (d) =>
          d.nombre?.toLowerCase().includes(searchLower) ||
          d.contacto?.toLowerCase().includes(searchLower) ||
          d.telefono?.includes(filters.search)
      );
    }

    return distribuidores;
  } catch (error) {
    console.error('Error al obtener distribuidores:', error);
    throw error;
  }
};

/**
 * Obtener distribuidor por ID
 */
export const getDistribuidor = async (id) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Distribuidor no encontrado');
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error('Error al obtener distribuidor:', error);
    throw error;
  }
};

/**
 * Buscar distribuidor por nombre
 */
export const searchDistribuidores = async (searchTerm) => {
  try {
    const distribuidores = await getDistribuidores();
    const searchLower = searchTerm.toLowerCase();

    return distribuidores.filter(
      (d) =>
        d.nombre?.toLowerCase().includes(searchLower) ||
        d.contacto?.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Error al buscar distribuidores:', error);
    throw error;
  }
};

/**
 * Obtener historial de pagos de un distribuidor
 */
export const getPagosDistribuidor = async (distribuidorId) => {
  try {
    const q = query(
      collection(db, PAGOS_COLLECTION),
      where('distribuidorId', '==', distribuidorId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate?.() || doc.data().fecha,
    }));
  } catch (error) {
    console.error('Error al obtener pagos del distribuidor:', error);
    throw error;
  }
};

/**
 * Obtener adeudos de un distribuidor
 */
export const getAdeudosDistribuidor = async (distribuidorId) => {
  try {
    const q = query(
      collection(db, ADEUDOS_COLLECTION),
      where('distribuidorId', '==', distribuidorId),
      where('saldado', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      fechaCreacion: doc.data().fechaCreacion?.toDate?.() || doc.data().fechaCreacion,
    }));
  } catch (error) {
    console.error('Error al obtener adeudos del distribuidor:', error);
    throw error;
  }
};

// ============================================================================
// CREACIÓN (CREATE)
// ============================================================================

/**
 * Crear o actualizar distribuidor
 */
export const createDistribuidor = async (distribuidorData) => {
  try {
    // Buscar si ya existe por nombre
    const existing = await searchDistribuidores(distribuidorData.nombre);

    if (existing.length > 0) {
      // Ya existe, retornar el existente
      return existing[0];
    }

    // Crear nuevo
    const data = {
      nombre: distribuidorData.nombre,
      contacto: distribuidorData.contacto || '',
      telefono: distribuidorData.telefono || '',
      email: distribuidorData.email || '',
      direccion: distribuidorData.direccion || '',
      rfc: distribuidorData.rfc || '',
      adeudoTotal: 0,
      totalComprado: 0,
      ordenesCompra: 0,
      activo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION), data);

    return {
      id: docRef.id,
      ...data,
    };
  } catch (error) {
    console.error('Error al crear distribuidor:', error);
    throw error;
  }
};

/**
 * Actualizar distribuidor
 */
export const updateDistribuidor = async (id, updates) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return await getDistribuidor(id);
  } catch (error) {
    console.error('Error al actualizar distribuidor:', error);
    throw error;
  }
};

// ============================================================================
// ADEUDOS Y PAGOS
// ============================================================================

/**
 * Registrar adeudo por orden de compra
 */
export const registrarAdeudo = async (distribuidorId, ordenCompraId, monto, detalles = {}) => {
  try {
    return await runTransaction(db, async (transaction) => {
      // 1. Crear adeudo
      const adeudoRef = doc(collection(db, ADEUDOS_COLLECTION));
      const adeudoData = {
        distribuidorId,
        ordenCompraId,
        montoInicial: monto,
        montoRestante: monto,
        montoPagado: 0,
        saldado: false,
        fechaCreacion: serverTimestamp(),
        ...detalles,
      };
      transaction.set(adeudoRef, adeudoData);

      // 2. Actualizar distribuidor
      const distRef = doc(db, COLLECTION, distribuidorId);
      transaction.update(distRef, {
        adeudoTotal: increment(monto),
        totalComprado: increment(monto),
        ordenesCompra: increment(1),
        updatedAt: serverTimestamp(),
      });

      return { id: adeudoRef.id, ...adeudoData };
    });
  } catch (error) {
    console.error('Error al registrar adeudo:', error);
    throw error;
  }
};

/**
 * Registrar pago a distribuidor
 * @param {string} distribuidorId - ID del distribuidor
 * @param {number} montoPago - Monto a pagar
 * @param {string} bancoOrigenId - ID del banco desde donde se paga
 * @param {string} metodoPago - Método de pago
 * @param {string} notas - Notas adicionales
 */
export const registrarPagoDistribuidor = async (
  distribuidorId,
  montoPago,
  bancoOrigenId,
  metodoPago = 'transferencia',
  notas = ''
) => {
  try {
    return await runTransaction(db, async (transaction) => {
      // 1. Obtener adeudos pendientes
      const adeudosSnapshot = await getDocs(
        query(
          collection(db, ADEUDOS_COLLECTION),
          where('distribuidorId', '==', distribuidorId),
          where('saldado', '==', false)
        )
      );

      let montoRestante = montoPago;
      const adeudosPagados = [];

      // 2. Aplicar pago a adeudos (FIFO)
      for (const adeudoDoc of adeudosSnapshot.docs) {
        if (montoRestante <= 0) break;

        const adeudo = { id: adeudoDoc.id, ...adeudoDoc.data() };
        const montoAAplicar = Math.min(montoRestante, adeudo.montoRestante);

        const nuevoMontoRestante = adeudo.montoRestante - montoAAplicar;
        const nuevoMontoPagado = adeudo.montoPagado + montoAAplicar;

        transaction.update(doc(db, ADEUDOS_COLLECTION, adeudo.id), {
          montoRestante: nuevoMontoRestante,
          montoPagado: nuevoMontoPagado,
          saldado: nuevoMontoRestante === 0,
          updatedAt: serverTimestamp(),
        });

        adeudosPagados.push({
          adeudoId: adeudo.id,
          ordenCompraId: adeudo.ordenCompraId,
          montoAplicado: montoAAplicar,
        });

        montoRestante -= montoAAplicar;
      }

      // 3. Registrar pago
      const pagoRef = doc(collection(db, PAGOS_COLLECTION));
      const pagoData = {
        distribuidorId,
        bancoOrigenId,
        monto: montoPago,
        metodoPago,
        notas,
        adeudosPagados,
        fecha: serverTimestamp(),
        createdAt: serverTimestamp(),
      };
      transaction.set(pagoRef, pagoData);

      // 4. Actualizar distribuidor
      const distRef = doc(db, COLLECTION, distribuidorId);
      transaction.update(distRef, {
        adeudoTotal: increment(-montoPago),
        updatedAt: serverTimestamp(),
      });

      // 5. Registrar gasto en banco
      const gastoRef = doc(collection(db, 'gastos'));
      transaction.set(gastoRef, {
        bancoId: bancoOrigenId,
        tipo: 'pago_distribuidor',
        concepto: `Pago a distribuidor`,
        descripcion: `Pago de ${montoPago} USD a distribuidor ${distribuidorId}`,
        monto: montoPago,
        distribuidorId,
        pagoId: pagoRef.id,
        fecha: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      return { id: pagoRef.id, ...pagoData };
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    throw error;
  }
};

/**
 * Saldar por completo deuda de distribuidor
 */
export const saldarDeudaCompleta = async (distribuidorId, bancoOrigenId, metodoPago = 'transferencia') => {
  try {
    const distribuidor = await getDistribuidor(distribuidorId);

    if (distribuidor.adeudoTotal <= 0) {
      throw new Error('El distribuidor no tiene adeudos pendientes');
    }

    return await registrarPagoDistribuidor(
      distribuidorId,
      distribuidor.adeudoTotal,
      bancoOrigenId,
      metodoPago,
      'Saldo completo de deuda'
    );
  } catch (error) {
    console.error('Error al saldar deuda completa:', error);
    throw error;
  }
};

// ============================================================================
// ELIMINACIÓN (DELETE)
// ============================================================================

/**
 * Eliminar distribuidor (solo si no tiene adeudos)
 */
export const deleteDistribuidor = async (id) => {
  try {
    const distribuidor = await getDistribuidor(id);

    if (distribuidor.adeudoTotal > 0) {
      throw new Error('No se puede eliminar un distribuidor con adeudos pendientes');
    }

    await deleteDoc(doc(db, COLLECTION, id));
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar distribuidor:', error);
    throw error;
  }
};

/**
 * Desactivar distribuidor
 */
export const desactivarDistribuidor = async (id) => {
  try {
    return await updateDistribuidor(id, { activo: false });
  } catch (error) {
    console.error('Error al desactivar distribuidor:', error);
    throw error;
  }
};

export default {
  getDistribuidores,
  getDistribuidor,
  searchDistribuidores,
  getPagosDistribuidor,
  getAdeudosDistribuidor,
  createDistribuidor,
  updateDistribuidor,
  registrarAdeudo,
  registrarPagoDistribuidor,
  saldarDeudaCompleta,
  deleteDistribuidor,
  desactivarDistribuidor,
};
