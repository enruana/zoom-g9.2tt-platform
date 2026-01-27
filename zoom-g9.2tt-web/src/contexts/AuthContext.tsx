/**
 * Authentication Context
 *
 * Provides auth state and actions to the entire app.
 * Handles Google sign-in, sign-out, and session persistence.
 */

import { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import type { AuthState, AuthActions, AuthContextValue } from '../types/auth';
import {
  signInWithGoogle as firebaseSignIn,
  signOut as firebaseSignOut,
  subscribeToAuthState,
  isAuthAvailable,
} from '../services/firebase/auth';

// Action types
type AuthAction =
  | { type: 'AUTH_STATE_CHANGED'; user: User | null }
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: true, // Start loading until we determine auth state
  error: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_STATE_CHANGED':
      return {
        ...state,
        user: action.user,
        isLoading: false,
        error: null,
      };
    case 'AUTH_LOADING':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.error,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Context
const AuthContext = createContext<AuthContextValue | null>(null);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Subscribe to auth state changes on mount
  useEffect(() => {
    if (!isAuthAvailable()) {
      // If Firebase is not configured, set loading to false
      dispatch({ type: 'AUTH_STATE_CHANGED', user: null });
      return;
    }

    const unsubscribe = subscribeToAuthState((user) => {
      dispatch({ type: 'AUTH_STATE_CHANGED', user });
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      await firebaseSignIn();
      // Auth state change will be handled by the subscription
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign-in failed';
      dispatch({ type: 'AUTH_ERROR', error: message });
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      await firebaseSignOut();
      // Auth state change will be handled by the subscription
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign-out failed';
      dispatch({ type: 'AUTH_ERROR', error: message });
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const actions: AuthActions = useMemo(
    () => ({
      signInWithGoogle,
      signOut,
      clearError,
    }),
    [signInWithGoogle, signOut, clearError]
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
