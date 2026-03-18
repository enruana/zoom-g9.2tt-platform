import type { ReactNode } from 'react';
import type { BaseModuleMiniProps, ModuleColors } from './types';
import { MODULE_INFO, getEffectTypeShortName, hasMultipleTypes } from '../../../data/effectTypes';
import { MODULE_COLORS, DISABLED_COLORS } from '../../../data/moduleColors';
import { ModuleLED, ModuleFootswitch, ModuleNameSection } from '../shared';

interface ExtendedModuleMiniProps extends BaseModuleMiniProps {
  /** Custom parameter rendering slot */
  renderParameters?: () => ReactNode;
  /** Custom visuals slot (for VU meters, waveforms, etc.) */
  renderCustomVisuals?: () => ReactNode;
}

/** Base mini module component with slots for customization */
export function BaseModuleMini({
  moduleKey,
  module,
  isSelected = false,
  onSelect,
  onToggle,
  compact = false,
  renderParameters,
  renderCustomVisuals,
}: ExtendedModuleMiniProps) {
  const info = MODULE_INFO[moduleKey];
  const baseColors = MODULE_COLORS[moduleKey];
  const colors: ModuleColors = module.enabled ? baseColors : DISABLED_COLORS;

  const typeName = hasMultipleTypes(moduleKey)
    ? getEffectTypeShortName(moduleKey, module.type)
    : '';

  return (
    <button
      onClick={onSelect}
      className={`
        relative w-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-white/30 rounded-lg
        ${isSelected ? 'ring-2 ring-white/50 scale-[1.02]' : 'hover:scale-[1.01]'}
      `}
      style={{
        opacity: module.enabled ? 1 : 0.75,
      }}
      aria-label={`${info.fullName} module, ${module.enabled ? 'enabled' : 'disabled'}${typeName ? `, type: ${typeName}` : ''}`}
      aria-pressed={isSelected}
    >
      {/* Pedal Body */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: colors.bodyGradient,
          boxShadow: isSelected
            ? `0 0 20px ${baseColors.body}66, inset 0 1px 0 rgba(255,255,255,0.15)`
            : 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.3)',
          border: '1px solid rgba(0,0,0,0.2)',
        }}
      >
        {/* PARAMETERS SECTION - Top (desktop only) */}
        {!compact && renderParameters && (
          <div className="pt-1.5 pb-0.5">
            {renderParameters()}
          </div>
        )}

        {/* CUSTOM VISUALS SECTION (for future VU meters, waveforms, etc.) */}
        {!compact && renderCustomVisuals && (
          <div className="px-1.5">
            {renderCustomVisuals()}
          </div>
        )}

        {/* NAME SECTION - Middle */}
        <ModuleNameSection
          name={info.name}
          typeName={typeName}
          textColor={colors.text}
          accentColor={colors.accent}
          compact={compact}
        />

        {/* FOOTSWITCH with LED - Bottom */}
        <div className={`flex justify-center ${compact ? 'pb-2' : 'pb-1.5'}`}>
          <div className="relative inline-flex">
            {/* LED - positioned top-left of footswitch */}
            <div className="absolute" style={{ top: -2, left: -2, zIndex: 1 }}>
              <ModuleLED
                enabled={module.enabled}
                ledColor={baseColors.led}
                size={compact ? 'sm' : 'xs'}
              />
            </div>
            <ModuleFootswitch
              enabled={module.enabled}
              moduleName={info.fullName}
              onToggle={onToggle}
              size={compact ? 'sm' : 'xs'}
            />
          </div>
        </div>
      </div>
    </button>
  );
}
