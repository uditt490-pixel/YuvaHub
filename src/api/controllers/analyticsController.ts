import { Request, Response } from "express";
import { analyticsBuffer } from "../analytics.js";
import { sendSuccess, sendTooManyRequests, sendServiceUnavailable } from "../../lib/apiResponse.js";

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
  // Reject events during shutdown drain
  if (analyticsBuffer.isShuttingDown) {
    return sendServiceUnavailable(res, "Server is shutting down — analytics events not accepted.");
  }

  const eventPayload = { ...req.body, userId: (req as any).user?.uid || req.body.userId };

  // Backpressure signal when buffer is nearly full (>80% capacity)
  if (analyticsBuffer.size > analyticsBuffer.capacity * 0.8) {
    // Still accept the event, but tell the client to slow down
    analyticsBuffer.push(eventPayload);
    return sendTooManyRequests(res, "Buffer is near capacity. Reduce event rate.");
  }

  // Normal path — accept and buffer
  analyticsBuffer.push(eventPayload);
  return sendSuccess(res, { status: "Accepted" }, 202);
};

/**
 * GET /analytics/buffer-status
 *
 * Returns current buffer metrics for monitoring / health checks.
 */
export const bufferStatus = async (_req: Request, res: Response) => {
  return sendSuccess(res, {
    size: analyticsBuffer.size,
    capacity: analyticsBuffer.capacity,
    utilizationPct: Math.round((analyticsBuffer.size / analyticsBuffer.capacity) * 100),
    isShuttingDown: analyticsBuffer.isShuttingDown,
  });
};
