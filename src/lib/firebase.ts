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
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
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
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration: Firestore appears to be offline.");
    } else {
      console.warn("Firestore connection test failed (this might be expected if the test document doesn't exist, but it confirms reachability if no 'offline' error occurs):", error);
    }
  }
}
testConnection();

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Use signInWithPopup first, fall back to signInWithRedirect if domain is unauthorized
export const signInWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    if (error?.code === 'auth/unauthorized-domain' || error?.code === 'auth/popup-blocked') {
      console.log('Popup auth failed, falling back to redirect...');
      return signInWithRedirect(auth, googleProvider);
    }
    throw error;
  }
};
export const signInWithGithub = async () => {
  try {
    return await signInWithPopup(auth, githubProvider);
  } catch (error: any) {
    if (error?.code === 'auth/unauthorized-domain' || error?.code === 'auth/popup-blocked') {
      console.log('Popup auth failed, falling back to redirect...');
      return signInWithRedirect(auth, githubProvider);
    }
    throw error;
  }
};
export const signInWithApple = async () => {
  try {
    return await signInWithPopup(auth, appleProvider);
  } catch (error: any) {
    if (error?.code === 'auth/unauthorized-domain' || error?.code === 'auth/popup-blocked') {
      return signInWithRedirect(auth, appleProvider);
    }
    throw error;
  }
};
export const logout = () => signOut(auth);

// Handle redirect result when user returns from Google sign-in
getRedirectResult(auth).catch((error) => {
  console.warn('Redirect auth result error:', error);
});

export { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile
};
