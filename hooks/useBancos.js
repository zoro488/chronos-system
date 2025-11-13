/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                         HOOK: useBancos V2                                 ║
 * ║          Hook actualizado para usar colecciones Firestore reales          ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  movimientos: (bancoId) => [...BANCOS_KEYS.all, 'movimientos', bancoId],
  ingresos: (bancoId) => [...BANCOS_KEYS.all, 'ingresos', bancoId],
  gastos: (bancoId) => [...BANCOS_KEYS.all, 'gastos', bancoId],
  saldos: () => [...BANCOS_KEYS.all, 'saldos'],
  rfActual: () => [...BANCOS_KEYS.all, 'rfActual'],
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

  // Crear ingreso
  const crearIngreso = useMutation({
    mutationFn: (data) => BancosService.crearIngreso(bancoId, data),
    onSuccess: () => {
      if (!realTime) {
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.ingresos(bancoId) })
      }
      toast.success('Ingreso creado exitosamente')
    },
    onError: (error) => {
      toast.error('Error al crear ingreso')
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
      toast.success('Ingreso actualizado exitosamente')
    },
    onError: (error) => {
      toast.error('Error al actualizar ingreso')
      console.error(error)
    },
  })

  // Crear gasto
  const crearGasto = useMutation({
    mutationFn: (data) => BancosService.crearGasto(bancoId, data),
    onSuccess: () => {
      if (!realTime) {
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.gastos(bancoId) })
      }
      toast.success('Gasto creado exitosamente')
    },
    onError: (error) => {
      toast.error('Error al crear gasto')
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
      toast.success('Gasto actualizado exitosamente')
    },
    onError: (error) => {
      toast.error('Error al actualizar gasto')
      console.error(error)
    },
  })

  // Eliminar ingreso
  const eliminarIngreso = useMutation({
    mutationFn: (ingresoId) => BancosService.eliminarIngreso(bancoId, ingresoId),
    onSuccess: () => {
      if (!realTime) {
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.ingresos(bancoId) })
      }
      toast.success('Ingreso eliminado')
    },
    onError: (error) => {
      toast.error('Error al eliminar ingreso')
      console.error(error)
    },
  })

  // Eliminar gasto
  const eliminarGasto = useMutation({
    mutationFn: (gastoId) => BancosService.eliminarGasto(bancoId, gastoId),
    onSuccess: () => {
      if (!realTime) {
        queryClient.invalidateQueries({ queryKey: BANCOS_KEYS.gastos(bancoId) })
      }
      toast.success('Gasto eliminado')
    },
    onError: (error) => {
      toast.error('Error al eliminar gasto')
      console.error(error)
    },
  })
import { useMutation, useQuery } from '@tanstack/react-query';

import { invalidateQueries, queryKeys } from '../lib/react-query';
// ✅ Servicios reales de Firebase
import * as BancosService from '../services/bancos.service';
import { toast } from '../stores/useChronosStore';

// ==================== QUERIES ====================

/**
 * Hook para obtener banco completo con todos sus datos
 * Compatible con BancosPageComplete
 */
export function useBanco(bancoId) {
  // Query para obtener banco
  const { data: banco, isLoading: cargandoBanco } = useQuery({
    queryKey: ['banco', bancoId],
    queryFn: () => BancosService.getBanco(bancoId),
    enabled: !!bancoId,
  });

  // Query para ingresos
  const { data: ingresos = [], isLoading: cargandoIngresos } = useQuery({
    queryKey: ['ingresos', bancoId],
    queryFn: () => BancosService.getIngresos(bancoId),
    enabled: !!bancoId,
  });

  // Query para gastos
  const { data: gastos = [], isLoading: cargandoGastos } = useQuery({
    queryKey: ['gastos', bancoId],
    queryFn: () => BancosService.getGastos(bancoId),
    enabled: !!bancoId,
  });

  // Query para transferencias
  const { data: transferencias = [], isLoading: cargandoTransferencias } = useQuery({
    queryKey: ['transferencias', bancoId],
    queryFn: () => BancosService.getTransferencias(bancoId),
    enabled: !!bancoId,
  });

  // Mutation para crear ingreso
  const crearIngreso = useMutation({
    mutationFn: (data) => BancosService.crearIngreso({ ...data, bancoId }),
    onSuccess: () => {
      invalidateQueries.bancos();
      toast.success('✅ Ingreso creado');
    },
    onError: (error) => {
      toast.error(`❌ Error: ${error.message}`);
    },
  });

  // Mutation para crear gasto
  const crearGasto = useMutation({
    mutationFn: (data) => BancosService.crearGasto({ ...data, bancoId }),
    onSuccess: () => {
      invalidateQueries.bancos();
      toast.success('✅ Gasto creado');
    },
    onError: (error) => {
      toast.error(`❌ Error: ${error.message}`);
    },
  });

  // Mutation para crear transferencia
  const crearTransferencia = useMutation({
    mutationFn: (data) => BancosService.crearTransferencia({ ...data, bancoOrigenId: bancoId }),
    onSuccess: () => {
      invalidateQueries.bancos();
      toast.success('✅ Transferencia realizada');
    },
    onError: (error) => {
      toast.error(`❌ Error: ${error.message}`);
    },
  });

  // Mutation para eliminar ingreso
  const eliminarIngreso = useMutation({
    mutationFn: (ingresoId) => BancosService.eliminarIngreso(ingresoId, bancoId),
    onSuccess: () => {
      invalidateQueries.bancos();
      toast.success('🗑️ Ingreso eliminado');
    },
    onError: (error) => {
      toast.error(`❌ Error: ${error.message}`);
    },
  });

  // Mutation para eliminar gasto
  const eliminarGasto = useMutation({
    mutationFn: (gastoId) => BancosService.eliminarGasto(gastoId, bancoId),
    onSuccess: () => {
      invalidateQueries.bancos();
      toast.success('🗑️ Gasto eliminado');
    },
    onError: (error) => {
      toast.error(`❌ Error: ${error.message}`);
    },
  });

  const cargando = cargandoBanco || cargandoIngresos || cargandoGastos || cargandoTransferencias;

  return {
    banco,
    ingresos,
    gastos,
    transferencias,
    crearIngreso,
    crearGasto,
    crearTransferencia,
    eliminarIngreso,
    eliminarGasto,
    cargando,
    error: null,
  };
}

/**
 * Hook para obtener todos los bancos
 * Compatible con BancosTransacciones y BancosAnalytics
 */
export function useBancos() {
  const { data: bancos = [], isLoading: cargando } = useQuery({
    queryKey: ['bancos'],
    queryFn: () => BancosService.getTodosBancos(),
  });

  return { bancos, cargando };
}

/**
 * Hook para obtener movimientos bancarios
 */
export function useMovimientosBancarios(filters = {}) {
  return useQuery({
    queryKey: queryKeys.bancos.list(filters),
    queryFn: () => BancosService.getMovimientosBancarios(filters),
  });
}

/**
 * Hook para obtener cuentas bancarias
 */
export function useCuentasBancarias() {
  return useQuery({
    queryKey: queryKeys.bancos.lists(),
    queryFn: () => BancosService.getCuentasBancarias(),
  });
}

/**
 * Hook para obtener cuenta bancaria por ID
 */
export function useCuentaBancaria(cuentaId) {
  return useQuery({
    queryKey: queryKeys.bancos.detail(cuentaId),
    queryFn: () => BancosService.getCuentaBancaria(cuentaId),
    enabled: !!cuentaId,
  });
}

/**
 * Hook para obtener saldo total de bancos
 */
export function useSaldoTotalBancos() {
  return useQuery({
    queryKey: queryKeys.bancos.balance(),
    queryFn: () => BancosService.getSaldoTotalBancos(),
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}

// ==================== MUTATIONS ====================

/**
 * Hook para crear movimiento bancario
 */
export function useCreateMovimientoBancario() {
  return useMutation({
    mutationFn: (movimientoData) => BancosService.createMovimientoBancario(movimientoData),
    onSuccess: () => {
      invalidateQueries.bancos();
      invalidateQueries.dashboard();
      toast.success('✅ Movimiento bancario registrado');
    },
    onError: (error) => {
      toast.error(`❌ Error al crear movimiento: ${error.message}`);
    },
  });
}

/**
 * Hook para crear cuenta bancaria
 */
export function useCreateCuentaBancaria() {
  return useMutation({
    mutationFn: (cuentaData) => BancosService.createCuentaBancaria(cuentaData),
    onSuccess: () => {
      invalidateQueries.bancos();
      toast.success('✅ Cuenta bancaria creada');
    },
    onError: (error) => {
      toast.error(`❌ Error al crear cuenta: ${error.message}`);
    },
  });
}

/**
 * Hook para actualizar cuenta bancaria
 */
export function useUpdateCuentaBancaria() {
  return useMutation({
    mutationFn: ({ id, ...updates }) => BancosService.updateCuentaBancaria(id, updates),
    onSuccess: () => {
      invalidateQueries.bancos();
      toast.success('✅ Cuenta actualizada');
    },
    onError: (error) => {
      toast.error(`❌ Error al actualizar: ${error.message}`);
    },
  });
}

/**
 * Hook para eliminar movimiento bancario
 */
export function useDeleteMovimientoBancario() {
  return useMutation({
    mutationFn: (movimientoId) => BancosService.deleteMovimientoBancario(movimientoId),
    onSuccess: () => {
      invalidateQueries.bancos();
      toast.success('🗑️ Movimiento eliminado');
    },
    onError: (error) => {
      toast.error(`❌ Error al eliminar: ${error.message}`);
    },
  });
}

/**
 * Hook para eliminar cuenta bancaria
 */
export function useDeleteCuentaBancaria() {
  return useMutation({
    mutationFn: (cuentaId) => BancosService.deleteCuentaBancaria(cuentaId),
    onSuccess: () => {
      invalidateQueries.bancos();
      toast.success('🗑️ Cuenta eliminada');
    },
    onError: (error) => {
      toast.error(`❌ Error al eliminar: ${error.message}`);
    },
  });
}
