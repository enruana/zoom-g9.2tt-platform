import { useEffect, useCallback, useRef } from 'react';
import type { ModuleName, ModuleState } from '../../types/patch';
import { MODULE_INFO, getEffectTypeName, hasMultipleTypes } from '../../data/effectTypes';
import { getEditableParameters } from '../../data/parameterMaps';
import { MODULE_COLORS } from '../../data/moduleColors';
import { Button, IconButton, ToggleButton } from '../common/Button';
import { Knob } from '../parameter/Knob';
import { EQSliderLarge } from '../parameter/EQSliderLarge';

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
  const isEQ = moduleKey === 'eq';
  const colors = MODULE_COLORS[moduleKey];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-5xl bg-neutral-900 rounded-t-2xl shadow-2xl animate-slide-up focus:outline-none max-h-[70vh] flex flex-col"
        style={{
          borderTop: `3px solid ${colors.body}`,
          boxShadow: `0 -4px 20px ${colors.body}33`,
        }}
        tabIndex={-1}
        role="dialog"
        aria-label={`${info.fullName} settings`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-4">
            {/* Module indicator (LED) */}
            <div
              className="w-4 h-4 rounded-full"
              style={{
                background: module.enabled
                  ? `radial-gradient(circle at 30% 30%, ${colors.led} 0%, ${colors.led}99 100%)`
                  : 'radial-gradient(circle at 30% 30%, #444 0%, #222 100%)',
                boxShadow: module.enabled
                  ? `0 0 12px ${colors.led}, 0 0 20px ${colors.led}44`
                  : 'inset 0 1px 2px rgba(0,0,0,0.5)',
              }}
            />

            {/* Module Name */}
            <h3 className="text-xl font-bold" style={{ color: colors.text }}>
              {info.fullName}
            </h3>

            {/* ON/OFF Toggle */}
            <ToggleButton
              isOn={module.enabled}
              onClick={onToggleEnabled}
              accentColor={colors.body}
              size="md"
            />
          </div>

          {/* Right side: Type & Close */}
          <div className="flex items-center gap-3">
            {/* Effect Type Selector */}
            {canSelectType && (
              <Button
                onClick={onTypeSelect}
                variant="secondary"
                size="sm"
                icon={
                  <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                }
                iconPosition="right"
              >
                <span className="text-neutral-500">Type:</span>
                <span className="font-medium text-white ml-1">{typeName}</span>
              </Button>
            )}

            {/* Close Button */}
            <IconButton
              onClick={onClose}
              variant="ghost"
              size="md"
              aria-label="Close panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </IconButton>
          </div>
        </div>

        {/* Parameters - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-8">
          {parameters.length > 0 ? (
            isEQ ? (
              /* EQ: Vertical sliders in a row */
              <div className="flex justify-center items-end gap-4">
                {parameters.map((param, index) => {
                  const paramValue = module.params[index] ?? param.defaultValue ?? param.min;
                  return (
                    <EQSliderLarge
                      key={param.id}
                      parameter={param}
                      value={paramValue}
                      onClick={() => onParameterClick?.(index)}
                      disabled={!module.enabled}
                      accentColor={colors.accent}
                    />
                  );
                })}
              </div>
            ) : (
              /* Other modules: Knobs */
              <div className="flex flex-wrap justify-center gap-6">
                {parameters.map((param, index) => {
                  const paramValue = module.params[index] ?? param.defaultValue ?? param.min;
                  return (
                    <div
                      key={param.id}
                      className={`transition-opacity ${!module.enabled ? 'opacity-40' : ''}`}
                    >
                      <Knob
                        parameter={param}
                        value={paramValue}
                        onClick={() => onParameterClick?.(index)}
                        disabled={!module.enabled}
                        accentColor={colors.accent}
                      />
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-neutral-600 text-lg">
                No editable parameters for this module
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 text-center shrink-0">
          <p className="text-xs text-neutral-600">
            Click a knob to edit &bull; Press <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400">ESC</kbd> to close
          </p>
        </div>
      </div>

      {/* Animation styles */}
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
          animation: slide-up 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}
