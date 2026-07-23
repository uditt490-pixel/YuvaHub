import { OpportunityScrapedEvent } from '../events/schemas.js';
import { generateOpportunityEmbedding } from '../services/embedding.js';

export async function createOpportunityScrapedConsumer(db: any) {
  return async (event: OpportunityScrapedEvent) => {
    const payload = event.payload;

    const doc = {
      title: payload.title,
      description: payload.description,
      source: payload.sourceName,
      source_name: payload.sourceName,
      source_url: payload.url,
      apply_link: payload.url,
      image_url: 'https://yuvahub.xyz/og-image.jpg',
      tags: payload.tags || [],
      category: payload.opportunityType,
      deadline: payload.deadline,
      location: payload.location,
      opportunity_type: payload.opportunityType,
      dedupe_hash: payload.dedupeHash,
      created_at: new Date(event.timestamp),
      updated_at: new Date(),
      embedding: null as number[] | null,
    };

    const embeddingText = `${payload.title} ${payload.sourceName} ${payload.description} ${payload.opportunityType}`;
    doc.embedding = await generateOpportunityEmbedding(embeddingText);

    try {
      if (db.isMock) {
        const existing = db.collection('opportunities').data.find(
          (o: any) => o.dedupe_hash === payload.dedupeHash
        );
        if (existing) {
          const err: any = new Error('Duplicate key error');
          err.code = 11000;
          throw err;
        }
        await db.collection('opportunities').insertOne(doc);
      } else {
        await db.collection('opportunities').insertOne(doc);
      }
      console.log(`[DB Consumer] Inserted opportunity: ${payload.title}`);
    } catch (err: any) {
      if (err.code === 11000) {
        // Idempotency: Ignore duplicate key errors, simply ack the message
        console.log(`[DB Consumer] Duplicate ignored: ${payload.title}`);
      } else {
        console.error(`[DB Consumer] DB error:`, err);
        throw err; // Nack message to retry
      }
    }
  };
}
