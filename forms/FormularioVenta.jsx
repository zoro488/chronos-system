/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║            FORMULARIO DE VENTA PREMIUM - FLOWDISTRIBUTOR                   ║
 * ║  Ultra interactivo con creación automática de cliente y actualización     ║
 * ║  de 3 bancos (Bóveda Monte, Fletes, Utilidades)                          ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    Calculator,
    CheckCircle2,
    CreditCard,
    DollarSign,
    FileText,
    Loader2,
    Save,
    Search,
    ShoppingBag,
    Sparkles,
    TrendingUp,
    Truck,
    User,
    Wallet,
    X,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getClientes } from '../services/clientes.service';
import { createVenta } from '../services/ventas.service';

// ==================== SCHEMA DE VALIDACIÓN ====================
const ventaSchema = z.object({
  clienteNombre: z.string().min(2, 'Nombre del cliente requerido (mín. 2 caracteres)'),
  unidades: z.number().min(1, 'Debe vender al menos 1 unidad'),
  precioVentaUnitario: z.number().min(0.01, 'Precio debe ser mayor a 0'),
  costoUnitario: z.number().min(0, 'Costo debe ser mayor o igual a 0'),
  fleteUnitario: z.number().min(0, 'Flete debe ser mayor o igual a 0').default(500),
  estadoPago: z.enum(['pagado', 'pendiente', 'parcial']),
  montoPagado: z.number().min(0, 'Monto pagado no puede ser negativo').optional(),
  metodoPago: z.string().optional(),
  notas: z.string().optional(),
});

// ==================== COMPONENTE ====================
export default function FormularioVenta({ onSuccess, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ventaCreada, setVentaCreada] = useState(null);
  const [clientesExistentes, setClientesExistentes] = useState([]);
  const [searchCliente, setSearchCliente] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(ventaSchema),
    defaultValues: {
      clienteNombre: '',
      unidades: 1,
      precioVentaUnitario: 0,
      costoUnitario: 0,
      fleteUnitario: 500, // Default 500 USD per unit
      estadoPago: 'pendiente',
      montoPagado: 0,
      metodoPago: 'transferencia',
      notas: '',
    },
  });

  // Cargar clientes existentes
  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const clientes = await getClientes();
        setClientesExistentes(clientes);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      }
    };
    cargarClientes();
  }, []);

  const clienteNombre = watch('clienteNombre');
  const unidades = watch('unidades') || 0;
  const precioVentaUnitario = watch('precioVentaUnitario') || 0;
  const costoUnitario = watch('costoUnitario') || 0;
  const fleteUnitario = watch('fleteUnitario') || 500;
  const estadoPago = watch('estadoPago');
  const montoPagado = watch('montoPagado') || 0;

  // Cálculos automáticos
  const totalVenta = unidades * precioVentaUnitario;
  const totalFlete = unidades * fleteUnitario;
  const totalCosto = unidades * costoUnitario;
  const totalUtilidad = totalVenta - totalCosto;
  const utilidadPorUnidad = precioVentaUnitario - costoUnitario;
  const saldoPendiente = totalVenta - montoPagado;

  // Filtrar clientes por búsqueda
  const clientesFiltrados = clientesExistentes.filter((c) =>
    c.nombre.toLowerCase().includes(searchCliente.toLowerCase())
  );

  // Validar pasos
  const canProceedToStep2 = clienteNombre.trim().length >= 2;
  const canProceedToStep3 = canProceedToStep2 && unidades > 0 && precioVentaUnitario > 0 && costoUnitario >= 0;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const resultado = await createVenta(data);
      setVentaCreada(resultado);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        reset();
        setCurrentStep(1);
        if (onSuccess) onSuccess(resultado);
      }, 4000);
    } catch (error) {
      alert('Error al crear venta: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      {showSuccess && (
        <>
          <Confetti recycle={false} numberOfPieces={1000} gravity={0.25} />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
            onClick={() => {
              setShowSuccess(false);
              if (onSuccess) onSuccess(ventaCreada);
            }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
              className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-12 rounded-3xl text-white text-center shadow-2xl border-4 border-white/30 relative overflow-hidden max-w-md"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <CheckCircle2 className="w-24 h-24 mx-auto mb-4 drop-shadow-2xl" />
              </motion.div>
              <h3 className="text-4xl font-bold mb-4">¡Venta Registrada! 🎉</h3>
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-5 mb-4">
                <p className="text-xl font-semibold mb-2">Folio: {ventaCreada?.folio}</p>
                <p className="text-3xl font-bold">${ventaCreada?.totalVenta.toFixed(2)}</p>
                <p className="text-sm mt-2 opacity-90">Utilidad: ${ventaCreada?.totalUtilidad.toFixed(2)}</p>
              </div>
              <div className="space-y-1 text-sm">
                <p>✓ Cliente: {ventaCreada?.clienteNombre}</p>
                <p>✓ Bóveda Monte actualizada</p>
                <p>✓ Fletes registrados</p>
                <p>✓ Utilidades contabilizadas</p>
                <p>✓ Almacén actualizado</p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Premium con Indicador de Progreso */}
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: -5 }}
                className="p-4 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl shadow-2xl"
              >
                <ShoppingBag className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Nueva Venta
                </h2>
                <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                  <Sparkles className="w-4 h-4" />
                  Registro rápido e inteligente
                </p>
              </div>
            </motion.div>
            {onCancel && (
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={onCancel}
                className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </motion.button>
            )}
          </div>

          {/* Indicador de Progreso */}
          <div className="flex items-center gap-2 mb-8">
            {[
              { num: 1, label: 'Cliente', icon: User },
              { num: 2, label: 'Detalles', icon: Calculator },
              { num: 3, label: 'Confirmación', icon: FileText },
            ].map((step) => (
              <div key={step.num} className="flex items-center flex-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: step.num * 0.1 }}
                  className="flex items-center gap-2 flex-1"
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold transition-all ${
                      currentStep >= step.num
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg'
                        : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    {currentStep > step.num ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 hidden md:block">
                    <p className="text-xs text-slate-400">{step.label}</p>
                  </div>
                </motion.div>
                {step.num < 3 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded transition-all ${
                      currentStep > step.num ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PASO 1: Cliente */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Cliente</h3>
                  <p className="text-slate-400 text-sm">Escribe el nombre del cliente</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    {...register('clienteNombre')}
                    onChange={(e) => setSearchCliente(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white text-lg placeholder-slate-500 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all"
                    placeholder="Nombre del cliente..."
                    autoFocus
                  />
                  {errors.clienteNombre && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2 flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.clienteNombre.message}
                    </motion.p>
                  )}
                </div>

                {/* Sugerencias de Clientes Existentes */}
                {searchCliente && clientesFiltrados.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-white/5 border border-green-500/30 rounded-xl p-3 max-h-48 overflow-y-auto"
                  >
                    <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Clientes existentes:
                    </p>
                    {clientesFiltrados.slice(0, 5).map((cliente) => (
                      <motion.button
                        key={cliente.id}
                        whileHover={{ scale: 1.02, x: 5 }}
                        type="button"
                        onClick={() => {
                          setValue('clienteNombre', cliente.nombre);
                          setSearchCliente('');
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-green-500/20 rounded-lg text-white text-sm transition-all flex items-center justify-between group"
                      >
                        <span>{cliente.nombre}</span>
                        <span className="text-xs text-slate-500 group-hover:text-green-400">Seleccionar</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {clienteNombre.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-green-300 text-sm">
                      {clientesExistentes.find(c => c.nombre === clienteNombre)
                        ? '✓ Cliente existente encontrado'
                        : '✓ Se creará un nuevo cliente'}
                    </p>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => canProceedToStep2 && setCurrentStep(2)}
                  disabled={!canProceedToStep2}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
                >
                  Continuar a Detalles
                  <Zap className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* PASO 2: Detalles de Venta */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Detalles de la Venta</h3>
                  <p className="text-slate-400 text-sm">Precios y cantidades</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Unidades */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Unidades *
                  </label>
                  <input
                    {...register('unidades', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white text-lg font-semibold placeholder-slate-500 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all"
                    placeholder="1"
                  />
                  {errors.unidades && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.unidades.message}
                    </p>
                  )}
                </div>

                {/* Precio de Venta */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Precio de Venta (por unidad) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                    <input
                      {...register('precioVentaUnitario', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white text-lg font-semibold focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.precioVentaUnitario && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.precioVentaUnitario.message}
                    </p>
                  )}
                </div>

                {/* Costo */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Costo (por unidad) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                    <input
                      {...register('costoUnitario', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white text-lg font-semibold focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Flete */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Flete (por unidad) - Default: $500
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                    <input
                      {...register('fleteUnitario', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white text-lg font-semibold focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all"
                      placeholder="500.00"
                    />
                  </div>
                </div>
              </div>

              {/* Cálculos en Tiempo Real */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Total Venta</p>
                  </div>
                  <p className="text-2xl font-bold text-white">${totalVenta.toFixed(2)}</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-5 h-5 text-blue-400" />
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Total Fletes</p>
                  </div>
                  <p className="text-2xl font-bold text-white">${totalFlete.toFixed(2)}</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Utilidad</p>
                  </div>
                  <p className="text-2xl font-bold text-white">${totalUtilidad.toFixed(2)}</p>
                  <p className="text-xs text-slate-400 mt-1">${utilidadPorUnidad.toFixed(2)} por unidad</p>
                </motion.div>
              </div>

              {/* Estado de Pago */}
              <div className="mb-6 p-6 bg-white/5 border border-white/10 rounded-2xl">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Estado de Pago
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {['pagado', 'parcial', 'pendiente'].map((estado) => (
                    <label
                      key={estado}
                      className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        estadoPago === estado
                          ? 'bg-green-500/20 border-green-500 shadow-lg'
                          : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <input
                        type="radio"
                        {...register('estadoPago')}
                        value={estado}
                        className="w-5 h-5"
                      />
                      <span className="text-white font-medium capitalize">{estado}</span>
                    </label>
                  ))}
                </div>

                {(estadoPago === 'pagado' || estadoPago === 'parcial') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Monto Pagado
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                      <input
                        {...register('montoPagado', { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        min="0"
                        max={totalVenta}
                        className="w-full pl-8 pr-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white text-lg font-semibold focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                    {estadoPago === 'parcial' && montoPagado > 0 && (
                      <p className="text-xs text-amber-400 mt-2">
                        Saldo pendiente: ${saldoPendiente.toFixed(2)}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Navegación */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all"
                >
                  ← Atrás
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => canProceedToStep3 && setCurrentStep(3)}
                  disabled={!canProceedToStep3}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
                >
                  Continuar a Resumen
                  <Zap className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* PASO 3: Confirmación */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Resumen Visual Premium */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Confirmar Venta</h3>
                    <p className="text-slate-400 text-sm">Revisa los detalles antes de registrar</p>
                  </div>
                </div>

                {/* Resumen Cliente */}
                <div className="mb-6 p-5 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-5 h-5 text-blue-400" />
                    <h4 className="font-semibold text-white">Cliente</h4>
                  </div>
                  <p className="text-lg text-white font-medium">{clienteNombre}</p>
                  {clientesExistentes.find(c => c.nombre === clienteNombre) ? (
                    <p className="text-xs text-green-400 mt-1">✓ Cliente existente</p>
                  ) : (
                    <p className="text-xs text-cyan-400 mt-1">✓ Nuevo cliente (se creará automáticamente)</p>
                  )}
                </div>

                {/* Resumen Detalles */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">Unidades</p>
                    <p className="text-xl font-bold text-white">{unidades}</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">Precio por unidad</p>
                    <p className="text-xl font-bold text-white">${precioVentaUnitario.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">Costo por unidad</p>
                    <p className="text-xl font-bold text-white">${costoUnitario.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">Flete por unidad</p>
                    <p className="text-xl font-bold text-white">${fleteUnitario.toFixed(2)}</p>
                  </div>
                </div>

                {/* Resumen Financiero */}
                <div className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/30 rounded-2xl mb-6">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Total Venta</p>
                      <p className="text-2xl font-bold text-white">${totalVenta.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Total Fletes</p>
                      <p className="text-2xl font-bold text-white">${totalFlete.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Utilidad Total</p>
                      <p className="text-2xl font-bold text-green-400">${totalUtilidad.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="h-px bg-white/20 my-4" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Estado de Pago</p>
                      <p className="text-lg font-bold text-white capitalize">{estadoPago}</p>
                    </div>
                    {(estadoPago === 'pagado' || estadoPago === 'parcial') && (
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Monto Pagado</p>
                        <p className="text-lg font-bold text-green-400">${montoPagado.toFixed(2)}</p>
                        {estadoPago === 'parcial' && (
                          <p className="text-xs text-amber-400 mt-1">Pendiente: ${saldoPendiente.toFixed(2)}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info de Actualización Automática */}
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                  <p className="text-sm text-cyan-300 font-medium mb-2">✓ Esta venta actualizará automáticamente:</p>
                  <ul className="text-xs text-slate-300 space-y-1 ml-4">
                    <li>• Bóveda Monte: +${montoPagado > 0 ? montoPagado.toFixed(2) : '0.00'} (Capital)</li>
                    <li>• Fletes: +${totalFlete.toFixed(2)} (Histórico: ${totalFlete.toFixed(2)}, Capital: ${montoPagado > 0 ? (totalFlete * (montoPagado / totalVenta)).toFixed(2) : '0.00'})</li>
                    <li>• Utilidades: +${totalUtilidad.toFixed(2)} (Histórico: ${totalUtilidad.toFixed(2)}, Capital: ${montoPagado > 0 ? (totalUtilidad * (montoPagado / totalVenta)).toFixed(2) : '0.00'})</li>
                    <li>• Almacén: -{unidades} unidades</li>
                    {estadoPago !== 'pagado' && <li>• Adeudo Cliente: ${(totalVenta - montoPagado).toFixed(2)}</li>}
                  </ul>
                </div>
              </div>

              {/* Navegación Final */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all"
                >
                  ← Editar Detalles
                </motion.button>
                {onCancel && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all"
                  >
                    Cancelar
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-2xl shadow-green-500/50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Registrando Venta...
                    </>
                  ) : (
                    <>
                      <Save className="w-6 h-6" />
                      Confirmar y Registrar Venta
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}
