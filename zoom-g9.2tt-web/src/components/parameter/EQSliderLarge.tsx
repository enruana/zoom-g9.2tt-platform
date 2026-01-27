import { useMemo } from 'react';
import type { ParameterDef } from '../../data/parameterMaps';

interface EQSliderLargeProps {
  parameter: ParameterDef;
  value: number;
  onClick?: () => void;
  disabled?: boolean;
  accentColor?: string;
}

export function EQSliderLarge({ parameter, value, onClick, disabled = false, accentColor = '#22d3ee' }: EQSliderLargeProps) {
  // EQ values: 0-31, where 16 = 0dB (center)
  const centerValue = 16;
  const maxValue = 31;

  // Calculate fill percentage (0-100) from bottom
  const fillPercent = useMemo(() => {
    return (value / maxValue) * 100;
  }, [value]);

  // Calculate if we're boosting (above center) or cutting (below center)
  const isBoost = value > centerValue;
  const isCut = value < centerValue;

  // Format display value as dB
  const displayValue = useMemo(() => {
    const db = value - centerValue;
    if (db === 0) return '0 dB';
    return db > 0 ? `+${db} dB` : `${db} dB`;
  }, [value]);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center gap-2 p-3 rounded-lg transition-colors
        ${disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-neutral-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-neutral-900'
        }
      `}
      aria-label={`${parameter.name}: ${displayValue}`}
    >
      {/* Slider container */}
      <div className="relative" style={{ width: 32, height: 120 }}>
        {/* Track background */}
        <div
          className="absolute inset-x-0 rounded-full"
          style={{
            top: 0,
            bottom: 0,
            left: 8,
            right: 8,
            background: 'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        />

        {/* Scale marks */}
        {[0, 25, 50, 75, 100].map((percent) => (
          <div
            key={percent}
            className="absolute"
            style={{
              left: 0,
              right: 0,
              bottom: `${percent}%`,
              height: 1,
              background: percent === 50 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
            }}
          />
        ))}

        {/* Center line label */}
        <div
          className="absolute text-[8px] font-mono"
          style={{
            right: -12,
            bottom: '50%',
            transform: 'translateY(50%)',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          0
        </div>

        {/* Fill bar */}
        <div
          className="absolute rounded-full transition-all duration-100"
          style={{
            left: 10,
            right: 10,
            bottom: 0,
            height: `${fillPercent}%`,
            background: isBoost
              ? `linear-gradient(180deg, ${accentColor} 0%, ${accentColor}80 100%)`
              : isCut
                ? `linear-gradient(180deg, ${accentColor}80 0%, ${accentColor} 100%)`
                : accentColor,
            boxShadow: disabled ? 'none' : `0 0 10px ${accentColor}66`,
          }}
        />

        {/* Slider thumb */}
        <div
          className="absolute left-1/2 -translate-x-1/2 transition-all duration-100"
          style={{
            bottom: `calc(${fillPercent}% - 8px)`,
            width: 28,
            height: 16,
            background: 'linear-gradient(180deg, #f5f5f5 0%, #d4d4d4 40%, #a3a3a3 100%)',
            borderRadius: 4,
            boxShadow: '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.5)',
            border: '1px solid rgba(0,0,0,0.3)',
          }}
        >
          {/* Grip lines */}
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
            <div className="h-px bg-black/20" />
            <div className="h-px bg-black/20" />
            <div className="h-px bg-black/20" />
          </div>
        </div>
      </div>

      {/* Value display */}
      <div className="text-sm font-mono" style={{ color: accentColor }}>
        {displayValue}
      </div>

      {/* Parameter name */}
      <div className="text-xs text-neutral-400 text-center">
        {parameter.shortName ?? parameter.name}
      </div>
    </button>
  );
}
