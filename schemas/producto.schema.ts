/**
 * PRODUCTO SCHEMA - Validación con Zod
 * Esquemas de validación para Productos e Inventario
 */

import { z } from 'zod';

// ============================================================================
// PRODUCTO SCHEMA
// ============================================================================

export const productoSchema = z.object({
  Codigo: z
    .string({
      required_error: 'El código es requerido',
    })
    .min(1, 'El código es requerido')
    .max(50, 'El código no puede exceder 50 caracteres')
    .trim()
    .regex(/^[A-Z0-9-_]+$/, 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos'),

  Nombre: z
    .string({
      required_error: 'El nombre es requerido',
    })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),

  Descripcion: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  Categoria: z
    .string({
      required_error: 'La categoría es requerida',
    })
    .min(2, 'La categoría debe tener al menos 2 caracteres')
    .max(50, 'La categoría no puede exceder 50 caracteres')
    .trim(),

  Marca: z
    .string()
    .max(50, 'La marca no puede exceder 50 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  Modelo: z
    .string()
    .max(50, 'El modelo no puede exceder 50 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  PrecioCompra: z
    .number({
      required_error: 'El precio de compra es requerido',
      invalid_type_error: 'Debe ser un número válido',
    })
    .positive('El precio de compra debe ser mayor a 0')
    .finite('El precio de compra debe ser un número finito')
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: 'El precio de compra solo puede tener 2 decimales',
    }),

  PrecioVenta: z
    .number({
      required_error: 'El precio de venta es requerido',
      invalid_type_error: 'Debe ser un número válido',
    })
    .positive('El precio de venta debe ser mayor a 0')
    .finite('El precio de venta debe ser un número finito')
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: 'El precio de venta solo puede tener 2 decimales',
    }),

  MargenUtilidad: z
    .number({
      invalid_type_error: 'Debe ser un número válido',
    })
    .nonnegative('El margen de utilidad no puede ser negativo')
    .max(1000, 'El margen de utilidad no puede exceder 1000%')
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: 'El margen de utilidad solo puede tener 2 decimales',
    })
    .optional()
    .or(z.literal(0)),

  StockMinimo: z
    .number({
      invalid_type_error: 'Debe ser un número válido',
    })
    .int('El stock mínimo debe ser un número entero')
    .nonnegative('El stock mínimo no puede ser negativo')
    .default(0),

  StockMaximo: z
    .number({
      invalid_type_error: 'Debe ser un número válido',
    })
    .int('El stock máximo debe ser un número entero')
    .nonnegative('El stock máximo no puede ser negativo')
    .optional()
    .or(z.literal(0)),

  UnidadMedida: z
    .enum(['Pieza', 'Caja', 'Paquete', 'Kilogramo', 'Litro', 'Metro', 'Otro'], {
      errorMap: () => ({ message: 'Unidad de medida inválida' }),
    })
    .default('Pieza'),

  CodigoBarras: z
    .string()
    .regex(/^\d{8,13}$/, 'Código de barras inválido (8-13 dígitos)')
    .optional()
    .or(z.literal('')),

  Proveedor: z
    .string()
    .max(100, 'El proveedor no puede exceder 100 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  ProveedorId: z
    .string()
    .optional()
    .or(z.literal('')),

  Ubicacion: z
    .string()
    .max(50, 'La ubicación no puede exceder 50 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  FechaRegistro: z
    .date({
      invalid_type_error: 'Debe ser una fecha válida',
    })
    .default(() => new Date()),

  Activo: z
    .boolean()
    .default(true),

  ImagenURL: z
    .string()
    .url('URL de imagen inválida')
    .optional()
    .or(z.literal('')),

  Notas: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => {
    // Precio de venta debe ser mayor a precio de compra
    return data.PrecioVenta > data.PrecioCompra;
  },
  {
    message: 'El precio de venta debe ser mayor al precio de compra',
    path: ['PrecioVenta'],
  }
).refine(
  (data) => {
    // Stock máximo debe ser mayor a stock mínimo si está definido
    if ((data.StockMaximo || 0) > 0) {
      return (data.StockMaximo || 0) > data.StockMinimo;
    }
    return true;
  },
  {
    message: 'El stock máximo debe ser mayor al stock mínimo',
    path: ['StockMaximo'],
  }
).refine(
  (data) => {
    // Calcular margen de utilidad automáticamente
    const margenCalculado = ((data.PrecioVenta - data.PrecioCompra) / data.PrecioCompra) * 100;
    return Math.abs((data.MargenUtilidad || 0) - margenCalculado) < 0.01;
  },
  {
    message: 'El margen de utilidad debe ser ((PrecioVenta - PrecioCompra) / PrecioCompra) * 100',
    path: ['MargenUtilidad'],
  }
);

export type ProductoFormData = z.infer<typeof productoSchema>;

// ============================================================================
// MOVIMIENTO INVENTARIO SCHEMA
// ============================================================================

export const movimientoInventarioSchema = z.object({
  Fecha: z
    .date({
      required_error: 'La fecha es requerida',
      invalid_type_error: 'Debe ser una fecha válida',
    })
    .refine((date) => date <= new Date(), {
      message: 'La fecha no puede ser futura',
    }),

  ProductoId: z
    .string({
      required_error: 'El ID del producto es requerido',
    })
    .min(1, 'El ID del producto es requerido'),

  ProductoCodigo: z
    .string({
      required_error: 'El código del producto es requerido',
    })
    .min(1, 'El código del producto es requerido'),

  ProductoNombre: z
    .string({
      required_error: 'El nombre del producto es requerido',
    })
    .min(1, 'El nombre del producto es requerido'),

  TipoMovimiento: z
    .enum(['Entrada', 'Salida', 'Ajuste', 'Transferencia', 'Devolucion'], {
      errorMap: () => ({ message: 'Tipo de movimiento inválido' }),
    }),

  Cantidad: z
    .number({
      required_error: 'La cantidad es requerida',
      invalid_type_error: 'Debe ser un número válido',
    })
    .int('La cantidad debe ser un número entero')
    .positive('La cantidad debe ser mayor a 0'),

  StockAnterior: z
    .number({
      required_error: 'El stock anterior es requerido',
      invalid_type_error: 'Debe ser un número válido',
    })
    .int('El stock anterior debe ser un número entero')
    .nonnegative('El stock anterior no puede ser negativo'),

  StockNuevo: z
    .number({
      required_error: 'El stock nuevo es requerido',
      invalid_type_error: 'Debe ser un número válido',
    })
    .int('El stock nuevo debe ser un número entero')
    .nonnegative('El stock nuevo no puede ser negativo'),

  Motivo: z
    .string({
      required_error: 'El motivo es requerido',
    })
    .min(3, 'El motivo debe tener al menos 3 caracteres')
    .max(200, 'El motivo no puede exceder 200 caracteres')
    .trim(),

  Referencia: z
    .string()
    .max(100, 'La referencia no puede exceder 100 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  UsuarioId: z
    .string()
    .optional()
    .or(z.literal('')),

  Notas: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => {
    // Validar que stock nuevo = stock anterior +/- cantidad según tipo
    if (data.TipoMovimiento === 'Entrada' || data.TipoMovimiento === 'Devolucion') {
      return data.StockNuevo === data.StockAnterior + data.Cantidad;
    } else if (data.TipoMovimiento === 'Salida') {
      return data.StockNuevo === data.StockAnterior - data.Cantidad;
    }
    return true; // Para Ajuste y Transferencia, validación manual
  },
  {
    message: 'El stock nuevo no coincide con el cálculo (stock anterior +/- cantidad)',
    path: ['StockNuevo'],
  }
);

export type MovimientoInventarioFormData = z.infer<typeof movimientoInventarioSchema>;

// ============================================================================
// AJUSTE INVENTARIO SCHEMA
// ============================================================================

export const ajusteInventarioSchema = z.object({
  Fecha: z
    .date({
      required_error: 'La fecha es requerida',
      invalid_type_error: 'Debe ser una fecha válida',
    })
    .refine((date) => date <= new Date(), {
      message: 'La fecha no puede ser futura',
    }),

  ProductoId: z
    .string({
      required_error: 'El ID del producto es requerido',
    })
    .min(1, 'El ID del producto es requerido'),

  StockSistema: z
    .number({
      required_error: 'El stock del sistema es requerido',
      invalid_type_error: 'Debe ser un número válido',
    })
    .int('El stock del sistema debe ser un número entero')
    .nonnegative('El stock del sistema no puede ser negativo'),

  StockFisico: z
    .number({
      required_error: 'El stock físico es requerido',
      invalid_type_error: 'Debe ser un número válido',
    })
    .int('El stock físico debe ser un número entero')
    .nonnegative('El stock físico no puede ser negativo'),

  Diferencia: z
    .number({
      invalid_type_error: 'Debe ser un número válido',
    })
    .int('La diferencia debe ser un número entero'),

  Motivo: z
    .string({
      required_error: 'El motivo es requerido',
    })
    .min(5, 'El motivo debe tener al menos 5 caracteres')
    .max(200, 'El motivo no puede exceder 200 caracteres')
    .trim(),

  UsuarioId: z
    .string()
    .optional()
    .or(z.literal('')),

  Notas: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => {
    // Diferencia debe ser StockFisico - StockSistema
    return data.Diferencia === data.StockFisico - data.StockSistema;
  },
  {
    message: 'La diferencia debe ser Stock Físico - Stock Sistema',
    path: ['Diferencia'],
  }
);

export type AjusteInventarioFormData = z.infer<typeof ajusteInventarioSchema>;

// ============================================================================
// CONSTANTS
// ============================================================================

export const CATEGORIAS_PRODUCTO = [
  'Electrónica',
  'Ropa',
  'Alimentos',
  'Bebidas',
  'Hogar',
  'Deportes',
  'Juguetes',
  'Libros',
  'Salud',
  'Belleza',
  'Automotriz',
  'Herramientas',
  'Otro',
] as const;

export const UNIDADES_MEDIDA = [
  'Pieza',
  'Caja',
  'Paquete',
  'Kilogramo',
  'Litro',
  'Metro',
  'Otro',
] as const;

export const TIPOS_MOVIMIENTO = [
  'Entrada',
  'Salida',
  'Ajuste',
  'Transferencia',
  'Devolucion',
] as const;
