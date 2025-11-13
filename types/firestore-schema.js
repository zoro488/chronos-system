/**
 * 🔥 FIRESTORE SCHEMA - CHRONOS SYSTEM (JSDoc version)
 * Definición completa del esquema de datos para Firestore
 * Basado en los 483 movimientos bancarios + 96 ventas + 9 compras del Excel
 */

// ============================================
// TIPOS BASE
// ============================================

/**
 * @typedef {'bovedaMonte' | 'bovedaUsa' | 'utilidades' | 'fleteSur' | 'azteca' | 'leftie' | 'profit'} BancoId
 */

/**
 * @typedef {'entrada' | 'salida' | 'transferencia_entrada' | 'transferencia_salida'} TipoMovimiento
 */

/**
 * @typedef {'venta' | 'compra' | 'gasto' | 'transferencia' | 'pago_deuda' | 'ajuste' | 'otro'} CategoriaMovimiento
 */

/**
 * @typedef {'efectivo' | 'transferencia' | 'tarjeta' | 'cheque'} MetodoPago
 */

/**
 * @typedef {'pendiente' | 'parcial' | 'liquidada' | 'cancelada'} EstadoVenta
 */

/**
 * @typedef {'pendiente' | 'recibida' | 'cancelada'} EstadoCompra
 */

/**
 * @typedef {'entrada' | 'salida' | 'ajuste'} TipoMovimientoAlmacen
 */

/**
 * @typedef {'compra' | 'venta' | 'devolucion' | 'merma' | 'donacion' | 'ajuste_inventario' | 'otro'} MotivoMovimientoAlmacen
 */

/**
 * @typedef {'servicios' | 'nomina' | 'mantenimiento' | 'renta' | 'transporte' | 'marketing' | 'oficina' | 'impuestos' | 'otro'} CategoriaGasto
 */

/**
 * @typedef {'admin' | 'gerente' | 'vendedor' | 'almacenista'} RolUsuario
 */

// ============================================
// VENTAS
// ============================================

/**
 * @typedef {Object} ProductoVenta
 * @property {string} productoId - ID del producto
 * @property {string} nombre - Nombre del producto
 * @property {number} cantidad - Cantidad vendida
 * @property {number} precioUnitario - Precio por unidad
 * @property {number} subtotal - Cantidad * precioUnitario
 * @property {number} [descuento] - Descuento aplicado
 * @property {number} total - Subtotal - descuento
 */

/**
 * @typedef {Object} Pago
 * @property {import('firebase/firestore').Timestamp} fecha - Fecha del pago
 * @property {number} monto - Monto pagado
 * @property {MetodoPago} metodoPago - Método de pago
 * @property {BancoId} [banco] - Banco (si es transferencia)
 * @property {string} [referencia] - Referencia del pago
 * @property {string} [notas] - Notas adicionales
 */

/**
 * @typedef {Object} Venta
 * @property {string} id - ID del documento
 * @property {string} folio - Folio de venta (V-001, V-002, etc.)
 * @property {import('firebase/firestore').Timestamp} fecha - Fecha de la venta
 * @property {string} clienteId - ID del cliente
 * @property {string} clienteNombre - Nombre del cliente (desnormalizado)
 * @property {ProductoVenta[]} productos - Productos vendidos
 * @property {number} subtotal - Subtotal de la venta
 * @property {number} descuento - Descuento total
 * @property {number} iva - IVA calculado
 * @property {number} total - Total de la venta
 * @property {Pago[]} pagos - Pagos realizados
 * @property {number} totalPagado - Total pagado hasta ahora
 * @property {number} saldoPendiente - Saldo pendiente
 * @property {EstadoVenta} estado - Estado de la venta
 * @property {string} [vendedor] - Nombre del vendedor
 * @property {string} [notas] - Notas adicionales
 * @property {import('firebase/firestore').Timestamp} createdAt - Fecha de creación
 * @property {import('firebase/firestore').Timestamp} updatedAt - Última actualización
 * @property {string} createdBy - UID del usuario que creó
 */

// ============================================
// COMPRAS
// ============================================

/**
 * @typedef {Object} ProductoCompra
 * @property {string} productoId - ID del producto
 * @property {string} nombre - Nombre del producto
 * @property {number} cantidad - Cantidad comprada
 * @property {number} costoUnitario - Costo por unidad
 * @property {number} total - Total del producto
 */

/**
 * @typedef {Object} Compra
 * @property {string} id - ID del documento
 * @property {string} folio - Folio de compra (C-001, C-002, etc.)
 * @property {import('firebase/firestore').Timestamp} fecha - Fecha de la compra
 * @property {string} distribuidorId - ID del distribuidor
 * @property {string} distribuidorNombre - Nombre del distribuidor
 * @property {ProductoCompra[]} productos - Productos comprados
 * @property {number} subtotal - Subtotal de la compra
 * @property {number} iva - IVA calculado
 * @property {number} total - Total de la compra
 * @property {MetodoPago} metodoPago - Método de pago
 * @property {BancoId} [banco] - Banco (si es transferencia)
 * @property {boolean} pagado - Si está pagada
 * @property {EstadoCompra} estado - Estado de la compra
 * @property {import('firebase/firestore').Timestamp} [fechaRecepcion] - Fecha de recepción
 * @property {string} [notas] - Notas adicionales
 * @property {import('firebase/firestore').Timestamp} createdAt - Fecha de creación
 * @property {import('firebase/firestore').Timestamp} updatedAt - Última actualización
 * @property {string} createdBy - UID del usuario
 */

// ============================================
// MOVIMIENTOS BANCARIOS
// ============================================

/**
 * @typedef {Object} MovimientoBancario
 * @property {string} id - ID del documento
 * @property {BancoId} banco - ID del banco
 * @property {import('firebase/firestore').Timestamp} fecha - Fecha del movimiento
 * @property {TipoMovimiento} tipo - Tipo de movimiento
 * @property {CategoriaMovimiento} categoria - Categoría del movimiento
 * @property {number} monto - Monto del movimiento
 * @property {string} concepto - Concepto/descripción
 * @property {string} [referencia] - Referencia (folio)
 * @property {string} [ventaId] - ID de venta relacionada
 * @property {string} [compraId] - ID de compra relacionada
 * @property {string} [gastoId] - ID de gasto relacionado
 * @property {string} [transferenciaId] - ID de transferencia
 * @property {number} saldoAnterior - Saldo antes del movimiento
 * @property {number} saldoNuevo - Saldo después del movimiento
 * @property {string} [notas] - Notas adicionales
 * @property {import('firebase/firestore').Timestamp} createdAt - Fecha de creación
 * @property {string} createdBy - UID del usuario
 */

// ============================================
// BANCOS
// ============================================

/**
 * @typedef {Object} Banco
 * @property {BancoId} id - ID del banco
 * @property {string} nombre - Nombre del banco
 * @property {number} saldoActual - Saldo actual
 * @property {number} saldoInicial - Saldo inicial
 * @property {number} totalEntradas - Total de entradas
 * @property {number} totalSalidas - Total de salidas
 * @property {number} numeroMovimientos - Número de movimientos
 * @property {string} color - Color para UI
 * @property {string} [icono] - Ícono del banco
 * @property {boolean} activo - Si está activo
 * @property {import('firebase/firestore').Timestamp} [ultimoMovimiento] - Último movimiento
 * @property {import('firebase/firestore').Timestamp} updatedAt - Última actualización
 */

// ============================================
// CLIENTES
// ============================================

/**
 * @typedef {Object} Cliente
 * @property {string} id - ID del documento
 * @property {string} nombre - Nombre completo
 * @property {string} [telefono] - Teléfono
 * @property {string} [email] - Email
 * @property {string} [direccion] - Dirección
 * @property {string} [rfc] - RFC
 * @property {number} [limiteCredito] - Límite de crédito
 * @property {number} creditoDisponible - Crédito disponible
 * @property {number} saldoPendiente - Saldo pendiente
 * @property {number} totalCompras - Total de compras
 * @property {number} numeroVentas - Número de ventas
 * @property {import('firebase/firestore').Timestamp} [ultimaCompra] - Última compra
 * @property {string} [notas] - Notas
 * @property {boolean} activo - Si está activo
 * @property {import('firebase/firestore').Timestamp} createdAt - Fecha de creación
 * @property {import('firebase/firestore').Timestamp} updatedAt - Última actualización
 */

// ============================================
// DISTRIBUIDORES
// ============================================

/**
 * @typedef {Object} Distribuidor
 * @property {string} id - ID del documento
 * @property {string} nombre - Nombre
 * @property {string} [empresa] - Nombre de empresa
 * @property {string} [contacto] - Persona de contacto
 * @property {string} [telefono] - Teléfono
 * @property {string} [email] - Email
 * @property {string[]} categorias - Categorías de productos
 * @property {string} [terminosPago] - Términos de pago
 * @property {number} [diasCredito] - Días de crédito
 * @property {number} totalCompras - Total de compras
 * @property {number} numeroOrdenes - Número de órdenes
 * @property {import('firebase/firestore').Timestamp} [ultimaCompra] - Última compra
 * @property {string} [notas] - Notas
 * @property {boolean} activo - Si está activo
 * @property {import('firebase/firestore').Timestamp} createdAt - Fecha de creación
 * @property {import('firebase/firestore').Timestamp} updatedAt - Última actualización
 */

// ============================================
// PROVEEDORES
// ============================================

/**
 * @typedef {Object} Proveedor
 * @property {string} id - ID del documento
 * @property {string} nombre - Nombre
 * @property {string} [empresa] - Nombre de empresa
 * @property {string} [contacto] - Persona de contacto
 * @property {string} [telefono] - Teléfono
 * @property {string} [email] - Email
 * @property {string[]} servicios - Servicios que ofrece
 * @property {number} totalGastos - Total de gastos
 * @property {number} numeroServicios - Número de servicios
 * @property {import('firebase/firestore').Timestamp} [ultimoPago] - Último pago
 * @property {string} [notas] - Notas
 * @property {boolean} activo - Si está activo
 * @property {import('firebase/firestore').Timestamp} createdAt - Fecha de creación
 * @property {import('firebase/firestore').Timestamp} updatedAt - Última actualización
 */

// ============================================
// PRODUCTOS
// ============================================

/**
 * @typedef {Object} Producto
 * @property {string} id - ID del documento
 * @property {string} codigo - SKU del producto
 * @property {string} nombre - Nombre del producto
 * @property {string} [descripcion] - Descripción
 * @property {string} categoria - Categoría
 * @property {string} [subcategoria] - Subcategoría
 * @property {string} [marca] - Marca
 * @property {number} costoUnitario - Costo unitario
 * @property {number} precioVenta - Precio de venta
 * @property {number} margen - Margen de ganancia
 * @property {number} stock - Stock actual
 * @property {number} stockMinimo - Stock mínimo
 * @property {number} [stockMaximo] - Stock máximo
 * @property {string} unidadMedida - Unidad de medida (pza, kg, lt, etc.)
 * @property {string} [distribuidorId] - ID del distribuidor
 * @property {string} [distribuidorNombre] - Nombre del distribuidor
 * @property {boolean} activo - Si está activo
 * @property {string} [imagen] - URL de imagen
 * @property {import('firebase/firestore').Timestamp} createdAt - Fecha de creación
 * @property {import('firebase/firestore').Timestamp} updatedAt - Última actualización
 */

// ============================================
// ALMACÉN
// ============================================

/**
 * @typedef {Object} MovimientoAlmacen
 * @property {string} id - ID del documento
 * @property {import('firebase/firestore').Timestamp} fecha - Fecha del movimiento
 * @property {TipoMovimientoAlmacen} tipo - Tipo de movimiento
 * @property {MotivoMovimientoAlmacen} motivo - Motivo del movimiento
 * @property {string} productoId - ID del producto
 * @property {string} productoNombre - Nombre del producto
 * @property {number} cantidad - Cantidad
 * @property {number} stockAnterior - Stock anterior
 * @property {number} stockNuevo - Stock nuevo
 * @property {string} [ventaId] - ID de venta relacionada
 * @property {string} [compraId] - ID de compra relacionada
 * @property {string} [notas] - Notas
 * @property {import('firebase/firestore').Timestamp} createdAt - Fecha de creación
 * @property {string} createdBy - UID del usuario
 */

// ============================================
// GASTOS
// ============================================

/**
 * @typedef {Object} Gasto
 * @property {string} id - ID del documento
 * @property {string} folio - Folio del gasto (G-001, G-002, etc.)
 * @property {import('firebase/firestore').Timestamp} fecha - Fecha del gasto
 * @property {CategoriaGasto} categoria - Categoría del gasto
 * @property {number} monto - Monto del gasto
 * @property {number} [iva] - IVA
 * @property {number} total - Total
 * @property {string} concepto - Concepto
 * @property {string} [descripcion] - Descripción detallada
 * @property {string} [proveedorId] - ID del proveedor
 * @property {string} [proveedorNombre] - Nombre del proveedor
 * @property {MetodoPago} metodoPago - Método de pago
 * @property {BancoId} [banco] - Banco (si es transferencia)
 * @property {string} [referencia] - Referencia
 * @property {string[]} [comprobantes] - URLs de comprobantes
 * @property {import('firebase/firestore').Timestamp} createdAt - Fecha de creación
 * @property {string} createdBy - UID del usuario
 */

// ============================================
// USUARIOS
// ============================================

/**
 * @typedef {Object} PermisosUsuario
 * @property {boolean} ventas - Acceso a ventas
 * @property {boolean} compras - Acceso a compras
 * @property {boolean} inventario - Acceso a inventario
 * @property {boolean} bancos - Acceso a bancos
 * @property {boolean} reportes - Acceso a reportes
 * @property {boolean} configuracion - Acceso a configuración
 */

/**
 * @typedef {Object} Usuario
 * @property {string} uid - UID de Firebase Auth
 * @property {string} email - Email
 * @property {string} nombre - Nombre
 * @property {string} [apellido] - Apellido
 * @property {string} [telefono] - Teléfono
 * @property {RolUsuario} rol - Rol del usuario
 * @property {PermisosUsuario} permisos - Permisos del usuario
 * @property {string} [photoURL] - URL de foto
 * @property {boolean} activo - Si está activo
 * @property {import('firebase/firestore').Timestamp} [ultimoAcceso] - Último acceso
 * @property {import('firebase/firestore').Timestamp} createdAt - Fecha de creación
 * @property {import('firebase/firestore').Timestamp} updatedAt - Última actualización
 */

// ============================================
// CONFIGURACIÓN
// ============================================

/**
 * @typedef {Object} SaldosInicialesBancos
 * @property {number} bovedaMonte
 * @property {number} bovedaUsa
 * @property {number} utilidades
 * @property {number} fleteSur
 * @property {number} azteca
 * @property {number} leftie
 * @property {number} profit
 */

/**
 * @typedef {Object} Configuracion
 * @property {string} id - ID del documento (siempre "global")
 * @property {string} nombreEmpresa - Nombre de la empresa
 * @property {string} [rfc] - RFC
 * @property {string} [direccion] - Dirección
 * @property {string} [telefono] - Teléfono
 * @property {string} [email] - Email
 * @property {string} [logo] - URL del logo
 * @property {number} folioVentas - Último folio de ventas usado
 * @property {number} folioCompras - Último folio de compras usado
 * @property {number} folioGastos - Último folio de gastos usado
 * @property {number} iva - Porcentaje de IVA (ej: 16)
 * @property {boolean} alertaStockBajo - Si alertar stock bajo
 * @property {SaldosInicialesBancos} saldosInicialesBancos - Saldos iniciales
 * @property {import('firebase/firestore').Timestamp} updatedAt - Última actualización
 * @property {string} updatedBy - UID del usuario
 */

// ============================================
// COLECCIONES FIRESTORE
// ============================================

export const COLECCIONES = {
  VENTAS: 'ventas',
  COMPRAS: 'compras',
  MOVIMIENTOS_BANCARIOS: 'movimientosBancarios',
  BANCOS: 'bancos',
  CLIENTES: 'clientes',
  DISTRIBUIDORES: 'distribuidores',
  PROVEEDORES: 'proveedores',
  PRODUCTOS: 'productos',
  ALMACEN: 'almacen',
  GASTOS: 'gastos',
  USUARIOS: 'usuarios',
  CONFIGURACION: 'configuracion',
};

// ============================================
// CONFIGURACIÓN INICIAL DE BANCOS
// ============================================

export const BANCOS_INICIALES = [
  { id: 'bovedaMonte', nombre: 'Bóveda Monte', color: '#3b82f6', icono: '🏦' },
  { id: 'bovedaUsa', nombre: 'Bóveda USA', color: '#10b981', icono: '💵' },
  { id: 'utilidades', nombre: 'Utilidades', color: '#f59e0b', icono: '💰' },
  { id: 'fleteSur', nombre: 'Flete Sur', color: '#ef4444', icono: '🚚' },
  { id: 'azteca', nombre: 'Azteca', color: '#8b5cf6', icono: '🏛️' },
  { id: 'leftie', nombre: 'Leftie', color: '#ec4899', icono: '🏪' },
  { id: 'profit', nombre: 'Profit', color: '#14b8a6', icono: '📈' },
];

export default {
  COLECCIONES,
  BANCOS_INICIALES,
};
