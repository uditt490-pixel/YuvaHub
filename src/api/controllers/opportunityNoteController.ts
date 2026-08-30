import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess } from "../../lib/apiResponse.js";
import { opportunityNoteSchema } from "../../models/opportunityNoteSchema.js";
import { z } from "zod";

export const getNote = async (req: Request, res: Response) => {
  const user = req.user;
  if (!dbQuery) throw AppError.serviceUnavailable("Database not available");

  const { opportunityId } = req.params;
  if (!opportunityId) {
    throw AppError.badRequest("Missing opportunityId");
  }

  const note = await dbQuery.collection("opportunity_notes").findOne({
    userId: user.uid,
    opportunityId: opportunityId,
  });

  return sendSuccess(res, { note });
};

export const upsertNote = async (req: Request, res: Response) => {
  const user = req.user;
  if (!dbCommand) throw AppError.serviceUnavailable("Database not available");

  try {
    const validatedData = opportunityNoteSchema.parse({
      ...req.body,
      userId: user.uid,
    });

    const updateData = {
      ...validatedData,
      updatedAt: new Date(),
    };

    const result = await dbCommand.collection("opportunity_notes").findOneAndUpdate(
      { userId: user.uid, opportunityId: validatedData.opportunityId },
      {
        $set: updateData,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: 'after' }
    );

    return sendSuccess(res, { note: result.value || result }); // Mock DB returns value, MongoDB node driver returns value
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw AppError.badRequest((error as any).errors.map((e: any) => e.message).join(", "));
    }
    throw error;
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  const user = req.user;
  if (!dbCommand) throw AppError.serviceUnavailable("Database not available");

  const { opportunityId } = req.params;
  if (!opportunityId) {
    throw AppError.badRequest("Missing opportunityId");
  }

  await dbCommand.collection("opportunity_notes").deleteOne({
    userId: user.uid,
    opportunityId: opportunityId,
  });

  return sendSuccess(res, { message: "Note deleted successfully" });
};

export const bulkGetNotes = async (req: Request, res: Response) => {
  const user = req.user;
  if (!dbQuery) throw AppError.serviceUnavailable("Database not available");

  const { opportunityIds } = req.body;
  if (!opportunityIds || !Array.isArray(opportunityIds)) {
    throw AppError.badRequest("opportunityIds must be an array");
  }

  const notes = await dbQuery.collection("opportunity_notes")
    .find({
      userId: user.uid,
      opportunityId: { $in: opportunityIds },
    })
    .toArray();

  return sendSuccess(res, { notes });
};
