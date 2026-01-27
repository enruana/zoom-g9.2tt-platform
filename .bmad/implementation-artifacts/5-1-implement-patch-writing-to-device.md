# Story 5.1: Implement Patch Writing to Device

Status: done

## Story

As a **developer**,
I want **to write patch data to the G9.2tt with correct checksum**,
So that **users can save their edited patches to the device**.

## Acceptance Criteria

1. **AC1:** Given I have a modified patch in memory ✅
2. **AC2:** When the app needs to write it to the device ✅
3. **AC3:** Then `MidiService.writePatch(patchId, patchData)` serializes the patch ✅
4. **AC4:** And `src/services/midi/protocol.ts` exports `buildWritePatchMessage(patchId, data)` function ✅
5. **AC5:** And `src/services/midi/checksum.ts` implements the CRC-32 algorithm ✅
6. **AC6:** And the checksum is calculated and appended to the SysEx message ✅
7. **AC7:** And the write command (0x28) is sent to the device ✅
8. **AC8:** And the service waits for acknowledgment from the device ✅
9. **AC9:** And errors (timeout, NACK) are caught and reported ✅
10. **AC10:** And the Patch object is correctly serialized to match hardware byte format ✅

## Tasks / Subtasks

- [x] Task 1: Implement CRC-32 checksum (AC: 5, 6)
  - [x] Create `src/services/midi/checksum.ts`
  - [x] Port CRC-32 algorithm from Python library
  - [x] Add calculateChecksum function
  - [x] Add 7-bit encoding for checksum

- [x] Task 2: Implement patch serialization (AC: 10)
  - [x] Add packBits function to protocol.ts
  - [x] Add serializePatch function
  - [x] Convert Patch object to 128-byte raw format
  - [x] Add encode7bit for MIDI-safe encoding

- [x] Task 3: Implement buildWritePatchMessage (AC: 4, 7)
  - [x] Add buildEnterEditMessage
  - [x] Add buildExitEditMessage
  - [x] Add buildPatchSelectMessage
  - [x] Add buildWritePatchMessage

- [x] Task 4: Add writePatch to MidiService (AC: 3, 8, 9)
  - [x] Implement writePatch method with full write flow
  - [x] Enter edit mode, select patch, send data, confirm, exit edit mode
  - [x] Handle timeout and errors

- [x] Task 5: Verify implementation
  - [x] Build passes: 307KB JS, 35KB CSS
  - [x] Lint passes

## Dev Notes

### Write Protocol Flow

From PROTOCOL.md:
```
1. Enter edit mode: F0 52 00 42 12 F7
2. Select patch: F0 52 00 42 31 [N] 02 02 00 F7
3. Send patch data: F0 52 00 42 28 [147 bytes] F7
4. Confirm write: F0 52 00 42 31 [N] 02 09 00 F7
5. Exit edit mode: F0 52 00 42 1F F7
```

### 7-bit Encoding

128 bytes → 147 bytes (every 7 bytes → 8 transmitted bytes)
- 7 data bytes with bit 7 stripped
- 1 byte containing the 7 high bits

### CRC-32 Algorithm

Uses standard CRC-32 with polynomial 0xEDB88320 and init 0xFFFFFFFF.
The checksum is encoded as 5 bytes of 7-bit values.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created `src/services/midi/checksum.ts`:
  - CRC-32 lookup table with polynomial 0xEDB88320
  - calculateCrc32(data, init) function
  - encodeCrc7bit(crc) function
  - decodeCrc7bit(bytes) function
  - calculatePatchChecksum(patchData) function
  - verifyReadResponseChecksum(response) function

- Updated `src/services/midi/protocol.ts`:
  - Added buildEnterEditMessage()
  - Added buildExitEditMessage()
  - Added buildPatchSelectMessage(patchId, mode)
  - Added encode7bit(data) function (128 → 147 bytes)
  - Added packBits(matrix) function (reverse of unpackBits)
  - Added encodePatchName(name) function
  - Added serializePatch(patch) function
  - Added buildWritePatchMessage(patchData)

- Updated `src/services/midi/MidiService.ts`:
  - Added writePatch(patchId, patch) method
  - Full write flow: enter edit → select → write → confirm → exit
  - Error handling with cleanup (always exits edit mode)

- Build: 306.66KB JS, 34.80KB CSS
- Lint passes

### File List

**Created:**
- `zoom-g9.2tt-web/src/services/midi/checksum.ts` - CRC-32 implementation

**Modified:**
- `zoom-g9.2tt-web/src/services/midi/protocol.ts` - Add serialization and write functions
- `zoom-g9.2tt-web/src/services/midi/MidiService.ts` - Add writePatch method
