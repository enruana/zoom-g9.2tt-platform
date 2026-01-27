/** Sync status states */
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

/** Sync state */
export interface SyncState {
  /** Current sync status */
  status: SyncStatus;
  /** Last successful sync timestamp */
  lastSyncedAt: number | null;
  /** Error message if status is 'error' */
  error: string | null;
  /** Whether there are local changes not synced to cloud */
  hasPendingChanges: boolean;
}

/** Sync actions */
export interface SyncActions {
  /** Manually trigger a sync */
  sync: () => Promise<void>;
  /** Save a patch to cloud (called after device save) */
  savePatchToCloud: (patchId: number) => Promise<void>;
  /** Save all patches to cloud */
  saveAllPatchesToCloud: () => Promise<void>;
  /** Clear sync error */
  clearError: () => void;
}

/** Combined sync context value */
export interface SyncContextValue {
  state: SyncState;
  actions: SyncActions;
}
