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
      <div className="relative w-6 h-6">
        {/* Outer ring / bezel */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(145deg, #3a3a3a 0%, #1a1a1a 50%, #0a0a0a 100%)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.5), inset 0 0.5px 0.5px rgba(255,255,255,0.05)',
          }}
        />

        {/* Value indicator arc */}
        <svg
          className="absolute inset-0"
          viewBox="0 0 24 24"
        >
          {/* Background arc */}
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
            strokeDasharray="47 16"
            strokeDashoffset="-8"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke={accentColor}
            strokeWidth="1.5"
            strokeDasharray={`${((value - parameter.min) / (parameter.max - parameter.min || 1)) * 47} 63`}
            strokeDashoffset="-8"
            strokeLinecap="round"
            style={{ opacity: disabled ? 0.3 : 0.7 }}
          />
        </svg>

        {/* Inner knob (the actual rotating part) */}
        <div
          className="absolute rounded-full"
          style={{
            top: 3,
            left: 3,
            width: 18,
            height: 18,
            background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 40%, #0f0f0f 100%)',
            boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)',
            transform: `rotate(${angle}deg)`,
            transition: 'transform 100ms ease-out',
          }}
        >
          {/* Indicator notch */}
          <div
            className="absolute rounded-full"
            style={{
              width: 2,
              height: 5,
              left: 'calc(50% - 1px)',
              top: 1,
              background: accentColor,
              boxShadow: `0 0 3px ${accentColor}`,
              opacity: disabled ? 0.3 : 0.9,
            }}
          />

          {/* Knob texture lines */}
          {[0, 90, 180, 270].map((rot) => (
            <div
              key={rot}
              className="absolute"
              style={{
                width: 1,
                height: 2,
                left: 'calc(50% - 0.5px)',
                bottom: 2,
                background: 'rgba(255,255,255,0.1)',
                transform: `rotate(${rot}deg)`,
                transformOrigin: '50% -5px',
              }}
            />
          ))}
        </div>
      </div>

      {/* Value display */}
      <div
        className="text-[6px] font-mono leading-none"
        style={{ color: accentColor, opacity: disabled ? 0.5 : 0.8 }}
      >
        {displayValue}
      </div>

      {/* Parameter name */}
      <div
        className="text-[5px] font-medium leading-none text-center truncate max-w-[28px]"
        style={{ color: 'rgba(255,255,255,0.5)' }}
      >
        {parameter.shortName ?? parameter.name}
      </div>
    </div>
  );
}
