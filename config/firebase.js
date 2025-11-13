/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║              FIREBASE CONFIGURATION - CHRONOS SYSTEM                       ║
 * ║  Configuración completa de Firebase para Chronos System                   ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { getAnalytics } from 'firebase/analytics';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { enableIndexedDbPersistence, getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getPerformance } from 'firebase/performance';
import { getRemoteConfig } from 'firebase/remote-config';
import { getStorage } from 'firebase/storage';

// ============================================
// CONFIGURACIÓN DE FIREBASE
// ============================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDEyOQHEU7b3L2XYMlk_demo_key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'premium-ecosystem.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'premium-ecosystem',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'premium-ecosystem.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-XXXXXXXXXX',
};

// ============================================
// INICIALIZACIÓN (Singleton Pattern)
// ============================================
// Verificar si ya existe una instancia de Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Servicios principales
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const remoteConfig = getRemoteConfig(app);

// Analytics y Performance (solo en producción)
let analytics = null;
let performance = null;

if (typeof window !== 'undefined' && import.meta.env.PROD) {
  try {
    analytics = getAnalytics(app);
    performance = getPerformance(app);
  } catch (error) {
    console.warn('Analytics/Performance no disponible:', error);
  }
}

export { analytics, performance };

// ============================================
// PERSISTENCIA OFFLINE
// ============================================
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistencia offline no disponible: Múltiples pestañas abiertas');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistencia offline no soportada en este navegador');
    }
  });
}

// ============================================
// HELPERS
// ============================================

/**
 * Verifica si Firebase está configurado correctamente
 */
export const isFirebaseConfigured = () => {
  return app !== null && firebaseConfig.projectId !== 'premium-ecosystem';
};

/**
 * Obtiene la configuración actual de Firebase
 */
export const getFirebaseConfig = () => {
  return firebaseConfig;
};

/**
 * Exporta la app principal
 */
export default app;
