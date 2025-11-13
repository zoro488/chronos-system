/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                      CHRONOS PROVEEDOR FORM                                ║
 * ║                  Formulario CRUD de Proveedores                            ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Formulario completo para crear y editar proveedores de servicios:
 * - Información de contacto y fiscal
 * - Servicios que ofrece
 * - Forma de pago preferida
 *
 * @module ProveedorForm
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
  getFirestore,
  updateDoc,
} from 'firebase/firestore';
import PropTypes from 'prop-types';
import { z } from 'zod';

import { Spinner } from '../components/animations/AnimationSystem';
import { useToast } from '../components/feedback/FeedbackComponents';
import { Button } from '../components/ui/BaseComponents';
import { FormInput, FormSelect, FormTextarea } from '../components/ui/FormComponents';

// ============================================================================
// SCHEMA
// ============================================================================

const proveedorSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  servicios: z.string().optional(),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  rfc: z.string().optional(),
  direccion: z.string().optional(),
  formaPagoPreferida: z.enum(['efectivo', 'transferencia', 'tarjeta', 'cheque']),
  notas: z.string().optional(),
});

const cn = (...classes) => classes.filter(Boolean).join(' ');

const FORMAS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'cheque', label: 'Cheque' },
];

export const ProveedorForm = ({ proveedorId = null, onSuccess, onCancel, className = '' }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!proveedorId);
  const toast = useToast();
  const db = getFirestore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(proveedorSchema),
    defaultValues: {
      nombre: '',
      servicios: '',
      contacto: '',
      telefono: '',
      email: '',
      rfc: '',
      direccion: '',
      formaPagoPreferida: 'transferencia',
      notas: '',
    },
  });

  // Load proveedor data if editing
  useEffect(() => {
    if (!proveedorId) return;

    const loadProveedor = async () => {
      try {
        setLoadingData(true);
        const proveedorRef = doc(db, 'proveedores', proveedorId);
        const proveedorDoc = await getDoc(proveedorRef);

        if (!proveedorDoc.exists()) {
          toast.error('Proveedor no encontrado');
          if (onCancel) onCancel();
          return;
        }

        const data = proveedorDoc.data();
        reset({
          nombre: data.nombre || '',
          servicios: Array.isArray(data.servicios) ? data.servicios.join(', ') : '',
          contacto: data.contacto || '',
          telefono: data.telefono || '',
          email: data.email || '',
          rfc: data.rfc || '',
          direccion: data.direccion || '',
          formaPagoPreferida: data.formaPagoPreferida || 'transferencia',
          notas: data.notas || '',
        });
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar proveedor');
      } finally {
        setLoadingData(false);
      }
    };

    loadProveedor();
  }, [proveedorId, db, toast, reset, onCancel]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const serviciosArray = data.servicios
        ? data.servicios
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const proveedorData = {
        nombre: data.nombre,
        servicios: serviciosArray,
        contacto: data.contacto || null,
        telefono: data.telefono || null,
        email: data.email || null,
        rfc: data.rfc || null,
        direccion: data.direccion || null,
        formaPagoPreferida: data.formaPagoPreferida,
        notas: data.notas || null,
        updatedAt: Timestamp.now(),
      };

      if (proveedorId) {
        const proveedorRef = doc(db, 'proveedores', proveedorId);
        await updateDoc(proveedorRef, proveedorData);
        toast.success('Proveedor actualizado exitosamente');
      } else {
        await addDoc(collection(db, 'proveedores'), {
          ...proveedorData,
          totalGastos: 0,
          createdAt: Timestamp.now(),
          createdBy: 'current-user',
        });
        toast.success('Proveedor creado exitosamente');
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar proveedor');
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-2xl font-bold text-white">
          {proveedorId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </h2>
        <p className="text-sm text-white/60 mt-1">Información del proveedor de servicios</p>
      </div>

      <FormInput
        label="Nombre *"
        {...register('nombre')}
        error={errors.nombre?.message}
        placeholder="Nombre de la empresa o persona"
      />

      <FormInput
        label="Servicios"
        {...register('servicios')}
        placeholder="Mantenimiento, Transporte, Limpieza (separados por coma)"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput label="RFC" {...register('rfc')} placeholder="RFC (opcional)" />
        <FormSelect
          label="Forma de Pago Preferida *"
          options={FORMAS_PAGO}
          {...register('formaPagoPreferida')}
          error={errors.formaPagoPreferida?.message}
        />
      </div>

      <FormTextarea
        label="Dirección"
        {...register('direccion')}
        rows={2}
        placeholder="Dirección completa"
      />
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
          ) : proveedorId ? (
            'Actualizar'
          ) : (
            'Crear Proveedor'
          )}
        </Button>
      </div>
    </form>
  );
};

ProveedorForm.propTypes = {
  proveedorId: PropTypes.string,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  className: PropTypes.string,
};

export default ProveedorForm;
