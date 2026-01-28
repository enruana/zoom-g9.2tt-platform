import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import type { FirebaseApp } from 'firebase/app';
import type { Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const requiredKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
] as const;

function isConfigValid(): boolean {
  return requiredKeys.every((key) => {
    const value = firebaseConfig[key];
    return value !== undefined && value !== '';
  });
}

let firebaseApp: FirebaseApp | null = null;
let realtimeDb: Database | null = null;

if (isConfigValid()) {
  firebaseApp = initializeApp(firebaseConfig);

  // Initialize Realtime Database if database URL is configured
  if (firebaseConfig.databaseURL) {
    try {
      realtimeDb = getDatabase(firebaseApp);
    } catch (error) {
      console.warn('[Firebase] Failed to initialize Realtime Database:', error);
    }
  }
} else {
  console.warn(
    '[Firebase] Configuration missing or incomplete. Firebase features will be disabled. ' +
      'Set VITE_FIREBASE_* environment variables to enable Firebase.'
  );
}

/**
 * Get the Firebase Realtime Database instance.
 * @returns Database instance or null if not configured
 */
export function getRealtimeDatabase(): Database | null {
  return realtimeDb;
}

/**
 * Check if Realtime Database is available.
 */
export function isRealtimeDatabaseAvailable(): boolean {
  return realtimeDb !== null;
}

export { firebaseApp };
