import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";

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
      // PWA + Workbox — client-build only; the esbuild server bundle is unaffected
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        includeAssets: ["favicon.svg", "robots.txt"],
        workbox: {
          // Navigate to index.html for any unmatched route (SPA offline support)
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api\//, /^\/public\//],
          runtimeCaching: [
            {
              // API calls: serve stale while revalidating in background
              urlPattern: /^\/api\/v1\/.*/i,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "yuvahub-api-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24, // 24 hours
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              // Static assets: serve from cache, fall back to network
              urlPattern: /\.(?:js|css|woff2?|ttf|eot|png|jpg|jpeg|svg|gif|webp|ico)$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "yuvahub-static-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        manifest: {
          name: "YuvaHub - India's AI-Powered Student Opportunity Platform",
          short_name: "YuvaHub",
          description:
            "Discover hackathons, scholarships, and mentorships tailored for Indian students.",
          theme_color: "#603620",
          background_color: "#fcf9f2",
          display: "standalone",
          orientation: "portrait",
          scope: "/",
          start_url: "/",
          categories: ["education", "productivity"],
          icons: [
            {
              src: "/favicon.svg",
              type: "image/svg+xml",
              sizes: "any",
              purpose: "any",
            },
            {
              src: "/favicon.svg",
              type: "image/svg+xml",
              sizes: "512x512",
              purpose: "maskable",
            },
          ],
        },
      }),
    ].filter(Boolean),
    define: {
      'process.env.VITE_EMAILJS_SERVICE_ID': JSON.stringify(env.VITE_EMAILJS_SERVICE_ID),
      'process.env.VITE_EMAILJS_TEMPLATE_ID': JSON.stringify(env.VITE_EMAILJS_TEMPLATE_ID),
      'process.env.VITE_EMAILJS_PUBLIC_KEY': JSON.stringify(env.VITE_EMAILJS_PUBLIC_KEY),
    },
    build: {
      sourcemap: mode !== "production",
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

