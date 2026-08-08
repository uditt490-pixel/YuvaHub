import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId } from "../../lib/utils.js";
import { deleteFirebaseUser } from "../middlewares/auth.js";
import { calculateProfileProgress } from "../services/profileProgressService.js";
import { sendSuccess, sendServiceUnavailable, sendNotFound, sendError } from "../../lib/apiResponse.js";

export const syncUser = (req: Request, res: Response) => {
  return sendSuccess(res, { user: req.user });
};

export const deleteAccount = async (req: Request, res: Response) => {
  const uid = req.user.uid;

  // 1. Delete from Firebase Auth
  await deleteFirebaseUser(uid);

  // 2. Delete from MongoDB
  if (dbCommand) {
    await dbCommand.collection("users").deleteOne({ firebaseUid: uid });

    // Also clean up any associated data
    await dbCommand.collection("interactions").deleteMany({ firebaseUid: uid });
    // Add more cleanup as needed (e.g. saved opportunities, profiles, etc.)
  }

  return sendSuccess(res, { message: "Account completely deleted" });
};

export const getSavedOpportunities = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!dbQuery) return sendServiceUnavailable(res, "Database not available");

    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const savedOps = await dbQuery.collection("saved_opportunities")
      .find({ userId: user.uid })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    if (savedOps.length === 0) {
      return sendSuccess(res, { items: [], total: 0 });
    }

    const opportunityIds = savedOps.map((s: any) => {
      const oid = safeObjectId(s.opportunityId);
      return oid ? oid : s.opportunityId;
    });

    const objectIds = opportunityIds.filter((id: any) => typeof id === 'object');
    const stringIds = opportunityIds.filter((id: any) => typeof id === 'string');
    
    const queryConditions = [];
    if (objectIds.length > 0) queryConditions.push({ _id: { $in: objectIds } });
    if (stringIds.length > 0) queryConditions.push({ id: { $in: stringIds } });

    let opportunities: any[] = [];
    if (queryConditions.length > 0) {
      opportunities = await dbQuery.collection("opportunities")
        .find({ $or: queryConditions })
        .toArray();
    }
      
    const sortedOpportunities = savedOps.map((s: any) => {
       const oid = safeObjectId(s.opportunityId);
       return opportunities.find((o: any) => 
         (o._id && oid && o._id.equals(oid)) || (o.id && o.id === s.opportunityId)
       );
    }).filter(Boolean).map((o: any) => {
       const mapped = { ...o, id: o._id ? o._id.toString() : o.id };
       delete mapped._id;
       return mapped;
    });
    
    const total = await dbQuery.collection("saved_opportunities").countDocuments({ userId: user.uid });

    return sendSuccess(res, { items: sortedOpportunities, total });
  } catch (err: any) {
    console.error("GET /api/users/me/saved-opportunities error:", err);
    return sendError(res, "Internal Server Error", 500);
  }
};

export const getProfileProgress = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!dbQuery) return sendServiceUnavailable(res, "Database not available");

    const usersCollection = dbQuery.collection("users");
    const dbUser = await usersCollection.findOne({ uid: user.uid });
    
    if (!dbUser) {
       return sendNotFound(res, "User not found");
    }

    const resumesCol = dbQuery.collection("resumes");
    const resumes = await resumesCol.find({ userId: user.uid }).toArray();

    const progress = calculateProfileProgress(dbUser, resumes);

    return sendSuccess(res, progress);
  } catch (err: any) {
    console.error("GET /api/users/me/profile-progress error:", err);
    return sendError(res, "Internal Server Error", 500);
  }
};
