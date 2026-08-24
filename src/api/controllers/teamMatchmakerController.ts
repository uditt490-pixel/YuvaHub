import { Request, Response } from "express";
import { dbCommand } from "../db.js";
import { AppError } from "../../lib/AppError.js";
import { safeObjectId } from "../../lib/utils.js";
import { sendSuccess, sendError } from "../../lib/apiResponse.js";
import { getSocketIO } from "../socketInstance.js";

// Recommend candidates based on a team's openRoles and HackerProfile skills
export const recommendCandidates = async (req: Request, res: Response) => {
  try {
    const teamId = req.params.teamId;
    const oid = safeObjectId(teamId);
    const filter = oid ? { _id: oid } : { _id: String(teamId) };

    const team = await dbCommand.collection("teams").findOne(filter);
    if (!team) throw AppError.notFound("Team not found");

    if (!team.openRoles || team.openRoles.length === 0) {
      return sendSuccess(res, { candidates: [] }, 200);
    }

    // Aggregation pipeline to match openRoles with hacker profiles
    const pipeline = [
      {
        $match: {
          skills: { $in: team.openRoles }
        }
      },
      {
        $addFields: {
          matchScore: {
            $size: {
              $setIntersection: ["$skills", team.openRoles]
            }
          }
        }
      },
      {
        $sort: { matchScore: -1 }
      },
      {
        $limit: 20
      }
    ];

    const candidates = await dbCommand.collection("hacker_profiles").aggregate(pipeline).toArray();
    const formatted = candidates.map((c: any) => ({ id: c._id.toString(), _id: c._id.toString(), ...c }));

    return sendSuccess(res, { candidates: formatted }, 200);
  } catch (err: any) {
    console.error("[Matchmaker API] Error recommending candidates:", err);
    return sendError(res, "Failed to recommend candidates", 500);
  }
};

export const sendTeamInvite = async (req: Request, res: Response) => {
  try {
    const teamId = req.params.teamId;
    const { candidateUid, candidateName, role } = req.body;

    const oid = safeObjectId(teamId);
    const filter = oid ? { _id: oid } : { _id: String(teamId) };
    const team = await dbCommand.collection("teams").findOne(filter);
    
    if (!team) throw AppError.notFound("Team not found");
    if (team.leaderUid !== req.user.uid) throw AppError.forbidden("Only team leaders can send invites");

    const inviteData = {
      teamId: team._id.toString(),
      teamName: team.name,
      candidateUid,
      candidateName,
      role,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await dbCommand.collection("team_invites").insertOne(inviteData);
    
    // Emit socket.io event to the candidate
    const io = getSocketIO();
    if (io) {
      io.to(`dm_${candidateUid}`).emit("receive_team_invite", {
        id: result.insertedId.toString(),
        ...inviteData
      });
    }

    return sendSuccess(res, { id: result.insertedId.toString(), ...inviteData }, 201);
  } catch (err: any) {
    console.error("[Matchmaker API] Error sending invite:", err);
    return sendError(res, "Failed to send invite", 500);
  }
};

export const respondToTeamInvite = async (req: Request, res: Response) => {
  try {
    const inviteId = req.params.inviteId;
    const { action } = req.body;

    if (!action || (action !== "accept" && action !== "reject")) {
      throw AppError.badRequest("Action must be 'accept' or 'reject'");
    }

    const invOid = safeObjectId(inviteId);
    const invFilter = invOid ? { _id: invOid } : { _id: String(inviteId) };

    const invite = await dbCommand.collection("team_invites").findOne(invFilter);
    if (!invite) throw AppError.notFound("Invite not found");
    if (invite.candidateUid !== req.user.uid) throw AppError.forbidden("You are not the recipient of this invite");
    if (invite.status !== "pending") throw AppError.badRequest(`Invite has already been ${invite.status}`);

    const teamOid = safeObjectId(invite.teamId);
    const teamFilter = teamOid ? { _id: teamOid } : { _id: String(invite.teamId) };
    const team = await dbCommand.collection("teams").findOne(teamFilter);
    
    if (!team) throw AppError.notFound("Associated team not found");

    if (action === "accept") {
      if (team.members && team.members.length >= (team.maxMembers || 4)) {
        throw AppError.badRequest("Team is already full");
      }

      const newMember = {
        uid: req.user.uid,
        name: req.user.name || req.user.email || invite.candidateName,
        email: req.user.email,
        role: invite.role,
        joinedAt: new Date().toISOString(),
      };

      const updatedMembers = [...(team.members || []), newMember];
      const newStatus = updatedMembers.length >= (team.maxMembers || 4) ? "closed" : team.status;

      await dbCommand.collection("teams").updateOne(teamFilter, {
        $set: { members: updatedMembers, status: newStatus, updatedAt: new Date().toISOString() }
      });
    }

    const updatedStatus = action === "accept" ? "accepted" : "rejected";
    await dbCommand.collection("team_invites").updateOne(invFilter, {
      $set: { status: updatedStatus, updatedAt: new Date().toISOString() }
    });

    return sendSuccess(res, { message: `Invite successfully ${updatedStatus}`, status: updatedStatus });
  } catch (err: any) {
    console.error("[Matchmaker API] Error responding to invite:", err);
    return sendError(res, "Failed to respond to invite", 500);
  }
};
