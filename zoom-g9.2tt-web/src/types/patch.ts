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

/** Channel B data (always stored at direct offsets 0x24-0x3B) */
export interface ChannelBData {
  znr: ModuleState;
  ext: ModuleState;
  amp: ModuleState;
  eq: ModuleState;
}

/** A single patch (preset) */
export interface Patch {
  /** Patch number (0-99) */
  id: number;
  /** Patch name (10 characters max) */
  name: string;
  /** Patch level (0-100) */
  level: number;
  /** All effect modules (ZNR/AMP/EQ always Channel A) */
  modules: PatchModules;
  /** Active PreAmp channel: A or B */
  ampSel: 'A' | 'B';
  /** Channel B's ZNR/AMP/EQ data (always Channel B) */
  channelB: ChannelBData;
}

/** Per-channel module keys (ZNR, AMP, EQ have separate A/B data) */
const PER_CHANNEL_MODULES = new Set<ModuleName>(['znr', 'ext', 'amp', 'eq']);

/** Check if a module key is per-channel (has A/B variants) */
export function isPerChannelModule(key: string): key is 'znr' | 'ext' | 'amp' | 'eq' {
  return PER_CHANNEL_MODULES.has(key as ModuleName);
}

/**
 * Get the "effective" modules for display, based on ampSel.
 * modules always stores Channel A data; channelB always stores Channel B data.
 * This helper returns modules with znr/ext/amp/eq swapped from channelB when ampSel='B'.
 */
export function getEffectiveModules(patch: Patch): PatchModules {
  if ((patch.ampSel ?? 'A') !== 'B') return patch.modules;
  return {
    ...patch.modules,
    znr: patch.channelB.znr,
    ext: patch.channelB.ext,
    amp: patch.channelB.amp,
    eq: patch.channelB.eq,
  };
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
