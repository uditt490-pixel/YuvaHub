import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Double-submit cookie CSRF protection.
 * Sets a CSRF token in a cookie and requires it to match a header on state-changing requests.
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Generate a token if not present
  let csrfToken = req.cookies?.['_csrf'];
  
  if (!csrfToken) {
    csrfToken = crypto.randomUUID();
    res.cookie('_csrf', csrfToken, {
      httpOnly: false, // Must be readable by frontend JavaScript to send in header
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  // Only check state-changing methods
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    // Skip CSRF check for the shutdown endpoint if it uses dedicated authentication
    // or skip for specific API routes that are authenticated purely via Bearer tokens
    // but as a strict default, we check it.
    
    const headerToken = req.headers['x-csrf-token'];
    if (!headerToken || headerToken !== csrfToken) {
      return res.status(403).json({ error: 'CSRF token validation failed' });
    }
  }

  next();
};
