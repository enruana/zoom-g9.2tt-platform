import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { ModuleName } from '../../types/patch';
import { MODULE_EFFECT_TYPES, MODULE_INFO, type EffectType } from '../../data/effectTypes';

interface TypeSelectorProps {
  moduleKey: ModuleName;
  currentTypeId: number;
  onSelect: (typeId: number) => void;
  onClose: () => void;
}

export function TypeSelector({
  moduleKey,
  currentTypeId,
  onSelect,
  onClose,
}: TypeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const moduleInfo = MODULE_INFO[moduleKey];
  const allTypes = MODULE_EFFECT_TYPES[moduleKey];
  const showSearch = allTypes.length > 10;

  // Filter types based on search query
  const filteredTypes = useMemo(() => {
    if (!searchQuery.trim()) return allTypes;
    const query = searchQuery.toLowerCase();
    return allTypes.filter(
      (type) =>
        type.name.toLowerCase().includes(query) ||
        (type.shortName?.toLowerCase().includes(query) ?? false)
    );
  }, [allTypes, searchQuery]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle click outside
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Focus search input on mount
  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus();
    } else {
      modalRef.current?.focus();
    }
  }, [showSearch]);

  // Scroll to current type on mount
  useEffect(() => {
    const currentElement = listRef.current?.querySelector('[data-current="true"]');
    if (currentElement) {
      currentElement.scrollIntoView({ block: 'center' });
    }
  }, []);

  // Handle type selection
  const handleSelect = useCallback((type: EffectType) => {
    onSelect(type.id);
    onClose();
  }, [onSelect, onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col animate-scale-in focus:outline-none"
        tabIndex={-1}
        role="dialog"
        aria-label={`Select ${moduleInfo.fullName} type`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">
            Select {moduleInfo.fullName} Type
          </h3>
          <p className="text-sm text-gray-400">
            {allTypes.length} types available
          </p>
        </div>

        {/* Search Input */}
        {showSearch && (
          <div className="px-4 py-3 border-b border-gray-700">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Type List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto py-2"
        >
          {filteredTypes.length > 0 ? (
            filteredTypes.map((type) => {
              const isCurrent = type.id === currentTypeId;
              return (
                <button
                  key={type.id}
                  onClick={() => handleSelect(type)}
                  data-current={isCurrent}
                  className={`
                    w-full px-4 py-3 flex items-center justify-between text-left transition-colors
                    ${isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-200 hover:bg-gray-700'
                    }
                  `}
                >
                  <div>
                    <div className="font-medium">{type.name}</div>
                    {type.shortName && type.shortName !== type.name && (
                      <div className={`text-xs ${isCurrent ? 'text-blue-200' : 'text-gray-500'}`}>
                        {type.shortName}
                      </div>
                    )}
                  </div>
                  <div className={`text-sm ${isCurrent ? 'text-blue-200' : 'text-gray-500'}`}>
                    #{type.id}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              No types match "{searchQuery}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* CSS for scale-in animation */}
      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.15s ease-out;
        }
      `}</style>
    </div>
  );
}
