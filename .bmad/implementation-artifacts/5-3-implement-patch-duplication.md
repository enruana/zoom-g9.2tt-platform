# Story 5.3: Implement Patch Duplication

Status: done

## Story

As a **user**,
I want **to duplicate a patch to another slot**,
So that **I can create variations without losing the original**.

## Acceptance Criteria

1. **AC1:** Given I have a patch selected ✅
2. **AC2:** When I click "Duplicate" in the patch header ✅
3. **AC3:** Then a dialog appears asking for the destination slot (0-99) ✅
4. **AC4:** And I can select a destination patch number ✅
5. **AC5:** And the dialog warns if the destination contains data ✅
6. **AC6:** And on confirm, the current patch is copied to the destination ✅
7. **AC7:** And the copy is written to the device (if connected) ✅
8. **AC8:** And a toast confirms "Patch duplicated to XX" ✅
9. **AC9:** And the patch list is updated to show the new copy ✅

## Tasks / Subtasks

- [x] Task 1: Create DuplicatePatchDialog component
  - [x] Create `src/components/dialogs/DuplicatePatchDialog.tsx`
  - [x] Patch number selector (0-99)
  - [x] Show warning if destination has data
  - [x] Show green indicator for empty slots
  - [x] Prevent same-slot duplication
  - [x] Duplicate and Cancel buttons
  - [x] Loading state while duplicating
  - [x] Auto-select first available empty slot

- [x] Task 2: Add duplicatePatch action to PatchContext
  - [x] Add action type DUPLICATE_PATCH
  - [x] Implement reducer case with deep copy
  - [x] Add action function to interface

- [x] Task 3: Add Duplicate button to Editor
  - [x] Add "Duplicate" button in patch header
  - [x] Works in both connected and demo mode

- [x] Task 4: Implement duplicate flow
  - [x] Copy patch data to new slot
  - [x] Write to device if connected
  - [x] Update patch list in context
  - [x] Show success/error toast

- [x] Task 5: Verify implementation
  - [x] Build passes: 315KB JS, 36KB CSS
  - [x] Lint passes

## Dev Notes

### Duplicate Flow

1. User clicks Duplicate on current patch
2. Dialog shows destination selector (auto-selects first empty)
3. User selects destination
   - Green: empty slot
   - Yellow: has data (will be overwritten)
   - Red: same as source (disabled)
4. Confirm → loading state
5. Copy patch with deep clone
6. Write to device (if connected)
7. Update patches array in context
8. Toast notification

### Smart Default Selection

Dialog auto-selects the first "empty" slot:
- Looks for INIT patches or empty names
- Starts from source+1, wraps around
- Falls back to source+1 if none found

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created `src/components/dialogs/DuplicatePatchDialog.tsx`:
  - Props: sourcePatch, patches, isDuplicating, onConfirm, onCancel
  - Number input for destination (0-99)
  - Color-coded feedback:
    - Green: empty slot
    - Yellow: has data (warning)
    - Red: same slot (disabled)
  - Auto-selects first available empty slot
  - ESC key to cancel
  - Auto-focus on input

- Updated `src/contexts/PatchContext.tsx`:
  - Added duplicatePatch action to interface
  - Added DUPLICATE_PATCH action type
  - Implemented reducer with deep copy of modules

- Updated `src/pages/Editor.tsx`:
  - Added DuplicatePatchDialog import
  - Added showDuplicateDialog and isDuplicating state
  - Added handleDuplicateClick: opens dialog
  - Added handleConfirmDuplicate: copies, writes, toasts
  - Added handleCancelDuplicate: closes dialog
  - Added Duplicate button in patch header with icon

- Build: 315.30KB JS, 36.27KB CSS
- Lint passes

### File List

**Created:**
- `zoom-g9.2tt-web/src/components/dialogs/DuplicatePatchDialog.tsx`

**Modified:**
- `zoom-g9.2tt-web/src/contexts/PatchContext.tsx` - Add duplicatePatch action
- `zoom-g9.2tt-web/src/pages/Editor.tsx` - Add duplicate button and flow
