/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    VENTAS HOOKS - REACT QUERY                              ║
 * ║          Custom hooks con React Query para gestión de ventas               ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { invalidateQueries, queryKeys } from '../lib/react-query';
// ✅ Servicios reales de Firebase
import * as VentasService from '../services/ventas.service';
import { toast } from '../stores/useChronosStore';

// ==================== QUERIES ====================

/**
 * Hook para obtener lista de ventas con filtros
 * @example
 * const { data: ventas, isLoading } = useVentas({ estado: 'pagada' })
 */
export function useVentas(filters = {}) {
  return useQuery({
    queryKey: queryKeys.ventas.list(filters),
    queryFn: () => VentasService.getVentas(filters),
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Hook para obtener una venta por ID
 */
export function useVenta(ventaId) {
  return useQuery({
    queryKey: queryKeys.ventas.detail(ventaId),
    queryFn: () => VentasService.getVenta(ventaId),
    enabled: !!ventaId,
  });
}

/**
 * Hook para obtener ventas por mes
 */
export function useVentasByMonth(month, year) {
  return useQuery({
    queryKey: queryKeys.ventas.byMonth(month),
    queryFn: () => VentasService.getVentasByMonth(month, year),
    enabled: !!month,
  });
}

/**
 * Hook para obtener ventas por cliente
 */
export function useVentasByCliente(clienteId) {
  return useQuery({
    queryKey: queryKeys.ventas.byCliente(clienteId),
    queryFn: () => VentasService.getVentasByCliente(clienteId),
    enabled: !!clienteId,
  });
}

/**
 * Hook para obtener estadísticas de ventas
 * @example
 * const { data: stats } = useVentasStats()
 * // stats = { ventasHoy, ventasMes, totalVentasHoy, totalVentasMes, ... }
 */
export function useVentasStats() {
  return useQuery({
    queryKey: queryKeys.ventas.stats(),
    queryFn: () => VentasService.getVentasStats(),
    staleTime: 2 * 60 * 1000, // 2 minutos (stats cambian frecuentemente)
  });
}

// ==================== MUTATIONS ====================

/**
 * Hook para crear nueva venta
 * @example
 * const { mutate: createVenta } = useCreateVenta()
 * createVenta({ clienteId, productos, total })
 */
export function useCreateVenta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ventaData) => VentasService.createVenta(ventaData),
    onSuccess: () => {
      invalidateQueries.ventas();
      invalidateQueries.dashboard();
      toast.success('✅ Venta creada exitosamente');
    },
    onError: (error) => {
      console.error('Error al crear venta:', error);
      toast.error(`❌ Error al crear venta: ${error.message}`);
    },
  });
}

/**
 * Hook para actualizar venta
 */
export function useUpdateVenta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => VentasService.updateVenta(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: queryKeys.ventas.detail(id) });

      // Snapshot del valor anterior
      const previousVenta = queryClient.getQueryData(queryKeys.ventas.detail(id));

      // Actualización optimista
      queryClient.setQueryData(queryKeys.ventas.detail(id), (old) => ({
        ...old,
        ...updates,
      }));

      return { previousVenta, id };
    },
    onError: (error, variables, context) => {
      // Rollback en caso de error
      if (context?.previousVenta) {
        queryClient.setQueryData(queryKeys.ventas.detail(context.id), context.previousVenta);
      }
      toast.error(`❌ Error al actualizar venta: ${error.message}`);
    },
    onSuccess: (data, { id }) => {
      invalidateQueries.ventas();
      toast.success('✅ Venta actualizada');
    },
  });
}

/**
 * Hook para cancelar venta
 */
export function useCancelVenta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, motivo }) => VentasService.cancelVenta(id, motivo),
    onSuccess: () => {
      invalidateQueries.ventas();
      toast.warning('⚠️ Venta cancelada');
    },
    onError: (error) => {
      toast.error(`❌ Error al cancelar venta: ${error.message}`);
    },
  });
}

/**
 * Hook para eliminar venta (soft delete)
 */
export function useDeleteVenta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => VentasService.deleteVenta(id),
    onSuccess: () => {
      invalidateQueries.ventas();
      toast.success('🗑️ Venta eliminada');
    },
    onError: (error) => {
      toast.error(`❌ Error al eliminar venta: ${error.message}`);
    },
  });
}

/**
 * Hook para registrar pago parcial
 */
export function useRegistrarPagoParcial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ventaId, pagoData }) => VentasService.registrarPagoParcial(ventaId, pagoData),
    onSuccess: () => {
      invalidateQueries.ventas();
      toast.success('💰 Pago registrado exitosamente');
    },
    onError: (error) => {
      toast.error(`❌ Error al registrar pago: ${error.message}`);
    },
  });
}
