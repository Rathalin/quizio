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

/**
 * @type {import('eslint').Linter.Config}
 */
export const config = [
  {
    ignores: ['**/temp.js', '**/generated/*'],
  },
  ...compat.extends('next', 'prettier'),
  {
    plugins: {
      'unused-imports': unusedImports,
      react,
    },

    rules: {
      'unused-imports/no-unused-imports': 'error',

      'no-unused-vars': [
        'error',
        {
          args: 'none',
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

      'react/jsx-key': 'error',
    },
  },
];
export default config;
