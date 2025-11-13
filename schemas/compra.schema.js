import { z } from 'zod';

/**
 * Schemas de validación para Compras
 */

/**
 * Schema para producto en compra
 */
export const ProductoCompraSchema = z.object({
  productoId: z.string().min(1, 'Selecciona un producto'),
  nombre: z.string().min(1, 'Nombre requerido'),
  cantidad: z.number().int().positive('La cantidad debe ser mayor a 0'),
  precioUnitario: z.number().positive('El precio debe ser mayor a 0'),
  subtotal: z.number().nonnegative('El subtotal no puede ser negativo'),
});

/**
 * Schema para crear una compra
 */
export const CreateCompraSchema = z.object({
  proveedorId: z.string().min(1, 'Selecciona un proveedor'),
  proveedorNombre: z.string().optional(),
  productos: z
    .array(ProductoCompraSchema)
    .min(1, 'Agrega al menos un producto')
    .max(100, 'Máximo 100 productos por compra'),
  subtotal: z.number().nonnegative('El subtotal no puede ser negativo'),
  descuento: z.number().nonnegative('El descuento no puede ser negativo').default(0),
  impuestos: z.number().nonnegative('Los impuestos no pueden ser negativos').default(0),
  total: z.number().positive('El total debe ser mayor a 0'),
  metodoPago: z.enum(['efectivo', 'tarjeta', 'transferencia', 'credito', 'cheque'], {
    errorMap: () => ({ message: 'Método de pago inválido' }),
  }),
  estado: z
    .enum(['pendiente', 'recibida', 'cancelada', 'parcial'], {
      errorMap: () => ({ message: 'Estado inválido' }),
    })
    .default('pendiente'),
  fechaCompra: z.date().default(() => new Date()),
  fechaEntregaEstimada: z.date().optional(),
  notas: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
  numeroFactura: z.string().max(50).optional(),
  numeroOrden: z.string().max(50).optional(),
});

/**
 * Schema para actualizar una compra
 */
export const UpdateCompraSchema = CreateCompraSchema.partial().extend({
  id: z.string().min(1, 'ID requerido'),
});

/**
 * Schema para recepción de compra
 */
export const RecepcionCompraSchema = z.object({
  compraId: z.string().min(1, 'ID de compra requerido'),
  productos: z.array(
    z.object({
      productoId: z.string().min(1),
      cantidadRecibida: z.number().int().nonnegative(),
      cantidadEsperada: z.number().int().positive(),
      notas: z.string().max(200).optional(),
    }),
  ),
  fechaRecepcion: z.date().default(() => new Date()),
  recibidoPor: z.string().min(1, 'Usuario requerido'),
  notasGenerales: z.string().max(500).optional(),
});

/**
 * Schema para filtros de búsqueda de compras
 */
export const CompraFiltersSchema = z.object({
  proveedorId: z.string().optional(),
  metodoPago: z.enum(['efectivo', 'tarjeta', 'transferencia', 'credito', 'cheque']).optional(),
  estado: z.enum(['pendiente', 'recibida', 'cancelada', 'parcial']).optional(),
  fechaInicio: z.date().optional(),
  fechaFin: z.date().optional(),
  montoMin: z.number().nonnegative().optional(),
  montoMax: z.number().nonnegative().optional(),
  search: z.string().optional(),
});

/**
 * Schema para cancelar una compra
 */
export const CancelCompraSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
  motivo: z.string().min(10, 'El motivo debe tener al menos 10 caracteres'),
});

/**
 * Tipos inferidos disponibles como JSDoc:
 * @typedef {z.infer<typeof ProductoCompraSchema>} ProductoCompra
 * @typedef {z.infer<typeof CreateCompraSchema>} CreateCompra
 * @typedef {z.infer<typeof UpdateCompraSchema>} UpdateCompra
 * @typedef {z.infer<typeof RecepcionCompraSchema>} RecepcionCompra
 * @typedef {z.infer<typeof CompraFiltersSchema>} CompraFilters
 * @typedef {z.infer<typeof CancelCompraSchema>} CancelCompra
 */
