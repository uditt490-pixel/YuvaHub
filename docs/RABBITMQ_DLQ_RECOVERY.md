# RabbitMQ Dead Letter Queue (DLQ) Topology & Recovery Workflow

This document details the configuration, inspection, and recovery procedures for YuvaHub's RabbitMQ Dead Letter Queue (DLQ) topology (`#604`).

---

## 1. Topology Overview

YuvaHub uses a 3-tier exchange & queue topology to handle domain event distribution, exponential backoff retries, and dead-lettering for failed events:

| Exchange | Type | Purpose |
| :--- | :--- | :--- |
| `domain_events` | `topic` | Primary exchange for publishing and consuming active domain events. |
| `domain_events_retry` | `topic` | Retry exchange handling message delay via per-message expiration. |
| `domain_events_dlx` | `topic` | Dead Letter Exchange (DLX) receiving unprocessable/failed messages after retries are exhausted. |

---

## 2. Message Failure & Routing Lifecycle

```
[Publisher] ---> domain_events ---> [Main Queue: <queue_name>]
                                            |
                                  (Handler Throws Error)
                                            |
                                   (Retry Count < 3) ?
                                   /                 \
                                (Yes)               (No: Max Retries Exceeded)
                                 /                     \
                   domain_events_retry                  Attach Metadata:
                           |                            - x-death-reason
                     (Expiration TTL)                   - x-death-timestamp
                           |                            - x-original-queue
                    domain_events                       - x-original-routing-key
                           |                                   |
                  [Main Queue: <queue_name>]            domain_events_dlx
                                                               |
                                                   [DLQ: <queue_name>.dlq]
```

1. **Main Processing**:
   - Messages arrive on `domain_events` and are routed to `<queue_name>`.
2. **Exponential Backoff Retry**:
   - If processing fails, the event is re-published to `domain_events_retry` with `x-retry-count = retries + 1` and exponential expiration TTL (`5s`, `10s`, `20s`).
3. **Dead-Lettering**:
   - When `x-retry-count >= 3`, retries are exhausted. `EventBus` attaches death diagnostic headers (`x-death-reason`, `x-death-timestamp`, `x-original-queue`, `x-original-routing-key`) and issues `nack(msg, false, false)`.
   - RabbitMQ routes the dead-lettered message through `domain_events_dlx` into `<queue_name>.dlq`.

---

## 3. DLQ Monitoring & Inspection Procedures

### A. View DLQ Statistics
To view queue lengths and message counts for all registered Dead Letter Queues:

- **Admin API**: `GET /api/admin/dlq/stats`
- **Programmatic**:
  ```ts
  import { eventBus } from "./events/eventBus.js";

  const allStats = await eventBus.getAllDlqStats();
  console.log(allStats);
  // Returns: [{ queueName: "notification_queue", dlqName: "notification_queue.dlq", messageCount: 2, consumerCount: 0, routingKey: "notification.send" }]
  ```

### B. Inspect Failed Messages
Peeking messages from a DLQ allows inspecting failure details without destroying or removing messages from the queue:

- **Admin API**: `GET /api/admin/dlq/inspect/:queueName?limit=10`
- **Programmatic**:
  ```ts
const messages = await eventBus.inspectDlq("notification_queue", 10);
// Returns: [{ payload: {...}, headers: { "x-death-reason": "...", "x-death-timestamp": "..." }, routingKey: "..." }]

### C. Proactive Alerts
Whenever a message exhausts its retries and is routed to a DLQ, `EventBus` immediately triggers an admin email alert via the existing `sendAdminAlert` helper (the same one used for background job failures). No manual polling is required to learn that a message failed permanently — admins configured in `ADMIN_EMAILS` receive a notification with the queue name, routing key, and retry count.

---
---

## 4. Replay & Recovery Workflow

Once the root cause of a downstream failure (e.g. database outage, third-party API rate limit, invalid config) has been resolved:

### Replaying Dead-Lettered Messages
Replaying reads messages from `<queue_name>.dlq`, clears dead-letter & retry counter headers (`x-retry-count`, `x-death-reason`), and re-publishes them to `domain_events` under the original routing key:

- **Admin API**: `POST /api/admin/dlq/replay/:queueName?maxMessages=100`
- **Programmatic**:
  ```ts
  const replayedCount = await eventBus.replayDlq("notification_queue", 100);
  console.log(`Successfully replayed ${replayedCount} messages to main exchange`);
  ```

### Purging Unrecoverable Messages
If dead-lettered messages are corrupt or unrecoverable, clear them from the DLQ:

- **Admin API**: `DELETE /api/admin/dlq/purge/:queueName`
- **Programmatic**:
  ```ts
  const purgedCount = await eventBus.purgeDlq("notification_queue");
  console.log(`Purged ${purgedCount} dead-lettered messages.`);
  ```

---

## 5. Summary of Admin Endpoints

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/admin/dlq/stats` | `GET` | Admin | Get message counts for all active Dead Letter Queues |
| `/api/admin/dlq/inspect/:queueName` | `GET` | Admin | Peek payload and failure headers of dead-lettered messages |
| `/api/admin/dlq/replay/:queueName` | `POST` | Admin | Replay DLQ messages back to main exchange for reprocessing |
| `/api/admin/dlq/purge/:queueName` | `DELETE` | Admin | Purge dead-lettered messages from DLQ |
