# Issue #392 — adapter reliability

## Repository mapping

The issue refers to older files named `baseAdapter.ts`,
`internshalaAdapter.ts`, `linkedinAdapter.ts`, and `unstopAdapter.ts`.

The current repository implements opportunity adapters under:

```text
src/services/dnl/adapters/
src/services/dnl/scheduler.ts
```

This patch applies the issue's reliability requirements to the current
architecture.

## Behaviour

Each run now returns a structured result containing:

- source
- success/status
- processed/inserted/duplicate/failure counts
- duration
- safe structured failure details

Failures include a source, stage, code, retryability flag, timestamp and
sanitised message.

## Silent circuit-breaker failure fixed

Previously the breaker fallback returned an empty JSON array. The dispatcher
could then report a healthy run with zero payloads even though the fetch had
failed.

The fallback now carries an explicit failure marker. It is recorded as:

```text
FETCH_FAILED / fetch / retryable=true
```

## Isolation

`runAdapters()` executes all supplied adapters and returns a batch summary.
A failed adapter produces a failure result but does not reject or stop the
other adapter runs.

## Validation

```powershell
npx vitest run tests/adapter-reliability.test.ts
npm run lint
npm run build
```
