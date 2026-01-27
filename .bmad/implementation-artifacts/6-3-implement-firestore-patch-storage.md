# Story 6.3: Implement Firestore Patch Storage

Status: done

## Story

As a **developer**,
I want **to store user patches in Firestore**,
So that **patches are persisted in the cloud per user**.

## Acceptance Criteria

1. **AC1:** `src/services/firebase/firestore.ts` exports `savePatches`, `loadPatches` functions
2. **AC2:** Patches are stored at path: `users/{userId}/patches/{patchId}`
3. **AC3:** Each patch document contains the full patch data as JSON
4. **AC4:** Firestore security rules enforce: users can only read/write their own data
5. **AC5:** `firestore.rules` file is created with proper rules
6. **AC6:** `loadPatches(userId)` returns all patches for the user
7. **AC7:** `savePatch(userId, patchId, patch)` saves a single patch
8. **AC8:** `saveAllPatches(userId, patches)` batch saves all patches

## Tasks / Subtasks

- [x] Task 1: Create Firestore service (AC: 1, 2, 3, 6, 7, 8)
  - [x] Create `src/services/firebase/firestore.ts`
  - [x] Implement `loadPatch(userId, patchId)` function
  - [x] Implement `loadPatches(userId)` function
  - [x] Implement `savePatch(userId, patchId, patch)` function
  - [x] Implement `saveAllPatches(userId, patches)` function
  - [x] Add `isFirestoreAvailable()` helper

- [x] Task 2: Create security rules (AC: 4, 5)
  - [x] Create `firestore.rules` file
  - [x] Enforce user can only access own data

- [x] Task 3: Verify implementation
  - [x] Build passes
  - [x] Lint passes

## Dev Notes

### Data Structure

```
/users/{userId}/patches/{patchId}
{
  id: number,
  name: string,
  level: number,
  modules: {
    amp: { enabled: boolean, type: number, params: number[] },
    comp: { enabled: boolean, type: number, params: number[] },
    // ... all 10 modules
  },
  updatedAt: number  // timestamp for sync conflict resolution
}
```

### Security Rules

The `firestore.rules` file enforces:
- Only authenticated users can access data
- Users can only read/write their own data under `/users/{userId}/`
- All other paths are denied by default

### Batch Operations

`saveAllPatches` uses Firestore's `writeBatch` for atomic writes of all 100 patches. Firestore limits batches to 500 operations, so 100 patches fit in one batch.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created `src/services/firebase/firestore.ts` with:
  - `loadPatch(userId, patchId)` - Load a single patch
  - `loadPatches(userId)` - Load all patches for a user
  - `savePatch(userId, patchId, patch)` - Save a single patch
  - `saveAllPatches(userId, patches)` - Batch save all patches
  - `isFirestoreAvailable()` - Check if Firestore is configured
  - Helper functions for converting Patch to/from Firestore format
- Created `firestore.rules` with security rules that enforce user-scoped access

### File List

**Created:**
- `zoom-g9.2tt-web/src/services/firebase/firestore.ts` - Firestore patch storage service
- `zoom-g9.2tt-web/firestore.rules` - Security rules for Firestore
