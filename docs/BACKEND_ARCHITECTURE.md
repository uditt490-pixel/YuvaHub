# YuvaHub Backend Architecture

This document explains how the YuvaHub backend is organized and how its
components — API layer, services, middleware, queues, workers, scrapers,
database, and AI integration — interact. It is intended for new
contributors who want to understand the system before making changes.

---

## Table of Contents

- [High-Level Overview](#high-level-overview)
- [Project Structure](#project-structure)
- [Request Lifecycle](#request-lifecycle)
- [Authentication Flow](#authentication-flow)
- [Queue Architecture](#queue-architecture)
- [Scraper Pipeline](#scraper-pipeline)
- [Database Layer](#database-layer)
- [AI Integration](#ai-integration)
- [Socket.IO & Real-Time Updates](#socketio--real-time-updates)
- [Background Scheduling](#background-scheduling)
- [Contributor Guidance](#contributor-guidance)

---

## High-Level Overview

YuvaHub is a full-stack platform for Indian students to discover
hackathons, scholarships, internships, and mentorship opportunities.

The backend is a modular **Express (v5)** server written in **TypeScript**:

- **API layer** (`src/api/`) — routes, controllers, middleware, DB access.
- **Services** (`src/services/`) — business logic: AI, search, scrapers,
  recommendations, matching, notifications.
- **Workers** (`src/workers/`) — BullMQ consumers that process queued jobs
  (email, push, resumes, scrapers, AI agents).
- **Queues** (`src/queues/`) — BullMQ queue definitions.
- **Event bus** (`src/events/`) — RabbitMQ publish/subscribe for domain
  events with retry and dead-lettering.
- **Consumers** (`src/consumers/`) — RabbitMQ subscribers.
- **Socket.IO** (`src/socket/`) — real-time client updates.

```
Browser
   │
   ▼
Express server (server.ts)
   │
   ├── /api/v1/*  ──►  Routes  ──►  Middleware  ──►  Controllers  ──►  Services
   │                                                              │
   │                                                              ├──► MongoDB (command + query)
   │                                                              ├──► Redis (cache, rate limit)
   │                                                              ├──► BullMQ queues ──► Workers
   │                                                              ├──► RabbitMQ event bus ──► Consumers
   │                                                              └──► Google Gemini (AI)
   │
   └── Socket.IO ──► real-time push to browser
```

---

## Project Structure

The backend lives in the repository root (the frontend is a Vite React
app alongside it). Key backend directories:

```
server.ts                     Express entry point (bootstrap, middleware, listen)
sync-all.ts                   Script to run scrapers manually
scrape-cli.ts                 CLI wrapper around the scraper pipeline
src/
├── api/
│   ├── controllers/          Request handlers (auth, opportunities, resumes…)
│   ├── routes/               Express routers (one per resource) + index.ts
│   ├── middlewares/          Centralized middleware (auth, rate limit, errors…)
│   ├── services/             API-facing services (admin alerts, search sync)
│   ├── db.ts                 MongoDB connections (command + query) + MockDB fallback
│   ├── genai.ts              AI client + LRU cache + fallback responses
│   ├── analytics.ts          Analytics buffer for batched writes
│   ├── redis.ts              Redis client factory
│   └── socketInstance.ts     Socket.IO singleton
├── config/                   env validation, swagger, permissions
├── consumers/                RabbitMQ subscribers (notifications, opportunities)
├── events/                   RabbitMQ event bus + DLQ topology
├── models/                   Mongoose/MongoDB schemas (auth, teams…)
├── queues/                   BullMQ queue definitions
├── services/                 Business logic (AI, search, scrapers, DNL…)
├── socket/                   Socket.IO event handlers
├── workers/                  BullMQ workers (email, push, resume, scraper, agent)
└── utils/                    Shared helpers (pagination, currency, dates…)
```

### Naming conventions

- Controllers: `<resource>.controller.ts`
- Routes: `<resource>Routes.ts`
- Middleware: kebab-case files under `src/api/middlewares/` with a barrel
  `index.ts`
- Workers: `<purpose>Worker.ts`
- Queues: `<purpose>Queue.ts`

---

## Request Lifecycle

A typical HTTP request flows through the following stages:

1. **Server bootstrap** (`server.ts`): environment validation, Sentry,
   Socket.IO, Swagger at `/api/docs`, CORS, JSON body parsing.
2. **Routing** (`src/api/routes/index.ts`): all resource routers are
   mounted on both `/api/v1` and `/api` (dual-version compatibility).
3. **Middleware**: `authMiddleware` (JWT) and `validateRequest` (Zod)
   run per-route before the controller.
4. **Controller**: validates input, calls the appropriate service,
   returns a standardized envelope (`sendSuccess` / `sendError` /
   `sendPaginated` from `src/lib/apiResponse.ts`).
5. **Service**: performs business logic — database queries, AI calls,
   queue enqueue, event emission.
6. **Response**: the controller replies with JSON. Express 5 forwards
   rejected promises to the global `errorHandler` middleware.

```
Request
  → authMiddleware (JWT verification)
  → validateRequest (Zod schema, where configured)
  → controller
      → service
          → MongoDB / Redis / Gemini / Queue / EventBus
  → JSON response (success envelope or error via errorHandler)
```

---

## Authentication Flow

YuvaHub uses **Firebase Authentication** on the frontend and verifies the
Firebase token on the backend.

1. The client signs in with Google via the Firebase SDK.
2. The Firebase ID token is sent as a `Bearer` token in the
   `Authorization` header.
3. `authMiddleware` (`src/api/middlewares/auth.ts`) verifies the token
   with Firebase Admin, extracts `userId`, `tenantId`, and role, and
   attaches them to the request.
4. Route-level permission checks use `adminOnly` (roles
   `admin` / `superadmin`), built from `authorizeRoles` in the auth
   middleware.
5. In development without Firebase credentials, a mock auth mode is
   enabled so the API can run locally.

---

## Queue Architecture

Background work uses **BullMQ** (backed by Redis) for job processing.

| Queue | Purpose | Worker |
|-------|---------|--------|
| `emailQueue` | Outbound emails (notifications, digests) | `emailWorker.ts` |
| `pushQueue` | Push notifications | `pushWorker.ts` |
| `resumeQueue` | Resume parsing / ATS processing | `resumeWorker.ts` |
| `scraperQueue` | Scraper job dispatch | `scraperWorker.ts` |
| `applicationQueue` | Application submissions | `applicationWorker.ts` |
| `agentQueue` | AI application agents | `applicationAgentWorker.ts` |

Workers are plain BullMQ processors; the connection factory lives in
`src/queues/connection.ts`. If Redis is unavailable, the system falls
back to in-memory processing so the server still functions in
development (see `test-redis-fallback.ts` for the behavior contract).

### RabbitMQ event bus

`src/events/eventBus.ts` implements a **topic exchange** event bus with a
dead-letter topology:

- Main exchange: `domain_events`
- Retry exchange: `domain_events_retry`
- DLX exchange: `domain_events_dlx`

Messages are retried up to 3 times with a 5s delay before being
dead-lettered. `src/consumers/` subscribes to domain events such as
notifications and opportunity-scraped events. See
`docs/RABBITMQ_DLQ_RECOVERY.md` for the full topology and recovery
playbook.

---

## Scraper Pipeline

Opportunities are collected by a scraping pipeline that ingests external
sources (Devpost, Internshala, and others).

1. **Schedulers** (`src/services/dnl/scheduler.ts`,
   `src/services/deadlineScheduler.ts`) trigger collection on an
   interval or via cron.
2. **Adapters** (`src/services/dnl/adapters/`, `src/services/applicationAdapters/`)
   normalize each source into the internal opportunity shape.
3. **Deduplication** (`src/services/dnl/deduplicator.ts`) prevents
   duplicate records across sources.
4. **Producer** (`src/services/scraperProducer.ts`) enqueues scrape jobs
   onto the BullMQ `scraperQueue`.
5. **Worker** (`src/workers/scraperWorker.ts`) consumes the jobs, writes
   opportunities to MongoDB, and publishes `opportunity.scraped` events on
   the RabbitMQ bus.
6. **Search sync** (`src/services/searchSync.ts`) mirrors new records to
   the Meilisearch index.

```
Scheduler → Adapters → Deduplicator → scraperProducer
                                        → BullMQ scraperQueue
                                            → scraperWorker
                                                → MongoDB
                                                → eventBus (opportunity.scraped)
                                                → searchSync → Meilisearch
```

---

## Database Layer

- **MongoDB** is the primary datastore, accessed via two connections:
  - `dbCommand` — writes / commands.
  - `dbQuery` — reads / queries.
  Both are initialized in `src/api/db.ts` from `MONGODB_URI`
  (`MONGODB_COMMAND_URI` / `MONGODB_QUERY_URI` override individually).
- If MongoDB is unreachable, the server falls back to an in-memory
  `MemoryCollection` mock database and attempts to reconnect every 30s
  (`onReconnect` re-initializes background services).
- **Redis** (`src/api/redis.ts`) backs caching (LRU for AI responses in
  `src/api/genai.ts`, HTTP caching in `cacheMiddleware`) and BullMQ.
- **Meilisearch** powers full-text opportunity search
  (`src/services/searchSync.ts`).
- Firestore is used for some platform rules (see `firestore.rules`).

---

## AI Integration

The backend integrates Google Gemini for several features:

- **AI assistant** (`src/services/gemini.ts`, `src/api/genai.ts`) —
  chat, resume analysis, cover letters, career guidance.
- **Application generation** (`src/services/applicationGenerator.ts`).
- **Recommendation engine** (`src/services/recommendationEngine.ts`) and
  opportunity matching (`src/services/opportunityMatcher.ts`).
- **Toxicity moderation** (`src/services/toxicity.ts`).

`src/api/genai.ts` wraps the client with an **LRU cache**
(`aiCache`) and **fallback responses** (`getAIFallback`) so the UI still
works if the Gemini API is down or the key is missing. The key is a
server-only secret — it is never exposed to the browser (see
`docs/GEMINI_KEY_SECURITY.md` and the client-secret boundary tests).

```
Service → getGenAI() → Gemini API
            └── LRU cache (aiCache)
            └── fallback (getAIFallback) on failure
```

---

## Socket.IO & Real-Time Updates

`server.ts` creates a Socket.IO server and stores it in
`src/api/socketInstance.ts`. `src/socket/index.ts` wires up event
handlers. The frontend receives live updates for opportunities, karma
changes, notifications, and connection status.

---

## Background Scheduling

- `src/services/deadlineScheduler.ts` — `runDeadlineChecks` and
  `runWeeklyDigest`, invoked from the server bootstrap and/or an external
  cron.
- `src/services/dnl/scheduler.ts` — the DNL (daily news letter / data
  loader) dispatcher that drives the scraper adapters on an interval.
- Render deployments use an external cron to trigger
  `sync-all.ts` (see `docs/RENDER_DEPLOYMENT_GUIDE.md`).

---

## Contributor Guidance

- **Start at the routes**: `src/api/routes/index.ts` shows every mounted
  resource; pick a route and follow it to the controller and service.
- **Use the existing patterns**: controllers return standardized
  envelopes via `src/lib/apiResponse.ts`; validation uses Zod
  (`validateRequest`); authentication is `authMiddleware`.
- **Middleware is centralized**: all middleware lives in
  `src/api/middlewares/` with a barrel `index.ts`. Do not add middleware
  files at other locations.
- **Background work goes through queues**: enqueue a BullMQ job instead
  of doing slow work inline in a controller.
- **Domain events go through the event bus**: publish/consume via
  `src/events/eventBus.ts` rather than calling consumers directly.
- **Run the checks before opening a PR**:

  ```bash
  npm run lint        # tsc --noEmit
  npm run test        # vitest unit/integration tests
  npm run build       # client + server bundles
  ```

- API docs are auto-generated at `/api/docs` (Swagger) — update
  `src/config/swagger.ts` when adding endpoints.
