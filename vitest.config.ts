import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    fileParallelism: false, // Run tests sequentially to avoid DB collisions
    include: ['tests/**/*.ts', 'src/**/validationTest.ts'],
    testTimeout: 30000, // Some DB operations might take a while
  },
});
