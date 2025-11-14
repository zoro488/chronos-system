/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    FEEDBACK COMPONENTS - CHRONOS SYSTEM                   ║
 * ║  Componentes de feedback: Alert, Toast, Dialog, Estados vacíos/error      ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle,
    FileQuestion,
    Info,
    Loader2,
    RefreshCw,
    ServerCrash,
    WifiOff,
    X,
    XCircle,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// ALERT COMPONENT
// ============================================================================

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  onClose?: () => void;
  closable?: boolean;
  icon?: React.ReactNode;
  className?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Alert({
  type = 'info',
  title,
  message,
  onClose,
  closable = true,
  icon,
  className,
  action,
}: AlertProps) {
  const typeStyles = {
    info: {
      container: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      icon: 'text-blue-400',
      IconComponent: Info,
    },
    success: {
      container: 'bg-green-500/10 border-green-500/20 text-green-400',
      icon: 'text-green-400',
      IconComponent: CheckCircle,
    },
    warning: {
      container: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
      icon: 'text-yellow-400',
      IconComponent: AlertTriangle,
    },
    error: {
      container: 'bg-red-500/10 border-red-500/20 text-red-400',
      icon: 'text-red-400',
      IconComponent: XCircle,
    },
  };

  const style = typeStyles[type];
  const IconComponent = icon || <style.IconComponent className="h-5 w-5" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'relative rounded-xl border p-4 backdrop-blur-xl',
        style.container,
        className
      )}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn('flex-shrink-0', style.icon)}>
          {IconComponent}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <p className="text-sm opacity-90">{message}</p>

          {/* Action Button */}
          {action && (
            <button
              onClick={action.onClick}
              className="mt-3 text-sm font-medium hover:underline"
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        {closable && onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-lg p-1 hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// CONFIRM DIALOG COMPONENT
// ============================================================================

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'success' | 'warning' | 'danger';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info',
  loading = false,
}: ConfirmDialogProps) {
  const typeStyles = {
    info: {
      icon: 'bg-blue-500/20 text-blue-400',
      button: 'bg-blue-500 hover:bg-blue-600',
      IconComponent: Info,
    },
    success: {
      icon: 'bg-green-500/20 text-green-400',
      button: 'bg-green-500 hover:bg-green-600',
      IconComponent: CheckCircle,
    },
    warning: {
      icon: 'bg-yellow-500/20 text-yellow-400',
      button: 'bg-yellow-500 hover:bg-yellow-600',
      IconComponent: AlertTriangle,
    },
    danger: {
      icon: 'bg-red-500/20 text-red-400',
      button: 'bg-red-500 hover:bg-red-600',
      IconComponent: AlertCircle,
    },
  };

  const style = typeStyles[type];
  const IconComponent = style.IconComponent;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-2xl bg-slate-900 p-6 shadow-2xl border border-white/10"
            >
              {/* Icon */}
              <div className={cn('mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full', style.icon)}>
                <IconComponent className="h-6 w-6" />
              </div>

              {/* Title */}
              <h3 className="mb-2 text-center text-xl font-bold text-white">
                {title}
              </h3>

              {/* Message */}
              <p className="mb-6 text-center text-gray-400">
                {message}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 rounded-xl bg-white/10 px-4 py-2.5 font-medium text-white hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={cn(
                    'flex-1 rounded-xl px-4 py-2.5 font-medium text-white transition-colors disabled:opacity-50',
                    style.button
                  )}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando...
                    </div>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {/* Icon */}
      {icon ? (
        <div className="mb-4 text-gray-500">
          {icon}
        </div>
      ) : (
        <FileQuestion className="mb-4 h-16 w-16 text-gray-500" />
      )}

      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold text-white">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="mb-6 max-w-sm text-gray-400">
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2.5 font-medium text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 transition-all"
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// ERROR STATE COMPONENT
// ============================================================================

interface ErrorStateProps {
  error?: Error | string;
  title?: string;
  description?: string;
  onRetry?: () => void;
  type?: 'generic' | 'network' | 'server' | 'notfound';
  className?: string;
}

export function ErrorState({
  error,
  title,
  description,
  onRetry,
  type = 'generic',
  className,
}: ErrorStateProps) {
  const typeConfig = {
    generic: {
      icon: <AlertCircle className="h-16 w-16 text-red-400" />,
      title: title || 'Error',
      description: description || 'Ha ocurrido un error inesperado',
    },
    network: {
      icon: <WifiOff className="h-16 w-16 text-orange-400" />,
      title: title || 'Sin conexión',
      description: description || 'Verifica tu conexión a internet',
    },
    server: {
      icon: <ServerCrash className="h-16 w-16 text-red-400" />,
      title: title || 'Error del servidor',
      description: description || 'El servidor no está disponible',
    },
    notfound: {
      icon: <FileQuestion className="h-16 w-16 text-gray-500" />,
      title: title || 'No encontrado',
      description: description || 'El recurso solicitado no existe',
    },
  };

  const config = typeConfig[type];
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {/* Icon */}
      <div className="mb-4">
        {config.icon}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold text-white">
        {config.title}
      </h3>

      {/* Description */}
      <p className="mb-4 max-w-sm text-gray-400">
        {config.description}
      </p>

      {/* Error Details (solo en desarrollo) */}
      {import.meta.env.DEV && errorMessage && (
        <div className="mb-6 max-w-md rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-left">
          <p className="text-xs font-mono text-red-400 break-all">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Retry Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-6 py-2.5 font-medium text-white transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}

// ============================================================================
// LOADING STATE COMPONENT
// ============================================================================

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullscreen?: boolean;
  className?: string;
}

export function LoadingState({
  message = 'Cargando...',
  size = 'md',
  fullscreen = false,
  className,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      {/* Spinner */}
      <div className="relative">
        <div className={cn('rounded-full border-4 border-blue-500/20', sizeClasses[size])} />
        <motion.div
          className={cn('absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent', sizeClasses[size])}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Message */}
      {message && (
        <p className="text-gray-400">{message}</p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900/20 via-slate-900 to-slate-950">
        {content}
      </div>
    );
  }

  return (
    <div className="flex min-h-[200px] items-center justify-center py-8">
      {content}
    </div>
  );
}

// ============================================================================
// SKELETON LOADER COMPONENT
// ============================================================================

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style = {
    width: width,
    height: height,
  };

  const skeletonElement = (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%]',
        variantClasses[variant],
        className
      )}
      style={style}
    />
  );

  if (count === 1) {
    return skeletonElement;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{skeletonElement}</div>
      ))}
    </div>
  );
}

// ============================================================================
// PROGRESS BAR COMPONENT
// ============================================================================

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'cyan' | 'blue' | 'green' | 'yellow' | 'red';
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = 'md',
  color = 'blue',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    cyan: 'from-cyan-500 via-blue-500 to-cyan-500',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-orange-500',
    red: 'from-red-500 to-cyan-500',
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Label and Percentage */}
      {(label || showPercentage) && (
        <div className="mb-2 flex items-center justify-between text-sm">
          {label && <span className="text-gray-400">{label}</span>}
          {showPercentage && (
            <span className="font-medium text-white">{percentage.toFixed(0)}%</span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className={cn('overflow-hidden rounded-full bg-white/10', sizeClasses[size])}>
        <motion.div
          className={cn('h-full bg-gradient-to-r', colorClasses[color])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// BADGE COMPONENT
// ============================================================================

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-white/10 text-gray-300',
    primary: 'bg-blue-500/20 text-purple-300 border-blue-500/30',
    success: 'bg-green-500/20 text-green-300 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    error: 'bg-red-500/20 text-red-300 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border backdrop-blur-xl',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}
