/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS FORM COMPONENTS                                 ║
 * ║            Advanced Form Inputs with Validation & Formatting               ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Componentes de formulario avanzados con validación, formato automático
 * y autocompletado. Preparados para usar con React Hook Form + Zod.
 *
 * @module FormComponents
 * @author CHRONOS System
 * @version 1.0.0
 */
import { forwardRef, useEffect, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';

// ============================================================================
// UTILITIES
// ============================================================================

const cn = (...classes) => classes.filter(Boolean).join(' ');

const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
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

// ============================================================================
// FORM INPUT
// ============================================================================

/**
 * FormInput - Input mejorado para formularios con validación visual
 */
export const FormInput = forwardRef(
  (
    {
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      containerClassName,
      required = false,
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
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 z-10">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-3 rounded-xl text-white placeholder-white/40',
              'transition-all duration-300 focus:outline-none',
              'bg-white/5 backdrop-blur-xl border-2',
              !hasError &&
                !hasSuccess &&
                'border-white/10 focus:border-[#667eea] focus:shadow-[0_0_20px_rgba(102,126,234,0.3)]',
              hasError &&
                'border-red-500 focus:border-red-500 focus:shadow-[0_0_20px_rgba(239,68,68,0.3)]',
              hasSuccess &&
                'border-green-500 focus:border-green-500 focus:shadow-[0_0_20px_rgba(16,185,129,0.3)]',
              leftIcon && 'pl-11',
              (rightIcon || hasError || hasSuccess) && 'pr-11',
              rest.disabled && 'opacity-50 cursor-not-allowed'
            )}
            {...rest}
          />

          {rightIcon && !hasError && !hasSuccess && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
              {rightIcon}
            </div>
          )}

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

FormInput.displayName = 'FormInput';

FormInput.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  success: PropTypes.bool,
  helperText: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  fullWidth: PropTypes.bool,
  containerClassName: PropTypes.string,
  required: PropTypes.bool,
};

// ============================================================================
// FORM TEXTAREA
// ============================================================================

/**
 * FormTextarea - Textarea mejorado para formularios
 */
export const FormTextarea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      rows = 4,
      maxLength,
      showCounter = false,
      containerClassName,
      required = false,
      ...rest
    },
    ref
  ) => {
    const [charCount, setCharCount] = useState(rest.value?.length || 0);

    const handleChange = (e) => {
      setCharCount(e.target.value.length);
      if (rest.onChange) {
        rest.onChange(e);
      }
    };

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full', containerClassName)}>
        {label && (
          <label className="text-sm font-medium text-white/90">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          rows={rows}
          maxLength={maxLength}
          className={cn(
            'w-full px-4 py-3 rounded-xl text-white placeholder-white/40',
            'transition-all duration-300 focus:outline-none resize-none',
            'bg-white/5 backdrop-blur-xl border-2',
            !error &&
              'border-white/10 focus:border-[#667eea] focus:shadow-[0_0_20px_rgba(102,126,234,0.3)]',
            error && 'border-red-500 focus:border-red-500',
            rest.disabled && 'opacity-50 cursor-not-allowed'
          )}
          onChange={handleChange}
          {...rest}
        />

        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {(error || helperText) && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn('text-xs', error ? 'text-red-400' : 'text-white/50')}
              >
                {error || helperText}
              </motion.p>
            )}
          </AnimatePresence>

          {showCounter && maxLength && (
            <p className={cn('text-xs', charCount >= maxLength ? 'text-red-400' : 'text-white/50')}>
              {charCount} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

FormTextarea.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  fullWidth: PropTypes.bool,
  rows: PropTypes.number,
  maxLength: PropTypes.number,
  showCounter: PropTypes.bool,
  containerClassName: PropTypes.string,
  required: PropTypes.bool,
};

// ============================================================================
// FORM SELECT
// ============================================================================

/**
 * FormSelect - Select mejorado con búsqueda
 */
export const FormSelect = forwardRef(
  (
    {
      label,
      options = [],
      value,
      onChange,
      placeholder = 'Seleccionar...',
      searchable = false,
      error,
      fullWidth = true,
      disabled = false,
      containerClassName,
      required = false,
      ...rest
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
        {label && (
          <label className="text-sm font-medium text-white/90">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'w-full px-4 py-3 rounded-xl text-left text-white',
            'transition-all duration-300 focus:outline-none',
            'bg-white/5 backdrop-blur-xl border-2 flex items-center justify-between',
            !error && 'border-white/10 focus:border-[#667eea]',
            error && 'border-red-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          {...rest}
        >
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden bg-gray-900/95 backdrop-blur-xl border-2 border-white/10 shadow-2xl"
              style={{ top: label ? 'calc(100% + 0.25rem)' : '100%', maxHeight: '300px' }}
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

FormSelect.displayName = 'FormSelect';

FormSelect.propTypes = {
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
  containerClassName: PropTypes.string,
  required: PropTypes.bool,
};

// ============================================================================
// FORM DATE PICKER
// ============================================================================

/**
 * FormDatePicker - Date picker simple y elegante
 */
export const FormDatePicker = forwardRef(
  (
    {
      label,
      value,
      onChange,
      error,
      fullWidth = true,
      min,
      max,
      containerClassName,
      required = false,
      ...rest
    },
    ref
  ) => {
    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full', containerClassName)}>
        {label && (
          <label className="text-sm font-medium text-white/90">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          className={cn(
            'w-full px-4 py-3 rounded-xl text-white',
            'transition-all duration-300 focus:outline-none',
            'bg-white/5 backdrop-blur-xl border-2',
            '[color-scheme:dark]', // Dark mode para date picker
            !error &&
              'border-white/10 focus:border-[#667eea] focus:shadow-[0_0_20px_rgba(102,126,234,0.3)]',
            error && 'border-red-500',
            rest.disabled && 'opacity-50 cursor-not-allowed'
          )}
          {...rest}
        />

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

FormDatePicker.displayName = 'FormDatePicker';

FormDatePicker.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  fullWidth: PropTypes.bool,
  min: PropTypes.string,
  max: PropTypes.string,
  containerClassName: PropTypes.string,
  required: PropTypes.bool,
};

// ============================================================================
// FORM MONEY INPUT
// ============================================================================

/**
 * FormMoneyInput - Input para cantidades monetarias con formato automático
 */
export const FormMoneyInput = forwardRef(
  (
    {
      label,
      value,
      onChange,
      error,
      currency = 'MXN',
      fullWidth = true,
      containerClassName,
      required = false,
      ...rest
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
      if (value) {
        const formatted = new Intl.NumberFormat('es-MX', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
        setDisplayValue(formatted);
      } else {
        setDisplayValue('');
      }
    }, [value]);

    const handleChange = (e) => {
      const rawValue = e.target.value.replace(/[^0-9.]/g, '');
      const numValue = parseFloat(rawValue) || 0;
      onChange(numValue);
    };

    const handleBlur = (e) => {
      if (rest.onBlur) {
        rest.onBlur(e);
      }
    };

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full', containerClassName)}>
        {label && (
          <label className="text-sm font-medium text-white/90">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 font-semibold">
            $
          </div>

          <input
            ref={ref}
            type="text"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(
              'w-full pl-8 pr-16 py-3 rounded-xl text-white',
              'transition-all duration-300 focus:outline-none font-mono',
              'bg-white/5 backdrop-blur-xl border-2 text-right',
              !error &&
                'border-white/10 focus:border-[#667eea] focus:shadow-[0_0_20px_rgba(102,126,234,0.3)]',
              error && 'border-red-500',
              rest.disabled && 'opacity-50 cursor-not-allowed'
            )}
            {...rest}
          />

          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 text-sm">
            {currency}
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

FormMoneyInput.displayName = 'FormMoneyInput';

FormMoneyInput.propTypes = {
  label: PropTypes.string,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  currency: PropTypes.string,
  fullWidth: PropTypes.bool,
  containerClassName: PropTypes.string,
  required: PropTypes.bool,
};

// ============================================================================
// FORM CHECKBOX
// ============================================================================

/**
 * FormCheckbox - Checkbox estilizado
 */
export const FormCheckbox = forwardRef(
  ({ label, checked, onChange, error, disabled = false, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              ref={ref}
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="sr-only peer"
              {...rest}
            />
            <div
              className={cn(
                'w-5 h-5 rounded border-2 transition-all duration-200',
                'peer-checked:bg-gradient-to-r peer-checked:from-[#667eea] peer-checked:to-[#764ba2]',
                'peer-checked:border-transparent',
                !checked && 'border-white/30 bg-white/5',
                disabled && 'opacity-50 cursor-not-allowed',
                !disabled && 'group-hover:border-[#667eea]'
              )}
            >
              {checked && (
                <svg
                  className="w-full h-full text-white p-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>

          {label && (
            <span className={cn('text-sm text-white/90', disabled && 'opacity-50')}>{label}</span>
          )}
        </label>

        {error && <p className="text-xs text-red-400 ml-8">{error}</p>}
      </div>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';

FormCheckbox.propTypes = {
  label: PropTypes.string,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  disabled: PropTypes.bool,
};

// ============================================================================
// FORM RADIO GROUP
// ============================================================================

/**
 * FormRadioGroup - Grupo de radio buttons
 */
export const FormRadioGroup = ({
  label,
  options = [],
  value,
  onChange,
  error,
  direction = 'vertical',
  required = false,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-white/90">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div
        className={cn('flex gap-4', direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap')}
      >
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className="sr-only peer"
              />
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 transition-all duration-200',
                  'peer-checked:border-[#667eea]',
                  value !== option.value && 'border-white/30 bg-white/5',
                  'group-hover:border-[#667eea]'
                )}
              >
                {value === option.value && (
                  <div className="absolute inset-0 m-1 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2]" />
                )}
              </div>
            </div>

            <span className="text-sm text-white/90">{option.label}</span>
          </label>
        ))}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

FormRadioGroup.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  direction: PropTypes.oneOf(['vertical', 'horizontal']),
  required: PropTypes.bool,
};

// ============================================================================
// FORM PRODUCT SELECTOR (Autocomplete)
// ============================================================================

/**
 * FormProductSelector - Selector de productos con autocomplete
 */
export const FormProductSelector = ({
  label,
  products = [],
  value,
  onChange,
  error,
  fullWidth = true,
  placeholder = 'Buscar producto...',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectorRef = useRef(null);

  useOnClickOutside(selectorRef, () => setIsOpen(false));

  const filteredProducts = products.filter(
    (product) =>
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProduct = products.find((p) => p.id === value);

  const handleSelect = (product) => {
    onChange(product);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={selectorRef} className={cn('relative flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label className="text-sm font-medium text-white/90">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={
            searchTerm ||
            (selectedProduct ? `${selectedProduct.codigo} - ${selectedProduct.nombre}` : '')
          }
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={cn(
            'w-full px-4 py-3 rounded-xl text-white placeholder-white/40',
            'transition-all duration-300 focus:outline-none',
            'bg-white/5 backdrop-blur-xl border-2',
            !error &&
              'border-white/10 focus:border-[#667eea] focus:shadow-[0_0_20px_rgba(102,126,234,0.3)]',
            error && 'border-red-500'
          )}
        />

        <AnimatePresence>
          {isOpen && filteredProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden bg-gray-900/95 backdrop-blur-xl border-2 border-white/10 shadow-2xl max-h-[300px] overflow-y-auto custom-scrollbar"
            >
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelect(product)}
                  className="w-full px-4 py-3 text-left transition-colors hover:bg-white/10 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{product.nombre}</p>
                      <p className="text-white/50 text-sm">Código: {product.codigo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-semibold">
                        ${product.precioVenta?.toFixed(2)}
                      </p>
                      <p className="text-white/50 text-sm">Stock: {product.stock}</p>
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

FormProductSelector.propTypes = {
  label: PropTypes.string,
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      codigo: PropTypes.string,
      nombre: PropTypes.string.isRequired,
      precioVenta: PropTypes.number,
      stock: PropTypes.number,
    })
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  fullWidth: PropTypes.bool,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
};

// ============================================================================
// FORM CLIENT SELECTOR (Autocomplete)
// ============================================================================

/**
 * FormClientSelector - Selector de clientes con autocomplete
 */
export const FormClientSelector = ({
  label,
  clients = [],
  value,
  onChange,
  error,
  fullWidth = true,
  placeholder = 'Buscar cliente...',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectorRef = useRef(null);

  useOnClickOutside(selectorRef, () => setIsOpen(false));

  const filteredClients = clients.filter(
    (client) =>
      client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.telefono?.includes(searchTerm)
  );

  const selectedClient = clients.find((c) => c.id === value);

  const handleSelect = (client) => {
    onChange(client);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={selectorRef} className={cn('relative flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label className="text-sm font-medium text-white/90">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm || (selectedClient ? selectedClient.nombre : '')}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={cn(
            'w-full px-4 py-3 rounded-xl text-white placeholder-white/40',
            'transition-all duration-300 focus:outline-none',
            'bg-white/5 backdrop-blur-xl border-2',
            !error &&
              'border-white/10 focus:border-[#667eea] focus:shadow-[0_0_20px_rgba(102,126,234,0.3)]',
            error && 'border-red-500'
          )}
        />

        <AnimatePresence>
          {isOpen && filteredClients.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden bg-gray-900/95 backdrop-blur-xl border-2 border-white/10 shadow-2xl max-h-[300px] overflow-y-auto custom-scrollbar"
            >
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => handleSelect(client)}
                  className="w-full px-4 py-3 text-left transition-colors hover:bg-white/10 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{client.nombre}</p>
                      <p className="text-white/50 text-sm">{client.telefono}</p>
                    </div>
                    {client.saldoPendiente > 0 && (
                      <div className="text-right">
                        <p className="text-yellow-400 text-sm">Saldo pendiente</p>
                        <p className="text-yellow-400 font-semibold">
                          ${client.saldoPendiente?.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

FormClientSelector.propTypes = {
  label: PropTypes.string,
  clients: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      nombre: PropTypes.string.isRequired,
      telefono: PropTypes.string,
      saldoPendiente: PropTypes.number,
    })
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  fullWidth: PropTypes.bool,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  FormInput,
  FormTextarea,
  FormSelect,
  FormDatePicker,
  FormMoneyInput,
  FormCheckbox,
  FormRadioGroup,
  FormProductSelector,
  FormClientSelector,
};
