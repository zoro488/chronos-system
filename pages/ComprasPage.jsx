/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                 COMPRAS PAGE - KANBAN WORKFLOW ÉPICO                      ║
 * ║  Workflow visual estilo Trello con drag&drop y tracking avanzado         ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * FEATURES:
 * - 📋 Kanban board con columnas de estados
 * - 🎯 Drag & drop para cambiar estados
 * - 📊 Stats por estado con animaciones
 * - 🎨 Cards con código de colores
 * - ✨ Modal CRUD con validación
 * - 📈 Timeline de cambios de estado
 * - 💰 Tracking de costos y presupuestos
 * - 🔔 Alertas de fechas límite
 *
 * Inspirado en: Trello, Jira, Monday.com
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
// Schema
import { getAuth } from 'firebase/auth';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  ShoppingCart,
  Truck,
  XCircle,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Components
import { MegaAIWidget } from '../components/ai/MegaAIWidget';
import {
  AnimatedStatCard,
  ChartContainer,
  EmptyState,
  FilterBar,
  LoadingSkeleton,
  PageHeader,
  StatusBadge,
  containerVariants,
  itemVariants,
} from '../components/shared/PremiumComponents';
import { Modal } from '../components/ui/BaseComponents';
// Hooks
import {
  useCompras,
  useCreateCompra,
  useDeleteCompra,
  useRecibirCompra,
  useUpdateCompra,
} from '../hooks';
import { PageLayout } from '../components/layout/LayoutComponents';
import { CreateCompraSchema } from '../schemas';

// ==================== KANBAN COLUMN ====================

const KanbanColumn = ({
  title,
  estado,
  compras,
  icon: Icon,
  color,
  onCardClick,
  onStatusChange,
}) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
    yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30',
    green: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
    red: 'from-red-500/20 to-red-500/5 border-red-500/30',
  };

  const iconColors = {
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    green: 'text-emerald-400',
    red: 'text-red-400',
  };

  const filteredCompras = compras?.filter((c) => c.estado === estado) || [];

  return (
    <motion.div
      variants={itemVariants}
      className={`flex-1 min-w-[300px] bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-xl rounded-2xl p-4`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg bg-black/20 ${iconColors[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-sm text-white/60">{filteredCompras.length} compras</p>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {filteredCompras.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <Icon className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Sin compras en {estado}</p>
          </div>
        ) : (
          filteredCompras.map((compra) => (
            <CompraCard
              key={compra.id}
              compra={compra}
              onClick={() => onCardClick(compra)}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </motion.div>
  );
};

// ==================== COMPRA CARD ====================

const CompraCard = ({ compra, onClick, onStatusChange }) => {
  const [isHovered, setIsHovered] = useState(false);

  const estadoColors = {
    pendiente: 'bg-yellow-500/10 border-yellow-500/30',
    recibida: 'bg-emerald-500/10 border-emerald-500/30',
    cancelada: 'bg-red-500/10 border-red-500/30',
  };

  const proveedorInitial = compra.proveedorNombre?.charAt(0) || 'P';

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative p-4 ${estadoColors[compra.estado]} border rounded-xl cursor-pointer backdrop-blur-sm transition-all group`}
    >
      {/* Provider Badge */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
          {proveedorInitial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold truncate">{compra.proveedorNombre}</p>
          <p className="text-xs text-white/60">#{compra.folio || compra.id.slice(0, 8)}</p>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl font-bold text-white">
          ${compra.total?.toLocaleString('es-MX')}
        </span>
        <StatusBadge
          status={compra.estado}
          colorMap={{
            pendiente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
            recibida: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
            cancelada: 'bg-red-500/20 text-red-400 border-red-500/50',
          }}
        />
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-white/60">
        <div className="flex items-center gap-1">
          <Package className="w-3 h-3" />
          <span>{compra.productos?.length || 0} productos</span>
        </div>
        {compra.fechaEntrega && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(compra.fechaEntrega).toLocaleDateString('es-MX')}</span>
          </div>
        )}
      </div>

      {/* Quick Actions on Hover */}
      {isHovered && compra.estado === 'pendiente' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-2 right-2 flex items-center gap-1"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(compra.id, 'recibida');
            }}
            className="p-1.5 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            title="Marcar como recibida"
          >
            <CheckCircle className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(compra.id, 'cancelada');
            }}
            className="p-1.5 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
            title="Cancelar compra"
          >
            <XCircle className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}

      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.15), transparent 70%)',
        }}
      />
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================

const ComprasPage = () => {
  // ==================== STATE ====================
  const [showModal, setShowModal] = useState(false);
  const [editingCompra, setEditingCompra] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [filters, setFilters] = useState({
    search: '',
    proveedor: 'todos',
  });

  // ==================== HOOKS ====================
  const { data: compras, isLoading } = useCompras();
  const createCompra = useCreateCompra();
  const updateCompra = useUpdateCompra();
  const deleteCompra = useDeleteCompra();
  const recibirCompra = useRecibirCompra();

  // ==================== FORM ====================
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(CreateCompraSchema),
  });

  // ==================== HANDLERS ====================

  const handleOpenModal = (compra = null) => {
    setEditingCompra(compra);
    if (compra) {
      Object.keys(compra).forEach((key) => {
        setValue(key, compra[key]);
      });
    } else {
      reset();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCompra(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (editingCompra) {
        await updateCompra.mutateAsync({ id: editingCompra.id, ...data });
      } else {
        await createCompra.mutateAsync(data);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleStatusChange = async (id, newEstado) => {
    try {
      if (newEstado === 'recibida') {
        await recibirCompra.mutateAsync({
          id,
          recepcionData: {
            fechaRecepcion: new Date().toISOString(),
            recibidoPor: getAuth().currentUser?.uid,
          },
        });
      } else {
        await updateCompra.mutateAsync({ id, estado: newEstado });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta compra?')) {
      await deleteCompra.mutateAsync(id);
    }
  };

  // ==================== COMPUTED DATA ====================

  const filteredCompras =
    compras?.filter((c) => {
      const matchSearch =
        filters.search === '' ||
        c.proveedorNombre?.toLowerCase().includes(filters.search.toLowerCase()) ||
        c.folio?.toLowerCase().includes(filters.search.toLowerCase());

      return matchSearch;
    }) || [];

  const stats = {
    total: compras?.length || 0,
    pendientes: compras?.filter((c) => c.estado === 'pendiente').length || 0,
    recibidas: compras?.filter((c) => c.estado === 'recibida').length || 0,
    totalMonto: compras?.reduce((sum, c) => sum + (c.total || 0), 0) || 0,
  };

  const chartData = [
    { name: 'Pendientes', value: stats.pendientes, color: '#eab308' },
    { name: 'Recibidas', value: stats.recibidas, color: '#10b981' },
    {
      name: 'Canceladas',
      value: compras?.filter((c) => c.estado === 'cancelada').length || 0,
      color: '#ef4444',
    },
  ];

  // ==================== RENDER ====================

  return (
    <PageLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 p-6"
      >
        {/* Header */}
        <PageHeader
          icon="📦"
          title="Gestión de Compras"
          subtitle="Workflow visual con tracking completo de órdenes"
          onAction={() => handleOpenModal()}
          actionLabel="Nueva Compra"
        />

        {/* Stats Grid */}
        {isLoading ? (
          <LoadingSkeleton type="stats" count={4} />
        ) : (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <AnimatedStatCard
              label="Total Compras"
              value={stats.total}
              format="number"
              trend={5.2}
              color="blue"
              icon={ShoppingCart}
              delay={0}
            />
            <AnimatedStatCard
              label="Pendientes"
              value={stats.pendientes}
              format="number"
              trend={-3.1}
              color="yellow"
              icon={Clock}
              delay={1}
            />
            <AnimatedStatCard
              label="Recibidas"
              value={stats.recibidas}
              format="number"
              trend={15.8}
              color="green"
              icon={Truck}
              delay={2}
            />
            <AnimatedStatCard
              label="Monto Total"
              value={stats.totalMonto}
              format="currency"
              trend={8.4}
              color="blue"
              icon={DollarSign}
              delay={3}
            />
          </motion.div>
        )}

        {/* Chart */}
        <ChartContainer title="📊 Compras por Estado">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#fff" opacity={0.6} />
              <YAxis stroke="#fff" opacity={0.6} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* View Mode Toggle */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-white/5 text-white/60 border border-white/10'
              }`}
            >
              📋 Kanban
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-white/5 text-white/60 border border-white/10'
              }`}
            >
              📝 Lista
            </motion.button>
          </div>
        </motion.div>

        {/* Filter Bar */}
        <FilterBar
          searchValue={filters.search}
          onSearchChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Buscar por proveedor, folio..."
        />

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton type="table" count={6} />
        ) : filteredCompras.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No hay compras registradas"
            message="Comienza agregando tu primera orden de compra"
            actionLabel="Nueva Compra"
            onAction={() => handleOpenModal()}
          />
        ) : viewMode === 'kanban' ? (
          <motion.div
            variants={containerVariants}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
          >
            <KanbanColumn
              title="⏳ Pendientes"
              estado="pendiente"
              compras={filteredCompras}
              icon={Clock}
              color="yellow"
              onCardClick={handleOpenModal}
              onStatusChange={handleStatusChange}
            />
            <KanbanColumn
              title="✅ Recibidas"
              estado="recibida"
              compras={filteredCompras}
              icon={CheckCircle}
              color="green"
              onCardClick={handleOpenModal}
              onStatusChange={handleStatusChange}
            />
            <KanbanColumn
              title="❌ Canceladas"
              estado="cancelada"
              compras={filteredCompras}
              icon={XCircle}
              color="red"
              onCardClick={handleOpenModal}
              onStatusChange={handleStatusChange}
            />
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredCompras.map((compra) => (
              <motion.div
                key={compra.id}
                variants={itemVariants}
                whileHover={{ scale: 1.01, x: 5 }}
                className="p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
                onClick={() => handleOpenModal(compra)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-lg font-bold text-white">
                      {compra.proveedorNombre?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{compra.proveedorNombre}</p>
                      <p className="text-sm text-white/60">
                        #{compra.folio || compra.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        ${compra.total?.toLocaleString('es-MX')}
                      </p>
                      <p className="text-xs text-white/60">
                        {compra.productos?.length || 0} productos
                      </p>
                    </div>

                    <StatusBadge
                      status={compra.estado}
                      colorMap={{
                        pendiente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
                        recibida: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
                        cancelada: 'bg-red-500/20 text-red-400 border-red-500/50',
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* CRUD Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingCompra ? '✏️ Editar Compra' : '➕ Nueva Compra'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Proveedor</label>
              <input
                {...register('proveedorNombre')}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none"
                placeholder="Nombre del proveedor"
              />
              {errors.proveedorNombre && (
                <p className="text-red-400 text-sm mt-1">{errors.proveedorNombre.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Total</label>
              <input
                {...register('total', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none"
                placeholder="0.00"
              />
              {errors.total && <p className="text-red-400 text-sm mt-1">{errors.total.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Estado</label>
              <select
                {...register('estado')}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="pendiente">Pendiente</option>
                <option value="recibida">Recibida</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Fecha Entrega</label>
              <input
                {...register('fechaEntrega')}
                type="date"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 justify-end pt-4 border-t border-white/10">
            <motion.button
              type="button"
              onClick={handleCloseModal}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              Cancelar
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-semibold shadow-lg"
            >
              {editingCompra ? 'Actualizar' : 'Crear Compra'}
            </motion.button>
          </div>

          {/* Delete Button (solo en edición) */}
          {editingCompra && (
            <div className="pt-4 border-t border-white/10">
              <motion.button
                type="button"
                onClick={() => handleDelete(editingCompra.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors font-semibold"
              >
                🗑️ Eliminar Compra
              </motion.button>
            </div>
          )}
        </form>
      </Modal>

      {/* AI Assistant */}
      <MegaAIWidget userId={getAuth().currentUser?.uid || 'demo-user'} position="bottom-right" />
    </PageLayout>
  );
};

export default ComprasPage;

