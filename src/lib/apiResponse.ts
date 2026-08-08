import { Response } from "express";

export interface ApiPaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  meta?: ApiPaginationMeta;
  items?: T[];
  [key: string]: unknown;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export type ApiEnvelope<T = any> = ApiSuccess<T> | ApiError;

/**
 * Send a success response using the universal envelope.
 *
 * Standard shape: `{ success: true, data?, meta? }`.
 *
 * For backward compatibility, object payloads are also flattened onto the
 * top-level response body (e.g. `{ status, profile }`) so existing clients
 * keep working while still receiving the standard `success: true` flag.
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  status = 200,
  meta?: ApiPaginationMeta,
) {
  if (data !== null && typeof data === "object" && !Array.isArray(data)) {
    return res.status(status).json({
      success: true,
      ...(data as Record<string, unknown>),
      ...(meta ? { meta } : {}),
    });
  }
  return res.status(status).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

/**
 * Send a paginated list response using the universal envelope.
 *
 * Shape: `{ success: true, data: T[], items: T[], meta: { page, limit, total } }`.
 * `items` is a backward-compatible alias of `data`.
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  status = 200,
) {
  return res.status(status).json({
    success: true,
    data,
    items: data,
    meta: { page, limit, total },
  });
}

export function sendError(
  res: Response,
  error: string,
  status = 500,
  code?: string,
) {
  return res.status(status).json({
    success: false,
    error,
    ...(code ? { code } : {}),
  });
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
