/**
 * Firebase Authentication Service
 *
 * Wraps Firebase Auth methods for Google sign-in.
 * Uses browserLocalPersistence for session persistence across reloads.
 */

import {
  getAuth,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import { firebaseApp } from './config';

let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

/**
 * Initialize Firebase Auth with local persistence.
 * Returns null if Firebase is not configured.
 */
export function initAuth(): Auth | null {
  if (!firebaseApp) {
    console.warn('[Auth] Firebase not configured, auth disabled');
    return null;
  }

  if (!auth) {
    auth = getAuth(firebaseApp);
    googleProvider = new GoogleAuthProvider();

    // Set persistence to local (survives browser restart)
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('[Auth] Failed to set persistence:', error);
    });
  }

  return auth;
}

/**
 * Sign in with Google OAuth popup.
 * @throws Error if auth is not available or sign-in fails
 */
export async function signInWithGoogle(): Promise<User> {
  const authInstance = initAuth();
  if (!authInstance || !googleProvider) {
    throw new Error('Firebase authentication is not configured');
  }

  try {
    const result = await signInWithPopup(authInstance, googleProvider);
    return result.user;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };

    // Handle specific Firebase auth errors
    switch (firebaseError.code) {
      case 'auth/popup-closed-by-user':
        throw new Error('Sign-in cancelled');
      case 'auth/popup-blocked':
        throw new Error('Popup was blocked. Please allow popups for this site.');
      case 'auth/cancelled-popup-request':
        throw new Error('Sign-in cancelled');
      case 'auth/network-request-failed':
        throw new Error('Network error. Please check your connection.');
      default:
        throw new Error(firebaseError.message || 'Sign-in failed');
    }
  }
}

/**
 * Sign out the current user.
 * @throws Error if auth is not available or sign-out fails
 */
export async function signOut(): Promise<void> {
  const authInstance = initAuth();
  if (!authInstance) {
    throw new Error('Firebase authentication is not configured');
  }

  await firebaseSignOut(authInstance);
}

/**
 * Subscribe to auth state changes.
 * @param callback Function called with user on auth state change
 * @returns Unsubscribe function
 */
export function subscribeToAuthState(
  callback: (user: User | null) => void
): (() => void) | null {
  const authInstance = initAuth();
  if (!authInstance) {
    // If no auth, immediately call with null and return noop
    callback(null);
    return null;
  }

  return onAuthStateChanged(authInstance, callback);
}

/**
 * Get the current authenticated user (synchronous).
 * May be null if auth state hasn't been determined yet.
 */
export function getCurrentUser(): User | null {
  const authInstance = initAuth();
  return authInstance?.currentUser ?? null;
}

/**
 * Check if Firebase Auth is available/configured.
 */
export function isAuthAvailable(): boolean {
  return firebaseApp !== null;
}
