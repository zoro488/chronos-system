#!/usr/bin/env node

/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                   CHRONOS DATA IMPORT SCRIPT                               ║
 * ║           Importa datos desde BASE_DATOS_FLOWDISTRIBUTOR_UNIFICADO.json   ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Este script importa todos los datos del JSON unificado a Firestore.
 *
 * DATOS A IMPORTAR:
 * - 96 Ventas
 * - 31 Clientes
 * - 7 Bancos
 * - 8 Distribuidores
 * - 483 Movimientos bancarios
 * - Órdenes de compra
 *
 * USO:
 *   node scripts/importar-datos.js
 *
 * REQUISITOS:
 *   - Node.js >= 18
 *   - Firebase proyecto configurado
 *   - .env con credenciales Firebase
 */

import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import {
    doc,
    getFirestore,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// ============================================================================
// SETUP
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
config({ path: join(__dirname, '../.env') });

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = {
  title: (msg) => console.log(`\n${colors.bright}${colors.blue}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.bright}📝 ${msg}${colors.reset}`),
};

// ============================================================================
// FIREBASE CONFIGURATION
// ============================================================================

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

log.title('🔥 CHRONOS DATA IMPORT - FIRESTORE');
console.log('='.repeat(80));

// Validar configuración
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  log.error('Firebase credentials no encontradas en .env');
  log.info('Asegúrate de tener el archivo .env con las variables VITE_FIREBASE_*');
  process.exit(1);
}

log.step('Inicializando Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
log.success(`Firebase conectado: ${firebaseConfig.projectId}`);

// ============================================================================
// LOAD DATA
// ============================================================================

log.step('Cargando datos desde JSON...');
// Script está en: src/apps/FlowDistributor/chronos-system/scripts/
// Datos están en: src/apps/FlowDistributor/data/
const dataPath = join(__dirname, '../../../FlowDistributor/data/BASE_DATOS_FLOWDISTRIBUTOR_UNIFICADO.json');
let data;

try {
  const jsonContent = readFileSync(dataPath, 'utf-8');
  data = JSON.parse(jsonContent);
  log.success('Datos cargados correctamente');
  log.info(`Archivo: ${dataPath}`);
} catch (error) {
  log.error(`Error leyendo archivo: ${error.message}`);
  log.info(`Ruta intentada: ${dataPath}`);
  process.exit(1);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convierte fecha ISO string a Firestore Timestamp
 */
const parseDate = (dateString) => {
  if (!dateString) return Timestamp.now();
  const date = new Date(dateString);
  return Timestamp.fromDate(date);
};

/**
 * Importa documentos en batches
 */
const importBatch = async (collectionName, documents, transform = (doc) => doc) => {
  if (!documents || documents.length === 0) {
    log.warning(`${collectionName}: No hay documentos para importar`);
    return 0;
  }

  log.step(`Importando ${documents.length} documentos a ${collectionName}...`);

  const BATCH_SIZE = 500; // Límite de Firestore
  let totalImported = 0;

  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const batchDocs = documents.slice(i, i + BATCH_SIZE);

    for (let j = 0; j < batchDocs.length; j++) {
      const document = batchDocs[j];
      const docIndex = i + j;
      try {
        const transformedDoc = transform(document, docIndex);
        const docId = transformedDoc.id || `${collectionName}-${docIndex + 1}`;
        const docRef = doc(db, collectionName, docId);
        batch.set(docRef, transformedDoc);
      } catch (error) {
        log.error(`Error preparando documento: ${error.message}`);
      }
    }

    try {
      await batch.commit();
      totalImported += batchDocs.length;
      log.info(`Batch ${Math.floor(i / BATCH_SIZE) + 1} completado (${batchDocs.length} docs)`);
    } catch (error) {
      log.error(`Error en batch: ${error.message}`);
    }
  }

  log.success(`${collectionName}: ${totalImported} documentos importados`);
  return totalImported;
};

// ============================================================================
// IMPORT FUNCTIONS
// ============================================================================

/**
 * Importar ventas
 */
const importVentas = async () => {
  log.title('\n📊 IMPORTANDO VENTAS');

  const ventas = data.ventasLocales?.ventasLocal || [];

  const transformVenta = (venta, index) => ({
    // Generar ID único basado en fecha y cliente
    id: `venta-${index + 1}`,
    folio: `V-${String(index + 1).padStart(4, '0')}`,
    fecha: parseDate(venta.fecha),
    clienteId: venta.cliente?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
    clienteNombre: venta.cliente || 'Cliente desconocido',
    cantidad: venta.cantidad || 0,
    precioVenta: venta.precioVenta || 0,
    total: venta.ingreso || venta.bovedaMonte || venta.bovedaUSA || venta.almacenMonte || 0,
    ingreso: venta.ingreso || 0,
    bovedaMonte: venta.bovedaMonte || 0,
    bovedaUSA: venta.bovedaUSA || 0,
    almacenMonte: venta.almacenMonte || 0,
    flete: venta.flete || 'No aplica',
    fleteUtilidad: venta.fleteUtilidad || 0,
    utilidad: venta.utilidad || 0,
    estado: venta.estatus || venta.estado || 'pendiente',
    notas: venta.concepto || '',
    ocRelacionada: venta.ocRelacionada || '',
    createdAt: parseDate(venta.fecha),
    updatedAt: Timestamp.now(),
    createdBy: 'migration',
  });

  return await importBatch('ventas', ventas, transformVenta);
};

/**
 * Importar clientes
 */
const importClientes = async () => {
  log.title('\n👥 IMPORTANDO CLIENTES');

  const clientes = data.clientes?.clientes || [];

  const transformCliente = (cliente) => ({
    // Generar ID desde el nombre del cliente
    id: (cliente.cliente || 'cliente-desconocido').toLowerCase().replace(/\s+/g, '-'),
    nombre: cliente.cliente || 'Cliente desconocido',
    empresa: cliente.cliente || 'Sin empresa',
    email: '',
    telefono: '',
    direccion: '',
    rfc: '',
    // Datos financieros del JSON
    saldoActual: cliente.actual || 0,
    deuda: cliente.deuda || 0,
    abonos: cliente.abonos || 0,
    saldoPendiente: cliente.pendiente || 0,
    estado: (cliente.pendiente || 0) < 0 ? 'activo' : 'pendiente',
    observaciones: cliente.observaciones || '',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return await importBatch('clientes', clientes, transformCliente);
};

/**
 * Importar bancos
 */
const importBancos = async () => {
  log.title('\n🏦 IMPORTANDO BANCOS');

  const bancosData = [
    {
      id: 'boveda-monte',
      nombre: 'Bóveda Monte',
      codigo: 'BM',
      icono: '🏔️',
      color: '#4CAF50',
      capitalInicial: 0,
      capitalActual: 0,
      estado: 'activo',
    },
    {
      id: 'boveda-usa',
      nombre: 'Bóveda USA',
      codigo: 'BU',
      icono: '🇺🇸',
      color: '#2196F3',
      capitalInicial: 0,
      capitalActual: 0,
      estado: 'activo',
    },
    {
      id: 'utilidades',
      nombre: 'Utilidades',
      codigo: 'UT',
      icono: '💰',
      color: '#FFC107',
      capitalInicial: 0,
      capitalActual: 0,
      estado: 'activo',
    },
    {
      id: 'fletes',
      nombre: 'Flete Sur',
      codigo: 'FS',
      icono: '🚚',
      color: '#FF5722',
      capitalInicial: 0,
      capitalActual: 0,
      estado: 'activo',
    },
    {
      id: 'azteca',
      nombre: 'Banco Azteca',
      codigo: 'AZ',
      icono: '🏛️',
      color: '#FF9800',
      capitalInicial: 0,
      capitalActual: 0,
      estado: 'activo',
    },
    {
      id: 'leftie',
      nombre: 'Banco Leftie',
      codigo: 'LF',
      icono: '🏦',
      color: '#9C27B0',
      capitalInicial: 0,
      capitalActual: 0,
      estado: 'activo',
    },
    {
      id: 'profit',
      nombre: 'Banco Profit',
      codigo: 'PR',
      icono: '💼',
      color: '#00BCD4',
      capitalInicial: 0,
      capitalActual: 0,
      estado: 'activo',
    },
  ];

  return await importBatch('bancos', bancosData);
};

/**
 * Importar distribuidores
 */
const importDistribuidores = async () => {
  log.title('\n🚛 IMPORTANDO DISTRIBUIDORES');

  const distribuidores = data.ordenesCompra?.distribuidores?.distribuidores || [];

  const transformDistribuidor = (dist) => ({
    id: dist.id || dist.nombre.toLowerCase().replace(/\s+/g, '-'),
    nombre: dist.nombre,
    empresa: dist.empresa || dist.nombre,
    contacto: dist.contacto || '',
    telefono: dist.telefono || '',
    email: dist.email || '',
    direccion: dist.direccion || '',
    productoPrincipal: dist.productoPrincipal || 'Productos varios',
    precioBase: dist.precioBase || 0,
    descuentoVolumen: dist.descuentoVolumen || 0,
    diasCredito: dist.diasCredito || 0,
    saldoPendiente: dist.saldoPendiente || 0,
    totalCompras: dist.totalCompras || 0,
    estado: dist.estado || 'activo',
    notas: dist.notas || '',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return await importBatch('distribuidores', distribuidores, transformDistribuidor);
};

// ============================================================================
// MAIN EXECUTION
// ============================================================================

const main = async () => {
  log.title('🚀 INICIANDO IMPORTACIÓN COMPLETA');
  console.log('='.repeat(80));

  const startTime = Date.now();
  const results = {
    ventas: 0,
    clientes: 0,
    bancos: 0,
    distribuidores: 0,
  };

  try {
    // Importar en orden (clientes y distribuidores primero por FK)
    results.clientes = await importClientes();
    results.distribuidores = await importDistribuidores();
    results.bancos = await importBancos();
    results.ventas = await importVentas();

    // Resumen final
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    log.title('\n✅ IMPORTACIÓN COMPLETADA');
    console.log('='.repeat(80));
    log.success(`Ventas: ${results.ventas}`);
    log.success(`Clientes: ${results.clientes}`);
    log.success(`Bancos: ${results.bancos}`);
    log.success(`Distribuidores: ${results.distribuidores}`);
    console.log('='.repeat(80));
    log.info(`⏱️  Tiempo total: ${duration}s`);
    log.info(`🔥 Proyecto: ${firebaseConfig.projectId}`);
    console.log('='.repeat(80));

    process.exit(0);
  } catch (error) {
    log.error(`Error en importación: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

// Ejecutar
main();
