import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { CURATED_FALLBACKS } from "../services/staticFallbacks.js";
import { initializeDNLDatabase } from "../services/dnl/metrics.js";
import { DNLDispatcher } from "../services/dnl/scheduler.js";
import { DevpostAdapter } from "../services/dnl/adapters/DevpostAdapter.js";
import { InternshalaAdapter } from "../services/dnl/adapters/InternshalaAdapter.js";
import { initializeSearchSync } from "../services/searchSync.js";

dotenv.config();

const uri = process.env.MONGODB_URI || "";
const commandUri = process.env.MONGODB_COMMAND_URI || uri;
const queryUri = process.env.MONGODB_QUERY_URI || uri;
const dbName = process.env.MONGODB_DB_NAME || "yuvahub";

/** Interval (ms) between MongoDB reconnection attempts after fallback to MockDB. */
const RECONNECT_INTERVAL_MS = 30_000;

export let dbCommand: any = null;
export let dbQuery: any = null;

// ── Reconnection subsystem ──────────────────────────────────────────

type ReinitCallback = () => Promise<void>;
const reinitCallbacks: ReinitCallback[] = [];

let reconnectTimer: ReturnType<typeof setInterval> | null = null;
let activeDispatcher: DNLDispatcher | null = null;

/**
 * Register a callback that will be called every time the system
 * successfully reconnects to MongoDB (after having fallen back to MockDB).
 * Used by background services (DNL, SearchSync) to reinitialize with
 * the real database reference.
 */
export function onReconnect(callback: ReinitCallback): void {
  reinitCallbacks.push(callback);
}

/**
 * Try to create fresh MongoClient connections and replace the module-level
 * `dbCommand` / `dbQuery` variables. Returns `true` on success.
 */
async function attemptReconnect(): Promise<boolean> {
  const commandClient = new MongoClient(commandUri);
  const queryClient = new MongoClient(queryUri);

  try {
    await Promise.all([commandClient.connect(), queryClient.connect()]);

    const newCommandDb = commandClient.db(process.env.MONGODB_COMMAND_DB || dbName);
    const newQueryDb = queryClient.db(process.env.MONGODB_QUERY_DB || dbName);

    // Atomic swap — all live bindings (e.g. from server.ts) will see
    // the new instances on their next access.
    dbCommand = newCommandDb;
    dbQuery = newQueryDb;

    console.warn("[Database] Reconnected to MongoDB. Swapped from MockDB to live database.");

    // Notify dependent services (DNL, SearchSync, etc.)
    await Promise.allSettled(reinitCallbacks.map((cb) => cb()));

    // Stop the reconnection loop — we are back online.
    if (reconnectTimer !== null) {
      clearInterval(reconnectTimer);
      reconnectTimer = null;
    }

    return true;
  } catch (err) {
    console.error("[Database] Reconnection attempt failed:", (err as Error).message);
    return false;
  }
}

/**
 * Start an interval-based reconnection loop.
 * Safe to call multiple times — only one timer runs at a time.
 */
function startReconnectLoop(): void {
  if (reconnectTimer !== null) return;
  console.warn(
    `[Database] Starting reconnection loop (every ${RECONNECT_INTERVAL_MS / 1000}s)...`,
  );
  reconnectTimer = setInterval(() => {
    attemptReconnect();
  }, RECONNECT_INTERVAL_MS);
}

// ── MockDB (offline fallback) ───────────────────────────────────────

// VERY simple mock DB for offline fallback
export class MemoryCollection {
  data: any[];
  constructor(initialData: any[] = []) { this.data = initialData; }
  find(query: any = {}) {
    let result = this.data;
    for (const key in query) {
      if (key === 'id') {
        result = result.filter(r => r.id === query.id || r._id === query.id || r._id?.toString() === query.id);
      } else if (key === '_id') {
        result = result.filter(r => r.id === query._id.toString() || r._id?.toString() === query._id.toString() || r.id === query._id);
      } else if (key === '$text') {
        result = result.filter(r => JSON.stringify(r).toLowerCase().includes(query.$text.$search.toLowerCase()));
      } else if (key === '$or') {
        result = result.filter(r => {
          return query.$or.some((cond: any) => {
            for (let k in cond) {
              if (cond[k].$regex) {
                const regex = new RegExp(cond[k].$regex, cond[k].$options || "");
                if (regex.test(r[k])) return true;
              } else if (cond[k].$in) {
                if (cond[k].$in.some((val: any) => {
                  if (typeof val === 'object' && val.equals) return val.equals(r[k]);
                  if (typeof r[k] === 'object' && r[k].equals) return r[k].equals(val);
                  return r[k] === val || r[k]?.toString() === val?.toString();
                })) return true;
              } else {
                if (r[k] === cond[k]) return true;
              }
            }
            return false;
          });
        });
      } else {
        // Generic key-value match
        result = result.filter(r => r[key] === query[key]);
      }
    }

    const cursor = {
      sort: () => cursor,
      skip: (n: number) => { result = result.slice(n); return cursor; },
      limit: (n: number) => { result = result.slice(0, n); return cursor; },
      toArray: async () => result
    };
    return cursor;
  }
  async countDocuments(query: any = {}) {
    const res = await this.find(query).toArray();
    return res.length;
  }
  async findOne(query: any) {
    const res = await this.find(query).toArray();
    return res[0] || null;
  }
  async updateOne(query: any, update: any, options: any = {}) {
    const item = await this.findOne(query);
    if (item) {
      if (update.$set) {
        Object.assign(item, update.$set);
      }
      if (update.$addToSet) {
        for (const key in update.$addToSet) {
          if (!Array.isArray(item[key])) {
            item[key] = [];
          }
          const val = update.$addToSet[key];
          if (!item[key].includes(val)) {
            item[key].push(val);
          }
        }
      }
      if (update.$pull) {
        for (const key in update.$pull) {
          if (Array.isArray(item[key])) {
            const val = update.$pull[key];
            item[key] = item[key].filter((x: any) => x !== val);
          }
        }
      }
      return { modifiedCount: 1 };
    }
    if (options.upsert) {
      const doc = { ...query };
      if (update.$set) Object.assign(doc, update.$set);
      this.data.push(doc);
      return { upsertedCount: 1, upsertedId: "mock_upsert_id" };
    }
    return { modifiedCount: 0 };
  }
  async insertOne(doc: any) { this.data.push(doc); return { insertedId: "mock_id" }; }
  async deleteOne(query: any) {
    const initialLen = this.data.length;
    const item = await this.findOne(query);
    if (item) {
      this.data = this.data.filter(r => r !== item);
    }
    return { deletedCount: this.data.length < initialLen ? 1 : 0 };
  }
  async createIndex(keys: any, options: any) { return "mock_index"; }
  aggregate() { return { toArray: async () => [] }; }
  initializeUnorderedBulkOp() {
    const ops: any[] = [];
    return {
      insert: (doc: any) => {
        ops.push(doc);
      },
      execute: async () => {
        this.data.push(...ops);
        return { ok: 1, nInserted: ops.length };
      }
    };
  }
}

export class MockDB {
  isMock = true;
  collections: Record<string, MemoryCollection> = {
    opportunities: new MemoryCollection(CURATED_FALLBACKS.map(f => ({ ...f, created_at: new Date() }))),
    interactions: new MemoryCollection(),
    scraper_metrics: new MemoryCollection()
  };
  collection(name: string) { return this.collections[name] || (this.collections[name] = new MemoryCollection()); }
}

// ── DNL Scheduler setup ─────────────────────────────────────────────

function setupDNL(database: any) {
  initializeDNLDatabase(database).then(() => {
    // Stop any previously running dispatcher before creating a new one.
    if (activeDispatcher) {
      activeDispatcher.stop();
    }
    const dispatcher = new DNLDispatcher(database);
    dispatcher.registerAdapter(new DevpostAdapter());
    dispatcher.registerAdapter(new InternshalaAdapter());
    dispatcher.start(3600000); // 1 hour
    activeDispatcher = dispatcher;
    console.log("[DNL] Scheduler initialized and started.");
  }).catch(err => {
    console.error("[DNL] Setup failed:", err);
  });
}

// Reinitialisation callback for the DNL scheduler — registered once on module load.
onReconnect(async () => {
  console.log("[Database] Re-initializing DNL scheduler with live database...");
  setupDNL(dbCommand);
});

// Reinitialisation callback for Meilisearch search sync — registered once on module load.
onReconnect(async () => {
  console.log("[Database] Re-initializing SearchSync with live database...");
  initializeSearchSync(dbQuery).catch((err: any) =>
    console.error("[SearchSync] Non-fatal reinit error:", err),
  );
});

// ── Main initializer ────────────────────────────────────────────────

export async function initializeDatabase(): Promise<void> {
  if (commandUri && queryUri) {
    const commandClient = new MongoClient(commandUri);
    const queryClient = new MongoClient(queryUri);

    try {
      await Promise.all([commandClient.connect(), queryClient.connect()]);
      dbCommand = commandClient.db(process.env.MONGODB_COMMAND_DB || dbName);
      dbQuery = queryClient.db(process.env.MONGODB_QUERY_DB || dbName);
      console.log(`[Database] Connected to Command and Query MongoDB pools`);
      setupDNL(dbCommand);
      initializeSearchSync(dbQuery).catch(err => console.error('[SearchSync] Non-fatal init error:', err));

      dbCommand.collection("opportunities").createIndex({ created_at: -1, source_quality_score: -1 })
        .then(() => console.log(`[Database] Created compound index on opportunities`))
        .catch((err: any) => console.error(`[Database] Failed to create index:`, err));

      dbQuery.collection("users").createIndex({ uid: 1 }, { unique: true })
        .then(() => console.log(`[Database] Created unique index on users.uid`))
        .catch((err: any) => console.error(`[Database] Failed to create index on users.uid:`, err));
      dbCommand.collection("users").createIndex({ firebaseUid: 1 }, { unique: true, sparse: true })
        .then(() => console.log(`[Database] Created unique sparse index on users.firebaseUid`))
        .catch((err: any) => console.error(`[Database] Failed to create unique index:`, err));
    } catch (err) {
      console.error("[Database] Connection failed, falling back to Mock Data:", err);
      dbCommand = new MockDB();
      dbQuery = dbCommand;
      setupDNL(dbCommand);
      initializeSearchSync(dbQuery).catch(err => console.error('[SearchSync] Non-fatal init error:', err));
      // Kick off the background reconnection loop so the system can
      // recover once MongoDB comes back online.
      startReconnectLoop();
    }
  } else {
    console.log("[Database] No MONGODB_URI provided. Running in Offline Mock mode.");
    dbCommand = new MockDB();
    dbQuery = dbCommand;
    setupDNL(dbCommand);
    initializeSearchSync(dbQuery).catch(err => console.error('[SearchSync] Non-fatal init error:', err));
  }
}
