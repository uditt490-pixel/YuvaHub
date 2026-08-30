import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db";
import { AppError } from "../../lib/AppError";
import { sendSuccess } from "../../lib/apiResponse";
import { exportQueue } from "../../queues/exportQueue";
import { ObjectId } from "mongodb";

export const requestExport = async (req: any, res: any) => {
  const user = req.user;
  const { format, sections } = req.body;

  if (!format || !['pdf', 'csv', 'json'].includes(format)) {
    throw AppError.badRequest("Invalid format. Must be pdf, csv, or json.");
  }

  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    throw AppError.badRequest("Must specify at least one section to export.");
  }

  // Create export history entry
  const exportHistoryEntry = {
    userId: user.uid,
    format,
    sections,
    status: 'pending',
    requestedAt: new Date(),
  };

  const result = await dbCommand.collection("exporthistories").insertOne(exportHistoryEntry);
  const exportId = result.insertedId;

  // Add job to queue
  await exportQueue.add("processExport", {
    exportId: exportId,
    userId: user.uid,
    format,
    sections,
  });

  return sendSuccess(res, {
    message: "Export requested successfully",
    exportId,
  });
};

export const getExportHistory = async (req: any, res: any) => {
  const user = req.user;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = parseInt(req.query.skip as string) || 0;

  const history = await dbQuery.collection("exporthistories")
    .find({ userId: user.uid })
    .sort({ requestedAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  return sendSuccess(res, { history });
};
