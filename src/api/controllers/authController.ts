import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { dbCommand, dbQuery } from "../db.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess, sendBadRequest, sendUnauthorized, sendServiceUnavailable, sendError } from "../../lib/apiResponse.js";

export const authSync = async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (typeof authHeader !== 'string' || !authHeader.startsWith("Bearer ")) {
      throw AppError.unauthorized("Unauthorized: Missing token");
    }

    const idToken = authHeader.substring(7);

    // 1. Fetch Firebase config to get API key
    let firebaseApiKey = process.env.VITE_FIREBASE_API_KEY || "";

    let uid = "";
    let email = "";
    let name = "";
    let avatarUrl = "";

    const useMockAuth = (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") && process.env.ENABLE_MOCK_AUTH === "true";

    if (useMockAuth) {
      // Mock verification for local offline development without a Firebase API key

      try {
        const parts = idToken.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
          uid = payload.user_id || payload.sub;
          email = payload.email || "";
          name = payload.name || "";
          avatarUrl = payload.picture || "";
        }
      } catch (e) {
        throw AppError.unauthorized("Unauthorized: Invalid mock token format");
      }

      if (!uid) {
        throw AppError.unauthorized("Unauthorized: Mock validation failed");
      }
    } else if (firebaseApiKey) {
      // 2. Validate Firebase ID Token using Google Identity Toolkit API
      const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`;
      const verifyRes = await fetch(verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      });

      if (!verifyRes.ok) {
        const errData = await verifyRes.json().catch(() => ({}));
        console.error("[Auth] Firebase token verification failed:", errData);
        throw AppError.unauthorized("Unauthorized: Invalid token");
      }

      const data = await verifyRes.json();
      if (!data.users || data.users.length === 0) {
        throw AppError.unauthorized("Unauthorized: User not found in token payload");
      }

      const firebaseUser = data.users[0];
      uid = firebaseUser.localId;
      email = firebaseUser.email || "";
      name = firebaseUser.displayName || "";
      avatarUrl = firebaseUser.photoUrl || "";
    } else {
      throw AppError.unauthorized("Authentication service not configured");
    }

    // 3. Sync profile with MongoDB
    const adminEmailsEnv = process.env.ADMIN_EMAILS || "uditt490@gmail.com";
    const adminEmails = adminEmailsEnv.split(",").map(e => e.trim().toLowerCase());
    const isAdmin = email && adminEmails.includes(email.toLowerCase());

    if (!dbCommand || !dbQuery) {
      return sendSuccess(res, {
        profile: {
          uid,
          name,
          email,
          avatarUrl,
          role: isAdmin ? "admin" : "student"
        }
      });
    }

    const usersCollection = dbCommand.collection("users");
    const existingUser = await usersCollection.findOne({ uid });

    const role = isAdmin ? "admin" : "student";

    let updatedProfile;
    if (existingUser) {
      const updateData: any = {
        name: req.body.name || existingUser.name || name,
        email: req.body.email || existingUser.email || email,
        avatarUrl: req.body.avatarUrl || existingUser.avatarUrl || avatarUrl,
        onboarded: req.body.onboarded !== undefined ? req.body.onboarded : existingUser.onboarded,
        college: req.body.college || existingUser.college,
        year: req.body.year || existingUser.year,
        field: req.body.field || existingUser.field,
        skills: req.body.skills || existingUser.skills,
        bookmarks: req.body.bookmarks !== undefined ? req.body.bookmarks : (existingUser.bookmarks || []),
        avatarPublicId: req.body.avatarPublicId || existingUser.avatarPublicId,
        resumeUrl: req.body.resumeUrl || existingUser.resumeUrl,
        resumePublicId: req.body.resumePublicId || existingUser.resumePublicId,
        coverLetterUrl: req.body.coverLetterUrl || existingUser.coverLetterUrl,
        coverLetterPublicId: req.body.coverLetterPublicId || existingUser.coverLetterPublicId,
        graduation_year: req.body.graduation_year !== undefined ? Number(req.body.graduation_year) : existingUser.graduation_year,
        current_company: req.body.current_company !== undefined ? req.body.current_company : existingUser.current_company,
        alumni_status: req.body.alumni_status !== undefined ? Boolean(req.body.alumni_status) : existingUser.alumni_status,
        is_open_to_mentoring: req.body.is_open_to_mentoring !== undefined ? Boolean(req.body.is_open_to_mentoring) : existingUser.is_open_to_mentoring,
        mentoring_interests: req.body.mentoring_interests !== undefined ? req.body.mentoring_interests : existingUser.mentoring_interests,
        alumni_profile_bio: req.body.alumni_profile_bio !== undefined ? req.body.alumni_profile_bio : existingUser.alumni_profile_bio,
        fcmToken: req.body.fcmToken !== undefined ? req.body.fcmToken : existingUser.fcmToken,
        notificationPreferences: req.body.notificationPreferences !== undefined ? req.body.notificationPreferences : existingUser.notificationPreferences,
        updatedAt: new Date()
      };
      // Remove undefined keys
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      await usersCollection.updateOne({ uid }, { $set: updateData });
      updatedProfile = { ...existingUser, ...updateData };
    } else {
      const newUser: any = {
        uid,
        name: req.body.name || name,
        email: req.body.email || email,
        avatarUrl: req.body.avatarUrl || avatarUrl,
        role,
        onboarded: req.body.onboarded !== undefined ? req.body.onboarded : false,
        college: req.body.college || "",
        year: req.body.year || "",
        field: req.body.field || "",
        skills: req.body.skills || [],
        graduation_year: req.body.graduation_year !== undefined ? Number(req.body.graduation_year) : null,
        current_company: req.body.current_company || "",
        alumni_status: Boolean(req.body.alumni_status),
        is_open_to_mentoring: Boolean(req.body.is_open_to_mentoring),
        mentoring_interests: req.body.mentoring_interests || [],
        alumni_profile_bio: req.body.alumni_profile_bio || "",
        bookmarks: [],
        fcmToken: req.body.fcmToken || "",
        notificationPreferences: req.body.notificationPreferences || {
          emailEnabled: true,
          pushEnabled: true,
          deadlineRemindersEnabled: true,
          skillAlertsEnabled: true,
          scholarshipAlertsEnabled: true,
          hackathonAlertsEnabled: true,
          opportunityAlertsEnabled: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      try {
        await usersCollection.insertOne(newUser);
        updatedProfile = newUser;
      } catch (err: any) {
        if (err.code === 11000 || err.message?.includes('E11000')) {
          const retryUser = await usersCollection.findOne({ uid });
          updatedProfile = retryUser || newUser;
        } else {
          throw err;
        }
      }
    }

    if (updatedProfile._id) {
      updatedProfile.id = updatedProfile._id.toString();
      delete updatedProfile._id;
    }

    const jwtSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (process.env.NODE_ENV === 'production' && (!jwtSecret || !refreshSecret)) {
      throw new Error('JWT secrets must be configured in production');
    }

    if (!jwtSecret || !refreshSecret) {
      // Generate secure random secrets for development only
      const { randomBytes } = await import('crypto');
      const generatedSecret = randomBytes(64).toString('hex');
      const generatedRefreshSecret = randomBytes(64).toString('hex');
      console.warn('[Security] Using auto-generated JWT secrets for development only');
      // Use generated secrets
      const accessToken = jwt.sign(
        { uid: updatedProfile.uid, email: updatedProfile.email, role: updatedProfile.role },
        generatedSecret,
        { expiresIn: '15m' }
      );
      const refreshToken = jwt.sign(
        { uid: updatedProfile.uid },
        generatedRefreshSecret,
        { expiresIn: '7d' }
      );
      return sendSuccess(res, { accessToken, refreshToken });
    }

    // Generate custom JWTs
    const accessToken = jwt.sign(
      { uid: updatedProfile.uid, role: updatedProfile.role, email: updatedProfile.email },
      jwtSecret,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { uid: updatedProfile.uid },
      refreshSecret,
      { expiresIn: "7d" }
    );

    // Hash refresh token for secure storage
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Store hashed refresh token in users collection (up to 5 active sessions)
    if (dbCommand) {
      const usersCollectionCmd = dbCommand.collection("users");
      await usersCollectionCmd.updateOne(
        { uid: updatedProfile.uid },
        {
          $push: {
            hashedRefreshTokens: {
              $each: [hashedRefreshToken],
              $slice: -5
            }
          }
        }
      );
    }

    return sendSuccess(res, {
      profile: updatedProfile,
      accessToken,
      refreshToken
    });
};

export const refreshTokens = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return sendBadRequest(res, "Refresh token is required");
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    const jwtSecret = process.env.JWT_SECRET;

    if (process.env.NODE_ENV === 'production' && (!refreshSecret || !jwtSecret)) {
      return sendServiceUnavailable(res, 'Authentication service unavailable. JWT secrets must be configured in production.');
    }

    if (!refreshSecret || !jwtSecret) {
      return sendServiceUnavailable(res, 'Authentication service unavailable. JWT secrets not configured.');
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, refreshSecret);
    } catch (e) {
      return sendUnauthorized(res, "Invalid or expired refresh token");
    }

    if (!decoded || !decoded.uid) {
      return sendUnauthorized(res, "Invalid refresh token payload");
    }

    if (!dbCommand) {
      return sendError(res, "Database not connected", 500);
    }

    const usersCollection = dbCommand.collection("users");
    const user = await usersCollection.findOne({ uid: decoded.uid });

    if (!user) {
      return sendUnauthorized(res, "User not found");
    }

    const hashedIncomingToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const activeTokens = user.hashedRefreshTokens || [];

    // Check if token exists
    if (!activeTokens.includes(hashedIncomingToken)) {
      // Token reuse detected! Revoke all sessions for security.
      await usersCollection.updateOne(
        { uid: decoded.uid },
        { $set: { hashedRefreshTokens: [] } }
      );
      console.warn(`[Auth] Refresh token reuse detected for user ${decoded.uid}. Revoked all sessions.`);
      return sendUnauthorized(res, "Session revoked due to token reuse");
    }

    // Generate new tokens
    const newAccessToken = jwt.sign(
      { uid: user.uid, role: user.role, email: user.email },
      jwtSecret,
      { expiresIn: "15m" }
    );
    const newRefreshToken = jwt.sign(
      { uid: user.uid },
      refreshSecret,
      { expiresIn: "7d" }
    );

    const hashedNewRefreshToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    // Remove the old token and add the new one atomically using multiple updates or sequentially
    await usersCollection.updateOne(
      { uid: decoded.uid },
      { $pull: { hashedRefreshTokens: hashedIncomingToken } }
    );
    await usersCollection.updateOne(
      { uid: decoded.uid },
      {
        $push: {
          hashedRefreshTokens: {
            $each: [hashedNewRefreshToken],
            $slice: -5
          }
        }
      }
    );

    return sendSuccess(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error("[Auth] Error refreshing token:", error);
    return sendError(res, "Internal server error", 500);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return sendBadRequest(res, "Refresh token is required");
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (process.env.NODE_ENV === 'production' && !refreshSecret) {
      return sendServiceUnavailable(res, 'Authentication service unavailable. JWT_REFRESH_SECRET must be configured in production.');
    }

    let decoded: any;
    if (!refreshSecret) {
      console.warn('[Auth] JWT_REFRESH_SECRET not configured, skipping token verification for logout');
    } else {
      try {
        decoded = jwt.verify(refreshToken, refreshSecret);
      } catch (e) {
        return sendSuccess(res, { message: "Logged out" });
      }
    }

    if (dbCommand && decoded && decoded.uid) {
      const hashedIncomingToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const usersCollection = dbCommand.collection("users");

      await usersCollection.updateOne(
        { uid: decoded.uid },
        { $pull: { hashedRefreshTokens: hashedIncomingToken } }
      );
    }

    return sendSuccess(res, { message: "Logged out successfully" });
  } catch (error) {
    console.error("[Auth] Error during logout:", error);
    return sendError(res, "Internal server error", 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendUnauthorized(res, "Invalid email or password");
    }

    const firebaseApiKey = process.env.VITE_FIREBASE_API_KEY || "";
    if (!firebaseApiKey) {
      return sendServiceUnavailable(res, "Authentication service not configured");
    }

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`;
    const verifyRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });

    if (!verifyRes.ok) {
      return sendUnauthorized(res, "Invalid email or password");
    }

    const data = await verifyRes.json();
    return sendSuccess(res, { message: "Login successful", token: data.idToken });
  } catch (error) {
    console.error("[Auth] Login error:", error);
    return sendUnauthorized(res, "Invalid email or password");
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendBadRequest(res, "Email and password are required");
    }

    const firebaseApiKey = process.env.VITE_FIREBASE_API_KEY || "";
    if (!firebaseApiKey) {
      return sendServiceUnavailable(res, "Authentication service not configured");
    }

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseApiKey}`;
    const verifyRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });

    if (!verifyRes.ok) {
      const errData = await verifyRes.json().catch(() => ({}));
      const errMsg = errData?.error?.message || "";
      if (errMsg === "EMAIL_EXISTS") {
        return sendSuccess(res, { message: "Account creation initiated. Check your email for further instructions." });
      }
      return sendBadRequest(res, "Registration failed. Please try again.");
    }

    return sendSuccess(res, { message: "Account creation initiated. Check your email for further instructions." });
  } catch (error) {
    console.error("[Auth] Signup error:", error);
    return sendBadRequest(res, "Registration failed. Please try again.");
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendSuccess(res, { message: "If that email is registered, a password reset link has been sent." });
    }

    const firebaseApiKey = process.env.VITE_FIREBASE_API_KEY || "";
    if (!firebaseApiKey) {
      return sendServiceUnavailable(res, "Authentication service not configured");
    }

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseApiKey}`;
    const verifyRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestType: "PASSWORD_RESET", email })
    });

    return sendSuccess(res, { message: "If that email is registered, a password reset link has been sent." });
  } catch (error) {
    console.error("[Auth] Forgot password error:", error);
    return sendSuccess(res, { message: "If that email is registered, a password reset link has been sent." });
  }
};
