import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
  plugins: [react()],
  test: { globals: true, environment: 'jsdom', include: ['**/__tests__/**/*.test.{ts,tsx,js,jsx}'] },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
