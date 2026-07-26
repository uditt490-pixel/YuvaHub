# Gemini API key security boundary

## Security rule

`GEMINI_API_KEY` is a server-only secret.

It may be read by:

- Express API controllers and `src/api/genai.ts`
- Server-side services
- Background workers
- Local server-side test utilities

It must never be read by:

- React components
- Browser hooks or contexts
- Vite `define`
- Any variable prefixed with `VITE_`
- Direct browser requests to Google Gemini endpoints

## Client flow

Browser AI features call the backend:

```text
React UI
  -> POST /api/v1/ai/generate
  -> Express AI controller
  -> src/api/genai.ts
  -> Google Gemini
```

The browser receives only the generated response. It never receives the
provider credential.

## Automated protection

The security-boundary test checks:

- Vite does not define or inject `GEMINI_API_KEY`
- Browser AI helpers use `/api/v1/ai/generate`
- Browser modules do not import Gemini SDK packages
- Browser modules do not call Google's Generative Language endpoint directly

The production build additionally runs:

```bash
node scripts/verify-client-secrets.mjs
```

This scans generated client HTML, JavaScript, CSS, JSON and source maps before
the server bundle is created. The build fails if it finds:

- `GEMINI_API_KEY`
- The configured Gemini key value
- `generativelanguage.googleapis.com`
- Browser-bundled Gemini SDK references

## Required response to previous exposure

Removing the key from source does not revoke a previously exposed credential.

A repository or deployment maintainer must:

1. Revoke or rotate the old Gemini key in Google AI Studio or Google Cloud.
2. Store the replacement only in the backend deployment environment.
3. Remove any `VITE_GEMINI_*` variables.
4. Rebuild and redeploy.
5. Run the bundle verification command.
6. Review provider usage and billing for unexpected activity.

Never paste the real key into test logs, screenshots, issues or pull requests.
