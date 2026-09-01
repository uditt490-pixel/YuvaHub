import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import {
  createRoom,
  listRooms,
  joinRoom,
  leaveRoom,
  deleteRoom,
} from "../controllers/studyGroupController.js";

const router = Router();

router.post("/study-groups", authMiddleware, createRoom);
router.get("/study-groups", authMiddleware, listRooms);
router.post("/study-groups/:id/join", authMiddleware, joinRoom);
router.post("/study-groups/:id/leave", authMiddleware, leaveRoom);
router.delete("/study-groups/:id", authMiddleware, deleteRoom);

export default router;
