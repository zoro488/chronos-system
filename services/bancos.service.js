/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                         BANCOS SERVICE                                     ║
 * ║         Servicio completo para gestión de cuentas bancarias               ║
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
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

// ✅ Importar db de la configuración de chronos-system
import { db } from '../config/firebase';

const COLLECTION = 'movimientosBancarios';
const CUENTAS_COLLECTION = 'cuentasBancarias';

/**
 * Obtener todos los movimientos bancarios con filtros
 */
export const getMovimientosBancarios = async (filters = {}) => {
  try {
    let q = collection(db, COLLECTION);
    const constraints = [];

    if (filters.cuentaId) {
      constraints.push(where('cuentaId', '==', filters.cuentaId));
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
    const movimientos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate?.() || doc.data().fecha,
    }));

    // Filtros del lado del cliente
    let result = movimientos;

    if (filters.montoMin) {
      result = result.filter((m) => Math.abs(m.monto) >= filters.montoMin);
    }

    if (filters.montoMax) {
      result = result.filter((m) => Math.abs(m.monto) <= filters.montoMax);
    }

    return result;
  } catch (error) {
    console.error('Error al obtener movimientos bancarios:', error);
    throw error;
  }
};

/**
 * Obtener todas las cuentas bancarias
 */
export const getCuentasBancarias = async () => {
  try {
    const snapshot = await getDocs(collection(db, CUENTAS_COLLECTION));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error al obtener cuentas bancarias:', error);
    throw error;
  }
};

/**
 * Obtener cuenta bancaria por ID
 */
export const getCuentaBancaria = async (id) => {
  try {
    const docRef = doc(db, CUENTAS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Cuenta bancaria no encontrada');
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error('Error al obtener cuenta bancaria:', error);
    throw error;
  }
};

/**
 * Obtener saldo total de todas las cuentas
 */
export const getSaldoTotalBancos = async () => {
  try {
    const cuentas = await getCuentasBancarias();
    return cuentas.reduce((total, cuenta) => total + (cuenta.saldo || 0), 0);
  } catch (error) {
    console.error('Error al obtener saldo total:', error);
    throw error;
  }
};

/**
 * Crear movimiento bancario
 */
export const createMovimientoBancario = async (movimientoData) => {
  try {
    const movimiento = {
      ...movimientoData,
      fecha: movimientoData.fecha || new Date(),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION), movimiento);

    // Actualizar saldo de la cuenta
    if (movimientoData.cuentaId) {
      await actualizarSaldoCuenta(movimientoData.cuentaId, movimientoData.monto);
    }

    return docRef.id;
  } catch (error) {
    console.error('Error al crear movimiento bancario:', error);
    throw error;
  }
};

/**
 * Crear cuenta bancaria
 */
export const createCuentaBancaria = async (cuentaData) => {
  try {
    const cuenta = {
      ...cuentaData,
      saldo: cuentaData.saldoInicial || 0,
      activa: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, CUENTAS_COLLECTION), cuenta);
    return docRef.id;
  } catch (error) {
    console.error('Error al crear cuenta bancaria:', error);
    throw error;
  }
};

/**
 * Actualizar cuenta bancaria
 */
export const updateCuentaBancaria = async (id, updates) => {
  try {
    const docRef = doc(db, CUENTAS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al actualizar cuenta bancaria:', error);
    throw error;
  }
};

/**
 * Actualizar saldo de cuenta (interno)
 */
const actualizarSaldoCuenta = async (cuentaId, monto) => {
  try {
    const cuenta = await getCuentaBancaria(cuentaId);
    const nuevoSaldo = (cuenta.saldo || 0) + monto;

    await updateCuentaBancaria(cuentaId, { saldo: nuevoSaldo });
  } catch (error) {
    console.error('Error al actualizar saldo:', error);
    throw error;
  }
};

/**
 * Eliminar movimiento bancario
 */
export const deleteMovimientoBancario = async (id) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar movimiento:', error);
    throw error;
  }
};

/**
 * Eliminar cuenta bancaria
 */
export const deleteCuentaBancaria = async (id) => {
  try {
    const docRef = doc(db, CUENTAS_COLLECTION, id);
    await updateDoc(docRef, {
      activa: false,
      deletedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    throw error;
  }
};

// ==================== NUEVAS FUNCIONES PARA COMPATIBILIDAD ====================

/**
 * Obtener banco por ID con todos sus datos
 */
export const getBanco = async (bancoId) => {
  try {
    const bancoDoc = await getDoc(doc(db, 'bancos', bancoId));
    if (!bancoDoc.exists()) {
      throw new Error('Banco no encontrado');
    }
    return { id: bancoDoc.id, ...bancoDoc.data() };
  } catch (error) {
    console.error('Error al obtener banco:', error);
    throw error;
  }
};

/**
 * Obtener todos los bancos
 */
export const getTodosBancos = async () => {
  try {
    const bancosRef = collection(db, 'bancos');
    const q = query(bancosRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error al obtener bancos:', error);
    throw error;
  }
};

/**
 * Obtener ingresos de un banco
 */
export const getIngresos = async (bancoId) => {
  try {
    const ingresosRef = collection(db, 'bancos', bancoId, 'ingresos');
    const q = query(ingresosRef, orderBy('fecha', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error al obtener ingresos:', error);
    throw error;
  }
};

/**
 * Obtener gastos de un banco
 */
export const getGastos = async (bancoId) => {
  try {
    const gastosRef = collection(db, 'bancos', bancoId, 'gastos');
    const q = query(gastosRef, orderBy('fecha', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    throw error;
  }
};

/**
 * Obtener transferencias de un banco
 */
export const getTransferencias = async (bancoId) => {
  try {
    const transferenciasRef = collection(db, 'bancos', bancoId, 'transferencias');
    const q = query(transferenciasRef, orderBy('fecha', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error al obtener transferencias:', error);
    throw error;
  }
};

/**
 * Crear ingreso
 */
export const crearIngreso = async (data) => {
  try {
    const { bancoId, ...ingresoData } = data;
    const ingresosRef = collection(db, 'bancos', bancoId, 'ingresos');
    const docRef = await addDoc(ingresosRef, {
      ...ingresoData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Actualizar saldo del banco
    const bancoRef = doc(db, 'bancos', bancoId);
    await updateDoc(bancoRef, {
      saldo: increment(Number(ingresoData.monto)),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error al crear ingreso:', error);
    throw error;
  }
};

/**
 * Crear gasto
 */
export const crearGasto = async (data) => {
  try {
    const { bancoId, ...gastoData } = data;
    const gastosRef = collection(db, 'bancos', bancoId, 'gastos');
    const docRef = await addDoc(gastosRef, {
      ...gastoData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Actualizar saldo del banco
    const bancoRef = doc(db, 'bancos', bancoId);
    await updateDoc(bancoRef, {
      saldo: increment(-Number(gastoData.monto)),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error al crear gasto:', error);
    throw error;
  }
};

/**
 * Crear transferencia
 */
export const crearTransferencia = async (data) => {
  try {
    const { bancoOrigenId, bancoDestinoId, monto, ...transferenciaData } = data;

    // Crear transferencia en banco origen
    const transferenciaRef = collection(db, 'bancos', bancoOrigenId, 'transferencias');
    const docRef = await addDoc(transferenciaRef, {
      ...transferenciaData,
      monto,
      bancoDestinoId,
      tipo: 'salida',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Crear transferencia en banco destino
    await addDoc(collection(db, 'bancos', bancoDestinoId, 'transferencias'), {
      ...transferenciaData,
      monto,
      bancoOrigenId,
      tipo: 'entrada',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Actualizar saldos
    await updateDoc(doc(db, 'bancos', bancoOrigenId), {
      saldo: increment(-Number(monto)),
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'bancos', bancoDestinoId), {
      saldo: increment(Number(monto)),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error al crear transferencia:', error);
    throw error;
  }
};

/**
 * Eliminar ingreso
 */
export const eliminarIngreso = async (ingresoId, bancoId) => {
  try {
    // Obtener el ingreso para restar su monto
    const ingresoDoc = await getDoc(doc(db, 'bancos', bancoId, 'ingresos', ingresoId));
    if (!ingresoDoc.exists()) {
      throw new Error('Ingreso no encontrado');
    }

    const monto = ingresoDoc.data().monto;

    // Eliminar ingreso
    await deleteDoc(doc(db, 'bancos', bancoId, 'ingresos', ingresoId));

    // Actualizar saldo del banco
    await updateDoc(doc(db, 'bancos', bancoId), {
      saldo: increment(-Number(monto)),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al eliminar ingreso:', error);
    throw error;
  }
};

/**
 * Eliminar gasto
 */
export const eliminarGasto = async (gastoId, bancoId) => {
  try {
    // Obtener el gasto para devolver su monto
    const gastoDoc = await getDoc(doc(db, 'bancos', bancoId, 'gastos', gastoId));
    if (!gastoDoc.exists()) {
      throw new Error('Gasto no encontrado');
    }

    const monto = gastoDoc.data().monto;

    // Eliminar gasto
    await deleteDoc(doc(db, 'bancos', bancoId, 'gastos', gastoId));

    // Actualizar saldo del banco
    await updateDoc(doc(db, 'bancos', bancoId), {
      saldo: increment(Number(monto)),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    throw error;
  }
};

export default {
  getMovimientosBancarios,
  getCuentasBancarias,
  getCuentaBancaria,
  getSaldoTotalBancos,
  createMovimientoBancario,
  createCuentaBancaria,
  updateCuentaBancaria,
  deleteMovimientoBancario,
  deleteCuentaBancaria,
  // Nuevas funciones
  getBanco,
  getTodosBancos,
  getIngresos,
  getGastos,
  getTransferencias,
  crearIngreso,
  crearGasto,
  crearTransferencia,
  eliminarIngreso,
  eliminarGasto,
};
