/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                      SERVICES INDEX                                        ║
 * ║              Exportaciones centralizadas de servicios                      ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

// Exportar todos los servicios
export * as bancosService from './bancos.service';
export * as clientesService from './clientes.service';
export * as comprasService from './compras.service';
export * as gastosService from './gastos.service';
export * as productosService from './productos.service';
export * as ventasService from './ventas.service';

// Exportaciones individuales para mayor conveniencia
export { default as BancosService } from './bancos.service';
export { default as ClientesService } from './clientes.service';
export { default as ComprasService } from './compras.service';
export { default as GastosService } from './gastos.service';
export { default as ProductosService } from './productos.service';
export { default as VentasService } from './ventas.service';

// Re-exportar funciones específicas para fácil importación
export {
  cancelVenta,
  createVenta,
  deleteVenta,
  getVenta,
  getVentas,
  getVentasByCliente,
  getVentasByMonth,
  getVentasStats,
  registrarPagoParcial,
  updateVenta,
} from './ventas.service';

export {
  createCliente,
  deleteCliente,
  getCliente,
  getClientes,
  searchClientes,
  updateCliente,
} from './clientes.service';

export {
  ajusteInventario,
  createProducto,
  deleteProducto,
  getProducto,
  getProductos,
  getProductosByCategoria,
  getProductosLowStock,
  updateProducto,
} from './productos.service';

export {
  cancelCompra,
  createCompra,
  deleteCompra,
  getCompra,
  getCompras,
  getComprasByProveedor,
  recibirCompra,
  updateCompra,
} from './compras.service';

export {
  createCuentaBancaria,
  createMovimientoBancario,
  deleteCuentaBancaria,
  deleteMovimientoBancario,
  getCuentaBancaria,
  getCuentasBancarias,
  getMovimientosBancarios,
  getSaldoTotalBancos,
  updateCuentaBancaria,
} from './bancos.service';

export {
  createGasto,
  deleteGasto,
  getGasto,
  getGastos,
  getGastosByCategoria,
  getGastosByMonth,
  getGastosStats,
  updateGasto,
} from './gastos.service';
