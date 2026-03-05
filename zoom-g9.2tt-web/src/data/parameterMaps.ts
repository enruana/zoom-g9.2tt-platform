/**
 * Parameter definitions for all G9.2tt modules
 * AUTO-GENERATED from G9ED.efx.xml via tools/generate_parameter_maps.py
 * Source: phases/03-complete-mapping/reference/efx_parsed.json (420 params)
 *
 * DO NOT EDIT MANUALLY - regenerate with: python3 tools/generate_parameter_maps.py
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
  /** Display offset: display = midi_value + offset */
  displayOffset?: number;
  /** Real-time max (for BPM sync params where full range isn't RT-controllable) */
  rtmMax?: number;
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
// COMP (CMP) - 3 types
// ============================================================================

export const COMP_PARAMS: ModuleParameterMap = {
  common: [
    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },
    { id: 1, name: 'Type', shortName: 'TYPE', min: 0, max: 2 },
  ],
  byType: {
    // Compressor (0)
    0: [
      { id: 2, name: 'Sense', shortName: 'SENS', min: 0, max: 10, defaultValue: 6 },
      { id: 3, name: 'Attack', shortName: 'ATK', min: 0, max: 1, values: ['Fast', 'Slow'] },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49, defaultValue: 39, displayOffset: 1 },
    ],
    // RackComp (1)
    1: [
      { id: 2, name: 'Threshold', shortName: 'THRS', min: 0, max: 50, defaultValue: 40 },
      { id: 3, name: 'Ratio', shortName: 'RTIO', min: 0, max: 9, defaultValue: 5, displayOffset: 1 },
      { id: 4, name: 'Attack', shortName: 'ATK', min: 0, max: 9, defaultValue: 6, displayOffset: 1 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49, defaultValue: 39, displayOffset: 1 },
    ],
    // Limiter (2)
    2: [
      { id: 2, name: 'Threshold', shortName: 'THRS', min: 0, max: 50, defaultValue: 10 },
      { id: 3, name: 'Ratio', shortName: 'RTIO', min: 0, max: 9, defaultValue: 6, displayOffset: 1 },
      { id: 4, name: 'Release', shortName: 'REL', min: 0, max: 9, defaultValue: 9, displayOffset: 1 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49, defaultValue: 39, displayOffset: 1 },
    ],
  },
  default: [
      { id: 2, name: 'Sense', shortName: 'SENS', min: 0, max: 10, defaultValue: 6 },
      { id: 3, name: 'Attack', shortName: 'ATK', min: 0, max: 1, values: ['Fast', 'Slow'] },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49, defaultValue: 39, displayOffset: 1 },
  ],
};

// ============================================================================
// WAH (WAH) - 17 types
// ============================================================================

export const WAH_PARAMS: ModuleParameterMap = {
  common: [
    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },
    { id: 1, name: 'Type', shortName: 'TYPE', min: 0, max: 16 },
  ],
  byType: {
    // AutoWah (0)
    0: [
      { id: 2, name: 'Position', shortName: 'POS', min: 0, max: 1 },
      { id: 3, name: 'Sense', shortName: 'SENS', min: 0, max: 19, values: ['-10', '-9', '-8', '-7', '-6', '-5', '-4', '-3', '-2', '-1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], defaultValue: 17 },
      { id: 4, name: 'Resonance', shortName: 'RESO', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49, defaultValue: 39, displayOffset: 1 },
    ],
    // AutoResonance (1)
    1: [
      { id: 2, name: 'Position', shortName: 'POS', min: 0, max: 1 },
      { id: 3, name: 'Sense', shortName: 'SENS', min: 0, max: 19, values: ['-10', '-9', '-8', '-7', '-6', '-5', '-4', '-3', '-2', '-1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], defaultValue: 15 },
      { id: 4, name: 'Resonance', shortName: 'RESO', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49, defaultValue: 39, displayOffset: 1 },
    ],
    // Booster (2)
    2: [
      { id: 2, name: 'Range', shortName: 'RANG', min: 0, max: 4, defaultValue: 2, displayOffset: 1 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 6 },
      { id: 4, name: 'Gain', shortName: 'GAIN', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49, defaultValue: 39, displayOffset: 1 },
    ],
    // Tremolo (3)
    3: [
      { id: 2, name: 'Depth', shortName: 'DPTH', min: 0, max: 50, defaultValue: 20 },
      { id: 3, name: 'Rate', shortName: 'RATE', min: 0, max: 78, defaultValue: 40, rtmMax: 50 },
      { id: 4, name: 'Wave', shortName: 'WAVE', min: 0, max: 29, values: ['UP0', 'UP1', 'UP2', 'UP3', 'UP4', 'UP5', 'UP6', 'UP7', 'UP8', 'UP9', 'DWN0', 'DWN1', 'DWN2', 'DWN3', 'DWN4', 'DWN5', 'DWN6', 'DWN7', 'DWN8', 'DWN9', 'TRI0', 'TRI1', 'TRI2', 'TRI3', 'TRI4', 'TRI5', 'TRI6', 'TRI7', 'TRI8', 'TRI9'], defaultValue: 15 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49, defaultValue: 39, displayOffset: 1 },
    ],
    // Phaser (4)
    4: [
      { id: 2, name: 'Position', shortName: 'POS', min: 0, max: 1 },
      { id: 3, name: 'Rate', shortName: 'RATE', min: 0, max: 78, defaultValue: 15, rtmMax: 50 },
      { id: 4, name: 'Color', shortName: 'COLR', min: 0, max: 3, displayOffset: 1 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49, defaultValue: 39, displayOffset: 1 },
    ],
    // FixedPhaser (5)
    5: [
      { id: 2, name: 'Position', shortName: 'POS', min: 0, max: 1 },
      { id: 3, name: 'Frequency', shortName: 'FREQ', min: 0, max: 49, defaultValue: 15, displayOffset: 1 },
      { id: 4, name: 'Color', shortName: 'COLR', min: 0, max: 3, displayOffset: 1 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49, defaultValue: 39, displayOffset: 1 },
    ],
    // RingModulator (6)
    6: [
      { id: 2, name: 'Position', shortName: 'POS', min: 0, max: 1 },
      { id: 3, name: 'Frequency', shortName: 'FREQ', min: 0, max: 49, defaultValue: 39, displayOffset: 1 },
      { id: 4, name: 'Balance', shortName: 'BAL', min: 0, max: 50, defaultValue: 25 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49, defaultValue: 39, displayOffset: 1 },
    ],
    // SlowAttack (7)
    7: [
      { id: 2, name: 'Position', shortName: 'POS', min: 0, max: 1 },
      { id: 3, name: 'Time', shortName: 'TIME', min: 0, max: 49, defaultValue: 9, displayOffset: 1 },
      { id: 4, name: 'Curve', shortName: 'CURV', min: 0, max: 10, defaultValue: 5 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49, defaultValue: 39, displayOffset: 1 },
    ],
    // PedalVox (8)
    8: [
      { id: 2, name: 'Position', shortName: 'POS', min: 0, max: 1 },
      { id: 3, name: 'Frequency', shortName: 'FREQ', min: 0, max: 49, defaultValue: 14, displayOffset: 1 },
      { id: 4, name: 'DryMix', shortName: 'DRYM', min: 0, max: 10 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49, defaultValue: 34, displayOffset: 1 },
    ],
    // PedalCryBaby (9)
    9: [
      { id: 2, name: 'Position', shortName: 'POS', min: 0, max: 1 },
      { id: 3, name: 'Frequency', shortName: 'FREQ', min: 0, max: 49, defaultValue: 14, displayOffset: 1 },
      { id: 4, name: 'DryMix', shortName: 'DRYM', min: 0, max: 10 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49, defaultValue: 34, displayOffset: 1 },
    ],
    // MultiWah (10)
    10: [
      { id: 2, name: 'Position', shortName: 'POS', min: 0, max: 1 },
      { id: 3, name: 'Frequency', shortName: 'FREQ', min: 0, max: 49, defaultValue: 29, displayOffset: 1 },
      { id: 4, name: 'Curve', shortName: 'CURV', min: 0, max: 9, defaultValue: 4, displayOffset: 1 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49, defaultValue: 39, displayOffset: 1 },
    ],
    // PedalResonanceFilter (11)
    11: [
      { id: 2, name: 'Position', shortName: 'POS', min: 0, max: 1 },
      { id: 3, name: 'Frequency', shortName: 'FREQ', min: 0, max: 49, defaultValue: 29, displayOffset: 1 },
      { id: 4, name: 'Resonance', shortName: 'RESO', min: 0, max: 10, defaultValue: 7 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49, defaultValue: 39, displayOffset: 1 },
    ],
    // Octave (12)
    12: [
      { id: 2, name: 'OctaveLevel', shortName: 'OCTA', min: 0, max: 50, defaultValue: 40 },
      { id: 3, name: 'DryLevel', shortName: 'DRYL', min: 0, max: 50, defaultValue: 40 },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49, defaultValue: 39, displayOffset: 1 },
    ],
    // X-Wah (13)
    13: [
      { id: 2, name: 'Position', shortName: 'POS', min: 0, max: 1 },
      { id: 3, name: 'Frequency', shortName: 'FREQ', min: 0, max: 49, defaultValue: 14, displayOffset: 1 },
      { id: 4, name: 'X-Fade', shortName: 'XFAD', min: 0, max: 50, defaultValue: 25 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49, defaultValue: 34, displayOffset: 1 },
    ],
    // X-Phaser (14)
    14: [
      { id: 2, name: 'Color', shortName: 'COLR', min: 0, max: 7, values: ['1,Before', '2,Before', '3,Before', '4,Before', '1,After', '2,After', '3,After', '4,After'] },
      { id: 3, name: 'Rate', shortName: 'RATE', min: 0, max: 78, defaultValue: 15, rtmMax: 50 },
      { id: 4, name: 'X-Fade', shortName: 'XFAD', min: 0, max: 50, defaultValue: 25 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49, defaultValue: 39, displayOffset: 1 },
    ],
    // X-Vibe (15)
    15: [
      { id: 2, name: 'PHA Rate', shortName: 'PHAR', min: 0, max: 78, defaultValue: 15, rtmMax: 50 },
      { id: 3, name: 'TRM Rate', shortName: 'TRMR', min: 0, max: 78, defaultValue: 15, rtmMax: 50 },
      { id: 4, name: 'X-Fade', shortName: 'XFAD', min: 0, max: 50, defaultValue: 25 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49, defaultValue: 39, displayOffset: 1 },
    ],
    // Z-Oscillator (16)
    16: [
      { id: 2, name: 'Frequency', shortName: 'FREQ', min: 0, max: 62, defaultValue: 62, displayOffset: 33, rtmMax: 60 },
      { id: 3, name: 'Portament', shortName: 'PORT', min: 0, max: 10, defaultValue: 8 },
      { id: 4, name: 'Vibrato', shortName: 'VIBR', min: 0, max: 10 },
      { id: 5, name: 'Balance', shortName: 'BAL', min: 0, max: 50 },
    ],
  },
  default: [
      { id: 2, name: 'Position', shortName: 'POS', min: 0, max: 1 },
      { id: 3, name: 'Sense', shortName: 'SENS', min: 0, max: 19, values: ['-10', '-9', '-8', '-7', '-6', '-5', '-4', '-3', '-2', '-1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], defaultValue: 17 },
      { id: 4, name: 'Resonance', shortName: 'RESO', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Level', shortName: 'LVL', min: 0, max: 49, defaultValue: 39, displayOffset: 1 },
  ],
};

// ============================================================================
// EXT (EXT) - 1 types
// ============================================================================

export const EXT_PARAMS: ModuleParameterMap = {
  common: [
    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },
  ],
  byType: {
    // EXT (0)
    0: [
      { id: 2, name: 'Send', shortName: 'SEND', min: 0, max: 100, defaultValue: 80 },
      { id: 3, name: 'Return', shortName: 'RTN', min: 0, max: 100, defaultValue: 80 },
      { id: 4, name: 'Dry', shortName: 'DRY', min: 0, max: 100 },
    ],
  },
  default: [
      { id: 2, name: 'Send', shortName: 'SEND', min: 0, max: 100, defaultValue: 80 },
      { id: 3, name: 'Return', shortName: 'RTN', min: 0, max: 100, defaultValue: 80 },
      { id: 4, name: 'Dry', shortName: 'DRY', min: 0, max: 100 },
  ],
};

// ============================================================================
// ZNR (ZNR) - 3 types
// ============================================================================

export const ZNR_PARAMS: ModuleParameterMap = {
  common: [
    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },
    { id: 1, name: 'Type', shortName: 'TYPE', min: 0, max: 2 },
  ],
  byType: {
  },
  default: [
      { id: 2, name: 'Threshold', shortName: 'THRS', min: 0, max: 15, defaultValue: 9, displayOffset: 1 },
  ],
};

// ============================================================================
// AMP (AMP) - 44 types
// ============================================================================

export const AMP_PARAMS: ModuleParameterMap = {
  common: [
    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },
    { id: 1, name: 'Type', shortName: 'TYPE', min: 0, max: 43 },
  ],
  byType: {
    // Fender Clean (0)
    0: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // VOX Clean (1)
    1: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // JC Clean (2)
    2: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // HiWatt Clean (3)
    3: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // UK Blues (4)
    4: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // US Blues (5)
    5: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // Tweed Bass (6)
    6: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // BG Crunch (7)
    7: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // VOX Crunch (8)
    8: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // Z Combo (9)
    9: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // MS #1959 (10)
    10: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // MS Crunch (11)
    11: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // MS Drive (12)
    12: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // Rect Clean (13)
    13: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 50 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // Rect Vintage (14)
    14: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // Rect Modern (15)
    15: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // HK Clean (16)
    16: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 50 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // HK Crunch (17)
    17: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // HK Drive (18)
    18: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // DZ Clean (19)
    19: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 50 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // DZ Crunch (20)
    20: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // DZ Drive (21)
    21: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // ENGL Drive (22)
    22: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // PV Drive (23)
    23: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // Z Stack (24)
    24: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // Over Drive (25)
    25: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // TS808 (26)
    26: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // Centaur (27)
    27: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // Guv'nor (28)
    28: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // RAT (29)
    29: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // DS-1 (30)
    30: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // dist+ (31)
    31: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // HotBox (32)
    32: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // FuzzFace (33)
    33: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // BigMuff (34)
    34: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // MetalZone (35)
    35: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // TS+F_Cmb (36)
    36: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // SD+M_Stk (37)
    37: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // FZ+M_Stk (38)
    38: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // Z OD (39)
    39: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // ExtremeDS (40)
    40: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // DigiFuzz (41)
    41: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // Z Clean (42)
    42: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
    // Aco.Sim (43)
    43: [
      { id: 2, name: 'Top', shortName: 'TOP', min: 0, max: 10, defaultValue: 8 },
      { id: 3, name: 'Body', shortName: 'BODY', min: 0, max: 10, defaultValue: 5 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
    ],
  },
  default: [
      { id: 2, name: 'Gain', shortName: 'GAIN', min: 0, max: 100, defaultValue: 60 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 30, defaultValue: 15 },
      { id: 4, name: 'Level', shortName: 'LVL', min: 0, max: 99, defaultValue: 79, displayOffset: 1 },
  ],
};

// ============================================================================
// MOD (MOD) - 28 types
// ============================================================================

export const MOD_PARAMS: ModuleParameterMap = {
  common: [
    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },
    { id: 1, name: 'Type', shortName: 'TYPE', min: 0, max: 27 },
  ],
  byType: {
    // Chorus (0)
    0: [
      { id: 2, name: 'Depth', shortName: 'DPTH', min: 0, max: 50, defaultValue: 20 },
      { id: 3, name: 'Rate', shortName: 'RATE', min: 0, max: 49, defaultValue: 24, displayOffset: 1 },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 7 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 25 },
    ],
    // StereoChorus (1)
    1: [
      { id: 2, name: 'Depth', shortName: 'DPTH', min: 0, max: 50, defaultValue: 40 },
      { id: 3, name: 'Rate', shortName: 'RATE', min: 0, max: 49, defaultValue: 29, displayOffset: 1 },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 7 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 30 },
    ],
    // Ensemble (2)
    2: [
      { id: 2, name: 'Depth', shortName: 'DPTH', min: 0, max: 50, defaultValue: 40 },
      { id: 3, name: 'Rate', shortName: 'RATE', min: 0, max: 49, defaultValue: 29, displayOffset: 1 },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 7 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 30 },
    ],
    // ModDelay (3)
    3: [
      { id: 2, name: 'Time', shortName: 'TIME', min: 0, max: 2014, defaultValue: 239, displayOffset: 1 },
      { id: 3, name: 'FeedBack', shortName: 'FEED', min: 0, max: 50, defaultValue: 15 },
      { id: 4, name: 'Rate', shortName: 'RATE', min: 0, max: 49, defaultValue: 24, displayOffset: 1 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 25 },
    ],
    // Flanger (4)
    4: [
      { id: 2, name: 'Depth', shortName: 'DPTH', min: 0, max: 50, defaultValue: 15 },
      { id: 3, name: 'Rate', shortName: 'RATE', min: 0, max: 78, defaultValue: 7, rtmMax: 50 },
      { id: 4, name: 'Resonance', shortName: 'RESO', min: 0, max: 20, defaultValue: 14, displayOffset: -10 },
      { id: 5, name: 'Manual', shortName: 'MAN', min: 0, max: 50, defaultValue: 8 },
    ],
    // PitchShifter (5)
    5: [
      { id: 2, name: 'Shift', shortName: 'SHFT', min: 0, max: 25, values: ['-12', '-11', '-10', '-9', '-8', '-7', '-6', '-5', '-4', '-3', '-2', '-1', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '24'], defaultValue: 24, displayOffset: 8 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 6 },
      { id: 4, name: 'Fine', shortName: 'FINE', min: 0, max: 50, defaultValue: 25, displayOffset: -25 },
      { id: 5, name: 'Balance', shortName: 'BAL', min: 0, max: 50, defaultValue: 20 },
    ],
    // PedalPitch (6)
    6: [
      { id: 2, name: 'Color', shortName: 'COLR', min: 0, max: 7, defaultValue: 4, displayOffset: 1 },
      { id: 3, name: 'Mode', shortName: 'MODE', min: 0, max: 1, values: ['Up', 'Down'] },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'PedalPosition', shortName: 'PEDA', min: 0, max: 100 },
    ],
    // Vibrato (7)
    7: [
      { id: 2, name: 'Depth', shortName: 'DPTH', min: 0, max: 50, defaultValue: 20 },
      { id: 3, name: 'Rate', shortName: 'RATE', min: 0, max: 78, defaultValue: 30, rtmMax: 50 },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 7 },
      { id: 5, name: 'Balance', shortName: 'BAL', min: 0, max: 50, defaultValue: 36 },
    ],
    // Step (8)
    8: [
      { id: 2, name: 'Depth', shortName: 'DPTH', min: 0, max: 50, defaultValue: 30 },
      { id: 3, name: 'Rate', shortName: 'RATE', min: 0, max: 78, defaultValue: 30, rtmMax: 50 },
      { id: 4, name: 'Resonance', shortName: 'RESO', min: 0, max: 10, defaultValue: 6 },
      { id: 5, name: 'Shape', shortName: 'SHAP', min: 0, max: 10, defaultValue: 8 },
    ],
    // Delay (9)
    9: [
      { id: 2, name: 'Time', shortName: 'TIME', min: 0, max: 2014, defaultValue: 239, displayOffset: 1 },
      { id: 3, name: 'FeedBack', shortName: 'FEED', min: 0, max: 50, defaultValue: 9 },
      { id: 4, name: 'HiDamp', shortName: 'HIDP', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 25 },
    ],
    // TapeEcho (10)
    10: [
      { id: 2, name: 'Time', shortName: 'TIME', min: 0, max: 2014, defaultValue: 239, displayOffset: 1 },
      { id: 3, name: 'FeedBack', shortName: 'FEED', min: 0, max: 50, defaultValue: 15 },
      { id: 4, name: 'HiDamp', shortName: 'HIDP', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 25 },
    ],
    // DynamicDelay (11)
    11: [
      { id: 2, name: 'Time', shortName: 'TIME', min: 0, max: 2014, defaultValue: 359, displayOffset: 1 },
      { id: 3, name: 'Amount', shortName: 'AMOU', min: 0, max: 50, defaultValue: 40 },
      { id: 4, name: 'FeedBack', shortName: 'FEED', min: 0, max: 50, defaultValue: 15 },
      { id: 5, name: 'Sense', shortName: 'SENS', min: 0, max: 19, values: ['-10', '-9', '-8', '-7', '-6', '-5', '-4', '-3', '-2', '-1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], defaultValue: 5 },
    ],
    // DynamicFlanger (12)
    12: [
      { id: 2, name: 'Depth', shortName: 'DPTH', min: 0, max: 50, defaultValue: 30 },
      { id: 3, name: 'Rate', shortName: 'RATE', min: 0, max: 78, defaultValue: 12, rtmMax: 50 },
      { id: 4, name: 'Resonance', shortName: 'RESO', min: 0, max: 20, defaultValue: 17, displayOffset: -10 },
      { id: 5, name: 'Sense', shortName: 'SENS', min: 0, max: 19, values: ['-10', '-9', '-8', '-7', '-6', '-5', '-4', '-3', '-2', '-1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], defaultValue: 16 },
    ],
    // MonoPitch (13)
    13: [
      { id: 2, name: 'Shift', shortName: 'SHFT', min: 0, max: 26, values: ['-24', '-12', '-11', '-10', '-9', '-8', '-7', '-6', '-5', '-4', '-3', '-2', '-1', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '24'], defaultValue: 20, displayOffset: 10 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 6 },
      { id: 4, name: 'Fine', shortName: 'FINE', min: 0, max: 50, defaultValue: 25, displayOffset: -25 },
      { id: 5, name: 'Balance', shortName: 'BAL', min: 0, max: 50, defaultValue: 25 },
    ],
    // HarmonizedPitchShifter (14)
    14: [
      { id: 2, name: 'Scale', shortName: 'SCAL', min: 0, max: 9, values: ['-6', '-5', '-4', '-3', '-m', 'm', '3', '4', '5', '6'], defaultValue: 5 },
      { id: 3, name: 'Key', shortName: 'KEY', min: 0, max: 11, values: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 6 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 35 },
    ],
    // PedalMonoPitch (15)
    15: [
      { id: 2, name: 'Color', shortName: 'COLR', min: 0, max: 7, defaultValue: 4, displayOffset: 1 },
      { id: 3, name: 'Mode', shortName: 'MODE', min: 0, max: 1, values: ['Up', 'Down'] },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'PedalPosition', shortName: 'PEDA', min: 0, max: 100 },
    ],
    // Cry (16)
    16: [
      { id: 2, name: 'Range', shortName: 'RANG', min: 0, max: 9, defaultValue: 4, displayOffset: 1 },
      { id: 3, name: 'Resonance', shortName: 'RESO', min: 0, max: 10, defaultValue: 8 },
      { id: 4, name: 'Sense', shortName: 'SENS', min: 0, max: 19, values: ['-10', '-9', '-8', '-7', '-6', '-5', '-4', '-3', '-2', '-1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], defaultValue: 16 },
      { id: 5, name: 'Balance', shortName: 'BAL', min: 0, max: 50, defaultValue: 50 },
    ],
    // ReverseDelay (17)
    17: [
      { id: 2, name: 'Time', shortName: 'TIME', min: 0, max: 1001, defaultValue: 350, displayOffset: 10 },
      { id: 3, name: 'FeedBack', shortName: 'FEED', min: 0, max: 50, defaultValue: 25 },
      { id: 4, name: 'HiDamp', shortName: 'HIDP', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Balance', shortName: 'BAL', min: 0, max: 50, defaultValue: 25 },
    ],
    // BendChorus (18)
    18: [
      { id: 2, name: 'Depth', shortName: 'DPTH', min: 0, max: 50, defaultValue: 40, displayOffset: -25 },
      { id: 3, name: 'Attack', shortName: 'ATK', min: 0, max: 9, displayOffset: 1 },
      { id: 4, name: 'Release', shortName: 'REL', min: 0, max: 9, defaultValue: 9, displayOffset: 1 },
      { id: 5, name: 'Balance', shortName: 'BAL', min: 0, max: 50, defaultValue: 25 },
    ],
    // CombFilter (19)
    19: [
      { id: 2, name: 'Frequency', shortName: 'FREQ', min: 0, max: 49, displayOffset: 1 },
      { id: 3, name: 'Resonance', shortName: 'RESO', min: 0, max: 20, defaultValue: 18, displayOffset: -10 },
      { id: 4, name: 'HiDamp', shortName: 'HIDP', min: 0, max: 10, defaultValue: 10 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 50 },
    ],
    // Air (20)
    20: [
      { id: 2, name: 'Size', shortName: 'SIZE', min: 0, max: 99, defaultValue: 9, displayOffset: 1 },
      { id: 3, name: 'Reflex', shortName: 'REFL', min: 0, max: 10, defaultValue: 6 },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 20 },
    ],
    // Z-Echo (21)
    21: [
      { id: 2, name: 'Time', shortName: 'TIME', min: 0, max: 99, defaultValue: 35, displayOffset: 1 },
      { id: 3, name: 'FeedBack', shortName: 'FEED', min: 0, max: 50, defaultValue: 9 },
      { id: 4, name: 'HiDamp', shortName: 'HIDP', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 20 },
    ],
    // X-Flanger (22)
    22: [
      { id: 2, name: 'Depth', shortName: 'DPTH', min: 0, max: 50, defaultValue: 15 },
      { id: 3, name: 'Rate', shortName: 'RATE', min: 0, max: 78, defaultValue: 7, rtmMax: 50 },
      { id: 4, name: 'X-Fade', shortName: 'XFAD', min: 0, max: 50, defaultValue: 50 },
      { id: 5, name: 'Manual', shortName: 'MAN', min: 0, max: 50, defaultValue: 8 },
    ],
    // X-Step (23)
    23: [
      { id: 2, name: 'Depth', shortName: 'DPTH', min: 0, max: 50, defaultValue: 30 },
      { id: 3, name: 'Rate', shortName: 'RATE', min: 0, max: 78, defaultValue: 30, rtmMax: 50 },
      { id: 4, name: 'X-Fade', shortName: 'XFAD', min: 0, max: 50, defaultValue: 50 },
      { id: 5, name: 'Shape', shortName: 'SHAP', min: 0, max: 10, defaultValue: 8 },
    ],
    // Z-Step (24)
    24: [
      { id: 2, name: 'Frequency', shortName: 'FREQ', min: 0, max: 49, defaultValue: 19, displayOffset: 1 },
      { id: 3, name: 'Depth', shortName: 'DPTH', min: 0, max: 50, defaultValue: 25 },
      { id: 4, name: 'Shape', shortName: 'SHAP', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 30 },
    ],
    // Z-Pitch (25)
    25: [
      { id: 2, name: 'Color', shortName: 'COLR', min: 0, max: 7, displayOffset: 1 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 8 },
      { id: 4, name: 'PedalPosition V', shortName: 'PEDA', min: 0, max: 100 },
      { id: 5, name: 'PedalPosition H', shortName: 'PEDA', min: 0, max: 100 },
    ],
    // Z-MonoPitch (26)
    26: [
      { id: 2, name: 'Color', shortName: 'COLR', min: 0, max: 7, displayOffset: 1 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 8 },
      { id: 4, name: 'PedalPosition V', shortName: 'PEDA', min: 0, max: 100 },
      { id: 5, name: 'PedalPosition H', shortName: 'PEDA', min: 0, max: 100 },
    ],
    // Z-Talking (27)
    27: [
      { id: 2, name: 'Variation', shortName: 'VARI', min: 0, max: 4, defaultValue: 4, displayOffset: 1 },
      { id: 3, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 8 },
      { id: 4, name: 'Formant V', shortName: 'FORM', min: 0, max: 100 },
      { id: 5, name: 'Formant H', shortName: 'FORM', min: 0, max: 100 },
    ],
  },
  default: [
      { id: 2, name: 'Depth', shortName: 'DPTH', min: 0, max: 50, defaultValue: 20 },
      { id: 3, name: 'Rate', shortName: 'RATE', min: 0, max: 49, defaultValue: 24, displayOffset: 1 },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 7 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 25 },
  ],
};

// ============================================================================
// DLY (DLY) - 7 types
// ============================================================================

export const DLY_PARAMS: ModuleParameterMap = {
  common: [
    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },
    { id: 1, name: 'Type', shortName: 'TYPE', min: 0, max: 6 },
  ],
  byType: {
    // Delay (0)
    0: [
      { id: 2, name: 'Time', shortName: 'TIME', min: 0, max: 5022, defaultValue: 359, displayOffset: 1 },
      { id: 3, name: 'FeedBack', shortName: 'FEED', min: 0, max: 50, defaultValue: 10 },
      { id: 4, name: 'HiDamp', shortName: 'HIDP', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 20 },
    ],
    // PingPongDelay (1)
    1: [
      { id: 2, name: 'Time', shortName: 'TIME', min: 0, max: 5022, defaultValue: 359, displayOffset: 1 },
      { id: 3, name: 'FeedBack', shortName: 'FEED', min: 0, max: 50, defaultValue: 10 },
      { id: 4, name: 'HiDamp', shortName: 'HIDP', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 20 },
    ],
    // Echo (2)
    2: [
      { id: 2, name: 'Time', shortName: 'TIME', min: 0, max: 5022, defaultValue: 359, displayOffset: 1 },
      { id: 3, name: 'FeedBack', shortName: 'FEED', min: 0, max: 50, defaultValue: 10 },
      { id: 4, name: 'HiDamp', shortName: 'HIDP', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 20 },
    ],
    // PingPongEcho (3)
    3: [
      { id: 2, name: 'Time', shortName: 'TIME', min: 0, max: 5022, defaultValue: 359, displayOffset: 1 },
      { id: 3, name: 'FeedBack', shortName: 'FEED', min: 0, max: 50, defaultValue: 10 },
      { id: 4, name: 'HiDamp', shortName: 'HIDP', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 20 },
    ],
    // AnalogDelay (4)
    4: [
      { id: 2, name: 'Time', shortName: 'TIME', min: 0, max: 5022, defaultValue: 599, displayOffset: 1 },
      { id: 3, name: 'FeedBack', shortName: 'FEED', min: 0, max: 50, defaultValue: 15 },
      { id: 4, name: 'HiDamp', shortName: 'HIDP', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 35 },
    ],
    // ReverseDelay (5)
    5: [
      { id: 2, name: 'Time', shortName: 'TIME', min: 0, max: 2505, defaultValue: 350, displayOffset: 10 },
      { id: 3, name: 'FeedBack', shortName: 'FEED', min: 0, max: 50, defaultValue: 20 },
      { id: 4, name: 'HiDamp', shortName: 'HIDP', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Balance', shortName: 'BAL', min: 0, max: 50, defaultValue: 25 },
    ],
    // Air (6)
    6: [
      { id: 2, name: 'Size', shortName: 'SIZE', min: 0, max: 99, defaultValue: 9, displayOffset: 1 },
      { id: 3, name: 'Reflex', shortName: 'REFL', min: 0, max: 10, defaultValue: 6 },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 20 },
    ],
  },
  default: [
      { id: 2, name: 'Time', shortName: 'TIME', min: 0, max: 5022, defaultValue: 359, displayOffset: 1 },
      { id: 3, name: 'FeedBack', shortName: 'FEED', min: 0, max: 50, defaultValue: 10 },
      { id: 4, name: 'HiDamp', shortName: 'HIDP', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 20 },
  ],
};

// ============================================================================
// REV (REV) - 15 types
// ============================================================================

export const REV_PARAMS: ModuleParameterMap = {
  common: [
    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },
    { id: 1, name: 'Type', shortName: 'TYPE', min: 0, max: 14 },
  ],
  byType: {
    // Hall (0)
    0: [
      { id: 2, name: 'Decay', shortName: 'DCAY', min: 0, max: 29, defaultValue: 9, displayOffset: 1 },
      { id: 3, name: 'PreDelay', shortName: 'PDLY', min: 0, max: 99, defaultValue: 44, displayOffset: 1 },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 5 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 30 },
    ],
    // Room (1)
    1: [
      { id: 2, name: 'Decay', shortName: 'DCAY', min: 0, max: 29, defaultValue: 9, displayOffset: 1 },
      { id: 3, name: 'PreDelay', shortName: 'PDLY', min: 0, max: 99, defaultValue: 4, displayOffset: 1 },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 5 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 30 },
    ],
    // Spring (2)
    2: [
      { id: 2, name: 'Decay', shortName: 'DCAY', min: 0, max: 29, defaultValue: 19, displayOffset: 1 },
      { id: 3, name: 'PreDelay', shortName: 'PDLY', min: 0, max: 99, displayOffset: 1 },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 4 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 30 },
    ],
    // Arena (3)
    3: [
      { id: 2, name: 'Decay', shortName: 'DCAY', min: 0, max: 29, defaultValue: 14, displayOffset: 1 },
      { id: 3, name: 'PreDelay', shortName: 'PDLY', min: 0, max: 99, defaultValue: 89, displayOffset: 1 },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 30 },
    ],
    // TiledRoom (4)
    4: [
      { id: 2, name: 'Decay', shortName: 'DCAY', min: 0, max: 29, defaultValue: 19, displayOffset: 1 },
      { id: 3, name: 'PreDelay', shortName: 'PDLY', min: 0, max: 99, defaultValue: 9, displayOffset: 1 },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 8 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 35 },
    ],
    // ModernSpring (5)
    5: [
      { id: 2, name: 'Decay', shortName: 'DCAY', min: 0, max: 29, defaultValue: 19, displayOffset: 1 },
      { id: 3, name: 'PreDelay', shortName: 'PDLY', min: 0, max: 99, displayOffset: 1 },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 7 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 25 },
    ],
    // EarlyReflection (6)
    6: [
      { id: 2, name: 'Decay', shortName: 'DCAY', min: 0, max: 29, defaultValue: 9, displayOffset: 1 },
      { id: 3, name: 'Shape', shortName: 'SHAP', min: 0, max: 20, defaultValue: 20, displayOffset: -10 },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 6 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 25 },
    ],
    // MultiTapDelay (7)
    7: [
      { id: 2, name: 'Time', shortName: 'TIME', min: 0, max: 3018, defaultValue: 3008, displayOffset: 1 },
      { id: 3, name: 'Pattern', shortName: 'PTRN', min: 0, max: 7, defaultValue: 1, displayOffset: 1 },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 10 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 10 },
    ],
    // PanningDelay (8)
    8: [
      { id: 2, name: 'Time', shortName: 'TIME', min: 0, max: 3018, defaultValue: 34, displayOffset: 1 },
      { id: 3, name: 'FeedBack', shortName: 'FEED', min: 0, max: 50, defaultValue: 6 },
      { id: 4, name: 'HiDamp', shortName: 'HIDP', min: 0, max: 10, defaultValue: 5 },
      { id: 5, name: 'Pan', shortName: 'PAN', min: 0, max: 50, values: ['L50', 'L48', 'L46', 'L44', 'L42', 'L40', 'L38', 'L36', 'L34', 'L32', 'L30', 'L28', 'L26', 'L24', 'L22', 'L20', 'L18', 'L16', 'L14', 'L12', 'L10', 'L8', 'L6', 'L4', 'L2', '0', 'R2', 'R4', 'R6', 'R8', 'R10', 'R12', 'R14', 'R16', 'R18', 'R20', 'R22', 'R24', 'R26', 'R28', 'R30', 'R32', 'R34', 'R36', 'R38', 'R40', 'R42', 'R44', 'R46', 'R48', 'R50'], defaultValue: 5 },
    ],
    // PingPongDelay (9)
    9: [
      { id: 2, name: 'Time', shortName: 'TIME', min: 0, max: 3018, defaultValue: 3008, displayOffset: 1 },
      { id: 3, name: 'FeedBack', shortName: 'FEED', min: 0, max: 50, defaultValue: 5 },
      { id: 4, name: 'HiDamp', shortName: 'HIDP', min: 0, max: 10, defaultValue: 5 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 35 },
    ],
    // PingPongEcho (10)
    10: [
      { id: 2, name: 'Time', shortName: 'TIME', min: 0, max: 3018, defaultValue: 3008, displayOffset: 1 },
      { id: 3, name: 'FeedBack', shortName: 'FEED', min: 0, max: 50, defaultValue: 5 },
      { id: 4, name: 'HiDamp', shortName: 'HIDP', min: 0, max: 10, defaultValue: 5 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 35 },
    ],
    // AutoPan (11)
    11: [
      { id: 2, name: 'Width', shortName: 'WIDT', min: 0, max: 50, values: ['L50', 'L48', 'L46', 'L44', 'L42', 'L40', 'L38', 'L36', 'L34', 'L32', 'L30', 'L28', 'L26', 'L24', 'L22', 'L20', 'L18', 'L16', 'L14', 'L12', 'L10', 'L8', 'L6', 'L4', 'L2', '0', 'R2', 'R4', 'R6', 'R8', 'R10', 'R12', 'R14', 'R16', 'R18', 'R20', 'R22', 'R24', 'R26', 'R28', 'R30', 'R32', 'R34', 'R36', 'R38', 'R40', 'R42', 'R44', 'R46', 'R48', 'R50'], defaultValue: 40 },
      { id: 3, name: 'Rate', shortName: 'RATE', min: 0, max: 78, defaultValue: 48, rtmMax: 50 },
      { id: 4, name: 'Depth', shortName: 'DPTH', min: 0, max: 10, defaultValue: 5 },
      { id: 5, name: 'Wave', shortName: 'WAVE', min: 0, max: 10, defaultValue: 1 },
    ],
    // Z-Delay (12)
    12: [
      { id: 2, name: 'Time', shortName: 'TIME', min: 0, max: 3018, defaultValue: 3008, displayOffset: 1 },
      { id: 3, name: 'FeedBack', shortName: 'FEED', min: 0, max: 50, defaultValue: 5 },
      { id: 4, name: 'Pan', shortName: 'PAN', min: 0, max: 50, values: ['L50', 'L48', 'L46', 'L44', 'L42', 'L40', 'L38', 'L36', 'L34', 'L32', 'L30', 'L28', 'L26', 'L24', 'L22', 'L20', 'L18', 'L16', 'L14', 'L12', 'L10', 'L8', 'L6', 'L4', 'L2', '0', 'R2', 'R4', 'R6', 'R8', 'R10', 'R12', 'R14', 'R16', 'R18', 'R20', 'R22', 'R24', 'R26', 'R28', 'R30', 'R32', 'R34', 'R36', 'R38', 'R40', 'R42', 'R44', 'R46', 'R48', 'R50'], defaultValue: 25 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 35 },
    ],
    // Z-Dimension (13)
    13: [
      { id: 2, name: 'Pan', shortName: 'PAN', min: 0, max: 50, values: ['L50', 'L48', 'L46', 'L44', 'L42', 'L40', 'L38', 'L36', 'L34', 'L32', 'L30', 'L28', 'L26', 'L24', 'L22', 'L20', 'L18', 'L16', 'L14', 'L12', 'L10', 'L8', 'L6', 'L4', 'L2', '0', 'R2', 'R4', 'R6', 'R8', 'R10', 'R12', 'R14', 'R16', 'R18', 'R20', 'R22', 'R24', 'R26', 'R28', 'R30', 'R32', 'R34', 'R36', 'R38', 'R40', 'R42', 'R44', 'R46', 'R48', 'R50'], defaultValue: 25 },
      { id: 3, name: 'Depth', shortName: 'DPTH', min: 0, max: 50 },
      { id: 4, name: 'Decay', shortName: 'DCAY', min: 0, max: 29, defaultValue: 1, displayOffset: 1 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 13 },
    ],
    // Z-Tornado (14)
    14: [
      { id: 2, name: 'Time', shortName: 'TIME', min: 0, max: 3018, defaultValue: 179, displayOffset: 1 },
      { id: 3, name: 'Rate', shortName: 'RATE', min: 0, max: 77, defaultValue: 9, displayOffset: 1, rtmMax: 49 },
      { id: 4, name: 'Width', shortName: 'WIDT', min: 0, max: 50, values: ['L50', 'L48', 'L46', 'L44', 'L42', 'L40', 'L38', 'L36', 'L34', 'L32', 'L30', 'L28', 'L26', 'L24', 'L22', 'L20', 'L18', 'L16', 'L14', 'L12', 'L10', 'L8', 'L6', 'L4', 'L2', '0', 'R2', 'R4', 'R6', 'R8', 'R10', 'R12', 'R14', 'R16', 'R18', 'R20', 'R22', 'R24', 'R26', 'R28', 'R30', 'R32', 'R34', 'R36', 'R38', 'R40', 'R42', 'R44', 'R46', 'R48', 'R50'], defaultValue: 50 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 30 },
    ],
  },
  default: [
      { id: 2, name: 'Decay', shortName: 'DCAY', min: 0, max: 29, defaultValue: 9, displayOffset: 1 },
      { id: 3, name: 'PreDelay', shortName: 'PDLY', min: 0, max: 99, defaultValue: 44, displayOffset: 1 },
      { id: 4, name: 'Tone', shortName: 'TONE', min: 0, max: 10, defaultValue: 5 },
      { id: 5, name: 'Mix', shortName: 'MIX', min: 0, max: 50, defaultValue: 30 },
  ],
};

// ============================================================================
// EQ (6-Band Equalizer) - hardcoded (not in XML)
// ============================================================================

export const EQ_PARAMS: ModuleParameterMap = {
  common: [
    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },
  ],
  byType: {},
  default: [
    { id: 2, name: 'Low', shortName: 'LOW', min: 0, max: 24, defaultValue: 12, unit: 'dB', displayOffset: -12 },
    { id: 3, name: 'Low Mid', shortName: 'LMID', min: 0, max: 24, defaultValue: 12, unit: 'dB', displayOffset: -12 },
    { id: 4, name: 'Mid', shortName: 'MID', min: 0, max: 24, defaultValue: 12, unit: 'dB', displayOffset: -12 },
    { id: 5, name: 'High Mid', shortName: 'HMID', min: 0, max: 24, defaultValue: 12, unit: 'dB', displayOffset: -12 },
    { id: 6, name: 'High', shortName: 'HIGH', min: 0, max: 24, defaultValue: 12, unit: 'dB', displayOffset: -12 },
    { id: 7, name: 'Presence', shortName: 'PRES', min: 0, max: 24, defaultValue: 12, unit: 'dB', displayOffset: -12 },
  ],
};

// ============================================================================
// CAB (Cabinet Simulator) - hardcoded (not in XML)
// ============================================================================

export const CAB_PARAMS: ModuleParameterMap = {
  common: [
    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },
  ],
  byType: {},
  default: [
    { id: 2, name: 'Mic Type', shortName: 'MIC', min: 0, max: 1, values: ['Dynamic', 'Condenser'] },
    { id: 3, name: 'Mic Position', shortName: 'POS', min: 0, max: 2 },
    { id: 4, name: 'Depth', shortName: 'DPTH', min: 0, max: 2, values: ['Small', 'Middle', 'Large'] },
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
  return typeParams.map(p => p.rtmMax ? { ...p, max: p.rtmMax } : p);
}

/**
 * Format a parameter value for display
 */
export function formatParameterValue(param: ParameterDef, value: number): string {
  // Handle discrete value parameters
  if (param.values && param.values[value] !== undefined) {
    return param.values[value];
  }

  const displayValue = value + (param.displayOffset ?? 0);

  // Show +/- sign for offset parameters (e.g., EQ bands)
  if (param.displayOffset && param.displayOffset < 0) {
    return displayValue === 0 ? '0' : (displayValue > 0 ? `+${displayValue}` : `${displayValue}`);
  }

  return param.unit ? `${displayValue}${param.unit}` : String(displayValue);
}
