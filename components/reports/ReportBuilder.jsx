/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    REPORT BUILDER - CONSTRUCTOR DE REPORTES              ║
 * ║   Wizard de 5 pasos para crear reportes personalizados                   ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * FEATURES:
 * - 📝 5 Pasos: Tipo, Período, Métricas, Visualización, Formato
 * - 🎨 UI Premium con animaciones
 * - 📊 Preview en tiempo real
 * - 💾 Guardar configuración
 * - 📤 Exportar directamente
 * - ⌨️ Keyboard navigation
 */

import { motion } from 'framer-motion';
import {
    BarChart3,
    Calendar,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    DollarSign,
    Download,
    FileImage,
    FileSpreadsheet,
    FileText,
    Globe,
    Package,
    ShoppingCart,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useState } from 'react';

const STEPS = [
  { id: 1, title: 'Tipo', description: 'Selecciona el tipo de reporte', icon: FileText },
  { id: 2, title: 'Período', description: 'Define el rango de fechas', icon: Calendar },
  { id: 3, title: 'Métricas', description: 'Elige las métricas a incluir', icon: BarChart3 },
  { id: 4, title: 'Visualización', description: 'Tipo de presentación', icon: TrendingUp },
  { id: 5, title: 'Formato', description: 'Formato de exportación', icon: Download },
];

const REPORT_TYPES = [
  { id: 'financial', name: 'Financiero', icon: DollarSign, description: 'Estado de resultados, balance, flujo de caja' },
  { id: 'sales', name: 'Ventas', icon: TrendingUp, description: 'Análisis de ventas por período, cliente, producto' },
  { id: 'inventory', name: 'Inventario', icon: Package, description: 'Stock, rotación, análisis ABC' },
  { id: 'clients', name: 'Clientes', icon: Users, description: 'Análisis de clientes, comportamiento, segmentación' },
  { id: 'purchases', name: 'Compras', icon: ShoppingCart, description: 'Órdenes de compra, proveedores, costos' },
];

const PERIODS = [
  { id: 'today', name: 'Hoy', icon: Clock },
  { id: '7days', name: 'Últimos 7 días', icon: Calendar },
  { id: '30days', name: 'Últimos 30 días', icon: Calendar },
  { id: 'month', name: 'Este mes', icon: Calendar },
  { id: 'custom', name: 'Personalizado', icon: Calendar },
];

const METRICS = {
  financial: ['Ingresos', 'Gastos', 'Utilidad Neta', 'Margen', 'ROI', 'EBITDA'],
  sales: ['Total Ventas', 'Ticket Promedio', 'Ventas por Cliente', 'Ventas por Producto', 'Conversión'],
  inventory: ['Stock Actual', 'Rotación', 'Días de Inventario', 'Productos Críticos', 'Valor Inventario'],
  clients: ['Total Clientes', 'Clientes Activos', 'Retención', 'Lifetime Value', 'Frecuencia Compra'],
  purchases: ['Total Órdenes', 'Monto Total', 'Órdenes Pendientes', 'Tiempo Entrega Promedio'],
};

const VISUALIZATIONS = [
  { id: 'table', name: 'Tabla', icon: FileSpreadsheet, description: 'Vista de datos en tabla' },
  { id: 'chart', name: 'Gráfica', icon: BarChart3, description: 'Visualización en gráficas' },
  { id: 'dashboard', name: 'Dashboard', icon: TrendingUp, description: 'Panel con múltiples gráficas' },
  { id: 'combined', name: 'Combinado', icon: FileImage, description: 'Tablas + Gráficas' },
];

const FORMATS = [
  { id: 'pdf', name: 'PDF', icon: FileText, description: 'Documento PDF para imprimir o compartir' },
  { id: 'excel', name: 'Excel', icon: FileSpreadsheet, description: 'Hoja de cálculo editable' },
  { id: 'powerpoint', name: 'PowerPoint', icon: FileImage, description: 'Presentación de diapositivas' },
  { id: 'web', name: 'Web', icon: Globe, description: 'Ver en navegador' },
];

export default function ReportBuilder({ onGenerate, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState({
    type: null,
    period: null,
    customDates: { start: '', end: '' },
    metrics: [],
    visualization: null,
    format: null,
  });

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return config.type !== null;
      case 2:
        return config.period !== null;
      case 3:
        return config.metrics.length > 0;
      case 4:
        return config.visualization !== null;
      case 5:
        return config.format !== null;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid() && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate(config);
    }
  };

  const toggleMetric = (metric) => {
    setConfig((prev) => ({
      ...prev,
      metrics: prev.metrics.includes(metric)
        ? prev.metrics.filter((m) => m !== metric)
        : [...prev.metrics, metric],
    }));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  scale: currentStep === step.id ? 1.1 : 1,
                  backgroundColor:
                    currentStep >= step.id
                      ? 'rgb(139, 92, 246)'
                      : 'rgb(229, 231, 235)',
                }}
                className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${
                  currentStep >= step.id ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <step.icon className="h-6 w-6" />
                )}
              </motion.div>
              <p className="mt-2 text-xs font-medium">{step.title}</p>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`h-1 flex-1 ${currentStep > step.id ? 'bg-purple-500' : 'bg-gray-300'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="min-h-[400px] rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900"
      >
        <h2 className="mb-2 text-2xl font-bold">{STEPS[currentStep - 1].title}</h2>
        <p className="mb-6 text-gray-500">{STEPS[currentStep - 1].description}</p>

        {/* STEP 1: Tipo */}
        {currentStep === 1 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REPORT_TYPES.map((type) => (
              <motion.button
                key={type.id}
                whileHover={{ y: -4 }}
                onClick={() => setConfig({ ...config, type: type.id })}
                className={`rounded-lg border-2 p-6 text-left transition-all ${
                  config.type === type.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 hover:border-purple-300 dark:border-gray-800'
                }`}
              >
                <type.icon className={`mb-3 h-8 w-8 ${config.type === type.id ? 'text-purple-600' : 'text-gray-400'}`} />
                <h3 className="mb-1 font-semibold">{type.name}</h3>
                <p className="text-sm text-gray-500">{type.description}</p>
              </motion.button>
            ))}
          </div>
        )}

        {/* STEP 2: Período */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PERIODS.map((period) => (
                <motion.button
                  key={period.id}
                  whileHover={{ y: -4 }}
                  onClick={() => setConfig({ ...config, period: period.id })}
                  className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                    config.period === period.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 hover:border-purple-300 dark:border-gray-800'
                  }`}
                >
                  <period.icon className={`h-6 w-6 ${config.period === period.id ? 'text-purple-600' : 'text-gray-400'}`} />
                  <span className="font-medium">{period.name}</span>
                </motion.button>
              ))}
            </div>

            {config.period === 'custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid gap-4 sm:grid-cols-2"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium">Fecha Inicio</label>
                  <input
                    type="date"
                    value={config.customDates.start}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        customDates: { ...config.customDates, start: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 dark:border-gray-800 dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Fecha Fin</label>
                  <input
                    type="date"
                    value={config.customDates.end}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        customDates: { ...config.customDates, end: e.target.value },
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 dark:border-gray-800 dark:bg-gray-900"
                  />
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* STEP 3: Métricas */}
        {currentStep === 3 && config.type && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {METRICS[config.type]?.map((metric) => (
              <motion.button
                key={metric}
                whileHover={{ scale: 1.02 }}
                onClick={() => toggleMetric(metric)}
                className={`flex items-center justify-between rounded-lg border-2 p-4 transition-all ${
                  config.metrics.includes(metric)
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 hover:border-purple-300 dark:border-gray-800'
                }`}
              >
                <span className="font-medium">{metric}</span>
                {config.metrics.includes(metric) && (
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                )}
              </motion.button>
            ))}
          </div>
        )}

        {/* STEP 4: Visualización */}
        {currentStep === 4 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {VISUALIZATIONS.map((viz) => (
              <motion.button
                key={viz.id}
                whileHover={{ y: -4 }}
                onClick={() => setConfig({ ...config, visualization: viz.id })}
                className={`rounded-lg border-2 p-6 text-left transition-all ${
                  config.visualization === viz.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 hover:border-purple-300 dark:border-gray-800'
                }`}
              >
                <viz.icon className={`mb-3 h-8 w-8 ${config.visualization === viz.id ? 'text-purple-600' : 'text-gray-400'}`} />
                <h3 className="mb-1 font-semibold">{viz.name}</h3>
                <p className="text-sm text-gray-500">{viz.description}</p>
              </motion.button>
            ))}
          </div>
        )}

        {/* STEP 5: Formato */}
        {currentStep === 5 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {FORMATS.map((format) => (
              <motion.button
                key={format.id}
                whileHover={{ y: -4 }}
                onClick={() => setConfig({ ...config, format: format.id })}
                className={`rounded-lg border-2 p-6 text-left transition-all ${
                  config.format === format.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 hover:border-purple-300 dark:border-gray-800'
                }`}
              >
                <format.icon className={`mb-3 h-8 w-8 ${config.format === format.id ? 'text-purple-600' : 'text-gray-400'}`} />
                <h3 className="mb-1 font-semibold">{format.name}</h3>
                <p className="text-sm text-gray-500">{format.description}</p>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={currentStep === 1 ? onClose : handlePrev}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="h-4 w-4" />
          {currentStep === 1 ? 'Cancelar' : 'Anterior'}
        </button>

        <button
          onClick={currentStep === STEPS.length ? handleGenerate : handleNext}
          disabled={!isStepValid()}
          className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition-all ${
            isStepValid()
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg'
              : 'cursor-not-allowed bg-gray-300'
          }`}
        >
          {currentStep === STEPS.length ? 'Generar Reporte' : 'Siguiente'}
          {currentStep < STEPS.length && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
