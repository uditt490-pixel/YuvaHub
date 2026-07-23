import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId } from "../../lib/utils.js";

export const handleListResumes = async (req: any, res: any) => {
  try {
    const user = req.user;
    if (!user || !user.uid) return res.status(401).json({ error: "Unauthorized" });
    if (!dbQuery) return res.status(503).json({ error: "Database unavailable" });

    const resumesCol = dbQuery.collection("resumes");
    const list = await resumesCol.find({ userId: user.uid }).sort({ isDefault: -1, uploadedAt: -1 }).toArray();
    const formatted = list.map((r: any) => ({ ...r, id: r._id.toString() }));
    res.json({ status: "success", resumes: formatted });
  } catch (err: any) {
    console.error("[Resumes] List error:", err);
    res.status(500).json({ error: err.message || "Failed to list resumes" });
  }
};

export const handleCreateResume = async (req: any, res: any) => {
  try {
    const user = req.user;
    if (!user || !user.uid) return res.status(401).json({ error: "Unauthorized" });
    if (!dbCommand) return res.status(503).json({ error: "Database unavailable" });

    const { displayName, originalFileName, fileUrl, publicId } = req.body || {};
    if (!fileUrl) {
      return res.status(400).json({ error: "Missing required fileUrl" });
    }

    const resumesCol = dbCommand.collection("resumes");
    const usersCol = dbCommand.collection("users");

    const existingCount = await resumesCol.countDocuments({ userId: user.uid });
    const isDefault = existingCount === 0 || req.body.isDefault === true;

    if (isDefault) {
      await resumesCol.updateMany({ userId: user.uid }, { $set: { isDefault: false } });
    }

    const now = new Date();
    const newResume = {
      userId: user.uid,
      displayName: (displayName && displayName.trim()) || (originalFileName && originalFileName.trim()) || "Untitled Resume",
      originalFileName: (originalFileName && originalFileName.trim()) || "resume.pdf",
      fileUrl,
      publicId: publicId || "",
      uploadedAt: now,
      updatedAt: now,
      isDefault
    };

    const result = await resumesCol.insertOne(newResume);
    const insertedId = result.insertedId.toString();

    if (isDefault) {
      await usersCol.updateOne(
        { uid: user.uid },
        { $set: { resumeUrl: fileUrl, resumePublicId: publicId || "", updatedAt: now } }
      );
    }

    res.status(201).json({ status: "success", resume: { ...newResume, id: insertedId } });
  } catch (err: any) {
    console.error("[Resumes] Create error:", err);
    res.status(500).json({ error: err.message || "Failed to create resume" });
  }
};

export const handleRenameResume = async (req: any, res: any) => {
  try {
    const user = req.user;
    if (!user || !user.uid) return res.status(401).json({ error: "Unauthorized" });
    if (!dbCommand) return res.status(503).json({ error: "Database unavailable" });

    const { id } = req.params;
    const { displayName } = req.body || {};

    if (!displayName || !displayName.trim()) {
      return res.status(400).json({ error: "displayName is required" });
    }

    const resumesCol = dbCommand.collection("resumes");
    const oid = safeObjectId(id);
    const query = oid
      ? { _id: oid, userId: user.uid }
      : { _id: id, userId: user.uid };

    const target = await resumesCol.findOne(query);
    if (!target) {
      return res.status(404).json({ error: "Resume not found or unauthorized" });
    }

    const now = new Date();
    await resumesCol.updateOne(query, { $set: { displayName: displayName.trim(), updatedAt: now } });

    const updated = await resumesCol.findOne(query);
    res.json({ status: "success", resume: { ...updated, id: updated._id.toString() } });
  } catch (err: any) {
    console.error("[Resumes] Rename error:", err);
    res.status(500).json({ error: err.message || "Failed to rename resume" });
  }
};

export const handleDeleteResume = async (req: any, res: any) => {
  try {
    const user = req.user;
    if (!user || !user.uid) return res.status(401).json({ error: "Unauthorized" });
    if (!dbCommand) return res.status(503).json({ error: "Database unavailable" });

    const { id } = req.params;
    const resumesCol = dbCommand.collection("resumes");
    const usersCol = dbCommand.collection("users");

    const oid = safeObjectId(id);
    const query = oid
      ? { _id: oid, userId: user.uid }
      : { _id: id, userId: user.uid };

    const target = await resumesCol.findOne(query);
    if (!target) {
      return res.status(404).json({ error: "Resume not found or unauthorized" });
    }

    await resumesCol.deleteOne(query);

    if (target.isDefault) {
      const remaining = await resumesCol.find({ userId: user.uid }).sort({ updatedAt: -1, uploadedAt: -1 }).toArray();
      if (remaining.length > 0) {
        const nextDefault = remaining[0];
        await resumesCol.updateOne({ _id: nextDefault._id }, { $set: { isDefault: true, updatedAt: new Date() } });
        await usersCol.updateOne({ uid: user.uid }, { $set: { resumeUrl: nextDefault.fileUrl, resumePublicId: nextDefault.publicId || "", updatedAt: new Date() } });
      } else {
        await usersCol.updateOne({ uid: user.uid }, { $set: { resumeUrl: "", resumePublicId: "", updatedAt: new Date() } });
      }
    }

    res.json({ status: "success", message: "Resume deleted successfully" });
  } catch (err: any) {
    console.error("[Resumes] Delete error:", err);
    res.status(500).json({ error: err.message || "Failed to delete resume" });
  }
};

export const handleSetDefaultResume = async (req: any, res: any) => {
  try {
    const user = req.user;
    if (!user || !user.uid) return res.status(401).json({ error: "Unauthorized" });
    if (!dbCommand) return res.status(503).json({ error: "Database unavailable" });

    const { id } = req.params;
    const resumesCol = dbCommand.collection("resumes");
    const usersCol = dbCommand.collection("users");

    const oid = safeObjectId(id);
    const query = oid
      ? { _id: oid, userId: user.uid }
      : { _id: id, userId: user.uid };

    const target = await resumesCol.findOne(query);
    if (!target) {
      return res.status(404).json({ error: "Resume not found or unauthorized" });
    }

    const now = new Date();
    await resumesCol.updateMany({ userId: user.uid }, { $set: { isDefault: false } });
    await resumesCol.updateOne(query, { $set: { isDefault: true, updatedAt: now } });

    await usersCol.updateOne({ uid: user.uid }, { $set: { resumeUrl: target.fileUrl, resumePublicId: target.publicId || "", updatedAt: now } });

    const updated = await resumesCol.findOne(query);
    res.json({ status: "success", resume: { ...updated, id: updated._id.toString() } });
  } catch (err: any) {
    console.error("[Resumes] Set default error:", err);
    res.status(500).json({ error: err.message || "Failed to set default resume" });
  }
};
