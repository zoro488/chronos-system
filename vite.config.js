import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@components': resolve(__dirname, './components'),
      '@services': resolve(__dirname, './services'),
      '@hooks': resolve(__dirname, './hooks'),
      '@utils': resolve(__dirname, './utils'),
      '@config': resolve(__dirname, './config'),
      '@pages': resolve(__dirname, './pages'),
      '@schemas': resolve(__dirname, './schemas'),
      '@stores': resolve(__dirname, './stores'),
      '@types': resolve(__dirname, './types'),
    },
  },
  
  server: {
    port: 5173,
    host: true,
    open: true,
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          'ui': ['framer-motion', 'recharts'],
        },
      },
    },
  },
  
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './__tests__/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        '*.config.js',
        'dist/',
      ],
    },
  },
});
