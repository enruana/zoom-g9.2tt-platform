# Story 2.2: Implement Web MIDI Service

Status: done

## Story

As a **user**,
I want **the app to detect available MIDI devices**,
so that **I can see my Zoom G9.2tt in the device list**.

## Acceptance Criteria

1. **AC1:** `MidiService.requestAccess()` returns a `MIDIAccess` object ✅
2. **AC2:** `MidiService.getDevices()` returns list of available MIDI input/output pairs ✅
3. **AC3:** Each device shows `id` and `name` properties ✅
4. **AC4:** `MidiService.connect(deviceId)` stores references to input/output ports ✅
5. **AC5:** `MidiService.disconnect()` closes the connection and clears references ✅
6. **AC6:** `MidiService.isConnected` returns current connection state ✅
7. **AC7:** The service is a singleton exported from `src/services/midi/MidiService.ts` ✅

## Tasks / Subtasks

- [x] Task 1: Create MidiService class (AC: 1-7)
  - [x] Create `src/services/midi/MidiService.ts`
  - [x] Implement `requestAccess()` method
  - [x] Implement `getDevices()` method
  - [x] Implement `connect(deviceId)` method
  - [x] Implement `disconnect()` method
  - [x] Implement `isConnected` getter
  - [x] Export singleton instance

- [x] Task 2: Add Web MIDI type declarations
  - [x] Create `src/types/webmidi.d.ts` with full API types

- [x] Task 3: Verify implementation
  - [x] Build passes
  - [x] Lint passes

## Dev Notes

### Web MIDI API

The Web MIDI API is available in Chrome and Edge. It requires:
- HTTPS (or localhost for dev)
- User permission grant
- SysEx enabled for G9.2tt protocol

### Device Pairing

MIDI devices have separate input and output ports. The service pairs them by matching names to create a unified device list.

### Previous Story Context

Story 2.1 completed: DeviceContext with connection state machine

### References

- [Source: architecture.md#MIDI Service]
- [Source: epics.md#Story 2.2]
- [MDN Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created `src/types/webmidi.d.ts` with complete Web MIDI API type declarations:
  - MIDIAccess, MIDIInputMap, MIDIOutputMap
  - MIDIPort, MIDIInput, MIDIOutput
  - MIDIMessageEvent, MIDIConnectionEvent
  - Navigator.requestMIDIAccess extension
- Created `src/services/midi/MidiService.ts` as singleton class with:
  - `requestAccess()` - requests MIDI access with SysEx enabled
  - `getDevices()` - returns paired input/output devices
  - `connect(deviceId)` - connects to device by ID, opens ports
  - `disconnect()` - closes ports and clears references
  - `isConnected` getter - returns current connection state
  - `deviceId` getter - returns connected device ID
  - `input/output` getters - returns port references
  - `send(data)` - sends MIDI messages
  - `onMessage(callback)` - adds message listener with cleanup function
- Removed .gitkeep from services/midi/
- Build passes: 230KB JS
- Lint passes

### File List

**Created:**
- `zoom-g9.2tt-web/src/types/webmidi.d.ts` - Web MIDI API type declarations
- `zoom-g9.2tt-web/src/services/midi/MidiService.ts` - MIDI service singleton

**Deleted:**
- `zoom-g9.2tt-web/src/services/midi/.gitkeep`
