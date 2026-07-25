import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    fileParallelism: false, // Run tests sequentially to avoid DB collisions
    include: ['tests/**/*.ts', 'src/**/validationTest.ts'],
    exclude: ['tests/e2e/**/*.ts', 'node_modules/**'],
    testTimeout: 120000, // Increased timeout for long-running integration tests
  },
});
