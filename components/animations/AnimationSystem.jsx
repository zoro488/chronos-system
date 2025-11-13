/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS ANIMATION SYSTEM                                ║
 * ║              Advanced Framer Motion Presets & Components                   ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Sistema completo de animaciones premium usando Framer Motion.
 * Incluye page transitions, micro-interactions, loading states y skeleton screens.
 *
 * @module AnimationSystem
 * @author CHRONOS System
 * @version 1.0.0
 */
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

import tokens from '../../utils/design-tokens.js';

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

/**
 * Variantes de animación predefinidas
 */
export const animationVariants = {
  // Fade
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },

  // Scale
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  scaleOut: {
    initial: { opacity: 1, scale: 1 },
    animate: { opacity: 0, scale: 1.2 },
    exit: { opacity: 0, scale: 0.8 },
  },

  // Slide
  slideInUp: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  },
  slideInDown: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
  },
  slideInLeft: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
  slideInRight: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },

  // Rotate
  rotateIn: {
    initial: { opacity: 0, rotate: -180, scale: 0.5 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 180, scale: 0.5 },
  },

  // Zoom
  zoomIn: {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0 },
  },

  // Flip
  flipIn: {
    initial: { opacity: 0, rotateY: 90 },
    animate: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: -90 },
  },

  // Bounce
  bounceIn: {
    initial: { opacity: 0, scale: 0.3 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 15,
      },
    },
    exit: { opacity: 0, scale: 0.3 },
  },
};

// ============================================================================
// PAGE TRANSITION
// ============================================================================

/**
 * PageTransition - Transición entre páginas
 */
export const PageTransition = ({ children, variant = 'fadeInUp', ...props }) => {
  const variants = animationVariants[variant] || animationVariants.fadeInUp;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.3, ease: tokens.transitions.easing.easeOut }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

PageTransition.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(Object.keys(animationVariants)),
};

// ============================================================================
// FADE IN WHEN VISIBLE
// ============================================================================

/**
 * FadeInWhenVisible - Anima cuando el elemento es visible
 */
export const FadeInWhenVisible = ({ children, delay = 0, duration = 0.5, y = 20, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration,
        delay,
        ease: tokens.transitions.easing.easeOut,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

FadeInWhenVisible.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
  duration: PropTypes.number,
  y: PropTypes.number,
};

// ============================================================================
// STAGGER CONTAINER
// ============================================================================

/**
 * StaggerContainer - Container que anima hijos con stagger
 */
export const StaggerContainer = ({
  children,
  staggerChildren = 0.1,
  delayChildren = 0,
  ...props
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} {...props}>
      {children}
    </motion.div>
  );
};

StaggerContainer.propTypes = {
  children: PropTypes.node.isRequired,
  staggerChildren: PropTypes.number,
  delayChildren: PropTypes.number,
};

/**
 * StaggerItem - Elemento hijo para StaggerContainer
 */
export const StaggerItem = ({ children, y = 20, ...props }) => {
  const itemVariants = {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: tokens.transitions.easing.easeOut,
      },
    },
  };

  return (
    <motion.div variants={itemVariants} {...props}>
      {children}
    </motion.div>
  );
};

StaggerItem.propTypes = {
  children: PropTypes.node.isRequired,
  y: PropTypes.number,
};

// ============================================================================
// HOVER SCALE
// ============================================================================

/**
 * HoverScale - Escala al hacer hover
 */
export const HoverScale = ({ children, scale = 1.05, duration = 0.2, ...props }) => {
  return (
    <motion.div
      whileHover={{ scale }}
      transition={{ duration, ease: tokens.transitions.easing.easeOut }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

HoverScale.propTypes = {
  children: PropTypes.node.isRequired,
  scale: PropTypes.number,
  duration: PropTypes.number,
};

// ============================================================================
// HOVER GLOW
// ============================================================================

/**
 * HoverGlow - Agrega glow effect al hacer hover
 */
export const HoverGlow = ({
  children,
  color = tokens.colors.chronos.blue,
  intensity = 0.6,
  ...props
}) => {
  return (
    <motion.div
      whileHover={{
        boxShadow: `0 0 30px ${color}${Math.floor(intensity * 255)
          .toString(16)
          .padStart(2, '0')}`,
      }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

HoverGlow.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string,
  intensity: PropTypes.number,
};

// ============================================================================
// LOADING SPINNER
// ============================================================================

/**
 * Spinner - Spinner de carga animado
 */
export const Spinner = ({ size = 'md', color = 'primary', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  const colors = {
    primary: 'border-[#667eea]',
    white: 'border-white',
    success: 'border-green-500',
    danger: 'border-red-500',
  };

  return (
    <motion.div
      className={`${sizes[size]} ${colors[color]} border-t-transparent rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'white', 'success', 'danger']),
  className: PropTypes.string,
};

// ============================================================================
// LOADING DOTS
// ============================================================================

/**
 * LoadingDots - Puntos animados de carga
 */
export const LoadingDots = ({ color = 'primary', size = 'md' }) => {
  const colors = {
    primary: 'bg-[#667eea]',
    white: 'bg-white',
    success: 'bg-green-500',
    danger: 'bg-red-500',
  };

  const sizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -8 },
  };

  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`${sizes[size]} ${colors[color]} rounded-full`}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: index * 0.15,
          }}
        />
      ))}
    </div>
  );
};

LoadingDots.propTypes = {
  color: PropTypes.oneOf(['primary', 'white', 'success', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

// ============================================================================
// PULSE
// ============================================================================

/**
 * Pulse - Animación de pulso
 */
export const Pulse = ({ children, duration = 2, ...props }) => {
  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

Pulse.propTypes = {
  children: PropTypes.node.isRequired,
  duration: PropTypes.number,
};

// ============================================================================
// SKELETON LOADER
// ============================================================================

/**
 * Skeleton - Skeleton screen para loading states
 */
export const Skeleton = ({
  width = '100%',
  height = '1rem',
  borderRadius = '0.5rem',
  className = '',
}) => {
  return (
    <motion.div
      className={`bg-gradient-to-r from-white/5 via-white/10 to-white/5 ${className}`}
      style={{ width, height, borderRadius }}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

Skeleton.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  borderRadius: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
};

/**
 * SkeletonCard - Tarjeta skeleton completa
 */
export const SkeletonCard = ({ lines = 3 }) => {
  return (
    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton width="3rem" height="3rem" borderRadius="9999px" />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height="1rem" />
          <Skeleton width="40%" height="0.75rem" />
        </div>
      </div>

      {/* Body */}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={`skeleton-line-${i}`}
            width={i === lines - 1 ? '70%' : '100%'}
            height="0.75rem"
          />
        ))}
      </div>
    </div>
  );
};

SkeletonCard.propTypes = {
  lines: PropTypes.number,
};

/**
 * SkeletonTable - Tabla skeleton
 */
export const SkeletonTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-white/10">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={`table-header-${Date.now()}-${i}`}
            width={`${100 / columns}%`}
            height="1rem"
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`table-row-${Date.now()}-${rowIndex}`} className="flex gap-4 py-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`table-cell-${Date.now()}-${rowIndex}-${colIndex}`}
              width={`${100 / columns}%`}
              height="0.875rem"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

SkeletonTable.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number,
};

// ============================================================================
// PROGRESS BAR
// ============================================================================

/**
 * ProgressBar - Barra de progreso animada
 */
export const ProgressBar = ({
  progress = 0,
  showLabel = true,
  color = 'primary',
  height = 'md',
  animated = true,
}) => {
  const colors = {
    primary: 'bg-gradient-to-r from-[#667eea] to-[#764ba2]',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-600',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600',
  };

  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      <div className={`w-full ${heights[height]} bg-white/10 rounded-full overflow-hidden`}>
        <motion.div
          className={`${heights[height]} ${colors[color]} rounded-full relative`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </motion.div>
      </div>

      {showLabel && (
        <div className="mt-2 text-sm text-white/70 text-center">{Math.round(progress)}%</div>
      )}
    </div>
  );
};

ProgressBar.propTypes = {
  progress: PropTypes.number.isRequired,
  showLabel: PropTypes.bool,
  color: PropTypes.oneOf(['primary', 'success', 'warning', 'danger']),
  height: PropTypes.oneOf(['sm', 'md', 'lg']),
  animated: PropTypes.bool,
};

// ============================================================================
// RIPPLE EFFECT
// ============================================================================

/**
 * Ripple - Efecto ripple al hacer click
 */
export const Ripple = ({ color = 'rgba(255, 255, 255, 0.3)' }) => {
  return (
    <motion.span
      className="absolute rounded-full pointer-events-none"
      style={{ backgroundColor: color }}
      initial={{ width: 0, height: 0, opacity: 1 }}
      animate={{
        width: 500,
        height: 500,
        opacity: 0,
      }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    />
  );
};

Ripple.propTypes = {
  color: PropTypes.string,
};

// ============================================================================
// COUNT UP
// ============================================================================

/**
 * CountUp - Animación de contador numérico
 */
export const CountUp = ({
  from = 0,
  to,
  duration = 2,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        initial={{ value: from }}
        animate={{ value: to }}
        transition={{ duration, ease: 'easeOut' }}
      >
        {({ value }) => `${prefix}${value.toFixed(decimals)}${suffix}`}
      </motion.span>
    </motion.span>
  );
};

CountUp.propTypes = {
  from: PropTypes.number,
  to: PropTypes.number.isRequired,
  duration: PropTypes.number,
  decimals: PropTypes.number,
  prefix: PropTypes.string,
  suffix: PropTypes.string,
  className: PropTypes.string,
};

// ============================================================================
// SHIMMER
// ============================================================================

/**
 * Shimmer - Efecto shimmer/shine
 */
export const Shimmer = ({ children, className = '' }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
          ease: 'easeInOut',
        }}
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};

Shimmer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// ============================================================================
// FLOAT
// ============================================================================

/**
 * Float - Animación flotante
 */
export const Float = ({ children, duration = 3, distance = 10, ...props }) => {
  return (
    <motion.div
      animate={{ y: [-distance, distance, -distance] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

Float.propTypes = {
  children: PropTypes.node.isRequired,
  duration: PropTypes.number,
  distance: PropTypes.number,
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Variants
  animationVariants,

  // Components
  PageTransition,
  FadeInWhenVisible,
  StaggerContainer,
  StaggerItem,
  HoverScale,
  HoverGlow,
  Pulse,
  Float,
  Shimmer,

  // Loading
  Spinner,
  LoadingDots,
  ProgressBar,

  // Skeleton
  Skeleton,
  SkeletonCard,
  SkeletonTable,

  // Effects
  Ripple,
  CountUp,
};
