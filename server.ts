import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import { initializeDatabase } from "./src/api/db.js";
import { Server as SocketIOServer } from "socket.io";
import { setSocketIO } from "./src/api/socketInstance.js";
import { setupSocketEvents } from "./src/socket/index.js";
import { runDeadlineChecks, runWeeklyDigest } from "./src/services/deadlineScheduler.js";
import { dbCommand, dbQuery } from "./src/api/db.js";
import { analyticsBuffer } from "./src/api/analytics.js";

// Import Main API Router
import apiRoutes from "./src/api/routes/index.js";

import * as Sentry from "@sentry/node";

import { eventBus } from "./src/events/eventBus.js";
import { createNotificationConsumer } from "./src/consumers/notificationConsumer.js";
import { createOpportunityScrapedConsumer } from "./src/consumers/opportunityScrapedConsumer.js";

import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

import { emailQueue } from "./src/queues/emailQueue.js";
import { pushQueue } from "./src/queues/pushQueue.js";
import { scraperQueue } from "./src/queues/scraperQueue.js";
import { agentQueue } from "./src/queues/agentQueue.js";
import { resumeParserQueue } from "./src/queues/resumeQueue.js";
import { applicationQueue } from "./src/queues/applicationQueue.js";
import { deadlineQueue, registerRepeatableDeadlineJobs } from "./src/queues/deadlineQueue.js";

dotenv.config();

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
    methods: ["GET", "POST"]
  }
});
setSocketIO(io);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Setup API Routes
app.use("/api", apiRoutes);

// Bull Board Dashboard configuration
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [
    new BullMQAdapter(emailQueue),
    new BullMQAdapter(pushQueue),
    new BullMQAdapter(scraperQueue),
    new BullMQAdapter(agentQueue),
    new BullMQAdapter(resumeParserQueue),
    new BullMQAdapter(applicationQueue),
    new BullMQAdapter(deadlineQueue)
  ],
  serverAdapter: serverAdapter
});

app.use("/admin/queues", serverAdapter.getRouter());

// ── SEO Routes (root-level for crawler discovery) ──────────────────────

app.get("/robots.txt", (req, res) => {
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

app.get("/sitemap.xml", async (req, res) => {
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

    let urls = staticPaths.map((p) => {
      return `  <url>
    <loc>${baseUrl}${p}</loc>
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

        const oppUrls = items.map((item: any) => {
          const id = item._id ? item._id.toString() : item.id;
          const title = item.title || "opportunity";
          const cleanTitle = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          const lastmod = item.created_at
            ? new Date(item.created_at).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0];
          return `  <url>
    <loc>${baseUrl}/opportunity/${id}/${cleanTitle}</loc>
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

// For any route that isn't an API route, serve the React index.html
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next(); // Let the 404 handler catch missing API routes
  }
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Fallback Route for API endpoints
app.use((req, res) => {
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
    initializeDatabase().catch((err) => {
      console.warn('[Core] Database initialization fallback mode:', (err as Error).message);
    });

    // 4. Wire Event Bus Consumers (RabbitMQ) asynchronously
    eventBus.connect().then(async () => {
      const notifHandler = await createNotificationConsumer(dbCommand);
      const scrapedHandler = await createOpportunityScrapedConsumer(dbCommand);
      await eventBus.subscribe('notifications', 'opportunity.scraped', notifHandler);
      await eventBus.subscribe('opportunity-scraped', 'opportunity.scraped', scrapedHandler);
      console.log('[Core] Event Bus consumers wired successfully');
    }).catch((err) => {
      console.warn('[Core] Event Bus unavailable:', (err as Error).message);
    });

    // 5. Start Background Services
    if (process.env.NODE_ENV !== "test") {
      registerRepeatableDeadlineJobs().catch((err) => {
        console.error("[Core] Failed to register repeatable deadline jobs:", err);
      });
    }
  } catch (error) {
    console.error("[Core] Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

// Graceful Shutdown Handling
const gracefulShutdown = (signal: string) => {
  console.log(`\n[Core] Received ${signal}. Starting graceful shutdown...`);
  
  analyticsBuffer.drainAndStop().then(() => {
    console.log("[Core] Analytics buffer drained.");
    if (server) {
      server.close(() => {
        console.log("[Core] HTTP server closed.");
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  }).catch(err => {
    console.error("[Core] Error during analytics shutdown:", err);
    process.exit(1);
  });
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("message", (msg) => {
  if (msg === "shutdown") {
    gracefulShutdown("IPC shutdown");
  }
});
