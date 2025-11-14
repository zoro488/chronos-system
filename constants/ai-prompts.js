/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    AI PROMPTS - PROMPTS PREDEFINIDOS                      ║
 * ║   15 Prompts inteligentes en 5 categorías para IA                        ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

export const AI_PROMPT_CATEGORIES = {
  ANALISIS: 'Análisis',
  PREDICCIONES: 'Predicciones',
  OPTIMIZACION: 'Optimización',
  REPORTES: 'Reportes',
  AYUDA: 'Ayuda',
};

export const AI_PROMPTS = [
  // ===== CATEGORÍA: ANÁLISIS (3 prompts) =====
  {
    id: 'analisis-ventas-mes',
    category: AI_PROMPT_CATEGORIES.ANALISIS,
    title: 'Analizar Ventas del Mes',
    description: 'Análisis completo de ventas del mes actual vs mes anterior',
    prompt:
      'Analiza las ventas del mes actual comparándolas con el mes anterior. Incluye: tendencias, productos más vendidos, clientes top, y recomendaciones.',
    icon: '📊',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'analisis-inventario',
    category: AI_PROMPT_CATEGORIES.ANALISIS,
    title: 'Estado del Inventario',
    description: 'Análisis de stock, rotación, y productos críticos',
    prompt:
      'Analiza el estado actual del inventario: productos con stock bajo, rotación de inventario, productos sin movimiento, y sugerencias de reabastecimiento.',
    icon: '📦',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'analisis-flujo-caja',
    category: AI_PROMPT_CATEGORIES.ANALISIS,
    title: 'Flujo de Caja',
    description: 'Análisis de ingresos, gastos, y flujo de efectivo',
    prompt:
      'Analiza el flujo de caja de los últimos 30 días: ingresos, gastos por categoría, balance en cada banco, cuentas por cobrar y pagar.',
    icon: '💰',
    color: 'from-blue-500 to-cyan-500',
  },

  // ===== CATEGORÍA: PREDICCIONES (3 prompts) =====
  {
    id: 'predecir-ventas-mes',
    category: AI_PROMPT_CATEGORIES.PREDICCIONES,
    title: 'Proyectar Ventas Próximo Mes',
    description: 'Predicción basada en histórico y tendencias',
    prompt:
      'Proyecta las ventas del próximo mes basándote en el histórico de los últimos 6 meses, tendencias estacionales, y factores externos conocidos.',
    icon: '📈',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'predecir-stock-agotado',
    category: AI_PROMPT_CATEGORIES.PREDICCIONES,
    title: 'Predecir Stock Agotado',
    description: 'Productos que se agotarán pronto',
    prompt:
      'Identifica qué productos se agotarán en los próximos 7 días basándote en la velocidad de venta actual y stock disponible.',
    icon: '⚠️',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'predecir-gastos',
    category: AI_PROMPT_CATEGORIES.PREDICCIONES,
    title: 'Estimar Gastos Próximo Mes',
    description: 'Estimación de gastos operativos',
    prompt:
      'Estima los gastos del próximo mes en cada categoría (nómina, renta, servicios, operativos) basándote en el histórico y gastos recurrentes.',
    icon: '💸',
    color: 'from-blue-500 to-cyan-500',
  },

  // ===== CATEGORÍA: OPTIMIZACIÓN (3 prompts) =====
  {
    id: 'optimizar-rutas',
    category: AI_PROMPT_CATEGORIES.OPTIMIZACION,
    title: 'Optimizar Rutas de Distribución',
    description: 'Reducir costos de fletes y entregas',
    prompt:
      'Analiza las rutas de distribución actuales y sugiere optimizaciones para reducir costos de fletes manteniendo tiempos de entrega.',
    icon: '🚚',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'optimizar-costos',
    category: AI_PROMPT_CATEGORIES.OPTIMIZACION,
    title: 'Reducir Costos Operativos',
    description: 'Identificar oportunidades de ahorro',
    prompt:
      'Identifica oportunidades para reducir costos operativos analizando gastos recurrentes, contratos, y comparando con benchmarks de la industria.',
    icon: '💡',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'optimizar-margenes',
    category: AI_PROMPT_CATEGORIES.OPTIMIZACION,
    title: 'Mejorar Márgenes de Ganancia',
    description: 'Aumentar rentabilidad por producto',
    prompt:
      'Analiza los márgenes de ganancia actuales por producto y sugiere ajustes de precios, negociaciones con proveedores, o eliminación de productos no rentables.',
    icon: '📊',
    color: 'from-green-500 to-emerald-500',
  },

  // ===== CATEGORÍA: REPORTES (3 prompts) =====
  {
    id: 'reporte-financiero',
    category: AI_PROMPT_CATEGORIES.REPORTES,
    title: 'Generar Reporte Financiero',
    description: 'Estado de resultados completo',
    prompt:
      'Genera un reporte financiero completo del último mes: estado de resultados, balance general, flujo de efectivo, y KPIs principales.',
    icon: '📋',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'reporte-clientes-top',
    category: AI_PROMPT_CATEGORIES.REPORTES,
    title: 'Análisis Clientes Top',
    description: 'Top 10 clientes y su comportamiento',
    prompt:
      'Genera un reporte de los top 10 clientes: volumen de compras, frecuencia, ticket promedio, productos preferidos, y tendencias.',
    icon: '👥',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'reporte-estado-bancos',
    category: AI_PROMPT_CATEGORIES.REPORTES,
    title: 'Estado de Todos los Bancos',
    description: 'Resumen de todos los bancos',
    prompt:
      'Genera un reporte consolidado de los 7 bancos: capital actual, movimientos del día, transferencias pendientes, y alertas.',
    icon: '🏦',
    color: 'from-orange-500 to-red-500',
  },

  // ===== CATEGORÍA: AYUDA (3 prompts) =====
  {
    id: 'ayuda-crear-venta',
    category: AI_PROMPT_CATEGORIES.AYUDA,
    title: '¿Cómo Crear una Venta?',
    description: 'Tutorial paso a paso',
    prompt:
      'Explícame paso a paso cómo crear una nueva venta en el sistema, incluyendo cómo seleccionar cliente, productos, método de pago, y confirmar.',
    icon: '❓',
    color: 'from-gray-500 to-gray-600',
  },
  {
    id: 'ayuda-transferir-bancos',
    category: AI_PROMPT_CATEGORIES.AYUDA,
    title: '¿Cómo Transferir Entre Bancos?',
    description: 'Guía de transferencias',
    prompt:
      'Enséñame cómo realizar una transferencia entre bancos paso a paso: seleccionar origen/destino, ingresar monto, concepto, y confirmar.',
    icon: '🔄',
    color: 'from-gray-500 to-gray-600',
  },
  {
    id: 'ayuda-tutorial-oc',
    category: AI_PROMPT_CATEGORIES.AYUDA,
    title: 'Tutorial Órdenes de Compra',
    description: 'Gestión de OC completa',
    prompt:
      'Dame un tutorial completo sobre órdenes de compra: cómo crearlas, gestionarlas, pagos parciales, recepciones, y cerrarlas.',
    icon: '📚',
    color: 'from-gray-500 to-gray-600',
  },
];

/**
 * Obtener prompts por categoría
 */
export const getPromptsByCategory = (category) => {
  return AI_PROMPTS.filter((prompt) => prompt.category === category);
};

/**
 * Obtener un prompt por ID
 */
export const getPromptById = (id) => {
  return AI_PROMPTS.find((prompt) => prompt.id === id);
};

/**
 * Obtener todas las categorías únicas
 */
export const getAllCategories = () => {
  return Object.values(AI_PROMPT_CATEGORIES);
};

/**
 * Slash Commands para la búsqueda
 */
export const SLASH_COMMANDS = [
  {
    command: '/analizar',
    description: 'Análisis de datos',
    category: AI_PROMPT_CATEGORIES.ANALISIS,
  },
  {
    command: '/predecir',
    description: 'Predicciones futuras',
    category: AI_PROMPT_CATEGORIES.PREDICCIONES,
  },
  {
    command: '/optimizar',
    description: 'Optimización de procesos',
    category: AI_PROMPT_CATEGORIES.OPTIMIZACION,
  },
  { command: '/reporte', description: 'Generar reportes', category: AI_PROMPT_CATEGORIES.REPORTES },
  { command: '/ayuda', description: 'Ayuda y tutoriales', category: AI_PROMPT_CATEGORIES.AYUDA },
  { command: '/ventas', description: 'Ir a módulo de ventas', target: '/ventas' },
  { command: '/clientes', description: 'Ir a módulo de clientes', target: '/clientes' },
  { command: '/compras', description: 'Ir a órdenes de compra', target: '/compras' },
  { command: '/inventario', description: 'Ir a inventario', target: '/inventario' },
  { command: '/bancos', description: 'Ir a bancos', target: '/bancos' },
  { command: '/reportes', description: 'Ir a reportes', target: '/reportes' },
];

/**
 * Buscar comandos slash
 */
export const searchSlashCommands = (query) => {
  const lowerQuery = query.toLowerCase().replace('/', '');
  return SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.command.toLowerCase().includes(lowerQuery) ||
      cmd.description.toLowerCase().includes(lowerQuery)
  );
};
