/**
 * backend/src/routes/apiRouter.ts
 * -------------------------------
 * Feature-specific route definitions.
 */

import { Router, Request, Response } from "express";
import { db } from "../database/mockDb";
import { rankingService } from "../services/rankingService";

const router = Router();

router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

router.get("/users/:id", async (req: Request, res: Response) => {
  const user = await db.getUser(req.params.id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

export const apiRouter = router;
