/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                  UI STORE - ZUSTAND STATE MANAGEMENT                      ║
 * ║  Store global para estado de UI (sidebar, theme, modals, etc.)           ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Theme
  theme: 'light' | 'dark' | 'auto';

  // Modals
  activeModal: string | null;
  modalData: any;

  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;

  // Notifications
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: number;
  }>;

  // Acciones
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  setTheme: (theme: 'light' | 'dark' | 'auto') => void;

  openModal: (modalId: string, data?: any) => void;
  closeModal: () => void;

  setGlobalLoading: (loading: boolean, message?: string | null) => void;

  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      sidebarOpen: true,
      sidebarCollapsed: false,
      theme: 'dark',
      activeModal: null,
      modalData: null,
      globalLoading: false,
      loadingMessage: null,
      notifications: [],

      // Acciones Sidebar
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Acciones Theme
      setTheme: (theme) => set({ theme }),

      // Acciones Modal
      openModal: (modalId, data = null) => set({ activeModal: modalId, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: null }),

      // Acciones Loading
      setGlobalLoading: (loading, message = null) =>
        set({ globalLoading: loading, loadingMessage: message }),

      // Acciones Notifications
      addNotification: (notification) => {
        const id = `notif-${Date.now()}-${Math.random()}`;
        const newNotif = {
          ...notification,
          id,
          timestamp: Date.now(),
        };

        set((state) => ({
          notifications: [...state.notifications, newNotif],
        }));

        // Auto-remove después de 5 segundos
        setTimeout(() => {
          get().removeNotification(id);
        }, 5000);
      },

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'chronos-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);
