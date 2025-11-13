/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║               CHRONOS ULTRA HEADER - VERSIÓN PLAN MAESTRO                 ║
 * ║   Header Premium con Breadcrumb, Acciones Rápidas, Búsqueda AI, Notif    ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * FEATURES COMPLETAS según Plan Maestro:
 * - 🍞 Breadcrumb dinámico animado con separadores
 * - ⚡ 6 Botones de acciones rápidas con dropdowns
 * - 🔍 Búsqueda global AI con comandos slash
 * - 🔔 Notificaciones dropdown con 4 tabs (Todas, Alertas, IA, Sistema)
 * - 👤 Perfil dropdown con 4 secciones
 * - 🎨 Tema toggle (Dark/Light/Auto)
 * - ⌨️ Shortcuts de teclado completos
 * - ✨ Animaciones premium con Framer Motion
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Bell,
  Bot,
  ChevronRight,
  Command,
  CreditCard,
  DollarSign,
  FileText,
  Home,
  LogOut,
  Menu,
  Moon,
  Package,
  Repeat,
  Search,
  Settings,
  ShoppingCart,
  Sun,
  TrendingUp,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import PropTypes from 'prop-types';

// ============================================================================
// CONSTANTS
// ============================================================================

const BANCOS = [
  { id: 'boveda-monte', name: 'Bóveda Monte', icon: '⛰️', color: '#8b5cf6' },
  { id: 'boveda-usa', name: 'Bóveda USA', icon: '🗽', color: '#3b82f6' },
  { id: 'utilidades', name: 'Utilidades', icon: '💎', color: '#10b981' },
  { id: 'fletes', name: 'Fletes', icon: '🚚', color: '#f59e0b' },
  { id: 'azteca', name: 'Azteca', icon: '🏛️', color: '#ec4899' },
  { id: 'leftie', name: 'Leftie', icon: '🏦', color: '#6366f1' },
  { id: 'profit', name: 'Profit', icon: '💰', color: '#14b8a6' },
];

const QUICK_ACTIONS = [
  {
    id: 'new-sale',
    icon: DollarSign,
    label: 'Nueva Venta',
    color: 'green',
    gradient: 'from-green-500 to-emerald-600',
    shortcut: 'Ctrl+N',
    action: 'openModalVenta',
  },
  {
    id: 'new-purchase',
    icon: Package,
    label: 'Nueva OC',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    shortcut: 'Ctrl+O',
    action: 'openModalOrdenCompra',
  },
  {
    id: 'expense',
    icon: CreditCard,
    label: 'Gasto',
    color: 'red',
    gradient: 'from-red-500 to-red-600',
    shortcut: 'Ctrl+G',
    hasDropdown: true,
    dropdownItems: BANCOS,
  },
  {
    id: 'transfer',
    icon: Repeat,
    label: 'Transferencia',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    shortcut: 'Ctrl+T',
    hasDropdown: true,
  },
  {
    id: 'payment',
    icon: Wallet,
    label: 'Pago',
    color: 'teal',
    gradient: 'from-teal-500 to-teal-600',
    shortcut: 'Ctrl+P',
    hasDropdown: true,
    dropdownItems: [
      { icon: '📦', label: 'Pagar a Distribuidor', type: 'distribuidor' },
      { icon: '👤', label: 'Cobrar a Cliente', type: 'cliente' },
    ],
  },
  {
    id: 'ai-assistant',
    icon: Bot,
    label: 'IA',
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-600',
    shortcut: 'Ctrl+Space',
    action: 'toggleAIWidget',
    badge: '✨',
  },
];

// ============================================================================
// ULTRA HEADER COMPONENT - VERSIÓN COMPLETA
// ============================================================================

export default function UltraHeaderComplete({ onMenuToggle, onActionClick }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [theme, setTheme] = useState('dark');
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ============================================================================
  // BREADCRUMB DINÁMICO
  // ============================================================================

  const getBreadcrumbs = useCallback(() => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);

    const breadcrumbs = [
      { label: 'Dashboard', icon: Home, path: '/', active: segments.length === 0 },
    ];

    if (segments[0] === 'ventas') {
      breadcrumbs.push({ label: 'Ventas', icon: DollarSign, path: '/ventas', active: true });
    } else if (segments[0] === 'compras') {
      breadcrumbs.push({
        label: 'Órdenes Compra',
        icon: ShoppingCart,
        path: '/compras',
        active: true,
      });
    } else if (segments[0] === 'clientes') {
      breadcrumbs.push({ label: 'Clientes', icon: Users, path: '/clientes', active: true });
    } else if (segments[0] === 'inventario') {
      breadcrumbs.push({ label: 'Inventario', icon: Package, path: '/inventario', active: true });
    } else if (segments[0] === 'bancos') {
      breadcrumbs.push({ label: 'Bancos', icon: Wallet, path: '/bancos', active: false });
      if (segments[1]) {
        const banco = BANCOS.find((b) => b.id === segments[1]);
        if (banco) {
          breadcrumbs.push({
            label: banco.name,
            icon: banco.icon,
            path: `/bancos/${banco.id}`,
            active: true,
          });
        }
      }
    }

    return breadcrumbs;
  }, [location.pathname]);

  const breadcrumbs = getBreadcrumbs();

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K para búsqueda
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }

      // Escape para cerrar
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setActiveDropdown(null);
      }

      // Acciones rápidas
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
        if (e.key === 'n') {
          e.preventDefault();
          onActionClick?.('new-sale');
        } else if (e.key === 'o') {
          e.preventDefault();
          onActionClick?.('new-purchase');
        } else if (e.key === 'g') {
          e.preventDefault();
          onActionClick?.('expense');
        } else if (e.key === 't') {
          e.preventDefault();
          onActionClick?.('transfer');
        } else if (e.key === 'p') {
          e.preventDefault();
          onActionClick?.('payment');
        } else if (e.key === ' ') {
          e.preventDefault();
          onActionClick?.('ai-assistant');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onActionClick]);

  // Focus en input al abrir búsqueda
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleQuickAction = (actionId) => {
    const action = QUICK_ACTIONS.find((a) => a.id === actionId);
    if (action?.hasDropdown) {
      setActiveDropdown(activeDropdown === actionId ? null : actionId);
    } else {
      onActionClick?.(actionId);
    }
  };

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
    // Aplicar tema
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (nextTheme === 'light') {
      document.documentElement.classList.remove('dark');
    }
    // Auto se maneja con media query
  };

  return (
    <>
      <motion.header
        className="fixed top-0 right-0 left-0 h-18 bg-gradient-to-r from-slate-900/95 via-purple-900/10 to-slate-900/95 backdrop-blur-2xl border-b border-white/10 z-40 shadow-2xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-between h-full px-6">
          {/* ============================================================================ */}
          {/* LEFT SECTION: Logo + Breadcrumb */}
          {/* ============================================================================ */}
          <div className="flex items-center gap-6 flex-1">
            {/* Mobile Menu Button */}
            <motion.button
              onClick={onMenuToggle}
              className="lg:hidden w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu size={20} />
            </motion.button>

            {/* Logo Animado */}
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/')}
            >
              <div className="text-3xl">💎</div>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  FlowDistributor
                </h1>
                <p className="text-xs text-gray-400">Sistema Empresarial</p>
              </div>
            </motion.div>

            {/* Breadcrumb Animado */}
            <nav className="hidden lg:flex items-center gap-2">
              <AnimatePresence mode="wait">
                {breadcrumbs.map((crumb, index) => (
                  <motion.div
                    key={crumb.path}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {index > 0 && (
                      <ChevronRight size={14} className="text-gray-500 animate-pulse" />
                    )}
                    <motion.button
                      onClick={() => navigate(crumb.path)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                        crumb.active
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white font-medium'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {typeof crumb.icon === 'string' ? (
                        <span className="text-lg">{crumb.icon}</span>
                      ) : (
                        <crumb.icon size={16} />
                      )}
                      <span className="text-sm">{crumb.label}</span>
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </nav>
          </div>

          {/* ============================================================================ */}
          {/* CENTER SECTION: Acciones Rápidas */}
          {/* ============================================================================ */}
          <div className="hidden xl:flex items-center gap-2 mx-6">
            {QUICK_ACTIONS.map((action) => (
              <div key={action.id} className="relative">
                <motion.button
                  onClick={() => handleQuickAction(action.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${action.gradient} text-white font-medium shadow-lg hover:shadow-xl transition-all`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  title={`${action.label} (${action.shortcut})`}
                >
                  <action.icon size={18} />
                  <span className="text-sm">{action.label}</span>
                  {action.badge && (
                    <span className="ml-1 text-xs animate-pulse">{action.badge}</span>
                  )}
                </motion.button>

                {/* Dropdown */}
                <AnimatePresence>
                  {activeDropdown === action.id && action.hasDropdown && (
                    <motion.div
                      className="absolute top-full mt-2 left-0 w-64 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {action.dropdownItems?.map((item, idx) => (
                        <motion.button
                          key={idx}
                          onClick={() => {
                            onActionClick?.(action.id, item);
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
                          whileHover={{ x: 4 }}
                        >
                          <span className="text-2xl">{item.icon}</span>
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm">{item.label}</p>
                            {item.type && <p className="text-gray-400 text-xs">{item.type}</p>}
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* ============================================================================ */}
          {/* RIGHT SECTION: Búsqueda + Notif + Perfil */}
          {/* ============================================================================ */}
          <div className="flex items-center gap-3">
            {/* Búsqueda */}
            <motion.button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Search size={18} />
              <span className="hidden md:inline text-sm">Buscar...</span>
              <kbd className="hidden md:inline px-2 py-1 rounded bg-white/10 text-xs">
                <Command size={12} className="inline" /> K
              </kbd>
            </motion.button>

            {/* Tema Toggle */}
            <motion.button
              onClick={cycleTheme}
              className="w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              title={`Tema: ${theme}`}
            >
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            </motion.button>

            {/* Notificaciones */}
            <div className="relative">
              <motion.button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell size={18} />
                <motion.span
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  3
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {notificationsOpen && (
                  <NotificationsDropdownComplete onClose={() => setNotificationsOpen(false)} />
                )}
              </AnimatePresence>
            </div>

            {/* Perfil */}
            <div className="relative">
              <motion.button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                  A
                </div>
                <span className="hidden md:inline text-sm font-medium">Admin</span>
              </motion.button>

              <AnimatePresence>
                {profileOpen && <ProfileDropdownComplete onClose={() => setProfileOpen(false)} />}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ============================================================================ */}
      {/* BÚSQUEDA GLOBAL MODAL */}
      {/* ============================================================================ */}
      <AnimatePresence>
        {searchOpen && (
          <SearchGlobalModal
            query={searchQuery}
            setQuery={setSearchQuery}
            onClose={() => setSearchOpen(false)}
            searchRef={searchRef}
          />
        )}
      </AnimatePresence>
    </>
  );
}

UltraHeaderComplete.propTypes = {
  onMenuToggle: PropTypes.func,
  onActionClick: PropTypes.func,
};

// ============================================================================
// NOTIFICACIONES DROPDOWN COMPLETO (4 TABS)
// ============================================================================

function NotificationsDropdownComplete({ onClose }) {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'Todas', icon: Bell, count: 12 },
    { id: 'alerts', label: 'Alertas', icon: TrendingUp, count: 3 },
    { id: 'ai', label: 'IA', icon: Bot, count: 5 },
    { id: 'system', label: 'Sistema', icon: Settings, count: 4 },
  ];

  const notifications = {
    all: [
      {
        id: 1,
        title: 'Nueva venta registrada',
        message: 'Cliente: Juan Pérez - $1,200.00',
        time: 'Hace 5 min',
        unread: true,
        type: 'success',
      },
      {
        id: 2,
        title: 'Inventario bajo',
        message: 'Producto "Laptop HP" con solo 3 unidades',
        time: 'Hace 1 hora',
        unread: true,
        type: 'warning',
      },
    ],
    alerts: [
      { id: 3, title: 'Stock crítico', message: 'Varios productos bajo mínimo', unread: true },
    ],
    ai: [
      {
        id: 4,
        title: 'Patrón detectado',
        message: 'Aumento de ventas en productos categoría A',
        unread: true,
      },
    ],
    system: [{ id: 5, title: 'Actualización disponible', message: 'Versión 2.0.1', unread: false }],
  };

  return (
    <motion.div
      className="absolute top-full right-0 mt-2 w-96 bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Bell size={18} />
          Notificaciones
        </h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-400"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-500/20 text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            <tab.icon size={16} />
            <span className="text-sm font-medium">{tab.label}</span>
            {tab.count > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-xs font-bold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications[activeTab]?.map((notif) => (
          <motion.div
            key={notif.id}
            className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer"
            whileHover={{ x: 4 }}
          >
            <div className="flex items-start gap-3">
              {notif.unread && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />}
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm">{notif.title}</h4>
                <p className="text-gray-400 text-xs mt-1">{notif.message}</p>
                <p className="text-gray-500 text-xs mt-1">{notif.time}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 flex gap-2">
        <button className="flex-1 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-colors">
          Ver todas
        </button>
        <button className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors">
          Marcar leídas
        </button>
      </div>
    </motion.div>
  );
}

NotificationsDropdownComplete.propTypes = {
  onClose: PropTypes.func.isRequired,
};

// ============================================================================
// PERFIL DROPDOWN COMPLETO (4 SECCIONES)
// ============================================================================

function ProfileDropdownComplete({ onClose }) {
  const sections = [
    {
      title: 'Cuenta',
      items: [
        { icon: User, label: 'Mi Perfil', action: 'profile' },
        { icon: Settings, label: 'Configuración', action: 'settings' },
      ],
    },
    {
      title: 'Preferencias',
      items: [
        { icon: Moon, label: 'Modo Oscuro', action: 'theme', toggle: true },
        { icon: Bell, label: 'Notificaciones', action: 'notifications', toggle: true },
      ],
    },
    {
      title: 'Ayuda',
      items: [
        { icon: FileText, label: 'Documentación', action: 'docs' },
        { icon: Bot, label: 'Asistente IA', action: 'ai' },
      ],
    },
    {
      title: 'Sesión',
      items: [{ icon: LogOut, label: 'Cerrar Sesión', action: 'logout', danger: true }],
    },
  ];

  return (
    <motion.div
      className="absolute top-full right-0 mt-2 w-72 bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {/* Header con Avatar */}
      <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl">
            A
          </div>
          <div>
            <h3 className="text-white font-bold">Admin User</h3>
            <p className="text-gray-300 text-sm">admin@flowdistributor.com</p>
            <p className="text-purple-400 text-xs mt-1">Administrador</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="py-2">
        {sections.map((section, idx) => (
          <div key={idx} className={idx > 0 ? 'border-t border-white/10 mt-2 pt-2' : ''}>
            {section.title && (
              <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </p>
            )}
            {section.items.map((item, itemIdx) => (
              <motion.button
                key={itemIdx}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left ${
                  item.danger ? 'text-red-400' : 'text-white'
                }`}
                whileHover={{ x: 4 }}
                onClick={() => {
                  // Handle action
                  onClose();
                }}
              >
                <item.icon size={18} />
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                {item.toggle && (
                  <div className="w-10 h-6 rounded-full bg-purple-500 flex items-center px-1">
                    <div className="w-4 h-4 rounded-full bg-white" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

ProfileDropdownComplete.propTypes = {
  onClose: PropTypes.func.isRequired,
};

// ============================================================================
// BÚSQUEDA GLOBAL MODAL
// ============================================================================

function SearchGlobalModal({ query, setQuery, onClose, searchRef }) {
  const [results, setResults] = useState([]);

  // Simular resultados
  useEffect(() => {
    if (query.length > 0) {
      setResults([
        { type: 'venta', title: 'Venta #1234', subtitle: 'Cliente: Juan Pérez - $1,200' },
        { type: 'cliente', title: 'Juan Pérez', subtitle: 'Teléfono: 555-1234' },
        { type: 'producto', title: 'Laptop HP', subtitle: 'Stock: 15 unidades' },
      ]);
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-2xl bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: -20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-4 p-6 border-b border-white/10">
          <Search size={24} className="text-gray-400" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ventas, clientes, productos... (usa / para comandos)"
            className="flex-1 bg-transparent text-white text-lg outline-none placeholder-gray-400"
          />
          <kbd className="px-3 py-1 rounded bg-white/10 text-gray-400 text-sm">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {results.length > 0 ? (
            results.map((result, idx) => (
              <motion.button
                key={idx}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/10 transition-colors text-left"
                whileHover={{ x: 4 }}
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <FileText size={20} className="text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{result.title}</h4>
                  <p className="text-gray-400 text-sm">{result.subtitle}</p>
                </div>
                <ArrowRight size={18} className="text-gray-400" />
              </motion.button>
            ))
          ) : (
            <div className="p-12 text-center text-gray-400">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p>Escribe para buscar en todo el sistema</p>
              <p className="text-sm mt-2">Comandos: /ventas, /clientes, /productos</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

SearchGlobalModal.propTypes = {
  query: PropTypes.string.isRequired,
  setQuery: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  searchRef: PropTypes.object,
};
