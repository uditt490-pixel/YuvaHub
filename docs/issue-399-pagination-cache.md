# Issue #399: pagination, payload limits, and Redis TTL

## Scope implemented

- Shared `parsePagination` utility
- Shared `buildPaginationMetadata` utility
- Safe positive integer parsing
- Maximum page-size enforcement
- Backward-compatible cursor handling
- Standard response metadata
- Five-minute Redis cache default
- Explicit Redis TTL overrides
- Cache-aside `getOrSet`
- 5 MB JSON body limit
- 5 MB URL-encoded body limit
- Unit tests for pagination and TTL behaviour

## Architecture note

The issue names `src/api/db.ts` as the place where request query values are
used. In the current repository, `db.ts` only owns database initialisation,
MockDB support, reconnection, and indexes. Express query parsing occurs in API
controllers. The patch therefore parses pagination in
`opportunityController.ts`, before values reach the database/search layer.

This keeps the database module independent of Express and prevents unsafe
request values from reaching `.skip()`, `.limit()`, or Meilisearch.

## Response compatibility

The opportunities response retains the legacy fields:

```json
{
  "items": [],
  "num_results": 0,
  "next_page": null,
  "next_cursor": null
}
```

It also adds:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

This avoids breaking the existing frontend while introducing a consistent
contract for new clients.

## Manual API checks

```powershell
Invoke-RestMethod "http://localhost:5000/api/opportunities?page=2&limit=5" |
  ConvertTo-Json -Depth 10
```

Oversized limit:

```powershell
Invoke-RestMethod "http://localhost:5000/api/opportunities?page=1&limit=9999" |
  ConvertTo-Json -Depth 10
```

Expected effective limit: `100`.

Invalid values:

```powershell
Invoke-RestMethod "http://localhost:5000/api/opportunities?page=-3&limit=abc" |
  ConvertTo-Json -Depth 10
```

Expected effective page and limit: `1` and `10`.

Cursor compatibility:

```powershell
Invoke-RestMethod "http://localhost:5000/api/opportunities?cursor=3&limit=10" |
  ConvertTo-Json -Depth 10
```

Expected effective page: `3`.

## Payload-limit check

Create a payload larger than 5 MB:

```powershell
$largeBody = @{
  content = "a" * (6 * 1024 * 1024)
} | ConvertTo-Json

try {
  Invoke-WebRequest `
    -Method Post `
    -Uri "http://localhost:5000/api/opportunities" `
    -ContentType "application/json" `
    -Body $largeBody
} catch {
  $_.Exception.Response.StatusCode.value__
}
```

Expected status: `413`.

## Redis verification

With Redis running:

```powershell
redis-cli TTL opportunity:test
```

A cache entry written without an explicit TTL should report a value at or below
`300` seconds and above `0`.

## Required validation

```powershell
npm run lint
npx vitest run tests/pagination.test.ts tests/cache-ttl.test.ts
npm run build
```
