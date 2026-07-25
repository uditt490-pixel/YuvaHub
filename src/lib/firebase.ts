import { initializeApp } from 'firebase/app';
import { 
  initializeAuth,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  GoogleAuthProvider, 
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import type { AuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const envVars = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingVars = Object.entries(envVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);


const app = initializeApp(firebaseConfig);

if (missingVars.length > 0) {
  throw new Error(`Failed to initialize Firebase. Missing required environment variables: ${missingVars.join(', ')}`);
}

const firebaseConfig = {
  apiKey: envVars.VITE_FIREBASE_API_KEY,
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = (() => {
  try {
    return initializeApp(firebaseConfig);
  } catch (error) {
    throw new Error('Firebase client SDK initialization failed. Check your configuration.', { cause: error });
  }
})();

export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver
});

export const db = getFirestore(app);

import { doc, getDocFromServer } from 'firebase/firestore';

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration: Firestore appears to be offline.");
    } else {
      console.warn(
        "Firestore connection test failed (this might be expected if the test document doesn't exist, but it confirms reachability if no 'offline' error occurs):",
        error
      );
    }
  }
}

testConnection();

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Use popup authentication first and fall back to redirect when needed
const signInWithPopupFallback = async (provider: AuthProvider) => {
  try {
    return await signInWithPopup(auth, provider);
  } catch (error: any) {
    if (
      error?.code === 'auth/unauthorized-domain' ||
      error?.code === 'auth/popup-blocked'
    ) {
      console.log('Popup auth failed, falling back to redirect...');
      return signInWithRedirect(auth, provider);
    }

    throw error;
  }
};

export const signInWithGoogle = () =>
  signInWithPopupFallback(googleProvider);

export const signInWithGithub = () =>
  signInWithPopupFallback(githubProvider);

export const signInWithApple = () =>
  signInWithPopupFallback(appleProvider);

export const logout = () => signOut(auth);

// Handle redirect result when user returns from social sign-in
getRedirectResult(auth).catch((error) => {
  console.warn('Redirect auth result error:', error);
});

export { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile
};