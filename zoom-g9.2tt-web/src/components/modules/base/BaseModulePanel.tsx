import { useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { BaseModulePanelProps } from './types';
import { MODULE_INFO, getEffectTypeName, hasMultipleTypes } from '../../../data/effectTypes';
import { MODULE_COLORS } from '../../../data/moduleColors';
import { ModulePanelHeader } from '../shared';

interface ExtendedModulePanelProps extends BaseModulePanelProps {
  /** Custom parameter rendering slot */
  renderParameters?: () => ReactNode;
  /** Custom footer content slot */
  renderFooter?: () => ReactNode;
}

/** Base panel component with slots for customization */
export function BaseModulePanel({
  moduleKey,
  module,
  onClose,
  onParameterClick: _onParameterClick,
  onToggleEnabled,
  onTypeSelect,
  renderParameters,
  renderFooter,
}: ExtendedModulePanelProps) {
  // Note: _onParameterClick is intentionally unused here as it's passed to individual module panels
  void _onParameterClick;
  const panelRef = useRef<HTMLDivElement>(null);
  const info = MODULE_INFO[moduleKey];
  const typeName = getEffectTypeName(moduleKey, module.type);
  const canSelectType = hasMultipleTypes(moduleKey);
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
        <ModulePanelHeader
          moduleKey={moduleKey}
          module={module}
          colors={colors}
          canSelectType={canSelectType}
          typeName={typeName}
          onClose={onClose}
          onToggleEnabled={onToggleEnabled}
          onTypeSelect={onTypeSelect}
        />

        {/* Parameters - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-6 py-6 md:py-8">
          {renderParameters ? (
            renderParameters()
          ) : (
            <div className="flex items-center justify-center py-8 md:py-12">
              <p className="text-neutral-600 text-base md:text-lg text-center">
                No editable parameters for this module
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-2 md:py-3 border-t border-neutral-800 text-center shrink-0">
          {renderFooter ? (
            renderFooter()
          ) : (
            <p className="text-[10px] md:text-xs text-neutral-600">
              <span className="hidden md:inline">Click a knob to edit &bull; Press <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400">ESC</kbd> to close</span>
              <span className="md:hidden">Tap a knob to edit</span>
            </p>
          )}
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
