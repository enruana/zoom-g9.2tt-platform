# Story 2.6: Implement Device Identification and G9.2tt Detection

Status: done

## Story

As a **user**,
I want **the app to verify my device is a Zoom G9.2tt**,
so that **I know the app will work correctly with my hardware**.

## Acceptance Criteria

1. **AC1:** MidiService sends an identity request SysEx message on connection ✅
2. **AC2:** Response is parsed to check for Zoom manufacturer ID (0x52) and G9.2tt model ID ✅
3. **AC3:** If device is identified as G9.2tt, connection proceeds normally ✅
4. **AC4:** If device is not a G9.2tt, warning shown: "This device may not be a Zoom G9.2tt" ✅
5. **AC5:** User can choose to continue anyway or select a different device ✅
6. **AC6:** DeviceContext stores the identified device info (manufacturer, model) ✅

## Tasks / Subtasks

- [x] Task 1: Create protocol constants and identity request (AC: 1, 2)
  - [x] Create `src/services/midi/protocol.ts` with SysEx constants
  - [x] Implement `buildIdentityRequest()` function
  - [x] Implement `parseIdentityResponse()` function
  - [x] Implement `isIdentityReply()` helper

- [x] Task 2: Add device identification to MidiService (AC: 1, 2, 3)
  - [x] Add `identify()` method to MidiService
  - [x] Send identity request and wait for response with timeout
  - [x] Return parsed device identity info

- [x] Task 3: Update connection flow (AC: 3, 4, 5, 6)
  - [x] Call identify after connect in Splash
  - [x] Add 'identifying' state to show progress
  - [x] Add 'warning' state for unrecognized devices
  - [x] Show warning if not G9.2tt
  - [x] Allow user to continue anyway
  - [x] Allow user to select different device
  - [x] Store device info (manufacturer, model) in DeviceContext

- [x] Task 4: Verify implementation
  - [x] Build passes
  - [x] Lint passes

## Dev Notes

### MIDI Identity Request (Universal SysEx)

Standard MIDI Identity Request:
```
F0 7E 00 06 01 F7
```

### Device Identity Response

```
F0 7E 00 06 02 <manufacturer> <family> <model> <version> F7
```
- Zoom manufacturer ID: 0x52
- G9.2tt model ID: 0x42

### Previous Story Context

- Story 2.5: Error handling and troubleshooting UI

### References

- [Source: PROTOCOL.md]
- [Source: epics.md#Story 2.6]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created `src/services/midi/protocol.ts`:
  - SysEx constants (SYSEX_START, SYSEX_END, etc.)
  - Zoom manufacturer ID (0x52) and G9.2tt model ID (0x42)
  - `buildIdentityRequest()` - builds Universal MIDI Identity Request
  - `parseIdentityResponse()` - parses identity reply into DeviceIdentity object
  - `isIdentityReply()` - checks if message is an identity reply
  - `DeviceIdentity` interface with manufacturer, family, model, version, isZoom, isG9TT flags
- Added `identify()` method to MidiService:
  - Sends identity request, waits for response with configurable timeout (default 2s)
  - Returns DeviceIdentity or null if no response
  - Properly cleans up event listeners
- Updated Splash.tsx with full device identification flow:
  - New 'identifying' state shown after connect
  - New 'warning' state shown for unrecognized devices
  - Warning panel with detected device info
  - "Continue Anyway" button to proceed with unrecognized device
  - "Select Different Device" button to go back
  - "Try Demo Instead" option
  - Shows model info in connected success state
- Build passes: 256KB JS, 22KB CSS
- Lint passes

### File List

**Created:**
- `zoom-g9.2tt-web/src/services/midi/protocol.ts` - MIDI protocol constants and message builders

**Modified:**
- `zoom-g9.2tt-web/src/services/midi/MidiService.ts` - Added identify() method
- `zoom-g9.2tt-web/src/pages/Splash.tsx` - Added device identification flow and warning UI
