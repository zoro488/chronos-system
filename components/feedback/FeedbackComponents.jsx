/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS FEEDBACK COMPONENTS                             ║
 * ║              Toast, Alert, Notification System Premium                     ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Sistema completo de feedback:
 * - Toast (notificaciones temporales)
 * - Alert (alertas inline)
 * - NotificationCenter (centro de notificaciones)
 * - Progress (barra de progreso global)
 *
 * @module FeedbackComponents
 * @author CHRONOS System
 * @version 1.0.0
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';

// ============================================================================
// UTILITIES
// ============================================================================

const cn = (...classes) => classes.filter(Boolean).join(' ');

// ============================================================================
// TOAST SYSTEM
// ============================================================================

const ToastContext = createContext(null);

/**
 * useToast - Hook para mostrar toasts
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

/**
 * ToastProvider - Provider del sistema de toasts
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      success: (message, duration) => showToast(message, 'success', duration),
      error: (message, duration) => showToast(message, 'error', duration),
      warning: (message, duration) => showToast(message, 'warning', duration),
      info: (message, duration) => showToast(message, 'info', duration),
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * ToastContainer - Contenedor de toasts
 */
const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => onRemove(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.array.isRequired,
  onRemove: PropTypes.func.isRequired,
};

/**
 * Toast - Componente individual de toast
 */
const Toast = ({ message, type, onClose }) => {
  const styles = {
    success: 'bg-green-500/20 border-green-500 text-green-400',
    error: 'bg-red-500/20 border-red-500 text-red-400',
    warning: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
    info: 'bg-blue-500/20 border-blue-500 text-blue-400',
  }[type];

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'min-w-[300px] px-4 py-3 rounded-xl backdrop-blur-xl border',
        'flex items-center gap-3 shadow-2xl',
        styles
      )}
    >
      <span className="text-2xl">{icons}</span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
        ✕
      </button>
    </motion.div>
  );
};

Toast.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
  onClose: PropTypes.func.isRequired,
};

// ============================================================================
// ALERT
// ============================================================================

/**
 * Alert - Alerta inline
 */
export const Alert = ({
  children,
  variant = 'info',
  title,
  icon,
  closable = false,
  onClose,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  const styles = {
    success: 'bg-green-500/10 border-green-500/50 text-green-400',
    error: 'bg-red-500/10 border-red-500/50 text-red-400',
    warning: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400',
    info: 'bg-blue-500/10 border-blue-500/50 text-blue-400',
  }[variant];

  const defaultIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }[variant];

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-xl border backdrop-blur-xl',
        'flex items-start gap-3',
        styles,
        className
      )}
    >
      {(icon || defaultIcons) && <span className="text-xl">{icon || defaultIcons}</span>}
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
      {closable && (
        <button onClick={handleClose} className="text-white/50 hover:text-white transition-colors">
          ✕
        </button>
      )}
    </div>
  );
};

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  title: PropTypes.string,
  icon: PropTypes.node,
  closable: PropTypes.bool,
  onClose: PropTypes.func,
  className: PropTypes.string,
};

// ============================================================================
// NOTIFICATION CENTER
// ============================================================================

/**
 * NotificationCenter - Centro de notificaciones
 */
export const NotificationCenter = ({
  notifications = [],
  onMarkAsRead,
  onClearAll,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={cn('relative', className)}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 rounded-2xl bg-gray-900/95 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold text-white">Notificaciones</h3>
              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-[#667eea] hover:text-[#764ba2] transition-colors"
                >
                  Limpiar todo
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-white/50">No hay notificaciones</div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'px-4 py-3 border-b border-white/5',
                      'hover:bg-white/5 transition-colors cursor-pointer',
                      !notification.read && 'bg-white/5'
                    )}
                    onClick={() => onMarkAsRead && onMarkAsRead(notification.id)}
                  >
                    <p className="text-sm text-white font-medium mb-1">{notification.title}</p>
                    <p className="text-xs text-white/60">{notification.message}</p>
                    <p className="text-xs text-white/40 mt-1">{notification.time}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

NotificationCenter.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      read: PropTypes.bool,
    })
  ),
  onMarkAsRead: PropTypes.func,
  onClearAll: PropTypes.func,
  className: PropTypes.string,
};

// ============================================================================
// PROGRESS BAR (Global)
// ============================================================================

/**
 * GlobalProgress - Barra de progreso global
 */
export const GlobalProgress = ({ isLoading, className = '' }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    setProgress(20);
    const timer1 = setTimeout(() => setProgress(50), 100);
    const timer2 = setTimeout(() => setProgress(80), 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isLoading]);

  if (!isLoading && progress === 0) return null;

  return (
    <div className={cn('fixed top-0 left-0 right-0 h-1 bg-transparent z-50', className)}>
      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
        className="h-full bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#f093fb]"
        style={{ boxShadow: '0 0 10px rgba(102, 126, 234, 0.5)' }}
      />
    </div>
  );
};

GlobalProgress.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  className: PropTypes.string,
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  ToastProvider,
  useToast,
  Alert,
  NotificationCenter,
  GlobalProgress,
};
