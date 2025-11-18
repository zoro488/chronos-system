/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                   DATA ANALYSIS DASHBOARD                                  ║
 * ║        Advanced analytics with zero/empty value exclusion                 ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Dashboard para visualizar análisis avanzado de datos con:
 * - Conteo correcto excluyendo zeros y valores vacíos
 * - 31 clientes válidos
 * - 9 órdenes de compra
 * - 2-6 distribuidores (2 sin deuda)
 * - ~306 gastos y pagos
 * - 96 ventas
 * - RF Actual de bancos en USD con cortes históricos
 * - Stock actual de almacén en USD
 *
 * @module DataAnalysisDashboard
 * @version 1.0.0
 */

import { useEffect, useState } from 'react';
import { getFirestore } from 'firebase/firestore';
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';

import { Card } from '../components/ui/BaseComponents';
import { PageLayout, ContentSection } from '../components/layout/LayoutComponents';
import DataAnalysisService from '../services/DataAnalysisService';

const cn = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Componente de tarjeta de métrica
 */
const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-pink-600',
    orange: 'from-orange-500 to-red-600',
    red: 'from-red-500 to-pink-600',
    indigo: 'from-indigo-500 to-purple-600',
  };

  return (
    <Card className="p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              {trend.direction === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
              )}
              <span className={trend.direction === 'up' ? 'text-green-400' : 'text-red-400'}>
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'p-3 rounded-xl bg-gradient-to-br',
            colorClasses[color],
            'shadow-lg'
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
};

/**
 * Componente de tabla de bancos con RF Actual
 */
const BankBalanceTable = ({ bancos, resumen }) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Wallet className="w-6 h-6 mr-2 text-blue-400" />
          RF Actual - Saldos Bancarios (USD)
        </h3>
        <div className="text-right">
          <p className="text-sm text-gray-400">Saldo Consolidado</p>
          <p className="text-2xl font-bold text-green-400">
            ${resumen.saldoConsolidado.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Banco</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">
                Saldo Actual
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">
                Entradas
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Salidas</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">
                Movimientos
              </th>
            </tr>
          </thead>
          <tbody>
            {bancos.map((banco) => (
              <tr key={banco.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                <td className="py-3 px-4 text-white font-medium">{banco.nombre}</td>
                <td className="py-3 px-4 text-right">
                  <span className="text-green-400 font-semibold">
                    ${banco.saldoActual.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-blue-400">
                  ${banco.totalEntradas.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right text-red-400">
                  ${banco.totalSalidas.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right text-gray-400">
                  {banco.numeroMovimientos}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-gray-600">
            <tr>
              <td className="py-3 px-4 text-white font-bold">TOTAL</td>
              <td className="py-3 px-4 text-right">
                <span className="text-green-400 font-bold text-lg">
                  ${resumen.saldoConsolidado.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </td>
              <td className="py-3 px-4 text-right text-blue-400 font-semibold">
                ${resumen.totalEntradas.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
              <td className="py-3 px-4 text-right text-red-400 font-semibold">
                ${resumen.totalSalidas.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
        <p className="text-xs text-gray-400">
          💡 <strong>RF Actual:</strong> Reporte Financiero con saldos actuales de cada banco. Los
          cortes históricos muestran el saldo al inicio de cada mes.
        </p>
      </div>
    </Card>
  );
};

/**
 * Componente de cortes históricos
 */
const HistoricalCutsTable = ({ bancos }) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <Activity className="w-6 h-6 mr-2 text-purple-400" />
        Cortes Anteriores por Banco
      </h3>

      <div className="space-y-4">
        {bancos.map((banco) => (
          <div key={banco.id} className="p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-white font-semibold mb-3">{banco.nombre}</h4>
            <div className="grid grid-cols-3 gap-3">
              {banco.cortesAnteriores.map((corte, idx) => (
                <div key={idx} className="text-center p-2 bg-gray-900/50 rounded">
                  <p className="text-xs text-gray-400 mb-1">{corte.periodo}</p>
                  <p className="text-sm font-semibold text-white">
                    ${corte.saldo.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

/**
 * Componente de calidad de datos
 */
const DataQualityPanel = ({ quality }) => {
  const getStatusIcon = (status) => {
    if (status === 'CORRECTO') return <CheckCircle className="w-5 h-5 text-green-400" />;
    return <XCircle className="w-5 h-5 text-red-400" />;
  };

  const getStatusColor = (status) => {
    if (status === 'CORRECTO') return 'text-green-400';
    return 'text-red-400';
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <AlertCircle className="w-6 h-6 mr-2 text-yellow-400" />
        Validación de Datos
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center">
            {getStatusIcon(quality.clients.status)}
            <span className="ml-3 text-white">Clientes</span>
          </div>
          <div className="text-right">
            <span className={cn('font-semibold', getStatusColor(quality.clients.status))}>
              {quality.clients.actual} / {quality.clients.expected}
            </span>
            <p className="text-xs text-gray-400">
              Validez: {quality.clients.validityRate}%
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center">
            {getStatusIcon(quality.purchaseOrders.status)}
            <span className="ml-3 text-white">Órdenes de Compra</span>
          </div>
          <div className="text-right">
            <span
              className={cn('font-semibold', getStatusColor(quality.purchaseOrders.status))}
            >
              {quality.purchaseOrders.actual} / {quality.purchaseOrders.expected}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center">
            {getStatusIcon(quality.distributors.status)}
            <span className="ml-3 text-white">Distribuidores</span>
          </div>
          <div className="text-right">
            <span
              className={cn('font-semibold', getStatusColor(quality.distributors.status))}
            >
              {quality.distributors.actual} ({quality.distributors.withoutDebt} sin deuda) /{' '}
              {quality.distributors.expected}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center">
            {getStatusIcon(quality.sales.status)}
            <span className="ml-3 text-white">Ventas</span>
          </div>
          <div className="text-right">
            <span className={cn('font-semibold', getStatusColor(quality.sales.status))}>
              {quality.sales.actual} / {quality.sales.expected}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center">
            {getStatusIcon(quality.expensesPayments.status)}
            <span className="ml-3 text-white">Gastos y Pagos</span>
          </div>
          <div className="text-right">
            <span
              className={cn('font-semibold', getStatusColor(quality.expensesPayments.status))}
            >
              {quality.expensesPayments.actual} / {quality.expensesPayments.expected}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

/**
 * Dashboard principal de análisis de datos
 */
export const DataAnalysisDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [qualityReport, setQualityReport] = useState(null);
  const [error, setError] = useState(null);

  const db = getFirestore();
  const analysisService = new DataAnalysisService(db);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const [completeAnalysis, quality] = await Promise.all([
        analysisService.getCompleteAnalysis(),
        analysisService.getDataQualityReport(),
      ]);

      setAnalysis(completeAnalysis);
      setQualityReport(quality);
    } catch (err) {
      console.error('Error loading analysis:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Activity className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Analizando datos...</p>
            <p className="text-gray-400 text-sm">Excluyendo valores en cero y vacíos</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <ContentSection>
          <Card className="p-6 bg-red-900/20 border-red-500/50">
            <div className="flex items-center text-red-400">
              <AlertCircle className="w-6 h-6 mr-2" />
              <div>
                <h3 className="font-semibold">Error al cargar análisis</h3>
                <p className="text-sm text-gray-400">{error}</p>
              </div>
            </div>
          </Card>
        </ContentSection>
      </PageLayout>
    );
  }

  if (!analysis) return null;

  const { summary, clients, distributors, sales, expensesPayments, bankBalances, inventory } =
    analysis;

  return (
    <PageLayout>
      {/* Header */}
      <ContentSection>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📊 Análisis Avanzado de Datos
          </h1>
          <p className="text-gray-400">
            Análisis detallado excluyendo valores en cero y vacíos. Última actualización:{' '}
            {new Date(analysis.timestamp).toLocaleString('es-MX')}
          </p>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Clientes Válidos"
            value={summary.clientesValidos}
            subtitle={`${clients.active} activos, ${clients.withDebt} con deuda`}
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Órdenes de Compra"
            value={summary.ordenesCompra}
            subtitle={`Total: $${summary.ordenesCompra.toLocaleString()}`}
            icon={ShoppingCart}
            color="purple"
          />
          <MetricCard
            title="Distribuidores"
            value={summary.distribuidores}
            subtitle={`${summary.distribuidoresSinDeuda} sin deuda`}
            icon={Users}
            color="indigo"
          />
          <MetricCard
            title="Ventas"
            value={summary.ventas}
            subtitle={`${sales.byStatus.liquidada} liquidadas`}
            icon={TrendingUp}
            color="green"
          />
        </div>

        {/* Métricas Financieras */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Gastos y Pagos"
            value={summary.gastosYPagos}
            subtitle={`$${expensesPayments.combined.totalAmount.toLocaleString()} USD`}
            icon={DollarSign}
            color="orange"
          />
          <MetricCard
            title="Saldo Bancos (USD)"
            value={`$${summary.saldoBancosUSD.toLocaleString()}`}
            subtitle={`${bankBalances.resumen.totalBancos} bancos`}
            icon={Wallet}
            color="green"
          />
          <MetricCard
            title="Inventario (USD)"
            value={`$${summary.valorInventarioUSD.toLocaleString()}`}
            subtitle={`${inventory.totalProducts} productos`}
            icon={Package}
            color="purple"
          />
          <MetricCard
            title="Cuentas por Cobrar"
            value={`$${clients.totalDebt.toLocaleString()}`}
            subtitle={`${clients.withDebt} clientes`}
            icon={BarChart3}
            color="red"
          />
        </div>

        {/* Panel de Validación */}
        {qualityReport && (
          <div className="mb-8">
            <DataQualityPanel quality={qualityReport.quality} />
          </div>
        )}

        {/* Tabla de Bancos - RF Actual */}
        <div className="mb-8">
          <BankBalanceTable
            bancos={bankBalances.bancos}
            resumen={bankBalances.resumen}
          />
        </div>

        {/* Cortes Históricos */}
        <div className="mb-8">
          <HistoricalCutsTable bancos={bankBalances.bancos} />
        </div>

        {/* Detalles de Distribuidores */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Users className="w-6 h-6 mr-2 text-indigo-400" />
            Análisis de Distribuidores
          </h3>
          <div className="space-y-3">
            {distributors.list.map((dist) => (
              <div
                key={dist.id}
                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
              >
                <div>
                  <p className="text-white font-semibold">{dist.nombre}</p>
                  <p className="text-sm text-gray-400">
                    {dist.numeroCompras} compras • Total: ${dist.totalCompras.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  {dist.hasDebt ? (
                    <span className="text-red-400 font-semibold">
                      Deuda: ${dist.deuda.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-green-400 font-semibold">Sin deuda ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Productos de Alto Valor */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Package className="w-6 h-6 mr-2 text-purple-400" />
            Top 10 Productos por Valor de Inventario (USD)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">
                    Producto
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">
                    Stock
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">
                    Costo Unit.
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">
                    Valor Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {inventory.topValueProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="py-3 px-4 text-white">{product.nombre}</td>
                    <td className="py-3 px-4 text-right text-gray-400">{product.stock}</td>
                    <td className="py-3 px-4 text-right text-blue-400">
                      ${product.costoUnitario.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-green-400 font-semibold">
                      ${product.valor.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </ContentSection>
    </PageLayout>
  );
};

export default DataAnalysisDashboard;
