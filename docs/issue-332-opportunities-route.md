# `/api/v1/opportunities` compatibility route

## Route architecture

YuvaHub mounts its modular API router at `/api`.

Inside the modular router, the same route collection is mounted at:

```text
/v1
/
```

Therefore, the opportunity controller is available through both:

```http
GET /api/v1/opportunities
GET /api/opportunities
```

Both paths use the same controller. No query logic is duplicated.

## Response contract

The response contains the normalized API contract:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

Legacy fields remain available:

```json
{
  "items": [],
  "num_results": 0,
  "next_page": null,
  "next_cursor": null
}
```

This preserves existing frontend and API consumers.

## Supported parameters

```text
page
limit
cursor
skills
country
field
type
source
location
search
q
status
```

`cursor` remains a page alias for backward compatibility.

`limit` has a maximum of 100.

Malformed values return a controlled `400` response rather than reaching
MongoDB or Meilisearch.

## Test commands

```powershell
npx vitest run `
  tests/opportunity-list-query.test.ts `
  tests/opportunities-route-contract.test.ts

npm run lint
npm run build
```

## Manual checks

```powershell
Invoke-RestMethod `
  "http://localhost:5000/api/v1/opportunities?page=1&limit=20" |
ConvertTo-Json -Depth 15
```

Legacy alias:

```powershell
Invoke-RestMethod `
  "http://localhost:5000/api/opportunities?page=1&limit=20" |
ConvertTo-Json -Depth 15
```

Invalid query:

```powershell
try {
  Invoke-RestMethod `
    "http://localhost:5000/api/v1/opportunities?page=abc&limit=500"
} catch {
  $_.Exception.Response.StatusCode.value__
  $_.ErrorDetails.Message
}
```

Expected status: `400`.
