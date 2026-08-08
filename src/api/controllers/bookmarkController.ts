import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId } from "../../lib/utils.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess } from "../../lib/apiResponse.js";

export const getBookmarks = async (req: Request, res: Response) => {
  const user = req.user;
  if (!dbQuery) throw AppError.serviceUnavailable("Database not available");

  const userDoc = await dbQuery.collection("users").findOne({ uid: user.uid });
  if (!userDoc) {
    throw AppError.notFound("User not found");
  }

  const bookmarks = userDoc.bookmarks || [];
  return sendSuccess(res, { bookmarks });
};

export const addBookmark = async (req: Request, res: Response) => {
  const user = req.user;
  if (!dbQuery) throw AppError.serviceUnavailable("Database not available");

  const { opportunityId } = req.body;
  if (!opportunityId) {
    throw AppError.badRequest("Missing opportunityId");
  }

  // Check if opportunity exists (foreign key validation)
  // Use ObjectId when valid, fall back to string id for mock-DB compatibility
  const oid = safeObjectId(opportunityId);
  const query = oid ? { _id: oid } : { id: opportunityId };
  const opp = await dbQuery.collection("opportunities").findOne(query);
  if (!opp) {
    throw AppError.notFound("Opportunity not found");
  }

  const usersCollection = dbCommand.collection("users");
  // Add to bookmarks, ensuring uniqueness (duplicate prevention)
  await usersCollection.updateOne(
    { uid: user.uid },
    { $addToSet: { bookmarks: opportunityId } }
  );

  return sendSuccess(res, { message: "Bookmark added successfully" });
};

export const deleteBookmark = async (req: Request, res: Response) => {
  const user = req.user;
  if (!dbQuery) throw AppError.serviceUnavailable("Database not available");

  const { opportunityId } = req.params;
  if (!opportunityId) {
    throw AppError.badRequest("Missing opportunityId");
  }

  const usersCollection = dbCommand.collection("users");
  await usersCollection.updateOne(
    { uid: user.uid },
    { $pull: { bookmarks: opportunityId } }
  );

  return sendSuccess(res, { message: "Bookmark removed successfully" });
};
