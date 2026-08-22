import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const typedSourceFiles = [
  'apps/**/*.{ts,tsx,mts,cts}',
  'packages/**/*.{ts,tsx,mts,cts}',
  'tooling/**/*.{ts,tsx,mts,cts}',
  'tests/**/*.{ts,tsx,mts,cts}',
  '*.config.ts',
];

const browserSourceFiles = [
  'apps/web/**/*.{js,mjs,cjs,ts,tsx,mts,cts}',
  'apps/shell/**/*.{js,mjs,cjs,ts,tsx,mts,cts}',
  'packages/ui/**/*.{js,mjs,cjs,ts,tsx,mts,cts}',
];

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'apps/shell/src-tauri/target/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx,mts,cts}'],
    languageOptions: {
      globals: globals.nodeBuiltin,
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      curly: ['error', 'multi-line', 'consistent'],
      eqeqeq: ['error', 'always'],
    },
  },
  {
    files: browserSourceFiles,
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: typedSourceFiles,
    languageOptions: {
      parserOptions: {
        onUnsupportedTypeScriptVersion: 'error',
      },
    },
  },
  {
    files: [
      'apps/**/*.{js,mjs,cjs,ts,tsx,mts,cts}',
      'packages/**/*.{js,mjs,cjs,ts,tsx,mts,cts}',
    ],
    plugins: {
      boundaries,
    },
    settings: {
      'boundaries/elements': [
        { type: 'web', pattern: 'apps/web/**' },
        { type: 'server', pattern: 'apps/server/**' },
        { type: 'shell', pattern: 'apps/shell/**' },
        { type: 'ui', pattern: 'packages/ui/**' },
        { type: 'domain', pattern: 'packages/domain/**' },
        { type: 'api-client', pattern: 'packages/api-client/**' },
        { type: 'config', pattern: 'packages/config/**' },
      ],
      'boundaries/files': [
        { category: 'test', pattern: '**/*.test.{js,ts,tsx}' },
        { category: 'test', pattern: '**/*.spec.{js,ts,tsx}' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { type: 'web' } },
              allow: {
                to: {
                  element: {
                    types: { anyOf: ['web', 'ui', 'domain', 'api-client', 'config'] },
                  },
                },
              },
            },
            {
              from: { element: { type: 'shell' } },
              allow: {
                to: {
                  element: {
                    types: { anyOf: ['shell', 'ui', 'domain', 'api-client', 'config'] },
                  },
                },
              },
            },
            {
              from: { element: { type: 'server' } },
              allow: {
                to: { element: { types: { anyOf: ['server', 'domain', 'config'] } } },
              },
            },
            {
              from: { element: { type: 'ui' } },
              allow: {
                to: { element: { types: { anyOf: ['ui', 'domain', 'config'] } } },
              },
            },
            {
              from: { element: { type: 'api-client' } },
              allow: {
                to: { element: { types: { anyOf: ['api-client', 'domain', 'config'] } } },
              },
            },
            {
              from: { element: { type: 'domain' } },
              allow: { to: { element: { type: 'domain' } } },
            },
            {
              from: { element: { type: 'config' } },
              allow: { to: { element: { type: 'config' } } },
            },
            {
              disallow: { to: { file: { categories: 'test' } } },
            },
          ],
        },
      ],
    },
  },
);
