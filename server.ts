import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import * as Sentry from "@sentry/node";
import { Server as SocketIOServer } from "socket.io";
import swaggerUi from "swagger-ui-express";

import { initializeDatabase, dbCommand, dbQuery, closeDatabaseConnections } from "./src/api/db.js";
import { setSocketIO } from "./src/api/socketInstance.js";
import { setupSocketEvents } from "./src/socket/index.js";
import { runDeadlineChecks, runWeeklyDigest } from "./src/services/deadlineScheduler.js";
import { analyticsBuffer } from "./src/api/analytics.js";
import { stopSearchSync } from "./src/services/searchSync.js";

// Import Main API Router
import apiRoutes from "./src/api/routes/index.js";

import { eventBus } from "./src/events/eventBus.js";
import { createNotificationConsumer } from "./src/consumers/notificationConsumer.js";
import { createOpportunityScrapedConsumer } from "./src/consumers/opportunityScrapedConsumer.js";
import swaggerSpec from "./src/config/swagger.js";

import { validateStartupEnv } from "./src/config/envValidation.js";

dotenv.config();

// Validate required environment variables during startup (Issue #588)
validateStartupEnv();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

const app = express();
const server = http.createServer(app);

// Trust proxy so express-rate-limit and logging key on the real client IP
// when running behind a reverse proxy / load balancer. Disable with
// TRUST_PROXY=false; otherwise accepts a hop count or an Express proxy pattern.
// (Issue #374)
const trustProxy = process.env.TRUST_PROXY ?? "1";
if (trustProxy !== "false") {
  const hops = Number(trustProxy);
  app.set("trust proxy", Number.isFinite(hops) && hops > 0 ? hops : trustProxy);
}

// CORS: only allow explicitly configured origins instead of opening the API to
// every origin. In production, requests from unlisted origins are rejected.
// Same-origin and non-browser (curl / server-to-server) requests remain allowed.
// (Issue #374)
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || process.env.APP_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  if (allowedOrigins.length > 0) return allowedOrigins.includes(origin);
  return process.env.NODE_ENV !== "production";
}

const corsOrigin: cors.CorsOptions["origin"] = (origin, callback) => {
  if (isOriginAllowed(origin)) {
    return callback(null, true);
  }
  return callback(new Error("Not allowed by CORS"));
};

app.use(cors({ origin: corsOrigin, credentials: true }));

// Socket.IO Configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
  },
});
setSocketIO(io);

// Swagger API Documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "YuvaHub API Docs",
}));

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// Setup API Routes
app.use("/api", apiRoutes);

// SEO Routes (root-level for crawler discovery)
app.get("/robots.txt", (req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || "https://yuvahub.xyz";
  const robotsTxt = [
    "User-agent: *",
    "Allow: /",
    "Allow: /opportunities",
    "Allow: /about",
    "Allow: /privacy",
    "Allow: /terms",
    "Allow: /cookies",
    "Allow: /guidelines",
    "Allow: /security",
    "Allow: /support",
    "Allow: /legal",
    "Allow: /opportunity/",
    "Disallow: /admin/",
    "Disallow: /dashboard/",
    "Disallow: /bookmarks/",
    "Disallow: /submit/",
    "Disallow: /settings/",
    "Disallow: /profile/",
    "Disallow: /mentorship/",
    "Disallow: /community/",
    "Disallow: /ai_assistant/",
    "Disallow: /api/",
    "",
    "Content-Signal: ai-train=no, search=yes, ai-input=no",
    "",
    `Sitemap: ${baseUrl}/sitemap.xml`,
    "",
  ].join("\n");
  res.header("Content-Type", "text/plain");
  res.send(robotsTxt);
});

// XML escaping helper for safe sitemap generation
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "<";
      case ">": return ">";
      case "&": return "&";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

app.get("/sitemap.xml", async (req: Request, res: Response) => {
  try {
    const baseUrl = process.env.APP_URL || "https://yuvahub.xyz";
    const staticPaths = [
      "",
      "/opportunities",
      "/about",
      "/privacy",
      "/terms",
      "/cookies",
      "/guidelines",
      "/security",
      "/support",
      "/legal",
    ];

    const escapedBaseUrl = escapeXml(baseUrl);
    let urls = staticPaths.map((p) => {
      return `  <url>
    <loc>${escapedBaseUrl}${p}</loc>
    <changefreq>daily</changefreq>
    <priority>${p === "" ? "1.0" : "0.8"}</priority>
  </url>`;
    });

    // Fetch opportunities if DB is ready
    if (dbQuery) {
      try {
        const items = await dbQuery
          .collection("opportunities")
          .find({})
          .project({ _id: 1, title: 1, created_at: 1 })
          .toArray();

        const oppUrls = items.map((item: Record<string, any>) => {
          const id = escapeXml(item._id ? item._id.toString() : item.id);
          const title = item.title || "opportunity";
          const cleanTitle = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          const lastmod = escapeXml(item.created_at
            ? new Date(item.created_at).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0]);
          return `  <url>
    <loc>${escapedBaseUrl}/opportunity/${id}/${cleanTitle}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
        });
        urls = urls.concat(oppUrls);
      } catch (dbErr) {
        console.error("[Sitemap] Error fetching opportunities:", dbErr);
      }
    }

    const sitemapXml = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
      ...urls,
      `</urlset>`,
    ].join("\n");

    res.header("Content-Type", "application/xml");
    res.send(sitemapXml);
  } catch (err) {
    console.error("[Sitemap] Generation error:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Serve the static frontend files generated by Vite in production
const frontendPath = path.join(process.cwd(), "dist");
app.use(express.static(frontendPath));

// SPA Fallback: Catch non-API GET requests cleanly without path-to-regexp issues
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method === "GET" && !req.path.startsWith("/api/")) {
    return res.sendFile(path.join(frontendPath, "index.html"));
  }
  next();
});

// Fallback Route for API endpoints
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
});

const PORT = process.env.PORT || 5000;

// ── Graceful Shutdown ─────────────────────────────────────────────────
let isShuttingDown = false;
const shutdownTimers: ReturnType<typeof setInterval>[] = [];

/** Safety net: force-exit if graceful shutdown takes too long. */
function setShutdownTimeout(ms = 10_000): void {
  setTimeout(() => {
    console.error("[Core] Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, ms).unref();
}

async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`[Core] Received ${signal}. Starting graceful shutdown...`);
  setShutdownTimeout();

  // 1. Stop accepting new HTTP connections
  await new Promise<void>((resolve) => {
    server.close(() => {
      console.log("[Core] HTTP server closed.");
      resolve();
    });
    // Socket.IO holds the server open; close its connections too.
    try {
      io.close(() => {
        console.log("[Core] Socket.IO closed.");
        resolve();
      });
    } catch (err) {
      resolve();
    }
  });

  // 2. Clear background scheduler intervals
  shutdownTimers.forEach((t) => clearInterval(t));

  // 3. Drain analytics buffer (safe — drainAndStop sets isShuttingDown flag,
  //    rejects new pushes, flushes remaining, then stops the interval)
  try {
    await analyticsBuffer.drainAndStop();
    console.log("[Core] Analytics buffer drained successfully.");
  } catch (err) {
    console.error("[Core] Error draining analytics buffer:", err);
  }

  // 4. Close search change stream, MongoDB clients, and Redis
  try {
    await stopSearchSync();
  } catch (err) {
    console.error("[Core] Error stopping search sync:", err);
  }
  try {
    await closeDatabaseConnections();
  } catch (err) {
    console.error("[Core] Error closing database connections:", err);
  }
  try {
    const { redisClient } = await import("./src/api/redis.js");
    if (redisClient?.status === "ready" || redisClient?.status === "connecting") {
      redisClient.disconnect();
      console.log("[Core] Redis disconnected.");
    }
  } catch (err) {
    console.error("[Core] Error closing Redis:", err);
  }

  // 5. Exit
  process.exit(0);
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("uncaughtException", (err) => {
  console.error("[Core] Uncaught exception:", err);
  gracefulShutdown("uncaughtException");
});
process.on("unhandledRejection", (reason) => {
  console.error("[Core] Unhandled rejection:", reason);
  gracefulShutdown("unhandledRejection");
});

async function bootstrap() {
  try {
    // 1. Initialize databases and caches. When REQUIRE_DB=true, a MongoDB
    //    connection failure aborts startup instead of silently running in
    //    Mock mode. (Issue #374)
    await initializeDatabase(process.env.REQUIRE_DB === "true");

    // 2. Start the HTTP server
    server.listen(PORT, () => {
      console.log(`[Core] Express Server is listening on port ${PORT}`);
    });
    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        console.error(`[Core] Port ${PORT} is already in use (EADDRINUSE). Exiting.`);
      } else {
        console.error("[Core] Failed to start HTTP server:", err);
      }
      process.exit(1);
    });

    // 3. Setup Socket.IO Event Handlers
    setupSocketEvents();

    // 4. Wire Event Bus Consumers (RabbitMQ) asynchronously
    eventBus
      .connect()
      .then(async () => {
        const notifHandler = await createNotificationConsumer(dbCommand);
        const scrapedHandler = await createOpportunityScrapedConsumer(dbCommand);
        await eventBus.subscribe("notifications", "opportunity.scraped", notifHandler);
        await eventBus.subscribe("opportunity-scraped", "opportunity.scraped", scrapedHandler);
        console.log("[Core] Event Bus consumers wired successfully");
      })
      .catch((err: Error) => {
        console.warn("[Core] Event Bus unavailable:", err.message);
      });

    // 5. Start Background Services
    if (process.env.NODE_ENV !== "test") {
      shutdownTimers.push(setInterval(() => runDeadlineChecks(dbCommand), 24 * 60 * 60 * 1000));
      shutdownTimers.push(setInterval(() => runWeeklyDigest(dbCommand), 7 * 24 * 60 * 60 * 1000));
      
      // Node.js Central Ingestion
      if (process.env.START_NODE_SCRAPER === "true") {
        console.log("[Scraper] Central Ingestion daemon enabled");
        import("child_process").then(({ spawn }) => {
          spawn("npx", ["tsx", "scrape-cli.ts"], {
            cwd: process.cwd(),
            detached: true,
            stdio: "ignore"
          }).unref();
        });
      }
    }
  } catch (error) {
    console.error("[Core] Failed to start server:", error);
    process.exit(1);
  }
}

// Only auto-start the server when not running in test mode
if (process.env.NODE_ENV !== "test") {
  bootstrap();
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("uncaughtException", (err) => {
  console.error("[Core] Uncaught exception:", err);
  gracefulShutdown("uncaughtException");
});
process.on("unhandledRejection", (reason) => {
  console.error("[Core] Unhandled rejection:", reason);
  gracefulShutdown("unhandledRejection");
});

export { app, server, bootstrap };