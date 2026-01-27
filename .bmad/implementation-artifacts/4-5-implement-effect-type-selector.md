# Story 4.5: Implement Effect Type Selector

Status: done

## Story

As a **user**,
I want **to change the effect type within a module**,
So that **I can use different amp models, modulations, etc**.

## Acceptance Criteria

1. **AC1:** When I tap/click on the effect type name, a selector/dropdown appears ✅
2. **AC2:** The selector shows all available types for that module ✅
3. **AC3:** Effect types are loaded from `src/data/effectTypes.ts` ✅
4. **AC4:** AMP module shows 44 amp types, MOD shows 28 types, etc. ✅
5. **AC5:** Selecting a new type updates the module's type ✅
6. **AC6:** The available parameters may change based on the selected type ✅
7. **AC7:** The knob display updates to show the new type's parameters ✅
8. **AC8:** The selector is searchable/filterable for modules with many types ✅

## Tasks / Subtasks

- [x] Task 1: Create TypeSelector component (AC: 1, 2, 8)
  - [x] Create `src/components/parameter/TypeSelector.tsx`
  - [x] Modal with scrollable list of types
  - [x] Search/filter input for long lists (> 10 types)
  - [x] Current type highlighted and scrolled into view

- [x] Task 2: Add updateModuleType to PatchContext (AC: 5)
  - [x] Add UPDATE_MODULE_TYPE action type
  - [x] Add reducer case handler
  - [x] Add updateModuleType action function

- [x] Task 3: Integrate with Editor (AC: 1, 3, 4, 6, 7)
  - [x] Add showTypeSelector state
  - [x] Update handleTypeSelect to open selector
  - [x] Add handleCloseTypeSelector and handleTypeChange
  - [x] Render TypeSelector modal

- [x] Task 4: Verify implementation
  - [x] Build passes: 296KB JS, 34KB CSS
  - [x] Lint passes

## Dev Notes

### Type Counts per Module

From effectTypes.ts:
- AMP: 44 types (search enabled)
- COMP: 3 types
- WAH: 17 types (search enabled)
- ZNR: 3 types
- MOD: 28 types (search enabled)
- DLY: 7 types
- REV: 15 types (search enabled)
- EXT, EQ, CAB: 1 type each (no selector button shown)

### Search Threshold

Search input shown for modules with > 10 types:
- AMP (44), WAH (17), MOD (28), REV (15)

### Z-Index Layering

- ModulePanel: z-50
- ParameterModal: z-60
- TypeSelector: z-70 (highest, appears over everything)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created `src/components/parameter/TypeSelector.tsx`:
  - Modal with scrollable type list
  - Search input for modules with > 10 types
  - Filter by name or shortName
  - Current type highlighted with blue background
  - Auto-scroll to current type on mount
  - Type ID shown on the right
  - ESC key and backdrop click to close

- Updated `src/contexts/PatchContext.tsx`:
  - Added `updateModuleType` to PatchActions interface
  - Added UPDATE_MODULE_TYPE action type
  - Added reducer case to update module.type
  - Added action function to dispatch

- Updated `src/pages/Editor.tsx`:
  - Added showTypeSelector state
  - Updated handleTypeSelect to open selector (only for modules with multiple types)
  - Added handleCloseTypeSelector and handleTypeChange handlers
  - Render TypeSelector when showTypeSelector is true
  - Import TypeSelector and hasMultipleTypes

- Build: 295.82KB JS, 34.25KB CSS
- Lint passes

### File List

**Created:**
- `zoom-g9.2tt-web/src/components/parameter/TypeSelector.tsx` - Searchable effect type selector

**Modified:**
- `zoom-g9.2tt-web/src/contexts/PatchContext.tsx` - Added updateModuleType action
- `zoom-g9.2tt-web/src/pages/Editor.tsx` - Integrated TypeSelector
