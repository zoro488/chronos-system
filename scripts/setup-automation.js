#!/usr/bin/env node
/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║              SETUP AUTOMATION - CHRONOS SYSTEM                            ║
 * ║  Script de configuración automática (Node.js version)                    ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 * 
 * Alternative to setup-automation.ps1 for non-Windows users
 * 
 * CONFIGURA:
 * - GitHub CLI authentication
 * - Repository access
 * - Workflows verification
 * - Environment setup guidance
 * 
 * USO:
 *   node scripts/setup-automation.js
 *   node scripts/setup-automation.js --skip-checks
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { createInterface } from 'readline';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const REPO = 'zoro488/chronos-system';

const REQUIRED_SECRETS = [
  'FIREBASE_SERVICE_ACCOUNT_STAGING',
  'FIREBASE_SERVICE_ACCOUNT_PRODUCTION',
  'FIREBASE_TOKEN',
];

const OPTIONAL_SECRETS = [
  'SLACK_WEBHOOK',
  'SNYK_TOKEN',
];

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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const logger = {
  header: (msg) => console.log(`\n${colors.cyan}${colors.bright}🚀 ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  detail: (msg) => console.log(`  ${msg}`),
};

/**
 * Ejecuta comando y retorna resultado
 */
function runCommand(command, silent = true) {
  try {
    const result = execSync(command, { 
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    return { success: true, output: result.trim() };
  } catch (error) {
    return { success: false, output: error.message };
  }
}

/**
 * Pregunta al usuario
 */
function ask(question) {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    rl.question(`${colors.cyan}? ${question}${colors.reset} `, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Banner ASCII
 */
function showBanner() {
  console.log(`
${colors.magenta}╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🤖 CHRONOS SYSTEM - AUTOMATION SETUP                  ║
║                                                          ║
║   Repository: ${REPO.padEnd(25)}║
║                                                          ║
╚══════════════════════════════════════════════════════════╝${colors.reset}
  `);
}

// ============================================================================
// VERIFICADORES
// ============================================================================

/**
 * Verifica GitHub CLI
 */
function checkGitHubCLI() {
  logger.header('Verificando GitHub CLI...');
  
  const result = runCommand('gh --version');
  
  if (result.success) {
    const version = result.output.split('\n')[0];
    logger.success(`GitHub CLI instalado: ${version}`);
    return true;
  } else {
    logger.error('GitHub CLI no encontrado');
    logger.detail('Instala desde: https://cli.github.com');
    return false;
  }
}

/**
 * Verifica autenticación de GitHub
 */
function checkGitHubAuth() {
  logger.header('Verificando autenticación...');
  
  const result = runCommand('gh auth status 2>&1');
  
  if (result.success && result.output.includes('Logged in')) {
    logger.success('Autenticado en GitHub');
    // Extraer usuario
    const userMatch = result.output.match(/Logged in to [^\s]+ as ([^\s]+)/);
    if (userMatch) {
      logger.detail(`Usuario: ${userMatch[1]}`);
    }
    return true;
  } else {
    logger.warning('No autenticado en GitHub');
    return false;
  }
}

/**
 * Login a GitHub
 */
async function loginToGitHub() {
  logger.info('Iniciando proceso de autenticación...');
  
  const answer = await ask('¿Deseas autenticarte ahora? (Y/n)');
  
  if (answer.toLowerCase() !== 'n') {
    const result = runCommand('gh auth login -h github.com -w', false);
    return result.success;
  }
  
  return false;
}

/**
 * Verifica acceso al repositorio
 */
function checkRepositoryAccess() {
  logger.header('Verificando acceso al repositorio...');
  
  const result = runCommand(`gh repo view ${REPO} --json name,owner`);
  
  if (result.success) {
    try {
      const data = JSON.parse(result.output);
      logger.success(`Acceso confirmado: ${data.owner.login}/${data.name}`);
      return true;
    } catch (error) {
      logger.error('Error al parsear respuesta del repositorio');
      return false;
    }
  } else {
    logger.error(`No se puede acceder al repositorio: ${REPO}`);
    logger.detail('Verifica que tengas permisos de lectura');
    return false;
  }
}

/**
 * Lista workflows disponibles
 */
function listWorkflows() {
  logger.header('Workflows disponibles:');
  
  const result = runCommand(`gh workflow list --repo ${REPO}`);
  
  if (result.success) {
    console.log(result.output);
    logger.success('Workflows listados correctamente');
    return true;
  } else {
    logger.warning('No se pudieron listar workflows');
    return false;
  }
}

/**
 * Verifica secrets configurados
 */
function checkSecrets() {
  logger.header('Verificando secrets...');
  
  logger.info('Secrets requeridos:');
  REQUIRED_SECRETS.forEach(secret => {
    logger.detail(`• ${secret}`);
  });
  
  logger.info('\nSecrets opcionales:');
  OPTIONAL_SECRETS.forEach(secret => {
    logger.detail(`• ${secret}`);
  });
  
  logger.warning('\nLos secrets deben configurarse manualmente en GitHub');
  logger.detail(`URL: https://github.com/${REPO}/settings/secrets/actions`);
}

/**
 * Crea archivo .env.local si no existe
 */
async function createEnvFile() {
  logger.header('Configurando archivo .env...');
  
  const envLocalPath = resolve(process.cwd(), '.env.local');
  const envExamplePath = resolve(process.cwd(), '.env.example');
  
  if (existsSync(envLocalPath)) {
    logger.success('.env.local ya existe');
    return true;
  }
  
  if (!existsSync(envExamplePath)) {
    logger.warning('.env.example no encontrado');
    return false;
  }
  
  const answer = await ask('¿Deseas crear .env.local desde .env.example? (Y/n)');
  
  if (answer.toLowerCase() !== 'n') {
    const content = readFileSync(envExamplePath, 'utf-8');
    writeFileSync(envLocalPath, content);
    logger.success('.env.local creado');
    logger.warning('Recuerda completar los valores en .env.local');
    return true;
  }
  
  return false;
}

/**
 * Instala dependencias npm
 */
async function installDependencies() {
  logger.header('Instalando dependencias...');
  
  if (!existsSync(resolve(process.cwd(), 'package.json'))) {
    logger.error('package.json no encontrado');
    return false;
  }
  
  if (existsSync(resolve(process.cwd(), 'node_modules'))) {
    const answer = await ask('node_modules ya existe. ¿Reinstalar? (y/N)');
    if (answer.toLowerCase() !== 'y') {
      logger.info('Saltando instalación de dependencias');
      return true;
    }
  }
  
  logger.info('Instalando paquetes npm...');
  const result = runCommand('npm install', false);
  
  if (result.success) {
    logger.success('Dependencias instaladas correctamente');
    return true;
  } else {
    logger.error('Error al instalar dependencias');
    return false;
  }
}

/**
 * Ejecuta health check
 */
async function runHealthCheck() {
  logger.header('Ejecutando health check...');
  
  const scriptPath = resolve(process.cwd(), 'scripts/health-check.js');
  
  if (!existsSync(scriptPath)) {
    logger.warning('health-check.js no encontrado');
    return false;
  }
  
  const answer = await ask('¿Deseas ejecutar health check ahora? (Y/n)');
  
  if (answer.toLowerCase() !== 'n') {
    console.log();
    const result = runCommand('node scripts/health-check.js', false);
    return result.success;
  }
  
  return false;
}

/**
 * Ejecuta primer workflow
 */
async function triggerFirstWorkflow() {
  logger.header('Ejecutando primer workflow...');
  
  const answer = await ask('¿Deseas ejecutar el workflow de CI ahora? (y/N)');
  
  if (answer.toLowerCase() === 'y') {
    logger.info('Iniciando workflow de CI...');
    const result = runCommand(`gh workflow run ci.yml --repo ${REPO}`);
    
    if (result.success) {
      logger.success('Workflow CI iniciado');
      logger.detail(`Ver progreso: https://github.com/${REPO}/actions`);
      return true;
    } else {
      logger.warning('No se pudo iniciar el workflow');
      logger.detail('Ejecútalo manualmente desde GitHub Actions');
      return false;
    }
  }
  
  return false;
}

/**
 * Muestra resumen final
 */
function showSummary(results) {
  console.log(`
${colors.green}╔══════════════════════════════════════════════════════════╗
║                    ✅ SETUP COMPLETO                     ║
╚══════════════════════════════════════════════════════════╝${colors.reset}

${colors.bright}📋 CHECKLIST:${colors.reset}
`);
  
  const checkmark = (status) => status ? '✓' : '✗';
  const statusColor = (status) => status ? colors.green : colors.red;
  
  console.log(`  ${statusColor(results.ghCli)}${checkmark(results.ghCli)}${colors.reset} GitHub CLI configurado`);
  console.log(`  ${statusColor(results.ghAuth)}${checkmark(results.ghAuth)}${colors.reset} Autenticación verificada`);
  console.log(`  ${statusColor(results.repoAccess)}${checkmark(results.repoAccess)}${colors.reset} Acceso al repositorio confirmado`);
  console.log(`  ${statusColor(results.envFile)}${checkmark(results.envFile)}${colors.reset} Archivo .env.local configurado`);
  console.log(`  ${statusColor(results.dependencies)}${checkmark(results.dependencies)}${colors.reset} Dependencias instaladas`);
  console.log(`  ${colors.yellow}⚠${colors.reset} Secrets - Verificar configuración manual`);
  
  console.log(`
${colors.cyan}${colors.bright}🚀 PRÓXIMOS PASOS:${colors.reset}

  1. Configura secrets en GitHub:
     ${colors.blue}https://github.com/${REPO}/settings/secrets/actions${colors.reset}

  2. Completa las variables de entorno en .env.local

  3. Ejecuta verificaciones:
     ${colors.cyan}npm run health:check${colors.reset}
     ${colors.cyan}npm run verify:ai${colors.reset}

  4. Inicia desarrollo:
     ${colors.cyan}npm run dev${colors.reset}

${colors.cyan}${colors.bright}📚 RECURSOS ÚTILES:${colors.reset}

  - GitHub Actions: https://github.com/${REPO}/actions
  - Workflows: https://github.com/${REPO}/tree/main/.github/workflows
  - Documentación: QUICK_START.md

${colors.cyan}${colors.bright}💡 COMANDOS ÚTILES:${colors.reset}

  ${colors.cyan}npm run health:check${colors.reset}      - Verificar salud del sistema
  ${colors.cyan}npm run verify:ai${colors.reset}         - Verificar AI Agent
  ${colors.cyan}npm run import:excel${colors.reset}      - Importar datos desde Excel
  ${colors.cyan}gh workflow list${colors.reset}          - Ver workflows
  ${colors.cyan}gh run list${colors.reset}               - Ver ejecuciones recientes

${colors.green}✨ ¡Setup completado exitosamente!${colors.reset}
  `);
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

async function main() {
  const skipChecks = process.argv.includes('--skip-checks');
  
  showBanner();
  
  const results = {
    ghCli: false,
    ghAuth: false,
    repoAccess: false,
    envFile: false,
    dependencies: false,
  };
  
  try {
    // 1. Verificar GitHub CLI
    results.ghCli = checkGitHubCLI();
    if (!results.ghCli) {
      logger.error('GitHub CLI es requerido. Instálalo desde: https://cli.github.com');
      process.exit(1);
    }
    
    // 2. Verificar autenticación
    results.ghAuth = checkGitHubAuth();
    if (!results.ghAuth) {
      results.ghAuth = await loginToGitHub();
      if (!results.ghAuth) {
        logger.warning('Continuando sin autenticación (funcionalidad limitada)');
      }
    }
    
    // 3. Verificar acceso al repositorio
    if (results.ghAuth) {
      results.repoAccess = checkRepositoryAccess();
    }
    
    // 4. Listar workflows
    if (results.repoAccess) {
      listWorkflows();
    }
    
    // 5. Verificar/crear .env.local
    results.envFile = await createEnvFile();
    
    // 6. Instalar dependencias
    if (!skipChecks) {
      results.dependencies = await installDependencies();
    }
    
    // 7. Verificar secrets
    checkSecrets();
    
    // 8. Health check
    if (results.dependencies && !skipChecks) {
      await runHealthCheck();
    }
    
    // 9. Trigger workflow (opcional)
    if (results.repoAccess && !skipChecks) {
      await triggerFirstWorkflow();
    }
    
    // 10. Resumen
    showSummary(results);
    
    process.exit(0);
    
  } catch (error) {
    logger.error(`Error fatal: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { 
  checkGitHubCLI, 
  checkGitHubAuth, 
  checkRepositoryAccess, 
  listWorkflows 
};
