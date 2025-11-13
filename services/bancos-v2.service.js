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
    runTransaction,
    serverTimestamp,
    updateDoc,
    where
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

// ==================== MISSING FUNCTIONS (COMPATIBILIDAD) ====================

/**
 * Obtener un banco específico por ID
 * @param {string} bancoId - ID del banco
 * @returns {Promise<Object>} Datos del banco
 */
export async function getBanco(bancoId) {
  try {
    if (!BANCO_COLLECTIONS[bancoId]) {
      throw new Error(`Banco no encontrado: ${bancoId}`)
    }

    const totales = await calcularTotalesBanco(bancoId)
    
    return {
      id: bancoId,
      nombre: BANCO_NAMES[bancoId],
      capitalActual: totales.balance,
      historicoIngresos: totales.totalIngresos,
      historicoGastos: totales.totalGastos,
      ...totales
    }
  } catch (error) {
    console.error('Error obteniendo banco:', error)
    throw error
  }
}

/**
 * Obtener todos los bancos disponibles
 * @returns {Promise<Array>} Lista de bancos
 */
export async function getTodosBancos() {
  try {
    const bancoIds = getAllBancosIds()
    const bancosPromises = bancoIds.map(id => getBanco(id).catch(() => null))
    const bancos = await Promise.all(bancosPromises)
    
    return bancos.filter(Boolean)
  } catch (error) {
    console.error('Error obteniendo todos los bancos:', error)
    return []
  }
}

/**
 * Obtener movimientos bancarios con filtros
 * @param {string} bancoId - ID del banco
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Lista de movimientos
 */
export async function getMovimientosBancarios(bancoId, filters = {}) {
  try {
    const [ingresos, gastos] = await Promise.all([
      getIngresos(bancoId),
      getGastos(bancoId)
    ])

    let movimientos = [
      ...ingresos.map(ing => ({
        ...ing,
        tipo: 'INGRESO',
        monto: parseFloat(ing.Ingreso || ing.ingreso || 0)
      })),
      ...gastos.map(gas => ({
        ...gas,
        tipo: 'GASTO',
        monto: parseFloat(gas.Gasto || gas.gasto || 0)
      }))
    ]

    // Aplicar filtros
    if (filters.tipo) {
      movimientos = movimientos.filter(m => m.tipo === filters.tipo)
    }

    // Ordenar por fecha descendente
    movimientos.sort((a, b) => {
      const dateA = a.fecha || new Date(0)
      const dateB = b.fecha || new Date(0)
      return dateB - dateA
    })

    return movimientos
  } catch (error) {
    console.error('Error obteniendo movimientos bancarios:', error)
    return []
  }
}

/**
 * Obtener transferencias de un banco
 * @param {string} bancoId - ID del banco
 * @returns {Promise<Array>} Lista de transferencias
 */
export async function getTransferencias(bancoId) {
  try {
    return await getMovimientosBancarios(bancoId, { tipo: 'TRANSFERENCIA_ENTRADA' })
  } catch (error) {
    console.error('Error obteniendo transferencias:', error)
    return []
  }
}

/**
 * Crear una transferencia entre bancos
 * @param {Object} data - Datos de la transferencia
 * @returns {Promise<Object>} Resultado de la transferencia
 */
export async function crearTransferencia(data) {
  try {
    const { bancoOrigen, bancoDestino, monto, concepto, fecha = new Date() } = data

    // Validar bancos
    if (!BANCO_COLLECTIONS[bancoOrigen] || !BANCO_COLLECTIONS[bancoDestino]) {
      throw new Error('Bancos inválidos')
    }

    // Validar monto
    if (!monto || monto <= 0) {
      throw new Error('Monto inválido')
    }

    // Obtener saldo del banco origen
    const bancoOrigenData = await getBanco(bancoOrigen)
    if (bancoOrigenData.capitalActual < monto) {
      throw new Error('Fondos insuficientes en banco origen')
    }

    // Crear gasto en banco origen
    await crearGasto(bancoOrigen, {
      Concepto: concepto || `Transferencia a ${BANCO_NAMES[bancoDestino]}`,
      Gasto: monto,
      Fecha: fecha,
      Categoria: 'Transferencia',
      Referencia: `TRANSFER_TO_${bancoDestino}`,
      tipo: 'TRANSFERENCIA_SALIDA'
    })

    // Crear ingreso en banco destino
    await crearIngreso(bancoDestino, {
      Concepto: concepto || `Transferencia desde ${BANCO_NAMES[bancoOrigen]}`,
      Ingreso: monto,
      Fecha: fecha,
      Referencia: `TRANSFER_FROM_${bancoOrigen}`,
      tipo: 'TRANSFERENCIA_ENTRADA'
    })

    return {
      success: true,
      bancoOrigen,
      bancoDestino,
      monto,
      fecha
    }
  } catch (error) {
    console.error('Error creando transferencia:', error)
    throw error
  }
}

/**
 * Obtener saldo total de todos los bancos
 * @returns {Promise<number>} Saldo total
 */
export async function getSaldoTotalBancos() {
  try {
    const bancos = await getTodosBancos()
    return bancos.reduce((total, banco) => total + (banco.capitalActual || 0), 0)
  } catch (error) {
    console.error('Error obteniendo saldo total:', error)
    return 0
  }
}

/**
 * Crear cuenta bancaria (alias de getTodosBancos para compatibilidad)
 * @param {Object} data - Datos de la cuenta
 * @returns {Promise<Object>} Cuenta creada
 */
export async function createCuentaBancaria(data) {
  console.warn('createCuentaBancaria no está implementado - los bancos son estáticos')
  throw new Error('No se pueden crear bancos dinámicamente en esta versión')
}

/**
 * Actualizar cuenta bancaria
 * @param {string} bancoId - ID del banco
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<boolean>} Éxito de la operación
 */
export async function updateCuentaBancaria(bancoId, data) {
  console.warn('updateCuentaBancaria no está implementado - los bancos son estáticos')
  throw new Error('No se pueden actualizar bancos en esta versión')
}

/**
 * Eliminar cuenta bancaria
 * @param {string} bancoId - ID del banco
 * @returns {Promise<boolean>} Éxito de la operación
 */
export async function deleteCuentaBancaria(bancoId) {
  console.warn('deleteCuentaBancaria no está implementado - los bancos son estáticos')
  throw new Error('No se pueden eliminar bancos en esta versión')
}

// ==================== ALIASES DE COMPATIBILIDAD ====================

/**
 * Alias: getCuentasBancarias -> getTodosBancos
 */
export const getCuentasBancarias = getTodosBancos

/**
 * Alias: getCuentaBancaria -> getBanco
 */
export const getCuentaBancaria = getBanco

/**
 * Alias: createMovimientoBancario -> crearIngreso
 */
export const createMovimientoBancario = crearIngreso

/**
 * Alias: deleteMovimientoBancario -> eliminarIngreso
 */
export const deleteMovimientoBancario = eliminarIngreso

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
