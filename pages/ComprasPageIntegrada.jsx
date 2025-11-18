/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║              COMPRAS PAGE INTEGRADA - FLOWDISTRIBUTOR                      ║
 * ║  Página de compras con FormularioOrdenCompra integrado                   ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { AnimatePresence, motion } from 'framer-motion';
import {
    Calendar,
    DollarSign,
    Filter,
    Package,
    Plus,
    ShoppingCart,
    Truck
} from 'lucide-react';
import { useEffect, useState } from 'react';

import FormularioOrdenCompra from '../forms/FormularioOrdenCompra';
import { getOrdenesCompra } from '../services/ordenes-compra.service';

export default function ComprasPageIntegrada() {
  const [ordenesCompra, setOrdenesCompra] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormulario, setShowFormulario] = useState(false);
  const [filtro, setFiltro] = useState('todas'); // todas, pendientes, recibidas

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const cargarOrdenes = async () => {
    setLoading(true);
    try {
      const ordenes = await getOrdenesCompra();
      setOrdenesCompra(ordenes);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const ordenesFiltradas = ordenesCompra.filter((orden) => {
    if (filtro === 'pendientes') return orden.estado === 'pendiente';
    if (filtro === 'recibidas') return orden.estado === 'recibida';
    return true;
  });

  const totalOrdenes = ordenesCompra.length;
  const pendientes = ordenesCompra.filter((o) => o.estado === 'pendiente').length;
  const recibidas = ordenesCompra.filter((o) => o.estado === 'recibida').length;
  const totalMonto = ordenesCompra.reduce((sum, o) => sum + (o.total || 0), 0);

  const handleSuccess = () => {
    setShowFormulario(false);
    cargarOrdenes();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-2xl"
            >
              <ShoppingCart className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Órdenes de Compra
              </h1>
              <p className="text-slate-400 mt-1">Gestión de compras a distribuidores</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFormulario(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/50 hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Nueva Orden
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-5 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-400">Total Órdenes</p>
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{totalOrdenes}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-5 bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 rounded-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-400">Pendientes</p>
              <Truck className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-white">{pendientes}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-5 bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-400">Recibidas</p>
              <Calendar className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">{recibidas}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-5 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-400">Total Invertido</p>
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">${totalMonto.toLocaleString()}</p>
          </motion.div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-5 h-5 text-slate-400" />
          {['todas', 'pendientes', 'recibidas'].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filtro === f
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Órdenes */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-400">Cargando órdenes...</p>
          </div>
        ) : ordenesFiltradas.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">
              {filtro === 'todas' ? 'No hay órdenes aún' : `No hay órdenes ${filtro}`}
            </p>
            <button
              onClick={() => setShowFormulario(true)}
              className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all"
            >
              Crear Primera Orden
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ordenesFiltradas.map((orden) => (
              <motion.div
                key={orden.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-blue-500/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Folio</p>
                    <p className="text-lg font-bold text-white">{orden.folio}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      orden.estado === 'pendiente'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}
                  >
                    {orden.estado}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-500" />
                    <p className="text-sm text-slate-300">{orden.distribuidorNombre}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <p className="text-sm text-slate-400">
                      {new Date(orden.fecha?.toDate?.() || orden.fecha).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Total:</span>
                    <span className="text-xl font-bold text-white">${orden.total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{orden.productos?.length || 0} productos</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal del Formulario */}
      <AnimatePresence>
        {showFormulario && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={() => setShowFormulario(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-6xl my-8"
            >
              <FormularioOrdenCompra
                onSuccess={handleSuccess}
                onCancel={() => setShowFormulario(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
