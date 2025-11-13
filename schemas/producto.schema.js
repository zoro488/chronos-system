import { z } from 'zod';

/**
 * Schemas de validación para Productos
 */

/**
 * Schema para crear un producto
 */
export const CreateProductoSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  descripcion: z.string().max(1000, 'La descripción no puede exceder 1000 caracteres').optional(),
  sku: z
    .string()
    .min(1, 'SKU requerido')
    .max(50, 'El SKU no puede exceder 50 caracteres')
    .regex(/^[A-Z0-9-_]+$/, 'SKU inválido (solo letras, números, guiones)'),
  codigoBarras: z
    .string()
    .regex(/^[\d-]{8,20}$/, 'Código de barras inválido')
    .optional(),
  categoria: z.string().min(1, 'Categoría requerida').max(100),
  marca: z.string().max(100).optional(),
  precio: z.number().positive('El precio debe ser mayor a 0'),
  precioCompra: z.number().positive('El precio de compra debe ser mayor a 0'),
  stock: z.number().int().nonnegative('El stock no puede ser negativo').default(0),
  stockMinimo: z.number().int().nonnegative('El stock mínimo no puede ser negativo').default(5),
  stockMaximo: z.number().int().nonnegative('El stock máximo no puede ser negativo').optional(),
  unidadMedida: z
    .enum(['pieza', 'kg', 'litro', 'metro', 'caja', 'paquete'], {
      errorMap: () => ({ message: 'Unidad de medida inválida' }),
    })
    .default('pieza'),
  proveedorId: z.string().optional(),
  proveedorNombre: z.string().optional(),
  ubicacion: z.string().max(100).optional(),
  imagenUrl: z.string().url('URL de imagen inválida').optional(),
  impuestos: z.number().min(0).max(100, 'El impuesto no puede ser mayor a 100%').default(16),
  activo: z.boolean().default(true),
  tags: z.array(z.string().max(50)).max(20, 'Máximo 20 tags').optional(),
});

/**
 * Schema para actualizar un producto
 */
export const UpdateProductoSchema = CreateProductoSchema.partial().extend({
  id: z.string().min(1, 'ID requerido'),
});

/**
 * Schema para ajuste de inventario
 */
export const AjusteInventarioSchema = z.object({
  productoId: z.string().min(1, 'ID de producto requerido'),
  tipo: z.enum(['entrada', 'salida', 'ajuste'], {
    errorMap: () => ({ message: 'Tipo de ajuste inválido' }),
  }),
  cantidad: z.number().int().positive('La cantidad debe ser mayor a 0'),
  motivo: z.string().min(5, 'El motivo debe tener al menos 5 caracteres'),
  fecha: z.date().default(() => new Date()),
});

/**
 * Schema para filtros de búsqueda de productos
 */
export const ProductoFiltersSchema = z.object({
  categoria: z.string().optional(),
  marca: z.string().optional(),
  activo: z.boolean().optional(),
  lowStock: z.boolean().optional(),
  proveedorId: z.string().optional(),
  search: z.string().optional(),
  precioMin: z.number().nonnegative().optional(),
  precioMax: z.number().nonnegative().optional(),
});

/**
 * Tipos inferidos disponibles como JSDoc:
 * @typedef {z.infer<typeof CreateProductoSchema>} CreateProducto
 * @typedef {z.infer<typeof UpdateProductoSchema>} UpdateProducto
 * @typedef {z.infer<typeof AjusteInventarioSchema>} AjusteInventario
 * @typedef {z.infer<typeof ProductoFiltersSchema>} ProductoFilters
 */
