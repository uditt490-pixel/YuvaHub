import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Secures the shutdown endpoint by requiring an admin token or secret.
 */
export const shutdownGuard = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    console.warn('[Security] ADMIN_SECRET not set. Shutdown endpoint is disabled.');
    return res.status(403).json({ error: 'Shutdown endpoint disabled' });
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  
  const tokenBuf = Buffer.from(token);
  const secretBuf = Buffer.from(adminSecret);

  if (tokenBuf.length !== secretBuf.length || !crypto.timingSafeEqual(tokenBuf, secretBuf)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
};
