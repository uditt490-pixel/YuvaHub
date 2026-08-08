import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { AppError } from "../../lib/AppError.js";
import { ObjectId } from "mongodb";
import { safeObjectId, normalizeParam, parsePagination } from "../../lib/utils.js";
import escapeHtml from "escape-html";
import { sendPaginated, sendSuccess, sendError } from "../../lib/apiResponse.js";

const containsProfanity = (text: string): boolean => {
  const profanityRegex =
    /\b(badword|abuse|hate|spam|scam|idiot|stupid|bastard)\b/i;
  return profanityRegex.test(text);
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const sort = req.query.sort === "trending" ? "trending" : "latest";
    const sortOption: any =
      sort === "trending" ? { upvotes: -1, createdAt: -1 } : { createdAt: -1 };

    if (dbQuery) {
      const posts = await dbQuery
        .collection("posts")
        .find({})
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .toArray();
      if (posts.length > 0) {
        const total = await dbQuery.collection("posts").countDocuments({});
        return sendPaginated(res, posts, page, limit, total);
      }
    }

    const mockPosts = [
      {
        _id: "post_1",
        id: "post_1",
        title: "Secured GSoC 2026 Mentorship under Linux Foundation! 🎉",
        content:
          "Super thrilled to share that my proposal for kernel telemetry tools was accepted! Big thanks to the YuvaHub community for reviewing my draft.",
        author: "Aarav Sharma",
        authorUid: "user_aarav_123",
        type: "Win",
        tags: ["GSoC", "OpenSource", "Linux"],
        upvotes: 24,
        upvoted_by: [],
        repliesCount: 3,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "post_2",
        id: "post_2",
        title: "Tips for Crack Microsoft Engage & SWE Internship OA?",
        content:
          "Hey folks! Any recent experience with Microsoft's coding assessment? Looking for recommended topics and problem sets to practice.",
        author: "Priya Patel",
        authorUid: "user_priya_456",
        type: "Question",
        tags: ["Microsoft", "DSA", "Internship"],
        upvotes: 15,
        upvoted_by: [],
        repliesCount: 5,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "post_3",
        id: "post_3",
        title: "Curated Roadmap: System Design & Microservices for Students",
        content:
          "Created a free GitHub repo summarizing clean architecture, caching, and rate limiting patterns for campus placements.",
        author: "Rohan Verma",
        authorUid: "user_rohan_789",
        type: "Resource",
        tags: ["SystemDesign", "Backend", "Roadmap"],
        upvotes: 38,
        upvoted_by: [],
        repliesCount: 8,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ];

    if (sort === "trending") {
      mockPosts.sort((a, b) => b.upvotes - a.upvotes);
    }
    const sliced = mockPosts.slice(skip, skip + limit);
    return sendPaginated(res, sliced, page, limit, mockPosts.length);
  } catch (err) {
    console.error("Fetch Posts Error:", err);
    return sendError(res, "Internal Server Error", 500);
  }
};

export const createPost = async (req: Request, res: Response) => {
    const { title, content, author, type, tags, uid } = req.body;
    const userUid = req.user?.uid || uid || "user_anon";
    if (!content || (!author && !req.user?.name)) {
      throw AppError.badRequest("Missing post content or author name");
    }

    if (containsProfanity(title || "") || containsProfanity(content)) {
      throw AppError.badRequest("Post contains inappropriate language or prohibited keywords.");
    }

    const post = {
      title: escapeHtml(title || "Community Discussion"),
      content: escapeHtml(content),
      author: escapeHtml(
        author || req.user?.name || req.user?.email || "Anonymous",
      ),
      authorUid: userUid,
      type: type || "Update",
      tags: Array.isArray(tags) ? tags : ["General"],
      upvotes: 0,
      upvoted_by: [] as string[],
      repliesCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (dbCommand) {
      const result = await dbCommand.collection("posts").insertOne(post);
      return sendSuccess(
        res,
        {
          ...post,
          _id: result.insertedId,
          id: result.insertedId.toString(),
        },
        201,
      );
    }

    return sendSuccess(
      res,
      { ...post, _id: "post_" + Date.now(), id: "post_" + Date.now() },
      201,
    );
};

export const deletePost = async (req: Request, res: Response) => {
    // Issue #285: route params can be `string | string[]` at runtime.
    // Normalize before any string operation or ObjectId construction.
    const idStr = normalizeParam(req.params.postId);
    if (!idStr) {
      throw AppError.badRequest("Missing or invalid postId");
    }
    if (dbCommand) {
      const oid = safeObjectId(idStr);
      const queryId = oid || idStr;
      await dbCommand
        .collection("posts")
        .deleteOne({ $or: [{ _id: queryId }, { id: idStr }] });
    }
    sendSuccess(res, { message: "Post deleted successfully" });
};

export const getPostById = async (req: Request, res: Response) => {
    // Issue #285: normalize `string | string[]` param BEFORE checking DB
    // availability — an invalid param is a client error (400) regardless of
    // whether the database is connected.  This matches the order used by
    // deletePost, getComments, createComment, editComment, and upvotePost.
    const idStr = normalizeParam(req.params.postId);
    if (!idStr) {
      throw AppError.badRequest("Missing or invalid postId");
    }
    if (!dbCommand || !dbQuery) throw AppError.serviceUnavailable("Database not available");

    const oid = safeObjectId(idStr);
    const queryId = oid || idStr;

    const post = await dbQuery.collection("posts").findOne({ _id: queryId });
    if (!post) {
      throw AppError.notFound("Post not found");
    }
    sendSuccess(res, post);
};

export const createComment = async (req: Request, res: Response) => {
    // Issue #285: normalize `string | string[]` param before use.
    const postIdStr = normalizeParam(req.params.postId);
    if (!postIdStr) {
      throw AppError.badRequest("Missing or invalid postId");
    }
    const { content, author, parentId } = req.body;

    if (!content || !author) {
      throw AppError.badRequest("Missing content or author");
    }
    if (!dbCommand || !dbQuery) throw AppError.serviceUnavailable("Database not available");

    const commentId = new ObjectId();
    let path = "";

    if (parentId) {
      const parentOid = safeObjectId(parentId);
      const parentQueryId = parentOid || parentId;
      const parentComment = await dbQuery
        .collection("comments")
        .findOne({ _id: parentQueryId });
      if (!parentComment) {
        throw AppError.notFound("Parent comment not found");
      }
      path = parentComment.path + commentId.toString() + ",";
    } else {
      path = `,${postIdStr},${commentId.toString()},`;
    }

    const comment = {
      _id: commentId,
      postId: postIdStr,
      parentId: parentId || null,
      content: escapeHtml(content),
      author: escapeHtml(author),
      path,
      upvotes: 0,
      upvoted_by: [] as string[],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await dbCommand.collection("comments").insertOne(comment);
    return sendSuccess(res, comment, 201);
};

export const editComment = async (req: Request, res: Response) => {
    // Issue #285: normalize both `:postId` and `:commentId` params.
    const postIdStr = normalizeParam(req.params.postId);
    const commentIdStr = normalizeParam(req.params.commentId);
    if (!postIdStr || !commentIdStr) {
      throw AppError.badRequest("Missing or invalid postId/commentId");
    }
    const { content } = req.body;

    if (!content) {
      throw AppError.badRequest("Missing content");
    }
    if (!dbCommand || !dbQuery) throw AppError.serviceUnavailable("Database not available");

    const oid = safeObjectId(commentIdStr);
    const queryId = oid || commentIdStr;

    const result = await dbCommand.collection("comments").findOneAndUpdate(
      { _id: queryId, postId: postIdStr },
      { $set: { content, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    const updatedComment = (result as any)?.value || result;
    if (!updatedComment) {
      throw AppError.notFound("Comment not found");
    }
    sendSuccess(res, updatedComment);
};

export const getComments = async (req: Request, res: Response) => {
    // Issue #285: normalize `string | string[]` param BEFORE calling
    // `.replace()` on it — the old code would crash with
    // `postId.replace is not a function` if Express delivered an array.
    const postIdStr = normalizeParam(req.params.postId);
    if (!postIdStr) {
      throw AppError.badRequest("Missing or invalid postId");
    }
    if (dbQuery) {
      const escapedPostId = postIdStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const comments = await dbQuery.collection("comments")
        .find({ $or: [{ postId: postIdStr }, { path: new RegExp('^,' + escapedPostId + ',') }] })
        .sort({ createdAt: -1 })
        .toArray();

      if (comments.length > 0) {
        return sendSuccess(res, { comments });
      }
    }

    sendSuccess(res, {
      comments: [
        {
          _id: "c_101",
          postId: postIdStr,
          author: "Neha Sharma",
          content: "Great resource! Thanks for sharing the roadmap repo.",
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          _id: "c_102",
          postId: postIdStr,
          author: "Vikas Kumar",
          content: "Super helpful! Added to my study bookmarks.",
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        },
      ],
    });
};

export const upvotePost = async (req: Request, res: Response) => {
    // Issue #285: normalize `string | string[]` param before use.
    const idStr = normalizeParam(req.params.postId);
    if (!idStr) {
      throw AppError.badRequest("Missing or invalid postId");
    }
    const userId = req.user?.uid;

    if (!userId) {
      throw AppError.badRequest("Missing userId");
    }
    if (!dbCommand || !dbQuery) throw AppError.serviceUnavailable("Database not available");

    const oid = safeObjectId(idStr);
    const queryId = oid || idStr;

    const result = await dbCommand
      .collection("posts")
      .updateOne(
        { _id: queryId, upvoted_by: { $ne: userId } },
        { $inc: { upvotes: 1 }, $push: { upvoted_by: userId } },
      );

    if (result.matchedCount === 0) {
      const post = await dbQuery.collection("posts").findOne({ _id: queryId });
      if (!post) {
        throw AppError.notFound("Post not found");
      }
      throw AppError.conflict("User has already upvoted this post");
    }

    sendSuccess(res, { message: "Post upvoted successfully" });
};
