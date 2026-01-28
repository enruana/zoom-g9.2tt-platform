/**
 * ClientBadge - Shows connection status for client mode
 */

interface ClientBadgeProps {
  hostName: string;
  sessionCode: string;
  onLeave: () => void;
}

export function ClientBadge({ hostName, sessionCode, onLeave }: ClientBadgeProps) {
  // Truncate long host names on mobile
  const displayName = hostName.length > 10 ? `${hostName.substring(0, 10)}...` : hostName;

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      {/* Status Badge */}
      <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg max-w-[200px] sm:max-w-none">
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
        {/* Desktop: Full text */}
        <span className="hidden sm:inline text-blue-400 text-sm">
          Controlling <span className="font-medium">{hostName}'s</span> pedal
        </span>
        {/* Mobile: Shortened text */}
        <span className="sm:hidden text-blue-400 text-xs truncate">
          <span className="font-medium">{displayName}</span>
        </span>
        <span className="text-blue-400/50 font-mono text-[10px] sm:text-xs flex-shrink-0">({sessionCode})</span>
      </div>

      {/* Leave Button */}
      <button
        onClick={onLeave}
        className="p-1.5 sm:p-1.5 hover:bg-red-500/20 active:bg-red-500/30 rounded-lg text-neutral-400 hover:text-red-400 transition-colors flex-shrink-0"
        title="Leave session"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  );
}
