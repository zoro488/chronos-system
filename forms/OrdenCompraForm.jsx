/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS ORDEN COMPRA FORM                               ║
 * ║              Formulario de Órdenes de Compra a Distribuidores              ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Formulario completo para registrar órdenes de compra:
 * - Selector de distribuidor
 * - Lista dinámica de productos con cantidades
 * - Cálculo automático de subtotal, IVA y total
 * - Términos de pago y estado
 *
 * @module OrdenCompraForm
 * @author CHRONOS System
 * @version 1.0.0
 */
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  updateDoc,
} from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';
import { z } from 'zod';

import { Spinner } from '../components/animations/AnimationSystem';
import { Alert, useToast } from '../components/feedback/FeedbackComponents';
import { Button, IconButton } from '../components/ui/BaseComponents';
import {
  FormInput,
  FormMoneyInput,
  FormSelect,
  FormTextarea,
} from '../components/ui/FormComponents';

// ============================================================================
// SCHEMA
// ============================================================================

const ordenCompraSchema = z.object({
  folio: z.string().min(1, 'Folio requerido'),
  fecha: z.string().min(1, 'Fecha requerida'),
  distribuidorId: z.string().min(1, 'Distribuidor requerido'),
  productos: z
    .array(
      z.object({
        productoId: z.string().min(1, 'Producto requerido'),
        cantidad: z.number().min(1, 'Cantidad debe ser mayor a 0'),
        costoUnitario: z.number().min(0, 'Costo no puede ser negativo'),
      })
    )
    .min(1, 'Debe agregar al menos un producto'),
  terminosPago: z.string().min(1, 'Términos de pago requeridos'),
  metodoPago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'cheque', 'credito']),
  banco: z.string().optional(),
  notas: z.string().optional(),
});

const cn = (...classes) => classes.filter(Boolean).join(' ');

const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'credito', label: 'Crédito' },
];

const TERMINOS_PAGO = [
  { value: 'contado', label: 'Contado' },
  { value: '7_dias', label: '7 días' },
  { value: '15_dias', label: '15 días' },
  { value: '30_dias', label: '30 días' },
  { value: '60_dias', label: '60 días' },
  { value: '90_dias', label: '90 días' },
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

export const OrdenCompraForm = ({ ordenId = null, onSuccess, onCancel, className = '' }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [distribuidores, setDistribuidores] = useState([]);
  const [productos, setProductos] = useState([]);
  const toast = useToast();
  const db = getFirestore();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ordenCompraSchema),
    defaultValues: {
      folio: `OC-${Date.now()}`,
      fecha: new Date().toISOString().split('T')[0],
      distribuidorId: '',
      productos: [{ productoId: '', cantidad: 1, costoUnitario: 0 }],
      terminosPago: 'contado',
      metodoPago: 'transferencia',
      banco: '',
      notas: '',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'productos' });

  const watchDistribuidorId = watch('distribuidorId');
  const watchMetodoPago = watch('metodoPago');
  const watchProductos = watch('productos');

  // Load distribuidores y productos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);

        const [distribuidoresSnapshot, productosSnapshot] = await Promise.all([
          getDocs(collection(db, 'distribuidores')),
          getDocs(collection(db, 'productos')),
        ]);

        const distribuidoresData = [];
        distribuidoresSnapshot.forEach((docSnap) => {
          distribuidoresData.push({ id: docSnap.id, ...docSnap.data() });
        });

        const productosData = [];
        productosSnapshot.forEach((docSnap) => {
          productosData.push({ id: docSnap.id, ...docSnap.data() });
        });

        setDistribuidores(distribuidoresData);
        setProductos(productosData);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar datos');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [db, toast]);

  // Calcular totales
  const distribuidorSeleccionado = distribuidores.find((d) => d.id === watchDistribuidorId);

  const subtotal = watchProductos.reduce((acc, item) => {
    return acc + item.cantidad * item.costoUnitario;
  }, 0);

  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const fecha = Timestamp.fromDate(new Date(data.fecha));

      const ordenCompra = {
        folio: data.folio,
        fecha,
        distribuidorId: data.distribuidorId,
        distribuidorNombre: distribuidorSeleccionado?.nombre || 'Desconocido',
        productos: data.productos.map((p) => {
          const producto = productos.find((prod) => prod.id === p.productoId);
          return {
            productoId: p.productoId,
            productoNombre: producto?.nombre || 'Desconocido',
            cantidad: p.cantidad,
            costoUnitario: p.costoUnitario,
            subtotal: p.cantidad * p.costoUnitario,
          };
        }),
        subtotal,
        iva,
        total,
        terminosPago: data.terminosPago,
        metodoPago: data.metodoPago,
        banco: data.banco || null,
        estado: 'pendiente',
        totalPagado: 0,
        saldoPendiente: total,
        notas: data.notas || null,
        createdAt: Timestamp.now(),
        createdBy: 'current-user',
        updatedAt: Timestamp.now(),
      };

      if (ordenId) {
        const ordenRef = doc(db, 'ordenesCompra', ordenId);
        await updateDoc(ordenRef, { ...ordenCompra, updatedAt: Timestamp.now() });
        toast.success('Orden de compra actualizada');
      } else {
        await addDoc(collection(db, 'ordenesCompra'), ordenCompra);
        toast.success('Orden de compra creada');
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar orden de compra');
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
        <h2 className="text-2xl font-bold text-white">Orden de Compra</h2>
        <p className="text-sm text-white/60 mt-1">Registrar orden de compra a distribuidor</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput label="Folio *" {...register('folio')} error={errors.folio?.message} />
        <FormInput
          label="Fecha *"
          type="date"
          {...register('fecha')}
          error={errors.fecha?.message}
        />
      </div>

      <FormSelect
        label="Distribuidor *"
        options={distribuidores.map((d) => ({ value: d.id, label: d.nombre }))}
        {...register('distribuidorId')}
        error={errors.distribuidorId?.message}
      />

      {distribuidorSeleccionado && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/50"
        >
          <div className="text-sm">
            <span className="text-white/60">Contacto:</span>
            <span className="ml-2 text-white">{distribuidorSeleccionado.contacto}</span>
            {distribuidorSeleccionado.telefono && (
              <span className="ml-4 text-white/60">
                Tel: <span className="text-white">{distribuidorSeleccionado.telefono}</span>
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* PRODUCTOS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Productos</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => append({ productoId: '', cantidad: 1, costoUnitario: 0 })}
          >
            <Plus className="w-4 h-4" />
            <span>Agregar</span>
          </Button>
        </div>

        {errors.productos?.root && <Alert variant="error">{errors.productos.root.message}</Alert>}

        <AnimatePresence>
          {fields.map((field, index) => {
            const producto = productos.find((p) => p.id === watchProductos[index]?.productoId);
            const subtotalItem =
              (watchProductos[index]?.cantidad || 0) * (watchProductos[index]?.costoUnitario || 0);

            return (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm text-white/60">Producto {index + 1}</span>
                  {fields.length > 1 && (
                    <IconButton
                      icon={Trash2}
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <FormSelect
                      label="Producto *"
                      options={productos.map((p) => ({ value: p.id, label: p.nombre }))}
                      {...register(`productos.${index}.productoId`)}
                      error={errors.productos?.[index]?.productoId?.message}
                    />
                  </div>
                  <FormInput
                    label="Cantidad *"
                    type="number"
                    min={1}
                    {...register(`productos.${index}.cantidad`, { valueAsNumber: true })}
                    error={errors.productos?.[index]?.cantidad?.message}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormMoneyInput
                    label="Costo Unitario *"
                    {...register(`productos.${index}.costoUnitario`, { valueAsNumber: true })}
                    error={errors.productos?.[index]?.costoUnitario?.message}
                  />
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Subtotal</label>
                    <div className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center text-white font-semibold">
                      ${subtotalItem.toLocaleString('es-MX')}
                    </div>
                  </div>
                </div>

                {producto && (
                  <div className="text-xs text-white/50">
                    Stock actual: {producto.stock || 0} | Precio venta: $
                    {(producto.precioVenta || 0).toLocaleString('es-MX')}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* RESUMEN */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Resumen de Compra</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Subtotal:</span>
            <span className="text-white font-semibold">${subtotal.toLocaleString('es-MX')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">IVA (16%):</span>
            <span className="text-white font-semibold">${iva.toLocaleString('es-MX')}</span>
          </div>
          <div className="h-px bg-white/10 my-2" />
          <div className="flex justify-between text-lg">
            <span className="text-white font-bold">Total:</span>
            <span className="text-white font-bold">${total.toLocaleString('es-MX')}</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          label="Términos de Pago *"
          options={TERMINOS_PAGO}
          {...register('terminosPago')}
          error={errors.terminosPago?.message}
        />
        <FormSelect
          label="Método de Pago *"
          options={METODOS_PAGO}
          {...register('metodoPago')}
          error={errors.metodoPago?.message}
        />
      </div>

      {watchMetodoPago === 'transferencia' && (
        <FormSelect
          label="Banco *"
          options={BANCOS}
          {...register('banco')}
          error={errors.banco?.message}
        />
      )}

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
          ) : ordenId ? (
            'Actualizar'
          ) : (
            'Crear Orden'
          )}
        </Button>
      </div>
    </form>
  );
};

OrdenCompraForm.propTypes = {
  ordenId: PropTypes.string,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  className: PropTypes.string,
};

export default OrdenCompraForm;
