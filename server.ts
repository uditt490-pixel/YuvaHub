import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import * as Sentry from "@sentry/node";
import { Server as SocketIOServer } from "socket.io";
import swaggerUi from "swagger-ui-express";

import { initializeDatabase, dbCommand, dbQuery } from "./src/api/db.js";
import { setSocketIO } from "./src/api/socketInstance.js";
import { setupSocketEvents } from "./src/socket/index.js";
import { runDeadlineChecks, runWeeklyDigest } from "./src/services/deadlineScheduler.js";
import { analyticsBuffer } from "./src/api/analytics.js";

// Import Main API Router
import apiRoutes from "./src/api/routes/index.js";

import { eventBus } from "./src/events/eventBus.js";
import { createNotificationConsumer } from "./src/consumers/notificationConsumer.js";
import { createOpportunityScrapedConsumer } from "./src/consumers/opportunityScrapedConsumer.js";
import swaggerSpec from "./src/config/swagger.js";

dotenv.config();

// ---------------------------------------------------------------------------
// JWT Secret Validation — fail fast in production
// ---------------------------------------------------------------------------
const { JWT_SECRET, JWT_REFRESH_SECRET, NODE_ENV } = process.env;

if (NODE_ENV === 'production') {
  const MISSING: string[] = [];
  if (!JWT_SECRET) MISSING.push('JWT_SECRET');
  if (!JWT_REFRESH_SECRET) MISSING.push('JWT_REFRESH_SECRET');

  if (MISSING.length > 0) {
    console.error(`[FATAL] ${MISSING.join(' and ')} must be explicitly set in production mode.`);
    process.exit(1);
  }
} else {
  if (!JWT_SECRET) console.warn('[WARN] JWT_SECRET not set. Using auto-generated secrets for development only.');
  if (!JWT_REFRESH_SECRET) console.warn('[WARN] JWT_REFRESH_SECRET not set. Using auto-generated secrets for development only.');
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

const app = express();
const server = http.createServer(app);

// Socket.IO Configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
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

// â”€â”€ SEO Routes (root-level for crawler discovery) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// ---------------------------------------------------------------------------
// XML escaping helper for safe sitemap generation
// ---------------------------------------------------------------------------
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
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

async function startServer() {
  try {
    // 1. Start HTTP Server immediately so port 5000 opens instantly for Vite proxy
    server.listen(PORT, () => {
      console.log(`[Core] Express Server is listening on port ${PORT}`);
    });

    // 2. Setup Socket.IO Event Handlers
    setupSocketEvents();

    // 3. Initialize MongoDB Database Connections asynchronously
    initializeDatabase().catch((err: Error) => {
      console.warn("[Core] Database initialization fallback mode:", err.message);
    });

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
      setInterval(() => runDeadlineChecks(dbCommand), 24 * 60 * 60 * 1000);
      setInterval(() => runWeeklyDigest(dbCommand), 7 * 24 * 60 * 60 * 1000);
    }
  } catch (error) {
    console.error("[Core] Failed to start server:", error);
    process.exit(1);
  }
}

// Only auto-start the server when not running in test mode
if (process.env.NODE_ENV !== "test") {
  startServer();
}

// Graceful Shutdown Handling
const gracefulShutdown = (signal: string) => {
  console.log(`\n[Core] Received ${signal}. Starting graceful shutdown...`);

  analyticsBuffer
    .drainAndStop()
    .then(() => {
      console.log("[Core] Analytics buffer drained.");
      if (server) {
        server.close(() => {
          console.log("[Core] HTTP server closed.");
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    })
    .catch((err: Error) => {
      console.error("[Core] Error during analytics shutdown:", err);
      process.exit(1);
    });
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("message", (msg: string) => {
  if (msg === "shutdown") {
    gracefulShutdown("IPC shutdown");
  }
});

export { app, server, startServer };
