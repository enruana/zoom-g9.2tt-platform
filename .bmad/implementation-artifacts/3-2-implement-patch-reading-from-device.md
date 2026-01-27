# Story 3.2: Implement Patch Reading from Device

Status: done

## Story

As a **user**,
I want **to read patch data from my G9.2tt**,
so that **I can see and edit my actual patches**.

## Acceptance Criteria

1. **AC1:** `MidiService.readPatch(patchId)` sends the correct SysEx read command ✅
2. **AC2:** `src/services/midi/protocol.ts` exports `buildReadPatchMessage(patchId)` function ✅
3. **AC3:** The service waits for the device response with timeout (2 seconds) ✅
4. **AC4:** The response is parsed into a `Patch` object with all module data ✅
5. **AC5:** `MidiService.readAllPatches()` reads all 100 patches sequentially with progress callback ✅
6. **AC6:** Patch names are decoded from the SysEx response (10 characters) ✅
7. **AC7:** Reading errors are caught and reported via callback ✅

## Tasks / Subtasks

- [x] Task 1: Add patch read protocol functions (AC: 2)
  - [x] Add `buildReadPatchMessage(patchId)` to protocol.ts
  - [x] Add `parsePatchResponse(data)` to protocol.ts
  - [x] Add nibble decoding function
  - [x] Add bit unpacking for patch structure

- [x] Task 2: Add readPatch to MidiService (AC: 1, 3, 4, 6)
  - [x] Implement `readPatch(patchId)` method
  - [x] Send read command and wait for response
  - [x] Parse response into Patch object
  - [x] Handle timeout (2-3 seconds)

- [x] Task 3: Add readAllPatches to MidiService (AC: 5, 7)
  - [x] Implement `readAllPatches(onProgress)` method
  - [x] Read patches sequentially
  - [x] Report progress via callback
  - [x] Handle errors per-patch with placeholder creation

- [x] Task 4: Update Editor to read from device (AC: all)
  - [x] Call readAllPatches when connected to real device
  - [x] Show progress percentage in UI

- [x] Task 5: Verify implementation
  - [x] Build passes
  - [x] Lint passes

## Dev Notes

### SysEx Read Patch Command

```
F0 52 00 42 11 [PATCH] F7
```
- F0 = SysEx start
- 52 00 42 = Zoom G9.2tt header
- 11 = Read patch command
- PATCH = 0-99
- F7 = SysEx end

### Patch Response Format

268 bytes total:
- 6 bytes header (F0 52 00 42 21 [patch])
- 256 bytes nibble-encoded data
- 5 bytes checksum
- 1 byte footer (F7)

### Nibble Decoding

Each byte becomes two nibbles:
```
Original: 0xA5
Nibbles:  0x0A, 0x05
Decode:   (0x0A << 4) | 0x05 = 0xA5
```

### Bit Unpacking

128 bytes decoded, organized as 12 rows with BIT_TBL defining field widths.

### Previous Story Context

- Story 3.1: PatchContext created

### References

- [Source: phases/01-reverse-engineering/06-protocol-specification/PROTOCOL.md]
- [Source: epics.md#Story 3.2]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Extended protocol.ts with patch reading functions:
  - Added G9.2tt command constants (CMD_READ_PATCH_REQUEST, etc.)
  - Added G9TT_HEADER constant
  - `buildReadPatchMessage(patchId)` - creates read request
  - `isPatchReadResponse(data)` - validates response format
  - `getPatchIdFromResponse(data)` - extracts patch ID
  - `decodeNibbles(data)` - converts 256 nibbles to 128 bytes
  - `unpackBits(data)` - extracts bit-packed fields using BIT_TBL
  - `extractPatchName(data)` - extracts 10-character name
  - `parsePatchResponse(data)` - full parsing to RawPatchData
  - `RawPatchData` interface for intermediate format
- Extended MidiService.ts:
  - `readPatch(patchId, timeout)` - read single patch with timeout
  - `readAllPatches(onProgress)` - read all 100 patches with progress
  - `convertRawToPatch(raw)` - convert RawPatchData to Patch
  - `createEmptyPatch(id, name)` - placeholder for failed reads
- Updated Editor.tsx:
  - Calls midiService.readAllPatches when connected
  - Shows progress percentage during load
- Build passes: 262KB JS, 22KB CSS
- Lint passes

### File List

**Modified:**
- `zoom-g9.2tt-web/src/services/midi/protocol.ts` - Added patch reading protocol
- `zoom-g9.2tt-web/src/services/midi/MidiService.ts` - Added readPatch/readAllPatches
- `zoom-g9.2tt-web/src/pages/Editor.tsx` - Integrated device reading
