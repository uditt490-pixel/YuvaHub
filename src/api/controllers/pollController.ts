import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { AppError } from "../../lib/AppError.js";
import { safeObjectId, normalizeParam, parsePagination } from "../../lib/utils.js";
import escapeHtml from "escape-html";
import { sendPaginated, sendSuccess, sendError, sendBadRequest } from "../../lib/apiResponse.js";
import { PollSchema } from "../../models/pollSchema.js";
import { eventBus } from "../../events/eventBus.js";

const containsProfanity = (text: string): boolean => {
  const profanityRegex =
    /\b(badword|abuse|hate|spam|scam|idiot|stupid|bastard)\b/i;
  return profanityRegex.test(text);
};

export const getPolls = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    if (dbQuery) {
      const polls = await dbQuery
        .collection("polls")
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
      if (polls.length > 0) {
        const total = await dbQuery.collection("polls").countDocuments({});
        return sendPaginated(res, polls, page, limit, total);
      }
    }

    return sendPaginated(res, [], page, limit, 0);
  } catch (err) {
    console.error("Fetch Polls Error:", err);
    return sendError(res, "Internal Server Error", 500);
  }
};

export const createPoll = async (req: Request, res: Response) => {
  try {
    const { question, options, allowMultipleVotes, expiresAt, uid } = req.body;
    const userUid = req.user?.uid || uid;
    
    if (!userUid) {
      throw AppError.unauthorized("Authentication required to create a poll");
    }

    if (containsProfanity(question || "")) {
      throw AppError.badRequest("Poll question contains inappropriate language.");
    }
    
    for (const opt of options) {
      if (containsProfanity(opt.text || "")) {
        throw AppError.badRequest("Poll options contain inappropriate language.");
      }
    }

    const pollData = {
      question: escapeHtml(question),
      options: options.map((opt: any, index: number) => ({
        id: opt.id || `opt_${index}`,
        text: escapeHtml(opt.text),
        votes: 0
      })),
      allowMultipleVotes: !!allowMultipleVotes,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      authorUid: userUid,
      authorName: escapeHtml(req.user?.name || req.user?.email || "Anonymous"),
      voters: [],
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const validatedPoll = PollSchema.parse(pollData);

    if (dbCommand) {
      const result = await dbCommand.collection("polls").insertOne(validatedPoll);
      return sendSuccess(
        res,
        {
          ...validatedPoll,
          _id: result.insertedId,
          id: result.insertedId.toString(),
        },
        201,
      );
    }

    return sendSuccess(
      res,
      { ...validatedPoll, _id: "poll_" + Date.now(), id: "poll_" + Date.now() },
      201,
    );
  } catch (err) {
    console.error("Create Poll Error:", err);
    return sendError(res, err instanceof AppError ? err.message : "Error creating poll", err instanceof AppError ? err.statusCode : 500);
  }
};

export const getPollById = async (req: Request, res: Response) => {
  try {
    const idStr = normalizeParam(req.params.pollId);
    if (!idStr) {
      return sendBadRequest(res, "Missing or invalid pollId");
    }
    if (!dbCommand || !dbQuery) throw AppError.serviceUnavailable("Database not available");

    const oid = safeObjectId(idStr);
    const queryId = oid || idStr;

    const poll = await dbQuery.collection("polls").findOne({ _id: queryId });
    if (!poll) {
      throw AppError.notFound("Poll not found");
    }
    sendSuccess(res, poll);
  } catch (err) {
    console.error("Get Poll Error:", err);
    return sendError(res, err instanceof AppError ? err.message : "Error fetching poll", err instanceof AppError ? err.statusCode : 500);
  }
};

export const deletePoll = async (req: Request, res: Response) => {
  try {
    const idStr = normalizeParam(req.params.pollId);
    if (!idStr) {
      return sendBadRequest(res, "Missing or invalid pollId");
    }
    
    if (dbCommand) {
      const oid = safeObjectId(idStr);
      const queryId = oid || idStr;
      await dbCommand
        .collection("polls")
        .deleteOne({ $or: [{ _id: queryId }, { id: idStr }] });
    }
    sendSuccess(res, { message: "Poll deleted successfully" });
  } catch (err) {
    return sendError(res, err instanceof AppError ? err.message : "Error deleting poll", err instanceof AppError ? err.statusCode : 500);
  }
};

export const voteOnPoll = async (req: Request, res: Response) => {
  try {
    const idStr = normalizeParam(req.params.pollId);
    const { optionId } = req.body;
    const userId = req.user?.uid;

    if (!idStr || !optionId) {
      return sendBadRequest(res, "Missing pollId or optionId");
    }
    if (!userId) {
      return sendBadRequest(res, "Missing userId");
    }
    if (!dbCommand || !dbQuery) throw AppError.serviceUnavailable("Database not available");

    const oid = safeObjectId(idStr);
    const queryId = oid || idStr;

    const poll = await dbQuery.collection("polls").findOne({ _id: queryId });
    
    if (!poll) {
      throw AppError.notFound("Poll not found");
    }
    if (poll.status === "closed") {
      throw AppError.badRequest("Voting is closed for this poll");
    }
    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      throw AppError.badRequest("Poll has expired");
    }
    if (!poll.allowMultipleVotes && poll.voters?.includes(userId)) {
      throw AppError.conflict("User has already voted on this poll");
    }

    const optionExists = poll.options.some((o: any) => o.id === optionId);
    if (!optionExists) {
      throw AppError.badRequest("Invalid optionId");
    }

    const updateQuery: any = {
      $inc: { "options.$[elem].votes": 1 },
      $set: { updatedAt: new Date() }
    };
    
    if (!poll.allowMultipleVotes) {
      updateQuery.$push = { voters: userId };
    }

    const result = await dbCommand.collection("polls").findOneAndUpdate(
      { _id: queryId },
      updateQuery,
      { 
        arrayFilters: [{ "elem.id": optionId }],
        returnDocument: "after"
      }
    );

    const updatedPoll = (result as any)?.value || result;
    
    try {
      eventBus.publish("poll.voted", {
        eventId: "evt_" + Date.now(),
        timestamp: new Date().toISOString(),
        eventType: "PollVoted",
        payload: {
          pollId: idStr,
          userId,
          optionId
        }
      });
    } catch (e) {
      console.error("EventBus emit failed for PollVoted:", e);
    }

    sendSuccess(res, updatedPoll);
  } catch (err) {
    console.error("Vote Poll Error:", err);
    return sendError(res, err instanceof AppError ? err.message : "Error voting on poll", err instanceof AppError ? err.statusCode : 500);
  }
};

export const closePoll = async (req: Request, res: Response) => {
  try {
    const idStr = normalizeParam(req.params.pollId);
    if (!idStr) {
      return sendBadRequest(res, "Missing or invalid pollId");
    }
    
    if (!dbCommand || !dbQuery) throw AppError.serviceUnavailable("Database not available");

    const oid = safeObjectId(idStr);
    const queryId = oid || idStr;

    const result = await dbCommand.collection("polls").findOneAndUpdate(
      { _id: queryId },
      { $set: { status: "closed", updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    const updatedPoll = (result as any)?.value || result;
    if (!updatedPoll) {
      throw AppError.notFound("Poll not found");
    }
    
    try {
      eventBus.publish("poll.closed", {
        eventId: "evt_" + Date.now(),
        timestamp: new Date().toISOString(),
        eventType: "PollClosed",
        payload: {
          pollId: idStr
        }
      });
    } catch (e) {
      console.error("EventBus emit failed for PollClosed:", e);
    }

    sendSuccess(res, updatedPoll);
  } catch (err) {
    return sendError(res, err instanceof AppError ? err.message : "Error closing poll", err instanceof AppError ? err.statusCode : 500);
  }
};
