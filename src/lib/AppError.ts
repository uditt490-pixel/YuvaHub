/**
 * Standard application error. Throwing an AppError from any route handler
 * (sync or async) routes to the global errorHandler middleware, which
 * serializes it as a consistent { success, error, code, details } envelope.
 */
export class AppError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: any;

  constructor(statusCode: number, message: string, code?: string, details?: any) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, AppError);
  }

  static badRequest(message: string, code?: string, details?: any) {
    return new AppError(400, message, code || "BAD_REQUEST", details);
  }

  static unauthorized(message = "Unauthorized", code?: string) {
    return new AppError(401, message, code || "UNAUTHORIZED");
  }

  static forbidden(message = "Forbidden", code?: string) {
    return new AppError(403, message, code || "FORBIDDEN");
  }

  static notFound(message = "Resource not found", code?: string) {
    return new AppError(404, message, code || "NOT_FOUND");
  }

  static conflict(message: string, code?: string) {
    return new AppError(409, message, code || "CONFLICT");
  }

  static rateLimited(message = "Rate limit exceeded", code?: string) {
    return new AppError(429, message, code || "RATE_LIMITED");
  }

  static serviceUnavailable(message = "Service unavailable", code?: string) {
    return new AppError(503, message, code || "SERVICE_UNAVAILABLE");
  }

  static internal(message = "Internal Server Error", code?: string) {
    return new AppError(500, message, code || "INTERNAL");
  }
}
