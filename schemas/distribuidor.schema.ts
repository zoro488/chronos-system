/**
 * DISTRIBUIDOR SCHEMA - Validación con Zod
 * Esquemas de validación para Distribuidores y Órdenes de Compra
 */

import { z } from 'zod';

// ============================================================================
// DISTRIBUIDOR SCHEMA
// ============================================================================

export const distribuidorSchema = z.object({
  Nombre: z
    .string({
      required_error: 'El nombre es requerido',
    })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),

  RFC: z
    .string()
    .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, 'RFC inválido (formato: ABC123456XYZ)')
    .trim()
    .optional()
    .or(z.literal('')),

  Email: z
    .string()
    .email('Email inválido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  Telefono: z
    .string()
    .regex(/^\d{10}$/, 'Teléfono inválido (10 dígitos)')
    .optional()
    .or(z.literal('')),

  ContactoPrincipal: z
    .string()
    .max(100, 'El contacto principal no puede exceder 100 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  Direccion: z
    .string()
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  Ciudad: z
    .string()
    .max(50, 'La ciudad no puede exceder 50 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  Estado: z
    .string()
    .max(50, 'El estado no puede exceder 50 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  TipoDistribuidor: z
    .enum(['Proveedor', 'Mayorista', 'Importador', 'Fabricante', 'Otro'], {
      errorMap: () => ({ message: 'Tipo de distribuidor inválido' }),
    })
    .default('Proveedor'),

  DiasCredito: z
    .number({
      invalid_type_error: 'Debe ser un número válido',
    })
    .int('Los días de crédito deben ser un número entero')
    .nonnegative('Los días de crédito no pueden ser negativos')
    .max(365, 'Los días de crédito no pueden exceder 365')
    .optional()
    .or(z.literal(0)),

  SaldoPendiente: z
    .number({
      invalid_type_error: 'Debe ser un número válido',
    })
    .nonnegative('El saldo pendiente no puede ser negativo')
    .finite('El saldo pendiente debe ser un número finito')
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: 'El saldo pendiente solo puede tener 2 decimales',
    })
    .optional()
    .or(z.literal(0)),

  FechaRegistro: z
    .date({
      invalid_type_error: 'Debe ser una fecha válida',
    })
    .default(() => new Date()),

  Activo: z
    .boolean()
    .default(true),

  CuentaBancaria: z
    .string()
    .max(50, 'La cuenta bancaria no puede exceder 50 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  CLABE: z
    .string()
    .regex(/^\d{18}$/, 'CLABE inválida (18 dígitos)')
    .optional()
    .or(z.literal('')),

  Notas: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
});

export type DistribuidorFormData = z.infer<typeof distribuidorSchema>;

// ============================================================================
// ORDEN COMPRA SCHEMA
// ============================================================================

export const ordenCompraSchema = z.object({
  Fecha: z
    .date({
      required_error: 'La fecha es requerida',
      invalid_type_error: 'Debe ser una fecha válida',
    })
    .refine((date) => date <= new Date(), {
      message: 'La fecha no puede ser futura',
    }),

  DistribuidorId: z
    .string({
      required_error: 'El ID del distribuidor es requerido',
    })
    .min(1, 'El ID del distribuidor es requerido'),

  DistribuidorNombre: z
    .string({
      required_error: 'El nombre del distribuidor es requerido',
    })
    .min(2, 'El nombre del distribuidor es requerido'),

  NumeroOrden: z
    .string()
    .max(50, 'El número de orden no puede exceder 50 caracteres')
    .trim()
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

  Estado: z
    .enum(['Pendiente', 'Parcial', 'Pagado', 'Cancelado'], {
      errorMap: () => ({ message: 'Estado inválido' }),
    })
    .default('Pendiente'),

  FechaEntregaEstimada: z
    .date({
      invalid_type_error: 'Debe ser una fecha válida',
    })
    .optional(),

  FechaEntregaReal: z
    .date({
      invalid_type_error: 'Debe ser una fecha válida',
    })
    .optional(),

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
    // Fecha de entrega estimada debe ser posterior a fecha de orden
    if (data.FechaEntregaEstimada) {
      return data.FechaEntregaEstimada >= data.Fecha;
    }
    return true;
  },
  {
    message: 'La fecha de entrega estimada debe ser posterior a la fecha de orden',
    path: ['FechaEntregaEstimada'],
  }
).refine(
  (data) => {
    // Si está pagado o cancelado, debe tener fecha de entrega real
    if (data.Estado === 'Pagado' || data.Estado === 'Cancelado') {
      return !!data.FechaEntregaReal;
    }
    return true;
  },
  {
    message: 'Órdenes pagadas o canceladas deben tener fecha de entrega real',
    path: ['FechaEntregaReal'],
  }
);

export type OrdenCompraFormData = z.infer<typeof ordenCompraSchema>;

// ============================================================================
// PAGO DISTRIBUIDOR SCHEMA
// ============================================================================

export const pagoDistribuidorSchema = z.object({
  Fecha: z
    .date({
      required_error: 'La fecha es requerida',
      invalid_type_error: 'Debe ser una fecha válida',
    })
    .refine((date) => date <= new Date(), {
      message: 'La fecha no puede ser futura',
    }),

  DistribuidorId: z
    .string({
      required_error: 'El ID del distribuidor es requerido',
    })
    .min(1, 'El ID del distribuidor es requerido'),

  OrdenCompraId: z
    .string({
      required_error: 'El ID de la orden de compra es requerido',
    })
    .min(1, 'El ID de la orden de compra es requerido'),

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

  BancoOrigen: z
    .string({
      required_error: 'El banco de origen es requerido',
    })
    .min(2, 'El banco de origen es requerido'),

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

export type PagoDistribuidorFormData = z.infer<typeof pagoDistribuidorSchema>;

// ============================================================================
// CONSTANTS
// ============================================================================

export const TIPOS_DISTRIBUIDOR = [
  'Proveedor',
  'Mayorista',
  'Importador',
  'Fabricante',
  'Otro',
] as const;

export const ESTADOS_ORDEN = ['Pendiente', 'Parcial', 'Pagado', 'Cancelado'] as const;
