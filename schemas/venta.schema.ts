/**
 * VENTA SCHEMA - Validación con Zod
 * Esquemas de validación para Control Maestro (Ventas)
 */

import { z } from 'zod';

// ============================================================================
// VENTA SCHEMA
// ============================================================================

export const ventaSchema = z.object({
  Fecha: z
    .date({
      required_error: 'La fecha es requerida',
      invalid_type_error: 'Debe ser una fecha válida',
    })
    .refine((date) => date <= new Date(), {
      message: 'La fecha no puede ser futura',
    }),

  Cliente: z
    .string({
      required_error: 'El cliente es requerido',
    })
    .min(2, 'El nombre del cliente debe tener al menos 2 caracteres')
    .max(100, 'El nombre del cliente no puede exceder 100 caracteres')
    .trim(),

  ClienteId: z
    .string()
    .optional()
    .or(z.literal('')),

  Total: z
    .number({
      required_error: 'El total es requerido',
      invalid_type_error: 'Debe ser un número válido',
    })
    .positive('El total debe ser mayor a 0')
    .finite('El total debe ser un número finito')
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: 'El total solo puede tener 2 decimales',
    }),

  Costo: z
    .number({
      invalid_type_error: 'Debe ser un número válido',
    })
    .nonnegative('El costo no puede ser negativo')
    .finite('El costo debe ser un número finito')
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: 'El costo solo puede tener 2 decimales',
    })
    .optional()
    .or(z.literal(0)),

  Utilidad: z
    .number({
      invalid_type_error: 'Debe ser un número válido',
    })
    .finite('La utilidad debe ser un número finito')
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: 'La utilidad solo puede tener 2 decimales',
    })
    .optional()
    .or(z.literal(0)),

  Estado: z
    .enum(['Pendiente', 'Pagado', 'Parcial', 'Cancelado'], {
      errorMap: () => ({ message: 'Estado inválido' }),
    })
    .default('Pendiente'),

  FormaPago: z
    .enum(['Efectivo', 'Tarjeta', 'Transferencia', 'Cheque', 'Crédito'], {
      errorMap: () => ({ message: 'Forma de pago inválida' }),
    })
    .optional()
    .or(z.literal('')),

  NumeroFactura: z
    .string()
    .max(50, 'El número de factura no puede exceder 50 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  Productos: z
    .array(
      z.object({
        id: z.string().optional(),
        nombre: z.string().min(1, 'El nombre del producto es requerido'),
        cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
        precioUnitario: z.number().positive('El precio debe ser mayor a 0'),
        subtotal: z.number().nonnegative('El subtotal no puede ser negativo'),
      })
    )
    .min(1, 'Debe incluir al menos un producto')
    .optional(),

  Notas: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => {
    // Si hay costo, calcular utilidad automáticamente
    if (data.Costo !== undefined && data.Costo > 0) {
      const utilidadCalculada = data.Total - data.Costo;
      return Math.abs((data.Utilidad || 0) - utilidadCalculada) < 0.01;
    }
    return true;
  },
  {
    message: 'La utilidad debe ser Total - Costo',
    path: ['Utilidad'],
  }
);

export type VentaFormData = z.infer<typeof ventaSchema>;

// ============================================================================
// PAGO VENTA SCHEMA
// ============================================================================

export const pagoVentaSchema = z.object({
  Fecha: z
    .date({
      required_error: 'La fecha es requerida',
      invalid_type_error: 'Debe ser una fecha válida',
    })
    .refine((date) => date <= new Date(), {
      message: 'La fecha no puede ser futura',
    }),

  VentaId: z
    .string({
      required_error: 'El ID de la venta es requerido',
    })
    .min(1, 'El ID de la venta es requerido'),

  Monto: z
    .number({
      required_error: 'El monto es requerido',
      invalid_type_error: 'Debe ser un número válido',
    })
    .positive('El monto debe ser mayor a 0')
    .finite('El monto debe ser un número finito')
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: 'El monto solo puede tener 2 decimales',
    }),

  FormaPago: z
    .enum(['Efectivo', 'Tarjeta', 'Transferencia', 'Cheque'], {
      errorMap: () => ({ message: 'Forma de pago inválida' }),
    }),

  BancoDestino: z
    .string({
      required_error: 'El banco de destino es requerido',
    })
    .min(2, 'El banco de destino es requerido'),

  Referencia: z
    .string()
    .max(100, 'La referencia no puede exceder 100 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  Notas: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
});

export type PagoVentaFormData = z.infer<typeof pagoVentaSchema>;

// ============================================================================
// CONSTANTS
// ============================================================================

export const ESTADOS_VENTA = ['Pendiente', 'Pagado', 'Parcial', 'Cancelado'] as const;

export const FORMAS_PAGO = ['Efectivo', 'Tarjeta', 'Transferencia', 'Cheque', 'Crédito'] as const;
