import { Request, Response, NextFunction } from 'express';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { dbCommand } from '../api/db.js';
import jwt from 'jsonwebtoken';

let isFirebaseInitialized = false;

const isDevelopment = process.env.NODE_ENV === 'development';
const mockAuthEnabled = process.env.ENABLE_MOCK_AUTH === 'true';
const mockValidToken = process.env.MOCK_VALID_TOKEN || 'MOCK_VALID_TOKEN';

// Initialize Firebase Admin
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const serviceAccount = JSON.parse(
      Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
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
  } else if (process.env.FIREBASE_PROJECT_ID) {
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
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

export const authenticateUser = (db: any) => {
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
      const jwtSecret = process.env.JWT_SECRET || "default_secret_for_development_only";
      try {
        decodedToken = jwt.verify(token, jwtSecret);
        isCustomToken = true;
      } catch (err) {
        // Fallback to Firebase
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

      req.user = decodedToken;

      const activeDb = db || dbCommand;

      if (activeDb) {
        try {
          const usersCollection = activeDb.collection('users');

          const userDoc = await usersCollection.findOneAndUpdate(
            { firebaseUid: decodedToken.uid },
            {
              $setOnInsert: {
                firebaseUid: decodedToken.uid,
                email: decodedToken.email,
                name: decodedToken.name || '',
                picture: decodedToken.picture || '',
                created_at: new Date(),
              },
            },
            {
              upsert: true,
              returnDocument: 'after',
            },
          );

          if (userDoc && userDoc.value && userDoc.value.role) {
            req.user.role = userDoc.value.role;
          } else {
            req.user.role = 'student';
          }
        } catch (dbError) {
          console.error(
            '[Auth] Error during JIT user profile creation:',
            dbError,
          );
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

export const authMiddleware = authenticateUser(dbCommand);
export const adminOnly = authorizeRoles(['admin', 'superadmin']);