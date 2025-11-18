/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    SHARED PREMIUM COMPONENTS                               ║
 * ║   Componentes reutilizables épicos para todas las páginas                ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Componentes:
 * - AnimatedStatCard: Stats con CountUp y animaciones
 * - ChartContainer: Wrapper para gráficas con glassmorphism
 * - FilterBar: Barra de filtros mágica con animaciones
 * - PageHeader: Header con título y acciones
 * - LoadingSkeleton: Skeletons premium
 * - EmptyState: Estados vacíos creativos
 */

import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Download, Filter, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import CountUp from 'react-countup';

// ==================== ANIMATION VARIANTS ====================

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

export const cardHoverVariants = {
  hover: {
    scale: 1.02,
    y: -5,
    transition: { type: 'spring', stiffness: 400, damping: 10 },
  },
};

export const scaleVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

// ==================== ANIMATED STAT CARD ====================

export const AnimatedStatCard = ({
  label,
  value,
  format = 'number',
  trend,
  color = 'cyan',
  icon: Icon,
  delay = 0,
  suffix = '',
  prefix = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 100);
    return () => clearTimeout(timer);
  }, [delay]);

  const colorClasses = {
    green: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
    cyan: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
    orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/30',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
    teal: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
    yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30',
    red: 'from-red-500/20 to-red-500/5 border-red-500/30',
  };

  const iconColorClasses = {
    green: 'text-emerald-400',
    cyan: 'text-cyan-400',
    cyan: 'text-blue-400',
    orange: 'text-orange-400',
    blue: 'text-blue-400',
    teal: 'text-cyan-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
  };

  const glowColors = {
    green: 'rgba(16, 185, 129, 0.5)',
    cyan: 'rgba(6, 182, 212, 0.5)',
    cyan: 'rgba(168, 85, 247, 0.5)',
    orange: 'rgba(249, 115, 22, 0.5)',
    blue: 'rgba(59, 130, 246, 0.5)',
    teal: 'rgba(236, 72, 153, 0.5)',
    yellow: 'rgba(234, 179, 8, 0.5)',
    red: 'rgba(239, 68, 68, 0.5)',
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover="hover"
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-xl p-6 group cursor-pointer`}
    >
      {/* Background animated glow */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        initial={false}
      />

      {/* Animated particles background */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full bg-${color}-400`}
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Icon & Trend */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            className={`p-3 rounded-xl bg-black/20 ${iconColorClasses[color]}`}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            {Icon && <Icon className="w-6 h-6" />}
          </motion.div>

          {trend !== undefined && (
            <motion.div
              className={`flex items-center gap-1 text-sm font-semibold ${
                trend >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(trend)}%
            </motion.div>
          )}
        </div>

        {/* Label */}
        <p className="text-sm text-white/60 mb-2 font-medium">{label}</p>

        {/* Value with CountUp */}
        <div className="text-3xl font-bold text-white">
          {isVisible ? (
            <span className="flex items-baseline gap-1">
              {prefix}
              {format === 'currency' ? (
                <>
                  $
                  <CountUp start={0} end={value} duration={2} separator="," decimals={0} />
                </>
              ) : (
                <CountUp start={0} end={value} duration={2} separator="," decimals={0} />
              )}
              {suffix && <span className="text-lg text-white/60">{suffix}</span>}
            </span>
          ) : (
            <span className="text-white/20">0</span>
          )}
        </div>
      </div>

      {/* Animated border on hover */}
      <motion.div
        className="absolute inset-0 border-2 border-transparent rounded-2xl"
        whileHover={{
          borderColor: glowColors[color],
          boxShadow: `0 0 30px ${glowColors[color]}`,
        }}
      />
    </motion.div>
  );
};

// ==================== CHART CONTAINER ====================

export const ChartContainer = ({ title, children, actions, className = '' }) => {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={cardHoverVariants.hover}
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 group ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Chart Content */}
      <div className="relative">
        {children}
      </div>

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1), transparent 70%)',
        }}
      />
    </motion.div>
  );
};

// ==================== PAGE HEADER ====================

export const PageHeader = ({
  title,
  subtitle,
  icon,
  onAction,
  actionLabel = 'Nuevo',
  actionIcon: ActionIcon = Plus
}) => {
  return (
    <motion.div variants={itemVariants} className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {icon && <span className="text-5xl">{icon}</span>}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
          {subtitle && <p className="text-white/60 text-lg">{subtitle}</p>}
        </div>
      </div>

      {onAction && (
        <motion.button
          variants={scaleVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onAction}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-semibold shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all"
        >
          <ActionIcon className="w-5 h-5" />
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

// ==================== FILTER BAR ====================

export const FilterBar = ({
  searchValue,
  onSearchChange,
  onFilterToggle,
  showFilters,
  onExport,
  placeholder = 'Buscar...'
}) => {
  return (
    <motion.div variants={itemVariants} className="flex items-center gap-4 flex-wrap">
      {/* Search */}
      <div className="flex-1 min-w-[300px] relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={onSearchChange}
          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
        />
        {/* Animated underline on focus */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 origin-left"
          initial={{ scaleX: 0 }}
          whileFocus={{ scaleX: 1 }}
        />
      </div>

      {/* Filter Toggle */}
      {onFilterToggle && (
        <motion.button
          variants={scaleVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onFilterToggle}
          className={`px-4 py-3 border rounded-xl text-white hover:bg-white/10 transition-all flex items-center gap-2 ${
            showFilters
              ? 'bg-cyan-500/20 border-cyan-500/50'
              : 'bg-white/5 border-white/10'
          }`}
        >
          <Filter className="w-5 h-5" />
          Filtros
          {showFilters && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 rounded-full bg-cyan-400"
            />
          )}
        </motion.button>
      )}

      {/* Export Button */}
      {onExport && (
        <motion.button
          variants={scaleVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onExport}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Exportar
        </motion.button>
      )}
    </motion.div>
  );
};

// ==================== LOADING SKELETON ====================

export const LoadingSkeleton = ({ type = 'stats', count = 4 }) => {
  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(count)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            className="h-32 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl"
          />
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-3">
        {[...Array(count)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            className="h-16 bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 rounded-xl"
          />
        ))}
      </div>
    );
  }

  return null;
};

// ==================== EMPTY STATE ====================

export const EmptyState = ({
  icon = '📭',
  title = 'No hay datos',
  message = 'Comienza agregando tu primer registro',
  actionLabel,
  onAction
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className="text-8xl mb-6 opacity-50"
      >
        {icon}
      </motion.div>

      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/60 mb-6 text-center max-w-md">{message}</p>

      {onAction && actionLabel && (
        <motion.button
          variants={scaleVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onAction}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-semibold shadow-lg"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

// ==================== STATUS BADGE ====================

export const StatusBadge = ({ status, colorMap }) => {
  const colors = colorMap || {
    pendiente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    activo: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    completado: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    cancelado: 'bg-red-500/20 text-red-400 border-red-500/50',
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
        colors[status] || colors.pendiente
      }`}
    >
      <motion.span
        className="w-1.5 h-1.5 rounded-full bg-current mr-2"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {status}
    </motion.span>
  );
};

// ==================== ACTION BUTTON ====================

export const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary' }) => {
  const variants = {
    primary: 'hover:bg-cyan-500/20 text-cyan-400',
    danger: 'hover:bg-red-500/20 text-red-400',
    warning: 'hover:bg-yellow-500/20 text-yellow-400',
    success: 'hover:bg-emerald-500/20 text-emerald-400',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={label}
      className={`p-2 rounded-lg transition-colors ${variants[variant]}`}
    >
      <Icon className="w-5 h-5" />
    </motion.button>
  );
};

// Export all
export default {
  AnimatedStatCard,
  ChartContainer,
  PageHeader,
  FilterBar,
  LoadingSkeleton,
  EmptyState,
  StatusBadge,
  ActionButton,
  // Variants
  containerVariants,
  itemVariants,
  cardHoverVariants,
  scaleVariants,
};
