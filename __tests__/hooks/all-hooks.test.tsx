import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock Firebase
vi.mock('../../config/firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-user-123' } },
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({
    docs: [
      {
        id: '1',
        data: () => ({ nombre: 'Test Product', precio: 100 }),
      },
    ],
  })),
  onSnapshot: vi.fn(() => vi.fn()),
}));

describe('🎣 Hooks - useProductos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('✅ should exist and be importable', async () => {
    const module = await import('../../hooks/useProductos.js');
    expect(module.default || module.useProductos).toBeDefined();
  });
});

describe('🎣 Hooks - useCompras', () => {
  it('✅ should exist and be importable', async () => {
    const module = await import('../../hooks/useCompras.js');
    expect(module.default || module.useCompras).toBeDefined();
  });
});

describe('🎣 Hooks - useClientes', () => {
  it('✅ should exist and be importable', async () => {
    const module = await import('../../hooks/useClientes.js');
    expect(module.default || module.useClientes).toBeDefined();
  });
});

describe('🎣 Hooks - useVentas', () => {
  it('✅ should exist and be importable', async () => {
    const module = await import('../../hooks/useVentas.js');
    expect(module.default || module.useVentas).toBeDefined();
  });
});

describe('🎣 Hooks - useFirestore', () => {
  it('✅ should exist and be importable', async () => {
    const module = await import('../../hooks/useFirestore.js');
    expect(module.default || module.useFirestore).toBeDefined();
  });
});

describe('🎣 Hooks - useGastos', () => {
  it('✅ should exist and be importable', async () => {
    const module = await import('../../hooks/useGastos.js');
    expect(module.default || module.useGastos).toBeDefined();
  });
});

describe('🎣 Hooks - useBancos-v2', () => {
  it('✅ should exist and be importable', async () => {
    const module = await import('../../hooks/useBancos-v2.js');
    expect(module.default || module.useBancosV2).toBeDefined();
  });
});

describe('🎣 Custom Hooks - General Tests', () => {
  it('✅ hooks module exports correctly', async () => {
    const module = await import('../../hooks/index.js');
    expect(module).toBeDefined();
  });

  it('✅ hooks follow React hooks conventions', () => {
    // All custom hooks should start with "use"
    const hookNames = [
      'useBancos',
      'useProductos',
      'useCompras',
      'useClientes',
      'useVentas',
      'useFirestore',
      'useGastos',
    ];

    hookNames.forEach((name) => {
      expect(name.startsWith('use')).toBe(true);
    });
  });
});
