# Story 1.3: Setup Firebase Configuration

Status: done

## Story

As a **developer**,
I want **Firebase SDK configured with environment variables**,
so that **the app can use Firebase Auth and Firestore**.

## Acceptance Criteria

1. **AC1:** Firebase installed with `npm install firebase` ✅
2. **AC2:** `src/services/firebase/config.ts` exports initialized Firebase app ✅
3. **AC3:** Firebase configuration uses `import.meta.env.VITE_*` variables ✅
4. **AC4:** `.env.example` documents all required Firebase environment variables ✅
5. **AC5:** `.env` is added to `.gitignore` ✅
6. **AC6:** The app builds successfully with placeholder environment values ✅
7. **AC7:** A console warning appears if Firebase config is missing (graceful degradation) ✅

## Tasks / Subtasks

- [x] Task 1: Install Firebase SDK (AC: 1)
  - [x] Run `npm install firebase`

- [x] Task 2: Create Firebase config file (AC: 2, 3, 7)
  - [x] Create `src/services/firebase/` directory
  - [x] Create `src/services/firebase/config.ts` with Firebase initialization
  - [x] Use `import.meta.env.VITE_*` for all configuration values
  - [x] Add console warning if config is missing

- [x] Task 3: Create environment variable documentation (AC: 4)
  - [x] Create `.env.example` with all required Firebase variables

- [x] Task 4: Ensure .env is gitignored (AC: 5)
  - [x] Verify or add `.env` to `.gitignore`

- [x] Task 5: Verify build (AC: 6)
  - [x] Run `npm run build` and verify no errors
  - [x] Verify graceful degradation warning in console

## Dev Notes

### Firebase Configuration Variables

Required environment variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### Graceful Degradation

The Firebase config checks if all required variables are present. If not, it:
1. Logs a warning to console
2. Exports `null` for the Firebase app
3. Allows the app to continue running (demo mode compatible)

### Previous Story Context

Story 1.2 completed: Tailwind CSS configured with @tailwindcss/vite plugin

### References

- [Source: architecture.md#Infrastructure Requirements]
- [Source: epics.md#Story 1.3]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Installed Firebase SDK v11.6.0 (80 packages added)
- Created `src/services/firebase/config.ts` with:
  - Type-safe Firebase initialization using `import.meta.env.VITE_*` variables
  - Validation function that checks all required config keys
  - Graceful degradation: exports `null` if config missing with console warning
- Created `.env.example` documenting all 6 required Firebase variables
- Updated `.gitignore` to explicitly include `.env`, `.env.local`, `.env.*.local`
- Build passes: 193KB JS, 4.85KB CSS
- TypeScript fix: Used type-only import for `FirebaseApp` to satisfy `verbatimModuleSyntax`

### File List

**Created:**
- `zoom-g9.2tt-web/src/services/firebase/config.ts` - Firebase initialization with graceful degradation
- `zoom-g9.2tt-web/.env.example` - Environment variable documentation

**Modified:**
- `zoom-g9.2tt-web/package.json` - Added firebase dependency
- `zoom-g9.2tt-web/package-lock.json` - Updated with Firebase packages
- `zoom-g9.2tt-web/.gitignore` - Added .env patterns
