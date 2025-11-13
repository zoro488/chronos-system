/**
 * 🏪 CHRONOS GLOBAL STORE
 * State management con Zustand + Persist
 *
 * Features:
 * - Estado global centralizado
 * - Persistencia automática en localStorage
 * - Notificaciones toast
 * - User preferences
 * - Loading states
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// TIPOS
// ============================================================================

/**
 * @typedef {'success' | 'error' | 'warning' | 'info'} NotificationType
 *
 * @typedef {Object} Notification
 * @property {string} id
 * @property {NotificationType} type
 * @property {string} title
 * @property {string} [message]
 * @property {number} [duration]
 */

/**
 * @typedef {Object} UserPreferences
 * @property {string} theme - 'dark' | 'light'
 * @property {string} language - 'es' | 'en'
 * @property {boolean} soundEnabled
 * @property {boolean} notificationsEnabled
 * @property {string} [preferredVoice] - Voz preferida para TTS
 * @property {number} [speechSpeed] - Velocidad de síntesis (0.5 - 2.0)
 */

/**
 * @typedef {Object} ChronosStore
 * @property {Object|null} user - Usuario actual
 * @property {Function} setUser - Actualizar usuario
 * @property {Function} clearUser - Limpiar usuario
 *
 * @property {boolean} isLoading - Estado de carga global
 * @property {Function} setIsLoading - Actualizar loading
 *
 * @property {Notification[]} notifications - Lista de notificaciones
 * @property {Function} addNotification - Agregar notificación
 * @property {Function} removeNotification - Eliminar notificación
 * @property {Function} clearNotifications - Limpiar todas las notificaciones
 *
 * @property {UserPreferences} preferences - Preferencias de usuario
 * @property {Function} updatePreferences - Actualizar preferencias
 *
 * @property {boolean} sidebarCollapsed - Estado del sidebar
 * @property {Function} toggleSidebar - Toggle sidebar
 *
 * @property {string|null} activeModal - Modal activo
 * @property {Function} openModal - Abrir modal
 * @property {Function} closeModal - Cerrar modal
 */

// ============================================================================
// STORE
// ============================================================================

export const useChronosStore = create(
  persist(
    (set, get) => ({
      // ========================================
      // USER STATE
      // ========================================
      user: null,

      setUser: (user) => set({ user }),

      clearUser: () => set({ user: null }),

      // ========================================
      // LOADING STATE
      // ========================================
      isLoading: false,

      setIsLoading: (loading) => set({ isLoading: loading }),

      // ========================================
      // NOTIFICATIONS (TOASTS)
      // ========================================
      notifications: [],

      addNotification: (notification) => {
        const id = notification.id || crypto.randomUUID();
        const newNotification = {
          ...notification,
          id,
          duration: notification.duration || 5000
        };

        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }));

        // Auto-remove después del duration
        if (newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }

        return id;
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      },

      clearNotifications: () => set({ notifications: [] }),

      // ========================================
      // USER PREFERENCES
      // ========================================
      preferences: {
        theme: 'dark',
        language: 'es',
        soundEnabled: true,
        notificationsEnabled: true,
        preferredVoice: 'nova',
        speechSpeed: 1.0
      },

      updatePreferences: (updates) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...updates
          }
        }));
      },

      // ========================================
      // UI STATE
      // ========================================
      sidebarCollapsed: false,

      toggleSidebar: () => {
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed
        }));
      },

      activeModal: null,

      openModal: (modalId) => set({ activeModal: modalId }),

      closeModal: () => set({ activeModal: null }),

      // ========================================
      // ANALYTICS / METRICS
      // ========================================
      lastActivity: null,

      updateActivity: () => set({ lastActivity: new Date().toISOString() })
    }),
    {
      name: 'chronos-storage', // Nombre en localStorage
      partialize: (state) => ({
        // Solo persistir estos campos
        user: state.user,
        preferences: state.preferences,
        sidebarCollapsed: state.sidebarCollapsed
        // NO persistir: notifications, loading, modals
      })
    }
  )
);

// ============================================================================
// HELPER FUNCTIONS (Fuera del store para usar directamente)
// ============================================================================

/**
 * Helper para crear notificaciones toast
 */
export const toast = {
  success: (title, message) => {
    return useChronosStore.getState().addNotification({
      type: 'success',
      title,
      message,
      duration: 5000
    });
  },

  error: (title, message) => {
    return useChronosStore.getState().addNotification({
      type: 'error',
      title,
      message,
      duration: 7000
    });
  },

  warning: (title, message) => {
    return useChronosStore.getState().addNotification({
      type: 'warning',
      title,
      message,
      duration: 6000
    });
  },

  info: (title, message) => {
    return useChronosStore.getState().addNotification({
      type: 'info',
      title,
      message,
      duration: 5000
    });
  },

  /**
   * Toast persistente (no se auto-cierra)
   */
  persistent: (type, title, message) => {
    return useChronosStore.getState().addNotification({
      type,
      title,
      message,
      duration: 0 // No auto-close
    });
  }
};

/**
 * Hook para usar solo las notificaciones (optimizado)
 */
export const useNotifications = () => useChronosStore((state) => ({
  notifications: state.notifications,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications
}));

/**
 * Hook para usar solo preferencias (optimizado)
 */
export const usePreferences = () => useChronosStore((state) => ({
  preferences: state.preferences,
  updatePreferences: state.updatePreferences
}));

/**
 * Hook para usar solo el usuario (optimizado)
 */
export const useUser = () => useChronosStore((state) => ({
  user: state.user,
  setUser: state.setUser,
  clearUser: state.clearUser
}));

// ============================================================================
// EXPORTAR STORE Y HELPERS
// ============================================================================

export default useChronosStore;
