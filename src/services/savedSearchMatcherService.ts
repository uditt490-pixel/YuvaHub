import { dbQuery, dbCommand } from "../api/db.js";
import { enqueueNotificationDispatch } from "../queues/notificationQueue.js";
import { logger } from "../utils/logger.js";

/**
 * Periodically evaluates active saved searches against new opportunities
 * and dispatches notifications/emails by queuing to notificationQueue.
 * Avoids N+1 queries by fetching new opportunities once and matching in memory.
 */
export async function runSavedSearchMatcher() {
  if (!dbQuery || !dbCommand) {
    logger.info("[SavedSearchMatcher] Database not available, skipping run.");
    return;
  }

  try {
    logger.info("[SavedSearchMatcher] Starting periodic check...");

    // Fetch all active saved searches
    const activeSearches = await dbQuery.collection("saved_searches").find({ isActive: true }).toArray();

    if (activeSearches.length === 0) {
      logger.info("[SavedSearchMatcher] No active saved searches found.");
      return;
    }

    // Determine the earliest lastMatchedAt date to fetch opportunities from.
    // If a search has no lastMatchedAt, default to 24 hours ago.
    const now = new Date();
    const defaultDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    let earliestDate = now;

    for (const search of activeSearches) {
      const matchDate = search.lastMatchedAt ? new Date(search.lastMatchedAt) : defaultDate;
      if (matchDate < earliestDate) {
        earliestDate = matchDate;
      }
    }

    // Fetch all opportunities created AFTER the earliest date (one query!)
    const recentOpportunities = await dbQuery.collection("opportunities").find({
      created_at: { $gt: earliestDate.toISOString() }
    }).toArray();

    if (recentOpportunities.length === 0) {
      logger.info("[SavedSearchMatcher] No new opportunities to match against.");
      return;
    }

    // Group matches by user
    const userMatches = new Map<string, { preferences: string, matches: any[] }>();
    const searchIdsToUpdate = [];

    for (const search of activeSearches) {
      const filters = search.filters || {};
      let searchMatched = false;

      // Filter the recently fetched opportunities in-memory
      for (const opp of recentOpportunities) {
        // Skip opportunities older than this specific search's lastMatchedAt
        const oppCreatedAt = new Date(opp.created_at);
        const searchMatchedAt = search.lastMatchedAt ? new Date(search.lastMatchedAt) : defaultDate;
        if (oppCreatedAt <= searchMatchedAt) continue;

        let matches = true;

        if (filters.types && filters.types.length > 0) {
          if (!filters.types.includes(opp.opportunityType)) matches = false;
        }

        if (matches && filters.location) {
          const locRegex = new RegExp(filters.location, "i");
          if (!locRegex.test(opp.location)) matches = false;
        }

        if (matches && filters.tags && filters.tags.length > 0) {
          const oppTags = opp.tags || [];
          const hasTag = filters.tags.some((t: string) => oppTags.includes(t));
          if (!hasTag) matches = false;
        }

        if (matches && filters.query) {
          const kw = filters.query.toLowerCase();
          const title = (opp.title || "").toLowerCase();
          const desc = (opp.description || "").toLowerCase();
          const comp = (opp.company || "").toLowerCase();
          if (!title.includes(kw) && !desc.includes(kw) && !comp.includes(kw)) matches = false;
        }

        if (matches && filters.remoteOnly) {
          const loc = (opp.location || "").toLowerCase();
          if (!loc.includes("remote") && !loc.includes("online") && !loc.includes("virtual")) {
            matches = false;
          }
        }

        if (matches && filters.deadlineAfter) {
          const oppDeadline = opp.deadline ? new Date(opp.deadline) : null;
          const filterDeadline = new Date(filters.deadlineAfter);
          if (!oppDeadline || oppDeadline <= filterDeadline) matches = false;
        }

        if (matches) {
          searchMatched = true;
          const existing = userMatches.get(search.userId) || { preferences: search.notificationPreference || "in_app", matches: [] };
          
          // Avoid duplicate opportunities if multiple searches match the same opp
          if (!existing.matches.find((m) => m._id.toString() === opp._id.toString())) {
            existing.matches.push(opp);
          }
          
          // Upgrade preferences if this search is 'both' or 'email' and existing is 'none' or 'in_app'
          if (search.notificationPreference === "both" || (search.notificationPreference === "email" && existing.preferences !== "both")) {
             existing.preferences = search.notificationPreference;
          } else if (search.notificationPreference === "in_app" && existing.preferences === "none") {
             existing.preferences = "in_app";
          }
          
          userMatches.set(search.userId, existing);
        }
      }

      if (searchMatched) {
        searchIdsToUpdate.push(search._id);
      }
    }

    // Queue notifications for each user
    let usersNotified = 0;
    for (const [userId, { preferences, matches }] of userMatches.entries()) {
      if (matches.length > 0 && preferences !== "none") {
        await enqueueNotificationDispatch({ userId, preferences, matches: matches.map(m => ({
           id: m._id.toString(),
           title: m.title,
           org: m.company || m.sourceName,
           location: m.location
        })) });
        usersNotified++;
      }
    }

    logger.info(`[SavedSearchMatcher] Check completed. Queued digests for ${usersNotified} users.`);

    // Bulk update lastMatchedAt for all successful searches
    if (searchIdsToUpdate.length > 0) {
      await dbCommand.collection("saved_searches").updateMany(
        { _id: { $in: searchIdsToUpdate } },
        { $set: { lastMatchedAt: now } }
      );
    }

  } catch (error) {
    logger.error({ err: error }, "[SavedSearchMatcher] Error running matcher");
  }
}
