/**
 * 📝 MODAL GENÉRICO DE EDICIÓN
 * Modal reutilizable para editar Ingresos, Gastos y Transferencias
 * - Validación con Zod
 * - Actualización optimistic
 * - Toast notifications
 * - Animaciones Framer Motion
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    Calendar,
    DollarSign,
    FileText,
    Tag,
    X,
} from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// ========================================================================
// SCHEMAS DE VALIDACIÓN
// ========================================================================

const ingresoSchema = z.object({
  monto: z.number().positive('Monto debe ser mayor a 0'),
  concepto: z.string().min(3, 'Concepto mínimo 3 caracteres').max(100),
  fuente: z.string().min(1, 'Selecciona fuente'),
  notas: z.string().optional(),
  fecha: z.date(),
});

const gastoSchema = z.object({
  monto: z.number().positive('Monto debe ser mayor a 0'),
  concepto: z.string().min(3, 'Concepto mínimo 3 caracteres').max(100),
  categoria: z.string().min(1, 'Selecciona categoría'),
  notas: z.string().optional(),
  fecha: z.date(),
});

const transferenciaSchema = z.object({
  monto: z.number().positive('Monto debe ser mayor a 0'),
  bancoDestinoId: z.string().min(1, 'Selecciona banco destino'),
  concepto: z.string().min(3, 'Concepto mínimo 3 caracteres').max(100),
  notas: z.string().optional(),
  fecha: z.date(),
});

// ========================================================================
// CONSTANTES
// ========================================================================

const CATEGORIAS_GASTO = [
  { value: 'Nómina', label: 'Nómina', icon: '👥' },
  { value: 'Renta', label: 'Renta', icon: '🏢' },
  { value: 'Servicios', label: 'Servicios', icon: '⚡' },
  { value: 'Combustible', label: 'Combustible', icon: '⛽' },
  { value: 'Mantenimiento', label: 'Mantenimiento', icon: '🔧' },
  { value: 'Compras', label: 'Compras', icon: '🛒' },
  { value: 'Impuestos', label: 'Impuestos', icon: '📋' },
  { value: 'Otros', label: 'Otros', icon: '📦' },
];

const FUENTES_INGRESO = [
  { value: 'Ventas', label: 'Ventas', icon: '💰' },
  { value: 'Inversión', label: 'Inversión', icon: '📈' },
  { value: 'Préstamo', label: 'Préstamo', icon: '🏦' },
  { value: 'Otros', label: 'Otros', icon: '📦' },
];

// ========================================================================
// COMPONENTE PRINCIPAL
// ========================================================================

export const EditRecordModal = ({
  isOpen,
  onClose,
  type, // 'ingreso' | 'gasto' | 'transferencia'
  data,
  onUpdate,
  bancos = [],
  currentBancoId,
}) => {
  // Seleccionar schema según tipo
  const getSchema = () => {
    switch (type) {
      case 'ingreso':
        return ingresoSchema;
      case 'gasto':
        return gastoSchema;
      case 'transferencia':
        return transferenciaSchema;
      default:
        return z.object({});
    }
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: {
      monto: data?.monto || 0,
      concepto: data?.concepto || '',
      notas: data?.notas || '',
      fecha: data?.fecha ? new Date(data.fecha) : new Date(),
      ...(type === 'ingreso' && { fuente: data?.fuente || '' }),
      ...(type === 'gasto' && { categoria: data?.categoria || '' }),
      ...(type === 'transferencia' && {
        bancoDestinoId: data?.bancoDestinoId || '',
      }),
    },
  });

  // Reset form cuando cambian los datos
  useEffect(() => {
    if (data) {
      reset({
        monto: data.monto || 0,
        concepto: data.concepto || '',
        notas: data.notas || '',
        fecha: data.fecha ? new Date(data.fecha) : new Date(),
        ...(type === 'ingreso' && { fuente: data.fuente || '' }),
        ...(type === 'gasto' && { categoria: data.categoria || '' }),
        ...(type === 'transferencia' && {
          bancoDestinoId: data.bancoDestinoId || '',
        }),
      });
    }
  }, [data, type, reset]);

  const onSubmit = async (formData) => {
    try {
      await onUpdate(data.id, formData);
      toast.success(`✅ ${getTitleByType()} actualizado`);
      onClose();
    } catch (error) {
      toast.error(`❌ Error: ${error.message}`);
    }
  };

  const getTitleByType = () => {
    switch (type) {
      case 'ingreso':
        return 'Ingreso';
      case 'gasto':
        return 'Gasto';
      case 'transferencia':
        return 'Transferencia';
      default:
        return 'Registro';
    }
  };

  const getIconByType = () => {
    switch (type) {
      case 'ingreso':
        return '📥';
      case 'gasto':
        return '📤';
      case 'transferencia':
        return '🔄';
      default:
        return '📝';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getIconByType()}</span>
                    <h2 className="text-xl font-bold">
                      Editar {getTitleByType()}
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]"
              >
                <div className="space-y-6">
                  {/* Monto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-2" />
                      Monto *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('monto', { valueAsNumber: true })}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                        errors.monto
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 focus:border-blue-500'
                      } focus:outline-none`}
                      placeholder="0.00"
                    />
                    {errors.monto && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.monto.message}
                      </p>
                    )}
                  </div>

                  {/* Concepto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Concepto *
                    </label>
                    <input
                      type="text"
                      {...register('concepto')}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                        errors.concepto
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 focus:border-blue-500'
                      } focus:outline-none`}
                      placeholder="Describe el concepto..."
                    />
                    {errors.concepto && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.concepto.message}
                      </p>
                    )}
                  </div>

                  {/* Campos específicos por tipo */}
                  {type === 'ingreso' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Tag className="w-4 h-4 inline mr-2" />
                        Fuente *
                      </label>
                      <select
                        {...register('fuente')}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                          errors.fuente
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-200 focus:border-blue-500'
                        } focus:outline-none`}
                      >
                        <option value="">Selecciona fuente...</option>
                        {FUENTES_INGRESO.map((fuente) => (
                          <option key={fuente.value} value={fuente.value}>
                            {fuente.icon} {fuente.label}
                          </option>
                        ))}
                      </select>
                      {errors.fuente && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.fuente.message}
                        </p>
                      )}
                    </div>
                  )}

                  {type === 'gasto' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Tag className="w-4 h-4 inline mr-2" />
                        Categoría *
                      </label>
                      <select
                        {...register('categoria')}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                          errors.categoria
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-200 focus:border-blue-500'
                        } focus:outline-none`}
                      >
                        <option value="">Selecciona categoría...</option>
                        {CATEGORIAS_GASTO.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </option>
                        ))}
                      </select>
                      {errors.categoria && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.categoria.message}
                        </p>
                      )}
                    </div>
                  )}

                  {type === 'transferencia' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Tag className="w-4 h-4 inline mr-2" />
                        Banco Destino *
                      </label>
                      <select
                        {...register('bancoDestinoId')}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                          errors.bancoDestinoId
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-200 focus:border-blue-500'
                        } focus:outline-none`}
                      >
                        <option value="">Selecciona banco...</option>
                        {bancos
                          .filter((b) => b.id !== currentBancoId)
                          .map((banco) => (
                            <option key={banco.id} value={banco.id}>
                              {banco.icon} {banco.nombre}
                            </option>
                          ))}
                      </select>
                      {errors.bancoDestinoId && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.bancoDestinoId.message}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Fecha */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Fecha
                    </label>
                    <Controller
                      name="fecha"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="date"
                          value={
                            field.value instanceof Date
                              ? field.value.toISOString().split('T')[0]
                              : ''
                          }
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                        />
                      )}
                    />
                  </div>

                  {/* Notas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Notas (opcional)
                    </label>
                    <textarea
                      {...register('notas')}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                      placeholder="Agrega notas adicionales..."
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EditRecordModal;
