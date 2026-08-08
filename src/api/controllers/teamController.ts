import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { AppError } from "../../lib/AppError.js";
import { safeObjectId, parsePagination } from "../../lib/utils.js";
import { sendPaginated, sendSuccess, sendError } from "../../lib/apiResponse.js";

export const createTeam = async (req: Request, res: Response) => {
  const { name, opportunityId, opportunityTitle, description, requiredRoles, maxMembers } = req.body;
  if (!name || !description || !requiredRoles || !Array.isArray(requiredRoles) || requiredRoles.length === 0) {
    throw AppError.badRequest("Missing required fields: name, description, requiredRoles");
  }

  const teamData = {
    name, opportunityId: opportunityId || null, opportunityTitle: opportunityTitle || null,
    description, requiredRoles,
    maxMembers: maxMembers ? Number(maxMembers) : 4,
    leaderUid: req.user.uid,
    leaderName: req.user.name || req.user.email || "Anonymous Leader",
    members: [{ uid: req.user.uid, name: req.user.name || req.user.email || "Anonymous Leader", email: req.user.email, role: "Leader", joinedAt: new Date().toISOString() }],
    status: "open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await dbCommand.collection("teams").insertOne(teamData);
  return sendSuccess(res, { id: result.insertedId.toString(), ...teamData }, 201);
};

export const listTeams = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { opportunityId, q, role, status } = req.query;
    const queryFilter: any = {};

    if (opportunityId) queryFilter.opportunityId = String(opportunityId);
    if (status) queryFilter.status = String(status);
    if (role) queryFilter.requiredRoles = { $in: [new RegExp(String(role), "i")] };
    if (q) {
      queryFilter.$or = [
        { name: { $regex: String(q), $options: "i" } },
        { description: { $regex: String(q), $options: "i" } },
        { opportunityTitle: { $regex: String(q), $options: "i" } }
      ];
    }

    const [teams, total] = await Promise.all([
      dbCommand.collection("teams").find(queryFilter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      dbCommand.collection("teams").countDocuments(queryFilter)
    ]);
    const formatted = teams.map((t: any) => ({ id: t._id.toString(), _id: t._id.toString(), ...t }));

    return sendPaginated(res, formatted, page, limit, total);
  } catch (err: any) {
    console.error("[Team API] Error fetching teams:", err);
    return sendError(res, "Failed to fetch teams", 500);
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  const teamId = req.params.id;
  const oid = safeObjectId(teamId);
  const filter = oid ? { _id: oid } : { _id: String(teamId) };

  const team = await dbCommand.collection("teams").findOne(filter);
  if (!team) throw AppError.notFound("Team not found");

  return sendSuccess(res, { id: team._id.toString(), _id: team._id.toString(), ...team });
};

export const submitJoinRequest = async (req: Request, res: Response) => {
  const teamId = req.params.id;
  const { role, message } = req.body;

  if (!role) throw AppError.badRequest("Role/skill preference is required");

  const oid = safeObjectId(teamId);
  const filter = oid ? { _id: oid } : { _id: String(teamId) };

  const team = await dbCommand.collection("teams").findOne(filter);
  if (!team) throw AppError.notFound("Team not found");

  if (team.leaderUid === req.user.uid) {
    throw AppError.badRequest("Team leader cannot apply to their own team");
  }
  if (team.members && team.members.length >= (team.maxMembers || 4)) {
    throw AppError.badRequest("Team has reached maximum capacity");
  }
  if (team.members && team.members.some((m: any) => m.uid === req.user.uid)) {
    throw AppError.badRequest("You are already a member of this team");
  }

  const existingRequest = await dbCommand.collection("team_requests").findOne({
    teamId: team._id.toString(), applicantUid: req.user.uid, status: "pending"
  });
  if (existingRequest) {
    throw AppError.badRequest("You already have a pending join request for this team");
  }

  const requestData = {
    teamId: team._id.toString(), teamName: team.name,
    applicantUid: req.user.uid,
    applicantName: req.user.name || req.user.email || "Applicant",
    applicantEmail: req.user.email || "",
    role, message: message || "",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await dbCommand.collection("team_requests").insertOne(requestData);
  return sendSuccess(res, { id: result.insertedId.toString(), ...requestData }, 201);
};

export const getTeamRequests = async (req: Request, res: Response) => {
  const teamId = req.params.id;
  const oid = safeObjectId(teamId);
  const filter = oid ? { _id: oid } : { _id: String(teamId) };

  const team = await dbCommand.collection("teams").findOne(filter);
  if (!team) throw AppError.notFound("Team not found");

  if (team.leaderUid !== req.user.uid) {
    throw AppError.forbidden("Only team leaders can view join requests");
  }

  const requests = await dbCommand.collection("team_requests").find({ teamId: team._id.toString() }).sort({ createdAt: -1 }).toArray();
  const formatted = requests.map((r: any) => ({ id: r._id.toString(), _id: r._id.toString(), ...r }));

  return sendSuccess(res, { requests: formatted });
};

export const respondToRequest = async (req: Request, res: Response) => {
  const requestId = req.params.requestId;
  const { action } = req.body;

  if (!action || (action !== "accept" && action !== "reject")) {
    throw AppError.badRequest("Action must be 'accept' or 'reject'");
  }

  const reqOid = safeObjectId(requestId);
  const reqFilter = reqOid ? { _id: reqOid } : { _id: String(requestId) };

  const joinReq = await dbCommand.collection("team_requests").findOne(reqFilter);
  if (!joinReq) throw AppError.notFound("Join request not found");
  if (joinReq.status !== "pending") {
    throw AppError.badRequest(`Request has already been ${joinReq.status}`);
  }

  const teamOid = safeObjectId(joinReq.teamId);
  const teamFilter = teamOid ? { _id: teamOid } : { _id: String(joinReq.teamId) };

  const team = await dbCommand.collection("teams").findOne(teamFilter);
  if (!team) throw AppError.notFound("Associated team not found");

  if (team.leaderUid !== req.user.uid) {
    throw AppError.forbidden("Only team leaders can respond to requests");
  }

  if (action === "accept") {
    if (team.members && team.members.length >= (team.maxMembers || 4)) {
      throw AppError.badRequest("Team is already full");
    }

    const newMember = {
      uid: joinReq.applicantUid, name: joinReq.applicantName, email: joinReq.applicantEmail,
      role: joinReq.role, joinedAt: new Date().toISOString(),
    };

    const updatedMembers = [...(team.members || []), newMember];
    const newStatus = updatedMembers.length >= (team.maxMembers || 4) ? "closed" : team.status;

    await dbCommand.collection("teams").updateOne(teamFilter, {
      $set: { members: updatedMembers, status: newStatus, updatedAt: new Date().toISOString() }
    });
  }

  const updatedStatus = action === "accept" ? "accepted" : "rejected";
  await dbCommand.collection("team_requests").updateOne(reqFilter, {
    $set: { status: updatedStatus, updatedAt: new Date().toISOString() }
  });

  return sendSuccess(res, { message: `Request successfully ${updatedStatus}`, status: updatedStatus });
};
