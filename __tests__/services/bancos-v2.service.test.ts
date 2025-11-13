/**
 * BANCOS SERVICE TESTS
 * Unit tests for bancos-v2.service.js
 */

import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as BancosService from '../../../services/bancos-v2.service';

// Mock Firebase functions
vi.mock('firebase/firestore');

describe('BancosService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getIngresos', () => {
    it('should fetch ingresos for a given banco', async () => {
      const mockIngresos = [
        { id: '1', Concepto: 'Venta', Ingreso: 1000, Fecha: new Date() },
        { id: '2', Concepto: 'Depósito', Ingreso: 500, Fecha: new Date() },
      ];

      // Mock Firestore response
      (getDocs as any).mockResolvedValue({
        docs: mockIngresos.map((ing) => ({
          id: ing.id,
          data: () => ({ Concepto: ing.Concepto, Ingreso: ing.Ingreso, Fecha: ing.Fecha }),
        })),
      });

      const result = await BancosService.getIngresos('profit');

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', '1');
      expect(result[0]).toHaveProperty('Concepto', 'Venta');
      expect(collection).toHaveBeenCalled();
      expect(getDocs).toHaveBeenCalled();
    });

    it('should handle empty results', async () => {
      (getDocs as any).mockResolvedValue({ docs: [] });

      const result = await BancosService.getIngresos('azteca');

      expect(result).toHaveLength(0);
    });

    it('should handle errors gracefully', async () => {
      (getDocs as any).mockRejectedValue(new Error('Firestore error'));

      await expect(BancosService.getIngresos('profit')).rejects.toThrow('Firestore error');
    });
  });

  describe('crearIngreso', () => {
    it('should create a new ingreso', async () => {
      const mockIngreso = {
        Concepto: 'Nueva Venta',
        Ingreso: 1500,
        Fecha: new Date(),
        Referencia: 'REF-001',
      };

      (addDoc as any).mockResolvedValue({ id: 'new-id' });

      const result = await BancosService.crearIngreso('profit', mockIngreso);

      expect(result).toBe('new-id');
      expect(addDoc).toHaveBeenCalled();
    });

    it('should add timestamps automatically', async () => {
      const mockIngreso = {
        Concepto: 'Venta',
        Ingreso: 1000,
        Fecha: new Date(),
      };

      (addDoc as any).mockImplementation((col, data) => {
        expect(data).toHaveProperty('createdAt');
        expect(data).toHaveProperty('updatedAt');
        return Promise.resolve({ id: 'test-id' });
      });

      await BancosService.crearIngreso('boveda_monte', mockIngreso);
    });
  });

  describe('actualizarIngreso', () => {
    it('should update an existing ingreso', async () => {
      const updates = { Ingreso: 2000, Referencia: 'REF-002' };

      (updateDoc as any).mockResolvedValue(undefined);

      await BancosService.actualizarIngreso('profit', 'ingreso-1', updates);

      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('eliminarIngreso', () => {
    it('should delete an ingreso', async () => {
      (deleteDoc as any).mockResolvedValue(undefined);

      await BancosService.eliminarIngreso('profit', 'ingreso-1');

      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('subscribeToIngresos', () => {
    it('should setup real-time listener for ingresos', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      (onSnapshot as any).mockReturnValue(mockUnsubscribe);

      const unsubscribe = BancosService.subscribeToIngresos('profit', mockCallback);

      expect(onSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should transform data correctly in subscription', () => {
      const mockCallback = vi.fn();
      const mockDocs = [
        {
          id: '1',
          data: () => ({ Concepto: 'Venta', Ingreso: 1000, Fecha: { toDate: () => new Date() } }),
        },
        {
          id: '2',
          data: () => ({ Concepto: 'Depósito', Ingreso: 500, Fecha: { toDate: () => new Date() } }),
        },
      ];

      (onSnapshot as any).mockImplementation((q, callback) => {
        callback({ docs: mockDocs });
        return vi.fn();
      });

      BancosService.subscribeToIngresos('profit', mockCallback);

      expect(mockCallback).toHaveBeenCalled();
      const callArg = mockCallback.mock.calls[0][0];
      expect(callArg).toHaveLength(2);
      expect(callArg[0]).toHaveProperty('id', '1');
    });
  });

  describe('calcularTotalesBanco', () => {
    it('should calculate totals correctly', async () => {
      const mockIngresos = [
        { Ingreso: 1000 },
        { Ingreso: 500 },
        { Ingreso: 300 },
      ];
      const mockGastos = [
        { Gasto: 200 },
        { Gasto: 150 },
      ];

      (getDocs as any)
        .mockResolvedValueOnce({
          docs: mockIngresos.map((ing) => ({ data: () => ing })),
        })
        .mockResolvedValueOnce({
          docs: mockGastos.map((gas) => ({ data: () => gas })),
        });

      const result = await BancosService.calcularTotalesBanco('profit');

      expect(result.totalIngresos).toBe(1800);
      expect(result.totalGastos).toBe(350);
      expect(result.balance).toBe(1450);
      expect(result.cantidadIngresos).toBe(3);
      expect(result.cantidadGastos).toBe(2);
    });

    it('should handle zero values', async () => {
      (getDocs as any)
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({ docs: [] });

      const result = await BancosService.calcularTotalesBanco('azteca');

      expect(result.totalIngresos).toBe(0);
      expect(result.totalGastos).toBe(0);
      expect(result.balance).toBe(0);
    });
  });

  describe('getBancoName', () => {
    it('should return correct banco names', () => {
      expect(BancosService.getBancoName('profit')).toBe('Profit');
      expect(BancosService.getBancoName('boveda_monte')).toBe('Bóveda Monte');
      expect(BancosService.getBancoName('boveda_usa')).toBe('Bóveda USA');
      expect(BancosService.getBancoName('azteca')).toBe('Azteca');
    });

    it('should handle unknown banco IDs', () => {
      expect(BancosService.getBancoName('unknown')).toBe('unknown');
    });
  });

  describe('RF Actual', () => {
    it('should fetch RF Actual', async () => {
      const mockRF = { capital: 50000, fecha: new Date() };

      (getDocs as any).mockResolvedValue({
        docs: [{ id: 'rf-1', data: () => mockRF }],
      });

      const result = await BancosService.getRFActual();

      expect(result).toHaveProperty('capital', 50000);
    });

    it('should return null if RF Actual not found', async () => {
      (getDocs as any).mockResolvedValue({ docs: [] });

      const result = await BancosService.getRFActual();

      expect(result).toBeNull();
    });
  });
});
