# Story 6.1: Implement Firebase Authentication

Status: done

## Story

As a **developer**,
I want **Firebase Auth integrated with Google sign-in**,
So that **users can authenticate and have their own cloud storage**.

## Acceptance Criteria

1. **AC1:** `src/contexts/AuthContext.tsx` exports a provider and `useAuth()` hook
2. **AC2:** The context provides: `user`, `isLoading`, `error` state
3. **AC3:** The context provides: `signInWithGoogle`, `signOut` actions
4. **AC4:** `src/services/firebase/auth.ts` wraps Firebase Auth methods
5. **AC5:** `signInWithGoogle()` opens Google OAuth popup
6. **AC6:** Session persists across page reloads using `browserLocalPersistence`
7. **AC7:** `onAuthStateChanged` listener updates context when auth state changes
8. **AC8:** The provider wraps the app inside other context providers

## Tasks / Subtasks

- [x] Task 1: Create auth types (AC: 2, 3)
  - [x] Create `src/types/auth.ts` with AuthState, AuthActions, AuthContextValue

- [x] Task 2: Create Firebase auth service (AC: 4, 5, 6)
  - [x] Create `src/services/firebase/auth.ts`
  - [x] Implement `initAuth()` with browserLocalPersistence
  - [x] Implement `signInWithGoogle()` with popup
  - [x] Implement `signOut()`
  - [x] Implement `subscribeToAuthState()` for onAuthStateChanged
  - [x] Handle Firebase auth errors with user-friendly messages

- [x] Task 3: Create AuthContext (AC: 1, 2, 3, 7)
  - [x] Create `src/contexts/AuthContext.tsx`
  - [x] Implement reducer with AUTH_STATE_CHANGED, AUTH_LOADING, AUTH_ERROR actions
  - [x] Subscribe to auth state changes on mount
  - [x] Export `AuthProvider` and `useAuth()` hook

- [x] Task 4: Integrate with App (AC: 8)
  - [x] Add `AuthProvider` to App.tsx wrapping other providers

- [x] Task 5: Verify implementation
  - [x] Build passes: 1,318KB JS, 39KB CSS
  - [x] Lint passes

## Dev Notes

### Firebase Auth Configuration

The auth service gracefully handles missing Firebase configuration - if `firebaseApp` is null (no env vars), auth features are disabled but the app continues to work.

### Error Handling

User-friendly error messages for common auth errors:
- `auth/popup-closed-by-user` → "Sign-in cancelled"
- `auth/popup-blocked` → "Popup was blocked. Please allow popups for this site."
- `auth/network-request-failed` → "Network error. Please check your connection."

### Session Persistence

Uses `browserLocalPersistence` so sessions survive browser restarts.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created `src/types/auth.ts` with AuthState, AuthActions, AuthContextValue interfaces
- Created `src/services/firebase/auth.ts` with:
  - `initAuth()` - Initialize Firebase Auth with local persistence
  - `signInWithGoogle()` - Google OAuth popup sign-in
  - `signOut()` - Sign out current user
  - `subscribeToAuthState()` - Subscribe to auth state changes
  - `getCurrentUser()` - Get current user synchronously
  - `isAuthAvailable()` - Check if Firebase is configured
- Created `src/contexts/AuthContext.tsx` with:
  - AuthProvider component with useReducer
  - useAuth() hook for consuming auth state
  - Auto-subscription to auth state changes
- Updated `src/App.tsx` to wrap with AuthProvider
- Fixed preexisting lint issues in StarField.tsx and Splash.tsx

### File List

**Created:**
- `zoom-g9.2tt-web/src/types/auth.ts` - Auth type definitions
- `zoom-g9.2tt-web/src/services/firebase/auth.ts` - Firebase auth service
- `zoom-g9.2tt-web/src/contexts/AuthContext.tsx` - Auth context and provider

**Modified:**
- `zoom-g9.2tt-web/src/App.tsx` - Added AuthProvider
- `zoom-g9.2tt-web/src/components/three/StarField.tsx` - Fixed lint issues (removed unused code, added eslint-disable for intentional Math.random)
- `zoom-g9.2tt-web/src/pages/Splash.tsx` - Added eslint-disable for setState in effect
