import { Request, Response } from "express";
import { ReportSchema } from "../../models/reportSchema.js";
import { AppError } from "../../lib/AppError.js";
import { ModerationService } from "../services/moderationService.js";
import { dbCommand, dbQuery } from "../db.js";

export const submitReport = async (req: Request, res: Response) => {
  try {
    const data = ReportSchema.parse(req.body);
    const reporterUid = req.user?.uid || data.reporterUid;

    if (!reporterUid) {
      throw AppError.unauthorized("User must be logged in to report content.");
    }

    if (!dbCommand) {
      throw AppError.internal("Database not connected");
    }

    // Check for existing report from this user for this content
    const existing = await dbCommand.collection("reports").findOne({
      contentId: data.contentId,
      reporterUid: reporterUid
    });

    if (existing) {
      return res.status(409).json({ message: "You have already reported this content.", report: existing });
    }

    // Capture snapshot
    const snapshot = await ModerationService.snapshotContent(data.contentType, data.contentId);
    const reportData = {
      ...data,
      reporterUid,
      contentSnapshot: snapshot,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await dbCommand.collection("reports").insertOne(reportData);

    res.status(201).json({ message: "Report submitted successfully.", reportId: result.insertedId });
  } catch (err: any) {
    if (err.name === "ZodError") {
      res.status(400).json({ error: "Invalid report data", details: err.errors });
    } else {
      res.status(err.statusCode || 500).json({ error: err.message || "Failed to submit report" });
    }
  }
};

export const getModerationQueue = async (req: Request, res: Response) => {
  try {
    if (!dbQuery) throw AppError.internal("Database not connected");
    const reports = await dbQuery.collection("reports")
      .find({ status: "pending" })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ items: reports });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const resolveReport = async (req: Request, res: Response) => {
  try {
    const reportId = req.params.id as string;
    const { action } = req.body;
    const adminUid = req.user?.uid || "admin";

    await ModerationService.executeAction(reportId, action, adminUid);

    res.json({ message: "Report resolved successfully" });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const getReportStats = async (req: Request, res: Response) => {
  try {
    if (!dbQuery) throw AppError.internal("Database not connected");
    const pendingCount = await dbQuery.collection("reports").countDocuments({ status: "pending" });
    const resolvedCount = await dbQuery.collection("reports").countDocuments({ status: "resolved" });

    res.json({ pendingCount, resolvedCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
