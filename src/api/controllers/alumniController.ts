import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { AppError } from "../../lib/AppError.js";
import { sendBadRequest, sendError, sendForbidden, sendNotFound, sendPaginated, sendServiceUnavailable, sendSuccess } from "../../lib/apiResponse.js";
import { dbCommand, dbQuery } from "../db.js";

const getUsersCollection = () => (dbQuery ?? dbCommand)?.collection("users");
const getRequestsCollection = () => (dbCommand ?? dbQuery)?.collection("mentorship_requests");

const sanitizeUserForPublicView = (user: any) => {
  if (!user) return user;

  const safe = { ...user };
  if (safe._id) {
    safe.id = safe._id.toString();
    delete safe._id;
  }
  if (safe.firebaseUid) delete safe.firebaseUid;
  if (safe.hashedRefreshTokens) delete safe.hashedRefreshTokens;
  if (safe.email && !safe.emailVisible) delete safe.email;
  delete safe.password;
  delete safe.passwordHash;
  delete safe.hashedRefreshTokens;
  return safe;
};

const sanitizeUserForDirectory = (user: any) => {
  const publicView = sanitizeUserForPublicView(user);
  delete publicView.email;
  return publicView;
};

const normalizeUserId = (value?: any): string | undefined => Array.isArray(value) ? value[0] : value;

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = normalizeUserId(req.params.userId);
    const actorUid = req.user?.uid;
    if (!userId) return sendBadRequest(res, "User ID is required");
    if (actorUid !== userId && req.user?.role !== "admin") {
      return sendForbidden(res, "You can only update your own profile");
    }

    const usersCollection = getUsersCollection();
    if (!usersCollection) return sendServiceUnavailable(res, "Database not available");

    const existingUser = await usersCollection.findOne({ uid: userId });
    if (!existingUser) return sendNotFound(res, "User not found");

    const allowedFields = [
      "graduation_year",
      "current_company",
      "current_role",
      "alumni_status",
      "is_open_to_mentoring",
      "mentoring_interests",
      "alumni_profile_bio",
      "bio",
      "college",
      "name",
      "field",
      "role",
      "company",
    ];

    const updates: Record<string, any> = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (req.body.graduation_year !== undefined) {
      updates.graduation_year = Number(req.body.graduation_year);
    }
    if (req.body.current_company !== undefined) {
      updates.current_company = String(req.body.current_company);
    }
    if (req.body.alumni_status !== undefined) {
      updates.alumni_status = Boolean(req.body.alumni_status);
    }
    if (req.body.is_open_to_mentoring !== undefined) {
      updates.is_open_to_mentoring = Boolean(req.body.is_open_to_mentoring);
    }
    if (req.body.mentoring_interests !== undefined) {
      updates.mentoring_interests = Array.isArray(req.body.mentoring_interests)
        ? req.body.mentoring_interests.map((item: any) => String(item))
        : [String(req.body.mentoring_interests)];
    }
    if (req.body.alumni_profile_bio !== undefined) {
      updates.alumni_profile_bio = String(req.body.alumni_profile_bio);
    }

    if (updates.alumni_status === true || existingUser.alumni_status === true || updates.graduation_year !== undefined || updates.current_company !== undefined) {
      updates.role = "alumni";
    }

    if (Object.keys(updates).length === 0) {
      return sendBadRequest(res, "No valid profile fields provided");
    }

    const result = await usersCollection.findOneAndUpdate(
      { uid: userId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    const updatedUser = result?.value ?? result ?? existingUser;
    return sendSuccess(res, { user: sanitizeUserForPublicView(updatedUser) });
  } catch (err: any) {
    console.error("PATCH /users/:userId/profile error:", err);
    return sendError(res, err?.message || "Internal Server Error", 500);
  }
};

export const toggleMentoringPreference = async (req: Request, res: Response) => {
  try {
    const userId = normalizeUserId(req.params.userId);
    const actorUid = req.user?.uid;
    if (!userId) return sendBadRequest(res, "User ID is required");
    if (actorUid !== userId && req.user?.role !== "admin") {
      return sendForbidden(res, "You can only update your own mentoring preferences");
    }

    const usersCollection = getUsersCollection();
    if (!usersCollection) return sendServiceUnavailable(res, "Database not available");

    const existingUser = await usersCollection.findOne({ uid: userId });
    if (!existingUser) return sendNotFound(res, "User not found");

    const nextValue = !Boolean(existingUser.is_open_to_mentoring);
    const result = await usersCollection.findOneAndUpdate(
      { uid: userId },
      {
        $set: {
          is_open_to_mentoring: nextValue,
          alumni_status: existingUser.alumni_status || nextValue,
          updatedAt: new Date(),
        }
      },
      { returnDocument: "after" }
    );

    return sendSuccess(res, {
      user: sanitizeUserForPublicView(result?.value ?? existingUser),
      isOpenToMentoring: nextValue,
    });
  } catch (err: any) {
    console.error("PATCH /users/:userId/mentoring-preference error:", err);
    return sendError(res, err?.message || "Internal Server Error", 500);
  }
};

export const getAlumniDirectory = async (req: Request, res: Response) => {
  try {
    const usersCollection = getUsersCollection();
    if (!usersCollection) return sendServiceUnavailable(res, "Database not available");

    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 12)));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { alumni_status: true };
    const university = typeof req.query.university === "string" ? req.query.university.trim() : "";
    const company = typeof req.query.company === "string" ? req.query.company.trim() : "";
    const role = typeof req.query.role === "string" ? req.query.role.trim() : "";
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const mentoringStatus = typeof req.query.mentoringStatus === "string" ? req.query.mentoringStatus : "";

    if (university) filter.college = { $regex: university, $options: "i" };
    if (company) filter.current_company = { $regex: company, $options: "i" };
    if (role) filter.$or = [{ current_role: { $regex: role, $options: "i" } }, { field: { $regex: role, $options: "i" } }];
    if (mentoringStatus === "open") filter.is_open_to_mentoring = true;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { college: { $regex: search, $options: "i" } },
        { current_company: { $regex: search, $options: "i" } },
        { current_role: { $regex: search, $options: "i" } },
        { alumni_profile_bio: { $regex: search, $options: "i" } },
      ];
    }

    const total = await usersCollection.countDocuments(filter);
    const alumni = await usersCollection
      .find(filter)
      .sort({ updatedAt: -1, name: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const directory = alumni.map(sanitizeUserForDirectory);
    return sendPaginated(res, directory, page, limit, total);
  } catch (err: any) {
    console.error("GET /alumni/directory error:", err);
    return sendError(res, err?.message || "Internal Server Error", 500);
  }
};

export const getAlumniProfile = async (req: Request, res: Response) => {
  try {
    const userId = normalizeUserId(req.params.userId);
    if (!userId) return sendBadRequest(res, "User ID is required");

    const usersCollection = getUsersCollection();
    if (!usersCollection) return sendServiceUnavailable(res, "Database not available");

    const user = await usersCollection.findOne({ uid: userId });
    if (!user) return sendNotFound(res, "Alumni profile not found");
    if (!user.alumni_status && user.role !== "alumni") {
      return sendNotFound(res, "Alumni profile not found");
    }

    return sendSuccess(res, { alumni: sanitizeUserForPublicView(user) });
  } catch (err: any) {
    console.error("GET /alumni/:userId error:", err);
    return sendError(res, err?.message || "Internal Server Error", 500);
  }
};

export const requestMentorship = async (req: Request, res: Response) => {
  try {
    const actorUid = req.user?.uid;
    if (!actorUid) return sendForbidden(res, "Authentication required");

    const recipientUid = normalizeUserId(req.params.userId);
    if (!recipientUid) return sendBadRequest(res, "Alumni user ID is required");
    if (actorUid === recipientUid) {
      return sendBadRequest(res, "You cannot request mentorship from yourself");
    }

    const usersCollection = getUsersCollection();
    if (!usersCollection) return sendServiceUnavailable(res, "Database not available");

    const recipient = await usersCollection.findOne({ uid: recipientUid });
    if (!recipient || (!recipient.alumni_status && recipient.role !== "alumni")) {
      return sendNotFound(res, "Alumni profile not found");
    }

    if (recipient.is_open_to_mentoring !== true) {
      return sendBadRequest(res, "This alumni mentor is not currently accepting mentorship requests");
    }

    const mentorshipRequests = getRequestsCollection();
    if (!mentorshipRequests) return sendServiceUnavailable(res, "Database not available");

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const requestCount = await mentorshipRequests.countDocuments({
      sender_id: actorUid,
      created_at: { $gte: startOfDay },
    });

    if (requestCount >= 5) {
      throw AppError.rateLimited("You have reached the daily mentorship request limit.");
    }

    const payload = {
      _id: new ObjectId(),
      id: new ObjectId().toString(),
      sender_id: actorUid,
      recipient_id: recipientUid,
      subject: String(req.body.subject || "Career Guidance"),
      message: String(req.body.message || ""),
      status: "pending",
      created_at: new Date(),
      updated_at: new Date(),
    };

    if (!payload.message.trim()) {
      return sendBadRequest(res, "Message is required");
    }

    await mentorshipRequests.insertOne(payload);
    return sendSuccess(res, { request: { ...payload, _id: payload._id.toString() } }, 201);
  } catch (err: any) {
    if (err instanceof AppError) {
      return sendError(res, err.message, err.statusCode, err.code);
    }
    console.error("POST /alumni/:userId/request-mentorship error:", err);
    return sendError(res, err?.message || "Internal Server Error", 500);
  }
};

export const getReceivedMentorshipRequests = async (req: Request, res: Response) => {
  try {
    const actorUid = req.user?.uid;
    if (!actorUid) return sendForbidden(res, "Authentication required");

    const mentorshipRequests = getRequestsCollection();
    if (!mentorshipRequests) return sendServiceUnavailable(res, "Database not available");

    const requests = await mentorshipRequests
      .find({ recipient_id: actorUid })
      .sort({ created_at: -1 })
      .toArray();

    return sendSuccess(res, { requests });
  } catch (err: any) {
    console.error("GET /alumni/requests/received error:", err);
    return sendError(res, err?.message || "Internal Server Error", 500);
  }
};

export const getSentMentorshipRequests = async (req: Request, res: Response) => {
  try {
    const actorUid = req.user?.uid;
    if (!actorUid) return sendForbidden(res, "Authentication required");

    const mentorshipRequests = getRequestsCollection();
    if (!mentorshipRequests) return sendServiceUnavailable(res, "Database not available");

    const requests = await mentorshipRequests
      .find({ sender_id: actorUid })
      .sort({ created_at: -1 })
      .toArray();

    return sendSuccess(res, { requests });
  } catch (err: any) {
    console.error("GET /alumni/requests/sent error:", err);
    return sendError(res, err?.message || "Internal Server Error", 500);
  }
};

const updateMentorshipRequestStatus = async (req: Request, res: Response, status: "accepted" | "declined") => {
  try {
    const actorUid = req.user?.uid;
    const requestId = normalizeUserId(req.params.requestId);
    if (!actorUid) return sendForbidden(res, "Authentication required");
    if (!requestId) return sendBadRequest(res, "Request ID is required");

    const mentorshipRequests = getRequestsCollection();
    if (!mentorshipRequests) return sendServiceUnavailable(res, "Database not available");

    const request = await mentorshipRequests.findOne({ id: requestId });
    if (!request) return sendNotFound(res, "Mentorship request not found");
    if (request.recipient_id !== actorUid) {
      return sendForbidden(res, "You can only manage requests addressed to you");
    }

    const updated = await mentorshipRequests.findOneAndUpdate(
      { id: requestId },
      {
        $set: {
          status,
          updated_at: new Date(),
        }
      },
      { returnDocument: "after" }
    );

    return sendSuccess(res, { request: updated?.value ?? request, status });
  } catch (err: any) {
    console.error(`PATCH /alumni/requests/:requestId/${status} error:`, err);
    return sendError(res, err?.message || "Internal Server Error", 500);
  }
};

export const acceptMentorshipRequest = async (req: Request, res: Response) => {
  return updateMentorshipRequestStatus(req, res, "accepted");
};

export const declineMentorshipRequest = async (req: Request, res: Response) => {
  return updateMentorshipRequestStatus(req, res, "declined");
};
