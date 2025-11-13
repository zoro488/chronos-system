/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║              AUTH STORE - ZUSTAND STATE MANAGEMENT                        ║
 * ║  Store complementario para estado de UI de autenticación                 ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUIState {
  // Preferencias de UI
  rememberMe: boolean;
  lastEmail: string | null;

  // Estado de sesión
  sessionTimeout: number | null;
  isSessionActive: boolean;

  // Acciones
  setRememberMe: (value: boolean) => void;
  setLastEmail: (email: string | null) => void;
  setSessionTimeout: (timeout: number | null) => void;
  setSessionActive: (active: boolean) => void;
  resetAuthUI: () => void;
}

export const useAuthStore = create<AuthUIState>()(
  persist(
    (set) => ({
      // Estado inicial
      rememberMe: false,
      lastEmail: null,
      sessionTimeout: null,
      isSessionActive: false,

      // Acciones
      setRememberMe: (value) => set({ rememberMe: value }),
      setLastEmail: (email) => set({ lastEmail: email }),
      setSessionTimeout: (timeout) => set({ sessionTimeout: timeout }),
      setSessionActive: (active) => set({ isSessionActive: active }),
      resetAuthUI: () =>
        set({
          rememberMe: false,
          lastEmail: null,
          sessionTimeout: null,
          isSessionActive: false,
        }),
    }),
    {
      name: 'chronos-auth-ui',
    }
  )
);
