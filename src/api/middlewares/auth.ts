import { Request, Response, NextFunction } from 'express';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { dbCommand, dbQuery } from '../db.js';
import jwt from 'jsonwebtoken';
import { config } from "../../config/env.js";

let isFirebaseInitialized = false;

const isDevelopment = config.NODE_ENV === 'development';
const mockAuthEnabled = config.ENABLE_MOCK_AUTH === 'true';
const mockValidToken = config.MOCK_VALID_TOKEN || 'MOCK_VALID_TOKEN';

// Initialize Firebase Admin
try {
  if (config.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const serviceAccount = JSON.parse(
      Buffer.from(
        config.FIREBASE_SERVICE_ACCOUNT_BASE64,
        'base64',
      ).toString('utf8'),
    );

    initializeApp({
      credential: cert(serviceAccount),
    });

    isFirebaseInitialized = true;
    console.log(
      '[Auth] Firebase Admin initialized with provided service account.',
    );
  } else if (config.FIREBASE_PROJECT_ID) {
    initializeApp({
      projectId: config.FIREBASE_PROJECT_ID,
    });

    isFirebaseInitialized = true;
    console.log(
      '[Auth] Firebase Admin initialized with Application Default Credentials / Project ID.',
    );
  } else if (isDevelopment && mockAuthEnabled) {
    console.warn(
      '[Auth] WARNING: Firebase credentials not found. Mock authentication is ENABLED for development.',
    );
  } else {
    console.warn(
      '[Auth] Firebase credentials not found. Mock authentication is disabled.',
    );
  }
} catch (error) {
  console.error('[Auth] Firebase Admin initialization error:', error);
}

// Extend Request interface to include the user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateUser = (db?: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized: Missing or invalid token format',
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      let decodedToken: any = null;
      let isCustomToken = false;

      // 1. Try Custom JWT first
      const jwtSecret = config.JWT_SECRET;

      if (config.NODE_ENV === 'production' && !jwtSecret) {
        return res.status(503).json({
          error: 'Authentication service unavailable. JWT_SECRET must be configured in production.',
        });
      }

      if (!jwtSecret) {
        console.warn('[Auth] JWT_SECRET not configured, skipping custom JWT verification');
      } else {
        try {
          decodedToken = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
          isCustomToken = true;
        } catch (err) {
          // Fallback to Firebase
        }
      }

      // 2. If not a custom token, verify with Firebase
      if (!isCustomToken) {
        if (!isFirebaseInitialized) {
          if (!(isDevelopment && mockAuthEnabled)) {
            return res.status(503).json({
              error:
                'Authentication service unavailable. Firebase Admin is not configured.',
            });
          }

          console.warn('[Auth] Using mock authentication.');

          if (token === mockValidToken) {
            decodedToken = {
              uid: 'mock_user_123',
              email: 'mock@example.com',
              name: 'Mock User',
            };
          } else {
            throw new Error('Invalid mock token');
          }
        } else {
          decodedToken = await getAuth().verifyIdToken(token);
        }
      }

      const uid = decodedToken.uid || decodedToken.firebaseUid || decodedToken.sub || decodedToken.user_id;
      if (!uid) {
        throw new Error('Token payload missing user id');
      }
      decodedToken.uid = uid;
      req.user = decodedToken;

      const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);
      const isConfiguredAdmin = !!(decodedToken.email && adminEmails.includes(decodedToken.email.toLowerCase()));

      // Dynamically resolve DB reference at runtime (allows test mocks & module-level fallback)
      const activeDb = db || (req as any).db || dbCommand;

      if (activeDb) {
        try {
          const usersCollection = activeDb.collection('users');

          const userDoc = await usersCollection.findOneAndUpdate(
            { $or: [{ firebaseUid: uid }, { uid }] },
            {
              $setOnInsert: {
                uid: uid,
                firebaseUid: uid,
                email: decodedToken.email || '',
                name: decodedToken.name || '',
                picture: decodedToken.picture || '',
                created_at: new Date(),
                role: isConfiguredAdmin ? 'admin' : 'student',
              },
            },
            {
              upsert: true,
              returnDocument: 'after',
              returnOriginal: false,
            },
          );

          const returnedDoc = userDoc && (userDoc.value !== undefined ? userDoc.value : userDoc);
          if (returnedDoc && returnedDoc.role) {
            req.user.role = isConfiguredAdmin ? 'admin' : returnedDoc.role;
          } else {
            req.user.role = isConfiguredAdmin ? 'admin' : 'student';
          }
        } catch (dbError) {
          console.error(
            '[Auth] Error during JIT user profile creation:',
            dbError,
          );
          if (!req.user.role) {
            req.user.role = isConfiguredAdmin ? 'admin' : 'student';
          }
        }
      } else {
        if (!req.user.role) {
          req.user.role = isConfiguredAdmin ? 'admin' : 'student';
        }
      }

      next();
    } catch (error) {
      console.error('[Auth] Token verification failed:', error);
      return res.status(401).json({
        error: 'Unauthorized: Invalid token',
      });
    }
  };
};

export const deleteFirebaseUser = async (uid: string) => {
  if (isFirebaseInitialized) {
    await getAuth().deleteUser(uid);
  } else if (isDevelopment && mockAuthEnabled) {
    console.warn(
      `[Auth] Mock mode: Firebase user ${uid} deletion skipped.`,
    );
  }
};

export const authorizeRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Access denied: No role assigned.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied: Requires one of ${allowedRoles.join(', ')}` });
    }

    next();
  };
};

export const authMiddleware = authenticateUser();
export const adminOnly = authorizeRoles(['admin', 'superadmin']);

export const verifyToken = async (token: string): Promise<any> => {
  if (!token) throw new Error('Missing token');
  const jwtSecret = config.JWT_SECRET;
  if (jwtSecret) {
    try {
      return jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
    } catch (e) {
      // Fallback to Firebase
    }
  }

  if (isFirebaseInitialized) {
    return await getAuth().verifyIdToken(token);
  }

  if (isDevelopment && mockAuthEnabled && token === mockValidToken) {
    return {
      uid: 'mock_user_123',
      email: 'mock@example.com',
      name: 'Mock User',
    };
  }

  throw new Error('Unauthorized: Invalid or unverified token');
};