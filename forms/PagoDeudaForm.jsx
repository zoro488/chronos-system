/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                      CHRONOS PAGO DEUDA FORM                               ║
 * ║                 Formulario de Pago de Deudas/Compras                       ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Formulario para registrar pagos de deudas o compras pendientes:
 * - Selector de compra/deuda pendiente
 * - Monto del pago
 * - Método de pago y banco
 * - Actualización de estado
 *
 * @module PagoDeudaForm
 * @author CHRONOS System
 * @version 1.0.0
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Timestamp,
  addDoc,
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
// SCHEMA
// ============================================================================

const pagoDeudaSchema = z
  .object({
    compraId: z.string().min(1, 'Debe seleccionar una compra'),
    monto: z.number().min(1, 'Monto debe ser mayor a 0'),
    metodoPago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'cheque']),
    banco: z.string().optional(),
    referencia: z.string().optional(),
    notas: z.string().optional(),
  })
  .refine((data) => (data.metodoPago === 'transferencia' ? !!data.banco : true), {
    message: 'Banco requerido para transferencias',
    path: ['banco'],
  });

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

export const PagoDeudaForm = ({ compraIdProp = null, onSuccess, onCancel, className = '' }) => {
  const [loading, setLoading] = useState(false);
  const [loadingCompras, setLoadingCompras] = useState(true);
  const [comprasPendientes, setComprasPendientes] = useState([]);
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);
  const toast = useToast();
  const db = getFirestore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(pagoDeudaSchema),
    defaultValues: {
      compraId: compraIdProp || '',
      monto: 0,
      metodoPago: 'efectivo',
      banco: '',
      referencia: '',
      notas: '',
    },
  });

  const watchCompraId = watch('compraId');
  const watchMetodoPago = watch('metodoPago');
  const watchMonto = watch('monto');

  // Load compras pendientes
  useEffect(() => {
    const loadCompras = async () => {
      try {
        setLoadingCompras(true);
        const q = query(collection(db, 'compras'), where('estado', 'in', ['pendiente', 'parcial']));
        const snapshot = await getDocs(q);
        const compras = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          compras.push({
            id: docSnap.id,
            folio: data.folio,
            distribuidorNombre: data.distribuidorNombre,
            total: data.total,
            totalPagado: data.totalPagado || 0,
            saldoPendiente: data.total - (data.totalPagado || 0),
          });
        });

        setComprasPendientes(compras);

        if (compraIdProp) {
          const compra = compras.find((c) => c.id === compraIdProp);
          if (compra) setCompraSeleccionada(compra);
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar compras');
      } finally {
        setLoadingCompras(false);
      }
    };

    loadCompras();
  }, [db, compraIdProp, toast]);

  useEffect(() => {
    if (watchCompraId && !compraSeleccionada) {
      const compra = comprasPendientes.find((c) => c.id === watchCompraId);
      if (compra) setCompraSeleccionada(compra);
    }
  }, [watchCompraId, comprasPendientes, compraSeleccionada]);

  const montoExcedeSaldo = watchMonto > (compraSeleccionada?.saldoPendiente || 0);

  const onSubmit = async (data) => {
    if (!compraSeleccionada || montoExcedeSaldo) return;

    setLoading(true);
    try {
      const pago = {
        fecha: Timestamp.now(),
        monto: data.monto,
        metodoPago: data.metodoPago,
        banco: data.banco || null,
        referencia: data.referencia || null,
        notas: data.notas || null,
      };

      const compraRef = doc(db, 'compras', data.compraId);
      const compraDoc = await getDoc(compraRef);

      if (!compraDoc.exists()) throw new Error('Compra no encontrada');

      const compraData = compraDoc.data();
      const pagosPrevios = compraData.pagos || [];
      const nuevoTotalPagado = (compraData.totalPagado || 0) + data.monto;
      const nuevoSaldoPendiente = compraData.total - nuevoTotalPagado;

      let nuevoEstado = 'pendiente';
      if (nuevoSaldoPendiente === 0) nuevoEstado = 'pagada';
      else if (nuevoTotalPagado > 0) nuevoEstado = 'parcial';

      await updateDoc(compraRef, {
        pagos: [...pagosPrevios, pago],
        totalPagado: nuevoTotalPagado,
        saldoPendiente: nuevoSaldoPendiente,
        estado: nuevoEstado,
        updatedAt: Timestamp.now(),
      });

      // Crear movimiento bancario
      if (data.metodoPago === 'transferencia' && data.banco) {
        await addDoc(collection(db, 'movimientosBancarios'), {
          folio: `MB-${Date.now()}`,
          fecha: Timestamp.now(),
          banco: data.banco,
          tipo: 'salida',
          categoria: 'compra',
          monto: data.monto,
          saldo: 0,
          concepto: `PAGO COMPRA: ${compraSeleccionada.folio}`,
          referencia: data.referencia || null,
          metodoPago: data.metodoPago,
          compraRelacionada: compraSeleccionada.folio,
          notas: data.notas || null,
          createdAt: Timestamp.now(),
          createdBy: 'current-user',
        });
      }

      toast.success('Pago registrado exitosamente');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al registrar pago');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCompras)
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-2xl font-bold text-white">Pago de Deuda/Compra</h2>
        <p className="text-sm text-white/60 mt-1">Registrar pago a proveedores</p>
      </div>

      {!compraIdProp && (
        <FormSelect
          label="Compra *"
          options={comprasPendientes.map((c) => ({
            value: c.id,
            label: `${c.folio} - ${c.distribuidorNombre} - Saldo: $${c.saldoPendiente.toLocaleString('es-MX')}`,
          }))}
          {...register('compraId')}
          error={errors.compraId?.message}
        />
      )}

      {compraSeleccionada && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Detalles</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/60">Folio:</span>
              <span className="ml-2 text-white font-semibold">{compraSeleccionada.folio}</span>
            </div>
            <div>
              <span className="text-white/60">Proveedor:</span>
              <span className="ml-2 text-white font-semibold">
                {compraSeleccionada.distribuidorNombre}
              </span>
            </div>
            <div>
              <span className="text-white/60">Total:</span>
              <span className="ml-2 text-white font-semibold">
                ${compraSeleccionada.total.toLocaleString('es-MX')}
              </span>
            </div>
            <div>
              <span className="text-white/60">Pagado:</span>
              <span className="ml-2 text-green-400 font-semibold">
                ${compraSeleccionada.totalPagado.toLocaleString('es-MX')}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-white/60">Saldo:</span>
              <span className="ml-2 text-yellow-400 font-bold text-lg">
                ${compraSeleccionada.saldoPendiente.toLocaleString('es-MX')}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      <FormMoneyInput
        label="Monto *"
        {...register('monto', { valueAsNumber: true })}
        error={errors.monto?.message}
      />

      {montoExcedeSaldo && <Alert variant="warning">El monto excede el saldo pendiente</Alert>}

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

      <FormInput label="Referencia" {...register('referencia')} />
      <FormTextarea label="Notas" {...register('notas')} rows={3} />

      <div className="flex justify-end gap-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading || montoExcedeSaldo}>
          {loading ? (
            <>
              <Spinner size="sm" /> <span>Guardando...</span>
            </>
          ) : (
            'Registrar Pago'
          )}
        </Button>
      </div>
    </form>
  );
};

PagoDeudaForm.propTypes = {
  compraIdProp: PropTypes.string,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  className: PropTypes.string,
};

export default PagoDeudaForm;
