/**
 * INDEX - Export all schemas
 * Central export point for all Zod validation schemas
 */

// Banco schemas
export {
    BANCOS_DISPONIBLES, CATEGORIAS_GASTO, gastoSchema, ingresoSchema, transferenciaSchema, type GastoFormData, type IngresoFormData, type TransferenciaFormData
} from './banco.schema';

// Venta schemas
export {
    ESTADOS_VENTA,
    FORMAS_PAGO, pagoVentaSchema, ventaSchema, type PagoVentaFormData, type VentaFormData
} from './venta.schema';

// Cliente schemas
export {
    ESTADOS_MEXICO, TIPOS_CLIENTE, clienteSchema,
    notaCreditoSchema, type ClienteFormData,
    type NotaCreditoFormData
} from './cliente.schema';

// Distribuidor schemas
export {
    ESTADOS_ORDEN, TIPOS_DISTRIBUIDOR, distribuidorSchema,
    ordenCompraSchema,
    pagoDistribuidorSchema, type DistribuidorFormData,
    type OrdenCompraFormData,
    type PagoDistribuidorFormData
} from './distribuidor.schema';

// Producto schemas
export {
    CATEGORIAS_PRODUCTO, TIPOS_MOVIMIENTO, UNIDADES_MEDIDA, ajusteInventarioSchema, movimientoInventarioSchema, productoSchema, type AjusteInventarioFormData, type MovimientoInventarioFormData, type ProductoFormData
} from './producto.schema';
