import { Request, Response, NextFunction } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId, parsePagination } from "../../lib/utils.js";
import { sendSuccess, sendPaginated, sendServiceUnavailable } from "../../lib/apiResponse.js";
import { AppError } from "../../lib/AppError.js";
import { resourceSchema } from "../../models/resourceSchema.js";
import { ObjectId } from "mongodb";

export const submitResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbCommand) return sendServiceUnavailable(res);
    const user = req.user;
    
    // Validate request body against schema
    const validation = resourceSchema.safeParse(req.body);
    if (!validation.success) {
      throw AppError.badRequest(validation.error.issues?.[0]?.message || "Validation failed");
    }
    
    const { title, url, description, resourceType, skills, difficulty } = validation.data;
    
    // Check for unique URL
    const existing = await dbCommand.collection("resources").findOne({ url });
    if (existing) {
      throw AppError.badRequest("This resource URL has already been submitted.");
    }
    
    const submitterName = user.name || user.displayName || user.email?.split('@')[0] || "Student";
    
    const newResource = {
      title,
      url,
      description,
      resourceType,
      skills,
      difficulty,
      submitterId: user.uid,
      submitterName,
      upvotes: 0,
      downvotes: 0,
      voterIds: {},
      savedBy: [],
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    const result = await dbCommand.collection("resources").insertOne(newResource);
    
    // Reward user for submission
    await dbCommand.collection("transactions").insertOne({
      userId: user.uid,
      amount: 10,
      type: 'resource_submission',
      timestamp: Date.now()
    });
    
    sendSuccess(res, { resource: { ...newResource, id: result.insertedId.toString() } });
  } catch (error) {
    next(error);
  }
};

export const listResources = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbQuery) return sendServiceUnavailable(res);
    
    const { page, limit, skip } = parsePagination(req.query);
    const { type, difficulty, skill, sort } = req.query;
    
    const filter: any = { status: "active" };
    
    if (type && type !== "all") {
      filter.resourceType = type;
    }
    if (difficulty && difficulty !== "all") {
      filter.difficulty = difficulty;
    }
    if (skill) {
      filter.skills = { $in: Array.isArray(skill) ? skill : [skill] };
    }
    
    let sortObj: any = { createdAt: -1 };
    if (sort === "top") {
      sortObj = { upvotes: -1, createdAt: -1 };
    }
    
    const [resources, total] = await Promise.all([
      dbQuery.collection("resources").find(filter).sort(sortObj).skip(skip).limit(limit).toArray(),
      dbQuery.collection("resources").countDocuments(filter)
    ]);
    
    const formattedResources = resources.map(r => ({ ...r, id: r._id.toString() }));
    
    sendPaginated(res, formattedResources, page, limit, total);
  } catch (error) {
    next(error);
  }
};

export const getMySavedResources = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbQuery) return sendServiceUnavailable(res);
    const user = req.user;
    const { page, limit, skip } = parsePagination(req.query);
    
    const filter = { savedBy: user.uid, status: "active" };
    
    const [resources, total] = await Promise.all([
      dbQuery.collection("resources").find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      dbQuery.collection("resources").countDocuments(filter)
    ]);
    
    const formattedResources = resources.map(r => ({ ...r, id: r._id.toString() }));
    
    sendPaginated(res, formattedResources, page, limit, total);
  } catch (error) {
    next(error);
  }
};

export const voteResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbCommand) return sendServiceUnavailable(res);
    const user = req.user;
    const { id } = req.params;
    const { direction } = req.body; // 'up' or 'down'
    
    if (direction !== 'up' && direction !== 'down') {
      throw AppError.badRequest("Invalid vote direction");
    }
    
    const oid = safeObjectId(id);
    if (!oid) throw AppError.badRequest("Invalid resource ID");
    
    const resource = await dbCommand.collection("resources").findOne({ _id: oid });
    if (!resource) throw AppError.notFound("Resource not found");
    
    const currentVote = resource.voterIds?.[user.uid];
    
    let incUpvotes = 0;
    let incDownvotes = 0;
    let newVoterIds = { ...resource.voterIds };
    
    if (currentVote === direction) {
      // Toggle off
      if (direction === 'up') incUpvotes = -1;
      else incDownvotes = -1;
      delete newVoterIds[user.uid];
    } else {
      // New vote or changed vote
      if (currentVote === 'up') incUpvotes = -1;
      if (currentVote === 'down') incDownvotes = -1;
      
      if (direction === 'up') incUpvotes += 1;
      else incDownvotes += 1;
      
      newVoterIds[user.uid] = direction;
    }
    
    await dbCommand.collection("resources").updateOne(
      { _id: oid },
      { 
        $inc: { upvotes: incUpvotes, downvotes: incDownvotes },
        $set: { voterIds: newVoterIds, updatedAt: Date.now() }
      }
    );
    
    sendSuccess(res, { 
      message: "Vote recorded",
      upvotes: resource.upvotes + incUpvotes,
      downvotes: resource.downvotes + incDownvotes,
      userVote: newVoterIds[user.uid] || null
    });
  } catch (error) {
    next(error);
  }
};

export const saveResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbCommand) return sendServiceUnavailable(res);
    const user = req.user;
    const { id } = req.params;
    
    const oid = safeObjectId(id);
    if (!oid) throw AppError.badRequest("Invalid resource ID");
    
    const resource = await dbCommand.collection("resources").findOne({ _id: oid });
    if (!resource) throw AppError.notFound("Resource not found");
    
    const isSaved = resource.savedBy?.includes(user.uid);
    
    if (isSaved) {
      await dbCommand.collection("resources").updateOne(
        { _id: oid },
        { $pull: { savedBy: user.uid } as any, $set: { updatedAt: Date.now() } }
      );
    } else {
      await dbCommand.collection("resources").updateOne(
        { _id: oid },
        { $addToSet: { savedBy: user.uid } as any, $set: { updatedAt: Date.now() } }
      );
    }
    
    sendSuccess(res, { saved: !isSaved });
  } catch (error) {
    next(error);
  }
};

export const flagResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbCommand) return sendServiceUnavailable(res);
    const { id } = req.params;
    
    const oid = safeObjectId(id);
    if (!oid) throw AppError.badRequest("Invalid resource ID");
    
    await dbCommand.collection("resources").updateOne(
      { _id: oid },
      { $set: { status: "flagged", updatedAt: Date.now() } }
    );
    
    sendSuccess(res, { message: "Resource flagged for review" });
  } catch (error) {
    next(error);
  }
};
