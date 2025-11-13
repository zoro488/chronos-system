/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                     GASTOS HOOKS - REACT QUERY                             ║
 * ║          Custom hooks con React Query para gestión de gastos               ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { useMutation, useQuery } from '@tanstack/react-query';

import { invalidateQueries, queryKeys } from '../lib/react-query';
// ✅ Servicios reales de Firebase
import * as GastosService from '../services/gastos.service';
import { toast } from '../stores/useChronosStore';

// ==================== QUERIES ====================

/**
 * Hook para obtener lista de gastos
 */
export function useGastos(filters = {}) {
  return useQuery({
    queryKey: queryKeys.gastos.list(filters),
    queryFn: () => GastosService.getGastos(filters),
  });
}

/**
 * Hook para obtener gasto por ID
 */
export function useGasto(gastoId) {
  return useQuery({
    queryKey: queryKeys.gastos.detail(gastoId),
    queryFn: () => GastosService.getGasto(gastoId),
    enabled: !!gastoId,
  });
}

/**
 * Hook para obtener gastos por mes
 */
export function useGastosByMonth(month, year) {
  return useQuery({
    queryKey: queryKeys.gastos.byMonth(month),
    queryFn: () => GastosService.getGastosByMonth(month, year),
    enabled: !!month,
  });
}

/**
 * Hook para obtener gastos por categoría
 */
export function useGastosByCategoria(categoria) {
  return useQuery({
    queryKey: queryKeys.gastos.byCategoria(categoria),
    queryFn: () => GastosService.getGastosByCategoria(categoria),
    enabled: !!categoria,
  });
}

/**
 * Hook para obtener estadísticas de gastos
 */
export function useGastosStats() {
  return useQuery({
    queryKey: queryKeys.gastos.stats(),
    queryFn: () => GastosService.getGastosStats(),
    staleTime: 2 * 60 * 1000,
  });
}

// ==================== MUTATIONS ====================

/**
 * Hook para crear gasto
 */
export function useCreateGasto() {
  return useMutation({
    mutationFn: (gastoData) => GastosService.createGasto(gastoData),
    onSuccess: () => {
      invalidateQueries.gastos();
      invalidateQueries.dashboard();
      toast.success('✅ Gasto registrado exitosamente');
    },
    onError: (error) => {
      toast.error(`❌ Error al crear gasto: ${error.message}`);
    },
  });
}

/**
 * Hook para actualizar gasto
 */
export function useUpdateGasto() {
  return useMutation({
    mutationFn: ({ id, ...updates }) => GastosService.updateGasto(id, updates),
    onSuccess: () => {
      invalidateQueries.gastos();
      toast.success('✅ Gasto actualizado');
    },
    onError: (error) => {
      toast.error(`❌ Error al actualizar: ${error.message}`);
    },
  });
}

/**
 * Hook para eliminar gasto
 */
export function useDeleteGasto() {
  return useMutation({
    mutationFn: (gastoId) => GastosService.deleteGasto(gastoId),
    onSuccess: () => {
      invalidateQueries.gastos();
      invalidateQueries.dashboard();
      toast.success('🗑️ Gasto eliminado');
    },
    onError: (error) => {
      toast.error(`❌ Error al eliminar: ${error.message}`);
    },
  });
}
