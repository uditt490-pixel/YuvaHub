import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { ObjectId } from "mongodb";
import { safeObjectId } from "../../lib/utils.js";

const containsProfanity = (text: string): boolean => {
  const profanityRegex = /\b(badword|abuse|hate|spam|scam|idiot|stupid|bastard)\b/i;
  return profanityRegex.test(text);
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const sort = req.query.sort === 'trending' ? 'trending' : 'latest';
    const sortOption: any = sort === 'trending' ? { upvotes: -1, createdAt: -1 } : { createdAt: -1 };

    if (dbQuery) {
      const posts = await dbQuery.collection("posts").find({}).sort(sortOption).limit(50).toArray();
      if (posts.length > 0) {
        return res.json(posts);
      }
    }

    const mockPosts = [
      { _id: "post_1", id: "post_1", title: "Secured GSoC 2026 Mentorship under Linux Foundation! 🎉", content: "Super thrilled to share that my proposal for kernel telemetry tools was accepted! Big thanks to the YuvaHub community for reviewing my draft.", author: "Aarav Sharma", authorUid: "user_aarav_123", type: "Win", tags: ["GSoC", "OpenSource", "Linux"], upvotes: 24, upvoted_by: [], repliesCount: 3, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { _id: "post_2", id: "post_2", title: "Tips for Crack Microsoft Engage & SWE Internship OA?", content: "Hey folks! Any recent experience with Microsoft's coding assessment? Looking for recommended topics and problem sets to practice.", author: "Priya Patel", authorUid: "user_priya_456", type: "Question", tags: ["Microsoft", "DSA", "Internship"], upvotes: 15, upvoted_by: [], repliesCount: 5, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
      { _id: "post_3", id: "post_3", title: "Curated Roadmap: System Design & Microservices for Students", content: "Created a free GitHub repo summarizing clean architecture, caching, and rate limiting patterns for campus placements.", author: "Rohan Verma", authorUid: "user_rohan_789", type: "Resource", tags: ["SystemDesign", "Backend", "Roadmap"], upvotes: 38, upvoted_by: [], repliesCount: 8, createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() }
    ];

    if (sort === 'trending') {
      mockPosts.sort((a, b) => b.upvotes - a.upvotes);
    }
    res.json(mockPosts);
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
      return res.status(400).json({ error: "Missing post content or author name" });
    }

    if (containsProfanity(title || "") || containsProfanity(content)) {
      return res.status(400).json({ error: "Post contains inappropriate language or prohibited keywords." });
    }

    const post = {
      title: title || "Community Discussion",
      content,
      author: author || req.user?.name || req.user?.email || "Anonymous",
      authorUid: userUid,
      type: type || "Update",
      tags: Array.isArray(tags) ? tags : ["General"],
      upvotes: 0,
      upvoted_by: [] as string[],
      repliesCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (dbCommand) {
      const result = await dbCommand.collection("posts").insertOne(post);
      return res.status(201).json({ ...post, _id: result.insertedId, id: result.insertedId.toString() });
    }

    res.status(201).json({ ...post, _id: "post_" + Date.now(), id: "post_" + Date.now() });
  } catch (err) {
    console.error("Create Post Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const idStr = Array.isArray(postId) ? postId[0] : postId;
    if (dbCommand) {
      const oid = safeObjectId(idStr);
      const queryId = oid || idStr;
      await dbCommand.collection("posts").deleteOne({ $or: [{ _id: queryId }, { id: idStr }] });
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
    if (!dbCommand || !dbQuery) return res.status(503).json({ error: "Database not available" });

    const oid = safeObjectId(postId);
    const queryId = oid || postId;

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
    const { postId } = req.params;
    const { content, author, parentId } = req.body;

    if (!content || !author) {
      return res.status(400).json({ error: "Missing content or author" });
    }
    if (!dbCommand || !dbQuery) return res.status(503).json({ error: "Database not available" });

    const commentId = new ObjectId();
    let path = "";

    if (parentId) {
      const parentOid = safeObjectId(parentId);
      const parentQueryId = parentOid || parentId;
      const parentComment = await dbQuery.collection("comments").findOne({ _id: parentQueryId });
      if (!parentComment) {
        return res.status(404).json({ error: "Parent comment not found" });
      }
      path = parentComment.path + commentId.toString() + ",";
    } else {
      path = `,${postId},${commentId.toString()},`;
    }

    const comment = {
      _id: commentId,
      postId,
      parentId: parentId || null,
      content,
      author,
      path,
      upvotes: 0,
      upvoted_by: [] as string[],
      createdAt: new Date(),
      updatedAt: new Date()
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
    const { postId, commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Missing content" });
    }
    if (!dbCommand || !dbQuery) return res.status(503).json({ error: "Database not available" });

    const oid = typeof commentId === 'string' ? safeObjectId(commentId) : null;
    const queryId = oid || commentId;

    const result = await dbCommand.collection("comments").findOneAndUpdate(
      { _id: queryId, postId },
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
    const { postId } = req.params;
    if (dbQuery) {
      const comments = await dbQuery.collection("comments")
        .find({ $or: [{ postId }, { path: new RegExp('^,' + postId + ',') }] })
        .sort({ createdAt: -1 })
        .toArray();

      if (comments.length > 0) {
        return res.json(comments);
      }
    }

    res.json([
      { _id: "c_101", postId, author: "Neha Sharma", content: "Great resource! Thanks for sharing the roadmap repo.", createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
      { _id: "c_102", postId, author: "Vikas Kumar", content: "Super helpful! Added to my study bookmarks.", createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() }
    ]);
  } catch (err) {
    console.error("Fetch Comments Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const upvotePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const idStr = Array.isArray(postId) ? postId[0] : postId;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    if (!dbCommand || !dbQuery) return res.status(503).json({ error: "Database not available" });

    const oid = safeObjectId(idStr);
    const queryId = oid || idStr;

    const result = await dbCommand.collection("posts").updateOne(
      { _id: queryId, upvoted_by: { $ne: userId } },
      { $inc: { upvotes: 1 }, $push: { upvoted_by: userId } }
    );

    if (result.matchedCount === 0) {
      const post = await dbQuery.collection("posts").findOne({ _id: queryId });
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      return res.status(409).json({ error: "User has already upvoted this post" });
    }

    res.json({ success: true, message: "Post upvoted successfully" });
  } catch (err) {
    console.error("Upvote Post Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
