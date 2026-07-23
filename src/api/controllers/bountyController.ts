import { Request, Response, NextFunction } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId } from "../../lib/utils.js";

export const getBounties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbQuery) return res.status(503).json({ error: "Database not available" });
    const bounties = await dbQuery.collection("bounties").find({ status: { $in: ['open', 'accepted'] } }).sort({ createdAt: -1 }).limit(100).toArray();
    res.json({ items: bounties.map((b: any) => ({ ...b, id: b._id.toString() })) });
  } catch (err: any) {
    next(err);
  }
};

export const createBounty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!dbCommand) return res.status(503).json({ error: "Database not available" });
    const { title, description, tags, reward, posterName } = req.body;

    const txs = await dbCommand.collection("transactions").find({ userId: user.uid }).toArray();
    const balance = txs.reduce((acc: number, tx: any) => acc + (tx.amount || 0), 0);
    if (balance < reward) return res.status(400).json({ error: "Insufficient karma" });

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
    res.json({ success: true, bounty: { ...bounty, id: result.insertedId.toString() } });
  } catch (err: any) {
    next(err);
  }
};

export const acceptBounty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!dbCommand) return res.status(503).json({ error: "Database not available" });
    const { mentorName } = req.body;

    const bountyId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const oid = safeObjectId(bountyId);
    if (!oid) return res.status(400).json({ error: "Invalid bounty ID format" });
    const result = await dbCommand.collection("bounties").updateOne(
      { _id: oid, status: 'open' },
      { $set: { status: 'accepted', mentorId: user.uid, mentorName, updatedAt: Date.now() } }
    );
    if (result.modifiedCount === 0) return res.status(400).json({ error: "Bounty not available" });
    res.json({ success: true });
  } catch (err: any) {
    next(err);
  }
};

export const resolveBounty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!dbCommand) return res.status(503).json({ error: "Database not available" });

    const bountyId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const oid = safeObjectId(bountyId);
    if (!oid) return res.status(400).json({ error: "Invalid bounty ID format" });
    const bounty = await dbCommand.collection("bounties").findOne({ _id: oid });
    if (!bounty) return res.status(404).json({ error: "Not found" });
    if (bounty.posterId !== user.uid) return res.status(403).json({ error: "Only poster can resolve" });

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

    res.json({ success: true });
  } catch (err: any) {
    next(err);
  }
};

export const rateBounty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!dbCommand) return res.status(503).json({ error: "Database not available" });
    const { rating } = req.body;

    const bountyId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const oid = safeObjectId(bountyId);
    if (!oid) return res.status(400).json({ error: "Invalid bounty ID format" });
    const bounty = await dbCommand.collection("bounties").findOne({ _id: oid });
    if (!bounty) return res.status(404).json({ error: "Not found" });
    if (bounty.posterId !== user.uid) return res.status(403).json({ error: "Only poster can rate" });

    const usersCol = dbCommand.collection("users");
    await usersCol.updateOne(
      { uid: bounty.mentorId },
      { $inc: { reputation: rating, bountiesResolved: 1 } }
    );

    res.json({ success: true });
  } catch (err: any) {
    next(err);
  }
};

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbQuery) return res.status(503).json({ error: "Database not available" });
    const topUsers = await dbQuery.collection("users")
      .find({ reputation: { $gt: 0 } })
      .sort({ reputation: -1 })
      .limit(10)
      .toArray();

    res.json({
      items: topUsers.map((u: any) => ({
        userId: u.uid,
        name: u.name,
        avatarUrl: u.avatarUrl,
        reputation: u.reputation || 0,
        bountiesResolved: u.bountiesResolved || 0
      }))
    });
  } catch (err: any) {
    next(err);
  }
};
