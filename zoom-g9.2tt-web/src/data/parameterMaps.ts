/**
 * Parameter definitions for all G9.2tt modules
 * Based on PARAMETER_MAP.md and G9ED.efx.xml
 */

import type { ModuleName } from '../types/patch';

/** Parameter definition */
export interface ParameterDef {
  id: number;
  name: string;
  shortName?: string;
  min: number;
  max: number;
  unit?: string;
  /** For parameters with discrete named values */
  values?: string[];
  /** Default/initial value */
  defaultValue?: number;
}

/** Module parameter map by effect type */
export interface ModuleParameterMap {
  /** Common parameters for all types (usually On/Off and Type) */
  common: ParameterDef[];
  /** Type-specific parameters (keyed by type ID) */
  byType: Record<number, ParameterDef[]>;
  /** Default parameters (used when type-specific not defined) */
  default: ParameterDef[];
}

// ============================================================================
// COMP (Compressor) - 3 types
// ============================================================================

export const COMP_PARAMS: ModuleParameterMap = {
  common: [
    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },
    { id: 1, name: 'Type', shortName: 'TYPE', min: 0, max: 2 },
  ],
  byType: {
    // Compressor
    0: [
      { id: 2, name: 'Sense', shortName: 'SENS', min: 0, max: 50 },
      { id: 3, name: 'Attack', shortName: 'ATK', min: 0, max: 9 },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49 },
    ],
    // RackComp
    1: [
      { id: 2, name: 'Threshold', shortName: 'THRS', min: 0, max: 50 },
      { id: 3, name: 'Ratio', shortName: 'RATIO', min: 0, max: 9 },
      { id: 4, name: 'Attack', shortName: 'ATK', min: 0, max: 10 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49 },
    ],
    // Limiter
    2: [
      { id: 2, name: 'Threshold', shortName: 'THRS', min: 0, max: 50 },
      { id: 3, name: 'Ratio', shortName: 'RATIO', min: 0, max: 9 },
      { id: 4, name: 'Release', shortName: 'REL', min: 0, max: 10 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49 },
    ],
  },
  default: [
    { id: 2, name: 'Param 1', shortName: 'P1', min: 0, max: 50 },
    { id: 3, name: 'Param 2', shortName: 'P2', min: 0, max: 9 },
    { id: 4, name: 'Param 3', shortName: 'P3', min: 0, max: 10 },
    { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49 },
  ],
};

// ============================================================================
// WAH (Wah/EFX1) - 17 types
// ============================================================================

export const WAH_PARAMS: ModuleParameterMap = {
  common: [
    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },
    { id: 1, name: 'Type', shortName: 'TYPE', min: 0, max: 16 },
  ],
  byType: {
    // AutoWah (0)
    0: [
      { id: 2, name: 'Position', shortName: 'POS', min: 0, max: 100 },
      { id: 3, name: 'Sense', shortName: 'SENS', min: 0, max: 50 },
      { id: 4, name: 'Resonance', shortName: 'RESO', min: 0, max: 10 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49 },
    ],
    // Booster (2)
    2: [
      { id: 2, name: 'Range', shortName: 'RANG', min: 0, max: 100 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 50 },
      { id: 4, name: 'Gain', shortName: 'GAIN', min: 0, max: 100 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49 },
    ],
    // Tremolo (3)
    3: [
      { id: 2, name: 'Rate', shortName: 'RATE', min: 0, max: 50 },
      { id: 3, name: 'Depth', shortName: 'DPTH', min: 0, max: 100 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 100 },
      { id: 5, name: 'Tone', shortName: 'TONE', min: 0, max: 10 },
    ],
    // Phaser (4)
    4: [
      { id: 2, name: 'Rate', shortName: 'RATE', min: 0, max: 50 },
      { id: 3, name: 'Depth', shortName: 'DPTH', min: 0, max: 100 },
      { id: 4, name: 'Resonance', shortName: 'RESO', min: 0, max: 10 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49 },
    ],
  },
  default: [
    { id: 2, name: 'Param 1', shortName: 'P1', min: 0, max: 100 },
    { id: 3, name: 'Param 2', shortName: 'P2', min: 0, max: 50 },
    { id: 4, name: 'Param 3', shortName: 'P3', min: 0, max: 10 },
    { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49 },
  ],
};

// ============================================================================
// EXT (External Loop) - 1 type
// ============================================================================

export const EXT_PARAMS: ModuleParameterMap = {
  common: [
    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },
  ],
  byType: {},
  default: [
    { id: 2, name: 'Send', shortName: 'SEND', min: 0, max: 100, defaultValue: 80 },
    { id: 3, name: 'Return', shortName: 'RTN', min: 0, max: 100, defaultValue: 80 },
    { id: 4, name: 'Dry', shortName: 'DRY', min: 0, max: 100, defaultValue: 0 },
  ],
};

// ============================================================================
// ZNR (Noise Reduction) - 3 types
// ============================================================================

export const ZNR_PARAMS: ModuleParameterMap = {
  common: [
    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },
    { id: 1, name: 'Type', shortName: 'TYPE', min: 0, max: 2 },
  ],
  byType: {},
  default: [
    { id: 2, name: 'Threshold', shortName: 'THRS', min: 0, max: 15, defaultValue: 9 },
  ],
};

// ============================================================================
// AMP (Amplifier) - 44 types
// ============================================================================

export const AMP_PARAMS: ModuleParameterMap = {
  common: [
    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },
    { id: 1, name: 'Type', shortName: 'TYPE', min: 0, max: 43 },
  ],
  byType: {},
  default: [
    { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100 },
    { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30 },
    { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99 },
  ],
};

// ============================================================================
// EQ (6-Band Equalizer) - no types
// ============================================================================

export const EQ_PARAMS: ModuleParameterMap = {
  common: [
    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },
  ],
  byType: {},
  default: [
    { id: 2, name: 'Low', shortName: 'LOW', min: 0, max: 31, defaultValue: 16, unit: 'dB' },
    { id: 3, name: 'Low Mid', shortName: 'LMID', min: 0, max: 31, defaultValue: 16, unit: 'dB' },
    { id: 4, name: 'Mid', shortName: 'MID', min: 0, max: 31, defaultValue: 16, unit: 'dB' },
    { id: 5, name: 'High Mid', shortName: 'HMID', min: 0, max: 31, defaultValue: 16, unit: 'dB' },
    { id: 6, name: 'High', shortName: 'HIGH', min: 0, max: 31, defaultValue: 16, unit: 'dB' },
    { id: 7, name: 'Presence', shortName: 'PRES', min: 0, max: 31, defaultValue: 16, unit: 'dB' },
  ],
};

// ============================================================================
// CAB (Cabinet Simulator) - no types
// ============================================================================

export const CAB_PARAMS: ModuleParameterMap = {
  common: [
    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },
  ],
  byType: {},
  default: [
    { id: 2, name: 'Depth', shortName: 'DPTH', min: 0, max: 1, values: ['Small', 'Middle'] },
    { id: 3, name: 'Mic Type', shortName: 'MIC', min: 0, max: 2, values: ['Dynamic', 'Condenser', 'Ribbon'] },
    { id: 4, name: 'Mic Position', shortName: 'POS', min: 0, max: 3 },
  ],
};

// ============================================================================
// MOD (Modulation/EFX2) - 28 types
// ============================================================================

export const MOD_PARAMS: ModuleParameterMap = {
  common: [
    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },
    { id: 1, name: 'Type', shortName: 'TYPE', min: 0, max: 27 },
  ],
  byType: {
    // Chorus (0)
    0: [
      { id: 2, name: 'Depth', shortName: 'DPTH', min: 0, max: 100 },
      { id: 3, name: 'Rate', shortName: 'RATE', min: 0, max: 50 },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50 },
    ],
    // Flanger (4)
    4: [
      { id: 2, name: 'Depth', shortName: 'DPTH', min: 0, max: 100 },
      { id: 3, name: 'Rate', shortName: 'RATE', min: 0, max: 50 },
      { id: 4, name: 'Resonance', shortName: 'RESO', min: 0, max: 10 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50 },
    ],
    // PitchShifter (5)
    5: [
      { id: 2, name: 'Shift', shortName: 'SHFT', min: 0, max: 48, unit: 'st' },
      { id: 3, name: 'Fine', shortName: 'FINE', min: 0, max: 50, unit: 'ct' },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10 },
      { id: 5, name: 'Balance', shortName: 'BAL', min: 0, max: 50 },
    ],
    // Delay (9)
    9: [
      { id: 2, name: 'Time', shortName: 'TIME', min: 0, max: 2000, unit: 'ms' },
      { id: 3, name: 'Feedback', shortName: 'FDBK', min: 0, max: 50 },
      { id: 4, name: 'Hi Damp', shortName: 'HIDP', min: 0, max: 10 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50 },
    ],
  },
  default: [
    { id: 2, name: 'Param 1', shortName: 'P1', min: 0, max: 100 },
    { id: 3, name: 'Param 2', shortName: 'P2', min: 0, max: 50 },
    { id: 4, name: 'Param 3', shortName: 'P3', min: 0, max: 10 },
    { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50 },
  ],
};

// ============================================================================
// DLY (Delay) - 7 types
// ============================================================================

export const DLY_PARAMS: ModuleParameterMap = {
  common: [
    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },
    { id: 1, name: 'Type', shortName: 'TYPE', min: 0, max: 6 },
  ],
  byType: {},
  default: [
    { id: 2, name: 'Time', shortName: 'TIME', min: 0, max: 5022, unit: 'ms' },
    { id: 3, name: 'Feedback', shortName: 'FDBK', min: 0, max: 50 },
    { id: 4, name: 'Hi Damp', shortName: 'HIDP', min: 0, max: 10 },
    { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50 },
  ],
};

// ============================================================================
// REV (Reverb) - 15 types
// ============================================================================

export const REV_PARAMS: ModuleParameterMap = {
  common: [
    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },
    { id: 1, name: 'Type', shortName: 'TYPE', min: 0, max: 14 },
  ],
  byType: {},
  default: [
    { id: 2, name: 'Decay', shortName: 'DCAY', min: 0, max: 29 },
    { id: 3, name: 'Pre Delay', shortName: 'PDLY', min: 0, max: 99, unit: 'ms' },
    { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10 },
    { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50 },
  ],
};

// ============================================================================
// Module parameter map registry
// ============================================================================

export const MODULE_PARAMS: Record<ModuleName, ModuleParameterMap> = {
  comp: COMP_PARAMS,
  wah: WAH_PARAMS,
  ext: EXT_PARAMS,
  znr: ZNR_PARAMS,
  amp: AMP_PARAMS,
  eq: EQ_PARAMS,
  cab: CAB_PARAMS,
  mod: MOD_PARAMS,
  dly: DLY_PARAMS,
  rev: REV_PARAMS,
};

/**
 * Get all parameters for a module and effect type
 */
export function getModuleParameters(module: ModuleName, typeId: number): ParameterDef[] {
  const paramMap = MODULE_PARAMS[module];
  const typeParams = paramMap.byType[typeId] ?? paramMap.default;

  // For modules without a type selector, skip the type parameter
  const commonParams = paramMap.common.filter(p => {
    // Only include Type parameter if module has multiple types
    if (p.name === 'Type') {
      return Object.keys(paramMap.byType).length > 0 ||
             (module !== 'ext' && module !== 'eq' && module !== 'cab');
    }
    return true;
  });

  return [...commonParams, ...typeParams];
}

/**
 * Get editable parameters (excluding On/Off and Type which are handled separately)
 */
export function getEditableParameters(module: ModuleName, typeId: number): ParameterDef[] {
  const paramMap = MODULE_PARAMS[module];
  const typeParams = paramMap.byType[typeId] ?? paramMap.default;
  return typeParams;
}

/**
 * Format a parameter value for display
 */
export function formatParameterValue(param: ParameterDef, value: number): string {
  // Handle discrete value parameters
  if (param.values && param.values[value]) {
    return param.values[value];
  }

  // Handle EQ values (16 = 0dB, <16 = cut, >16 = boost)
  if (param.unit === 'dB' && param.max === 31) {
    const db = value - 16;
    return db === 0 ? '0' : (db > 0 ? `+${db}` : `${db}`);
  }

  // Handle standard values with units
  if (param.unit) {
    return `${value}${param.unit}`;
  }

  return String(value);
}
