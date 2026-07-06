// Firebase configuration
// Replace the placeholder values below with your actual Firebase project config.
// Get this from: Firebase Console → Project Settings → Your apps → Web app → SDK setup and configuration
//
// Steps to set up:
// 1. Go to https://console.firebase.google.com
// 2. Create a project (or select existing)
// 3. Add a Web app
// 4. Copy the firebaseConfig object here
// 5. Enable Authentication → Sign-in methods → Google + Email/Password
// 6. Enable Firestore Database (start in test mode for development)

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "REPLACE_WITH_YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "REPLACE_WITH_YOUR_APP_ID",
};

// Check if Firebase is configured with real values
export const isFirebaseConfigured = !firebaseConfig.apiKey.includes('REPLACE_WITH');

let app, auth, db, googleProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
} catch (error) {
  console.warn('Firebase initialization failed — running in demo mode:', error.message);
}

export { auth, db, googleProvider };
export default app;
