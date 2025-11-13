/**
 * CLIENTE SCHEMA - Validación con Zod
 * Esquemas de validación para gestión de Clientes
 */

import { z } from 'zod';

// ============================================================================
// CLIENTE SCHEMA
// ============================================================================

export const clienteSchema = z.object({
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

  TelefonoAlternativo: z
    .string()
    .regex(/^\d{10}$/, 'Teléfono inválido (10 dígitos)')
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

  CodigoPostal: z
    .string()
    .regex(/^\d{5}$/, 'Código postal inválido (5 dígitos)')
    .optional()
    .or(z.literal('')),

  TipoCliente: z
    .enum(['Minorista', 'Mayorista', 'Distribuidor', 'Corporativo'], {
      errorMap: () => ({ message: 'Tipo de cliente inválido' }),
    })
    .default('Minorista'),

  LimiteCredito: z
    .number({
      invalid_type_error: 'Debe ser un número válido',
    })
    .nonnegative('El límite de crédito no puede ser negativo')
    .finite('El límite de crédito debe ser un número finito')
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: 'El límite de crédito solo puede tener 2 decimales',
    })
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

  Descuento: z
    .number({
      invalid_type_error: 'Debe ser un número válido',
    })
    .min(0, 'El descuento no puede ser negativo')
    .max(100, 'El descuento no puede ser mayor a 100%')
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: 'El descuento solo puede tener 2 decimales',
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

  Notas: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => {
    // Si tiene saldo pendiente, debe tener límite de crédito
    if ((data.SaldoPendiente || 0) > 0) {
      return (data.LimiteCredito || 0) > 0;
    }
    return true;
  },
  {
    message: 'Cliente con saldo pendiente debe tener límite de crédito',
    path: ['LimiteCredito'],
  }
).refine(
  (data) => {
    // Saldo pendiente no puede exceder límite de crédito
    if ((data.LimiteCredito || 0) > 0) {
      return (data.SaldoPendiente || 0) <= (data.LimiteCredito || 0);
    }
    return true;
  },
  {
    message: 'El saldo pendiente no puede exceder el límite de crédito',
    path: ['SaldoPendiente'],
  }
);

export type ClienteFormData = z.infer<typeof clienteSchema>;

// ============================================================================
// NOTA CREDITO SCHEMA
// ============================================================================

export const notaCreditoSchema = z.object({
  Fecha: z
    .date({
      required_error: 'La fecha es requerida',
      invalid_type_error: 'Debe ser una fecha válida',
    })
    .refine((date) => date <= new Date(), {
      message: 'La fecha no puede ser futura',
    }),

  ClienteId: z
    .string({
      required_error: 'El ID del cliente es requerido',
    })
    .min(1, 'El ID del cliente es requerido'),

  VentaId: z
    .string()
    .optional()
    .or(z.literal('')),

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

  Motivo: z
    .string({
      required_error: 'El motivo es requerido',
    })
    .min(5, 'El motivo debe tener al menos 5 caracteres')
    .max(200, 'El motivo no puede exceder 200 caracteres')
    .trim(),

  NumeroNota: z
    .string()
    .max(50, 'El número de nota no puede exceder 50 caracteres')
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

export type NotaCreditoFormData = z.infer<typeof notaCreditoSchema>;

// ============================================================================
// CONSTANTS
// ============================================================================

export const TIPOS_CLIENTE = ['Minorista', 'Mayorista', 'Distribuidor', 'Corporativo'] as const;

export const ESTADOS_MEXICO = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Coahuila',
  'Colima',
  'Durango',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'México',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas',
] as const;
