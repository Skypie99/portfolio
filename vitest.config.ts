import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Vitest config — Cycle 2 test scaffold (Gary).
 *
 * - `jsdom` environment for component tests (DOM APIs available).
 * - React plugin for JSX transform.
 * - setupFiles wires @testing-library/jest-dom matchers globally.
 * - alias mirrors tsconfig "@/*" so imports work the same in tests.
 * - css: false avoids the cost of parsing Tailwind during unit runs.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    include: ['**/__tests__/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'out', 'dist'],
  },
});
