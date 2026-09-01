import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    fileParallelism: false, // Run tests sequentially to avoid DB collisions
    include: ['tests/integration/suites/**/*.test.ts'],
    setupFiles: ['tests/integration/setup.ts'],
    testTimeout: 120000, // Increased timeout for integration tests
    hookTimeout: 120000,
  },
});
