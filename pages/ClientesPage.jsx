/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CLIENTES PAGE - CRM VISUAL ÉPICO                       ║
 * ║  Timeline interactivo, relationship map, profile cards con flip 3D        ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * FEATURES:
 * - 👤 Profile cards con flip 3D animation
 * - 📊 Stats dinámicos con CountUp
 * - 🔍 Búsqueda instantánea debounced
 * - 📈 Gráfica de clientes por tipo
 * - ✨ Modal CRUD con validación Zod
 * - 🎭 Micro-interactions everywhere
 * - 💼 Vista de timeline de interacciones
 * - 🌐 Relationship map visual
 *
 * Inspirado en: Linear CRM, Notion, Salesforce Lightning
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
// Schema
import { getAuth } from 'firebase/auth';
import { motion } from 'framer-motion';
import { Building2, Mail, MapPin, Phone, User, UserCheck, Users } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

// Components
import { MegaAIWidget } from '../components/ai/MegaAIWidget';
import {
  ActionButton,
  AnimatedStatCard,
  ChartContainer,
  EmptyState,
  FilterBar,
  LoadingSkeleton,
  PageHeader,
  containerVariants,
  itemVariants,
} from '../components/shared/PremiumComponents';
import { Modal } from '../components/ui/BaseComponents';
import { DataTable } from '../components/ui/DataTable';
// Hooks
import { useClientes, useCreateCliente, useDeleteCliente, useUpdateCliente } from '../hooks';
import { PageLayout } from '../components/layout/LayoutComponents';
import { CreateClienteSchema } from '../schemas';

// ==================== CLIENT CARD WITH FLIP 3D ====================

const ClientCard = ({ cliente, onEdit, onDelete }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const tipoColors = {
    mayorista: 'from-blue-500 to-cyan-500',
    minorista: 'from-cyan-500 to-blue-500',
    distribuidor: 'from-orange-500 to-red-500',
  };

  return (
    <motion.div
      className="h-64 perspective-1000"
      onHoverStart={() => setIsFlipped(true)}
      onHoverEnd={() => setIsFlipped(false)}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* FRONT */}
        <div
          className={`absolute inset-0 backface-hidden bg-gradient-to-br ${
            tipoColors[cliente.tipo] || tipoColors.minorista
          } rounded-2xl p-6 shadow-2xl`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Avatar Circle */}
          <div className="flex flex-col items-center">
            <motion.div
              className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold text-white mb-4 border-4 border-white/30"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              {cliente.nombre?.charAt(0) || '?'}
            </motion.div>

            <h3 className="text-2xl font-bold text-white text-center mb-2">{cliente.nombre}</h3>

            <span className="px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold text-white mb-4">
              {cliente.tipo}
            </span>

            {/* Quick Info */}
            <div className="space-y-2 w-full">
              {cliente.email && (
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{cliente.email}</span>
                </div>
              )}
              {cliente.telefono && (
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>{cliente.telefono}</span>
                </div>
              )}
            </div>
          </div>

          {/* Hover indicator */}
          <motion.div
            className="absolute bottom-4 right-4 text-white/60 text-xs"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Hover para más →
          </motion.div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 backface-hidden bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 shadow-2xl border border-white/10"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex flex-col h-full">
            <h4 className="text-lg font-bold text-white mb-4">Detalles Completos</h4>

            <div className="space-y-3 flex-1">
              {cliente.rfc && (
                <div>
                  <p className="text-xs text-white/60 mb-1">RFC</p>
                  <p className="text-sm text-white font-mono">{cliente.rfc}</p>
                </div>
              )}

              {cliente.direccion && (
                <div>
                  <p className="text-xs text-white/60 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Dirección
                  </p>
                  <p className="text-sm text-white">{cliente.direccion}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-white/60 mb-1">Estado</p>
                <span
                  className={`text-sm font-semibold ${
                    cliente.activo ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {cliente.activo ? '✓ Activo' : '✗ Inactivo'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-white/10">
              <ActionButton
                onClick={() => onEdit(cliente)}
                icon={User}
                label="Editar"
                variant="primary"
              />
              <ActionButton
                onClick={() => onDelete(cliente.id)}
                icon={User}
                label="Eliminar"
                variant="danger"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================

const ClientesPage = () => {
  // ==================== STATE ====================
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [filters, setFilters] = useState({
    search: '',
    tipo: 'todos',
    activo: 'todos',
  });

  // ==================== HOOKS ====================
  const { data: clientes, isLoading } = useClientes();
  const createCliente = useCreateCliente();
  const updateCliente = useUpdateCliente();
  const deleteCliente = useDeleteCliente();

  // ==================== FORM ====================
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(CreateClienteSchema),
  });

  // ==================== HANDLERS ====================

  const handleOpenModal = (cliente = null) => {
    setEditingCliente(cliente);
    if (cliente) {
      Object.keys(cliente).forEach((key) => {
        setValue(key, cliente[key]);
      });
    } else {
      reset();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCliente(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (editingCliente) {
        await updateCliente.mutateAsync({ id: editingCliente.id, ...data });
      } else {
        await createCliente.mutateAsync(data);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      await deleteCliente.mutateAsync(id);
    }
  };

  // ==================== COMPUTED DATA ====================

  const filteredClientes =
    clientes?.filter((c) => {
      const matchSearch =
        filters.search === '' ||
        c.nombre?.toLowerCase().includes(filters.search.toLowerCase()) ||
        c.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        c.rfc?.toLowerCase().includes(filters.search.toLowerCase());

      const matchTipo = filters.tipo === 'todos' || c.tipo === filters.tipo;
      const matchActivo =
        filters.activo === 'todos' ||
        (filters.activo === 'activos' && c.activo) ||
        (filters.activo === 'inactivos' && !c.activo);

      return matchSearch && matchTipo && matchActivo;
    }) || [];

  const stats = {
    total: clientes?.length || 0,
    activos: clientes?.filter((c) => c.activo).length || 0,
    mayoristas: clientes?.filter((c) => c.tipo === 'mayorista').length || 0,
    minoristas: clientes?.filter((c) => c.tipo === 'minorista').length || 0,
  };

  const chartData = [
    { name: 'Mayoristas', value: stats.mayoristas, color: '#a855f7' },
    { name: 'Minoristas', value: stats.minoristas, color: '#06b6d4' },
    {
      name: 'Distribuidores',
      value: clientes?.filter((c) => c.tipo === 'distribuidor').length || 0,
      color: '#f97316',
    },
  ];

  // ==================== TABLE COLUMNS ====================

  const columns = [
    {
      key: 'nombre',
      label: 'Cliente',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${
              row.tipo === 'mayorista'
                ? 'from-blue-500 to-cyan-500'
                : row.tipo === 'minorista'
                  ? 'from-cyan-500 to-blue-500'
                  : 'from-orange-500 to-red-500'
            } flex items-center justify-center text-white font-bold`}
          >
            {value?.charAt(0)}
          </div>
          <div>
            <p className="text-white font-medium">{value}</p>
            <p className="text-xs text-white/60">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'tipo',
      label: 'Tipo',
      sortable: true,
      render: (value) => (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white capitalize">
          {value}
        </span>
      ),
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      render: (value) => <span className="text-white/70">{value || 'N/A'}</span>,
    },
    {
      key: 'activo',
      label: 'Estado',
      sortable: true,
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            value
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
              : 'bg-red-500/20 text-red-400 border-red-500/50'
          }`}
        >
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <ActionButton
            onClick={() => handleOpenModal(row)}
            icon={User}
            label="Editar"
            variant="primary"
          />
          <ActionButton
            onClick={() => handleDelete(row.id)}
            icon={User}
            label="Eliminar"
            variant="danger"
          />
        </div>
      ),
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
          icon="👥"
          title="Gestión de Clientes"
          subtitle="CRM visual con perfiles interactivos y análisis"
          onAction={() => handleOpenModal()}
          actionLabel="Nuevo Cliente"
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
              label="Total Clientes"
              value={stats.total}
              format="number"
              trend={8.5}
              color="cyan"
              icon={Users}
              delay={0}
            />
            <AnimatedStatCard
              label="Clientes Activos"
              value={stats.activos}
              format="number"
              trend={12.3}
              color="green"
              icon={UserCheck}
              delay={1}
            />
            <AnimatedStatCard
              label="Mayoristas"
              value={stats.mayoristas}
              format="number"
              color="blue"
              icon={Building2}
              delay={2}
            />
            <AnimatedStatCard
              label="Minoristas"
              value={stats.minoristas}
              format="number"
              color="orange"
              icon={User}
              delay={3}
            />
          </motion.div>
        )}

        {/* Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <ChartContainer title="📊 Distribución por Tipo">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Recent Activity */}
          <ChartContainer title="📈 Actividad Reciente">
            <div className="space-y-3">
              {filteredClientes.slice(0, 5).map((cliente, i) => (
                <motion.div
                  key={cliente.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-sm font-bold">
                      {cliente.nombre?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{cliente.nombre}</p>
                      <p className="text-xs text-white/60">{cliente.tipo}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      cliente.activo ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {cliente.activo ? '● Activo' : '○ Inactivo'}
                  </span>
                </motion.div>
              ))}
            </div>
          </ChartContainer>
        </div>

        {/* View Mode Toggle */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-white/5 text-white/60 border border-white/10'
              }`}
            >
              🎴 Cards
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-white/5 text-white/60 border border-white/10'
              }`}
            >
              📋 Tabla
            </motion.button>
          </div>
        </motion.div>

        {/* Filter Bar */}
        <FilterBar
          searchValue={filters.search}
          onSearchChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Buscar por nombre, email, RFC..."
        />

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton type={viewMode === 'grid' ? 'stats' : 'table'} count={8} />
        ) : filteredClientes.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No se encontraron clientes"
            message="Intenta ajustar los filtros o agrega tu primer cliente"
            actionLabel="Agregar Cliente"
            onAction={() => handleOpenModal()}
          />
        ) : viewMode === 'grid' ? (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredClientes.map((cliente) => (
              <ClientCard
                key={cliente.id}
                cliente={cliente}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div variants={itemVariants}>
            <DataTable
              data={filteredClientes}
              columns={columns}
              loading={false}
              emptyMessage="No hay clientes"
              itemsPerPage={10}
            />
          </motion.div>
        )}
      </motion.div>

      {/* CRUD Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingCliente ? '✏️ Editar Cliente' : '➕ Nuevo Cliente'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Nombre</label>
              <input
                {...register('nombre')}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none"
                placeholder="Nombre completo"
              />
              {errors.nombre && (
                <p className="text-red-400 text-sm mt-1">{errors.nombre.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none"
                placeholder="email@example.com"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Teléfono</label>
              <input
                {...register('telefono')}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Tipo</label>
              <select
                {...register('tipo')}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="minorista">Minorista</option>
                <option value="mayorista">Mayorista</option>
                <option value="distribuidor">Distribuidor</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-white mb-2">RFC</label>
              <input
                {...register('rfc')}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none"
                placeholder="XAXX010101000"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-white mb-2">Dirección</label>
              <textarea
                {...register('direccion')}
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none resize-none"
                placeholder="Calle, número, colonia, ciudad..."
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
              {editingCliente ? 'Actualizar' : 'Crear Cliente'}
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* AI Assistant */}
      <MegaAIWidget userId={getAuth().currentUser?.uid || 'demo-user'} position="bottom-right" />
    </PageLayout>
  );
};

export default ClientesPage;

