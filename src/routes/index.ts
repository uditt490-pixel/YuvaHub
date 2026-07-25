import { Router } from "express";

export const apiRouter = Router();

apiRouter.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString(), architecture: "modular" });
});
