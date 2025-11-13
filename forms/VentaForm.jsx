/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                         CHRONOS VENTA FORM                                 ║
 * ║                 Formulario Completo de Registro de Venta                   ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Formulario premium para registrar ventas con:
 * - Selector de cliente (autocomplete)
 * - Tabla dinámica de productos (agregar/eliminar)
 * - Cálculo automático de subtotal/IVA/total
 * - Registro de pagos múltiples
 * - Validación con Zod
 * - React Hook Form
 * - Integración con Firestore
 *
 * @module VentaForm
 * @author CHRONOS System
 * @version 1.0.0
 */
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Timestamp, addDoc, collection, doc, getFirestore, updateDoc } from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { z } from 'zod';

// Components
import { Spinner } from '../components/animations/AnimationSystem';
import { useToast } from '../components/feedback/FeedbackComponents';
import { Button } from '../components/ui/BaseComponents';
import {
  FormClientSelector,
  FormInput,
  FormMoneyInput,
  FormProductSelector,
  FormSelect,
  FormTextarea,
} from '../components/ui/FormComponents';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const ventaSchema = z.object({
  clienteId: z.string().min(1, 'Cliente requerido'),
  clienteNombre: z.string().min(1, 'Nombre de cliente requerido'),
  fecha: z.string().min(1, 'Fecha requerida'),
  productos: z
    .array(
      z.object({
        productoId: z.string().min(1, 'Producto requerido'),
        nombre: z.string().min(1, 'Nombre requerido'),
        cantidad: z.number().min(1, 'Cantidad mínima: 1'),
        precioUnitario: z.number().min(0, 'Precio debe ser positivo'),
        descuento: z.number().min(0).max(100, 'Descuento máximo: 100%'),
        subtotal: z.number(),
        total: z.number(),
      })
    )
    .min(1, 'Debe agregar al menos un producto'),
  aplicaFlete: z.boolean(),
  totalFletes: z.number().min(0),
  destino: z.enum(['bovedaMonte', 'bovedaUsa', 'utilidades', 'fleteSur']),
  vendedor: z.string().optional(),
  notas: z.string().optional(),
});

// ============================================================================
// UTILITIES
// ============================================================================

const cn = (...classes) => classes.filter(Boolean).join(' ');

const DESTINOS = [
  { value: 'bovedaMonte', label: 'Bóveda Monte' },
  { value: 'bovedaUsa', label: 'Bóveda USA' },
  { value: 'utilidades', label: 'Utilidades' },
  { value: 'fleteSur', label: 'Flete Sur' },
];

// ============================================================================
// VENTA FORM COMPONENT
// ============================================================================

/**
 * VentaForm - Formulario de registro de venta
 */
export const VentaForm = ({ ventaId = null, onSuccess, onCancel, className = '' }) => {
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const toast = useToast();
  const db = getFirestore();

  // React Hook Form
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ventaSchema),
    defaultValues: {
      clienteId: '',
      clienteNombre: '',
      fecha: new Date().toISOString().split('T')[0],
      productos: [],
      aplicaFlete: false,
      totalFletes: 0,
      destino: 'bovedaMonte',
      vendedor: '',
      notas: '',
    },
  });

  // Field Array para productos
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'productos',
  });

  // Watch values para cálculos
  const watchProductos = watch('productos');
  const watchAplicaFlete = watch('aplicaFlete');
  const watchTotalFletes = watch('totalFletes');

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  /**
   * Calcula el subtotal de un producto
   */
  const calcularSubtotalProducto = (cantidad, precioUnitario) => {
    return cantidad * precioUnitario;
  };

  /**
   * Calcula el total de un producto (con descuento)
   */
  const calcularTotalProducto = (subtotal, descuento) => {
    const descuentoAmount = subtotal * (descuento / 100);
    return subtotal - descuentoAmount;
  };

  /**
   * Calcula totales generales
   */
  const calcularTotales = () => {
    const subtotal = watchProductos.reduce((sum, p) => sum + (p.total || 0), 0);
    const fletes = watchAplicaFlete ? watchTotalFletes || 0 : 0;
    const subtotalConFletes = subtotal + fletes;
    const iva = subtotalConFletes * 0.16;
    const total = subtotalConFletes + iva;

    return {
      subtotal,
      fletes,
      subtotalConFletes,
      iva,
      total,
    };
  };

  const totales = calcularTotales();

  // ============================================================================
  // LOAD DATA
  // ============================================================================

  useEffect(() => {
    // TODO: Cargar clientes y productos de Firestore
    // Por ahora usamos datos mock
    setClientes([
      { id: 'cliente-1', nombre: 'Bódega M-P', telefono: '555-0101', saldoPendiente: 15000 },
      { id: 'cliente-2', nombre: 'Valle', telefono: '555-0102', saldoPendiente: 0 },
      { id: 'cliente-3', nombre: 'Cliente Premium', telefono: '555-0103', saldoPendiente: 8500 },
    ]);

    setProductos([
      { id: 'prod-1', nombre: 'Producto A', codigo: 'PA-001', precio: 6300, stock: 500 },
      { id: 'prod-2', nombre: 'Producto B', codigo: 'PB-002', precio: 6800, stock: 300 },
      { id: 'prod-3', nombre: 'Producto C', codigo: 'PC-003', precio: 7200, stock: 200 },
    ]);
  }, []);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Agregar nuevo producto
   */
  const handleAgregarProducto = () => {
    append({
      productoId: '',
      nombre: '',
      cantidad: 1,
      precioUnitario: 0,
      descuento: 0,
      subtotal: 0,
      total: 0,
    });
  };

  /**
   * Actualizar producto cuando cambia
   */
  const handleProductoChange = (index, producto) => {
    if (producto) {
      setValue(`productos.${index}.productoId`, producto.id);
      setValue(`productos.${index}.nombre`, producto.nombre);
      setValue(`productos.${index}.precioUnitario`, producto.precio);

      // Recalcular
      const cantidad = watchProductos[index]?.cantidad || 1;
      const subtotal = calcularSubtotalProducto(cantidad, producto.precio);
      const descuento = watchProductos[index]?.descuento || 0;
      const total = calcularTotalProducto(subtotal, descuento);

      setValue(`productos.${index}.subtotal`, subtotal);
      setValue(`productos.${index}.total`, total);
    }
  };

  /**
   * Actualizar cantidad
   */
  const handleCantidadChange = (index, cantidad) => {
    const producto = watchProductos[index];
    if (!producto) return;

    setValue(`productos.${index}.cantidad`, cantidad);
    const subtotal = calcularSubtotalProducto(cantidad, producto.precioUnitario);
    const total = calcularTotalProducto(subtotal, producto.descuento);

    setValue(`productos.${index}.subtotal`, subtotal);
    setValue(`productos.${index}.total`, total);
  };

  /**
   * Actualizar descuento
   */
  const handleDescuentoChange = (index, descuento) => {
    const producto = watchProductos[index];
    if (!producto) return;

    setValue(`productos.${index}.descuento`, descuento);
    const total = calcularTotalProducto(producto.subtotal, descuento);
    setValue(`productos.${index}.total`, total);
  };

  /**
   * Seleccionar cliente
   */
  const handleClienteSelect = (cliente) => {
    if (cliente) {
      setValue('clienteId', cliente.id);
      setValue('clienteNombre', cliente.nombre);
    }
  };

  /**
   * Submit del formulario
   */
  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const ventaData = {
        folio: `V-${Date.now()}`, // TODO: Generar folio secuencial
        fecha: Timestamp.fromDate(new Date(data.fecha)),
        clienteId: data.clienteId,
        clienteNombre: data.clienteNombre,
        productos: data.productos,
        subtotal: totales.subtotal,
        descuento: 0,
        iva: totales.iva,
        total: totales.total,
        totalFletes: totales.fletes,
        aplicaFlete: data.aplicaFlete,
        destino: data.destino,
        pagos: [],
        totalPagado: 0,
        saldoPendiente: totales.total,
        estado: 'pendiente',
        vendedor: data.vendedor || 'Sistema',
        notas: data.notas || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: 'current-user', // TODO: Get from auth
      };

      if (ventaId) {
        // Actualizar venta existente
        await updateDoc(doc(db, 'ventas', ventaId), {
          ...ventaData,
          updatedAt: Timestamp.now(),
        });
        toast.success('Venta actualizada exitosamente');
      } else {
        // Crear nueva venta
        await addDoc(collection(db, 'ventas'), ventaData);
        toast.success('Venta registrada exitosamente');
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error guardando venta:', error);
      toast.error('Error al guardar la venta');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {ventaId ? 'Editar Venta' : 'Nueva Venta'}
          </h2>
          <p className="text-sm text-white/60 mt-1">Complete los datos de la venta</p>
        </div>
      </div>

      {/* Cliente & Fecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormClientSelector
          label="Cliente *"
          clientes={clientes}
          onSelect={handleClienteSelect}
          error={errors.clienteId?.message}
        />

        <FormInput
          label="Fecha *"
          type="date"
          {...register('fecha')}
          error={errors.fecha?.message}
        />
      </div>

      {/* Productos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Productos</h3>
          <Button type="button" onClick={handleAgregarProducto} size="sm" variant="primary">
            + Agregar Producto
          </Button>
        </div>

        {errors.productos?.message && (
          <p className="text-sm text-red-400">{errors.productos.message}</p>
        )}

        <div className="space-y-3">
          <AnimatePresence>
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3"
              >
                {/* Producto Selector */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-4">
                    <FormProductSelector
                      label="Producto"
                      productos={productos}
                      onSelect={(producto) => handleProductoChange(index, producto)}
                      error={errors.productos?.[index]?.productoId?.message}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <FormInput
                      label="Cantidad"
                      type="number"
                      min="1"
                      value={watchProductos[index]?.cantidad || 1}
                      onChange={(e) => handleCantidadChange(index, parseInt(e.target.value) || 1)}
                      error={errors.productos?.[index]?.cantidad?.message}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <FormMoneyInput
                      label="Precio Unit."
                      value={watchProductos[index]?.precioUnitario || 0}
                      readOnly
                    />
                  </div>

                  <div className="md:col-span-2">
                    <FormInput
                      label="Descuento %"
                      type="number"
                      min="0"
                      max="100"
                      value={watchProductos[index]?.descuento || 0}
                      onChange={(e) =>
                        handleDescuentoChange(index, parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>

                  <div className="md:col-span-1 flex items-end">
                    <Button
                      type="button"
                      onClick={() => remove(index)}
                      variant="danger"
                      size="sm"
                      className="w-full"
                    >
                      ✕
                    </Button>
                  </div>
                </div>

                {/* Totales del producto */}
                <div className="flex justify-end gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Subtotal:</span>
                    <span className="ml-2 font-semibold text-white">
                      $
                      {(watchProductos[index]?.subtotal || 0).toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Total:</span>
                    <span className="ml-2 font-bold text-green-400">
                      $
                      {(watchProductos[index]?.total || 0).toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Fletes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register('aplicaFlete')}
            className="w-4 h-4 rounded border-white/20 bg-white/5"
          />
          <label className="text-sm text-white">Aplicar flete</label>
        </div>

        {watchAplicaFlete && (
          <FormMoneyInput
            label="Total Fletes"
            {...register('totalFletes', { valueAsNumber: true })}
          />
        )}
      </div>

      {/* Destino & Vendedor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          label="Destino *"
          options={DESTINOS}
          {...register('destino')}
          error={errors.destino?.message}
        />

        <FormInput label="Vendedor" {...register('vendedor')} placeholder="Nombre del vendedor" />
      </div>

      {/* Notas */}
      <FormTextarea
        label="Notas"
        {...register('notas')}
        placeholder="Notas adicionales sobre la venta..."
        rows={3}
      />

      {/* Totales */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#667eea]/20 to-[#764ba2]/20 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Resumen</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-white/70">
            <span>Subtotal:</span>
            <span className="font-semibold">
              ${totales.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>
          {watchAplicaFlete && (
            <div className="flex justify-between text-white/70">
              <span>Fletes:</span>
              <span className="font-semibold">
                ${totales.fletes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          <div className="flex justify-between text-white/70">
            <span>IVA (16%):</span>
            <span className="font-semibold">
              ${totales.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="pt-2 border-t border-white/10 flex justify-between text-white text-xl">
            <span className="font-bold">TOTAL:</span>
            <span className="font-bold">
              ${totales.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading} className="min-w-[200px]">
          {loading ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span>Guardando...</span>
            </div>
          ) : ventaId ? (
            'Actualizar Venta'
          ) : (
            'Registrar Venta'
          )}
        </Button>
      </div>
    </form>
  );
};

VentaForm.propTypes = {
  ventaId: PropTypes.string,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  className: PropTypes.string,
};

export default VentaForm;
