import { Request, Response, NextFunction } from 'express';
import { initializeApp, cert } from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';

let isFirebaseInitialized = false;

// Initialize Firebase Admin (with mock/fallback if credentials aren't present)
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
  } else {
    console.warn(
      '[Auth] WARNING: No Firebase Admin credentials found. Using MOCK auth verification for development.',
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

/**
 * Standardized authentication error response
 */
const sendAuthError = (
  res: Response,
  status: number,
  code: string,
  message: string,
) => {
  return res.status(status).json({
    error: {
      code,
      message,
    },
  });
};

export const authenticateUser = (dbCommand: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendAuthError(
        res,
        401,
        'INVALID_AUTH_HEADER',
        'Missing or malformed Authorization header.',
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      let decodedToken: any = null;

      // Check if we are running in mock mode
      if (!isFirebaseInitialized) {
        if (token === 'MOCK_VALID_TOKEN') {
          decodedToken = {
            uid: 'mock_user_123',
            email: 'mock@example.com',
            name: 'Mock User',
          };
        } else {
          const mockError: any = new Error('Invalid mock token');
          mockError.code = 'auth/invalid-token';
          throw mockError;
        }
      } else {
        decodedToken = await getAuth().verifyIdToken(token);
      }

      req.user = decodedToken;

      // JIT Profile Creation (Eventual Consistency with Upsert)
      if (dbCommand) {
        try {
          const usersCollection = dbCommand.collection('users');

          await usersCollection.findOneAndUpdate(
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
        } catch (dbError) {
          console.error('[Auth] Error during JIT user profile creation:', dbError);
        }
      }

      next();
    } catch (error: any) {
      console.error('[Auth] Authentication failed', {
        code: error?.code || 'unknown',
        message: error?.message,
        method: req.method,
        path: req.originalUrl,
      });

      switch (error?.code) {
        case 'auth/id-token-expired':
          return sendAuthError(
            res,
            401,
            'TOKEN_EXPIRED',
            'Authentication token has expired.',
          );

        case 'auth/id-token-revoked':
          return sendAuthError(
            res,
            401,
            'TOKEN_REVOKED',
            'Authentication token has been revoked.',
          );

        case 'auth/argument-error':
        case 'auth/invalid-token':
          return sendAuthError(
            res,
            401,
            'INVALID_TOKEN',
            'Invalid authentication token.',
          );

        default:
          return sendAuthError(
            res,
            401,
            'UNAUTHORIZED',
            'Authentication failed.',
          );
      }
    }
  };
};

export const deleteFirebaseUser = async (uid: string) => {
  if (isFirebaseInitialized) {
    await getAuth().deleteUser(uid);
  } else {
    console.warn(`[Auth] Mock mode: Firebase user ${uid} deletion skipped.`);
  }
};