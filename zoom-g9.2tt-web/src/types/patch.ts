/** Module names for the G9.2tt */
export type ModuleName = 'amp' | 'comp' | 'wah' | 'ext' | 'znr' | 'eq' | 'cab' | 'mod' | 'dly' | 'rev';

/** State of a single effect module */
export interface ModuleState {
  /** Whether the module is enabled */
  enabled: boolean;
  /** Effect type ID within this module category */
  type: number;
  /** Parameter values (module-specific, varies by type) */
  params: number[];
}

/** All modules in a patch */
export interface PatchModules {
  amp: ModuleState;
  comp: ModuleState;
  wah: ModuleState;
  ext: ModuleState;
  znr: ModuleState;
  eq: ModuleState;
  cab: ModuleState;
  mod: ModuleState;
  dly: ModuleState;
  rev: ModuleState;
}

/** A single patch (preset) */
export interface Patch {
  /** Patch number (0-99) */
  id: number;
  /** Patch name (10 characters max) */
  name: string;
  /** Patch level (0-100) */
  level: number;
  /** All effect modules */
  modules: PatchModules;
}

/** For real-time parameter updates */
export interface ParameterChange {
  patchId: number;
  module: ModuleName;
  paramIndex: number;
  value: number;
  timestamp: number;
}

/** Data source interface - implemented by both real device and demo mode */
export interface DataSource {
  /** Read a single patch */
  readPatch(id: number): Promise<Patch>;
  /** Write a patch to the device/storage */
  writePatch(id: number, patch: Patch): Promise<void>;
  /** Send a real-time parameter change */
  sendParameter(module: ModuleName, paramIndex: number, value: number): void;
  /** Read all patches */
  readAllPatches(): Promise<Patch[]>;
}

/** Patch list item (minimal info for list display) */
export interface PatchListItem {
  id: number;
  name: string;
}
