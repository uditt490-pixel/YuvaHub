import { dbQuery, dbCommand } from "../api/db.js";

/**
 * Periodically evaluates active saved searches against new opportunities
 * and dispatches notifications/emails.
 */
export async function runSavedSearchMatcher() {
  if (!dbQuery || !dbCommand) {
    console.log("[SavedSearchMatcher] Database not available, skipping run.");
    return;
  }

  try {
    console.log("[SavedSearchMatcher] Starting periodic check...");
    
    // Fetch all active saved searches
    const activeSearches = await dbQuery.collection("saved_searches").find({ isActive: true }).toArray();

    if (activeSearches.length === 0) {
      console.log("[SavedSearchMatcher] No active saved searches found.");
      return;
    }

    const notificationsToInsert = [];

    for (const search of activeSearches) {
      const filters = search.filters || {};
      const query: any = {};
      
      // Only find opportunities created AFTER lastMatchedAt
      if (search.lastMatchedAt) {
        query.created_at = { $gt: new Date(search.lastMatchedAt).toISOString() };
      }

      if (filters.types && filters.types.length > 0) {
        query.opportunityType = { $in: filters.types };
      }
      
      if (filters.location) {
        query.location = { $regex: filters.location, $options: "i" };
      }
      
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }
      
      if (filters.query) {
        const keywordRegex = new RegExp(filters.query, "i");
        query.$or = [
          { title: { $regex: keywordRegex } },
          { description: { $regex: keywordRegex } },
          { company: { $regex: keywordRegex } }
        ];
      }
      
      if (filters.remoteOnly) {
        if (query.$or) {
          query.location = { $regex: /remote|online|virtual/i };
        } else {
          query.location = { $regex: /remote|online|virtual/i };
        }
      }
      
      if (filters.deadlineAfter) {
        query.deadline = { $gt: filters.deadlineAfter };
      }

      const matches = await dbQuery.collection("opportunities").find(query).toArray();

      if (matches.length > 0) {
        console.log(`[SavedSearchMatcher] Found ${matches.length} matches for user ${search.userId} on search "${search.name}"`);
        
        // Prepare notifications based on preferences
        if (search.notificationPreference === "in_app" || search.notificationPreference === "both") {
          notificationsToInsert.push({
            userId: search.userId,
            type: "saved_search_match",
            title: `New Matches for "${search.name}"!`,
            message: `Found ${matches.length} new opportunit${matches.length > 1 ? 'ies' : 'y'} matching your saved search criteria.`,
            link: `/opportunities?searchId=${search._id}`,
            read: false,
            createdAt: new Date(),
          });
        }
        
        // For 'email' or 'both', you'd integrate with EmailWorker/Service here.
        // if (search.notificationPreference === "email" || search.notificationPreference === "both") {
        //    emailService.sendSavedSearchMatch(...)
        // }

        // Update lastMatchedAt to now
        await dbCommand.collection("saved_searches").updateOne(
          { _id: search._id },
          { $set: { lastMatchedAt: new Date() } }
        );
      }
    }

    if (notificationsToInsert.length > 0) {
      await dbCommand.collection("notifications").insertMany(notificationsToInsert);
    }
    
    console.log("[SavedSearchMatcher] Check completed.");

  } catch (error) {
    console.error("[SavedSearchMatcher] Error running matcher:", error);
  }
}
