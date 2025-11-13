/**
 * 📊 BANCOS ANALYTICS - Dashboard Analítico Avanzado
 * - Heatmap calendar de actividad
 * - Gráficas comparativas multi-banco
 * - Trend análisis 6 meses
 * - Breakdown por categorías (Pie chart)
 * - Export dashboard como PDF
 * - KPIs dinámicos
 */

import { motion } from 'framer-motion';
import {
    ArrowDownUp,
    BarChart3,
    Download,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useMemo } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { toast } from 'sonner';
import { useBancos } from '../hooks/useBancos';

// ========================================================================
// CONSTANTES
// ========================================================================

const COLORES_CATEGORIAS = {
  Nómina: '#3b82f6',
  Renta: '#8b5cf6',
  Servicios: '#06b6d4',
  Combustible: '#f59e0b',
  Mantenimiento: '#10b981',
  Compras: '#ec4899',
  Impuestos: '#ef4444',
  Otros: '#6b7280',
  Ventas: '#10b981',
  Inversión: '#3b82f6',
  Préstamo: '#f59e0b',
};

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// ========================================================================
// COMPONENTE PRINCIPAL
// ========================================================================

export const BancosAnalytics = () => {
  const { bancos, cargando } = useBancos();

  // Preparar datos para gráficas
  const analyticsData = useMemo(() => {
    if (!bancos || bancos.length === 0) return null;

    // 1. Comparativa de bancos (capital actual)
    const bancosComparison = bancos.map((banco) => ({
      nombre: banco.nombre,
      capital: banco.capitalActual || 0,
      ingresos: banco.totalIngresos || 0,
      gastos: banco.totalGastos || 0,
    }));

    // 2. Trend últimos 6 meses (todos los bancos agregados)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = {};
    MONTHS.forEach((month, idx) => {
      monthlyData[idx] = { mes: month, ingresos: 0, gastos: 0, balance: 0 };
    });

    bancos.forEach((banco) => {
      // Ingresos
      banco.ingresos?.forEach((ing) => {
        const date = new Date(ing.fecha);
        if (date >= sixMonthsAgo) {
          const monthIdx = date.getMonth();
          monthlyData[monthIdx].ingresos += ing.monto || 0;
        }
      });

      // Gastos
      banco.gastos?.forEach((gasto) => {
        const date = new Date(gasto.fecha);
        if (date >= sixMonthsAgo) {
          const monthIdx = date.getMonth();
          monthlyData[monthIdx].gastos += gasto.monto || 0;
        }
      });
    });

    const trendData = Object.values(monthlyData).map((data) => ({
      ...data,
      balance: data.ingresos - data.gastos,
    }));

    // 3. Breakdown por categorías (gastos)
    const categoriasData = {};
    bancos.forEach((banco) => {
      banco.gastos?.forEach((gasto) => {
        const cat = gasto.categoria || 'Otros';
        if (!categoriasData[cat]) {
          categoriasData[cat] = 0;
        }
        categoriasData[cat] += gasto.monto || 0;
      });
    });

    const categoriasPie = Object.entries(categoriasData).map(([name, value]) => ({
      name,
      value,
      color: COLORES_CATEGORIAS[name] || '#6b7280',
    }));

    // 4. Actividad diaria (últimos 30 días) - para heatmap
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyActivity = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyActivity[dateStr] = 0;
    }

    bancos.forEach((banco) => {
      banco.ingresos?.forEach((ing) => {
        const dateStr = new Date(ing.fecha).toISOString().split('T')[0];
        if (dailyActivity[dateStr] !== undefined) {
          dailyActivity[dateStr]++;
        }
      });

      banco.gastos?.forEach((gasto) => {
        const dateStr = new Date(gasto.fecha).toISOString().split('T')[0];
        if (dailyActivity[dateStr] !== undefined) {
          dailyActivity[dateStr]++;
        }
      });
    });

    const heatmapData = Object.entries(dailyActivity).map(([date, count]) => ({
      date,
      count,
    }));

    // 5. KPIs generales
    const totalCapital = bancos.reduce((sum, b) => sum + (b.capitalActual || 0), 0);
    const totalIngresos = bancos.reduce((sum, b) => sum + (b.totalIngresos || 0), 0);
    const totalGastos = bancos.reduce((sum, b) => sum + (b.totalGastos || 0), 0);
    const totalBalance = totalIngresos - totalGastos;

    const promedioIngresosPorBanco = totalIngresos / bancos.length;
    const promedioGastosPorBanco = totalGastos / bancos.length;

    return {
      bancosComparison,
      trendData,
      categoriasPie,
      heatmapData,
      kpis: {
        totalCapital,
        totalIngresos,
        totalGastos,
        totalBalance,
        promedioIngresosPorBanco,
        promedioGastosPorBanco,
        bancosActivos: bancos.length,
      },
    };
  }, [bancos]);

  const handleExportPDF = () => {
    toast.info('🚧 Funcionalidad de export PDF en desarrollo');
    // TODO: Implementar export con jsPDF o html2canvas
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">No hay datos disponibles</p>
      </div>
    );
  }

  const { bancosComparison, trendData, categoriasPie, heatmapData, kpis } = analyticsData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-purple-950/20 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              📊 Analytics Dashboard
            </h1>
            <p className="text-slate-400">Análisis avanzado de datos bancarios</p>
          </div>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Exportar PDF
          </button>
        </motion.div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30"
          >
            <p className="text-sm text-blue-300 mb-2">Capital Total</p>
            <p className="text-3xl font-bold text-white mb-1">
              ${kpis.totalCapital.toLocaleString()}
            </p>
            <p className="text-xs text-blue-400">{kpis.bancosActivos} bancos activos</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/30"
          >
            <p className="text-sm text-emerald-300 mb-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Ingresos Totales
            </p>
            <p className="text-3xl font-bold text-white mb-1">
              ${kpis.totalIngresos.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-400">
              ~${kpis.promedioIngresosPorBanco.toLocaleString()} por banco
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-500/20 to-red-600/10 backdrop-blur-sm rounded-xl p-6 border border-red-500/30"
          >
            <p className="text-sm text-red-300 mb-2 flex items-center gap-1">
              <TrendingDown className="w-4 h-4" />
              Gastos Totales
            </p>
            <p className="text-3xl font-bold text-white mb-1">
              ${kpis.totalGastos.toLocaleString()}
            </p>
            <p className="text-xs text-red-400">
              ~${kpis.promedioGastosPorBanco.toLocaleString()} por banco
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`bg-gradient-to-br backdrop-blur-sm rounded-xl p-6 border ${
              kpis.totalBalance >= 0
                ? 'from-green-500/20 to-green-600/10 border-green-500/30'
                : 'from-red-500/20 to-red-600/10 border-red-500/30'
            }`}
          >
            <p className="text-sm text-slate-300 mb-2 flex items-center gap-1">
              <ArrowDownUp className="w-4 h-4" />
              Balance Neto
            </p>
            <p
              className={`text-3xl font-bold mb-1 ${
                kpis.totalBalance >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              ${kpis.totalBalance.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400">Ingresos - Gastos</p>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Comparativa de Bancos (Bar Chart) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">
                Comparativa de Bancos
              </h3>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bancosComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="nombre" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Legend />
                <Bar dataKey="capital" fill="#3b82f6" name="Capital" />
                <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" />
                <Bar dataKey="gastos" fill="#ef4444" name="Gastos" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Breakdown por Categorías (Pie Chart) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">
                Gastos por Categoría
              </h3>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoriasPie}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoriasPie.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Trend 6 Meses (Area Chart) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">
              Tendencia Últimos 6 Meses
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f1f5f9' }}
                formatter={(value) => `$${value.toLocaleString()}`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="ingresos"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorIngresos)"
                name="Ingresos"
              />
              <Area
                type="monotone"
                dataKey="gastos"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorGastos)"
                name="Gastos"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Heatmap de Actividad (últimos 30 días) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">
              Actividad Diaria (Últimos 30 Días)
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={heatmapData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f1f5f9' }}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('es-MX');
                }}
                formatter={(value) => [`${value} transacciones`, 'Actividad']}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default BancosAnalytics;
