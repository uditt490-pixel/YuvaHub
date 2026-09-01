import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId } from "../../lib/utils.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess } from "../../lib/apiResponse.js";
import { analyzeSkillGap, calculateProgressMetrics } from "../../services/skillGapService.js";

export const analyze = async (req: Request, res: Response) => {
  const user = req.user;
  if (!dbQuery || !dbCommand) throw AppError.serviceUnavailable("Database not available");

  const { opportunityId, opportunityDescription } = req.body;
  if (!opportunityId && !opportunityDescription) {
    throw AppError.badRequest("Must provide opportunityId or opportunityDescription");
  }

  // Fetch the user's profile
  const userDoc = await dbQuery.collection("users").findOne({ uid: user.uid });
  if (!userDoc) {
    throw AppError.notFound("User not found");
  }

  // Fetch opportunity if ID provided
  let opportunity = { description: opportunityDescription };
  if (opportunityId) {
    const oid = safeObjectId(opportunityId);
    const query = oid ? { _id: oid } : { id: opportunityId };
    const opp = await dbQuery.collection("opportunities").findOne(query);
    if (opp) {
      opportunity = opp;
    } else if (!opportunityDescription) {
      throw AppError.notFound("Opportunity not found and no description provided");
    }
  }

  const analysisResult = await analyzeSkillGap(userDoc, opportunity);
  analysisResult.userId = user.uid; // ensure uid matches
  
  // Calculate initial metrics
  analysisResult.matchPercentage = calculateProgressMetrics(analysisResult);

  // Save to db
  const result = await dbCommand.collection("skill_gap_analysis").insertOne(analysisResult);
  analysisResult._id = result.insertedId;

  return sendSuccess(res, { analysis: analysisResult }, 201);
};

export const getHistory = async (req: Request, res: Response) => {
  const user = req.user;
  if (!dbQuery) throw AppError.serviceUnavailable("Database not available");

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const history = await dbQuery.collection("skill_gap_analysis")
    .find({ userId: user.uid })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await dbQuery.collection("skill_gap_analysis").countDocuments({ userId: user.uid });

  return sendSuccess(res, { 
    history, 
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

export const getById = async (req: Request, res: Response) => {
  const user = req.user;
  const { id } = req.params;
  if (!dbQuery) throw AppError.serviceUnavailable("Database not available");

  const oid = safeObjectId(id);
  if (!oid) throw AppError.badRequest("Invalid ID format");

  const analysis = await dbQuery.collection("skill_gap_analysis").findOne({ _id: oid, userId: user.uid });
  if (!analysis) {
    throw AppError.notFound("Analysis not found");
  }

  return sendSuccess(res, { analysis });
};

export const updateRoadmapItem = async (req: Request, res: Response) => {
  const user = req.user;
  const { id, skillIndex } = req.params;
  const { completed } = req.body;
  if (!dbQuery || !dbCommand) throw AppError.serviceUnavailable("Database not available");

  const oid = safeObjectId(id);
  if (!oid) throw AppError.badRequest("Invalid ID format");
  
  const index = parseInt(skillIndex as string);
  if (isNaN(index) || index < 0) throw AppError.badRequest("Invalid skill index");

  const analysis = await dbQuery.collection("skill_gap_analysis").findOne({ _id: oid, userId: user.uid });
  if (!analysis) {
    throw AppError.notFound("Analysis not found");
  }

  if (!analysis.roadmap || !analysis.roadmap[index]) {
    throw AppError.badRequest("Roadmap item not found at specified index");
  }

  // Toggle completion
  analysis.roadmap[index].completed = completed ?? !analysis.roadmap[index].completed;
  
  // Recalculate metrics
  analysis.matchPercentage = calculateProgressMetrics(analysis);
  analysis.updatedAt = new Date();

  await dbCommand.collection("skill_gap_analysis").updateOne(
    { _id: oid, userId: user.uid },
    { 
      $set: { 
        [`roadmap.${index}.completed`]: analysis.roadmap[index].completed,
        matchPercentage: analysis.matchPercentage,
        updatedAt: analysis.updatedAt
      } 
    }
  );

  return sendSuccess(res, { analysis });
};

export const deleteAnalysis = async (req: Request, res: Response) => {
  const user = req.user;
  const { id } = req.params;
  if (!dbCommand) throw AppError.serviceUnavailable("Database not available");

  const oid = safeObjectId(id);
  if (!oid) throw AppError.badRequest("Invalid ID format");

  const result = await dbCommand.collection("skill_gap_analysis").deleteOne({ _id: oid, userId: user.uid });
  if (result.deletedCount === 0) {
    throw AppError.notFound("Analysis not found");
  }

  return sendSuccess(res, { message: "Analysis deleted successfully" });
};
