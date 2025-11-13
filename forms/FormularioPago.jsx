/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║         FORMULARIO DE PAGO PREMIUM - FLOWDISTRIBUTOR                       ║
 * ║  Formulario universal para pagos de distribuidores y clientes             ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    Banknote,
    Building,
    CheckCircle2,
    CreditCard,
    DollarSign,
    Loader2,
    Sparkles,
    TrendingDown,
    User,
    Wallet,
    X,
} from 'lucide-react';
import { createElement, useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getBancos } from '../services/bancos.service';
import { registrarPagoCliente } from '../services/clientes.service';
import { registrarPagoDistribuidor } from '../services/distribuidores.service';

// ==================== SCHEMA DE VALIDACIÓN ====================
const pagoSchema = z.object({
  entidadId: z.string().min(1, 'Debe seleccionar una entidad'),
  monto: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  bancoId: z.string().min(1, 'Debe seleccionar un banco'),
  metodoPago: z.string().min(1, 'Método de pago requerido'),
  referencia: z.string().optional(),
  notas: z.string().optional(),
});

// ==================== COMPONENTE ====================
export default function FormularioPago({
  tipo = 'distribuidor', // 'distribuidor' | 'cliente'
  entidades = [], // Lista de distribuidores o clientes
  onSuccess,
  onCancel,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pagoCreado, setPagoCreado] = useState(null);
  const [bancos, setBancos] = useState([]);
  const [entidadSeleccionada, setEntidadSeleccionada] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      entidadId: '',
      monto: 0,
      bancoId: '',
      metodoPago: 'transferencia',
      referencia: '',
      notas: '',
    },
  });

  // Cargar bancos
  useEffect(() => {
    const cargarBancos = async () => {
      try {
        const bancosData = await getBancos();
        setBancos(bancosData);
      } catch (error) {
        console.error('Error al cargar bancos:', error);
      }
    };
    cargarBancos();
  }, []);

  const entidadId = watch('entidadId');
  const monto = watch('monto') || 0;
  const bancoId = watch('bancoId');

  // Actualizar entidad seleccionada
  useEffect(() => {
    if (entidadId) {
      const entidad = entidades.find((e) => e.id === entidadId);
      setEntidadSeleccionada(entidad);
    } else {
      setEntidadSeleccionada(null);
    }
  }, [entidadId, entidades]);

  const bancoSeleccionado = bancos.find((b) => b.id === bancoId);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let resultado;
      if (tipo === 'distribuidor') {
        resultado = await registrarPagoDistribuidor(
          data.entidadId,
          data.monto,
          data.bancoId,
          data.metodoPago,
          data.referencia,
          data.notas
        );
      } else {
        resultado = await registrarPagoCliente(
          data.entidadId,
          data.monto,
          data.bancoId,
          data.metodoPago,
          data.referencia,
          data.notas
        );
      }

      setPagoCreado(resultado);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        reset();
        if (onSuccess) onSuccess(resultado);
      }, 3000);
    } catch (error) {
      alert('Error al registrar pago: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const esDistribuidor = tipo === 'distribuidor';
  const titulo = esDistribuidor ? 'Pago a Distribuidor' : 'Pago de Cliente';
  const gradiente = esDistribuidor
    ? 'from-purple-500 via-pink-500 to-rose-500'
    : 'from-blue-500 via-cyan-500 to-teal-500';
  const iconoEntidad = esDistribuidor ? Building : User;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto"
    >
      {showSuccess && (
        <>
          <Confetti recycle={false} numberOfPieces={600} gravity={0.3} />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
            onClick={() => {
              setShowSuccess(false);
              if (onSuccess) onSuccess(pagoCreado);
            }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: 2 }}
              className={`bg-gradient-to-br ${gradiente} p-10 rounded-3xl text-white text-center shadow-2xl border-4 border-white/30 max-w-md`}
            >
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8 }}
              >
                <CheckCircle2 className="w-20 h-20 mx-auto mb-4 drop-shadow-2xl" />
              </motion.div>
              <h3 className="text-3xl font-bold mb-3">¡Pago Registrado! 💰</h3>
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-5 mb-4">
                <p className="text-2xl font-bold mb-2">${monto.toFixed(2)}</p>
                <p className="text-sm opacity-90">{entidadSeleccionada?.nombre}</p>
              </div>
              <p className="text-sm">✓ Adeudo actualizado ✓ Banco actualizado</p>
            </motion.div>
          </motion.div>
        </>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Premium */}
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: -5 }}
              className={`p-4 bg-gradient-to-br ${gradiente} rounded-2xl shadow-2xl`}
            >
              <Wallet className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h2 className={`text-3xl font-bold bg-gradient-to-r ${gradiente} bg-clip-text text-transparent`}>
                {titulo}
              </h2>
              <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                <Sparkles className="w-4 h-4" />
                Registro rápido de pagos
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

        {/* Contenido */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl space-y-6">
          {/* Selección de Entidad */}
          <div>
            <label className="flex text-sm font-medium text-slate-300 mb-2 items-center gap-2">
              {createElement(iconoEntidad, { className: 'w-4 h-4' })}
              {esDistribuidor ? 'Distribuidor' : 'Cliente'} *
            </label>
            <select
              {...register('entidadId')}
              className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
            >
              <option value="">Seleccionar...</option>
              {entidades.map((entidad) => (
                <option key={entidad.id} value={entidad.id} className="bg-slate-800">
                  {entidad.nombre}
                  {entidad.saldoActual !== undefined && ` - Adeudo: $${entidad.saldoActual.toFixed(2)}`}
                </option>
              ))}
            </select>
            {errors.entidadId && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.entidadId.message}
              </p>
            )}
          </div>

          {/* Info de Entidad Seleccionada */}
          <AnimatePresence>
            {entidadSeleccionada && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-5 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Adeudo Actual</p>
                    <p className="text-3xl font-bold text-white">
                      ${entidadSeleccionada.saldoActual?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <TrendingDown className="w-12 h-12 text-blue-400 opacity-50" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Monto */}
          <div>
            <label className="flex text-sm font-medium text-slate-300 mb-2 items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Monto del Pago *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">
                $
              </span>
              <input
                {...register('monto', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                max={entidadSeleccionada?.saldoActual || undefined}
                className="w-full pl-10 pr-4 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white text-2xl font-bold placeholder-slate-500 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all"
                placeholder="0.00"
              />
            </div>
            {errors.monto && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.monto.message}
              </p>
            )}
            {entidadSeleccionada && monto > 0 && (
              <p className="text-sm text-slate-400 mt-2">
                Nuevo saldo: ${(entidadSeleccionada.saldoActual - monto).toFixed(2)}
              </p>
            )}
          </div>

          {/* Banco */}
          <div>
            <label className="flex text-sm font-medium text-slate-300 mb-2 items-center gap-2">
              <Banknote className="w-4 h-4" />
              Banco de Origen *
            </label>
            <select
              {...register('bancoId')}
              className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all"
            >
              <option value="">Seleccionar banco...</option>
              {bancos.map((banco) => (
                <option key={banco.id} value={banco.id} className="bg-slate-800">
                  {banco.nombre} - Capital: ${banco.capital?.toFixed(2) || '0.00'}
                </option>
              ))}
            </select>
            {errors.bancoId && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.bancoId.message}
              </p>
            )}
          </div>

          {/* Info Banco Seleccionado */}
          <AnimatePresence>
            {bancoSeleccionado && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Capital Actual</p>
                    <p className="text-2xl font-bold text-white">
                      ${bancoSeleccionado.capital?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  {monto > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Después del pago</p>
                      <p className="text-2xl font-bold text-amber-400">
                        ${((bancoSeleccionado.capital || 0) - monto).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Método de Pago */}
          <div>
            <label className="flex text-sm font-medium text-slate-300 mb-2 items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Método de Pago
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['transferencia', 'efectivo', 'cheque', 'tarjeta'].map((metodo) => (
                <label
                  key={metodo}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    watch('metodoPago') === metodo
                      ? 'bg-green-500/20 border-green-500 shadow-lg'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <input
                    type="radio"
                    {...register('metodoPago')}
                    value={metodo}
                    className="sr-only"
                  />
                  <span className="text-white font-medium capitalize text-sm">{metodo}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Referencia */}
          <div>
            <label className="flex text-sm font-medium text-slate-300 mb-2">Referencia</label>
            <input
              {...register('referencia')}
              className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
              placeholder="Número de referencia o comprobante"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="flex text-sm font-medium text-slate-300 mb-2">Notas</label>
            <textarea
              {...register('notas')}
              rows="2"
              className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all resize-none"
              placeholder="Notas adicionales..."
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          {onCancel && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all"
            >
              Cancelar
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting || !entidadSeleccionada || monto <= 0}
            className={`flex-1 py-4 bg-gradient-to-r ${gradiente} hover:opacity-90 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-2xl`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Registrando Pago...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6" />
                Registrar Pago
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
