# Story 5.2: Add Save Patch UI and Confirmation

Status: done

## Story

As a **user**,
I want **to save my edited patch with a confirmation dialog**,
So that **I don't accidentally overwrite my presets**.

## Acceptance Criteria

1. **AC1:** Given I have made changes to a patch ✅
2. **AC2:** When I click the "Save" button in the header ✅
3. **AC3:** Then a confirmation dialog appears asking "Save changes to Patch XX?" ✅
4. **AC4:** And the dialog shows the patch name and number ✅
5. **AC5:** And I can click "Save" to confirm or "Cancel" to abort ✅
6. **AC6:** And while saving, a loading indicator is shown ✅
7. **AC7:** And on success, a toast notification confirms "Patch saved" ✅
8. **AC8:** And on error, a toast shows the error message ✅
9. **AC9:** And after successful save, the "Unsaved" indicator disappears ✅
10. **AC10:** And the history is cleared after save ✅

## Tasks / Subtasks

- [x] Task 1: Create SaveConfirmDialog component
  - [x] Create `src/components/dialogs/SaveConfirmDialog.tsx`
  - [x] Show patch number and name
  - [x] Save and Cancel buttons
  - [x] Loading state while saving
  - [x] ESC key to cancel (when not saving)

- [x] Task 2: Add Save button to Editor header
  - [x] Add Save button next to Undo/Redo
  - [x] Disable when no unsaved changes or in demo mode
  - [x] Show loading spinner while saving
  - [x] Add Ctrl+S / Cmd+S keyboard shortcut

- [x] Task 3: Implement save flow in Editor
  - [x] Show confirmation dialog on save click
  - [x] Call midiService.writePatch on confirm
  - [x] Show success/error toast
  - [x] Clear history on success

- [x] Task 4: Verify implementation
  - [x] Build passes: 310KB JS, 35KB CSS
  - [x] Lint passes

## Dev Notes

### UI Components

- Save button in header (blue when active, gray when disabled)
- Confirmation dialog modal (z-index 80)
- Loading spinner during save
- Toast notifications for success/error

### Keyboard Shortcuts

- Ctrl+S / Cmd+S: Open save dialog (when connected and has changes)
- ESC: Close save dialog (when not saving)

### Save Flow

1. User clicks Save or presses Ctrl+S
2. Confirmation dialog appears with patch info
3. User confirms → loading state
4. writePatch called → wait for completion
5. Success: toast + clear history + close dialog
6. Error: toast with error message

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created `src/components/dialogs/SaveConfirmDialog.tsx`:
  - Props: patchId, patchName, isSaving, onConfirm, onCancel
  - Shows patch number and name
  - Loading state with spinner
  - ESC key to cancel (disabled while saving)
  - Auto-focus on confirm button

- Updated `src/pages/Editor.tsx`:
  - Added SaveConfirmDialog import
  - Added showSaveDialog and isSaving state
  - Added handleSaveClick: opens dialog if valid
  - Added handleConfirmSave: calls writePatch, shows toast, clears history
  - Added handleCancelSave: closes dialog
  - Added Ctrl+S / Cmd+S keyboard shortcut
  - Added Save button in header with icon
  - Button disabled in demo mode or when no changes
  - Shows spinner while saving

- Build: 309.95KB JS, 35.30KB CSS
- Lint passes

### File List

**Created:**
- `zoom-g9.2tt-web/src/components/dialogs/SaveConfirmDialog.tsx`

**Modified:**
- `zoom-g9.2tt-web/src/pages/Editor.tsx` - Add save button and flow
