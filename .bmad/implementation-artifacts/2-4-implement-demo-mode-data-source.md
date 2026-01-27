# Story 2.4: Implement Demo Mode Data Source

Status: done

## Story

As a **user**,
I want **to explore the app without connecting hardware**,
so that **I can see what the app offers before buying a G9.2tt**.

## Acceptance Criteria

1. **AC1:** DeviceContext state is set to `demo` when entering demo mode ✅
2. **AC2:** A `DataSource` interface is defined with `readPatch`, `writePatch`, `sendParameter` methods ✅
3. **AC3:** `DemoDataSource` implements this interface with mock data ✅
4. **AC4:** `src/data/demoPatches.ts` contains sample patch data for all 100 patches ✅
5. **AC5:** The Editor page loads with demo patches visible ✅
6. **AC6:** All UI interactions work (selecting modules, viewing parameters) ✅
7. **AC7:** Parameter changes update local state but show "Demo Mode" indicator ✅
8. **AC8:** User can switch from demo to connected mode by returning to splash ✅

## Tasks / Subtasks

- [x] Task 1: Create Patch types (AC: 2)
  - [x] Create `src/types/patch.ts` with Patch, Module interfaces
  - [x] Define DataSource interface

- [x] Task 2: Create demo patch data (AC: 4)
  - [x] Create `src/data/demoPatches.ts` with 100 sample patches

- [x] Task 3: Create DemoDataSource (AC: 3)
  - [x] Implement DataSource interface with mock behavior
  - [x] Export from `src/services/data/DemoDataSource.ts`

- [x] Task 4: Update Editor page (AC: 5, 6, 7)
  - [x] Show patch list with demo data
  - [x] Show "Demo Mode" indicator
  - [x] Enable basic navigation

- [x] Task 5: Handle mode switching (AC: 1, 8)
  - [x] Redirect to splash if disconnected
  - [x] Clear demo state when reconnecting

- [x] Task 6: Verify implementation
  - [x] Build passes
  - [x] Lint passes

## Dev Notes

### Patch Data Structure

From architecture, each patch has:
- id (0-99)
- name (10 chars max)
- level (0-100)
- modules: amp, comp, wah, ext, znr, eq, cab, mod, dly, rev

### Previous Story Context

- Story 2.3: Splash screen with demo mode button

### References

- [Source: architecture.md#Data Model]
- [Source: epics.md#Story 2.4]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created `src/types/patch.ts` with complete type definitions:
  - `ModuleName` union type for module keys
  - `ModuleState` interface (enabled, type, params)
  - `PatchModules` interface (10 modules)
  - `Patch` interface (id, name, level, modules)
  - `ParameterChange` interface for real-time updates
  - `DataSource` interface (readPatch, writePatch, sendParameter, readAllPatches)
  - `PatchListItem` for minimal list display
- Created `src/data/demoPatches.ts` with:
  - 100 sample patches with varied settings
  - Patch names covering various genres and styles
  - Different amp types, gain levels, and effect combinations
  - Helper functions: getDemoPatch, getAllDemoPatches
- Created `src/services/data/DemoDataSource.ts`:
  - Implements DataSource interface
  - Simulates network delays for realistic UX
  - Stores local copy for modifications
  - Console logs for demo mode visibility
  - Reset method to restore initial state
- Updated Editor.tsx with full demo mode support:
  - Patch list sidebar with scrollable list
  - Selected patch details with modules grid
  - Demo mode indicator in header (purple badge)
  - Demo mode notice in editor area
  - Disconnect button returns to splash
  - Auto-redirect to splash if disconnected
- Build passes: 243KB JS, 14KB CSS
- Lint passes

### File List

**Created:**
- `zoom-g9.2tt-web/src/types/patch.ts` - Patch data types and DataSource interface
- `zoom-g9.2tt-web/src/data/demoPatches.ts` - 100 sample demo patches
- `zoom-g9.2tt-web/src/services/data/DemoDataSource.ts` - Demo mode data source

**Modified:**
- `zoom-g9.2tt-web/src/pages/Editor.tsx` - Complete editor UI with demo support

**Deleted:**
- `zoom-g9.2tt-web/src/data/.gitkeep`
