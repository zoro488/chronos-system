/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║              PREDEFINED REPORTS - 20 REPORTES PREDEFINIDOS                ║
 * ║   Reportes listos para usar en 5 categorías                              ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import {
  AlertCircle,
  BarChart3,
  Bot,
  DollarSign,
  FileText,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';

export const REPORT_CATEGORIES = {
  FINANCIEROS: 'Financieros',
  OPERACIONALES: 'Operacionales',
  COMERCIALES: 'Comerciales',
  COMPRAS: 'Compras',
  IA: 'Inteligencia Artificial',
};

export const PREDEFINED_REPORTS = [
  // ===== FINANCIEROS (5) =====
  {
    id: 'estado-resultados',
    category: REPORT_CATEGORIES.FINANCIEROS,
    name: 'Estado de Resultados',
    description: 'Ingresos, gastos, utilidad neta del período',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-600',
    metrics: ['Ingresos Totales', 'Gastos Totales', 'Utilidad Bruta', 'Utilidad Neta', 'Margen'],
    period: '30days',
    visualization: 'combined',
  },
  {
    id: 'flujo-efectivo',
    category: REPORT_CATEGORIES.FINANCIEROS,
    name: 'Flujo de Efectivo',
    description: 'Movimientos de efectivo en todos los bancos',
    icon: TrendingUp,
    color: 'from-blue-500 to-cyan-600',
    metrics: ['Entradas', 'Salidas', 'Saldo Inicial', 'Saldo Final', 'Variación'],
    period: '30days',
    visualization: 'chart',
  },
  {
    id: 'balance-general',
    category: REPORT_CATEGORIES.FINANCIEROS,
    name: 'Balance General',
    description: 'Activos, pasivos y capital',
    icon: BarChart3,
    color: 'from-blue-500 to-cyan-600',
    metrics: ['Activos', 'Pasivos', 'Capital', 'Cuentas por Cobrar', 'Cuentas por Pagar'],
    period: 'today',
    visualization: 'table',
  },
  {
    id: 'rentabilidad',
    category: REPORT_CATEGORIES.FINANCIEROS,
    name: 'Análisis de Rentabilidad',
    description: 'ROI, margen, punto de equilibrio',
    icon: TrendingUp,
    color: 'from-orange-500 to-red-600',
    metrics: ['ROI', 'Margen Bruto', 'Margen Neto', 'EBITDA', 'Punto Equilibrio'],
    period: 'month',
    visualization: 'dashboard',
  },
  {
    id: 'punto-equilibrio',
    category: REPORT_CATEGORIES.FINANCIEROS,
    name: 'Punto de Equilibrio',
    description: 'Análisis de costos fijos vs variables',
    icon: TrendingDown,
    color: 'from-red-500 to-cyan-600',
    metrics: ['Costos Fijos', 'Costos Variables', 'Punto Equilibrio', 'Margen Contribución'],
    period: 'month',
    visualization: 'chart',
  },

  // ===== OPERACIONALES (4) =====
  {
    id: 'movimientos-inventario',
    category: REPORT_CATEGORIES.OPERACIONALES,
    name: 'Movimientos de Inventario',
    description: 'Entradas, salidas y saldos de productos',
    icon: Package,
    color: 'from-blue-600 to-blue-600',
    metrics: ['Entradas', 'Salidas', 'Stock Actual', 'Valor Inventario', 'Productos Críticos'],
    period: '30days',
    visualization: 'combined',
  },
  {
    id: 'analisis-abc',
    category: REPORT_CATEGORIES.OPERACIONALES,
    name: 'Análisis ABC',
    description: 'Clasificación de productos por importancia',
    icon: BarChart3,
    color: 'from-green-500 to-teal-600',
    metrics: ['Productos A', 'Productos B', 'Productos C', 'Valor Ventas', 'Rotación'],
    period: 'month',
    visualization: 'chart',
  },
  {
    id: 'rotacion-inventario',
    category: REPORT_CATEGORIES.OPERACIONALES,
    name: 'Rotación de Inventario',
    description: 'Velocidad de movimiento de productos',
    icon: TrendingUp,
    color: 'from-cyan-500 to-blue-600',
    metrics: ['Rotación', 'Días Inventario', 'Productos Rápidos', 'Productos Lentos'],
    period: 'month',
    visualization: 'table',
  },
  {
    id: 'mermas-perdidas',
    category: REPORT_CATEGORIES.OPERACIONALES,
    name: 'Mermas y Pérdidas',
    description: 'Análisis de productos dañados o perdidos',
    icon: AlertCircle,
    color: 'from-red-500 to-orange-600',
    metrics: ['Mermas', 'Valor Pérdidas', 'Productos Afectados', 'Causas', 'Impacto'],
    period: 'month',
    visualization: 'combined',
  },

  // ===== COMERCIALES (4) =====
  {
    id: 'ventas-cliente',
    category: REPORT_CATEGORIES.COMERCIALES,
    name: 'Ventas por Cliente',
    description: 'Desglose de ventas por cada cliente',
    icon: Users,
    color: 'from-blue-500 to-indigo-600',
    metrics: ['Total Ventas', 'Ticket Promedio', 'Frecuencia', 'Productos Preferidos'],
    period: '30days',
    visualization: 'table',
  },
  {
    id: 'ventas-producto',
    category: REPORT_CATEGORIES.COMERCIALES,
    name: 'Ventas por Producto',
    description: 'Rendimiento de cada producto',
    icon: Package,
    color: 'from-blue-500 to-cyan-600',
    metrics: ['Unidades Vendidas', 'Ingresos', 'Margen', 'Rotación', 'Tendencia'],
    period: '30days',
    visualization: 'combined',
  },
  {
    id: 'analisis-precios',
    category: REPORT_CATEGORIES.COMERCIALES,
    name: 'Análisis de Precios',
    description: 'Competitividad y ajustes de precios',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-600',
    metrics: ['Precio Promedio', 'Margen por Producto', 'Elasticidad', 'Competencia'],
    period: 'month',
    visualization: 'chart',
  },
  {
    id: 'cuentas-cobrar',
    category: REPORT_CATEGORIES.COMERCIALES,
    name: 'Cuentas por Cobrar',
    description: 'Seguimiento de pagos pendientes',
    icon: FileText,
    color: 'from-orange-500 to-red-600',
    metrics: ['Total por Cobrar', 'Vencidas', 'Por Vencer', 'Antigüedad Saldos', 'Clientes'],
    period: 'today',
    visualization: 'table',
  },

  // ===== COMPRAS (4) =====
  {
    id: 'compras-distribuidor',
    category: REPORT_CATEGORIES.COMPRAS,
    name: 'Compras por Distribuidor',
    description: 'Análisis de órdenes de compra por proveedor',
    icon: ShoppingCart,
    color: 'from-blue-500 to-blue-600',
    metrics: ['Total Órdenes', 'Monto Total', 'Órdenes Pendientes', 'Tiempo Entrega'],
    period: '30days',
    visualization: 'combined',
  },
  {
    id: 'analisis-costos',
    category: REPORT_CATEGORIES.COMPRAS,
    name: 'Análisis de Costos',
    description: 'Tendencia de costos de productos',
    icon: TrendingDown,
    color: 'from-red-500 to-cyan-600',
    metrics: ['Costo Promedio', 'Variación Costos', 'Productos Caros', 'Oportunidades Ahorro'],
    period: 'month',
    visualization: 'chart',
  },
  {
    id: 'cuentas-pagar',
    category: REPORT_CATEGORIES.COMPRAS,
    name: 'Cuentas por Pagar',
    description: 'Seguimiento de pagos a proveedores',
    icon: FileText,
    color: 'from-orange-500 to-yellow-600',
    metrics: ['Total por Pagar', 'Vencidas', 'Por Vencer', 'Antigüedad', 'Distribuidores'],
    period: 'today',
    visualization: 'table',
  },
  {
    id: 'evaluacion-proveedores',
    category: REPORT_CATEGORIES.COMPRAS,
    name: 'Evaluación de Proveedores',
    description: 'Desempeño de cada proveedor',
    icon: Users,
    color: 'from-green-500 to-teal-600',
    metrics: ['Cumplimiento Entrega', 'Calidad Productos', 'Precios', 'Servicio', 'Score'],
    period: 'month',
    visualization: 'dashboard',
  },

  // ===== IA (4) =====
  {
    id: 'ia-pronosticos',
    category: REPORT_CATEGORIES.IA,
    name: 'Pronósticos IA',
    description: 'Predicciones de ventas y tendencias',
    icon: Bot,
    color: 'from-blue-500 to-blue-600',
    metrics: ['Ventas Proyectadas', 'Demanda Productos', 'Flujo Caja Esperado', 'Confianza'],
    period: '30days',
    visualization: 'chart',
  },
  {
    id: 'ia-patrones',
    category: REPORT_CATEGORIES.IA,
    name: 'Detección de Patrones',
    description: 'Patrones de compra y comportamiento',
    icon: BarChart3,
    color: 'from-blue-600 to-blue-600',
    metrics: ['Patrones Identificados', 'Frecuencia', 'Impacto', 'Correlaciones'],
    period: 'month',
    visualization: 'dashboard',
  },
  {
    id: 'ia-recomendaciones',
    category: REPORT_CATEGORIES.IA,
    name: 'Recomendaciones IA',
    description: 'Sugerencias de optimización',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-600',
    metrics: ['Oportunidades', 'Impacto Potencial', 'Prioridad', 'Acciones Sugeridas'],
    period: 'today',
    visualization: 'table',
  },
  {
    id: 'ia-anomalias',
    category: REPORT_CATEGORIES.IA,
    name: 'Detección de Anomalías',
    description: 'Alertas de datos inusuales',
    icon: AlertCircle,
    color: 'from-red-500 to-orange-600',
    metrics: ['Anomalías Detectadas', 'Severidad', 'Afectados', 'Causa Probable', 'Acciones'],
    period: '7days',
    visualization: 'combined',
  },
];

/**
 * Obtener reportes por categoría
 */
export const getReportsByCategory = (category) => {
  return PREDEFINED_REPORTS.filter((report) => report.category === category);
};

/**
 * Obtener un reporte por ID
 */
export const getReportById = (id) => {
  return PREDEFINED_REPORTS.find((report) => report.id === id);
};

/**
 * Obtener todas las categorías únicas
 */
export const getAllReportCategories = () => {
  return Object.values(REPORT_CATEGORIES);
};

/**
 * Buscar reportes por término
 */
export const searchReports = (query) => {
  const lowerQuery = query.toLowerCase();
  return PREDEFINED_REPORTS.filter(
    (report) =>
      report.name.toLowerCase().includes(lowerQuery) ||
      report.description.toLowerCase().includes(lowerQuery) ||
      report.metrics.some((metric) => metric.toLowerCase().includes(lowerQuery))
  );
};
