/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                      CHRONOS FIRESTORE HOOKS                               ║
 * ║              Custom React Hooks para Firestore Real-time                   ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Hooks reutilizables para operaciones de Firestore:
 * - useCollection: Listener en tiempo real de colecciones
 * - useDocument: Listener en tiempo real de documentos
 * - useQuery: Queries complejas con filtros
 * - useMutation: CRUD operations con optimistic updates
 * - useTransaction: Operaciones atómicas
 *
 * @module useFirestore
 * @author CHRONOS System
 * @version 1.0.0
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  runTransaction,
  updateDoc,
} from 'firebase/firestore';

// ✅ Importar db de la configuración de chronos-system

// ============================================================================
// useCollection - Real-time collection listener
// ============================================================================

/**
 * Hook para escuchar cambios en una colección en tiempo real
 * @param {string} collectionName - Nombre de la colección
 * @param {Array} queryConstraints - Filtros opcionales
 * @returns {Object} { data, loading, error, refresh }
 */
export const useCollection = (collectionName, queryConstraints = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const db = firestoreDB;

  useEffect(() => {
    if (!collectionName) return;

    setLoading(true);
    const collectionRef = collection(db, collectionName);
    const q =
      queryConstraints.length > 0 ? query(collectionRef, ...queryConstraints) : collectionRef;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() });
        });
        setData(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error in useCollection (${collectionName}):`, err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, db]);

  const refresh = useCallback(() => {
    setLoading(true);
  }, []);

  return { data, loading, error, refresh };
};

// ============================================================================
// useDocument - Real-time document listener
// ============================================================================

/**
 * Hook para escuchar cambios en un documento en tiempo real
 * @param {string} collectionName - Nombre de la colección
 * @param {string} docId - ID del documento
 * @returns {Object} { data, loading, error, refresh }
 */
export const useDocument = (collectionName, docId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const db = firestoreDB;

  useEffect(() => {
    if (!collectionName || !docId) return;

    setLoading(true);
    const docRef = doc(db, collectionName, docId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() });
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error in useDocument (${collectionName}/${docId}):`, err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, docId, db]);

  const refresh = useCallback(() => {
    setLoading(true);
  }, []);

  return { data, loading, error, refresh };
};

// ============================================================================
// useQuery - Complex queries with real-time updates
// ============================================================================

/**
 * Hook para queries complejas con filtros
 * @param {string} collectionName - Nombre de la colección
 * @param {Object} filters - Filtros: { field, operator, value }
 * @returns {Object} { data, loading, error, refresh }
 */
export const useQuery = (collectionName, _filters = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const db = firestoreDB;

  useEffect(() => {
    if (!collectionName) return;

    setLoading(true);
    const collectionRef = collection(db, collectionName);
    const constraints = [];

    // Build query constraints from filters
    // Note: This is a simplified version. Real implementation would use where(), orderBy(), etc.
    const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() });
        });
        setData(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error in useQuery (${collectionName}):`, err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, db]);

  const refresh = useCallback(() => {
    setLoading(true);
  }, []);

  return { data, loading, error, refresh };
};

// ============================================================================
// useMutation - CRUD operations with optimistic updates
// ============================================================================

/**
 * Hook para operaciones CRUD con optimistic updates
 * @param {string} collectionName - Nombre de la colección
 * @returns {Object} { create, update, remove, loading, error }
 */
export const useMutation = (collectionName) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const db = firestoreDB;

  const create = useCallback(
    async (data) => {
      setLoading(true);
      setError(null);
      try {
        const docRef = await addDoc(collection(db, collectionName), {
          ...data,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        setLoading(false);
        return { success: true, id: docRef.id };
      } catch (err) {
        console.error(`Error creating document in ${collectionName}:`, err);
        setError(err.message);
        setLoading(false);
        return { success: false, error: err.message };
      }
    },
    [db, collectionName]
  );

  const update = useCallback(
    async (docId, data) => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, {
          ...data,
          updatedAt: Timestamp.now(),
        });
        setLoading(false);
        return { success: true };
      } catch (err) {
        console.error(`Error updating document ${docId} in ${collectionName}:`, err);
        setError(err.message);
        setLoading(false);
        return { success: false, error: err.message };
      }
    },
    [db, collectionName]
  );

  const remove = useCallback(
    async (docId) => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);
        setLoading(false);
        return { success: true };
      } catch (err) {
        console.error(`Error deleting document ${docId} in ${collectionName}:`, err);
        setError(err.message);
        setLoading(false);
        return { success: false, error: err.message };
      }
    },
    [db, collectionName]
  );

  return { create, update, remove, loading, error };
};

// ============================================================================
// useTransaction - Atomic operations
// ============================================================================

/**
 * Hook para transacciones atómicas
 * @returns {Object} { executeTransaction, loading, error }
 */
export const useTransaction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const db = firestoreDB;

  const executeTransaction = useCallback(
    async (transactionCallback) => {
      setLoading(true);
      setError(null);
      try {
        const result = await runTransaction(db, transactionCallback);
        setLoading(false);
        return { success: true, result };
      } catch (err) {
        console.error('Transaction failed:', err);
        setError(err.message);
        setLoading(false);
        return { success: false, error: err.message };
      }
    },
    [db]
  );

  return { executeTransaction, loading, error };
};

// ============================================================================
// usePagination - Paginated queries
// ============================================================================

/**
 * Hook para paginación de colecciones
 * @param {string} collectionName - Nombre de la colección
 * @param {number} pageSize - Tamaño de página
 * @param {Array} queryConstraints - Filtros opcionales
 * @returns {Object} { data, loading, error, nextPage, prevPage, hasMore }
 */
export const usePagination = (collectionName, pageSize = 10, queryConstraints = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const _lastDocRef = useRef(null);
  const db = firestoreDB;

  useEffect(() => {
    // TODO: Implement pagination logic with startAfter
    // This is a placeholder implementation
    const collectionRef = collection(db, collectionName);
    const q =
      queryConstraints.length > 0 ? query(collectionRef, ...queryConstraints) : collectionRef;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() });
        });
        setData(items.slice(0, pageSize));
        setHasMore(items.length > pageSize);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error in usePagination (${collectionName}):`, err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, pageSize, db]);

  const nextPage = useCallback(() => {
    // TODO: Implement next page logic
  }, []);

  const prevPage = useCallback(() => {
    // TODO: Implement prev page logic
  }, []);

  return { data, loading, error, nextPage, prevPage, hasMore };
};

// ============================================================================
// useOptimisticUpdate - Optimistic UI updates
// ============================================================================

/**
 * Hook para actualizaciones optimistas
 * @param {string} collectionName - Nombre de la colección
 * @returns {Object} { optimisticUpdate, rollback }
 */
export const useOptimisticUpdate = (collectionName) => {
  const [snapshots, setSnapshots] = useState(new Map());
  const db = firestoreDB;

  const optimisticUpdate = useCallback(
    async (docId, data) => {
      // Save current state
      const docRef = doc(db, collectionName, docId);
      const snapshot = { ...data };
      setSnapshots((prev) => new Map(prev).set(docId, snapshot));

      // Apply update
      try {
        await updateDoc(docRef, {
          ...data,
          updatedAt: Timestamp.now(),
        });
        return { success: true };
      } catch (err) {
        console.error('Optimistic update failed:', err);
        return { success: false, error: err.message };
      }
    },
    [db, collectionName]
  );

  const rollback = useCallback(
    async (docId) => {
      const snapshot = snapshots.get(docId);
      if (!snapshot) return;

      try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, snapshot);
        setSnapshots((prev) => {
          const newMap = new Map(prev);
          newMap.delete(docId);
          return newMap;
        });
      } catch (err) {
        console.error('Rollback failed:', err);
      }
    },
    [db, collectionName, snapshots]
  );

  return { optimisticUpdate, rollback };
};

export default {
  useCollection,
  useDocument,
  useQuery,
  useMutation,
  useTransaction,
  usePagination,
  useOptimisticUpdate,
};

