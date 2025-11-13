/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                     CHRONOS SEARCH COMPONENTS                              ║
 * ║              Global Search & Filter Panel Premium                          ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Componentes de búsqueda:
 * - GlobalSearch (búsqueda global con hotkeys)
 * - SearchInput (input de búsqueda reutilizable)
 * - FilterPanel (panel de filtros avanzado)
 *
 * @module SearchComponents
 * @author CHRONOS System
 * @version 1.0.0
 */
import { useEffect, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';

// ============================================================================
// UTILITIES
// ============================================================================

const cn = (...classes) => classes.filter(Boolean).join(' ');

// ============================================================================
// SEARCH INPUT
// ============================================================================

/**
 * SearchInput - Input de búsqueda reutilizable
 */
export const SearchInput = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  autoFocus = false,
  loading = false,
  className = '',
}) => {
  return (
    <div className={cn('relative', className)}>
      {/* Search Icon */}
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">🔍</span>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          'w-full pl-10 pr-10 py-2 rounded-lg',
          'bg-white/5 backdrop-blur-xl border border-white/10',
          'text-white placeholder-white/50',
          'focus:outline-none focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/50',
          'transition-all duration-200'
        )}
      />

      {/* Loading/Clear Button */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        ) : value ? (
          <button
            onClick={() => onChange('')}
            className="text-white/50 hover:text-white transition-colors"
          >
            ✕
          </button>
        ) : null}
      </div>
    </div>
  );
};

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

// ============================================================================
// GLOBAL SEARCH
// ============================================================================

/**
 * GlobalSearch - Búsqueda global con hotkeys (Cmd+K / Ctrl+K)
 */
export const GlobalSearch = ({
  onSearch,
  results = [],
  loading = false,
  recentSearches = [],
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  // Hotkey listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Trigger search
  useEffect(() => {
    if (query.length >= 2) {
      onSearch(query);
    }
  }, [query, onSearch]);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg',
          'bg-white/5 hover:bg-white/10 border border-white/10',
          'text-white/50 hover:text-white transition-all',
          className
        )}
      >
        <span>🔍</span>
        <span className="text-sm">Buscar...</span>
        <span className="ml-auto text-xs px-2 py-0.5 rounded bg-white/10">⌘K</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            {/* Search Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
            >
              <div className="mx-4 rounded-2xl bg-gray-900/95 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="p-4 border-b border-white/10">
                  <SearchInput
                    ref={inputRef}
                    value={query}
                    onChange={setQuery}
                    placeholder="Buscar en todo..."
                    autoFocus
                    loading={loading}
                  />
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto">
                  {query.length === 0 && recentSearches.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs text-white/50 mb-2 uppercase tracking-wide">
                        Búsquedas recientes
                      </p>
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setQuery(search)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-colors"
                        >
                          🕐 {search}
                        </button>
                      ))}
                    </div>
                  )}

                  {query.length >= 2 && results.length === 0 && !loading && (
                    <div className="p-8 text-center text-white/50">
                      No se encontraron resultados para "{query}"
                    </div>
                  )}

                  {results.length > 0 && (
                    <div className="p-2">
                      {results.map((result, index) => (
                        <motion.a
                          key={index}
                          href={result.href}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="block px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{result.icon}</span>
                            <div className="flex-1">
                              <p className="text-white font-medium">{result.title}</p>
                              {result.description && (
                                <p className="text-sm text-white/50">{result.description}</p>
                              )}
                            </div>
                          </div>
                        </motion.a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                  <span>Presiona ESC para cerrar</span>
                  <span>⏎ para seleccionar</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

GlobalSearch.propTypes = {
  onSearch: PropTypes.func.isRequired,
  results: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      icon: PropTypes.node,
      href: PropTypes.string.isRequired,
    })
  ),
  loading: PropTypes.bool,
  recentSearches: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
};

// ============================================================================
// FILTER PANEL
// ============================================================================

/**
 * FilterPanel - Panel de filtros avanzado
 */
export const FilterPanel = ({
  filters = [],
  activeFilters = {},
  onChange,
  onClear,
  className = '',
}) => {
  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div
      className={cn(
        'p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Filtros</h3>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-xs text-[#667eea] hover:text-[#764ba2] transition-colors"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {filters.map((filter) => (
          <div key={filter.id}>
            <label className="block text-sm font-medium text-white/70 mb-2">{filter.label}</label>

            {filter.type === 'select' && (
              <select
                value={activeFilters[filter.id] || ''}
                onChange={(e) => onChange(filter.id, e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/50"
              >
                <option value="">Todos</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            {filter.type === 'checkbox' && (
              <div className="space-y-2">
                {filter.options.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeFilters[filter.id]?.includes(option.value) || false}
                      onChange={(e) => {
                        const current = activeFilters[filter.id] || [];
                        const newValue = e.target.checked
                          ? [...current, option.value]
                          : current.filter((v) => v !== option.value);
                        onChange(filter.id, newValue);
                      }}
                      className="w-4 h-4 rounded border-white/20 bg-white/5"
                    />
                    <span className="text-sm text-white/70">{option.label}</span>
                  </label>
                ))}
              </div>
            )}

            {filter.type === 'range' && (
              <div>
                <input
                  type="range"
                  min={filter.min}
                  max={filter.max}
                  step={filter.step || 1}
                  value={activeFilters[filter.id] || filter.min}
                  onChange={(e) => onChange(filter.id, e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-white/50 mt-1">
                  <span>{filter.min}</span>
                  <span>{activeFilters[filter.id] || filter.min}</span>
                  <span>{filter.max}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

FilterPanel.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['select', 'checkbox', 'range']).isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        })
      ),
      min: PropTypes.number,
      max: PropTypes.number,
      step: PropTypes.number,
    })
  ).isRequired,
  activeFilters: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  className: PropTypes.string,
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  SearchInput,
  GlobalSearch,
  FilterPanel,
};
