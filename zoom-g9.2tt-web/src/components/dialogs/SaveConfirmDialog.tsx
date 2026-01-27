import { useEffect, useRef } from 'react';

interface SaveConfirmDialogProps {
  patchId: number;
  patchName: string;
  isSaving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SaveConfirmDialog({
  patchId,
  patchName,
  isSaving,
  onConfirm,
  onCancel,
}: SaveConfirmDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus confirm button on mount
  useEffect(() => {
    confirmButtonRef.current?.focus();
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, isSaving]);

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={isSaving ? undefined : onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 border border-gray-600">
        <h3 className="text-lg font-semibold text-white mb-2">Save Patch</h3>

        <p className="text-gray-300 mb-6">
          Save changes to{' '}
          <span className="font-mono text-blue-400">
            {String(patchId).padStart(2, '0')}
          </span>
          {' - '}
          <span className="font-semibold text-white">{patchName.trim()}</span>?
        </p>

        {isSaving && (
          <div className="flex items-center gap-3 mb-6 p-3 bg-blue-900/30 border border-blue-500/50 rounded">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="text-blue-200 text-sm">Writing to device...</span>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className={`px-4 py-2 text-sm rounded transition-colors ${
              isSaving
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            disabled={isSaving}
            className={`px-4 py-2 text-sm rounded transition-colors ${
              isSaving
                ? 'bg-blue-800 text-blue-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
