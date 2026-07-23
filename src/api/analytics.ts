import { dbCommand } from "./db.js";

export class AnalyticsBuffer {
  private buffer: any[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;
  private isFlushing = false;
  private _isShuttingDown = false;
  private overflowWarned = false;

  /**
   * @param intervalMs  How often to auto-flush (default 5000ms)
   * @param maxBufferSize  Maximum events kept in memory before auto-flush / drop (default 10,000)
   */
  constructor(
    private intervalMs: number = 5000,
    private maxBufferSize: number = 10_000,
  ) {
    this.startInterval();
  }

  /** True once drainAndStop() has been called — new pushes are silently dropped. */
  get isShuttingDown(): boolean {
    return this._isShuttingDown;
  }

  /** Current buffer size (exposed for health checks). */
  get size(): number {
    return this.buffer.length;
  }

  /** Max allowed buffer size (exposed for health checks). */
  get capacity(): number {
    return this.maxBufferSize;
  }

  // ── Public API ──────────────────────────────────────────────────────

  public push(event: any) {
    // 1. Reject new events during shutdown drain
    if (this._isShuttingDown) {
      console.warn("[AnalyticsBuffer] Dropping event — buffer is shutting down.");
      return;
    }

    if (!event) return;

    // 2. Append event(s)
    if (Array.isArray(event)) {
      this.buffer.push(...event);
    } else {
      this.buffer.push(event);
    }

    // 3. Auto-flush if we've exceeded capacity *or* are near capacity and
    //    not currently flushing (avoid stacking flushes).
    if (this.buffer.length >= this.maxBufferSize && !this.isFlushing) {
      this.flush().catch((err) =>
        console.error("[AnalyticsBuffer] Overflow-triggered flush error:", err),
      );
    }

    // 4. If still over capacity after flush, drop oldest events
    if (this.buffer.length > this.maxBufferSize) {
      const excess = this.buffer.length - this.maxBufferSize;
      this.buffer.splice(0, excess);
      if (!this.overflowWarned) {
        console.warn(
          `[AnalyticsBuffer] Dropped ${excess} oldest event(s) — buffer at capacity (${this.maxBufferSize}).`,
        );
        this.overflowWarned = true;
      }
    } else {
      this.overflowWarned = false; // reset warning when under capacity
    }
  }

  /**
   * Drain all buffered events and stop the flush interval.
   * New pushes after this call are silently dropped.
   * Call once during graceful shutdown.
   */
  public async drainAndStop(): Promise<void> {
    this._isShuttingDown = true;
    this.stopInterval();
    await this.flush();
  }

  // ── Internal ────────────────────────────────────────────────────────

  private startInterval() {
    this.flushInterval = setInterval(() => {
      this.flush().catch((err) =>
        console.error("[AnalyticsBuffer] Auto-flush error:", err),
      );
    }, this.intervalMs);
    // Allow process to exit even if the timer is still active
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- timer may be object (Node) or number (browser)
    if (this.flushInterval && typeof this.flushInterval === "object" && "unref" in this.flushInterval) {
      (this.flushInterval as any).unref();
    }
  }

  private stopInterval() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  public async flush() {
    if (this.buffer.length === 0 || this.isFlushing) {
      return;
    }

    this.isFlushing = true;
    const batch = [...this.buffer];
    this.buffer = [];

    try {
      if (dbCommand) {
        const collection = dbCommand.collection("analytics");
        const bulk = collection.initializeUnorderedBulkOp();
        for (const doc of batch) {
          bulk.insert(doc);
        }
        await bulk.execute();
        console.log(`[AnalyticsBuffer] Flushed ${batch.length} events to MongoDB.`);
      } else {
        // DB not ready — re-queue, but only up to maxBufferSize to prevent unbounded growth
        const spaceRemaining = this.maxBufferSize - this.buffer.length;
        if (spaceRemaining > 0) {
          const reQueue = batch.slice(Math.max(0, batch.length - spaceRemaining));
          this.buffer.unshift(...reQueue);
          const dropped = batch.length - reQueue.length;
          if (dropped > 0) {
            console.warn(`[AnalyticsBuffer] DB not ready. Re-queued ${reQueue.length}, dropped ${dropped} oldest event(s).`);
          } else {
            console.warn(`[AnalyticsBuffer] DB not ready. Re-queued ${batch.length} events.`);
          }
        } else {
          console.warn(`[AnalyticsBuffer] DB not ready. Dropped ${batch.length} events (buffer full).`);
        }
      }
    } catch (err) {
      console.error("[AnalyticsBuffer] Error flushing batch:", err);
      // Re-queue with capacity check
      const spaceRemaining = this.maxBufferSize - this.buffer.length;
      if (spaceRemaining > 0) {
        const reQueue = batch.slice(Math.max(0, batch.length - spaceRemaining));
        this.buffer.unshift(...reQueue);
      } else {
        console.warn(`[AnalyticsBuffer] Error flush: dropped ${batch.length} events (buffer full).`);
      }
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Legacy stop() method — kept for backward compatibility.
   * Prefer drainAndStop() for graceful shutdown.
   */
  public stop() {
    this.stopInterval();
  }
}

export const analyticsBuffer = new AnalyticsBuffer(5000);
