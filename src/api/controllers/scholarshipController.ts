import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId, normalizeParam } from "../../lib/utils.js";
import { AppError } from "../../lib/AppError.js";
import { z } from "zod";
import { getGenAI } from "../genai.js";
import { ScholarshipSchema, AIEvaluationResponseSchema } from "../../models/scholarshipSchema.js";
import { Type } from "@google/genai";
import { sendPaginated, sendSuccess } from "../../lib/apiResponse.js";

export const createScholarship = async (req: Request, res: Response) => {
  if (!dbCommand) throw AppError.serviceUnavailable("Database not available");
  const parsedData = req.body;
  const collection = dbCommand.collection("scholarships");
  const result = await collection.insertOne(parsedData);
  return sendSuccess(res, { id: result.insertedId, ...parsedData }, 201);
};

export const getScholarships = async (req: Request, res: Response) => {
  if (!dbCommand || !dbQuery) throw AppError.serviceUnavailable("Database not available");
  const page = parseInt((req.query.page as string) || "1", 10);
  const limit = parseInt((req.query.limit as string) || "10", 10);
  const skip = (page - 1) * limit;

  const collection = dbQuery.collection("scholarships");

  let items, total;
  if (collection.find({}).skip) {
    items = await collection.find({}).sort({ created_at: -1 }).skip(skip).limit(limit).toArray();
    total = await collection.countDocuments({});
  } else {
    const allItems = await collection.find({}).toArray();
    total = allItems.length;
    items = allItems.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(skip, skip + limit);
  }

  return sendPaginated(res, items, page, limit, total);
};

export const getScholarshipById = async (req: Request, res: Response) => {
  // Issue #285: normalize `string | string[]` param BEFORE the DB
  // availability check so an invalid/missing id is rejected with 400
  // even when the database is offline.
  const idStr = normalizeParam(req.params.id);
  if (!idStr) {
    throw AppError.badRequest("Missing or invalid id");
  }
  if (!dbCommand || !dbQuery) throw AppError.serviceUnavailable("Database not available");
  const collection = dbQuery.collection("scholarships");
  const oid = safeObjectId(idStr);
  const queryId = oid || idStr;
  const item = await collection.findOne({ _id: queryId });
  if (!item) throw AppError.notFound("Scholarship not found");
  return sendSuccess(res, item);
};

export const updateScholarship = async (req: Request, res: Response) => {
  // Issue #285: normalize `string | string[]` param BEFORE the DB
  // availability check.
  const idStr = normalizeParam(req.params.id);
  if (!idStr) {
    throw AppError.badRequest("Missing or invalid id");
  }
  if (!dbCommand || !dbQuery) throw AppError.serviceUnavailable("Database not available");
  const parsedData = { ...req.body, updated_at: new Date() };
  const collection = dbCommand.collection("scholarships");
  const oid = safeObjectId(idStr);
  const queryId = oid || idStr;

  await collection.updateOne({ _id: queryId }, { $set: parsedData });
  return sendSuccess(res, { updated: true });
};

export const deleteScholarship = async (req: Request, res: Response) => {
  // Issue #285: normalize `string | string[]` param BEFORE the DB
  // availability check.
  const idStr = normalizeParam(req.params.id);
  if (!idStr) {
    throw AppError.badRequest("Missing or invalid id");
  }
  if (!dbCommand || !dbQuery) throw AppError.serviceUnavailable("Database not available");
  const collection = dbCommand.collection("scholarships");
  const oid = safeObjectId(idStr);
  const queryId = oid || idStr;
  let deleted = true;
  if (collection.deleteOne) {
    const result = await collection.deleteOne({ _id: queryId });
    deleted = result.deletedCount > 0;
  }
  return sendSuccess(res, { deleted });
};

export const validateEligibility = async (req: Request, res: Response) => {
  try {
    const { scholarshipId, userProfile } = req.body;
    if (!scholarshipId || !userProfile) {
      throw AppError.badRequest("Missing scholarshipId or userProfile");
    }

    if (!dbCommand || !dbQuery) throw AppError.serviceUnavailable("Database not available");
    const collection = dbQuery.collection("scholarships");
    const oid = safeObjectId(scholarshipId);
    const queryId = oid || scholarshipId;

    const scholarship = await collection.findOne({ _id: queryId });
    if (!scholarship) throw AppError.notFound("Scholarship not found");

    const ai = getGenAI();
    if (!ai) throw AppError.serviceUnavailable("AI Service not available");

    const prompt = `
You are an expert AI Eligibility Validator for a scholarship platform.
Determine if the following user is eligible for the scholarship based on the criteria.

Scholarship Criteria:
  ${JSON.stringify(scholarship, null, 2)}

User Profile:
  ${JSON.stringify(userProfile, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_eligible: { type: Type.BOOLEAN },
            missing_requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidence_score: { type: Type.INTEGER }
          },
          required: ["is_eligible", "missing_requirements", "confidence_score"]
        }
      }
    });

    const rawJson = response.text;
    if (!rawJson) throw new Error("Empty response from AI");

    const parsedJson = JSON.parse(rawJson);
    const validatedOutput = AIEvaluationResponseSchema.parse(parsedJson);

    return sendSuccess(res, validatedOutput);
  } catch (err: any) {
    console.error("AI Validation Error:", err);
    if (err instanceof z.ZodError) {
      throw new AppError(502, "AI generated invalid schema", "INVALID_AI_SCHEMA", err.issues);
    }
    throw err;
  }
};