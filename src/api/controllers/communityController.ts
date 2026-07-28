import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { ObjectId } from "mongodb";
import { safeObjectId, normalizeParam } from "../../lib/utils.js";
import escapeHtml from "escape-html";

const containsProfanity = (text: string): boolean => {
  const profanityRegex =
    /\b(badword|abuse|hate|spam|scam|idiot|stupid|bastard)\b/i;
  return profanityRegex.test(text);
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const sort = req.query.sort === "trending" ? "trending" : "latest";
    const sortOption: any =
      sort === "trending" ? { upvotes: -1, createdAt: -1 } : { createdAt: -1 };

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const cursor = req.query.cursor as string | undefined;

    if (dbQuery) {
      let query: any = {};
      if (cursor) {
        const cursorOid = safeObjectId(cursor);
        if (cursorOid) {
          query._id = { $lt: cursorOid };
        } else {
          query.id = { $lt: cursor };
        }
      }

      const posts = await dbQuery
        .collection("posts")
        .find(query)
        .sort(sortOption)
        .limit(limit + 1)
        .toArray();

      const hasNextPage = posts.length > limit;
      if (hasNextPage) posts.pop();

      const nextCursor = hasNextPage && posts.length > 0
        ? (posts[posts.length - 1]._id?.toString() || null)
        : null;

      return res.json({
        posts,
        nextCursor,
        hasNextPage,
        limit,
        total: posts.length,
      });
    }

    const mockPosts: any[] = [];
    const nextCursor = null;

    return res.json({
      posts: mockPosts,
      nextCursor,
      hasNextPage: false,
      limit,
      total: 0,
    });
  } catch (err) {
    console.error("Fetch Posts Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, author, type, tags, uid } = req.body;
    const userUid = req.user?.uid || uid || "user_anon";
    if (!content || (!author && !req.user?.name)) {
      return res
        .status(400)
        .json({ error: "Missing post content or author name" });
    }

    if (containsProfanity(title || "") || containsProfanity(content)) {
      return res
        .status(400)
        .json({
          error: "Post contains inappropriate language or prohibited keywords.",
        });
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
      return res
        .status(201)
        .json({
          ...post,
          _id: result.insertedId,
          id: result.insertedId.toString(),
        });
    }

    res
      .status(201)
      .json({ ...post, _id: "post_" + Date.now(), id: "post_" + Date.now() });
  } catch (err) {
    console.error("Create Post Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    // Issue #285: route params can be `string | string[]` at runtime.
    // Normalize before any string operation or ObjectId construction.
    const idStr = normalizeParam(req.params.postId);
    if (!idStr) {
      return res.status(400).json({ error: "Missing or invalid postId" });
    }
    if (dbCommand) {
      const oid = safeObjectId(idStr);
      const queryId = oid || idStr;
      await dbCommand
        .collection("posts")
        .deleteOne({ $or: [{ _id: queryId }, { id: idStr }] });
    }
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete Post Error:", err);
    res.status(500).json({ error: "Failed to delete post" });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    if (!dbCommand || !dbQuery)
      return res.status(503).json({ error: "Database not available" });
    // Issue #285: normalize `string | string[]` param before use.
    const idStr = normalizeParam(req.params.postId);
    if (!idStr) {
      return res.status(400).json({ error: "Missing or invalid postId" });
    }
    if (!dbCommand || !dbQuery) return res.status(503).json({ error: "Database not available" });

    const oid = safeObjectId(idStr);
    const queryId = oid || idStr;

    const post = await dbQuery.collection("posts").findOne({ _id: queryId });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    console.error("Fetch Post Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    // Issue #285: normalize `string | string[]` param before use.
    const postIdStr = normalizeParam(req.params.postId);
    if (!postIdStr) {
      return res.status(400).json({ error: "Missing or invalid postId" });
    }
    const { content, author, parentId } = req.body;

    if (!content || !author) {
      return res.status(400).json({ error: "Missing content or author" });
    }
    if (!dbCommand || !dbQuery)
      return res.status(503).json({ error: "Database not available" });

    const commentId = new ObjectId();
    let path = "";

    if (parentId) {
      const parentOid = safeObjectId(parentId);
      const parentQueryId = parentOid || parentId;
      const parentComment = await dbQuery
        .collection("comments")
        .findOne({ _id: parentQueryId });
      if (!parentComment) {
        return res.status(404).json({ error: "Parent comment not found" });
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
    res.status(201).json(comment);
  } catch (err) {
    console.error("Create Comment Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const editComment = async (req: Request, res: Response) => {
  try {
    // Issue #285: normalize both `:postId` and `:commentId` params.
    const postIdStr = normalizeParam(req.params.postId);
    const commentIdStr = normalizeParam(req.params.commentId);
    if (!postIdStr || !commentIdStr) {
      return res.status(400).json({ error: "Missing or invalid postId/commentId" });
    }
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Missing content" });
    }
    if (!dbCommand || !dbQuery)
      return res.status(503).json({ error: "Database not available" });

    const oid = safeObjectId(commentIdStr);
    const queryId = oid || commentIdStr;

    const result = await dbCommand.collection("comments").findOneAndUpdate(
      { _id: queryId, postId: postIdStr },
      { $set: { content, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    const updatedComment = (result as any)?.value || result;
    if (!updatedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.json(updatedComment);
  } catch (err) {
    console.error("Edit Comment Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const postIdStr = normalizeParam(req.params.postId);
    if (!postIdStr) {
      return res.status(400).json({ error: "Missing or invalid postId" });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const cursor = req.query.cursor as string | undefined;

    if (dbQuery) {
      const escapedPostId = postIdStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      let query: any = {
        $or: [{ postId: postIdStr }, { path: new RegExp('^,' + escapedPostId + ',') }],
      };
      if (cursor) {
        const cursorOid = safeObjectId(cursor);
        if (cursorOid) {
          query = {
            ...query,
            _id: { $lt: cursorOid },
          };
        }
      }

      const comments = await dbQuery.collection("comments")
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .toArray();

      const hasNextPage = comments.length > limit;
      if (hasNextPage) comments.pop();

      const nextCursor = hasNextPage && comments.length > 0
        ? (comments[comments.length - 1]._id?.toString() || null)
        : null;

      return res.json({
        comments,
        nextCursor,
        hasNextPage,
        limit,
        total: comments.length,
      });
    }

    res.json({
      comments: [],
      nextCursor: null,
      hasNextPage: false,
      limit,
      total: 0,
    });
  } catch (err) {
    console.error("Fetch Comments Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const upvotePost = async (req: Request, res: Response) => {
  try {
    // Issue #285: normalize `string | string[]` param before use.
    const idStr = normalizeParam(req.params.postId);
    if (!idStr) {
      return res.status(400).json({ error: "Missing or invalid postId" });
    }
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    if (!dbCommand || !dbQuery)
      return res.status(503).json({ error: "Database not available" });

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
        return res.status(404).json({ error: "Post not found" });
      }
      return res
        .status(409)
        .json({ error: "User has already upvoted this post" });
    }

    res.json({ success: true, message: "Post upvoted successfully" });
  } catch (err) {
    console.error("Upvote Post Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
