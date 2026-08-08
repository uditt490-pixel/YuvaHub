import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => {
  // Only load variables that are intentionally used by the frontend build
  // or by build-time Sentry tooling. Server-only secrets such as
  // GEMINI_API_KEY are deliberately excluded from Vite's environment.
  const env = loadEnv(mode, ".", ["VITE_", "SENTRY_"]);
  const shouldAnalyze = process.env.ANALYZE === "true" || mode === "analyze";

  return {
    plugins: [
      react(),
      tailwindcss(),
      viteSingleFile(),
      sentryVitePlugin({
        org: env.SENTRY_ORG || process.env.SENTRY_ORG,
        project: env.SENTRY_PROJECT || process.env.SENTRY_PROJECT,
        authToken: env.SENTRY_AUTH_TOKEN || process.env.SENTRY_AUTH_TOKEN,
      }),
      shouldAnalyze && visualizer({
        filename: "stats.html",
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: "treemap",
      }),
    ].filter(Boolean),
    define: {
      'process.env.VITE_EMAILJS_SERVICE_ID': JSON.stringify(env.VITE_EMAILJS_SERVICE_ID),
      'process.env.VITE_EMAILJS_TEMPLATE_ID': JSON.stringify(env.VITE_EMAILJS_TEMPLATE_ID),
      'process.env.VITE_EMAILJS_PUBLIC_KEY': JSON.stringify(env.VITE_EMAILJS_PUBLIC_KEY),
    },
    build: {
      sourcemap: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // File watching is disabled there to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== "true",
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
