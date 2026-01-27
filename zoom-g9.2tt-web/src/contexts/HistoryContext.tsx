import { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ModuleName } from '../types/patch';

/** A single history entry for undo/redo */
export interface HistoryEntry {
  /** Patch ID this change belongs to */
  patchId: number;
  /** Module that was changed */
  module: ModuleName;
  /** Parameter index that was changed (in the editable params array) */
  paramIndex: number;
  /** MIDI parameter ID for real-time control */
  midiParamId: number;
  /** Value before the change */
  oldValue: number;
  /** Value after the change */
  newValue: number;
  /** When the change was made */
  timestamp: number;
}

/** History context state */
export interface HistoryState {
  /** Stack of changes that can be undone */
  undoStack: HistoryEntry[];
  /** Stack of changes that can be redone */
  redoStack: HistoryEntry[];
  /** Current patch ID being tracked */
  currentPatchId: number | null;
}

/** History context actions */
export interface HistoryActions {
  /** Push a new change to the undo stack */
  pushChange: (entry: Omit<HistoryEntry, 'timestamp'>) => void;
  /** Undo the last change, returns the entry to apply */
  undo: () => HistoryEntry | null;
  /** Redo the last undone change, returns the entry to apply */
  redo: () => HistoryEntry | null;
  /** Clear all history (e.g., after save or patch change) */
  clearHistory: () => void;
  /** Set the current patch being tracked */
  setCurrentPatch: (patchId: number | null) => void;
}

/** Combined context value */
export interface HistoryContextValue {
  state: HistoryState;
  actions: HistoryActions;
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
}

// Action types
type HistoryAction =
  | { type: 'PUSH_CHANGE'; entry: HistoryEntry }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_CURRENT_PATCH'; patchId: number | null };

// Maximum history size to prevent memory issues
const MAX_HISTORY_SIZE = 100;

// Initial state
const initialState: HistoryState = {
  undoStack: [],
  redoStack: [],
  currentPatchId: null,
};

// Reducer
function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'PUSH_CHANGE': {
      // Only track changes for the current patch
      if (action.entry.patchId !== state.currentPatchId) {
        return state;
      }

      const newUndoStack = [...state.undoStack, action.entry];
      // Trim stack if too large
      if (newUndoStack.length > MAX_HISTORY_SIZE) {
        newUndoStack.shift();
      }

      return {
        ...state,
        undoStack: newUndoStack,
        // Clear redo stack when new change is made
        redoStack: [],
      };
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) {
        return state;
      }

      const undoStack = [...state.undoStack];
      const entry = undoStack.pop();
      if (!entry) return state;

      return {
        ...state,
        undoStack,
        redoStack: [...state.redoStack, entry],
      };
    }

    case 'REDO': {
      if (state.redoStack.length === 0) {
        return state;
      }

      const redoStack = [...state.redoStack];
      const entry = redoStack.pop();
      if (!entry) return state;

      return {
        ...state,
        undoStack: [...state.undoStack, entry],
        redoStack,
      };
    }

    case 'CLEAR_HISTORY':
      return {
        ...state,
        undoStack: [],
        redoStack: [],
      };

    case 'SET_CURRENT_PATCH':
      // Clear history when switching patches
      if (action.patchId !== state.currentPatchId) {
        return {
          undoStack: [],
          redoStack: [],
          currentPatchId: action.patchId,
        };
      }
      return state;

    default:
      return state;
  }
}

// Context
const HistoryContext = createContext<HistoryContextValue | null>(null);

// Provider props
interface HistoryProviderProps {
  children: ReactNode;
}

// Provider component
export function HistoryProvider({ children }: HistoryProviderProps) {
  const [state, dispatch] = useReducer(historyReducer, initialState);

  // Push a new change
  const pushChange = useCallback((entry: Omit<HistoryEntry, 'timestamp'>) => {
    dispatch({
      type: 'PUSH_CHANGE',
      entry: { ...entry, timestamp: Date.now() },
    });
  }, []);

  // Undo the last change
  const undo = useCallback((): HistoryEntry | null => {
    if (state.undoStack.length === 0) return null;
    const entry = state.undoStack[state.undoStack.length - 1];
    dispatch({ type: 'UNDO' });
    return entry ?? null;
  }, [state.undoStack]);

  // Redo the last undone change
  const redo = useCallback((): HistoryEntry | null => {
    if (state.redoStack.length === 0) return null;
    const entry = state.redoStack[state.redoStack.length - 1];
    dispatch({ type: 'REDO' });
    return entry ?? null;
  }, [state.redoStack]);

  // Clear all history
  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  // Set current patch
  const setCurrentPatch = useCallback((patchId: number | null) => {
    dispatch({ type: 'SET_CURRENT_PATCH', patchId });
  }, []);

  const actions: HistoryActions = useMemo(
    () => ({
      pushChange,
      undo,
      redo,
      clearHistory,
      setCurrentPatch,
    }),
    [pushChange, undo, redo, clearHistory, setCurrentPatch]
  );

  // Derived state
  const hasUnsavedChanges = state.undoStack.length > 0;
  const canUndo = state.undoStack.length > 0;
  const canRedo = state.redoStack.length > 0;

  const value = useMemo(
    () => ({ state, actions, hasUnsavedChanges, canUndo, canRedo }),
    [state, actions, hasUnsavedChanges, canUndo, canRedo]
  );

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

// Hook
// eslint-disable-next-line react-refresh/only-export-components
export function useHistory(): HistoryContextValue {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
