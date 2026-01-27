import { useState, useEffect, useRef } from 'react';

interface RenamePatchDialogProps {
  patchId: number;
  currentName: string;
  isRenaming: boolean;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
}

const MAX_NAME_LENGTH = 10;

export function RenamePatchDialog({
  patchId,
  currentName,
  isRenaming,
  onConfirm,
  onCancel,
}: RenamePatchDialogProps) {
  const [name, setName] = useState(currentName.trim());
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus and select input on mount
  useEffect(() => {
    inputRef.current?.select();
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isRenaming) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, isRenaming]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow ASCII printable characters (32-126)
    const filtered = e.target.value
      .split('')
      .filter(char => {
        const code = char.charCodeAt(0);
        return code >= 32 && code <= 126;
      })
      .join('')
      .slice(0, MAX_NAME_LENGTH);

    setName(filtered);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRenaming && name.trim()) {
      // Pad with spaces to 10 characters
      const paddedName = name.trim().padEnd(MAX_NAME_LENGTH, ' ');
      onConfirm(paddedName);
    }
  };

  const handleConfirm = () => {
    if (!isRenaming && name.trim()) {
      const paddedName = name.trim().padEnd(MAX_NAME_LENGTH, ' ');
      onConfirm(paddedName);
    }
  };

  const isNameEmpty = !name.trim();
  const isNameUnchanged = name.trim() === currentName.trim();

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={isRenaming ? undefined : onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 border border-gray-600">
        <h3 className="text-lg font-semibold text-white mb-2">Rename Patch</h3>

        <p className="text-gray-400 text-sm mb-4">
          Patch{' '}
          <span className="font-mono text-blue-400">
            {String(patchId).padStart(2, '0')}
          </span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">
              Patch Name (max {MAX_NAME_LENGTH} characters)
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={handleInputChange}
              disabled={isRenaming}
              maxLength={MAX_NAME_LENGTH}
              placeholder={currentName.trim()}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-lg font-mono focus:outline-none focus:border-blue-500 disabled:opacity-50 uppercase"
              autoComplete="off"
              spellCheck={false}
            />
            <p className="text-xs text-gray-500 mt-1">
              {name.length}/{MAX_NAME_LENGTH} characters
            </p>
          </div>

          {isRenaming && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-blue-900/30 border border-blue-500/50 rounded">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
              <span className="text-blue-200 text-sm">Renaming patch...</span>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isRenaming}
              className={`px-4 py-2 text-sm rounded transition-colors ${
                isRenaming
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleConfirm}
              disabled={isRenaming || isNameEmpty}
              className={`px-4 py-2 text-sm rounded transition-colors ${
                isRenaming || isNameEmpty
                  ? 'bg-blue-800 text-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRenaming ? 'Renaming...' : isNameUnchanged ? 'Keep Name' : 'Rename'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
