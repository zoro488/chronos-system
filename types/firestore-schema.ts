/**
 * 🔥 FIRESTORE SCHEMA - CHRONOS SYSTEM
 * Definición completa del esquema de datos para Firestore
 * Basado en los 483 movimientos bancarios + 96 ventas + 9 compras del Excel
 */
import { Timestamp } from 'firebase/firestore';

// ============================================
// COLECCIÓN: ventas
// ============================================

export interface Venta {
  id: string;
  folio: string; // "V-001", "V-002", etc.
  fecha: Timestamp;
  clienteId: string; // Referencia a clientes/{id}
  clienteNombre: string; // Desnormalizado para queries rápidas

  // Productos vendidos (subcollection o array)
  productos: ProductoVenta[];

  // Totales
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;

  // Pagos y saldos
  pagos: Pago[];
  totalPagado: number;
  saldoPendiente: number;

  // Estado
  estado: 'pendiente' | 'parcial' | 'liquidada' | 'cancelada';

  // Metadata
  vendedor?: string;
  notas?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // UID del usuario
}

export interface ProductoVenta {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  descuento?: number;
  total: number;
}

export interface Pago {
  fecha: Timestamp;
  monto: number;
  metodoPago: 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque';
  banco?: BancoId; // Si es transferencia
  referencia?: string;
  notas?: string;
}

// ============================================
// COLECCIÓN: compras
// ============================================

export interface Compra {
  id: string;
  folio: string; // "C-001", "C-002", etc.
  fecha: Timestamp;
  distribuidorId: string;
  distribuidorNombre: string;

  // Productos comprados
  productos: ProductoCompra[];

  // Totales
  subtotal: number;
  iva: number;
  total: number;

  // Pago
  metodoPago: 'efectivo' | 'transferencia' | 'credito';
  banco?: BancoId;
  pagado: boolean;

  // Estado
  estado: 'pendiente' | 'recibida' | 'cancelada';
  fechaRecepcion?: Timestamp;

  // Metadata
  notas?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface ProductoCompra {
  productoId: string;
  nombre: string;
  cantidad: number;
  costoUnitario: number;
  total: number;
}

// ============================================
// COLECCIÓN: movimientosBancarios
// ============================================

export type BancoId =
  | 'bovedaMonte'
  | 'bovedaUsa'
  | 'utilidades'
  | 'fleteSur'
  | 'azteca'
  | 'leftie'
  | 'profit';

export type TipoMovimiento =
  | 'entrada' // Ingreso de dinero
  | 'salida' // Egreso de dinero
  | 'transferencia_entrada' // Transferencia entre cuentas (entrada)
  | 'transferencia_salida'; // Transferencia entre cuentas (salida)

export type CategoriaMovimiento =
  | 'venta' // Abono de venta
  | 'compra' // Pago de compra
  | 'gasto' // Gasto operativo
  | 'transferencia' // Entre cuentas
  | 'pago_deuda' // Pago de deuda/servicio
  | 'ajuste' // Ajuste contable
  | 'otro';

export interface MovimientoBancario {
  id: string;
  banco: BancoId;
  fecha: Timestamp;
  tipo: TipoMovimiento;
  categoria: CategoriaMovimiento;

  // Monto
  monto: number;

  // Descripción y referencia
  concepto: string;
  referencia?: string; // Folio de venta, compra, etc.

  // Relaciones
  ventaId?: string; // Si es abono de venta
  compraId?: string; // Si es pago de compra
  gastoId?: string; // Si es gasto
  transferenciaId?: string; // Si es transferencia

  // Saldos (calculados)
  saldoAnterior: number;
  saldoNuevo: number;

  // Metadata
  notas?: string;
  createdAt: Timestamp;
  createdBy: string;
}

// ============================================
// COLECCIÓN: bancos
// ============================================

export interface Banco {
  id: BancoId;
  nombre: string;
  saldoActual: number;
  saldoInicial: number;

  // Estadísticas
  totalEntradas: number;
  totalSalidas: number;
  numeroMovimientos: number;

  // Configuración
  color: string; // Para UI
  icono?: string;
  activo: boolean;

  // Metadata
  ultimoMovimiento?: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// COLECCIÓN: clientes
// ============================================

export interface Cliente {
  id: string;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  rfc?: string;

  // Crédito
  limiteCredito?: number;
  creditoDisponible: number;
  saldoPendiente: number;

  // Estadísticas
  totalCompras: number;
  numeroVentas: number;
  ultimaCompra?: Timestamp;

  // Metadata
  notas?: string;
  activo: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// COLECCIÓN: distribuidores
// ============================================

export interface Distribuidor {
  id: string;
  nombre: string;
  empresa?: string;
  contacto?: string;
  telefono?: string;
  email?: string;

  // Productos que maneja
  categorias: string[];

  // Términos
  terminosPago?: string;
  diasCredito?: number;

  // Estadísticas
  totalCompras: number;
  numeroOrdenes: number;
  ultimaCompra?: Timestamp;

  // Metadata
  notas?: string;
  activo: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// COLECCIÓN: proveedores
// ============================================

export interface Proveedor {
  id: string;
  nombre: string;
  empresa?: string;
  contacto?: string;
  telefono?: string;
  email?: string;

  // Servicios
  servicios: string[];

  // Estadísticas
  totalGastos: number;
  numeroServicios: number;
  ultimoPago?: Timestamp;

  // Metadata
  notas?: string;
  activo: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// COLECCIÓN: productos
// ============================================

export interface Producto {
  id: string;
  codigo: string; // SKU
  nombre: string;
  descripcion?: string;

  // Categorización
  categoria: string;
  subcategoria?: string;
  marca?: string;

  // Precios
  costoUnitario: number;
  precioVenta: number;
  margen: number; // Calculado: (precioVenta - costoUnitario) / costoUnitario

  // Inventario
  stock: number;
  stockMinimo: number;
  stockMaximo?: number;
  unidadMedida: string; // pza, kg, lt, etc.

  // Proveedor
  distribuidorId?: string;
  distribuidorNombre?: string;

  // Metadata
  activo: boolean;
  imagen?: string; // URL
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// COLECCIÓN: almacen (movimientos de inventario)
// ============================================

export type TipoMovimientoAlmacen = 'entrada' | 'salida' | 'ajuste';
export type MotivoMovimientoAlmacen =
  | 'compra' // Entrada por compra
  | 'venta' // Salida por venta
  | 'devolucion' // Entrada por devolución
  | 'merma' // Salida por merma
  | 'donacion' // Salida por donación
  | 'ajuste_inventario' // Ajuste manual
  | 'otro';

export interface MovimientoAlmacen {
  id: string;
  fecha: Timestamp;
  tipo: TipoMovimientoAlmacen;
  motivo: MotivoMovimientoAlmacen;

  // Producto
  productoId: string;
  productoNombre: string;
  cantidad: number;

  // Stock
  stockAnterior: number;
  stockNuevo: number;

  // Relaciones
  ventaId?: string;
  compraId?: string;

  // Metadata
  notas?: string;
  createdAt: Timestamp;
  createdBy: string;
}

// ============================================
// COLECCIÓN: gastos
// ============================================

export type CategoriaGasto =
  | 'servicios' // Luz, agua, internet, etc.
  | 'nomina' // Sueldos
  | 'mantenimiento' // Reparaciones
  | 'renta' // Renta de local
  | 'transporte' // Combustible, fletes
  | 'marketing' // Publicidad
  | 'oficina' // Papelería, consumibles
  | 'impuestos' // Impuestos
  | 'otro';

export interface Gasto {
  id: string;
  folio: string; // "G-001", "G-002", etc.
  fecha: Timestamp;
  categoria: CategoriaGasto;

  // Monto
  monto: number;
  iva?: number;
  total: number;

  // Descripción
  concepto: string;
  descripcion?: string;

  // Proveedor
  proveedorId?: string;
  proveedorNombre?: string;

  // Pago
  metodoPago: 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque';
  banco?: BancoId;
  referencia?: string;

  // Archivos
  comprobantes?: string[]; // URLs de archivos

  // Metadata
  createdAt: Timestamp;
  createdBy: string;
}

// ============================================
// COLECCIÓN: usuarios
// ============================================

export type RolUsuario = 'admin' | 'gerente' | 'vendedor' | 'almacenista';

export interface Usuario {
  uid: string; // De Firebase Auth
  email: string;
  nombre: string;
  apellido?: string;
  telefono?: string;

  // Rol y permisos
  rol: RolUsuario;
  permisos: {
    ventas: boolean;
    compras: boolean;
    inventario: boolean;
    bancos: boolean;
    reportes: boolean;
    configuracion: boolean;
  };

  // Avatar
  photoURL?: string;

  // Metadata
  activo: boolean;
  ultimoAcceso?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// COLECCIÓN: configuracion
// ============================================

export interface Configuracion {
  id: string; // Singleton: "global"

  // Empresa
  nombreEmpresa: string;
  rfc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  logo?: string;

  // Configuración de ventas
  folioVentas: number; // Último folio usado
  folioCompras: number;
  folioGastos: number;
  iva: number; // Porcentaje de IVA (ej: 16)

  // Configuración de inventario
  alertaStockBajo: boolean;

  // Saldos iniciales de bancos (para migración)
  saldosInicialesBancos: {
    [key in BancoId]: number;
  };

  // Metadata
  updatedAt: Timestamp;
  updatedBy: string;
}

// ============================================
// ÍNDICES COMPUESTOS RECOMENDADOS
// ============================================

/*
FIRESTORE INDEXES NEEDED:

1. ventas:
   - clienteId + fecha (DESC)
   - estado + fecha (DESC)
   - createdAt (DESC)

2. compras:
   - distribuidorId + fecha (DESC)
   - estado + fecha (DESC)

3. movimientosBancarios:
   - banco + fecha (DESC)
   - categoria + fecha (DESC)
   - banco + categoria + fecha (DESC)

4. almacen:
   - productoId + fecha (DESC)
   - tipo + fecha (DESC)

5. gastos:
   - categoria + fecha (DESC)
   - proveedorId + fecha (DESC)

CREAR EN FIREBASE CONSOLE O CON firestore.indexes.json
*/

// ============================================
// SECURITY RULES RECOMENDADAS
// ============================================

/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'admin';
    }

    // Ventas
    match /ventas/{ventaId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated();
      allow delete: if isAdmin();
    }

    // Movimientos bancarios
    match /movimientosBancarios/{movimientoId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated();
      allow delete: if isAdmin();
    }

    // Bancos (solo lectura para no-admins)
    match /bancos/{bancoId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Clientes
    match /clientes/{clienteId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated();
      allow delete: if isAdmin();
    }

    // Productos
    match /productos/{productoId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }

    // Usuarios (solo admins)
    match /usuarios/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Configuración (solo admins)
    match /configuracion/{configId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
*/

// ============================================
// TIPOS AUXILIARES
// ============================================

// Para queries
export interface VentaQuery {
  clienteId?: string;
  estado?: Venta['estado'];
  fechaDesde?: Date;
  fechaHasta?: Date;
  limit?: number;
}

export interface MovimientoQuery {
  banco?: BancoId;
  tipo?: TipoMovimiento;
  categoria?: CategoriaMovimiento;
  fechaDesde?: Date;
  fechaHasta?: Date;
  limit?: number;
}

// Para estadísticas
export interface EstadisticasVentas {
  totalVentas: number;
  totalPagado: number;
  saldoPendiente: number;
  numeroVentas: number;
  ticketPromedio: number;
}

export interface EstadisticasBanco {
  banco: BancoId;
  saldo: number;
  totalEntradas: number;
  totalSalidas: number;
  numeroMovimientos: number;
}

// Export por defecto
export default {
  // Types exportados para uso en la app
};
