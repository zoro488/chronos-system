/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                        CHRONOS CLIENTE FORM                                ║
 * ║                    Formulario CRUD de Clientes                             ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Formulario completo para crear y editar clientes:
 * - Información de contacto
 * - Límite de crédito y términos de pago
 * - Cálculo automático de saldo pendiente
 *
 * @module ClienteForm
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

const clienteSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().optional(),
  limiteCredito: z.number().min(0, 'Límite de crédito no puede ser negativo'),
  terminosPago: z.enum(['contado', '7_dias', '15_dias', '30_dias', '60_dias', '90_dias']),
  notas: z.string().optional(),
});

const cn = (...classes) => classes.filter(Boolean).join(' ');

const TERMINOS_PAGO = [
  { value: 'contado', label: 'Contado' },
  { value: '7_dias', label: '7 días' },
  { value: '15_dias', label: '15 días' },
  { value: '30_dias', label: '30 días' },
  { value: '60_dias', label: '60 días' },
  { value: '90_dias', label: '90 días' },
];

export const ClienteForm = ({ clienteId = null, onSuccess, onCancel, className = '' }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!clienteId);
  const [saldoPendiente, setSaldoPendiente] = useState(0);
  const toast = useToast();
  const db = getFirestore();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: '',
      contacto: '',
      telefono: '',
      email: '',
      direccion: '',
      limiteCredito: 0,
      terminosPago: 'contado',
      notas: '',
    },
  });

  const watchLimiteCredito = watch('limiteCredito');

  // Load cliente data if editing
  useEffect(() => {
    if (!clienteId) return;

    const loadCliente = async () => {
      try {
        setLoadingData(true);
        const clienteRef = doc(db, 'clientes', clienteId);
        const clienteDoc = await getDoc(clienteRef);

        if (!clienteDoc.exists()) {
          toast.error('Cliente no encontrado');
          if (onCancel) onCancel();
          return;
        }

        const data = clienteDoc.data();
        reset({
          nombre: data.nombre || '',
          contacto: data.contacto || '',
          telefono: data.telefono || '',
          email: data.email || '',
          direccion: data.direccion || '',
          limiteCredito: data.limiteCredito || 0,
          terminosPago: data.terminosPago || 'contado',
          notas: data.notas || '',
        });

        // Calcular saldo pendiente desde ventas
        const q = query(
          collection(db, 'ventas'),
          where('clienteId', '==', clienteId),
          where('estado', 'in', ['pendiente', 'parcial'])
        );
        const snapshot = await getDocs(q);
        let saldoTotal = 0;
        snapshot.forEach((docSnap) => {
          const venta = docSnap.data();
          saldoTotal += venta.saldoPendiente || 0;
        });
        setSaldoPendiente(saldoTotal);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar cliente');
      } finally {
        setLoadingData(false);
      }
    };

    loadCliente();
  }, [clienteId, db, toast, reset, onCancel]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const clienteData = {
        nombre: data.nombre,
        contacto: data.contacto || null,
        telefono: data.telefono || null,
        email: data.email || null,
        direccion: data.direccion || null,
        limiteCredito: data.limiteCredito,
        terminosPago: data.terminosPago,
        notas: data.notas || null,
        updatedAt: Timestamp.now(),
      };

      if (clienteId) {
        const clienteRef = doc(db, 'clientes', clienteId);
        await updateDoc(clienteRef, clienteData);
        toast.success('Cliente actualizado exitosamente');
      } else {
        await addDoc(collection(db, 'clientes'), {
          ...clienteData,
          saldoPendiente: 0,
          totalCompras: 0,
          createdAt: Timestamp.now(),
          createdBy: 'current-user',
        });
        toast.success('Cliente creado exitosamente');
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar cliente');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData)
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );

  const creditoDisponible = watchLimiteCredito - saldoPendiente;
  const creditoExcedido = saldoPendiente > watchLimiteCredito;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-2xl font-bold text-white">
          {clienteId ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h2>
        <p className="text-sm text-white/60 mt-1">Información del cliente</p>
      </div>

      <FormInput
        label="Nombre *"
        {...register('nombre')}
        error={errors.nombre?.message}
        placeholder="Nombre completo o razón social"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput label="Contacto" {...register('contacto')} placeholder="Nombre de contacto" />
        <FormInput label="Teléfono" {...register('telefono')} placeholder="Número de teléfono" />
      </div>

      <FormInput
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        placeholder="correo@ejemplo.com"
      />
      <FormTextarea
        label="Dirección"
        {...register('direccion')}
        rows={2}
        placeholder="Dirección completa"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormMoneyInput
          label="Límite de Crédito *"
          {...register('limiteCredito', { valueAsNumber: true })}
          error={errors.limiteCredito?.message}
        />
        <FormSelect
          label="Términos de Pago *"
          options={TERMINOS_PAGO}
          {...register('terminosPago')}
          error={errors.terminosPago?.message}
        />
      </div>

      {clienteId && saldoPendiente > 0 && (
        <div
          className={cn(
            'p-6 rounded-2xl border',
            creditoExcedido
              ? 'bg-red-500/10 border-red-500/50'
              : 'bg-blue-500/10 border-blue-500/50'
          )}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Estado de Crédito</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Límite de crédito:</span>
              <span className="text-white font-semibold">
                ${watchLimiteCredito.toLocaleString('es-MX')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Saldo pendiente:</span>
              <span className="text-yellow-400 font-semibold">
                ${saldoPendiente.toLocaleString('es-MX')}
              </span>
            </div>
            <div className="h-px bg-white/10 my-2" />
            <div className="flex justify-between text-lg">
              <span className="text-white font-bold">Crédito disponible:</span>
              <span
                className={cn('font-bold', creditoExcedido ? 'text-red-400' : 'text-green-400')}
              >
                ${creditoDisponible.toLocaleString('es-MX')}
              </span>
            </div>
          </div>
          {creditoExcedido && (
            <Alert variant="error" className="mt-4">
              ⚠️ El cliente ha excedido su límite de crédito
            </Alert>
          )}
        </div>
      )}

      <FormTextarea
        label="Notas"
        {...register('notas')}
        rows={3}
        placeholder="Observaciones adicionales..."
      />

      <div className="flex justify-end gap-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" /> <span>Guardando...</span>
            </>
          ) : clienteId ? (
            'Actualizar'
          ) : (
            'Crear Cliente'
          )}
        </Button>
      </div>
    </form>
  );
};

ClienteForm.propTypes = {
  clienteId: PropTypes.string,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  className: PropTypes.string,
};

export default ClienteForm;
