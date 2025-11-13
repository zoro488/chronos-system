#!/usr/bin/env node
/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║              VERIFICADOR DE MEGA AI AGENT - CHRONOS SYSTEM                ║
 * ║  Script para verificar la integración completa del AI Agent               ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 * 
 * VERIFICA:
 * - MegaAIAgent.js funcionando correctamente
 * - VoiceService.js con Deepgram API
 * - UserLearningService.js con perfiles de usuario
 * - API Keys configuradas (Anthropic, OpenAI, Deepgram)
 * - Integración con Firebase
 * - Exportaciones PDF/Excel
 * 
 * USO:
 *   node scripts/verify-ai-agent.js
 *   node scripts/verify-ai-agent.js --verbose
 */

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const REQUIRED_ENV_VARS = {
  VITE_ANTHROPIC_API_KEY: 'Anthropic Claude API',
  VITE_OPENAI_API_KEY: 'OpenAI GPT API',
  VITE_DEEPGRAM_API_KEY: 'Deepgram Voice API',
  VITE_FIREBASE_API_KEY: 'Firebase API Key',
  VITE_FIREBASE_PROJECT_ID: 'Firebase Project ID',
};

const REQUIRED_FILES = [
  'services/MegaAIAgent.js',
  'services/VoiceService.js',
  'services/UserLearningService.js',
  'config/firebase.js',
];

const REQUIRED_PACKAGES = {
  '@anthropic-ai/sdk': 'Anthropic SDK',
  'openai': 'OpenAI SDK',
  'jspdf': 'PDF Generation',
  'xlsx': 'Excel Export',
  'firebase': 'Firebase SDK',
};

// ============================================================================
// UTILIDADES
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const logger = {
  header: (msg) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  detail: (msg) => console.log(`  ${colors.reset}${msg}`),
};

/**
 * Lee variables de entorno de archivo .env si existe
 */
function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env');
  const envLocalPath = resolve(process.cwd(), '.env.local');
  
  const envVars = {};
  
  // Leer .env si existe
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
  }
  
  // Leer .env.local si existe (sobrescribe .env)
  if (existsSync(envLocalPath)) {
    const content = readFileSync(envLocalPath, 'utf-8');
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
  }
  
  return envVars;
}

/**
 * Verifica si un archivo existe y retorna su tamaño
 */
function checkFile(filePath) {
  const fullPath = resolve(process.cwd(), filePath);
  if (existsSync(fullPath)) {
    const stats = readFileSync(fullPath, 'utf-8');
    const lines = stats.split('\n').length;
    return { exists: true, lines };
  }
  return { exists: false, lines: 0 };
}

/**
 * Verifica package.json para dependencias
 */
function checkPackages() {
  const packagePath = resolve(process.cwd(), 'package.json');
  if (!existsSync(packagePath)) {
    return { exists: false, packages: {} };
  }
  
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  
  return { exists: true, packages: allDeps };
}

// ============================================================================
// VERIFICADORES
// ============================================================================

/**
 * Verifica variables de entorno
 */
function verifyEnvironmentVariables(verbose = false) {
  logger.header('1. VERIFICANDO VARIABLES DE ENTORNO');
  
  const envVars = { ...process.env, ...loadEnvFile() };
  let allConfigured = true;
  let configured = 0;
  
  for (const [key, description] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = envVars[key];
    const isConfigured = value && value !== '' && !value.includes('demo') && !value.includes('your-');
    
    if (isConfigured) {
      logger.success(`${description}`);
      if (verbose) {
        const masked = value.substring(0, 8) + '...';
        logger.detail(`${key}=${masked}`);
      }
      configured++;
    } else {
      logger.error(`${description} - NO CONFIGURADA`);
      logger.detail(`Falta: ${key}`);
      allConfigured = false;
    }
  }
  
  console.log();
  if (allConfigured) {
    logger.success(`✓ Todas las variables de entorno configuradas (${configured}/${Object.keys(REQUIRED_ENV_VARS).length})`);
  } else {
    logger.warning(`⚠ ${configured}/${Object.keys(REQUIRED_ENV_VARS).length} variables configuradas`);
    logger.info('Configura las variables faltantes en .env o .env.local');
  }
  
  return { allConfigured, configured, total: Object.keys(REQUIRED_ENV_VARS).length };
}

/**
 * Verifica archivos de servicio
 */
function verifyServiceFiles(verbose = false) {
  logger.header('2. VERIFICANDO ARCHIVOS DE SERVICIO');
  
  let allExist = true;
  let existCount = 0;
  
  for (const file of REQUIRED_FILES) {
    const { exists, lines } = checkFile(file);
    
    if (exists) {
      logger.success(`${file}`);
      if (verbose) {
        logger.detail(`${lines} líneas de código`);
      }
      existCount++;
    } else {
      logger.error(`${file} - NO ENCONTRADO`);
      allExist = false;
    }
  }
  
  console.log();
  if (allExist) {
    logger.success(`✓ Todos los archivos de servicio presentes (${existCount}/${REQUIRED_FILES.length})`);
  } else {
    logger.error(`✗ ${existCount}/${REQUIRED_FILES.length} archivos encontrados`);
  }
  
  return { allExist, existCount, total: REQUIRED_FILES.length };
}

/**
 * Verifica dependencias npm
 */
function verifyPackages(verbose = false) {
  logger.header('3. VERIFICANDO DEPENDENCIAS NPM');
  
  const { exists, packages } = checkPackages();
  
  if (!exists) {
    logger.error('package.json no encontrado');
    return { allInstalled: false, installed: 0, total: Object.keys(REQUIRED_PACKAGES).length };
  }
  
  let allInstalled = true;
  let installed = 0;
  
  for (const [pkg, description] of Object.entries(REQUIRED_PACKAGES)) {
    if (packages[pkg]) {
      logger.success(`${description}`);
      if (verbose) {
        logger.detail(`${pkg}@${packages[pkg]}`);
      }
      installed++;
    } else {
      logger.error(`${description} - NO INSTALADO`);
      logger.detail(`npm install ${pkg}`);
      allInstalled = false;
    }
  }
  
  console.log();
  if (allInstalled) {
    logger.success(`✓ Todas las dependencias instaladas (${installed}/${Object.keys(REQUIRED_PACKAGES).length})`);
  } else {
    logger.warning(`⚠ ${installed}/${Object.keys(REQUIRED_PACKAGES).length} dependencias instaladas`);
    logger.info('Ejecuta: npm install');
  }
  
  return { allInstalled, installed, total: Object.keys(REQUIRED_PACKAGES).length };
}

/**
 * Verifica integración con servicios
 */
function verifyIntegration(verbose = false) {
  logger.header('4. VERIFICANDO INTEGRACIÓN');
  
  const checks = [];
  
  // MegaAIAgent
  const megaAIPath = resolve(process.cwd(), 'services/MegaAIAgent.js');
  if (existsSync(megaAIPath)) {
    const content = readFileSync(megaAIPath, 'utf-8');
    
    // Verificar imports clave
    const hasAnthropicImport = content.includes('@anthropic-ai/sdk') || content.includes('anthropic');
    const hasOpenAIImport = content.includes('openai');
    const hasPDFExport = content.includes('jsPDF') || content.includes('jspdf');
    const hasExcelExport = content.includes('xlsx') || content.includes('XLSX');
    
    checks.push({
      name: 'MegaAIAgent - Anthropic Integration',
      status: hasAnthropicImport,
    });
    
    checks.push({
      name: 'MegaAIAgent - OpenAI Integration',
      status: hasOpenAIImport,
    });
    
    checks.push({
      name: 'MegaAIAgent - PDF Export',
      status: hasPDFExport,
    });
    
    checks.push({
      name: 'MegaAIAgent - Excel Export',
      status: hasExcelExport,
    });
  } else {
    checks.push({
      name: 'MegaAIAgent.js',
      status: false,
    });
  }
  
  // VoiceService
  const voicePath = resolve(process.cwd(), 'services/VoiceService.js');
  if (existsSync(voicePath)) {
    const content = readFileSync(voicePath, 'utf-8');
    const hasDeepgram = content.includes('deepgram') || content.includes('Deepgram');
    
    checks.push({
      name: 'VoiceService - Deepgram Integration',
      status: hasDeepgram,
    });
  } else {
    checks.push({
      name: 'VoiceService.js',
      status: false,
    });
  }
  
  // UserLearningService
  const learningPath = resolve(process.cwd(), 'services/UserLearningService.js');
  if (existsSync(learningPath)) {
    const content = readFileSync(learningPath, 'utf-8');
    const hasFirestore = content.includes('firestore') || content.includes('Firestore');
    
    checks.push({
      name: 'UserLearningService - Firestore Integration',
      status: hasFirestore,
    });
  } else {
    checks.push({
      name: 'UserLearningService.js',
      status: false,
    });
  }
  
  // Mostrar resultados
  let passed = 0;
  for (const check of checks) {
    if (check.status) {
      logger.success(check.name);
      passed++;
    } else {
      logger.error(check.name);
    }
  }
  
  console.log();
  const allPassed = passed === checks.length;
  if (allPassed) {
    logger.success(`✓ Todas las integraciones verificadas (${passed}/${checks.length})`);
  } else {
    logger.warning(`⚠ ${passed}/${checks.length} integraciones OK`);
  }
  
  return { allPassed, passed, total: checks.length };
}

/**
 * Genera reporte de configuración
 */
function generateSetupGuide(results) {
  logger.header('GUÍA DE CONFIGURACIÓN');
  
  console.log(`
Para completar la configuración del AI Agent:

1. CONFIGURAR API KEYS EN .env:
   ${colors.cyan}
   VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
   VITE_OPENAI_API_KEY=sk-proj-...
   VITE_DEEPGRAM_API_KEY=...
   ${colors.reset}
   
   Obtener keys en:
   • Anthropic: https://console.anthropic.com/settings/keys
   • OpenAI: https://platform.openai.com/api-keys
   • Deepgram: https://console.deepgram.com/

2. INSTALAR DEPENDENCIAS:
   ${colors.cyan}npm install${colors.reset}

3. VERIFICAR FIREBASE:
   ${colors.cyan}npm run health:check${colors.reset}

4. PROBAR AI AGENT:
   ${colors.cyan}npm run dev${colors.reset}
   
5. IMPORTAR DATOS:
   ${colors.cyan}npm run import:excel${colors.reset}
  `);
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

async function main() {
  const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');
  
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║            VERIFICADOR DE MEGA AI AGENT                            ║
║                   CHRONOS SYSTEM v2.0                              ║
╚════════════════════════════════════════════════════════════════════╝
  `);
  
  // Ejecutar verificaciones
  const envResults = verifyEnvironmentVariables(verbose);
  const fileResults = verifyServiceFiles(verbose);
  const packageResults = verifyPackages(verbose);
  const integrationResults = verifyIntegration(verbose);
  
  // Resumen final
  logger.header('RESUMEN DE VERIFICACIÓN');
  
  const totalChecks = 
    envResults.total + 
    fileResults.total + 
    packageResults.total + 
    integrationResults.total;
    
  const passedChecks = 
    envResults.configured + 
    fileResults.existCount + 
    packageResults.installed + 
    integrationResults.passed;
  
  const percentage = Math.round((passedChecks / totalChecks) * 100);
  
  console.log(`
  Variables de Entorno: ${envResults.configured}/${envResults.total} ${envResults.allConfigured ? '✓' : '✗'}
  Archivos de Servicio: ${fileResults.existCount}/${fileResults.total} ${fileResults.allExist ? '✓' : '✗'}
  Dependencias NPM:     ${packageResults.installed}/${packageResults.total} ${packageResults.allInstalled ? '✓' : '✗'}
  Integraciones:        ${integrationResults.passed}/${integrationResults.total} ${integrationResults.allPassed ? '✓' : '✗'}
  
  ${colors.bright}TOTAL: ${passedChecks}/${totalChecks} (${percentage}%)${colors.reset}
  `);
  
  if (percentage === 100) {
    logger.success('✓ Sistema completamente configurado y listo para usar');
    console.log('\nPróximos pasos:');
    console.log('  1. npm run dev - Iniciar servidor de desarrollo');
    console.log('  2. npm run import:excel - Importar datos desde Excel');
    console.log('  3. Probar el AI Agent en la aplicación');
  } else if (percentage >= 75) {
    logger.warning('⚠ Configuración casi completa');
    generateSetupGuide({ envResults, fileResults, packageResults, integrationResults });
  } else {
    logger.error('✗ Configuración incompleta');
    generateSetupGuide({ envResults, fileResults, packageResults, integrationResults });
  }
  
  // Exit code
  process.exit(percentage === 100 ? 0 : 1);
}

// Ejecutar
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { 
  verifyEnvironmentVariables, 
  verifyServiceFiles, 
  verifyPackages, 
  verifyIntegration 
};
