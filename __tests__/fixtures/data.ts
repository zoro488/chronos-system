export const mockBancos = [
  {
    id: 'boveda-monte',
    nombre: 'Bóveda Monte',
    capitalActual: 150000,
    historicoIngresos: 50000,
    historicoGastos: 20000,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'utilidades',
    nombre: 'Utilidades',
    capitalActual: 45000,
    historicoIngresos: 30000,
    historicoGastos: 10000,
    createdAt: new Date('2025-01-01'),
  },
];

export const mockClientes = [
  {
    id: 'cliente-001',
    nombre: 'Juan Pérez',
    rfc: 'PERJ850101ABC',
    email: 'juan@test.com',
    telefono: '5551234567',
    direccion: 'Calle 123, CDMX',
    adeudoTotal: 15000,
    ventas: ['venta-001', 'venta-002'],
    historialPagos: [],
    activo: true,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'cliente-002',
    nombre: 'María García',
    rfc: 'GARM900202XYZ',
    email: 'maria@test.com',
    telefono: '5559876543',
    direccion: 'Avenida 456, MTY',
    adeudoTotal: 8500,
    ventas: ['venta-003'],
    historialPagos: [],
    activo: true,
    createdAt: new Date('2025-01-20'),
  },
];

export const mockDistribuidores = [
  {
    id: 'dist-001',
    nombre: 'Distribuidora del Norte',
    origen: 'Monterrey',
    contacto: 'Pedro Martínez',
    telefono: '8181234567',
    email: 'contacto@distnorte.com',
    adeudoTotal: 25000,
    ordenesCompra: ['compra-001', 'compra-002'],
    historialPagos: [],
    activo: true,
    createdAt: new Date('2025-01-05'),
  },
];

// Alias para proveedores (mismo que distribuidores)
export const mockProveedores = mockDistribuidores;

export const mockProductos = [
  {
    id: 'prod-001',
    nombre: 'Producto A Premium',
    categoria: 'Electrónica',
    precioCompra: 500,
    precioVenta: 800,
    stockActual: 50,
    stockMinimo: 10,
    unidad: 'pieza',
    activo: true,
  },
  {
    id: 'prod-002',
    nombre: 'Producto B Estándar',
    categoria: 'Papelería',
    precioCompra: 100,
    precioVenta: 180,
    stockActual: 200,
    stockMinimo: 50,
    unidad: 'pieza',
    activo: true,
  },
];

export const mockVentas = [
  {
    id: 'venta-001',
    clienteId: 'cliente-001',
    productoId: 'prod-001',
    cantidad: 5,
    precioVentaUnidad: 800,
    precioCompraUnidad: 500,
    precioTotalVenta: 4000,
    flete: 500,
    estadoPago: 'PENDIENTE',
    montoPagado: 0,
    fecha: new Date('2025-11-01'),
    createdAt: new Date('2025-11-01'),
  },
  {
    id: 'venta-002',
    clienteId: 'cliente-001',
    productoId: 'prod-002',
    cantidad: 10,
    precioVentaUnidad: 180,
    precioCompraUnidad: 100,
    precioTotalVenta: 1800,
    flete: 500,
    estadoPago: 'PAGADO',
    montoPagado: 2300,
    fecha: new Date('2025-11-05'),
    createdAt: new Date('2025-11-05'),
  },
];

export const mockCompras = [
  {
    id: 'compra-001',
    distribuidorId: 'dist-001',
    productoId: 'prod-001',
    cantidad: 100,
    precioCompraUnidad: 500,
    precioTotalCompra: 50000,
    estadoPago: 'PENDIENTE',
    montoPagado: 0,
    fecha: new Date('2025-10-15'),
    createdAt: new Date('2025-10-15'),
  },
];

export const mockMovimientos = [
  {
    id: 'mov-001',
    bancoId: 'boveda-monte',
    tipo: 'INGRESO',
    monto: 10000,
    concepto: 'Venta de productos',
    categoria: 'VENTA',
    fecha: new Date('2025-11-01'),
    createdAt: new Date('2025-11-01'),
  },
  {
    id: 'mov-002',
    bancoId: 'boveda-monte',
    tipo: 'GASTO',
    monto: -5000,
    concepto: 'Pago a proveedor',
    categoria: 'COMPRA',
    fecha: new Date('2025-11-02'),
    createdAt: new Date('2025-11-02'),
  },
];
