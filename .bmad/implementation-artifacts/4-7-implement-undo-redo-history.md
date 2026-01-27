# Story 4.7: Implement Undo/Redo History

Status: done

## Story

As a **user**,
I want **to undo and redo parameter changes**,
So that **I can experiment without fear of losing my settings**.

## Acceptance Criteria

1. **AC1:** Given I have made parameter changes to a patch ✅
2. **AC2:** When I want to revert a change, I can click an "Undo" button or press Ctrl+Z ✅
3. **AC3:** And the last parameter change is reverted ✅
4. **AC4:** And the reverted change is pushed to the redo stack ✅
5. **AC5:** I can click "Redo" or press Ctrl+Y to restore the change ✅
6. **AC6:** `src/contexts/HistoryContext.tsx` manages the undo/redo stacks ✅
7. **AC7:** History tracks: patchId, module, param, oldValue, newValue ✅
8. **AC8:** Undo/redo buttons show disabled state when stack is empty ✅
9. **AC9:** Navigating away from editor with unsaved changes shows a warning dialog ✅
10. **AC10:** The warning offers: "Discard", "Cancel" ✅

## Tasks / Subtasks

- [x] Task 1: Create HistoryContext (AC: 6, 7)
  - [x] Create `src/contexts/HistoryContext.tsx`
  - [x] Define HistoryEntry interface (patchId, module, paramIndex, oldValue, newValue, timestamp)
  - [x] Manage undoStack and redoStack arrays
  - [x] Provide pushChange, undo, redo, clearHistory actions
  - [x] Track hasUnsavedChanges state

- [x] Task 2: Integrate history tracking (AC: 1, 3, 4)
  - [x] Update Editor.tsx to push changes to history
  - [x] Track old values before parameter changes
  - [x] Implement undo action (revert + send MIDI)
  - [x] Implement redo action (apply + send MIDI)

- [x] Task 3: Add Undo/Redo UI (AC: 2, 5, 8)
  - [x] Add Undo/Redo buttons to Editor header
  - [x] Show disabled state when stacks are empty
  - [x] Add keyboard shortcuts (Ctrl+Z, Ctrl+Y, Cmd+Z, Cmd+Shift+Z on Mac)

- [x] Task 4: Add unsaved changes warning (AC: 9, 10)
  - [x] Create UnsavedChangesDialog inline in Editor
  - [x] Intercept disconnect when hasUnsavedChanges is true
  - [x] Offer Discard, Cancel options
  - [x] Show "Unsaved" badge in header

- [x] Task 5: Verify implementation
  - [x] Build passes: 303KB JS, 35KB CSS
  - [x] Lint passes

## Dev Notes

### History Entry Structure

```typescript
interface HistoryEntry {
  patchId: number;
  module: ModuleName;
  paramIndex: number;
  oldValue: number;
  newValue: number;
  timestamp: number;
}
```

### Keyboard Shortcuts

- Windows/Linux: Ctrl+Z (undo), Ctrl+Y (redo)
- Mac: Cmd+Z (undo), Cmd+Shift+Z (redo)

### Stack Behavior

- On parameter change: push to undoStack, clear redoStack
- On undo: pop from undoStack, push to redoStack, apply oldValue
- On redo: pop from redoStack, push to undoStack, apply newValue
- On patch change: clear both stacks (per-patch history)

### Implementation Notes

- Maximum history size: 100 entries to prevent memory issues
- History is per-patch, cleared when switching patches
- Old value captured when parameter modal opens (using useRef)
- Undo/redo also sends MIDI to device when connected

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created `src/contexts/HistoryContext.tsx`:
  - HistoryEntry interface with patchId, module, paramIndex, oldValue, newValue, timestamp
  - HistoryState with undoStack, redoStack, currentPatchId
  - HistoryActions: pushChange, undo, redo, clearHistory, setCurrentPatch
  - Derived state: hasUnsavedChanges, canUndo, canRedo
  - MAX_HISTORY_SIZE = 100 to prevent memory issues
  - History cleared when switching patches

- Updated `src/App.tsx`:
  - Added HistoryProvider wrapping Routes

- Updated `src/pages/Editor.tsx`:
  - Added useHistory hook integration
  - Track old value with useRef when parameter modal opens
  - pushChange to history on parameter change
  - handleUndo: revert to oldValue + send MIDI
  - handleRedo: apply newValue + send MIDI
  - Global keyboard shortcuts (Ctrl+Z, Ctrl+Y, Cmd+Z, Cmd+Shift+Z)
  - Undo/Redo SVG icon buttons with disabled state
  - "Unsaved" badge when hasUnsavedChanges
  - Unsaved changes dialog with Discard/Cancel options
  - Intercept disconnect when unsaved changes exist

- Build: 303.07KB JS, 34.80KB CSS
- Lint passes

### File List

**Created:**
- `zoom-g9.2tt-web/src/contexts/HistoryContext.tsx` - Undo/redo stack management

**Modified:**
- `zoom-g9.2tt-web/src/App.tsx` - Added HistoryProvider
- `zoom-g9.2tt-web/src/pages/Editor.tsx` - History tracking, undo/redo UI, unsaved dialog
