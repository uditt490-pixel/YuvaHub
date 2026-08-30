import { Request, Response, NextFunction } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId, parsePagination } from "../../lib/utils.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess, sendPaginated, sendServiceUnavailable } from "../../lib/apiResponse.js";
import { StudentGigSchema } from "../../models/studentGigSchema.js";
import { GigDeliverableSchema } from "../../models/gigDeliverableSchema.js";

export const getGigs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!dbQuery) return sendServiceUnavailable(res);
    const { page, limit, skip } = parsePagination(req.query);
    const filter = { status: { $in: ['open', 'in_progress'] } };
    
    // Optional search filter
    if (req.query.search) {
      Object.assign(filter, { title: { $regex: req.query.search, $options: 'i' } });
    }

    const [gigs, total] = await Promise.all([
      dbQuery.collection("student_gigs").find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      dbQuery.collection("student_gigs").countDocuments(filter)
    ]);
    return sendPaginated(res, gigs.map((g: any) => ({ ...g, id: g._id.toString() })), page, limit, total);
  } catch (err: any) {
    next(err);
  }
};

export const createGig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!dbCommand) throw AppError.serviceUnavailable("Database not available");
    
    const parsed = StudentGigSchema.parse({ ...req.body, posterId: user.uid });
    
    // Check balance
    const txs = await dbCommand.collection("transactions").find({ userId: user.uid }).toArray();
    const balance = txs.reduce((acc: number, tx: any) => acc + (tx.amount || 0), 0);
    if (balance < parsed.rewardPoints) throw AppError.badRequest("Insufficient karma for gig reward");

    let session;
    if (dbCommand.client && typeof dbCommand.client.startSession === 'function') {
      session = dbCommand.client.startSession();
      session.startTransaction();
    }

    try {
      // Deduct points
      await dbCommand.collection("transactions").insertOne({
        userId: user.uid,
        amount: -parsed.rewardPoints,
        type: 'gig_escrow',
        actionType: 'gig_escrow',
        timestamp: Date.now()
      }, session ? { session } : undefined);

      const gig = {
        ...parsed,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const result = await dbCommand.collection("student_gigs").insertOne(gig, session ? { session } : undefined);
      
      if (session) {
        await session.commitTransaction();
      }
      sendSuccess(res, { gig: { ...gig, id: result.insertedId.toString() } });
    } catch (err) {
      if (session) {
        await session.abortTransaction();
      }
      throw err;
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  } catch (err) {
    next(err);
  }
};

export const submitProposal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!dbCommand) throw AppError.serviceUnavailable("Database not available");
    const { proposalText } = req.body;

    const gigId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const oid = safeObjectId(gigId);
    if (!oid) throw AppError.badRequest("Invalid gig ID format");
    
    const gig = await dbCommand.collection("student_gigs").findOne({ _id: oid });
    if (!gig) throw AppError.notFound("Gig not found");
    if (gig.status !== 'open') throw AppError.badRequest("Gig is not open for proposals");
    if (gig.posterId === user.uid) throw AppError.badRequest("Cannot bid on your own gig");

    const proposal = {
      gigId,
      studentId: user.uid,
      proposalText,
      createdAt: Date.now()
    };
    
    const result = await dbCommand.collection("gig_proposals").insertOne(proposal);
    sendSuccess(res, { proposal: { ...proposal, id: result.insertedId.toString() } });
  } catch (err) {
    next(err);
  }
};

export const selectStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!dbCommand) throw AppError.serviceUnavailable("Database not available");
    const { studentId } = req.body;

    const gigId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const oid = safeObjectId(gigId);
    if (!oid) throw AppError.badRequest("Invalid gig ID format");
    
    const result = await dbCommand.collection("student_gigs").updateOne(
      { _id: oid, posterId: user.uid, status: 'open' },
      { $set: { status: 'in_progress', selectedStudentId: studentId, updatedAt: Date.now() } }
    );
    
    if (result.modifiedCount === 0) throw AppError.badRequest("Gig not found or not open");
    sendSuccess(res, { message: "Student selected successfully" });
  } catch (err) {
    next(err);
  }
};

export const submitDeliverable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!dbCommand) throw AppError.serviceUnavailable("Database not available");
    
    const gigId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsed = GigDeliverableSchema.parse({ ...req.body, gigId, studentId: user.uid });
    
    const oid = safeObjectId(gigId);
    if (!oid) throw AppError.badRequest("Invalid gig ID format");

    const gig = await dbCommand.collection("student_gigs").findOne({ _id: oid });
    if (!gig) throw AppError.notFound("Gig not found");
    if (gig.status !== 'in_progress') throw AppError.badRequest("Gig is not in progress");
    if (gig.selectedStudentId !== user.uid) throw AppError.forbidden("You are not selected for this gig");

    const deliverable = {
      ...parsed,
      submittedAt: Date.now()
    };
    
    const result = await dbCommand.collection("gig_deliverables").insertOne(deliverable);
    sendSuccess(res, { deliverable: { ...deliverable, id: result.insertedId.toString() } });
  } catch (err) {
    next(err);
  }
};

export const acceptDeliverable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!dbCommand) throw AppError.serviceUnavailable("Database not available");
    
    const gigId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deliverableId = req.body.deliverableId;
    
    const oid = safeObjectId(gigId);
    if (!oid) throw AppError.badRequest("Invalid gig ID format");

    let session;
    if (dbCommand.client && typeof dbCommand.client.startSession === 'function') {
      session = dbCommand.client.startSession();
      session.startTransaction();
    }

    try {
      const gig = await dbCommand.collection("student_gigs").findOne({ _id: oid }, session ? { session } : undefined);
      if (!gig) throw AppError.notFound("Gig not found");
      if (gig.posterId !== user.uid) throw AppError.forbidden("Only the creator can accept deliverables");
      if (gig.status !== 'in_progress') throw AppError.badRequest("Gig is not in progress");

      // Mark deliverable approved
      const dOid = safeObjectId(deliverableId);
      if (dOid) {
        await dbCommand.collection("gig_deliverables").updateOne(
          { _id: dOid, gigId: gigId },
          { $set: { status: 'approved' } },
          session ? { session } : undefined
        );
      }

      // Mark gig completed
      await dbCommand.collection("student_gigs").updateOne(
        { _id: oid },
        { $set: { status: 'completed', updatedAt: Date.now() } },
        session ? { session } : undefined
      );

      // Payout to student
      await dbCommand.collection("transactions").insertOne({
        userId: gig.selectedStudentId,
        amount: gig.rewardPoints,
        type: 'gig_payout',
        actionType: 'gig_payout',
        timestamp: Date.now(),
        metadata: { gigId: gigId }
      }, session ? { session } : undefined);

      if (session) {
        await session.commitTransaction();
      }
      sendSuccess(res, { message: "Deliverable accepted and payout processed" });
    } catch (err) {
      if (session) {
        await session.abortTransaction();
      }
      throw err;
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  } catch (err) {
    next(err);
  }
};
