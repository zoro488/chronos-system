/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                         CHRONOS ABONO FORM                                 ║
 * ║                 Formulario de Abono a Ventas Pendientes                    ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Formulario para registrar abonos parciales a ventas pendientes:
 * - Selector de venta pendiente
 * - Monto del abono con validación
 * - Método de pago y banco
 * - Actualización automática del saldo
 * - Validación con Zod
 *
 * @module AbonoForm
 * @author CHRONOS System
 * @version 1.0.0
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { z } from 'zod';

// Components
import { Spinner } from '../components/animations/AnimationSystem';
import { Alert, useToast } from '../components/feedback/FeedbackComponents';
import { Button } from '../components/ui/BaseComponents';
import {
  FormInput,
  FormMoneyInput,
  FormSelect,
  FormTextarea,
} from '../components/ui/FormComponents';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const abonoSchema = z
  .object({
    ventaId: z.string().min(1, 'Debe seleccionar una venta'),
    monto: z.number().min(1, 'El monto debe ser mayor a 0'),
    metodoPago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'cheque'], {
      errorMap: () => ({ message: 'Método de pago inválido' }),
    }),
    banco: z.string().optional(),
    referencia: z.string().optional(),
    notas: z.string().optional(),
  })
  .refine(
    (data) => {
      // Si el método es transferencia, el banco es requerido
      if (data.metodoPago === 'transferencia' && !data.banco) {
        return false;
      }
      return true;
    },
    {
      message: 'Banco requerido para transferencias',
      path: ['banco'],
    }
  );

// ============================================================================
// UTILITIES
// ============================================================================

const cn = (...classes) => classes.filter(Boolean).join(' ');

const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'cheque', label: 'Cheque' },
];

const BANCOS = [
  { value: 'bovedaMonte', label: 'Bóveda Monte' },
  { value: 'bovedaUsa', label: 'Bóveda USA' },
  { value: 'utilidades', label: 'Utilidades' },
  { value: 'fleteSur', label: 'Flete Sur' },
  { value: 'azteca', label: 'Azteca' },
  { value: 'leftie', label: 'Leftie' },
  { value: 'profit', label: 'Profit' },
];

// ============================================================================
// ABONO FORM COMPONENT
// ============================================================================

/**
 * AbonoForm - Formulario de registro de abono
 */
export const AbonoForm = ({ ventaIdProp = null, onSuccess, onCancel, className = '' }) => {
  const [loading, setLoading] = useState(false);
  const [loadingVentas, setLoadingVentas] = useState(true);
  const [ventasPendientes, setVentasPendientes] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const toast = useToast();
  const db = getFirestore();

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(abonoSchema),
    defaultValues: {
      ventaId: ventaIdProp || '',
      monto: 0,
      metodoPago: 'efectivo',
      banco: '',
      referencia: '',
      notas: '',
    },
  });

  // Watch values
  const watchVentaId = watch('ventaId');
  const watchMetodoPago = watch('metodoPago');
  const watchMonto = watch('monto');

  // ============================================================================
  // LOAD VENTAS PENDIENTES
  // ============================================================================

  useEffect(() => {
    const loadVentasPendientes = async () => {
      try {
        setLoadingVentas(true);
        const ventasRef = collection(db, 'ventas');
        const q = query(ventasRef, where('estado', 'in', ['pendiente', 'parcial']));

        const snapshot = await getDocs(q);
        const ventas = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          ventas.push({
            id: doc.id,
            folio: data.folio,
            clienteNombre: data.clienteNombre,
            total: data.total,
            totalPagado: data.totalPagado,
            saldoPendiente: data.saldoPendiente,
            fecha: data.fecha,
          });
        });

        setVentasPendientes(ventas);

        // Si viene ventaIdProp, cargar esa venta
        if (ventaIdProp) {
          const venta = ventas.find((v) => v.id === ventaIdProp);
          if (venta) {
            setVentaSeleccionada(venta);
          }
        }
      } catch (error) {
        console.error('Error cargando ventas pendientes:', error);
        toast.error('Error al cargar ventas pendientes');
      } finally {
        setLoadingVentas(false);
      }
    };

    loadVentasPendientes();
  }, [db, ventaIdProp, toast]);

  // ============================================================================
  // LOAD VENTA SELECCIONADA
  // ============================================================================

  useEffect(() => {
    if (watchVentaId && !ventaSeleccionada) {
      const venta = ventasPendientes.find((v) => v.id === watchVentaId);
      if (venta) {
        setVentaSeleccionada(venta);
      }
    }
  }, [watchVentaId, ventasPendientes, ventaSeleccionada]);

  // ============================================================================
  // VALIDATIONS
  // ============================================================================

  const montoExcedeSaldo = watchMonto > (ventaSeleccionada?.saldoPendiente || 0);
  const montoValido = watchMonto > 0 && !montoExcedeSaldo;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Submit del formulario
   */
  const onSubmit = async (data) => {
    if (!ventaSeleccionada) {
      toast.error('Debe seleccionar una venta');
      return;
    }

    if (montoExcedeSaldo) {
      toast.error('El monto excede el saldo pendiente');
      return;
    }

    setLoading(true);

    try {
      // Crear objeto de pago
      const pago = {
        fecha: Timestamp.now(),
        monto: data.monto,
        metodoPago: data.metodoPago,
        banco: data.banco || null,
        referencia: data.referencia || null,
        notas: data.notas || null,
      };

      // Cargar venta completa
      const ventaRef = doc(db, 'ventas', data.ventaId);
      const ventaDoc = await getDoc(ventaRef);

      if (!ventaDoc.exists()) {
        throw new Error('Venta no encontrada');
      }

      const ventaData = ventaDoc.data();
      const pagosPrevios = ventaData.pagos || [];
      const nuevoTotalPagado = (ventaData.totalPagado || 0) + data.monto;
      const nuevoSaldoPendiente = ventaData.total - nuevoTotalPagado;

      // Determinar nuevo estado
      let nuevoEstado = 'pendiente';
      if (nuevoSaldoPendiente === 0) {
        nuevoEstado = 'liquidada';
      } else if (nuevoTotalPagado > 0) {
        nuevoEstado = 'parcial';
      }

      // Actualizar venta
      await updateDoc(ventaRef, {
        pagos: [...pagosPrevios, pago],
        totalPagado: nuevoTotalPagado,
        saldoPendiente: nuevoSaldoPendiente,
        estado: nuevoEstado,
        updatedAt: Timestamp.now(),
      });

      // Crear movimiento bancario si aplica
      if (data.metodoPago === 'transferencia' && data.banco) {
        // TODO: Crear movimiento bancario
        // await addDoc(collection(db, 'movimientosBancarios'), { ... });
      }

      toast.success('Abono registrado exitosamente');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error guardando abono:', error);
      toast.error('Error al guardar el abono');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loadingVentas) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Registrar Abono</h2>
        <p className="text-sm text-white/60 mt-1">Abono parcial a una venta pendiente</p>
      </div>

      {/* Venta Selector */}
      {!ventaIdProp && (
        <FormSelect
          label="Venta *"
          options={ventasPendientes.map((v) => ({
            value: v.id,
            label: `${v.folio} - ${v.clienteNombre} - Saldo: $${v.saldoPendiente.toLocaleString('es-MX')}`,
          }))}
          {...register('ventaId')}
          error={errors.ventaId?.message}
        />
      )}

      {/* Detalles de la Venta */}
      {ventaSeleccionada && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Detalles de la Venta</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/60">Folio:</span>
              <span className="ml-2 text-white font-semibold">{ventaSeleccionada.folio}</span>
            </div>
            <div>
              <span className="text-white/60">Cliente:</span>
              <span className="ml-2 text-white font-semibold">
                {ventaSeleccionada.clienteNombre}
              </span>
            </div>
            <div>
              <span className="text-white/60">Total:</span>
              <span className="ml-2 text-white font-semibold">
                ${ventaSeleccionada.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-white/60">Pagado:</span>
              <span className="ml-2 text-green-400 font-semibold">
                $
                {ventaSeleccionada.totalPagado.toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-white/60">Saldo Pendiente:</span>
              <span className="ml-2 text-yellow-400 font-bold text-lg">
                $
                {ventaSeleccionada.saldoPendiente.toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Monto */}
      <div>
        <FormMoneyInput
          label="Monto del Abono *"
          {...register('monto', { valueAsNumber: true })}
          error={errors.monto?.message}
        />
        {montoExcedeSaldo && (
          <Alert variant="warning" className="mt-2">
            El monto excede el saldo pendiente de $
            {ventaSeleccionada?.saldoPendiente.toLocaleString('es-MX')}
          </Alert>
        )}
        {montoValido && ventaSeleccionada && (
          <div className="mt-2 p-3 rounded-lg bg-green-500/10 border border-green-500/50">
            <p className="text-sm text-green-400">
              Nuevo saldo: $
              {(ventaSeleccionada.saldoPendiente - watchMonto).toLocaleString('es-MX', {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        )}
      </div>

      {/* Método de Pago */}
      <FormSelect
        label="Método de Pago *"
        options={METODOS_PAGO}
        {...register('metodoPago')}
        error={errors.metodoPago?.message}
      />

      {/* Banco (si es transferencia) */}
      {watchMetodoPago === 'transferencia' && (
        <FormSelect
          label="Banco *"
          options={BANCOS}
          {...register('banco')}
          error={errors.banco?.message}
        />
      )}

      {/* Referencia */}
      <FormInput
        label="Referencia"
        {...register('referencia')}
        placeholder="Número de referencia, folio, etc."
      />

      {/* Notas */}
      <FormTextarea
        label="Notas"
        {...register('notas')}
        placeholder="Notas adicionales sobre el abono..."
        rows={3}
      />

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !montoValido}
          className="min-w-[200px]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span>Guardando...</span>
            </div>
          ) : (
            'Registrar Abono'
          )}
        </Button>
      </div>
    </form>
  );
};

AbonoForm.propTypes = {
  ventaIdProp: PropTypes.string,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  className: PropTypes.string,
};

export default AbonoForm;
