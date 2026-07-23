import { Request, Response } from "express";
import { analyticsBuffer } from "../analytics.js";

/**
 * POST /analytics/track
 *
 * Accept an analytics event and buffer it for batch insertion.
 *
 * Responses:
 *   - 202 Accepted — event buffered successfully
 *   - 429 Too Many Requests — buffer is near capacity, slow down
 *   - 503 Service Unavailable — buffer is in shutdown drain mode
 */
export const track = async (req: Request, res: Response) => {
  try {
    // Reject events during shutdown drain
    if (analyticsBuffer.isShuttingDown) {
      return res.status(503).json({
        status: "Unavailable",
        error: "Server is shutting down — analytics events not accepted.",
      });
    }

    // Backpressure signal when buffer is nearly full (>80% capacity)
    if (analyticsBuffer.size > analyticsBuffer.capacity * 0.8) {
      // Still accept the event, but tell the client to slow down
      analyticsBuffer.push(req.body);
      return res.status(429).json({
        status: "Backpressure",
        warning: "Buffer is near capacity. Reduce event rate.",
      });
    }

    // Normal path — accept and buffer
    analyticsBuffer.push(req.body);
    return res.status(202).json({ status: "Accepted" });
  } catch (err) {
    console.error("[Analytics] Error in track endpoint:", err);
    return res.status(500).json({ status: "Error", error: "Internal server error" });
  }
};

/**
 * GET /analytics/buffer-status
 *
 * Returns current buffer metrics for monitoring / health checks.
 */
export const bufferStatus = async (_req: Request, res: Response) => {
  res.json({
    size: analyticsBuffer.size,
    capacity: analyticsBuffer.capacity,
    utilizationPct: Math.round((analyticsBuffer.size / analyticsBuffer.capacity) * 100),
    isShuttingDown: analyticsBuffer.isShuttingDown,
  });
};
