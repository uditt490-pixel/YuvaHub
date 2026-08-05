import { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/AppError.js";
import * as Sentry from "@sentry/node";

/**
 * Global error handler. Receives every error thrown by route handlers
 * (Express 5 auto-forwards rejected promises) and serializes it as a
 * consistent { success, error, code, details } envelope.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Send unexpected errors to Sentry for monitoring (if configured).
  if (!(err instanceof AppError)) {
    Sentry.captureException(err);
  }

  const statusCode = err instanceof AppError ? err.statusCode : (err.status || err.statusCode || 500);
  // Never surface raw internal error messages to clients in production —
  // log the real detail server-side but respond with a generic message.
  // AppError messages are intentional, client-facing descriptions. (Issue #374)
  const isProduction = process.env.NODE_ENV === "production";
  const message =
    err instanceof AppError
      ? err.message
      : isProduction
        ? "Internal Server Error"
        : err.message || "Internal Server Error";
  const code = err instanceof AppError ? err.code : undefined;
  const details = err instanceof AppError ? err.details : (err.details || undefined);

  if (statusCode >= 500) {
    console.error("[Error Handler]", err);
  }

  // Always return a JSON envelope, never leak stack traces to production.
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(code ? { code } : {}),
    ...(details !== undefined ? { details } : {}),
  });
};
