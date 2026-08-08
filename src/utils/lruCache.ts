/**
 * Configurable Least Recently Used (LRU) Cache with Time-To-Live (TTL) Support
 * Solves Issue #593: Prevents unbounded memory growth for AI responses.
 */

export interface LRUCacheOptions {
  maxSize?: number;
  defaultTtlMs?: number;
}

export interface CacheEntry<V> {
  value: V;
  expiresAt: number;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  evictions: number;
}

export class LRUCache<K = string, V = any> {
  private cache: Map<K, CacheEntry<V>>;
  private maxSize: number;
  private defaultTtlMs: number;
  private hits: number = 0;
  private misses: number = 0;
  private evictions: number = 0;

  constructor(options: LRUCacheOptions = {}) {
    this.maxSize = options.maxSize && options.maxSize > 0 ? options.maxSize : 100;
    this.defaultTtlMs = options.defaultTtlMs && options.defaultTtlMs > 0 ? options.defaultTtlMs : 3600000; // 1 hour default
    this.cache = new Map();
  }

  public get(key: K): V | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Refresh LRU order (re-inserting moves key to the end of Map order)
    this.cache.delete(key);
    this.cache.set(key, entry);

    this.hits++;
    return entry.value;
  }

  public set(key: K, value: V, ttlMs?: number): void {
    const ttl = ttlMs !== undefined && ttlMs > 0 ? ttlMs : this.defaultTtlMs;
    const expiresAt = Date.now() + ttl;

    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Evict least recently used (the first key in Map iteration)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
        this.evictions++;
      }
    }

    this.cache.set(key, { value, expiresAt });
  }

  public has(key: K): boolean {
    return this.get(key) !== null;
  }

  public delete(key: K): boolean {
    return this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  public get size(): number {
    this.evictExpired();
    return this.cache.size;
  }

  public getStats(): CacheStats {
    this.evictExpired();
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
    };
  }

  public evictExpired(): number {
    let evictedCount = 0;
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        evictedCount++;
      }
    }
    return evictedCount;
  }

  public setMaxSize(newMax: number): void {
    if (newMax > 0) {
      this.maxSize = newMax;
      while (this.cache.size > this.maxSize) {
        const oldestKey = this.cache.keys().next().value;
        if (oldestKey !== undefined) {
          this.cache.delete(oldestKey);
          this.evictions++;
        }
      }
    }
  }

  public setDefaultTtl(newTtlMs: number): void {
    if (newTtlMs > 0) {
      this.defaultTtlMs = newTtlMs;
    }
  }
}
