import { vi } from 'vitest';

export const mockGetDoc = vi.fn();
export const mockGetDocs = vi.fn();
export const mockAddDoc = vi.fn();
export const mockUpdateDoc = vi.fn();
export const mockDeleteDoc = vi.fn();
export const mockSetDoc = vi.fn();
export const mockRunTransaction = vi.fn();
export const mockDoc = vi.fn();
export const mockCollection = vi.fn();
export const mockQuery = vi.fn();
export const mockWhere = vi.fn();
export const mockOrderBy = vi.fn();
export const mockLimit = vi.fn();
export const mockOnSnapshot = vi.fn();
export const mockTimestamp = {
  now: vi.fn(() => ({ seconds: 1699900000, nanoseconds: 0 })),
  fromDate: vi.fn((date: Date) => ({ seconds: date.getTime() / 1000, nanoseconds: 0 })),
};


export const mockFirestore = {
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => null })),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  addDoc: vi.fn(() => Promise.resolve({ id: 'test-id' })),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  setDoc: vi.fn(() => Promise.resolve()),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  limit: vi.fn(() => ({})),
  onSnapshot: vi.fn(() => vi.fn()),
  runTransaction: vi.fn((db, callback) => {
    const transaction = {
      get: vi.fn(() => Promise.resolve({ exists: () => false, data: () => null })),
      set: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    return callback(transaction);
  }),
  Timestamp: {
    now: vi.fn(() => ({ seconds: 1699900000, nanoseconds: 0 })),
    fromDate: vi.fn((date: Date) => ({
      seconds: date.getTime() / 1000,
      nanoseconds: 0,
    })),
  },
};

export const mockAuth = {
  currentUser: { uid: 'test-user-123', email: 'test@test.com' },
  onAuthStateChanged: vi.fn((callback) => {
    callback({ uid: 'test-user-123', email: 'test@test.com' });
    return vi.fn();
  }),
  signInWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: 'test-user-123' } })),
  signOut: vi.fn(() => Promise.resolve()),
};

export const mockAuth = {
  currentUser: { uid: 'test-user-123', email: 'test@test.com' },
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
};

// Mock Firebase config
export const mockDb = {};

// Reset all mocks
export const resetFirebaseMocks = () => {
  mockGetDoc.mockReset();
  mockGetDocs.mockReset();
  mockAddDoc.mockReset();
  mockUpdateDoc.mockReset();
  mockDeleteDoc.mockReset();
  mockRunTransaction.mockReset();
  mockDoc.mockReset();
  mockCollection.mockReset();
  mockQuery.mockReset();
  mockWhere.mockReset();
  mockOrderBy.mockReset();
  mockLimit.mockReset();
  mockOnSnapshot.mockReset();
};
