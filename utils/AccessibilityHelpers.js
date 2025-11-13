/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                  CHRONOS ACCESSIBILITY HELPERS                             ║
 * ║          Utilidades para Accesibilidad WCAG 2.1 AA Compliant              ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

import { useEffect, useRef, useState } from 'react';

// ============================================================================
// ARIA LABEL GENERATORS
// ============================================================================

/**
 * Genera aria-label para botones de navegación
 */
export const getNavigationLabel = (destination, isActive = false) => {
  const status = isActive ? 'página actual' : '';
  return `Navegar a ${destination} ${status}`.trim();
};

/**
 * Genera aria-label para controles de datos
 */
export const getDataControlLabel = (action, itemType, itemName) => {
  const actions = {
    edit: 'Editar',
    delete: 'Eliminar',
    view: 'Ver detalles de',
    download: 'Descargar',
    duplicate: 'Duplicar',
  };
  return `${actions[action]} ${itemType}: ${itemName}`;
};

/**
 * Genera aria-label para formularios
 */
export const getFormLabel = (fieldName, isRequired = false, errorMessage = null) => {
  let label = fieldName;
  if (isRequired) label += ' (requerido)';
  if (errorMessage) label += `. Error: ${errorMessage}`;
  return label;
};

// ============================================================================
// KEYBOARD NAVIGATION
// ============================================================================

/**
 * Hook para navegación con flechas en listas
 */
export const useArrowNavigation = (itemsCount, onSelect) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, itemsCount - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (onSelect) onSelect(selectedIndex);
          break;
        case 'Escape':
          setSelectedIndex(0);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [itemsCount, selectedIndex, onSelect]);

  return selectedIndex;
};

/**
 * Hook para trap de foco en modales
 */
export const useFocusTrap = (isActive) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => container.removeEventListener('keydown', handleTab);
  }, [isActive]);

  return containerRef;
};

/**
 * Hook para restaurar foco al cerrar modales
 */
export const useFocusReturn = () => {
  const previousActiveElement = useRef(null);

  const saveFocus = () => {
    previousActiveElement.current = document.activeElement;
  };

  const returnFocus = () => {
    previousActiveElement.current?.focus();
  };

  return { saveFocus, returnFocus };
};

// ============================================================================
// SCREEN READER ANNOUNCEMENTS
// ============================================================================

/**
 * Hook para anuncios en screen readers
 */
export const useScreenReaderAnnouncement = () => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (!announcement) return;

    const timer = setTimeout(() => setAnnouncement(''), 5000);
    return () => clearTimeout(timer);
  }, [announcement]);

  const announce = (message) => {
    setAnnouncement('');
    setTimeout(() => {
      setAnnouncement(message);
    }, 100);
  };

  return {
    announcement,
    announce,
    AnnouncementContainer: () => (
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    ),
  };
};

/**
 * Componente invisible para screen readers
 */
export const VisuallyHidden = ({ children }) => (
  <span
    className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
    style={{ clip: 'rect(0,0,0,0)' }}
  >
    {children}
  </span>
);

// ============================================================================
// COLOR CONTRAST CHECKERS
// ============================================================================

/**
 * Calcula ratio de contraste entre dos colores
 */
export const getContrastRatio = (color1, color2) => {
  const getLuminance = (color) => {
    const rgb = color.match(/\d+/g).map(Number);
    const [r, g, b] = rgb.map((val) => {
      const sRGB = val / 255;
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Verifica si colores cumplen WCAG AA
 */
export const meetsWCAGAA = (color1, color2, isLargeText = false) => {
  const ratio = getContrastRatio(color1, color2);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
};

/**
 * Verifica si colores cumplen WCAG AAA
 */
export const meetsWCAGAAA = (color1, color2, isLargeText = false) => {
  const ratio = getContrastRatio(color1, color2);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
};

// ============================================================================
// SKIP LINKS
// ============================================================================

/**
 * Componente Skip to Content
 */
export const SkipToContent = ({ targetId = 'main-content' }) => (
  <a
    href={`#${targetId}`}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
  >
    Saltar al contenido principal
  </a>
);

// ============================================================================
// REDUCED MOTION
// ============================================================================

/**
 * Hook para detectar prefers-reduced-motion
 */
export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

/**
 * Hook para animaciones respetuosas con accesibilidad
 */
export const useAccessibleAnimation = (animation, reducedAnimation) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  return prefersReducedMotion ? reducedAnimation : animation;
};

// ============================================================================
// LANDMARK ROLES
// ============================================================================

/**
 * Props comunes para landmarks
 */
export const landmarkProps = {
  header: { role: 'banner' },
  nav: { role: 'navigation', 'aria-label': 'Navegación principal' },
  main: { role: 'main', id: 'main-content' },
  aside: { role: 'complementary' },
  footer: { role: 'contentinfo' },
  search: { role: 'search', 'aria-label': 'Búsqueda' },
};

// ============================================================================
// FOCUS INDICATORS
// ============================================================================

/**
 * Clases CSS para focus visible
 */
export const focusClasses = {
  base: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
  button: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900',
  input: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  card: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
};

// ============================================================================
// LIVE REGIONS
// ============================================================================

/**
 * Hook para live regions dinámicas
 */
export const useLiveRegion = (initialMessage = '', priority = 'polite') => {
  const [message, setMessage] = useState(initialMessage);

  const announce = (newMessage) => {
    setMessage('');
    setTimeout(() => setMessage(newMessage), 100);
  };

  const LiveRegion = () => (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );

  return { message, announce, LiveRegion };
};

// ============================================================================
// ARIA PATTERNS
// ============================================================================

/**
 * Props para combobox accesible
 */
export const getComboboxProps = (isOpen, activeDescendant) => ({
  role: 'combobox',
  'aria-expanded': isOpen,
  'aria-haspopup': 'listbox',
  'aria-activedescendant': activeDescendant,
  'aria-controls': 'combobox-listbox',
});

/**
 * Props para listbox accesible
 */
export const getListboxProps = () => ({
  role: 'listbox',
  id: 'combobox-listbox',
  'aria-label': 'Opciones',
});

/**
 * Props para option accesible
 */
export const getOptionProps = (id, isSelected) => ({
  role: 'option',
  id,
  'aria-selected': isSelected,
  tabIndex: -1,
});

// ============================================================================
// BEST PRACTICES
// ============================================================================

/**
 * GUÍA DE ACCESIBILIDAD CHRONOS
 *
 * 1. KEYBOARD NAVIGATION
 *    - Tab order lógico
 *    - Focus visible en todos los elementos interactivos
 *    - Shortcuts sin conflictos (evitar Ctrl+N, Ctrl+T, etc)
 *
 * 2. SCREEN READERS
 *    - aria-label en botones sin texto
 *    - aria-describedby para contexto adicional
 *    - aria-live para actualizaciones dinámicas
 *
 * 3. COLOR CONTRAST
 *    - WCAG AA mínimo (4.5:1 texto normal, 3:1 texto grande)
 *    - No usar solo color para información crítica
 *
 * 4. FORMS
 *    - Labels explícitas para todos los inputs
 *    - Error messages asociados con aria-describedby
 *    - Required fields marcados visualmente y con aria-required
 *
 * 5. LANDMARKS
 *    - header, nav, main, aside, footer correctamente usados
 *    - Skip links al inicio
 *
 * 6. ANIMATIONS
 *    - Respetar prefers-reduced-motion
 *    - Proveer alternativa sin animación
 *
 * 7. FOCUS MANAGEMENT
 *    - Focus trap en modales
 *    - Return focus al cerrar
 *    - Skip repetitive content
 *
 * 8. TESTING
 *    - Keyboard-only navigation
 *    - Screen reader testing (NVDA, JAWS, VoiceOver)
 *    - Lighthouse accessibility audit
 *    - axe DevTools
 */

export default {
  getNavigationLabel,
  getDataControlLabel,
  getFormLabel,
  useArrowNavigation,
  useFocusTrap,
  useFocusReturn,
  useScreenReaderAnnouncement,
  VisuallyHidden,
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  SkipToContent,
  usePrefersReducedMotion,
  useAccessibleAnimation,
  landmarkProps,
  focusClasses,
  useLiveRegion,
  getComboboxProps,
  getListboxProps,
  getOptionProps,
};
