/**
 * Exportación centralizada de todos los custom hooks
 *
 * Permite importar hooks desde un solo punto:
 * ```js
 * import { useVentas, useCreateVenta, useClientes } from '@/hooks'
 * ```
 */

// Ventas
export {
    useCancelVenta,
    useCreateVenta,
    useDeleteVenta,
    useRegistrarPagoParcial,
    useUpdateVenta,
    useVenta,
    useVentas,
    useVentasByCliente,
    useVentasByMonth,
    useVentasStats
} from './useVentas';

// Clientes
export {
    useCliente,
    useClientes,
    useCreateCliente,
    useDeleteCliente,
    useSearchClientes,
    useUpdateCliente
} from './useClientes';

// Productos
export {
    useAjusteInventario,
    useCreateProducto,
    useDeleteProducto,
    useProducto,
    useProductos,
    useProductosByCategoria,
    useProductosLowStock,
    useUpdateProducto
} from './useProductos';

// Compras
export {
    useCancelCompra,
    useCompra,
    useCompras,
    useComprasByProveedor,
    useCreateCompra,
    useDeleteCompra,
    useRecibirCompra,
    useUpdateCompra
} from './useCompras';

// Bancos
export {
    useBanco, useBancoRealtime, useBancos, useCrearTransferencia, useMovimientosBancarios, useSaldoTotal,
    useTotalesBanco, useTransferencias
} from './useBancos';

// Gastos
export {
    useCreateGasto,
    useDeleteGasto,
    useGasto,
    useGastos,
    useGastosByCategoria,
    useGastosByMonth,
    useGastosStats,
    useUpdateGasto
} from './useGastos';
