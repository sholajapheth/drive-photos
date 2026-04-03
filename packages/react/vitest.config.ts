import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./__tests__/setup.ts'],
    environment: 'jsdom',
    include: ['__tests__/**/*.test.ts', '__tests__/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/index.ts', 'src/global.d.ts'],
      thresholds: {
        lines: 55,
        functions: 50,
        branches: 40,
        statements: 55,
      },
    },
  },
});
