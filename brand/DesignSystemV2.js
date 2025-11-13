/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS DESIGN SYSTEM V2                                ║
 * ║              Sistema de Diseño Avanzado con Tokens                         ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Design tokens actualizados:
 * - Nuevos gradientes premium
 * - Espaciado consistente
 * - Tipografía mejorada
 * - Sombras y efectos
 *
 * @module DesignSystemV2
 * @author CHRONOS System
 * @version 2.0.0
 */

export const designTokensV2 = {
  // ============================================================================
  // COLORS - Paleta extendida
  // ============================================================================
  colors: {
    primary: {
      50: '#f0f4ff',
      100: '#e0e9ff',
      200: '#c7d7fe',
      300: '#a5b8fc',
      400: '#8796f8',
      500: '#667eea', // Base
      600: '#5568d3',
      700: '#4553b8',
      800: '#3b4695',
      900: '#323b7a',
    },
    secondary: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#764ba2', // Base
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
    },
    accent: {
      pink: '#f093fb',
      coral: '#f5576c',
      cyan: '#4facfe',
      lime: '#43e97b',
      amber: '#fa709a',
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },

  // ============================================================================
  // GRADIENTS - Colección extendida
  // ============================================================================
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    sunset: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    ocean: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    forest: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    fire: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    aurora: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    galaxy: 'linear-gradient(135deg, #5f72bd 0%, #9b23ea 100%)',
    cosmic: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    neon: 'linear-gradient(135deg, #fa709a 0%, #764ba2 50%, #4facfe 100%)',
    electric: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 50%, #667eea 100%)',
  },

  // ============================================================================
  // SPACING - Sistema consistente
  // ============================================================================
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
    32: '128px',
  },

  // ============================================================================
  // TYPOGRAPHY - Escala tipográfica
  // ============================================================================
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      mono: 'JetBrains Mono, Fira Code, monospace',
    },
    fontSize: {
      xs: ['12px', { lineHeight: '16px' }],
      sm: ['14px', { lineHeight: '20px' }],
      base: ['16px', { lineHeight: '24px' }],
      lg: ['18px', { lineHeight: '28px' }],
      xl: ['20px', { lineHeight: '28px' }],
      '2xl': ['24px', { lineHeight: '32px' }],
      '3xl': ['30px', { lineHeight: '36px' }],
      '4xl': ['36px', { lineHeight: '40px' }],
      '5xl': ['48px', { lineHeight: '1' }],
      '6xl': ['60px', { lineHeight: '1' }],
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },

  // ============================================================================
  // SHADOWS - Sistema de elevación
  // ============================================================================
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: {
      primary: '0 0 20px rgba(102, 126, 234, 0.5)',
      secondary: '0 0 20px rgba(118, 75, 162, 0.5)',
      success: '0 0 20px rgba(16, 185, 129, 0.5)',
      error: '0 0 20px rgba(239, 68, 68, 0.5)',
    },
  },

  // ============================================================================
  // BORDER RADIUS - Esquinas redondeadas
  // ============================================================================
  borderRadius: {
    none: '0px',
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    full: '9999px',
  },

  // ============================================================================
  // TRANSITIONS - Animaciones
  // ============================================================================
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // ============================================================================
  // Z-INDEX - Capas de apilamiento
  // ============================================================================
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // ============================================================================
  // BREAKPOINTS - Responsive
  // ============================================================================
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // ============================================================================
  // EFFECTS - Glassmorphism & más
  // ============================================================================
  effects: {
    glassmorphism: {
      light: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
      medium: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
      },
      strong: {
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      },
    },
    blur: {
      sm: '4px',
      base: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      '2xl': '40px',
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get color by path (e.g., 'primary.500')
 */
export const getColor = (path) => {
  const keys = path.split('.');
  let value = designTokensV2.colors;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) return null;
  }

  return value;
};

/**
 * Get gradient by name
 */
export const getGradient = (name) => {
  return designTokensV2.gradients[name] || designTokensV2.gradients.primary;
};

/**
 * Generate glassmorphism CSS
 */
export const glassmorphism = (intensity = 'medium') => {
  const effect = designTokensV2.effects.glassmorphism[intensity];
  return {
    background: effect.background,
    backdropFilter: effect.backdropFilter,
    WebkitBackdropFilter: effect.backdropFilter,
    border: effect.border,
  };
};

/**
 * Generate responsive styles
 */
export const responsive = (breakpoint, styles) => {
  return `@media (min-width: ${designTokensV2.breakpoints[breakpoint]}) { ${styles} }`;
};

export default designTokensV2;
