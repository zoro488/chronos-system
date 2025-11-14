/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                CHRONOS SYSTEM - SISTEMA COMPLETO INTEGRADO                 ║
 * ║  Dashboard principal con navegación a todos los módulos del sistema        ║
 * ║  7 Módulos: Dashboard, Ventas, Compras, Almacén, Clientes, Distribuidores, Bancos ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  DollarSign,
  FileText,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Upload,
  UserCircle,
  Users,
  Warehouse,
} from 'lucide-react';

// Importar utilidades
import { migrarDatosCompletos, verificarMigracion } from '../../utils/migracion-firestore';
// Importar páginas de módulos
import BancosPageComplete from './BancosPageComplete';
import ClientesPage from './ClientesPage';
import ComprasPageIntegrada from './ComprasPageIntegrada';
// ✅ Usar la versión con formularios premium
import InventarioPage from './InventarioPage';
import MasterDashboard from './MasterDashboard';
import VentasPage from './VentasPage';

// ==================== MÓDULOS DEL SISTEMA ====================

const MODULOS = [
  {
    id: 'dashboard',
    nombre: 'Dashboard Principal',
    icon: LayoutDashboard,
    descripcion: 'Vista general del sistema',
    color: 'from-blue-500 to-cyan-500',
    component: MasterDashboard,
  },
  {
    id: 'ventas',
    nombre: 'Ventas',
    icon: ShoppingCart,
    descripcion: 'Gestión de ventas y clientes',
    color: 'from-green-500 to-emerald-500',
    component: VentasPage,
  },
  {
    id: 'compras',
    nombre: 'Órdenes de Compra',
    icon: FileText,
    descripcion: 'Órdenes de compra y distribuidores',
    color: 'from-blue-500 to-cyan-500',
    component: ComprasPageIntegrada, // ✅ Con formularios premium
  },
  {
    id: 'almacen',
    nombre: 'Almacén',
    icon: Warehouse,
    descripcion: 'Control de inventario y stock',
    color: 'from-orange-500 to-red-500',
    component: InventarioPage,
  },
  {
    id: 'clientes',
    nombre: 'Clientes',
    icon: Users,
    descripcion: 'Gestión de clientes y adeudos',
    color: 'from-cyan-500 to-blue-500',
    component: ClientesPage,
  },
  {
    id: 'distribuidores',
    nombre: 'Distribuidores',
    icon: Building2,
    descripcion: 'Proveedores y pagos',
    color: 'from-indigo-500 to-blue-500',
    component: ComprasPageIntegrada, // ✅ Mismo componente de compras con formularios premium
  },
  {
    id: 'bancos',
    nombre: 'Bancos',
    icon: DollarSign,
    descripcion: 'Gestión de 6 bancos principales',
    color: 'from-yellow-500 to-orange-500',
    component: BancosPageComplete,
  },
];

// ==================== COMPONENTE PRINCIPAL ====================

export default function FlowDistributorPage() {
  const [moduloActivo, setModuloActivo] = useState('dashboard');
  const [menuAbierto, setMenuAbierto] = useState(true);
  const [migracionEnProceso, setMigracionEnProceso] = useState(false);
  const [estadoMigracion, setEstadoMigracion] = useState(null);

  const ModuloComponente = MODULOS.find((m) => m.id === moduloActivo)?.component;

  // Verificar estado de migración al cargar
  useState(() => {
    verificarMigracion().then(setEstadoMigracion);
  }, []);

  // Ejecutar migración de datos
  const ejecutarMigracion = async () => {
    if (
      confirm(
        '¿Está seguro de ejecutar la migración de datos? Esto creará todos los registros en Firestore.'
      )
    ) {
      setMigracionEnProceso(true);
      try {
        const resultado = await migrarDatosCompletos();
        alert(
          `✅ Migración completada:\n- Bancos: ${resultado.bancos}\n- Ventas: ${resultado.ventas}\n- Clientes: ${resultado.clientes}`
        );
        const nuevoEstado = await verificarMigracion();
        setEstadoMigracion(nuevoEstado);
      } catch (error) {
        alert(`❌ Error en migración: ${error.message}`);
      } finally {
        setMigracionEnProceso(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header Principal */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-[1920px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <LayoutDashboard className="w-6 h-6 text-cyan-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Chronos System
              </h1>
              <p className="text-sm text-slate-400">Sistema Integral de Gestión Empresarial</p>
            </div>
          </div>

          {/* Botón de Migración */}
          <div className="flex items-center gap-4">
            {estadoMigracion && !estadoMigracion.migrado && (
              <button
                onClick={ejecutarMigracion}
                disabled={migracionEnProceso}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {migracionEnProceso ? 'Migrando...' : 'Migrar Datos'}
              </button>
            )}

            {estadoMigracion?.migrado && (
              <div className="text-sm text-green-400 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Datos migrados correctamente
              </div>
            )}

            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <UserCircle className="w-6 h-6 text-slate-400" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Settings className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        {/* Sidebar de Navegación */}
        <AnimatePresence mode="wait">
          {menuAbierto && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-80 bg-slate-900/50 backdrop-blur-xl border-r border-white/10 p-6 space-y-2 overflow-y-auto"
              style={{ height: 'calc(100vh - 73px)' }}
            >
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-2">Módulos</h2>
                <p className="text-sm text-slate-400">Seleccione un módulo para comenzar</p>
              </div>

              {MODULOS.map((modulo) => {
                const Icon = modulo.icon;
                const activo = moduloActivo === modulo.id;

                return (
                  <motion.button
                    key={modulo.id}
                    onClick={() => setModuloActivo(modulo.id)}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full flex items-start gap-4 p-4 rounded-xl transition-all
                      ${
                        activo
                          ? `bg-gradient-to-r ${modulo.color} text-white shadow-lg`
                          : 'bg-white/5 hover:bg-white/10 text-slate-300'
                      }
                    `}
                  >
                    <div
                      className={`
                      p-2 rounded-lg
                      ${activo ? 'bg-white/20' : 'bg-white/10'}
                    `}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-sm">{modulo.nombre}</h3>
                      <p className={`text-xs mt-1 ${activo ? 'text-white/80' : 'text-slate-400'}`}>
                        {modulo.descripcion}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Contenido Principal */}
        <main className="flex-1 overflow-auto" style={{ height: 'calc(100vh - 73px)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={moduloActivo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              {ModuloComponente ? (
                <ModuloComponente />
              ) : (
                <div className="text-center py-20">
                  <p className="text-slate-400">Módulo en construcción</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
