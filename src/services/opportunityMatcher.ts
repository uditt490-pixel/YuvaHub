import { enqueueEmail } from "../queues/emailQueue";
import { enqueuePushNotification } from "../queues/pushQueue";
import { Notification } from "../models/notificationSchema";
import { getSocketIO } from "../api/socketInstance.js";
import { normalizeSkills } from "./skillTaxonomy.js";
import { generateOpportunityEmbedding } from "./embedding.js";

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function matchOpportunityAndNotify(db: any, opportunity: any): Promise<void> {
  if (!db) {
    console.error("[Matcher] Database client not provided.");
    return;
  }

  const category = (opportunity.category || opportunity.opportunity_type || "general").toLowerCase().trim();
  const title = (opportunity.title || "New Opportunity").trim();
  const description = (opportunity.description || "").trim();
  const tags = (opportunity.tags || []).map((t: string) => t.toLowerCase().trim());
  const opportunityId = opportunity.id || opportunity._id?.toString();

  if (!opportunityId) {
    console.warn("[Matcher] Opportunity lacks a valid ID. Skipping matching.");
    return;
  }

  console.log(`[Matcher] Running matchmaking for opportunity "${title}" (Category: ${category})`);

  try {
    // 1. Synonym & Taxonomy Mapping: Get canonical skill IDs for opportunity
    const opportunityRawSkills = [...tags];
    // Also extract skills if mentioned in title
    const canonicalOpportunitySkills = await normalizeSkills(opportunityRawSkills);

    const usersCollection = db.collection("users");
    const notifCollection = db.collection("notifications");

    // 2. Cursor-based User Processing to avoid loading all users in memory
    const cursor = usersCollection.find({});
    
    while (await cursor.hasNext()) {
      const user = await cursor.next();
      if (!user) continue;

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
      let semanticScore = 0;

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

      // Check skill-based matching if enabled
      if (prefs.skillAlertsEnabled && user.skills && user.skills.length > 0) {
        // A. Taxonomy-based matching (Synonyms / Canonical IDs)
        const userCanonicalSkills = user.canonicalSkills || await normalizeSkills(user.skills);
        const hasTaxonomyMatch = userCanonicalSkills.some((skillId: string) => 
          canonicalOpportunitySkills.includes(skillId)
        );

        // B. Fuzzy Substring Matching (Case-Insensitive)
        const userSkillsLower = user.skills.map((s: string) => s.toLowerCase().trim());
        const hasKeywordMatch = userSkillsLower.some((skill: string) => 
          tags.includes(skill) || 
          title.toLowerCase().includes(skill) ||
          description.toLowerCase().includes(skill)
        );

        // C. ML-based Semantic Vector Similarity
        let hasSemanticMatch = false;
        if (opportunity.embedding) {
          let userEmbedding = user.embedding;
          if (!userEmbedding) {
            // Lazy load and persist user profile embedding
            const userProfileText = `${user.bio || ""} ${userSkillsLower.join(" ")}`.trim();
            if (userProfileText) {
              userEmbedding = await generateOpportunityEmbedding(userProfileText);
              if (userEmbedding) {
                await usersCollection.updateOne({ _id: user._id }, { $set: { embedding: userEmbedding } });
              }
            }
          }

          if (userEmbedding) {
            semanticScore = cosineSimilarity(opportunity.embedding, userEmbedding);
            // Threshold of 0.70 for semantic matching
            if (semanticScore >= 0.70) {
              hasSemanticMatch = true;
            }
          }
        }

        if (hasTaxonomyMatch || hasKeywordMatch || hasSemanticMatch) {
          shouldNotify = true;
          matchedReason = hasSemanticMatch 
            ? `AI Semantic Match Alert (Score: ${Math.round(semanticScore * 100)}%)`
            : "Skill-Based Match Alert";
        }
      }

      if (shouldNotify) {
        // Idempotency check: Ensure the user doesn't already have a notification for this opportunity ID
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

