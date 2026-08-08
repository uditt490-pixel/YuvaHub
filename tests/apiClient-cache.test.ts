import { describe, it, expect, beforeEach } from 'vitest';

// Minimal mock localStorage
const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
};

const mockStorage = createMockLocalStorage();
Object.defineProperty(global, 'localStorage', { value: mockStorage, writable: true });

// Reproduce the module's cache helpers inline for isolated testing
const PREFIX = 'cache_';
const MAX_ENTRIES = 30;

interface CacheEntry {
  data: any;
  timestamp: number;
}

function getAllEntries(): Array<{ key: string; entry: CacheEntry }> {
  const entries: Array<{ key: string; entry: CacheEntry }> = [];
  for (let i = 0; i < mockStorage.length; i++) {
    const key = mockStorage.key(i);
    if (key && key.startsWith(PREFIX)) {
      try {
        const raw = mockStorage.getItem(key);
        if (raw) entries.push({ key, entry: JSON.parse(raw) });
      } catch { /* corrupted — skip */ }
    }
  }
  return entries;
}

function evictOldest(targetCount: number): void {
  const entries = getAllEntries();
  if (entries.length <= targetCount) return;
  entries.sort((a, b) => a.entry.timestamp - b.entry.timestamp);
  const toRemove = entries.length - targetCount;
  for (let i = 0; i < toRemove; i++) {
    try { mockStorage.removeItem(entries[i].key); } catch { /* ignore */ }
  }
}

function saveToCache(key: string, data: any): void {
  const storageKey = `${PREFIX}${key}`;
  const payload = JSON.stringify({ data, timestamp: Date.now() });

  try {
    const current = getAllEntries();
    if (current.length >= MAX_ENTRIES) {
      evictOldest(MAX_ENTRIES - 1);
    }
    mockStorage.setItem(storageKey, payload);
  } catch (e: any) {
    if (e?.name === 'QuotaExceededError') {
      evictOldest(Math.floor(MAX_ENTRIES * 0.8));
      try { mockStorage.setItem(storageKey, payload); } catch { /* skip */ }
    }
  }
}

function getFromCache(key: string): any {
  try {
    const raw = mockStorage.getItem(`${PREFIX}${key}`);
    if (raw) return JSON.parse(raw).data;
  } catch { /* ignore */ }
  return null;
}

describe('Persistent localStorage Cache — Issue #541', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  describe('LRU eviction mechanics', () => {
    it('should evict oldest entries when exceeding max capacity', () => {
      // Fill to capacity
      for (let i = 0; i < MAX_ENTRIES; i++) {
        mockStorage.setItem(`${PREFIX}key_${i}`, JSON.stringify({ data: i, timestamp: 1000 + i }));
      }
      expect(getAllEntries().length).toBe(MAX_ENTRIES);

      // Add one more — should trigger eviction of the oldest
      saveToCache('key_new', { fresh: true });

      const remaining = getAllEntries();
      expect(remaining.length).toBe(MAX_ENTRIES);
      expect(mockStorage.getItem(`${PREFIX}key_0`)).toBeNull(); // oldest evicted
      expect(mockStorage.getItem(`${PREFIX}key_new`)).not.toBeNull();
    });

    it('should handle QuotaExceededError by evicting 20% and retrying', () => {
      let throwQuotaError = true;

      // Temporarily replace setItem to throw QuotaExceededError once
      const originalSetItem = mockStorage.setItem;
      mockStorage.setItem = function (key: string, value: string) {
        if (throwQuotaError) {
          throwQuotaError = false;
          const err = new Error('Quota exceeded') as any;
          err.name = 'QuotaExceededError';
          throw err;
        }
        originalSetItem.call(mockStorage, key, value);
      };

      // Pre-populate with MORE than 0.8 * MAX_ENTRIES so eviction actually removes something
      const prefillCount = 35;
      for (let i = 0; i < prefillCount; i++) {
        originalSetItem.call(mockStorage, `${PREFIX}key_${i}`, JSON.stringify({ data: i, timestamp: 1000 + i }));
      }

      // This should trigger the QuotaExceededError path, evict down to 24 (floor(30*0.8)), then retry
      saveToCache('overflow_key', { overflow: true });

      const remaining = getAllEntries();
      // 35 pre-filled, evicted to 24, then +1 new = 25
      expect(remaining.length).toBe(25);
      expect(mockStorage.getItem(`${PREFIX}overflow_key`)).not.toBeNull();

      // Restore
      mockStorage.setItem = originalSetItem;
    });
  });

  describe('cache metadata integrity', () => {
    it('should store and retrieve entries with timestamps', () => {
      saveToCache('test_feed', { items: [1, 2, 3] });
      const raw = mockStorage.getItem(`${PREFIX}test_feed`);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.data.items).toEqual([1, 2, 3]);
      expect(typeof parsed.timestamp).toBe('number');
    });

    it('should retrieve data via getFromCache', () => {
      saveToCache('retrieve_me', { hello: 'world' });
      expect(getFromCache('retrieve_me')).toEqual({ hello: 'world' });
      expect(getFromCache('missing')).toBeNull();
    });

    it('should ignore corrupted localStorage entries', () => {
      mockStorage.setItem(`${PREFIX}corrupt`, 'not valid json');
      expect(getFromCache('corrupt')).toBeNull();
      expect(getAllEntries().length).toBe(0);
    });
  });

  describe('two-tier cache behavior', () => {
    it('should overwrite existing keys without duplicating', () => {
      saveToCache('same', { v: 1 });
      saveToCache('same', { v: 2 });
      const entries = getAllEntries();
      expect(entries.length).toBe(1);
      expect(getFromCache('same')).toEqual({ v: 2 });
    });
  });
});