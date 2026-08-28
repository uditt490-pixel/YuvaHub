import { Request, Response, NextFunction } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { parsePagination } from "../../lib/utils.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess, sendPaginated, sendServiceUnavailable } from "../../lib/apiResponse.js";
import { ActivityEventSchema, DigestPreferenceSchema, ActivityEvent } from "../../models/activitySchema.js";

// Helper function for controllers to record activity
export const recordActivity = async (activity: ActivityEvent) => {
  if (!dbCommand) return;
  try {
    const validated = ActivityEventSchema.parse(activity);
    await dbCommand.collection("activity_events").insertOne(validated);
  } catch (err) {
    console.error("Failed to record activity:", err);
  }
};

export const getUserActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbQuery) return sendServiceUnavailable(res);
    const user = req.user;
    const { page, limit, skip } = parsePagination(req.query);
    
    const filter: any = { userId: user.uid };
    
    // Type filtering
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    // Date range filtering
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: parseInt(req.query.startDate as string, 10),
        $lte: parseInt(req.query.endDate as string, 10)
      };
    } else if (req.query.startDate) {
      filter.createdAt = { $gte: parseInt(req.query.startDate as string, 10) };
    } else if (req.query.endDate) {
      filter.createdAt = { $lte: parseInt(req.query.endDate as string, 10) };
    }

    const [activities, total] = await Promise.all([
      dbQuery.collection("activity_events").find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      dbQuery.collection("activity_events").countDocuments(filter)
    ]);
    
    return sendPaginated(res, activities.map((a: any) => ({ ...a, id: a._id.toString() })), page, limit, total);
  } catch (err) {
    next(err);
  }
};

export const getActivityStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbQuery) return sendServiceUnavailable(res);
    const user = req.user;
    
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    // 1. Total Actions
    const totalActions = await dbQuery.collection("activity_events").countDocuments({ userId: user.uid });
    
    // 2. Weekly Karma
    const weeklyKarmaEvents = await dbQuery.collection("activity_events").find({
      userId: user.uid,
      type: "karma_earned",
      createdAt: { $gte: oneWeekAgo }
    }).toArray();
    
    const weeklyKarma = weeklyKarmaEvents.reduce((acc, curr) => acc + (curr.points || 0), 0);
    
    // 3. Active Streak (simple implementation: days with at least one activity in the last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentEvents = await dbQuery.collection("activity_events")
      .find({ userId: user.uid, createdAt: { $gte: thirtyDaysAgo } })
      .sort({ createdAt: -1 })
      .toArray();
      
    let streak = 0;
    const activeDates = new Set();
    
    for (const event of recentEvents) {
      const dateStr = new Date(event.createdAt).toDateString();
      activeDates.add(dateStr);
    }
    
    streak = activeDates.size;
    
    return sendSuccess(res, {
      totalActions,
      weeklyKarma,
      streak
    });
  } catch (err) {
    next(err);
  }
};

export const getDigestPreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbQuery) return sendServiceUnavailable(res);
    const user = req.user;
    
    const pref = await dbQuery.collection("digest_preferences").findOne({ userId: user.uid });
    if (!pref) {
      return sendSuccess(res, { frequency: "None", email: user.email });
    }
    
    return sendSuccess(res, pref);
  } catch (err) {
    next(err);
  }
};

export const setDigestPreference = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbCommand) return sendServiceUnavailable(res);
    const user = req.user;
    
    const validatedData = DigestPreferenceSchema.parse({
      ...req.body,
      userId: user.uid,
      email: req.body.email || user.email
    });
    
    await dbCommand.collection("digest_preferences").updateOne(
      { userId: user.uid },
      { $set: validatedData },
      { upsert: true }
    );
    
    return sendSuccess(res, { message: "Preferences updated successfully", preference: validatedData });
  } catch (err) {
    next(err);
  }
};
