import { Db } from 'mongodb';
import crypto from 'crypto';

function generateDedupeHash(url: string, title: string, company: string): string {
  const normalizedTitle = (title || '').toLowerCase();
  const normalizedCompany = (company || '').toLowerCase();
  const baseString = (url || '') + normalizedTitle + normalizedCompany;
  return crypto.createHash('sha256').update(baseString).digest('hex');
}

export const up = async (db: Db) => {
  console.log('[004_backfill_dedupe_hash] Starting backfill of dedupe_hash on opportunities...');
  
  const opportunities = db.collection('opportunities');
  
  // Find all documents missing dedupe_hash
  const cursor = opportunities.find({ dedupe_hash: { $exists: false } });
  
  let bulkOps: any[] = [];
  let processedCount = 0;
  
  for await (const doc of cursor) {
    const hash = generateDedupeHash(doc.url, doc.title, doc.company);
    
    bulkOps.push({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { dedupe_hash: hash } }
      }
    });

    // Execute in batches of 1000
    if (bulkOps.length >= 1000) {
      await opportunities.bulkWrite(bulkOps);
      processedCount += bulkOps.length;
      console.log(`[004_backfill_dedupe_hash] Processed ${processedCount} documents...`);
      bulkOps = [];
    }
  }

  // Execute remaining ops
  if (bulkOps.length > 0) {
    await opportunities.bulkWrite(bulkOps);
    processedCount += bulkOps.length;
    console.log(`[004_backfill_dedupe_hash] Processed ${processedCount} documents...`);
  }
  
  console.log(`[004_backfill_dedupe_hash] Backfill complete. Updated ${processedCount} opportunities.`);
};

export const down = async (db: Db) => {
  console.log('[004_backfill_dedupe_hash] Down migration: We do not unset dedupe_hash as it might have been legitimately set by newer ingestion processes after this migration.');
};
