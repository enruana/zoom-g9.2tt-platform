import { useMemo } from 'react';
import type { ParameterDef } from '../../data/parameterMaps';
import { formatParameterValue } from '../../data/parameterMaps';

interface MiniKnobProps {
  parameter: ParameterDef;
  value: number;
  disabled?: boolean;
  accentColor?: string;
}

/** Convert value to rotation angle (-135 to 135 degrees) */
function valueToAngle(value: number, min: number, max: number): number {
  const range = max - min;
  const normalized = range > 0 ? (value - min) / range : 0;
  return -135 + normalized * 270;
}

export function MiniKnob({ parameter, value, disabled = false, accentColor = '#ffffff' }: MiniKnobProps) {
  const angle = useMemo(
    () => valueToAngle(value, parameter.min, parameter.max),
    [value, parameter.min, parameter.max]
  );

  const displayValue = useMemo(
    () => formatParameterValue(parameter, value),
    [parameter, value]
  );

  return (
    <div
      className={`flex flex-col items-center gap-0.5 ${disabled ? 'opacity-40' : ''}`}
    >
      {/* Knob container */}
      <div className="relative w-10 h-10">
        {/* Outer ring / bezel */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(145deg, #3a3a3a 0%, #1a1a1a 50%, #0a0a0a 100%)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)',
          }}
        />

        {/* Value indicator arc */}
        <svg
          className="absolute inset-0"
          viewBox="0 0 40 40"
        >
          {/* Background arc */}
          <circle
            cx="20"
            cy="20"
            r="17"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
            strokeDasharray="80 27"
            strokeDashoffset="-13.5"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <circle
            cx="20"
            cy="20"
            r="17"
            fill="none"
            stroke={accentColor}
            strokeWidth="2"
            strokeDasharray={`${((value - parameter.min) / (parameter.max - parameter.min || 1)) * 80} 107`}
            strokeDashoffset="-13.5"
            strokeLinecap="round"
            style={{ opacity: disabled ? 0.3 : 0.7 }}
          />
        </svg>

        {/* Inner knob (the actual rotating part) */}
        <div
          className="absolute rounded-full"
          style={{
            top: 4,
            left: 4,
            width: 32,
            height: 32,
            background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 40%, #0f0f0f 100%)',
            boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.5), inset 0 2px 2px rgba(255,255,255,0.05)',
            transform: `rotate(${angle}deg)`,
            transition: 'transform 100ms ease-out',
          }}
        >
          {/* Indicator notch */}
          <div
            className="absolute rounded-full"
            style={{
              width: 3,
              height: 8,
              left: 'calc(50% - 1.5px)',
              top: 3,
              background: accentColor,
              boxShadow: `0 0 4px ${accentColor}`,
              opacity: disabled ? 0.3 : 0.9,
            }}
          />

          {/* Knob texture lines */}
          {[0, 60, 120, 180, 240, 300].map((rot) => (
            <div
              key={rot}
              className="absolute"
              style={{
                width: 1,
                height: 4,
                left: 'calc(50% - 0.5px)',
                bottom: 4,
                background: 'rgba(255,255,255,0.1)',
                transform: `rotate(${rot}deg)`,
                transformOrigin: '50% -10px',
              }}
            />
          ))}
        </div>
      </div>

      {/* Value display */}
      <div
        className="text-[8px] font-mono leading-none"
        style={{ color: accentColor, opacity: disabled ? 0.5 : 0.8 }}
      >
        {displayValue}
      </div>

      {/* Parameter name */}
      <div
        className="text-[7px] font-medium leading-none text-center truncate max-w-[42px]"
        style={{ color: 'rgba(255,255,255,0.5)' }}
      >
        {parameter.shortName ?? parameter.name}
      </div>
    </div>
  );
}
