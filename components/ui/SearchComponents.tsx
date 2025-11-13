/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                   SEARCH COMPONENTS - CHRONOS SYSTEM                      ║
 * ║  Componentes de búsqueda: SearchBar, Filters, Sort, Results              ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowUpDown,
    Check,
    ChevronDown,
    Filter,
    Search,
    SlidersHorizontal,
    Tag,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';

// ============================================================================
// SEARCH BAR COMPONENT
// ============================================================================

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  suggestions?: string[];
  debounceMs?: number;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Buscar...',
  loading = false,
  suggestions = [],
  debounceMs = 300,
  className,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  const handleChange = (newValue: string) => {
    onChange(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onSearch?.(newValue);
    }, debounceMs);
  };

  const handleClear = () => {
    onChange('');
    onSearch?.('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSearch?.(suggestion);
    setShowSuggestions(false);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={cn('relative w-full', className)}>
      <div
        className={cn(
          'relative flex items-center rounded-xl border bg-white/5 backdrop-blur-xl transition-all',
          isFocused ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' : 'border-white/10'
        )}
      >
        {/* Search Icon */}
        <div className="pl-4 pr-3 text-gray-400">
          <Search className="h-5 w-5" />
        </div>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent py-3 pr-4 text-white placeholder-gray-500 outline-none"
        />

        {/* Loading / Clear Button */}
        {loading ? (
          <div className="pr-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          </div>
        ) : value ? (
          <button
            onClick={handleClear}
            className="pr-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && value && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 rounded-xl border border-white/10 bg-slate-900 backdrop-blur-xl shadow-xl overflow-hidden"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                <div className="flex items-center gap-3">
                  <Search className="h-4 w-4 text-gray-400" />
                  <span>{suggestion}</span>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// FILTER PANEL COMPONENT
// ============================================================================

export interface FilterOption {
  id: string;
  label: string;
  value: any;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  type?: 'checkbox' | 'radio' | 'range';
}

interface FilterPanelProps {
  groups: FilterGroup[];
  selectedFilters: Record<string, any[]>;
  onChange: (groupId: string, values: any[]) => void;
  onClear?: () => void;
  className?: string;
}

export function FilterPanel({
  groups,
  selectedFilters,
  onChange,
  onClear,
  className,
}: FilterPanelProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    groups.map((g) => g.id)
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleOptionToggle = (groupId: string, value: any, type: FilterGroup['type']) => {
    const currentValues = selectedFilters[groupId] || [];

    if (type === 'radio') {
      onChange(groupId, [value]);
    } else {
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      onChange(groupId, newValues);
    }
  };

  const getTotalSelected = () => {
    return Object.values(selectedFilters).reduce((sum, values) => sum + values.length, 0);
  };

  return (
    <div className={cn('rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-purple-400" />
          <h3 className="font-semibold text-white">Filtros</h3>
          {getTotalSelected() > 0 && (
            <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-300">
              {getTotalSelected()}
            </span>
          )}
        </div>
        {getTotalSelected() > 0 && (
          <button
            onClick={onClear}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Filter Groups */}
      <div className="divide-y divide-white/10">
        {groups.map((group) => {
          const isExpanded = expandedGroups.includes(group.id);
          const selectedCount = selectedFilters[group.id]?.length || 0;

          return (
            <div key={group.id}>
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{group.label}</span>
                  {selectedCount > 0 && (
                    <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-300">
                      {selectedCount}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-gray-400 transition-transform',
                    isExpanded && 'rotate-180'
                  )}
                />
              </button>

              {/* Group Options */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {group.options.map((option) => {
                        const isSelected = selectedFilters[group.id]?.includes(option.value);

                        return (
                          <label
                            key={option.id}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <div
                              className={cn(
                                'flex h-5 w-5 items-center justify-center rounded border transition-colors',
                                isSelected
                                  ? 'bg-purple-500 border-purple-500'
                                  : 'border-white/20 group-hover:border-purple-500/50'
                              )}
                            >
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <input
                              type={group.type === 'radio' ? 'radio' : 'checkbox'}
                              checked={isSelected}
                              onChange={() => handleOptionToggle(group.id, option.value, group.type)}
                              className="sr-only"
                            />
                            <span className="flex-1 text-sm text-gray-300 group-hover:text-white transition-colors">
                              {option.label}
                            </span>
                            {option.count !== undefined && (
                              <span className="text-xs text-gray-500">
                                {option.count}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// SORT OPTIONS COMPONENT
// ============================================================================

export interface SortOption {
  id: string;
  label: string;
  value: string;
  direction?: 'asc' | 'desc';
}

interface SortOptionsProps {
  options: SortOption[];
  value: string;
  onChange: (value: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

export function SortOptions({
  options,
  value,
  onChange,
  className,
}: SortOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');

  const currentOption = options.find((opt) => opt.value === value) || options[0];

  const handleOptionClick = (option: SortOption) => {
    onChange(option.value, option.direction || direction);
    setIsOpen(false);
  };

  const toggleDirection = () => {
    const newDirection = direction === 'asc' ? 'desc' : 'asc';
    setDirection(newDirection);
    onChange(value, newDirection);
  };

  return (
    <div className={cn('relative', className)}>
      <div className="flex gap-2">
        {/* Sort Selector */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white backdrop-blur-xl hover:bg-white/10 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>{currentOption.label}</span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
        </button>

        {/* Direction Toggle */}
        <button
          onClick={toggleDirection}
          className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 backdrop-blur-xl hover:bg-white/10 transition-colors"
        >
          <ArrowUpDown className={cn('h-4 w-4 text-white transition-transform', direction === 'desc' && 'rotate-180')} />
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 w-full min-w-[200px] rounded-xl border border-white/10 bg-slate-900 backdrop-blur-xl shadow-xl overflow-hidden"
          >
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option)}
                className={cn(
                  'w-full px-4 py-3 text-left transition-colors',
                  option.value === value
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-gray-300 hover:bg-white/10'
                )}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// TAG FILTER COMPONENT
// ============================================================================

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  maxVisible?: number;
  className?: string;
}

export function TagFilter({
  tags,
  selectedTags,
  onChange,
  maxVisible = 10,
  className,
}: TagFilterProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleTags = showAll ? tags : tags.slice(0, maxVisible);
  const hasMore = tags.length > maxVisible;

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    onChange(newTags);
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-white">Etiquetas</span>
          {selectedTags.length > 0 && (
            <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-300">
              {selectedTags.length}
            </span>
          )}
        </div>
        {selectedTags.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {visibleTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);

          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
                isSelected
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:border-purple-500/30'
              )}
            >
              <Tag className="h-3 w-3" />
              {tag}
              {isSelected && <X className="h-3 w-3" />}
            </button>
          );
        })}

        {/* Show More/Less */}
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            {showAll ? 'Ver menos' : `+${tags.length - maxVisible} más`}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SEARCH RESULTS COMPONENT
// ============================================================================

interface SearchResultsProps<T> {
  results: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  className?: string;
}

export function SearchResults<T>({
  results,
  renderItem,
  loading = false,
  emptyMessage = 'No se encontraron resultados',
  emptyIcon,
  className,
}: SearchResultsProps<T>) {
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-white/5"
          />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
        {emptyIcon ? (
          <div className="mb-4 text-gray-500">{emptyIcon}</div>
        ) : (
          <Search className="mb-4 h-12 w-12 text-gray-500" />
        )}
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {results.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          {renderItem(item, index)}
        </motion.div>
      ))}
    </div>
  );
}
