import { OpportunityScrapedEvent } from '../events/schemas';
import { matchOpportunityAndNotify } from '../services/opportunityMatcher';

export async function createNotificationConsumer(db: any) {
  return async (event: OpportunityScrapedEvent) => {
    const payload = event.payload;

    try {
      // Execute the real-time opportunity matchmaking engine across all users
      // Map properties from Event to Opportunity document format
      const opportunityDoc = {
        id: payload.dedupeHash, // Dedupe hash is our unique identifier
        _id: payload.dedupeHash,
        title: payload.title,
        organization: payload.company,
        description: payload.description,
        location: payload.location,
        deadline: payload.deadline,
        category: payload.opportunityType,
        tags: payload.tags || [],
        apply_link: payload.url
      };

      await matchOpportunityAndNotify(db, opportunityDoc);
      console.log(`[Notification Consumer] Successfully processed matchmaking for: ${payload.title}`);
    } catch (error: any) {
      console.error(`[Notification Consumer] Error during matchmaking processing:`, error);
      try {
        const { getCommandDB } = await import('../lib/mongodb.js');
        const activeDb = db || await getCommandDB();
        await activeDb.collection('dead_letter_jobs').insertOne({
          queue: 'notification-consumer',
          data: event,
          failedAt: new Date(),
          error: error.message,
          stack: error.stack
        });
      } catch (dbErr: any) {
        console.error(`[Notification Consumer] Failed to log failure to dead_letter_jobs:`, dbErr.message);
      }
      throw error; // Let RabbitMQ retry or move to DLQ
    }
  };
}
