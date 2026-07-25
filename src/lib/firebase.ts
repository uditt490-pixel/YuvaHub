import { initializeApp, FirebaseError } from 'firebase/app';
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

import { 
  getFirestore,
  doc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);


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


const app = (() => {
  try {
    return initializeApp(firebaseConfig);
  } catch (error) {
    throw new Error('Firebase client SDK initialization failed. Check your configuration.', { cause: error });
  }
})();


const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver
});

export const db = getFirestore(app);

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.info('Firestore connection test succeeded.');
  } catch (error) {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'unavailable':
          console.error(
            'Firestore connection failed: the service is unavailable or the client is offline. Please check your network and Firebase configuration.'
          );
          break;

        case 'permission-denied':
          console.error(
            'Firestore connection failed: permission denied. Please check your Firestore security rules and user permissions.'
          );
          break;

        case 'unauthenticated':
          console.error(
            'Firestore connection failed: authentication is required. Please check the current authentication state.'
          );
          break;

        case 'not-found':
          console.warn(
            'Firestore is reachable, but the connection test document does not exist.'
          );
          break;

        default:
          console.error(
            `Firestore connection test failed with error "${error.code}":`,
            error
          );
      }
    } else if (
      error instanceof Error &&
      error.message.toLowerCase().includes('offline')
    ) {
      console.error(
        'Firestore connection failed: the client appears to be offline. Please check your network and Firebase configuration.'
      );
    } else {
      console.error(
        'Firestore connection test failed with an unexpected error:',
        error
      );
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
    if (
      error?.code === 'auth/unauthorized-domain' ||
      error?.code === 'auth/popup-blocked'
    ) {
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
    if (
      error?.code === 'auth/unauthorized-domain' ||
      error?.code === 'auth/popup-blocked'
    ) {
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
    if (
      error?.code === 'auth/unauthorized-domain' ||
      error?.code === 'auth/popup-blocked'
    ) {
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