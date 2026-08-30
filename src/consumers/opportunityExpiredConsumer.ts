import { eventBus } from "../events/eventBus";
import { EventType, OpportunityExpiredEvent } from "../events/schemas";
import { db } from "../utils/firebaseAdmin";
import { enqueuePushNotification } from "../queues/pushQueue";
import { logger } from "../utils/logger";

export const initOpportunityExpiredConsumer = async () => {
  await eventBus.subscribe(
    "opportunity_expired_notifications",
    EventType.enum.OpportunityExpired,
    async (rawEvent: unknown) => {
      const event = rawEvent as OpportunityExpiredEvent;
      const { opportunityId, title } = event.payload;

      logger.info({ eventId: event.eventId, opportunityId }, "Processing OpportunityExpired event");

      try {
        // Find users who have bookmarked this opportunity
        const usersSnapshot = await db.collection("users")
          .where("bookmarks", "array-contains", opportunityId)
          .get();

        if (usersSnapshot.empty) {
          logger.info({ opportunityId }, "No users bookmarked this expired opportunity.");
          return;
        }

        const pushPromises = usersSnapshot.docs.map((doc) => {
          const user = doc.data();
          const userId = doc.id;

          // Enqueue push notification
          return enqueuePushNotification({
            userId,
            message: `The opportunity "${title}" you bookmarked has expired.`,
          }).catch(err => {
            logger.error({ userId, opportunityId, err }, "Failed to enqueue push notification");
          });
        });

        await Promise.all(pushPromises);
        logger.info({ opportunityId, count: pushPromises.length }, "Sent expiration notifications to bookmarked users.");
      } catch (error) {
        logger.error({ error, opportunityId }, "Error processing OpportunityExpired event");
        throw error;
      }
    }
  );
};
