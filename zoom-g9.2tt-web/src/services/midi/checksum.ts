/**
 * CRC-32 Checksum for Zoom G9.2tt
 *
 * Algorithm discovered by disassembling G9ED.exe:
 * 1. Calculate CRC-32 over 128 decoded bytes with init=0xFFFFFFFF
 * 2. Encode the 32-bit CRC as 5 bytes of 7-bit values
 *
 * Uses standard CRC-32 polynomial: 0xEDB88320
 */

// CRC-32 lookup table (standard polynomial 0xEDB88320)
let CRC32_TABLE: number[] | null = null;

/**
 * Initialize the CRC-32 lookup table.
 */
function initCrc32Table(): void {
  if (CRC32_TABLE !== null) return;

  const poly = 0xedb88320;
  CRC32_TABLE = [];

  for (let i = 0; i < 256; i++) {
    let crc = i;
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ poly;
      } else {
        crc = crc >>> 1;
      }
    }
    CRC32_TABLE.push(crc >>> 0); // Ensure unsigned
  }
}

/**
 * Calculate CRC-32 over data bytes.
 * @param data Bytes to calculate CRC over
 * @param init Initial CRC value (default 0xFFFFFFFF)
 * @returns 32-bit CRC value
 */
export function calculateCrc32(data: Uint8Array, init: number = 0xffffffff): number {
  initCrc32Table();

  let crc = init >>> 0; // Ensure unsigned

  for (let i = 0; i < data.length; i++) {
    const byte = data[i] ?? 0;
    const tableIndex = (crc ^ byte) & 0xff;
    const tableValue = CRC32_TABLE?.[tableIndex] ?? 0;
    crc = tableValue ^ ((crc >>> 8) & 0x00ffffff);
  }

  return crc >>> 0; // Ensure unsigned
}

/**
 * Encode a 32-bit CRC as 5 bytes of 7-bit values.
 *
 * The G9.2tt uses 7-bit encoding for MIDI safety:
 * - Byte 0: bits 0-6
 * - Byte 1: bits 7-13
 * - Byte 2: bits 14-20
 * - Byte 3: bits 21-27
 * - Byte 4: bits 28-31 (only 4 bits used)
 *
 * @param crc 32-bit CRC value
 * @returns 5 bytes, each < 128 (MIDI-safe)
 */
export function encodeCrc7bit(crc: number): Uint8Array {
  return new Uint8Array([
    crc & 0x7f,
    (crc >>> 7) & 0x7f,
    (crc >>> 14) & 0x7f,
    (crc >>> 21) & 0x7f,
    (crc >>> 28) & 0x7f,
  ]);
}

/**
 * Decode 5 bytes of 7-bit values to a 32-bit CRC.
 * @param checksumBytes 5 bytes of 7-bit encoded CRC
 * @returns 32-bit CRC value
 */
export function decodeCrc7bit(checksumBytes: Uint8Array): number {
  if (checksumBytes.length !== 5) {
    throw new Error(`Expected 5 bytes, got ${checksumBytes.length}`);
  }

  const b0 = checksumBytes[0] ?? 0;
  const b1 = checksumBytes[1] ?? 0;
  const b2 = checksumBytes[2] ?? 0;
  const b3 = checksumBytes[3] ?? 0;
  const b4 = checksumBytes[4] ?? 0;

  return (b0 | (b1 << 7) | (b2 << 14) | (b3 << 21) | (b4 << 28)) >>> 0;
}

/**
 * Calculate the 5-byte checksum for a patch.
 * @param patchData 128 bytes of decoded patch data
 * @returns 5 bytes of checksum (7-bit encoded CRC-32)
 */
export function calculatePatchChecksum(patchData: Uint8Array): Uint8Array {
  if (patchData.length !== 128) {
    throw new Error(`Expected 128 bytes, got ${patchData.length}`);
  }

  const crc = calculateCrc32(patchData);
  return encodeCrc7bit(crc);
}

/**
 * Verify the checksum of a READ_RESP message.
 * @param response Complete 268-byte message with F0 and F7
 * @returns true if checksum is valid
 */
export function verifyReadResponseChecksum(response: Uint8Array): boolean {
  if (response.length !== 268) {
    return false;
  }

  // Extract nibbles (bytes 6-261, 256 nibbles)
  const nibbles = response.slice(6, 262);

  // Extract received checksum (bytes 262-266)
  const receivedChecksum = response.slice(262, 267);
  const receivedCrc = decodeCrc7bit(receivedChecksum);

  // Decode nibbles to 128 bytes
  const decoded = decodeNibbles(nibbles);

  // Calculate CRC
  const calculatedCrc = calculateCrc32(decoded);

  return receivedCrc === calculatedCrc;
}

/**
 * Decode 256 nibbles to 128 bytes.
 * @param nibbles 256 nibble-encoded bytes
 * @returns 128 decoded bytes
 */
function decodeNibbles(nibbles: Uint8Array): Uint8Array {
  if (nibbles.length !== 256) {
    throw new Error(`Expected 256 nibbles, got ${nibbles.length}`);
  }

  const decoded = new Uint8Array(128);
  for (let i = 0; i < 128; i++) {
    const high = (nibbles[i * 2] ?? 0) & 0x0f;
    const low = (nibbles[i * 2 + 1] ?? 0) & 0x0f;
    decoded[i] = (high << 4) | low;
  }

  return decoded;
}
