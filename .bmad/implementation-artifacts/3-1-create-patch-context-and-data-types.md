# Story 3.1: Create Patch Context and Data Types

Status: done

## Story

As a **developer**,
I want **a PatchContext that manages patch data and selection**,
so that **all components can access and modify patch state**.

## Acceptance Criteria

1. **AC1:** `src/contexts/PatchContext.tsx` exports a provider and `usePatch()` hook ✅
2. **AC2:** `src/types/patch.ts` defines `Patch`, `PatchModules`, `ModuleState` interfaces ✅ (from Story 2.4)
3. **AC3:** State includes: `patches` (array of 100), `selectedPatchId`, `currentPatch`, `isLoading` ✅
4. **AC4:** Actions include: `setPatches`, `selectPatch`, `updateCurrentPatch` ✅
5. **AC5:** The provider wraps the app inside DeviceContext provider ✅
6. **AC6:** `currentPatch` is derived from `selectedPatchId` and `patches` array ✅

## Tasks / Subtasks

- [x] Task 1: Verify patch types (AC: 2)
  - [x] Confirm types exist from Story 2.4

- [x] Task 2: Create PatchContext (AC: 1, 3, 4, 6)
  - [x] Create `src/contexts/PatchContext.tsx`
  - [x] Implement PatchProvider with useReducer
  - [x] Implement usePatch hook
  - [x] Derive currentPatch from selectedPatchId

- [x] Task 3: Integrate with App.tsx (AC: 5)
  - [x] Wrap routes with PatchProvider inside DeviceProvider

- [x] Task 4: Update Editor to use PatchContext
  - [x] Migrate local state to PatchContext

- [x] Task 5: Verify implementation
  - [x] Build passes
  - [x] Lint passes

## Dev Notes

### Existing Types (from Story 2.4)

Already have in `src/types/patch.ts`:
- ModuleName, ModuleState, PatchModules, Patch
- DataSource interface
- PatchListItem

### Previous Story Context

- Story 2.4: Created patch types and demo data source
- Story 2.6: Completed Epic 2 with device identification

### References

- [Source: architecture.md#Contexts]
- [Source: epics.md#Story 3.1]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created `src/contexts/PatchContext.tsx`:
  - PatchState interface: patches, selectedPatchId, isLoading, loadingProgress, error
  - PatchActions interface: setPatches, selectPatch, updateCurrentPatch, updateParameter, setLoading, setError, clearPatches
  - PatchContextValue with state, currentPatch (derived), and actions
  - useReducer for state management
  - currentPatch derived via useMemo from selectedPatchId
  - PatchProvider and usePatch hook exported
- Updated App.tsx:
  - Added PatchProvider inside DeviceProvider
- Updated Editor.tsx:
  - Replaced local useState with usePatch context
  - Uses patchState.patches, patchState.selectedPatchId, currentPatch
  - Uses patchActions for all mutations
  - Clears patches on disconnect
  - Shows loading progress percentage
- Build passes: 258KB JS, 22KB CSS
- Lint passes

### File List

**Created:**
- `zoom-g9.2tt-web/src/contexts/PatchContext.tsx` - Patch state management context

**Modified:**
- `zoom-g9.2tt-web/src/App.tsx` - Added PatchProvider
- `zoom-g9.2tt-web/src/pages/Editor.tsx` - Migrated to PatchContext
