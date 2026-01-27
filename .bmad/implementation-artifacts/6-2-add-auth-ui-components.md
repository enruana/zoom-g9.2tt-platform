# Story 6.2: Add Auth UI Components

Status: done

## Story

As a **user**,
I want **to sign in with my Gmail account**,
So that **I can sync my patches across devices**.

## Acceptance Criteria

1. **AC1:** "Sign in with Google" button visible when not signed in
2. **AC2:** After sign-in, user sees profile picture and email
3. **AC3:** Sign out option available in dropdown menu
4. **AC4:** Confirmation dialog before sign out
5. **AC5:** Auth errors show clear messages
6. **AC6:** UI is consistent between Splash and Editor pages

## Tasks / Subtasks

- [x] Task 1: Create UserMenu component (AC: 1, 2, 3, 4, 5)
  - [x] Create `src/components/common/UserMenu.tsx`
  - [x] Show "Sign in with Google" button when not authenticated
  - [x] Show user avatar when authenticated
  - [x] Implement dropdown menu with user info and sign out option
  - [x] Add sign out confirmation dialog
  - [x] Show error messages for auth failures

- [x] Task 2: Integrate with Splash page (AC: 6)
  - [x] Add UserMenu to Splash.tsx top-right corner

- [x] Task 3: Integrate with Editor page (AC: 6)
  - [x] Add UserMenu to Editor.tsx header

- [x] Task 4: Verify implementation
  - [x] Build passes: 1,323KB JS, 40KB CSS
  - [x] Lint passes

## Dev Notes

### UserMenu Component Features

- **Not signed in state:**
  - White Google-branded "Sign in" button
  - Loading spinner during sign-in
  - Error message with dismiss option

- **Signed in state:**
  - User avatar (photo or initial fallback)
  - Click to open dropdown
  - Dropdown shows full user info (photo, name, email)
  - Sign out button in dropdown

- **Sign out confirmation:**
  - Modal dialog with confirmation message
  - "Your local changes will be preserved" reassurance
  - Cancel and Sign out buttons

### Graceful Degradation

If Firebase is not configured (no env vars), UserMenu renders nothing and the app works without auth features.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created `src/components/common/UserMenu.tsx`:
  - Sign in button with Google logo
  - Avatar display with dropdown menu
  - User info section with photo, name, email
  - Sign out confirmation dialog
  - Error handling and display
  - Graceful degradation when Firebase not configured
- Added UserMenu to `src/pages/Splash.tsx` (top-right corner)
- Added UserMenu to `src/pages/Editor.tsx` (in header, after Disconnect button)
- Fixed TypeScript null safety issues with User properties

### File List

**Created:**
- `zoom-g9.2tt-web/src/components/common/UserMenu.tsx` - User menu component

**Modified:**
- `zoom-g9.2tt-web/src/pages/Splash.tsx` - Added UserMenu import and component
- `zoom-g9.2tt-web/src/pages/Editor.tsx` - Added UserMenu import and component in header
