/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS DATA VISUALIZATION                              ║
 * ║              Premium Charts with Recharts & Glassmorphism                  ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Componentes de visualización de datos premium:
 * - LineChart (gráfico de líneas)
 * - BarChart (gráfico de barras)
 * - PieChart (gráfico circular)
 * - AreaChart (gráfico de área)
 *
 * Todos con glassmorphism, animaciones y tooltips personalizados.
 *
 * @module DataVisualization
 * @author CHRONOS System
 * @version 1.0.0
 */
import PropTypes from 'prop-types';
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  AreaChart as RechartsAreaChart,
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import tokens from '../../utils/design-tokens.js';

// ============================================================================
// UTILITIES
// ============================================================================

const cn = (...classes) => classes.filter(Boolean).join(' ');

// Colores predefinidos para gráficos
const CHART_COLORS = [
  tokens.colors.chronos.blue,
  tokens.colors.chronos.cyan,
  tokens.colors.chronos.teal,
  tokens.colors.success,
  tokens.colors.warning,
  tokens.colors.danger,
  tokens.colors.info,
];

// ============================================================================
// CUSTOM TOOLTIP
// ============================================================================

/**
 * CustomTooltip - Tooltip personalizado para gráficos
 */
const CustomTooltip = ({ active, payload, label, valuePrefix = '', valueSuffix = '' }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="px-4 py-3 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-white/20 shadow-2xl">
      <p className="text-sm font-semibold text-white mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-white/70">{entry.name}:</span>
          <span className="font-semibold text-white">
            {valuePrefix}
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            {valueSuffix}
          </span>
        </div>
      ))}
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
  valuePrefix: PropTypes.string,
  valueSuffix: PropTypes.string,
};

// ============================================================================
// LINE CHART
// ============================================================================

/**
 * LineChart - Gráfico de líneas premium
 */
export const LineChart = ({
  data = [],
  lines = [],
  xAxisKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = true,
  valuePrefix = '',
  valueSuffix = '',
  className = '',
}) => {
  return (
    <div
      className={cn(
        'p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10',
        className
      )}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />}
          <XAxis
            dataKey={xAxisKey}
            stroke="rgba(255, 255, 255, 0.5)"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="rgba(255, 255, 255, 0.5)" style={{ fontSize: '12px' }} />
          <Tooltip
            content={<CustomTooltip valuePrefix={valuePrefix} valueSuffix={valueSuffix} />}
          />
          {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />}
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color || CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

LineChart.propTypes = {
  data: PropTypes.array.isRequired,
  lines: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.string,
    })
  ).isRequired,
  xAxisKey: PropTypes.string,
  height: PropTypes.number,
  showGrid: PropTypes.bool,
  showLegend: PropTypes.bool,
  valuePrefix: PropTypes.string,
  valueSuffix: PropTypes.string,
  className: PropTypes.string,
};

// ============================================================================
// BAR CHART
// ============================================================================

/**
 * BarChart - Gráfico de barras premium
 */
export const BarChart = ({
  data = [],
  bars = [],
  xAxisKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = true,
  valuePrefix = '',
  valueSuffix = '',
  stacked = false,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10',
        className
      )}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />}
          <XAxis
            dataKey={xAxisKey}
            stroke="rgba(255, 255, 255, 0.5)"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="rgba(255, 255, 255, 0.5)" style={{ fontSize: '12px' }} />
          <Tooltip
            content={<CustomTooltip valuePrefix={valuePrefix} valueSuffix={valueSuffix} />}
          />
          {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="square" />}
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color || CHART_COLORS[index % CHART_COLORS.length]}
              stackId={stacked ? 'stack' : undefined}
              radius={[8, 8, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

BarChart.propTypes = {
  data: PropTypes.array.isRequired,
  bars: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.string,
    })
  ).isRequired,
  xAxisKey: PropTypes.string,
  height: PropTypes.number,
  showGrid: PropTypes.bool,
  showLegend: PropTypes.bool,
  valuePrefix: PropTypes.string,
  valueSuffix: PropTypes.string,
  stacked: PropTypes.bool,
  className: PropTypes.string,
};

// ============================================================================
// PIE CHART
// ============================================================================

/**
 * CustomPieLabel - Label personalizado para PieChart
 */
const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-sm font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

CustomPieLabel.propTypes = {
  cx: PropTypes.number,
  cy: PropTypes.number,
  midAngle: PropTypes.number,
  innerRadius: PropTypes.number,
  outerRadius: PropTypes.number,
  percent: PropTypes.number,
};

/**
 * PieChart - Gráfico circular premium
 */
export const PieChart = ({
  data = [],
  nameKey = 'name',
  valueKey = 'value',
  height = 300,
  showLegend = true,
  showLabels = true,
  valuePrefix = '',
  valueSuffix = '',
  innerRadius = 0,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10',
        className
      )}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            nameKey={nameKey}
            dataKey={valueKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={innerRadius > 0 ? innerRadius + 60 : 80}
            paddingAngle={2}
            label={showLabels ? CustomPieLabel : false}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            content={<CustomTooltip valuePrefix={valuePrefix} valueSuffix={valueSuffix} />}
          />
          {showLegend && <Legend verticalAlign="bottom" height={36} iconType="circle" />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

PieChart.propTypes = {
  data: PropTypes.array.isRequired,
  nameKey: PropTypes.string,
  valueKey: PropTypes.string,
  height: PropTypes.number,
  showLegend: PropTypes.bool,
  showLabels: PropTypes.bool,
  valuePrefix: PropTypes.string,
  valueSuffix: PropTypes.string,
  innerRadius: PropTypes.number,
  className: PropTypes.string,
};

// ============================================================================
// AREA CHART
// ============================================================================

/**
 * AreaChart - Gráfico de área premium
 */
export const AreaChart = ({
  data = [],
  areas = [],
  xAxisKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = true,
  valuePrefix = '',
  valueSuffix = '',
  stacked = false,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10',
        className
      )}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />}
          <XAxis
            dataKey={xAxisKey}
            stroke="rgba(255, 255, 255, 0.5)"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="rgba(255, 255, 255, 0.5)" style={{ fontSize: '12px' }} />
          <Tooltip
            content={<CustomTooltip valuePrefix={valuePrefix} valueSuffix={valueSuffix} />}
          />
          {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="square" />}
          {areas.map((area, index) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name}
              stroke={area.color || CHART_COLORS[index % CHART_COLORS.length]}
              fill={area.color || CHART_COLORS[index % CHART_COLORS.length]}
              fillOpacity={0.3}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

AreaChart.propTypes = {
  data: PropTypes.array.isRequired,
  areas: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.string,
    })
  ).isRequired,
  xAxisKey: PropTypes.string,
  height: PropTypes.number,
  showGrid: PropTypes.bool,
  showLegend: PropTypes.bool,
  valuePrefix: PropTypes.string,
  valueSuffix: PropTypes.string,
  stacked: PropTypes.bool,
  className: PropTypes.string,
};

// ============================================================================
// STAT CARD (Bonus Component)
// ============================================================================

/**
 * StatCard - Tarjeta de estadística con gráfico pequeño
 */
export const StatCard = ({
  title,
  value,
  change,
  changeType = 'increase',
  icon,
  sparklineData = [],
  valuePrefix = '',
  valueSuffix = '',
  className = '',
}) => {
  const changeColor = changeType === 'increase' ? 'text-green-400' : 'text-red-400';
  const changeIcon = changeType === 'increase' ? '↑' : '↓';

  return (
    <div
      className={cn(
        'p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10',
        'hover:border-[#667eea]/50 transition-all duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-white/60 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">
            {valuePrefix}
            {value}
            {valueSuffix}
          </p>
          {change !== undefined && (
            <p className={cn('text-sm font-semibold mt-1', changeColor)}>
              {changeIcon} {change}%
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2]">{icon}</div>
        )}
      </div>

      {sparklineData.length > 0 && (
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsAreaChart data={sparklineData}>
              <Area
                type="monotone"
                dataKey="value"
                stroke={tokens.colors.chronos.blue}
                fill={tokens.colors.chronos.blue}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RechartsAreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  change: PropTypes.number,
  changeType: PropTypes.oneOf(['increase', 'decrease']),
  icon: PropTypes.node,
  sparklineData: PropTypes.array,
  valuePrefix: PropTypes.string,
  valueSuffix: PropTypes.string,
  className: PropTypes.string,
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  StatCard,
};
