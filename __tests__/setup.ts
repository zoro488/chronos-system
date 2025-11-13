/**
 * VITEST SETUP
 * Global test setup and mocks
 */

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Firebase App
const mockApp = { name: '[DEFAULT]', options: {}, automaticDataCollectionEnabled: false };

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => mockApp),
  getApps: vi.fn(() => [mockApp]),
  getApp: vi.fn(() => mockApp),
}));

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({ id: 'mock-doc-id' })),
  getDoc: vi.fn(() => Promise.resolve({
    exists: () => false,
    data: () => null,
    id: 'mock-doc-id'
  })),
  getDocs: vi.fn(() => Promise.resolve({
    docs: [],
    empty: true,
    size: 0
  })),
  addDoc: vi.fn(() => Promise.resolve({ id: 'mock-new-id' })),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  setDoc: vi.fn(() => Promise.resolve()),
  onSnapshot: vi.fn(() => vi.fn()),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  limit: vi.fn(() => ({})),
  runTransaction: vi.fn((db, callback) => {
    const transaction = {
      get: vi.fn(() => Promise.resolve({
        exists: () => true,
        data: () => ({ capitalActual: 10000 }),
        id: 'mock-doc-id'
      })),
      set: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    return callback(transaction);
  }),
  serverTimestamp: vi.fn(() => new Date()),
  Timestamp: {
    now: vi.fn(() => ({ seconds: 1699900000, nanoseconds: 0 })),
    fromDate: vi.fn((date: Date) => ({
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: 0
    })),
  },
  enableIndexedDbPersistence: vi.fn(() => Promise.resolve()),
  disableNetwork: vi.fn(() => Promise.resolve()),
  enableNetwork: vi.fn(() => Promise.resolve()),
}));

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null);
    return vi.fn();
  }),
}));

// Mock Firebase Storage
vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(() => ({})),
  uploadBytes: vi.fn(() => Promise.resolve({ ref: {} })),
  getDownloadURL: vi.fn(() => Promise.resolve('https://mock-url.com/file')),
}));

// Mock Firebase Functions
vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(() => ({})),
  httpsCallable: vi.fn(() => vi.fn()),
}));

// Mock Firebase Remote Config
vi.mock('firebase/remote-config', () => ({
  getRemoteConfig: vi.fn(() => ({})),
  fetchAndActivate: vi.fn(() => Promise.resolve(true)),
  getValue: vi.fn(() => ({ asString: () => '', asNumber: () => 0, asBoolean: () => false })),
}));

// Mock OpenTelemetry Tracing
vi.mock('../../../config/tracing.js', () => ({
  initializeTracing: vi.fn(),
  shutdownTracing: vi.fn(() => Promise.resolve()),
  getTracer: vi.fn(() => ({
    startSpan: vi.fn(() => ({
      setAttribute: vi.fn(),
      setStatus: vi.fn(),
      recordException: vi.fn(),
      end: vi.fn(),
    })),
    startActiveSpan: vi.fn((name, fn) => {
      const mockSpan = {
        setAttribute: vi.fn(),
        setStatus: vi.fn(),
        recordException: vi.fn(),
        end: vi.fn(),
      };
      return fn(mockSpan);
    }),
  })),
  traceFirestoreOperation: vi.fn((name, fn) => fn()),
  traceTransaction: vi.fn((name, fn) => fn()),
  traceComponent: vi.fn((name, fn) => fn()),
  recordError: vi.fn(),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    custom: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    span: 'span',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    p: 'p',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Global test utilities
global.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// IntersectionObserver mock
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// ResizeObserver mock
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
