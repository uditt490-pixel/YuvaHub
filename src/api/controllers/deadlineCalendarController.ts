import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { ObjectId } from "mongodb";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess } from "../../lib/apiResponse.js";
import { generateIcs } from "../../utils/icsGenerator.js";
import { DeadlineReminderSchema } from "../../models/deadlineReminderSchema.js";

export const getCalendarEvents = async (req: Request, res: Response) => {
  const userId = req.user?.uid;
  if (!userId) throw AppError.unauthorized("User must be logged in");

  // Fetch User's bookmarks
  const user = await dbQuery.collection("users").findOne({ uid: userId });
  const bookmarkedOppIds = user?.bookmarks || [];

  // Fetch User's applications to get more opportunity IDs
  const applications = await dbQuery.collection("applications").find({ userId }).toArray();
  const appliedOppIds = applications.map(app => app.opportunityId).filter(Boolean);

  // Combine and deduplicate IDs
  const uniqueOppIds = [...new Set([...bookmarkedOppIds, ...appliedOppIds])];

  if (uniqueOppIds.length === 0) {
    return sendSuccess(res, { events: [], reminders: [] });
  }

  const stringIds = [];
  const objectIds = [];

  for (const idStr of uniqueOppIds) {
    stringIds.push(idStr);
    if (ObjectId.isValid(idStr)) {
      try { objectIds.push(new ObjectId(idStr)); } catch {}
    }
  }

  const queryConditions: any[] = [{ id: { $in: stringIds } }];
  if (objectIds.length > 0) {
    queryConditions.push({ _id: { $in: objectIds } });
  }

  const opportunities = await dbQuery.collection("opportunities")
    .find({ $or: queryConditions })
    .toArray();

  const events = opportunities.filter(opp => {
    // Only include opportunities with a valid deadline
    if (!opp.deadline || opp.deadline.toLowerCase() === "tbd" || opp.deadline.toLowerCase() === "rolling") {
      return false;
    }
    const d = new Date(opp.deadline);
    return !isNaN(d.getTime());
  }).map(opp => ({
    id: opp._id?.toString() || opp.id,
    title: opp.title,
    type: opp.type || "unknown",
    organization: opp.organization || opp.company || "",
    deadline: opp.deadline,
    link: opp.link || opp.apply_link || opp.source_url
  }));

  // Fetch user's reminders
  const reminders = await dbQuery.collection("deadline_reminders")
    .find({ userId })
    .toArray();

  return sendSuccess(res, { events, reminders });
};

export const setReminder = async (req: Request, res: Response) => {
  const userId = req.user?.uid;
  if (!userId) throw AppError.unauthorized("User must be logged in");

  const validatedData = DeadlineReminderSchema.parse({ ...req.body, userId });

  const result = await dbCommand.collection("deadline_reminders").findOneAndUpdate(
    { userId, opportunityId: validatedData.opportunityId },
    { $set: { ...validatedData, updatedAt: new Date() } },
    { upsert: true, returnDocument: "after" }
  );

  return sendSuccess(res, { reminder: result });
};

export const deleteReminder = async (req: Request, res: Response) => {
  const userId = req.user?.uid;
  if (!userId) throw AppError.unauthorized("User must be logged in");
  
  const id = req.params.id as string;

  let query: any = { userId };
  if (ObjectId.isValid(id)) {
    query._id = new ObjectId(id);
  } else {
    query.id = id;
  }

  const result = await dbCommand.collection("deadline_reminders").deleteOne(query);

  if (result.deletedCount === 0) {
    throw AppError.notFound("Reminder not found");
  }

  return sendSuccess(res, { message: "Reminder deleted successfully" });
};

export const exportICS = async (req: Request, res: Response) => {
  const userId = req.user?.uid;
  if (!userId) throw AppError.unauthorized("User must be logged in");

  const oppIdsRaw = req.query.oppIds;
  if (!oppIdsRaw || typeof oppIdsRaw !== 'string') {
    throw AppError.badRequest("oppIds query parameter is required (comma separated)");
  }

  const uniqueOppIds = oppIdsRaw.split(',').map(id => id.trim()).filter(Boolean);

  if (uniqueOppIds.length === 0) {
    throw AppError.badRequest("No valid opportunity IDs provided");
  }

  const stringIds = [];
  const objectIds = [];

  for (const idStr of uniqueOppIds) {
    stringIds.push(idStr);
    if (ObjectId.isValid(idStr)) {
      try { objectIds.push(new ObjectId(idStr)); } catch {}
    }
  }

  const queryConditions: any[] = [{ id: { $in: stringIds } }];
  if (objectIds.length > 0) {
    queryConditions.push({ _id: { $in: objectIds } });
  }

  const opportunities = await dbQuery.collection("opportunities")
    .find({ $or: queryConditions })
    .toArray();

  if (opportunities.length === 0) {
    throw AppError.notFound("No matching opportunities found");
  }

  const icsContents = opportunities.map(opp => generateIcs(opp)).join('\n');

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="deadlines.ics"');
  return res.send(icsContents);
};
