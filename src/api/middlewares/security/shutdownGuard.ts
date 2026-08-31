import type { Request, Response, NextFunction } from 'express';

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
  
  if (token !== adminSecret) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
};
