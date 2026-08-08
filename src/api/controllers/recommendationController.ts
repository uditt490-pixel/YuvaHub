import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId } from "../../lib/utils.js";
import { CURATED_FALLBACKS } from "../../services/staticFallbacks.js";
import {
  rankRecommendationsForUser,
  calculateOpportunityMatch,
  generateMatchExplanation,
  parseProfileResumeAndSkills,
  calculateProfileCompletenessScore
} from "../../services/recommendationEngine.js";
import { checkAndDispatchHighMatchNotifications } from "../../services/recommendationNotificationService.js";
import { RecommendationPreferences } from "../../types.js";
import { sendSuccess, sendUnauthorized, sendBadRequest, sendError } from "../../lib/apiResponse.js";

/**
 * GET /api/v1/recommendations
 * Fetch personalized recommended opportunities for the authenticated user
 */
export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.uid) {
      return sendUnauthorized(res);
    }

    const minScore = parseInt(req.query.minScore as string) || 0;
    const type = (req.query.type as string) || "All";
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    // 1. Fetch user document
    let userProfile: any = user;
    if (dbQuery) {
      const dbUser = await dbQuery.collection("users").findOne({ uid: user.uid });
      if (dbUser) userProfile = { ...user, ...dbUser };
    }

    // 2. Fetch opportunities from DB or fallbacks
    let opportunities: any[] = [];
    if (dbQuery) {
      opportunities = await dbQuery
        .collection("opportunities")
        .find({ status: { $ne: "closed" } })
        .sort({ createdAt: -1 })
        .toArray();
    }

    if (!opportunities || opportunities.length === 0) {
      opportunities = CURATED_FALLBACKS.map(item => ({
        ...item,
        createdAt: (item as any).createdAt || Date.now()
      }));
    }

    // 3. Fetch user interaction telemetry
    let interactions: any[] = [];
    if (dbQuery) {
      interactions = await dbQuery
        .collection("recommendation_interactions")
        .find({ userId: user.uid })
        .sort({ timestamp: -1 })
        .limit(100)
        .toArray();
    }

    // 4. Fetch user resumes count for completeness score
    let resumesCount = 0;
    if (dbQuery) {
      resumesCount = await dbQuery.collection("resumes").countDocuments({ userId: user.uid });
    }

    const completeness = calculateProfileCompletenessScore(userProfile, resumesCount);

    // 5. Rank opportunities using engine
    const prefs: RecommendationPreferences | undefined = userProfile.recommendationPreferences;
    const rankingResult = rankRecommendationsForUser(
      userProfile,
      opportunities.map(o => ({ ...o, id: o._id ? o._id.toString() : o.id })),
      interactions,
      prefs,
      { minScore, type, limit, offset }
    );

    return sendSuccess(res, {
      status: "success",
      items: rankingResult.items,
      total: rankingResult.total,
      offset: rankingResult.offset,
      limit: rankingResult.limit,
      completeness: completeness
    });
  } catch (err: any) {
    console.error("GET /api/v1/recommendations error:", err);
    return sendError(res, err.message || "Failed to fetch recommendations", 500);
  }
};

/**
 * GET /api/v1/recommendations/explanation/:id
 * Generate AI "Why this opportunity?" explanation
 */
export const getMatchExplanation = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const opportunityId = req.params.id;

    if (!user || !user.uid) return sendUnauthorized(res);
    if (!opportunityId) return sendBadRequest(res, "Missing opportunityId");

    let userProfile: any = user;
    if (dbQuery) {
      const dbUser = await dbQuery.collection("users").findOne({ uid: user.uid });
      if (dbUser) userProfile = { ...user, ...dbUser };
    }

    let opportunity: any = null;
    if (dbQuery) {
      const oid = safeObjectId(opportunityId);
      const query = oid ? { _id: oid } : { id: opportunityId };
      opportunity = await dbQuery.collection("opportunities").findOne(query);
    }

    if (!opportunity) {
      opportunity = CURATED_FALLBACKS.find(f => f.id === opportunityId) || {
        id: opportunityId,
        title: "Verified Global Opportunity",
        type: "Open Source Grant",
        tags: ["Python", "TypeScript", "AI"],
        description: "High impact technical fellowship opportunity."
      };
    }

    let interactions: any[] = [];
    if (dbQuery) {
      interactions = await dbQuery
        .collection("recommendation_interactions")
        .find({ userId: user.uid })
        .toArray();
    }

    const matchDetails = calculateOpportunityMatch(userProfile, opportunity, interactions, userProfile.recommendationPreferences);
    const explanation = await generateMatchExplanation(userProfile, opportunity, matchDetails);

    return sendSuccess(res, {
      status: "success",
      opportunityId,
      explanation,
      matchDetails
    });
  } catch (err: any) {
    console.error("GET /api/v1/recommendations/explanation/:id error:", err);
    return sendError(res, err.message || "Failed to generate explanation", 500);
  }
};

/**
 * POST /api/v1/recommendations/parse-profile
 * Trigger AI parsing of resume/bio text to extract skills & interests
 */
export const parseProfileSkills = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.uid) return sendUnauthorized(res);

    const { resumeText, bioText } = req.body || {};
    const parsed = await parseProfileResumeAndSkills(resumeText || "", bioText || "");

    if (dbCommand) {
      const usersCol = dbCommand.collection("users");
      const existingUser = await dbQuery?.collection("users").findOne({ uid: user.uid });
      
      const currentSkills = existingUser?.skills || [];
      const currentCanonical = existingUser?.canonicalSkills || [];
      const currentInterests = existingUser?.interests || [];

      const updatedSkills = Array.from(new Set([...currentSkills, ...parsed.skills]));
      const updatedCanonical = Array.from(new Set([...currentCanonical, ...parsed.skills]));
      const updatedInterests = Array.from(new Set([...currentInterests, ...parsed.interests]));

      await usersCol.updateOne(
        { uid: user.uid },
        {
          $set: {
            skills: updatedSkills,
            canonicalSkills: updatedCanonical,
            interests: updatedInterests,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    }

    let resumesCount = 0;
    if (dbQuery) {
      resumesCount = await dbQuery.collection("resumes").countDocuments({ userId: user.uid });
    }

    const updatedUser = dbQuery ? await dbQuery.collection("users").findOne({ uid: user.uid }) : null;
    const completeness = calculateProfileCompletenessScore(updatedUser || { ...user, skills: parsed.skills, interests: parsed.interests }, resumesCount);

    return sendSuccess(res, {
      status: "success",
      extractedSkills: parsed.skills,
      extractedInterests: parsed.interests,
      completeness
    });
  } catch (err: any) {
    console.error("POST /api/v1/recommendations/parse-profile error:", err);
    return sendError(res, err.message || "Failed to parse profile", 500);
  }
};

/**
 * GET /api/v1/recommendations/preferences
 * Get user recommendation preferences
 */
export const getPreferences = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.uid) return sendUnauthorized(res);

    let prefs: RecommendationPreferences = {
      targetRole: "Software & AI Engineer",
      preferredLocations: ["Remote"],
      remoteOnly: true,
      minStipend: 0,
      preferredTypes: ["Hackathon", "Open Source", "Internship", "Grant"],
      minMatchScore: 50
    };

    if (dbQuery) {
      const dbUser = await dbQuery.collection("users").findOne({ uid: user.uid });
      if (dbUser && dbUser.recommendationPreferences) {
        prefs = { ...prefs, ...dbUser.recommendationPreferences };
      }
    }

    return sendSuccess(res, { status: "success", preferences: prefs });
  } catch (err: any) {
    console.error("GET /api/v1/recommendations/preferences error:", err);
    return sendError(res, err.message || "Failed to fetch preferences", 500);
  }
};

/**
 * PUT /api/v1/recommendations/preferences
 * Update user recommendation preferences
 */
export const updatePreferences = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.uid) return sendUnauthorized(res);

    const newPrefs: Partial<RecommendationPreferences> = req.body || {};

    if (dbCommand) {
      const usersCol = dbCommand.collection("users");
      const existingUser = await dbQuery?.collection("users").findOne({ uid: user.uid });
      const currentPrefs = existingUser?.recommendationPreferences || {};
      const updatedPrefs = { ...currentPrefs, ...newPrefs };

      await usersCol.updateOne(
        { uid: user.uid },
        {
          $set: {
            recommendationPreferences: updatedPrefs,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    }

    return sendSuccess(res, { status: "success", message: "Preferences updated successfully", preferences: newPrefs });
  } catch (err: any) {
    console.error("PUT /api/v1/recommendations/preferences error:", err);
    return sendError(res, err.message || "Failed to update preferences", 500);
  }
};

/**
 * POST /api/v1/recommendations/interaction
 * Record user interaction telemetry (view, save, apply, dismiss)
 */
export const recordInteraction = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.uid) return sendUnauthorized(res);

    const { opportunityId, interactionType, tags = [], opportunityType = "" } = req.body || {};

    if (!opportunityId || !interactionType) {
      return sendBadRequest(res, "Missing opportunityId or interactionType");
    }

    if (dbCommand) {
      const collection = dbCommand.collection("recommendation_interactions");
      await collection.insertOne({
        userId: user.uid,
        opportunityId,
        interactionType, // 'view' | 'save' | 'apply' | 'dismiss'
        tags: Array.isArray(tags) ? tags : [],
        opportunityType,
        timestamp: new Date()
      });
    }

    return sendSuccess(res, { status: "success", recorded: true });
  } catch (err: any) {
    console.error("POST /api/v1/recommendations/interaction error:", err);
    return sendError(res, err.message || "Failed to record interaction", 500);
  }
};

/**
 * GET /api/v1/recommendations/completeness
 * Get candidate profile completeness score breakdown (0-100%)
 */
export const getCompleteness = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.uid) return sendUnauthorized(res);

    let userProfile: any = user;
    let resumesCount = 0;

    if (dbQuery) {
      const dbUser = await dbQuery.collection("users").findOne({ uid: user.uid });
      if (dbUser) userProfile = { ...user, ...dbUser };
      resumesCount = await dbQuery.collection("resumes").countDocuments({ userId: user.uid });
    }

    const completeness = calculateProfileCompletenessScore(userProfile, resumesCount);

    return sendSuccess(res, { status: "success", completeness });
  } catch (err: any) {
    console.error("GET /api/v1/recommendations/completeness error:", err);
    return sendError(res, err.message || "Failed to get completeness score", 500);
  }
};

/**
 * POST /api/v1/recommendations/check-alerts
 * Check and trigger notifications for high match score opportunities (>80%)
 */
export const checkAlerts = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.uid) return sendUnauthorized(res);

    let userProfile: any = user;
    if (dbQuery) {
      const dbUser = await dbQuery.collection("users").findOne({ uid: user.uid });
      if (dbUser) userProfile = { ...user, ...dbUser };
    }

    await checkAndDispatchHighMatchNotifications(userProfile);
    return sendSuccess(res, { status: "success", message: "Alerts checked successfully" });
  } catch (err: any) {
    console.error("POST /api/v1/recommendations/check-alerts error:", err);
    return sendError(res, err.message || "Failed to check alerts", 500);
  }
};

