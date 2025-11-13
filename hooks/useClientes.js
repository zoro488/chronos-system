import { useMutation, useQuery } from '@tanstack/react-query';

import { invalidateQueries, queryKeys } from '../lib/react-query';
// ✅ Servicios reales de Firebase
import * as ClientesService from '../services/clientes.service';
import { toast } from '../stores/useChronosStore';

/**
 * Custom Hooks para Clientes con React Query
 */

// ==================== QUERIES ====================

/**
 * Hook para obtener lista de clientes
 */
export function useClientes(filters = {}) {
  return useQuery({
    queryKey: queryKeys.clientes.list(filters),
    queryFn: () => ClientesService.getClientes(filters),
  });
}

/**
 * Hook para obtener un cliente específico
 */
export function useCliente(clienteId) {
  return useQuery({
    queryKey: queryKeys.clientes.detail(clienteId),
    queryFn: () => ClientesService.getCliente(clienteId),
    enabled: !!clienteId,
  });
}

/**
 * Hook para buscar clientes
 */
export function useSearchClientes(query) {
  return useQuery({
    queryKey: queryKeys.clientes.search(query),
    queryFn: () => ClientesService.searchClientes(query),
    enabled: query && query.length >= 2,
    staleTime: 30 * 1000, // 30 segundos
  });
}

// ==================== MUTATIONS ====================

// ==================== MUTATIONS ====================

/**
 * Hook para crear un cliente
 */
export function useCreateCliente() {
  return useMutation({
    mutationFn: (clienteData) => ClientesService.createCliente(clienteData),
    onSuccess: () => {
      invalidateQueries.clientes();
      toast.success('✅ Cliente creado exitosamente');
    },
    onError: (error) => {
      toast.error(`❌ Error al crear cliente: ${error.message}`);
    },
  });
}

/**
 * Hook para actualizar un cliente
 */
export function useUpdateCliente() {
  return useMutation({
    mutationFn: ({ id, ...updates }) => ClientesService.updateCliente(id, updates),
    onSuccess: () => {
      invalidateQueries.clientes();
      toast.success('✅ Cliente actualizado');
    },
    onError: (error) => {
      toast.error(`❌ Error al actualizar: ${error.message}`);
    },
  });
}

/**
 * Hook para eliminar un cliente
 */
export function useDeleteCliente() {
  return useMutation({
    mutationFn: (clienteId) => ClientesService.deleteCliente(clienteId),
    onSuccess: () => {
      invalidateQueries.clientes();
      invalidateQueries.ventas(); // También invalidar ventas
      toast.success('🗑️ Cliente eliminado');
    },
    onError: (error) => {
      toast.error(`❌ Error al eliminar: ${error.message}`);
    },
  });
}
