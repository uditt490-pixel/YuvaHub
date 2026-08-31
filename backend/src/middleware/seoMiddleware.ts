/**
 * backend/src/middleware/seoMiddleware.ts
 * ---------------------------------------
 * SEO headers and crawler detection middleware.
 */

import { Request, Response, NextFunction } from "express";

export function seoMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.setHeader("X-Robots-Tag", "index, follow");
  next();
}
