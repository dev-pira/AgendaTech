/// <reference types="vitest/config" />
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // Em produção o build é publicado numa subpasta (/app/) da mesma webroot
  // do backend Laravel, não na raiz do domínio — ver issue #85. O dev
  // server continua na raiz (/) porque roda isolado na porta do Vite.
  base: command === 'build' ? '/app/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3333',
        changeOrigin: true,
      },
    },
  },
  // Ver issue #30 (Pipeline de STG/Testes) - antes não havia framework de
  // teste nenhum no frontend.
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // Meta do WBS é 70% - ainda não estamos lá (cobertura concentrada em
      // lib/services por enquanto, não em componentes de página). Sem
      // "thresholds" travando o CI por ora - ver #30, o objetivo aqui é
      // medir e reportar, o gate de branch protection fica pra depois.
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/mocks/**',
        'src/components/ui/**',
        'src/test/**',
      ],
    },
  },
}));
