import { defineConfig, globalIgnores } from 'eslint/config';
import unusedImports from 'eslint-plugin-unused-imports';
import react from 'eslint-plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(['**/temp.js', '**/generated/*', '**/env.d.ts', '**/next-sitemap.config.js']),
  {
    extends: compat.extends('next', 'prettier'),

    plugins: {
      'unused-imports': unusedImports,
      react,
    },

    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      'unused-imports/no-unused-imports': 'error',

      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],

      'no-console': [
        'error',
        {
          allow: ['info', 'warn', 'error'],
        },
      ],

      'react-hooks/exhaustive-deps': 'error',
      'react/jsx-key': 'error',
    },
  },
]);
