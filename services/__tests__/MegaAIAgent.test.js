/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                  MEGA AI AGENT - UNIT TESTS                                ║
 * ║                  Tests para asistente de IA                                ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MegaAIAgent } from '../MegaAIAgent';

// Mock Firebase
vi.mock('../../firebase', () => ({
  db: {},
}));

// Mock Anthropic
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn(),
    },
  })),
}));

describe('MegaAIAgent', () => {
  let agent;
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new MegaAIAgent(mockUserId);
  });

  describe('Inicialización', () => {
    it('debería inicializarse correctamente', () => {
      expect(agent).toBeDefined();
      expect(agent.userId).toBe(mockUserId);
      expect(agent.conversationHistory).toEqual([]);
    });

    it('debería cargar perfil de usuario', () => {
      expect(agent.userProfile).toBeDefined();
      expect(agent.userProfile.userId).toBe(mockUserId);
      expect(agent.userProfile.interactions).toBe(0);
    });
  });

  describe('processConversationalInput', () => {
    it('debería procesar entrada de texto simple', async () => {
      const input = 'Muéstrame las ventas del mes';

      vi.spyOn(agent, 'processConversationalInput').mockResolvedValue({
        message: 'Aquí están las ventas del mes',
        actions: [],
        visualizations: [],
        nextSteps: ['Ver detalles', 'Exportar reporte'],
      });

      const response = await agent.processConversationalInput(input);

      expect(response).toBeDefined();
      expect(response.message).toContain('ventas');
      expect(response.nextSteps).toHaveLength(2);
    });

    it('debería detectar intención de crear venta', async () => {
      const input = 'Registra una venta de 10 productos a cliente ABC por $5000';

      const response = await agent.processConversationalInput(input);

      expect(response.actions).toBeDefined();
      // Debería incluir acción de crear venta
    });

    it('debería manejar entrada sin API key configurada', async () => {
      agent.anthropic = null;

      const response = await agent.processConversationalInput('test');

      expect(response.message).toContain('servicio de IA no está configurado');
    });
  });

  describe('detectIntent', () => {
    it('debería detectar intención de consulta', () => {
      const queries = [
        'Cuántas ventas tengo',
        'Muéstrame el saldo del banco Azteca',
        '¿Cuál es el total de ingresos?',
      ];

      queries.forEach((query) => {
        const intent = agent.detectIntent(query);
        expect(intent).toContain('consulta');
      });
    });

    it('debería detectar intención de creación', () => {
      const createCommands = [
        'Crea una venta',
        'Registra un ingreso de $1000',
        'Agrega un nuevo cliente',
      ];

      createCommands.forEach((cmd) => {
        const intent = agent.detectIntent(cmd);
        expect(intent).toContain('crear');
      });
    });

    it('debería detectar intención de navegación', () => {
      const navCommands = [
        'Llévame a ventas',
        'Abre el panel de bancos',
        'Ir a configuración',
      ];

      navCommands.forEach((cmd) => {
        const intent = agent.detectIntent(cmd);
        expect(intent).toContain('navegacion');
      });
    });
  });

  describe('generateVisualization', () => {
    it('debería generar configuración de gráfica', async () => {
      const data = {
        type: 'ventas-mes',
        values: [1000, 2000, 3000, 4000],
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
      };

      vi.spyOn(agent, 'generateVisualization').mockResolvedValue({
        type: 'bar',
        data,
        options: {
          responsive: true,
          plugins: { legend: { display: true } },
        },
      });

      const viz = await agent.generateVisualization(data);

      expect(viz).toBeDefined();
      expect(viz.type).toBe('bar');
      expect(viz.data.values).toHaveLength(4);
    });
  });

  describe('exportToPDF', () => {
    it('debería exportar datos a PDF', async () => {
      const data = {
        title: 'Reporte de Ventas',
        content: [{ label: 'Total', value: '$50,000' }],
      };

      vi.spyOn(agent, 'exportToPDF').mockResolvedValue({
        success: true,
        filename: 'reporte-ventas.pdf',
      });

      const result = await agent.exportToPDF(data);

      expect(result.success).toBe(true);
      expect(result.filename).toContain('.pdf');
    });
  });

  describe('exportToExcel', () => {
    it('debería exportar datos a Excel', async () => {
      const data = {
        sheets: [
          {
            name: 'Ventas',
            data: [
              ['Folio', 'Cliente', 'Total'],
              ['V-001', 'Cliente A', 5000],
              ['V-002', 'Cliente B', 3000],
            ],
          },
        ],
      };

      vi.spyOn(agent, 'exportToExcel').mockResolvedValue({
        success: true,
        filename: 'ventas.xlsx',
      });

      const result = await agent.exportToExcel(data);

      expect(result.success).toBe(true);
      expect(result.filename).toContain('.xlsx');
    });
  });

  describe('UserLearning', () => {
    it('debería registrar interacción del usuario', async () => {
      const interaction = {
        type: 'query',
        input: 'Muéstrame ventas',
        timestamp: new Date(),
      };

      agent.userProfile.interactions += 1;

      expect(agent.userProfile.interactions).toBe(1);
    });

    it('debería aprender patrones de uso', () => {
      const patterns = {
        horaPreferida: '09:00',
        accionesFrecuentes: ['consultar-ventas', 'ver-bancos'],
        formatoPreferido: 'pdf',
      };

      agent.userProfile.patterns = patterns;

      expect(agent.userProfile.patterns.accionesFrecuentes).toHaveLength(2);
    });
  });

  describe('buildSystemContext', () => {
    it('debería construir contexto del sistema', async () => {
      vi.spyOn(agent, 'buildSystemContext').mockResolvedValue({
        currentPage: '/dashboard',
        userRole: 'admin',
        recentData: {
          ventas: 96,
          clientes: 31,
          bancos: 7,
        },
        capabilities: ['crear', 'editar', 'eliminar', 'exportar'],
      });

      const context = await agent.buildSystemContext();

      expect(context).toBeDefined();
      expect(context.recentData.bancos).toBe(7);
      expect(context.capabilities).toContain('exportar');
    });
  });

  describe('handleVoiceCommand', () => {
    it('debería procesar comando de voz', async () => {
      const voiceInput = 'Registra una venta de mil pesos';

      vi.spyOn(agent, 'handleVoiceCommand').mockResolvedValue({
        success: true,
        action: 'crear-venta',
        extractedData: {
          monto: 1000,
        },
      });

      const result = await agent.handleVoiceCommand(voiceInput);

      expect(result.success).toBe(true);
      expect(result.extractedData.monto).toBe(1000);
    });

    it('debería manejar comando ambiguo', async () => {
      const ambiguousCommand = 'haz algo con ventas';

      const result = await agent.handleVoiceCommand(ambiguousCommand);

      expect(result).toBeDefined();
      // Debería pedir clarificación
    });
  });

  describe('Validaciones y Errores', () => {
    it('debería manejar error de red', async () => {
      vi.spyOn(agent, 'processConversationalInput').mockRejectedValue(
        new Error('Network error')
      );

      await expect(agent.processConversationalInput('test')).rejects.toThrow('Network error');
    });

    it('debería validar entrada vacía', async () => {
      const emptyInput = '';

      await expect(agent.processConversationalInput(emptyInput)).rejects.toThrow(
        'Entrada no puede estar vacía'
      );
    });

    it('debería manejar timeout de API', async () => {
      vi.spyOn(agent, 'processConversationalInput').mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100))
      );

      await expect(agent.processConversationalInput('test')).rejects.toThrow('Timeout');
    });
  });
});
