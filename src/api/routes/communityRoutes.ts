import { Router } from "express";
import { getPosts, createPost, deletePost, getPostById, createComment, editComment, getComments, upvotePost } from "../controllers/communityController.js";
import { authMiddleware, adminOnly } from "../../middleware/auth.js";

const router = Router();

router.get("/community/posts", getPosts);
router.post("/community/posts", authMiddleware, createPost);
router.delete("/community/posts/:postId", authMiddleware, adminOnly, deletePost);
router.get("/community/posts/:postId", getPostById);
router.post("/community/posts/:postId/comments", authMiddleware, createComment);
router.put("/community/posts/:postId/comments/:commentId", authMiddleware, editComment);
router.get("/community/posts/:postId/comments", getComments);
router.post("/community/posts/:postId/upvote", authMiddleware, upvotePost);

export default router;
