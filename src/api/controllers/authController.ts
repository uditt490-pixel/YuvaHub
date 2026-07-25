import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { dbCommand, dbQuery } from "../db.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendUnauthorized, sendBadRequest, sendServiceUnavailable, sendError } from "../../lib/apiResponse.js";

export const authSync = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (typeof authHeader !== 'string' || !authHeader.startsWith("Bearer ")) {
      return sendUnauthorized(res, "Missing token");
    }

    const idToken = authHeader.substring(7);

    // 1. Fetch Firebase config to get API key
    const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
    let firebaseApiKey = "";
    if (fs.existsSync(firebaseConfigPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
        firebaseApiKey = config.apiKey || "";
      } catch (e) {
        console.error("[Auth] Error parsing firebase-applet-config.json:", e);
      }
    }

    let uid = "";
    let email = "";
    let name = "";
    let avatarUrl = "";

    const useMockAuth = process.env.NODE_ENV === "development" && process.env.ENABLE_MOCK_AUTH === "true";

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
        return sendBadRequest(res, "Invalid mock token format");
      }

      if (!uid) {
        return sendUnauthorized(res, "Mock validation failed");
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
        return sendUnauthorized(res, "Invalid token");
      }

      const data = await verifyRes.json();
      if (!data.users || data.users.length === 0) {
        return sendUnauthorized(res, "User not found in token payload");
      }

      const firebaseUser = data.users[0];
      uid = firebaseUser.localId;
      email = firebaseUser.email || "";
      name = firebaseUser.displayName || "";
      avatarUrl = firebaseUser.photoUrl || "";
    } else {
      return sendServiceUnavailable(res, "Authentication service not configured");
    }

    // 3. Sync profile with MongoDB
    if (!dbCommand || !dbQuery) {
      return res.json({
        status: "success",
        profile: {
          uid,
          name,
          email,
          avatarUrl,
          role: email === "uditt490@gmail.com" ? "admin" : "student"
        }
      });
    }

    const usersCollection = dbQuery.collection("users");
    const existingUser = await usersCollection.findOne({ uid });

    const role = email === "uditt490@gmail.com" ? "admin" : "student";

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
      await usersCollection.insertOne(newUser);
      updatedProfile = newUser;
    }

    if (updatedProfile._id) {
      updatedProfile.id = updatedProfile._id.toString();
      delete updatedProfile._id;
    }

    const jwtSecret = process.env.JWT_SECRET || "default_secret_for_development_only";
    const refreshSecret = process.env.JWT_REFRESH_SECRET || "default_refresh_secret_for_development_only";
    
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

    res.json({
      status: "success",
      profile: updatedProfile,
      accessToken,
      refreshToken
    });

  } catch (err: any) {
    console.error("[Auth] Error syncing user:", err);
    sendError(res, "Internal Server Error during auth sync", 500);
  }
};

export const refreshTokens = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || "default_refresh_secret_for_development_only";
    const jwtSecret = process.env.JWT_SECRET || "default_secret_for_development_only";

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, refreshSecret);
    } catch (e) {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }

    if (!decoded || !decoded.uid) {
      return res.status(401).json({ error: "Invalid refresh token payload" });
    }

    if (!dbCommand) {
      return res.status(500).json({ error: "Database not connected" });
    }

    const usersCollection = dbCommand.collection("users");
    const user = await usersCollection.findOne({ uid: decoded.uid });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
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
      return res.status(401).json({ error: "Session revoked due to token reuse" });
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

    res.json({
      status: "success",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error("[Auth] Error refreshing token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }
    
    const refreshSecret = process.env.JWT_REFRESH_SECRET || "default_refresh_secret_for_development_only";
    
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, refreshSecret);
    } catch (e) {
      return res.json({ status: "success", message: "Logged out" });
    }

    if (dbCommand && decoded && decoded.uid) {
      const hashedIncomingToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const usersCollection = dbCommand.collection("users");
      
      await usersCollection.updateOne(
        { uid: decoded.uid },
        { $pull: { hashedRefreshTokens: hashedIncomingToken } }
      );
    }

    res.json({ status: "success", message: "Logged out successfully" });
  } catch (error) {
    console.error("[Auth] Error during logout:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
