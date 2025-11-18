/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║              FIREBASE REAL INTEGRATION TESTS                               ║
 * ║  Tests REALES con Firebase Emulator - SIN MOCKS                           ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Estos tests se ejecutan contra el emulador de Firebase
 * con datos REALES en Firestore, no mocks.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { 
  initializeTestFirebase, 
  clearAllBancosCollections, 
  cleanupTestFirebase,
  getTestDb 
} from '../helpers/firebase-test-helper';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

describe('🔥 Firebase Real Integration Tests', () => {
  let db: any;

  beforeAll(async () => {
    const { db: testDb } = initializeTestFirebase();
    db = testDb;
  });

  afterAll(async () => {
    await cleanupTestFirebase();
  });

  beforeEach(async () => {
    await clearAllBancosCollections(db);
  });

  describe('✅ CRUD Operations - Ingresos', () => {
    it('debe crear un ingreso REAL en Firestore', async () => {
      const ingreso = {
        Concepto: 'Venta Test',
        Ingreso: 1000,
        Fecha: new Date(),
        Referencia: 'TEST-001',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'profit_ingresos'), ingreso);
      
      expect(docRef.id).toBeDefined();
      expect(docRef.id.length).toBeGreaterThan(0);

      // Verificar que se guardó correctamente
      const savedDoc = await getDoc(docRef);
      expect(savedDoc.exists()).toBe(true);
      expect(savedDoc.data()?.Concepto).toBe('Venta Test');
      expect(savedDoc.data()?.Ingreso).toBe(1000);
    });

    it('debe leer todos los ingresos REALES', async () => {
      // Crear múltiples ingresos
      const ingresos = [
        { Concepto: 'Venta 1', Ingreso: 500, Fecha: new Date() },
        { Concepto: 'Venta 2', Ingreso: 750, Fecha: new Date() },
        { Concepto: 'Venta 3', Ingreso: 1200, Fecha: new Date() }
      ];

      for (const ingreso of ingresos) {
        await addDoc(collection(db, 'profit_ingresos'), ingreso);
      }

      // Leer todos
      const snapshot = await getDocs(collection(db, 'profit_ingresos'));
      
      expect(snapshot.size).toBe(3);
      expect(snapshot.docs.length).toBe(3);
      
      const montos = snapshot.docs.map(doc => doc.data().Ingreso);
      expect(montos).toContain(500);
      expect(montos).toContain(750);
      expect(montos).toContain(1200);
    });

    it('debe actualizar un ingreso REAL', async () => {
      // Crear ingreso
      const docRef = await addDoc(collection(db, 'profit_ingresos'), {
        Concepto: 'Venta Original',
        Ingreso: 1000,
        Fecha: new Date()
      });

      // Actualizar
      await updateDoc(docRef, {
        Concepto: 'Venta Actualizada',
        Ingreso: 1500
      });

      // Verificar actualización
      const updated = await getDoc(docRef);
      expect(updated.data()?.Concepto).toBe('Venta Actualizada');
      expect(updated.data()?.Ingreso).toBe(1500);
    });

    it('debe eliminar un ingreso REAL', async () => {
      // Crear ingreso
      const docRef = await addDoc(collection(db, 'profit_ingresos'), {
        Concepto: 'Para Eliminar',
        Ingreso: 500,
        Fecha: new Date()
      });

      // Verificar que existe
      let docSnapshot = await getDoc(docRef);
      expect(docSnapshot.exists()).toBe(true);

      // Eliminar
      await deleteDoc(docRef);

      // Verificar que fue eliminado
      docSnapshot = await getDoc(docRef);
      expect(docSnapshot.exists()).toBe(false);
    });
  });

  describe('✅ CRUD Operations - Gastos', () => {
    it('debe crear un gasto REAL en Firestore', async () => {
      const gasto = {
        Concepto: 'Compra Test',
        Gasto: 500,
        Fecha: new Date(),
        Proveedor: 'Proveedor Test',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'profit_gastos'), gasto);
      
      expect(docRef.id).toBeDefined();

      const savedDoc = await getDoc(docRef);
      expect(savedDoc.exists()).toBe(true);
      expect(savedDoc.data()?.Concepto).toBe('Compra Test');
      expect(savedDoc.data()?.Gasto).toBe(500);
    });

    it('debe calcular totales REALES', async () => {
      // Crear ingresos
      await addDoc(collection(db, 'profit_ingresos'), { Ingreso: 1000, Fecha: new Date() });
      await addDoc(collection(db, 'profit_ingresos'), { Ingreso: 500, Fecha: new Date() });
      
      // Crear gastos
      await addDoc(collection(db, 'profit_gastos'), { Gasto: 300, Fecha: new Date() });
      await addDoc(collection(db, 'profit_gastos'), { Gasto: 200, Fecha: new Date() });

      // Calcular totales
      const ingresosSnapshot = await getDocs(collection(db, 'profit_ingresos'));
      const gastosSnapshot = await getDocs(collection(db, 'profit_gastos'));

      const totalIngresos = ingresosSnapshot.docs.reduce((sum, doc) => sum + (doc.data().Ingreso || 0), 0);
      const totalGastos = gastosSnapshot.docs.reduce((sum, doc) => sum + (doc.data().Gasto || 0), 0);
      const balance = totalIngresos - totalGastos;

      expect(totalIngresos).toBe(1500);
      expect(totalGastos).toBe(500);
      expect(balance).toBe(1000);
    });
  });

  describe('✅ Multiple Bancos Operations', () => {
    it('debe manejar múltiples bancos simultáneamente', async () => {
      const bancos = ['profit', 'azteca', 'boveda_monte'];

      // Crear ingresos en cada banco
      for (const banco of bancos) {
        await addDoc(collection(db, `${banco}_ingresos`), {
          Concepto: `Ingreso ${banco}`,
          Ingreso: 1000,
          Fecha: new Date()
        });
      }

      // Verificar que cada banco tiene sus ingresos
      for (const banco of bancos) {
        const snapshot = await getDocs(collection(db, `${banco}_ingresos`));
        expect(snapshot.size).toBe(1);
        expect(snapshot.docs[0].data().Concepto).toBe(`Ingreso ${banco}`);
      }
    });
  });

  describe('✅ Query Operations', () => {
    it('debe ordenar ingresos por fecha', async () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');
      const date3 = new Date('2024-01-03');

      await addDoc(collection(db, 'profit_ingresos'), { Ingreso: 100, Fecha: date2 });
      await addDoc(collection(db, 'profit_ingresos'), { Ingreso: 200, Fecha: date3 });
      await addDoc(collection(db, 'profit_ingresos'), { Ingreso: 50, Fecha: date1 });

      const q = query(collection(db, 'profit_ingresos'), orderBy('Fecha', 'desc'));
      const snapshot = await getDocs(q);

      const fechas = snapshot.docs.map(doc => doc.data().Fecha.toDate().getTime());
      
      // Verificar que están ordenadas descendentemente
      expect(fechas[0]).toBeGreaterThanOrEqual(fechas[1]);
      expect(fechas[1]).toBeGreaterThanOrEqual(fechas[2]);
    });
  });

  describe('✅ RF Actual Operations', () => {
    it('debe crear y leer documento RF Actual', async () => {
      const rfData = {
        capital_total: 100000,
        total_ingresos: 50000,
        total_gastos: 25000,
        balance: 75000,
        fecha_actualizacion: new Date()
      };

      const docRef = await addDoc(collection(db, 'rf_actual'), rfData);
      
      const savedDoc = await getDoc(docRef);
      expect(savedDoc.exists()).toBe(true);
      expect(savedDoc.data()?.capital_total).toBe(100000);
      expect(savedDoc.data()?.balance).toBe(75000);
    });
  });

  describe('✅ Error Handling', () => {
    it('debe manejar documentos inexistentes', async () => {
      const docRef = doc(db, 'profit_ingresos', 'documento-inexistente');
      const docSnapshot = await getDoc(docRef);
      
      expect(docSnapshot.exists()).toBe(false);
    });

    it('debe manejar colecciones vacías', async () => {
      const snapshot = await getDocs(collection(db, 'nueva_coleccion_vacia'));
      
      expect(snapshot.size).toBe(0);
      expect(snapshot.docs).toHaveLength(0);
    });
  });

  describe('✅ Performance Tests', () => {
    it('debe crear múltiples documentos rápidamente', async () => {
      const startTime = Date.now();
      
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(
          addDoc(collection(db, 'profit_ingresos'), {
            Concepto: `Venta ${i}`,
            Ingreso: 100 + i,
            Fecha: new Date()
          })
        );
      }
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Verificar que se crearon
      const snapshot = await getDocs(collection(db, 'profit_ingresos'));
      expect(snapshot.size).toBe(50);
      
      // Debe completarse en menos de 5 segundos
      expect(duration).toBeLessThan(5000);
    });
  });
});
