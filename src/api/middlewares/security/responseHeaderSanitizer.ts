import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Strips X-Powered-By header and injects an X-Request-Id.
 */
export const responseHeaderSanitizer = (req: Request, res: Response, next: NextFunction) => {
  res.removeHeader('X-Powered-By');
  
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', requestId as string);
  
  // Attach it to req object so it can be used in logging (pino/morgan)
  (req as any).id = requestId;
  
  next();
};
