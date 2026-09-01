import { Request, Response, NextFunction } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId, parsePagination } from "../../lib/utils.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess, sendPaginated, sendServiceUnavailable } from "../../lib/apiResponse.js";
import { WatchlistRuleSchema } from "../../models/watchlistSchema.js";
import { matchOpportunityAgainstWatchlists } from "../../services/watchlistMatcher.js";

export const getWatchlists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!dbQuery) return sendServiceUnavailable(res);

    const { page, limit, skip } = parsePagination(req.query);
    const filter = { userId: user.uid };
    
    const [watchlists, total] = await Promise.all([
      dbQuery.collection("watchlists").find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      dbQuery.collection("watchlists").countDocuments(filter)
    ]);
    
    return sendPaginated(res, watchlists.map((w: any) => ({ ...w, id: w._id.toString() })), page, limit, total);
  } catch (err) {
    next(err);
  }
};

export const createWatchlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!dbCommand) throw AppError.serviceUnavailable("Database not available");

    const totalWatchlists = await dbCommand.collection("watchlists").countDocuments({ userId: user.uid });
    if (totalWatchlists >= 10) {
      throw AppError.badRequest("You can only have up to 10 watchlists.");
    }

    const parsed = WatchlistRuleSchema.parse(req.body);
    const watchlist = {
      ...parsed,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await dbCommand.collection("watchlists").insertOne(watchlist);
    
    return sendSuccess(res, { watchlist: { ...watchlist, id: result.insertedId.toString() } }, 201);
  } catch (err) {
    next(err);
  }
};

export const updateWatchlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!dbCommand) throw AppError.serviceUnavailable("Database not available");
    
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const oid = safeObjectId(id);
    if (!oid) throw AppError.badRequest("Invalid watchlist ID");

    const existing = await dbCommand.collection("watchlists").findOne({ _id: oid, userId: user.uid });
    if (!existing) throw AppError.notFound("Watchlist not found");

    const parsed = WatchlistRuleSchema.parse(req.body);
    const updateData = {
      ...parsed,
      updatedAt: new Date(),
    };
    
    // userId and createdAt should not be updated
    delete updateData.userId;
    delete (updateData as any).createdAt;

    await dbCommand.collection("watchlists").updateOne(
      { _id: oid, userId: user.uid },
      { $set: updateData }
    );
    
    return sendSuccess(res, { updated: true });
  } catch (err) {
    next(err);
  }
};

export const deleteWatchlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!dbCommand) throw AppError.serviceUnavailable("Database not available");
    
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const oid = safeObjectId(id);
    if (!oid) throw AppError.badRequest("Invalid watchlist ID");

    const result = await dbCommand.collection("watchlists").deleteOne({ _id: oid, userId: user.uid });
    if (result.deletedCount === 0) throw AppError.notFound("Watchlist not found");

    return sendSuccess(res, { deleted: true });
  } catch (err) {
    next(err);
  }
};

export const getWatchlistMatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!dbQuery) throw AppError.serviceUnavailable("Database not available");
    
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const oid = safeObjectId(id);
    if (!oid) throw AppError.badRequest("Invalid watchlist ID");

    const rule = await dbQuery.collection("watchlists").findOne({ _id: oid, userId: user.uid });
    if (!rule) throw AppError.notFound("Watchlist not found");

    const query: any = {};
    if (rule.filters.categories && rule.filters.categories.length > 0) {
      query.category = { $in: rule.filters.categories };
    }
    
    if (rule.filters.location) {
      query.location = { $regex: rule.filters.location, $options: "i" };
    }
    
    // Note: Stipend matching might be tricky if it's unstructured text in DB, 
    // for now we'll rely on categories/location.
    // Text search for keywords
    if (rule.filters.keywords && rule.filters.keywords.length > 0) {
      const keywordRegexes = rule.filters.keywords.map((kw: string) => new RegExp(kw, "i"));
      query.$or = [
        { title: { $in: keywordRegexes } },
        { description: { $in: keywordRegexes } },
        { tags: { $in: keywordRegexes } }
      ];
    }
    
    const { page, limit, skip } = parsePagination(req.query);
    
    // Sort by createdAt descending
    const [matches, total] = await Promise.all([
      dbQuery.collection("opportunities").find(query).sort({ created_at: -1 }).skip(skip).limit(limit).toArray(),
      dbQuery.collection("opportunities").countDocuments(query)
    ]);
    
    return sendPaginated(res, matches.map((m: any) => ({ ...m, id: m._id.toString() })), page, limit, total);
  } catch (err) {
    next(err);
  }
};
