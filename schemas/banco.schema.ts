/**
 * BANCO SCHEMAS - Validación con Zod
 * Esquemas de validación para formularios de Ingresos y Gastos
 */

import { z } from 'zod';

// ============================================================================
// INGRESO SCHEMA
// ============================================================================

export const ingresoSchema = z.object({
  Fecha: z
    .date({
      required_error: 'La fecha es requerida',
      invalid_type_error: 'Debe ser una fecha válida',
    })
    .refine((date) => date <= new Date(), {
      message: 'La fecha no puede ser futura',
    }),

  Concepto: z
    .string({
      required_error: 'El concepto es requerido',
    })
    .min(3, 'El concepto debe tener al menos 3 caracteres')
    .max(200, 'El concepto no puede exceder 200 caracteres')
    .trim(),

  Ingreso: z
    .number({
      required_error: 'El monto del ingreso es requerido',
      invalid_type_error: 'Debe ser un número válido',
    })
    .positive('El ingreso debe ser mayor a 0')
    .finite('El ingreso debe ser un número finito')
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: 'El ingreso solo puede tener 2 decimales',
    }),

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

export type IngresoFormData = z.infer<typeof ingresoSchema>;

// ============================================================================
// GASTO SCHEMA
// ============================================================================

export const gastoSchema = z.object({
  Fecha: z
    .date({
      required_error: 'La fecha es requerida',
      invalid_type_error: 'Debe ser una fecha válida',
    })
    .refine((date) => date <= new Date(), {
      message: 'La fecha no puede ser futura',
    }),

  Concepto: z
    .string({
      required_error: 'El concepto es requerido',
    })
    .min(3, 'El concepto debe tener al menos 3 caracteres')
    .max(200, 'El concepto no puede exceder 200 caracteres')
    .trim(),

  Gasto: z
    .number({
      required_error: 'El monto del gasto es requerido',
      invalid_type_error: 'Debe ser un número válido',
    })
    .positive('El gasto debe ser mayor a 0')
    .finite('El gasto debe ser un número finito')
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: 'El gasto solo puede tener 2 decimales',
    }),

  Categoria: z
    .string()
    .min(2, 'La categoría debe tener al menos 2 caracteres')
    .max(50, 'La categoría no puede exceder 50 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  Proveedor: z
    .string()
    .max(100, 'El proveedor no puede exceder 100 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),

  Factura: z
    .string()
    .max(50, 'El número de factura no puede exceder 50 caracteres')
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

export type GastoFormData = z.infer<typeof gastoSchema>;

// ============================================================================
// TRANSFERENCIA SCHEMA
// ============================================================================

export const transferenciaSchema = z.object({
  Fecha: z
    .date({
      required_error: 'La fecha es requerida',
      invalid_type_error: 'Debe ser una fecha válida',
    })
    .refine((date) => date <= new Date(), {
      message: 'La fecha no puede ser futura',
    }),

  BancoOrigen: z
    .string({
      required_error: 'El banco de origen es requerido',
    })
    .min(2, 'El banco de origen es requerido'),

  BancoDestino: z
    .string({
      required_error: 'El banco de destino es requerido',
    })
    .min(2, 'El banco de destino es requerido'),

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

  Concepto: z
    .string({
      required_error: 'El concepto es requerido',
    })
    .min(3, 'El concepto debe tener al menos 3 caracteres')
    .max(200, 'El concepto no puede exceder 200 caracteres')
    .trim(),

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
}).refine(
  (data) => data.BancoOrigen !== data.BancoDestino,
  {
    message: 'El banco de origen y destino deben ser diferentes',
    path: ['BancoDestino'],
  }
);

export type TransferenciaFormData = z.infer<typeof transferenciaSchema>;

// ============================================================================
// CONSTANTS
// ============================================================================

export const CATEGORIAS_GASTO = [
  'Nómina',
  'Servicios',
  'Renta',
  'Mantenimiento',
  'Combustible',
  'Seguros',
  'Marketing',
  'Impuestos',
  'Compras',
  'Otros',
] as const;

export const BANCOS_DISPONIBLES = [
  { id: 'almacen_monte', nombre: 'Almacén Monte' },
  { id: 'boveda_monte', nombre: 'Bóveda Monte' },
  { id: 'boveda_usa', nombre: 'Bóveda USA' },
  { id: 'azteca', nombre: 'Azteca' },
  { id: 'utilidades', nombre: 'Utilidades' },
  { id: 'flete_sur', nombre: 'Flete Sur' },
  { id: 'leftie', nombre: 'Leftie' },
  { id: 'profit', nombre: 'Profit' },
] as const;
