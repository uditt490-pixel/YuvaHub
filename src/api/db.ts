import { MongoClient, Db } from "mongodb";
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

export let dbCommand: Db | MockDB | null = null;
export let dbQuery: Db | MockDB | null = null;

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
    console.warn("[Database] Reconnection attempt failed — continuing in Mock Mode.");
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
type AnyRecord = Record<string, unknown>;

export class MemoryCollection<T extends AnyRecord = AnyRecord> {
  data: T[];
  constructor(initialData: T[] = []) { this.data = initialData; }
  findSync(query: Record<string, unknown> = {}) {
    let result: T[] = this.data;
    for (const key in query) {
      if (key === 'id') {
        result = result.filter(r => (r as any).id === query.id || (r as any)._id === query.id || (r as any)._id?.toString() === query.id);
      } else if (key === '_id') {
        result = result.filter(r => (r as any).id === (query._id as any).toString() || (r as any)._id?.toString() === (query._id as any).toString() || (r as any).id === query._id);
      } else if (key === '$text') {
        const search = (query.$text as any)?.$search?.toLowerCase() || '';
        result = result.filter(r => JSON.stringify(r).toLowerCase().includes(search));
      } else if (key === '$or') {
        const orClauses = query.$or as Record<string, unknown>[];
        result = result.filter(r => {
          return orClauses.some((cond) => {
            for (let k in cond) {
              const condVal = cond[k] as any;
              const rVal = (r as any)[k];
              if (condVal.$regex) {
                const regex = new RegExp(condVal.$regex, condVal.$options || "");
                if (regex.test(rVal)) return true;
              } else if (condVal.$in) {
                if (condVal.$in.some((val: unknown) => {
                  if (typeof val === 'object' && val !== null && (val as any).equals) return (val as any).equals(rVal);
                  if (typeof rVal === 'object' && rVal !== null && (rVal as any).equals) return (rVal as any).equals(val);
                  return rVal === val || rVal?.toString() === (val as any)?.toString();
                })) return true;
              } else {
                if (rVal === condVal) return true;
              }
            }
            return false;
          });
        });
      } else {
        result = result.filter(r => (r as any)[key] === query[key]);
      }
    }
    return result;
  }
  find(query: Record<string, unknown> = {}) {
    let result = this.findSync(query);
    const cursor = {
      sort: () => cursor,
      skip: (n: number) => { result = result.slice(n); return cursor; },
      limit: (n: number) => { result = result.slice(0, n); return cursor; },
      toArray: async () => result
    };
    return cursor;
  }
  async countDocuments(query: Record<string, unknown> = {}) {
    const res = await this.find(query).toArray();
    return res.length;
  }
  async findOne(query: Record<string, unknown>) {
    const res = this.findSync(query);
    return res[0] || null;
  }
  async updateOne(query: Record<string, unknown>, update: Record<string, unknown>, options: Record<string, unknown> = {}) {
    const item = (this.findSync(query))[0] || null;
    if (item) {
      const setData = update.$set as Partial<T>;
      if (setData) {
        Object.assign(item, setData);
      }
      const addToSet = update.$addToSet as Record<string, unknown>;
      if (addToSet) {
        for (const key in addToSet) {
          const arr = (item as any)[key];
          if (!Array.isArray(arr)) {
            (item as any)[key] = [];
          }
          const val = addToSet[key];
          if (!(item as any)[key].includes(val)) {
            (item as any)[key].push(val);
          }
        }
      }
      const pull = update.$pull as Record<string, unknown>;
      if (pull) {
        for (const key in pull) {
          if (Array.isArray((item as any)[key])) {
            const val = pull[key];
            (item as any)[key] = (item as any)[key].filter((x: unknown) => x !== val);
          }
        }
      }
      const push = update.$push as Record<string, unknown>;
      if (push) {
        for (const key in push) {
          if (!Array.isArray((item as any)[key])) {
            (item as any)[key] = [];
          }
          const val = push[key] as any;
          if (val && val.$each) {
            (item as any)[key].push(...val.$each);
            if (val.$slice !== undefined) {
              (item as any)[key] = (item as any)[key].slice(val.$slice);
            }
          } else {
            (item as any)[key].push(val);
          }
        }
      }
      return { modifiedCount: 1 };
    }
    if (options.upsert) {
      const doc = { ...query } as unknown as T;
      const setData = update.$set as Partial<T>;
      if (setData) Object.assign(doc, setData);
      this.data.push(doc);
      return { upsertedCount: 1, upsertedId: "mock_upsert_id" };
    }
    return { modifiedCount: 0 };
  }
  async findOneAndUpdate(query: Record<string, unknown>, update: Record<string, unknown>, options: Record<string, unknown> = {}) {
    const matched = this.findSync(query);
    let item = matched[0] || null;
    if (!item && options.upsert) {
      item = { ...query } as unknown as T;
      const setOnInsert = update.$setOnInsert as Partial<T>;
      if (setOnInsert) {
        Object.assign(item, setOnInsert);
      }
      const setData = update.$set as Partial<T>;
      if (setData) {
        Object.assign(item, setData);
      }
      this.data.push(item);
      return { value: item };
    }
    if (item) {
      const setData = update.$set as Partial<T>;
      if (setData) {
        Object.assign(item, setData);
      }
      return { value: item };
    }
    return { value: null };
  }
  async insertOne(doc: T) { this.data.push(doc); return { insertedId: "mock_id" }; }
  async deleteOne(query: Record<string, unknown>) {
    const initialLen = this.data.length;
    const item = await this.findOne(query);
    if (item) {
      this.data = this.data.filter(r => r !== item);
    }
    return { deletedCount: this.data.length < initialLen ? 1 : 0 };
  }
  async createIndex(keys: unknown, options: unknown) { return "mock_index"; }
  aggregate() { return { toArray: async () => [] as T[] }; }
  initializeUnorderedBulkOp() {
    const ops: T[] = [];
    return {
      insert: (doc: T) => {
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
  collection<T extends AnyRecord = AnyRecord>(name: string): MemoryCollection<T> {
    const col = this.collections[name] as MemoryCollection<T> | undefined;
    if (col) return col;
    const newCol = new MemoryCollection<T>();
    this.collections[name] = newCol as unknown as MemoryCollection;
    return newCol;
  }
}

// ── DNL Scheduler setup ─────────────────────────────────────────────

function setupDNL(database: Db | MockDB) {
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

      dbQuery.collection("users").createIndex({ uid: 1 }, { unique: true, sparse: true })
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
