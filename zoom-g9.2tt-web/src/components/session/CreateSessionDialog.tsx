/**
 * CreateSessionDialog - Modal for creating a new session
 */

import { useState } from 'react';

interface CreateSessionDialogProps {
  isOpen: boolean;
  isCreating: boolean;
  sessionCode: string | null;
  error: string | null;
  onClose: () => void;
  onCreate: () => Promise<void>;
}

export function CreateSessionDialog({
  isOpen,
  isCreating,
  sessionCode,
  error,
  onClose,
  onCreate,
}: CreateSessionDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    if (!sessionCode) return;

    try {
      await navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = sessionCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    if (!sessionCode) return;

    const link = `${window.location.origin}/join/${sessionCode}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={sessionCode ? onClose : undefined}
      />

      {/* Dialog */}
      <div className="relative w-full sm:max-w-md bg-neutral-800 border-t sm:border border-neutral-700 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-none overflow-y-auto">
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-green-500" />

        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-neutral-600 rounded-full" />
        </div>

        {/* Close button */}
        {sessionCode && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-white hover:bg-neutral-700 rounded-full transition-all z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="p-4 sm:p-6 pt-2 sm:pt-6">
          {/* Not yet created */}
          {!sessionCode && !isCreating && (
            <>
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Share Your Pedal</h2>
                  <p className="text-neutral-400 text-xs sm:text-sm">Let others control your G9.2tt remotely</p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 text-xs font-bold">1</span>
                  </div>
                  <p className="text-neutral-300 text-xs sm:text-sm">Create a session to get a unique code</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 text-xs font-bold">2</span>
                  </div>
                  <p className="text-neutral-300 text-xs sm:text-sm">Share the code with others</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 text-xs font-bold">3</span>
                  </div>
                  <p className="text-neutral-300 text-xs sm:text-sm">They can join and control your pedal in real-time</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-xs sm:text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500 rounded-xl text-white text-sm sm:text-base font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onCreate}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 active:from-green-400 active:to-green-300 rounded-xl text-white text-sm sm:text-base font-medium transition-all shadow-lg shadow-green-500/25"
                >
                  Create Session
                </button>
              </div>
            </>
          )}

          {/* Creating */}
          {isCreating && (
            <div className="text-center py-6 sm:py-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full border-4 border-neutral-700 border-t-green-500 animate-spin" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Creating Session</h3>
              <p className="text-neutral-400 text-xs sm:text-sm">Setting up your session...</p>
            </div>
          )}

          {/* Session Created */}
          {sessionCode && !isCreating && (
            <>
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-green-400 mb-2">Session Created!</h3>
                <p className="text-neutral-400 text-xs sm:text-sm">Share this code with others to let them join</p>
              </div>

              {/* Session Code */}
              <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 sm:p-4 mb-4">
                <div className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wider mb-2 text-center">Session Code</div>
                <div className="text-3xl sm:text-4xl font-mono text-green-400 tracking-[0.2em] sm:tracking-[0.3em] text-center">{sessionCode}</div>
              </div>

              {/* Copy Buttons */}
              <div className="flex gap-2 sm:gap-3 mb-4">
                <button
                  onClick={handleCopyCode}
                  className="flex-1 py-3 sm:py-2.5 px-3 sm:px-4 bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500 rounded-lg text-white text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="hidden xs:inline">Copied!</span>
                      <span className="xs:hidden">OK</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden xs:inline">Copy Code</span>
                      <span className="xs:hidden">Code</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-3 sm:py-2.5 px-3 sm:px-4 bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500 rounded-lg text-white text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="hidden xs:inline">Copy Link</span>
                  <span className="xs:hidden">Link</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 active:from-green-400 active:to-green-300 rounded-xl text-white text-sm sm:text-base font-medium transition-all"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
