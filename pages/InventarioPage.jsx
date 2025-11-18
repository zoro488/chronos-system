/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║               INVENTARIO PAGE - GRID VISUAL CON STOCK ALERTS              ║
 * ║  Gestión visual de inventario con alertas animadas y ajuste rápido       ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * FEATURES:
 * - 🎨 Grid visual con imágenes de productos
 * - ⚠️ Alertas de stock bajo con pulse animation
 * - ⚡ Ajuste rápido inline (sin modal)
 * - 🏷️ Category badges con 3D hover
 * - 📊 Charts de stock y distribución
 * - 🔍 Filtros por categoría y stock
 * - ✨ Modal CRUD para crear/editar
 * - 💰 Valor total del inventario
 *
 * Inspirado en: Shopify, Square, Toast POS
 */
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
// Schema
import { getAuth } from 'firebase/auth';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Archive,
  DollarSign,
  Grid3x3,
  List,
  Minus,
  Package,
  Plus,
  Search,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
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
  LoadingSkeleton,
  PageHeader,
  cardHoverVariants,
  containerVariants,
  itemVariants,
} from '../components/shared/PremiumComponents';
import { Modal } from '../components/ui/BaseComponents';
// Hooks
import {
  useAjusteInventario,
  useCreateProducto,
  useDeleteProducto,
  useProductos,
  useUpdateProducto,
} from '../hooks';
import { PageLayout } from '../components/layout/LayoutComponents';
import { CreateProductoSchema } from '../schemas';

// ==================== CATEGORY BADGE 3D ====================

const CategoryBadge3D = ({ category }) => {
  const categoryColors = {
    Electrónica: 'from-blue-500 to-cyan-500',
    Ropa: 'from-blue-500 to-cyan-500',
    Alimentos: 'from-orange-500 to-red-500',
    Hogar: 'from-green-500 to-emerald-500',
    Juguetes: 'from-yellow-500 to-orange-500',
    Libros: 'from-blue-600 to-blue-500',
    Deportes: 'from-teal-500 to-cyan-500',
    Otro: 'from-gray-500 to-slate-500',
  };

  const gradientClass = categoryColors[category] || categoryColors['Otro'];

  return (
    <motion.div
      whileHover={{ rotateY: 10, rotateX: -5, scale: 1.05 }}
      className="inline-block"
      style={{ perspective: '1000px' }}
    >
      <div
        className={`px-3 py-1 bg-gradient-to-br ${gradientClass} rounded-full text-xs font-bold text-white shadow-lg`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {category}
      </div>
    </motion.div>
  );
};

// ==================== PRODUCT CARD ====================

const ProductCard = ({ producto, onEdit, onAjuste }) => {
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [isAdjusting, setIsAdjusting] = useState(false);

  const isLowStock = producto.stock < (producto.stockMinimo || 10);
  const stockPercentage = Math.min(100, (producto.stock / (producto.stockMinimo || 10)) * 100);

  const handleQuickAdjust = async (delta) => {
    const newAmount = adjustAmount + delta;
    setAdjustAmount(newAmount);
    setIsAdjusting(true);

    // Simular delay de guardado
    setTimeout(() => {
      onAjuste(producto.id, newAmount);
      setAdjustAmount(0);
      setIsAdjusting(false);
    }, 300);
  };

  return (
    <motion.div
      variants={cardHoverVariants}
      whileHover="hover"
      className="relative group bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm"
    >
      {/* Low Stock Alert Badge - PULSING */}
      {isLowStock && (
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-3 right-3 z-10 px-2 py-1 bg-red-500/90 rounded-full flex items-center gap-1 text-white text-xs font-bold shadow-lg"
        >
          <AlertTriangle className="w-3 h-3" />
          BAJO
        </motion.div>
      )}

      {/* Image Placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center overflow-hidden">
        {producto.imagen ? (
          <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
        ) : (
          <Package className="w-20 h-20 text-white/30" />
        )}

        {/* Hover Overlay with Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(producto)}
            className="p-3 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-400 hover:bg-cyan-500/30 transition-colors"
          >
            ✏️
          </motion.button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category Badge */}
        <div className="flex items-center justify-between">
          <CategoryBadge3D category={producto.categoria || 'Otro'} />
          <span className="text-xs text-white/60">
            #{producto.codigo || producto.id.slice(0, 6)}
          </span>
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-white truncate">{producto.nombre}</h3>

        {/* Price & Stock */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-emerald-400">
              ${producto.precio?.toLocaleString('es-MX')}
            </p>
            <p className="text-xs text-white/60">Precio Unitario</p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${isLowStock ? 'text-red-400' : 'text-white'}`}>
              {producto.stock}
            </p>
            <p className="text-xs text-white/60">En Stock</p>
          </div>
        </div>

        {/* Stock Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Stock</span>
            <span>{stockPercentage.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stockPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full ${
                isLowStock
                  ? 'bg-gradient-to-r from-red-500 to-orange-500'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
              }`}
            />
          </div>
        </div>

        {/* Quick Adjust */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleQuickAdjust(-1)}
            className="flex-1 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1"
            disabled={isAdjusting}
          >
            <Minus className="w-4 h-4" />
          </motion.button>

          <div className="flex-1 text-center">
            {adjustAmount !== 0 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-sm font-bold ${
                  adjustAmount > 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {adjustAmount > 0 ? '+' : ''}
                {adjustAmount}
              </motion.span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleQuickAjust(1)}
            className="flex-1 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-1"
            disabled={isAdjusting}
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        style={{
          background: isLowStock
            ? 'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.15), transparent 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.15), transparent 70%)',
        }}
      />
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================

const InventarioPage = () => {
  // ==================== STATE ====================
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    search: '',
    categoria: 'todas',
    stockAlert: false, // Solo mostrar productos con stock bajo
  });

  // ==================== HOOKS ====================
  const { data: productos, isLoading } = useProductos();
  const createProducto = useCreateProducto();
  const updateProducto = useUpdateProducto();
  const deleteProducto = useDeleteProducto();
  const ajusteInventario = useAjusteInventario();

  // ==================== FORM ====================
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(CreateProductoSchema),
  });

  // ==================== HANDLERS ====================

  const handleOpenModal = (producto = null) => {
    setEditingProducto(producto);
    if (producto) {
      Object.keys(producto).forEach((key) => {
        setValue(key, producto[key]);
      });
    } else {
      reset();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProducto(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (editingProducto) {
        await updateProducto.mutateAsync({ id: editingProducto.id, ...data });
      } else {
        await createProducto.mutateAsync(data);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      await deleteProducto.mutateAsync(id);
    }
  };

  const handleAjuste = async (productoId, cantidad) => {
    try {
      await ajusteInventario.mutateAsync({
        productoId,
        cantidad,
        tipo: cantidad > 0 ? 'entrada' : 'salida',
        motivo: 'Ajuste rápido',
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ==================== COMPUTED DATA ====================

  const filteredProductos = useMemo(() => {
    return (
      productos?.filter((p) => {
        const matchSearch =
          filters.search === '' ||
          p.nombre?.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.codigo?.toLowerCase().includes(filters.search.toLowerCase());

        const matchCategoria = filters.categoria === 'todas' || p.categoria === filters.categoria;

        const matchStockAlert = !filters.stockAlert || p.stock < (p.stockMinimo || 10);

        return matchSearch && matchCategoria && matchStockAlert;
      }) || []
    );
  }, [productos, filters]);

  const stats = useMemo(() => {
    const total = productos?.length || 0;
    const lowStock = productos?.filter((p) => p.stock < (p.stockMinimo || 10)).length || 0;
    const valorTotal =
      productos?.reduce((sum, p) => sum + (p.precio || 0) * (p.stock || 0), 0) || 0;
    const unidadesTotales = productos?.reduce((sum, p) => sum + (p.stock || 0), 0) || 0;

    return { total, lowStock, valorTotal, unidadesTotales };
  }, [productos]);

  const categorias = useMemo(() => {
    const cats = productos?.map((p) => p.categoria || 'Otro') || [];
    const unique = [...new Set(cats)];
    return ['todas', ...unique];
  }, [productos]);

  const categoryData = useMemo(() => {
    const counts = {};
    productos?.forEach((p) => {
      const cat = p.categoria || 'Otro';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [productos]);

  const stockLevelsData = useMemo(() => {
    return (
      productos?.slice(0, 10).map((p) => ({
        name: p.nombre?.slice(0, 15) || 'Sin nombre',
        stock: p.stock || 0,
        minimo: p.stockMinimo || 10,
      })) || []
    );
  }, [productos]);

  const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#3b82f6'];

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
          title="Gestión de Inventario"
          subtitle="Control visual con alertas de stock y ajuste rápido"
          onAction={() => handleOpenModal()}
          actionLabel="Nuevo Producto"
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
              label="Total Productos"
              value={stats.total}
              format="number"
              trend={3.2}
              color="blue"
              icon={Package}
              delay={0}
            />
            <AnimatedStatCard
              label="Stock Bajo"
              value={stats.lowStock}
              format="number"
              trend={-8.5}
              color="red"
              icon={AlertTriangle}
              delay={1}
            />
            <AnimatedStatCard
              label="Valor Total"
              value={stats.valorTotal}
              format="currency"
              trend={12.3}
              color="green"
              icon={DollarSign}
              delay={2}
            />
            <AnimatedStatCard
              label="Unidades Totales"
              value={stats.unidadesTotales}
              format="number"
              trend={5.7}
              color="blue"
              icon={Archive}
              delay={3}
            />
          </motion.div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer title="📊 Niveles de Stock">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stockLevelsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="name"
                  stroke="#fff"
                  opacity={0.6}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#fff" opacity={0.6} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="stock" fill="#06b6d4" radius={[8, 8, 0, 0]} name="Stock Actual" />
                <Bar dataKey="minimo" fill="#ef4444" radius={[8, 8, 0, 0]} name="Stock Mínimo" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="🎨 Distribución por Categoría">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Buscar por nombre o código..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-cyan-500/50 focus:outline-none transition-colors"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filters.categoria}
            onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-500/50 focus:outline-none"
          >
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'todas' ? '📁 Todas las categorías' : cat}
              </option>
            ))}
          </select>

          {/* Stock Alert Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilters({ ...filters, stockAlert: !filters.stockAlert })}
            className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              filters.stockAlert
                ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                : 'bg-white/5 text-white/60 border border-white/10'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            Stock Bajo
          </motion.button>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 ml-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-white/5 text-white/60 border border-white/10'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-white/5 text-white/60 border border-white/10'
              }`}
            >
              <List className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton type="table" count={9} />
        ) : filteredProductos.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No hay productos en inventario"
            message={
              filters.search || filters.categoria !== 'todas' || filters.stockAlert
                ? 'Intenta ajustar los filtros'
                : 'Comienza agregando tu primer producto'
            }
            actionLabel="Nuevo Producto"
            onAction={() => handleOpenModal()}
          />
        ) : viewMode === 'grid' ? (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProductos.map((producto) => (
              <ProductCard
                key={producto.id}
                producto={producto}
                onEdit={handleOpenModal}
                onAjuste={handleAjuste}
              />
            ))}
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredProductos.map((producto) => {
              const isLowStock = producto.stock < (producto.stockMinimo || 10);
              return (
                <motion.div
                  key={producto.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01, x: 5 }}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
                  onClick={() => handleOpenModal(producto)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                        {producto.imagen ? (
                          <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-white/30" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold">{producto.nombre}</h3>
                          <CategoryBadge3D category={producto.categoria || 'Otro'} />
                        </div>
                        <p className="text-sm text-white/60">
                          #{producto.codigo || producto.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xl font-bold text-emerald-400">
                          ${producto.precio?.toLocaleString('es-MX')}
                        </p>
                        <p className="text-xs text-white/60">Precio</p>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-2xl font-bold ${
                            isLowStock ? 'text-red-400' : 'text-white'
                          }`}
                        >
                          {producto.stock}
                        </p>
                        <p className="text-xs text-white/60">Stock</p>
                      </div>

                      {isLowStock && (
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.8, 1, 0.8],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                        >
                          <AlertTriangle className="w-6 h-6 text-red-400" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* CRUD Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingProducto ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Nombre</label>
              <input
                {...register('nombre')}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none"
                placeholder="Nombre del producto"
              />
              {errors.nombre && (
                <p className="text-red-400 text-sm mt-1">{errors.nombre.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Código</label>
              <input
                {...register('codigo')}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none"
                placeholder="SKU-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Categoría</label>
              <select
                {...register('categoria')}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="Electrónica">Electrónica</option>
                <option value="Ropa">Ropa</option>
                <option value="Alimentos">Alimentos</option>
                <option value="Hogar">Hogar</option>
                <option value="Juguetes">Juguetes</option>
                <option value="Libros">Libros</option>
                <option value="Deportes">Deportes</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Precio</label>
              <input
                {...register('precio', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none"
                placeholder="0.00"
              />
              {errors.precio && (
                <p className="text-red-400 text-sm mt-1">{errors.precio.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Stock</label>
              <input
                {...register('stock', { valueAsNumber: true })}
                type="number"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none"
                placeholder="0"
              />
              {errors.stock && <p className="text-red-400 text-sm mt-1">{errors.stock.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Stock Mínimo</label>
              <input
                {...register('stockMinimo', { valueAsNumber: true })}
                type="number"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none"
                placeholder="10"
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
              {editingProducto ? 'Actualizar' : 'Crear Producto'}
            </motion.button>
          </div>

          {editingProducto && (
            <div className="pt-4 border-t border-white/10">
              <motion.button
                type="button"
                onClick={() => handleDelete(editingProducto.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors font-semibold"
              >
                🗑️ Eliminar Producto
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

export default InventarioPage;

