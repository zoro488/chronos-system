/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                         CHRONOS DATA TABLE                                 ║
 * ║        Advanced Table with Sorting, Filtering & Pagination                ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Tabla de datos premium con todas las funcionalidades:
 * - Ordenamiento multi-columna
 * - Filtros avanzados
 * - Paginación
 * - Selección múltiple
 * - Acciones por fila
 * - Responsive
 *
 * @module DataTable
 * @author CHRONOS System
 * @version 1.0.0
 */
import { useMemo, useState } from 'react';

import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

// ============================================================================
// UTILITIES
// ============================================================================

const cn = (...classes) => classes.filter(Boolean).join(' ');

// ============================================================================
// DATA TABLE COMPONENT
// ============================================================================

/**
 * DataTable - Tabla de datos avanzada
 */
export const DataTable = ({
  data = [],
  columns = [],
  pageSize = 10,
  sortable = true,
  filterable = true,
  selectable = false,
  onRowClick,
  onSelectionChange,
  emptyMessage = 'No hay datos disponibles',
  loading = false,
  className = '',
}) => {
  // Estados
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [globalFilter, setGlobalFilter] = useState('');

  // Filtrado global
  const filteredByGlobal = useMemo(() => {
    if (!globalFilter) return data;

    return data.filter((row) =>
      columns.some((col) => {
        const value = String(row[col.key] || '').toLowerCase();
        return value.includes(globalFilter.toLowerCase());
      })
    );
  }, [data, globalFilter, columns]);

  // Filtrado por columnas
  const filteredData = useMemo(() => {
    let filtered = [...filteredByGlobal];

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((row) =>
          String(row[key] || '')
            .toLowerCase()
            .includes(value.toLowerCase())
        );
      }
    });

    return filtered;
  }, [filteredByGlobal, filters]);

  // Ordenamiento
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  // Paginación
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handlers
  const handleSort = (key) => {
    if (!sortable) return;

    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleRowSelect = (rowId) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(rowId)) {
      newSelection.delete(rowId);
    } else {
      newSelection.add(rowId);
    }
    setSelectedRows(newSelection);
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelection));
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
      if (onSelectionChange) onSelectionChange([]);
    } else {
      const allIds = new Set(paginatedData.map((_, idx) => idx));
      setSelectedRows(allIds);
      if (onSelectionChange) onSelectionChange(Array.from(allIds));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={cn('w-full', className)}>
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
          <div className="p-12 text-center">
            <motion.div
              className="w-12 h-12 border-4 border-[#667eea] border-t-transparent rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="mt-4 text-white/50">Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={cn('w-full', className)}>
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
          <div className="p-12 text-center">
            <svg
              className="w-16 h-16 text-white/30 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-white/50">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full flex flex-col gap-4', className)}>
      {/* Barra de búsqueda global */}
      {filterable && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Buscar en toda la tabla..."
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-white placeholder-white/40 bg-white/5 backdrop-blur-xl border-2 border-white/10 focus:border-[#667eea] focus:outline-none transition-all"
            />
          </div>

          <div className="text-sm text-white/70">{sortedData.length} resultados</div>
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            {/* Header */}
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                {selectable && (
                  <th className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.size === paginatedData.length && paginatedData.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-2 border-white/30 checked:bg-[#667eea] checked:border-[#667eea] cursor-pointer"
                    />
                  </th>
                )}

                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-left text-sm font-semibold text-white/90',
                      sortable &&
                        column.sortable !== false &&
                        'cursor-pointer hover:bg-white/5 transition-colors',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                    onClick={() => column.sortable !== false && handleSort(column.key)}
                    style={{ width: column.width }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.label}</span>
                      {sortable && column.sortable !== false && (
                        <div className="flex flex-col">
                          <svg
                            className={cn(
                              'w-3 h-3 -mb-1',
                              sortConfig.key === column.key && sortConfig.direction === 'asc'
                                ? 'text-[#667eea]'
                                : 'text-white/30'
                            )}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" />
                          </svg>
                          <svg
                            className={cn(
                              'w-3 h-3',
                              sortConfig.key === column.key && sortConfig.direction === 'desc'
                                ? 'text-[#667eea]'
                                : 'text-white/30'
                            )}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Filtro por columna */}
                    {filterable && column.filterable !== false && (
                      <input
                        type="text"
                        placeholder={`Filtrar ${column.label.toLowerCase()}...`}
                        value={filters[column.key] || ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleFilterChange(column.key, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 w-full px-2 py-1 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-[#667eea] focus:outline-none"
                      />
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {paginatedData.map((row, rowIndex) => (
                <motion.tr
                  key={`row-${currentPage}-${rowIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rowIndex * 0.03 }}
                  className={cn(
                    'border-b border-white/5 transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-white/5',
                    selectedRows.has(rowIndex) && 'bg-[#667eea]/10'
                  )}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowIndex)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRowSelect(rowIndex);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-2 border-white/30 checked:bg-[#667eea] checked:border-[#667eea] cursor-pointer"
                      />
                    </td>
                  )}

                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-4 py-3 text-sm text-white/80',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <div className="text-sm text-white/50">
              Mostrando {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  currentPage === 1
                    ? 'text-white/30 cursor-not-allowed'
                    : 'text-white hover:bg-white/10'
                )}
              >
                Anterior
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white'
                          : 'text-white/70 hover:bg-white/10'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  currentPage === totalPages
                    ? 'text-white/30 cursor-not-allowed'
                    : 'text-white hover:bg-white/10'
                )}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

DataTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      filterable: PropTypes.bool,
      width: PropTypes.string,
      align: PropTypes.oneOf(['left', 'center', 'right']),
      render: PropTypes.func,
    })
  ).isRequired,
  pageSize: PropTypes.number,
  sortable: PropTypes.bool,
  filterable: PropTypes.bool,
  selectable: PropTypes.bool,
  onRowClick: PropTypes.func,
  onSelectionChange: PropTypes.func,
  emptyMessage: PropTypes.string,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

// ============================================================================
// COMPACT DATA TABLE (Mobile-friendly)
// ============================================================================

/**
 * CompactDataTable - Tabla compacta para móvil
 */
export const CompactDataTable = ({
  data = [],
  columns = [],
  onRowClick,
  loading = false,
  emptyMessage = 'No hay datos',
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 animate-pulse"
          >
            <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
            <div className="h-3 bg-white/10 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-center">
        <p className="text-white/50">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((row, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          onClick={() => onRowClick && onRowClick(row)}
          className={cn(
            'p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10',
            'transition-all duration-200',
            onRowClick && 'cursor-pointer hover:bg-white/10 hover:border-[#667eea]/50'
          )}
        >
          {columns.map((column) => (
            <div key={column.key} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-white/60">{column.label}</span>
              <span className="text-sm text-white font-medium">
                {column.render ? column.render(row[column.key], row) : row[column.key]}
              </span>
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

CompactDataTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
    })
  ).isRequired,
  onRowClick: PropTypes.func,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  DataTable,
  CompactDataTable,
};
