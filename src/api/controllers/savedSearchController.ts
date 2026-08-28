import { Request, Response, NextFunction } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId, parsePagination } from "../../lib/utils.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess, sendPaginated, sendServiceUnavailable } from "../../lib/apiResponse.js";
import { SavedSearchSchema } from "../../models/savedSearchSchema.js";

export const getSavedSearches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!dbQuery) return sendServiceUnavailable(res);

    const { page, limit, skip } = parsePagination(req.query);
    const filter = { userId: user.uid };
    
    const [searches, total] = await Promise.all([
      dbQuery.collection("saved_searches").find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      dbQuery.collection("saved_searches").countDocuments(filter)
    ]);
    
    return sendPaginated(res, searches.map((s: any) => ({ ...s, id: s._id.toString() })), page, limit, total);
  } catch (err) {
    next(err);
  }
};

export const createSavedSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!dbCommand) throw AppError.serviceUnavailable("Database not available");

    const totalSearches = await dbCommand.collection("saved_searches").countDocuments({ userId: user.uid });
    if (totalSearches >= 10) {
      throw AppError.badRequest("You can only have up to 10 saved searches.");
    }

    const parsed = SavedSearchSchema.parse(req.body);
    const savedSearch = {
      ...parsed,
      userId: user.uid,
      lastMatchedAt: new Date(), // Initialize with current time so we don't alert on old things
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await dbCommand.collection("saved_searches").insertOne(savedSearch);
    
    return sendSuccess(res, { savedSearch: { ...savedSearch, id: result.insertedId.toString() } }, 201);
  } catch (err) {
    next(err);
  }
};

export const updateSavedSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!dbCommand) throw AppError.serviceUnavailable("Database not available");
    
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const oid = safeObjectId(id);
    if (!oid) throw AppError.badRequest("Invalid saved search ID");

    const existing = await dbCommand.collection("saved_searches").findOne({ _id: oid, userId: user.uid });
    if (!existing) throw AppError.notFound("Saved search not found");

    const parsed = SavedSearchSchema.parse(req.body);
    const updateData = {
      ...parsed,
      updatedAt: new Date(),
    };
    
    // userId, lastMatchedAt and createdAt should not be updated by user
    delete updateData.userId;
    delete (updateData as any).createdAt;
    delete (updateData as any).lastMatchedAt;

    await dbCommand.collection("saved_searches").updateOne(
      { _id: oid, userId: user.uid },
      { $set: updateData }
    );
    
    return sendSuccess(res, { updated: true });
  } catch (err) {
    next(err);
  }
};

export const deleteSavedSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!dbCommand) throw AppError.serviceUnavailable("Database not available");
    
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const oid = safeObjectId(id);
    if (!oid) throw AppError.badRequest("Invalid saved search ID");

    const result = await dbCommand.collection("saved_searches").deleteOne({ _id: oid, userId: user.uid });
    if (result.deletedCount === 0) throw AppError.notFound("Saved search not found");

    return sendSuccess(res, { deleted: true });
  } catch (err) {
    next(err);
  }
};

export const previewSavedSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbQuery) throw AppError.serviceUnavailable("Database not available");
    
    // Validate filters from query or body
    const filters = SavedSearchSchema.shape.filters.parse(req.body.filters || {});
    
    const query: any = {};
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
        // Just add an extra condition
        query.location = { $regex: /remote|online|virtual/i };
      } else {
        query.location = { $regex: /remote|online|virtual/i };
      }
    }
    
    if (filters.deadlineAfter) {
      query.deadline = { $gt: filters.deadlineAfter.toISOString() };
    }
    
    // Limit to 5 for preview
    const limit = 5;
    
    const matches = await dbQuery.collection("opportunities").find(query).sort({ created_at: -1 }).limit(limit).toArray();
    
    return sendSuccess(res, { 
      matches: matches.map((m: any) => ({ ...m, id: m._id.toString() })),
      count: matches.length 
    });
  } catch (err) {
    next(err);
  }
};
