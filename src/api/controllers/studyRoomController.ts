import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { sendSuccess, sendError } from "../../lib/apiResponse.js";

/**
 * Controller for WebRTC Collaborative Study Rooms & Mentorship Video Chat (#895)
 */
export const createStudyRoom = async (req: Request, res: Response) => {
  const userId = req.user?.id || req.user?.uid || (req.user as any)?._id || "user_anon";
  const { name, topic } = req.body;

  const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const roomRecord = {
    _id: roomId,
    roomId,
    name: name || "Collaborative Study & Mentorship Session",
    topic: topic || "Algorithms & Code Review",
    createdBy: userId,
    activeParticipants: [userId],
    shareableUrl: `/study-rooms/${roomId}`,
    createdAt: new Date(),
  };

  try {
    if (dbCommand) {
      await dbCommand.collection("study_rooms").insertOne(roomRecord);
    }

    return res.status(201).json({
      success: true,
      roomId,
      shareableUrl: roomRecord.shareableUrl,
      room: roomRecord,
      message: "Collaborative study room created successfully.",
    });
  } catch (error) {
    console.error("Error creating study room:", error);
    return sendError(res, "Failed to create study room.", 500);
  }
};

export const getStudyRoomDetails = async (req: Request, res: Response) => {
  const { roomId } = req.params;

  try {
    let room: any = null;
    if (dbQuery) {
      room = await dbQuery.collection("study_rooms").findOne({ roomId });
    }

    if (!room) {
      room = {
        _id: roomId,
        roomId,
        name: "Collaborative Study & Mentorship Room",
        topic: "Peer Code Pairing & Mock Interview",
        createdBy: "host_user",
        shareableUrl: `/study-rooms/${roomId}`,
        activeParticipants: [],
        createdAt: new Date().toISOString(),
      };
    }

    return sendSuccess(res, room);
  } catch (error) {
    console.error("Error fetching study room details:", error);
    return sendError(res, "Failed to fetch study room details.", 500);
  }
};
