# Secret Management

This guide covers secure handling of application secrets across development,
testing, and production environments. Follow these practices to prevent
credential leakage and maintain a strong security posture.

---

## 1. Core Principles

1. **Never commit secrets.** `.env`, service-account JSON, connection strings,
   API keys, passwords, and tokens must never be committed to source control.
2. **Never expose secrets to the browser.** Variables prefixed with `VITE_` are
   bundled into client JavaScript. Server-only secrets must never use this prefix.
3. **Rotate on exposure.** If a secret is accidentally committed, revoked, rotated,
   or leaked in logs/screenshots/issues, rotate it immediately — removing it from
   source does not revoke a previously exposed credential.
4. **Use platform secret managers in production.** Never paste production values
   into source code, CI logs, issue comments, or PR descriptions.

---

## 2. Environment Variable Classification

YuvaHub uses a classification system documented in
[ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md). The key categories:

| Label | Handling |
|---|---|
| **Required** | Enforced by startup validator (`MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`) |
| **Conditional** | Required only when the feature is enabled (`REDIS_URL` when Redis is on) |
| **Optional** | Has a fallback or enables an integration |
| **Public** | Bundled into browser JS (`VITE_*` prefix) — safe to expose |
| **Secret** | Must remain server-side — never expose to browser or logs |

### Server-Only Secrets (Never `VITE_` Prefix)

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

The `scripts/verify-client-secrets.mjs` build step scans the production bundle
and fails the build if any of these values appear in client-facing assets.

---

## 3. Local Development

### 3.1 Initial Setup

```bash
cp .env.example .env
```

Open `.env` and fill **only** the values required for your task. The three
startup-required keys are:

```
MONGODB_URI=mongodb://127.0.0.1:27017/yuvahub
JWT_SECRET=<generate a random value>
GEMINI_API_KEY=<your Google AI Studio key>
```

### 3.2 Generating Secure Random Values

Use `openssl` or Node.js to generate cryptographically strong secrets:

```bash
# Node.js (cross-platform)
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# macOS / Linux
openssl rand -hex 48
```

Never use placeholder values like `your_secret_here` or `changeme` in any
environment, even local development.

### 3.3 Mock Authentication

For local development without Firebase, enable mock auth:

```env
ENABLE_MOCK_AUTH=true
MOCK_VALID_TOKEN=any-random-string
```

**Never enable `ENABLE_MOCK_AUTH` in production.** The startup validator and
build pipeline do not enforce this — it is your responsibility.

### 3.4 Verifying Your Setup

```bash
# Check required env vars
npm run dev

# The server will print missing variables on startup if validation fails.
# Override validation only for controlled tests:
SKIP_ENV_VALIDATION=true npm run dev
```

---

## 4. Secret Rotation

### 4.1 When to Rotate

Rotate a secret immediately when:

- It was accidentally committed to source control
- It appeared in logs, screenshots, CI output, or issue comments
- A team member with access leaves the project
- You suspect unauthorized access
- The provider notifies you of a breach

### 4.2 Rotation Procedure

**Gemini API Key:**

1. Generate a new key in [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Update the deployment environment variable.
3. Revoke the old key in Google AI Studio.
4. Redeploy the application.
5. Run `node scripts/verify-client-secrets.mjs` to confirm no leakage.

**JWT_SECRET / JWT_REFRESH_SECRET:**

1. Generate new secrets using `openssl rand -hex 48`.
2. Update the deployment environment variable.
3. Redeploy. All existing sessions will be invalidated (users must re-login).

**MongoDB URI:**

1. Change the database password in MongoDB Atlas (or your provider).
2. Update the `MONGODB_URI` in your deployment.
3. Redeploy.

**Firebase Service Account:**

1. Generate a new service account key in the Firebase Console.
2. Update `FIREBASE_SERVICE_ACCOUNT_BASE64` in your deployment.
3. Delete the old key from Firebase Console.
4. Redeploy.

**Cloudinary / SMTP / Redis:**

Follow the same pattern: generate new credential → update deployment → revoke
old credential → redeploy.

### 4.3 Automation

For teams with many deployments, automate rotation using:

- **Vault** (HashiCorp) or **AWS Secrets Manager** for centralized secret storage
- **CI/CD pipeline steps** that fetch secrets at deploy time (never at build time
  when possible)
- **Scheduled rotation jobs** that generate and deploy new secrets on a cadence

---

## 5. CI/CD Secrets

### 5.1 GitHub Actions

Store secrets in **Settings → Secrets and variables → Actions**.

Reference them in workflow files:

```yaml
env:
  MONGODB_URI: ${{ secrets.MONGODB_URI }}
  GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

**Never** echo or log secret values in CI steps:

```yaml
# ❌ BAD — leaks secret to CI logs
- run: echo "Key is $GEMINI_API_KEY"

# ✅ GOOD — verify existence without revealing value
- run: test -n "$GEMINI_API_KEY" || (echo "GEMINI_API_KEY not set" && exit 1)
```

### 5.2 Pre-Commit Hooks

The `.githooks/` directory includes pre-commit hooks that run:

- `tsc --noEmit` (type checking)
- Client secret boundary verification

These prevent accidental commits of TypeScript errors and leaked secrets.

### 5.3 Build-Time Secret Verification

```bash
node scripts/verify-client-secrets.mjs
```

This scans the production bundle for:
- `GEMINI_API_KEY`
- The configured Gemini key value
- `generativelanguage.googleapis.com`
- Browser-bundled Gemini SDK references

The build **fails** if any of these are found in client-facing assets.

---

## 6. Cloud Deployment

### 6.1 Render (Backend)

Set environment variables in **Render Dashboard → Environment**:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `GEMINI_API_KEY` | Google AI Studio key |
| `JWT_SECRET` | Random hex string |
| `FRONTEND_URL` | Your Vercel frontend URL |

See [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md) for full
deployment instructions.

### 6.2 Vercel (Frontend)

Set environment variables in **Vercel Dashboard → Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `VITE_API_URL` | Backend URL (e.g., `https://yuvahub-backend.onrender.com`) |
| `VITE_FIREBASE_*` | Firebase project config (public values) |

After changing environment variables, you must **redeploy** for changes to take
effect.

### 6.3 Docker / Kubernetes

Use Docker secrets or Kubernetes Secrets — never bake secrets into images:

```yaml
# Docker Compose
services:
  api:
    secrets:
      - mongodb_uri
      - gemini_api_key

secrets:
  mongodb_uri:
    file: ./secrets/mongodb_uri.txt
  gemini_api_key:
    file: ./secrets/gemini_api_key.txt
```

```yaml
# Kubernetes
apiVersion: v1
kind: Secret
metadata:
  name: yuvahub-secrets
type: Opaque
stringData:
  MONGODB_URI: "mongodb+srv://..."
  GEMINI_API_KEY: "AIza..."
```

### 6.4 Firebase Cloud Functions

```bash
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set JWT_SECRET
```

Access in functions via `defineSecret`:

```ts
import { defineSecret } from "firebase-functions/params";

const geminiKey = defineSecret("GEMINI_API_KEY");
```

---

## 7. What NOT to Do

| ❌ Anti-pattern | ✅ Correct approach |
|---|---|
| Commit `.env` to Git | Use `.env.example` (committed) + `.env` (gitignored) |
| Use `VITE_` prefix for server secrets | Keep server-only secrets without `VITE_` prefix |
| Hardcode secrets in source | Read from `process.env` |
| Log secrets in CI output | Verify existence without revealing value |
| Share secrets in issue comments or PRs | Use platform secret managers |
| Use `password` or `changeme` as secrets | Generate with `openssl rand -hex 48` |
| Store production secrets locally | Use Render/Vercel/Firebase secret managers |
| Rotate secrets only "when convenient" | Rotate immediately on suspected exposure |

---

## 8. Quick Reference

| Task | Command / Location |
|---|---|
| Generate a secret | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| Verify client secrets | `node scripts/verify-client-secrets.mjs` |
| Check env validation | `npm run dev` (prints missing vars on startup) |
| Skip validation (tests only) | `SKIP_ENV_VALIDATION=true npm run dev` |
| Run security boundary test | `npm run test:client-secrets` |
| See all env vars | [docs/ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) |
| Security threat model | [docs/SECURITY_THREAT_MODEL.md](./SECURITY_THREAT_MODEL.md) |
| Gemini key security | [docs/GEMINI_KEY_SECURITY.md](./GEMINI_KEY_SECURITY.md) |

---

## 9. Reporting Security Issues

If you discover a vulnerability, **do not open a public GitHub issue**. Instead,
contact the maintainers directly:

- **Email:** [uditt490@gmail.com](mailto:uditt490@gmail.com)
- **GitHub:** [uditt490-pixel](https://github.com/uditt490-pixel)

Include a description, reproduction steps, potential impact, and your contact
information. See [SECURITY_THREAT_MODEL.md](./SECURITY_THREAT_MODEL.md) §4 for
the full disclosure policy.
