/**
 * SessionBadge - Shows session code and client count for server mode
 */

import { useState } from 'react';

interface SessionBadgeProps {
  code: string;
  clientCount: number;
  onEndSession: () => void;
}

export function SessionBadge({ code, clientCount, onEndSession }: SessionBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative">
      {/* Badge Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-colors"
      >
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-green-400 font-mono text-xs sm:text-sm tracking-wider">{code}</span>
        <span className="text-green-400/70 text-[10px] sm:text-xs hidden xs:inline">
          {clientCount} {clientCount === 1 ? 'client' : 'clients'}
        </span>
        {/* Mobile: Show just number */}
        <span className="text-green-400/70 text-[10px] xs:hidden">
          ({clientCount})
        </span>
        <svg
          className={`w-3 h-3 sm:w-4 sm:h-4 text-green-400 transition-transform ${showDetails ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Details Dropdown */}
      {showDetails && (
        <div className="fixed sm:absolute inset-x-4 sm:inset-x-auto bottom-4 sm:bottom-auto sm:top-full sm:right-0 sm:mt-2 sm:w-64 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Mobile Close Button */}
          <button
            onClick={() => setShowDetails(false)}
            className="sm:hidden absolute top-3 right-3 p-2 text-neutral-500 hover:text-white hover:bg-neutral-700 rounded-full transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="p-4 border-b border-neutral-700">
            <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Session Code</div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-2xl sm:text-2xl font-mono text-green-400 tracking-widest">{code}</span>
              <button
                onClick={handleCopyCode}
                className="p-2 sm:p-1.5 hover:bg-neutral-700 rounded-lg transition-colors"
                title="Copy code"
              >
                {copied ? (
                  <svg className="w-5 h-5 sm:w-4 sm:h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 sm:w-4 sm:h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 border-b border-neutral-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-white font-medium">{clientCount} Connected</div>
                <div className="text-xs text-neutral-500 truncate">
                  {clientCount === 0 ? 'Share code to let others join' : 'Remote clients controlling pedal'}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-3 sm:p-3">
            <button
              onClick={() => {
                setShowDetails(false);
                onEndSession();
              }}
              className="w-full py-3 sm:py-2 px-4 bg-red-500/20 hover:bg-red-500/30 active:bg-red-500/40 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium transition-colors"
            >
              End Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
