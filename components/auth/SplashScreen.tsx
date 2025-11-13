/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    SPLASHSCREEN - CHRONOS SYSTEM                          ║
 * ║  Pantalla de carga inicial con animaciones premium y efectos visuales     ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import ChronosLogo from '../brand/ChronosLogo';

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

export default function SplashScreen({
  onComplete,
  minDuration = 2500,
}: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Inicializando sistema...');

  const loadingMessages = [
    'Inicializando sistema...',
    'Cargando componentes...',
    'Conectando servicios...',
    'Preparando interfaz...',
    'Casi listo...',
  ];

  useEffect(() => {
    // Simular progreso de carga
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // Progreso más rápido al inicio, más lento al final
        const increment = prev < 60 ? 8 : prev < 90 ? 3 : 1;
        return Math.min(prev + increment, 100);
      });
    }, 100);

    // Cambiar mensajes de carga
    const messageInterval = setInterval(() => {
      setLoadingMessage((prev) => {
        const currentIndex = loadingMessages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 500);

    // Completar después del tiempo mínimo
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, minDuration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearTimeout(completeTimeout);
    };
  }, [onComplete, minDuration]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/20 via-slate-900 to-slate-950"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated gradients */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-purple-500/30 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [360, 180, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-pink-500/30 blur-3xl"
          />

          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <ChronosLogo size="xlarge" animated />
          </motion.div>

          {/* Loading Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-12 text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-3">
              CHRONOS System
            </h2>
            <motion.p
              key={loadingMessage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-gray-400 min-h-[24px]"
            >
              {loadingMessage}
            </motion.p>
          </motion.div>

          {/* Progress Bar Container */}
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '320px' }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-10 relative"
          >
            {/* Progress Bar Background */}
            <div className="h-2 rounded-full bg-white/10 overflow-hidden backdrop-blur-xl">
              {/* Animated Progress Bar */}
              <motion.div
                className="h-full relative"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              >
                {/* Gradient fill */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />

                {/* Animated shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />

                {/* Glow effect */}
                <div className="absolute inset-0 blur-sm bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
              </motion.div>
            </div>

            {/* Progress Percentage */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-3 text-center text-sm font-medium text-gray-400"
            >
              {progress}%
            </motion.div>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-12 flex flex-wrap gap-2 justify-center max-w-md px-4"
          >
            {['Dashboard IA', 'Análisis en tiempo real', 'Reportes automáticos', 'Gestión integral'].map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-xs text-gray-400"
              >
                {feature}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-purple-400/30"
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 10,
              }}
              animate={{
                y: -10,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'linear',
              }}
            />
          ))}
        </div>

        {/* Bottom Credits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 text-center text-xs text-gray-600"
        >
          <p>Premium Ecosystem © 2025</p>
          <p className="mt-1">Powered by Firebase & React</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// VARIANTE: MiniSplash (para transiciones rápidas)
// ============================================================================

interface MiniSplashProps {
  message?: string;
}

export function MiniSplash({ message = 'Cargando...' }: MiniSplashProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-900/20 via-slate-900 to-slate-950"
    >
      <div className="text-center">
        {/* Spinner */}
        <div className="relative mx-auto mb-4 h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Message */}
        <p className="text-gray-400">{message}</p>
      </div>
    </motion.div>
  );
}
