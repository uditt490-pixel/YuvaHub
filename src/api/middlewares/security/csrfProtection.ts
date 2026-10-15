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
    // Explicit Bearer token authenticated requests are not vulnerable to CSRF
    // as browsers do not attach Authorization headers automatically cross-origin.
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      return next();
    }

    const headerToken = req.headers['x-csrf-token'];
    if (typeof headerToken !== 'string') {
      return res.status(403).json({ error: 'CSRF token validation failed' });
    }

    const headerBuf = Buffer.from(headerToken);
    const cookieBuf = Buffer.from(csrfToken);

    if (headerBuf.length !== cookieBuf.length || !crypto.timingSafeEqual(headerBuf, cookieBuf)) {
      return res.status(403).json({ error: 'CSRF token validation failed' });
    }
  }

  next();
};
