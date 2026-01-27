# Story 3.3: Build Patch List UI

Status: done

## Story

As a **user**,
I want **to see a list of all my patches**,
so that **I can browse and select the one I want to edit**.

## Acceptance Criteria

1. **AC1:** Scrollable list of all 100 patches (0-99) ✅
2. **AC2:** Each patch shows its number and name ✅
3. **AC3:** Currently selected patch is visually highlighted ✅
4. **AC4:** Clicking a patch selects it and updates `PatchContext.selectedPatchId` ✅
5. **AC5:** List shows loading indicator while patches are being read ✅
6. **AC6:** In demo mode, the list shows demo patch names ✅
7. **AC7:** Patch list is accessible via keyboard navigation ✅

## Tasks / Subtasks

- [x] Task 1: Patch list UI (AC: 1, 2, 3) - Already implemented in Story 2.4
- [x] Task 2: Patch selection (AC: 4) - Already implemented in Story 2.4
- [x] Task 3: Loading indicator (AC: 5) - Added in Story 3.1/3.2
- [x] Task 4: Demo mode support (AC: 6) - Already implemented
- [x] Task 5: Keyboard navigation (AC: 7) - Added now
  - [x] Arrow Up/Down (and k/j) for single step
  - [x] Home/End for first/last
  - [x] PageUp/PageDown for 10-step jumps

## Dev Notes

### Keyboard Shortcuts

- Arrow Up / k: Previous patch
- Arrow Down / j: Next patch
- Home: First patch (0)
- End: Last patch (99)
- PageUp: Jump 10 patches up
- PageDown: Jump 10 patches down

### Previous Implementation

Most of this story was implemented in Stories 2.4 and 3.1/3.2.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Patch list UI was already implemented in Story 2.4
- Loading indicator with progress was added in Story 3.1
- Device reading was added in Story 3.2
- Added keyboard navigation:
  - handleKeyDown function in Editor.tsx
  - tabIndex on aside element
  - Support for Arrow keys, j/k, Home/End, PageUp/PageDown
- Build passes
- Lint passes

### File List

**Modified:**
- `zoom-g9.2tt-web/src/pages/Editor.tsx` - Added keyboard navigation
