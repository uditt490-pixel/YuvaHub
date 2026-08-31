import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(async ({ mode }) => {
  // Only load variables that are intentionally used by the frontend build
  // or by build-time Sentry tooling. Server-only secrets such as
  // GEMINI_API_KEY are deliberately excluded from Vite's environment.
  const env = loadEnv(mode, ".", ["VITE_", "SENTRY_"]);
  const shouldAnalyze = process.env.ANALYZE === "true" || mode === "analyze";

  let pwaPlugin: any = null;
  try {
    // @ts-ignore
    const pwaMod = await import("vite-plugin-pwa");
    const VitePWA = pwaMod.VitePWA || pwaMod.default;
    if (typeof VitePWA === "function") {
      pwaPlugin = VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        includeAssets: ["favicon.svg", "robots.txt"],
        workbox: {
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api\//, /^\/public\//],
          runtimeCaching: [
            {
              urlPattern: /^\/api\/v1\/.*/i,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "yuvahub-api-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "yuvahub-image-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
          ],
        },
      });
    }
  } catch (e) {
    // vite-plugin-pwa not installed in build environment, skip gracefully
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
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
      pwaPlugin,
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
                return "vendor-react";
              }
              if (id.includes("recharts") || id.includes("d3-")) {
                return "vendor-charts";
              }
              if (id.includes("framer-motion") || id.includes("lucide-react")) {
                return "vendor-ui";
              }
            }
          },
        },
      },
    },
    server: {
      port: 3000,
      host: true,
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
      },
    },
  };
});
