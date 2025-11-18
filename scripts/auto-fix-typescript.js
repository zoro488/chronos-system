const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TypeScriptAutoFix {
  constructor() {
    this.fixed = 0;
    this.errors = [];
  }

  log(message, type = 'info') {
    const icons = { info: '💡', success: '✅', error: '❌', fix: '🔧' };
    console.log(`${icons[type]} ${message}`);
  }

  // Fix 1: Agregar tipos faltantes
  fixMissingTypes(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    // Agregar tipos a useState sin tipo
    const useStateRegex = /const\s+\[(\w+),\s*set\w+\]\s*=\s*useState\(\)/g;
    if (useStateRegex.test(content)) {
      content = content.replace(useStateRegex, (match, varName) => {
        return `const [${varName}, set${varName.charAt(0).toUpperCase() + varName.slice(1)}] = useState<any>()`;
      });
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf-8');
      this.fixed++;
      return true;
    }
    return false;
  }

  // Fix 2: Corregir imports
  fixImports(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    // Cambiar require() a import
    const requireRegex = /const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/g;
    if (requireRegex.test(content)) {
      content = content.replace(requireRegex, "import $1 from '$2'");
      changed = true;
    }

    // Agregar extensiones .ts/.tsx faltantes
    const importRegex = /from\s+['"]\.\.?\/[^'"]+(?<!\.tsx?)(?<!\.jsx?)['"];/g;
    content = content.replace(importRegex, (match) => {
      if (!match.includes('.ts') && !match.includes('.js') && !match.includes('.tsx')) {
        const extension = filePath.endsWith('.tsx') ? '.tsx' : '.ts';
        // Insert extension before the closing quote
        if (match.includes("'")) {
          return match.replace(/';$/, `${extension}';`);
        } else {
          return match.replace(/";$/, `${extension}";`);
        }
      }
      return match;
    });

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf-8');
      this.fixed++;
      return true;
    }
    return false;
  }

  // Fix 3: Agregar definiciones de tipos faltantes
  addMissingTypeDefinitions() {
    // Check if types directory exists at root or in src
    let typesDir = path.join(process.cwd(), 'types');
    if (!fs.existsSync(typesDir)) {
      typesDir = path.join(process.cwd(), 'src', 'types');
      if (!fs.existsSync(typesDir)) {
        fs.mkdirSync(typesDir, { recursive: true });
      }
    }

    // Crear global.d.ts si no existe
    const globalTypes = path.join(typesDir, 'global.d.ts');
    if (!fs.existsSync(globalTypes)) {
      fs.writeFileSync(globalTypes, `
declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}

declare module '*.json' {
  const content: any;
  export default content;
}
      `);
      this.log('Creado global.d.ts', 'success');
      this.fixed++;
    }
  }

  // Fix 4: Actualizar tsconfig.json
  fixTsConfig() {
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    
    if (!fs.existsSync(tsconfigPath)) {
      this.log('tsconfig.json no encontrado, creando...', 'fix');
      
      const hasSrcDir = fs.existsSync(path.join(process.cwd(), 'src'));
      const baseDir = hasSrcDir ? './src/*' : './*';
      
      const defaultTsConfig = {
        compilerOptions: {
          target: "ES2020",
          useDefineForClassFields: true,
          lib: ["ES2020", "DOM", "DOM.Iterable"],
          module: "ESNext",
          skipLibCheck: true,
          moduleResolution: "bundler",
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: "react-jsx",
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
          types: ["vite/client", "node"],
          paths: {
            "@/*": [baseDir],
            "@components/*": [hasSrcDir ? "./src/components/*" : "./components/*"],
            "@lib/*": [hasSrcDir ? "./src/lib/*" : "./lib/*"]
          }
        },
        include: [hasSrcDir ? "src" : "."],
        exclude: ["node_modules", "dist", "build"]
      };
      
      fs.writeFileSync(tsconfigPath, JSON.stringify(defaultTsConfig, null, 2));
      this.log('tsconfig.json creado', 'success');
      this.fixed++;
      return;
    }
    
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
    
    let changed = false;

    if (!tsconfig.compilerOptions) {
      tsconfig.compilerOptions = {};
    }

    // Agregar paths faltantes
    if (!tsconfig.compilerOptions.paths) {
      const hasSrcDir = fs.existsSync(path.join(process.cwd(), 'src'));
      const baseDir = hasSrcDir ? './src/*' : './*';
      
      tsconfig.compilerOptions.paths = {
        "@/*": [baseDir],
        "@components/*": [hasSrcDir ? "./src/components/*" : "./components/*"],
        "@lib/*": [hasSrcDir ? "./src/lib/*" : "./lib/*"]
      };
      changed = true;
    }

    // Agregar tipos
    if (!tsconfig.compilerOptions.types) {
      tsconfig.compilerOptions.types = ["vite/client", "node"];
      changed = true;
    }

    // Configurar resolución de módulos
    if (!tsconfig.compilerOptions.moduleResolution) {
      tsconfig.compilerOptions.moduleResolution = "bundler";
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
      this.log('tsconfig.json actualizado', 'success');
      this.fixed++;
    }
  }

  // Buscar archivos TypeScript
  findTsFiles(dir, files = []) {
    // Skip these directories
    const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', 'scripts'];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !skipDirs.includes(entry.name)) {
          this.findTsFiles(fullPath, files);
        } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we don't have permission to read
    }
    
    return files;
  }

  async run() {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║  🔧 TYPESCRIPT AUTO-FIX                            ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    // 1. Agregar definiciones de tipos
    this.addMissingTypeDefinitions();

    // 2. Actualizar tsconfig.json
    this.fixTsConfig();

    // 3. Buscar y corregir archivos
    const rootPath = process.cwd();
    const srcPath = path.join(rootPath, 'src');
    
    // Check if we have a src directory with TypeScript files, or use root
    let scanPath = rootPath;
    if (fs.existsSync(srcPath)) {
      const srcTsFiles = this.findTsFiles(srcPath);
      // If src has more than just our generated files, scan src, otherwise scan root
      if (srcTsFiles.length > 1) {
        scanPath = srcPath;
      }
    }
    
    const tsFiles = this.findTsFiles(scanPath);

    this.log(`Encontrados ${tsFiles.length} archivos TypeScript`, 'info');

    for (const file of tsFiles) {
      this.fixMissingTypes(file);
      this.fixImports(file);
    }

    console.log('\n' + '═'.repeat(52));
    this.log(`Archivos corregidos: ${this.fixed}`, 'success');
    console.log('═'.repeat(52) + '\n');
  }
}

const fixer = new TypeScriptAutoFix();
fixer.run();
