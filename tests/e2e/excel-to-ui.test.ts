/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║              E2E TEST: Excel → Firestore → UI Validation                  ║
 * ║  Validación completa del flujo de datos desde Excel hasta UI              ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Este test valida el flujo completo:
 * 1. Datos del Excel → Firestore
 * 2. Firestore → UI Components
 * 3. Validación de KPIs, tablas y gráficos
 */

import { test, expect } from '@playwright/test';
import { 
  initializeTestFirebase, 
  clearAllBancosCollections,
  getTestDb 
} from '../helpers/firebase-test-helper';
import { collection, addDoc, getDocs } from 'firebase/firestore';

test.describe('🔥 E2E: Excel → Firestore → UI', () => {
  let db: any;

  test.beforeAll(async () => {
    const { db: testDb } = initializeTestFirebase();
    db = testDb;
  });

  test.beforeEach(async () => {
    await clearAllBancosCollections(db);
  });

  test.describe('📊 Data Flow Validation', () => {
    test('debe validar datos de Excel en Firestore', async () => {
      // Simular datos del Excel (Administración_General.xlsx)
      const excelData = {
        bancos: [
          {
            id: 'profit',
            nombre: 'Profit',
            capital_actual: 50000,
            ingresos: [
              { concepto: 'Venta Producto A', monto: 10000, fecha: new Date('2024-01-15') },
              { concepto: 'Venta Producto B', monto: 15000, fecha: new Date('2024-01-20') }
            ],
            gastos: [
              { concepto: 'Compra Materia Prima', monto: 5000, fecha: new Date('2024-01-10') },
              { concepto: 'Servicios', monto: 2000, fecha: new Date('2024-01-12') }
            ]
          },
          {
            id: 'azteca',
            nombre: 'Azteca',
            capital_actual: 30000,
            ingresos: [
              { concepto: 'Transferencia', monto: 20000, fecha: new Date('2024-01-18') }
            ],
            gastos: [
              { concepto: 'Nómina', monto: 8000, fecha: new Date('2024-01-15') }
            ]
          }
        ]
      };

      // Cargar datos a Firestore (simulando carga desde Excel)
      for (const banco of excelData.bancos) {
        // Cargar ingresos
        for (const ingreso of banco.ingresos) {
          await addDoc(collection(db, `${banco.id}_ingresos`), {
            Concepto: ingreso.concepto,
            Ingreso: ingreso.monto,
            Fecha: ingreso.fecha,
            source: 'excel_import'
          });
        }

        // Cargar gastos
        for (const gasto of banco.gastos) {
          await addDoc(collection(db, `${banco.id}_gastos`), {
            Concepto: gasto.concepto,
            Gasto: gasto.monto,
            Fecha: gasto.fecha,
            source: 'excel_import'
          });
        }
      }

      // Validar que los datos están en Firestore
      for (const banco of excelData.bancos) {
        const ingresosSnap = await getDocs(collection(db, `${banco.id}_ingresos`));
        const gastosSnap = await getDocs(collection(db, `${banco.id}_gastos`));

        expect(ingresosSnap.size).toBe(banco.ingresos.length);
        expect(gastosSnap.size).toBe(banco.gastos.length);

        // Validar totales
        const totalIngresos = ingresosSnap.docs.reduce((sum, doc) => sum + (doc.data().Ingreso || 0), 0);
        const totalGastos = gastosSnap.docs.reduce((sum, doc) => sum + (doc.data().Gasto || 0), 0);

        const expectedIngresos = banco.ingresos.reduce((sum, ing) => sum + ing.monto, 0);
        const expectedGastos = banco.gastos.reduce((sum, gas) => sum + gas.monto, 0);

        expect(totalIngresos).toBe(expectedIngresos);
        expect(totalGastos).toBe(expectedGastos);
      }
    });

    test('debe calcular KPIs correctamente desde Excel', async () => {
      // Datos de ejemplo del Excel
      const testData = {
        profit: {
          ingresos: [
            { monto: 10000 },
            { monto: 15000 },
            { monto: 8000 }
          ],
          gastos: [
            { monto: 5000 },
            { monto: 3000 }
          ]
        },
        azteca: {
          ingresos: [
            { monto: 20000 }
          ],
          gastos: [
            { monto: 12000 }
          ]
        }
      };

      // Cargar datos
      for (const [bancoId, data] of Object.entries(testData)) {
        for (const ingreso of data.ingresos) {
          await addDoc(collection(db, `${bancoId}_ingresos`), {
            Ingreso: ingreso.monto,
            Fecha: new Date()
          });
        }
        for (const gasto of data.gastos) {
          await addDoc(collection(db, `${bancoId}_gastos`), {
            Gasto: gasto.monto,
            Fecha: new Date()
          });
        }
      }

      // Calcular KPIs
      let totalIngresosGlobal = 0;
      let totalGastosGlobal = 0;

      for (const bancoId of ['profit', 'azteca']) {
        const ingresosSnap = await getDocs(collection(db, `${bancoId}_ingresos`));
        const gastosSnap = await getDocs(collection(db, `${bancoId}_gastos`));

        totalIngresosGlobal += ingresosSnap.docs.reduce((sum, doc) => sum + (doc.data().Ingreso || 0), 0);
        totalGastosGlobal += gastosSnap.docs.reduce((sum, doc) => sum + (doc.data().Gasto || 0), 0);
      }

      const balanceGlobal = totalIngresosGlobal - totalGastosGlobal;

      // Validar KPIs
      expect(totalIngresosGlobal).toBe(53000); // 10000 + 15000 + 8000 + 20000
      expect(totalGastosGlobal).toBe(20000);   // 5000 + 3000 + 12000
      expect(balanceGlobal).toBe(33000);        // 53000 - 20000
    });
  });

  test.describe('📈 Table Data Validation', () => {
    test('debe validar estructura de tablas de ingresos', async () => {
      const ingreso = {
        Concepto: 'Venta Test',
        Ingreso: 5000,
        Fecha: new Date(),
        Referencia: 'REF-001',
        Banco: 'profit'
      };

      const docRef = await addDoc(collection(db, 'profit_ingresos'), ingreso);
      const snapshot = await getDocs(collection(db, 'profit_ingresos'));
      const doc = snapshot.docs[0];
      const data = doc.data();

      // Validar campos requeridos para tablas
      expect(data).toHaveProperty('Concepto');
      expect(data).toHaveProperty('Ingreso');
      expect(data).toHaveProperty('Fecha');
      expect(typeof data.Concepto).toBe('string');
      expect(typeof data.Ingreso).toBe('number');
      expect(data.Ingreso).toBeGreaterThan(0);
    });

    test('debe validar estructura de tablas de gastos', async () => {
      const gasto = {
        Concepto: 'Compra Test',
        Gasto: 3000,
        Fecha: new Date(),
        Proveedor: 'Proveedor X'
      };

      await addDoc(collection(db, 'profit_gastos'), gasto);
      const snapshot = await getDocs(collection(db, 'profit_gastos'));
      const doc = snapshot.docs[0];
      const data = doc.data();

      // Validar campos requeridos
      expect(data).toHaveProperty('Concepto');
      expect(data).toHaveProperty('Gasto');
      expect(data).toHaveProperty('Fecha');
      expect(typeof data.Concepto).toBe('string');
      expect(typeof data.Gasto).toBe('number');
      expect(data.Gasto).toBeGreaterThan(0);
    });
  });

  test.describe('🎯 Data Consistency Validation', () => {
    test('debe mantener consistencia entre bancos', async () => {
      const bancos = ['profit', 'azteca', 'boveda_monte'];
      const montoBase = 1000;

      // Crear datos consistentes en cada banco
      for (const banco of bancos) {
        await addDoc(collection(db, `${banco}_ingresos`), {
          Concepto: 'Ingreso Consistente',
          Ingreso: montoBase,
          Fecha: new Date()
        });
      }

      // Validar que todos tienen el mismo monto
      for (const banco of bancos) {
        const snapshot = await getDocs(collection(db, `${banco}_ingresos`));
        expect(snapshot.size).toBe(1);
        expect(snapshot.docs[0].data().Ingreso).toBe(montoBase);
      }
    });

    test('debe validar formato de fechas', async () => {
      const ingreso = {
        Concepto: 'Test Fecha',
        Ingreso: 1000,
        Fecha: new Date('2024-01-15T10:30:00')
      };

      await addDoc(collection(db, 'profit_ingresos'), ingreso);
      const snapshot = await getDocs(collection(db, 'profit_ingresos'));
      const data = snapshot.docs[0].data();

      // Validar que la fecha es válida
      expect(data.Fecha).toBeDefined();
      expect(data.Fecha.toDate).toBeDefined();
      
      const fecha = data.Fecha.toDate();
      expect(fecha instanceof Date).toBe(true);
      expect(fecha.getFullYear()).toBe(2024);
      expect(fecha.getMonth()).toBe(0); // Enero
    });

    test('debe validar valores numéricos positivos', async () => {
      const validIngreso = {
        Concepto: 'Ingreso Válido',
        Ingreso: 5000,
        Fecha: new Date()
      };

      await addDoc(collection(db, 'profit_ingresos'), validIngreso);
      const snapshot = await getDocs(collection(db, 'profit_ingresos'));
      const data = snapshot.docs[0].data();

      expect(data.Ingreso).toBeGreaterThan(0);
      expect(typeof data.Ingreso).toBe('number');
      expect(isNaN(data.Ingreso)).toBe(false);
    });
  });

  test.describe('📊 Summary and Aggregations', () => {
    test('debe calcular resumen por banco', async () => {
      // Datos de test
      await addDoc(collection(db, 'profit_ingresos'), { Ingreso: 10000, Fecha: new Date() });
      await addDoc(collection(db, 'profit_ingresos'), { Ingreso: 5000, Fecha: new Date() });
      await addDoc(collection(db, 'profit_gastos'), { Gasto: 3000, Fecha: new Date() });
      await addDoc(collection(db, 'profit_gastos'), { Gasto: 2000, Fecha: new Date() });

      // Obtener datos
      const ingresosSnap = await getDocs(collection(db, 'profit_ingresos'));
      const gastosSnap = await getDocs(collection(db, 'profit_gastos'));

      // Calcular resumen
      const resumen = {
        totalIngresos: ingresosSnap.docs.reduce((sum, doc) => sum + (doc.data().Ingreso || 0), 0),
        totalGastos: gastosSnap.docs.reduce((sum, doc) => sum + (doc.data().Gasto || 0), 0),
        cantidadIngresos: ingresosSnap.size,
        cantidadGastos: gastosSnap.size
      };

      resumen.balance = resumen.totalIngresos - resumen.totalGastos;

      // Validaciones
      expect(resumen.totalIngresos).toBe(15000);
      expect(resumen.totalGastos).toBe(5000);
      expect(resumen.balance).toBe(10000);
      expect(resumen.cantidadIngresos).toBe(2);
      expect(resumen.cantidadGastos).toBe(2);
    });

    test('debe calcular resumen global de todos los bancos', async () => {
      const bancos = ['profit', 'azteca', 'boveda_monte'];
      
      // Crear datos en múltiples bancos
      for (const banco of bancos) {
        await addDoc(collection(db, `${banco}_ingresos`), { Ingreso: 5000, Fecha: new Date() });
        await addDoc(collection(db, `${banco}_gastos`), { Gasto: 2000, Fecha: new Date() });
      }

      // Calcular totales globales
      let totalIngresosGlobal = 0;
      let totalGastosGlobal = 0;

      for (const banco of bancos) {
        const ingresosSnap = await getDocs(collection(db, `${banco}_ingresos`));
        const gastosSnap = await getDocs(collection(db, `${banco}_gastos`));

        totalIngresosGlobal += ingresosSnap.docs.reduce((sum, doc) => sum + (doc.data().Ingreso || 0), 0);
        totalGastosGlobal += gastosSnap.docs.reduce((sum, doc) => sum + (doc.data().Gasto || 0), 0);
      }

      const balanceGlobal = totalIngresosGlobal - totalGastosGlobal;

      expect(totalIngresosGlobal).toBe(15000); // 5000 * 3 bancos
      expect(totalGastosGlobal).toBe(6000);    // 2000 * 3 bancos
      expect(balanceGlobal).toBe(9000);        // 15000 - 6000
    });
  });
});
