import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { parsePagination } from "../../lib/utils.js";
import { paginate } from "../../lib/pagination.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess, sendError, sendPaginated } from "../../lib/apiResponse.js";

export const getFolders = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const uid = req.query.uid as string || "user_default";
    if (dbQuery) {
      const filter = { uid };
      const [folders, total] = await Promise.all([
        dbQuery.collection("bookmark_folders").find(filter).skip(skip).limit(limit).toArray(),
        dbQuery.collection("bookmark_folders").countDocuments(filter)
      ]);
      if (folders.length > 0) {
        return sendPaginated(res, folders, page, limit, total);
      }
    }

    const defaults = [
      { folderId: "f_1", uid, name: "GSoC 2026", color: "blue", opportunityIds: [], createdAt: new Date().toISOString() },
      { folderId: "f_2", uid, name: "Backend Internships", color: "emerald", opportunityIds: [], createdAt: new Date().toISOString() },
      { folderId: "f_3", uid, name: "US Scholarships", color: "purple", opportunityIds: [], createdAt: new Date().toISOString() }
    ];
    const sliced = defaults.slice(skip, skip + limit);
    return sendPaginated(res, sliced, page, limit, defaults.length);
  } catch (err) {
    console.error("Fetch Bookmark Folders Error:", err);
    return sendError(res, "Failed to fetch bookmark folders", 500);
  }
};

export const createFolder = async (req: Request, res: Response) => {
  const { name, color, uid } = req.body;
  if (!name) {
    throw AppError.badRequest("Folder name is required");
  }

  const folderDoc = {
    folderId: "f_" + Date.now(),
    uid: req.user?.uid || uid || "user_default",
    name: name.trim(),
    color: color || "blue",
    opportunityIds: [] as string[],
    createdAt: new Date()
  };

  if (dbCommand) {
    await dbCommand.collection("bookmark_folders").insertOne(folderDoc);
  }

  return sendSuccess(res, folderDoc, 201);
};

export const deleteFolder = async (req: Request, res: Response) => {
  const { folderId } = req.params;
  const idStr = Array.isArray(folderId) ? folderId[0] : folderId;

  if (dbCommand) {
    await dbCommand.collection("bookmark_folders").deleteOne({ folderId: idStr });
  }

  sendSuccess(res, { message: `Folder ${idStr} deleted successfully` });
};

export const organizeBookmark = async (req: Request, res: Response) => {
  const { opportunityId, folderId, tags, uid } = req.body;
  const userUid = req.user?.uid || uid || "user_default";
  if (!opportunityId) {
    throw AppError.badRequest("opportunityId is required");
  }

  if (dbCommand && folderId) {
    await dbCommand.collection("bookmark_folders").updateMany(
      { uid: userUid },
      { $pull: { opportunityIds: opportunityId } as any }
    );
    await dbCommand.collection("bookmark_folders").updateOne(
      { folderId },
      { $addToSet: { opportunityIds: opportunityId } as any }
    );
  }

  sendSuccess(res, {
    message: "Bookmark organized successfully",
    opportunityId,
    folderId: folderId || null,
    tags: tags || []
  });
};
