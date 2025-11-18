/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                     DATA ANALYSIS SERVICE                                  ║
 * ║    Advanced data analysis with zero/empty value exclusion                 ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Features:
 * - Accurate data counting excluding zeros and empty values
 * - Client analysis (31 clients expected)
 * - Purchase order tracking (9 orders expected)
 * - Distributor analysis (2-6 with debt tracking)
 * - Financial analysis (~306 expenses/payments, 96 sales)
 * - Bank balance tracking (RF actual) with historical cuts in USD
 * - Data quality metrics
 * - Advanced analytics and insights
 *
 * @module DataAnalysisService
 * @version 1.0.0
 */

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

/**
 * Verifica si un valor es válido (no cero, no vacío, no null)
 * @param {*} value - Valor a verificar
 * @returns {boolean}
 */
const isValidValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Cuenta elementos válidos excluyendo zeros y valores vacíos
 * @param {Array} items - Array de items a contar
 * @param {string|Function} fieldOrFn - Campo a verificar o función de validación
 * @returns {number}
 */
const countValidItems = (items, fieldOrFn) => {
  if (!items || !Array.isArray(items)) return 0;

  return items.filter((item) => {
    if (typeof fieldOrFn === 'function') {
      return fieldOrFn(item);
    }
    if (typeof fieldOrFn === 'string') {
      return isValidValue(item[fieldOrFn]);
    }
    // Si no se especifica campo, verificar que el objeto tenga datos válidos
    return Object.values(item).some(isValidValue);
  }).length;
};

/**
 * Suma valores válidos excluyendo zeros
 * @param {Array} items - Array de items
 * @param {string|Function} fieldOrFn - Campo numérico o función extractora
 * @returns {number}
 */
const sumValidValues = (items, fieldOrFn) => {
  if (!items || !Array.isArray(items)) return 0;

  return items.reduce((sum, item) => {
    let value;
    if (typeof fieldOrFn === 'function') {
      value = fieldOrFn(item);
    } else if (typeof fieldOrFn === 'string') {
      value = item[fieldOrFn];
    } else {
      return sum;
    }

    if (typeof value === 'number' && value !== 0 && !isNaN(value)) {
      return sum + value;
    }
    return sum;
  }, 0);
};

/**
 * Clase principal de análisis de datos
 */
export class DataAnalysisService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Análisis completo de clientes
   * Excluye clientes con datos en 0 o vacíos en columnas clave
   * Objetivo: 31 clientes válidos
   */
  async analyzeClients() {
    try {
      const clientesRef = collection(this.db, 'clientes');
      const snapshot = await getDocs(clientesRef);
      const allClients = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Contar solo clientes con datos válidos
      const validClients = allClients.filter((cliente) => {
        // Verificar que tenga nombre válido
        if (!isValidValue(cliente.nombre)) return false;

        // Excluir si todas las columnas monetarias están en 0
        const hasValidMonetaryData =
          isValidValue(cliente.limiteCredito) ||
          isValidValue(cliente.saldoPendiente) ||
          isValidValue(cliente.totalCompras);

        return hasValidMonetaryData;
      });

      // Clientes activos (con transacciones recientes o saldo pendiente)
      const activeClients = validClients.filter(
        (c) =>
          (c.saldoPendiente && c.saldoPendiente > 0) ||
          (c.totalCompras && c.totalCompras > 0)
      );

      // Clientes con crédito
      const clientsWithCredit = validClients.filter(
        (c) => c.limiteCredito && c.limiteCredito > 0
      );

      // Clientes con deuda
      const clientsWithDebt = validClients.filter(
        (c) => c.saldoPendiente && c.saldoPendiente > 0
      );

      // Total de saldo pendiente (cuentas por cobrar)
      const totalDebt = sumValidValues(validClients, 'saldoPendiente');

      // Análisis de concentración
      const sortedByDebt = [...clientsWithDebt].sort(
        (a, b) => (b.saldoPendiente || 0) - (a.saldoPendiente || 0)
      );
      const top5Debtors = sortedByDebt.slice(0, 5);

      return {
        total: validClients.length, // Debe ser ~31
        active: activeClients.length,
        withCredit: clientsWithCredit.length,
        withDebt: clientsWithDebt.length,
        withoutDebt: validClients.length - clientsWithDebt.length,
        totalDebt: parseFloat(totalDebt.toFixed(2)),
        top5Debtors: top5Debtors.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          saldoPendiente: c.saldoPendiente,
        })),
        avgDebtPerClient: clientsWithDebt.length
          ? parseFloat((totalDebt / clientsWithDebt.length).toFixed(2))
          : 0,
        dataQuality: {
          totalRecords: allClients.length,
          validRecords: validClients.length,
          invalidRecords: allClients.length - validClients.length,
          validityRate: parseFloat(
            ((validClients.length / allClients.length) * 100).toFixed(2)
          ),
        },
      };
    } catch (error) {
      console.error('Error analyzing clients:', error);
      throw error;
    }
  }

  /**
   * Análisis de órdenes de compra
   * Objetivo: 9 órdenes válidas
   */
  async analyzePurchaseOrders() {
    try {
      const comprasRef = collection(this.db, 'compras');
      const snapshot = await getDocs(comprasRef);
      const allOrders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Órdenes válidas (con monto > 0 y productos)
      const validOrders = allOrders.filter((orden) => {
        const hasValidTotal = orden.total && orden.total > 0;
        const hasProducts =
          orden.productos && Array.isArray(orden.productos) && orden.productos.length > 0;
        return hasValidTotal && hasProducts;
      });

      // Órdenes por estado
      const ordersByStatus = {
        pendiente: validOrders.filter((o) => o.estado === 'pendiente').length,
        recibida: validOrders.filter((o) => o.estado === 'recibida').length,
        cancelada: validOrders.filter((o) => o.estado === 'cancelada').length,
      };

      // Total en compras
      const totalAmount = sumValidValues(validOrders, 'total');

      // Órdenes por distribuidor
      const ordersByDistributor = validOrders.reduce((acc, orden) => {
        const distId = orden.distribuidorId || 'sin-distribuidor';
        if (!acc[distId]) {
          acc[distId] = {
            count: 0,
            total: 0,
            distribuidorNombre: orden.distribuidorNombre || 'Sin nombre',
          };
        }
        acc[distId].count += 1;
        acc[distId].total += orden.total || 0;
        return acc;
      }, {});

      return {
        total: validOrders.length, // Debe ser ~9
        byStatus: ordersByStatus,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        avgOrderValue: validOrders.length
          ? parseFloat((totalAmount / validOrders.length).toFixed(2))
          : 0,
        byDistributor: ordersByDistributor,
        dataQuality: {
          totalRecords: allOrders.length,
          validRecords: validOrders.length,
          invalidRecords: allOrders.length - validOrders.length,
        },
      };
    } catch (error) {
      console.error('Error analyzing purchase orders:', error);
      throw error;
    }
  }

  /**
   * Análisis de distribuidores
   * Objetivo: 2-6 distribuidores, 2 sin deuda
   */
  async analyzeDistributors() {
    try {
      const distRef = collection(this.db, 'distribuidores');
      const snapshot = await getDocs(distRef);
      const allDistributors = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Distribuidores válidos
      const validDistributors = allDistributors.filter((dist) => {
        return isValidValue(dist.nombre) && dist.activo !== false;
      });

      // Obtener compras para calcular deuda
      const comprasRef = collection(this.db, 'compras');
      const comprasSnapshot = await getDocs(comprasRef);
      const compras = comprasSnapshot.docs.map((doc) => doc.data());

      // Calcular deuda por distribuidor
      const distributorsWithDebt = validDistributors.map((dist) => {
        const distCompras = compras.filter(
          (c) => c.distribuidorId === dist.id && c.estado === 'pendiente'
        );
        const totalDebt = sumValidValues(distCompras, 'saldoPendiente');

        return {
          ...dist,
          deuda: totalDebt,
          hasDebt: totalDebt > 0,
          numeroCompras: distCompras.length,
          totalCompras: dist.totalCompras || 0,
        };
      });

      const withDebt = distributorsWithDebt.filter((d) => d.hasDebt);
      const withoutDebt = distributorsWithDebt.filter((d) => !d.hasDebt);

      return {
        total: validDistributors.length, // Debe ser 2-6
        withDebt: withDebt.length,
        withoutDebt: withoutDebt.length, // Debe ser ~2
        totalDebt: parseFloat(
          sumValidValues(distributorsWithDebt, (d) => d.deuda).toFixed(2)
        ),
        list: distributorsWithDebt.map((d) => ({
          id: d.id,
          nombre: d.nombre,
          deuda: d.deuda,
          hasDebt: d.hasDebt,
          numeroCompras: d.numeroCompras,
          totalCompras: d.totalCompras,
        })),
        dataQuality: {
          totalRecords: allDistributors.length,
          validRecords: validDistributors.length,
        },
      };
    } catch (error) {
      console.error('Error analyzing distributors:', error);
      throw error;
    }
  }

  /**
   * Análisis de ventas
   * Objetivo: 96 ventas válidas
   */
  async analyzeSales() {
    try {
      const ventasRef = collection(this.db, 'ventas');
      const snapshot = await getDocs(ventasRef);
      const allSales = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Ventas válidas (con total > 0)
      const validSales = allSales.filter((venta) => {
        return venta.total && venta.total > 0;
      });

      // Ventas por estado
      const salesByStatus = {
        pendiente: validSales.filter((v) => v.estado === 'pendiente').length,
        parcial: validSales.filter((v) => v.estado === 'parcial').length,
        liquidada: validSales.filter((v) => v.estado === 'liquidada').length,
        cancelada: validSales.filter((v) => v.estado === 'cancelada').length,
      };

      // Totales
      const totalSalesAmount = sumValidValues(validSales, 'total');
      const totalPaid = sumValidValues(validSales, 'totalPagado');
      const totalPending = sumValidValues(validSales, 'saldoPendiente');

      return {
        total: validSales.length, // Debe ser ~96
        byStatus: salesByStatus,
        totalAmount: parseFloat(totalSalesAmount.toFixed(2)),
        totalPaid: parseFloat(totalPaid.toFixed(2)),
        totalPending: parseFloat(totalPending.toFixed(2)),
        avgSaleValue: validSales.length
          ? parseFloat((totalSalesAmount / validSales.length).toFixed(2))
          : 0,
        dataQuality: {
          totalRecords: allSales.length,
          validRecords: validSales.length,
          invalidRecords: allSales.length - validSales.length,
        },
      };
    } catch (error) {
      console.error('Error analyzing sales:', error);
      throw error;
    }
  }

  /**
   * Análisis de gastos y pagos
   * Objetivo: ~306 en gastos y abonos
   */
  async analyzeExpensesAndPayments() {
    try {
      const gastosRef = collection(this.db, 'gastos');
      const gastosSnapshot = await getDocs(gastosRef);
      const allExpenses = gastosSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Gastos válidos
      const validExpenses = allExpenses.filter((gasto) => gasto.total && gasto.total > 0);

      // Total de gastos
      const totalExpenses = sumValidValues(validExpenses, 'total');

      // Obtener pagos de ventas (abonos)
      const ventasRef = collection(this.db, 'ventas');
      const ventasSnapshot = await getDocs(ventasRef);
      const ventas = ventasSnapshot.docs.map((doc) => doc.data());

      // Contar todos los pagos/abonos
      let totalPayments = 0;
      let paymentsCount = 0;

      ventas.forEach((venta) => {
        if (venta.pagos && Array.isArray(venta.pagos)) {
          venta.pagos.forEach((pago) => {
            if (pago.monto && pago.monto > 0) {
              totalPayments += pago.monto;
              paymentsCount += 1;
            }
          });
        }
      });

      // Gastos por categoría
      const expensesByCategory = validExpenses.reduce((acc, gasto) => {
        const cat = gasto.categoria || 'otro';
        if (!acc[cat]) {
          acc[cat] = { count: 0, total: 0 };
        }
        acc[cat].count += 1;
        acc[cat].total += gasto.total || 0;
        return acc;
      }, {});

      return {
        expenses: {
          count: validExpenses.length,
          total: parseFloat(totalExpenses.toFixed(2)),
          byCategory: expensesByCategory,
        },
        payments: {
          count: paymentsCount,
          total: parseFloat(totalPayments.toFixed(2)),
        },
        combined: {
          totalTransactions: validExpenses.length + paymentsCount, // Debe ser ~306
          totalAmount: parseFloat((totalExpenses + totalPayments).toFixed(2)),
        },
        dataQuality: {
          expensesRecords: allExpenses.length,
          validExpenses: validExpenses.length,
        },
      };
    } catch (error) {
      console.error('Error analyzing expenses and payments:', error);
      throw error;
    }
  }

  /**
   * Análisis de bancos - RF Actual (Reporte Financiero)
   * Muestra saldo actual y cortes anteriores en USD
   */
  async analyzeBankBalances() {
    try {
      const bancosRef = collection(this.db, 'bancos');
      const snapshot = await getDocs(bancosRef);
      const banks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Obtener movimientos bancarios para calcular histórico
      const movRef = collection(this.db, 'movimientosBancarios');
      const movSnapshot = await getDocs(movRef);
      const movements = movSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Calcular RF Actual (saldo actual) de cada banco
      const bankAnalysis = banks.map((banco) => {
        // Saldo actual del banco
        const saldoActual = banco.saldoActual || banco.capitalActual || 0;

        // Movimientos de este banco
        const bankMovements = movements.filter((m) => m.banco === banco.id || m.bancoId === banco.id);

        // Calcular totales de entradas y salidas
        const totalEntradas = sumValidValues(
          bankMovements.filter((m) => m.tipo === 'entrada' || m.tipo === 'transferencia_entrada'),
          'monto'
        );

        const totalSalidas = sumValidValues(
          bankMovements.filter((m) => m.tipo === 'salida' || m.tipo === 'transferencia_salida'),
          'monto'
        );

        // Calcular cortes históricos (últimos 3 meses)
        const now = new Date();
        const historicalCuts = [];

        for (let i = 0; i < 3; i++) {
          const cutDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const cutMovements = bankMovements.filter((m) => {
            const movDate = m.fecha?.toDate ? m.fecha.toDate() : new Date(m.fecha);
            return movDate < cutDate;
          });

          const cutEntradas = sumValidValues(
            cutMovements.filter((m) => m.tipo === 'entrada' || m.tipo === 'transferencia_entrada'),
            'monto'
          );
          const cutSalidas = sumValidValues(
            cutMovements.filter((m) => m.tipo === 'salida' || m.tipo === 'transferencia_salida'),
            'monto'
          );

          historicalCuts.push({
            periodo: cutDate.toISOString().split('T')[0],
            saldo: parseFloat((cutEntradas - cutSalidas).toFixed(2)),
          });
        }

        return {
          id: banco.id,
          nombre: banco.nombre,
          saldoActual: parseFloat(saldoActual.toFixed(2)), // USD
          totalEntradas: parseFloat(totalEntradas.toFixed(2)),
          totalSalidas: parseFloat(totalSalidas.toFixed(2)),
          numeroMovimientos: bankMovements.length,
          cortesAnteriores: historicalCuts,
          moneda: 'USD',
        };
      });

      // Total consolidado de todos los bancos
      const totalConsolidado = sumValidValues(bankAnalysis, 'saldoActual');

      return {
        bancos: bankAnalysis,
        resumen: {
          totalBancos: banks.length,
          saldoConsolidado: parseFloat(totalConsolidado.toFixed(2)), // USD
          totalEntradas: parseFloat(
            sumValidValues(bankAnalysis, 'totalEntradas').toFixed(2)
          ),
          totalSalidas: parseFloat(
            sumValidValues(bankAnalysis, 'totalSalidas').toFixed(2)
          ),
          moneda: 'USD',
        },
      };
    } catch (error) {
      console.error('Error analyzing bank balances:', error);
      throw error;
    }
  }

  /**
   * Análisis de inventario/almacén (stock actual)
   * Stock actual de productos con valores en USD
   */
  async analyzeInventory() {
    try {
      const productosRef = collection(this.db, 'productos');
      const snapshot = await getDocs(productosRef);
      const allProducts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Productos con stock válido
      const validProducts = allProducts.filter((p) => {
        return isValidValue(p.stock) && p.activo !== false;
      });

      // Calcular valor del inventario
      const inventoryValue = validProducts.reduce((sum, product) => {
        const stock = product.stock || 0;
        const cost = product.costoUnitario || 0;
        return sum + stock * cost;
      }, 0);

      // Productos con stock bajo
      const lowStockProducts = validProducts.filter((p) => {
        return p.stock <= (p.stockMinimo || 0);
      });

      // Productos sin stock
      const outOfStockProducts = validProducts.filter((p) => p.stock === 0);

      return {
        totalProducts: validProducts.length,
        totalStockValue: parseFloat(inventoryValue.toFixed(2)), // USD
        lowStock: lowStockProducts.length,
        outOfStock: outOfStockProducts.length,
        avgStockValue: validProducts.length
          ? parseFloat((inventoryValue / validProducts.length).toFixed(2))
          : 0,
        topValueProducts: validProducts
          .map((p) => ({
            id: p.id,
            nombre: p.nombre,
            stock: p.stock,
            costoUnitario: p.costoUnitario,
            valor: parseFloat(((p.stock || 0) * (p.costoUnitario || 0)).toFixed(2)),
          }))
          .sort((a, b) => b.valor - a.valor)
          .slice(0, 10),
        moneda: 'USD',
      };
    } catch (error) {
      console.error('Error analyzing inventory:', error);
      throw error;
    }
  }

  /**
   * Análisis completo del sistema
   * Retorna todos los análisis en un solo objeto
   */
  async getCompleteAnalysis() {
    try {
      const [
        clients,
        purchaseOrders,
        distributors,
        sales,
        expensesPayments,
        bankBalances,
        inventory,
      ] = await Promise.all([
        this.analyzeClients(),
        this.analyzePurchaseOrders(),
        this.analyzeDistributors(),
        this.analyzeSales(),
        this.analyzeExpensesAndPayments(),
        this.analyzeBankBalances(),
        this.analyzeInventory(),
      ]);

      return {
        timestamp: new Date().toISOString(),
        clients,
        purchaseOrders,
        distributors,
        sales,
        expensesPayments,
        bankBalances,
        inventory,
        summary: {
          clientesValidos: clients.total, // Objetivo: 31
          ordenesCompra: purchaseOrders.total, // Objetivo: 9
          distribuidores: distributors.total, // Objetivo: 2-6
          distribuidoresSinDeuda: distributors.withoutDebt, // Objetivo: 2
          ventas: sales.total, // Objetivo: 96
          gastosYPagos: expensesPayments.combined.totalTransactions, // Objetivo: ~306
          saldoBancosUSD: bankBalances.resumen.saldoConsolidado,
          valorInventarioUSD: inventory.totalStockValue,
        },
      };
    } catch (error) {
      console.error('Error getting complete analysis:', error);
      throw error;
    }
  }

  /**
   * Genera reporte de calidad de datos
   */
  async getDataQualityReport() {
    try {
      const analysis = await this.getCompleteAnalysis();

      return {
        timestamp: analysis.timestamp,
        quality: {
          clients: {
            expected: 31,
            actual: analysis.clients.total,
            validityRate: analysis.clients.dataQuality.validityRate,
            status:
              analysis.clients.total >= 30 && analysis.clients.total <= 32
                ? 'CORRECTO'
                : 'REVISAR',
          },
          purchaseOrders: {
            expected: 9,
            actual: analysis.purchaseOrders.total,
            status: analysis.purchaseOrders.total === 9 ? 'CORRECTO' : 'REVISAR',
          },
          distributors: {
            expected: '2-6',
            actual: analysis.distributors.total,
            withoutDebt: analysis.distributors.withoutDebt,
            status:
              analysis.distributors.total >= 2 &&
              analysis.distributors.total <= 6 &&
              analysis.distributors.withoutDebt === 2
                ? 'CORRECTO'
                : 'REVISAR',
          },
          sales: {
            expected: 96,
            actual: analysis.sales.total,
            status:
              analysis.sales.total >= 95 && analysis.sales.total <= 97 ? 'CORRECTO' : 'REVISAR',
          },
          expensesPayments: {
            expected: '~306',
            actual: analysis.expensesPayments.combined.totalTransactions,
            status:
              Math.abs(analysis.expensesPayments.combined.totalTransactions - 306) <= 10
                ? 'CORRECTO'
                : 'REVISAR',
          },
        },
        recommendations: [],
      };
    } catch (error) {
      console.error('Error generating data quality report:', error);
      throw error;
    }
  }
}

export default DataAnalysisService;
