/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                     CHRONOS LOGO COMPONENT                                ║
 * ║  Logo animado premium con variantes de tamaño                            ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { motion } from 'framer-motion';

interface ChronosLogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  animated?: boolean;
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  small: 'h-8 w-8',
  medium: 'h-12 w-12',
  large: 'h-16 w-16',
  xlarge: 'h-24 w-24',
};

const textSizeClasses = {
  small: 'text-lg',
  medium: 'text-2xl',
  large: 'text-3xl',
  xlarge: 'text-4xl',
};

export default function ChronosLogo({
  size = 'medium',
  animated = false,
  showText = true,
  className = '',
}: ChronosLogoProps) {
  const logoVariants = {
    initial: { opacity: 0, scale: 0.8, rotate: -180 },
    animate: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: [0.43, 0.13, 0.23, 0.96],
      },
    },
    hover: {
      scale: 1.05,
      rotate: 5,
      transition: { duration: 0.3 },
    },
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <motion.div
        className={`relative ${sizeClasses[size]} rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 p-0.5`}
        variants={animated ? logoVariants : undefined}
        initial={animated ? 'initial' : undefined}
        animate={animated ? 'animate' : undefined}
        whileHover={animated ? 'hover' : undefined}
      >
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-400/50 to-pink-400/50 blur-xl" />

        {/* Logo content */}
        <div className="relative flex h-full w-full items-center justify-center rounded-xl bg-slate-900">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-2/3 w-2/3"
          >
            {/* Clock circle */}
            <motion.circle
              cx="12"
              cy="12"
              r="9"
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              variants={animated ? pulseVariants : undefined}
              animate={animated ? 'animate' : undefined}
            />

            {/* Hour hand */}
            <motion.line
              x1="12"
              y1="12"
              x2="12"
              y2="7"
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={animated ? { rotate: 0 } : undefined}
              animate={animated ? { rotate: 360 } : undefined}
              transition={animated ? { duration: 4, repeat: Infinity, ease: 'linear' } : undefined}
              style={{ originX: '12px', originY: '12px' }}
            />

            {/* Minute hand */}
            <motion.line
              x1="12"
              y1="12"
              x2="17"
              y2="12"
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={animated ? { rotate: 0 } : undefined}
              animate={animated ? { rotate: 360 } : undefined}
              transition={animated ? { duration: 2, repeat: Infinity, ease: 'linear' } : undefined}
              style={{ originX: '12px', originY: '12px' }}
            />

            {/* Center dot */}
            <circle cx="12" cy="12" r="1.5" fill="url(#gradient)" />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </motion.div>

      {/* Text */}
      {showText && (
        <motion.div
          initial={animated ? { opacity: 0, x: -20 } : undefined}
          animate={animated ? { opacity: 1, x: 0 } : undefined}
          transition={animated ? { delay: 0.3, duration: 0.6 } : undefined}
        >
          <h1 className={`font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
            CHRONOS
          </h1>
          {size === 'large' || size === 'xlarge' ? (
            <p className="text-xs text-gray-400 -mt-1">Sistema Empresarial</p>
          ) : null}
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// LOGO ICON ONLY (sin texto)
// ============================================================================

export function ChronosLogoIcon({ size = 'medium', animated = false, className = '' }: Omit<ChronosLogoProps, 'showText'>) {
  return <ChronosLogo size={size} animated={animated} showText={false} className={className} />;
}

// ============================================================================
// LOGO MINIMAL (versión simplificada)
// ============================================================================

export function ChronosLogoMinimal({ className = '' }: { className?: string }) {
  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
        <line x1="12" y1="12" x2="12" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="12" x2="17" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="1.5" fill="white" />
      </svg>
    </div>
  );
}
