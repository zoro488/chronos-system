import { z } from 'zod';

/**
 * Schemas de validación para Clientes
 */

/**
 * Schema para crear un cliente
 */
export const CreateClienteSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  apellido: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres')
    .optional(),
  email: z
    .string()
    .email('Email inválido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .optional(),
  telefono: z
    .string()
    .regex(/^\+?[\d\s()-]{8,20}$/, 'Teléfono inválido')
    .optional(),
  rfc: z
    .string()
    .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/, 'RFC inválido')
    .optional(),
  direccion: z
    .object({
      calle: z.string().max(200).optional(),
      numero: z.string().max(20).optional(),
      colonia: z.string().max(100).optional(),
      ciudad: z.string().max(100).optional(),
      estado: z.string().max(100).optional(),
      codigoPostal: z.string().regex(/^\d{5}$/, 'CP inválido').optional(),
    })
    .optional(),
  tipo: z
    .enum(['minorista', 'mayorista', 'distribuidor'], {
      errorMap: () => ({ message: 'Tipo de cliente inválido' }),
    })
    .default('minorista'),
  limiteCredito: z.number().nonnegative('El límite de crédito no puede ser negativo').default(0),
  descuentoDefault: z
    .number()
    .min(0, 'El descuento no puede ser negativo')
    .max(100, 'El descuento no puede ser mayor a 100%')
    .default(0),
  notas: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
  activo: z.boolean().default(true),
});

/**
 * Schema para actualizar un cliente
 */
export const UpdateClienteSchema = CreateClienteSchema.partial().extend({
  id: z.string().min(1, 'ID requerido'),
});

/**
 * Schema para filtros de búsqueda de clientes
 */
export const ClienteFiltersSchema = z.object({
  tipo: z.enum(['minorista', 'mayorista', 'distribuidor']).optional(),
  activo: z.boolean().optional(),
  search: z.string().optional(),
  ciudad: z.string().optional(),
  estado: z.string().optional(),
});

/**
 * Tipos inferidos disponibles como JSDoc:
 * @typedef {z.infer<typeof CreateClienteSchema>} CreateCliente
 * @typedef {z.infer<typeof UpdateClienteSchema>} UpdateCliente
 * @typedef {z.infer<typeof ClienteFiltersSchema>} ClienteFilters
 */
