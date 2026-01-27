/**
 * User Menu Component
 *
 * Displays sign-in button when not authenticated,
 * or user avatar with dropdown menu when signed in.
 */

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { isAuthAvailable } from '../../services/firebase/auth';

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className = '' }: UserMenuProps) {
  const { state, actions } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Don't render if Firebase is not configured
  if (!isAuthAvailable()) {
    return null;
  }

  // Loading state
  if (state.isLoading && !state.user) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="w-8 h-8 rounded-full bg-neutral-700 animate-pulse" />
      </div>
    );
  }

  // Not signed in - show sign in button
  if (!state.user) {
    return (
      <div className={className}>
        <button
          onClick={() => actions.signInWithGoogle()}
          disabled={state.isLoading}
          className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-800 text-sm font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state.isLoading ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          <span>Sign in</span>
        </button>

        {/* Error message */}
        {state.error && (
          <div className="absolute top-full mt-2 right-0 w-64 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
            {state.error}
            <button
              onClick={() => actions.clearError()}
              className="ml-2 text-red-300 hover:text-red-200"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    );
  }

  // Signed in - show avatar with dropdown
  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {state.user.photoURL ? (
          <img
            src={state.user.photoURL}
            alt={state.user.displayName || 'User'}
            className="w-8 h-8 rounded-full border-2 border-transparent hover:border-blue-500 transition-colors"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            {(state.user.displayName ?? state.user.email ?? '?').charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-50">
          {/* User info */}
          <div className="p-3 border-b border-neutral-700">
            <div className="flex items-center gap-3">
              {state.user.photoURL ? (
                <img
                  src={state.user.photoURL}
                  alt={state.user.displayName || 'User'}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {(state.user.displayName ?? state.user.email ?? '?').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {state.user.displayName && (
                  <div className="text-sm font-medium text-white truncate">
                    {state.user.displayName}
                  </div>
                )}
                <div className="text-xs text-neutral-400 truncate">
                  {state.user.email}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-1">
            <button
              onClick={() => {
                setIsOpen(false);
                setShowSignOutConfirm(true);
              }}
              className="w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-700 rounded flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Sign out confirmation dialog */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowSignOutConfirm(false)}
          />
          <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Sign out?</h3>
            <p className="text-neutral-400 text-sm mb-4">
              Your local changes will be preserved. You can sign back in anytime.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowSignOutConfirm(false);
                  await actions.signOut();
                }}
                disabled={state.isLoading}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
              >
                {state.isLoading ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {state.error && (
        <div className="absolute top-full mt-2 right-0 w-64 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
          {state.error}
          <button
            onClick={() => actions.clearError()}
            className="ml-2 text-red-300 hover:text-red-200"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
