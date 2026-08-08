import type { Request, Response } from "express";
import { getHealthSnapshot } from "../services/healthService.js";

export async function healthCheck(
  _req: Request,
  res: Response,
): Promise<Response> {
  try {
    const snapshot = await getHealthSnapshot();
    const statusCode = snapshot.status === "ok" ? 200 : 503;

    res.setHeader("Cache-Control", "no-store");
    return res.status(statusCode).json(snapshot);
  } catch (error) {
    console.error("[Health] Unexpected health-check failure:", error);

    res.setHeader("Cache-Control", "no-store");
    return res.status(503).json({
      status: "degraded",
      service: "YuvaHub API",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      uptimeSeconds: Math.max(0, Math.floor(process.uptime())),
    });
  }
}
