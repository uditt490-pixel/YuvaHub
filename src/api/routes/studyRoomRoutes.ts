import { Router } from "express";
import {
  createStudyRoom,
  getStudyRoomDetails,
} from "../controllers/studyRoomController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

// Create new collaborative WebRTC study room
router.post("/study-rooms", authMiddleware, createStudyRoom);

// Get study room details by roomId
router.get("/study-rooms/:roomId", getStudyRoomDetails);

export default router;
