/**
 * Dialog to guide user through bulk send process
 *
 * The G9.2tt bulk write protocol requires the user to manually
 * put the pedal in "BulkDumpRx" mode before the transfer can begin.
 */

interface BulkSendDialogProps {
  isOpen: boolean;
  isSending: boolean;
  progress: number;
  onStartSend: () => void;
  onCancel: () => void;
}

export function BulkSendDialog({
  isOpen,
  isSending,
  progress,
  onStartSend,
  onCancel,
}: BulkSendDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={isSending ? undefined : onCancel} />
      <div className="relative bg-neutral-900 rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4 border border-neutral-700">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Send All Patches to Pedal</h2>
            <p className="text-sm text-neutral-400">Bulk transfer requires manual pedal setup</p>
          </div>
        </div>

        {isSending ? (
          /* Sending state */
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full" />
                <div
                  className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"
                  style={{ animationDuration: '1s' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{progress}%</span>
                </div>
              </div>
              <p className="text-neutral-300 font-medium">Sending patches to pedal...</p>
              <p className="text-sm text-neutral-500 mt-1">
                Patch {Math.floor(progress)} of 100
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <p className="text-amber-300 text-sm">
                <strong>Do not disconnect</strong> the pedal or close this window during transfer.
              </p>
            </div>
          </div>
        ) : (
          /* Instructions state */
          <div className="space-y-4">
            <p className="text-neutral-300">
              Follow these steps on your <strong className="text-white">G9.2tt pedal</strong> to prepare for bulk transfer:
            </p>

            {/* Step 1 */}
            <div className="flex gap-3 p-3 bg-neutral-800 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">1</span>
              </div>
              <div>
                <p className="text-white font-medium">Press AMP SELECT SYSTEM</p>
                <p className="text-sm text-neutral-400">
                  Hold for 2 seconds to enter System menu
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3 p-3 bg-neutral-800 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">2</span>
              </div>
              <div>
                <p className="text-white font-medium">Turn BANK/TYPE knob</p>
                <p className="text-sm text-neutral-400">
                  Find <code className="bg-neutral-700 px-1.5 py-0.5 rounded text-blue-300">BulkDumpRx</code> on the display
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3 p-3 bg-neutral-800 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">3</span>
              </div>
              <div>
                <p className="text-white font-medium">Press PAGE button</p>
                <p className="text-sm text-neutral-400">
                  Pedal will show "Waiting..." and be ready to receive
                </p>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-amber-300 text-sm">
                  <strong>Warning:</strong> This will overwrite all 100 patches on your pedal.
                  Make sure you have a backup if needed.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onStartSend}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Start Transfer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
