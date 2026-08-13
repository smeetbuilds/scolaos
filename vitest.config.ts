import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'apps/**/*.{test,spec}.{ts,tsx}',
      'packages/**/*.{test,spec}.{ts,tsx}',
      'tooling/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: ['tests/e2e/**', '**/node_modules/**', '**/dist/**', '**/build/**'],
    passWithNoTests: false,
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['apps/*/src/**/*.{ts,tsx}', 'packages/*/src/**/*.{ts,tsx}'],
      exclude: ['**/*.d.ts', '**/*.{test,spec}.{ts,tsx}'],
    },
  },
});
