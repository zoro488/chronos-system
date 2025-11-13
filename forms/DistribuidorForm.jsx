/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                     CHRONOS DISTRIBUIDOR FORM                              ║
 * ║                 Formulario CRUD de Distribuidores                          ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Formulario completo para crear y editar distribuidores/proveedores:
 * - Información de contacto
 * - Categorías de productos
 * - Términos comerciales
 *
 * @module DistribuidorForm
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

const distribuidorSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  categorias: z.string().optional(),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  terminosPago: z.enum(['contado', '7_dias', '15_dias', '30_dias', '60_dias', '90_dias']),
  bancoPreferido: z.string().optional(),
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

const BANCOS = [
  { value: '', label: 'Sin preferencia' },
  { value: 'bovedaMonte', label: 'Bóveda Monte' },
  { value: 'bovedaUsa', label: 'Bóveda USA' },
  { value: 'utilidades', label: 'Utilidades' },
  { value: 'fleteSur', label: 'Flete Sur' },
  { value: 'azteca', label: 'Azteca' },
  { value: 'leftie', label: 'Leftie' },
  { value: 'profit', label: 'Profit' },
];

export const DistribuidorForm = ({
  distribuidorId = null,
  onSuccess,
  onCancel,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!distribuidorId);
  const toast = useToast();
  const db = getFirestore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(distribuidorSchema),
    defaultValues: {
      nombre: '',
      categorias: '',
      contacto: '',
      telefono: '',
      email: '',
      terminosPago: 'contado',
      bancoPreferido: '',
      notas: '',
    },
  });

  // Load distribuidor data if editing
  useEffect(() => {
    if (!distribuidorId) return;

    const loadDistribuidor = async () => {
      try {
        setLoadingData(true);
        const distribuidorRef = doc(db, 'distribuidores', distribuidorId);
        const distribuidorDoc = await getDoc(distribuidorRef);

        if (!distribuidorDoc.exists()) {
          toast.error('Distribuidor no encontrado');
          if (onCancel) onCancel();
          return;
        }

        const data = distribuidorDoc.data();
        reset({
          nombre: data.nombre || '',
          categorias: Array.isArray(data.categorias) ? data.categorias.join(', ') : '',
          contacto: data.contacto || '',
          telefono: data.telefono || '',
          email: data.email || '',
          terminosPago: data.terminosPago || 'contado',
          bancoPreferido: data.bancoPreferido || '',
          notas: data.notas || '',
        });
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar distribuidor');
      } finally {
        setLoadingData(false);
      }
    };

    loadDistribuidor();
  }, [distribuidorId, db, toast, reset, onCancel]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const categoriasArray = data.categorias
        ? data.categorias
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean)
        : [];

      const distribuidorData = {
        nombre: data.nombre,
        categorias: categoriasArray,
        contacto: data.contacto || null,
        telefono: data.telefono || null,
        email: data.email || null,
        terminosPago: data.terminosPago,
        bancoPreferido: data.bancoPreferido || null,
        notas: data.notas || null,
        updatedAt: Timestamp.now(),
      };

      if (distribuidorId) {
        const distribuidorRef = doc(db, 'distribuidores', distribuidorId);
        await updateDoc(distribuidorRef, distribuidorData);
        toast.success('Distribuidor actualizado exitosamente');
      } else {
        await addDoc(collection(db, 'distribuidores'), {
          ...distribuidorData,
          totalCompras: 0,
          createdAt: Timestamp.now(),
          createdBy: 'current-user',
        });
        toast.success('Distribuidor creado exitosamente');
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar distribuidor');
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
          {distribuidorId ? 'Editar Distribuidor' : 'Nuevo Distribuidor'}
        </h2>
        <p className="text-sm text-white/60 mt-1">Información del distribuidor/proveedor</p>
      </div>

      <FormInput
        label="Nombre *"
        {...register('nombre')}
        error={errors.nombre?.message}
        placeholder="Nombre de la empresa"
      />

      <FormInput
        label="Categorías"
        {...register('categorias')}
        placeholder="Electrónica, Ropa, Alimentos (separadas por coma)"
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
        <FormSelect
          label="Términos de Pago *"
          options={TERMINOS_PAGO}
          {...register('terminosPago')}
          error={errors.terminosPago?.message}
        />
        <FormSelect label="Banco Preferido" options={BANCOS} {...register('bancoPreferido')} />
      </div>

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
          ) : distribuidorId ? (
            'Actualizar'
          ) : (
            'Crear Distribuidor'
          )}
        </Button>
      </div>
    </form>
  );
};

DistribuidorForm.propTypes = {
  distribuidorId: PropTypes.string,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  className: PropTypes.string,
};

export default DistribuidorForm;
