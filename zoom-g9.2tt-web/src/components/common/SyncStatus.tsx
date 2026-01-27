/**
 * Sync Status Indicator
 *
 * Shows the current cloud sync status with an icon and optional text.
 */

import { useAuth } from '../../contexts/AuthContext';
import { useSync } from '../../contexts/SyncContext';
import { isFirestoreAvailable } from '../../services/firebase/firestore';

interface SyncStatusProps {
  /** Whether to show text label (default: false) */
  showLabel?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function SyncStatus({ showLabel = false, className = '' }: SyncStatusProps) {
  const { state: authState } = useAuth();
  const { state: syncState, actions } = useSync();

  // Don't show if not signed in or Firestore not available
  if (!authState.user || !isFirestoreAvailable()) {
    return null;
  }

  const getIcon = () => {
    switch (syncState.status) {
      case 'syncing':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );

      case 'synced':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );

      case 'error':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );

      case 'offline':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
            />
          </svg>
        );

      case 'idle':
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        );
    }
  };

  const getLabel = () => {
    switch (syncState.status) {
      case 'syncing':
        return 'Syncing...';
      case 'synced':
        return 'Synced';
      case 'error':
        return 'Sync error';
      case 'offline':
        return 'Offline';
      case 'idle':
      default:
        return 'Cloud';
    }
  };

  const getColor = () => {
    switch (syncState.status) {
      case 'syncing':
        return 'text-blue-400';
      case 'synced':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'offline':
        return 'text-yellow-400';
      case 'idle':
      default:
        return 'text-neutral-400';
    }
  };

  return (
    <div className={`flex items-center gap-1.5 ${getColor()} ${className}`}>
      {getIcon()}
      {showLabel && <span className="text-xs">{getLabel()}</span>}

      {/* Error tooltip/message */}
      {syncState.error && (
        <button
          onClick={() => actions.clearError()}
          className="ml-1 text-xs text-red-300 hover:text-red-200 underline"
          title={syncState.error}
        >
          Retry
        </button>
      )}
    </div>
  );
}
