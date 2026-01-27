import type { User } from 'firebase/auth';

/** Authentication state */
export interface AuthState {
  /** Current authenticated user (null if not signed in) */
  user: User | null;
  /** Whether auth state is being determined */
  isLoading: boolean;
  /** Error message from auth operations */
  error: string | null;
}

/** Authentication actions */
export interface AuthActions {
  /** Sign in with Google OAuth popup */
  signInWithGoogle: () => Promise<void>;
  /** Sign out the current user */
  signOut: () => Promise<void>;
  /** Clear any auth error */
  clearError: () => void;
}

/** Combined auth context value */
export interface AuthContextValue {
  state: AuthState;
  actions: AuthActions;
}
