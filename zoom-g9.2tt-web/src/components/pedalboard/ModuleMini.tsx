import type { ModuleName, ModuleState } from '../../types/patch';
import { MODULE_INFO, getEffectTypeShortName, hasMultipleTypes } from '../../data/effectTypes';
import { getEditableParameters } from '../../data/parameterMaps';

interface ModuleMiniProps {
  moduleKey: ModuleName;
  module: ModuleState;
  isSelected?: boolean;
  onSelect?: () => void;
  onToggle?: (enabled: boolean) => void;
}

/** Pedal color themes for each module */
const PEDAL_COLORS: Record<ModuleName, {
  body: string;
  bodyGradient: string;
  accent: string;
  text: string;
  led: string;
  ledGlow: string;
}> = {
  comp: {
    body: '#dc2626',
    bodyGradient: 'linear-gradient(180deg, #ef4444 0%, #dc2626 30%, #b91c1c 100%)',
    accent: '#fca5a5',
    text: '#fee2e2',
    led: '#22c55e',
    ledGlow: '0 0 12px #22c55e, 0 0 24px #22c55e66',
  },
  wah: {
    body: '#15803d',
    bodyGradient: 'linear-gradient(180deg, #22c55e 0%, #16a34a 30%, #15803d 100%)',
    accent: '#86efac',
    text: '#dcfce7',
    led: '#ef4444',
    ledGlow: '0 0 12px #ef4444, 0 0 24px #ef444466',
  },
  znr: {
    body: '#374151',
    bodyGradient: 'linear-gradient(180deg, #6b7280 0%, #4b5563 30%, #374151 100%)',
    accent: '#9ca3af',
    text: '#f3f4f6',
    led: '#fbbf24',
    ledGlow: '0 0 12px #fbbf24, 0 0 24px #fbbf2466',
  },
  amp: {
    body: '#1e3a8a',
    bodyGradient: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 30%, #1d4ed8 100%)',
    accent: '#93c5fd',
    text: '#dbeafe',
    led: '#ef4444',
    ledGlow: '0 0 12px #ef4444, 0 0 24px #ef444466',
  },
  cab: {
    body: '#92400e',
    bodyGradient: 'linear-gradient(180deg, #d97706 0%, #b45309 30%, #92400e 100%)',
    accent: '#fcd34d',
    text: '#fef3c7',
    led: '#22c55e',
    ledGlow: '0 0 12px #22c55e, 0 0 24px #22c55e66',
  },
  eq: {
    body: '#0e7490',
    bodyGradient: 'linear-gradient(180deg, #22d3ee 0%, #06b6d4 30%, #0891b2 100%)',
    accent: '#67e8f9',
    text: '#cffafe',
    led: '#f97316',
    ledGlow: '0 0 12px #f97316, 0 0 24px #f9731666',
  },
  mod: {
    body: '#7e22ce',
    bodyGradient: 'linear-gradient(180deg, #a855f7 0%, #9333ea 30%, #7e22ce 100%)',
    accent: '#d8b4fe',
    text: '#f3e8ff',
    led: '#3b82f6',
    ledGlow: '0 0 12px #3b82f6, 0 0 24px #3b82f666',
  },
  dly: {
    body: '#0f766e',
    bodyGradient: 'linear-gradient(180deg, #2dd4bf 0%, #14b8a6 30%, #0d9488 100%)',
    accent: '#5eead4',
    text: '#ccfbf1',
    led: '#ec4899',
    ledGlow: '0 0 12px #ec4899, 0 0 24px #ec489966',
  },
  rev: {
    body: '#be185d',
    bodyGradient: 'linear-gradient(180deg, #ec4899 0%, #db2777 30%, #be185d 100%)',
    accent: '#f9a8d4',
    text: '#fce7f3',
    led: '#22c55e',
    ledGlow: '0 0 12px #22c55e, 0 0 24px #22c55e66',
  },
  ext: {
    body: '#1e293b',
    bodyGradient: 'linear-gradient(180deg, #475569 0%, #334155 30%, #1e293b 100%)',
    accent: '#94a3b8',
    text: '#e2e8f0',
    led: '#f97316',
    ledGlow: '0 0 12px #f97316, 0 0 24px #f9731666',
  },
};

/** Mini knob component */
function MiniKnob({ label, value, max }: { label: string; value: number; max: number }) {
  const rotation = -135 + (value / max) * 270;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-12 h-12 rounded-full"
        style={{
          background: 'linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 50%, #000000 100%)',
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.5)',
        }}
      >
        <div
          className="absolute inset-1.5 rounded-full"
          style={{
            background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)',
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <div className="absolute top-1 left-1/2 w-1 h-3 -ml-0.5 rounded-full bg-white" />
        </div>
      </div>
      <span className="text-[9px] mt-1 font-semibold uppercase tracking-tight opacity-80 leading-none">
        {label}
      </span>
    </div>
  );
}

/** Mini vertical slider for EQ */
function MiniSlider({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const fillPercent = (value / max) * 100;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative w-3 h-16 rounded-sm"
        style={{
          background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8), inset 0 0 1px rgba(255,255,255,0.1)',
        }}
      >
        <div
          className="absolute bottom-0 left-0 right-0 rounded-sm transition-all duration-150"
          style={{
            height: `${fillPercent}%`,
            background: `linear-gradient(180deg, ${color} 0%, ${color}99 100%)`,
            boxShadow: `0 0 6px ${color}66`,
          }}
        />
        <div
          className="absolute left-1/2 -ml-2.5 w-5 h-2.5 rounded-sm"
          style={{
            bottom: `calc(${fillPercent}% - 5px)`,
            background: 'linear-gradient(180deg, #e0e0e0 0%, #a0a0a0 50%, #808080 100%)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.5)',
          }}
        />
      </div>
      <span className="text-[9px] font-semibold uppercase tracking-tight opacity-80">
        {label}
      </span>
    </div>
  );
}


/** Colors for disabled/off state - uniform gray */
const DISABLED_COLORS = {
  body: '#3a3a3a',
  bodyGradient: 'linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 30%, #2a2a2a 100%)',
  accent: '#6b7280',
  text: '#9ca3af',
  led: '#333',
  ledGlow: 'none',
};

/** Organize knobs into rows (max 4 per row) */
function KnobGrid({ params, moduleParams }: {
  params: Array<{ id: number; name: string; shortName?: string; max: number; defaultValue?: number }>;
  moduleParams: number[];
}) {
  const count = params.length;
  const maxPerRow = 4;

  // Split into rows of max 4
  const rows: typeof params[] = [];
  for (let i = 0; i < count; i += maxPerRow) {
    rows.push(params.slice(i, i + maxPerRow));
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="flex justify-center gap-2">
          {row.map((param, idx) => {
            const globalIdx = rowIdx * maxPerRow + idx;
            return (
              <MiniKnob
                key={param.id}
                label={param.shortName ?? param.name.slice(0, 3)}
                value={moduleParams[globalIdx] ?? param.defaultValue ?? 0}
                max={param.max}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function ModuleMini({ moduleKey, module, isSelected = false, onSelect, onToggle }: ModuleMiniProps) {
  const info = MODULE_INFO[moduleKey];
  const baseColors = PEDAL_COLORS[moduleKey];
  const colors = module.enabled ? baseColors : DISABLED_COLORS;

  const typeName = hasMultipleTypes(moduleKey)
    ? getEffectTypeShortName(moduleKey, module.type)
    : '';

  const params = getEditableParameters(moduleKey, module.type);
  const displayParams = params.slice(0, 6); // Allow up to 6 knobs in 2 rows

  return (
    <button
        onClick={onSelect}
        className={`
          relative w-full transition-all duration-200 focus:outline-none
          ${isSelected ? 'scale-105 z-10' : 'hover:scale-102'}
        `}
        style={{
          filter: isSelected
            ? 'drop-shadow(0 0 12px rgba(255,255,255,0.3))'
            : undefined,
          opacity: module.enabled ? 1 : 0.85,
        }}
        aria-label={`${info.fullName} module, ${module.enabled ? 'enabled' : 'disabled'}${typeName ? `, type: ${typeName}` : ''}`}
        aria-pressed={isSelected}
      >
        {/* Pedal Body */}
        <div
          className="rounded-lg overflow-hidden transition-all duration-200"
          style={{
            background: colors.bodyGradient,
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.2),
              inset 0 -2px 4px rgba(0,0,0,0.3),
              0 4px 8px rgba(0,0,0,0.4),
              0 2px 4px rgba(0,0,0,0.2)
            `,
            border: isSelected ? '2px solid rgba(255,255,255,0.5)' : '1px solid rgba(0,0,0,0.3)',
          }}
        >
          {/* Top Section - Knobs or EQ Sliders */}
          <div
            className="px-3 pt-3 pb-2 transition-colors duration-200"
            style={{ color: colors.text }}
          >
            {moduleKey === 'eq' ? (
              /* EQ Sliders */
              <div className="flex justify-center gap-2">
                {displayParams.map((param, idx) => (
                  <MiniSlider
                    key={param.id}
                    label={param.shortName ?? param.name.slice(0, 2)}
                    value={module.params[idx] ?? param.defaultValue ?? 0}
                    max={param.max}
                    color={baseColors.led}
                  />
                ))}
              </div>
            ) : (
              /* Knobs in 2 rows */
              <KnobGrid
                params={displayParams}
                moduleParams={module.params}
              />
            )}
          </div>

          {/* Middle Section - Name Plate */}
          <div
            className="mx-1.5 py-1 rounded"
            style={{
              background: 'rgba(0,0,0,0.3)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
            }}
          >
            <div
              className="text-center font-bold text-xs tracking-wide transition-colors duration-200"
              style={{ color: colors.text }}
            >
              {info.name}
            </div>
            {typeName && (
              <div
                className="text-center text-[8px] font-medium tracking-tight opacity-80 transition-colors duration-200 truncate px-1"
                style={{ color: colors.accent }}
              >
                {typeName}
              </div>
            )}
          </div>

          {/* Bottom Section - LED + Footswitch */}
          <div className="px-1.5 pt-2 pb-3 flex flex-col items-center gap-2">
            {/* LED */}
            <div
              className="w-4 h-4 rounded-full transition-all duration-200"
              style={{
                background: module.enabled
                  ? `radial-gradient(circle at 30% 30%, ${baseColors.led}ff 0%, ${baseColors.led}cc 50%, ${baseColors.led}99 100%)`
                  : 'radial-gradient(circle at 30% 30%, #444 0%, #222 100%)',
                boxShadow: module.enabled
                  ? `0 0 12px ${baseColors.led}, 0 0 24px ${baseColors.led}66, inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)`
                  : 'inset 0 2px 4px rgba(0,0,0,0.6)',
                border: '2px solid rgba(0,0,0,0.6)',
              }}
            />
            {/* Footswitch */}
            <div
              role="switch"
              aria-checked={module.enabled}
              aria-label={`Toggle ${info.fullName} ${module.enabled ? 'off' : 'on'}`}
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
              className="relative w-12 h-12 rounded-full cursor-pointer active:scale-95 transition-transform duration-75 focus:outline-none focus:ring-2 focus:ring-white/50"
              style={{
                background: 'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)',
                boxShadow: `
                  0 4px 8px rgba(0,0,0,0.6),
                  0 2px 4px rgba(0,0,0,0.4),
                  inset 0 1px 2px rgba(255,255,255,0.1)
                `,
              }}
            >
              {/* Chrome bezel */}
              <div
                className="absolute inset-[3px] rounded-full pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, #c0c0c0 0%, #808080 40%, #606060 60%, #404040 100%)',
                  boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.4), inset 0 -2px 3px rgba(0,0,0,0.4)',
                }}
              >
                {/* Dome surface */}
                <div
                  className="absolute inset-[3px] rounded-full"
                  style={{
                    background: `
                      radial-gradient(ellipse 80% 50% at 50% 20%, rgba(255,255,255,0.8) 0%, transparent 50%),
                      linear-gradient(180deg, #e0e0e0 0%, #b0b0b0 30%, #909090 60%, #707070 100%)
                    `,
                    boxShadow: `
                      inset 0 3px 6px rgba(255,255,255,0.6),
                      inset 0 -3px 6px rgba(0,0,0,0.3),
                      inset 0 0 10px rgba(0,0,0,0.1)
                    `,
                  }}
                >
                  {/* Center dimple */}
                  <div
                    className="absolute top-1/2 left-1/2 w-2 h-2 -mt-1 -ml-1 rounded-full"
                    style={{
                      background: 'linear-gradient(180deg, #606060 0%, #808080 100%)',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
    </button>
  );
}
