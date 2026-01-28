/**
 * SessionContext - React context for Server/Client session management
 *
 * Coordinates between SessionService, PatchContext, and DeviceContext
 * to enable remote control functionality.
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

import { sessionService } from '../services/session';
import { midiService } from '../services/midi/MidiService';
import { useAuth } from './AuthContext';
import { useDevice } from './DeviceContext';
import { usePatch } from './PatchContext';
import type {
  SessionMode,
  SessionMeta,
  SessionClient,
  SessionCommand,
  SessionContextState,
  SessionActions,
  ActiveSessionInfo,
} from '../types/session';

// ============================================
// State & Reducer
// ============================================

interface State {
  mode: SessionMode;
  sessionCode: string | null;
  sessionMeta: SessionMeta | null;
  clients: SessionClient[];
  isJoining: boolean;
  isCreating: boolean;
  error: string | null;
  mySessions: ActiveSessionInfo[];
  isLoadingMySessions: boolean;
}

type Action =
  | { type: 'SET_MODE'; mode: SessionMode }
  | { type: 'SET_SESSION'; code: string; meta: SessionMeta }
  | { type: 'SET_CLIENTS'; clients: SessionClient[] }
  | { type: 'SET_JOINING'; isJoining: boolean }
  | { type: 'SET_CREATING'; isCreating: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_MY_SESSIONS'; sessions: ActiveSessionInfo[] }
  | { type: 'SET_LOADING_MY_SESSIONS'; isLoading: boolean }
  | { type: 'RESET' };

const initialState: State = {
  mode: 'standalone',
  sessionCode: null,
  sessionMeta: null,
  clients: [],
  isJoining: false,
  isCreating: false,
  error: null,
  mySessions: [],
  isLoadingMySessions: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode };

    case 'SET_SESSION':
      return {
        ...state,
        sessionCode: action.code,
        sessionMeta: action.meta,
        mode: state.mode,
      };

    case 'SET_CLIENTS':
      return { ...state, clients: action.clients };

    case 'SET_JOINING':
      return { ...state, isJoining: action.isJoining };

    case 'SET_CREATING':
      return { ...state, isCreating: action.isCreating };

    case 'SET_ERROR':
      return { ...state, error: action.error };

    case 'SET_MY_SESSIONS':
      return { ...state, mySessions: action.sessions };

    case 'SET_LOADING_MY_SESSIONS':
      return { ...state, isLoadingMySessions: action.isLoading };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// ============================================
// Context
// ============================================

interface SessionContextValue {
  state: SessionContextState;
  actions: SessionActions;
}

const SessionContext = createContext<SessionContextValue | null>(null);

// ============================================
// Provider
// ============================================

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { state: authState } = useAuth();
  const { state: deviceState } = useDevice();
  const { state: patchState, actions: patchActions } = usePatch();
  const patches = patchState.patches;

  // ============================================
  // Auto-resume server session on page load
  // ============================================

  useEffect(() => {
    // Only attempt if:
    // - User is authenticated
    // - Not already in a session
    // - There's a stored server session
    if (!authState.user) return;
    if (state.mode !== 'standalone') return;

    const storedSession = sessionService.getStoredServerSession();
    if (!storedSession) return;

    // Don't resume if the stored session belongs to a different user
    if (storedSession.userId !== authState.user.uid) {
      console.log('[SessionContext] Stored session belongs to different user, clearing');
      sessionService.clearStoredSession();
      return;
    }

    async function attemptResume() {
      console.log('[SessionContext] Attempting to resume server session:', storedSession?.sessionCode);
      try {
        const meta = await sessionService.resumeServerSession(authState.user!.uid);
        if (meta) {
          dispatch({ type: 'SET_MODE', mode: 'server' });
          dispatch({
            type: 'SET_SESSION',
            code: storedSession!.sessionCode,
            meta,
          });
          console.log('[SessionContext] Resumed server session successfully');
        }
      } catch (error) {
        console.warn('[SessionContext] Failed to resume server session:', error);
        sessionService.clearStoredSession();
      }
    }

    attemptResume();
  }, [authState.user, state.mode]);

  // ============================================
  // Server: Broadcast state changes
  // ============================================

  useEffect(() => {
    if (state.mode !== 'server' || !state.sessionCode) return;
    if (patchState.selectedPatchId === null) return;

    // Debounce state broadcasts
    const timeoutId = setTimeout(() => {
      if (patches.length > 0 && patchState.selectedPatchId !== null) {
        sessionService.broadcastState(patches, patchState.selectedPatchId);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [state.mode, state.sessionCode, patches, patchState.selectedPatchId]);

  // ============================================
  // Server: Process incoming commands
  // ============================================

  useEffect(() => {
    if (state.mode !== 'server') return;

    const unsubscribe = sessionService.onCommand((command: SessionCommand) => {
      console.log('[SessionContext] Received command:', command);

      switch (command.type) {
        case 'paramChange': {
          const payload = command.payload as {
            moduleKey: string;
            paramIndex: number;
            midiParamId: number;
            value: number;
          };
          // Update local state
          patchActions.updateParameter(payload.moduleKey, payload.paramIndex, payload.value);
          // Send to MIDI pedal - use midiParamId (not paramIndex) for MIDI communication
          midiService.sendParameter(payload.moduleKey, payload.midiParamId, payload.value);
          break;
        }

        case 'patchSelect': {
          const payload = command.payload as { patchId: number };
          // Update local state
          patchActions.selectPatch(payload.patchId);
          // Send to MIDI pedal
          midiService.sendPatchChange(payload.patchId);
          break;
        }

        case 'moduleToggle': {
          const payload = command.payload as { moduleKey: string; enabled: boolean };
          // Update local state
          patchActions.setModuleEnabled(payload.moduleKey, payload.enabled);
          // Send to MIDI pedal (using sendParameter with the module enable parameter)
          // Module enable is typically param index 0 for enabled/disabled state
          midiService.sendModuleToggle(payload.moduleKey, payload.enabled);
          break;
        }

        case 'typeChange': {
          const payload = command.payload as { moduleKey: string; typeId: number };
          // Update local state
          patchActions.updateModuleType(payload.moduleKey, payload.typeId);
          // Send to MIDI pedal
          midiService.sendModuleType(payload.moduleKey, payload.typeId);
          break;
        }
      }
    });

    return unsubscribe;
  }, [state.mode, patchActions]);

  // ============================================
  // Client: Subscribe to state updates
  // ============================================

  useEffect(() => {
    if (state.mode !== 'client' || !state.sessionCode) return;

    const unsubscribe = sessionService.onStateChange((sessionState) => {
      console.log('[SessionContext] Received state update:', sessionState);

      // Convert allPatches record back to array
      if (sessionState.allPatches) {
        const patchesArray = Object.values(sessionState.allPatches);
        patchActions.setRemoteState(patchesArray, sessionState.currentPatchId);
      }
    });

    return unsubscribe;
  }, [state.mode, state.sessionCode, patchActions]);

  // ============================================
  // Subscribe to client list updates
  // ============================================

  useEffect(() => {
    if (!state.sessionCode) return;

    const unsubscribe = sessionService.onClientsChange((clients) => {
      dispatch({ type: 'SET_CLIENTS', clients });
    });

    return unsubscribe;
  }, [state.sessionCode]);

  // ============================================
  // Actions
  // ============================================

  const createSession = useCallback(async (): Promise<string> => {
    if (!authState.user) {
      throw new Error('Must be logged in to create a session');
    }

    dispatch({ type: 'SET_CREATING', isCreating: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      const deviceName = deviceState.deviceName || 'Zoom G9.2tt';
      const displayName = authState.user.displayName || 'Anonymous';

      const code = await sessionService.createSession(
        authState.user.uid,
        displayName,
        deviceName
      );

      dispatch({ type: 'SET_MODE', mode: 'server' });
      dispatch({
        type: 'SET_SESSION',
        code,
        meta: {
          hostUserId: authState.user.uid,
          hostDisplayName: displayName,
          deviceName,
          createdAt: Date.now(),
          isActive: true,
        },
      });

      // Broadcast initial state
      if (patches.length > 0 && patchState.selectedPatchId !== null) {
        await sessionService.broadcastState(patches, patchState.selectedPatchId);
      }

      return code;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create session';
      dispatch({ type: 'SET_ERROR', error: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_CREATING', isCreating: false });
    }
  }, [authState.user, deviceState.deviceName, patches, patchState.selectedPatchId]);

  const joinSession = useCallback(async (code: string): Promise<void> => {
    if (!authState.user) {
      throw new Error('Must be logged in to join a session');
    }

    dispatch({ type: 'SET_JOINING', isJoining: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      const displayName = authState.user.displayName || 'Anonymous';

      const meta = await sessionService.joinSession(
        code,
        authState.user.uid,
        displayName
      );

      dispatch({ type: 'SET_MODE', mode: 'client' });
      dispatch({ type: 'SET_SESSION', code, meta });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to join session';
      dispatch({ type: 'SET_ERROR', error: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_JOINING', isJoining: false });
    }
  }, [authState.user]);

  const leaveSession = useCallback(async (): Promise<void> => {
    try {
      await sessionService.leaveSession();
    } finally {
      dispatch({ type: 'RESET' });
    }
  }, []);

  const endSession = useCallback(async (): Promise<void> => {
    try {
      await sessionService.endSession();
    } finally {
      dispatch({ type: 'RESET' });
    }
  }, []);

  const sendCommand = useCallback(
    async (command: Omit<SessionCommand, 'clientId' | 'timestamp'>): Promise<void> => {
      if (state.mode !== 'client') {
        console.warn('[SessionContext] sendCommand called but not in client mode');
        return;
      }

      await sessionService.sendCommand(command.type, command.payload);
    },
    [state.mode]
  );

  const clearError = useCallback((): void => {
    dispatch({ type: 'SET_ERROR', error: null });
  }, []);

  const fetchMySessions = useCallback(async (): Promise<void> => {
    console.log('[SessionContext] fetchMySessions called, user:', authState.user?.uid);

    if (!authState.user) {
      console.warn('[SessionContext] No user, skipping fetch');
      dispatch({ type: 'SET_MY_SESSIONS', sessions: [] });
      return;
    }

    dispatch({ type: 'SET_LOADING_MY_SESSIONS', isLoading: true });

    try {
      console.log('[SessionContext] Calling getActiveSessionsForUser...');
      const sessions = await sessionService.getActiveSessionsForUser(authState.user.uid);
      console.log('[SessionContext] Got sessions:', sessions);
      dispatch({ type: 'SET_MY_SESSIONS', sessions });
    } catch (error) {
      console.error('[SessionContext] Failed to fetch my sessions:', error);
      dispatch({ type: 'SET_MY_SESSIONS', sessions: [] });
    } finally {
      dispatch({ type: 'SET_LOADING_MY_SESSIONS', isLoading: false });
    }
  }, [authState.user]);

  // ============================================
  // Memoized context value
  // ============================================

  const contextValue = useMemo<SessionContextValue>(
    () => ({
      state: {
        mode: state.mode,
        sessionCode: state.sessionCode,
        sessionMeta: state.sessionMeta,
        clients: state.clients,
        isJoining: state.isJoining,
        isCreating: state.isCreating,
        error: state.error,
        mySessions: state.mySessions,
        isLoadingMySessions: state.isLoadingMySessions,
      },
      actions: {
        createSession,
        joinSession,
        leaveSession,
        endSession,
        sendCommand,
        clearError,
        fetchMySessions,
      },
    }),
    [
      state.mode,
      state.sessionCode,
      state.sessionMeta,
      state.clients,
      state.isJoining,
      state.isCreating,
      state.error,
      state.mySessions,
      state.isLoadingMySessions,
      createSession,
      joinSession,
      leaveSession,
      endSession,
      sendCommand,
      clearError,
      fetchMySessions,
    ]
  );

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }

  return context;
}
