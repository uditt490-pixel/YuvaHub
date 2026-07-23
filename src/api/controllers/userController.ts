import { Request, Response } from "express";
import { dbCommand } from "../db.js";
import { deleteFirebaseUser } from "../../middleware/auth.js";

export const syncUser = (req: Request, res: Response) => {
  res.json({ status: "ok", user: req.user });
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const uid = req.user.uid;

    // 1. Delete from Firebase Auth
    await deleteFirebaseUser(uid);

    // 2. Delete from MongoDB
    if (dbCommand) {
      await dbCommand.collection("users").deleteOne({ firebaseUid: uid });

      // Also clean up any associated data
      await dbCommand.collection("interactions").deleteMany({ firebaseUid: uid });
      // Add more cleanup as needed (e.g. saved opportunities, profiles, etc.)
    }

    res.json({ status: "success", message: "Account completely deleted" });
  } catch (err: any) {
    console.error("[Auth] Error deleting user account:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
};
