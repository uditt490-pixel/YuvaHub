import { Meilisearch } from 'meilisearch';
import { Db, ChangeStream } from 'mongodb';
import { redisClient } from "../api/redis.js";

const processEnv = (globalThis as any).process?.env || {};
const host = processEnv.MEILI_HOST || 'http://localhost:7700';
const apiKey = processEnv.MEILI_MASTER_KEY;

if (!apiKey) {
  if (processEnv.NODE_ENV === 'production') {
    throw new Error(
      'FATAL CONFIGURATION ERROR: MEILI_MASTER_KEY environment variable is missing in production.'
    );
  } else {
    console.warn(
      '⚠️ [SearchSync] WARNING: MEILI_MASTER_KEY is not defined. Meilisearch client initialized without an admin key (Development Mode).'
    );
  }
}

export const meiliClient = new Meilisearch({
  host,
  apiKey: apiKey || '',
});

async function acquireLock(key: string, ttlMs: number): Promise<boolean> {
  if (!(globalThis as any).REDIS_AVAILABLE || !redisClient) return true;
  try {
    const res = await redisClient.set(key, "locked", "NX", "PX", ttlMs);
    return res === "OK";
  } catch (err: any) {
    console.error(`[SearchSync] Redis lock error for ${key}:`, err.message);
    return false;
  }
}

async function releaseLock(key: string): Promise<void> {
  if (!(globalThis as any).REDIS_AVAILABLE || !redisClient) return;
  try {
    await redisClient.del(key);
  } catch (err: any) {
    console.error(`[SearchSync] Redis unlock error for ${key}:`, err.message);
  }
}

/**
 * Sync all opportunities from MongoDB to Meilisearch.
 * Protected by a Redis distributed lock.
 */
export async function syncAllOpportunities(db: Db): Promise<void> {
  if (!db) return;

  const lockKey = "lock:search_sync";
  const lockAcquired = await acquireLock(lockKey, 600000); // 10 minutes lock
  if (!lockAcquired) {
    console.log("[SearchSync] Sync execution is locked by another instance. Skipping.");
    return;
  }

  console.log("[SearchSync] Starting full search index sync...");

  try {
    const index = meiliClient.index('opportunities');
    const opportunities = await db.collection("opportunities").find({}).toArray();
    console.log(`[SearchSync] Syncing ${opportunities.length} opportunities to Meilisearch...`);

    const docsToInsert = opportunities.map(doc => {
      const searchDoc: any = {
        ...doc,
        id: doc.id || doc._id?.toString(),
      };
      delete searchDoc._id;
      return searchDoc;
    });

    if (docsToInsert.length > 0) {
      await index.addDocuments(docsToInsert);
    }

    console.log("[SearchSync] Full Meilisearch sync completed successfully.");
  } catch (err: any) {
    console.error("[SearchSync] Meilisearch full sync error:", err.message);
  } finally {
    await releaseLock(lockKey);
  }
}

let activeChangeStream: ChangeStream | null = null;

export async function initializeSearchSync(db: Db) {
  if (activeChangeStream) {
    try {
      await activeChangeStream.close();
      console.log('[SearchSync] Closed previous change stream.');
    } catch (err) {
      console.error('[SearchSync] Error closing previous change stream:', err);
    }
    activeChangeStream = null;
  }

  try {
    const index = meiliClient.index('opportunities');

    // Update settings: filterable & searchable attributes
    await index.updateSettings({
      filterableAttributes: ['type', 'location', 'source_quality_score', 'created_at'],
      searchableAttributes: ['title', 'description', 'tags', 'organization', 'location']
    });

    console.log('[SearchSync] Meilisearch index settings updated.');

    const collection = db.collection('opportunities');

    // 1. Resume token recovery: Load last token from DB if it exists
    let resumeToken: any = null;
    const tokenDoc = await db.collection("search_sync_tokens").findOne({ _id: "last_token" });
    if (tokenDoc) {
      resumeToken = tokenDoc.token;
      console.log("[SearchSync] Found resume token in DB, attempting to resume Change Stream.");
    }

    const options: any = { fullDocument: 'updateLookup' };
    if (resumeToken) {
      options.resumeAfter = resumeToken;
    }

    const changeStream = collection.watch([], options);
    activeChangeStream = changeStream;

    console.log('[SearchSync] Started listening to MongoDB Change Streams on opportunities collection.');

    changeStream.on('change', async (change) => {
      try {
        const documentId = change.documentKey._id.toString();

        if (change.operationType === 'insert' || change.operationType === 'replace') {
          const doc = change.fullDocument;
          if (doc) {
            const docToInsert: any = { ...doc, id: documentId };
            delete docToInsert._id;
            await index.addDocuments([docToInsert]);
            console.log(`[SearchSync] Inserted/Replaced document ${documentId} in Meilisearch`);
          }
        } else if (change.operationType === 'update') {
          const updatedFields = change.updateDescription?.updatedFields;
          if (updatedFields) {
            const docToUpdate = { ...updatedFields, id: documentId };
            await index.updateDocuments([docToUpdate]);
            console.log(`[SearchSync] Updated document ${documentId} in Meilisearch`);
          }
        } else if (change.operationType === 'delete') {
          await index.deleteDocument(documentId);
          console.log(`[SearchSync] Deleted document ${documentId} from Meilisearch`);
        }

        // 2. Persist resume token to support reconnects
        if (change._id) {
          await db.collection("search_sync_tokens").updateOne(
            { _id: "last_token" },
            { $set: { token: change._id, updatedAt: new Date() } },
            { upsert: true }
          );
        }
      } catch (err: any) {
        console.error('[SearchSync] Error syncing change to Meilisearch:', err.message);
      }
    });

    changeStream.on('error', async (err: any) => {
      console.error('[SearchSync] Change stream error:', err.message);
      // If resume token fails (e.g. oplog expired), fall back to re-syncing and starting a fresh watcher
      if (err.code === 280 || err.message?.includes("resume token")) {
        console.warn("[SearchSync] Resume token invalidated or expired. Clearing token and restarting search sync.");
        await db.collection("search_sync_tokens").deleteOne({ _id: "last_token" });
        setTimeout(() => initializeSearchSync(db), 5000);
      }
    });

  } catch (err: any) {
    console.error('[SearchSync] Failed to initialize search sync:', err.message);
  }
}
