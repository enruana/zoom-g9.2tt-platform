import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
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

if (isConfigValid()) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  console.warn(
    '[Firebase] Configuration missing or incomplete. Firebase features will be disabled. ' +
      'Set VITE_FIREBASE_* environment variables to enable Firebase.'
  );
}

export { firebaseApp };
