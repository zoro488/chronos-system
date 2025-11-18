import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, runTransaction, Timestamp, updateDoc, where } from 'firebase/firestore';
import { traceFirestoreOperation, traceTransaction } from '../config/tracing';
import { db } from '../config/firebase';

const BANCOS_COLLECTION = 'bancos';
const MOVIMIENTOS_COLLECTION = 'movimientosBancarios';

// ===================================================================
// FUNCIONES BANCARIAS COMPLETAS
// ===================================================================

/**
 * Obtener un banco por ID
 */
export async function getBanco(bancoId) {
  return traceFirestoreOperation('getBanco', BANCOS_COLLECTION, async (span) => {
    try {
      span.setAttribute('banco.id', bancoId);
      const docRef = doc(db, BANCOS_COLLECTION, bancoId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error(`Banco ${bancoId} no encontrado`);
      }

      const result = { id: docSnap.id, ...docSnap.data() };
      span.setAttribute('banco.nombre', result.nombre);
      return result;
    } catch (error) {
      console.error('Error en getBanco:', error);
      throw error;
    }
  });
}

/**
 * Obtener todos los bancos
 */
export async function getTodosBancos() {
  return traceFirestoreOperation('getTodosBancos', BANCOS_COLLECTION, async (span) => {
    try {
      const bancosRef = collection(db, BANCOS_COLLECTION);
      const snapshot = await getDocs(bancosRef);
      const bancos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      span.setAttribute('bancos.count', bancos.length);
      return bancos;
    } catch (error) {
      console.error('Error en getTodosBancos:', error);
      throw error;
    }
  });
}

/**
 * Obtener movimientos bancarios de un banco
 */
export async function getMovimientosBancarios(bancoId, filters = {}) {
  try {
    const movimientosRef = collection(db, MOVIMIENTOS_COLLECTION);
    let q = query(movimientosRef, where('bancoId', '==', bancoId));

    if (filters.tipo) {
      q = query(q, where('tipo', '==', filters.tipo));
    }

    if (filters.limit) {
      q = query(q, orderBy('fecha', 'desc'), limit(filters.limit));
    } else {
      q = query(q, orderBy('fecha', 'desc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error en getMovimientosBancarios:', error);
    throw error;
  }
}

/**
 * Obtener transferencias de un banco
 */
export async function getTransferencias(bancoId) {
  try {
    const movimientosRef = collection(db, MOVIMIENTOS_COLLECTION);
    const q = query(
      movimientosRef,
      where('bancoId', '==', bancoId),
      where('tipo', 'in', ['TRANSFERENCIA_ENTRADA', 'TRANSFERENCIA_SALIDA']),
      orderBy('fecha', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error en getTransferencias:', error);
    throw error;
  }
}

/**
 * Crear transferencia entre bancos (transacción atómica)
 */
export async function crearTransferencia({ bancoOrigen, bancoDestino, monto, concepto }) {
  return traceTransaction('crearTransferencia', async () => {
    try {
      // 🔒 VALIDACIÓN 1: Todos los campos requeridos
      if (!bancoOrigen || !bancoDestino || !monto || !concepto) {
        throw new Error('Todos los campos son requeridos');
      }

      // 🔒 VALIDACIÓN 2: Monto debe ser positivo
      if (monto <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }

      // 🔒 VALIDACIÓN 3: No permitir transferencias al mismo banco
      if (bancoOrigen === bancoDestino) {
        throw new Error('No puedes transferir al mismo banco de origen');
      }

      // Ejecutar transacción atómica
      return await runTransaction(db, async (transaction) => {
        const origenRef = doc(db, BANCOS_COLLECTION, bancoOrigen);
        const destinoRef = doc(db, BANCOS_COLLECTION, bancoDestino);

        const origenSnap = await transaction.get(origenRef);
        const destinoSnap = await transaction.get(destinoRef);

        if (!origenSnap.exists() || !destinoSnap.exists()) {
          throw new Error('Uno o ambos bancos no existen');
        }

        const origenData = origenSnap.data();
        const destinoData = destinoSnap.data();

        if (origenData.capitalActual < monto) {
          throw new Error(`Fondos insuficientes. Disponible: $${origenData.capitalActual}, Requerido: $${monto}`);
        }

        const fecha = Timestamp.now();

        // Crear movimientos
        const salidaRef = doc(collection(db, MOVIMIENTOS_COLLECTION));
        const entradaRef = doc(collection(db, MOVIMIENTOS_COLLECTION));

        transaction.set(salidaRef, {
          bancoId: bancoOrigen,
          tipo: 'TRANSFERENCIA_SALIDA',
          monto: -monto,
          destino: bancoDestino,
          concepto,
          fecha,
          createdAt: fecha,
        });

        transaction.set(entradaRef, {
          bancoId: bancoDestino,
          tipo: 'TRANSFERENCIA_ENTRADA',
          monto,
          origen: bancoOrigen,
          concepto,
          fecha,
          createdAt: fecha,
        });

        // Actualizar saldos
        transaction.update(origenRef, {
          capitalActual: origenData.capitalActual - monto,
          updatedAt: fecha,
        });

        transaction.update(destinoRef, {
          capitalActual: destinoData.capitalActual + monto,
          updatedAt: fecha,
        });

        return {
          salidaId: salidaRef.id,
          entradaId: entradaRef.id,
        };
      });
    } catch (error) {
      console.error('Error en crearTransferencia:', error);
      throw error;
    }
  });
}

/**
 * Obtener saldo total de todos los bancos
 */
export async function getSaldoTotalBancos() {
  try {
    const bancos = await getTodosBancos();
    return bancos.reduce((total, banco) => total + (banco.capitalActual || 0), 0);
  } catch (error) {
    console.error('Error en getSaldoTotalBancos:', error);
    throw error;
  }
}

/**
 * Calcular totales de un banco
 */
export async function calcularTotalesBanco(bancoId) {
  try {
    const banco = await getBanco(bancoId);
    const movimientos = await getMovimientosBancarios(bancoId);

    const totales = movimientos.reduce(
      (acc, mov) => {
        switch (mov.tipo) {
          case 'INGRESO':
            acc.totalIngresos += mov.monto;
            break;
          case 'GASTO':
            acc.totalGastos += Math.abs(mov.monto);
            break;
          case 'TRANSFERENCIA_ENTRADA':
            acc.totalTransferenciasEntrada += mov.monto;
            break;
          case 'TRANSFERENCIA_SALIDA':
            acc.totalTransferenciasSalida += Math.abs(mov.monto);
            break;
        }
        return acc;
      },
      {
        totalIngresos: 0,
        totalGastos: 0,
        totalTransferenciasEntrada: 0,
        totalTransferenciasSalida: 0,
      }
    );

    return {
      ...totales,
      capitalActual: banco.capitalActual,
      nombreBanco: banco.nombre,
    };
  } catch (error) {
    console.error('Error en calcularTotalesBanco:', error);
    throw error;
  }
}

// ===================================================================
// ALIASES (para compatibilidad)
// ===================================================================
export const getCuentasBancarias = getTodosBancos;
export const getCuentaBancaria = getBanco;

export const createMovimientoBancario = async (data) => {
  const movimientosRef = collection(db, MOVIMIENTOS_COLLECTION);
  const docRef = await addDoc(movimientosRef, {
    ...data,
    fecha: Timestamp.now(),
    createdAt: Timestamp.now(),
  });
  return { id: docRef.id, ...data };
};

export const createCuentaBancaria = async (data) => {
  const bancosRef = collection(db, BANCOS_COLLECTION);
  const docRef = await addDoc(bancosRef, {
    ...data,
    capitalActual: data.capitalActual || 0,
    historicoIngresos: 0,
    historicoGastos: 0,
    createdAt: Timestamp.now(),
  });
  return { id: docRef.id, ...data };
};

export const updateCuentaBancaria = async (bancoId, data) => {
  const docRef = doc(db, BANCOS_COLLECTION, bancoId);
  await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
  return { id: bancoId, ...data };
};

export const deleteMovimientoBancario = async (movimientoId) => {
  const movimientoRef = doc(db, MOVIMIENTOS_COLLECTION, movimientoId);
  await deleteDoc(movimientoRef);
  return { id: movimientoId };
};

export const deleteCuentaBancaria = async (bancoId) => {
  const docRef = doc(db, BANCOS_COLLECTION, bancoId);
  await deleteDoc(docRef);
  return { id: bancoId };
};

/**
 * Suscripción en tiempo real a un banco (RF Actual)
 */
export function subscribeToRFActual(bancoId, callback) {
  const docRef = doc(db, BANCOS_COLLECTION, bancoId);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    } else {
      callback(null);
    }
  });
}
