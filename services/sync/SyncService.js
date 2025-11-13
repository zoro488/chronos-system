/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                       CHRONOS SYNC SERVICE                                 ║
 * ║           Servicio de Sincronización en Tiempo Real                        ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Servicio centralizado para sincronización de datos:
 * - Real-time listeners para todas las colecciones
 * - Auto-sync on connection restore
 * - Offline support con local cache
 * - Conflict resolution (last-write-wins)
 * - Retry failed operations
 * - Batch sync on reconnection
 *
 * @module SyncService
 * @author CHRONOS System
 * @version 1.0.0
 */
// ============================================================================
// REACT HOOK FOR SYNC SERVICE
// ============================================================================
import { useCallback, useEffect, useState } from 'react';

import {
  collection,
  disableNetwork,
  enableIndexedDbPersistence,
  enableNetwork,
  getFirestore,
  onSnapshot,
} from 'firebase/firestore';

// SYNC SERVICE CLASS

class SyncService {
  constructor() {
    this.db = null;
    this.unsubscribers = new Map();
    this.isOnline = navigator.onLine;
    this.syncCallbacks = new Map();
    this.retryQueue = [];
    this.maxRetries = 3;
  }

  /**
   * Initialize the sync service
   * @param {Object} options - Configuration options
   */
  async initialize(options = {}) {
    try {
      this.db = getFirestore();

      // Enable offline persistence
      if (options.enableOffline !== false) {
        try {
          await enableIndexedDbPersistence(this.db);
          console.log('[SyncService] Offline persistence enabled');
        } catch (err) {
          if (err.code === 'failed-precondition') {
            console.warn('[SyncService] Multiple tabs open, persistence only in first tab');
          } else if (err.code === 'unimplemented') {
            console.warn("[SyncService] Browser doesn't support persistence");
          }
        }
      }

      // Setup network status listeners
      this.setupNetworkListeners();

      console.log('[SyncService] Initialized successfully');
      return { success: true };
    } catch (error) {
      console.error('[SyncService] Initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Setup network status listeners
   */
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('[SyncService] Connection restored');
      this.handleReconnection();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('[SyncService] Connection lost');
    });
  }

  /**
   * Handle reconnection - sync queued operations
   */
  async handleReconnection() {
    if (!this.db) return;

    try {
      await enableNetwork(this.db);
      console.log('[SyncService] Network enabled');

      // Retry queued operations
      this.processRetryQueue();

      // Notify all callbacks about reconnection
      this.syncCallbacks.forEach((callback) => {
        if (typeof callback === 'function') {
          callback({ type: 'reconnected', isOnline: true });
        }
      });
    } catch (error) {
      console.error('[SyncService] Reconnection error:', error);
    }
  }

  /**
   * Process retry queue
   */
  async processRetryQueue() {
    const queue = [...this.retryQueue];
    this.retryQueue = [];

    for (const operation of queue) {
      try {
        await operation.fn();
        console.log(`[SyncService] Retry success: ${operation.id}`);
      } catch (error) {
        console.error(`[SyncService] Retry failed: ${operation.id}`, error);
        if (operation.retries < this.maxRetries) {
          this.retryQueue.push({ ...operation, retries: operation.retries + 1 });
        }
      }
    }
  }

  /**
   * Subscribe to a collection
   * @param {string} collectionName - Collection name
   * @param {Function} callback - Callback function
   * @param {Array} queryConstraints - Optional query constraints
   * @returns {Function} Unsubscribe function
   */
  subscribe(collectionName, callback, queryConstraints = []) {
    if (!this.db) {
      console.error('[SyncService] Not initialized');
      return () => {};
    }

    const collectionRef = collection(this.db, collectionName);

    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        const data = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });

        callback({
          type: 'data',
          collectionName,
          data,
          metadata: snapshot.metadata,
        });
      },
      (error) => {
        console.error(`[SyncService] Error in ${collectionName}:`, error);
        callback({
          type: 'error',
          collectionName,
          error: error.message,
        });
      }
    );

    // Store unsubscriber
    const key = `${collectionName}-${Date.now()}`;
    this.unsubscribers.set(key, unsubscribe);

    // Return unsubscribe function
    return () => {
      unsubscribe();
      this.unsubscribers.delete(key);
    };
  }

  /**
   * Subscribe to multiple collections
   * @param {Array} collections - Array of collection configs
   * @returns {Function} Unsubscribe all function
   */
  subscribeMultiple(collections) {
    const unsubscribers = collections.map((config) => {
      return this.subscribe(config.name, config.callback, config.constraints);
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }

  /**
   * Register sync callback
   * @param {string} id - Callback ID
   * @param {Function} callback - Callback function
   */
  registerSyncCallback(id, callback) {
    this.syncCallbacks.set(id, callback);
  }

  /**
   * Unregister sync callback
   * @param {string} id - Callback ID
   */
  unregisterSyncCallback(id) {
    this.syncCallbacks.delete(id);
  }

  /**
   * Add operation to retry queue
   * @param {string} id - Operation ID
   * @param {Function} fn - Operation function
   */
  queueOperation(id, fn) {
    this.retryQueue.push({ id, fn, retries: 0 });
  }

  /**
   * Force sync all collections
   */
  async forceSync() {
    if (!this.db) return;

    try {
      await disableNetwork(this.db);
      await enableNetwork(this.db);
      console.log('[SyncService] Force sync completed');
    } catch (error) {
      console.error('[SyncService] Force sync error:', error);
    }
  }

  /**
   * Unsubscribe from all collections
   */
  unsubscribeAll() {
    this.unsubscribers.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.unsubscribers.clear();
    console.log('[SyncService] Unsubscribed from all collections');
  }

  /**
   * Get sync status
   * @returns {Object} Status object
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      activeSubscriptions: this.unsubscribers.size,
      queuedOperations: this.retryQueue.length,
      registeredCallbacks: this.syncCallbacks.size,
    };
  }

  /**
   * Cleanup service
   */
  cleanup() {
    this.unsubscribeAll();
    this.syncCallbacks.clear();
    this.retryQueue = [];
    console.log('[SyncService] Cleanup completed');
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

const syncService = new SyncService();

export default syncService;

// ============================================================================

// ============================================================================

/**
 * React hook for using sync service
 * @param {string} collectionName - Collection to sync
 * @param {Function} onData - Data callback
 * @param {Function} onError - Error callback
 * @returns {Object} Sync status
 */
export const useSync = (collectionName, onData, onError) => {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    if (!collectionName) return;

    setSyncing(true);

    const unsubscribe = syncService.subscribe(collectionName, (result) => {
      if (result.type === 'data') {
        setLastSync(new Date());
        if (onData) onData(result.data);
      } else if (result.type === 'error') {
        if (onError) onError(result.error);
      }
      setSyncing(false);
    });

    return () => unsubscribe();
  }, [collectionName, onData, onError]);

  const forceSync = useCallback(() => {
    syncService.forceSync();
  }, []);

  return { syncing, lastSync, forceSync };
};

// ============================================================================
// HOOK FOR NETWORK STATUS
// ============================================================================

/**
 * React hook for network status
 * @returns {Object} Network status
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Initialize sync service for all CHRONOS collections
 * @returns {Function} Cleanup function
 */
export const initializeChronosSync = () => {
  const collections = [
    {
      name: 'clientes',
      callback: (result) => console.log('Clientes synced:', result.data?.length),
    },
    {
      name: 'distribuidores',
      callback: (result) => console.log('Distribuidores synced:', result.data?.length),
    },
    {
      name: 'proveedores',
      callback: (result) => console.log('Proveedores synced:', result.data?.length),
    },
    {
      name: 'productos',
      callback: (result) => console.log('Productos synced:', result.data?.length),
    },
    { name: 'ventas', callback: (result) => console.log('Ventas synced:', result.data?.length) },
    { name: 'compras', callback: (result) => console.log('Compras synced:', result.data?.length) },
    {
      name: 'ordenesCompra',
      callback: (result) => console.log('Órdenes synced:', result.data?.length),
    },
    { name: 'gastos', callback: (result) => console.log('Gastos synced:', result.data?.length) },
    {
      name: 'movimientosBancarios',
      callback: (result) => console.log('Movimientos synced:', result.data?.length),
    },
    {
      name: 'movimientosAlmacen',
      callback: (result) => console.log('Almacén synced:', result.data?.length),
    },
  ];

  return syncService.subscribeMultiple(collections);
};
