import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { AppError } from "../../lib/AppError.js";
import { ObjectId } from "mongodb";
import { safeObjectId, normalizeParam } from "../../lib/utils.js";
import escapeHtml from "escape-html";
import { sendSuccess, sendBadRequest } from "../../lib/apiResponse.js";
import { getSocketIO } from "../socketInstance.js";
import { ForumReplySchema } from "../../models/forumReplySchema.js";

export const getReplies = async (req: Request, res: Response) => {
  const postId = normalizeParam(req.params.postId);
  if (!postId) return sendBadRequest(res, "Missing postId");

  if (!dbQuery) throw AppError.serviceUnavailable("Database not available");

  const replies = await dbQuery
    .collection("forumReplies")
    .find({ postId })
    .sort({ createdAt: 1 })
    .toArray();

  sendSuccess(res, replies);
};

export const createReply = async (req: Request, res: Response) => {
  const postId = normalizeParam(req.params.postId);
  if (!postId) return sendBadRequest(res, "Missing postId");

  const authorUid = req.user?.uid || "user_anon";
  const authorName = req.user?.name || req.body.authorName || "Anonymous";

  const { content, parentReplyId } = req.body;

  if (!content) return sendBadRequest(res, "Missing reply content");

  if (!dbCommand || !dbQuery) throw AppError.serviceUnavailable("Database not available");

  // Validate post exists
  const postOid = safeObjectId(postId);
  const queryPostId = postOid || postId;
  
  const post = await dbQuery.collection("posts").findOne({ _id: queryPostId });
  if (!post) {
    // If not found by object ID, try as string ID for mock backward compatibility
    const fallbackPost = await dbQuery.collection("posts").findOne({ id: postId });
    if (!fallbackPost && !postId.startsWith("post_")) {
        throw AppError.notFound("Post not found");
    }
  }

  // Validate parent reply if provided
  if (parentReplyId) {
    const parentOid = safeObjectId(parentReplyId);
    const parentQueryId = parentOid || parentReplyId;
    const parentReply = await dbQuery.collection("forumReplies").findOne({ _id: parentQueryId });
    if (!parentReply) {
      throw AppError.notFound("Parent reply not found");
    }
  }

  const replyData = {
    postId,
    parentReplyId: parentReplyId || null,
    authorName: escapeHtml(authorName),
    authorUid,
    content: escapeHtml(content),
    upvotes: 0,
    upvotedBy: [],
    isAcceptedAnswer: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const validated = ForumReplySchema.parse(replyData);

  const result = await dbCommand.collection("forumReplies").insertOne(validated);
  const newReply = { ...validated, _id: result.insertedId };

  // Increment replies count on the parent post
  await dbCommand.collection("posts").updateOne(
    { $or: [{ _id: queryPostId }, { id: postId }] },
    { $inc: { repliesCount: 1 } }
  );

  // Emit socket event
  const io = getSocketIO();
  if (io) {
    io.to(`post_${postId}`).emit("forum:newReply", newReply);
  }

  return sendSuccess(res, newReply, 201);
};

export const upvoteReply = async (req: Request, res: Response) => {
  const replyId = normalizeParam(req.params.replyId);
  const postId = normalizeParam(req.params.postId);
  
  if (!replyId || !postId) return sendBadRequest(res, "Missing replyId or postId");

  const userId = req.user?.uid;
  if (!userId) return sendBadRequest(res, "Missing userId");

  if (!dbCommand || !dbQuery) throw AppError.serviceUnavailable("Database not available");

  const oid = safeObjectId(replyId);
  const queryId = oid || replyId;

  const result = await dbCommand.collection("forumReplies").findOneAndUpdate(
    { _id: queryId, upvotedBy: { $ne: userId } },
    { 
      $inc: { upvotes: 1 }, 
      $push: { upvotedBy: userId } 
    },
    { returnDocument: "after" }
  );

  const updatedReply = (result as any)?.value || result;
  
  if (!updatedReply) {
    const checkReply = await dbQuery.collection("forumReplies").findOne({ _id: queryId });
    if (!checkReply) throw AppError.notFound("Reply not found");
    throw AppError.conflict("User has already upvoted this reply");
  }

  // Emit socket event
  const io = getSocketIO();
  if (io) {
    io.to(`post_${postId}`).emit("forum:replyUpvoted", { replyId: queryId, upvotes: updatedReply.upvotes });
  }

  return sendSuccess(res, updatedReply);
};

export const acceptAnswer = async (req: Request, res: Response) => {
  const replyId = normalizeParam(req.params.replyId);
  const postId = normalizeParam(req.params.postId);
  
  if (!replyId || !postId) return sendBadRequest(res, "Missing replyId or postId");

  const userId = req.user?.uid;
  if (!userId) return sendBadRequest(res, "Missing userId");

  if (!dbCommand || !dbQuery) throw AppError.serviceUnavailable("Database not available");

  // Verify that the user is the original author of the post
  const postOid = safeObjectId(postId);
  const queryPostId = postOid || postId;
  const post = await dbQuery.collection("posts").findOne({ $or: [{ _id: queryPostId }, { id: postId }] });
  
  if (!post) throw AppError.notFound("Post not found");
  if (post.authorUid !== userId) {
    throw AppError.forbidden("Only the post author can accept an answer");
  }

  const replyOid = safeObjectId(replyId);
  const queryReplyId = replyOid || replyId;

  // First, unset any existing accepted answers for this post
  await dbCommand.collection("forumReplies").updateMany(
    { postId, isAcceptedAnswer: true },
    { $set: { isAcceptedAnswer: false } }
  );

  // Then mark the requested reply as the accepted answer
  const result = await dbCommand.collection("forumReplies").findOneAndUpdate(
    { _id: queryReplyId },
    { $set: { isAcceptedAnswer: true } },
    { returnDocument: "after" }
  );

  const updatedReply = (result as any)?.value || result;
  if (!updatedReply) throw AppError.notFound("Reply not found");

  // Emit socket event
  const io = getSocketIO();
  if (io) {
    io.to(`post_${postId}`).emit("forum:answerAccepted", { replyId: queryReplyId });
  }

  return sendSuccess(res, updatedReply);
};
