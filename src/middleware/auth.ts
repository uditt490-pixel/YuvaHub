import { Request, Response, NextFunction } from 'express';
import { initializeApp, cert } from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';

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

  } else {
    console.warn(
      '[Auth] WARNING: No Firebase Admin credentials found. Using MOCK auth verification for development.',

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

/**
 * Authenticated user model
 */
interface AuthenticatedUser {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

/**
 * Minimal database interface used by the middleware
 */
interface DatabaseCommand {
  collection(name: string): {
    findOneAndUpdate(
      filter: Record<string, unknown>,
      update: Record<string, unknown>,
      options: Record<string, unknown>,
    ): Promise<unknown>;
  };

}

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticateUser = (dbCommand?: DatabaseCommand) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {

      return res
        .status(401)
        .json({ error: 'Unauthorized: Missing or invalid token format' });

      return res.status(401).json({
        error: 'Unauthorized: Missing or invalid token format',
      });

    }

    const token = authHeader.split(' ')[1];

    try {
      let decodedToken: AuthenticatedUser | null = null;

      if (!isFirebaseInitialized) {

        if (token === 'MOCK_VALID_TOKEN') {

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

        const firebaseToken = await getAuth().verifyIdToken(token);

        decodedToken = {
          uid: firebaseToken.uid,
          email: firebaseToken.email,
          name: firebaseToken.name,
          picture: firebaseToken.picture,
        };

        decodedToken = await getAuth().verifyIdToken(token);

      }

      req.user = decodedToken;

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
          console.error(
            '[Auth] Error during JIT user profile creation:',
            dbError,
          );

          // Depending on requirements, we could block the request here or let it pass
          // (failing open if it's a transient DB error). We'll let it pass for now.

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
]
  } else {

  } else if (isDevelopment && mockAuthEnabled) {

    console.warn(
      `[Auth] Mock mode: Firebase user ${uid} deletion skipped.`,
    );
  }
};