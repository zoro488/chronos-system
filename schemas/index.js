/**
 * Exportación centralizada de todos los schemas de validación
 *
 * Permite importar todos los schemas desde un solo punto:
 * ```js
 * import { CreateVentaSchema, CreateClienteSchema } from '@/schemas'
 * ```
 */

// Ventas
export {
    CancelVentaSchema,
    CreateVentaSchema,
    PagoParcialSchema,
    ProductoVentaSchema,
    UpdateVentaSchema,
    VentaFiltersSchema
} from './venta.schema';

// Clientes
export {
    ClienteFiltersSchema,
    CreateClienteSchema,
    UpdateClienteSchema
} from './cliente.schema';

// Productos
export {
    AjusteInventarioSchema,
    CreateProductoSchema,
    ProductoFiltersSchema,
    UpdateProductoSchema
} from './producto.schema';

// Compras
export {
    CancelCompraSchema,
    CompraFiltersSchema,
    CreateCompraSchema,
    ProductoCompraSchema,
    RecepcionCompraSchema,
    UpdateCompraSchema
} from './compra.schema';
