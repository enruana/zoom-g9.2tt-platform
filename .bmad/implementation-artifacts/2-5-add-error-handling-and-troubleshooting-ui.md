# Story 2.5: Add Error Handling and Troubleshooting UI

Status: done

## Story

As a **user**,
I want **clear error messages and troubleshooting help when connection fails**,
so that **I can resolve issues and successfully connect**.

## Acceptance Criteria

1. **AC1:** Clear error message shown when connection fails ✅
2. **AC2:** "Troubleshoot" link/button visible on error ✅
3. **AC3:** Troubleshoot tips shown: "Check USB connection", "Ensure MIDI interface is powered", "Try Chrome or Edge browser" ✅
4. **AC4:** If Web MIDI API not supported, show "Browser not supported" warning with recommended browsers ✅
5. **AC5:** "Retry Connection" button available ✅
6. **AC6:** Toast notification appears on unexpected device disconnect ✅
7. **AC7:** App gracefully returns to splash on unexpected disconnect ✅

## Tasks / Subtasks

- [x] Task 1: Create Toast component (AC: 6)
  - [x] Create `src/components/common/Toast.tsx`
  - [x] Support error, warning, success, info variants
  - [x] Auto-dismiss after timeout
  - [x] Create ToastContainer for app-wide toasts
  - [x] Create toast API for programmatic notifications

- [x] Task 2: Create Troubleshoot modal/panel (AC: 2, 3)
  - [x] Create `src/components/common/TroubleshootPanel.tsx`
  - [x] Show 6 common troubleshooting tips
  - [x] Include Retry and Close buttons

- [x] Task 3: Add browser compatibility check (AC: 4)
  - [x] Create `src/utils/browserCheck.ts`
  - [x] Detect Web MIDI support
  - [x] Show browser warning banner if unsupported
  - [x] Disable Connect button on unsupported browsers

- [x] Task 4: Update Splash with error handling (AC: 1, 5)
  - [x] Improve error messages with troubleshoot link
  - [x] Add retry button on error
  - [x] Add browser warning banner

- [x] Task 5: Handle unexpected disconnect (AC: 6, 7)
  - [x] Add onDisconnect listener to MidiService
  - [x] Add statechange event handling for disconnect
  - [x] Show toast notification on disconnect
  - [x] Navigate to splash on disconnect

- [x] Task 6: Verify implementation
  - [x] Build passes
  - [x] Lint passes

## Dev Notes

### Troubleshooting Tips

1. Check USB Connection
2. Power On the Device
3. Use Chrome or Edge
4. Allow MIDI Access
5. Close Other MIDI Apps
6. Restart the Device

### Previous Story Context

- Story 2.4: Demo mode with editor UI

### References

- [Source: epics.md#Story 2.5]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created `src/components/common/Toast.tsx`:
  - Toast component with 4 variants (error, warning, success, info)
  - Auto-dismiss with configurable duration
  - Fade-in/out animations
  - Close button
  - ToastContainer for multiple toasts
  - Global `toast` API (show, error, warning, success, info, dismiss)
- Created `src/components/common/TroubleshootPanel.tsx`:
  - Modal overlay with 6 troubleshooting tips
  - Each tip has icon, title, and description
  - Retry and Close buttons
- Created `src/utils/browserCheck.ts`:
  - `isWebMidiSupported()` function
  - `getBrowserName()` detection
  - `checkBrowserCompatibility()` with message
- Updated Splash.tsx:
  - Browser compatibility check on mount
  - Yellow warning banner for unsupported browsers
  - Disabled Connect button on unsupported browsers
  - Troubleshoot link in error messages
  - Retry button appears after errors
- Updated MidiService.ts:
  - Added `onDisconnect()` subscription method
  - Added statechange event listener for disconnect detection
  - Automatic cleanup of listeners on disconnect
- Updated Editor.tsx:
  - Listen for unexpected disconnects
  - Show toast notification on disconnect
  - Navigate to splash on disconnect
- Updated App.tsx:
  - Added ToastContainer for app-wide notifications
- Build passes: 252KB JS, 20KB CSS
- Lint passes

### File List

**Created:**
- `zoom-g9.2tt-web/src/components/common/Toast.tsx` - Toast notifications
- `zoom-g9.2tt-web/src/components/common/TroubleshootPanel.tsx` - Troubleshooting modal
- `zoom-g9.2tt-web/src/utils/browserCheck.ts` - Browser compatibility check

**Modified:**
- `zoom-g9.2tt-web/src/pages/Splash.tsx` - Added error handling UI
- `zoom-g9.2tt-web/src/pages/Editor.tsx` - Added disconnect handling
- `zoom-g9.2tt-web/src/services/midi/MidiService.ts` - Added disconnect events
- `zoom-g9.2tt-web/src/App.tsx` - Added ToastContainer

**Deleted:**
- `zoom-g9.2tt-web/src/components/common/.gitkeep`
