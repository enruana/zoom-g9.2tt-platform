import type { ModuleName, ModuleState } from '../../types/patch';
import { MODULE_INFO, getEffectTypeShortName, hasMultipleTypes } from '../../data/effectTypes';
import { getEditableParameters } from '../../data/parameterMaps';
import { MODULE_COLORS, DISABLED_COLORS } from '../../data/moduleColors';
import { MiniKnob } from './MiniKnob';
import { EQSlider } from './EQSlider';

interface ModuleMiniProps {
  moduleKey: ModuleName;
  module: ModuleState;
  isSelected?: boolean;
  onSelect?: () => void;
  onToggle?: (enabled: boolean) => void;
  compact?: boolean;
}

export function ModuleMini({ moduleKey, module, isSelected = false, onSelect, onToggle, compact = false }: ModuleMiniProps) {
  const info = MODULE_INFO[moduleKey];
  const baseColors = MODULE_COLORS[moduleKey];
  const colors = module.enabled ? baseColors : DISABLED_COLORS;

  const typeName = hasMultipleTypes(moduleKey)
    ? getEffectTypeShortName(moduleKey, module.type)
    : '';

  // Get parameters for knobs/sliders
  const isEQ = moduleKey === 'eq';
  const parameters = compact ? [] : getEditableParameters(moduleKey, module.type).slice(0, isEQ ? 6 : 4);

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
        {/* Name Section */}
        <div
          className={`text-center ${compact ? 'py-2 px-1.5' : 'py-3 px-2'}`}
          style={{ color: colors.text }}
        >
          <div className={`font-bold tracking-wide ${compact ? 'text-[10px]' : 'text-xs'}`}>
            {info.name}
          </div>
          {typeName && (
            <div
              className={`font-medium truncate ${compact ? 'text-[8px] mt-0.5' : 'text-[9px] mt-1'}`}
              style={{ color: colors.accent }}
            >
              {typeName}
            </div>
          )}
        </div>

        {/* Controls (desktop only) */}
        {!compact && parameters.length > 0 && (
          isEQ ? (
            /* EQ: Vertical sliders in a row */
            <div className="flex justify-center gap-1 px-2 py-2">
              {parameters.map((param, index) => {
                const paramValue = module.params[index] ?? param.defaultValue ?? param.min;
                return (
                  <EQSlider
                    key={param.id}
                    parameter={param}
                    value={paramValue}
                    disabled={!module.enabled}
                    accentColor={baseColors.accent}
                  />
                );
              })}
            </div>
          ) : (
            /* Other modules: Knobs in a grid */
            <div className="grid grid-cols-2 gap-1 px-2 py-2">
              {parameters.map((param, index) => {
                const paramValue = module.params[index] ?? param.defaultValue ?? param.min;
                return (
                  <div key={param.id} className="flex justify-center">
                    <MiniKnob
                      parameter={param}
                      value={paramValue}
                      disabled={!module.enabled}
                      accentColor={baseColors.accent}
                    />
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* LED + Footswitch */}
        <div className={`flex flex-col items-center ${compact ? 'pb-2 gap-1.5' : 'pb-3 gap-2'}`}>
          {/* LED */}
          <div
            className={`rounded-full ${compact ? 'w-2.5 h-2.5' : 'w-3 h-3'}`}
            style={{
              background: module.enabled
                ? `radial-gradient(circle at 30% 30%, ${baseColors.led} 0%, ${baseColors.led}99 100%)`
                : 'radial-gradient(circle at 30% 30%, #444 0%, #222 100%)',
              boxShadow: module.enabled
                ? `0 0 8px ${baseColors.led}, 0 0 16px ${baseColors.led}44`
                : 'inset 0 1px 2px rgba(0,0,0,0.5)',
              border: '1px solid rgba(0,0,0,0.4)',
            }}
          />

          {/* Footswitch */}
          <div
            role="switch"
            aria-checked={module.enabled}
            aria-label={`Toggle ${info.fullName}`}
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onToggle?.(!module.enabled);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onToggle?.(!module.enabled);
              }
            }}
            className={`relative rounded-full cursor-pointer active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-white/40 ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}
            style={{
              background: 'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)',
            }}
          >
            {/* Chrome bezel */}
            <div
              className="absolute inset-[2px] rounded-full"
              style={{
                background: 'linear-gradient(180deg, #b0b0b0 0%, #808080 40%, #606060 100%)',
              }}
            >
              {/* Dome */}
              <div
                className="absolute inset-[2px] rounded-full"
                style={{
                  background: 'radial-gradient(ellipse 80% 40% at 50% 20%, rgba(255,255,255,0.7) 0%, transparent 50%), linear-gradient(180deg, #d0d0d0 0%, #a0a0a0 50%, #808080 100%)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
