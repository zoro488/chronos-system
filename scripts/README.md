# 🔧 Auto-Fix Scripts

These scripts automatically detect and fix common TypeScript and Vite configuration errors in the project.

## Scripts

### 1. auto-fix-typescript.js

Automatically fixes TypeScript-related issues:

- ✅ Creates `types/global.d.ts` with module declarations for assets (SVG, PNG, JPG, JSON)
- ✅ Creates or updates `tsconfig.json` with proper configuration
- ✅ Detects project structure (with/without src directory)
- ✅ Adds path aliases (@, @components, @lib)
- ✅ Fixes useState hooks without type annotations
- ✅ Converts require() imports to ES6 import statements
- ✅ Adds missing file extensions to imports

**Usage:**
```bash
node scripts/auto-fix-typescript.js
```

**What it does:**
1. Scans the project for TypeScript files (`.ts`, `.tsx`)
2. Creates type definitions if missing
3. Creates or updates tsconfig.json with recommended settings
4. Fixes common TypeScript issues in source files

### 2. auto-fix-vite.js

Automatically fixes Vite configuration:

- ✅ Creates `vite.config.ts` if missing
- ✅ Adds path aliases matching the project structure
- ✅ Configures server settings (port 3001, hot reload)
- ✅ Sets up build optimizations
- ✅ Configures code splitting for better performance

**Usage:**
```bash
node scripts/auto-fix-vite.js
```

**What it does:**
1. Checks if vite.config.ts exists
2. Creates it with optimized settings if missing
3. Adds path aliases based on actual project structure
4. Configures build optimizations (code splitting, sourcemaps)

## GitHub Actions Workflow

The workflow `.github/workflows/auto-fix-errors.yml` runs automatically:

- **Triggers:**
  - Push to `main` or `develop` branches
  - Pull requests
  - Manual workflow dispatch

- **Steps:**
  1. Checkout code
  2. Setup Node.js 18
  3. Install dependencies (if package.json exists)
  4. Run TypeScript auto-fix
  5. Run Vite auto-fix
  6. Run TypeScript check
  7. Create PR with fixes (if any changes were made)

## Configuration Files Created

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "types": ["vite/client", "node"],
    "paths": {
      "@/*": ["./*"],
      "@components/*": ["./components/*"],
      "@lib/*": ["./lib/*"]
    }
  }
}
```

### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@components': path.resolve(__dirname, './components'),
      '@lib': path.resolve(__dirname, './lib'),
    }
  },
  server: {
    port: 3001,
    host: true,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

### types/global.d.ts
```typescript
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
```

## Features

### Smart Project Detection
- Automatically detects if project uses `src/` directory or root-level structure
- Adjusts paths in configuration files accordingly
- Skips unnecessary directories (node_modules, .git, dist, etc.)

### Safe Operations
- Only creates files that don't exist
- Only updates configurations if changes are needed
- Does not modify working code unnecessarily
- Reports what was fixed

### Extensible
- Easy to add new auto-fix rules
- Modular design for maintainability
- Clear logging with emoji indicators

## Output Examples

### TypeScript Auto-Fix
```
╔════════════════════════════════════════════════════╗
║  🔧 TYPESCRIPT AUTO-FIX                            ║
╚════════════════════════════════════════════════════╝

✅ Creado global.d.ts
🔧 tsconfig.json no encontrado, creando...
✅ tsconfig.json creado
💡 Encontrados 32 archivos TypeScript

════════════════════════════════════════════════════
✅ Archivos corregidos: 2
════════════════════════════════════════════════════
```

### Vite Auto-Fix
```
╔════════════════════════════════════════════════════╗
║  🔧 VITE CONFIG AUTO-FIX                           ║
╚════════════════════════════════════════════════════╝

🔧 vite.config.ts no encontrado, creando...
✅ vite.config.ts creado

════════════════════════════════════════════════════
✅ Vite config verificado y corregido
════════════════════════════════════════════════════
```

## Maintenance

To add new auto-fix rules:

1. Edit the respective script (`auto-fix-typescript.js` or `auto-fix-vite.js`)
2. Add a new fix method
3. Call it from the `run()` method
4. Test locally before committing

## Troubleshooting

### Script doesn't find TypeScript files
- Check that files have `.ts` or `.tsx` extensions
- Verify the script has read permissions
- Check that directories aren't in the skip list

### Configuration not applied
- Check for syntax errors in existing config files
- Verify write permissions
- Check logs for specific error messages

## Requirements

- Node.js 14+
- No additional npm packages required (uses only Node.js built-ins)
