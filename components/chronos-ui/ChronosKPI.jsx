import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * ChronosKPI Component
 *
 * Componente premium para mostrar KPIs con tendencias, íconos y animaciones.
 * Sigue el diseño CHRONOS con glassmorphism y variantes de color.
 *
 * @example
 * ```jsx
 * <ChronosKPI
 *   label="Ventas del Mes"
 *   value={156000}
 *   format="currency"
 *   trend={12.5}
 *   color="green"
 *   icon={TrendingUp}
 *   size="lg"
 * />
 * ```
 *
 * @example KPI con porcentaje
 * ```jsx
 * <ChronosKPI
 *   label="Tasa de Conversión"
 *   value={68.5}
 *   format="percentage"
 *   trend={-3.2}
 *   color="yellow"
 * />
 * ```
 */
const ChronosKPI = ({
  label,
  value,
  format = 'number',
  trend = null,
  color = 'cyan',
  icon: Icon = null,
  size = 'md',
  className = '',
  pulse = false,
}) => {
  /**
   * Formatea el valor según el tipo
   */
  const formatValue = (val) => {
    if (val === null || val === undefined) return '—';

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
        }).format(val);

      case 'percentage':
        return `${val.toFixed(1)}%`;

      case 'number':
        return new Intl.NumberFormat('es-MX').format(val);

      default:
        return val.toString();
    }
  };

  /**
   * Determina si la tendencia es positiva, negativa o neutra
   */
  const trendDirection =
    trend === null ? 'neutral' : trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral';

  /**
   * Colores según variante
   */
  const colorClasses = {
    cyan: {
      border: 'border-neon-cyan/30',
      bg: 'bg-neon-cyan/10',
      text: 'text-neon-cyan',
      glow: 'shadow-neon-cyan/20',
    },
    purple: {
      border: 'border-neon-purple/30',
      bg: 'bg-neon-purple/10',
      text: 'text-neon-purple',
      glow: 'shadow-neon-purple/20',
    },
    green: {
      border: 'border-neon-green/30',
      bg: 'bg-neon-green/10',
      text: 'text-neon-green',
      glow: 'shadow-neon-green/20',
    },
    yellow: {
      border: 'border-neon-yellow/30',
      bg: 'bg-neon-yellow/10',
      text: 'text-neon-yellow',
      glow: 'shadow-neon-yellow/20',
    },
    red: {
      border: 'border-neon-red/30',
      bg: 'bg-neon-red/10',
      text: 'text-neon-red',
      glow: 'shadow-neon-red/20',
    },
  };

  /**
   * Tamaños
   */
  const sizeClasses = {
    sm: {
      container: 'p-4',
      label: 'text-xs',
      value: 'text-2xl',
      icon: 'w-8 h-8',
      iconSize: 16,
      trend: 'text-xs',
    },
    md: {
      container: 'p-6',
      label: 'text-sm',
      value: 'text-3xl',
      icon: 'w-12 h-12',
      iconSize: 20,
      trend: 'text-sm',
    },
    lg: {
      container: 'p-8',
      label: 'text-base',
      value: 'text-4xl',
      icon: 'w-16 h-16',
      iconSize: 24,
      trend: 'text-base',
    },
  };

  const colors = colorClasses[color] || colorClasses.cyan;
  const sizes = sizeClasses[size] || sizeClasses.md;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-2xl border ${colors.border} ${colors.bg} backdrop-blur-xl shadow-2xl ${colors.glow} ${sizes.container} ${className}`}
    >
      {/* Gradiente de fondo */}
      <div className={`absolute inset-0 bg-gradient-to-br from-${color}/5 via-transparent to-${color}/10 pointer-events-none`} />

      {/* Contenido */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        {/* Info */}
        <div className="flex-1">
          {/* Label */}
          <p className={`${sizes.label} text-gray-400 mb-2 uppercase tracking-wider`}>
            {label}
          </p>

          {/* Value */}
          <motion.p
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={`${sizes.value} font-bold ${colors.text} mb-2`}
          >
            {formatValue(value)}
          </motion.p>

          {/* Trend */}
          {trend !== null && (
            <div className="flex items-center gap-2">
              {trendDirection === 'up' && (
                <TrendingUp className={`${sizes.trend} text-neon-green`} size={16} />
              )}
              {trendDirection === 'down' && (
                <TrendingDown className={`${sizes.trend} text-neon-red`} size={16} />
              )}
              <span
                className={`${sizes.trend} font-semibold ${
                  trendDirection === 'up'
                    ? 'text-neon-green'
                    : trendDirection === 'down'
                    ? 'text-neon-red'
                    : 'text-gray-400'
                }`}
              >
                {trend > 0 ? '+' : ''}
                {trend.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`flex-shrink-0 ${sizes.icon} rounded-full ${colors.bg} ${colors.border} border-2 flex items-center justify-center ${
              pulse ? 'animate-pulse' : ''
            }`}
          >
            <Icon className={colors.text} size={sizes.iconSize} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

ChronosKPI.propTypes = {
  /** Etiqueta del KPI */
  label: PropTypes.string.isRequired,
  /** Valor numérico del KPI */
  value: PropTypes.number.isRequired,
  /** Formato del valor: 'number', 'currency', 'percentage' */
  format: PropTypes.oneOf(['number', 'currency', 'percentage']),
  /** Tendencia en porcentaje (positivo/negativo) */
  trend: PropTypes.number,
  /** Variante de color */
  color: PropTypes.oneOf(['cyan', 'purple', 'green', 'yellow', 'red']),
  /** Ícono de Lucide React */
  icon: PropTypes.elementType,
  /** Tamaño del KPI */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Clases CSS adicionales */
  className: PropTypes.string,
  /** Activar animación de pulso */
  pulse: PropTypes.bool,
};

export default ChronosKPI;
