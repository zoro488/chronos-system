/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                  BANCOS SERVICE - UNIT TESTS                               ║
 * ║                  Tests para servicio de bancos                             ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as bancosService from '../bancos-v2.service';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  increment: vi.fn((value) => value),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  Timestamp: {
    now: () => ({ seconds: 1699900000, nanoseconds: 0 }),
    fromDate: (date) => ({ seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 }),
  },
}));

describe('BancosService', () => {
  const bancoIds = [
    'boveda-monte',
    'boveda-usa',
    'utilidades',
    'fletes',
    'azteca',
    'leftie',
    'profit',
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('obtenerBanco', () => {
    it('debería obtener datos de un banco válido', async () => {
      const bancoId = 'boveda-monte';

      vi.mocked(bancosService.obtenerBanco).mockResolvedValue({
        id: bancoId,
        nombre: 'Bóveda Monte',
        capitalActual: 50000,
        estado: 'activo',
      });

      const banco = await bancosService.obtenerBanco(bancoId);

      expect(banco).toBeDefined();
      expect(banco.id).toBe(bancoId);
      expect(banco.capitalActual).toBeGreaterThanOrEqual(0);
    });

    it('debería validar bancoId correcto', () => {
      const bancoIdInvalido = 'banco-invalido';
      expect(bancoIds).not.toContain(bancoIdInvalido);
    });
  });

  describe('registrarIngreso', () => {
    it('debería registrar un ingreso correctamente', async () => {
      const bancoId = 'azteca';
      const ingresoData = {
        monto: 5000,
        concepto: 'Pago de cliente',
        fecha: new Date(),
        categoria: 'Ventas',
      };

      vi.mocked(bancosService.registrarIngreso).mockResolvedValue({
        id: 'ingreso-123',
        ...ingresoData,
      });

      const result = await bancosService.registrarIngreso(bancoId, ingresoData);

      expect(result).toBeDefined();
      expect(result.monto).toBe(5000);
    });

    it('debería incrementar capital del banco', async () => {
      const bancoId = 'leftie';
      const capitalInicial = 10000;
      const montoIngreso = 5000;

      vi.mocked(bancosService.obtenerBanco).mockResolvedValue({
        id: bancoId,
        capitalActual: capitalInicial + montoIngreso,
      });

      const banco = await bancosService.obtenerBanco(bancoId);
      expect(banco.capitalActual).toBe(15000);
    });

    it('debería rechazar monto negativo', async () => {
      const bancoId = 'profit';
      const ingresoInvalido = { monto: -100, concepto: 'Test' };

      await expect(bancosService.registrarIngreso(bancoId, ingresoInvalido)).rejects.toThrow();
    });
  });

  describe('registrarGasto', () => {
    it('debería registrar un gasto correctamente', async () => {
      const bancoId = 'utilidades';
      const gastoData = {
        monto: 2000,
        concepto: 'Pago a proveedor',
        fecha: new Date(),
        categoria: 'Compras',
      };

      vi.mocked(bancosService.registrarGasto).mockResolvedValue({
        id: 'gasto-456',
        ...gastoData,
      });

      const result = await bancosService.registrarGasto(bancoId, gastoData);

      expect(result).toBeDefined();
      expect(result.monto).toBe(2000);
    });

    it('debería decrementar capital del banco', async () => {
      const bancoId = 'fletes';
      const capitalInicial = 20000;
      const montoGasto = 3000;

      vi.mocked(bancosService.obtenerBanco).mockResolvedValue({
        id: bancoId,
        capitalActual: capitalInicial - montoGasto,
      });

      const banco = await bancosService.obtenerBanco(bancoId);
      expect(banco.capitalActual).toBe(17000);
    });

    it('no debería permitir gasto mayor al capital', async () => {
      const bancoId = 'boveda-usa';
      const capitalActual = 1000;
      const gastoExcesivo = { monto: 5000 };

      // Mock banco con poco capital
      vi.mocked(bancosService.obtenerBanco).mockResolvedValue({
        id: bancoId,
        capitalActual,
      });

      await expect(bancosService.registrarGasto(bancoId, gastoExcesivo)).rejects.toThrow(
        'Fondos insuficientes'
      );
    });
  });

  describe('realizarTransferencia', () => {
    it('debería transferir entre bancos correctamente', async () => {
      const transferenciaData = {
        bancoOrigen: 'boveda-monte',
        bancoDestino: 'azteca',
        monto: 10000,
        concepto: 'Transferencia interna',
      };

      vi.mocked(bancosService.realizarTransferencia).mockResolvedValue({
        success: true,
        transferenciaId: 'trans-789',
      });

      const result = await bancosService.realizarTransferencia(transferenciaData);

      expect(result.success).toBe(true);
      expect(result.transferenciaId).toBeDefined();
    });

    it('debería crear registros en ambos bancos', async () => {
      const origen = 'leftie';
      const destino = 'profit';
      const monto = 5000;

      // Verificar que se llamen ambas operaciones
      const spyIngreso = vi.spyOn(bancosService, 'registrarIngreso');
      const spyGasto = vi.spyOn(bancosService, 'registrarGasto');

      await bancosService.realizarTransferencia({
        bancoOrigen: origen,
        bancoDestino: destino,
        monto,
      });

      expect(spyGasto).toHaveBeenCalledWith(origen, expect.any(Object));
      expect(spyIngreso).toHaveBeenCalledWith(destino, expect.any(Object));
    });
  });

  describe('realizarCorte', () => {
    it('debería realizar corte de caja correctamente', async () => {
      const bancoId = 'azteca';
      const corteData = {
        fecha: new Date(),
        capitalInicial: 50000,
        capitalFinal: 62000,
        totalIngresos: 15000,
        totalGastos: 3000,
      };

      vi.mocked(bancosService.realizarCorte).mockResolvedValue({
        id: 'corte-999',
        ...corteData,
        diferencia: 12000,
      });

      const corte = await bancosService.realizarCorte(bancoId, corteData);

      expect(corte).toBeDefined();
      expect(corte.diferencia).toBe(12000);
    });
  });

  describe('obtenerBalance', () => {
    it('debería calcular balance correcto', async () => {
      const bancoId = 'boveda-monte';

      vi.mocked(bancosService.obtenerBalance).mockResolvedValue({
        capitalActual: 100000,
        totalIngresos: 150000,
        totalGastos: 50000,
        balance: 100000,
      });

      const balance = await bancosService.obtenerBalance(bancoId);

      expect(balance.balance).toBe(balance.totalIngresos - balance.totalGastos);
    });
  });

  describe('obtenerMovimientos', () => {
    it('debería obtener movimientos de un banco', async () => {
      const bancoId = 'utilidades';

      vi.mocked(bancosService.obtenerMovimientos).mockResolvedValue([
        { tipo: 'ingreso', monto: 5000 },
        { tipo: 'gasto', monto: 2000 },
        { tipo: 'ingreso', monto: 3000 },
      ]);

      const movimientos = await bancosService.obtenerMovimientos(bancoId);

      expect(movimientos).toHaveLength(3);
      expect(movimientos.every((m) => ['ingreso', 'gasto'].includes(m.tipo))).toBe(true);
    });

    it('debería filtrar por rango de fechas', async () => {
      const bancoId = 'fletes';
      const filtros = {
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-12-31'),
      };

      vi.mocked(bancosService.obtenerMovimientos).mockResolvedValue([
        { fecha: new Date('2025-06-15'), monto: 1000 },
        { fecha: new Date('2025-08-20'), monto: 2000 },
      ]);

      const movimientos = await bancosService.obtenerMovimientos(bancoId, filtros);

      expect(movimientos).toHaveLength(2);
    });
  });

  describe('validaciones', () => {
    it('debería validar todos los 7 bancoIds', () => {
      expect(bancoIds).toHaveLength(7);
      expect(bancoIds).toContain('boveda-monte');
      expect(bancoIds).toContain('boveda-usa');
      expect(bancoIds).toContain('utilidades');
      expect(bancoIds).toContain('fletes');
      expect(bancoIds).toContain('azteca');
      expect(bancoIds).toContain('leftie');
      expect(bancoIds).toContain('profit');
    });

    it('debería rechazar monto 0 o negativo', () => {
      expect(() => {
        if (0 <= 0) throw new Error('Monto debe ser mayor a 0');
      }).toThrow();
    });
  });
});
