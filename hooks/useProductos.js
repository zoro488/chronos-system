import { useMutation, useQuery } from '@tanstack/react-query';

import { invalidateQueries, queryKeys } from '../lib/react-query';
// ✅ Servicios reales de Firebase
import * as ProductosService from '../services/productos.service';
import { toast } from '../stores/useChronosStore';

/**
 * Custom Hooks para Productos con React Query
 */

// ==================== QUERIES ====================

/**
 * Hook para obtener lista de productos
 */
export function useProductos(filters = {}) {
  return useQuery({
    queryKey: queryKeys.productos.list(filters),
    queryFn: () => ProductosService.getProductos(filters),
  });
}

/**
 * Hook para obtener un producto específico
 */
export function useProducto(productoId) {
  return useQuery({
    queryKey: queryKeys.productos.detail(productoId),
    queryFn: () => ProductosService.getProducto(productoId),
    enabled: !!productoId,
  });
}

/**
 * Hook para obtener productos por categoría
 */
export function useProductosByCategoria(categoria) {
  return useQuery({
    queryKey: queryKeys.productos.byCategoria(categoria),
    queryFn: () => ProductosService.getProductosByCategoria(categoria),
    enabled: !!categoria,
  });
}

/**
 * Hook para obtener productos con bajo stock
 */
/**
 * Hook para obtener productos con stock bajo
 */
export function useProductosLowStock() {
  return useQuery({
    queryKey: queryKeys.productos.lowStock(),
    queryFn: () => ProductosService.getProductosLowStock(),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// ==================== MUTATIONS ====================

/**
 * Hook para crear un producto
 */
export function useCreateProducto() {
  return useMutation({
    mutationFn: (productoData) => ProductosService.createProducto(productoData),
    onSuccess: () => {
      invalidateQueries.productos();
      toast.success('✅ Producto creado exitosamente');
    },
    onError: (error) => {
      toast.error(`❌ Error al crear producto: ${error.message}`);
    },
  });
}

/**
 * Hook para actualizar un producto
 */
export function useUpdateProducto() {
  return useMutation({
    mutationFn: ({ id, ...updates }) => ProductosService.updateProducto(id, updates),
    onSuccess: () => {
      invalidateQueries.productos();
      toast.success('✅ Producto actualizado');
    },
    onError: (error) => {
      toast.error(`❌ Error al actualizar: ${error.message}`);
    },
  });
}

/**
 * Hook para ajustar inventario
 */
export function useAjusteInventario() {
  return useMutation({
    mutationFn: ({ id, cantidad, motivo, tipo }) =>
      ProductosService.ajusteInventario(id, cantidad, motivo, tipo),
    onSuccess: () => {
      invalidateQueries.productos();
      invalidateQueries.dashboard();
      toast.success('✅ Inventario ajustado');
    },
    onError: (error) => {
      toast.error(`❌ Error al ajustar inventario: ${error.message}`);
    },
  });
}

/**
 * Hook para eliminar un producto
 */
export function useDeleteProducto() {
  return useMutation({
    mutationFn: (productoId) => ProductosService.deleteProducto(productoId),
    onSuccess: () => {
      invalidateQueries.productos();
      toast.success('🗑️ Producto eliminado');
    },
    onError: (error) => {
      toast.error(`❌ Error al eliminar: ${error.message}`);
    },
  });
}
