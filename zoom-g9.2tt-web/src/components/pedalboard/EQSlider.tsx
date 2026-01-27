import { useMemo } from 'react';
import type { ParameterDef } from '../../data/parameterMaps';

interface EQSliderProps {
  parameter: ParameterDef;
  value: number;
  disabled?: boolean;
  accentColor?: string;
  compact?: boolean;
}

export function EQSlider({ parameter, value, disabled = false, accentColor = '#67e8f9', compact = false }: EQSliderProps) {
  // EQ values: 0-31, where 16 = 0dB (center)
  const centerValue = 16;
  const maxValue = 31;

  // Clamp value to valid range
  const clampedValue = Math.max(0, Math.min(maxValue, value));

  // Calculate fill percentage (0-100) from bottom
  const fillPercent = useMemo(() => {
    return (clampedValue / maxValue) * 100;
  }, [clampedValue]);

  // Calculate if we're boosting (above center) or cutting (below center)
  const isBoost = clampedValue > centerValue;
  const isCut = clampedValue < centerValue;

  // Format display value as dB
  const displayValue = useMemo(() => {
    const db = clampedValue - centerValue;
    if (db === 0) return '0';
    return db > 0 ? `+${db}` : `${db}`;
  }, [clampedValue]);

  const sliderHeight = compact ? 48 : 80;
  const sliderWidth = compact ? 8 : 12;
  const thumbHeight = compact ? 6 : 8;

  return (
    <div className={`flex flex-col items-center gap-1.5 ${disabled ? 'opacity-40' : ''}`}>
      {/* Slider container with padding for thumb overflow */}
      <div
        className="relative"
        style={{
          width: sliderWidth + 8,
          height: sliderHeight + thumbHeight,
          paddingTop: thumbHeight / 2,
          paddingBottom: thumbHeight / 2,
        }}
      >
        {/* Slider track */}
        <div
          className="relative rounded-full mx-auto"
          style={{
            width: sliderWidth,
            height: sliderHeight,
            background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        >
          {/* Center line (0dB reference) */}
          <div
            className="absolute left-0 right-0 h-px"
            style={{
              top: '50%',
              background: 'rgba(255,255,255,0.3)',
            }}
          />

          {/* Fill bar */}
          <div
            className="absolute left-0.5 right-0.5 rounded-full transition-all duration-75"
            style={{
              bottom: 0,
              height: `${fillPercent}%`,
              background: isBoost
                ? `linear-gradient(180deg, ${accentColor} 0%, ${accentColor}99 100%)`
                : isCut
                  ? `linear-gradient(180deg, ${accentColor}99 0%, ${accentColor} 100%)`
                  : accentColor,
              boxShadow: disabled ? 'none' : `0 0 6px ${accentColor}66`,
              opacity: disabled ? 0.5 : 1,
            }}
          />

          {/* Slider thumb indicator */}
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded transition-all duration-75"
            style={{
              bottom: `calc(${fillPercent}% - ${thumbHeight / 2}px)`,
              width: sliderWidth + 6,
              height: thumbHeight,
              background: 'linear-gradient(180deg, #f5f5f5 0%, #d4d4d4 50%, #a3a3a3 100%)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
              border: '1px solid rgba(0,0,0,0.2)',
            }}
          />
        </div>
      </div>

      {/* Value display */}
      <div
        className={`font-mono leading-none ${compact ? 'text-[7px]' : 'text-[8px]'}`}
        style={{ color: accentColor, opacity: disabled ? 0.5 : 0.9 }}
      >
        {displayValue}
      </div>

      {/* Label */}
      <div
        className={`font-medium leading-none text-center ${compact ? 'text-[6px]' : 'text-[7px]'}`}
        style={{ color: 'rgba(255,255,255,0.5)' }}
      >
        {parameter.shortName ?? parameter.name}
      </div>
    </div>
  );
}
