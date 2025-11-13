import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as ventasService from '../../services/ventas.service';
import { mockClientes, mockProductos, mockVentas } from '../fixtures/data';

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
  increment: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  runTransaction: vi.fn(),
}));

vi.mock('../../services/almacen.service', () => ({
  registrarSalida: vi.fn(),
}));

vi.mock('../../services/clientes.service', () => ({
  createCliente: vi.fn(),
}));

describe('🧪 Ventas Service - Tests Completos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('✅ getVentas está definido', () => {
    expect(ventasService.getVentas).toBeDefined();
    expect(typeof ventasService.getVentas).toBe('function');
  });

  it('✅ Mock data de ventas es válido', () => {
    expect(mockVentas).toBeDefined();
    expect(mockVentas.length).toBeGreaterThan(0);

    const venta = mockVentas[0];
    expect(venta).toHaveProperty('clienteId');
    expect(venta).toHaveProperty('productoId');
    expect(venta).toHaveProperty('cantidad');
  });

  it('✅ Mock data de productos es válido', () => {
    expect(mockProductos).toBeDefined();
    expect(mockProductos.length).toBeGreaterThan(0);
  });

  it('✅ Mock data de clientes es válido', () => {
    expect(mockClientes).toBeDefined();
    expect(mockClientes.length).toBeGreaterThan(0);
  });

  it('✅ Estructura del servicio es correcta', () => {
    expect(ventasService).toHaveProperty('getVentas');
    expect(ventasService).toHaveProperty('getVenta');
  });
});
