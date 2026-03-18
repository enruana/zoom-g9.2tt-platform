import { createContext, useContext, useReducer, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Patch } from '../types/patch';
import { isPerChannelModule } from '../types/patch';

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
  /** Switch PreAmp channel A/B for current patch */
  switchChannel: (targetChannel: 'A' | 'B') => void;
  /** Set effect chain configuration (ampChain + wahPosition) */
  setEffectChain: (ampChain: number, wahPosition: number) => void;
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
  | { type: 'SWITCH_CHANNEL'; targetChannel: 'A' | 'B' }
  | { type: 'SET_REMOTE_STATE'; patches: Patch[]; selectedPatchId: number }
  | { type: 'SET_EFFECT_CHAIN'; ampChain: number; wahPosition: number };

// Migrate legacy patches that lack ampSel/channelB fields
function migratePatch(patch: Patch): Patch {
  let needsMigration = !patch.ampSel || !patch.channelB;

  // Migrate amp params: add chain bit (default PRE=0) if missing
  const ampParams = patch.modules.amp.params;
  if (ampParams.length < 4) {
    needsMigration = true;
  }

  if (!needsMigration) return patch;

  const migratedAmpParams = ampParams.length < 4
    ? [...ampParams, ...Array(4 - ampParams.length).fill(0)]
    : ampParams;

  const baseChannelB = patch.channelB ?? {
    znr: { enabled: false, type: 0, params: [0] },
    ext: { enabled: false, type: 0, params: [0, 0, 0] },
    amp: { enabled: false, type: 0, params: [0, 0, 0] },
    eq: { enabled: false, type: 0, params: [16, 16, 16, 16, 16, 16] },
  };

  return {
    ...patch,
    ampSel: patch.ampSel ?? 'A',
    channelB: {
      ...baseChannelB,
      // Ensure ext exists even if channelB was saved before ext was added
      ext: baseChannelB.ext ?? { enabled: false, type: 0, params: [0, 0, 0] },
    },
    modules: {
      ...patch.modules,
      amp: { ...patch.modules.amp, params: migratedAmpParams },
    },
  };
}

// Load patches from localStorage
function loadPatchesFromStorage(): Patch[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(migratePatch);
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
        patches: action.patches.map(migratePatch),
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

        // Per-channel modules (znr/amp/eq): route to channelB when ampSel='B'
        if (isPerChannelModule(moduleKey) && (patch.ampSel ?? 'A') === 'B') {
          const mod = patch.channelB[moduleKey];
          if (!mod) return patch;
          const newParams = [...mod.params];
          newParams[action.paramIndex] = action.value;
          return {
            ...patch,
            channelB: {
              ...patch.channelB,
              [moduleKey]: { ...mod, params: newParams },
            },
          };
        }

        const module = patch.modules[moduleKey];
        if (!module) return patch;

        const newParams = [...module.params];
        newParams[action.paramIndex] = action.value;

        return {
          ...patch,
          modules: {
            ...patch.modules,
            [moduleKey]: { ...module, params: newParams },
          },
        };
      });

      return { ...state, patches: newPatches };
    }

    case 'UPDATE_MODULE_TYPE': {
      if (state.selectedPatchId === null) return state;

      const newPatches = state.patches.map((patch) => {
        if (patch.id !== state.selectedPatchId) return patch;

        const moduleKey = action.moduleKey as keyof typeof patch.modules;

        if (isPerChannelModule(moduleKey) && (patch.ampSel ?? 'A') === 'B') {
          const mod = patch.channelB[moduleKey];
          if (!mod) return patch;
          return {
            ...patch,
            channelB: {
              ...patch.channelB,
              [moduleKey]: { ...mod, type: action.typeId },
            },
          };
        }

        const module = patch.modules[moduleKey];
        if (!module) return patch;

        return {
          ...patch,
          modules: {
            ...patch.modules,
            [moduleKey]: { ...module, type: action.typeId },
          },
        };
      });

      return { ...state, patches: newPatches };
    }

    case 'TOGGLE_MODULE_ENABLED': {
      if (state.selectedPatchId === null) return state;

      const newPatches = state.patches.map((patch) => {
        if (patch.id !== state.selectedPatchId) return patch;

        const moduleKey = action.moduleKey as keyof typeof patch.modules;

        if (isPerChannelModule(moduleKey) && (patch.ampSel ?? 'A') === 'B') {
          const mod = patch.channelB[moduleKey];
          if (!mod) return patch;
          return {
            ...patch,
            channelB: {
              ...patch.channelB,
              [moduleKey]: { ...mod, enabled: !mod.enabled },
            },
          };
        }

        const module = patch.modules[moduleKey];
        if (!module) return patch;

        return {
          ...patch,
          modules: {
            ...patch.modules,
            [moduleKey]: { ...module, enabled: !module.enabled },
          },
        };
      });

      return { ...state, patches: newPatches };
    }

    case 'SET_MODULE_ENABLED': {
      if (state.selectedPatchId === null) return state;

      const newPatches = state.patches.map((patch) => {
        if (patch.id !== state.selectedPatchId) return patch;

        const moduleKey = action.moduleKey as keyof typeof patch.modules;

        if (isPerChannelModule(moduleKey) && (patch.ampSel ?? 'A') === 'B') {
          const mod = patch.channelB[moduleKey];
          if (!mod) return patch;
          return {
            ...patch,
            channelB: {
              ...patch.channelB,
              [moduleKey]: { ...mod, enabled: action.enabled },
            },
          };
        }

        const module = patch.modules[moduleKey];
        if (!module) return patch;

        return {
          ...patch,
          modules: {
            ...patch.modules,
            [moduleKey]: { ...module, enabled: action.enabled },
          },
        };
      });

      return { ...state, patches: newPatches };
    }

    case 'DUPLICATE_PATCH': {
      const sourcePatch = state.patches.find(p => p.id === action.sourceId);
      if (!sourcePatch) return state;

      // Create a deep copy of the source patch with the new ID
      const sourceChannelB = sourcePatch.channelB ?? {
        znr: { enabled: false, type: 0, params: [0] },
        ext: { enabled: false, type: 0, params: [0, 0, 0] },
        amp: { enabled: false, type: 0, params: [0, 0, 0] },
        eq: { enabled: false, type: 0, params: [16, 16, 16, 16, 16, 16] },
      };
      const duplicatedPatch: Patch = {
        ...sourcePatch,
        id: action.destinationId,
        ampSel: sourcePatch.ampSel ?? 'A',
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
        channelB: {
          znr: { ...sourceChannelB.znr, params: [...sourceChannelB.znr.params] },
          ext: { ...sourceChannelB.ext, params: [...sourceChannelB.ext.params] },
          amp: { ...sourceChannelB.amp, params: [...sourceChannelB.amp.params] },
          eq: { ...sourceChannelB.eq, params: [...sourceChannelB.eq.params] },
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

    case 'SWITCH_CHANNEL': {
      if (state.selectedPatchId === null) return state;

      const newPatches = state.patches.map((patch) => {
        if (patch.id !== state.selectedPatchId) return patch;
        if ((patch.ampSel ?? 'A') === action.targetChannel) return patch;
        return { ...patch, ampSel: action.targetChannel };
      });

      return { ...state, patches: newPatches };
    }

    case 'SET_EFFECT_CHAIN': {
      if (state.selectedPatchId === null) return state;

      const newPatches = state.patches.map((patch) => {
        if (patch.id !== state.selectedPatchId) return patch;

        // Chain bit always goes to Channel A amp.params[3]
        const ampParams = [...patch.modules.amp.params];
        // Ensure params array is long enough
        while (ampParams.length < 4) ampParams.push(0);
        ampParams[3] = action.ampChain;

        // WAH position goes to wah.params[0]
        const wahParams = [...patch.modules.wah.params];
        if (wahParams.length === 0) wahParams.push(0);
        wahParams[0] = action.wahPosition;

        return {
          ...patch,
          modules: {
            ...patch.modules,
            amp: { ...patch.modules.amp, params: ampParams },
            wah: { ...patch.modules.wah, params: wahParams },
          },
        };
      });

      return { ...state, patches: newPatches };
    }

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
      switchChannel: (targetChannel: 'A' | 'B') => dispatch({ type: 'SWITCH_CHANNEL', targetChannel }),
      setEffectChain: (ampChain: number, wahPosition: number) =>
        dispatch({ type: 'SET_EFFECT_CHAIN', ampChain, wahPosition }),
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
