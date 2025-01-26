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
    ignores: ['**/temp.js', '**/generated/*', 'env.d.ts', 'next-env.d.ts', 'next-auth.d.ts'],
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

      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@mui/material',
              message:
                "Please use named imports from @mui/material/* instead of importing from the root package (e.g. import Button from '@mui/material')",
            },
            {
              name: '@mui/icons-material',
              message:
                "Please use named imports from @mui/icons-material/* instead of importing from the root package (e.g. import Star from '@mui/icons-material/Star')",
            },
          ],
          patterns: ['@mui/material/*/*', '@mui/icons-material/*/*'], // Disallow deep imports (e.g., @mui/material/Button/Button)
        },
      ],

      'react/jsx-key': 'error',
    },
  },
];
export default config;
