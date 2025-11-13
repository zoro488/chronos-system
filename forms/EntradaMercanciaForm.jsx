/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                  CHRONOS ENTRADA MERCANCIA FORM                            ║
 * ║             Formulario de Recepción de Mercancía (Compras)                 ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Formulario para registrar la recepción física de mercancía:
 * - Seleccionar orden de compra pendiente
 * - Verificar cantidades recibidas vs ordenadas
 * - Actualizar inventario automáticamente
 * - Crear movimientos de almacén
 *
 * @module EntradaMercanciaForm
 * @author CHRONOS System
 * @version 1.0.0
 */
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import PropTypes from 'prop-types';
import { z } from 'zod';

import { Spinner } from '../components/animations/AnimationSystem';
import { Alert, useToast } from '../components/feedback/FeedbackComponents';
import { Button } from '../components/ui/BaseComponents';
import { FormInput, FormSelect, FormTextarea } from '../components/ui/FormComponents';

// ============================================================================
// SCHEMA
// ============================================================================

const entradaMercanciaSchema = z.object({
  ordenCompraId: z.string().min(1, 'Debe seleccionar una orden de compra'),
  fecha: z.string().min(1, 'Fecha requerida'),
  productos: z.array(
    z.object({
      productoId: z.string(),
      cantidadOrdenada: z.number(),
      cantidadRecibida: z.number().min(0, 'Cantidad no puede ser negativa'),
    })
  ),
  notas: z.string().optional(),
});

const cn = (...classes) => classes.filter(Boolean).join(' ');

export const EntradaMercanciaForm = ({
  ordenCompraIdProp = null,
  onSuccess,
  onCancel,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingOrdenes, setLoadingOrdenes] = useState(true);
  const [ordenesPendientes, setOrdenesPendientes] = useState([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const toast = useToast();
  const db = getFirestore();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(entradaMercanciaSchema),
    defaultValues: {
      ordenCompraId: ordenCompraIdProp || '',
      fecha: new Date().toISOString().split('T')[0],
      productos: [],
      notas: '',
    },
  });

  const { fields } = useFieldArray({ control, name: 'productos' });

  const watchOrdenCompraId = watch('ordenCompraId');
  const watchProductos = watch('productos');

  // Load ordenes pendientes
  useEffect(() => {
    const loadOrdenes = async () => {
      try {
        setLoadingOrdenes(true);
        const q = query(collection(db, 'ordenesCompra'), where('estado', '==', 'pendiente'));
        const snapshot = await getDocs(q);
        const ordenes = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          ordenes.push({
            id: docSnap.id,
            folio: data.folio,
            distribuidorNombre: data.distribuidorNombre,
            productos: data.productos,
          });
        });

        setOrdenesPendientes(ordenes);

        if (ordenCompraIdProp) {
          const orden = ordenes.find((o) => o.id === ordenCompraIdProp);
          if (orden) {
            setOrdenSeleccionada(orden);
            setValue(
              'productos',
              orden.productos.map((p) => ({
                productoId: p.productoId,
                productoNombre: p.productoNombre,
                cantidadOrdenada: p.cantidad,
                cantidadRecibida: p.cantidad,
              }))
            );
          }
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar órdenes');
      } finally {
        setLoadingOrdenes(false);
      }
    };

    loadOrdenes();
  }, [db, ordenCompraIdProp, toast, setValue]);

  useEffect(() => {
    if (watchOrdenCompraId && !ordenSeleccionada) {
      const orden = ordenesPendientes.find((o) => o.id === watchOrdenCompraId);
      if (orden) {
        setOrdenSeleccionada(orden);
        setValue(
          'productos',
          orden.productos.map((p) => ({
            productoId: p.productoId,
            productoNombre: p.productoNombre,
            cantidadOrdenada: p.cantidad,
            cantidadRecibida: p.cantidad,
          }))
        );
      }
    }
  }, [watchOrdenCompraId, ordenesPendientes, ordenSeleccionada, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const fecha = Timestamp.fromDate(new Date(data.fecha));

      // Actualizar stock de cada producto
      for (const item of data.productos) {
        const productoRef = doc(db, 'productos', item.productoId);
        const productoDoc = await getDoc(productoRef);

        if (productoDoc.exists()) {
          const stockActual = productoDoc.data().stock || 0;
          const nuevoStock = stockActual + item.cantidadRecibida;
          batch.update(productoRef, { stock: nuevoStock, updatedAt: Timestamp.now() });
        }

        // Crear movimiento de almacén
        const movimientoRef = doc(collection(db, 'movimientosAlmacen'));
        batch.set(movimientoRef, {
          folio: `MA-${Date.now()}-${item.productoId}`,
          fecha,
          tipo: 'entrada',
          motivo: 'compra',
          productoId: item.productoId,
          productoNombre: item.productoNombre,
          cantidad: item.cantidadRecibida,
          ordenCompraRelacionada: ordenSeleccionada.folio,
          notas: data.notas || null,
          createdAt: Timestamp.now(),
          createdBy: 'current-user',
        });
      }

      // Actualizar estado de orden de compra
      const ordenRef = doc(db, 'ordenesCompra', data.ordenCompraId);
      batch.update(ordenRef, {
        estado: 'recibida',
        fechaRecepcion: fecha,
        updatedAt: Timestamp.now(),
      });

      await batch.commit();

      toast.success('Mercancía recibida exitosamente');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al registrar entrada');
    } finally {
      setLoading(false);
    }
  };

  if (loadingOrdenes)
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-2xl font-bold text-white">Recepción de Mercancía</h2>
        <p className="text-sm text-white/60 mt-1">Registrar entrada de productos al almacén</p>
      </div>

      {!ordenCompraIdProp && (
        <FormSelect
          label="Orden de Compra *"
          options={ordenesPendientes.map((o) => ({
            value: o.id,
            label: `${o.folio} - ${o.distribuidorNombre}`,
          }))}
          {...register('ordenCompraId')}
          error={errors.ordenCompraId?.message}
        />
      )}

      <FormInput
        label="Fecha de Recepción *"
        type="date"
        {...register('fecha')}
        error={errors.fecha?.message}
      />

      {ordenSeleccionada && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Productos Ordenados</h3>

          <AnimatePresence>
            {fields.map((field, index) => {
              const cantidadOrdenada = watchProductos[index]?.cantidadOrdenada || 0;
              const cantidadRecibida = watchProductos[index]?.cantidadRecibida || 0;
              const diferencia = cantidadRecibida - cantidadOrdenada;
              const hayDiferencia = diferencia !== 0;

              return (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-semibold">
                        {watchProductos[index]?.productoNombre}
                      </h4>
                      <p className="text-xs text-white/50 mt-1">Producto {index + 1}</p>
                    </div>
                    {hayDiferencia && (
                      <div
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold',
                          diferencia > 0
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-red-500/20 text-red-400'
                        )}
                      >
                        {diferencia > 0 ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        <span>
                          {diferencia > 0 ? '+' : ''}
                          {diferencia}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-white/60 mb-1">
                        Ordenada
                      </label>
                      <div className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 flex items-center text-white">
                        {cantidadOrdenada}
                      </div>
                    </div>
                    <FormInput
                      label="Recibida *"
                      type="number"
                      min={0}
                      {...register(`productos.${index}.cantidadRecibida`, { valueAsNumber: true })}
                      error={errors.productos?.[index]?.cantidadRecibida?.message}
                    />
                  </div>

                  {hayDiferencia && (
                    <Alert variant={diferencia > 0 ? 'info' : 'warning'} className="mt-3">
                      {diferencia > 0
                        ? `Se recibieron ${diferencia} unidades extra`
                        : `Faltan ${Math.abs(diferencia)} unidades`}
                    </Alert>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <FormTextarea
        label="Notas"
        {...register('notas')}
        rows={3}
        placeholder="Observaciones sobre la recepción..."
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
          ) : (
            'Registrar Entrada'
          )}
        </Button>
      </div>
    </form>
  );
};

EntradaMercanciaForm.propTypes = {
  ordenCompraIdProp: PropTypes.string,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  className: PropTypes.string,
};

export default EntradaMercanciaForm;
