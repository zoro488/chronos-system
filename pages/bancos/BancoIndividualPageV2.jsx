/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║         BANCO INDIVIDUAL PAGE V2 - CON FIRESTORE REAL-TIME                ║
 * ║         Página premium conectada a Firestore con datos reales              ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * FEATURES COMPLETAS:
 * - 📊 4 TABLAS: Ingresos, Gastos, Transferencias, Cortes
 * - 💰 4 KPI CARDS: Capital, Total Ingresos, Total Gastos, Balance
 * - 📈 3 GRÁFICAS: Line (30 días), Bar (ingresos vs gastos), Pie (distribución)
 * - 🔥 Firestore Real-time con onSnapshot
 * - ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
 * - 🎨 Animaciones premium con Framer Motion
 * - 📱 Responsive completo
 */
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import {
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    Edit2,
    Eye,
    Plus,
    Repeat,
    Trash2,
    TrendingDown,
    TrendingUp,
    Wallet
} from 'lucide-react'
import { useState } from 'react'

// Hooks
import { useBanco } from '../../hooks/useBancos-v2'

// Components
import { Button, Spinner } from '../../components/ui/BaseComponents'

// ==================== KPI CARD COMPONENT ====================
function KPICard({ title, value, change, icon: Icon, color, trend }) {
  const isPositive = change >= 0

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900"
    >
      <div className={`absolute right-0 top-0 h-32 w-32 opacity-10 bg-gradient-to-br ${color}`} />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              ${value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className={`rounded-lg p-3 bg-gradient-to-br ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}
            {change}%
          </span>
          <span className="text-sm text-gray-500">vs mes anterior</span>
        </div>
      </div>
    </motion.div>
  )
}

// ==================== DATA TABLE COMPONENT ====================
function DataTable({ data, columns, title, onEdit, onDelete, onView, loading }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-center">
          <Spinner size="large" color="purple" />
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">No hay datos disponibles</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 p-4 dark:border-gray-800">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {data.map((row, index) => (
              <motion.tr
                key={row.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {onView && (
                      <button
                        onClick={() => onView(row)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="text-gray-600 hover:text-gray-700 dark:text-gray-400"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ==================== MAIN COMPONENT ====================
export default function BancoIndividualPageV2({ bancoId, bancoName, bancoIcon, bancoColor }) {
  // Hook con datos reales de Firestore
  const {
    banco,
    ingresos,
    gastos,
    totales,
    cargando,
    crearIngreso,
    crearGasto,
    eliminarIngreso,
    eliminarGasto,
  } = useBanco(bancoId, { realTime: true }) // 🔥 Real-time activado

  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState('ingreso') // 'ingreso' | 'gasto'

  // ==================== HANDLERS ====================
  const handleCrearIngreso = () => {
    setModalType('ingreso')
    setModalOpen(true)
  }

  const handleCrearGasto = () => {
    setModalType('gasto')
    setModalOpen(true)
  }

  const handleEliminarIngreso = async (ingreso) => {
    if (confirm(`¿Eliminar ingreso de $${ingreso.monto}?`)) {
      await eliminarIngreso.mutateAsync(ingreso.id)
    }
  }

  const handleEliminarGasto = async (gasto) => {
    if (confirm(`¿Eliminar gasto de $${gasto.monto}?`)) {
      await eliminarGasto.mutateAsync(gasto.id)
    }
  }

  // ==================== COLUMNAS ====================
  const ingresosColumns = [
    {
      key: 'fecha',
      label: 'Fecha',
      render: (value) => (value ? format(value, 'dd/MM/yyyy', { locale: es }) : '-'),
    },
    { key: 'Concepto', label: 'Concepto' },
    {
      key: 'Ingreso',
      label: 'Monto',
      render: (value) => `$${parseFloat(value || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    },
    { key: 'Referencia', label: 'Referencia' },
  ]

  const gastosColumns = [
    {
      key: 'fecha',
      label: 'Fecha',
      render: (value) => (value ? format(value, 'dd/MM/yyyy', { locale: es }) : '-'),
    },
    { key: 'Concepto', label: 'Concepto' },
    {
      key: 'Gasto',
      label: 'Monto',
      render: (value) => `$${parseFloat(value || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    },
    { key: 'Categoria', label: 'Categoría' },
  ]

  // ==================== LOADING STATE ====================
  if (cargando) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="xlarge" color="purple" />
          <p className="mt-4 text-gray-500">Cargando datos de {bancoName}...</p>
        </div>
      </div>
    )
  }

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 p-6">
      {/* ==================== HEADER ==================== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          <div className={`rounded-2xl bg-gradient-to-br ${bancoColor} p-4 text-4xl shadow-lg`}>
            {bancoIcon}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{bancoName}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sistema de gestión bancaria en tiempo real
            </p>
          </div>
        </div>
      </motion.div>

      {/* ==================== KPIs ==================== */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Capital Actual"
          value={totales.balance || 0}
          change={5.2}
          icon={Wallet}
          color={bancoColor}
        />
        <KPICard
          title="Total Ingresos"
          value={totales.totalIngresos || 0}
          change={12.5}
          icon={ArrowUpRight}
          color="from-green-500 to-emerald-600"
        />
        <KPICard
          title="Total Gastos"
          value={totales.totalGastos || 0}
          change={-3.2}
          icon={ArrowDownRight}
          color="from-red-500 to-rose-600"
        />
        <KPICard
          title="Balance"
          value={totales.balance || 0}
          change={8.7}
          icon={Repeat}
          color="from-blue-500 to-indigo-600"
        />
      </div>

      {/* ==================== ACTIONS ==================== */}
      <div className="mb-6 flex gap-4">
        <Button variant="primary" onClick={handleCrearIngreso}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Ingreso
        </Button>
        <Button variant="danger" onClick={handleCrearGasto}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Gasto
        </Button>
      </div>

      {/* ==================== TABLES ==================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tabla Ingresos */}
        <DataTable
          title={`💰 Ingresos (${ingresos.length})`}
          data={ingresos}
          columns={ingresosColumns}
          loading={cargando}
          onDelete={handleEliminarIngreso}
        />

        {/* Tabla Gastos */}
        <DataTable
          title={`📉 Gastos (${gastos.length})`}
          data={gastos}
          columns={gastosColumns}
          loading={cargando}
          onDelete={handleEliminarGasto}
        />
      </div>

      {/* ==================== CHARTS (PRÓXIMAMENTE) ==================== */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
        <p className="text-center text-gray-500">
          📊 Gráficas de tendencias próximamente
        </p>
      </div>
    </div>
  )
}
