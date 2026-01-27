import { useMemo } from 'react';

interface SevenSegmentProps {
  value: number | string;
  digits?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showSign?: boolean;
}

/**
 * Segment mapping for digits 0-9 and special characters
 * Segments: a (top), b (top-right), c (bottom-right), d (bottom),
 *           e (bottom-left), f (top-left), g (middle)
 */
const SEGMENT_MAP: Record<string, boolean[]> = {
  //        a      b      c      d      e      f      g
  '0': [true,  true,  true,  true,  true,  true,  false],
  '1': [false, true,  true,  false, false, false, false],
  '2': [true,  true,  false, true,  true,  false, true],
  '3': [true,  true,  true,  true,  false, false, true],
  '4': [false, true,  true,  false, false, true,  true],
  '5': [true,  false, true,  true,  false, true,  true],
  '6': [true,  false, true,  true,  true,  true,  true],
  '7': [true,  true,  true,  false, false, false, false],
  '8': [true,  true,  true,  true,  true,  true,  true],
  '9': [true,  true,  true,  true,  false, true,  true],
  '-': [false, false, false, false, false, false, true],
  '+': [false, false, false, false, false, false, false], // Will render as custom
  ' ': [false, false, false, false, false, false, false],
};

const SIZES = {
  sm: { width: 20, height: 36, stroke: 3, gap: 2 },
  md: { width: 30, height: 54, stroke: 4, gap: 3 },
  lg: { width: 40, height: 72, stroke: 5, gap: 4 },
};

interface DigitProps {
  char: string;
  size: 'sm' | 'md' | 'lg';
  color: string;
  dimColor: string;
}

function Digit({ char, size, color, dimColor }: DigitProps) {
  const dims = SIZES[size];
  const defaultSegments = [false, false, false, false, false, false, false];
  const segments = SEGMENT_MAP[char] ?? defaultSegments;

  // Calculate segment positions
  const w = dims.width;
  const h = dims.height;
  const s = dims.stroke;
  const g = dims.gap;

  // Segment paths (using polygon points for angled ends)
  const segmentPaths = {
    // Top (a)
    a: `M ${g + s},0 L ${w - g - s},0 L ${w - g},${s} L ${g},${s} Z`,
    // Top-right (b)
    b: `M ${w},${g + s} L ${w},${h / 2 - g} L ${w - s},${h / 2 - g - s} L ${w - s},${g + s + s} Z`,
    // Bottom-right (c)
    c: `M ${w},${h / 2 + g} L ${w},${h - g - s} L ${w - s},${h - g - s - s} L ${w - s},${h / 2 + g + s} Z`,
    // Bottom (d)
    d: `M ${g + s},${h} L ${w - g - s},${h} L ${w - g},${h - s} L ${g},${h - s} Z`,
    // Bottom-left (e)
    e: `M 0,${h / 2 + g} L 0,${h - g - s} L ${s},${h - g - s - s} L ${s},${h / 2 + g + s} Z`,
    // Top-left (f)
    f: `M 0,${g + s} L 0,${h / 2 - g} L ${s},${h / 2 - g - s} L ${s},${g + s + s} Z`,
    // Middle (g)
    g: `M ${g + s},${h / 2 - s / 2} L ${w - g - s},${h / 2 - s / 2} L ${w - g},${h / 2} L ${w - g - s},${h / 2 + s / 2} L ${g + s},${h / 2 + s / 2} L ${g},${h / 2} Z`,
  };

  const segmentKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {segmentKeys.map((key, i) => {
        const isLit = segments[i] ?? false;
        return (
          <path
            key={key}
            d={segmentPaths[key]}
            fill={isLit ? color : dimColor}
            style={{ transition: 'fill 50ms ease-out' }}
          />
        );
      })}
    </svg>
  );
}

export function SevenSegment({
  value,
  digits = 3,
  size = 'md',
  color = '#00ff00',
  showSign = false,
}: SevenSegmentProps) {
  const dims = SIZES[size];
  const dimColor = `${color}20`; // 12% opacity for dim segments

  // Format value as string with padding
  const displayValue = useMemo(() => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const isNegative = numValue < 0;
    const absValue = Math.abs(Math.round(numValue));
    let str = String(absValue).padStart(digits, ' ');

    if (showSign) {
      const sign = isNegative ? '-' : (numValue > 0 ? '+' : ' ');
      str = sign + str;
    } else if (isNegative) {
      // Find first non-space and put minus before it
      const firstDigit = str.search(/\d/);
      if (firstDigit > 0) {
        str = str.substring(0, firstDigit - 1) + '-' + str.substring(firstDigit);
      } else {
        str = '-' + str.substring(1);
      }
    }

    return str;
  }, [value, digits, showSign]);

  return (
    <div
      className="inline-flex items-center gap-1 p-3 bg-gray-900 rounded-lg border border-gray-700"
      style={{ gap: dims.gap * 2 }}
      role="img"
      aria-label={`Value: ${value}`}
    >
      {displayValue.split('').map((char, i) => (
        <Digit
          key={i}
          char={char}
          size={size}
          color={color}
          dimColor={dimColor}
        />
      ))}
    </div>
  );
}
