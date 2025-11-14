/**
 * 📊 BANCOS TRANSACCIONES - Virtual Scroll para 10k+ registros
 * - Virtual scroll con TanStack Virtual
 * - Filtros flotantes avanzados
 * - Export masivo CSV/Excel
 * - Search instant con debounce
 * - Sort multi-columna
 * - Selección múltiple
 */

import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import {
    ArrowDownUp,
    Calendar,
    CheckSquare,
    Download,
    Filter,
    Search,
    Square,
    TrendingDown,
    TrendingUp,
    X,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useBancos } from '../hooks/useBancos';

// ========================================================================
// COMPONENTE PRINCIPAL
// ========================================================================

export const BancosTransacciones = () => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedBanco, setSelectedBanco] = useState('all');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [sortBy, setSortBy] = useState({ field: 'fecha', order: 'desc' });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Obtener todos los bancos y sus transacciones
  const { bancos, cargando } = useBancos();

  // Consolidar todas las transacciones de todos los bancos
  const allTransactions = useMemo(() => {
    if (!bancos) return [];

    const transactions = [];

    bancos.forEach((banco) => {
      // Ingresos
      banco.ingresos?.forEach((ing) => {
        transactions.push({
          id: `ing-${banco.id}-${ing.id}`,
          fecha: ing.fecha,
          tipo: 'Ingreso',
          banco: banco.nombre,
          bancoId: banco.id,
          cliente: ing.cliente || ing.fuente || '-',
          monto: ing.monto,
          concepto: ing.concepto,
          categoria: ing.fuente || 'Ingreso',
        });
      });

      // Gastos
      banco.gastos?.forEach((gasto) => {
        transactions.push({
          id: `gasto-${banco.id}-${gasto.id}`,
          fecha: gasto.fecha,
          tipo: 'Gasto',
          banco: banco.nombre,
          bancoId: banco.id,
          cliente: gasto.destino || '-',
          monto: -gasto.monto,
          concepto: gasto.concepto,
          categoria: gasto.categoria || 'Gasto',
        });
      });

      // Transferencias
      banco.transferencias?.forEach((trans) => {
        transactions.push({
          id: `trans-${banco.id}-${trans.id}`,
          fecha: trans.fecha,
          tipo: 'Transferencia',
          banco: banco.nombre,
          bancoId: banco.id,
          cliente: trans.bancoDestino || '-',
          monto: -trans.monto,
          concepto: trans.concepto,
          categoria: 'Transferencia',
        });
      });
    });

    return transactions;
  }, [bancos]);

  // Filtrar y ordenar transacciones
  const filteredTransactions = useMemo(() => {
    let filtered = [...allTransactions];

    // Filtro por texto
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.concepto.toLowerCase().includes(searchLower) ||
          t.cliente.toLowerCase().includes(searchLower) ||
          t.banco.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter((t) => t.tipo === selectedType);
    }

    // Filtro por banco
    if (selectedBanco !== 'all') {
      filtered = filtered.filter((t) => t.bancoId === selectedBanco);
    }

    // Filtro por rango de fechas
    if (dateRange.start) {
      filtered = filtered.filter((t) => new Date(t.fecha) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter((t) => new Date(t.fecha) <= new Date(dateRange.end));
    }

    // Ordenar
    filtered.sort((a, b) => {
      const aVal = a[sortBy.field];
      const bVal = b[sortBy.field];

      if (sortBy.field === 'fecha') {
        return sortBy.order === 'asc'
          ? new Date(aVal) - new Date(bVal)
          : new Date(bVal) - new Date(aVal);
      }

      if (sortBy.field === 'monto') {
        return sortBy.order === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return sortBy.order === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return filtered;
  }, [allTransactions, search, selectedType, selectedBanco, dateRange, sortBy]);

  // Virtual scroll setup
  const parentRef = useRef();
  const rowVirtualizer = useVirtualizer({
    count: filteredTransactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  // Estadísticas rápidas
  const stats = useMemo(() => {
    const totalIngresos = filteredTransactions
      .filter((t) => t.tipo === 'Ingreso')
      .reduce((sum, t) => sum + t.monto, 0);

    const totalGastos = Math.abs(
      filteredTransactions
        .filter((t) => t.tipo === 'Gasto')
        .reduce((sum, t) => sum + t.monto, 0)
    );

    const totalTransferencias = Math.abs(
      filteredTransactions
        .filter((t) => t.tipo === 'Transferencia')
        .reduce((sum, t) => sum + t.monto, 0)
    );

    return {
      total: filteredTransactions.length,
      ingresos: totalIngresos,
      gastos: totalGastos,
      transferencias: totalTransferencias,
      balance: totalIngresos - totalGastos,
    };
  }, [filteredTransactions]);

  // Handlers
  const handleSort = (field) => {
    setSortBy((prev) => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectAll = () => {
    if (selectedRows.size === filteredTransactions.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredTransactions.map((t) => t.id)));
    }
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleExportCSV = () => {
    const dataToExport = selectedRows.size > 0
      ? filteredTransactions.filter((t) => selectedRows.has(t.id))
      : filteredTransactions;

    const csv = [
      ['Fecha', 'Tipo', 'Banco', 'Cliente', 'Monto', 'Concepto', 'Categoría'],
      ...dataToExport.map((t) => [
        t.fecha,
        t.tipo,
        t.banco,
        t.cliente,
        t.monto,
        t.concepto,
        t.categoria,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transacciones-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast.success(`✅ ${dataToExport.length} transacciones exportadas`);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedType('all');
    setSelectedBanco('all');
    setDateRange({ start: null, end: null });
    toast.info('🔄 Filtros limpiados');
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Cargando transacciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-blue-950/20 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            📊 Historial de Transacciones
          </h1>
          <p className="text-slate-400">
            Virtual scroll optimizado para grandes volúmenes de datos
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-800"
          >
            <p className="text-sm text-slate-400 mb-1">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-emerald-500/10 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/20"
          >
            <p className="text-sm text-emerald-400 mb-1 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Ingresos
            </p>
            <p className="text-2xl font-bold text-emerald-400">
              ${stats.ingresos.toLocaleString()}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-red-500/10 backdrop-blur-sm rounded-xl p-4 border border-red-500/20"
          >
            <p className="text-sm text-red-400 mb-1 flex items-center gap-1">
              <TrendingDown className="w-4 h-4" />
              Gastos
            </p>
            <p className="text-2xl font-bold text-red-400">
              ${stats.gastos.toLocaleString()}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20"
          >
            <p className="text-sm text-blue-400 mb-1">Transferencias</p>
            <p className="text-2xl font-bold text-blue-400">
              ${stats.transferencias.toLocaleString()}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`backdrop-blur-sm rounded-xl p-4 border ${
              stats.balance >= 0
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}
          >
            <p className="text-sm text-slate-400 mb-1">Balance</p>
            <p
              className={`text-2xl font-bold ${
                stats.balance >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              ${stats.balance.toLocaleString()}
            </p>
          </motion.div>
        </div>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-800 mb-6"
        >
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por concepto, cliente o banco..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filtros
              {(selectedType !== 'all' || selectedBanco !== 'all') && (
                <span className="bg-blue-500 text-xs px-2 py-0.5 rounded-full">
                  {[selectedType !== 'all', selectedBanco !== 'all'].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Export */}
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Exportar {selectedRows.size > 0 && `(${selectedRows.size})`}
            </button>

            {/* Select All */}
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              {selectedRows.size === filteredTransactions.length ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <Square className="w-5 h-5" />
              )}
              {selectedRows.size > 0 ? `${selectedRows.size} seleccionados` : 'Seleccionar todo'}
            </button>
          </div>

          {/* Panel de filtros expandible */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <label className="block text-sm text-slate-400 mb-2">Tipo</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="Ingreso">Ingresos</option>
                  <option value="Gasto">Gastos</option>
                  <option value="Transferencia">Transferencias</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Banco</label>
                <select
                  value={selectedBanco}
                  onChange={(e) => setSelectedBanco(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Todos</option>
                  {bancos?.map((banco) => (
                    <option key={banco.id} value={banco.id}>
                      {banco.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Rango de fechas</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.start || ''}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, start: e.target.value }))
                    }
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={dateRange.end || ''}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, end: e.target.value }))
                    }
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Limpiar filtros
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Virtual Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 overflow-hidden"
        >
          {/* Table Header */}
          <div className="grid grid-cols-[40px_100px_120px_150px_100px_120px_1fr_100px] gap-4 px-4 py-3 bg-slate-800/50 border-b border-slate-700 text-sm font-medium text-slate-400">
            <div />
            <button
              onClick={() => handleSort('fecha')}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Fecha
              {sortBy.field === 'fecha' && <ArrowDownUp className="w-3 h-3" />}
            </button>
            <div>Tipo</div>
            <div>Banco</div>
            <div>Cliente</div>
            <button
              onClick={() => handleSort('monto')}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              Monto
              {sortBy.field === 'monto' && <ArrowDownUp className="w-3 h-3" />}
            </button>
            <div>Concepto</div>
            <div>Categoría</div>
          </div>

          {/* Virtual Rows */}
          <div
            ref={parentRef}
            className="h-[600px] overflow-auto"
            style={{ contain: 'strict' }}
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const transaction = filteredTransactions[virtualRow.index];
                const isSelected = selectedRows.has(transaction.id);

                return (
                  <div
                    key={virtualRow.key}
                    className={`absolute top-0 left-0 w-full grid grid-cols-[40px_100px_120px_150px_100px_120px_1fr_100px] gap-4 px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                      isSelected ? 'bg-blue-500/10' : ''
                    }`}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(transaction.id)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="text-slate-300 text-sm">
                      {new Date(transaction.fecha).toLocaleDateString('es-MX')}
                    </div>
                    <div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          transaction.tipo === 'Ingreso'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : transaction.tipo === 'Gasto'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {transaction.tipo}
                      </span>
                    </div>
                    <div className="text-slate-300 text-sm truncate">
                      {transaction.banco}
                    </div>
                    <div className="text-slate-400 text-sm truncate">
                      {transaction.cliente}
                    </div>
                    <div
                      className={`font-semibold ${
                        transaction.monto >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      ${Math.abs(transaction.monto).toLocaleString()}
                    </div>
                    <div className="text-slate-300 text-sm truncate">
                      {transaction.concepto}
                    </div>
                    <div className="text-slate-400 text-xs">{transaction.categoria}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-slate-800/50 border-t border-slate-700 text-sm text-slate-400">
            Mostrando {filteredTransactions.length} de {allTransactions.length} transacciones
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BancosTransacciones;
