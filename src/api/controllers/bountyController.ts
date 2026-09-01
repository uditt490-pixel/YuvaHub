import { Request, Response, NextFunction } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId, parsePagination } from "../../lib/utils.js";
import { paginate } from "../../lib/pagination.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess, sendError, sendPaginated, sendServiceUnavailable } from "../../lib/apiResponse.js";
import { recordActivity } from "./activityController.js";

export const getBounties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbQuery) return sendServiceUnavailable(res);
    const { page, limit, skip } = parsePagination(req.query);
    const filter = { status: { $in: ['open', 'accepted'] } };
    const [bounties, total] = await Promise.all([
      dbQuery.collection("bounties").find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      dbQuery.collection("bounties").countDocuments(filter)
    ]);
    return sendPaginated(res, bounties.map((b: any) => ({ ...b, id: b._id.toString() })), page, limit, total);
  } catch (err: any) {
    next(err);
  }
};

export const createBounty = async (req: Request, res: Response) => {
  const user = req.user;
  if (!dbCommand) throw AppError.serviceUnavailable("Database not available");
  const { title, description, tags, reward, posterName } = req.body;

  const txs = await dbCommand.collection("transactions").find({ userId: user.uid }).toArray();
  const balance = txs.reduce((acc: number, tx: any) => acc + (tx.amount || 0), 0);
  if (balance < reward) throw AppError.badRequest("Insufficient karma");

  await dbCommand.collection("transactions").insertOne({
    userId: user.uid,
    amount: -reward,
    type: 'bounty_post',
    timestamp: Date.now()
  });

  const bounty = {
    title, description, tags, reward,
    status: 'open',
    posterId: user.uid,
    posterName,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  const result = await dbCommand.collection("bounties").insertOne(bounty);
  
  await recordActivity({
    userId: user.uid,
    type: "bounty_posted",
    entityId: result.insertedId.toString(),
    metadata: { title },
    points: -reward
  });

  sendSuccess(res, { bounty: { ...bounty, id: result.insertedId.toString() } });
};

export const acceptBounty = async (req: Request, res: Response) => {
  const user = req.user;
  if (!dbCommand) throw AppError.serviceUnavailable("Database not available");
  const { mentorName } = req.body;

  const bountyId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const oid = safeObjectId(bountyId);
  if (!oid) throw AppError.badRequest("Invalid bounty ID format");
  const result = await dbCommand.collection("bounties").updateOne(
    { _id: oid, status: 'open' },
    { $set: { status: 'accepted', mentorId: user.uid, mentorName, updatedAt: Date.now() } }
  );
  if (result.modifiedCount === 0) throw AppError.badRequest("Bounty not available");
  
  await recordActivity({
    userId: user.uid,
    type: "bounty_accepted",
    entityId: bountyId
  });

  sendSuccess(res, {});
};

export const resolveBounty = async (req: Request, res: Response) => {
  const user = req.user;
  if (!dbCommand) throw AppError.serviceUnavailable("Database not available");

  const bountyId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const oid = safeObjectId(bountyId);
  if (!oid) throw AppError.badRequest("Invalid bounty ID format");
  const bounty = await dbCommand.collection("bounties").findOne({ _id: oid });
  if (!bounty) throw AppError.notFound("Not found");
  if (bounty.posterId !== user.uid) throw AppError.forbidden("Only poster can resolve");

  await dbCommand.collection("bounties").updateOne(
    { _id: oid },
    { $set: { status: 'resolved', updatedAt: Date.now() } }
  );

  await dbCommand.collection("transactions").insertOne({
    userId: bounty.mentorId,
    amount: bounty.reward,
    type: 'bounty_reward',
    timestamp: Date.now(),
    metadata: { bountyId: bountyId }
  });

  await recordActivity({
    userId: user.uid,
    type: "bounty_resolved",
    entityId: bountyId
  });

  await recordActivity({
    userId: bounty.mentorId,
    type: "karma_earned",
    entityId: bountyId,
    points: bounty.reward,
    metadata: { source: "bounty_reward" }
  });

  sendSuccess(res, {});
};

export const rateBounty = async (req: Request, res: Response) => {
  const user = req.user;
  if (!dbCommand) throw AppError.serviceUnavailable("Database not available");
  const { rating } = req.body;

  const bountyId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const oid = safeObjectId(bountyId);
  if (!oid) throw AppError.badRequest("Invalid bounty ID format");
  const bounty = await dbCommand.collection("bounties").findOne({ _id: oid });
  if (!bounty) throw AppError.notFound("Not found");
  if (bounty.posterId !== user.uid) throw AppError.forbidden("Only poster can rate");

  const usersCol = dbCommand.collection("users");
  await usersCol.updateOne(
    { uid: bounty.mentorId },
    { $inc: { reputation: rating, bountiesResolved: 1 } }
  );

  sendSuccess(res, {});
};

export const getLeaderboard = async (req: Request, res: Response) => {
  if (!dbQuery) throw AppError.serviceUnavailable("Database not available");
  const topUsers = await dbQuery.collection("users")
    .find({ reputation: { $gt: 0 } })
    .sort({ reputation: -1 })
    .limit(10)
    .toArray();

  sendSuccess(res, {
    items: topUsers.map((u: any) => ({
      userId: u.uid,
      name: u.name,
      avatarUrl: u.avatarUrl,
      reputation: u.reputation || 0,
      bountiesResolved: u.bountiesResolved || 0
    }))
  });
};
