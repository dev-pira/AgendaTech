import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // coverage/ (relatório do vitest --coverage) não é ignorado pelo .gitignore
  // sozinho pro ESLint - sem isso, `npm run lint` varria o lcov-report
  // gerado (arquivos de terceiros minificados) e sujava a saída com warnings
  // que não são nossos. Ver issue #32.
  { ignores: ['dist', 'coverage'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // v7 do plugin também empacota as regras do React Compiler (purity,
      // immutability, set-state-in-effect, etc.) no preset "recommended" —
      // fora do escopo deste projeto (não usamos o Compiler). Mantemos só
      // as duas regras clássicas de hooks.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);
