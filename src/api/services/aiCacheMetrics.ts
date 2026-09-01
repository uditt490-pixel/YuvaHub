/**
 * AI Cache Metrics Service (Issue #591)
 *
 * Tracks performance metrics for the in-memory AI response cache:
 * - Cache hits and misses
 * - Hit ratio (hits / total lookups)
 * - Current cache size (entry count)
 * - Evictions (expired entries detected during lookup)
 * - Approximate memory usage
 */

export interface CacheMetricsSnapshot {
  hits: number;
  misses: number;
  totalLookups: number;
  hitRatio: number;
  cacheSize: number;
  evictions: number;
  estimatedMemoryBytes: number;
  timestamp: string;
}

/**
 * Lightweight in-memory tracker for AI cache metrics.
 *
 * Designed to be instantiated once and shared across the cache helpers.
 * All methods are synchronous — no I/O or async required.
 */
export class AICacheMetrics {
  private _hits = 0;
  private _misses = 0;
  private _evictions = 0;
  private _startTime: number;

  constructor() {
    this._startTime = Date.now();
  }

  /** Record a cache hit. */
  recordHit(): void {
    this._hits++;
  }

  /** Record a cache miss. */
  recordMiss(): void {
    this._misses++;
  }

  /** Record an eviction (expired entry detected during lookup). */
  recordEviction(): void {
    this._evictions++;
  }

  /** Total number of cache lookups (hits + misses). */
  get totalLookups(): number {
    return this._hits + this._misses;
  }

  /** Hit ratio as a value between 0 and 1. Returns 0 if no lookups yet. */
  get hitRatio(): number {
    const total = this.totalLookups;
    return total === 0 ? 0 : this._hits / total;
  }

  /**
   * Take a snapshot of current metrics.
   *
   * @param cache - The underlying Map used for AI caching (to derive size and
   *   approximate memory usage).
   */
  snapshot(cache: Map<string, unknown>): CacheMetricsSnapshot {
    return {
      hits: this._hits,
      misses: this._misses,
      totalLookups: this.totalLookups,
      hitRatio: Math.round(this.hitRatio * 10000) / 10000, // 4 decimal places
      cacheSize: cache.size,
      evictions: this._evictions,
      estimatedMemoryBytes: this._estimateMemory(cache),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Reset all counters to zero. Useful for periodic roll-ups or testing.
   */
  reset(): void {
    this._hits = 0;
    this._misses = 0;
    this._evictions = 0;
    this._startTime = Date.now();
  }

  /**
   * Rough estimation of the cache's memory footprint in bytes.
   *
   * This uses a heuristic: each entry's key length + serialized value length
   * + a fixed per-entry overhead (8 bytes for Map bucket + 16 bytes for the
   * value wrapper object). It is not exact but gives a useful order-of-
   * magnitude indicator for dashboards.
   */
  private _estimateMemory(cache: Map<string, unknown>): number {
    const ENTRY_OVERHEAD = 24; // Map bucket + { data, timestamp } wrapper
    let bytes = 0;

    for (const [key, value] of cache) {
      bytes += key.length * 2; // JS strings are UTF-16
      bytes += ENTRY_OVERHEAD;

      // Approximate the serialized value size
      try {
        bytes += JSON.stringify(value).length * 2;
      } catch {
        // If value is not serializable, estimate 200 bytes
        bytes += 400;
      }
    }

    return bytes;
  }
}
