import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { sendSuccess } from "../../lib/apiResponse.js";
import { CURATED_FALLBACKS } from "../../services/staticFallbacks.js";

export const searchHandler = async (req: Request, res: Response) => {
  const q = ((req.query.q as string) || "").trim();
  const typesStr = req.query.types as string;
  const locationTypesStr = req.query.locationTypes as string;
  const stipend = req.query.stipend as string;
  const minSalaryVal = req.query.minSalary ? parseInt(req.query.minSalary as string, 10) : undefined;
  const deadlineType = req.query.deadlineType as string;
  const startDateStr = req.query.startDate as string;
  const endDateStr = req.query.endDate as string;
  const isFreeStr = req.query.isFree as string;
  const verifiedOnlyStr = req.query.verifiedOnly as string;
  const sortBy = (req.query.sortBy as string) || "Most relevant";

  // Pagination parameters
  const pageParam = parseInt(req.query.page as string, 10);
  const limitParam = parseInt(req.query.limit as string, 10);
  const page = !isNaN(pageParam) && pageParam > 0 ? pageParam : 1;
  const limit = !isNaN(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 12;
  const skip = (page - 1) * limit;

  const andConditions: any[] = [];

  // Text search condition
  if (q) {
    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    andConditions.push({
      $or: [
        { title: { $regex: escapedQuery, $options: "i" } },
        { description: { $regex: escapedQuery, $options: "i" } },
        { company: { $regex: escapedQuery, $options: "i" } },
        { organization: { $regex: escapedQuery, $options: "i" } },
        { tags: { $elemMatch: { $regex: escapedQuery, $options: "i" } } },
        { tags: { $regex: escapedQuery, $options: "i" } },
        { type: { $regex: escapedQuery, $options: "i" } },
        { opportunity_type: { $regex: escapedQuery, $options: "i" } },
        { location: { $regex: escapedQuery, $options: "i" } }
      ]
    });
  }

  // 1. Opportunity Type Filter (multiple types supported)
  if (typesStr) {
    const types = typesStr.split(",").map(t => t.trim()).filter(Boolean);
    if (types.length > 0) {
      const typeRegexes = types.map(t => new RegExp(`^${t.replace(/s$/i, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i"));
      andConditions.push({
        $or: [
          { type: { $in: typeRegexes } },
          { opportunity_type: { $in: typeRegexes } },
          { tags: { $in: typeRegexes } }
        ]
      });
    }
  }

  // 2. Location Type Filter (Remote, Onsite, Hybrid)
  if (locationTypesStr) {
    const locationTypes = locationTypesStr.split(",").map(l => l.trim().toLowerCase()).filter(Boolean);
    const locFilters: any[] = [];
    if (locationTypes.includes('remote')) {
      locFilters.push({ location: { $regex: "remote|online|virtual", $options: "i" } });
    }
    if (locationTypes.includes('hybrid')) {
      locFilters.push({ location: { $regex: "hybrid", $options: "i" } });
    }
    if (locationTypes.includes('onsite')) {
      locFilters.push({
        $and: [
          { location: { $not: /remote|online|virtual/i } },
          { location: { $not: /hybrid/i } }
        ]
      });
    }
    if (locFilters.length > 0) {
      andConditions.push({ $or: locFilters });
    }
  }

  // 3. Stipend / Salary Filter
  if (stipend && stipend !== 'All') {
    if (stipend.toLowerCase() === 'paid') {
      andConditions.push({
        $or: [
          { stipend: { $regex: "^paid$", $options: "i" } },
          { price: { $nin: ["free", "Free", 0, "0", null] } },
          { stipendAmount: { $gt: 0 } },
          { salary: { $gt: 0 } }
        ]
      });
    } else if (stipend.toLowerCase() === 'unpaid') {
      andConditions.push({
        $or: [
          { stipend: { $in: ["unpaid", "free", "Free"] } },
          { price: { $in: ["free", "Free", 0, "0", null] } },
          { stipendAmount: { $in: [0, null] } },
          { salary: { $in: [0, null] } }
        ]
      });
    }
  }

  // 4. Min Salary / Stipend Filter
  if (minSalaryVal !== undefined && !isNaN(minSalaryVal) && minSalaryVal > 0) {
    andConditions.push({
      $or: [
        { stipendAmount: { $gte: minSalaryVal } },
        { salary: { $gte: minSalaryVal } }
      ]
    });
  }

  // 5. Free to Apply Filter
  if (isFreeStr === "true") {
    andConditions.push({
      $or: [
        { "applicationFee.isFree": true },
        { isFree: true },
        { price: { $in: ["free", "Free", 0, "0", null] } },
        { price: { $exists: false } }
      ]
    });
  }

  // 6. Verified Audit Filter
  if (verifiedOnlyStr === "true") {
    andConditions.push({
      $or: [
        { "verificationDetails.isVerified": true },
        { isVerified: true },
        { verified: true },
        { source_quality_score: { $gte: 80 } }
      ]
    });
  }

  // 7. Deadline Filter
  if (deadlineType && deadlineType !== 'All') {
    const now = new Date();
    if (deadlineType === 'Soon') {
      const fortyEightHoursLater = new Date(Date.now() + 48 * 60 * 60 * 1000);
      andConditions.push({
        $or: [
          { deadlineDate: { $gte: now, $lte: fortyEightHoursLater } },
          { deadline: { $regex: "([0-1]|2)\\s*days?(\\s*left)?|24\\s*hours?", $options: "i" } }
        ]
      });
    } else if (deadlineType === 'Active') {
      andConditions.push({
        $or: [
          { deadlineDate: { $gte: now } },
          { deadline: { $regex: "days left|weeks left|rolling|active|open", $options: "i" } },
          { deadline: { $not: /closed|expired/i } }
        ]
      });
    } else if (deadlineType === 'Custom' && startDateStr && endDateStr) {
      andConditions.push({
        $or: [
          { deadlineDate: { $gte: new Date(startDateStr), $lte: new Date(endDateStr) } },
          { deadline: { $gte: startDateStr, $lte: endDateStr } }
        ]
      });
    }
  }

  // Determine sort specification
  let sortSpec: Record<string, 1 | -1> = { created_at: -1, _id: -1 };
  if (sortBy === "Recently added") {
    sortSpec = { created_at: -1, _id: -1 };
  } else if (sortBy === "Deadline (soonest)") {
    sortSpec = { deadlineDate: 1, deadline: 1 };
  } else if (sortBy === "Highest stipend") {
    sortSpec = { stipendAmount: -1, salary: -1 };
  } else if (sortBy === "Highest salary") {
    sortSpec = { salary: -1, stipendAmount: -1 };
  } else if (sortBy === "Most relevant" && !q) {
    sortSpec = { source_quality_score: -1, created_at: -1 };
  }

  // Handle fallback when DB is disconnected
  if (!dbCommand || !dbQuery) {
    let memoryMatches = CURATED_FALLBACKS.filter(item => {
      if (q) {
        const text = `${item.title} ${item.description} ${item.organization} ${item.tags?.join(" ") || ""}`.toLowerCase();
        if (!text.includes(q.toLowerCase())) return false;
      }
      if (typesStr) {
        const types = typesStr.toLowerCase().split(",").map(t => t.trim());
        if (!types.some(t => item.type?.toLowerCase().includes(t.replace(/s$/, "")))) return false;
      }
      if (locationTypesStr) {
        const loc = item.location?.toLowerCase() || "";
        const reqLocs = locationTypesStr.toLowerCase().split(",").map(l => l.trim());
        if (reqLocs.includes("remote") && !loc.includes("remote") && !loc.includes("online")) return false;
      }
      if (isFreeStr === "true" && item.applicationFee && !item.applicationFee.isFree) return false;
      if (verifiedOnlyStr === "true" && item.verificationDetails && !item.verificationDetails.isVerified) return false;
      return true;
    });

    const totalItems = memoryMatches.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const paginated = memoryMatches.slice(skip, skip + limit);

    return sendSuccess(res, {
      results: paginated,
      items: paginated,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      meta: {
        query: q,
        total_found: totalItems,
        page,
        limit,
        totalPages,
        sortBy
      }
    });
  }

  try {
    const filter: any = andConditions.length > 0 ? { $and: andConditions } : {};

    // Get total matching count and paginated items concurrently
    const [totalFound, items] = await Promise.all([
      dbQuery.collection("opportunities").countDocuments(filter),
      dbQuery.collection("opportunities").find(filter).sort(sortSpec).skip(skip).limit(limit).toArray()
    ]);

    const mapped = items.map((doc: any) => {
      const docId = doc._id ? doc._id.toString() : (doc.id ? doc.id.toString() : "");
      const d = { ...doc, id: docId };
      delete d._id;
      return d;
    });

    const totalPages = Math.max(1, Math.ceil(totalFound / limit));

    return sendSuccess(res, {
      results: mapped,
      items: mapped,
      pagination: {
        page,
        limit,
        totalItems: totalFound,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      meta: {
        query: q,
        total_found: totalFound,
        page,
        limit,
        totalPages,
        sortBy
      }
    });
  } catch (err) {
    console.error("[searchHandler] Database search error:", err);
    return sendSuccess(res, {
      results: [],
      items: [],
      pagination: {
        page,
        limit,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      },
      meta: { query: q, total_found: 0, page, limit, totalPages: 0 }
    });
  }
};
