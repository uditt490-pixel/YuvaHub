# Background Worker (BullMQ) Operational Runbook

This runbook documents how the Express API server enqueues jobs and how BullMQ
worker processes consume them, plus debugging and safe-restart procedures.

---

## 1. Producer vs. Consumer

| Role | Responsibility | Implementation |
|------|---------------|----------------|
| **Producer** | A controller or service enqueues a job and returns a job ID immediately — it does **not** wait for the job to finish. | `src/api/controllers/*.ts`, `src/api/services/*.ts`, `src/queues/*Queue.ts` |
| **Consumer** | A long-lived Node.js process subscribes to one or more BullMQ queues, pulls jobs off the list, executes the processor, and updates job state. | `src/worker.ts`, processors in `src/workers/*.ts` |

The **API server** (`server.ts`) is the producer. When Redis is down, each queue
module falls back to an in-memory array/timer or synchronous execution (see
`isRedisReady()` in `src/queues/connection.ts`). Fallback jobs are invisible to
the worker process.

The **worker process** (`npm run start:worker` → `tsx src/worker.ts`) is the
consumer. It instantiates every worker module via `new Worker(queueName, processor, options)`
and registers `SIGINT`/`SIGTERM` → `shutdown()` for graceful close.

## 2. Data Flow

```
HTTP Request
  │
  ▼
Express API (server.ts)        Worker process (src/worker.ts)
  │                              │
  │ enqueueEmail() / addJob()   │
  ├─► isRedisReady()? ── Yes ─► Redis ◄──┤  (polls same queue)
  │                            │
  │ ── No ─► in-memory fallback │
  │                            │
  │ returns jobId              ├─► processor(job) runs
  │ (non-blocking)             ├─► "completed" on success
  │                            ├─► "failed" on throw → retry
  │                            └─► after max attempts → stays "failed"
```

## 3. Environment Configuration

Redis is optional in local development. Setting `ENABLE_REDIS`, `REDIS_ENABLED`,
or `REQUIRE_REDIS` to `"true"` makes `REDIS_URL` mandatory.

| Variable | Default | Purpose |
|----------|---------|---------|
| `REDIS_URL` | `redis://127.0.0.1:6379` | Connection string for both API and worker. |
| `ENABLE_REDIS` / `REDIS_ENABLED` / `REQUIRE_REDIS` | `false` | Enables strict Redis validation, disables fallback. |

Local Docker: `docker compose up -d` (Redis on port 6379).

## 4. Active Queues Reference

| Redis name | Worker file | Concurrency | Retry / Backoff | Payload |
|-----------|-------------|-------------|-----------------|---------|
| `emailQueue` | `emailWorker.ts` | 1 | 3 / exp 1000ms | `{to, subject, body, html?}` |
| `scraper-jobs` | `scraperWorker.ts` | 5 / 1000ms | 5 / exp 60000ms | `{domain, url, type}` |
| `pushQueue` | `pushWorker.ts` | 1 | 3 / exp 1000ms | `{userId, message}` |
| `resume-parser` | `resumeWorker.ts` | 1 | 1 (no retry) | `{userId, resumeUrl}` |
| `application-processing` | `applicationWorker.ts` | 5 | 3 / exp 5000ms | `{userId, opportunityId, action: "generate_draft" \| "prepare_application" \| "send_application"}` |
| `agent-processing` | `applicationAgentWorker.ts` | 2 | 1 (no retry) | `{userId, jobUrl, action: "fill_application"}` |
| `mentorship-reminders` | `mentorshipWorker.ts` | 3 | 3 / exp 5000ms | `{jobType: "session_reminder" \| "feedback_request", sessionId, mentorUid, studentUid}` |
| `mock-interview-matchmaking` | `mockInterviewWorker.ts` | 5 | 3 / exp 5000ms | `{userId, targetRole, action: "join_queue" \| "leave_queue" \| "match_make"}` |

## 5. Retry & Backoff Strategies

| Queue | Attempts | Backoff | Notes |
|-------|----------|---------|-------|
| `emailQueue` | 3 | exp 1000ms | SMTP errors throw → retry |
| `scraper-jobs` | 5 | exp 60000ms | External-source flakiness common |
| `pushQueue` | 3 | exp 1000ms | FCM 429/5xx triggers retry |
| `resume-parser` | 1 | — | No explicit retry |
| `application-processing` | 3 | exp 5000ms | |
| `agent-processing` | 1 | — | Intentional — Playwright state is complex |
| `mentorship-reminders` | 3 | exp 5000ms | |
| `mock-interview-matchmaking` | 3 | exp 5000ms | |

Exhausted jobs stay `failed`; the Worker's `"failed"` event handler logs them.
For `agent-processing` (1 attempt), a failed job needs manual re-enqueue via the
API endpoint that created it.

## 6. Starting Workers

Development:

```bash
npm run start:worker
```

Production (compiled):

```bash
npm run build
node dist/worker.cjs
```

`src/worker.ts` flow: (1) generate unique `workerId`, (2) initialise all standard
workers, (3) lazily init `agentWorker` via `initAgentWorker()` — skipped if Redis
is offline, (4) start 1-hour interval for `runSavedSearchMatcher()`, (5) register
`SIGINT`/`SIGTERM` → graceful `close()` on all workers.

## 7. Safely Restarting Workers

1. **Pause** the queue (optional but recommended during deploy):
   ```bash
   redis-cli -u "$REDIS_URL" BULLMQ:PAUSE scraper-jobs
   ```
2. **Send SIGTERM** and wait for drain:
   ```bash
   ps aux | grep "worker.ts"
   kill -TERM <PID>
   ```
   > **Never use `kill -9` (SIGKILL).** It leaves jobs marked `active` in Redis;
   > they become `stalled` and BullMQ auto re-queues them (~30–60 s after the
   > next worker start), risking duplicate processing.
3. **Confirm** shutdown logs show `Shutdown complete.`
4. **Restart**: `npm run start:worker &`
5. **Resume** the queue: `redis-cli -u "$REDIS_URL" BULLMQ:RESUME scraper-jobs`

On Render, the worker is a separate service — use the Render dashboard to
**Restart** it. Render sends `SIGTERM`, waits 10 s, then `SIGKILL`.

## 8. Debugging & Inspection

### Dashboard

**No Bull Board dashboard is configured.** The repo has `@bull-board/api` and
`@bull-board/express` as dependencies but they are not wired up. Use the Redis CLI
or programmatic BullMQ calls instead.

### Redis CLI

```bash
# List all queue keys
redis-cli -u "$REDIS_URL" KEYS 'bull:*'

# List waiting / active / delayed / failed jobs (replace <queueName> with Redis name from §4)
redis-cli -u "$REDIS_URL" LLEN 'bull:<queueName>:waiting'
redis-cli -u "$REDIS_URL" LLEN 'bull:<queueName>:active'
redis-cli -u "$REDIS_URL" ZRANGE 'bull:<queueName>:delayed' 0 -1
redis-cli -u "$REDIS_URL" LLEN 'bull:<queueName>:failed'
```

### Programmatic (BullMQ Node API)

```ts
import { Queue } from "bullmq";
const q = new Queue("scraper-jobs", { connection });
const counts = await q.getJobCounts();           // { waiting, active, failed, completed, ... }
const failed = await q.getJobs("failed", 0, 9);  // last 10 failed jobs
const job = await q.getJob("job-id-here");       // inspect specific job
await job.retry();                                // re-enqueue a failed job
```

### Flushing stalled / failed jobs

A job becomes `stalled` when a worker crashes (SIGKILL) while processing it.
BullMQ's visibility-timeout marks it stalled after ~30 s; on next worker start
stalled jobs move back to `waiting` and reprocess.

After retries are exhausted, jobs land in `failed`. Re-enqueue individually:

```bash
npx bullmq-cli -q scraper-jobs -c "$REDIS_URL" list failed
# then retry via programmatic API (see above) or the original API endpoint
```

**Purging all jobs** (⚠️ destructive — only when no legitimate work pending):

```ts
await q.obliterate();   // deletes waiting, active, completed, and failed
```

## 9. Common Failure Modes

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `Redis connection offline. Worker listening paused.` | Redis not running or `REDIS_URL` wrong | Start Redis (`docker compose up -d`) or fix env var |
| Jobs accumulate in `waiting` | Worker process not running | `npm run start:worker` — verify process alive |
| Job `failed` after exhausting retries | Processor threw a non-transient error | Check `stackTrace` via Redis/programmatic API; retry if transient |
| `agent-processing` jobs fail with `CAPTCHA_DETECTED` | Form has a CAPTCHA | Manual intervention (no auto-retry) |
| Scraper fails with `No opportunities extracted` | URL changed structure or is down | Verify URL; adapter may need updating |
| Jobs stuck in `active` after `kill -9` | Worker force-killed mid-processing | Restart worker — BullMQ re-queues after ~30 s |
