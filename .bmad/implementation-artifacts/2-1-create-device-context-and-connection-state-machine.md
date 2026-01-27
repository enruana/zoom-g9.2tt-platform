# Story 2.1: Create Device Context and Connection State Machine

Status: done

## Story

As a **developer**,
I want **a DeviceContext that manages connection state**,
so that **all components can react to device connection changes**.

## Acceptance Criteria

1. **AC1:** `src/contexts/DeviceContext.tsx` exists and exports a provider ✅
2. **AC2:** Context exports `useDevice()` hook ✅
3. **AC3:** Connection state includes: `disconnected`, `connecting`, `connected`, `demo`, `error` ✅
4. **AC4:** Context provides `state` object with `status`, `deviceId`, `deviceName`, `error` ✅
5. **AC5:** Context provides `actions` object with `setConnecting`, `setConnected`, `setDemo`, `setError`, `disconnect` ✅
6. **AC6:** TypeScript types are defined in `src/types/midi.ts` ✅
7. **AC7:** The provider wraps the app in `App.tsx` ✅

## Tasks / Subtasks

- [x] Task 1: Create TypeScript types (AC: 6)
  - [x] Create `src/types/midi.ts` with ConnectionStatus type
  - [x] Define DeviceState interface
  - [x] Define DeviceActions interface

- [x] Task 2: Create DeviceContext (AC: 1, 2, 3, 4, 5)
  - [x] Create `src/contexts/DeviceContext.tsx`
  - [x] Implement DeviceProvider with useReducer
  - [x] Implement useDevice hook
  - [x] Export all types and components

- [x] Task 3: Integrate with App.tsx (AC: 7)
  - [x] Wrap routes with DeviceProvider

- [x] Task 4: Verify implementation
  - [x] Build passes
  - [x] Lint passes

## Dev Notes

### Connection State Machine

```
disconnected -> connecting -> connected
     |              |             |
     v              v             v
   demo          error       disconnected
```

### Previous Story Context

Epic 1 completed: Project foundation with Vite, Tailwind, Firebase, Router

### References

- [Source: architecture.md#Contexts]
- [Source: epics.md#Story 2.1]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created `src/types/midi.ts` with:
  - `ConnectionStatus` union type (5 states)
  - `DeviceState` interface (status, deviceId, deviceName, error, manufacturer, model)
  - `DeviceActions` interface (5 action methods)
  - `DeviceContextValue` combining state and actions
  - `MidiDeviceInfo` for device selection UI
- Created `src/contexts/DeviceContext.tsx` with:
  - useReducer for state management
  - DeviceProvider component
  - useDevice hook with null check
  - Memoized actions to prevent unnecessary re-renders
- Updated App.tsx to wrap routes with DeviceProvider
- Fixed ESLint react-refresh/only-export-components warning
- Removed .gitkeep files from contexts/ and types/
- Build passes: 230KB JS
- Lint passes

### File List

**Created:**
- `zoom-g9.2tt-web/src/types/midi.ts` - TypeScript types for device/MIDI
- `zoom-g9.2tt-web/src/contexts/DeviceContext.tsx` - Device state context

**Modified:**
- `zoom-g9.2tt-web/src/App.tsx` - Added DeviceProvider wrapper

**Deleted:**
- `zoom-g9.2tt-web/src/contexts/.gitkeep`
- `zoom-g9.2tt-web/src/types/.gitkeep`
