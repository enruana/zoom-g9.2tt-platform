import { useEffect, useCallback, useRef } from 'react';
import type { ModuleName, ModuleState } from '../../types/patch';
import { MODULE_INFO, getEffectTypeName, hasMultipleTypes } from '../../data/effectTypes';
import { getEditableParameters } from '../../data/parameterMaps';
import { Knob } from '../parameter/Knob';

interface ModulePanelProps {
  moduleKey: ModuleName;
  module: ModuleState;
  onClose: () => void;
  onParameterClick?: (paramIndex: number) => void;
  onToggleEnabled?: () => void;
  onTypeSelect?: () => void;
}

export function ModulePanel({
  moduleKey,
  module,
  onClose,
  onParameterClick,
  onToggleEnabled,
  onTypeSelect,
}: ModulePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const info = MODULE_INFO[moduleKey];
  const parameters = getEditableParameters(moduleKey, module.type);
  const typeName = getEffectTypeName(moduleKey, module.type);
  const canSelectType = hasMultipleTypes(moduleKey);

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

  // Focus panel on mount for keyboard accessibility
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={panelRef}
        className="w-full max-w-4xl bg-gray-800 border-t border-gray-700 rounded-t-2xl shadow-2xl animate-slide-up focus:outline-none"
        tabIndex={-1}
        role="dialog"
        aria-label={`${info.fullName} settings`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-4">
            {/* Module Name */}
            <h3 className="text-xl font-bold text-white">
              {info.fullName}
            </h3>

            {/* ON/OFF Toggle */}
            <button
              onClick={onToggleEnabled}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                module.enabled
                  ? 'bg-green-600 text-white hover:bg-green-500'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {module.enabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Type Selector & Close */}
          <div className="flex items-center gap-4">
            {/* Effect Type */}
            {canSelectType && (
              <button
                onClick={onTypeSelect}
                className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-200 transition-colors"
              >
                <span className="text-gray-400">Type:</span>
                <span className="font-medium">{typeName}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Parameters */}
        <div className="px-6 py-6 overflow-x-auto">
          {parameters.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-4">
              {parameters.map((param, index) => {
                // Get the parameter value from the module params array
                // param.id is the MIDI parameter ID, we need to map it to the array index
                // For editable params, they start at index 0 in the params array
                const paramValue = module.params[index] ?? param.defaultValue ?? param.min;

                return (
                  <Knob
                    key={param.id}
                    parameter={param}
                    value={paramValue}
                    onClick={() => onParameterClick?.(index)}
                    disabled={!module.enabled}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No editable parameters for this module.
            </p>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-6 py-3 border-t border-gray-700 text-center text-xs text-gray-500">
          Click a knob to edit • Press ESC to close
        </div>
      </div>

      {/* CSS for slide-up animation */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
