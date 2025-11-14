/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                        CHRONOS ULTRA SIDEBAR                               ║
 * ║        Sidebar Premium con Submenu y Animaciones Avanzadas                ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react';
import PropTypes from 'prop-types';

// ============================================================================
// NAVIGATION ITEMS
// ============================================================================

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/',
    badge: null,
  },
  {
    id: 'ventas',
    label: 'Ventas',
    icon: ShoppingCart,
    path: '/ventas',
    badge: '24',
    submenu: [
      { id: 'ventas-lista', label: 'Lista de Ventas', path: '/ventas' },
      { id: 'ventas-nueva', label: 'Nueva Venta', path: '/ventas/nueva' },
      { id: 'ventas-cotizaciones', label: 'Cotizaciones', path: '/ventas/cotizaciones' },
    ],
  },
  {
    id: 'compras',
    label: 'Compras',
    icon: Package,
    path: '/compras',
    submenu: [
      { id: 'compras-lista', label: 'Lista de Compras', path: '/compras' },
      { id: 'compras-nueva', label: 'Nueva Compra', path: '/compras/nueva' },
    ],
  },
  {
    id: 'inventario',
    label: 'Inventario',
    icon: Package,
    path: '/inventario',
    badge: '!',
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: Users,
    path: '/clientes',
  },
  {
    id: 'bancos',
    label: 'Bancos',
    icon: DollarSign,
    path: '/bancos',
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: BarChart3,
    path: '/reportes',
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: Settings,
    path: '/configuracion',
  },
];

// ============================================================================
// ULTRA SIDEBAR COMPONENT
// ============================================================================

export default function UltraSidebar({ onCollapse }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const location = useLocation();

  // Persistir estado en localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
    if (onCollapse) onCollapse(newState);
  };

  const toggleSubmenu = (itemId) => {
    setOpenSubmenu(openSubmenu === itemId ? null : itemId);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Sidebar Container */}
      <motion.aside
        className="fixed left-0 top-0 h-screen bg-white/10 backdrop-blur-xl border-r border-white/20 z-40"
        animate={{
          width: isCollapsed ? '80px' : '280px',
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      >
        {/* Logo & Brand */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  C
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">CHRONOS</h1>
                  <p className="text-xs text-gray-400">Sistema Premium</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapse Button */}
          <motion.button
            onClick={toggleCollapse}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="py-4 px-2">
          {navigationItems.map((item) => (
            <NavigationItem
              key={item.id}
              item={item}
              isCollapsed={isCollapsed}
              isActive={isActive(item.path)}
              isSubmenuOpen={openSubmenu === item.id}
              onSubmenuToggle={() => toggleSubmenu(item.id)}
            />
          ))}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Admin User</p>
                  <p className="text-xs text-gray-400">admin@chronos.com</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-orange-500"
              />
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Spacer para contenido */}
      <motion.div
        animate={{
          width: isCollapsed ? '80px' : '280px',
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      />
    </>
  );
}

UltraSidebar.propTypes = {
  onCollapse: PropTypes.func,
};

// ============================================================================
// NAVIGATION ITEM
// ============================================================================

function NavigationItem({ item, isCollapsed, isActive, isSubmenuOpen, onSubmenuToggle }) {
  const Icon = item.icon;
  const hasSubmenu = item.submenu && item.submenu.length > 0;

  return (
    <div className="mb-1">
      {/* Main Item */}
      <Link to={item.path}>
        <motion.div
          className={`
            flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer
            transition-all duration-200
            ${
              isActive
                ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-white'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }
          `}
          whileHover={{ x: 4 }}
          onClick={(e) => {
            if (hasSubmenu) {
              e.preventDefault();
              onSubmenuToggle();
            }
          }}
        >
          <Icon size={20} />

          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 flex items-center justify-between"
              >
                <span className="text-sm font-medium">{item.label}</span>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span
                      className={`
                        px-2 py-0.5 rounded-full text-xs font-bold
                        ${
                          item.badge === '!'
                            ? 'bg-red-500 text-white'
                            : 'bg-blue-500/20 text-blue-300'
                        }
                      `}
                    >
                      {item.badge}
                    </span>
                  )}

                  {hasSubmenu && (
                    <motion.div
                      animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Link>

      {/* Submenu */}
      {hasSubmenu && !isCollapsed && (
        <AnimatePresence>
          {isSubmenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pl-9 pt-1 space-y-1">
                {item.submenu.map((subitem) => (
                  <Link key={subitem.id} to={subitem.path}>
                    <motion.div
                      className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      {subitem.label}
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

NavigationItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    path: PropTypes.string.isRequired,
    badge: PropTypes.string,
    submenu: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
  isSubmenuOpen: PropTypes.bool.isRequired,
  onSubmenuToggle: PropTypes.func.isRequired,
};
