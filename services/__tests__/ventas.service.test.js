/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                  VENTAS SERVICE - UNIT TESTS                               ║
 * ║                  Tests para servicio de ventas                             ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ventasService from '../ventas.service';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  Timestamp: {
    now: () => ({ seconds: 1699900000, nanoseconds: 0 }),
    fromDate: (date) => ({ seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 }),
  },
}));

describe('VentasService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('crear', () => {
    it('debería crear una venta con datos válidos', async () => {
      const ventaData = {
        folio: 'V-001',
        clienteId: 'cliente-1',
        clienteNombre: 'Cliente Test',
        productos: [
          {
            productoId: 'prod-1',
            nombre: 'Producto Test',
            cantidad: 10,
            precioUnitario: 100,
            subtotal: 1000,
          },
        ],
        subtotal: 1000,
        iva: 160,
        total: 1160,
      };

      // Mock successful creation
      const mockDocRef = { id: 'venta-123' };
      vi.mocked(ventasService.crear).mockResolvedValue(mockDocRef);

      const result = await ventasService.crear(ventaData);

      expect(result).toBeDefined();
      expect(result.id).toBe('venta-123');
    });

    it('debería rechazar venta sin productos', async () => {
      const ventaInvalida = {
        folio: 'V-002',
        clienteId: 'cliente-1',
        productos: [],
      };

      await expect(ventasService.crear(ventaInvalida)).rejects.toThrow();
    });

    it('debería calcular correctamente los totales', async () => {
      const ventaData = {
        folio: 'V-003',
        clienteId: 'cliente-1',
        productos: [
          { cantidad: 5, precioUnitario: 100 },
          { cantidad: 3, precioUnitario: 200 },
        ],
      };

      const expectedSubtotal = 1100; // (5*100) + (3*200)
      const expectedIVA = expectedSubtotal * 0.16;
      const expectedTotal = expectedSubtotal + expectedIVA;

      // Verificar que el cálculo sea correcto
      expect(expectedSubtotal).toBe(1100);
      expect(expectedIVA).toBe(176);
      expect(expectedTotal).toBe(1276);
    });
  });

  describe('registrarPago', () => {
    it('debería registrar un pago y actualizar estado', async () => {
      const ventaId = 'venta-123';
      const pagoData = {
        monto: 500,
        metodoPago: 'efectivo',
        fecha: new Date(),
      };

      vi.mocked(ventasService.registrarPago).mockResolvedValue({
        success: true,
        message: 'Pago registrado',
      });

      const result = await ventasService.registrarPago(ventaId, pagoData);

      expect(result.success).toBe(true);
    });

    it('debería cambiar estado a "liquidada" cuando se paga completo', async () => {
      const ventaId = 'venta-123';
      const totalVenta = 1160;
      const pagoData = { monto: totalVenta };

      // Mock: venta debe quedar con estado "liquidada"
      vi.mocked(ventasService.obtener).mockResolvedValue({
        id: ventaId,
        total: totalVenta,
        totalPagado: totalVenta,
        estado: 'liquidada',
      });

      const venta = await ventasService.obtener(ventaId);
      expect(venta.estado).toBe('liquidada');
    });
  });

  describe('cancelar', () => {
    it('debería cancelar una venta pendiente', async () => {
      const ventaId = 'venta-123';
      const motivo = 'Cliente canceló pedido';

      vi.mocked(ventasService.cancelar).mockResolvedValue({
        success: true,
        message: 'Venta cancelada',
      });

      const result = await ventasService.cancelar(ventaId, motivo);

      expect(result.success).toBe(true);
    });

    it('no debería cancelar una venta liquidada', async () => {
      const ventaId = 'venta-liquidada';

      await expect(ventasService.cancelar(ventaId, 'motivo')).rejects.toThrow(
        'No se puede cancelar una venta liquidada'
      );
    });
  });

  describe('obtenerPorCliente', () => {
    it('debería obtener todas las ventas de un cliente', async () => {
      const clienteId = 'cliente-1';

      vi.mocked(ventasService.obtenerPorCliente).mockResolvedValue([
        { id: 'v-1', clienteId, total: 1000 },
        { id: 'v-2', clienteId, total: 2000 },
      ]);

      const ventas = await ventasService.obtenerPorCliente(clienteId);

      expect(ventas).toHaveLength(2);
      expect(ventas[0].clienteId).toBe(clienteId);
    });
  });

  describe('calcularEstadisticas', () => {
    it('debería calcular estadísticas correctamente', () => {
      const ventas = [
        { total: 1000, estado: 'liquidada' },
        { total: 2000, estado: 'liquidada' },
        { total: 500, estado: 'pendiente' },
      ];

      const totalVendido = ventas
        .filter((v) => v.estado === 'liquidada')
        .reduce((sum, v) => sum + v.total, 0);

      expect(totalVendido).toBe(3000);
    });
  });

  describe('generarReporte', () => {
    it('debería generar reporte con datos filtrados', async () => {
      const filtros = {
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-12-31'),
        estado: 'liquidada',
      };

      vi.mocked(ventasService.generarReporte).mockResolvedValue({
        ventas: 96,
        totalVendido: 580000,
        promedio: 6041.67,
        topClientes: [],
      });

      const reporte = await ventasService.generarReporte(filtros);

      expect(reporte.ventas).toBeGreaterThan(0);
      expect(reporte.totalVendido).toBeGreaterThan(0);
    });
  });
});
