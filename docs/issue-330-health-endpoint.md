# YuvaHub health endpoint

## Endpoint

```http
GET /api/v1/health
```

The existing unversioned alias also remains available because the same router is
mounted at both `/api/v1` and `/api`:

```http
GET /api/health
```

## Healthy response

Status: `200 OK`

```json
{
  "status": "ok",
  "service": "YuvaHub API",
  "timestamp": "2026-07-23T12:00:00.000Z",
  "database": "connected",
  "uptimeSeconds": 42
}
```

## Degraded response

Status: `503 Service Unavailable`

```json
{
  "status": "degraded",
  "service": "YuvaHub API",
  "timestamp": "2026-07-23T12:00:00.000Z",
  "database": "disconnected",
  "uptimeSeconds": 42
}
```

MockDB/offline mode is intentionally reported as degraded because the essential
persistent database dependency is unavailable.

## Security

The response never exposes:

- MongoDB connection strings
- Environment variables
- Credentials
- Internal exception messages
- Stack traces

The endpoint sets:

```http
Cache-Control: no-store
Content-Type: application/json
```

## Manual checks

Healthy:

```powershell
Invoke-WebRequest `
  -Uri "http://localhost:5000/api/v1/health" |
Select-Object StatusCode, Headers, Content
```

Degraded/offline:

```powershell
try {
  Invoke-WebRequest `
    -Uri "http://localhost:5000/api/v1/health"
} catch {
  $_.Exception.Response.StatusCode.value__
  $_.ErrorDetails.Message
}
```

Expected status without live MongoDB: `503`.

## Tests

```powershell
npx vitest run `
  tests/health-service.test.ts `
  tests/health-route.test.ts

npm run lint
npm run build
```
