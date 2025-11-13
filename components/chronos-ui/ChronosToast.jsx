/**
 * 🍞 CHRONOS TOAST SYSTEM
 * Sistema de notificaciones premium con animaciones
 *
 * Features:
 * - 4 tipos: success, error, warning, info
 * - Auto-dismiss configurable
 * - Animaciones con Framer Motion
 * - Glassmorphism design
 * - Stacking inteligente
 * - Close manual
 */
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';

import { useNotifications } from '../../stores/useChronosStore';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: {
    border: 'border-neon-green/30',
    text: 'text-neon-green',
    bg: 'bg-neon-green/10',
  },
  error: {
    border: 'border-neon-red/30',
    text: 'text-neon-red',
    bg: 'bg-neon-red/10',
  },
  warning: {
    border: 'border-neon-yellow/30',
    text: 'text-neon-yellow',
    bg: 'bg-neon-yellow/10',
  },
  info: {
    border: 'border-neon-cyan/30',
    text: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
  },
};

// ============================================================================
// COMPONENTE TOAST INDIVIDUAL
// ============================================================================

function ChronosToast({ toast, onClose }) {
  const Icon = iconMap[toast.type];
  const colors = colorMap[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`
        relative overflow-hidden
        bg-chronos-dark/90 backdrop-blur-xl
        border ${colors.border}
        rounded-xl shadow-2xl
        p-4 min-w-[320px] max-w-md
        ${colors.bg}
      `}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 ${colors.bg} opacity-20 blur-xl`} />

      {/* Content */}
      <div className="relative flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 mt-0.5 ${colors.text}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white text-sm mb-1 leading-tight">{toast.title}</h4>
          {toast.message && (
            <p className="text-sm text-chronos-silver leading-snug">{toast.message}</p>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={() => onClose(toast.id)}
          className="flex-shrink-0 text-chronos-silver hover:text-white transition-colors duration-200 p-1 hover:bg-white/10 rounded"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar (si tiene duration) */}
      {toast.duration > 0 && (
        <motion.div
          className={`absolute bottom-0 left-0 h-1 ${colors.bg}`}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
}

// ============================================================================
// CONTENEDOR DE TOASTS
// ============================================================================

export function ChronosToastContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => (
            <ChronosToast key={notification.id} toast={notification} onClose={removeNotification} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORTAR
// ============================================================================

export default ChronosToastContainer;
