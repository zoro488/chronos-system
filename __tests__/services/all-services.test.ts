import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Firebase
vi.mock('../../config/firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-user-123' } },
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'mock-collection'),
  doc: vi.fn(() => 'mock-doc'),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  increment: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  runTransaction: vi.fn(),
  onSnapshot: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({ seconds: Date.now() / 1000 })),
    fromDate: vi.fn((date) => ({ seconds: date.getTime() / 1000 })),
  },
}));

describe('🧪 Productos Service - Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('✅ should have getProductos function', async () => {
    const service = await import('../../services/productos.service.js');
    expect(service.getProductos).toBeDefined();
    expect(typeof service.getProductos).toBe('function');
  });

  it('✅ should have createProducto function', async () => {
    const service = await import('../../services/productos.service.js');
    expect(service.createProducto).toBeDefined();
  });

  it('✅ should have updateProducto function', async () => {
    const service = await import('../../services/productos.service.js');
    expect(service.updateProducto).toBeDefined();
  });

  it('✅ should have deleteProducto function', async () => {
    const service = await import('../../services/productos.service.js');
    expect(service.deleteProducto).toBeDefined();
  });
});

describe('🧪 Almacen Service - Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('✅ should have registrarEntrada function', async () => {
    const service = await import('../../services/almacen.service.js');
    expect(service.registrarEntrada).toBeDefined();
    expect(typeof service.registrarEntrada).toBe('function');
  });

  it('✅ should have registrarSalida function', async () => {
    const service = await import('../../services/almacen.service.js');
    expect(service.registrarSalida).toBeDefined();
  });

  it('✅ should have getMovimientosAlmacen function', async () => {
    const service = await import('../../services/almacen.service.js');
    expect(service.getMovimientosAlmacen).toBeDefined();
  });
});

describe('🧪 Gastos Service - Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('✅ should have createGasto function', async () => {
    const service = await import('../../services/gastos.service.js');
    expect(service.createGasto).toBeDefined();
    expect(typeof service.createGasto).toBe('function');
  });

  it('✅ should have getGastos function', async () => {
    const service = await import('../../services/gastos.service.js');
    expect(service.getGastos).toBeDefined();
  });

  it('✅ should have updateGasto function', async () => {
    const service = await import('../../services/gastos.service.js');
    expect(service.updateGasto).toBeDefined();
  });
});

describe('🧪 Distribuidores Service - Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('✅ should have getDistribuidores function', async () => {
    const service = await import('../../services/distribuidores.service.js');
    expect(service.getDistribuidores).toBeDefined();
    expect(typeof service.getDistribuidores).toBe('function');
  });

  it('✅ should have createDistribuidor function', async () => {
    const service = await import('../../services/distribuidores.service.js');
    expect(service.createDistribuidor).toBeDefined();
  });

  it('✅ should have updateDistribuidor function', async () => {
    const service = await import('../../services/distribuidores.service.js');
    expect(service.updateDistribuidor).toBeDefined();
  });
});

describe('🧪 Ordenes Compra Service - Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('✅ should have getOrdenesCompra function', async () => {
    const service = await import('../../services/ordenes-compra.service.js');
    expect(service.getOrdenesCompra).toBeDefined();
    expect(typeof service.getOrdenesCompra).toBe('function');
  });

  it('✅ should have createOrdenCompra function', async () => {
    const service = await import('../../services/ordenes-compra.service.js');
    expect(service.createOrdenCompra).toBeDefined();
  });

  it('✅ should have updateOrdenCompra function', async () => {
    const service = await import('../../services/ordenes-compra.service.js');
    expect(service.updateOrdenCompra).toBeDefined();
  });
});
