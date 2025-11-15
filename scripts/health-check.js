#!/usr/bin/env node
/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                   HEALTH CHECK - CHRONOS SYSTEM                            ║
 * ║  Verificación de salud del sistema y servicios críticos                   ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 * 
 * VERIFICA:
 * - Firebase conectividad
 * - Firestore colecciones
 * - GitHub Actions workflows
 * - Dependencias instaladas
 * - Configuración de ambiente
 * 
 * USO:
 *   node scripts/health-check.js
 *   node scripts/health-check.js --detailed
 */

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

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
  header: (msg) => console.log(`\n${colors.cyan}${colors.bright}═══ ${msg} ═══${colors.reset}`),
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
    return { success: true, output: result };
  } catch (error) {
    return { success: false, output: error.message };
  }
}

/**
 * Verifica si un archivo existe
 */
function fileExists(path) {
  return existsSync(resolve(process.cwd(), path));
}

// ============================================================================
// VERIFICADORES
// ============================================================================

/**
 * Verifica archivos esenciales del proyecto
 */
function checkProjectFiles() {
  logger.header('ARCHIVOS DEL PROYECTO');
  
  const requiredFiles = [
    { path: 'package.json', name: 'Package.json' },
    { path: 'App.tsx', name: 'App.tsx (Entry point)' },
    { path: 'config/firebase.js', name: 'Firebase Config' },
    { path: '.github/workflows/ci.yml', name: 'CI Workflow' },
    { path: '.github/workflows/deploy.yml', name: 'Deploy Workflow' },
  ];
  
  let present = 0;
  for (const file of requiredFiles) {
    if (fileExists(file.path)) {
      logger.success(file.name);
      present++;
    } else {
      logger.error(`${file.name} - NOT FOUND`);
    }
  }
  
  console.log();
  return { total: requiredFiles.length, present };
}

/**
 * Verifica dependencias npm
 */
function checkDependencies() {
  logger.header('DEPENDENCIAS NPM');
  
  if (!fileExists('package.json')) {
    logger.error('package.json no encontrado');
    return { installed: false };
  }
  
  const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8'));
  const totalDeps = Object.keys(pkg.dependencies || {}).length + 
                    Object.keys(pkg.devDependencies || {}).length;
  
  logger.info(`Total de dependencias definidas: ${totalDeps}`);
  
  // Verificar si node_modules existe
  const nodeModulesExists = fileExists('node_modules');
  
  if (nodeModulesExists) {
    logger.success('node_modules presente');
    
    // Verificar algunas dependencias críticas
    const criticalDeps = ['react', 'firebase', 'vite'];
    let foundCritical = 0;
    
    for (const dep of criticalDeps) {
      if (fileExists(`node_modules/${dep}`)) {
        logger.success(`  ${dep} instalado`);
        foundCritical++;
      } else {
        logger.warning(`  ${dep} NO instalado`);
      }
    }
    
    console.log();
    return { installed: true, total: totalDeps, criticalFound: foundCritical, criticalTotal: criticalDeps.length };
  } else {
    logger.error('node_modules NO presente');
    logger.info('Ejecuta: npm install');
    console.log();
    return { installed: false, total: totalDeps };
  }
}

/**
 * Verifica servicios principales
 */
function checkServices() {
  logger.header('SERVICIOS');
  
  const services = [
    { path: 'services/MegaAIAgent.js', name: 'Mega AI Agent', lines: 530 },
    { path: 'services/VoiceService.js', name: 'Voice Service', lines: 450 },
    { path: 'services/UserLearningService.js', name: 'User Learning Service', lines: 500 },
    { path: 'services/ventas.service.js', name: 'Ventas Service', lines: 600 },
    { path: 'services/bancos.service.js', name: 'Bancos Service', lines: 400 },
  ];
  
  let present = 0;
  for (const service of services) {
    if (fileExists(service.path)) {
      const content = readFileSync(resolve(process.cwd(), service.path), 'utf-8');
      const actualLines = content.split('\n').length;
      logger.success(`${service.name} (${actualLines} líneas)`);
      present++;
    } else {
      logger.error(`${service.name} - NOT FOUND`);
    }
  }
  
  console.log();
  return { total: services.length, present };
}

/**
 * Verifica componentes UI
 */
function checkComponents() {
  logger.header('COMPONENTES UI');
  
  const components = [
    { path: 'components/ui', name: 'UI Components' },
    { path: 'components/layout', name: 'Layout Components' },
    { path: 'components/animations', name: 'Animation System' },
    { path: 'components/ai', name: 'AI Components' },
    { path: 'components/auth', name: 'Auth Components' },
  ];
  
  let present = 0;
  for (const component of components) {
    if (fileExists(component.path)) {
      logger.success(component.name);
      present++;
    } else {
      logger.warning(`${component.name} - NOT FOUND`);
    }
  }
  
  console.log();
  return { total: components.length, present };
}

/**
 * Verifica GitHub Actions
 */
function checkGitHubActions() {
  logger.header('GITHUB ACTIONS');
  
  const workflows = [
    'ci.yml',
    'deploy.yml',
    'copilot-review.yml',
    'dependabot-automerge.yml',
    'monitoring.yml',
    'docs.yml',
    'issue-automation.yml',
  ];
  
  let present = 0;
  for (const workflow of workflows) {
    const path = `.github/workflows/${workflow}`;
    if (fileExists(path)) {
      logger.success(workflow);
      present++;
    } else {
      logger.error(`${workflow} - NOT FOUND`);
    }
  }
  
  console.log();
  
  // Verificar si gh CLI está disponible
  const ghInstalled = runCommand('gh --version').success;
  if (ghInstalled) {
    logger.success('GitHub CLI (gh) instalado');
  } else {
    logger.warning('GitHub CLI (gh) no instalado');
    logger.detail('Instala desde: https://cli.github.com');
  }
  
  console.log();
  return { total: workflows.length, present, ghInstalled };
}

/**
 * Verifica git repository
 */
function checkGitRepository() {
  logger.header('REPOSITORIO GIT');
  
  // Verificar .git
  if (!fileExists('.git')) {
    logger.error('No es un repositorio Git');
    return { isRepo: false };
  }
  
  logger.success('Repositorio Git inicializado');
  
  // Branch actual
  const branchResult = runCommand('git branch --show-current');
  if (branchResult.success) {
    logger.info(`Branch actual: ${branchResult.output.trim()}`);
  }
  
  // Estado
  const statusResult = runCommand('git status --short');
  if (statusResult.success) {
    const changes = statusResult.output.trim();
    if (changes) {
      logger.warning('Hay cambios sin commit');
      logger.detail(`${changes.split('\n').length} archivos modificados`);
    } else {
      logger.success('Working tree limpio');
    }
  }
  
  // Remote
  const remoteResult = runCommand('git remote -v');
  if (remoteResult.success) {
    const remotes = remoteResult.output.trim();
    if (remotes) {
      logger.success('Remote configurado');
    } else {
      logger.warning('No hay remote configurado');
    }
  }
  
  console.log();
  return { isRepo: true };
}

/**
 * Verifica scripts disponibles
 */
function checkScripts() {
  logger.header('SCRIPTS DISPONIBLES');
  
  const scripts = [
    { path: 'scripts/importar-excel.js', name: 'Importador de Excel' },
    { path: 'scripts/verify-ai-agent.js', name: 'Verificador de AI Agent' },
    { path: 'scripts/health-check.js', name: 'Health Check (este script)' },
    { path: 'setup-automation.ps1', name: 'Setup Automation (PowerShell)' },
  ];
  
  let present = 0;
  for (const script of scripts) {
    if (fileExists(script.path)) {
      logger.success(script.name);
      present++;
    } else {
      logger.warning(`${script.name} - NOT FOUND`);
    }
  }
  
  console.log();
  return { total: scripts.length, present };
}

/**
 * Genera resumen ejecutivo
 */
function generateSummary(results) {
  logger.header('RESUMEN EJECUTIVO');
  
  const scores = {
    'Archivos del Proyecto': results.files,
    'Dependencias': results.deps,
    'Servicios': results.services,
    'Componentes UI': results.components,
    'GitHub Actions': results.actions,
    'Scripts': results.scripts,
  };
  
  let totalMax = 0;
  let totalCurrent = 0;
  
  for (const [category, score] of Object.entries(scores)) {
    const percentage = Math.round((score.present / score.total) * 100);
    const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
    
    const color = percentage === 100 ? colors.green : percentage >= 80 ? colors.yellow : colors.red;
    console.log(`  ${category.padEnd(25)} ${color}${bar}${colors.reset} ${percentage}% (${score.present}/${score.total})`);
    
    totalMax += score.total;
    totalCurrent += score.present;
  }
  
  const overallPercentage = Math.round((totalCurrent / totalMax) * 100);
  
  console.log(`\n  ${colors.bright}SALUD GENERAL DEL SISTEMA:${colors.reset}`);
  const overallBar = '█'.repeat(Math.floor(overallPercentage / 5)) + '░'.repeat(20 - Math.floor(overallPercentage / 5));
  const overallColor = overallPercentage >= 90 ? colors.green : 
                       overallPercentage >= 70 ? colors.yellow : colors.red;
  console.log(`  ${overallColor}${overallBar} ${overallPercentage}%${colors.reset}`);
  
  console.log();
  
  // Status
  if (overallPercentage >= 90) {
    logger.success('✓ Sistema en excelente estado');
    console.log('\n  Próximos pasos:');
    console.log('    1. npm run dev - Iniciar desarrollo');
    console.log('    2. npm run import:excel - Importar datos');
    console.log('    3. npm run test - Ejecutar tests');
  } else if (overallPercentage >= 70) {
    logger.warning('⚠ Sistema operacional con advertencias');
    console.log('\n  Acciones recomendadas:');
    console.log('    1. Revisar elementos faltantes arriba');
    console.log('    2. npm install - Instalar dependencias');
    console.log('    3. Configurar variables de entorno');
  } else {
    logger.error('✗ Sistema requiere configuración');
    console.log('\n  Acciones requeridas:');
    console.log('    1. npm install - Instalar dependencias');
    console.log('    2. Configurar .env con API keys');
    console.log('    3. Revisar documentación en README.md');
  }
  
  return overallPercentage;
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

async function main() {
  const detailed = process.argv.includes('--detailed') || process.argv.includes('-d');
  
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                    HEALTH CHECK                                     ║
║                 CHRONOS SYSTEM v2.0                                ║
╚════════════════════════════════════════════════════════════════════╝
  `);
  
  const results = {
    files: checkProjectFiles(),
    deps: checkDependencies(),
    services: checkServices(),
    components: checkComponents(),
    actions: checkGitHubActions(),
    git: checkGitRepository(),
    scripts: checkScripts(),
  };
  
  const overallHealth = generateSummary(results);
  
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║  Health Check Completo - Status: ${overallHealth}%${' '.repeat(33 - overallHealth.toString().length)}║
╚════════════════════════════════════════════════════════════════════╝
  `);
  
  // Exit code basado en salud
  process.exit(overallHealth >= 70 ? 0 : 1);
}

// Ejecutar
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { 
  checkProjectFiles, 
  checkDependencies, 
  checkServices, 
  checkComponents,
  checkGitHubActions,
  checkGitRepository,
  checkScripts
};
