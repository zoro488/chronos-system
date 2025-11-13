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

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  getApp: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
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
