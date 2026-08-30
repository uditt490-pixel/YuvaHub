import { Request, Response, NextFunction } from 'express';
import { auth } from '../utils/firebaseAdmin';
import { logger } from '../utils/logger';

/**
 * Express middleware to verify Firebase ID tokens and check custom claims for RBAC.
 * @param allowedRoles - Array of roles permitted to access the route (e.g., ['admin', 'moderator']).
 */
export const requireRole = (allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Unauthorized: No token provided' });
            }

            const token = authHeader.split('Bearer ')[1];
            const decodedToken = await auth.verifyIdToken(token);

            // Attach user info to request for downstream use
            (req as any).user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                role: decodedToken.role || 'user',
            };

            const userRole = decodedToken.role || 'user';

            if (!allowedRoles.includes(userRole)) {
                logger.warn(`Forbidden access attempt by user ${decodedToken.uid} with role ${userRole}`);
                return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
            }

            next();
        } catch (error) {
            logger.error({ err: error }, 'Token verification failed:');
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
    };
};
