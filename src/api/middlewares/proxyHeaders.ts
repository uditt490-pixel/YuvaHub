import { Request, Response, NextFunction } from "express";

/**
 * Strips the `forwarded` header from incoming requests.
 *
 * When the app runs behind a reverse proxy (Render, Cloudflare, nginx) the
 * `forwarded` header can trigger `express-rate-limit` validation warnings/errors.
 * `app.set('trust proxy', true)` is still used for correct client IP resolution;
 * this middleware just removes the noisy header before the limiters run.
 */
export function stripForwardedHeader(req: Request, _res: Response, next: NextFunction) {
  delete req.headers['forwarded'];
  next();
}
