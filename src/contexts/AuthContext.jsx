import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '../lib/firebase';

const AuthContext = createContext(null);



const DEFAULT_USER_PROFILE = {
  theme: 'system',
  language: 'en',
  plan: 'trial',
  planStartedAt: new Date().toISOString(),
  onboardingComplete: false,
  listCount: 0,
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile from Firestore
  const loadUserProfile = useCallback(async (uid) => {
    if (!isFirebaseConfigured) return DEFAULT_USER_PROFILE;
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        // Create default profile
        await setDoc(docRef, DEFAULT_USER_PROFILE);
        return DEFAULT_USER_PROFILE;
      }
    } catch (err) {
      console.warn('Failed to load user profile:', err);
      return DEFAULT_USER_PROFILE;
    }
  }, []);

  // Update user profile in Firestore
  const updateUserProfile = useCallback(async (updates) => {
    if (!user) return;
    const newProfile = { ...userProfile, ...updates };
    setUserProfile(newProfile);

    if (!isFirebaseConfigured) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, updates);
    } catch (err) {
      console.warn('Failed to update user profile:', err);
    }
  }, [user, userProfile]);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    // Timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
      console.warn('Auth loading timeout - forcing loading to false');
    }, 10000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout);
      if (firebaseUser) {
        setUser(firebaseUser);
        const profile = await loadUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [loadUserProfile]);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      throw new Error('auth/invalid-api-key');
    }
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      console.error('signInWithPopup failed:', err);
      if (err.code !== 'auth/unauthorized-domain' && err.code !== 'auth/popup-closed-by-user') {
        console.log('Falling back to signInWithRedirect...');
        await signInWithRedirect(auth, googleProvider);
      } else {
        throw err;
      }
    }
  };

  const signInWithEmail = async (email, password) => {
    if (!isFirebaseConfigured) {
      throw new Error('auth/invalid-api-key');
    }
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err) {
      console.error('signInWithEmail failed:', err);
      throw err;
    }
  };

  const signUpWithEmail = async (email, password, name) => {
    if (!isFirebaseConfigured) {
      throw new Error('auth/invalid-api-key');
    }
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(result.user, { displayName: name });
      }
      return result.user;
    } catch (err) {
      console.error('signUpWithEmail failed:', err);
      throw err;
    }
  };



  const signOut = async () => {
    if (isFirebaseConfigured) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    setUserProfile(null);
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    setError,
    isFirebaseConfigured,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,

    signOut,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
