/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    FIREBASE TEST HELPER                                    ║
 * ║  Helper para inicializar Firebase con el emulador para tests reales       ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

import { getApps, initializeApp, deleteApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, getDocs, deleteDoc } from 'firebase/firestore';

let testApp: any = null;
let testDb: any = null;

/**
 * Inicializa Firebase para tests con el emulador
 */
export function initializeTestFirebase() {
  // Limpiar apps existentes
  const apps = getApps();
  apps.forEach(app => deleteApp(app));

  // Configuración de test
  const testConfig = {
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'demo-test',
    storageBucket: 'test.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abcdef123456'
  };

  testApp = initializeApp(testConfig);
  testDb = getFirestore(testApp);

  // Conectar al emulador
  try {
    connectFirestoreEmulator(testDb, 'localhost', 8080);
  } catch (error) {
    // Ya conectado
  }

  return { app: testApp, db: testDb };
}

/**
 * Limpia todos los documentos de una colección
 */
export async function clearCollection(db: any, collectionName: string) {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.warn(`No se pudo limpiar ${collectionName}:`, error);
  }
}

/**
 * Limpia todas las colecciones de bancos
 */
export async function clearAllBancosCollections(db: any) {
  const bancos = [
    'almacen_monte',
    'boveda_monte',
    'boveda_usa',
    'azteca',
    'utilidades',
    'flete_sur',
    'leftie',
    'profit'
  ];

  const promises: Promise<void>[] = [];

  for (const banco of bancos) {
    promises.push(clearCollection(db, `${banco}_ingresos`));
    promises.push(clearCollection(db, `${banco}_gastos`));
  }

  promises.push(clearCollection(db, 'rf_actual'));

  await Promise.all(promises);
}

/**
 * Limpia Firebase después de los tests
 */
export async function cleanupTestFirebase() {
  if (testApp) {
    await deleteApp(testApp);
    testApp = null;
    testDb = null;
  }
}

/**
 * Obtiene la instancia de la base de datos de test
 */
export function getTestDb() {
  return testDb;
}
