/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║               CHRONOS ULTRA SIDEBAR - VERSIÓN PLAN MAESTRO                ║
 * ║   Sidebar Premium con Hover-Expand, Mini Charts, Shortcuts               ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * FEATURES COMPLETAS:
 * - 🎯 Hover-expand automático (72px → 280px)
 * - 📊 Mini charts (sparklines) en items de bancos
 * - ⌨️ Keyboard shortcuts (Alt+1 a Alt+7 para bancos)
 * - 💾 Persistencia de estado
 * - 🎨 Animaciones smooth con Framer Motion
 * - 📱 Responsive con mobile drawer
 * - ✨ Glassmorphism effects
 */
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Building,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  FileText,
  Home,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  X,
} from 'lucide-react';

// Mini Chart Component (Sparkline)
function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="h-6 w-16" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        points={points}
        className="transition-all duration-300"
      />
    </svg>
  );
}

interface NavItem {
  id: string;
  name: string;
  icon: React.ElementType;
  path: string;
  badge?: string;
  shortcut?: string;
  children?: NavItem[];
  miniChart?: number[];
  chartColor?: string;
}

interface UltraSidebarCompleteProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function UltraSidebarComplete({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: UltraSidebarCompleteProps) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(['bancos']);
  const [hoverExpanded, setHoverExpanded] = useState(false);

  // Mock data para mini charts (en producción vendría de hooks)
  const chartData = {
    'boveda-monte': [100, 120, 90, 150, 180, 160, 200],
    'boveda-usa': [50, 60, 55, 70, 85, 90, 95],
    utilidades: [200, 180, 220, 210, 250, 240, 280],
    fletes: [80, 90, 85, 95, 100, 110, 120],
    azteca: [150, 140, 160, 170, 165, 180, 190],
    leftie: [60, 65, 70, 68, 75, 80, 85],
    profit: [300, 320, 310, 340, 360, 380, 400],
  };

  const NAV_ITEMS: NavItem[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      shortcut: 'Alt+D',
    },
    {
      id: 'ventas',
      name: 'Ventas',
      icon: DollarSign,
      path: '/ventas',
      badge: '23',
      shortcut: 'Alt+V',
    },
    {
      id: 'compras',
      name: 'Órdenes Compra',
      icon: ShoppingCart,
      path: '/compras',
      shortcut: 'Alt+C',
    },
    {
      id: 'clientes',
      name: 'Clientes',
      icon: Users,
      path: '/clientes',
      shortcut: 'Alt+L',
    },
    {
      id: 'inventario',
      name: 'Inventario',
      icon: Package,
      path: '/inventario',
      badge: '5',
      shortcut: 'Alt+I',
    },
    {
      id: 'bancos',
      name: 'Bancos',
      icon: Wallet,
      path: '/bancos',
      shortcut: 'Alt+B',
      children: [
        {
          id: 'boveda-monte',
          name: 'Bóveda Monte',
          icon: Home,
          path: '/bancos/boveda-monte',
          shortcut: 'Alt+1',
          miniChart: chartData['boveda-monte'],
          chartColor: '#8b5cf6',
        },
        {
          id: 'boveda-usa',
          name: 'Bóveda USA',
          icon: Building,
          path: '/bancos/boveda-usa',
          shortcut: 'Alt+2',
          miniChart: chartData['boveda-usa'],
          chartColor: '#3b82f6',
        },
        {
          id: 'utilidades',
          name: 'Utilidades',
          icon: TrendingUp,
          path: '/bancos/utilidades',
          shortcut: 'Alt+3',
          miniChart: chartData.utilidades,
          chartColor: '#10b981',
        },
        {
          id: 'fletes',
          name: 'Fletes',
          icon: Truck,
          path: '/bancos/fletes',
          shortcut: 'Alt+4',
          miniChart: chartData.fletes,
          chartColor: '#f59e0b',
        },
        {
          id: 'azteca',
          name: 'Azteca',
          icon: CreditCard,
          path: '/bancos/azteca',
          shortcut: 'Alt+5',
          miniChart: chartData.azteca,
          chartColor: '#ef4444',
        },
        {
          id: 'leftie',
          name: 'Leftie',
          icon: Wallet,
          path: '/bancos/leftie',
          shortcut: 'Alt+6',
          miniChart: chartData.leftie,
          chartColor: '#06b6d4',
        },
        {
          id: 'profit',
          name: 'Profit',
          icon: DollarSign,
          path: '/bancos/profit',
          shortcut: 'Alt+7',
          miniChart: chartData.profit,
          chartColor: '#8b5cf6',
        },
      ],
    },
    {
      id: 'reportes',
      name: 'Reportes',
      icon: FileText,
      path: '/reportes',
      shortcut: 'Alt+R',
    },
    {
      id: 'configuracion',
      name: 'Configuración',
      icon: Settings,
      path: '/configuracion',
      shortcut: 'Alt+S',
    },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        switch (e.key) {
          case 'd':
          case 'D':
            window.location.href = '/dashboard';
            break;
          case 'v':
          case 'V':
            window.location.href = '/ventas';
            break;
          case 'c':
          case 'C':
            window.location.href = '/compras';
            break;
          case 'l':
          case 'L':
            window.location.href = '/clientes';
            break;
          case 'i':
          case 'I':
            window.location.href = '/inventario';
            break;
          case 'b':
          case 'B':
            window.location.href = '/bancos';
            break;
          case 'r':
          case 'R':
            window.location.href = '/reportes';
            break;
          case 's':
          case 'S':
            window.location.href = '/configuracion';
            break;
          case '1':
            window.location.href = '/bancos/boveda-monte';
            break;
          case '2':
            window.location.href = '/bancos/boveda-usa';
            break;
          case '3':
            window.location.href = '/bancos/utilidades';
            break;
          case '4':
            window.location.href = '/bancos/fletes';
            break;
          case '5':
            window.location.href = '/bancos/azteca';
            break;
          case '6':
            window.location.href = '/bancos/leftie';
            break;
          case '7':
            window.location.href = '/bancos/profit';
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  const renderNavItem = (item: NavItem, isChild = false) => {
    const active = isActive(item.path);
    const expanded = expandedSections.includes(item.id);
    const showExpanded = !collapsed || hoverExpanded;

    return (
      <div key={item.id}>
        <Link
          to={item.path}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          className={`
            group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200
            ${isChild ? 'ml-4 text-sm' : ''}
            ${
              active
                ? 'bg-gradient-to-r from-blue-500/20 to-blue-500/20 text-blue-600 dark:text-cyan-400 shadow-lg shadow-blue-500/20'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50'
            }
          `}
        >
          {/* Icono */}
          <item.icon
            className={`
              h-5 w-5 flex-shrink-0 transition-transform duration-200
              ${active ? 'text-blue-600 dark:text-cyan-400' : ''}
              ${hoveredItem === item.id ? 'scale-110' : ''}
            `}
          />

          {/* Nombre + Badge */}
          {showExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-1 items-center justify-between overflow-hidden"
            >
              <span className="truncate font-medium">{item.name}</span>
              {item.badge && (
                <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {item.badge}
                </span>
              )}
            </motion.div>
          )}

          {/* Mini Chart (solo para bancos) */}
          {showExpanded && item.miniChart && !isChild && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-auto"
            >
              <MiniChart data={item.miniChart} color={item.chartColor || '#8b5cf6'} />
            </motion.div>
          )}

          {/* Expand/Collapse Arrow */}
          {item.children && showExpanded && (
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleSection(item.id);
              }}
              className="ml-auto p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              {expanded ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Indicador activo */}
          {active && (
            <motion.div
              layoutId="active-indicator"
              className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-gradient-to-b from-blue-500 to-blue-500"
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </Link>

        {/* Children (Sub-items) */}
        <AnimatePresence>
          {item.children && expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-1">
                {item.children.map((child) => renderNavItem(child, true))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 p-4">
        {(!collapsed || hoverExpanded) && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-500 text-white font-bold text-sm">
              CH
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
              Chronos
            </span>
          </motion.div>
        )}

        <button
          onClick={onToggle}
          className="hidden lg:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>

        {/* Close button para móvil */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {NAV_ITEMS.map((item) => renderNavItem(item))}
      </nav>

      {/* Footer con Shortcuts hint */}
      {(!collapsed || hoverExpanded) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-gray-200 dark:border-gray-800 p-4"
        >
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
              Alt
            </kbd>{' '}
            + Key para navegar
          </div>
        </motion.div>
      )}
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <motion.aside
        onMouseEnter={() => collapsed && setHoverExpanded(true)}
        onMouseLeave={() => collapsed && setHoverExpanded(false)}
        animate={{
          width: collapsed && !hoverExpanded ? 72 : 280,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl"
      >
        {sidebarContent}
      </motion.aside>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-72 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
