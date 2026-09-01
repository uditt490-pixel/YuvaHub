import { Request, Response, NextFunction } from 'express';
import { logger } from './logger.js';
import crypto from 'crypto';

// Extend Express Request interface to include reqId
declare global {
  namespace Express {
    interface Request {
      reqId: string;
    }
  }
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const reqId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.reqId = reqId;
  res.setHeader('X-Request-Id', reqId);

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      reqId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    }, `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
};
