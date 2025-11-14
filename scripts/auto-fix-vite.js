const fs = require('fs');
const path = require('path');

class ViteAutoFix {
  log(message, type = 'info') {
    const icons = { info: '💡', success: '✅', error: '❌', fix: '🔧' };
    console.log(`${icons[type]} ${message}`);
  }

  fixViteConfig() {
    const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
    
    if (!fs.existsSync(viteConfigPath)) {
      this.log('vite.config.ts no encontrado, creando...', 'fix');
      
      // Check if project has src directory
      const hasSrcDir = fs.existsSync(path.join(process.cwd(), 'src'));
      const baseDir = hasSrcDir ? './src' : '.';
      
      const defaultConfig = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '${baseDir}'),
      '@components': path.resolve(__dirname, '${baseDir}/components'),
      '@lib': path.resolve(__dirname, '${baseDir}/lib'),
      '@apps': path.resolve(__dirname, '${baseDir}/apps'),
    }
  },
  server: {
    port: 3001,
    host: true,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          'framer': ['framer-motion']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase/app', 'firebase/firestore']
  }
});
      `;
      
      fs.writeFileSync(viteConfigPath, defaultConfig);
      this.log('vite.config.ts creado', 'success');
      return;
    }

    this.log('Verificando vite.config.ts...', 'info');
    
    let content = fs.readFileSync(viteConfigPath, 'utf-8');
    let changed = false;

    // Verificar que tenga alias
    if (!content.includes('resolve:') || !content.includes('alias:')) {
      const hasSrcDir = fs.existsSync(path.join(process.cwd(), 'src'));
      const baseDir = hasSrcDir ? './src' : '.';
      
      const aliasConfig = `
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '${baseDir}'),
      '@components': path.resolve(__dirname, '${baseDir}/components'),
      '@lib': path.resolve(__dirname, '${baseDir}/lib'),
    }
  },`;
      
      content = content.replace('plugins: [react()],', `plugins: [react()],${aliasConfig}`);
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(viteConfigPath, content);
      this.log('vite.config.ts actualizado', 'success');
    } else {
      this.log('vite.config.ts está correcto', 'success');
    }
  }

  run() {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║  🔧 VITE CONFIG AUTO-FIX                           ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    this.fixViteConfig();

    console.log('\n' + '═'.repeat(52));
    this.log('Vite config verificado y corregido', 'success');
    console.log('═'.repeat(52) + '\n');
  }
}

const fixer = new ViteAutoFix();
fixer.run();
