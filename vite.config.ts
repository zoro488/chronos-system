import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Babel configuration for better development experience
      babel: {
        plugins: [
          // Add any babel plugins if needed
        ],
      },
    }),
  ],
  
  // Server configuration
  server: {
    port: 3001,
    host: true, // Listen on all addresses
    strictPort: false, // Try next port if 3001 is busy
    
    // HMR (Hot Module Replacement) configuration
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3001,
      clientPort: 3001,
      // Timeout for HMR connection
      timeout: 30000,
      // Overlay for errors
      overlay: true,
    },
    
    // CORS configuration
    cors: true,
    
    // Watch configuration
    watch: {
      usePolling: false,
      interval: 100,
    },
    
    // Headers for security
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
    },
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'ui-vendor': ['react-hot-toast', 'framer-motion'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './components'),
      '@pages': path.resolve(__dirname, './pages'),
      '@hooks': path.resolve(__dirname, './hooks'),
      '@services': path.resolve(__dirname, './services'),
      '@stores': path.resolve(__dirname, './stores'),
      '@utils': path.resolve(__dirname, './utils'),
      '@types': path.resolve(__dirname, './types'),
      '@config': path.resolve(__dirname, './config'),
    },
  },
  
  // Optimizations
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
      'react-hot-toast',
    ],
    exclude: ['@testing-library/react', '@testing-library/jest-dom'],
  },
  
  // Preview server configuration (for production build preview)
  preview: {
    port: 4173,
    host: true,
    strictPort: false,
  },
  
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
  
  // Error handling
  clearScreen: false,
  logLevel: 'info',
});
