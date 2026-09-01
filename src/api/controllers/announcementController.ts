import { Request, Response, NextFunction } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { parsePagination } from "../../lib/utils.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess, sendPaginated, sendServiceUnavailable } from "../../lib/apiResponse.js";
import { AnnouncementSchema } from "../../models/announcementSchema.js";
import { ObjectId } from "mongodb";

// Admin check helper
const isAdmin = (req: Request) => {
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  return req.user?.role === "admin" || req.user?.isAdmin || adminEmails.includes(req.user?.email?.toLowerCase() || "");
};

export const listAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbQuery) return sendServiceUnavailable(res);
    const { page, limit, skip } = parsePagination(req.query);
    const now = Date.now();

    const filter: any = {};
    
    // Only show active announcements to non-admins (or if specifically requested)
    if (!isAdmin(req) || req.query.activeOnly === 'true') {
      filter.$or = [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ];
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const [announcements, total] = await Promise.all([
      dbQuery.collection("announcements").find(filter).sort({ isPinned: -1, publishedAt: -1 }).skip(skip).limit(limit).toArray(),
      dbQuery.collection("announcements").countDocuments(filter)
    ]);
    
    return sendPaginated(res, announcements.map((a: any) => ({ ...a, id: a._id.toString() })), page, limit, total);
  } catch (err) {
    next(err);
  }
};

export const getActiveAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbQuery) return sendServiceUnavailable(res);
    const now = Date.now();
    const userId = req.user?.uid;

    const filter: any = {
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    };

    if (userId) {
      filter.dismissedBy = { $ne: userId };
    }

    // Usually banner announcements are high or critical priority
    const announcements = await dbQuery.collection("announcements")
      .find(filter)
      .sort({ priority: -1, publishedAt: -1 })
      .limit(5)
      .toArray();
      
    return sendSuccess(res, announcements.map((a: any) => ({ ...a, id: a._id.toString() })));
  } catch (err) {
    next(err);
  }
};

export const getAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbQuery || !dbCommand) return sendServiceUnavailable(res);
    
    const id = req.params.id as string;
    if (!ObjectId.isValid(id)) throw new AppError(400, "Invalid announcement ID");

    const announcement = await dbQuery.collection("announcements").findOne({ _id: new ObjectId(id) });
    if (!announcement) throw new AppError(404, "Announcement not found");

    // Increment view count asynchronously
    dbCommand.collection("announcements").updateOne(
      { _id: new ObjectId(id) },
      { $inc: { viewCount: 1 } }
    ).catch(console.error);

    return sendSuccess(res, { ...announcement, id: announcement._id.toString() });
  } catch (err) {
    next(err);
  }
};

export const createAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbCommand) return sendServiceUnavailable(res);
    if (!isAdmin(req)) throw new AppError(403, "Admin privileges required");

    const validatedData = AnnouncementSchema.parse({
      ...req.body,
      author: req.user?.email || "Admin",
      publishedAt: req.body.publishedAt || Date.now()
    });

    const result = await dbCommand.collection("announcements").insertOne(validatedData);
    
    return sendSuccess(res, { ...validatedData, id: result.insertedId.toString() }, 201);
  } catch (err) {
    next(err);
  }
};

export const updateAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbCommand) return sendServiceUnavailable(res);
    if (!isAdmin(req)) throw new AppError(403, "Admin privileges required");

    const id = req.params.id as string;
    if (!ObjectId.isValid(id)) throw new AppError(400, "Invalid announcement ID");

    // Partial update validation
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData._id;

    const result = await dbCommand.collection("announcements").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result || !result.value) throw new AppError(404, "Announcement not found");

    return sendSuccess(res, { ...result.value, id: result.value._id.toString() });
  } catch (err) {
    next(err);
  }
};

export const deleteAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbCommand) return sendServiceUnavailable(res);
    if (!isAdmin(req)) throw new AppError(403, "Admin privileges required");

    const id = req.params.id as string;
    if (!ObjectId.isValid(id)) throw new AppError(400, "Invalid announcement ID");

    const result = await dbCommand.collection("announcements").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) throw new AppError(404, "Announcement not found");

    return sendSuccess(res, { message: "Announcement deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const dismissAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbCommand) return sendServiceUnavailable(res);
    const userId = req.user?.uid;
    if (!userId) throw new AppError(401, "Authentication required");

    const id = req.params.id as string;
    if (!ObjectId.isValid(id)) throw new AppError(400, "Invalid announcement ID");

    const result = await dbCommand.collection("announcements").updateOne(
      { _id: new ObjectId(id) },
      { $addToSet: { dismissedBy: userId } as any }
    );

    if (result.matchedCount === 0) throw new AppError(404, "Announcement not found");

    return sendSuccess(res, { message: "Announcement dismissed" });
  } catch (err) {
    next(err);
  }
};
