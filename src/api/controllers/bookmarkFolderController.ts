import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";

export const getFolders = async (req: Request, res: Response) => {
  try {
    const uid = req.query.uid as string || "user_default";
    if (dbQuery) {
      const folders = await dbQuery.collection("bookmark_folders").find({ uid }).toArray();
      if (folders.length > 0) {
        return res.json(folders);
      }
    }

    res.json([
      { folderId: "f_1", uid, name: "GSoC 2026", color: "blue", opportunityIds: [], createdAt: new Date().toISOString() },
      { folderId: "f_2", uid, name: "Backend Internships", color: "emerald", opportunityIds: [], createdAt: new Date().toISOString() },
      { folderId: "f_3", uid, name: "US Scholarships", color: "purple", opportunityIds: [], createdAt: new Date().toISOString() }
    ]);
  } catch (err) {
    console.error("Fetch Bookmark Folders Error:", err);
    res.status(500).json({ error: "Failed to fetch bookmark folders" });
  }
};

export const createFolder = async (req: Request, res: Response) => {
  try {
    const { name, color, uid } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Folder name is required" });
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

    res.status(201).json(folderDoc);
  } catch (err) {
    console.error("Create Bookmark Folder Error:", err);
    res.status(500).json({ error: "Failed to create bookmark folder" });
  }
};

export const deleteFolder = async (req: Request, res: Response) => {
  try {
    const { folderId } = req.params;
    const idStr = Array.isArray(folderId) ? folderId[0] : folderId;

    if (dbCommand) {
      await dbCommand.collection("bookmark_folders").deleteOne({ folderId: idStr });
    }

    res.json({ success: true, message: `Folder ${idStr} deleted successfully` });
  } catch (err) {
    console.error("Delete Bookmark Folder Error:", err);
    res.status(500).json({ error: "Failed to delete bookmark folder" });
  }
};

export const organizeBookmark = async (req: Request, res: Response) => {
  try {
    const { opportunityId, folderId, tags, uid } = req.body;
    const userUid = req.user?.uid || uid || "user_default";
    if (!opportunityId) {
      return res.status(400).json({ error: "opportunityId is required" });
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

    res.json({
      success: true,
      message: "Bookmark organized successfully",
      opportunityId,
      folderId: folderId || null,
      tags: tags || []
    });
  } catch (err) {
    console.error("Organize Bookmark Error:", err);
    res.status(500).json({ error: "Failed to organize bookmark" });
  }
};
