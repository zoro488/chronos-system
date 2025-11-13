/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                         HOOK: useBancos V2                                 ║
 * ║          Hook actualizado para usar colecciones Firestore reales          ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import * as BancosService from '../services/bancos-v2.service'

// ==================== QUERY KEYS ====================
export const BANCOS_KEYS = {
  all: ['bancos'],
  lists: () => [...BANCOS_KEYS.all, 'list'],
  list: (filters) => [...BANCOS_KEYS.lists(), { filters }],
  details: () => [...BANCOS_KEYS.all, 'detail'],
  detail: (id) => [...BANCOS_KEYS.details(), id],
  ingresos: (bancoId) => [...BANCOS_KEYS.all, 'ingresos', bancoId],
  gastos: (bancoId) => [...BANCOS_KEYS.all, 'gastos', bancoId],
  totales: (bancoId) => [...BANCOS_KEYS.all, 'totales', bancoId],
  rfActual: () => [...BANCOS_KEYS.all, 'rfActual'],
}

// ==================== HOOK PRINCIPAL ====================

/**
 * Hook principal para gestionar un banco específico
 * @param {string} bancoId - ID del banco (profit, boveda_monte, etc.)
 * @param {object} options - Opciones del hook
 * @param {boolean} options.realTime - Si se debe usar suscripción en tiempo real (default: false)
 */
export function useBanco(bancoId, { realTime = false } = {}) {
  const queryClient = useQueryClient()

  // ==================== INGRESOS ====================
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

  const ingresos = realTime ? ingresosRealTime : (ingresosQuery.data || [])
  const cargandoIngresos = realTime ? false : ingresosQuery.isLoading

  // ==================== GASTOS ====================
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

  const gastos = realTime ? gastosRealTime : (gastosQuery.data || [])
  const cargandoGastos = realTime ? false : gastosQuery.isLoading

  // ==================== TOTALES ====================
  const totalesQuery = useQuery({
    queryKey: BANCOS_KEYS.totales(bancoId),
    queryFn: () => BancosService.calcularTotalesBanco(bancoId),
    enabled: !!bancoId,
    staleTime: 30 * 1000, // 30 segundos
  })

  // ==================== MUTATIONS ====================

  // Crear ingreso
  const crearIngreso = useMutation({
    mutationFn: (data) => BancosService.crearIngreso(bancoId, data),
    onSuccess: () => {
      if (!realTime) {
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.ingresos(bancoId) })
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.totales(bancoId) })
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
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.totales(bancoId) })
      }
      toast.success('✅ Ingreso actualizado exitosamente')
    },
    onError: (error) => {
      toast.error(`❌ Error al actualizar ingreso: ${error.message}`)
      console.error(error)
    },
  })

  // Eliminar ingreso
  const eliminarIngreso = useMutation({
    mutationFn: (ingresoId) => BancosService.eliminarIngreso(bancoId, ingresoId),
    onSuccess: () => {
      if (!realTime) {
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.ingresos(bancoId) })
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.totales(bancoId) })
      }
      toast.success('🗑️ Ingreso eliminado')
    },
    onError: (error) => {
      toast.error(`❌ Error al eliminar ingreso: ${error.message}`)
      console.error(error)
    },
  })

  // Crear gasto
  const crearGasto = useMutation({
    mutationFn: (data) => BancosService.crearGasto(bancoId, data),
    onSuccess: () => {
      if (!realTime) {
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.gastos(bancoId) })
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.totales(bancoId) })
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
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.totales(bancoId) })
      }
      toast.success('✅ Gasto actualizado exitosamente')
    },
    onError: (error) => {
      toast.error(`❌ Error al actualizar gasto: ${error.message}`)
      console.error(error)
    },
  })

  // Eliminar gasto
  const eliminarGasto = useMutation({
    mutationFn: (gastoId) => BancosService.eliminarGasto(bancoId, gastoId),
    onSuccess: () => {
      if (!realTime) {
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.gastos(bancoId) })
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.totales(bancoId) })
      }
      toast.success('🗑️ Gasto eliminado')
    },
    onError: (error) => {
      toast.error(`❌ Error al eliminar gasto: ${error.message}`)
      console.error(error)
    },
  })

  // ==================== RETURN ====================
  return {
    // Datos
    banco: {
      id: bancoId,
      nombre: BancosService.getBancoName(bancoId),
      ...totalesQuery.data,
    },
    ingresos,
    gastos,
    totales: totalesQuery.data || {},

    // Estados de carga
    cargando: cargandoIngresos || cargandoGastos || totalesQuery.isLoading,
    cargandoIngresos,
    cargandoGastos,
    cargandoTotales: totalesQuery.isLoading,

    // Mutations
    crearIngreso,
    actualizarIngreso,
    eliminarIngreso,
    crearGasto,
    actualizarGasto,
    eliminarGasto,

    // Estados de mutations
    creandoIngreso: crearIngreso.isPending,
    creandoGasto: crearGasto.isPending,
    eliminandoIngreso: eliminarIngreso.isPending,
    eliminandoGasto: eliminarGasto.isPending,
  }
}

// ==================== HOOK: RF ACTUAL ====================

/**
 * Hook para obtener el estado actual del sistema (RF Actual)
 */
export function useRFActual({ realTime = false } = {}) {
  const queryClient = useQueryClient()
  const [rfRealTime, setRfRealTime] = useState(null)

  useEffect(() => {
    if (!realTime) return

    const unsubscribe = BancosService.subscribeToRFActual((data) => {
      setRfRealTime(data)
      queryClient.setQueryData(BANCOS_KEYS.rfActual(), data)
    })

    return () => unsubscribe()
  }, [realTime, queryClient])

  const rfQuery = useQuery({
    queryKey: BANCOS_KEYS.rfActual(),
    queryFn: () => BancosService.getRFActual(),
    enabled: !realTime,
    staleTime: 1 * 60 * 1000,
  })

  return {
    rfActual: realTime ? rfRealTime : rfQuery.data,
    cargando: realTime ? false : rfQuery.isLoading,
    error: rfQuery.error,
  }
}

// ==================== HOOK: TODOS LOS BANCOS ====================

/**
 * Hook para obtener información de todos los bancos
 */
export function useTodosBancos() {
  const bancosIds = BancosService.getAllBancosIds()

  const queries = bancosIds.map((bancoId) => {
    return useQuery({
      queryKey: BANCOS_KEYS.totales(bancoId),
      queryFn: () => BancosService.calcularTotalesBanco(bancoId),
      staleTime: 1 * 60 * 1000,
    })
  })

  const bancos = bancosIds.map((bancoId, index) => ({
    id: bancoId,
    nombre: BancosService.getBancoName(bancoId),
    ...queries[index].data,
  }))

  const cargando = queries.some((q) => q.isLoading)

  return {
    bancos,
    cargando,
    totalSistema: bancos.reduce((sum, banco) => sum + (banco.balance || 0), 0),
  }
}

// ==================== EXPORTS ====================
export default useBanco
