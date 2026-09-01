import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { db } from "../utils/firebaseAdmin";
import { eventBus } from "../events/eventBus";
import { logger } from "../utils/logger";
import { EventType } from "../events/schemas";

export const processExpiredOpportunities = async () => {
  logger.info("Starting opportunity expiry process...");
  
  const now = new Date().toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  
  try {
    // 1. Close expired active opportunities
    const expiredQuery = await db.collection("opportunities")
      .where("status", "==", "active")
      .where("deadline", "<", now)
      .get();
      
    if (!expiredQuery.empty) {
      const batch = db.batch();
      for (const doc of expiredQuery.docs) {
        batch.update(doc.ref, { 
          status: "closed",
          updatedAt: FieldValue.serverTimestamp()
        });
        
        // Emit event for downstream consumers
        await eventBus.publish("opportunity.expired", {
          eventId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          eventType: EventType.enum.OpportunityExpired,
          payload: {
            opportunityId: doc.id,
            title: doc.data().title,
          }
        });
      }
      
      await batch.commit();
      logger.info(`Closed ${expiredQuery.size} expired opportunities.`);
    }

    // 2. Archive opportunities closed > 30 days ago
    const archiveQuery = await db.collection("opportunities")
      .where("status", "==", "closed")
      .where("deadline", "<", thirtyDaysAgo)
      .get();

    if (!archiveQuery.empty) {
      const batch = db.batch();
      for (const doc of archiveQuery.docs) {
        const data = doc.data();
        const archiveRef = db.collection("archivedOpportunities").doc(doc.id);
        
        batch.set(archiveRef, {
          ...data,
          archivedAt: FieldValue.serverTimestamp()
        });
        batch.delete(doc.ref);
      }
      
      await batch.commit();
      logger.info(`Archived ${archiveQuery.size} stale opportunities.`);
    }

  } catch (error) {
    logger.error({ err: error }, "Error processing expired opportunities.");
    throw error;
  }
};
