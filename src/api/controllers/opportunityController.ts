import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId } from "../../lib/utils.js";
import escapeHtml from "escape-html";
import { meiliClient } from "../../services/searchSync.js";
import { generateOpportunityEmbedding } from "../../services/embedding.js";
import { CURATED_FALLBACKS } from "../../services/staticFallbacks.js";

// Toggle bookmark for an opportunity
export const toggleBookmark = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!dbCommand) return res.status(503).json({ error: "Database not available" });
    
    const opportunityId = req.params.id;
    if (!opportunityId) return res.status(400).json({ error: "Missing opportunityId" });
    
    // Check if opportunity exists first
    const oid = safeObjectId(opportunityId);
    const query = oid ? { _id: oid } : { id: opportunityId };
    const opp = await dbCommand.collection("opportunities").findOne(query);
    if (!opp) return res.status(404).json({ error: "Opportunity not found" });
    
    const collection = dbCommand.collection("saved_opportunities");
    const existing = await collection.findOne({ userId: user.uid, opportunityId });
    
    if (existing) {
      // Un-bookmark
      await collection.deleteOne({ userId: user.uid, opportunityId });
      return res.json({ saved: false });
    } else {
      // Bookmark
      await collection.insertOne({
        userId: user.uid,
        opportunityId,
        createdAt: new Date()
      });
      return res.json({ saved: true });
    }
  } catch (err: any) {
    console.error("POST /api/opportunities/:id/bookmark error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


/**
 * Helper to escape user-controlled text strings for safe HTML / SEO metadata insertion
 */
const sanitizeText = (text: any): string => {
  if (typeof text !== "string") return "";
  return escapeHtml(text.trim());
};

/**
 * Sanitizes array of strings (e.g. tags)
 */
const sanitizeArray = (arr: any): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => (typeof item === "string" ? escapeHtml(item.trim()) : ""));
};

// Composite Feed Ranking Engine based on relevance, freshness, quality, and engagement clicks
export async function getRankedOpportunities(database: any, profile: any, page: number, limit: number) {
  try {
    const skip = (page - 1) * limit;

    // Retain mock DB logic as a fallback for offline development
    if (database.isMock) {
      const currentDate = new Date();
      const cursor = database.collection("opportunities").find({
        $or: [
          { endDate: { $gte: currentDate } },
          { startDate: { $gte: currentDate } },
          { deadlineDate: { $gte: currentDate } },
          { deadline: { $regex: "days left|weeks left|rolling|active|open", $options: "i" } },
          { deadline: { $not: /closed|expired/i } },
          { endDate: { $exists: false }, startDate: { $exists: false }, deadlineDate: { $exists: false }, deadline: { $exists: false } }
        ]
      }).sort({ created_at: -1 }).limit(150);
      const opportunities = await cursor.toArray();

      if (opportunities.length === 0) {
        return { items: [], next_page: null };
      }

      const oIds = opportunities.map((o: any) => o._id ? o._id.toString() : o.id);
      const interactions = database ? await database.collection("interactions").find({
        opportunity_id: { $in: oIds }
      }).toArray() : [];

      const intMap: Record<string, { total: number, recent: number }> = {};
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

      interactions.forEach((i: any) => {
        const oId = i.opportunity_id;
        if (!intMap[oId]) {
          intMap[oId] = { total: 0, recent: 0 };
        }
        intMap[oId].total += 1;
        const iTime = i.timestamp ? new Date(i.timestamp) : new Date();
        if (iTime >= fortyEightHoursAgo) {
          intMap[oId].recent += 1;
        }
      });

      const now = Date.now();
      const profileSkills = profile.skills ? profile.skills.toLowerCase().split(',') : [];
      const profileCountry = profile.country ? profile.country.toLowerCase().trim() : "";
      const profileField = profile.field ? profile.field.toLowerCase().trim() : "";

      const scoredItems = opportunities.map((opp: any) => {
        const idStr = opp._id ? opp._id.toString() : opp.id;
        const stats = intMap[idStr] || { total: 0, recent: 0 };

        const engagementScore = stats.total * 15;
        const trendingScore = stats.recent * 30;
        const sourceQualityScore = opp.source_quality_score || 70;

        const createdTime = opp.created_at ? new Date(opp.created_at).getTime() : now;
        const hoursSinceCreation = Math.max(0, (now - createdTime) / (1000 * 60 * 60));
        const freshnessScore = (100 / (1 + (hoursSinceCreation * 0.15))) * 2.0;

        let profileRelevanceScore = 0;
        if (profileSkills.length > 0 && opp.tags) {
          const oppTagsLower = opp.tags.map((t: string) => t.toLowerCase());
          profileSkills.forEach((skill: string) => {
            const trimmed = skill.trim();
            if (trimmed && oppTagsLower.some((tag: string) => tag.includes(trimmed) || trimmed.includes(tag))) {
              profileRelevanceScore += 50;
            }
          });
        }

        if (profileField && opp.description) {
          if (opp.description.toLowerCase().includes(profileField) || opp.title.toLowerCase().includes(profileField)) {
            profileRelevanceScore += 40;
          }
        }

        if (profileCountry && opp.location) {
          const locLower = opp.location.toLowerCase();
          if (locLower.includes(profileCountry) || profileCountry.includes(locLower) || locLower.includes("online") || locLower.includes("remote")) {
            profileRelevanceScore += 35;
          }
        }

        const totalScore = engagementScore + trendingScore + sourceQualityScore + freshnessScore + profileRelevanceScore;

        return {
          ...opp,
          id: idStr,
          is_stale: hoursSinceCreation > 72,
          metrics: {
            totalScore: Math.round(totalScore),
            relevance: profileRelevanceScore,
            freshness: Math.round(freshnessScore),
            interactionRatio: stats.total
          }
        };
      });

      scoredItems.sort((a: any, b: any) => b.metrics.totalScore - a.metrics.totalScore);

      const paginatedItems = scoredItems.slice(skip, skip + limit);

      const mapped = paginatedItems.map((opp: any) => {
        const copy = { ...opp };
        delete copy._id;
        return copy;
      });

      return {
        items: mapped,
        next_page: skip + limit < scoredItems.length ? page + 1 : null
      };
    }

    // Native Meilisearch Query
    const profileSkills = profile.skills ? profile.skills.toLowerCase().replace(/,/g, ' ') : "";
    const profileCountry = profile.country ? profile.country.toLowerCase().trim() : "";
    const profileField = profile.field ? profile.field.toLowerCase().trim() : "";
    const searchQuery = `${profileSkills} ${profileField} ${profileCountry}`.trim();

    const searchLimit = limit * 3;
    const searchRes = await meiliClient.index('opportunities').search(searchQuery, {
      offset: skip,
      limit: searchLimit
    });
    let items = searchRes.hits;

    const nowTime = new Date().getTime();
    items = items.filter((item: any) => {
      if (item.endDate && new Date(item.endDate).getTime() < nowTime) return false;
      if (item.startDate && new Date(item.startDate).getTime() < nowTime) return false;
      if (item.deadlineDate && new Date(item.deadlineDate).getTime() < nowTime) return false;
      if (item.deadline && typeof item.deadline === 'string') {
        const dStr = item.deadline.toLowerCase();
        if (dStr.includes('closed') || dStr.includes('expired')) return false;
        const d = new Date(item.deadline);
        if (!isNaN(d.getTime()) && d.getTime() < nowTime) return false;
      }
      return true;
    });

    if (items.length === 0) {
      return { items: [], next_page: null };
    }

    const oIds = items.map((o: any) => o.id);
    const interactions = await database.collection("interactions").find({
      opportunity_id: { $in: oIds }
    }).toArray();

    const intMap: Record<string, { total: number, recent: number }> = {};
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    interactions.forEach((i: any) => {
      const oId = i.opportunity_id;
      if (!intMap[oId]) {
        intMap[oId] = { total: 0, recent: 0 };
      }
      intMap[oId].total += 1;
      const iTime = i.timestamp ? new Date(i.timestamp) : new Date();
      if (iTime >= fortyEightHoursAgo) {
        intMap[oId].recent += 1;
      }
    });

    const now = Date.now();
    const scoredItems = items.map((opp: any) => {
      const stats = intMap[opp.id] || { total: 0, recent: 0 };

      const engagementScore = stats.total * 15;
      const trendingScore = stats.recent * 30;
      const sourceQualityScore = opp.source_quality_score || 70;

      const createdTime = opp.created_at ? new Date(opp.created_at).getTime() : now;
      const hoursSinceCreation = Math.max(0, (now - createdTime) / (1000 * 60 * 60));
      const freshnessScore = (100 / (1 + (hoursSinceCreation * 0.15))) * 2.0;

      const totalScore = engagementScore + trendingScore + sourceQualityScore + freshnessScore;

      return {
        ...opp,
        is_stale: hoursSinceCreation > 72,
        metrics: {
          totalScore: Math.round(totalScore),
          relevance: opp.metrics?.relevance || 0,
          freshness: Math.round(freshnessScore),
          interactionRatio: stats.total
        }
      };
    });

    scoredItems.sort((a: any, b: any) => b.metrics.totalScore - a.metrics.totalScore);

    const paginatedItems = scoredItems.slice(0, limit);

    return {
      items: paginatedItems,
      next_page: searchRes.estimatedTotalHits && (skip + searchLimit < searchRes.estimatedTotalHits) ? page + 1 : null
    };
  } catch (scoreErr) {
    console.error("Scoring failure:", scoreErr);
    return { items: [], next_page: null };
  }
}

export const getOpportunities = async (req: Request, res: Response) => {
  try {
    let page = parseInt((req.query.page as string) || "1", 10);
    if (req.query.cursor) {
      const cInt = parseInt(req.query.cursor as string, 10);
      if (!isNaN(cInt) && cInt > 0) page = cInt;
    }
    const limit = parseInt((req.query.limit as string) || "10", 10);

    if (!dbCommand || !dbQuery) {
      return res.json({
        num_results: 1, next_page: null, next_cursor: null, items: [{
          id: "sys_nodeDbMissing", title: "Awaiting Live Ingestion...", organization: "Yuvahub System", type: "status", tags: ["system"], apply_link: "#"
        }]
      });
    }

    const profile = {
      skills: (req.query.skills as string) || "",
      country: (req.query.country as string) || "",
      field: (req.query.field as string) || ""
    };

    const result = await getRankedOpportunities(dbQuery, profile, page, limit);

    res.json({
      num_results: result.items.length,
      next_page: result.next_page,
      next_cursor: result.next_page ? String(result.next_page) : null,
      items: result.items
    });
  } catch (err) {
    console.error("/api/v1/opportunities error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getTrendingOpportunities = async (req: Request, res: Response) => {
  try {
    if (!dbCommand || !dbQuery) {
      return res.json({ num_results: 0, next_page: null, next_cursor: null, items: [] });
    }

    const result = await getRankedOpportunities(dbQuery, {}, 1, 5);

    res.json({
      num_results: result.items.length,
      next_page: null,
      next_cursor: null,
      items: result.items
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const semanticSearch = async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q) {
      return res.status(400).json({ error: "Missing query parameter 'q'" });
    }

    const queryEmbedding = await generateOpportunityEmbedding(q);
    if (!queryEmbedding) {
      return res.status(500).json({ error: "Failed to generate embedding for query" });
    }

    if (!dbQuery) {
      return res.json({ num_results: 0, items: [] });
    }

    const allOps = await dbQuery.collection("opportunities").find({ embedding: { $exists: true } }).toArray();

    const cosineSimilarity = (a: number[], b: number[]) => {
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
      }
      if (normA === 0 || normB === 0) return 0;
      return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    };

    const scoredItems = allOps.map((op: any) => {
      const score = cosineSimilarity(queryEmbedding, op.embedding);
      const { embedding, ...rest } = op;
      return { ...rest, score };
    });

    scoredItems.sort((a: any, b: any) => b.score - a.score);
    const items = scoredItems.slice(0, 10);

    res.json({ num_results: items.length, items });
  } catch (err) {
    console.error("/api/v1/opportunities/semantic-search error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getLatestOpportunities = async (req: Request, res: Response) => {
  try {
    if (!dbCommand || !dbQuery) {
      return res.json({ num_results: 0, items: [] });
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const now = new Date();

    const cursor = dbQuery.collection("opportunities")
      .find({
        created_at: { $gte: twentyFourHoursAgo },
        $or: [
          { endDate: { $gte: now } },
          { startDate: { $gte: now } },
          { deadlineDate: { $gte: now } },
          { deadline: { $regex: "days left|weeks left|rolling|active|open", $options: "i" } },
          { deadline: { $not: /closed|expired/i } },
          { endDate: { $exists: false }, startDate: { $exists: false }, deadlineDate: { $exists: false }, deadline: { $exists: false } }
        ]
      })
      .sort({ created_at: -1 })
      .limit(20);

    const items = await cursor.toArray();

    if (items.length === 0) {
      const fallbackCursor = dbQuery.collection("opportunities")
        .find({
          $or: [
            { endDate: { $gte: now } },
            { startDate: { $gte: now } },
            { deadlineDate: { $gte: now } },
            { deadline: { $regex: "days left|weeks left|rolling|active|open", $options: "i" } },
            { deadline: { $not: /closed|expired/i } },
            { endDate: { $exists: false }, startDate: { $exists: false }, deadlineDate: { $exists: false }, deadline: { $exists: false } }
          ]
        })
        .sort({ created_at: -1 })
        .limit(10);
      const fallbackItems = await fallbackCursor.toArray();
      return res.json({ num_results: fallbackItems.length, items: fallbackItems, fallback: true });
    }

    res.json({ num_results: items.length, items });
  } catch (err) {
    console.error("/api/v1/opportunities/latest error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const submitOpportunity = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!dbCommand) return res.status(503).json({ error: "Database not available" });

    const payload = req.body;
    const { randomUUID } = await import("crypto");

    // SEC-08 FIX: Sanitize user input fields to prevent Stored XSS in meta/SEO/HTML
    const cleanTitle = sanitizeText(payload.title);
    const cleanDescription = sanitizeText(payload.description);
    const cleanOrg = sanitizeText(payload.organization);
    const cleanCategory = sanitizeText(payload.type);
    const cleanTags = sanitizeArray(payload.tags);

    const doc = {
      title: cleanTitle,
      description: cleanDescription,
      source: cleanOrg,
      source_name: cleanOrg,
      source_url: payload.link,
      apply_link: payload.link,
      image_url: 'https://yuvahub.xyz/og-image.jpg',
      tags: cleanTags,
      category: cleanCategory,
      deadline: sanitizeText(payload.deadline),
      location: sanitizeText(payload.eligibility?.location),
      opportunity_type: cleanCategory,
      dedupe_hash: payload.link ? payload.link : randomUUID(),
      created_at: new Date(),
      updated_at: new Date(),
      embedding: null as number[] | null,
      status: 'pending_review',
      submitterUid: user.uid,
      contactEmail: payload.contactEmail
    };

    const embeddingText = `${doc.title} ${doc.source_name} ${doc.description} ${doc.opportunity_type}`;
    doc.embedding = await generateOpportunityEmbedding(embeddingText);

    await dbCommand.collection('opportunities').insertOne(doc);

    res.status(201).json({ success: true });
  } catch (err: any) {
    console.error("[Submit Opportunity API Error]", err);
    res.status(err.message?.startsWith("Unauthorized") ? 401 : 500).json({ error: err.message || "Internal Server Error" });
  }
};

export const getOpportunityById = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;

    if (typeof rawId === 'string' && (rawId.startsWith("fall_ai_") || rawId.startsWith("scout_"))) {
      return res.json({
        id: rawId,
        title: "AI Intelligent Fallback Match",
        organization: "YuvaHub AI Curated Network",
        description: "This is a dynamically matched intelligent opportunity generated during high-load fallback scenarios. The AI has evaluated your profile against market parameters and synthesized this optimal direction.",
        category: rawId.startsWith("scout_") ? "Scout Role" : "Fellowship",
        apply_link: "https://yuvahub.xyz",
        tags: ["AI Suggested", "High Match", "Fallback Pipeline"]
      });
    }

    if (!dbCommand || !dbQuery) {
      return res.status(404).json({ error: "Database offline" });
    }

    const oid = safeObjectId(rawId);
    const item = oid
      ? await dbQuery.collection("opportunities").findOne({ _id: oid })
      : await dbQuery.collection("opportunities").findOne({ id: rawId });
    if (!item) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    // SEC-08 FIX: Ensure title and description are escaped on response payload for SEO / Head metadata
    const mapped = {
      ...item,
      id: item._id.toString(),
      title: sanitizeText(item.title),
      description: sanitizeText(item.description),
      source_name: sanitizeText(item.source_name || item.source),
      tags: sanitizeArray(item.tags)
    };
    delete mapped._id;

    res.json(mapped);
  } catch (err) {
    console.error("/api/v1/opportunity/:id error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateOpportunity = async (req: Request, res: Response) => {
  try {
    if (!dbCommand || !dbQuery) return res.status(503).json({ error: "Database not available" });
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const oid = safeObjectId(id);
    const queryId = oid || id;

    const updateData = { ...req.body, updated_at: new Date() };
    delete updateData._id;
    delete updateData.id;

    // SEC-08 FIX: Sanitize updated fields if provided
    if (updateData.title) updateData.title = sanitizeText(updateData.title);
    if (updateData.description) updateData.description = sanitizeText(updateData.description);
    if (updateData.organization) updateData.organization = sanitizeText(updateData.organization);
    if (updateData.tags) updateData.tags = sanitizeArray(updateData.tags);

    const result = await dbCommand.collection("opportunities").updateOne(
      { _id: queryId },
      { $set: updateData }
    );

    // Cache invalidation hooks
    const { redisClient } = await import("../redis.js");
    if (redisClient && redisClient.status === 'ready') {
      try {
        await redisClient.del(`opportunity:${id}`);
        await redisClient.del("/api/v1/opportunities/trending");
      } catch (err) {
        console.error("[Cache] Invalidation error:", err);
      }
    }

    res.json({ success: true, updated: result.modifiedCount > 0 });
  } catch (err: any) {
    console.error("/api/v1/opportunity/:id PUT error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
