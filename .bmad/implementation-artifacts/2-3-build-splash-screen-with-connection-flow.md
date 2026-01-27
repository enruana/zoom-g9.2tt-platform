# Story 2.3: Build Splash Screen with Connection Flow

Status: done

## Story

As a **user**,
I want **to see a splash screen where I can connect my device or try demo mode**,
so that **I can start using the app**.

## Acceptance Criteria

1. **AC1:** Splash page shows welcome message and app branding ✅
2. **AC2:** "Connect Device" button visible ✅
3. **AC3:** "Try Demo" button visible ✅
4. **AC4:** Clicking "Connect Device" triggers MIDI access request ✅
5. **AC5:** If MIDI access granted, show list of available MIDI devices ✅
6. **AC6:** User can select a device from the list to connect ✅
7. **AC7:** Connection status displayed (connecting spinner, connected success) ✅
8. **AC8:** After successful connection, navigate to `/editor` ✅
9. **AC9:** Clicking "Try Demo" navigates to `/editor` in demo mode ✅

## Tasks / Subtasks

- [x] Task 1: Update Splash page with connection UI (AC: 1-3)
  - [x] Add welcome message and branding
  - [x] Add "Connect Device" button
  - [x] Add "Try Demo" button

- [x] Task 2: Implement device detection flow (AC: 4, 5)
  - [x] Handle MIDI access request on button click
  - [x] Display device list after access granted
  - [x] Handle access denied error

- [x] Task 3: Implement device selection and connection (AC: 6, 7)
  - [x] Allow clicking device to initiate connection
  - [x] Show connecting spinner
  - [x] Show connected success state

- [x] Task 4: Navigation flow (AC: 8, 9)
  - [x] Navigate to /editor after successful connection
  - [x] Navigate to /editor in demo mode on "Try Demo" click

- [x] Task 5: Verify implementation
  - [x] Build passes
  - [x] Lint passes

## Dev Notes

### UI States

1. **Initial**: Show Connect Device + Try Demo buttons
2. **Requesting**: MIDI access permission dialog, spinner shown
3. **Selecting**: Device list shown with back button
4. **Connecting**: Spinner on selected device
5. **Connected**: Green checkmark, device name, then navigate
6. **Demo**: Purple play icon, then navigate

### Previous Story Context

- Story 2.1: DeviceContext with state machine
- Story 2.2: MidiService for device access

### References

- [Source: epics.md#Story 2.3]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Completely rewrote Splash.tsx with full connection flow:
  - Gradient branding title
  - SplashState type for UI state machine (initial, requesting, selecting, connecting)
  - Error display with red styling
  - Device list with manufacturer info
  - Loading spinners for requesting/connecting states
  - Success states with checkmark (connected) and play icon (demo)
  - Auto-navigation to /editor after 500ms delay
  - Footer with browser compatibility note
- Integrated DeviceContext for state management
- Integrated MidiService for MIDI operations
- All Tailwind CSS styling with transitions
- Build passes: 237KB JS, 11KB CSS
- Lint passes

### File List

**Modified:**
- `zoom-g9.2tt-web/src/pages/Splash.tsx` - Complete connection flow UI
