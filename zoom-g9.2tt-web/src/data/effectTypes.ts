/**
 * Effect type definitions for all G9.2tt modules
 * Based on PARAMETER_MAP.md and G9ED.efx.xml
 */

import type { ModuleName } from '../types/patch';

/** Effect type definition */
export interface EffectType {
  id: number;
  name: string;
  shortName?: string;
}

/** Effect types for AMP module (44 types) - From G9ED.efx.xml */
export const AMP_TYPES: EffectType[] = [
  { id: 0, name: 'Fender Clean', shortName: 'FdrCln' },
  { id: 1, name: 'VOX Clean', shortName: 'VoxCln' },
  { id: 2, name: 'JC Clean', shortName: 'JCCln' },
  { id: 3, name: 'HiWatt Clean', shortName: 'HWCln' },
  { id: 4, name: 'UK Blues', shortName: 'UKBlu' },
  { id: 5, name: 'US Blues', shortName: 'USBlu' },
  { id: 6, name: 'Tweed Bass', shortName: 'TwdBs' },
  { id: 7, name: 'BG Crunch', shortName: 'BGCrn' },
  { id: 8, name: 'VOX Crunch', shortName: 'VoxCr' },
  { id: 9, name: 'Z Combo', shortName: 'ZCmbo' },
  { id: 10, name: 'MS #1959', shortName: 'MS59' },
  { id: 11, name: 'MS Crunch', shortName: 'MSCrn' },
  { id: 12, name: 'MS Drive', shortName: 'MSDrv' },
  { id: 13, name: 'Rect Clean', shortName: 'RctCl' },
  { id: 14, name: 'Rect Vintage', shortName: 'RctVn' },
  { id: 15, name: 'Rect Modern', shortName: 'RctMd' },
  { id: 16, name: 'HK Clean', shortName: 'HKCln' },
  { id: 17, name: 'HK Crunch', shortName: 'HKCrn' },
  { id: 18, name: 'HK Drive', shortName: 'HKDrv' },
  { id: 19, name: 'DZ Clean', shortName: 'DZCln' },
  { id: 20, name: 'DZ Crunch', shortName: 'DZCrn' },
  { id: 21, name: 'DZ Drive', shortName: 'DZDrv' },
  { id: 22, name: 'ENGL Drive', shortName: 'ENGL' },
  { id: 23, name: 'PV Drive', shortName: 'PVDrv' },
  { id: 24, name: 'Z Stack', shortName: 'ZStck' },
  { id: 25, name: 'Over Drive', shortName: 'OD' },
  { id: 26, name: 'TS808', shortName: 'TS808' },
  { id: 27, name: 'Centaur', shortName: 'Cntr' },
  { id: 28, name: "Guv'nor", shortName: 'Guvnr' },
  { id: 29, name: 'RAT', shortName: 'RAT' },
  { id: 30, name: 'DS-1', shortName: 'DS-1' },
  { id: 31, name: 'dist+', shortName: 'Dst+' },
  { id: 32, name: 'HotBox', shortName: 'HtBox' },
  { id: 33, name: 'FuzzFace', shortName: 'FzFce' },
  { id: 34, name: 'BigMuff', shortName: 'BgMff' },
  { id: 35, name: 'MetalZone', shortName: 'MtlZn' },
  { id: 36, name: 'TS+F_Cmb', shortName: 'TS+FC' },
  { id: 37, name: 'SD+M_Stk', shortName: 'SD+MS' },
  { id: 38, name: 'FZ+M_Stk', shortName: 'FZ+MS' },
  { id: 39, name: 'Z OD', shortName: 'ZOD' },
  { id: 40, name: 'ExtremeDS', shortName: 'ExtDS' },
  { id: 41, name: 'DigiFuzz', shortName: 'DgFzz' },
  { id: 42, name: 'Z Clean', shortName: 'ZCln' },
  { id: 43, name: 'Aco.Sim', shortName: 'AcoSm' },
];

/** Effect types for COMP module (3 types) */
export const COMP_TYPES: EffectType[] = [
  { id: 0, name: 'Compressor', shortName: 'COMP' },
  { id: 1, name: 'Rack Comp', shortName: 'RACK' },
  { id: 2, name: 'Limiter', shortName: 'LIMIT' },
];

/** Effect types for WAH module (17 types) */
export const WAH_TYPES: EffectType[] = [
  { id: 0, name: 'Auto Wah', shortName: 'AWAH' },
  { id: 1, name: 'Auto Resonance', shortName: 'ARES' },
  { id: 2, name: 'Booster', shortName: 'BOOST' },
  { id: 3, name: 'Tremolo', shortName: 'TREM' },
  { id: 4, name: 'Phaser', shortName: 'PHASE' },
  { id: 5, name: 'Fixed Phaser', shortName: 'FXPHS' },
  { id: 6, name: 'Ring Modulator', shortName: 'RING' },
  { id: 7, name: 'Slow Attack', shortName: 'SLOW' },
  { id: 8, name: 'Pedal Vox', shortName: 'PVOX' },
  { id: 9, name: 'Pedal Cry Baby', shortName: 'PCRY' },
  { id: 10, name: 'Multi Wah', shortName: 'MWAH' },
  { id: 11, name: 'Pedal Resonance Filter', shortName: 'PRES' },
  { id: 12, name: 'Octave', shortName: 'OCT' },
  { id: 13, name: 'X-Wah', shortName: 'XWAH' },
  { id: 14, name: 'X-Phaser', shortName: 'XPHS' },
  { id: 15, name: 'X-Vibe', shortName: 'XVIB' },
  { id: 16, name: 'Z-Oscillator', shortName: 'ZOSC' },
];

/** Effect types for ZNR module (3 types) */
export const ZNR_TYPES: EffectType[] = [
  { id: 0, name: 'ZNR', shortName: 'ZNR' },
  { id: 1, name: 'Noise Gate', shortName: 'GATE' },
  { id: 2, name: 'Dirty Gate', shortName: 'DIRTY' },
];

/** Effect types for MOD module (28 types) */
export const MOD_TYPES: EffectType[] = [
  { id: 0, name: 'Chorus', shortName: 'CHOR' },
  { id: 1, name: 'Stereo Chorus', shortName: 'STCHR' },
  { id: 2, name: 'Ensemble', shortName: 'ENSBL' },
  { id: 3, name: 'Mod Delay', shortName: 'MDDLY' },
  { id: 4, name: 'Flanger', shortName: 'FLANG' },
  { id: 5, name: 'Pitch Shifter', shortName: 'PITCH' },
  { id: 6, name: 'Pedal Pitch', shortName: 'PPTCH' },
  { id: 7, name: 'Vibrato', shortName: 'VIBR' },
  { id: 8, name: 'Step', shortName: 'STEP' },
  { id: 9, name: 'Delay', shortName: 'DELAY' },
  { id: 10, name: 'Tape Echo', shortName: 'TAPE' },
  { id: 11, name: 'Dynamic Delay', shortName: 'DYNDL' },
  { id: 12, name: 'Dynamic Flanger', shortName: 'DYNFL' },
  { id: 13, name: 'Mono Pitch', shortName: 'MPTCH' },
  { id: 14, name: 'Harmonized Pitch Shifter', shortName: 'HARM' },
  { id: 15, name: 'Pedal Mono Pitch', shortName: 'PMPTC' },
  { id: 16, name: 'Cry', shortName: 'CRY' },
  { id: 17, name: 'Reverse Delay', shortName: 'REVDL' },
  { id: 18, name: 'Bend Chorus', shortName: 'BNDCH' },
  { id: 19, name: 'Comb Filter', shortName: 'COMB' },
  { id: 20, name: 'Air', shortName: 'AIR' },
  { id: 21, name: 'Z-Echo', shortName: 'ZECHO' },
  { id: 22, name: 'X-Flanger', shortName: 'XFLNG' },
  { id: 23, name: 'X-Step', shortName: 'XSTEP' },
  { id: 24, name: 'Z-Step', shortName: 'ZSTEP' },
  { id: 25, name: 'Z-Pitch', shortName: 'ZPTCH' },
  { id: 26, name: 'Z-Mono Pitch', shortName: 'ZMPTH' },
  { id: 27, name: 'Z-Talking', shortName: 'ZTALK' },
];

/** Effect types for DLY module (7 types) */
export const DLY_TYPES: EffectType[] = [
  { id: 0, name: 'Delay', shortName: 'DELAY' },
  { id: 1, name: 'Ping Pong Delay', shortName: 'PPDLY' },
  { id: 2, name: 'Echo', shortName: 'ECHO' },
  { id: 3, name: 'Ping Pong Echo', shortName: 'PPECH' },
  { id: 4, name: 'Analog Delay', shortName: 'ANDLY' },
  { id: 5, name: 'Reverse Delay', shortName: 'REVDL' },
  { id: 6, name: 'Air', shortName: 'AIR' },
];

/** Effect types for REV module (15 types) */
export const REV_TYPES: EffectType[] = [
  { id: 0, name: 'Hall', shortName: 'HALL' },
  { id: 1, name: 'Room', shortName: 'ROOM' },
  { id: 2, name: 'Spring', shortName: 'SPRNG' },
  { id: 3, name: 'Arena', shortName: 'ARENA' },
  { id: 4, name: 'Tiled Room', shortName: 'TILED' },
  { id: 5, name: 'Modern Spring', shortName: 'MDSPR' },
  { id: 6, name: 'Early Reflection', shortName: 'EARLY' },
  { id: 7, name: 'Multi Tap Delay', shortName: 'MLTAP' },
  { id: 8, name: 'Panning Delay', shortName: 'PANDL' },
  { id: 9, name: 'Ping Pong Delay', shortName: 'PPDLY' },
  { id: 10, name: 'Ping Pong Echo', shortName: 'PPECH' },
  { id: 11, name: 'Auto Pan', shortName: 'AUTOPN' },
  { id: 12, name: 'Z-Delay', shortName: 'ZDLY' },
  { id: 13, name: 'Z-Dimension', shortName: 'ZDIM' },
  { id: 14, name: 'Z-Tornado', shortName: 'ZTRND' },
];

/** Modules that don't have effect types (fixed function) */
export const EXT_TYPES: EffectType[] = [
  { id: 0, name: 'External Loop', shortName: 'EXT' },
];

export const EQ_TYPES: EffectType[] = [
  { id: 0, name: '6-Band EQ', shortName: 'EQ' },
];

export const CAB_TYPES: EffectType[] = [
  { id: 0, name: 'Cabinet', shortName: 'CAB' },
];

/** Module to effect types mapping */
export const MODULE_EFFECT_TYPES: Record<ModuleName, EffectType[]> = {
  amp: AMP_TYPES,
  comp: COMP_TYPES,
  wah: WAH_TYPES,
  ext: EXT_TYPES,
  znr: ZNR_TYPES,
  eq: EQ_TYPES,
  cab: CAB_TYPES,
  mod: MOD_TYPES,
  dly: DLY_TYPES,
  rev: REV_TYPES,
};

/** Module display info */
export interface ModuleInfo {
  name: string;
  fullName: string;
  color: string;
  description: string;
}

/** Module display information */
export const MODULE_INFO: Record<ModuleName, ModuleInfo> = {
  comp: { name: 'COMP', fullName: 'Compressor', color: 'orange', description: 'Compressor/Limiter' },
  wah: { name: 'WAH', fullName: 'Wah/EFX1', color: 'green', description: 'Wah & Effects 1' },
  znr: { name: 'ZNR', fullName: 'ZNR', color: 'gray', description: 'Zoom Noise Reduction' },
  amp: { name: 'AMP', fullName: 'Amp', color: 'red', description: 'Amplifier/Distortion' },
  cab: { name: 'CAB', fullName: 'Cabinet', color: 'amber', description: 'Cabinet Simulator' },
  eq: { name: 'EQ', fullName: 'Equalizer', color: 'blue', description: '6-Band Equalizer' },
  mod: { name: 'MOD', fullName: 'Modulation', color: 'purple', description: 'Modulation/EFX2' },
  dly: { name: 'DLY', fullName: 'Delay', color: 'cyan', description: 'Delay Effects' },
  rev: { name: 'REV', fullName: 'Reverb', color: 'pink', description: 'Reverb Effects' },
  ext: { name: 'EXT', fullName: 'External', color: 'slate', description: 'External Loop' },
};

/** Signal chain order (how signal flows through the pedal) */
export const SIGNAL_CHAIN_ORDER: ModuleName[] = [
  'comp',
  'wah',
  'znr',
  'amp',
  'cab',
  'eq',
  'mod',
  'dly',
  'rev',
  'ext',
];

/**
 * Get the effect type name for a module and type ID
 */
export function getEffectTypeName(module: ModuleName, typeId: number): string {
  const types = MODULE_EFFECT_TYPES[module];
  const effectType = types.find(t => t.id === typeId);
  return effectType?.name ?? `Type ${typeId}`;
}

/**
 * Get the short effect type name for a module and type ID
 */
export function getEffectTypeShortName(module: ModuleName, typeId: number): string {
  const types = MODULE_EFFECT_TYPES[module];
  const effectType = types.find(t => t.id === typeId);
  return effectType?.shortName ?? effectType?.name ?? `T${typeId}`;
}

/**
 * Check if a module has multiple effect types
 */
export function hasMultipleTypes(module: ModuleName): boolean {
  return MODULE_EFFECT_TYPES[module].length > 1;
}
