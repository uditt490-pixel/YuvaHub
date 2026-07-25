import { Response } from "express";

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export function sendSuccess<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function sendError(res: Response, error: string, status = 500, code?: string) {
  return res.status(status).json({ success: false, error, ...(code ? { code } : {}) });
}

export function sendBadRequest(res: Response, error: string) {
  return sendError(res, error, 400, "BAD_REQUEST");
}

export function sendUnauthorized(res: Response, error = "Unauthorized") {
  return sendError(res, error, 401, "UNAUTHORIZED");
}

export function sendForbidden(res: Response, error = "Forbidden") {
  return sendError(res, error, 403, "FORBIDDEN");
}

export function sendNotFound(res: Response, error = "Resource not found") {
  return sendError(res, error, 404, "NOT_FOUND");
}

export function sendConflict(res: Response, error: string) {
  return sendError(res, error, 409, "CONFLICT");
}

export function sendTooManyRequests(res: Response, error = "Rate limit exceeded") {
  return sendError(res, error, 429, "RATE_LIMITED");
}

export function sendServiceUnavailable(res: Response, error = "Service unavailable") {
  return sendError(res, error, 503, "SERVICE_UNAVAILABLE");
}
