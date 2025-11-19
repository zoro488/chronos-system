import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Babel configuration for React
      babel: {
        plugins: [
          // Add any babel plugins if needed
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './components'),
      '@pages': resolve(__dirname, './pages'),
      '@services': resolve(__dirname, './services'),
      '@hooks': resolve(__dirname, './hooks'),
      '@utils': resolve(__dirname, './utils'),
      '@types': resolve(__dirname, './types'),
      '@stores': resolve(__dirname, './stores'),
      '@lib': resolve(__dirname, './lib'),
      '@forms': resolve(__dirname, './forms'),
      '@schemas': resolve(__dirname, './schemas'),
      '@config': resolve(__dirname, './config'),
      '@constants': resolve(__dirname, './constants'),
      '@brand': resolve(__dirname, './brand'),
    },
  },
  server: {
    port: 5173,
    open: true,
    cors: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['framer-motion', 'react-hot-toast'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      '@tanstack/react-query',
      'zustand',
    ],
  },
});
