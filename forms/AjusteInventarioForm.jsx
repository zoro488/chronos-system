/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                   CHRONOS AJUSTE INVENTARIO FORM                           ║
 * ║              Formulario de Ajustes Manuales de Inventario                  ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Formulario para registrar ajustes de inventario:
 * - Entrada (+) o Salida (-) de productos
 * - 9 motivos predefinidos
 * - Actualización automática de stock
 * - Requiere autorización para ajustes significativos
 *
 * @module AjusteInventarioForm
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
  updateDoc,
} from 'firebase/firestore';
import { motion } from 'framer-motion';
import {
  FileText,
  Gift,
  Package,
  RotateCcw,
  Settings,
  ShoppingCart,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import PropTypes from 'prop-types';
import { z } from 'zod';

import { Spinner } from '../components/animations/AnimationSystem';
import { Alert, useToast } from '../components/feedback/FeedbackComponents';
import { Button } from '../components/ui/BaseComponents';
import { FormCheckbox, FormInput, FormSelect, FormTextarea } from '../components/ui/FormComponents';

// ============================================================================
// SCHEMA
// ============================================================================

const ajusteInventarioSchema = z.object({
  fecha: z.string().min(1, 'Fecha requerida'),
  productoId: z.string().min(1, 'Producto requerido'),
  tipo: z.enum(['entrada', 'salida']),
  cantidad: z.number().min(1, 'Cantidad debe ser mayor a 0'),
  motivo: z.enum([
    'compra',
    'venta',
    'devolucion',
    'merma',
    'donacion',
    'ajuste_inventario',
    'otro',
  ]),
  concepto: z.string().min(1, 'Concepto requerido'),
  requiereAutorizacion: z.boolean().optional(),
  notas: z.string().optional(),
});

const cn = (...classes) => classes.filter(Boolean).join(' ');

const TIPOS = [
  { value: 'entrada', label: '➕ Entrada (+)', icon: TrendingUp, color: 'text-green-400' },
  { value: 'salida', label: '➖ Salida (-)', icon: TrendingDown, color: 'text-red-400' },
];

const MOTIVOS = [
  {
    value: 'compra',
    label: 'Compra',
    icon: ShoppingCart,
    description: 'Productos adquiridos de proveedores',
  },
  { value: 'venta', label: 'Venta', icon: Package, description: 'Productos vendidos a clientes' },
  { value: 'devolucion', label: 'Devolución', icon: RotateCcw, description: 'Productos devueltos' },
  { value: 'merma', label: 'Merma', icon: Trash2, description: 'Pérdida, daño o vencimiento' },
  { value: 'donacion', label: 'Donación', icon: Gift, description: 'Productos donados' },
  {
    value: 'ajuste_inventario',
    label: 'Ajuste Inventario',
    icon: Settings,
    description: 'Corrección por conteo físico',
  },
  { value: 'otro', label: 'Otro', icon: FileText, description: 'Otro motivo no especificado' },
];

export const AjusteInventarioForm = ({ onSuccess, onCancel, className = '' }) => {
  const [loading, setLoading] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const toast = useToast();
  const db = getFirestore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ajusteInventarioSchema),
    defaultValues: {
      fecha: new Date().toISOString().split('T')[0],
      productoId: '',
      tipo: 'entrada',
      cantidad: 1,
      motivo: 'ajuste_inventario',
      concepto: '',
      requiereAutorizacion: false,
      notas: '',
    },
  });

  const watchProductoId = watch('productoId');
  const watchTipo = watch('tipo');
  const watchCantidad = watch('cantidad');
  const watchMotivo = watch('motivo');

  // Load productos
  useEffect(() => {
    const loadProductos = async () => {
      try {
        setLoadingProductos(true);
        const snapshot = await getDocs(collection(db, 'productos'));
        const productosData = [];

        snapshot.forEach((docSnap) => {
          productosData.push({ id: docSnap.id, ...docSnap.data() });
        });

        setProductos(productosData);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar productos');
      } finally {
        setLoadingProductos(false);
      }
    };

    loadProductos();
  }, [db, toast]);

  useEffect(() => {
    if (watchProductoId) {
      const producto = productos.find((p) => p.id === watchProductoId);
      if (producto) setProductoSeleccionado(producto);
    }
  }, [watchProductoId, productos]);

  const motivoActual = MOTIVOS.find((m) => m.value === watchMotivo);
  const IconMotivo = motivoActual?.icon || FileText;

  const nuevoStock = productoSeleccionado
    ? watchTipo === 'entrada'
      ? (productoSeleccionado.stock || 0) + watchCantidad
      : (productoSeleccionado.stock || 0) - watchCantidad
    : 0;

  const stockInsuficiente =
    watchTipo === 'salida' && watchCantidad > (productoSeleccionado?.stock || 0);

  const onSubmit = async (data) => {
    if (stockInsuficiente) {
      toast.error('Stock insuficiente para realizar la salida');
      return;
    }

    setLoading(true);
    try {
      const fecha = Timestamp.fromDate(new Date(data.fecha));

      // Actualizar stock del producto
      const productoRef = doc(db, 'productos', data.productoId);
      const productoDoc = await getDoc(productoRef);

      if (!productoDoc.exists()) throw new Error('Producto no encontrado');

      const stockActual = productoDoc.data().stock || 0;
      const nuevoStockCalculado =
        data.tipo === 'entrada' ? stockActual + data.cantidad : stockActual - data.cantidad;

      await updateDoc(productoRef, { stock: nuevoStockCalculado, updatedAt: Timestamp.now() });

      // Crear movimiento de almacén
      await addDoc(collection(db, 'movimientosAlmacen'), {
        folio: `MA-${Date.now()}-${data.productoId}`,
        fecha,
        tipo: data.tipo,
        motivo: data.motivo,
        productoId: data.productoId,
        productoNombre: productoSeleccionado.nombre,
        cantidad: data.cantidad,
        stockAnterior: stockActual,
        stockNuevo: nuevoStockCalculado,
        concepto: data.concepto,
        requiereAutorizacion: data.requiereAutorizacion || false,
        notas: data.notas || null,
        createdAt: Timestamp.now(),
        createdBy: 'current-user',
      });

      toast.success('Ajuste registrado exitosamente');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al registrar ajuste');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProductos)
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-2xl font-bold text-white">Ajuste de Inventario</h2>
        <p className="text-sm text-white/60 mt-1">Registrar entrada o salida manual</p>
      </div>

      <FormInput label="Fecha *" type="date" {...register('fecha')} error={errors.fecha?.message} />

      <FormSelect
        label="Producto *"
        options={productos.map((p) => ({
          value: p.id,
          label: `${p.nombre} - Stock actual: ${p.stock || 0}`,
        }))}
        {...register('productoId')}
        error={errors.productoId?.message}
      />

      {productoSeleccionado && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/60">Categoría:</span>
              <span className="ml-2 text-white">{productoSeleccionado.categoria}</span>
            </div>
            <div>
              <span className="text-white/60">Stock actual:</span>
              <span className="ml-2 text-white font-bold">{productoSeleccionado.stock || 0}</span>
            </div>
            <div>
              <span className="text-white/60">Precio venta:</span>
              <span className="ml-2 text-white">
                ${(productoSeleccionado.precioVenta || 0).toLocaleString('es-MX')}
              </span>
            </div>
            <div>
              <span className="text-white/60">Precio compra:</span>
              <span className="ml-2 text-white">
                ${(productoSeleccionado.precioCompra || 0).toLocaleString('es-MX')}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          label="Tipo *"
          options={TIPOS.map((t) => ({ value: t.value, label: t.label }))}
          {...register('tipo')}
          error={errors.tipo?.message}
        />
        <FormInput
          label="Cantidad *"
          type="number"
          min={1}
          {...register('cantidad', { valueAsNumber: true })}
          error={errors.cantidad?.message}
        />
      </div>

      {stockInsuficiente && (
        <Alert variant="error">
          Stock insuficiente. Disponible: {productoSeleccionado.stock || 0}
        </Alert>
      )}

      <FormSelect
        label="Motivo *"
        options={MOTIVOS.map((m) => ({ value: m.value, label: m.label }))}
        {...register('motivo')}
        error={errors.motivo?.message}
      />

      {motivoActual && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/50"
        >
          <IconMotivo className="w-5 h-5 text-blue-400" />
          <p className="text-sm text-white/70">{motivoActual.description}</p>
        </motion.div>
      )}

      <FormInput
        label="Concepto *"
        {...register('concepto')}
        error={errors.concepto?.message}
        placeholder="Descripción breve del ajuste"
      />

      {productoSeleccionado && watchCantidad > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            'p-6 rounded-2xl border',
            watchTipo === 'entrada'
              ? 'bg-green-500/10 border-green-500/50'
              : 'bg-red-500/10 border-red-500/50'
          )}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Resumen del Ajuste</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Stock actual:</span>
              <span className="text-white font-semibold">{productoSeleccionado.stock || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Ajuste:</span>
              <span
                className={
                  watchTipo === 'entrada'
                    ? 'text-green-400 font-semibold'
                    : 'text-red-400 font-semibold'
                }
              >
                {watchTipo === 'entrada' ? '+' : '-'}
                {watchCantidad}
              </span>
            </div>
            <div className="h-px bg-white/10 my-2" />
            <div className="flex justify-between text-lg">
              <span className="text-white font-bold">Stock nuevo:</span>
              <span className="text-white font-bold">{nuevoStock}</span>
            </div>
          </div>
        </motion.div>
      )}

      <FormCheckbox label="Requiere autorización" {...register('requiereAutorizacion')} />
      <FormTextarea label="Notas" {...register('notas')} rows={3} />

      <div className="flex justify-end gap-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading || stockInsuficiente}>
          {loading ? (
            <>
              <Spinner size="sm" /> <span>Guardando...</span>
            </>
          ) : (
            'Registrar Ajuste'
          )}
        </Button>
      </div>
    </form>
  );
};

AjusteInventarioForm.propTypes = {
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  className: PropTypes.string,
};

export default AjusteInventarioForm;
