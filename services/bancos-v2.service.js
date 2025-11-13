/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                   BANCOS SERVICE V2 - FIRESTORE REAL                       ║
 * ║       Servicio actualizado para usar las colecciones migradas              ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Colecciones Firestore:
 * - {banco}_ingresos: Ingresos de cada banco
 * - {banco}_gastos: Gastos de cada banco
 * - rf_actual: Estado actual con totales
 *
 * Bancos disponibles:
 * - almacen_monte
 * - boveda_monte
 * - boveda_usa
 * - azteca
 * - utilidades
 * - flete_sur
 * - leftie
 * - profit
 */
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc
} from 'firebase/firestore'
import { db } from '../config/firebase'

// ==================== MAPEO DE BANCOS ====================

const BANCO_COLLECTIONS = {
  almacen_monte: 'almacen_monte',
  boveda_monte: 'boveda_monte',
  boveda_usa: 'boveda_usa',
  azteca: 'azteca',
  utilidades: 'utilidades',
  flete_sur: 'flete_sur',
  leftie: 'leftie',
  profit: 'profit'
}

const BANCO_NAMES = {
  almacen_monte: 'Almacén Monte',
  boveda_monte: 'Bóveda Monte',
  boveda_usa: 'Bóveda USA',
  azteca: 'Azteca',
  utilidades: 'Utilidades',
  flete_sur: 'Flete Sur',
  leftie: 'Leftie',
  profit: 'Profit'
}

// ==================== HELPERS ====================

function getBancoCollections(bancoId) {
  const baseCollection = BANCO_COLLECTIONS[bancoId]

  if (!baseCollection) {
    throw new Error(`Banco inválido: ${bancoId}`)
  }

  return {
    ingresos: `${baseCollection}_ingresos`,
    gastos: `${baseCollection}_gastos`
  }
}

// ==================== RF ACTUAL (TOTALES DEL SISTEMA) ====================

/**
 * Obtener estado actual del sistema (RF Actual)
 */
export async function getRFActual() {
  try {
    const docRef = doc(db, 'rf_actual', 'rf_actual')
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    }
  } catch (error) {
    console.error('Error obteniendo RF Actual:', error)
    throw error
  }
}

/**
 * Suscripción en tiempo real a RF Actual
 */
export function subscribeToRFActual(callback) {
  const docRef = doc(db, 'rf_actual', 'rf_actual')

  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({
        id: doc.id,
        ...doc.data()
      })
    } else {
      callback(null)
    }
  }, (error) => {
    console.error('Error en suscripción RF Actual:', error)
    callback(null)
  })
}

// ==================== INGRESOS ====================

/**
 * Obtener todos los ingresos de un banco
 */
export async function getIngresos(bancoId) {
  try {
    const collections = getBancoCollections(bancoId)
    const q = query(
      collection(db, collections.ingresos),
      orderBy('Fecha', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Normalizar fecha
      fecha: doc.data().Fecha?.toDate?.() || doc.data().fecha?.toDate?.() || new Date(doc.data().Fecha || doc.data().fecha)
    }))
  } catch (error) {
    console.error(`Error obteniendo ingresos de ${bancoId}:`, error)
    return []
  }
}

/**
 * Suscripción en tiempo real a ingresos
 */
export function subscribeToIngresos(bancoId, callback) {
  try {
    const collections = getBancoCollections(bancoId)
    const q = query(
      collection(db, collections.ingresos),
      orderBy('Fecha', 'desc'),
      limit(100) // Limitar para performance
    )

    return onSnapshot(q, (snapshot) => {
      const ingresos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha: doc.data().Fecha?.toDate?.() || doc.data().fecha?.toDate?.() || new Date(doc.data().Fecha || doc.data().fecha)
      }))
      callback(ingresos)
    }, (error) => {
      console.error('Error en suscripción ingresos:', error)
      callback([])
    })
  } catch (error) {
    console.error('Error configurando suscripción ingresos:', error)
    return () => {}
  }
}

/**
 * Crear nuevo ingreso
 */
export async function crearIngreso(bancoId, data) {
  try {
    const collections = getBancoCollections(bancoId)

    const ingreso = {
      ...data,
      Fecha: data.Fecha || new Date(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      source: 'app_web'
    }

    const docRef = await addDoc(collection(db, collections.ingresos), ingreso)

    return {
      id: docRef.id,
      ...ingreso
    }
  } catch (error) {
    console.error('Error creando ingreso:', error)
    throw error
  }
}

/**
 * Actualizar ingreso
 */
export async function actualizarIngreso(bancoId, ingresoId, data) {
  try {
    const collections = getBancoCollections(bancoId)
    const docRef = doc(db, collections.ingresos, ingresoId)

    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    })

    return true
  } catch (error) {
    console.error('Error actualizando ingreso:', error)
    throw error
  }
}

/**
 * Eliminar ingreso
 */
export async function eliminarIngreso(bancoId, ingresoId) {
  try {
    const collections = getBancoCollections(bancoId)
    const docRef = doc(db, collections.ingresos, ingresoId)

    await deleteDoc(docRef)

    return true
  } catch (error) {
    console.error('Error eliminando ingreso:', error)
    throw error
  }
}

// ==================== GASTOS ====================

/**
 * Obtener todos los gastos de un banco
 */
export async function getGastos(bancoId) {
  try {
    const collections = getBancoCollections(bancoId)
    const q = query(
      collection(db, collections.gastos),
      orderBy('Fecha', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().Fecha?.toDate?.() || doc.data().fecha?.toDate?.() || new Date(doc.data().Fecha || doc.data().fecha)
    }))
  } catch (error) {
    console.error(`Error obteniendo gastos de ${bancoId}:`, error)
    return []
  }
}

/**
 * Suscripción en tiempo real a gastos
 */
export function subscribeToGastos(bancoId, callback) {
  try {
    const collections = getBancoCollections(bancoId)
    const q = query(
      collection(db, collections.gastos),
      orderBy('Fecha', 'desc'),
      limit(100)
    )

    return onSnapshot(q, (snapshot) => {
      const gastos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha: doc.data().Fecha?.toDate?.() || doc.data().fecha?.toDate?.() || new Date(doc.data().Fecha || doc.data().fecha)
      }))
      callback(gastos)
    }, (error) => {
      console.error('Error en suscripción gastos:', error)
      callback([])
    })
  } catch (error) {
    console.error('Error configurando suscripción gastos:', error)
    return () => {}
  }
}

/**
 * Crear nuevo gasto
 */
export async function crearGasto(bancoId, data) {
  try {
    const collections = getBancoCollections(bancoId)

    const gasto = {
      ...data,
      Fecha: data.Fecha || new Date(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      source: 'app_web'
    }

    const docRef = await addDoc(collection(db, collections.gastos), gasto)

    return {
      id: docRef.id,
      ...gasto
    }
  } catch (error) {
    console.error('Error creando gasto:', error)
    throw error
  }
}

/**
 * Actualizar gasto
 */
export async function actualizarGasto(bancoId, gastoId, data) {
  try {
    const collections = getBancoCollections(bancoId)
    const docRef = doc(db, collections.gastos, gastoId)

    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    })

    return true
  } catch (error) {
    console.error('Error actualizando gasto:', error)
    throw error
  }
}

/**
 * Eliminar gasto
 */
export async function eliminarGasto(bancoId, gastoId) {
  try {
    const collections = getBancoCollections(bancoId)
    const docRef = doc(db, collections.gastos, gastoId)

    await deleteDoc(docRef)

    return true
  } catch (error) {
    console.error('Error eliminando gasto:', error)
    throw error
  }
}

// ==================== ESTADÍSTICAS ====================

/**
 * Calcular totales de un banco
 */
export async function calcularTotalesBanco(bancoId) {
  try {
    const [ingresos, gastos] = await Promise.all([
      getIngresos(bancoId),
      getGastos(bancoId)
    ])

    const totalIngresos = ingresos.reduce((sum, ing) => {
      const monto = parseFloat(ing.Ingreso || ing.ingreso || ing.Monto || ing.monto || 0)
      return sum + monto
    }, 0)

    const totalGastos = gastos.reduce((sum, gas) => {
      const monto = parseFloat(gas.Gasto || gas.gasto || gas.Monto || gas.monto || 0)
      return sum + monto
    }, 0)

    return {
      totalIngresos,
      totalGastos,
      balance: totalIngresos - totalGastos,
      cantidadIngresos: ingresos.length,
      cantidadGastos: gastos.length
    }
  } catch (error) {
    console.error('Error calculando totales:', error)
    return {
      totalIngresos: 0,
      totalGastos: 0,
      balance: 0,
      cantidadIngresos: 0,
      cantidadGastos: 0
    }
  }
}

// ==================== UTILIDADES ====================

export {
    BANCO_COLLECTIONS,
    BANCO_NAMES
}

export function getBancoName(bancoId) {
  return BANCO_NAMES[bancoId] || bancoId
}

export function getAllBancosIds() {
  return Object.keys(BANCO_COLLECTIONS)
}
