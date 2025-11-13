import { QueryClient } from '@tanstack/react-query';

/**
 * Configuración global de React Query para CHRONOS SYSTEM
 *
 * Optimizado para:
 * - Caché de 10 minutos
 * - Datos frescos por 5 minutos
 * - 3 reintentos con backoff exponencial
 * - Refetch deshabilitado en focus (evita queries innecesarias)
 */

/**
 * Cliente de React Query con configuración personalizada
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo que los datos se consideran "frescos" (no se refetcharán automáticamente)
      staleTime: 5 * 60 * 1000, // 5 minutos

      // Tiempo que los datos permanecen en caché
      cacheTime: 10 * 60 * 1000, // 10 minutos

      // Reintentos en caso de error
      retry: 3,

      // Función de reintento con backoff exponencial
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // No refetch automático al enfocar ventana (evita queries innecesarias)
      refetchOnWindowFocus: false,

      // Refetch al reconectar a internet
      refetchOnReconnect: true,

      // Mostrar datos anteriores mientras se recarga
      keepPreviousData: true,
    },

    mutations: {
      // Reintentos en mutaciones
      retry: 1,

      // Tiempo de espera antes de reintento
      retryDelay: 1000,
    },
  },
});

/**
 * Query keys centralizadas para CHRONOS SYSTEM
 *
 * Facilita la invalidación y gestión del caché.
 * Usa arrays jerárquicos para poder invalidar grupos de queries.
 */
export const queryKeys = {
  // Ventas
  ventas: {
    all: ['ventas'],
    lists: () => [...queryKeys.ventas.all, 'list'],
    list: (filters) => [...queryKeys.ventas.lists(), filters],
    details: () => [...queryKeys.ventas.all, 'detail'],
    detail: (id) => [...queryKeys.ventas.details(), id],
    byMonth: (month) => [...queryKeys.ventas.all, 'month', month],
    byCliente: (clienteId) => [...queryKeys.ventas.all, 'cliente', clienteId],
    stats: () => [...queryKeys.ventas.all, 'stats'],
  },

  // Clientes
  clientes: {
    all: ['clientes'],
    lists: () => [...queryKeys.clientes.all, 'list'],
    list: (filters) => [...queryKeys.clientes.lists(), filters],
    details: () => [...queryKeys.clientes.all, 'detail'],
    detail: (id) => [...queryKeys.clientes.details(), id],
    search: (query) => [...queryKeys.clientes.all, 'search', query],
  },

  // Productos
  productos: {
    all: ['productos'],
    lists: () => [...queryKeys.productos.all, 'list'],
    list: (filters) => [...queryKeys.productos.lists(), filters],
    details: () => [...queryKeys.productos.all, 'detail'],
    detail: (id) => [...queryKeys.productos.details(), id],
    byCategoria: (categoria) => [...queryKeys.productos.all, 'categoria', categoria],
    lowStock: () => [...queryKeys.productos.all, 'low-stock'],
  },

  // Compras / Órdenes de Compra
  compras: {
    all: ['compras'],
    lists: () => [...queryKeys.compras.all, 'list'],
    list: (filters) => [...queryKeys.compras.lists(), filters],
    details: () => [...queryKeys.compras.all, 'detail'],
    detail: (id) => [...queryKeys.compras.details(), id],
    byProveedor: (proveedorId) => [...queryKeys.compras.all, 'proveedor', proveedorId],
  },

  // Distribuidores
  distribuidores: {
    all: ['distribuidores'],
    lists: () => [...queryKeys.distribuidores.all, 'list'],
    list: (filters) => [...queryKeys.distribuidores.lists(), filters],
    details: () => [...queryKeys.distribuidores.all, 'detail'],
    detail: (id) => [...queryKeys.distribuidores.details(), id],
  },

  // Bancos (7 bancos)
  bancos: {
    all: ['bancos'],
    lists: () => [...queryKeys.bancos.all, 'list'],
    list: (filters) => [...queryKeys.bancos.lists(), filters],
    details: () => [...queryKeys.bancos.all, 'detail'],
    detail: (id) => [...queryKeys.bancos.details(), id],
    balance: () => [...queryKeys.bancos.all, 'balance'],
    transacciones: (bancoId) => [...queryKeys.bancos.all, 'transacciones', bancoId],
  },

  // Gastos y Abonos
  gastos: {
    all: ['gastos'],
    lists: () => [...queryKeys.gastos.all, 'list'],
    list: (filters) => [...queryKeys.gastos.lists(), filters],
    byBanco: (bancoId) => [...queryKeys.gastos.all, 'banco', bancoId],
  },

  // Dashboard & Analytics
  dashboard: {
    all: ['dashboard'],
    kpis: () => [...queryKeys.dashboard.all, 'kpis'],
    charts: () => [...queryKeys.dashboard.all, 'charts'],
    topProducts: () => [...queryKeys.dashboard.all, 'top-products'],
    topClients: () => [...queryKeys.dashboard.all, 'top-clients'],
  },

  // Reportes
  reportes: {
    all: ['reportes'],
    ventas: () => [...queryKeys.reportes.all, 'ventas'],
    financiero: () => [...queryKeys.reportes.all, 'financiero'],
    inventario: () => [...queryKeys.reportes.all, 'inventario'],
  },
};

/**
 * Helpers para invalidación común
 */
export const invalidateQueries = {
  /**
   * Invalida todas las queries de ventas
   */
  ventas: () => queryClient.invalidateQueries({ queryKey: queryKeys.ventas.all }),

  /**
   * Invalida todas las queries de clientes
   */
  clientes: () => queryClient.invalidateQueries({ queryKey: queryKeys.clientes.all }),

  /**
   * Invalida todas las queries de productos
   */
  productos: () => queryClient.invalidateQueries({ queryKey: queryKeys.productos.all }),

  /**
   * Invalida todas las queries de compras
   */
  compras: () => queryClient.invalidateQueries({ queryKey: queryKeys.compras.all }),

  /**
   * Invalida todas las queries de distribuidores
   */
  distribuidores: () => queryClient.invalidateQueries({ queryKey: queryKeys.distribuidores.all }),

  /**
   * Invalida todas las queries de bancos
   */
  bancos: () => queryClient.invalidateQueries({ queryKey: queryKeys.bancos.all }),

  /**
   * Invalida todas las queries de gastos
   */
  gastos: () => queryClient.invalidateQueries({ queryKey: queryKeys.gastos.all }),

  /**
   * Invalida todas las queries del dashboard
   */
  dashboard: () => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),

  /**
   * Invalida todas las queries de reportes
   */
  reportes: () => queryClient.invalidateQueries({ queryKey: queryKeys.reportes.all }),

  /**
   * Invalida todo (útil después de login/logout)
   */
  all: () => queryClient.invalidateQueries(),
};
