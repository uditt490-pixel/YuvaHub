import { enqueueEmail } from "../queues/emailQueue";
import { enqueuePushNotification } from "../queues/pushQueue";
import { Notification } from "../models/notificationSchema";

// Since Socket.io is initialized in server.ts, we will import a helper to fetch the instance
import { getSocketIO } from "../api/socketInstance.js";

export async function matchOpportunityAndNotify(db: any, opportunity: any): Promise<void> {
  if (!db) {
    console.error("[Matcher] Database client not provided.");
    return;
  }

  const category = (opportunity.category || opportunity.opportunity_type || "general").toLowerCase();
  const title = opportunity.title || "New Opportunity";
  const tags = (opportunity.tags || []).map((t: string) => t.toLowerCase());
  const opportunityId = opportunity.id || opportunity._id?.toString();

  if (!opportunityId) {
    console.warn("[Matcher] Opportunity lacks a valid ID. Skipping matching.");
    return;
  }

  console.log(`[Matcher] Running matchmaking for opportunity "${title}" (Category: ${category})`);

  try {
    // 1. Fetch all users from the DB
    const usersCollection = db.collection("users");
    const users = await usersCollection.find({}).toArray();

    for (const user of users) {
      const prefs = user.notificationPreferences || {
        emailEnabled: true,
        pushEnabled: true,
        deadlineRemindersEnabled: true,
        skillAlertsEnabled: true,
        scholarshipAlertsEnabled: true,
        hackathonAlertsEnabled: true,
        opportunityAlertsEnabled: true
      };

      let shouldNotify = false;
      let matchedReason = "";

      // Check category-specific filters
      if (category === "scholarship") {
        if (prefs.scholarshipAlertsEnabled) {
          shouldNotify = true;
          matchedReason = "New Scholarship Alert";
        }
      } else if (category === "hackathon") {
        if (prefs.hackathonAlertsEnabled) {
          shouldNotify = true;
          matchedReason = "New Hackathon Alert";
        }
      } else {
        if (prefs.opportunityAlertsEnabled) {
          shouldNotify = true;
          matchedReason = "New Opportunity Alert";
        }
      }

      // Check skill-based matching if enabled and not already triggered
      if (prefs.skillAlertsEnabled && user.skills && user.skills.length > 0) {
        const userSkills = user.skills.map((s: string) => s.toLowerCase());
        
        // Exact match on tags or substring match on title/description
        const skillMatch = userSkills.some((skill: string) => 
          tags.includes(skill) || 
          title.toLowerCase().includes(skill) ||
          (opportunity.description && opportunity.description.toLowerCase().includes(skill))
        );

        if (skillMatch) {
          shouldNotify = true;
          matchedReason = "Skill-Based Match Alert";
        }
      }

      if (shouldNotify) {
        // Idempotency check: Ensure the user doesn't already have a notification for this opportunity ID
        const notifCollection = db.collection("notifications");
        const existingNotif = await notifCollection.findOne({
          userId: user.uid,
          targetId: opportunityId
        });

        if (existingNotif) {
          console.log(`[Matcher] Duplicate prevention: User ${user.uid} already notified for opportunity ${opportunityId}`);
          continue;
        }

        // Create the notification document
        const message = `A new ${category} "${title}" matches your preferences. Check it out!`;
        const notificationDoc: Notification = {
          userId: user.uid,
          type: category === "scholarship" ? "scholarship_alert" 
                : category === "hackathon" ? "hackathon_alert" 
                : "skill_match",
          title: matchedReason,
          message,
          targetId: opportunityId,
          read: false,
          createdAt: new Date()
        };

        // Insert into database
        const insertRes = await notifCollection.insertOne(notificationDoc);
        const notificationId = (insertRes?.insertedId || 'mock_id').toString();

        console.log(`[Matcher] Created notification for user ${user.uid} (ID: ${notificationId})`);

        // Real-Time Socket.io push (foreground handling)
        const io = getSocketIO();
        if (io) {
          io.emit(`NOTIFICATION_RECEIVED_${user.uid}`, {
            id: notificationId,
            ...notificationDoc,
            time: "Just now"
          });
          console.log(`[Matcher] Dispatched real-time Socket alert to user ${user.uid}`);
        }

        // Enqueue background email job if email is enabled globally and for user
        if (prefs.emailEnabled && user.email) {
          await enqueueEmail({
            to: user.email,
            subject: `[YuvaHub] ${matchedReason}: ${title}`,
            body: message
          });
        }

        // Enqueue background push job if push notifications are enabled
        if (prefs.pushEnabled && user.fcmToken) {
          await enqueuePushNotification({
            userId: user.uid,
            message: `[YuvaHub] ${matchedReason}: ${title}`
          });
        }
      }
    }
  } catch (error) {
    console.error("[Matcher] Error in matchmaking process:", error);
  }
}
