# Environment variables

This guide documents environment variables supported by the current YuvaHub
codebase. It distinguishes startup requirements, optional integrations,
browser-visible configuration, and server-only secrets.

## Setup

```powershell
Copy-Item .env.example .env
```

On macOS or Linux:

```bash
cp .env.example .env
```

Fill only the integrations required for your task. Never commit `.env`,
service-account JSON, connection strings, API keys, passwords, or tokens.

## Classification

| Label | Meaning |
|---|---|
| Required | Enforced by the startup validator |
| Conditional | Required only when the related feature is enabled |
| Optional | Has a fallback/default or enables an integration |
| Development | Intended only for local development and tests |
| Public | Bundled into browser JavaScript |
| Secret | Must remain server-side |

## Startup-required variables

The current startup validator requires:

```text
MONGODB_URI
JWT_SECRET
GEMINI_API_KEY
```

`REDIS_URL` becomes required when one of these is enabled:

```text
ENABLE_REDIS=true
REDIS_ENABLED=true
REQUIRE_REDIS=true
```

The validator can be bypassed only for controlled test scenarios with
`SKIP_ENV_VALIDATION=true`.

## Minimal local example

```env
NODE_ENV=development
PORT=5000
APP_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/yuvahub
JWT_SECRET=
GEMINI_API_KEY=
ENABLE_MOCK_AUTH=true
```

Generate secrets rather than using words such as `your_secret_here`:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Public browser variables

Vite exposes variables prefixed with `VITE_` to browser code.

The following supported values are public configuration:

```text
VITE_API_URL
VITE_WS_URL
VITE_ADMIN_EMAILS
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_EMAILJS_SERVICE_ID
VITE_EMAILJS_TEMPLATE_ID
VITE_EMAILJS_PUBLIC_KEY
VITE_SENTRY_DSN_REACT
```

Never expose these server values with a `VITE_` prefix:

```text
MONGODB_URI
JWT_SECRET
JWT_REFRESH_SECRET
GEMINI_API_KEY
REDIS_URL
RABBITMQ_URL
FIREBASE_SERVICE_ACCOUNT_BASE64
FIREBASE_SERVICE_ACCOUNT_KEY
CLOUDINARY_API_SECRET
SMTP_PASS
SENTRY_AUTH_TOKEN
```

## MongoDB

`MONGODB_URI` and `MONGODB_DB_NAME` provide the default connection.

Advanced deployments may separate reads and writes:

```text
MONGODB_COMMAND_URI
MONGODB_COMMAND_DB
MONGODB_QUERY_URI
MONGODB_QUERY_DB
```

When split values are absent, the application falls back to the default URI
and database.

## Redis and queues

Redis supports caching, distributed rate limiting, Socket.IO scaling, and
BullMQ workers. Local code includes fallback paths, but production deployments
should configure Redis for reliable distributed behaviour.

RabbitMQ is configured through `RABBITMQ_URL`.

## Firebase

Browser Firebase variables identify the project but do not authorize access.
Protect data with Firebase Authentication and security rules.

Backend credentials are separate:

- `FIREBASE_SERVICE_ACCOUNT_BASE64` is used by backend authentication.
- `FIREBASE_SERVICE_ACCOUNT_KEY` is used by the push worker.
- `FIREBASE_PROJECT_ID` and `FCM_PROJECT_ID` provide project identifiers.

## Gemini AI

`GEMINI_API_KEY` is server-only. Frontend features must call backend routes
instead of contacting Gemini directly.

`AI_CACHE_MAX_SIZE` and `AI_CACHE_TTL_MS` control the in-memory AI response
cache.

## CORS

`FRONTEND_URL` is the currently consumed single-origin Socket.IO setting.

`CORS_ORIGINS` documents the intended comma-separated deployment allow-list.
Keep it aligned with `FRONTEND_URL` until the server's CORS middleware fully
uses the multi-origin value.

Example:

```env
FRONTEND_URL=https://yuvahub.xyz
CORS_ORIGINS=https://yuvahub.xyz,https://admin.yuvahub.xyz
```

## Logging

`LOG_LEVEL` is documented for deployment consistency and planned structured
logging. Current modules still use native `console` methods, so changing this
value does not suppress existing console output.

## Scraper source URLs

The DNL scheduler derives dynamic keys in this format:

```text
SCRAPER_URL_<NORMALIZED_SOURCE_NAME>
```

Examples:

```env
SCRAPER_URL_DEVPOST=
SCRAPER_URL_INTERNSHALA=
```

Only configure adapters enabled by the deployment.

## SMTP

SMTP values are used by email queue and worker code:

```text
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM
```

Keep `SMTP_PASS` in deployment secret storage.

## Razorpay status

The issue title mentions Razorpay, but the uploaded branch contains no Razorpay
integration or environment-variable reads. Razorpay variables are therefore not
added to `.env.example`; documenting unsupported credentials would be
misleading. Add them together with the actual integration when payment code is
introduced.

## Deployment

Use the platform's secret manager for production values:

- GitHub Actions Secrets
- Render environment settings
- Vercel environment settings
- Firebase Functions secrets
- Docker/Kubernetes secrets

Do not paste production values into source code, screenshots, issue comments,
README examples, or pull-request descriptions.
