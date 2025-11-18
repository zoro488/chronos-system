/**
 * 🎨 CHRONOS DESIGN TOKENS
 * Sistema completo de tokens de diseño para el ecosistema CHRONOS
 */

// ============================================
// COLORES BASE
// ============================================

export const colors = {
  // Paleta CHRONOS Principal
  chronos: {
    blue: '#667eea',
    cyan: '#4facfe',
    teal: '#00f2fe',
    indigo: '#3b82f6',
  },

  // Colores Semánticos
  primary: '#667eea',
  secondary: '#4facfe',
  accent: '#00f2fe',
  danger: '#ef4444',
  warning: '#fbbf24',
  success: '#10b981',
  info: '#3b82f6',

  // Escala de Grises
  white: '#ffffff',
  gray: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
  black: '#000000',

  // Overlays para Glassmorphism
  overlay: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.05)',
    dark: 'rgba(0, 0, 0, 0.3)',
    darker: 'rgba(0, 0, 0, 0.6)',
  },
};

// ============================================
// GRADIENTES
// ============================================

export const gradients = {
  // Gradiente Principal CHRONOS
  chronos: 'linear-gradient(135deg, #667eea 0%, #4facfe 50%, #00f2fe 100%)',
  chronosRadial: 'radial-gradient(circle, #667eea 0%, #4facfe 50%, #00f2fe 100%)',

  // Variaciones
  blue: 'linear-gradient(135deg, #667eea 0%, #4facfe 100%)',
  cyan: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  indigo: 'linear-gradient(135deg, #3b82f6 0%, #667eea 100%)',
  cosmic: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #667eea 100%)',

  // Gradientes de Estado
  success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  warning: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',

  // Gradientes para Fondos
  darkBlue: 'linear-gradient(180deg, #0f0f19 0%, #1a1a2e 100%)',
  darkCyan: 'linear-gradient(180deg, #0f1419 0%, #1a2a3e 100%)',

  // Glassmorphism overlays
  glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
};

// ============================================
// SOMBRAS
// ============================================

export const shadows = {
  // Sombras básicas
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: '0 0 #0000',

  // Sombras de color (glow effects)
  glow: {
    blue: '0 0 20px rgba(102, 126, 234, 0.5)',
    cyan: '0 0 20px rgba(79, 172, 254, 0.5)',
    teal: '0 0 20px rgba(0, 242, 254, 0.5)',
    success: '0 0 20px rgba(16, 185, 129, 0.5)',
    danger: '0 0 20px rgba(239, 68, 68, 0.5)',
  },

  // Sombras para Glassmorphism
  glass: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
};

// ============================================
// BLUR EFFECTS
// ============================================

export const blur = {
  sm: '4px',
  base: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '40px',
  '3xl': '64px',
};

// ============================================
// TIPOGRAFÍA
// ============================================

export const typography = {
  // Familias de Fuentes
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, Fira Code, monospace',
    display: 'Inter, sans-serif',
  },

  // Tamaños de Fuente
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem', // 72px
    '8xl': '6rem', // 96px
    '9xl': '8rem', // 128px
  },

  // Pesos de Fuente
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Line Heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// ============================================
// ESPACIADO
// ============================================

export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  32: '8rem', // 128px
  40: '10rem', // 160px
  48: '12rem', // 192px
  56: '14rem', // 224px
  64: '16rem', // 256px
};

// ============================================
// BORDER RADIUS
// ============================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  base: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
};

// ============================================
// TRANSICIONES
// ============================================

export const transitions = {
  // Duraciones
  duration: {
    instant: '75ms',
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
    slower: '700ms',
  },

  // Timing Functions (Easing)
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

    // Custom easings profesionales
    easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
    easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',

    easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
    easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',

    // Framer Motion easings
    spring: 'cubic-bezier(0.43, 0.13, 0.23, 0.96)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Propiedades comunes
  property: {
    all: 'all',
    colors: 'color, background-color, border-color',
    opacity: 'opacity',
    shadow: 'box-shadow',
    transform: 'transform',
  },
};

// ============================================
// Z-INDEX
// ============================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
  splash: 9999,
};

// ============================================
// BREAKPOINTS (Responsive)
// ============================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============================================
// ANIMACIÓN PRESETS (Framer Motion)
// ============================================

export const animations = {
  // Fade in
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },

  // Slide up
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  },

  // Scale
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3 },
  },

  // Slide from right
  slideRight: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: { type: 'spring', damping: 25, stiffness: 200 },
  },

  // Stagger children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
};

// ============================================
// GLASSMORPHISM PRESETS
// ============================================

export const glassmorphism = {
  light: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },

  medium: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },

  dark: {
    background: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },

  card: {
    background: 'rgba(15, 15, 25, 0.75)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  },
};

// ============================================
// UTILIDADES
// ============================================

// Función para crear estilos de glassmorphism
export const createGlassmorphism = (opacity = 0.1, blur = 20) => ({
  background: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: `blur(${blur}px)`,
  border: `1px solid rgba(255, 255, 255, ${opacity * 2})`,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
});

// Función para crear gradientes custom
export const createGradient = (color1, color2, angle = 135) =>
  `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`;

// Función para crear sombras de color
export const createColorShadow = (color, intensity = 0.5) =>
  `0 0 20px rgba(${color}, ${intensity})`;

// Export default con todo
export default {
  colors,
  gradients,
  shadows,
  blur,
  typography,
  spacing,
  borderRadius,
  transitions,
  zIndex,
  breakpoints,
  animations,
  glassmorphism,
  createGlassmorphism,
  createGradient,
  createColorShadow,
};
