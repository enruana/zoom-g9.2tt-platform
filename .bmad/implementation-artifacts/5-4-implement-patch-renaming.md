# Story 5.4: Implement Patch Renaming

Status: done

## Story

As a **user**,
I want **to rename my patches**,
So that **I can organize them with meaningful names**.

## Acceptance Criteria

1. **AC1:** Given I have a patch selected ✅
2. **AC2:** When I click the patch name in the header ✅
3. **AC3:** Then a modal dialog appears ✅
4. **AC4:** And I can type a new name (max 10 characters) ✅
5. **AC5:** And pressing Enter or clicking Rename confirms the change ✅
6. **AC6:** And pressing Escape cancels the edit ✅
7. **AC7:** And the name is written to the device (if connected) ✅
8. **AC8:** And the patch list sidebar updates to show the new name ✅
9. **AC9:** And a toast confirms "Patch renamed" ✅

## Tasks / Subtasks

- [x] Task 1: Create RenamePatchDialog component
  - [x] Create `src/components/dialogs/RenamePatchDialog.tsx`
  - [x] Text input for name (max 10 chars)
  - [x] Show current name as placeholder
  - [x] Rename and Cancel buttons
  - [x] Enter to confirm, Escape to cancel
  - [x] Character counter
  - [x] Filter non-ASCII characters
  - [x] Auto-select input text

- [x] Task 2: Add renamePatch action to PatchContext
  - [x] Add action type RENAME_PATCH
  - [x] Update patch name in context

- [x] Task 3: Integrate rename flow in Editor
  - [x] Make patch name clickable with edit icon
  - [x] Open dialog on click
  - [x] Write to device on confirm
  - [x] Show success toast

- [x] Task 4: Verify implementation
  - [x] Build passes: 319KB JS, 36KB CSS
  - [x] Lint passes

## Dev Notes

### Patch Name Constraints

- Maximum 10 characters (G9.2tt hardware limitation)
- ASCII printable characters only (32-126)
- Padded with spaces if shorter than 10 characters
- Uppercase display in input

### UI Features

- Click patch name to edit (shows pencil icon on hover)
- Auto-select existing text for easy replacement
- Character counter shows X/10
- Button shows "Keep Name" if unchanged

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created `src/components/dialogs/RenamePatchDialog.tsx`:
  - Props: patchId, currentName, isRenaming, onConfirm, onCancel
  - Text input with max 10 characters
  - Filters non-ASCII characters (only 32-126 allowed)
  - Auto-pads name to 10 characters with spaces
  - Character counter (X/10)
  - Enter key to submit, ESC to cancel
  - Auto-select input text on mount
  - Loading state while renaming
  - Button text changes: "Keep Name" if unchanged

- Updated `src/contexts/PatchContext.tsx`:
  - Added renamePatch action to interface
  - Added RENAME_PATCH action type
  - Simple reducer: updates patch name by ID

- Updated `src/pages/Editor.tsx`:
  - Added RenamePatchDialog import
  - Added showRenameDialog and isRenaming state
  - Made patch name a clickable button with pencil icon
  - Added handleRenameClick: opens dialog
  - Added handleConfirmRename: updates context, writes to device
  - Added handleCancelRename: closes dialog

- Build: 319.05KB JS, 36.40KB CSS
- Lint passes

### File List

**Created:**
- `zoom-g9.2tt-web/src/components/dialogs/RenamePatchDialog.tsx`

**Modified:**
- `zoom-g9.2tt-web/src/contexts/PatchContext.tsx` - Add renamePatch action
- `zoom-g9.2tt-web/src/pages/Editor.tsx` - Add clickable name and rename flow
