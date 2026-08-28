import * as admin from 'firebase-admin';

/**
 * Initializes the Firebase Admin SDK for server-side operations.
 * This is required for verifying ID tokens and managing custom claims (RBAC).
 */
if (!admin.apps.length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        : undefined;

    admin.initializeApp({
        credential: serviceAccount
            ? admin.credential.cert(serviceAccount)
            : admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
    });
}

export const firebaseAdmin = admin;
export const auth = admin.auth();
