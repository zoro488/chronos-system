/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                     CHRONOS TRANSFERENCIA FORM                             ║
 * ║              Formulario de Transferencia entre Bancos                      ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Formulario para registrar transferencias entre cuentas bancarias:
 * - Banco origen y destino
 * - Monto de transferencia
 * - Genera 2 movimientos bancarios automáticamente
 * - Validación de saldos
 *
 * @module TransferenciaForm
 * @author CHRONOS System
 * @version 1.0.0
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  updateDoc,
} from 'firebase/firestore';
import PropTypes from 'prop-types';
import { z } from 'zod';

import { Spinner } from '../components/animations/AnimationSystem';
import { useAuth } from '../components/auth';
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

const transferenciaSchema = z
  .object({
    fecha: z.string().min(1, 'Fecha requerida'),
    bancoOrigen: z.string().min(1, 'Banco origen requerido'),
    bancoDestino: z.string().min(1, 'Banco destino requerido'),
    monto: z.number().min(1, 'Monto debe ser mayor a 0'),
    concepto: z.string().min(1, 'Concepto requerido'),
    referencia: z.string().optional(),
    notas: z.string().optional(),
  })
  .refine((data) => data.bancoOrigen !== data.bancoDestino, {
    message: 'Los bancos deben ser diferentes',
    path: ['bancoDestino'],
  });

const cn = (...classes) => classes.filter(Boolean).join(' ');

const BANCOS = [
  { value: 'bovedaMonte', label: 'Bóveda Monte' },
  { value: 'bovedaUsa', label: 'Bóveda USA' },
  { value: 'utilidades', label: 'Utilidades' },
  { value: 'fleteSur', label: 'Flete Sur' },
  { value: 'azteca', label: 'Azteca' },
  { value: 'leftie', label: 'Leftie' },
  { value: 'profit', label: 'Profit' },
];

export const TransferenciaForm = ({ onSuccess, onCancel, className = '' }) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const db = getFirestore();
  const { user, userData } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transferenciaSchema),
    defaultValues: {
      fecha: new Date().toISOString().split('T')[0],
      bancoOrigen: '',
      bancoDestino: '',
      monto: 0,
      concepto: '',
      referencia: '',
      notas: '',
    },
  });

  const watchBancoOrigen = watch('bancoOrigen');
  const watchBancoDestino = watch('bancoDestino');
  const watchMonto = watch('monto');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const fecha = Timestamp.fromDate(new Date(data.fecha));

      // Get current balances
      const bancoOrigenRef = doc(db, 'bancos', data.bancoOrigen);
      const bancoDestinoRef = doc(db, 'bancos', data.bancoDestino);

      const [bancoOrigenDoc, bancoDestinoDoc] = await Promise.all([
        getDoc(bancoOrigenRef),
        getDoc(bancoDestinoRef),
      ]);

      let saldoOrigen = 0;
      let saldoDestino = 0;

      if (bancoOrigenDoc.exists()) {
        saldoOrigen = bancoOrigenDoc.data().saldo || 0;
      }

      if (bancoDestinoDoc.exists()) {
        saldoDestino = bancoDestinoDoc.data().saldo || 0;
      }

      // Validate sufficient balance
      if (saldoOrigen < data.monto) {
        toast.error('Saldo insuficiente en el banco origen');
        setLoading(false);
        return;
      }

      const nuevoSaldoOrigen = saldoOrigen - data.monto;
      const nuevoSaldoDestino = saldoDestino + data.monto;

      // Movimiento de salida (banco origen)
      await addDoc(collection(db, 'movimientosBancarios'), {
        folio: `MB-${Date.now()}-OUT`,
        fecha,
        banco: data.bancoOrigen,
        tipo: 'transferencia_salida',
        categoria: 'transferencia',
        monto: data.monto,
        saldoAnterior: saldoOrigen,
        saldo: nuevoSaldoOrigen,
        concepto: `TRANSFERENCIA A: ${data.bancoDestino} - ${data.concepto}`,
        referencia: data.referencia || null,
        metodoPago: 'transferencia',
        bancoDestino: data.bancoDestino,
        notas: data.notas || null,
        createdAt: Timestamp.now(),
        createdBy: user?.uid || 'system',
        createdByName: userData?.displayName || 'Sistema',
      });

      // Movimiento de entrada (banco destino)
      await addDoc(collection(db, 'movimientosBancarios'), {
        folio: `MB-${Date.now()}-IN`,
        fecha,
        banco: data.bancoDestino,
        tipo: 'transferencia_entrada',
        categoria: 'transferencia',
        monto: data.monto,
        saldoAnterior: saldoDestino,
        saldo: nuevoSaldoDestino,
        concepto: `TRANSFERENCIA DE: ${data.bancoOrigen} - ${data.concepto}`,
        referencia: data.referencia || null,
        metodoPago: 'transferencia',
        bancoOrigen: data.bancoOrigen,
        notas: data.notas || null,
        createdAt: Timestamp.now(),
        createdBy: user?.uid || 'system',
        createdByName: userData?.displayName || 'Sistema',
      });

      // Update bank balances
      await Promise.all([
        bancoOrigenDoc.exists()
          ? updateDoc(bancoOrigenRef, { saldo: nuevoSaldoOrigen, updatedAt: Timestamp.now() })
          : Promise.resolve(),
        bancoDestinoDoc.exists()
          ? updateDoc(bancoDestinoRef, { saldo: nuevoSaldoDestino, updatedAt: Timestamp.now() })
          : Promise.resolve(),
      ]);

      toast.success('Transferencia registrada exitosamente');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al registrar transferencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-2xl font-bold text-white">Transferencia entre Bancos</h2>
        <p className="text-sm text-white/60 mt-1">Mover fondos entre cuentas</p>
      </div>

      <FormInput label="Fecha *" type="date" {...register('fecha')} error={errors.fecha?.message} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          label="Banco Origen *"
          options={BANCOS}
          {...register('bancoOrigen')}
          error={errors.bancoOrigen?.message}
        />
        <FormSelect
          label="Banco Destino *"
          options={BANCOS}
          {...register('bancoDestino')}
          error={errors.bancoDestino?.message}
        />
      </div>

      {watchBancoOrigen && watchBancoDestino && watchBancoOrigen === watchBancoDestino && (
        <Alert variant="warning">Los bancos origen y destino deben ser diferentes</Alert>
      )}

      <FormMoneyInput
        label="Monto *"
        {...register('monto', { valueAsNumber: true })}
        error={errors.monto?.message}
      />

      {watchMonto > 0 && watchBancoOrigen && watchBancoDestino && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-red-400">-${watchMonto.toLocaleString('es-MX')}</span>
            <span className="text-white/50">→</span>
            <span className="text-green-400">+${watchMonto.toLocaleString('es-MX')}</span>
          </div>
          <div className="flex justify-between text-xs text-white/60">
            <span>{BANCOS.find((b) => b.value === watchBancoOrigen)?.label}</span>
            <span>{BANCOS.find((b) => b.value === watchBancoDestino)?.label}</span>
          </div>
        </div>
      )}

      <FormInput
        label="Concepto *"
        {...register('concepto')}
        error={errors.concepto?.message}
        placeholder="Motivo de la transferencia"
      />
      <FormInput
        label="Referencia"
        {...register('referencia')}
        placeholder="Número de referencia"
      />
      <FormTextarea label="Notas" {...register('notas')} rows={3} />

      <div className="flex justify-end gap-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" /> <span>Guardando...</span>
            </>
          ) : (
            'Registrar Transferencia'
          )}
        </Button>
      </div>
    </form>
  );
};

TransferenciaForm.propTypes = {
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  className: PropTypes.string,
};

export default TransferenciaForm;
