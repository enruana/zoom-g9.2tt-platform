import { useMemo } from 'react';
import type { ParameterDef } from '../../data/parameterMaps';
import { formatParameterValue } from '../../data/parameterMaps';

interface KnobProps {
  parameter: ParameterDef;
  value: number;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/** Convert value to rotation angle (-135 to 135 degrees) */
function valueToAngle(value: number, min: number, max: number): number {
  const range = max - min;
  const normalized = range > 0 ? (value - min) / range : 0;
  // Knob rotates from -135deg (min) to +135deg (max)
  return -135 + normalized * 270;
}

const SIZES = {
  sm: { outer: 48, inner: 36, indicator: 2, font: 'text-[10px]' },
  md: { outer: 64, inner: 48, indicator: 3, font: 'text-xs' },
  lg: { outer: 80, inner: 60, indicator: 4, font: 'text-sm' },
};

export function Knob({
  parameter,
  value,
  onClick,
  disabled = false,
  size = 'md',
}: KnobProps) {
  const angle = useMemo(
    () => valueToAngle(value, parameter.min, parameter.max),
    [value, parameter.min, parameter.max]
  );

  const displayValue = useMemo(
    () => formatParameterValue(parameter, value),
    [parameter, value]
  );

  const dims = SIZES[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center gap-1 p-2 rounded-lg transition-colors
        ${disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'
        }
      `}
      aria-label={`${parameter.name}: ${displayValue}`}
    >
      {/* Knob Visual */}
      <div
        className="relative rounded-full bg-gradient-to-b from-gray-600 to-gray-800 shadow-lg"
        style={{ width: dims.outer, height: dims.outer }}
      >
        {/* Track ring (subtle arc showing range) */}
        <svg
          className="absolute inset-0"
          viewBox="0 0 100 100"
          style={{ transform: 'rotate(0deg)' }}
        >
          {/* Background arc */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4"
            strokeDasharray="217.8 72.6"
            strokeDashoffset="-36.3"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="4"
            strokeDasharray={`${((value - parameter.min) / (parameter.max - parameter.min || 1)) * 217.8} 290.4`}
            strokeDashoffset="-36.3"
            strokeLinecap="round"
            className={disabled ? 'opacity-50' : ''}
          />
        </svg>

        {/* Inner knob */}
        <div
          className="absolute bg-gradient-to-b from-gray-500 to-gray-700 rounded-full shadow-inner"
          style={{
            width: dims.inner,
            height: dims.inner,
            top: (dims.outer - dims.inner) / 2,
            left: (dims.outer - dims.inner) / 2,
            transform: `rotate(${angle}deg)`,
            transition: 'transform 100ms ease-out',
          }}
        >
          {/* Indicator line */}
          <div
            className="absolute bg-white rounded-full"
            style={{
              width: dims.indicator,
              height: dims.inner / 3,
              left: `calc(50% - ${dims.indicator / 2}px)`,
              top: 4,
            }}
          />
        </div>

        {/* Center value display */}
        <div
          className={`absolute inset-0 flex items-center justify-center ${dims.font} font-mono text-white pointer-events-none`}
        >
          {displayValue}
        </div>
      </div>

      {/* Parameter name */}
      <span className={`${dims.font} text-gray-400 text-center truncate max-w-full`}>
        {parameter.shortName ?? parameter.name}
      </span>
    </button>
  );
}
