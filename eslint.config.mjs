import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'lib/supabase/database.types.ts',
      'supabase/gelds/*.json',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Banned UI vocabulary lives in scripts/check-copy-registry.mjs, which can
      // see string content across the whole tree; ESLint only guards structure.
      'no-restricted-syntax': [
        'error',
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message:
            'Use lib/week.ts helpers instead of new Date() so week math stays timezone-correct.',
        },
      ],
    },
  },
  {
    files: ['lib/week.ts', 'scripts/**', 'tests/**', 'supabase/**'],
    rules: { 'no-restricted-syntax': 'off' },
  },
]

export default config
