import { dbQuery, dbCommand } from "../db.js";
import { AppError } from "../../lib/AppError.js";
import { Endorsement } from "../../models/endorsementSchema.js";

export class EndorsementService {
  /**
   * Endorse a skill for a target user.
   */
  static async endorseSkill(endorserUid: string, targetUid: string, skill: string) {
    if (!dbCommand) {
      return { success: true, message: "Mock endorsement success" };
    }

    if (endorserUid === targetUid) {
      throw AppError.badRequest("Cannot endorse yourself.");
    }

    const db = dbCommand;

    // Check if duplicate
    const existing = await db.collection("endorsements").findOne({
      endorserUid,
      targetUid,
      skill,
    });

    if (existing) {
      throw AppError.badRequest("You have already endorsed this skill for this user.");
    }

    // Insert the endorsement
    const endorsement: Endorsement = {
      endorserUid,
      targetUid,
      skill,
      timestamp: new Date(),
    };

    await db.collection("endorsements").insertOne(endorsement);

    // Award Karma: +5 for endorser, +10 for endorsee
    await db.collection("transactions").insertMany([
      {
        userId: endorserUid,
        amount: 5,
        type: 'endorsement_given',
        timestamp: Date.now(),
        metadata: { targetUid, skill }
      },
      {
        userId: targetUid,
        amount: 10,
        type: 'endorsement_received',
        timestamp: Date.now(),
        metadata: { endorserUid, skill }
      }
    ]);

    return { success: true };
  }

  /**
   * Retract an endorsement.
   */
  static async retractEndorsement(endorserUid: string, targetUid: string, skill: string) {
    if (!dbCommand) return { success: true };

    const result = await dbCommand.collection("endorsements").deleteOne({
      endorserUid,
      targetUid,
      skill,
    });

    if (result.deletedCount === 0) {
      throw AppError.notFound("Endorsement not found.");
    }

    // Optionally retract karma here, but we will leave it for now to avoid negative karma confusion.
    return { success: true };
  }

  /**
   * Get endorsement summaries for a given user
   */
  static async getEndorsementSummary(uid: string) {
    if (!dbQuery) return { received: [], given: [] };

    // Group received endorsements by skill
    const receivedPipeline = [
      { $match: { targetUid: uid } },
      { $group: { _id: "$skill", count: { $sum: 1 }, endorsers: { $push: "$endorserUid" } } },
      { $project: { skill: "$_id", count: 1, endorsers: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ];

    // Group given endorsements by skill/target
    const givenPipeline = [
      { $match: { endorserUid: uid } },
      { $project: { targetUid: 1, skill: 1, timestamp: 1, _id: 0 } },
      { $sort: { timestamp: -1 } }
    ];

    const [received, given] = await Promise.all([
      dbQuery.collection("endorsements").aggregate(receivedPipeline).toArray(),
      dbQuery.collection("endorsements").aggregate(givenPipeline).toArray()
    ]);

    return { received, given };
  }
}
