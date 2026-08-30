# Security Threat Model & Mitigation Guide

This document catalogs the security threats YuvaHub faces as a student-facing
discovery platform and the defensive controls currently in place. It is intended
to raise security awareness among contributors and to ensure new features are
built with defensive programming principles.

---

## 1. Threat Model Summary

| # | Threat Vector | Severity | Primary Mitigation |
|---|---------------|----------|--------------------|
| T1 | API Abuse / DDoS | High | Redis-backed rate limiting (fail-open) |
| T2 | Stored XSS via markdown / text fields | High | `escape-html` sanitization on every DB write |
| T3 | Path Traversal & File Upload Abuse | Medium | MIME allowlist + filename sanitization |
| T4 | Credential Stuffing / Brute Force | High | Auth-rate-limited endpoints + slow hashing |
| T5 | PII / Sensitive Data Leakage | Medium | Output escaping, typed schema validation |
| T6 | Toxic / Abusive Content Injection | Medium | Keyword filter + Gemini AI classification |
| T7 | Mass Assignment / Over-Posting | Medium | Zod schema gating + field-level sanitize |
| T8 | CSRF / Unauthorized State Change | Medium | CORS pinning + JWT auth on mutations |

---

## 2. Threat-by-Threat Detail & Current Defenses

### T1 — API Abuse / DDoS

**Risk:** A bot or automated client can flood any endpoint, exhausting Redis
connections, database pool, or AI API quotas.

**Current defenses:**

- [`express-rate-limit`](https://www.npmjs.com/package/express-rate-limit) is
  applied per-route in
  [`src/api/middlewares/rateLimiter.ts`](../src/api/middlewares/rateLimiter.ts).
  Every limiter uses a **Redis store** (`RedisStore` via `rate-limit-redis`) so
  limits are shared across multiple server instances.
- **Fail-open design:** when Redis is unreachable,
  [`createFailOpenStore`](../server.ts) degrades gracefully instead of blocking
  legitimate users — availability is preferred over strict enforcement during
  infra outages.

| Limiter | Window | Max | Scope |
|---------|--------|-----|-------|
| `authLimiter` | 1 h | 5 | `/auth/login`, `/auth/signup`, `/auth/forgot-password` |
| `authRateLimiter` | 15 min | 20 | Auth sync/refresh routes |
| `generalLimiter` | 15 min | 200 | General API |
| `globalLimiter` | 15 min | 100 | Global cap |
| `aiLimiter` | 15 min | 50 | AI generation |
| `chatRateLimiter` | 1 min | 60 | Per-user chat |
| `resumeRateLimiter` | 15 min | 15 | Resume review |

### T2 — Stored XSS via Markdown / Text Fields

**Risk:** Opportunity titles, descriptions, tags, community posts, forum
replies, and poll options are user-supplied strings persisted to MongoDB and
later rendered in HTML. Without sanitization they execute as JavaScript in a
victim's browser.

**Current defenses:**

- Every opportunity write path calls
  [`sanitizeText`](../src/api/controllers/opportunityController.ts#L14) and
  [`sanitizeArray`](../src/api/controllers/opportunityController.ts#L22), both
  powered by the **`escape-html`** library:

  ```ts
  const sanitizeText = (text: any): string => {
    if (typeof text !== "string") return "";
    return escapeHtml(text.trim());
  };
  ```

- Community posts, forum replies, and polls apply the same
  `escapeHtml()` call before storage (see
  [`communityController.ts`](../src/api/controllers/communityController.ts),
  [`forumReplyController.ts`](../src/api/controllers/forumReplyController.ts),
  [`pollController.ts`](../src/api/controllers/pollController.ts)).
- The `sanitizeString` helper in
  [`academic_curriculum_engine.js`](../src/services/academic_curriculum_engine.js)
  performs manual HTML-entity replacement (`&`, `<`, `>`, `"`, `'`) as a belt-
  and-suspenders defense for client-side rendering.
- Markdown content is served through
  [`markdownNegotiation.ts`](../src/api/middlewares/markdownNegotiation.ts)
  with a `text/markdown` content-type negotiation — no raw HTML injection.

**Sanitize / escape procedure required when rendering user-submitted text:**

1. **At ingestion** — always `escapeHtml()` (or equivalent) before writing to
   any database or search index.
2. **At display** — re-escape on output even if the field was previously
   sanitized; never trust stored data as already safe for a new rendering
   context.
3. **Never** insert unescaped user strings into HTML, URL, or CSS contexts.

### T3 — Path Traversal & File Upload Abuse

**Risk:** A malicious upload filename such as `../../etc/passwd` or a `.exe`
masquerading as an image can lead to arbitrary file write or server-side
execution.

**Current defenses:**

- [`storageController.ts`](../src/api/controllers/storageController.ts) enforces
  a strict **MIME-type allowlist** (`pdf`, `png`, `jpeg`, `jpg`) — only those
  extensions are accepted regardless of the declared `Content-Type`.
- [`sanitizeFilename`](../src/api/controllers/storageController.ts#L29) strips
  path components with `path.basename()` and replaces non-alphanumeric
  characters with underscores, then prepends a random UUID to prevent
  overwrites:

  ```ts
  const safeName = basename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${crypto.randomUUID()}-${safeName}`;
  ```

- Upload size is capped at **5 MB** (`MAX_FILE_SIZE`).

### T4 — Credential Stuffing / Brute Force

**Risk:** Attackers automate login/signup/forgot-password attempts to enumerate
or compromise user accounts.

**Current defenses:**

- Auth endpoints are wrapped by
  [`authRateLimiter`](../src/api/middlewares/rateLimiter.ts) (5 per hour) and
  [`authLimiter`](../src/api/middlewares/rateLimiter.ts) (20 per 15 min), both
  Redis-backed.
- Rate limiting is applied at the **route level** in
  [`authRoutes.ts`](../src/api/routes/authRoutes.ts):

  ```ts
  router.post("/login", authRateLimiter, login);
  router.post("/signup", authRateLimiter, signup);
  router.post("/forgot-password", authRateLimiter, forgotPassword);
  ```

- JWT secrets are loaded from environment variables (never hardcoded).

### T5 — PII / Sensitive Data Leakage

**Risk:** MongoDB documents contain PII (names, emails, UIDs). The API must
ensure responses do not leak fields a caller should not see, and that internal
error messages do not expose connection strings or stack traces.

**Current defenses:**

- [Zod schemas](`../src/models/`) gate every incoming request shape, preventing
  over-posting and type confusion.
- [`apiResponse.ts`](`../src/lib/apiResponse.ts`) standardizes output so only
  intended fields are serialized.
- The `safeObjectId` helper in `lib/utils.ts` validates ObjectId format before
  database access, avoiding injection into query selectors.
- Error handling middleware
  ([`errorHandler.ts`](`../src/api/middlewares/errorHandler.ts`) strips stack
  traces from production responses.

### T6 — Toxic / Abusive Content Injection

**Risk:** Users submit abusive, hateful, or inappropriate text in community
posts, replies, and comments.

**Current defenses:**

- [`toxicity.ts`](`../src/services/toxicity.ts`) runs a two-tier classifier:
  1. **Local keyword filter** — pre-compiled case-insensitive regexes against a
     curated blocklist (profanity, hate speech, self-harm terms).
  2. **Gemini AI fallback** — when the local filter is inconclusive, the text is
     sent to the Gemini 2.5 Flash model for classification (`"toxic"` vs
     `"clean"`), wrapped in a circuit breaker with a 5 s timeout.

### T7 — Mass Assignment / Over-Posting

**Risk:** An attacker sends extra fields in a JSON body (e.g., `role: "admin"`,
`isVerified: true`) hoping the ORM/MongoDB mapper will persist them.

**Current defenses:**

- Every controller uses Zod schemas to define the **exact allowed shape** of
  request bodies. Unspecified fields are rejected at validation time.
- Explicit field-level `sanitizeText` / `sanitizeArray` calls whitelist which
  fields are written (see `opportunityController.ts` lines 381-399).
- Update paths re-sanitize every field individually:

  ```ts
  if (updateData.title) updateData.title = sanitizeText(updateData.title);
  ```

### T8 — CSRF / Unauthorized State Change

**Risk:** A malicious site tricks an authenticated user into making unwanted
state-changing requests.

**Current defenses:**

- CORS is pinned to `origin: FRONTEND_URL` when configured, otherwise falls
  back to `origin: "*"` for local development:

  ```ts
  const corsOptions = frontendUrl ? { origin: frontendUrl } : { origin: "*" };
  app.use(cors(corsOptions));
  ```

- Every mutation route requires a valid JWT (enforced by auth middleware).
- `express.json({ limit: '10mb' })` caps payload size to prevent memory-exhaustion
  abuse.
- Socket.IO connections are also CORS-gated and JWT-validated.

---

## 3. Defensive Coding Principles

Contributors should follow these principles when adding or modifying features:

1. **Never trust user input.** Treat every string, file, header, and query
   parameter as hostile until validated.
2. **Escape at the boundary closest to the output context.** HTML → `escapeHtml`,
   SQL → parameterized queries, OS → `path.basename` + allowlist.
3. **Fail open for availability, fail closed for security.** Rate limiters degrade
   gracefully; auth checks never degrade.
4. **Use the project's existing helpers.** Reuse `sanitizeText`, `sanitizeArray`,
   `sanitizeFilename`, and Zod schemas — do not write ad-hoc sanitization.
5. **Add a rate limiter to every new publicly-facing route.**
6. **Do not log secrets.** PII, JWTs, and API keys must never appear in logs or
   error responses.

---

## 4. Responsible Security Disclosure

If you discover a vulnerability in YuvaHub, please disclose it responsibly so
the maintainers can fix it before public exposure.

**Do NOT open a public GitHub issue for security findings.** Instead, contact
the maintainers directly:

| Method | Detail |
|--------|--------|
| **Email** | [uditt490@gmail.com](mailto:uditt490@gmail.com) |
| **GitHub** | [uditt490-pixel](https://github.com/uditt490-pixel) |

**Please include in your report:**

1. A description of the vulnerability and the affected component.
2. Steps to reproduce (minimal, safe, and non-destructive).
3. The potential impact and any evidence of exploitation.
4. Your contact information so the maintainers can follow up.

The maintainers commit to acknowledging receipt within **48 hours** and
providing a remediation timeline within **14 days**. Vulnerabilities that are
responsible disclosed will be credited in the project's security advisories.

---

## 5. References

- [Rate Limiting Middleware](../src/api/middlewares/rateLimiter.ts)
- [Opportunity Controller — SEC-08 Sanitization](../src/api/controllers/opportunityController.ts)
- [Community Controller — XSS Escaping](../src/api/controllers/communityController.ts)
- [Forum Reply Controller](../src/api/controllers/forumReplyController.ts)
- [Poll Controller](../src/api/controllers/pollController.ts)
- [Storage Controller — Upload Sanitization](../src/api/controllers/storageController.ts)
- [Toxicity Service](../src/services/toxicity.ts)
- [Server — CORS & Rate Limiting Setup](../server.ts)
- [Zero Trust Security Service](../src/services/ZeroTrustSecurityService.ts)
