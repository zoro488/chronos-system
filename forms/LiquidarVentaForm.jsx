/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                     CHRONOS LIQUIDAR VENTA FORM                            ║
 * ║              Formulario para Liquidar Ventas Pendientes                    ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Formulario para liquidar el saldo completo de una venta pendiente:
 * - Selector de venta pendiente
 * - Muestra saldo a liquidar
 * - Método de pago y banco
 * - Actualiza automáticamente estado a "liquidada"
 *
 * @module LiquidarVentaForm
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
import { useAuth } from '../components/auth';
import { Alert, useToast } from '../components/feedback/FeedbackComponents';
import { Button } from '../components/ui/BaseComponents';
import { FormInput, FormSelect, FormTextarea } from '../components/ui/FormComponents';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const liquidarSchema = z
  .object({
    ventaId: z.string().min(1, 'Debe seleccionar una venta'),
    metodoPago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'cheque']),
    banco: z.string().optional(),
    referencia: z.string().optional(),
    notas: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.metodoPago === 'transferencia' && !data.banco) return false;
      return true;
    },
    {
      message: 'Banco requerido para transferencias',
      path: ['banco'],
    }
  );

// ============================================================================
// CONSTANTS
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
// LIQUIDAR VENTA FORM COMPONENT
// ============================================================================

export const LiquidarVentaForm = ({ ventaIdProp = null, onSuccess, onCancel, className = '' }) => {
  const [loading, setLoading] = useState(false);
  const [loadingVentas, setLoadingVentas] = useState(true);
  const [ventasPendientes, setVentasPendientes] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const toast = useToast();
  const db = getFirestore();
  const { user, userData } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(liquidarSchema),
    defaultValues: {
      ventaId: ventaIdProp || '',
      metodoPago: 'efectivo',
      banco: '',
      referencia: '',
      notas: '',
    },
  });

  const watchVentaId = watch('ventaId');
  const watchMetodoPago = watch('metodoPago');

  // ============================================================================
  // LOAD DATA
  // ============================================================================

  useEffect(() => {
    const loadVentasPendientes = async () => {
      try {
        setLoadingVentas(true);
        const ventasRef = collection(db, 'ventas');
        const q = query(ventasRef, where('estado', 'in', ['pendiente', 'parcial']));

        const snapshot = await getDocs(q);
        const ventas = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          ventas.push({
            id: docSnap.id,
            folio: data.folio,
            clienteNombre: data.clienteNombre,
            total: data.total,
            totalPagado: data.totalPagado,
            saldoPendiente: data.saldoPendiente,
          });
        });

        setVentasPendientes(ventas);

        if (ventaIdProp) {
          const venta = ventas.find((v) => v.id === ventaIdProp);
          if (venta) setVentaSeleccionada(venta);
        }
      } catch (error) {
        console.error('Error cargando ventas:', error);
        toast.error('Error al cargar ventas');
      } finally {
        setLoadingVentas(false);
      }
    };

    loadVentasPendientes();
  }, [db, ventaIdProp, toast]);

  useEffect(() => {
    if (watchVentaId && !ventaSeleccionada) {
      const venta = ventasPendientes.find((v) => v.id === watchVentaId);
      if (venta) setVentaSeleccionada(venta);
    }
  }, [watchVentaId, ventasPendientes, ventaSeleccionada]);

  // ============================================================================
  // SUBMIT
  // ============================================================================

  const onSubmit = async (data) => {
    if (!ventaSeleccionada) {
      toast.error('Debe seleccionar una venta');
      return;
    }

    setLoading(true);

    try {
      const pago = {
        fecha: Timestamp.now(),
        monto: ventaSeleccionada.saldoPendiente,
        metodoPago: data.metodoPago,
        banco: data.banco || null,
        referencia: data.referencia || null,
        notas: data.notas || null,
      };

      const ventaRef = doc(db, 'ventas', data.ventaId);
      const ventaDoc = await getDoc(ventaRef);

      if (!ventaDoc.exists()) throw new Error('Venta no encontrada');

      const ventaData = ventaDoc.data();
      const pagosPrevios = ventaData.pagos || [];

      await updateDoc(ventaRef, {
        pagos: [...pagosPrevios, pago],
        totalPagado: ventaData.total,
        saldoPendiente: 0,
        estado: 'liquidada',
        updatedAt: Timestamp.now(),
      });

      toast.success('Venta liquidada exitosamente');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error liquidando venta:', error);
      toast.error('Error al liquidar la venta');
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
      <div>
        <h2 className="text-2xl font-bold text-white">Liquidar Venta</h2>
        <p className="text-sm text-white/60 mt-1">Pagar el saldo completo de una venta</p>
      </div>

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

      {ventaSeleccionada && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Resumen de Liquidación</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/60">Folio:</span>
              <span className="text-white font-semibold">{ventaSeleccionada.folio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Cliente:</span>
              <span className="text-white font-semibold">{ventaSeleccionada.clienteNombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Total:</span>
              <span className="text-white font-semibold">
                ${ventaSeleccionada.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Pagado:</span>
              <span className="text-green-400 font-semibold">
                $
                {ventaSeleccionada.totalPagado.toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="pt-3 border-t border-white/20 flex justify-between">
              <span className="text-white font-bold text-lg">Monto a Liquidar:</span>
              <span className="text-yellow-400 font-bold text-2xl">
                $
                {ventaSeleccionada.saldoPendiente.toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      <Alert variant="info">
        Esta acción liquidará completamente la venta y cambiará su estado a "Liquidada"
      </Alert>

      <FormSelect
        label="Método de Pago *"
        options={METODOS_PAGO}
        {...register('metodoPago')}
        error={errors.metodoPago?.message}
      />

      {watchMetodoPago === 'transferencia' && (
        <FormSelect
          label="Banco *"
          options={BANCOS}
          {...register('banco')}
          error={errors.banco?.message}
        />
      )}

      <FormInput
        label="Referencia"
        {...register('referencia')}
        placeholder="Número de referencia, folio, etc."
      />

      <FormTextarea
        label="Notas"
        {...register('notas')}
        placeholder="Notas adicionales..."
        rows={3}
      />

      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !ventaSeleccionada}
          className="min-w-[200px]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span>Liquidando...</span>
            </div>
          ) : (
            'Liquidar Venta'
          )}
        </Button>
      </div>
    </form>
  );
};

LiquidarVentaForm.propTypes = {
  ventaIdProp: PropTypes.string,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  className: PropTypes.string,
};

export default LiquidarVentaForm;
