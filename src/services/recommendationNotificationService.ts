import { dbCommand, dbQuery } from "../api/db.js";
import { calculateOpportunityMatch } from "./recommendationEngine.js";
import { getSocketIO } from "../api/socketInstance.js";

/**
 * Evaluate active opportunities for a user and trigger in-app & socket notifications if score >= 80%
 */
export async function checkAndDispatchHighMatchNotifications(user: any) {
  try {
    if (!user || !user.uid || !dbQuery || !dbCommand) return;

    const opportunitiesCol = dbQuery.collection("opportunities");
    const notificationsCol = dbCommand.collection("notifications");

    const recentOpportunities = await opportunitiesCol
      .find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    if (!recentOpportunities || recentOpportunities.length === 0) return;

    // Check existing notifications to avoid duplicating
    const existingNotifs = await dbQuery
      .collection("notifications")
      .find({ userId: user.uid, type: "high_match_opportunity" })
      .toArray();

    const notifiedOppIds = new Set(existingNotifs.map((n: any) => n.opportunityId));

    for (const opp of recentOpportunities) {
      const oppId = opp._id ? opp._id.toString() : opp.id;
      if (notifiedOppIds.has(oppId)) continue;

      const matchDetails = calculateOpportunityMatch(user, opp);
      if (matchDetails.matchScore >= 80) {
        const notifData = {
          userId: user.uid,
          opportunityId: oppId,
          type: "high_match_opportunity",
          title: `🎯 High Match Found: ${opp.title} (${matchDetails.matchScore}% Match)`,
          message: `We found a ${matchDetails.matchScore}% aligned opportunity matching your skills (${matchDetails.matchingSkills.join(', ') || 'technical stack'}).`,
          read: false,
          createdAt: new Date(),
          metadata: {
            matchScore: matchDetails.matchScore,
            matchingSkills: matchDetails.matchingSkills,
            type: opp.type
          }
        };

        const insertResult = await notificationsCol.insertOne(notifData);
        const insertedNotif = { ...notifData, id: insertResult.insertedId.toString() };

        // Emit real-time Socket.IO notification if connected
        const io = getSocketIO();
        if (io) {
          io.to(user.uid).emit("notification", insertedNotif);
        }
      }
    }
  } catch (err) {
    console.error("[RecommendationNotification] Dispatch error:", err);
  }
}
