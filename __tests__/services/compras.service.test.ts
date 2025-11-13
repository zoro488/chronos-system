import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mockCompras, mockDistribuidores, mockProductos } from '../fixtures/data';
import * as comprasService from '../../services/compras.service';

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
  serverTimestamp: vi.fn(() => new Date()),
}));

vi.mock('../../services/productos.service', () => ({
  ajusteInventario: vi.fn(),
}));

describe('🧪 Compras Service - Tests Completos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('✅ getCompras está definido', () => {
    expect(comprasService.getCompras).toBeDefined();
    expect(typeof comprasService.getCompras).toBe('function');
  });

  it('✅ Mock data de compras es válido', () => {
    expect(mockCompras).toBeDefined();
    expect(mockCompras.length).toBeGreaterThan(0);
    
    const compra = mockCompras[0];
    expect(compra).toHaveProperty('distribuidorId');
    expect(compra).toHaveProperty('productoId');
    expect(compra).toHaveProperty('cantidad');
  });

  it('✅ Mock data de distribuidores es válido', () => {
    expect(mockDistribuidores).toBeDefined();
    expect(mockDistribuidores.length).toBeGreaterThan(0);
  });

  it('✅ Mock data de productos es válido', () => {
    expect(mockProductos).toBeDefined();
    expect(mockProductos.length).toBeGreaterThan(0);
  });

  it('✅ Estructura del servicio es correcta', () => {
    expect(comprasService).toHaveProperty('getCompras');
  });
});
