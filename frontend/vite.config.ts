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
      // all:true inclui no relatório todo arquivo em src/, não só os que
      // algum teste importa - sem isso o "% de cobertura" reportada media
      // só os poucos arquivos já testados (ficava ~95%) e escondia que a
      // cobertura real do projeto inteiro é ~16%. Ver issue #30: a meta do
      // WBS é 70%, ainda longe daqui - por isso não há "thresholds"
      // travando o CI ainda (quebraria todo PR). Faltam testes de
      // componentes de página (comunidades, eventos, calendário,
      // membros) pra fechar essa distância.
      all: true,
      include: ['src/**/*.{ts,tsx}'],
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
