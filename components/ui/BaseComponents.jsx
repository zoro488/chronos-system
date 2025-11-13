/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS BASE UI COMPONENTS                              ║
 * ║                      Premium Design System v1.0                            ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Componentes base del sistema CHRONOS con glassmorphism y animaciones avanzadas.
 * Todos los componentes usan design-tokens.js para estilos consistentes.
 *
 * @module BaseComponents
 * @author CHRONOS System
 * @version 1.0.0
 */
import {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';

import tokens from '../../utils/design-tokens.js';

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Combina clases CSS de forma segura
 */
const cn = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Hook para detectar clics fuera de un elemento
 */
const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

/**
 * Hook para bloquear scroll del body
 */
const useLockBodyScroll = (lock) => {
  useEffect(() => {
    if (lock) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [lock]);
};

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

/**
 * Variantes del botón con estilos predefinidos
 */
const buttonVariants = {
  primary: {
    base: `bg-gradient-to-r from-[${tokens.colors.chronos.blue}] via-[${tokens.colors.chronos.purple}] to-[${tokens.colors.chronos.purple}]`,
    hover: 'hover:shadow-[0_0_30px_rgba(102,126,234,0.6)] hover:scale-105',
    active: 'active:scale-95',
    disabled: 'opacity-50 cursor-not-allowed',
    text: 'text-white',
  },
  secondary: {
    base: 'bg-gradient-to-r from-gray-700 to-gray-800',
    hover: 'hover:from-gray-600 hover:to-gray-700 hover:shadow-lg',
    active: 'active:scale-95',
    disabled: 'opacity-50 cursor-not-allowed',
    text: 'text-white',
  },
  ghost: {
    base: 'bg-transparent border-2',
    hover: 'hover:bg-white/10 hover:border-[#667eea]',
    active: 'active:bg-white/20',
    disabled: 'opacity-50 cursor-not-allowed',
    text: 'text-white',
    border: 'border-white/20',
  },
  danger: {
    base: `bg-gradient-to-r from-[${tokens.colors.danger}] to-[#dc2626]`,
    hover: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:scale-105',
    active: 'active:scale-95',
    disabled: 'opacity-50 cursor-not-allowed',
    text: 'text-white',
  },
  success: {
    base: `bg-gradient-to-r from-[${tokens.colors.success}] to-[#059669]`,
    hover: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:scale-105',
    active: 'active:scale-95',
    disabled: 'opacity-50 cursor-not-allowed',
    text: 'text-white',
  },
};

/**
 * Tamaños de botón
 */
const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
};

/**
 * Button Component - Botón premium con animaciones y variantes
 *
 * @param {Object} props - Props del componente
 * @param {string} props.variant - Variante del botón (primary, secondary, ghost, danger, success)
 * @param {string} props.size - Tamaño (sm, md, lg, xl)
 * @param {boolean} props.loading - Muestra spinner de carga
 * @param {boolean} props.disabled - Deshabilita el botón
 * @param {React.ReactNode} props.leftIcon - Icono a la izquierda
 * @param {React.ReactNode} props.rightIcon - Icono a la derecha
 * @param {boolean} props.fullWidth - Ocupa todo el ancho
 * @param {Function} props.onClick - Handler de click
 * @param {React.ReactNode} props.children - Contenido del botón
 */
export const Button = forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      onClick,
      children,
      className,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const variantStyles = buttonVariants[variant];
    const sizeStyles = buttonSizes[size];
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center gap-2',
          'font-semibold rounded-xl',
          'transition-all duration-300',
          'focus:outline-none focus:ring-4 focus:ring-[#667eea]/50',

          // Variant styles
          variantStyles.base,
          variantStyles.text,
          variantStyles.border,
          !isDisabled && variantStyles.hover,
          !isDisabled && variantStyles.active,
          isDisabled && variantStyles.disabled,

          // Size
          sizeStyles,

          // Full width
          fullWidth && 'w-full',

          // Custom className
          className
        )}
        whileHover={!isDisabled ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        {...rest}
      >
        {loading && (
          <motion.div
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
        {!loading && leftIcon && <span>{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span>{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'success']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

// ============================================================================
// INPUT COMPONENT
// ============================================================================

/**
 * Input Component - Campo de entrada premium con validación visual
 */
export const Input = forwardRef(
  (
    {
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      containerClassName,
      ...rest
    },
    ref
  ) => {
    const hasError = Boolean(error);
    const hasSuccess = Boolean(success);

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full', containerClassName)}>
        {label && (
          <label className="text-sm font-medium text-white/90">
            {label}
            {rest.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">{leftIcon}</div>
          )}

          <input
            ref={ref}
            className={cn(
              // Base styles
              'w-full px-4 py-2.5 rounded-xl',
              'text-white placeholder-white/40',
              'transition-all duration-300',
              'focus:outline-none',

              // Glassmorphism
              'bg-white/5 backdrop-blur-xl',
              'border-2',

              // Estados
              !hasError && !hasSuccess && 'border-white/10',
              !hasError && !hasSuccess && 'focus:border-[#667eea]',
              !hasError && !hasSuccess && 'focus:shadow-[0_0_20px_rgba(102,126,234,0.3)]',

              hasError && 'border-red-500',
              hasError && 'focus:border-red-500',
              hasError && 'focus:shadow-[0_0_20px_rgba(239,68,68,0.3)]',

              hasSuccess && 'border-green-500',
              hasSuccess && 'focus:border-green-500',
              hasSuccess && 'focus:shadow-[0_0_20px_rgba(16,185,129,0.3)]',

              // Icons padding
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',

              // Disabled
              rest.disabled && 'opacity-50 cursor-not-allowed',

              className
            )}
            {...rest}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
              {rightIcon}
            </div>
          )}

          {/* Indicador de estado */}
          {hasError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}

          {hasSuccess && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Helper text o error */}
        <AnimatePresence mode="wait">
          {(error || helperText) && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={cn('text-xs', hasError ? 'text-red-400' : 'text-white/50')}
            >
              {error || helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  success: PropTypes.bool,
  helperText: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
};

// ============================================================================
// SELECT COMPONENT
// ============================================================================

/**
 * Select Component - Selector premium con búsqueda
 */
export const Select = forwardRef(
  (
    {
      label,
      options = [],
      value,
      onChange,
      placeholder = 'Seleccionar...',
      searchable = false,
      error,
      fullWidth = false,
      disabled = false,
      className,
      containerClassName,
    },
    _ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const selectRef = useRef(null);

    useOnClickOutside(selectRef, () => setIsOpen(false));

    const filteredOptions = searchable
      ? options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
      : options;

    const selectedOption = options.find((opt) => opt.value === value);

    const handleSelect = (option) => {
      onChange(option.value);
      setIsOpen(false);
      setSearchTerm('');
    };

    return (
      <div
        ref={selectRef}
        className={cn('relative flex flex-col gap-1.5', fullWidth && 'w-full', containerClassName)}
      >
        {label && <label className="text-sm font-medium text-white/90">{label}</label>}

        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'w-full px-4 py-2.5 rounded-xl',
            'text-left text-white',
            'transition-all duration-300',
            'focus:outline-none',
            'bg-white/5 backdrop-blur-xl',
            'border-2',
            !error && 'border-white/10',
            !error && 'focus:border-[#667eea]',
            !error && 'focus:shadow-[0_0_20px_rgba(102,126,234,0.3)]',
            error && 'border-red-500',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          <div className="flex items-center justify-between">
            <span className={!selectedOption ? 'text-white/40' : ''}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <svg
              className={cn(
                'w-5 h-5 text-white/50 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'absolute z-50 w-full mt-1 rounded-xl overflow-hidden',
                'bg-gray-900/95 backdrop-blur-xl',
                'border-2 border-white/10',
                'shadow-2xl',
                label ? 'top-[calc(100%+0.25rem)]' : 'top-full'
              )}
              style={{ maxHeight: '300px' }}
            >
              {searchable && (
                <div className="p-2 border-b border-white/10">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 text-white placeholder-white/40 border border-white/10 focus:border-[#667eea] focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              <div className="overflow-y-auto max-h-[250px] custom-scrollbar">
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-3 text-white/50 text-center">No hay resultados</div>
                ) : (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={cn(
                        'w-full px-4 py-2.5 text-left transition-colors',
                        'hover:bg-white/10',
                        option.value === value && 'bg-[#667eea]/20 text-[#667eea]',
                        option.value !== value && 'text-white'
                      )}
                    >
                      {option.label}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

Select.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  searchable: PropTypes.bool,
  error: PropTypes.string,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
};

// ============================================================================
// CARD COMPONENT
// ============================================================================

/**
 * Card Component - Tarjeta con glassmorphism
 */
export const Card = ({
  children,
  className,
  hover = false,
  onClick,
  gradient = false,
  padding = 'md',
  ...rest
}) => {
  const paddingSizes = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  return (
    <motion.div
      className={cn(
        'rounded-2xl',
        'transition-all duration-300',

        // Glassmorphism
        !gradient && 'bg-white/5 backdrop-blur-xl',
        !gradient && 'border border-white/10',

        // Gradient variant
        gradient && 'bg-gradient-to-br from-white/10 to-white/5',
        gradient && 'border border-white/20',

        // Hover effect
        hover &&
          'hover:shadow-[0_0_30px_rgba(102,126,234,0.3)] hover:border-[#667eea]/50 cursor-pointer',

        // Padding
        paddingSizes[padding],

        className
      )}
      whileHover={hover ? { y: -4 } : {}}
      onClick={onClick}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool,
  onClick: PropTypes.func,
  gradient: PropTypes.bool,
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
};

// ============================================================================
// BADGE COMPONENT
// ============================================================================

/**
 * Badge Component - Insignia de estado
 */
export const Badge = ({ children, variant = 'default', size = 'md', className, ...rest }) => {
  const variants = {
    default: 'bg-gray-700 text-white',
    primary: 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white',
    success: 'bg-green-500/20 text-green-400 border border-green-500/50',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/50',
    info: 'bg-blue-500/20 text-blue-400 border border-blue-500/50',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        'backdrop-blur-sm',
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger', 'info']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

// ============================================================================
// AVATAR COMPONENT
// ============================================================================

/**
 * Avatar Component - Avatar de usuario
 */
export const Avatar = ({
  src,
  alt = 'Avatar',
  size = 'md',
  fallback,
  status,
  className,
  ...rest
}) => {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };

  const showFallback = !src || imageError;

  return (
    <div className={cn('relative inline-block', className)} {...rest}>
      <div
        className={cn(
          'rounded-full overflow-hidden',
          'bg-gradient-to-br from-[#667eea] to-[#764ba2]',
          'flex items-center justify-center',
          'font-semibold text-white',
          sizes[size]
        )}
      >
        {!showFallback ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{fallback || alt.charAt(0).toUpperCase()}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0',
            'w-3 h-3 rounded-full',
            'border-2 border-gray-900',
            statusColors[status]
          )}
        />
      )}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  fallback: PropTypes.string,
  status: PropTypes.oneOf(['online', 'offline', 'busy', 'away']),
  className: PropTypes.string,
};

// ============================================================================
// TOOLTIP COMPONENT
// ============================================================================

/**
 * Tooltip Component - Tooltip informativo
 */
export const Tooltip = ({ children, content, position = 'top', delay = 200 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              'absolute z-50 px-3 py-2 rounded-lg',
              'bg-gray-900 text-white text-sm',
              'border border-white/10',
              'whitespace-nowrap',
              'pointer-events-none',
              positions[position]
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.node,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  delay: PropTypes.number,
};

// ============================================================================
// MODAL COMPONENT
// ============================================================================

/**
 * Modal Context para control global
 */
const ModalContext = createContext();

/**
 * Modal Component - Modal premium con backdrop blur
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseButton = true,
  footer,
}) => {
  const modalRef = useRef(null);

  useLockBodyScroll(isOpen);

  const contextValue = useMemo(() => ({ onClose }), [onClose]);

  useEffect(() => {
    if (!closeOnEsc) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, closeOnEsc]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalContext.Provider value={contextValue}>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeOnBackdrop ? onClose : undefined}
            />

            {/* Modal */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className={cn(
                'relative w-full rounded-2xl',
                'bg-gray-900/95 backdrop-blur-xl',
                'border border-white/10',
                'shadow-2xl',
                sizes[size]
              )}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  {title && <h3 className="text-xl font-bold text-white">{title}</h3>}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-white/70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Body */}
              <div className="p-6">{children}</div>

              {/* Footer */}
              {footer && (
                <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </ModalContext.Provider>
      )}
    </AnimatePresence>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  closeOnBackdrop: PropTypes.bool,
  closeOnEsc: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  footer: PropTypes.node,
};

// ============================================================================
// DRAWER COMPONENT
// ============================================================================

/**
 * Drawer Component - Panel lateral deslizante
 */
export const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  size = 'md',
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseButton = true,
}) => {
  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (!closeOnEsc) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, closeOnEsc]);

  const positions = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    top: 'top-0 left-0 w-full',
    bottom: 'bottom-0 left-0 w-full',
  };

  const sizes = {
    sm: position === 'top' || position === 'bottom' ? 'max-h-[50vh]' : 'max-w-sm',
    md: position === 'top' || position === 'bottom' ? 'max-h-[70vh]' : 'max-w-md',
    lg: position === 'top' || position === 'bottom' ? 'max-h-[85vh]' : 'max-w-lg',
    xl: position === 'top' || position === 'bottom' ? 'max-h-[95vh]' : 'max-w-xl',
  };

  const slideVariants = {
    left: { x: '-100%' },
    right: { x: '100%' },
    top: { y: '-100%' },
    bottom: { y: '100%' },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Drawer */}
          <motion.div
            initial={slideVariants[position]}
            animate={{ x: 0, y: 0 }}
            exit={slideVariants[position]}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'absolute',
              'bg-gray-900/95 backdrop-blur-xl',
              'border-white/10',
              'shadow-2xl',
              'flex flex-col',
              positions[position],
              sizes[size],
              position === 'left' && 'border-r',
              position === 'right' && 'border-l',
              position === 'top' && 'border-b',
              position === 'bottom' && 'border-t'
            )}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                {title && <h3 className="text-xl font-bold text-white">{title}</h3>}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-white/70"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

Drawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  position: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  closeOnBackdrop: PropTypes.bool,
  closeOnEsc: PropTypes.bool,
  showCloseButton: PropTypes.bool,
};

// ============================================================================
// TABS COMPONENT
// ============================================================================

/**
 * Tabs Context
 */
const TabsContext = createContext();

/**
 * Tabs Container
 */
export const Tabs = ({ defaultValue, value, onChange, children, className }) => {
  const [activeTab, setActiveTab] = useState(defaultValue || value);

  const handleChange = useCallback(
    (newValue) => {
      setActiveTab(newValue);
      if (onChange) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const contextValue = useMemo(
    () => ({
      activeTab,
      setActiveTab: handleChange,
    }),
    [activeTab, handleChange]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

Tabs.propTypes = {
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * TabsList - Lista de pestañas
 */
export const TabsList = ({ children, className }) => {
  return (
    <div
      className={cn(
        'inline-flex p-1 rounded-xl',
        'bg-white/5 backdrop-blur-xl',
        'border border-white/10',
        className
      )}
    >
      {children}
    </div>
  );
};

TabsList.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * TabsTrigger - Botón de pestaña
 */
export const TabsTrigger = ({ value, children, className }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={cn(
        'px-4 py-2 rounded-lg',
        'text-sm font-medium',
        'transition-all duration-200',
        'focus:outline-none',
        isActive && 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg',
        !isActive && 'text-white/60 hover:text-white hover:bg-white/5',
        className
      )}
    >
      {children}
    </button>
  );
};

TabsTrigger.propTypes = {
  value: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * TabsContent - Contenido de pestaña
 */
export const TabsContent = ({ value, children, className }) => {
  const { activeTab } = useContext(TabsContext);

  if (activeTab !== value) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn('mt-4', className)}
    >
      {children}
    </motion.div>
  );
};

TabsContent.propTypes = {
  value: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  Button,
  Input,
  Select,
  Card,
  Badge,
  Avatar,
  Tooltip,
  Modal,
  Drawer,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
};

/**
 * Spinner - Componente de carga con múltiples tamaños y colores
 */
export function Spinner({ size = 'md', color = 'purple', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colors = {
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    white: 'text-white',
  };

  return (
    <svg
      role="img"
      aria-label="Cargando"
      className={cn('animate-spin', sizes[size], colors[color], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['purple', 'blue', 'green', 'white']),
  className: PropTypes.string,
};

/**
 * FullPageSpinner - Spinner de pantalla completa
 */
export function FullPageSpinner({ message = 'Cargando...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
      <Spinner size="xl" color="white" />
      {message && (
        <p className="mt-4 text-lg font-medium text-white">{message}</p>
      )}
    </div>
  );
}

FullPageSpinner.propTypes = {
  message: PropTypes.string,
};
