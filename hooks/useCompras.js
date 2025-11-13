import { useMutation, useQuery } from '@tanstack/react-query';

import { invalidateQueries, queryKeys } from '../lib/react-query';
// ✅ Servicios reales de Firebase
import * as ComprasService from '../services/compras.service';
import { toast } from '../stores/useChronosStore';

/**
 * Custom Hooks para Compras con React Query
 */

// ==================== QUERIES ====================

/**
 * Hook para obtener lista de compras
 */
export function useCompras(filters = {}) {
  return useQuery({
    queryKey: queryKeys.compras.list(filters),
    queryFn: () => ComprasService.getCompras(filters),
  });
}

/**
 * Hook para obtener una compra específica
 */
export function useCompra(compraId) {
  return useQuery({
    queryKey: queryKeys.compras.detail(compraId),
    queryFn: () => ComprasService.getCompra(compraId),
    enabled: !!compraId,
  });
}

/**
 * Hook para obtener compras por proveedor
 */
export function useComprasByProveedor(proveedorId) {
  return useQuery({
    queryKey: queryKeys.compras.byProveedor(proveedorId),
    queryFn: () => ComprasService.getComprasByProveedor(proveedorId),
    enabled: !!proveedorId,
  });
}

// ==================== MUTATIONS ====================

/**
// ==================== MUTATIONS ====================

/**
 * Hook para crear una compra
 */
export function useCreateCompra() {
  return useMutation({
    mutationFn: (compraData) => ComprasService.createCompra(compraData),
    onSuccess: () => {
      invalidateQueries.compras();
      invalidateQueries.productos(); // Actualizar inventario
      invalidateQueries.dashboard();
      toast.success('✅ Compra creada exitosamente');
    },
    onError: (error) => {
      toast.error(`❌ Error al crear compra: ${error.message}`);
    },
  });
}

/**
 * Hook para actualizar una compra
 */
export function useUpdateCompra() {
  return useMutation({
    mutationFn: ({ id, ...updates }) => ComprasService.updateCompra(id, updates),
    onSuccess: () => {
      invalidateQueries.compras();
      toast.success('✅ Compra actualizada');
    },
    onError: (error) => {
      toast.error(`❌ Error al actualizar: ${error.message}`);
    },
  });
}

/**
 * Hook para recibir compra (actualizar inventario)
 */
export function useRecibirCompra() {
  return useMutation({
    mutationFn: ({ id, recepcionData }) => ComprasService.recibirCompra(id, recepcionData),
    onSuccess: () => {
      invalidateQueries.compras();
      invalidateQueries.productos(); // Actualizar inventario
      invalidateQueries.dashboard();
      toast.success('📦 Compra recibida - Inventario actualizado');
    },
    onError: (error) => {
      toast.error(`❌ Error al recibir compra: ${error.message}`);
    },
  });
}

/**
 * Hook para cancelar una compra
 */
export function useCancelCompra() {
  return useMutation({
    mutationFn: ({ id, motivo }) => ComprasService.cancelCompra(id, motivo),
    onSuccess: () => {
      invalidateQueries.compras();
      invalidateQueries.dashboard();
      toast.warning('⚠️ Compra cancelada');
    },
    onError: (error) => {
      toast.error(`❌ Error al cancelar: ${error.message}`);
    },
  });
}

/**
 * Hook para eliminar una compra
 */
export function useDeleteCompra() {
  return useMutation({
    mutationFn: (compraId) => ComprasService.deleteCompra(compraId),
    onSuccess: () => {
      invalidateQueries.compras();
      toast.success('🗑️ Compra eliminada');
    },
    onError: (error) => {
      toast.error(`❌ Error al eliminar: ${error.message}`);
    },
  });
}
