import { initializeApp, getApps, applicationDefault, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Initializes the Firebase Admin SDK for server-side operations.
 * This is required for verifying ID tokens and managing custom claims (RBAC).
 */
if (!getApps().length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        : undefined;

    initializeApp({
        credential: serviceAccount
            ? cert(serviceAccount)
            : applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
    });
}

export const auth = getAuth();
export const db = getFirestore();
