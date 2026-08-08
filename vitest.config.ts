import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Keep Sentry plugin last in the plugins array
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      // Disable uploading sourcemaps during local development/tests
      disable: process.env.NODE_ENV !== 'production',
    }),
  ],
  build: {
    // Required so Sentry can map stack traces back to original TypeScript source code
    sourcemap: true,
  },
  test: {
    environment: 'node',
    fileParallelism: false, // Run tests sequentially to avoid DB collisions
    include: ['tests/**/*.ts', 'src/**/validationTest.ts'],
    exclude: ['tests/e2e/**/*.ts', 'node_modules/**'],
    testTimeout: 120000, // Increased timeout for long-running integration tests
  },
});