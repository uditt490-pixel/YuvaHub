import { Request, Response, NextFunction } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId, parsePagination } from "../../lib/utils.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess, sendPaginated, sendServiceUnavailable } from "../../lib/apiResponse.js";
import { CodeReviewRequestSchema, CodeReviewFeedbackSchema } from "../../models/codeReviewSchema.js";
import { recordActivity } from "./activityController.js";

export const createReviewRequest = async (req: Request, res: Response) => {
  const user = req.user;
  if (!dbCommand) throw AppError.serviceUnavailable("Database not available");

  const validatedData = CodeReviewRequestSchema.parse({
    ...req.body,
    requesterId: user.uid,
    requesterName: req.body.requesterName || user.name || user.email?.split('@')[0] || 'User'
  });

  const requestObj = {
    ...validatedData,
    status: 'open',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const result = await dbCommand.collection("code_review_requests").insertOne(requestObj);
  
  await recordActivity({
    userId: user.uid,
    type: "code_review_requested",
    entityId: result.insertedId.toString(),
    metadata: { title: requestObj.title }
  });

  sendSuccess(res, { reviewRequest: { ...requestObj, id: result.insertedId.toString() } });
};

export const listReviewRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbQuery) return sendServiceUnavailable(res);
    const { page, limit, skip } = parsePagination(req.query);
    
    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.language) filter.language = req.query.language;
    if (req.query.tag) filter.tags = req.query.tag;

    const [requests, total] = await Promise.all([
      dbQuery.collection("code_review_requests").find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      dbQuery.collection("code_review_requests").countDocuments(filter)
    ]);
    return sendPaginated(res, requests.map((r: any) => ({ ...r, id: r._id.toString() })), page, limit, total);
  } catch (err: any) {
    next(err);
  }
};

export const claimReview = async (req: Request, res: Response) => {
  const user = req.user;
  if (!dbCommand) throw AppError.serviceUnavailable("Database not available");

  const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const oid = safeObjectId(requestId);
  if (!oid) throw AppError.badRequest("Invalid request ID");

  const request = await dbCommand.collection("code_review_requests").findOne({ _id: oid });
  if (!request) throw AppError.notFound("Review request not found");
  if (request.requesterId === user.uid) throw AppError.forbidden("Cannot review your own request");
  if (request.status !== 'open') throw AppError.badRequest("Request is no longer open");

  const reviewerName = req.body.reviewerName || user.name || user.email?.split('@')[0] || 'User';

  const result = await dbCommand.collection("code_review_requests").updateOne(
    { _id: oid, status: 'open' },
    { $set: { status: 'in_review', reviewerId: user.uid, reviewerName, updatedAt: Date.now() } }
  );

  if (result.modifiedCount === 0) throw AppError.badRequest("Request no longer available");
  
  await recordActivity({
    userId: user.uid,
    type: "code_review_claimed",
    entityId: requestId
  });

  sendSuccess(res, { message: "Review claimed successfully" });
};

export const submitFeedback = async (req: Request, res: Response) => {
  const user = req.user;
  if (!dbCommand) throw AppError.serviceUnavailable("Database not available");

  const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const oid = safeObjectId(requestId);
  if (!oid) throw AppError.badRequest("Invalid request ID");

  const request = await dbCommand.collection("code_review_requests").findOne({ _id: oid });
  if (!request) throw AppError.notFound("Review request not found");
  if (request.reviewerId !== user.uid) throw AppError.forbidden("You are not the assigned reviewer");
  if (request.status === 'completed') throw AppError.badRequest("Review already completed");

  const validatedFeedback = CodeReviewFeedbackSchema.parse({
    ...req.body,
    requestId,
    reviewerId: user.uid
  });

  const feedbackObj = {
    ...validatedFeedback,
    createdAt: Date.now()
  };

  // 1. Insert Feedback
  await dbCommand.collection("code_review_feedback").insertOne(feedbackObj);

  // 2. Update Request Status
  await dbCommand.collection("code_review_requests").updateOne(
    { _id: oid },
    { $set: { status: 'completed', updatedAt: Date.now() } }
  );

  // 3. Award Karma to Reviewer
  const KARMA_REWARD = 20; // 20 karma for completing a review
  await dbCommand.collection("transactions").insertOne({
    userId: user.uid,
    amount: KARMA_REWARD,
    type: 'code_review_completed',
    timestamp: Date.now(),
    metadata: { requestId }
  });

  await recordActivity({
    userId: user.uid,
    type: "code_review_completed",
    entityId: requestId
  });

  await recordActivity({
    userId: user.uid,
    type: "karma_earned",
    entityId: requestId,
    points: KARMA_REWARD,
    metadata: { source: "code_review_completed" }
  });

  sendSuccess(res, { message: "Feedback submitted and Karma awarded" });
};

export const getMyReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!dbQuery) return sendServiceUnavailable(res);
    
    // Requests where user is requester OR reviewer
    const filter = {
      $or: [
        { requesterId: user.uid },
        { reviewerId: user.uid }
      ]
    };

    const requests = await dbQuery.collection("code_review_requests")
      .find(filter)
      .sort({ updatedAt: -1 })
      .toArray();

    sendSuccess(res, { items: requests.map((r: any) => ({ ...r, id: r._id.toString() })) });
  } catch (err: any) {
    next(err);
  }
};
