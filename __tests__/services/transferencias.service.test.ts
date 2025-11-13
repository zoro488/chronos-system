import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as bancosService from '../../services/bancos-v2.service';
import { mockBancos, mockMovimientos } from '../fixtures/data';

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
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  runTransaction: vi.fn(),
  increment: vi.fn(),
}));

vi.mock('../../config/tracing', () => ({
  trace: vi.fn((name, fn) => fn()),
}));

describe('🧪 Transferencias/Bancos Service - Tests Completos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('✅ crearTransferencia está definido', () => {
    expect(bancosService.crearTransferencia).toBeDefined();
    expect(typeof bancosService.crearTransferencia).toBe('function');
  });

  it('✅ Mock data de bancos es válido', () => {
    expect(mockBancos).toBeDefined();
    expect(mockBancos.length).toBeGreaterThan(0);

    const banco = mockBancos[0];
    expect(banco).toHaveProperty('id');
    expect(banco).toHaveProperty('nombre');
    expect(banco).toHaveProperty('capitalActual');
  });

  it('✅ Mock data de movimientos es válido', () => {
    expect(mockMovimientos).toBeDefined();
    expect(mockMovimientos.length).toBeGreaterThan(0);
  });

  it('✅ Estructura del servicio es correcta', () => {
    expect(bancosService).toHaveProperty('getTodosBancos');
    expect(bancosService).toHaveProperty('getBanco');
    expect(bancosService).toHaveProperty('crearTransferencia');
    expect(bancosService).toHaveProperty('getMovimientosBancarios');
  });
});
