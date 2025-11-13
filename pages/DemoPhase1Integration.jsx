/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║         DEMO: INTEGRACIÓN FASE 1 - CHRONOS COMPONENTS                     ║
 * ║    ChronosKPI + React Query + Toast + Zod Validation Demo                ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Este archivo demuestra cómo usar todos los componentes de Fase 1:
 * - ChronosKPI para mostrar indicadores
 * - Custom hooks con React Query (useVentas, useVentasStats)
 * - Toast notifications
 * - Zod validation en formularios
 *
 * @module DemoPhase1
 * @author CHRONOS System
 * @version 1.0.0
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    DollarSign,
    Package,
    ShoppingCart,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

// Nuevos componentes de Fase 1
import ChronosKPI from '../components/chronos-ui/ChronosKPI';
import { toast } from '../stores/useChronosStore';

// Custom hooks de Fase 1
import {
    useCreateVenta,
    useVentas,
    useVentasStats,
} from '../hooks';

// Schemas de validación de Fase 1
import { CreateVentaSchema } from '../schemas';

/**
 * Demo de ChronosKPI Component
 */
const DemoKPIs = () => {
  // Usar el hook para obtener stats (con React Query cache automático)
  const { data: stats, isLoading } = useVentasStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-chronos-dark/50 rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">
        📊 Demo: ChronosKPI Components
      </h2>

      {/* Grid de KPIs - 4 tamaños diferentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Ventas del Mes (Grande, Verde) */}
        <ChronosKPI
          label="Ventas del Mes"
          value={stats?.ventasMes || 156000}
          format="currency"
          trend={12.5}
          color="green"
          icon={DollarSign}
          size="lg"
        />

        {/* KPI 2: Clientes Activos (Mediano, Cyan) */}
        <ChronosKPI
          label="Clientes Activos"
          value={stats?.clientesActivos || 248}
          format="number"
          trend={8.3}
          color="cyan"
          icon={Users}
          size="md"
        />

        {/* KPI 3: Productos Vendidos (Pequeño, Purple) */}
        <ChronosKPI
          label="Productos Vendidos"
          value={stats?.productosVendidos || 1420}
          format="number"
          trend={-2.1}
          color="purple"
          icon={Package}
          size="sm"
        />

        {/* KPI 4: Tasa de Conversión (Mediano, Yellow) */}
        <ChronosKPI
          label="Tasa de Conversión"
          value={stats?.tasaConversion || 68.5}
          format="percentage"
          trend={5.2}
          color="yellow"
          icon={TrendingUp}
          size="md"
        />
      </div>

      {/* Grid adicional para mostrar más variantes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* KPI con tendencia negativa */}
        <ChronosKPI
          label="Gastos Operativos"
          value={stats?.gastosMes || 45000}
          format="currency"
          trend={-15.3}
          color="red"
          icon={AlertTriangle}
          size="md"
        />

        {/* KPI sin tendencia */}
        <ChronosKPI
          label="Total Transacciones"
          value={stats?.totalTransacciones || 892}
          format="number"
          color="cyan"
          icon={Activity}
          size="md"
        />

        {/* KPI con pulse animation */}
        <ChronosKPI
          label="Ventas en Proceso"
          value={stats?.ventasPendientes || 23}
          format="number"
          color="purple"
          icon={ShoppingCart}
          size="md"
          pulse
        />
      </div>
    </div>
  );
};

/**
 * Demo de React Query + Toast Notifications
 */
const DemoVentasList = () => {
  // Hook personalizado con React Query (caché automático, refetch, etc.)
  const { data: ventas, isLoading, error, refetch } = useVentas({
    estado: 'pagada',
  });

  const handleRefresh = () => {
    toast.info('Actualizando', 'Obteniendo últimas ventas...');
    refetch();
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan mx-auto" />
        <p className="text-white/60 mt-4">Cargando ventas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-neon-red/10 border border-neon-red/30 rounded-2xl">
        <p className="text-neon-red">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          📋 Demo: React Query + Toast
        </h2>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-all"
        >
          Refrescar
        </button>
      </div>

      <div className="grid gap-4">
        {ventas?.slice(0, 5).map((venta) => (
          <motion.div
            key={venta.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 bg-chronos-dark/50 border border-white/10 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">
                  Venta #{venta.id}
                </p>
                <p className="text-white/60 text-sm">
                  {venta.clienteNombre}
                </p>
              </div>
              <div className="text-right">
                <p className="text-neon-green font-bold">
                  ${venta.total.toLocaleString('es-MX')}
                </p>
                <p className="text-white/60 text-sm">
                  {venta.metodoPago}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/**
 * Demo de Zod Validation + Form
 */
const DemoFormWithValidation = () => {
  const [showForm, setShowForm] = useState(false);

  // Hook para crear venta (con toast notifications automático)
  const createVenta = useCreateVenta();

  // React Hook Form con Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(CreateVentaSchema),
    defaultValues: {
      productos: [],
      metodoPago: 'efectivo',
      estado: 'pendiente',
    },
  });

  const onSubmit = async (data) => {
    try {
      await createVenta.mutateAsync(data);
      // Toast success automático desde el hook
      reset();
      setShowForm(false);
    } catch (error) {
      // Toast error automático desde el hook
      console.error(error);
    }
  };

  const demoToasts = () => {
    toast.success('¡Éxito!', 'Esta es una notificación de éxito');
    setTimeout(() => {
      toast.info('Información', 'Esta es una notificación informativa');
    }, 1000);
    setTimeout(() => {
      toast.warning('Advertencia', 'Esta es una notificación de advertencia');
    }, 2000);
    setTimeout(() => {
      toast.error('Error', 'Esta es una notificación de error');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">
        ✅ Demo: Zod Validation + Toast System
      </h2>

      {/* Botones de demo */}
      <div className="flex gap-4">
        <button
          onClick={demoToasts}
          className="px-6 py-3 bg-neon-purple/20 border border-neon-purple/50 text-neon-purple rounded-lg hover:bg-neon-purple/30 transition-all font-semibold"
        >
          Probar Toast Notifications
        </button>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-all font-semibold"
        >
          {showForm ? 'Ocultar' : 'Mostrar'} Formulario con Zod
        </button>
      </div>

      {/* Formulario con Zod validation */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-chronos-dark/50 border border-white/10 rounded-2xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-white mb-2">Cliente ID</label>
              <input
                {...register('clienteId')}
                className="w-full px-4 py-2 bg-chronos-dark border border-white/20 rounded-lg text-white"
                placeholder="ID del cliente"
              />
              {errors.clienteId && (
                <p className="text-neon-red text-sm mt-1">
                  {errors.clienteId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-white mb-2">Total</label>
              <input
                {...register('total', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-4 py-2 bg-chronos-dark border border-white/20 rounded-lg text-white"
                placeholder="0.00"
              />
              {errors.total && (
                <p className="text-neon-red text-sm mt-1">
                  {errors.total.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-white mb-2">Método de Pago</label>
              <select
                {...register('metodoPago')}
                className="w-full px-4 py-2 bg-chronos-dark border border-white/20 rounded-lg text-white"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="credito">Crédito</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={createVenta.isLoading}
              className="w-full px-6 py-3 bg-neon-green/20 border border-neon-green/50 text-neon-green rounded-lg hover:bg-neon-green/30 transition-all font-semibold disabled:opacity-50"
            >
              {createVenta.isLoading ? 'Guardando...' : 'Crear Venta'}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
};

/**
 * Página principal del demo
 */
export const DemoPhase1Integration = () => {
  return (
    <div className="min-h-screen bg-chronos-dark p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            🎉 Demo: Fase 1 Completada
          </h1>
          <p className="text-xl text-white/60">
            ChronosKPI • React Query • Toast System • Zod Validation
          </p>
        </motion.div>

        {/* Demos */}
        <DemoKPIs />

        <div className="border-t border-white/10 my-12" />

        <DemoVentasList />

        <div className="border-t border-white/10 my-12" />

        <DemoFormWithValidation />

        {/* Footer */}
        <div className="text-center py-8 text-white/40 text-sm">
          <p>CHRONOS System © 2024 - Fase 1: Quick Wins Completada ✅</p>
        </div>
      </div>
    </div>
  );
};

export default DemoPhase1Integration;
