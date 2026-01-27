/**
 * MIDI Protocol constants and message builders for Zoom G9.2tt
 */

// SysEx markers
export const SYSEX_START = 0xF0;
export const SYSEX_END = 0xF7;

// Universal SysEx
export const UNIVERSAL_NON_REALTIME = 0x7E;
export const GENERAL_INFORMATION = 0x06;
export const IDENTITY_REQUEST = 0x01;
export const IDENTITY_REPLY = 0x02;

// Zoom manufacturer ID
export const ZOOM_MANUFACTURER_ID = 0x52;

// G9.2tt identifiers (based on reverse engineering)
export const G9TT_DEVICE_ID = 0x00;  // Device ID used in SysEx
export const G9TT_MODEL_ID = 0x42;   // Model identifier

// G9.2tt Commands
export const CMD_READ_PATCH_REQUEST = 0x11;
export const CMD_READ_PATCH_RESPONSE = 0x21;
export const CMD_ENTER_EDIT = 0x12;
export const CMD_EXIT_EDIT = 0x1F;
export const CMD_WRITE_PATCH = 0x28;
export const CMD_PARAMETER_CHANGE = 0x31;

// Parameter IDs
export const PARAM_ON_OFF = 0x00;
export const PARAM_TYPE = 0x01;
export const PARAM_OFFSET = 0x02; // First effect parameter starts at 0x02

// G9.2tt Protocol header: F0 52 00 42
export const G9TT_HEADER = [SYSEX_START, ZOOM_MANUFACTURER_ID, G9TT_DEVICE_ID, G9TT_MODEL_ID];

/** Device identification result */
export interface DeviceIdentity {
  manufacturer: number;
  manufacturerName: string;
  family: number;
  model: number;
  version: number[];
  isZoom: boolean;
  isG9TT: boolean;
}

/**
 * Build a Universal MIDI Identity Request message.
 * This asks the device to identify itself.
 */
export function buildIdentityRequest(): Uint8Array {
  return new Uint8Array([
    SYSEX_START,
    UNIVERSAL_NON_REALTIME,
    0x00,  // Device ID (0 = all devices)
    GENERAL_INFORMATION,
    IDENTITY_REQUEST,
    SYSEX_END,
  ]);
}

/**
 * Parse a Universal MIDI Identity Reply message.
 * @param data The raw SysEx data
 * @returns Parsed device identity or null if not a valid identity reply
 */
export function parseIdentityResponse(data: Uint8Array): DeviceIdentity | null {
  // Minimum length check: F0 7E <id> 06 02 <manufacturer> <family-lo> <family-hi> <model-lo> <model-hi> <version...> F7
  if (data.length < 12) {
    return null;
  }

  // Check for identity reply header
  if (data[0] !== SYSEX_START ||
      data[1] !== UNIVERSAL_NON_REALTIME ||
      data[3] !== GENERAL_INFORMATION ||
      data[4] !== IDENTITY_REPLY) {
    return null;
  }

  // Extract manufacturer ID
  // Can be 1 byte or 3 bytes (if first byte is 0x00)
  let manufacturer: number;
  let offset: number;

  if (data[5] === 0x00) {
    // 3-byte manufacturer ID
    manufacturer = (data[6] ?? 0) << 8 | (data[7] ?? 0);
    offset = 8;
  } else {
    // 1-byte manufacturer ID
    manufacturer = data[5] ?? 0;
    offset = 6;
  }

  // Extract family (2 bytes, little-endian)
  const familyLo = data[offset] ?? 0;
  const familyHi = data[offset + 1] ?? 0;
  const family = (familyHi << 8) | familyLo;

  // Extract model (2 bytes, little-endian)
  const modelLo = data[offset + 2] ?? 0;
  const modelHi = data[offset + 3] ?? 0;
  const model = (modelHi << 8) | modelLo;

  // Extract version (4 bytes)
  const version: number[] = [];
  for (let i = offset + 4; i < data.length - 1 && version.length < 4; i++) {
    version.push(data[i] ?? 0);
  }

  // Determine manufacturer name
  let manufacturerName = 'Unknown';
  if (manufacturer === ZOOM_MANUFACTURER_ID) {
    manufacturerName = 'Zoom';
  }

  // Check if this is a Zoom G9.2tt
  const isZoom = manufacturer === ZOOM_MANUFACTURER_ID;
  const isG9TT = isZoom && (model === G9TT_MODEL_ID || family === G9TT_MODEL_ID);

  return {
    manufacturer,
    manufacturerName,
    family,
    model,
    version,
    isZoom,
    isG9TT,
  };
}

/**
 * Check if a SysEx message is an identity reply.
 */
export function isIdentityReply(data: Uint8Array): boolean {
  return data.length >= 6 &&
         data[0] === SYSEX_START &&
         data[1] === UNIVERSAL_NON_REALTIME &&
         data[3] === GENERAL_INFORMATION &&
         data[4] === IDENTITY_REPLY;
}

// ============================================
// Patch Reading Protocol
// ============================================

/**
 * Build a patch read request message.
 * Format: F0 52 00 42 11 [PATCH] F7
 * @param patchId Patch number (0-99)
 */
export function buildReadPatchMessage(patchId: number): Uint8Array {
  if (patchId < 0 || patchId > 99) {
    throw new Error(`Invalid patch ID: ${patchId}. Must be 0-99.`);
  }
  return new Uint8Array([
    ...G9TT_HEADER,
    CMD_READ_PATCH_REQUEST,
    patchId,
    SYSEX_END,
  ]);
}

/**
 * Check if a SysEx message is a patch read response.
 * Format: F0 52 00 42 21 [PATCH] [256 NIBBLES] [5 CHECKSUM] F7
 * Total length: 268 bytes
 */
export function isPatchReadResponse(data: Uint8Array): boolean {
  return data.length === 268 &&
         data[0] === SYSEX_START &&
         data[1] === ZOOM_MANUFACTURER_ID &&
         data[2] === G9TT_DEVICE_ID &&
         data[3] === G9TT_MODEL_ID &&
         data[4] === CMD_READ_PATCH_RESPONSE;
}

/**
 * Get the patch ID from a patch read response.
 */
export function getPatchIdFromResponse(data: Uint8Array): number {
  return data[5] ?? 0;
}

/**
 * Decode nibble-encoded patch data from a read response.
 * Converts 256 nibbles to 128 bytes.
 * @param data The raw 268-byte SysEx response
 * @returns 128 bytes of raw patch data
 */
export function decodeNibbles(data: Uint8Array): Uint8Array {
  // Extract 256 nibbles (bytes 6-261)
  const nibbles = data.slice(6, 262);
  const decoded = new Uint8Array(128);

  for (let i = 0; i < 128; i++) {
    const highNibble = (nibbles[i * 2] ?? 0) & 0x0F;
    const lowNibble = (nibbles[i * 2 + 1] ?? 0) & 0x0F;
    decoded[i] = (highNibble << 4) | lowNibble;
  }

  return decoded;
}

// Bit width table for parsing patch data (from Python library constants.py)
// 12 rows (modules) x 8 columns (parameters)
const BIT_TBL = [
  // Row 0: Global - PatchLevel in column 5
  [0, 0, 0, 0, 0, 7, 0, 0],
  // Row 1: CMP (onoff:1, type:2, parm1:6, parm2:4, parm3:4, parm4:6)
  [1, 2, 6, 4, 4, 6, 0, 0],
  // Row 2: WAH (onoff:1, type:5, parm1:7, parm2:7, parm3:6, parm4:6)
  [1, 5, 7, 7, 6, 6, 0, 0],
  // Row 3: EXT (onoff:1, ?, parm1:7, parm2:7, parm3:7)
  [1, 0, 7, 7, 7, 0, 0, 0],
  // Row 4: ZNR-A (onoff:1, type:2, parm1:4)
  [1, 2, 4, 0, 0, 0, 0, 0],
  // Row 5: AMP-A (onoff:1, type:6, parm1:7, parm2:5, parm3:7, parm4:1)
  [1, 6, 7, 5, 7, 1, 0, 0],
  // Row 6: EQ-A (onoff:1, ?, parm1-6: 5 bits each)
  [1, 0, 5, 5, 5, 5, 5, 5],
  // Row 7: CAB (onoff:1, ?, parm1:1, parm2:2, parm3:2)
  [1, 0, 1, 2, 2, 0, 0, 0],
  // Row 8: MOD (onoff:1, type:5, parm1:11, parm2-4:7 bits)
  [1, 5, 11, 7, 7, 7, 0, 0],
  // Row 9: DLY (onoff:1, type:3, parm1:13, parm2:6, parm3:4, parm4:6)
  [1, 3, 13, 6, 4, 6, 0, 0],
  // Row 10: REV (onoff:1, type:4, parm1:12, parm2:7, parm3:6, parm4:6)
  [1, 4, 12, 7, 6, 6, 0, 0],
  // Row 11: Empty (ZNR-B, AMP-B, EQ-B are at direct offsets, not bit-packed)
  [0, 0, 0, 0, 0, 0, 0, 0],
];

/**
 * Unpack bit-packed values from patch data.
 * The patch data is organized as 12 rows with varying bit widths.
 */
function unpackBits(data: Uint8Array): number[][] {
  const result: number[][] = [];
  let bitPos = 0;

  for (let row = 0; row < 12; row++) {
    const rowData: number[] = [];
    const rowWidths = BIT_TBL[row];
    if (!rowWidths) continue;

    for (let col = 0; col < 8; col++) {
      const width = rowWidths[col];
      if (!width || width === 0) {
        rowData.push(0);
        continue;
      }

      // Extract 'width' bits starting at bitPos
      let value = 0;
      for (let b = 0; b < width; b++) {
        const byteIndex = Math.floor((bitPos + b) / 8);
        const bitIndex = (bitPos + b) % 8;
        if (byteIndex < data.length) {
          const byte = data[byteIndex] ?? 0;
          if (byte & (1 << bitIndex)) {
            value |= (1 << b);
          }
        }
      }
      rowData.push(value);
      bitPos += width;
    }
    result.push(rowData);
  }

  return result;
}

/**
 * Extract patch name from raw data.
 * Name is stored in bytes 65-74 (10 characters) at offset 0x41.
 */
function extractPatchName(data: Uint8Array): string {
  const nameBytes = data.slice(65, 75);
  let name = '';
  for (const byte of nameBytes) {
    if (byte >= 32 && byte <= 126) {
      name += String.fromCharCode(byte);
    } else {
      name += ' ';
    }
  }
  return name;
}

/** Parsed raw patch data before conversion to Patch object */
export interface RawPatchData {
  patchId: number;
  name: string;
  level: number;
  ampSel: number; // 0=A, 1=B - determines which amp/znr/eq channel is active
  modules: {
    cmp: { enabled: boolean; type: number; params: number[] };
    wah: { enabled: boolean; type: number; params: number[] };
    ext: { enabled: boolean; params: number[] };
    znr: { enabled: boolean; type: number; params: number[] };  // Active channel (A or B based on ampSel)
    amp: { enabled: boolean; type: number; params: number[] };  // Active channel (A or B based on ampSel)
    eq: { enabled: boolean; params: number[] };                 // Active channel (A or B based on ampSel)
    cab: { enabled: boolean; params: number[] };
    mod: { enabled: boolean; type: number; params: number[] };
    dly: { enabled: boolean; type: number; params: number[] };
    rev: { enabled: boolean; type: number; params: number[] };
  };
}

// Direct offsets for Channel B data (non-bit-packed)
const DIRECT_OFFSETS = {
  ZnrB_onoff: 0x24,   // 36
  ZnrB_type: 0x25,    // 37
  ZnrB_parm1: 0x26,   // 38 (threshold)
  AmpB_onoff: 0x2C,   // 44
  AmpB_type: 0x2D,    // 45
  AmpB_parm1: 0x2E,   // 46 (gain)
  AmpB_parm2: 0x2F,   // 47 (tone)
  AmpB_parm3: 0x30,   // 48 (level)
  EqB_onoff: 0x34,    // 52
  EqB_parm1: 0x36,    // 54
  EqB_parm2: 0x37,    // 55
  EqB_parm3: 0x38,    // 56
  EqB_parm4: 0x39,    // 57
  EqB_parm5: 0x3A,    // 58
  EqB_parm6: 0x3B,    // 59
  AmpSel: 0x3C,       // 60 (0=A, 1=B)
  Tempo: 0x3D,        // 61 (actual = raw + 40)
};

/**
 * Parse a patch read response into structured data.
 * @param data The raw 268-byte SysEx response
 * @returns Parsed patch data
 */
export function parsePatchResponse(data: Uint8Array): RawPatchData | null {
  if (!isPatchReadResponse(data)) {
    return null;
  }

  const patchId = getPatchIdFromResponse(data);
  const rawData = decodeNibbles(data);
  const unpacked = unpackBits(rawData);
  const name = extractPatchName(rawData);

  // Extract level from row 0, column 5 (global)
  const globalRow = unpacked[0] ?? [0, 0, 0, 0, 0, 0, 0, 0];
  const level = globalRow[5] ?? 80;

  // Extract ampSel from direct offset (0=A, 1=B)
  const ampSel = rawData[DIRECT_OFFSETS.AmpSel] ?? 0;

  // Extract module data from rows 1-11 (Channel A - bit-packed)
  const cmpRow = unpacked[1] ?? [];
  const wahRow = unpacked[2] ?? [];
  const extRow = unpacked[3] ?? [];
  const znrARow = unpacked[4] ?? [];
  const ampARow = unpacked[5] ?? [];
  const eqARow = unpacked[6] ?? [];
  const cabRow = unpacked[7] ?? [];
  const modRow = unpacked[8] ?? [];
  const dlyRow = unpacked[9] ?? [];
  const revRow = unpacked[10] ?? [];

  // Extract Channel B data from direct offsets
  const znrB = {
    enabled: (rawData[DIRECT_OFFSETS.ZnrB_onoff] ?? 0) === 1,
    type: rawData[DIRECT_OFFSETS.ZnrB_type] ?? 0,
    params: [rawData[DIRECT_OFFSETS.ZnrB_parm1] ?? 0],
  };

  const ampB = {
    enabled: (rawData[DIRECT_OFFSETS.AmpB_onoff] ?? 0) === 1,
    type: rawData[DIRECT_OFFSETS.AmpB_type] ?? 0,
    params: [
      rawData[DIRECT_OFFSETS.AmpB_parm1] ?? 0,  // gain
      rawData[DIRECT_OFFSETS.AmpB_parm2] ?? 0,  // tone
      rawData[DIRECT_OFFSETS.AmpB_parm3] ?? 0,  // level
    ],
  };

  const eqB = {
    enabled: (rawData[DIRECT_OFFSETS.EqB_onoff] ?? 0) === 1,
    params: [
      rawData[DIRECT_OFFSETS.EqB_parm1] ?? 16,
      rawData[DIRECT_OFFSETS.EqB_parm2] ?? 16,
      rawData[DIRECT_OFFSETS.EqB_parm3] ?? 16,
      rawData[DIRECT_OFFSETS.EqB_parm4] ?? 16,
      rawData[DIRECT_OFFSETS.EqB_parm5] ?? 16,
      rawData[DIRECT_OFFSETS.EqB_parm6] ?? 16,
    ],
  };

  // Channel A data (from bit-packed matrix)
  const znrA = {
    enabled: (znrARow[0] ?? 0) === 1,
    type: znrARow[1] ?? 0,
    params: [znrARow[2] ?? 0],
  };

  const ampA = {
    enabled: (ampARow[0] ?? 0) === 1,
    type: ampARow[1] ?? 0,
    params: [ampARow[2] ?? 0, ampARow[3] ?? 0, ampARow[4] ?? 0],
  };

  const eqA = {
    enabled: (eqARow[0] ?? 0) === 1,
    params: [eqARow[2] ?? 16, eqARow[3] ?? 16, eqARow[4] ?? 16, eqARow[5] ?? 16, eqARow[6] ?? 16, eqARow[7] ?? 16],
  };

  // Select the active channel based on ampSel
  const activeZnr = ampSel === 0 ? znrA : znrB;
  const activeAmp = ampSel === 0 ? ampA : ampB;
  const activeEq = ampSel === 0 ? eqA : eqB;

  return {
    patchId,
    name,
    level,
    ampSel,
    modules: {
      cmp: {
        enabled: (cmpRow[0] ?? 0) === 1,
        type: cmpRow[1] ?? 0,
        params: [cmpRow[2] ?? 0, cmpRow[3] ?? 0, cmpRow[4] ?? 0, cmpRow[5] ?? 0],
      },
      wah: {
        enabled: (wahRow[0] ?? 0) === 1,
        type: wahRow[1] ?? 0,
        params: [wahRow[2] ?? 0, wahRow[3] ?? 0, wahRow[4] ?? 0, wahRow[5] ?? 0],
      },
      ext: {
        enabled: (extRow[0] ?? 0) === 1,
        params: [extRow[2] ?? 0, extRow[3] ?? 0, extRow[4] ?? 0],
      },
      znr: activeZnr,
      amp: activeAmp,
      eq: activeEq,
      cab: {
        enabled: (cabRow[0] ?? 0) === 1,
        params: [cabRow[2] ?? 0, cabRow[3] ?? 0, cabRow[4] ?? 0],
      },
      mod: {
        enabled: (modRow[0] ?? 0) === 1,
        type: modRow[1] ?? 0,
        params: [modRow[2] ?? 0, modRow[3] ?? 0, modRow[4] ?? 0, modRow[5] ?? 0],
      },
      dly: {
        enabled: (dlyRow[0] ?? 0) === 1,
        type: dlyRow[1] ?? 0,
        params: [dlyRow[2] ?? 0, dlyRow[3] ?? 0, dlyRow[4] ?? 0, dlyRow[5] ?? 0],
      },
      rev: {
        enabled: (revRow[0] ?? 0) === 1,
        type: revRow[1] ?? 0,
        params: [revRow[2] ?? 0, revRow[3] ?? 0, revRow[4] ?? 0, revRow[5] ?? 0],
      },
    },
  };
}

// ============================================
// Real-Time Parameter Control Protocol
// ============================================

/** Module name to MIDI effect ID mapping */
export const MODULE_EFFECT_IDS: Record<string, number> = {
  comp: 0x01,
  wah: 0x02,
  ext: 0x03,
  znr: 0x04,
  amp: 0x05,
  eq: 0x06,
  cab: 0x07,
  mod: 0x08,
  dly: 0x09,
  rev: 0x0A,
};

/**
 * Build a parameter change message for real-time control.
 * Format: F0 52 00 42 31 [EFFECT_ID] [PARAM_ID] [VALUE] 00 F7
 * @param moduleKey Module name (amp, comp, etc.)
 * @param paramId MIDI parameter ID (0x00=On/Off, 0x01=Type, 0x02+=parameters)
 * @param value Parameter value (0-127)
 * @returns SysEx message bytes
 */
export function buildParameterMessage(
  moduleKey: string,
  paramId: number,
  value: number
): Uint8Array {
  const effectId = MODULE_EFFECT_IDS[moduleKey];
  if (effectId === undefined) {
    throw new Error(`Unknown module: ${moduleKey}`);
  }

  // Clamp value to 0-127 (MIDI data byte range)
  // Note: Some parameters (DLY time, MOD depth) can exceed 127 but
  // require special 2-byte encoding not yet implemented
  const clampedValue = Math.max(0, Math.min(127, Math.round(value)));

  const message = new Uint8Array([
    ...G9TT_HEADER,
    CMD_PARAMETER_CHANGE,
    effectId,
    paramId,
    clampedValue,
    0x00,
    SYSEX_END,
  ]);

  console.log(`[Protocol] buildParameterMessage: module=${moduleKey}(0x${effectId.toString(16)}) paramId=0x${paramId.toString(16)} value=${value}(clamped=${clampedValue})`);

  return message;
}

/**
 * Build a module type change message.
 * Format: F0 52 00 42 31 [EFFECT_ID] 01 [TYPE_ID] 00 F7
 * @param moduleKey Module name (amp, comp, etc.)
 * @param typeId Effect type ID
 * @returns SysEx message bytes
 */
export function buildModuleTypeMessage(
  moduleKey: string,
  typeId: number
): Uint8Array {
  const effectId = MODULE_EFFECT_IDS[moduleKey];
  if (effectId === undefined) {
    throw new Error(`Unknown module: ${moduleKey}`);
  }

  // Clamp type to 0-127
  const clampedType = Math.max(0, Math.min(127, Math.round(typeId)));

  return new Uint8Array([
    ...G9TT_HEADER,
    CMD_PARAMETER_CHANGE,
    effectId,
    PARAM_TYPE,
    clampedType,
    0x00,
    SYSEX_END,
  ]);
}

/**
 * Build a module on/off toggle message.
 * Format: F0 52 00 42 31 [EFFECT_ID] 00 [0/1] 00 F7
 * @param moduleKey Module name (amp, comp, etc.)
 * @param enabled Whether the module should be enabled
 * @returns SysEx message bytes
 */
export function buildModuleToggleMessage(
  moduleKey: string,
  enabled: boolean
): Uint8Array {
  const effectId = MODULE_EFFECT_IDS[moduleKey];
  if (effectId === undefined) {
    throw new Error(`Unknown module: ${moduleKey}`);
  }

  return new Uint8Array([
    ...G9TT_HEADER,
    CMD_PARAMETER_CHANGE,
    effectId,
    PARAM_ON_OFF,
    enabled ? 0x01 : 0x00,
    0x00,
    SYSEX_END,
  ]);
}

// ============================================
// Patch Writing Protocol
// ============================================

/**
 * Build enter edit mode message.
 * Format: F0 52 00 42 12 F7
 * Required before write operations.
 */
export function buildEnterEditMessage(): Uint8Array {
  return new Uint8Array([
    ...G9TT_HEADER,
    CMD_ENTER_EDIT,
    SYSEX_END,
  ]);
}

/**
 * Build exit edit mode message.
 * Format: F0 52 00 42 1F F7
 */
export function buildExitEditMessage(): Uint8Array {
  return new Uint8Array([
    ...G9TT_HEADER,
    CMD_EXIT_EDIT,
    SYSEX_END,
  ]);
}

/**
 * Build patch select/confirm message.
 * Format: F0 52 00 42 31 [PATCH] 02 [MODE] 00 F7
 * @param patchId Patch number (0-99)
 * @param mode Operation mode (0x02=preview, 0x09=confirm write)
 */
export function buildPatchSelectMessage(patchId: number, mode: number): Uint8Array {
  if (patchId < 0 || patchId > 99) {
    throw new Error(`Invalid patch ID: ${patchId}. Must be 0-99.`);
  }

  return new Uint8Array([
    ...G9TT_HEADER,
    CMD_PARAMETER_CHANGE,
    patchId,
    0x02,
    mode,
    0x00,
    SYSEX_END,
  ]);
}

/**
 * Encode raw bytes to 7-bit MIDI-safe format.
 * Conversion: 128 bytes → 147 bytes
 *
 * Structure: Every 7 bytes → 8 transmitted bytes
 * - 7 data bytes (bit 7 stripped, all values < 128)
 * - 1 byte containing the 7 high bits
 *
 * @param data 128 bytes of raw data
 * @returns 147 bytes of 7-bit encoded data (MIDI-safe)
 */
export function encode7bit(data: Uint8Array): Uint8Array {
  if (data.length !== 128) {
    throw new Error(`Expected 128 bytes, got ${data.length}`);
  }

  const result: number[] = [];

  for (let i = 0; i < 128; i += 7) {
    let highBits = 0;

    for (let j = 0; j < 7 && i + j < 128; j++) {
      const byte = data[i + j] ?? 0;
      if (byte & 0x80) {
        highBits |= (1 << j);
      }
      result.push(byte & 0x7f);
    }

    result.push(highBits);
  }

  // Ensure exact size of 147 bytes
  while (result.length < 147) {
    result.push(0x00);
  }

  return new Uint8Array(result.slice(0, 147));
}

/**
 * Pack values back into bit-packed format using BIT_TBL.
 * @param matrix 12x8 matrix of values to pack
 * @returns Bit-packed bytes (first ~36 bytes of patch data)
 */
function packBits(matrix: number[][]): Uint8Array {
  // Calculate total bits needed
  let totalBits = 0;
  for (const row of BIT_TBL) {
    for (const width of row) {
      totalBits += width;
    }
  }
  const totalBytes = Math.ceil(totalBits / 8);

  const packed = new Uint8Array(totalBytes);
  let bitPos = 0;

  for (let row = 0; row < 12; row++) {
    const rowWidths = BIT_TBL[row];
    const rowData = matrix[row];
    if (!rowWidths || !rowData) continue;

    for (let col = 0; col < 8; col++) {
      const width = rowWidths[col];
      if (!width || width === 0) continue;

      const value = rowData[col] ?? 0;

      // Write 'width' bits starting at bitPos
      for (let b = 0; b < width; b++) {
        if (value & (1 << b)) {
          const byteIndex = Math.floor(bitPos / 8);
          const bitIndex = bitPos % 8;
          if (byteIndex < packed.length) {
            packed[byteIndex] = (packed[byteIndex] ?? 0) | (1 << bitIndex);
          }
        }
        bitPos++;
      }
    }
  }

  return packed;
}

/**
 * Encode patch name to 10 bytes.
 * @param name Patch name (up to 10 characters)
 * @returns 10 bytes of ASCII data
 */
function encodePatchName(name: string): Uint8Array {
  const result = new Uint8Array(10);
  const trimmed = name.slice(0, 10).padEnd(10, ' ');

  for (let i = 0; i < 10; i++) {
    const char = trimmed.charCodeAt(i);
    // Only allow printable ASCII
    result[i] = (char >= 32 && char <= 126) ? char : 32;
  }

  return result;
}

import type { Patch } from '../../types/patch';

// ============================================
// Nibble Encoding for Bulk Write (READ_RESP format)
// ============================================

/**
 * Encode 128 bytes to 256 nibbles for READ_RESP format.
 * Each byte is split into high nibble and low nibble.
 * @param data 128 bytes of raw patch data
 * @returns 256 nibbles
 */
export function encodeNibbles(data: Uint8Array): Uint8Array {
  if (data.length !== 128) {
    throw new Error(`Expected 128 bytes, got ${data.length}`);
  }

  const nibbles = new Uint8Array(256);

  for (let i = 0; i < 128; i++) {
    const byte = data[i] ?? 0;
    nibbles[i * 2] = (byte >> 4) & 0x0F;      // High nibble
    nibbles[i * 2 + 1] = byte & 0x0F;          // Low nibble
  }

  return nibbles;
}

/**
 * Calculate CRC-32 checksum for patch data.
 * Uses polynomial 0xEDB88320 with initial value 0xFFFFFFFF.
 * @param data 128 bytes of raw patch data
 * @returns 32-bit CRC value
 */
function calculateCrc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;

  for (let i = 0; i < data.length; i++) {
    const byte = data[i] ?? 0;
    crc ^= byte;

    for (let bit = 0; bit < 8; bit++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }

  return crc >>> 0; // Ensure unsigned
}

/**
 * Encode CRC-32 to 5 bytes of 7-bit values.
 * Splits 32-bit CRC into 5 groups of 7 bits (last has 4 bits).
 * @param crc 32-bit CRC value
 * @returns 5 bytes
 */
function encodeCrc7bit(crc: number): Uint8Array {
  const result = new Uint8Array(5);
  result[0] = (crc & 0x7F);           // bits 0-6
  result[1] = ((crc >> 7) & 0x7F);    // bits 7-13
  result[2] = ((crc >> 14) & 0x7F);   // bits 14-20
  result[3] = ((crc >> 21) & 0x7F);   // bits 21-27
  result[4] = ((crc >> 28) & 0x0F);   // bits 28-31 (only 4 bits)
  return result;
}

/**
 * Calculate 5-byte checksum for patch data.
 * @param data 128 bytes of raw patch data
 * @returns 5 bytes checksum
 */
export function calculateChecksum(data: Uint8Array): Uint8Array {
  const crc = calculateCrc32(data);
  return encodeCrc7bit(crc);
}

/**
 * Build a READ_RESP (0x21) message for bulk write.
 * This is the format used when the pedal requests patch data during bulk transfer.
 *
 * Format: F0 52 00 42 21 [PATCH] [256 NIBBLES] [5 CHECKSUM] F7
 * Total: 268 bytes
 *
 * @param patchId Patch number (0-99)
 * @param patchData 128 bytes of raw patch data
 * @returns 268-byte SysEx message
 */
export function buildReadResponseMessage(patchId: number, patchData: Uint8Array): Uint8Array {
  if (patchId < 0 || patchId > 99) {
    throw new Error(`Invalid patch ID: ${patchId}. Must be 0-99.`);
  }

  if (patchData.length !== 128) {
    throw new Error(`Expected 128 bytes of patch data, got ${patchData.length}`);
  }

  const nibbles = encodeNibbles(patchData);
  const checksum = calculateChecksum(patchData);

  const result = new Uint8Array(268);

  // Header: F0 52 00 42 21 [PATCH]
  result[0] = SYSEX_START;
  result[1] = ZOOM_MANUFACTURER_ID;
  result[2] = G9TT_DEVICE_ID;
  result[3] = G9TT_MODEL_ID;
  result[4] = CMD_READ_PATCH_RESPONSE;
  result[5] = patchId;

  // 256 nibbles (bytes 6-261)
  result.set(nibbles, 6);

  // 5-byte checksum (bytes 262-266)
  result.set(checksum, 262);

  // End
  result[267] = SYSEX_END;

  return result;
}

/**
 * Check if a SysEx message is a READ_REQ (pedal requesting patch data).
 * Format: F0 52 00 42 11 [PATCH] F7
 */
export function isReadRequest(data: Uint8Array): boolean {
  return data.length === 7 &&
         data[0] === SYSEX_START &&
         data[1] === ZOOM_MANUFACTURER_ID &&
         data[2] === G9TT_DEVICE_ID &&
         data[3] === G9TT_MODEL_ID &&
         data[4] === CMD_READ_PATCH_REQUEST &&
         data[6] === SYSEX_END;
}

/**
 * Get the patch ID from a READ_REQ message.
 */
export function getRequestedPatchId(data: Uint8Array): number {
  return data[5] ?? 0;
}

/**
 * Check if a SysEx message is an EDIT_EXIT (pedal signaling end of bulk transfer).
 * Format: F0 52 00 42 1F F7
 */
export function isEditExit(data: Uint8Array): boolean {
  return data.length === 6 &&
         data[0] === SYSEX_START &&
         data[1] === ZOOM_MANUFACTURER_ID &&
         data[2] === G9TT_DEVICE_ID &&
         data[3] === G9TT_MODEL_ID &&
         data[4] === CMD_EXIT_EDIT &&
         data[5] === SYSEX_END;
}

/**
 * Serialize a Patch object to 128 bytes of raw patch data.
 * @param patch The Patch object to serialize
 * @returns 128 bytes of raw patch data
 */
export function serializePatch(patch: Patch): Uint8Array {
  // Build the 12x8 matrix for bit packing
  const matrix: number[][] = [
    // Row 0: Global (level)
    [patch.level, 0, 0, 0, 0, 0, 0, 0],
    // Row 1: CMP
    [
      patch.modules.comp.enabled ? 1 : 0,
      patch.modules.comp.type,
      patch.modules.comp.params[0] ?? 0,
      patch.modules.comp.params[1] ?? 0,
      patch.modules.comp.params[2] ?? 0,
      patch.modules.comp.params[3] ?? 0,
      0, 0,
    ],
    // Row 2: WAH
    [
      patch.modules.wah.enabled ? 1 : 0,
      patch.modules.wah.type,
      patch.modules.wah.params[0] ?? 0,
      patch.modules.wah.params[1] ?? 0,
      patch.modules.wah.params[2] ?? 0,
      patch.modules.wah.params[3] ?? 0,
      0, 0,
    ],
    // Row 3: EXT
    [
      patch.modules.ext.enabled ? 1 : 0,
      0,
      patch.modules.ext.params[0] ?? 0,
      patch.modules.ext.params[1] ?? 0,
      patch.modules.ext.params[2] ?? 0,
      0, 0, 0,
    ],
    // Row 4: ZNR
    [
      patch.modules.znr.enabled ? 1 : 0,
      patch.modules.znr.type,
      patch.modules.znr.params[0] ?? 0,
      0, 0, 0, 0, 0,
    ],
    // Row 5: AMP
    [
      patch.modules.amp.enabled ? 1 : 0,
      patch.modules.amp.type,
      patch.modules.amp.params[0] ?? 0,
      patch.modules.amp.params[1] ?? 0,
      patch.modules.amp.params[2] ?? 0,
      patch.modules.amp.params[3] ?? 0,
      0, 0,
    ],
    // Row 6: EQ
    [
      patch.modules.eq.enabled ? 1 : 0,
      0,
      patch.modules.eq.params[0] ?? 16,
      patch.modules.eq.params[1] ?? 16,
      patch.modules.eq.params[2] ?? 16,
      patch.modules.eq.params[3] ?? 16,
      patch.modules.eq.params[4] ?? 16,
      patch.modules.eq.params[5] ?? 16,
    ],
    // Row 7: CAB
    [
      patch.modules.cab.enabled ? 1 : 0,
      0,
      patch.modules.cab.params[0] ?? 0,
      patch.modules.cab.params[1] ?? 0,
      patch.modules.cab.params[2] ?? 0,
      0, 0, 0,
    ],
    // Row 8: MOD
    [
      patch.modules.mod.enabled ? 1 : 0,
      patch.modules.mod.type,
      patch.modules.mod.params[0] ?? 0,
      patch.modules.mod.params[1] ?? 0,
      patch.modules.mod.params[2] ?? 0,
      patch.modules.mod.params[3] ?? 0,
      0, 0,
    ],
    // Row 9: DLY
    [
      patch.modules.dly.enabled ? 1 : 0,
      patch.modules.dly.type,
      patch.modules.dly.params[0] ?? 0,
      patch.modules.dly.params[1] ?? 0,
      patch.modules.dly.params[2] ?? 0,
      patch.modules.dly.params[3] ?? 0,
      0, 0,
    ],
    // Row 10: REV
    [
      patch.modules.rev.enabled ? 1 : 0,
      patch.modules.rev.type,
      patch.modules.rev.params[0] ?? 0,
      patch.modules.rev.params[1] ?? 0,
      patch.modules.rev.params[2] ?? 0,
      patch.modules.rev.params[3] ?? 0,
      0, 0,
    ],
    // Row 11: Extra (ZNR-B, AMP-B, EQ-B) - use defaults
    [1, 0, 0, 1, 0, 0, 0, 0],
  ];

  // Pack the bits
  const packedData = packBits(matrix);

  // Build full 128-byte patch data
  const result = new Uint8Array(128);

  // Copy bit-packed data
  result.set(packedData, 0);

  // Copy patch name (bytes 65-74, offset 0x41)
  const nameBytes = encodePatchName(patch.name);
  result.set(nameBytes, 65);

  return result;
}

/**
 * Build write patch data message.
 * Format: F0 52 00 42 28 [147 BYTES] F7
 * @param patchData 128 bytes raw or 147 bytes 7-bit encoded
 * @returns 153-byte SysEx message
 */
export function buildWritePatchMessage(patchData: Uint8Array): Uint8Array {
  let encoded: Uint8Array;

  if (patchData.length === 128) {
    encoded = encode7bit(patchData);
  } else if (patchData.length === 147) {
    encoded = patchData;
  } else {
    throw new Error(`Patch data must be 128 or 147 bytes, got ${patchData.length}`);
  }

  const result = new Uint8Array(153);
  result.set(G9TT_HEADER, 0);
  result[4] = CMD_WRITE_PATCH;
  result.set(encoded, 5);
  result[152] = SYSEX_END;

  return result;
}
