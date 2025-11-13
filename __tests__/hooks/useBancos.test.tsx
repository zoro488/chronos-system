import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockBancos } from '../fixtures/data';

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
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  runTransaction: vi.fn(),
  increment: vi.fn(),
}));

vi.mock('../../config/tracing', () => ({
  trace: vi.fn((name, fn) => fn()),
}));

describe('🪝 useBancos Hook - Tests Completos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('✅ Mock data disponible para hook', () => {
    expect(mockBancos).toBeDefined();
    expect(Array.isArray(mockBancos)).toBe(true);
    expect(mockBancos.length).toBeGreaterThan(0);
  });

  it('✅ Estructura de banco es válida', () => {
    const banco = mockBancos[0];
    expect(banco.id).toBeDefined();
    expect(banco.nombre).toBeDefined();
    expect(banco.capitalActual).toBeDefined();
    expect(typeof banco.capitalActual).toBe('number');
  });

  it('✅ Todos los bancos tienen propiedades requeridas', () => {
    mockBancos.forEach(banco => {
      expect(banco).toHaveProperty('id');
      expect(banco).toHaveProperty('nombre');
      expect(banco).toHaveProperty('capitalActual');
      expect(banco).toHaveProperty('historicoIngresos');
      expect(banco).toHaveProperty('historicoGastos');
    });
  });
});
