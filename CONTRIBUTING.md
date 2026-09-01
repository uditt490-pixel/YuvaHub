# Contributing to YuvaHub

Thank you for your interest in contributing to **YuvaHub**! 🎉

We appreciate every contribution, whether it's fixing bugs, improving documentation, enhancing the UI, or adding new features. Please follow the guidelines below to ensure a smooth contribution process.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Local Development Setup](#local-development-setup)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Firebase Authentication Setup](#firebase-authentication-setup)
  - [Database Setup](#database-setup)
  - [Meilisearch & Redis (Docker)](#meilisearch--redis-docker)
  - [Running the App](#running-the-app)
  - [Running Tests](#running-tests)
  - [Common Issues & Troubleshooting](#common-issues--troubleshooting)
- [Project Setup](#project-setup)
- [Repository Structure](#repository-structure)
- [Creating a Feature Branch](#creating-a-feature-branch)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Assignment Workflow](#issue-assignment-workflow)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)
- [Code of Conduct](#code-of-conduct)

---

# Getting Started

1. Fork this repository.
2. Clone your fork to your local machine.

```bash
git clone https://github.com/<your-username>/YuvaHub.git
cd YuvaHub
```

3. Add the original repository as the upstream remote.

```bash
git remote add upstream https://github.com/uditt490-pixel/YuvaHub.git
```

4. Follow the [Local Development Setup](#local-development-setup) section below to configure your environment and start the app.

---

# Local Development Setup

This section is the single source of truth for getting YuvaHub running on your machine from scratch.

## Prerequisites

Make sure the following are installed before you begin:

| Tool | Minimum Version | Download |
| :--- | :--- | :--- |
| **Node.js** | v18 or higher | https://nodejs.org |
| **npm** | v9 or higher (bundled with Node.js) | — |
| **Docker Desktop** | Latest stable | https://www.docker.com/products/docker-desktop/ (optional, for Meilisearch & Redis) |
| **Git** | Any recent version | https://git-scm.com |

Verify your versions before proceeding:

```bash
node -v   # should print v18.x.x or higher
npm -v    # should print v9.x.x or higher
```

## Environment Variables

All configuration is driven by a `.env` file in the project root. A fully annotated template already exists at [`.env.example`](./.env.example).

```bash
# macOS / Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Open `.env` and fill in the values. The startup validator will reject a misconfigured environment and print the names of any missing keys.

**The three keys required to start the server are:**

```
MONGODB_URI      # your MongoDB Atlas (or local) connection string
JWT_SECRET       # any long random string, e.g. output of: openssl rand -hex 32
GEMINI_API_KEY   # your Google AI Studio key from https://aistudio.google.com
```

Everything else is optional for local development. The app runs in a mock/fallback mode when optional services (Redis, RabbitMQ, Meilisearch) are absent.

> **Security reminder:** Never commit your `.env` file. It is already listed in `.gitignore`.

For a full description of every variable, see [docs/ENVIRONMENT_VARIABLES.md](./docs/ENVIRONMENT_VARIABLES.md).
For secret management best practices (rotation, CI/CD, cloud deployment), see [docs/SECRET_MANAGEMENT.md](./docs/SECRET_MANAGEMENT.md).

## Firebase Authentication Setup

YuvaHub uses Firebase for user authentication (Google Sign-In).

1. Create a free project at the [Firebase Console](https://console.firebase.google.com/).
2. Register a **Web App** inside that project and copy the config values.
3. Paste each value into your `.env` file under the `FIREBASE BROWSER SDK` section:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

4. In the Firebase Console go to **Authentication → Sign-in method** and enable **Google**.
5. Go to **Authentication → Settings → Authorized domains** and add `localhost`.

## Database Setup

YuvaHub uses **MongoDB** as its primary database.

### Option A — MongoDB Atlas (recommended for first-time contributors)

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Click **Connect → Drivers** and copy the connection string.
3. Replace `<password>` and set your database name, then paste the full URI into your `.env`:
   ```
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/yuvahub?retryWrites=true&w=majority
   MONGODB_DB_NAME=yuvahub
   ```
4. In **Network Access**, add `0.0.0.0/0` (allow from anywhere) for local development.

### Option B — Local MongoDB

If you have MongoDB Community Server installed locally:

```
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=yuvahub
```

### Database Seeding

The app seeds itself automatically on first run — the scraper pipeline populates the `opportunities` collection and the server creates all required indexes on startup. No manual seed script is needed.

If you want to verify connectivity before starting the full server:

```bash
npm run test-mongo
```

## Meilisearch & Redis (Docker)

Meilisearch powers full-text search and Redis backs BullMQ job queues. Both are **optional for basic local development** — the server falls back to MongoDB-only search and skips queue processing when they are unavailable.

To enable them, make sure Docker Desktop is running, then:

```bash
docker compose up -d
```

This starts:
- **Meilisearch** on `http://localhost:7700` (master key: `yuvahub-dev-master-key`)
- **Redis** on `localhost:6379`

Then update your `.env` to point at these local instances:

```
MEILI_HOST=http://127.0.0.1:7700
MEILI_MASTER_KEY=yuvahub-dev-master-key

REDIS_URL=redis://127.0.0.1:6379
ENABLE_REDIS=true
```

To stop the containers:

```bash
docker compose down
```

To stop and delete all stored data:

```bash
docker compose down -v
```

## Running the App

After completing the setup above, install dependencies and start the development server:

```bash
npm install
npm run dev
```

This starts both the Vite frontend (hot-reload) and the Express backend concurrently.

Open your browser at **http://localhost:5173**.

Other useful scripts:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start frontend + backend in watch mode |
| `npm run dev:server` | Start only the Express backend |
| `npm run build` | Compile a production bundle |
| `npm run start` | Serve the compiled production bundle |
| `npm run scrape` | Run the opportunity scraper manually |
| `npm run lint` | TypeScript type-check (no emit) |

## Running Tests

```bash
# Unit & integration tests (Vitest, single run)
npm test -- --run

# Unit & integration tests with coverage
npm run test:coverage

# End-to-end tests (Playwright) — requires a running dev server
npm run test:e2e
```

> Use `--run` with Vitest to exit after one pass instead of entering watch mode.

## Common Issues & Troubleshooting

**Server exits immediately with "Missing required environment variables"**
- Run `npm run dev` and read the printed list of missing keys.
- The three required keys are `MONGODB_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`.
- Double-check that your `.env` file is in the project root (same folder as `package.json`).

**`npm install` fails or produces peer-dependency errors**
- Make sure you are on Node.js v18 or higher (`node -v`).
- Delete `node_modules` and `package-lock.json`, then re-run `npm install`.

**MongoDB connection refused / authentication failed**
- For Atlas: verify your IP is whitelisted and the password in the URI is correct.
- For local MongoDB: confirm the `mongod` process is running.

**Google Sign-In fails or redirects loop**
- Confirm `localhost` is added to **Authorized Domains** in the Firebase Console.
- Ensure all `VITE_FIREBASE_*` values in `.env` exactly match the Firebase project config.

**Meilisearch search returns no results**
- Make sure `docker compose up -d` is running.
- Confirm `MEILI_HOST` and `MEILI_MASTER_KEY` in `.env` match the values in `docker-compose.yml`.
- On first run the search index is built in the background — wait a few seconds and refresh.

**Port already in use (5000 or 5173)**
- Kill the process using that port or change `PORT` / `FRONTEND_URL` in `.env`.

**`tsx` not found / command not recognized**
- Run `npm install` again to restore dev dependencies.
- On Windows, try running commands in PowerShell rather than CMD.

---

# Project Setup

Before making changes:

- Install all dependencies.
- Ensure the project runs without errors.
- Create a new branch for every feature or bug fix.
- Keep your fork updated with the upstream repository.

Update your fork:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

---

# Repository Structure

```
.
├── docs/                  # Architecture, deployment, and feature docs
├── public/                # Static assets served directly (robots.txt, favicon, etc.)
├── src/
│   ├── api/
│   │   ├── controllers/   # Express route handlers (one file per feature)
│   │   ├── middlewares/   # Auth, rate-limiting, validation, and observability middleware
│   │   ├── routes/        # Express router definitions
│   │   ├── services/      # Internal API services
│   │   ├── versioning/    # API versioning registry & headers
│   │   └── db.ts          # MongoDB connection helpers
│   ├── components/        # React UI components (about, admin, dashboard, tabs, ui)
│   ├── config/            # App-wide config (swagger, env validation, etc.)
│   ├── consumers/         # RabbitMQ event consumers
│   ├── context/           # React context providers
│   ├── events/            # EventBus abstraction
│   ├── hooks/             # React custom hooks
│   ├── lib/               # Utility libraries (apiResponse, utils, firebase)
│   ├── models/            # Zod & database schemas
│   ├── pages/             # React page components (one per route)
│   ├── queues/            # BullMQ background job queues
│   ├── routes/            # Client routing
│   ├── scrapers/          # Scraper adapters and definitions
│   ├── services/          # Background services (search sync, scrapers, DNL)
│   ├── socket/            # Socket.IO event setup
│   ├── types/             # Shared TypeScript type definitions
│   ├── utils/             # Helper utilities
│   └── workers/           # Background workers (email, push, scrapers, mentorship)
├── firestore-tests/       # Firebase Firestore rules emulator tests
├── functions/             # Firebase Cloud Functions
├── scripts/               # Utility scripts (secret boundary checks, etc.)
├── .env.example           # Annotated environment variable template
├── docker-compose.yml     # Local Meilisearch + Redis containers
├── firestore.rules        # Firestore security rules
├── package.json
├── server.ts              # Express server entry point
└── vite.config.ts         # Vite build configuration
```

Please place new files in the appropriate directory to keep the project organized.

## Middleware Conventions

All reusable Express middleware lives under **`src/api/middlewares/`** — do not
define reusable middleware inline in `server.ts`.

- Each middleware/factory gets its own file named in `camelCase` (e.g.
  `rateLimiter.ts`, `proxyHeaders.ts`, `auth.ts`, `validateRequest.ts`).
- Re-export every public middleware from `src/api/middlewares/index.ts` and
  import it from that barrel (or the specific file), e.g.:

  ```ts
  import { resumeRateLimiter, chatRateLimiter } from "./src/api/middlewares/rateLimiter.js";
  import { stripForwardedHeader } from "./src/api/middlewares/proxyHeaders.js";
  ```
- Keep pure business logic in `src/services/` and keep the thin Express adapter
  (the `(req, res, next)` wrapper) in `src/api/middlewares/`. For example,
  `services/toxicity.ts` holds the reusable `isToxic()` classifier while its
  `createToxicityMiddleware()` factory adapts it to Express.

---

# Creating a Feature Branch

Always create a separate branch before making changes.

```bash
git checkout -b feature/your-feature-name
```

Examples:

```
feature/navbar-improvement
feature/footer-redesign
fix/login-validation
docs/update-readme
```

---

# Coding Standards

Please follow these best practices:

- Write clean and readable code.
- Use meaningful variable and function names.
- Keep components modular and reusable.
- Avoid unnecessary code duplication.
- Follow existing project formatting and naming conventions.
- Remove unused imports and files.
- Ensure your changes do not break existing functionality.

---

# Commit Message Guidelines

Use descriptive commit messages.

Recommended format:

```
type: short description
```

Examples:

```
feat: add responsive navbar
fix: resolve login validation bug
docs: add contributing guide
style: improve button spacing
refactor: simplify event card component
```

---

# Pull Request Process

Before submitting your Pull Request:

- Ensure your branch is up to date.
- Test your changes locally.
- Resolve merge conflicts.
- Verify that the project builds successfully.

Then:

1. Push your branch.

```bash
git push origin feature/your-feature-name
```

2. Open a Pull Request.

3. Include:

- A clear title.
- A detailed description.
- Screenshots (if UI changes).
- Reference the related issue using:

```
Closes #IssueNumber
```

Example:

```
Closes #67
```

---

# Issue Assignment Workflow

Before working on an issue:

- Check if the issue has already been assigned.
- Comment on the issue expressing your interest.
- Wait for assignment if required by the maintainers.
- Work on only one assigned issue at a time unless instructed otherwise.

---

# Reporting Bugs

When reporting a bug, include:

- Bug description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Browser/Operating System details

---

# Feature Requests

Feature requests should include:

- Problem statement
- Proposed solution
- Benefits
- Additional context or mockups (optional)

---

# Code of Conduct

Please be respectful and professional.

By participating in this project, you agree to:

- Treat everyone with respect.
- Welcome constructive feedback.
- Maintain a positive and inclusive environment.
- Avoid harassment, discrimination, or abusive behavior.

---

## Thank You ❤️

Every contribution, no matter how small, helps improve **YuvaHub**.

Happy Coding! 🚀