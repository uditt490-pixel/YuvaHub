import { Request, Response } from "express";
import { dbCommand } from "../db.js";
import { AppError } from "../../lib/AppError.js";
import { safeObjectId, parsePagination } from "../../lib/utils.js";
import { sendPaginated, sendSuccess, sendError } from "../../lib/apiResponse.js";
import { CreateStudyGroupInputSchema } from "../../models/studyGroupSchema.js";

export const createRoom = async (req: Request, res: Response) => {
  const parsed = CreateStudyGroupInputSchema.safeParse(req.body);
  if (!parsed.success) {
    throw AppError.badRequest("Invalid input: " + parsed.error.message);
  }

  const { name, topic, tags, maxCapacity, resourceUrl } = parsed.data;

  const roomData = {
    name,
    topic,
    tags: tags || [],
    maxCapacity: maxCapacity || 10,
    createdBy: req.user.uid,
    resourceUrl: resourceUrl || "",
    members: [req.user.uid],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await dbCommand.collection("study_groups").insertOne(roomData);
  return sendSuccess(res, { id: result.insertedId.toString(), ...roomData }, 201);
};

export const listRooms = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { tag, topic, q } = req.query;
    const queryFilter: any = { isActive: true };

    if (tag) queryFilter.tags = { $in: [String(tag)] };
    if (topic) queryFilter.topic = { $regex: String(topic), $options: "i" };
    if (q) {
      queryFilter.$or = [
        { name: { $regex: String(q), $options: "i" } },
        { topic: { $regex: String(q), $options: "i" } }
      ];
    }

    const [rooms, total] = await Promise.all([
      dbCommand.collection("study_groups").find(queryFilter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      dbCommand.collection("study_groups").countDocuments(queryFilter)
    ]);
    const formatted = rooms.map((r: any) => ({ id: r._id.toString(), _id: r._id.toString(), ...r }));

    return sendPaginated(res, formatted, page, limit, total);
  } catch (err: any) {
    console.error("[StudyGroup API] Error fetching rooms:", err);
    return sendError(res, "Failed to fetch study groups", 500);
  }
};

export const joinRoom = async (req: Request, res: Response) => {
  const roomId = req.params.id;
  const oid = safeObjectId(roomId);
  const filter = oid ? { _id: oid } : { _id: String(roomId) };

  const room = await dbCommand.collection("study_groups").findOne(filter);
  if (!room) throw AppError.notFound("Study group not found");
  if (!room.isActive) throw AppError.badRequest("Study group is not active");

  if (room.members && room.members.includes(req.user.uid)) {
    return sendSuccess(res, { message: "Already in room" });
  }

  if (room.members && room.members.length >= (room.maxCapacity || 10)) {
    throw AppError.badRequest("Study group is full");
  }

  const updatedMembers = [...(room.members || []), req.user.uid];

  await dbCommand.collection("study_groups").updateOne(filter, {
    $set: { members: updatedMembers, updatedAt: new Date().toISOString() }
  });

  return sendSuccess(res, { message: "Successfully joined study group" });
};

export const leaveRoom = async (req: Request, res: Response) => {
  const roomId = req.params.id;
  const oid = safeObjectId(roomId);
  const filter = oid ? { _id: oid } : { _id: String(roomId) };

  const room = await dbCommand.collection("study_groups").findOne(filter);
  if (!room) throw AppError.notFound("Study group not found");

  const members = room.members || [];
  const updatedMembers = members.filter((uid: string) => uid !== req.user.uid);

  await dbCommand.collection("study_groups").updateOne(filter, {
    $set: { members: updatedMembers, updatedAt: new Date().toISOString() }
  });

  return sendSuccess(res, { message: "Successfully left study group" });
};

export const deleteRoom = async (req: Request, res: Response) => {
  const roomId = req.params.id;
  const oid = safeObjectId(roomId);
  const filter = oid ? { _id: oid } : { _id: String(roomId) };

  const room = await dbCommand.collection("study_groups").findOne(filter);
  if (!room) throw AppError.notFound("Study group not found");

  if (room.createdBy !== req.user.uid) {
    throw AppError.forbidden("Only the creator can delete this study group");
  }

  await dbCommand.collection("study_groups").deleteOne(filter);

  return sendSuccess(res, { message: "Study group deleted successfully" });
};
