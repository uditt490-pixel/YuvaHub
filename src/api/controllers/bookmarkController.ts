import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId } from "../../lib/utils.js";

export const getBookmarks = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!dbQuery) return res.status(503).json({ error: "Database not available" });

    const userDoc = await dbQuery.collection("users").findOne({ uid: user.uid });
    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    const bookmarks = userDoc.bookmarks || [];
    res.json({ status: "success", bookmarks });
  } catch (err: any) {
    console.error("GET /api/v1/bookmarks error:", err);
    res.status(err.message?.startsWith("Unauthorized") ? 401 : 500).json({ error: err.message || "Internal Server Error" });
  }
};

export const addBookmark = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!dbQuery) return res.status(503).json({ error: "Database not available" });

    const { opportunityId } = req.body;
    if (!opportunityId) {
      return res.status(400).json({ error: "Missing opportunityId" });
    }

    // Check if opportunity exists (foreign key validation)
    // Use ObjectId when valid, fall back to string id for mock-DB compatibility
    const oid = safeObjectId(opportunityId);
    const query = oid ? { _id: oid } : { id: opportunityId };
    const opp = await dbQuery.collection("opportunities").findOne(query);
    if (!opp) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    const usersCollection = dbQuery.collection("users");
    // Add to bookmarks, ensuring uniqueness (duplicate prevention)
    await usersCollection.updateOne(
      { uid: user.uid },
      { $addToSet: { bookmarks: opportunityId } }
    );

    res.json({ status: "success", message: "Bookmark added successfully" });
  } catch (err: any) {
    console.error("POST /api/v1/bookmarks error:", err);
    res.status(err.message?.startsWith("Unauthorized") ? 401 : 500).json({ error: err.message || "Internal Server Error" });
  }
};

export const deleteBookmark = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!dbQuery) return res.status(503).json({ error: "Database not available" });

    const { opportunityId } = req.params;
    if (!opportunityId) {
      return res.status(400).json({ error: "Missing opportunityId" });
    }

    const usersCollection = dbQuery.collection("users");
    await usersCollection.updateOne(
      { uid: user.uid },
      { $pull: { bookmarks: opportunityId } }
    );

    res.json({ status: "success", message: "Bookmark removed successfully" });
  } catch (err: any) {
    console.error("DELETE /api/v1/bookmarks/:opportunityId error:", err);
    res.status(err.message?.startsWith("Unauthorized") ? 401 : 500).json({ error: err.message || "Internal Server Error" });
  }
};
