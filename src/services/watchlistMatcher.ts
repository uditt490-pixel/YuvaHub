import { dbQuery, dbCommand } from "../api/db.js";

/**
 * Matches a newly inserted opportunity against all active watchlists.
 * Finds matched users and triggers a notification for them.
 */
export async function matchOpportunityAgainstWatchlists(opportunity: any) {
  if (!dbQuery || !dbCommand) {
    console.log("[WatchlistMatcher] Database not available, skipping match.");
    return;
  }

  try {
    // 1. Fetch all active watchlists
    // Note: For a very large scale we might want to do reverse matching 
    // where we build a query from the opportunity and find watchlists. 
    // For now, fetching all and filtering is acceptable if number of watchlists is moderate,
    // or we can run a simple matching logic in-memory.
    
    // We could optimize this by only fetching watchlists where location matches or category matches.
    // To make it simple and efficient, let's just query Mongo for all watchlists
    const watchlists = await dbQuery.collection("watchlists").find({}).toArray();

    if (watchlists.length === 0) return;

    const matchedUsers = new Set<string>();
    
    // Convert opportunity text to lowercase for keyword matching
    const opTitle = (opportunity.title || "").toLowerCase();
    const opDesc = (opportunity.description || "").toLowerCase();
    const opTags = Array.isArray(opportunity.tags) ? opportunity.tags.map((t: string) => t.toLowerCase()) : [];
    
    for (const rule of watchlists) {
      let matched = false;

      // 1. Match category
      if (rule.filters.categories && rule.filters.categories.length > 0) {
        if (!rule.filters.categories.includes(opportunity.category)) {
          continue; // Skip if category doesn't match
        }
      }

      // 2. Match location
      if (rule.filters.location && opportunity.location) {
        const ruleLoc = rule.filters.location.toLowerCase();
        const opLoc = opportunity.location.toLowerCase();
        if (!opLoc.includes(ruleLoc)) {
          continue;
        }
      }

      // 3. Match keywords
      if (rule.filters.keywords && rule.filters.keywords.length > 0) {
        let keywordMatch = false;
        for (const kw of rule.filters.keywords) {
          const lowerKw = kw.toLowerCase();
          if (
            opTitle.includes(lowerKw) ||
            opDesc.includes(lowerKw) ||
            opTags.includes(lowerKw)
          ) {
            keywordMatch = true;
            break;
          }
        }
        if (!keywordMatch) {
          continue;
        }
      }

      // If we got here, it's a match!
      matched = true;
      if (matched && rule.userId) {
        matchedUsers.add(rule.userId);
      }
    }

    // Trigger notifications for all matched users
    if (matchedUsers.size > 0) {
      console.log(`[WatchlistMatcher] Found matches for ${matchedUsers.size} users for opportunity: ${opportunity.title}`);
      
      const notifications = Array.from(matchedUsers).map(userId => ({
        userId,
        type: "new_opportunity",
        title: "New Watchlist Match!",
        message: `A new opportunity "${opportunity.title}" matched your watchlist criteria.`,
        link: `/opportunities/${opportunity.id || opportunity._id}`,
        read: false,
        createdAt: new Date(),
      }));

      await dbCommand.collection("notifications").insertMany(notifications);
      // In a full implementation, you would also trigger socket.io emissions here.
      // E.g. io.to(userId).emit("notification", ...)
    }
  } catch (error) {
    console.error("[WatchlistMatcher] Error matching opportunity:", error);
  }
}
