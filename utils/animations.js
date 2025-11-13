/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    ANIMATIONS - ANIMACIONES CENTRALIZADAS                 ║
 * ║   Variantes de Framer Motion reutilizables en toda la app                ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

// ============================================================================
// PAGE TRANSITIONS
// ============================================================================

export const pageTransitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },

  slide: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 },
  },

  slideScale: {
    initial: { opacity: 0, x: -20, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 20, scale: 0.95 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
};

// ============================================================================
// MODAL ANIMATIONS
// ============================================================================

export const modalAnimations = {
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },

  slideInTop: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },

  slideInBottom: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },

  slideInLeft: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },

  slideInRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },

  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
};

// ============================================================================
// BUTTON ANIMATIONS
// ============================================================================

export const buttonAnimations = {
  scale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
  },

  glow: {
    whileHover: { scale: 1.05, boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' },
    whileTap: { scale: 0.95 },
  },

  lift: {
    whileHover: { y: -4, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)' },
    whileTap: { y: 0 },
  },

  ripple: {
    whileTap: { scale: 0.95 },
    transition: { type: 'spring', stiffness: 500, damping: 30 },
  },

  bounce: {
    whileHover: { y: -2 },
    whileTap: { y: 0, scale: 0.95 },
    transition: { type: 'spring', stiffness: 400, damping: 10 },
  },
};

// ============================================================================
// CARD ANIMATIONS
// ============================================================================

export const cardAnimations = {
  hover: {
    whileHover: { y: -4, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' },
    transition: { duration: 0.2 },
  },

  hoverScale: {
    whileHover: { scale: 1.02, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' },
    transition: { duration: 0.2 },
  },

  tap: {
    whileTap: { scale: 0.98 },
  },

  appear: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },

  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};

// ============================================================================
// LIST ANIMATIONS
// ============================================================================

export const listAnimations = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  },

  item: {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  },

  itemFade: {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  },

  itemScale: {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 },
  },
};

// ============================================================================
// LOADING ANIMATIONS
// ============================================================================

export const loadingAnimations = {
  spinner: {
    animate: {
      rotate: 360,
    },
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },

  pulse: {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.7, 1],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },

  dots: {
    animate: {
      y: [0, -10, 0],
    },
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },

  skeleton: {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ============================================================================
// SUCCESS ANIMATIONS
// ============================================================================

export const successAnimations = {
  checkmark: {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0 },
    transition: { type: 'spring', stiffness: 200, damping: 15 },
  },

  bounce: {
    initial: { scale: 0 },
    animate: { scale: [0, 1.2, 1] },
    transition: { duration: 0.5, times: [0, 0.6, 1] },
  },

  confetti: {
    initial: { y: 0, opacity: 1 },
    animate: { y: 100, opacity: 0 },
    transition: { duration: 2 },
  },
};

// ============================================================================
// CHART ANIMATIONS
// ============================================================================

export const chartAnimations = {
  draw: {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration: 1.5, ease: 'easeInOut' },
  },

  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5, delay: 0.2 },
  },

  scaleUp: {
    initial: { scaleY: 0 },
    animate: { scaleY: 1 },
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

// ============================================================================
// NOTIFICATION ANIMATIONS
// ============================================================================

export const notificationAnimations = {
  toast: {
    initial: { opacity: 0, y: -50, scale: 0.3 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.5 },
    transition: { type: 'spring', stiffness: 500, damping: 30 },
  },

  badge: {
    initial: { scale: 0 },
    animate: { scale: [0, 1.3, 1] },
    transition: { duration: 0.4 },
  },
};

// ============================================================================
// INPUT ANIMATIONS
// ============================================================================

export const inputAnimations = {
  focus: {
    whileFocus: {
      boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.2)',
    },
  },

  error: {
    animate: {
      x: [0, -10, 10, -10, 10, 0],
    },
    transition: {
      duration: 0.4,
    },
  },

  label: {
    focused: {
      y: -24,
      scale: 0.85,
      color: '#8b5cf6',
    },
    blurred: {
      y: 0,
      scale: 1,
      color: '#6b7280',
    },
  },
};

// ============================================================================
// SIDEBAR ANIMATIONS
// ============================================================================

export const sidebarAnimations = {
  expand: {
    animate: (isOpen) => ({
      width: isOpen ? 280 : 72,
    }),
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },

  item: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.2 },
  },
};

// ============================================================================
// PARALLAX
// ============================================================================

export const parallaxAnimations = {
  slow: {
    animate: {
      y: [0, -20, 0],
    },
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },

  medium: {
    animate: {
      y: [0, -30, 0],
    },
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },

  fast: {
    animate: {
      y: [0, -40, 0],
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Crear variante de stagger para listas
 */
export const createStaggerVariant = (staggerDelay = 0.1) => ({
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  },
});

/**
 * Crear variante de hover personalizada
 */
export const createHoverVariant = (config = {}) => ({
  whileHover: {
    scale: config.scale || 1.05,
    y: config.y || -4,
    boxShadow: config.boxShadow || '0 10px 30px rgba(0, 0, 0, 0.1)',
  },
  transition: {
    duration: config.duration || 0.2,
  },
});

/**
 * Combinar múltiples variantes
 */
export const combineVariants = (...variants) => {
  return Object.assign({}, ...variants);
};
