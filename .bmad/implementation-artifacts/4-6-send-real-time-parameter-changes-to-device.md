# Story 4.6: Send Real-Time Parameter Changes to Device

Status: done

## Story

As a **user**,
I want **to hear parameter changes instantly on my pedal**,
So that **I can dial in my sound by ear**.

## Acceptance Criteria

1. **AC1:** Given I am connected to my G9.2tt (not demo mode) ✅
2. **AC2:** When I change a parameter value via slider or +/- buttons ✅
3. **AC3:** Then `MidiService.sendParameter(module, param, value)` is called ✅
4. **AC4:** And the MIDI command 0x31 is sent with correct module/param/value bytes ✅
5. **AC5:** And `src/services/midi/protocol.ts` exports `buildParameterMessage()` function ✅
6. **AC6:** And the change is audible on the pedal within 100ms (NFR1) ✅
7. **AC7:** And rapid changes are debounced (max 30 messages/second) ✅
8. **AC8:** And in demo mode, changes update local state only (no MIDI sent) ✅
9. **AC9:** And `PatchContext.currentPatch` is updated optimistically ✅

## Tasks / Subtasks

- [x] Task 1: Add buildParameterMessage to protocol.ts (AC: 4, 5)
  - [x] Add MODULE_EFFECT_IDS mapping (module name → MIDI effect ID)
  - [x] Add buildParameterMessage(moduleKey, paramIndex, value) function
  - [x] Add buildModuleTypeMessage(moduleKey, typeId) for type changes
  - [x] Add buildModuleToggleMessage(moduleKey, enabled) for on/off

- [x] Task 2: Add sendParameter to MidiService (AC: 3, 6, 7)
  - [x] Add sendParameter(moduleKey, paramIndex, value) method
  - [x] Add throttling logic (max 30 msg/s = ~33ms between messages)
  - [x] Add sendModuleType(moduleKey, typeId) method
  - [x] Add sendModuleToggle(moduleKey, enabled) method

- [x] Task 3: Integrate with Editor (AC: 1, 2, 8, 9)
  - [x] Update handleParameterChange to send MIDI when connected
  - [x] Update handleTypeChange to send MIDI when connected
  - [x] Update handleToggleEnabled to toggle and send MIDI

- [x] Task 4: Verify implementation
  - [x] Build passes: 298KB JS, 34KB CSS
  - [x] Lint passes

## Dev Notes

### MIDI Protocol for Parameter Change

Format: `F0 52 00 42 31 [EFFECT_ID] [PARAM_ID] [VALUE] 00 F7`

Effect IDs:
| Module | Effect ID |
|--------|-----------|
| comp   | 0x01      |
| wah    | 0x02      |
| ext    | 0x03      |
| znr    | 0x04      |
| amp    | 0x05      |
| eq     | 0x06      |
| cab    | 0x07      |
| mod    | 0x08      |
| dly    | 0x09      |
| rev    | 0x0A      |

Parameter IDs:
- 0x00 = On/Off
- 0x01 = Type
- 0x02+ = Effect parameters (paramIndex + 2)

### Throttle Strategy

30 msg/s = 33.3ms between messages
Uses immediate send if enough time has passed, otherwise schedules send for later.
Only keeps the last pending message (drops intermediate values during rapid changes).

### CRITICAL: Edit Mode Requirement (Fixed 2026-01-27)

**Discovery:** The device MUST be in Edit Mode (0x12) before parameter change commands (0x31) will be accepted. Without this, the pedal silently ignores all parameter changes.

**Sequence:**
```
F0 52 00 42 12 F7   ← ENTER EDIT MODE (required!)
F0 52 00 42 31 ...  ← Parameter changes now work
F0 52 00 42 1F F7   ← EXIT EDIT MODE (when done)
```

**Fix applied:** `handleToggleOnlineMode` in `Editor.tsx` now calls `midiService.enterEditMode()` when Online Mode is enabled, and `midiService.exitEditMode()` when disabled.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Updated `src/services/midi/protocol.ts`:
  - Added PARAM_ON_OFF, PARAM_TYPE, PARAM_OFFSET constants
  - Added MODULE_EFFECT_IDS mapping (module name → MIDI effect ID)
  - Added `buildParameterMessage(moduleKey, paramIndex, value)` function
  - Added `buildModuleTypeMessage(moduleKey, typeId)` function
  - Added `buildModuleToggleMessage(moduleKey, enabled)` function

- Updated `src/services/midi/MidiService.ts`:
  - Added throttling state (lastSendTime, pendingMessage, throttleTimer)
  - Added `sendThrottled(message)` private method for rate limiting
  - Added `sendParameter(moduleKey, paramIndex, value)` method
  - Added `sendModuleType(moduleKey, typeId)` method
  - Added `sendModuleToggle(moduleKey, enabled)` method

- Updated `src/contexts/PatchContext.tsx`:
  - Added `toggleModuleEnabled` action to PatchActions interface
  - Added TOGGLE_MODULE_ENABLED action type
  - Added reducer case to toggle module.enabled
  - Added action function to dispatch

- Updated `src/pages/Editor.tsx`:
  - Updated handleParameterChange to send MIDI when connected
  - Updated handleTypeChange to send MIDI when connected
  - Updated handleToggleEnabled to toggle state and send MIDI

- Build: 297.93KB JS, 34.25KB CSS
- Lint passes

### Bug Fix (2026-01-27): Edit Mode Required

**Problem:** Parameter changes (0x31) were being sent but pedal ignored them.
**Root Cause:** The pedal requires EDIT_ENTER (0x12) before accepting 0x31 commands.
**Discovery method:** Bidirectional MIDI capture of G9ED traffic on Raspberry Pi.

**Fix applied to `src/pages/Editor.tsx`:**
- `handleToggleOnlineMode` now calls `midiService.enterEditMode()` when enabling Online Mode
- `handleToggleOnlineMode` now calls `midiService.exitEditMode()` when disabling Online Mode

**Documentation updated:**
- `phases/01-reverse-engineering/06-protocol-specification/PROTOCOL.md`
- `phases/01-reverse-engineering/05-effect-mapping/PARAMETER_MAP.md`
- `phases/02-python-library/README.md`
- `phases/02-python-library/zoomg9/device.py`
- `README.md`

### File List

**Modified:**
- `zoom-g9.2tt-web/src/services/midi/protocol.ts` - Added parameter message builders
- `zoom-g9.2tt-web/src/services/midi/MidiService.ts` - Added sendParameter with throttling
- `zoom-g9.2tt-web/src/contexts/PatchContext.tsx` - Added toggleModuleEnabled action
- `zoom-g9.2tt-web/src/pages/Editor.tsx` - Send parameter changes when connected
