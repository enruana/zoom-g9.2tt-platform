/**
 * Sync Context
 *
 * Manages cloud synchronization of patches with Firestore.
 * Automatically loads patches from cloud when user signs in.
 */

import { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { usePatch } from './PatchContext';
import {
  loadPatches,
  savePatch,
  saveAllPatches,
  isFirestoreAvailable,
} from '../services/firebase/firestore';
import type { SyncState, SyncActions, SyncContextValue, SyncStatus } from '../types/sync';

// Action types
type SyncAction =
  | { type: 'SET_STATUS'; status: SyncStatus }
  | { type: 'SYNC_SUCCESS'; timestamp: number }
  | { type: 'SYNC_ERROR'; error: string }
  | { type: 'SET_PENDING_CHANGES'; hasPending: boolean }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: SyncState = {
  status: 'idle',
  lastSyncedAt: null,
  error: null,
  hasPendingChanges: false,
};

// Reducer
function syncReducer(state: SyncState, action: SyncAction): SyncState {
  switch (action.type) {
    case 'SET_STATUS':
      return {
        ...state,
        status: action.status,
        error: action.status === 'error' ? state.error : null,
      };
    case 'SYNC_SUCCESS':
      return {
        ...state,
        status: 'synced',
        lastSyncedAt: action.timestamp,
        error: null,
        hasPendingChanges: false,
      };
    case 'SYNC_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.error,
      };
    case 'SET_PENDING_CHANGES':
      return {
        ...state,
        hasPendingChanges: action.hasPending,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        status: state.lastSyncedAt ? 'synced' : 'idle',
        error: null,
      };
    default:
      return state;
  }
}

// Context
const SyncContext = createContext<SyncContextValue | null>(null);

// Provider props
interface SyncProviderProps {
  children: ReactNode;
}

// Provider component
export function SyncProvider({ children }: SyncProviderProps) {
  const [state, dispatch] = useReducer(syncReducer, initialState);
  const { state: authState } = useAuth();
  const { state: patchState } = usePatch();

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      if (state.status === 'offline') {
        dispatch({ type: 'SET_STATUS', status: 'idle' });
      }
    };

    const handleOffline = () => {
      dispatch({ type: 'SET_STATUS', status: 'offline' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      dispatch({ type: 'SET_STATUS', status: 'offline' });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state.status]);

  // Load patches from cloud when user signs in
  useEffect(() => {
    if (!authState.user || !isFirestoreAvailable()) return;

    const loadCloudPatches = async () => {
      // Only load if we don't have patches yet
      if (patchState.patches.length > 0) return;

      dispatch({ type: 'SET_STATUS', status: 'syncing' });

      try {
        const cloudPatches = await loadPatches(authState.user!.uid);

        if (cloudPatches.length > 0) {
          // We have cloud data - could implement merge here
          // For now, just note that cloud data exists
          console.log(`[Sync] Found ${cloudPatches.length} patches in cloud`);
        }

        dispatch({ type: 'SYNC_SUCCESS', timestamp: Date.now() });
      } catch (error) {
        console.error('[Sync] Failed to load cloud patches:', error);
        dispatch({
          type: 'SYNC_ERROR',
          error: error instanceof Error ? error.message : 'Failed to sync',
        });
      }
    };

    loadCloudPatches();
  }, [authState.user, patchState.patches.length]);

  // Sync patches to cloud
  const sync = useCallback(async () => {
    if (!authState.user || !isFirestoreAvailable()) {
      return;
    }

    if (patchState.patches.length === 0) {
      return;
    }

    dispatch({ type: 'SET_STATUS', status: 'syncing' });

    try {
      await saveAllPatches(authState.user.uid, patchState.patches);
      dispatch({ type: 'SYNC_SUCCESS', timestamp: Date.now() });
    } catch (error) {
      console.error('[Sync] Failed to sync patches:', error);
      dispatch({
        type: 'SYNC_ERROR',
        error: error instanceof Error ? error.message : 'Failed to sync',
      });
    }
  }, [authState.user, patchState.patches]);

  // Save a single patch to cloud
  const savePatchToCloud = useCallback(async (patchId: number) => {
    if (!authState.user || !isFirestoreAvailable()) {
      return;
    }

    const patch = patchState.patches.find(p => p.id === patchId);
    if (!patch) {
      console.warn('[Sync] Patch not found:', patchId);
      return;
    }

    dispatch({ type: 'SET_STATUS', status: 'syncing' });

    try {
      await savePatch(authState.user.uid, patchId, patch);
      dispatch({ type: 'SYNC_SUCCESS', timestamp: Date.now() });
    } catch (error) {
      console.error('[Sync] Failed to save patch to cloud:', error);
      dispatch({
        type: 'SYNC_ERROR',
        error: error instanceof Error ? error.message : 'Failed to save to cloud',
      });
    }
  }, [authState.user, patchState.patches]);

  // Save all patches to cloud
  const saveAllPatchesToCloud = useCallback(async () => {
    await sync();
  }, [sync]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const actions: SyncActions = useMemo(
    () => ({
      sync,
      savePatchToCloud,
      saveAllPatchesToCloud,
      clearError,
    }),
    [sync, savePatchToCloud, saveAllPatchesToCloud, clearError]
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

// Hook
// eslint-disable-next-line react-refresh/only-export-components
export function useSync(): SyncContextValue {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
