/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                         HOOK: useBancos V2                                 ║
 * ║          Hook actualizado para usar colecciones Firestore reales          ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import * as BancosService from '../services/bancos-v2.service'

// Try to import toast - fallback to console if not available
let toast = {
  success: (msg) => console.log('✅', msg),
  error: (msg) => console.error('❌', msg)
}

try {
  const toastModule = require('react-hot-toast')
  if (toastModule.default) {
    toast = toastModule.default
  }
} catch (e) {
  // Fallback already set
}

// ==================== QUERY KEYS ====================
export const BANCOS_KEYS = {
  all: ['bancos'],
  lists: () => [...BANCOS_KEYS.all, 'list'],
  list: (filters) => [...BANCOS_KEYS.lists(), { filters }],
  details: () => [...BANCOS_KEYS.all, 'detail'],
  detail: (id) => [...BANCOS_KEYS.details(), id],
  movimientos: (bancoId) => [...BANCOS_KEYS.all, 'movimientos', bancoId],
  ingresos: (bancoId) => [...BANCOS_KEYS.all, 'ingresos', bancoId],
  gastos: (bancoId) => [...BANCOS_KEYS.all, 'gastos', bancoId],
  transferencias: (bancoId) => [...BANCOS_KEYS.all, 'transferencias', bancoId],
  saldos: () => [...BANCOS_KEYS.all, 'saldos'],
  rfActual: () => [...BANCOS_KEYS.all, 'rfActual'],
  balance: () => [...BANCOS_KEYS.all, 'balance'],
}

// ==================== HOOK PRINCIPAL ====================

/**
 * Hook principal para gestionar un banco específico
 * @param {string} bancoId - ID del banco (profit, boveda_monte, etc.)
 * @param {object} options - Opciones del hook
 * @param {boolean} options.realTime - Si se debe usar suscripción en tiempo real
 */
export function useBanco(bancoId, { realTime = false } = {}) {
  const queryClient = useQueryClient()

  // Query para obtener banco
  const { data: banco, isLoading: cargandoBanco } = useQuery({
    queryKey: BANCOS_KEYS.detail(bancoId),
    queryFn: () => BancosService.getBanco(bancoId),
    enabled: !!bancoId,
  })

  // Obtener ingresos (con o sin tiempo real)
  const [ingresosRealTime, setIngresosRealTime] = useState([])

  useEffect(() => {
    if (!realTime || !bancoId) return

    const unsubscribe = BancosService.subscribeToIngresos(bancoId, (data) => {
      setIngresosRealTime(data)
      queryClient.setQueryData(BANCOS_KEYS.ingresos(bancoId), data)
    })

    return () => unsubscribe()
  }, [bancoId, realTime, queryClient])

  const ingresosQuery = useQuery({
    queryKey: BANCOS_KEYS.ingresos(bancoId),
    queryFn: () => BancosService.getIngresos(bancoId),
    enabled: !!bancoId && !realTime,
    staleTime: 1 * 60 * 1000, // 1 minuto
  })

  // Obtener gastos (con o sin tiempo real)
  const [gastosRealTime, setGastosRealTime] = useState([])

  useEffect(() => {
    if (!realTime || !bancoId) return

    const unsubscribe = BancosService.subscribeToGastos(bancoId, (data) => {
      setGastosRealTime(data)
      queryClient.setQueryData(BANCOS_KEYS.gastos(bancoId), data)
    })

    return () => unsubscribe()
  }, [bancoId, realTime, queryClient])

  const gastosQuery = useQuery({
    queryKey: BANCOS_KEYS.gastos(bancoId),
    queryFn: () => BancosService.getGastos(bancoId),
    enabled: !!bancoId && !realTime,
    staleTime: 1 * 60 * 1000,
  })

  // Query para transferencias
  const { data: transferencias = [], isLoading: cargandoTransferencias } = useQuery({
    queryKey: BANCOS_KEYS.transferencias(bancoId),
    queryFn: () => BancosService.getTransferencias(bancoId),
    enabled: !!bancoId,
  })

  // Query para totales
  const { data: totales = {} } = useQuery({
    queryKey: ['totales', bancoId],
    queryFn: () => BancosService.calcularTotalesBanco(bancoId),
    enabled: !!bancoId,
  })

  // Crear ingreso
  const crearIngreso = useMutation({
    mutationFn: (data) => BancosService.crearIngreso(bancoId, data),
    onSuccess: () => {
      if (!realTime) {
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.ingresos(bancoId) })
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.detail(bancoId) })
      }
      toast.success('✅ Ingreso creado exitosamente')
    },
    onError: (error) => {
      toast.error(`❌ Error al crear ingreso: ${error.message}`)
      console.error(error)
    },
  })

  // Actualizar ingreso
  const actualizarIngreso = useMutation({
    mutationFn: ({ ingresoId, data }) => BancosService.actualizarIngreso(bancoId, ingresoId, data),
    onSuccess: () => {
      if (!realTime) {
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.ingresos(bancoId) })
      }
      toast.success('✅ Ingreso actualizado exitosamente')
    },
    onError: (error) => {
      toast.error(`❌ Error al actualizar ingreso: ${error.message}`)
      console.error(error)
    },
  })

  // Crear gasto
  const crearGasto = useMutation({
    mutationFn: (data) => BancosService.crearGasto(bancoId, data),
    onSuccess: () => {
      if (!realTime) {
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.gastos(bancoId) })
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.detail(bancoId) })
      }
      toast.success('✅ Gasto creado exitosamente')
    },
    onError: (error) => {
      toast.error(`❌ Error al crear gasto: ${error.message}`)
      console.error(error)
    },
  })

  // Actualizar gasto
  const actualizarGasto = useMutation({
    mutationFn: ({ gastoId, data }) => BancosService.actualizarGasto(bancoId, gastoId, data),
    onSuccess: () => {
      if (!realTime) {
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.gastos(bancoId) })
      }
      toast.success('✅ Gasto actualizado exitosamente')
    },
    onError: (error) => {
      toast.error(`❌ Error al actualizar gasto: ${error.message}`)
      console.error(error)
    },
  })

  // Crear transferencia
  const crearTransferencia = useMutation({
    mutationFn: (data) => BancosService.crearTransferencia({ ...data, bancoOrigen: bancoId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.all })
      toast.success('✅ Transferencia realizada')
    },
    onError: (error) => {
      toast.error(`❌ Error: ${error.message}`)
    },
  })

  // Eliminar ingreso
  const eliminarIngreso = useMutation({
    mutationFn: (ingresoId) => BancosService.eliminarIngreso(bancoId, ingresoId),
    onSuccess: () => {
      if (!realTime) {
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.ingresos(bancoId) })
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.detail(bancoId) })
      }
      toast.success('🗑️ Ingreso eliminado')
    },
    onError: (error) => {
      toast.error(`❌ Error al eliminar ingreso: ${error.message}`)
      console.error(error)
    },
  })

  // Eliminar gasto
  const eliminarGasto = useMutation({
    mutationFn: (gastoId) => BancosService.eliminarGasto(bancoId, gastoId),
    onSuccess: () => {
      if (!realTime) {
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.gastos(bancoId) })
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.detail(bancoId) })
      }
      toast.success('🗑️ Gasto eliminado')
    },
    onError: (error) => {
      toast.error(`❌ Error al eliminar gasto: ${error.message}`)
      console.error(error)
    },
  })

  const ingresos = realTime ? ingresosRealTime : (ingresosQuery.data || [])
  const gastos = realTime ? gastosRealTime : (gastosQuery.data || [])
  const cargando = cargandoBanco || ingresosQuery.isLoading || gastosQuery.isLoading || cargandoTransferencias

  return {
    banco,
    ingresos,
    gastos,
    transferencias,
    totales,
    crearIngreso,
    crearGasto,
    crearTransferencia,
    actualizarIngreso,
    actualizarGasto,
    eliminarIngreso,
    eliminarGasto,
    cargando,
    error: null,
  }
}

/**
 * Hook para obtener todos los bancos
 * Compatible con BancosTransacciones y BancosAnalytics
 */
export function useBancos() {
  const { data: bancos = [], isLoading: cargando } = useQuery({
    queryKey: BANCOS_KEYS.lists(),
    queryFn: () => BancosService.getTodosBancos(),
  })

  return { bancos, cargando }
}

/**
 * Hook para obtener movimientos bancarios
 */
export function useMovimientosBancarios(bancoId, filters = {}) {
  return useQuery({
    queryKey: BANCOS_KEYS.movimientos(bancoId),
    queryFn: () => BancosService.getMovimientosBancarios(bancoId, filters),
    enabled: !!bancoId,
  })
}

/**
 * Hook para obtener cuentas bancarias (alias de useBancos)
 */
export function useCuentasBancarias() {
  return useBancos()
}

/**
 * Hook para obtener cuenta bancaria por ID (alias de useBanco)
 */
export function useCuentaBancaria(cuentaId) {
  const { banco, cargando } = useBanco(cuentaId)
  return { data: banco, isLoading: cargando }
}

/**
 * Hook para obtener saldo total de bancos
 */
export function useSaldoTotalBancos() {
  return useQuery({
    queryKey: BANCOS_KEYS.balance(),
    queryFn: () => BancosService.getSaldoTotalBancos(),
    staleTime: 1 * 60 * 1000, // 1 minuto
  })
}

// ==================== MUTATIONS ====================

/**
 * Hook para crear movimiento bancario (alias)
 */
export function useCreateMovimientoBancario() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ bancoId, ...data }) => BancosService.createMovimientoBancario(bancoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.all })
      toast.success('✅ Movimiento bancario registrado')
    },
    onError: (error) => {
      toast.error(`❌ Error al crear movimiento: ${error.message}`)
    },
  })
}

/**
 * Hook para crear cuenta bancaria
 */
export function useCreateCuentaBancaria() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (cuentaData) => BancosService.createCuentaBancaria(cuentaData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.all })
      toast.success('✅ Cuenta bancaria creada')
    },
    onError: (error) => {
      toast.error(`❌ Error al crear cuenta: ${error.message}`)
    },
  })
}

/**
 * Hook para actualizar cuenta bancaria
 */
export function useUpdateCuentaBancaria() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, ...updates }) => BancosService.updateCuentaBancaria(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.all })
      toast.success('✅ Cuenta actualizada')
    },
    onError: (error) => {
      toast.error(`❌ Error al actualizar: ${error.message}`)
    },
  })
}

/**
 * Hook para eliminar movimiento bancario
 */
export function useDeleteMovimientoBancario() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ bancoId, movimientoId }) => BancosService.deleteMovimientoBancario(bancoId, movimientoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.all })
      toast.success('🗑️ Movimiento eliminado')
    },
    onError: (error) => {
      toast.error(`❌ Error al eliminar: ${error.message}`)
    },
  })
}

/**
 * Hook para eliminar cuenta bancaria
 */
export function useDeleteCuentaBancaria() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (cuentaId) => BancosService.deleteCuentaBancaria(cuentaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.all })
      toast.success('🗑️ Cuenta eliminada')
    },
    onError: (error) => {
      toast.error(`❌ Error al eliminar: ${error.message}`)
    },
  })
}
