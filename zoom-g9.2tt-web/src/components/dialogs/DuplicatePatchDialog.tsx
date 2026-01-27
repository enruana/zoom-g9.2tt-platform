import { useState, useEffect, useRef } from 'react';
import type { Patch } from '../../types/patch';

interface DuplicatePatchDialogProps {
  sourcePatch: Patch;
  patches: Patch[];
  isDuplicating: boolean;
  onConfirm: (destinationId: number) => void;
  onCancel: () => void;
}

export function DuplicatePatchDialog({
  sourcePatch,
  patches,
  isDuplicating,
  onConfirm,
  onCancel,
}: DuplicatePatchDialogProps) {
  const [destinationId, setDestinationId] = useState<number>(() => {
    // Find first "empty" slot (default name pattern) or next slot after source
    for (let i = sourcePatch.id + 1; i < 100; i++) {
      const patch = patches.find(p => p.id === i);
      if (!patch || patch.name.trim().startsWith('INIT') || patch.name.trim() === '') {
        return i;
      }
    }
    // Wrap around to beginning
    for (let i = 0; i < sourcePatch.id; i++) {
      const patch = patches.find(p => p.id === i);
      if (!patch || patch.name.trim().startsWith('INIT') || patch.name.trim() === '') {
        return i;
      }
    }
    // Default to next slot
    return (sourcePatch.id + 1) % 100;
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.select();
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDuplicating) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, isDuplicating]);

  // Get destination patch info
  const destinationPatch = patches.find(p => p.id === destinationId);
  const isDestinationEmpty = !destinationPatch ||
    destinationPatch.name.trim().startsWith('INIT') ||
    destinationPatch.name.trim() === '';
  const isSameAsSource = destinationId === sourcePatch.id;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0 && value <= 99) {
      setDestinationId(value);
    }
  };

  const handleConfirm = () => {
    if (!isSameAsSource && !isDuplicating) {
      onConfirm(destinationId);
    }
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={isDuplicating ? undefined : onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 border border-gray-600">
        <h3 className="text-lg font-semibold text-white mb-2">Duplicate Patch</h3>

        <p className="text-gray-300 mb-4">
          Copy{' '}
          <span className="font-mono text-blue-400">
            {String(sourcePatch.id).padStart(2, '0')}
          </span>
          {' - '}
          <span className="font-semibold text-white">{sourcePatch.name.trim()}</span>
          {' to:'}
        </p>

        {/* Destination selector */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">
            Destination Patch Number (0-99)
          </label>
          <input
            ref={inputRef}
            type="number"
            min={0}
            max={99}
            value={destinationId}
            onChange={handleInputChange}
            disabled={isDuplicating}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-lg font-mono focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        {/* Destination info */}
        <div className={`mb-4 p-3 rounded border ${
          isSameAsSource
            ? 'bg-red-900/30 border-red-500/50'
            : isDestinationEmpty
              ? 'bg-green-900/30 border-green-500/50'
              : 'bg-yellow-900/30 border-yellow-500/50'
        }`}>
          {isSameAsSource ? (
            <p className="text-red-200 text-sm">
              Cannot duplicate to the same slot.
            </p>
          ) : destinationPatch ? (
            <p className={`text-sm ${isDestinationEmpty ? 'text-green-200' : 'text-yellow-200'}`}>
              <span className="font-mono">
                {String(destinationId).padStart(2, '0')}
              </span>
              {' - '}
              <span className="font-semibold">{destinationPatch.name.trim()}</span>
              {!isDestinationEmpty && (
                <span className="block mt-1 text-yellow-300">
                  This slot contains data and will be overwritten.
                </span>
              )}
            </p>
          ) : (
            <p className="text-green-200 text-sm">Empty slot</p>
          )}
        </div>

        {isDuplicating && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-blue-900/30 border border-blue-500/50 rounded">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="text-blue-200 text-sm">Duplicating patch...</span>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isDuplicating}
            className={`px-4 py-2 text-sm rounded transition-colors ${
              isDuplicating
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDuplicating || isSameAsSource}
            className={`px-4 py-2 text-sm rounded transition-colors ${
              isDuplicating || isSameAsSource
                ? 'bg-blue-800 text-blue-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isDuplicating ? 'Duplicating...' : 'Duplicate'}
          </button>
        </div>
      </div>
    </div>
  );
}
