import type { ModulePanelHeaderProps } from '../base/types';
import { MODULE_INFO } from '../../../data/effectTypes';
import { Button, IconButton, ToggleButton } from '../../common/Button';

/** Panel header component extracted from ModulePanel */
export function ModulePanelHeader({
  moduleKey,
  module,
  colors,
  canSelectType,
  typeName,
  onClose,
  onToggleEnabled,
  onTypeSelect,
}: ModulePanelHeaderProps) {
  const info = MODULE_INFO[moduleKey];

  return (
    <div className="px-4 md:px-6 py-3 md:py-4 border-b border-neutral-800 shrink-0">
      {/* Mobile: Two rows */}
      <div className="flex md:hidden flex-col gap-3">
        {/* Row 1: Name + Close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* LED */}
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{
                background: module.enabled
                  ? `radial-gradient(circle at 30% 30%, ${colors.led} 0%, ${colors.led}99 100%)`
                  : 'radial-gradient(circle at 30% 30%, #444 0%, #222 100%)',
                boxShadow: module.enabled
                  ? `0 0 8px ${colors.led}, 0 0 12px ${colors.led}44`
                  : 'inset 0 1px 2px rgba(0,0,0,0.5)',
              }}
            />
            {/* Module Name */}
            <h3 className="text-lg font-bold truncate" style={{ color: colors.text }}>
              {info.fullName}
            </h3>
          </div>
          {/* Close Button */}
          <IconButton
            onClick={onClose}
            variant="ghost"
            size="sm"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </IconButton>
        </div>
        {/* Row 2: Toggle + Type selector */}
        <div className="flex items-center justify-between gap-2">
          <ToggleButton
            isOn={module.enabled}
            onClick={onToggleEnabled}
            accentColor={colors.body}
            size="sm"
          />
          {canSelectType && (
            <button
              onClick={onTypeSelect}
              className="flex-1 flex items-center justify-between gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <span className="text-neutral-400 text-sm">Type:</span>
              <span className="font-medium text-white text-sm truncate">{typeName}</span>
              <svg className="w-4 h-4 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Desktop: Single row */}
      <div className="hidden md:flex items-center justify-between">
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
    </div>
  );
}
