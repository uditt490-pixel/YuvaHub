import { Meilisearch } from 'meilisearch';
import { Db, ChangeStream, ChangeStreamInsertDocument, ChangeStreamUpdateDocument, ChangeStreamReplaceDocument, ChangeStreamDeleteDocument } from 'mongodb';

// --- SEC-245 FIX: Remove hardcoded default master key & validate startup ---
const host = process.env.MEILI_HOST || 'http://localhost:7700';
const apiKey = process.env.MEILI_MASTER_KEY;

if (!apiKey) {
  if (process.env.NODE_ENV === 'production') {
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

/** Track the active change stream so we can close it before reinitializing. */
let activeChangeStream: ChangeStream | null = null;

export async function initializeSearchSync(db: Db) {
  // Close any previous change stream (e.g. on MockDB) before opening a new one.
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
    
    // Attempt to open a change stream (Requires MongoDB Replica Set)
    const changeStream: ChangeStream = collection.watch();
    activeChangeStream = changeStream;

    console.log('[SearchSync] Started listening to MongoDB Change Streams on opportunities collection.');

    changeStream.on('change', async (change) => {
      try {
        if (change.operationType === 'insert') {
          const doc = (change as ChangeStreamInsertDocument).fullDocument;
          // Transform ObjectId to string for Meilisearch
          const docToInsert: any = { ...doc, id: doc._id.toString() };
          delete docToInsert._id;
          await index.addDocuments([docToInsert]);
          console.log(`[SearchSync] Inserted document ${docToInsert.id} to Meilisearch`);
        } else if (change.operationType === 'update') {
          const docId = (change as ChangeStreamUpdateDocument).documentKey._id.toString();
          const updatedFields = (change as ChangeStreamUpdateDocument).updateDescription.updatedFields;
          if (updatedFields) {
             const docToUpdate = { ...updatedFields, id: docId };
             await index.updateDocuments([docToUpdate]);
             console.log(`[SearchSync] Updated document ${docId} in Meilisearch`);
          }
        } else if (change.operationType === 'replace') {
          const doc = (change as ChangeStreamReplaceDocument).fullDocument;
          const docToReplace: any = { ...doc, id: doc._id.toString() };
          delete docToReplace._id;
          await index.updateDocuments([docToReplace]);
          console.log(`[SearchSync] Replaced document ${docToReplace.id} in Meilisearch`);
        } else if (change.operationType === 'delete') {
          const docId = (change as ChangeStreamDeleteDocument).documentKey._id.toString();
          await index.deleteDocument(docId);
          console.log(`[SearchSync] Deleted document ${docId} from Meilisearch`);
        }
      } catch (err) {
        console.error('[SearchSync] Error syncing change to Meilisearch:', err);
      }
    });

    changeStream.on('error', (err) => {
       console.error('[SearchSync] Change stream error (Replica Set required):', err);
    });

  } catch (err) {
    console.error('[SearchSync] Failed to initialize search sync:', err);
  }
}
