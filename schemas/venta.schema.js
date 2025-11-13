import { z } from 'zod';

/**
 * Schemas de validación para Ventas
 *
 * Usa Zod para validación en tiempo de ejecución.
 * Compatible con React Hook Form via zodResolver.
 */

/**
 * Schema para producto en venta
 */
export const ProductoVentaSchema = z.object({
  productoId: z.string().min(1, 'Selecciona un producto'),
  nombre: z.string().min(1, 'Nombre requerido'),
  cantidad: z.number().int().positive('La cantidad debe ser mayor a 0'),
  precioUnitario: z.number().positive('El precio debe ser mayor a 0'),
  subtotal: z.number().nonnegative('El subtotal no puede ser negativo'),
});

/**
 * Schema para crear una venta
 */
export const CreateVentaSchema = z.object({
  clienteId: z.string().min(1, 'Selecciona un cliente'),
  clienteNombre: z.string().optional(),
  productos: z
    .array(ProductoVentaSchema)
    .min(1, 'Agrega al menos un producto')
    .max(50, 'Máximo 50 productos por venta'),
  subtotal: z.number().nonnegative('El subtotal no puede ser negativo'),
  descuento: z.number().nonnegative('El descuento no puede ser negativo').default(0),
  impuestos: z.number().nonnegative('Los impuestos no pueden ser negativos').default(0),
  total: z.number().positive('El total debe ser mayor a 0'),
  metodoPago: z.enum(['efectivo', 'tarjeta', 'transferencia', 'credito'], {
    errorMap: () => ({ message: 'Método de pago inválido' }),
  }),
  estado: z
    .enum(['pendiente', 'pagada', 'cancelada', 'parcial'], {
      errorMap: () => ({ message: 'Estado inválido' }),
    })
    .default('pendiente'),
  notas: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
  fecha: z.date().default(() => new Date()),
});

/**
 * Schema para actualizar una venta
 */
export const UpdateVentaSchema = CreateVentaSchema.partial().extend({
  id: z.string().min(1, 'ID requerido'),
});

/**
 * Schema para filtros de búsqueda de ventas
 */
export const VentaFiltersSchema = z.object({
  clienteId: z.string().optional(),
  metodoPago: z
    .enum(['efectivo', 'tarjeta', 'transferencia', 'credito'])
    .optional(),
  estado: z.enum(['pendiente', 'pagada', 'cancelada', 'parcial']).optional(),
  fechaInicio: z.date().optional(),
  fechaFin: z.date().optional(),
  montoMin: z.number().nonnegative().optional(),
  montoMax: z.number().nonnegative().optional(),
  search: z.string().optional(),
});

/**
 * Schema para cancelar una venta
 */
export const CancelVentaSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
  motivo: z.string().min(10, 'El motivo debe tener al menos 10 caracteres'),
});

/**
 * Schema para pago parcial
 */
export const PagoParcialSchema = z.object({
  ventaId: z.string().min(1, 'ID de venta requerido'),
  monto: z.number().positive('El monto debe ser mayor a 0'),
  metodoPago: z.enum(['efectivo', 'tarjeta', 'transferencia']),
  fecha: z.date().default(() => new Date()),
  notas: z.string().max(200).optional(),
});

/**
 * Tipos inferidos disponibles como JSDoc:
 * @typedef {z.infer<typeof ProductoVentaSchema>} ProductoVenta
 * @typedef {z.infer<typeof CreateVentaSchema>} CreateVenta
 * @typedef {z.infer<typeof UpdateVentaSchema>} UpdateVenta
 * @typedef {z.infer<typeof VentaFiltersSchema>} VentaFilters
 * @typedef {z.infer<typeof CancelVentaSchema>} CancelVenta
 * @typedef {z.infer<typeof PagoParcialSchema>} PagoParcial
 */
