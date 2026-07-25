import { Request, Response, NextFunction } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId } from "../../lib/utils.js";
import { z } from "zod";
import { getGenAI } from "../genai.js";
import { ScholarshipSchema, AIEvaluationResponseSchema } from "../../models/scholarshipSchema.js";
import { Type } from "@google/genai";

export const createScholarship = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbCommand || !dbQuery) return res.status(503).json({ success: false, error: "Database not available" });
    const parsedData = req.body;
    const collection = dbQuery.collection("scholarships");
    const result = await collection.insertOne(parsedData);
    res.status(201).json({ success: true, id: result.insertedId, ...parsedData });
  } catch (err: any) {
    next(err);
  }
};

export const getScholarships = async (req: Request, res: Response) => {
  try {
    if (!dbCommand || !dbQuery) return res.status(503).json({ error: "Database not available" });
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

    res.json({ items, total, page, next_page: skip + limit < total ? page + 1 : null });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getScholarshipById = async (req: Request, res: Response) => {
  try {
    if (!dbCommand || !dbQuery) return res.status(503).json({ error: "Database not available" });
    const id = req.params.id;
    const collection = dbQuery.collection("scholarships");
    const oid = safeObjectId(id);
    const queryId = oid || id;
    const item = await collection.findOne({ _id: queryId });
    if (!item) return res.status(404).json({ error: "Scholarship not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateScholarship = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbCommand || !dbQuery) return res.status(503).json({ success: false, error: "Database not available" });
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const parsedData = { ...req.body, updated_at: new Date() };
    const collection = dbQuery.collection("scholarships");
    const oid = safeObjectId(id);
    const queryId = oid || id;

    await collection.updateOne({ _id: queryId }, { $set: parsedData });
    res.json({ success: true, updated: true });
  } catch (err: any) {
    next(err);
  }
};

export const deleteScholarship = async (req: Request, res: Response) => {
  try {
    if (!dbCommand || !dbQuery) return res.status(503).json({ error: "Database not available" });
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const collection = dbQuery.collection("scholarships");
    const oid = safeObjectId(id);
    const queryId = oid || id;
    let deleted = true;
    if (collection.deleteOne) {
      const result = await collection.deleteOne({ _id: queryId });
      deleted = result.deletedCount > 0;
    }
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const validateEligibility = async (req: Request, res: Response) => {
  try {
    const { scholarshipId, userProfile } = req.body;
    if (!scholarshipId || !userProfile) {
      return res.status(400).json({ error: "Missing scholarshipId or userProfile" });
    }

    if (!dbCommand || !dbQuery) return res.status(503).json({ error: "Database not available" });
    const collection = dbQuery.collection("scholarships");
    const oid = safeObjectId(scholarshipId);
    const queryId = oid || scholarshipId;

    const scholarship = await collection.findOne({ _id: queryId });
    if (!scholarship) return res.status(404).json({ error: "Scholarship not found" });

    const ai = getGenAI();
    if (!ai) return res.status(503).json({ error: "AI Service not available" });

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

    res.json(validatedOutput);
  } catch (err: any) {
    console.error("AI Validation Error:", err);
    if (err instanceof z.ZodError) {
      return res.status(502).json({ error: "AI generated invalid schema", details: err.issues });
    }
    res.status(500).json({ error: "Internal Server Error during validation" });
  }
};
