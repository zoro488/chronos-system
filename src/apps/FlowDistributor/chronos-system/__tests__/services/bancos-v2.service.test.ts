import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config/firebase', () => ({ db: {} }));

const mockGetDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockAddDoc = vi.fn();
const mockRunTransaction = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  addDoc: mockAddDoc,
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  runTransaction: mockRunTransaction,
  Timestamp: { now: vi.fn(() => ({ seconds: Date.now() / 1000 })) },
}));

import {
  getBanco,
  getTodosBancos,
  getSaldoTotalBancos,
  crearTransferencia,
  calcularTotalesBanco,
  crearIngreso,
  createCuentaBancaria,
} from '../../services/bancos-v2.service';

describe('🔥 Tests REALES - bancos-v2.service.js', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('getBanco()', () => {
    it('✅ debe retornar banco con ID', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: 'boveda-monte',
        data: () => ({ nombre: 'Bóveda Monte', capitalActual: 150000 }),
      });
      const result = await getBanco('boveda-monte');
      expect(result).toEqual({ id: 'boveda-monte', nombre: 'Bóveda Monte', capitalActual: 150000 });
    });

    it('❌ debe retornar null si no existe', async () => {
      mockGetDoc.mockResolvedValue({ exists: () => false });
      expect(await getBanco('inexistente')).toBeNull();
    });
  });

  describe('getTodosBancos()', () => {
    it('✅ debe mapear docs con IDs', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          { id: 'b1', data: () => ({ nombre: 'B1', capitalActual: 100 }) },
          { id: 'b2', data: () => ({ nombre: 'B2', capitalActual: 200 }) },
        ],
      });
      const result = await getTodosBancos();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('b1');
    });
  });

  describe('getSaldoTotalBancos()', () => {
    it('✅ debe sumar 150k+45k+25k=220k', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          { data: () => ({ capitalActual: 150000 }) },
          { data: () => ({ capitalActual: 45000 }) },
          { data: () => ({ capitalActual: 25000 }) },
        ],
      });
      expect(await getSaldoTotalBancos()).toBe(220000);
    });
  });

  describe('crearTransferencia()', () => {
    it('✅ debe crear con fondos suficientes', async () => {
      mockRunTransaction.mockImplementation(async (db, cb) => {
        const t = {
          get: vi.fn().mockResolvedValue({ exists: () => true, data: () => ({ capitalActual: 150000 }) }),
          set: vi.fn(),
          update: vi.fn(),
        };
        return await cb(t);
      });
      const result = await crearTransferencia({ bancoOrigen: 'b1', bancoDestino: 'b2', monto: 20000, concepto: 'Test' });
      expect(result).toHaveProperty('salidaId');
    });

    it('❌ debe rechazar sin fondos', async () => {
      mockRunTransaction.mockImplementation(async (db, cb) => {
        const t = { get: vi.fn().mockResolvedValue({ exists: () => true, data: () => ({ capitalActual: 5000 }) }) };
        return await cb(t);
      });
      await expect(crearTransferencia({ bancoOrigen: 'b1', bancoDestino: 'b2', monto: 20000, concepto: 'Test' })).rejects.toThrow();
    });
  });

  describe('calcularTotalesBanco()', () => {
    it('✅ calcula ingresos=15k, gastos=5k', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          { data: () => ({ tipo: 'INGRESO', monto: 10000 }) },
          { data: () => ({ tipo: 'INGRESO', monto: 5000 }) },
          { data: () => ({ tipo: 'GASTO', monto: -3000 }) },
          { data: () => ({ tipo: 'GASTO', monto: -2000 }) },
        ],
      });
      const result = await calcularTotalesBanco('b1');
      expect(result.ingresos).toBe(15000);
      expect(result.gastos).toBe(5000);
    });
  });

  describe('crearIngreso()', () => {
    it('✅ agrega tipo INGRESO', async () => {
      mockAddDoc.mockResolvedValue({ id: 'ing-123' });
      await crearIngreso({ bancoId: 'test', monto: 1000, concepto: 'Test' });
      expect(mockAddDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ tipo: 'INGRESO' }));
    });
  });

  describe('createCuentaBancaria()', () => {
    it('✅ inicializa capitalActual=0', async () => {
      mockAddDoc.mockResolvedValue({ id: 'nuevo' });
      await createCuentaBancaria({ nombre: 'Nuevo' });
      expect(mockAddDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ capitalActual: 0 }));
    });
  });
});
