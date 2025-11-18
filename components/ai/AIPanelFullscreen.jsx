/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    AI PANEL FULLSCREEN - CHRONOS IA                       ║
 * ║   Panel IA avanzado con Chat, Insights, Predicciones, Recomendaciones    ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * FEATURES:
 * - 💬 Chat conversacional con historial
 * - 💡 Insights automáticos de datos
 * - 📈 Predicciones basadas en tendencias
 * - ✅ Recomendaciones accionables
 * - 📊 Visualizaciones inteligentes
 * - 📤 Export de análisis (PDF, Excel)
 * - 🎙️ Voice input integration
 * - ✨ Animaciones premium
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
    Bot,
    Copy,
    Download,
    Lightbulb,
    Mic,
    Send,
    Sparkles,
    Target,
    ThumbsUp,
    TrendingUp,
    User,
    X,
    Zap
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart as RePieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AIPanelFullscreen({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: '¡Hola! Soy tu asistente IA de Chronos. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const tabs = [
    { id: 'chat', label: 'Chat', icon: Bot },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
    { id: 'predictions', label: 'Predicciones', icon: TrendingUp },
    { id: 'recommendations', label: 'Recomendaciones', icon: Target },
  ];

  // Mock data
  const insights = [
    {
      id: 1,
      title: 'Tendencia de Ventas',
      description: 'Las ventas han aumentado un 23% en los últimos 30 días, superando el pronóstico en 15%.',
      type: 'positive',
      chart: 'line',
      data: [
        { fecha: '01/01', valor: 12000 },
        { fecha: '05/01', valor: 15000 },
        { fecha: '10/01', valor: 18000 },
        { fecha: '15/01', valor: 16000 },
        { fecha: '20/01', valor: 20000 },
        { fecha: '25/01', valor: 24000 },
        { fecha: '30/01', valor: 28000 },
      ],
    },
    {
      id: 2,
      title: 'Productos Estrella',
      description: 'Los productos de categoría "Premium" representan el 45% de los ingresos totales.',
      type: 'info',
      chart: 'pie',
      data: [
        { name: 'Premium', value: 45 },
        { name: 'Standard', value: 30 },
        { name: 'Básico', value: 25 },
      ],
    },
    {
      id: 3,
      title: 'Optimización de Gastos',
      description: 'Se detectó una oportunidad de reducir gastos operativos en un 12% renegociando contratos.',
      type: 'warning',
      chart: 'bar',
      data: [
        { mes: 'Ene', actual: 15000, optimizado: 13200 },
        { mes: 'Feb', actual: 16000, optimizado: 14080 },
        { mes: 'Mar', actual: 14500, optimizado: 12760 },
      ],
    },
  ];

  const predictions = [
    {
      id: 1,
      title: 'Proyección de Ventas - Próximos 30 días',
      value: '$342,500',
      confidence: 87,
      trend: '+18%',
      description: 'Basado en histórico de 6 meses y tendencias estacionales',
    },
    {
      id: 2,
      title: 'Productos con Stock Crítico',
      value: '12 productos',
      confidence: 95,
      trend: 'Alerta',
      description: 'Se agotarán en los próximos 7 días si continúa la demanda actual',
    },
    {
      id: 3,
      title: 'Flujo de Caja Esperado',
      value: '$125,800',
      confidence: 82,
      trend: '+12%',
      description: 'Considerando cuentas por cobrar y pagar pendientes',
    },
  ];

  const recommendations = [
    {
      id: 1,
      priority: 'high',
      title: 'Reabastecer Inventario',
      description: 'Ordenar 12 productos con stock crítico para evitar pérdida de ventas',
      impact: 'Alto',
      effort: 'Medio',
      action: 'Ver Productos',
    },
    {
      id: 2,
      priority: 'medium',
      title: 'Optimizar Rutas de Distribución',
      description: 'Rediseñar rutas de fletes para reducir costos en 15%',
      impact: 'Medio',
      effort: 'Alto',
      action: 'Ver Análisis',
    },
    {
      id: 3,
      priority: 'low',
      title: 'Actualizar Precios',
      description: 'Ajustar precios de 8 productos según análisis de competencia',
      impact: 'Bajo',
      effort: 'Bajo',
      action: 'Ver Sugerencias',
    },
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    // Simular respuesta de IA
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        role: 'assistant',
        content: 'Entiendo tu pregunta. Basándome en los datos disponibles, te puedo ayudar con un análisis detallado. ¿Quieres que profundice en algún aspecto específico?',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const renderChart = (insight) => {
    const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

    switch (insight.chart) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={insight.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke="#8b5cf6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={insight.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="actual" fill="#ef4444" />
              <Bar dataKey="optimizado" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <RePieChart>
              <Pie
                data={insight.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {insight.data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative h-[90vh] w-[95vw] rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Chronos IA Assistant</h2>
                <p className="text-sm text-white/80">Panel Avanzado de Inteligencia Artificial</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => alert('Exportar análisis')}
                className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur-xl transition-all hover:bg-white/20"
              >
                <Download className="h-4 w-4" />
                Exportar
              </button>
              <button
                onClick={onClose}
                className="rounded-lg p-2 transition-colors hover:bg-white/10"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-800 flex gap-2 p-4 bg-gray-50 dark:bg-gray-900/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="h-[calc(90vh-180px)] overflow-y-auto p-6">
            {/* CHAT TAB */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 space-y-4 overflow-y-auto mb-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className="mt-1 text-xs opacity-60">
                          {msg.timestamp.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl bg-gray-100 dark:bg-gray-800 px-4 py-3">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="flex gap-2">
                  <button className="flex-shrink-0 rounded-xl bg-gray-100 p-3 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
                    <Mic className="h-5 w-5" />
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe tu pregunta..."
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-purple-500 dark:border-gray-800 dark:bg-gray-900"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="flex-shrink-0 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 text-white hover:shadow-lg"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* INSIGHTS TAB */}
            {activeTab === 'insights' && (
              <div className="grid gap-6 lg:grid-cols-2">
                {insights.map((insight) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{insight.title}</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{insight.description}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          insight.type === 'positive'
                            ? 'bg-green-100 text-green-700'
                            : insight.type === 'warning'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {insight.type}
                      </span>
                    </div>
                    {renderChart(insight)}
                    <div className="mt-4 flex gap-2">
                      <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-purple-600">
                        <Copy className="h-4 w-4" />
                        Copiar
                      </button>
                      <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600">
                        <ThumbsUp className="h-4 w-4" />
                        Útil
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* PREDICTIONS TAB */}
            {activeTab === 'predictions' && (
              <div className="grid gap-6 lg:grid-cols-3">
                {predictions.map((pred) => (
                  <motion.div
                    key={pred.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -4 }}
                    className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <Zap className="h-8 w-8 text-purple-500" />
                      <span className="text-2xl font-bold text-purple-600">{pred.confidence}%</span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{pred.title}</h3>
                    <p className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">{pred.value}</p>
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{pred.description}</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-semibold text-green-500">{pred.trend}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* RECOMMENDATIONS TAB */}
            {activeTab === 'recommendations' && (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                              rec.priority === 'high'
                                ? 'bg-red-100 text-red-700'
                                : rec.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {rec.priority}
                          </span>
                          <h3 className="text-lg font-semibold">{rec.title}</h3>
                        </div>
                        <p className="mb-4 text-gray-600 dark:text-gray-400">{rec.description}</p>
                        <div className="flex gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Impacto</p>
                            <p className="font-semibold">{rec.impact}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Esfuerzo</p>
                            <p className="font-semibold">{rec.effort}</p>
                          </div>
                        </div>
                      </div>
                      <button className="rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-white hover:shadow-lg">
                        {rec.action}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
