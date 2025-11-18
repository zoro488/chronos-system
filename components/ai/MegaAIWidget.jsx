/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                      MEGA AI WIDGET - CHRONOS V2                           ║
 * ║         Asistente Conversacional Ultra-Premium Flotante                    ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Widget flotante con:
 * - 💬 Chat conversacional avanzado
 * - 🎤 Entrada por voz en tiempo real
 * - 📊 Panel de visualizaciones interactivas
 * - 📤 Exportación inline a PDF/Excel
 * - ✨ Animaciones ultra-fluidas y microinteracciones
 * - 🎨 Diseño glassmorphism premium
 */
import { useEffect, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Download,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  Send,
  Sparkles,
  VolumeX,
  X,
} from 'lucide-react';
import PropTypes from 'prop-types';

import { MegaAIAgent } from '../../services/MegaAIAgent';

// Simple VoiceService placeholder - should be implemented properly
class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
  }

  isAvailable() {
    return 'speechSynthesis' in window && 'webkitSpeechRecognition' in window;
  }

  startListening(onResult, onEnd) {
    if (!this.isAvailable()) return;
    
    // eslint-disable-next-line no-undef
    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    
    this.recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      if (onResult) onResult(transcript, event.results[last].isFinal);
    };
    
    this.recognition.onend = () => {
      if (onEnd) onEnd();
    };
    
    this.recognition.start();
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
  }

  speak(text) {
    if (!this.synthesis) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

/**
 * Widget Principal del Asistente IA
 */
export function MegaAIWidget({ userId, position = 'bottom-right', onClose }) {
  const [agent] = useState(() => new MegaAIAgent(userId || 'demo-user'));
  const [voiceService] = useState(() => new VoiceService());
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        '¡Hola! 👋 Soy tu asistente inteligente de CHRONOS V2. Puedo ayudarte con:\n\n• Crear registros por voz o texto\n• Analizar datos y generar visualizaciones\n• Navegar por el sistema\n• Exportar reportes\n\n¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showVisualizations, setShowVisualizations] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Verificar disponibilidad de voz
  useEffect(() => {
    const availability = VoiceService.checkAvailability();
    setVoiceAvailable(availability.microphone && availability.deepgram && availability.openai);
  }, []);

  // Configurar callbacks de VoiceService
  useEffect(() => {
    if (voiceService) {
      voiceService.onTranscript = (text) => {
        setInput(text);
        setInterimTranscript('');
        setIsListening(false);
      };

      voiceService.onInterimTranscript = (text) => {
        setInterimTranscript(text);
      };

      voiceService.onError = (error) => {
        console.error('Voice error:', error);
        setIsListening(false);
        setInterimTranscript('');
      };

      voiceService.onRecordingStart = () => {
        setIsListening(true);
      };

      voiceService.onRecordingStop = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (voiceService) {
        voiceService.cleanup();
      }
    };
  }, [voiceService]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus automático en input
  useEffect(() => {
    if (isOpen && !isListening) {
      inputRef.current?.focus();
    }
  }, [isOpen, isListening]);

  const handleSendMessage = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const response = await agent.processConversationalInput(input);

      const assistantMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        visualizations: response.visualizations,
        actions: response.actions,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Sintetizar respuesta a voz si está habilitado
      if (voiceAvailable && response.message) {
        try {
          setIsSpeaking(true);
          await voiceService.speak(response.message);
          setIsSpeaking(false);
        } catch (err) {
          console.error('Error sintetizando voz:', err);
          setIsSpeaking(false);
        }
      }

      // Mostrar panel de visualizaciones si hay gráficos
      if (response.visualizations && response.visualizations.length > 0) {
        setShowVisualizations(true);
      }

      // Ejecutar acciones automáticamente si las hay
      if (response.actions && response.actions.length > 0) {
        response.actions.forEach((action) => {
          if (action.execute) {
            action.execute().catch((err) => console.error('Error ejecutando acción:', err));
          }
        });
      }
    } catch (error) {
      console.error('Error procesando mensaje:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Disculpa, hubo un error procesando tu solicitud. ¿Podrías intentarlo de nuevo?',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleVoiceToggle = async () => {
    if (!voiceAvailable) {
      alert(
        'Funcionalidad de voz no disponible. Verifica:\n' +
          '1. Permisos de micrófono\n' +
          '2. VITE_DEEPGRAM_API_KEY en .env\n' +
          '3. VITE_OPENAI_API_KEY en .env'
      );
      return;
    }

    try {
      if (isListening) {
        // Detener grabación
        await voiceService.stopRecording();
        setIsListening(false);
        setInterimTranscript('');
      } else {
        // Iniciar grabación
        await voiceService.startRecording();
        setIsListening(true);
      }
    } catch (error) {
      console.error('Error toggle voz:', error);
      setIsListening(false);
      setInterimTranscript('');
      alert('Error al acceder al micrófono: ' + error.message);
    }
  };

  const handleStopSpeaking = () => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickSuggestions = [
    '📝 Crear nuevo registro',
    '📊 Analizar ventas del mes',
    '🎯 Visualizar tendencias',
    '🔍 Buscar cliente',
    '📈 Generar reporte',
  ];

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  // Variantes de animación
  const widgetVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 30,
      },
    },
  };

  return (
    <>
      {/* Botón Flotante */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className={`fixed ${positionClasses[position]} z-50 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <Sparkles size={28} />
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-50"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.button>
      )}

      {/* Widget Principal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed ${positionClasses[position]} z-50 ${
              isMaximized ? 'inset-4' : 'w-[400px] h-[600px] md:w-[450px] md:h-[650px]'
            } flex flex-col bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden`}
            variants={widgetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-blue-500/20 to-purple-600/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">AI Assistant</h3>
                  <p className="text-gray-300 text-xs">CHRONOS V2</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </motion.button>

                <motion.button
                  onClick={() => {
                    setIsOpen(false);
                    if (onClose) onClose();
                  }}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500/20 flex items-center justify-center text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={16} />
                </motion.button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={`${msg.timestamp.getTime()}-${msg.role}`}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-white/10 text-white backdrop-blur-xl'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs opacity-60 mt-2">{msg.timestamp.toLocaleTimeString()}</p>

                    {/* Visualizaciones */}
                    {msg.visualizations && msg.visualizations.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.visualizations.map((viz) => (
                          <div
                            key={`${viz.config.title}-${viz.config.type}`}
                            className="p-3 bg-black/20 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold">{viz.config.title}</span>
                              <div className="flex gap-1">
                                <button className="p-1 bg-white/10 rounded hover:bg-white/20">
                                  <Download size={12} />
                                </button>
                              </div>
                            </div>
                            <div className="text-xs opacity-80">{viz.insights.join(' • ')}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isThinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 backdrop-blur-xl p-3 rounded-xl">
                    <div className="flex gap-2">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-white"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-white"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-white"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestions */}
            {!showVisualizations && messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-300 mb-2">Sugerencias rápidas:</p>
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.map((suggestion) => (
                    <motion.button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Visualizations Panel */}
            {showVisualizations && (
              <div className="px-4 pb-2 border-t border-white/10 pt-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-white font-semibold flex items-center gap-2">
                    <BarChart3 size={14} />
                    Visualizaciones
                  </p>
                  <button
                    onClick={() => setShowVisualizations(false)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Ocultar
                  </button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              {/* Transcripción interim */}
              {interimTranscript && (
                <div className="mb-2 px-3 py-2 bg-blue-500/20 rounded-lg text-sm text-blue-200">
                  🎤 {interimTranscript}...
                </div>
              )}

              <div className="flex gap-2">
                {/* Botón de voz */}
                <motion.button
                  onClick={handleVoiceToggle}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : voiceAvailable
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-white/5 text-gray-500 cursor-not-allowed'
                  }`}
                  whileHover={voiceAvailable ? { scale: 1.05 } : {}}
                  whileTap={voiceAvailable ? { scale: 0.95 } : {}}
                  disabled={!voiceAvailable}
                  title={voiceAvailable ? 'Click para hablar' : 'Voz no disponible'}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </motion.button>

                {/* Botón stop speaking */}
                {isSpeaking && (
                  <motion.button
                    onClick={handleStopSpeaking}
                    className="w-10 h-10 rounded-lg bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Detener voz"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <VolumeX size={18} />
                  </motion.button>
                )}

                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? 'Escuchando...' : 'Escribe tu mensaje...'}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isThinking || isListening}
                />

                <motion.button
                  onClick={handleSendMessage}
                  className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isThinking || !input.trim()}
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

MegaAIWidget.propTypes = {
  userId: PropTypes.string,
  position: PropTypes.oneOf(['bottom-right', 'bottom-left', 'top-right', 'top-left']),
  onClose: PropTypes.func,
};

export default MegaAIWidget;
