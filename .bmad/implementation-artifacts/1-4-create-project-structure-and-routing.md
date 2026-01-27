# Story 1.4: Create Project Structure and Routing

Status: done

## Story

As a **developer**,
I want **the complete folder structure and routing configured**,
so that **all future stories have a consistent place to add code**.

## Acceptance Criteria

1. **AC1:** The following folders exist: ✅
   - `src/components/common/`
   - `src/components/pedalboard/`
   - `src/components/parameter/`
   - `src/components/splash/`
   - `src/contexts/`
   - `src/hooks/`
   - `src/services/midi/`
   - `src/services/firebase/` (from Story 1.3)
   - `src/types/`
   - `src/data/`
   - `src/pages/`

2. **AC2:** React Router v6 is installed and configured in `App.tsx` ✅
3. **AC3:** Route `/` renders `Splash.tsx` placeholder component ✅
4. **AC4:** Route `/editor` renders `Editor.tsx` placeholder component ✅
5. **AC5:** Navigation between routes works correctly ✅
6. **AC6:** A 404 fallback redirects to `/` ✅

## Tasks / Subtasks

- [x] Task 1: Create folder structure (AC: 1)
  - [x] Create all required directories
  - [x] Add .gitkeep files to empty directories

- [x] Task 2: Install React Router (AC: 2)
  - [x] Run `npm install react-router-dom`

- [x] Task 3: Create placeholder page components (AC: 3, 4)
  - [x] Create `src/pages/Splash.tsx`
  - [x] Create `src/pages/Editor.tsx`

- [x] Task 4: Configure routing in App.tsx (AC: 2, 5, 6)
  - [x] Import BrowserRouter, Routes, Route, Navigate
  - [x] Configure routes for / and /editor
  - [x] Add 404 fallback with Navigate to /

- [x] Task 5: Verify routing (AC: 5)
  - [x] Run dev server
  - [x] Build passes with no errors
  - [x] Lint passes with no errors

## Dev Notes

### Previous Story Context

Story 1.3 completed: Firebase SDK configured with graceful degradation

### References

- [Source: architecture.md#Project Structure]
- [Source: epics.md#Story 1.4]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created complete folder structure per Architecture document:
  - `src/components/` with common/, pedalboard/, parameter/, splash/ subdirs
  - `src/contexts/`, `src/hooks/`, `src/types/`, `src/data/`, `src/pages/`
  - `src/services/midi/` (firebase/ already existed)
- Added .gitkeep files to all empty directories
- Installed react-router-dom v7.6.0 (4 packages added)
- Created `Splash.tsx` with navigation link to /editor
- Created `Editor.tsx` with back navigation to /
- Configured App.tsx with BrowserRouter and Routes:
  - `/` → Splash component
  - `/editor` → Editor component
  - `*` → Navigate to / (404 fallback)
- Build passes: 229KB JS, 6KB CSS (includes React Router)
- Lint passes with no errors

### File List

**Created:**
- `zoom-g9.2tt-web/src/pages/Splash.tsx` - Home page with enter editor link
- `zoom-g9.2tt-web/src/pages/Editor.tsx` - Editor page placeholder
- `zoom-g9.2tt-web/src/components/common/.gitkeep`
- `zoom-g9.2tt-web/src/components/pedalboard/.gitkeep`
- `zoom-g9.2tt-web/src/components/parameter/.gitkeep`
- `zoom-g9.2tt-web/src/components/splash/.gitkeep`
- `zoom-g9.2tt-web/src/contexts/.gitkeep`
- `zoom-g9.2tt-web/src/hooks/.gitkeep`
- `zoom-g9.2tt-web/src/services/midi/.gitkeep`
- `zoom-g9.2tt-web/src/types/.gitkeep`
- `zoom-g9.2tt-web/src/data/.gitkeep`

**Modified:**
- `zoom-g9.2tt-web/src/App.tsx` - Added React Router configuration
- `zoom-g9.2tt-web/package.json` - Added react-router-dom dependency
- `zoom-g9.2tt-web/package-lock.json` - Updated with router packages
