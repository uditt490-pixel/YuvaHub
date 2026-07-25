import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { safeObjectId } from "../../lib/utils.js";

export const createTeam = async (req: Request, res: Response) => {
  try {
    const { name, opportunityId, opportunityTitle, description, requiredRoles, maxMembers } = req.body;
    if (!name || !description || !requiredRoles || !Array.isArray(requiredRoles) || requiredRoles.length === 0) {
      return res.status(400).json({ error: "Missing required fields: name, description, requiredRoles" });
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
    return res.status(201).json({ id: result.insertedId.toString(), ...teamData });
  } catch (err: any) {
    console.error("[Team API] Error creating team:", err);
    return res.status(500).json({ error: "Failed to create team" });
  }
};

export const listTeams = async (req: Request, res: Response) => {
  try {
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

    const teams = await dbCommand.collection("teams").find(queryFilter).sort({ createdAt: -1 }).toArray();
    const formatted = teams.map((t: any) => ({ id: t._id.toString(), _id: t._id.toString(), ...t }));

    return res.json({ teams: formatted, total: formatted.length });
  } catch (err: any) {
    console.error("[Team API] Error fetching teams:", err);
    return res.status(500).json({ error: "Failed to fetch teams" });
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  try {
    const teamId = req.params.id;
    const oid = safeObjectId(teamId);
    const filter = oid ? { _id: oid } : { _id: String(teamId) };

    const team = await dbCommand.collection("teams").findOne(filter);
    if (!team) return res.status(404).json({ error: "Team not found" });

    return res.json({ id: team._id.toString(), _id: team._id.toString(), ...team });
  } catch (err: any) {
    console.error("[Team API] Error fetching team details:", err);
    return res.status(500).json({ error: "Failed to fetch team details" });
  }
};

export const submitJoinRequest = async (req: Request, res: Response) => {
  try {
    const teamId = req.params.id;
    const { role, message } = req.body;

    if (!role) return res.status(400).json({ error: "Role/skill preference is required" });

    const oid = safeObjectId(teamId);
    const filter = oid ? { _id: oid } : { _id: String(teamId) };

    const team = await dbCommand.collection("teams").findOne(filter);
    if (!team) return res.status(404).json({ error: "Team not found" });

    if (team.leaderUid === req.user.uid) {
      return res.status(400).json({ error: "Team leader cannot apply to their own team" });
    }
    if (team.members && team.members.length >= (team.maxMembers || 4)) {
      return res.status(400).json({ error: "Team has reached maximum capacity" });
    }
    if (team.members && team.members.some((m: any) => m.uid === req.user.uid)) {
      return res.status(400).json({ error: "You are already a member of this team" });
    }

    const existingRequest = await dbCommand.collection("team_requests").findOne({
      teamId: team._id.toString(), applicantUid: req.user.uid, status: "pending"
    });
    if (existingRequest) {
      return res.status(400).json({ error: "You already have a pending join request for this team" });
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
    return res.status(201).json({ id: result.insertedId.toString(), ...requestData });
  } catch (err: any) {
    console.error("[Team API] Error submitting join request:", err);
    return res.status(500).json({ error: "Failed to submit join request" });
  }
};

export const getTeamRequests = async (req: Request, res: Response) => {
  try {
    const teamId = req.params.id;
    const oid = safeObjectId(teamId);
    const filter = oid ? { _id: oid } : { _id: String(teamId) };

    const team = await dbCommand.collection("teams").findOne(filter);
    if (!team) return res.status(404).json({ error: "Team not found" });

    if (team.leaderUid !== req.user.uid) {
      return res.status(403).json({ error: "Only team leaders can view join requests" });
    }

    const requests = await dbCommand.collection("team_requests").find({ teamId: team._id.toString() }).sort({ createdAt: -1 }).toArray();
    const formatted = requests.map((r: any) => ({ id: r._id.toString(), _id: r._id.toString(), ...r }));

    return res.json({ requests: formatted });
  } catch (err: any) {
    console.error("[Team API] Error fetching requests:", err);
    return res.status(500).json({ error: "Failed to fetch join requests" });
  }
};

export const respondToRequest = async (req: Request, res: Response) => {
  try {
    const requestId = req.params.requestId;
    const { action } = req.body;

    if (!action || (action !== "accept" && action !== "reject")) {
      return res.status(400).json({ error: "Action must be 'accept' or 'reject'" });
    }

    const reqOid = safeObjectId(requestId);
    const reqFilter = reqOid ? { _id: reqOid } : { _id: String(requestId) };

    const joinReq = await dbCommand.collection("team_requests").findOne(reqFilter);
    if (!joinReq) return res.status(404).json({ error: "Join request not found" });
    if (joinReq.status !== "pending") {
      return res.status(400).json({ error: `Request has already been ${joinReq.status}` });
    }

    const teamOid = safeObjectId(joinReq.teamId);
    const teamFilter = teamOid ? { _id: teamOid } : { _id: String(joinReq.teamId) };

    const team = await dbCommand.collection("teams").findOne(teamFilter);
    if (!team) return res.status(404).json({ error: "Associated team not found" });

    if (team.leaderUid !== req.user.uid) {
      return res.status(403).json({ error: "Only team leaders can respond to requests" });
    }

    if (action === "accept") {
      if (team.members && team.members.length >= (team.maxMembers || 4)) {
        return res.status(400).json({ error: "Team is already full" });
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

    return res.json({ message: `Request successfully ${updatedStatus}`, status: updatedStatus });
  } catch (err: any) {
    console.error("[Team API] Error responding to join request:", err);
    return res.status(500).json({ error: "Failed to respond to join request" });
  }
};
