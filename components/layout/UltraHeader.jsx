/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                        CHRONOS ULTRA HEADER                                ║
 * ║         Header Premium con Búsqueda Global y Notificaciones                ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { useEffect, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Command, LogOut, Menu, Moon, Search, Settings, Sun, User, X } from 'lucide-react';
import PropTypes from 'prop-types';

// ============================================================================
// ULTRA HEADER COMPONENT
// ============================================================================

export default function UltraHeader({ onMenuToggle }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const searchRef = useRef(null);

  // Cmd+K para abrir búsqueda
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus en input al abrir
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const notifications = [
    {
      id: 1,
      title: 'Nueva venta registrada',
      message: 'Cliente: Juan Pérez - $1,200.00',
      time: 'Hace 5 min',
      unread: true,
    },
    {
      id: 2,
      title: 'Inventario bajo',
      message: 'Producto "Laptop HP" con solo 3 unidades',
      time: 'Hace 1 hora',
      unread: true,
    },
    {
      id: 3,
      title: 'Pago recibido',
      message: 'Transferencia de $5,000.00 en Banco BBVA',
      time: 'Hace 2 horas',
      unread: false,
    },
  ];

  return (
    <>
      <motion.header
        className="fixed top-0 right-0 left-0 h-16 bg-white/10 backdrop-blur-xl border-b border-white/20 z-30"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-between h-full px-6">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <motion.button
              onClick={onMenuToggle}
              className="lg:hidden w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu size={20} />
            </motion.button>

            {/* Search Button */}
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
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <motion.button
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </motion.button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {notificationsOpen && (
                  <NotificationsDropdown
                    notifications={notifications}
                    onClose={() => setNotificationsOpen(false)}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative">
              <motion.button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-orange-500" />
                <span className="hidden md:inline text-sm font-medium">Admin</span>
              </motion.button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {profileOpen && <ProfileDropdown onClose={() => setProfileOpen(false)} />}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Global Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <GlobalSearchModal
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onClose={() => setSearchOpen(false)}
            searchRef={searchRef}
          />
        )}
      </AnimatePresence>

      {/* Header Spacer */}
      <div className="h-16" />
    </>
  );
}

UltraHeader.propTypes = {
  onMenuToggle: PropTypes.func,
};

// ============================================================================
// GLOBAL SEARCH MODAL
// ============================================================================

function GlobalSearchModal({ query, onQueryChange, onClose, searchRef }) {
  const results = [
    { type: 'Venta', title: 'Venta #1234', subtitle: 'Juan Pérez - $1,200.00' },
    { type: 'Cliente', title: 'Juan Pérez', subtitle: 'juan@example.com' },
    { type: 'Producto', title: 'Laptop HP', subtitle: '5 unidades en stock' },
  ];

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
          <Search size={20} className="text-gray-400" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar en CHRONOS..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
          />
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {results.map((result) => (
            <motion.div
              key={`${result.type}-${result.title}`}
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 cursor-pointer"
              whileHover={{ x: 4 }}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {result.type[0]}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{result.title}</p>
                <p className="text-sm text-gray-400">{result.subtitle}</p>
              </div>
              <span className="px-2 py-1 rounded-lg bg-white/10 text-xs text-gray-300">
                {result.type}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 text-xs text-gray-400">
          <div className="flex gap-4">
            <span>↑↓ Navegar</span>
            <span>↵ Seleccionar</span>
            <span>ESC Cerrar</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

GlobalSearchModal.propTypes = {
  query: PropTypes.string.isRequired,
  onQueryChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  searchRef: PropTypes.object.isRequired,
};

// ============================================================================
// NOTIFICATIONS DROPDOWN
// ============================================================================

function NotificationsDropdown({ notifications, onClose }) {
  return (
    <motion.div
      className="absolute right-0 top-12 w-80 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="text-white font-semibold">Notificaciones</h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer ${
              notif.unread ? 'bg-blue-500/10' : ''
            }`}
            whileHover={{ x: 4 }}
          >
            <p className="text-white text-sm font-medium">{notif.title}</p>
            <p className="text-gray-400 text-xs mt-1">{notif.message}</p>
            <p className="text-gray-500 text-xs mt-1">{notif.time}</p>
          </motion.div>
        ))}
      </div>

      <button
        onClick={onClose}
        className="w-full px-4 py-3 text-center text-blue-400 hover:bg-white/5 text-sm font-medium"
      >
        Ver todas
      </button>
    </motion.div>
  );
}

NotificationsDropdown.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      unread: PropTypes.bool,
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
};

// ============================================================================
// PROFILE DROPDOWN
// ============================================================================

function ProfileDropdown({ onClose }) {
  const menuItems = [
    { id: 'profile', icon: User, label: 'Mi Perfil', action: () => {} },
    { id: 'settings', icon: Settings, label: 'Configuración', action: () => {} },
    { id: 'logout', icon: LogOut, label: 'Cerrar Sesión', action: () => {}, danger: true },
  ];

  return (
    <motion.div
      className="absolute right-0 top-12 w-56 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <motion.button
            key={item.id}
            onClick={() => {
              item.action();
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 ${
              item.danger ? 'text-red-400' : 'text-white'
            }`}
            whileHover={{ x: 4 }}
          >
            <Icon size={18} />
            <span className="text-sm">{item.label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

ProfileDropdown.propTypes = {
  onClose: PropTypes.func.isRequired,
};
