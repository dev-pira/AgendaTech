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
    // Default de 5s estoura em máquinas mais lentas/CI sob carga em testes
    // com várias interações de formulário em sequência (userEvent.type em
    // vários campos) - visto isolado passando mas falhando por timeout só
    // quando a suíte inteira roda em paralelo.
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // all:true inclui no relatório todo arquivo em src/, não só os que
      // algum teste importa - sem isso o "% de cobertura" reportada media
      // só os poucos arquivos já testados (ficava ~95%) e escondia que a
      // cobertura real do projeto inteiro era só ~16%. Ver issue #30: meta
      // do WBS é 70% - agora com os testes de página (comunidades, eventos,
      // calendário, membros) batemos ~87% real, então o threshold trava o
      // CI de verdade se a cobertura cair.
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/mocks/**',
        'src/components/ui/**',
        'src/test/**',
        // App.tsx e router.tsx são só composição/config (providers,
        // definição de rotas) - cobertos indiretamente pelos testes de
        // página; testar diretamente exigiria montar o app inteiro com
        // createBrowserRouter/histórico real pra um retorno baixo.
        'src/App.tsx',
        'src/routes/router.tsx',
      ],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
  },
}));
