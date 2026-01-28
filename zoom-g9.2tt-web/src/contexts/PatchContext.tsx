import { createContext, useContext, useReducer, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Patch } from '../types/patch';

const STORAGE_KEY = 'g9tt_patches';

/** Patch context state */
export interface PatchState {
  /** All 100 patches */
  patches: Patch[];
  /** Currently selected patch ID (0-99) or null */
  selectedPatchId: number | null;
  /** Whether patches are being loaded */
  isLoading: boolean;
  /** Loading progress (0-100) when reading all patches */
  loadingProgress: number;
  /** Error message if loading failed */
  error: string | null;
}

/** Patch context actions */
export interface PatchActions {
  /** Set all patches */
  setPatches: (patches: Patch[]) => void;
  /** Select a patch by ID */
  selectPatch: (id: number | null) => void;
  /** Update the current patch (for editing) */
  updateCurrentPatch: (patch: Patch) => void;
  /** Update a specific parameter in current patch */
  updateParameter: (moduleKey: string, paramIndex: number, value: number) => void;
  /** Update a module's effect type in current patch */
  updateModuleType: (moduleKey: string, typeId: number) => void;
  /** Toggle a module's enabled state */
  toggleModuleEnabled: (moduleKey: string) => void;
  /** Set a module's enabled state to a specific value */
  setModuleEnabled: (moduleKey: string, enabled: boolean) => void;
  /** Duplicate a patch to another slot */
  duplicatePatch: (sourceId: number, destinationId: number) => void;
  /** Rename a patch */
  renamePatch: (patchId: number, newName: string) => void;
  /** Set loading state */
  setLoading: (isLoading: boolean, progress?: number) => void;
  /** Set error state */
  setError: (error: string | null) => void;
  /** Clear all patches */
  clearPatches: () => void;
  /** Set remote state from server (for client mode) */
  setRemoteState: (patches: Patch[], selectedPatchId: number) => void;
}

/** Combined context value */
export interface PatchContextValue {
  state: PatchState;
  /** Currently selected patch (derived from state) */
  currentPatch: Patch | null;
  actions: PatchActions;
}

// Action types
type PatchAction =
  | { type: 'SET_PATCHES'; patches: Patch[] }
  | { type: 'SELECT_PATCH'; id: number | null }
  | { type: 'UPDATE_PATCH'; patch: Patch }
  | { type: 'UPDATE_PARAMETER'; moduleKey: string; paramIndex: number; value: number }
  | { type: 'UPDATE_MODULE_TYPE'; moduleKey: string; typeId: number }
  | { type: 'TOGGLE_MODULE_ENABLED'; moduleKey: string }
  | { type: 'SET_MODULE_ENABLED'; moduleKey: string; enabled: boolean }
  | { type: 'DUPLICATE_PATCH'; sourceId: number; destinationId: number }
  | { type: 'RENAME_PATCH'; patchId: number; newName: string }
  | { type: 'SET_LOADING'; isLoading: boolean; progress: number }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'CLEAR_PATCHES' }
  | { type: 'SET_REMOTE_STATE'; patches: Patch[]; selectedPatchId: number };

// Load patches from localStorage
function loadPatchesFromStorage(): Patch[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[PatchContext] Failed to load patches from localStorage:', e);
  }
  return [];
}

// Save patches to localStorage
function savePatchesToStorage(patches: Patch[]): void {
  try {
    if (patches.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patches));
    }
  } catch (e) {
    console.warn('[PatchContext] Failed to save patches to localStorage:', e);
  }
}

// Initial state - load from localStorage if available
const storedPatches = loadPatchesFromStorage();
const initialState: PatchState = {
  patches: storedPatches,
  selectedPatchId: storedPatches.length > 0 ? 0 : null,
  isLoading: false,
  loadingProgress: 0,
  error: null,
};

// Reducer
function patchReducer(state: PatchState, action: PatchAction): PatchState {
  switch (action.type) {
    case 'SET_PATCHES':
      return {
        ...state,
        patches: action.patches,
        isLoading: false,
        error: null,
      };

    case 'SELECT_PATCH':
      return {
        ...state,
        selectedPatchId: action.id,
      };

    case 'UPDATE_PATCH': {
      const newPatches = state.patches.map((p) =>
        p.id === action.patch.id ? action.patch : p
      );
      return {
        ...state,
        patches: newPatches,
      };
    }

    case 'UPDATE_PARAMETER': {
      if (state.selectedPatchId === null) return state;

      const newPatches = state.patches.map((patch) => {
        if (patch.id !== state.selectedPatchId) return patch;

        const moduleKey = action.moduleKey as keyof typeof patch.modules;
        const module = patch.modules[moduleKey];
        if (!module) return patch;

        const newParams = [...module.params];
        newParams[action.paramIndex] = action.value;

        return {
          ...patch,
          modules: {
            ...patch.modules,
            [moduleKey]: {
              ...module,
              params: newParams,
            },
          },
        };
      });

      return {
        ...state,
        patches: newPatches,
      };
    }

    case 'UPDATE_MODULE_TYPE': {
      if (state.selectedPatchId === null) return state;

      const newPatches = state.patches.map((patch) => {
        if (patch.id !== state.selectedPatchId) return patch;

        const moduleKey = action.moduleKey as keyof typeof patch.modules;
        const module = patch.modules[moduleKey];
        if (!module) return patch;

        return {
          ...patch,
          modules: {
            ...patch.modules,
            [moduleKey]: {
              ...module,
              type: action.typeId,
            },
          },
        };
      });

      return {
        ...state,
        patches: newPatches,
      };
    }

    case 'TOGGLE_MODULE_ENABLED': {
      if (state.selectedPatchId === null) return state;

      const newPatches = state.patches.map((patch) => {
        if (patch.id !== state.selectedPatchId) return patch;

        const moduleKey = action.moduleKey as keyof typeof patch.modules;
        const module = patch.modules[moduleKey];
        if (!module) return patch;

        return {
          ...patch,
          modules: {
            ...patch.modules,
            [moduleKey]: {
              ...module,
              enabled: !module.enabled,
            },
          },
        };
      });

      return {
        ...state,
        patches: newPatches,
      };
    }

    case 'SET_MODULE_ENABLED': {
      if (state.selectedPatchId === null) return state;

      const newPatches = state.patches.map((patch) => {
        if (patch.id !== state.selectedPatchId) return patch;

        const moduleKey = action.moduleKey as keyof typeof patch.modules;
        const module = patch.modules[moduleKey];
        if (!module) return patch;

        return {
          ...patch,
          modules: {
            ...patch.modules,
            [moduleKey]: {
              ...module,
              enabled: action.enabled,
            },
          },
        };
      });

      return {
        ...state,
        patches: newPatches,
      };
    }

    case 'DUPLICATE_PATCH': {
      const sourcePatch = state.patches.find(p => p.id === action.sourceId);
      if (!sourcePatch) return state;

      // Create a deep copy of the source patch with the new ID
      const duplicatedPatch: Patch = {
        ...sourcePatch,
        id: action.destinationId,
        // Deep copy modules
        modules: {
          amp: { ...sourcePatch.modules.amp, params: [...sourcePatch.modules.amp.params] },
          comp: { ...sourcePatch.modules.comp, params: [...sourcePatch.modules.comp.params] },
          wah: { ...sourcePatch.modules.wah, params: [...sourcePatch.modules.wah.params] },
          ext: { ...sourcePatch.modules.ext, params: [...sourcePatch.modules.ext.params] },
          znr: { ...sourcePatch.modules.znr, params: [...sourcePatch.modules.znr.params] },
          eq: { ...sourcePatch.modules.eq, params: [...sourcePatch.modules.eq.params] },
          cab: { ...sourcePatch.modules.cab, params: [...sourcePatch.modules.cab.params] },
          mod: { ...sourcePatch.modules.mod, params: [...sourcePatch.modules.mod.params] },
          dly: { ...sourcePatch.modules.dly, params: [...sourcePatch.modules.dly.params] },
          rev: { ...sourcePatch.modules.rev, params: [...sourcePatch.modules.rev.params] },
        },
      };

      // Replace the destination patch in the array
      const newPatches = state.patches.map(p =>
        p.id === action.destinationId ? duplicatedPatch : p
      );

      return {
        ...state,
        patches: newPatches,
      };
    }

    case 'RENAME_PATCH': {
      const newPatches = state.patches.map(p =>
        p.id === action.patchId ? { ...p, name: action.newName } : p
      );

      return {
        ...state,
        patches: newPatches,
      };
    }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading,
        loadingProgress: action.progress,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        isLoading: false,
      };

    case 'CLEAR_PATCHES':
      return initialState;

    case 'SET_REMOTE_STATE':
      return {
        ...state,
        patches: action.patches,
        selectedPatchId: action.selectedPatchId,
        isLoading: false,
        error: null,
      };

    default:
      return state;
  }
}

// Context
const PatchContext = createContext<PatchContextValue | null>(null);

// Provider props
interface PatchProviderProps {
  children: ReactNode;
}

// Provider component
export function PatchProvider({ children }: PatchProviderProps) {
  const [state, dispatch] = useReducer(patchReducer, initialState);

  // Persist patches to localStorage whenever they change
  useEffect(() => {
    if (state.patches.length > 0) {
      savePatchesToStorage(state.patches);
    }
  }, [state.patches]);

  // Derive currentPatch from state
  const currentPatch = useMemo(() => {
    if (state.selectedPatchId === null) return null;
    return state.patches.find((p) => p.id === state.selectedPatchId) ?? null;
  }, [state.selectedPatchId, state.patches]);

  const actions: PatchActions = useMemo(
    () => ({
      setPatches: (patches: Patch[]) => dispatch({ type: 'SET_PATCHES', patches }),
      selectPatch: (id: number | null) => dispatch({ type: 'SELECT_PATCH', id }),
      updateCurrentPatch: (patch: Patch) => dispatch({ type: 'UPDATE_PATCH', patch }),
      updateParameter: (moduleKey: string, paramIndex: number, value: number) =>
        dispatch({ type: 'UPDATE_PARAMETER', moduleKey, paramIndex, value }),
      updateModuleType: (moduleKey: string, typeId: number) =>
        dispatch({ type: 'UPDATE_MODULE_TYPE', moduleKey, typeId }),
      toggleModuleEnabled: (moduleKey: string) =>
        dispatch({ type: 'TOGGLE_MODULE_ENABLED', moduleKey }),
      setModuleEnabled: (moduleKey: string, enabled: boolean) =>
        dispatch({ type: 'SET_MODULE_ENABLED', moduleKey, enabled }),
      duplicatePatch: (sourceId: number, destinationId: number) =>
        dispatch({ type: 'DUPLICATE_PATCH', sourceId, destinationId }),
      renamePatch: (patchId: number, newName: string) =>
        dispatch({ type: 'RENAME_PATCH', patchId, newName }),
      setLoading: (isLoading: boolean, progress: number = 0) =>
        dispatch({ type: 'SET_LOADING', isLoading, progress }),
      setError: (error: string | null) => dispatch({ type: 'SET_ERROR', error }),
      clearPatches: () => dispatch({ type: 'CLEAR_PATCHES' }),
      setRemoteState: (patches: Patch[], selectedPatchId: number) =>
        dispatch({ type: 'SET_REMOTE_STATE', patches, selectedPatchId }),
    }),
    []
  );

  const value = useMemo(
    () => ({ state, currentPatch, actions }),
    [state, currentPatch, actions]
  );

  return <PatchContext.Provider value={value}>{children}</PatchContext.Provider>;
}

// Hook
// eslint-disable-next-line react-refresh/only-export-components
export function usePatch(): PatchContextValue {
  const context = useContext(PatchContext);
  if (!context) {
    throw new Error('usePatch must be used within a PatchProvider');
  }
  return context;
}
