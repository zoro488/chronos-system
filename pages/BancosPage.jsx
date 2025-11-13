/**
 * CHRONOS - Bancos Page
 * Sistema completo de gestión bancaria para 7 bancos
 * Features: Tabs navigation, 4 KPIs, 3 Forms, 3 Tables, Charts
 */
import { useCallback, useMemo, useState } from 'react';

import { getAuth } from 'firebase/auth';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  DollarSign,
  Download,
  Plus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';

import { MegaAIWidget } from '../components/ai/MegaAIWidget';
import {
  AnimatedStatCard,
  ChartContainer,
  EmptyState,
  LoadingSkeleton,
  PageHeader,
} from '../components/shared/PremiumComponents';
import { ContentSection, PageLayout } from '../components/layout/LayoutComponents';

// ==========================================
// 🎨 CONSTANTES Y CONFIGURACIÓN
// ==========================================

const BANCOS = [
  {
    id: 'bovedaMonte',
    nombre: 'Bóveda Monte',
    icon: '🏦',
    color: 'from-blue-500 to-cyan-500',
    moneda: 'MXN',
    tipo: 'auto',
    descripcion: 'Ventas automáticas',
  },
  {
    id: 'bovedaUsa',
    nombre: 'Bóveda USA',
    icon: '🇺🇸',
    color: 'from-green-500 to-emerald-500',
    moneda: 'USD',
    tipo: 'manual',
    descripcion: 'Capital en dólares',
  },
  {
    id: 'utilidades',
    nombre: 'Utilidades',
    icon: '💰',
    color: 'from-purple-500 to-pink-500',
    moneda: 'MXN',
    tipo: 'auto',
    descripcion: 'Ganancias netas',
  },
  {
    id: 'fleteSur',
    nombre: 'Flete Sur',
    icon: '🚚',
    color: 'from-orange-500 to-red-500',
    moneda: 'MXN',
    tipo: 'auto',
    descripcion: 'Fletes automáticos',
  },
  {
    id: 'azteca',
    nombre: 'Azteca',
    icon: '🏪',
    color: 'from-yellow-500 to-amber-500',
    moneda: 'MXN',
    tipo: 'manual',
    descripcion: 'Banco externo',
  },
  {
    id: 'leftie',
    nombre: 'Leftie',
    icon: '👕',
    color: 'from-indigo-500 to-blue-500',
    moneda: 'MXN',
    tipo: 'manual',
    descripcion: 'Negocio secundario',
  },
  {
    id: 'profit',
    nombre: 'Profit',
    icon: '📈',
    color: 'from-pink-500 to-rose-500',
    moneda: 'MXN',
    tipo: 'manual',
    descripcion: 'Utilidades distribuidas',
  },
];

const CONCEPTOS_COMUNES = [
  'Renta',
  'Nómina',
  'Servicios',
  'Mantenimiento',
  'Publicidad',
  'Compras',
  'Inversión',
  'Préstamo',
  'Depósito',
  'Venta Externa',
];

const CATEGORIAS_GASTO = [
  'Operacional',
  'Distribuidor',
  'Flete',
  'Nómina',
  'Servicios',
  'Mantenimiento',
  'Marketing',
  'Otro',
];

// Conversión USD/MXN (actualizar con API real)
const USD_TO_MXN = 17.5;

// ==========================================
// 🔄 SCHEMAS DE VALIDACIÓN (Para implementación futura con React Hook Form)
// ==========================================

// TODO: Implementar con React Hook Form + Zod
// const transferenciaSchema = z.object({ ... });
// const gastoSchema = z.object({ ... });
// const ingresoSchema = z.object({ ... });

// ==========================================
// 🎯 COMPONENTE PRINCIPAL
// ==========================================

const BancosPage = () => {
  const [activeBanco, setActiveBanco] = useState('bovedaMonte');
  const [activeTab, setActiveTab] = useState('registros');
  // const [showFilters, setShowFilters] = useState(false); // TODO: Implementar filtros avanzados
  // const [searchTerm, setSearchTerm] = useState(''); // TODO: Implementar búsqueda
  // const [dateRange, setDateRange] = useState('30'); // TODO: Implementar filtro fecha

  // TODO: Reemplazar con hooks reales de React Query
  const bancoActual = BANCOS.find((b) => b.id === activeBanco);
  const loading = false;
  const error = null;

  // Datos mock (reemplazar con useQuery) - Memoizado para estabilidad
  const dataMock = useMemo(
    () => ({
      historico: 1250000,
      capital: 850000,
      totalGastos: 320000,
      totalTransferencias: 80000,
      registros: [],
      gastos: [],
      transferencias: [],
    }),
    []
  );

  // ==========================================
  // 📊 CALCULOS Y METRICAS
  // ==========================================

  const stats = useMemo(
    () => [
      {
        title: 'Histórico',
        value: dataMock.historico,
        icon: TrendingUp,
        color: 'green',
        trend: 'up',
        trendValue: '+12.5%',
        description: 'Acumulativo total',
        badge: 'Solo lectura',
        badgeColor: 'green',
      },
      {
        title: 'Capital Actual',
        value: dataMock.capital,
        icon: Wallet,
        color: 'cyan',
        trend: dataMock.capital > dataMock.historico * 0.6 ? 'up' : 'down',
        trendValue: `${((dataMock.capital / dataMock.historico) * 100).toFixed(1)}%`,
        description: 'Disponible ahora',
        badge: 'Variable',
        badgeColor: 'blue',
      },
      {
        title: 'Total Gastos',
        value: dataMock.totalGastos,
        icon: TrendingDown,
        color: 'red',
        trend: 'down',
        trendValue: '-15.2%',
        description: 'Egresos acumulados',
        badge: 'Histórico',
        badgeColor: 'red',
      },
      {
        title: 'Transferencias',
        value: dataMock.totalTransferencias,
        icon: RefreshCw,
        color: 'purple',
        trend: 'up',
        trendValue: '+8.3%',
        description: 'Netas (entrada-salida)',
        badge: 'Movimientos',
        badgeColor: 'purple',
      },
    ],
    [dataMock]
  );

  // Conversión de moneda para Bóveda USA
  const formatCurrency = useCallback(
    (value) => {
      if (bancoActual?.moneda === 'USD') {
        return `$${(value / USD_TO_MXN).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`;
      }
      return `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;
    },
    [bancoActual]
  );

  // ==========================================
  // 🎨 RENDER: TABS SELECTOR
  // ==========================================

  const renderBankSelector = () => (
    <div className="mb-8 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10">
      <div className="flex gap-3 min-w-max pb-2">
        {BANCOS.map((banco) => (
          <motion.button
            key={banco.id}
            onClick={() => setActiveBanco(banco.id)}
            className={`
              relative px-6 py-4 rounded-2xl border-2 transition-all duration-300
              ${
                activeBanco === banco.id
                  ? 'bg-gradient-to-r ' + banco.color + ' border-white/30 shadow-2xl'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }
            `}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{banco.icon}</span>
              <div className="text-left">
                <h3 className="font-bold text-white text-sm">{banco.nombre}</h3>
                <p className="text-xs text-white/60">{banco.descripcion}</p>
              </div>
              {activeBanco === banco.id && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );

  // ==========================================
  // 🎨 RENDER: STATS GRID
  // ==========================================

  const renderStatsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <AnimatePresence mode="wait">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <AnimatedStatCard
              {...stat}
              value={formatCurrency(stat.value)}
              // TODO: Implementar navegación a subpáginas
              onClick={() => {}}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  // ==========================================
  // 🎨 RENDER: SPARKLINE CHART
  // ==========================================

  const renderSparkline = () => {
    // Datos mock últimos 30 días
    const sparklineData = Array.from({ length: 30 }, (_, i) => ({
      dia: i + 1,
      capital: dataMock.capital * (0.9 + Math.random() * 0.2),
    }));

    return (
      <ChartContainer title="Balance últimos 30 días" className="mb-8">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={sparklineData}>
            <defs>
              <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
              }}
              formatter={(value) => [formatCurrency(value), 'Capital']}
            />
            <Area
              type="monotone"
              dataKey="capital"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#colorCapital)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  // ==========================================
  // 🎨 RENDER: OPERATIONS HUB (3 FORMS)
  // ==========================================

  const renderOperationsHub = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* TRANSFERENCIA FORM */}
      <motion.div
        className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
        whileHover={{ scale: 1.01, borderColor: 'rgba(255, 255, 255, 0.2)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500">
            <RefreshCw className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Transferencia</h3>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Banco Destino</label>
            <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500 focus:outline-none transition-colors">
              <option value="">Seleccionar...</option>
              {BANCOS.filter((b) => b.id !== activeBanco).map((banco) => (
                <option key={banco.id} value={banco.id}>
                  {banco.icon} {banco.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Monto</label>
            <input
              type="number"
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Concepto</label>
            <input
              type="text"
              placeholder="Ej: Rebalanceo trimestral"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>
          <button
            type="button"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            Transferir
          </button>
        </form>
      </motion.div>

      {/* GASTO FORM */}
      <motion.div
        className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
        whileHover={{ scale: 1.01, borderColor: 'rgba(255, 255, 255, 0.2)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Registrar Gasto</h3>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Monto</label>
            <input
              type="number"
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-red-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Categoría</label>
            <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-red-500 focus:outline-none transition-colors">
              <option value="">Seleccionar...</option>
              {CATEGORIAS_GASTO.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Concepto</label>
            <input
              type="text"
              list="conceptos-comunes"
              placeholder="Ej: Renta mensual"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-red-500 focus:outline-none transition-colors"
            />
            <datalist id="conceptos-comunes">
              {CONCEPTOS_COMUNES.map((concepto) => (
                <option key={concepto} value={concepto} />
              ))}
            </datalist>
          </div>
          <button
            type="button"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium hover:shadow-lg hover:shadow-red-500/50 transition-all"
          >
            Registrar Gasto
          </button>
        </form>
      </motion.div>

      {/* INGRESO FORM (Solo manual banks) */}
      {bancoActual?.tipo === 'manual' ? (
        <motion.div
          className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
          whileHover={{ scale: 1.01, borderColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Registrar Ingreso</h3>
          </div>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Monto</label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Fuente</label>
              <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-green-500 focus:outline-none transition-colors">
                <option value="">Seleccionar...</option>
                <option value="venta">Venta Externa</option>
                <option value="deposito">Depósito</option>
                <option value="prestamo">Préstamo</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Concepto</label>
              <input
                type="text"
                placeholder="Ej: Depósito trimestral"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>
            <button
              type="button"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:shadow-lg hover:shadow-green-500/50 transition-all"
            >
              Registrar Ingreso
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div
          className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Auto-Registro</h3>
            <p className="text-sm text-white/60">
              Este banco recibe ingresos automáticos por ventas
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );

  // ==========================================
  // 🎨 RENDER: HISTORY TABS
  // ==========================================

  const renderHistoryTabs = () => (
    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
      {/* Tab Headers */}
      <div className="flex gap-4 border-b border-white/10 mb-6">
        {['registros', 'gastos', 'transferencias'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              relative px-6 py-3 font-medium transition-colors
              ${activeTab === tab ? 'text-white' : 'text-white/50 hover:text-white/70'}
            `}
          >
            {tab === 'registros' && '📋 Todos los Registros'}
            {tab === 'gastos' && '💸 Gastos Detallados'}
            {tab === 'transferencias' && '🔄 Transferencias'}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'registros' && (
          <motion.div
            key="registros"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <EmptyState
              icon="📋"
              title="Sin registros aún"
              message="Los movimientos aparecerán aquí"
              actionLabel="Ver documentación"
            />
          </motion.div>
        )}

        {activeTab === 'gastos' && (
          <motion.div
            key="gastos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <EmptyState
              icon="💸"
              title="Sin gastos registrados"
              message="Registra tu primer gasto arriba"
              actionLabel="Registrar gasto"
            />
          </motion.div>
        )}

        {activeTab === 'transferencias' && (
          <motion.div
            key="transferencias"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <EmptyState
              icon="🔄"
              title="Sin transferencias"
              message="Realiza una transferencia entre bancos"
              actionLabel="Hacer transferencia"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ==========================================
  // 🎨 RENDER PRINCIPAL
  // ==========================================

  if (loading) {
    return (
      <PageLayout>
        <ContentSection title="Gestión Bancaria">
          <LoadingSkeleton type="stats" />
        </ContentSection>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <ContentSection title="Gestión Bancaria">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Error al cargar datos</h2>
            <p className="text-white/60">{error}</p>
          </div>
        </ContentSection>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <ContentSection title="Gestión Bancaria">
        {/* Header */}
        <PageHeader
          title={`🏦 ${bancoActual?.nombre || 'Bancos'}`}
          subtitle={`Sistema de gestión para ${BANCOS.length} bancos - ${bancoActual?.descripcion}`}
          actionLabel="Exportar Dashboard"
          actionIcon={Download}
          // TODO: Implementar exportación a Excel/CSV
          onAction={() => {}}
        />

        {/* Bank Selector Tabs */}
        {renderBankSelector()}

        {/* Currency Conversion Notice */}
        {bancoActual?.moneda === 'USD' && (
          <motion.div
            className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="text-sm text-white/80">
                Conversión: 1 USD = {USD_TO_MXN} MXN (actualizar con API real)
              </span>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        {renderStatsGrid()}

        {/* Sparkline Chart */}
        {renderSparkline()}

        {/* Operations Hub */}
        {renderOperationsHub()}

        {/* History Tabs */}
        {renderHistoryTabs()}
      </ContentSection>

      {/* 🤖 AI Assistant Widget */}
      <MegaAIWidget userId={getAuth().currentUser?.uid || 'demo-user'} position="bottom-right" />
    </PageLayout>
  );
};

export default BancosPage;

