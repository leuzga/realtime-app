/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:4000';

declare global {
  interface ImportMeta {
    readonly env: Record<string, string>;
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    proxy: {
      '/ws': { target: backendUrl, ws: true, changeOrigin: true }
    }
  },
  preview: { host: true, port: 3000 },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: { modules: { classNameStrategy: 'non-scoped' } },
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/**/*.test.{ts,tsx}', 'src/test/**']
    }
  }
});
