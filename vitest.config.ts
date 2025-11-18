import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      '**/__tests__/**/*.test.{ts,tsx}',
      '**/tests/**/*.test.{ts,tsx}'
    ],
    testTimeout: 30000,
    hookTimeout: 15000,
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
});
