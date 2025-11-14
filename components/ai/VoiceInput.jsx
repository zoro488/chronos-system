/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    VOICE INPUT - SPEECH TO TEXT                           ║
 * ║   Componente de entrada de voz con Web Speech API                        ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * FEATURES:
 * - 🎙️ Speech-to-Text con Web Speech API
 * - ⏺️ Indicador visual de grabación (pulse animation)
 * - ⏸️ Controles: Start, Stop, Cancel
 * - 🔊 Feedback visual y auditivo
 * - 🚫 Manejo de errores (navegador no soportado)
 * - ✨ Animaciones premium
 */
import { useEffect, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Circle, Mic, MicOff, Square, X } from 'lucide-react';

export default function VoiceInput({ onTranscript, onError, className }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Verificar si el navegador soporta Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      setError('Tu navegador no soporta reconocimiento de voz. Usa Chrome, Edge o Safari.');
      if (onError) onError('Browser not supported');
      return;
    }

    // Inicializar Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-MX';

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptPart + ' ';
        } else {
          interim += transcriptPart;
        }
      }

      setInterimTranscript(interim);
      if (final) {
        setTranscript((prev) => prev + final);
        if (onTranscript) onTranscript(final.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Error: ${event.error}`);
      if (onError) onError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, onError]);

  const startListening = () => {
    if (!isSupported) return;

    try {
      setError(null);
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error('Error starting recognition:', err);
      setError('No se pudo iniciar el reconocimiento de voz');
      if (onError) onError(err.message);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const cancelListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setTranscript('');
      setInterimTranscript('');
    }
  };

  if (!isSupported) {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}>
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">Navegador no soportado</p>
        </div>
        <p className="mt-1 text-xs text-red-600">
          El reconocimiento de voz requiere Chrome, Edge o Safari.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Indicador Visual */}
      <div className="flex items-center justify-center">
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="relative"
            >
              {/* Pulse Rings */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-500"
              />
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 0, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-500"
              />

              {/* Mic Icon */}
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-500 shadow-2xl">
                <Mic className="h-12 w-12 text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isListening && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startListening}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 shadow-lg hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <MicOff className="h-12 w-12 text-gray-500" />
          </motion.button>
        )}
      </div>

      {/* Transcript Display */}
      <AnimatePresence>
        {(transcript || interimTranscript) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {transcript}
              <span className="text-gray-400">{interimTranscript}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {isListening ? (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopListening}
              className="flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 font-medium text-white shadow-lg hover:bg-green-600"
            >
              <Square className="h-4 w-4" />
              Detener
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={cancelListening}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-6 py-3 font-medium text-white shadow-lg hover:bg-red-600"
            >
              <X className="h-4 w-4" />
              Cancelar
            </motion.button>
          </>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startListening}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-500 px-6 py-3 font-medium text-white shadow-lg hover:shadow-xl"
          >
            <Circle className="h-4 w-4 animate-pulse" />
            Iniciar Grabación
          </motion.button>
        )}
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-center dark:border-red-800 dark:bg-red-900/20"
          >
            <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Hint */}
      <p className="text-center text-xs text-gray-500">
        {isListening
          ? '🎙️ Escuchando... Habla claramente'
          : 'Haz clic para comenzar a grabar tu voz'}
      </p>
    </div>
  );
}
