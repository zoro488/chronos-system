/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                 DATA VISUALIZATION COMPONENTS - CHRONOS                   ║
 * ║  Componentes para visualización de datos: Métricas, Charts, Stats        ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { motion } from 'framer-motion';
import {
    ArrowDown,
    ArrowUp,
    DollarSign,
    Minus,
    Package,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Line,
    LineChart,
    ResponsiveContainer
} from 'recharts';
import { cn } from '../../utils/cn';

// ============================================================================
// METRIC CARD COMPONENT
// ============================================================================

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'cyan' | 'blue' | 'green' | 'yellow' | 'red' | 'teal';
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend,
  color = 'blue',
  loading = false,
  className,
  onClick,
}: MetricCardProps) {
  const colorClasses = {
    cyan: {
      bg: 'from-cyan-500/20 to-blue-500/20',
      border: 'border-cyan-500/30',
      icon: 'bg-cyan-500/20 text-cyan-400',
      glow: 'shadow-cyan-500/20',
    },
    blue: {
      bg: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/30',
      icon: 'bg-blue-500/20 text-blue-400',
      glow: 'shadow-blue-500/20',
    },
    green: {
      bg: 'from-green-500/20 to-emerald-500/20',
      border: 'border-green-500/30',
      icon: 'bg-green-500/20 text-green-400',
      glow: 'shadow-green-500/20',
    },
    yellow: {
      bg: 'from-yellow-500/20 to-orange-500/20',
      border: 'border-yellow-500/30',
      icon: 'bg-yellow-500/20 text-yellow-400',
      glow: 'shadow-yellow-500/20',
    },
    red: {
      bg: 'from-red-500/20 to-cyan-500/20',
      border: 'border-red-500/30',
      icon: 'bg-red-500/20 text-red-400',
      glow: 'shadow-red-500/20',
    },
    teal: {
      bg: 'from-teal-500/20 to-cyan-500/20',
      border: 'border-teal-500/30',
      icon: 'bg-teal-500/20 text-teal-400',
      glow: 'shadow-teal-500/20',
    },
  };

  const colors = colorClasses[color];

  // Auto-detect trend si no se especifica
  const autoTrend = trend || (change ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : 'neutral');

  const trendConfig = {
    up: {
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    down: {
      icon: <TrendingDown className="h-4 w-4" />,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    neutral: {
      icon: <Minus className="h-4 w-4" />,
      color: 'text-gray-400',
      bg: 'bg-gray-500/10',
    },
  };

  const trendStyle = trendConfig[autoTrend];

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02, y: -2 } : undefined}
      className={cn(
        'relative overflow-hidden rounded-2xl border backdrop-blur-xl',
        `bg-gradient-to-br ${colors.bg}`,
        colors.border,
        `shadow-lg ${colors.glow}`,
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px]" />

      <div className="relative p-6">
        <div className="flex items-start justify-between">
          {/* Content */}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-400 mb-2">
              {title}
            </p>

            {loading ? (
              <div className="h-8 w-32 animate-pulse rounded bg-white/10" />
            ) : (
              <h3 className="text-3xl font-bold text-white mb-3">
                {value}
              </h3>
            )}

            {/* Change Indicator */}
            {change !== undefined && !loading && (
              <div className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1', trendStyle.bg)}>
                <span className={trendStyle.color}>
                  {trendStyle.icon}
                </span>
                <span className={cn('text-sm font-medium', trendStyle.color)}>
                  {change > 0 && '+'}{change}%
                </span>
                {changeLabel && (
                  <span className="text-sm text-gray-400">
                    {changeLabel}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Icon */}
          {icon && (
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', colors.icon)}>
              {icon}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// STATS GRID COMPONENT
// ============================================================================

interface Stat {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: MetricCardProps['color'];
}

interface StatsGridProps {
  stats: Stat[];
  columns?: 2 | 3 | 4;
  loading?: boolean;
  className?: string;
}

export function StatsGrid({
  stats,
  columns = 4,
  loading = false,
  className,
}: StatsGridProps) {
  const columnClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', columnClasses[columns], className)}>
      {stats.map((stat, index) => (
        <MetricCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          color={stat.color}
          loading={loading}
        />
      ))}
    </div>
  );
}

// ============================================================================
// TREND INDICATOR COMPONENT
// ============================================================================

interface TrendIndicatorProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showIcon?: boolean;
  className?: string;
}

export function TrendIndicator({
  value,
  size = 'md',
  showValue = true,
  showIcon = true,
  className,
}: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium',
        isPositive && 'text-green-400',
        !isPositive && !isNeutral && 'text-red-400',
        isNeutral && 'text-gray-400',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && !isNeutral && (
        isPositive ? (
          <ArrowUp className={iconSizeClasses[size]} />
        ) : (
          <ArrowDown className={iconSizeClasses[size]} />
        )
      )}
      {showValue && (
        <>
          {isPositive && '+'}
          {value}%
        </>
      )}
    </span>
  );
}

// ============================================================================
// PROGRESS RING COMPONENT
// ============================================================================

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: 'cyan' | 'blue' | 'green' | 'yellow' | 'red';
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = 'blue',
  label,
  showPercentage = true,
  className,
}: ProgressRingProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    cyan: 'stroke-cyan-500',
    blue: 'stroke-blue-500',
    green: 'stroke-green-500',
    yellow: 'stroke-yellow-500',
    red: 'stroke-red-500',
  };

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-white/10"
        />
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={colorClasses[color]}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className="text-2xl font-bold text-white">
            {percentage.toFixed(0)}%
          </span>
        )}
        {label && (
          <span className="text-xs text-gray-400 mt-1">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MINI CHART WRAPPER COMPONENTS
// ============================================================================

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface MiniLineChartProps {
  data: ChartData[];
  dataKey?: string;
  color?: string;
  height?: number;
  className?: string;
}

export function MiniLineChart({
  data,
  dataKey = 'value',
  color = '#a855f7',
  height = 60,
  className,
}: MiniLineChartProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MiniAreaChart({
  data,
  dataKey = 'value',
  color = '#a855f7',
  height = 60,
  className,
}: MiniLineChartProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================================
// EXPORT PRESET ICONS
// ============================================================================

export const MetricIcons = {
  dollar: <DollarSign className="h-6 w-6" />,
  users: <Users className="h-6 w-6" />,
  cart: <ShoppingCart className="h-6 w-6" />,
  package: <Package className="h-6 w-6" />,
  trendingUp: <TrendingUp className="h-6 w-6" />,
  trendingDown: <TrendingDown className="h-6 w-6" />,
};
