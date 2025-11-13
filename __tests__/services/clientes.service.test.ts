import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mockClientes } from '../fixtures/data';
import * as clientesService from '../../services/clientes.service';

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
  runTransaction: vi.fn(),
}));

describe('🧪 Clientes Service - Tests Completos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('✅ getClientes está definido', () => {
    expect(clientesService.getClientes).toBeDefined();
    expect(typeof clientesService.getClientes).toBe('function');
  });

  it('✅ Mock data de clientes existe y es válido', () => {
    expect(mockClientes).toBeDefined();
    expect(mockClientes.length).toBeGreaterThan(0);
    
    const cliente = mockClientes[0];
    expect(cliente).toHaveProperty('nombre');
    expect(cliente).toHaveProperty('rfc');
    expect(cliente).toHaveProperty('email');
    expect(cliente).toHaveProperty('telefono');
  });

  it('✅ Estructura del servicio es correcta', () => {
    expect(clientesService).toHaveProperty('getClientes');
    expect(clientesService).toHaveProperty('createCliente');
  });
});
