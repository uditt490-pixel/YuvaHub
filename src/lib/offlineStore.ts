/**
 * offlineStore.ts
 * IndexedDB store for offline-accessible Saved Opportunities.
 * Uses the `idb` library for typed, Promise-based access.
 *
 * DB: yuvahub-pwa
 * Store: bookmarks  (keyPath: 'id')
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'yuvahub-pwa';
const DB_VERSION = 1;
const STORE_NAME = 'bookmarks';

interface YuvaHubDB extends DBSchema {
  bookmarks: {
    key: string;
    value: Record<string, unknown>;
  };
}

let _db: IDBPDatabase<YuvaHubDB> | null = null;

async function getDB(): Promise<IDBPDatabase<YuvaHubDB>> {
  if (_db) return _db;
  _db = await openDB<YuvaHubDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
  return _db;
}

/**
 * Persist an array of opportunity objects to IndexedDB.
 * Normalises _id -> id so the keyPath always resolves.
 */
export async function saveBookmarksToIDB(items: Record<string, unknown>[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await Promise.all(
      items.map((item) => {
        const normalised = {
          ...item,
          id: String(item.id ?? item._id ?? ''),
        };
        return tx.store.put(normalised as Record<string, unknown>);
      }),
    );
    await tx.done;
  } catch (err) {
    // IDB failures must never crash the UI
    console.warn('[OfflineStore] Failed to save bookmarks to IDB:', err);
  }
}

/**
 * Retrieve all opportunity objects from IndexedDB.
 * Returns an empty array if IDB is unavailable or empty.
 */
export async function getBookmarksFromIDB(): Promise<Record<string, unknown>[]> {
  try {
    const db = await getDB();
    return await db.getAll(STORE_NAME);
  } catch (err) {
    console.warn('[OfflineStore] Failed to read bookmarks from IDB:', err);
    return [];
  }
}
