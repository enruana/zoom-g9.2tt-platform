import { useRef, useCallback, useEffect, useState } from 'react';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** Height of the slider track in pixels */
  height?: number;
  /** Whether the slider is disabled */
  disabled?: boolean;
  /** Orientation of the slider */
  orientation?: 'vertical' | 'horizontal';
  /** Accent color for the fill and thumb */
  accentColor?: string;
}

export function Slider({
  value,
  min,
  max,
  onChange,
  height = 200,
  disabled = false,
  orientation = 'vertical',
  accentColor = '#3b82f6',
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const range = max - min;
  const normalizedValue = range > 0 ? (value - min) / range : 0;

  // Convert pointer position to value
  const getValueFromPosition = useCallback((clientY: number, clientX: number) => {
    const track = trackRef.current;
    if (!track) return value;

    const rect = track.getBoundingClientRect();

    let normalized: number;
    if (orientation === 'vertical') {
      // Vertical: top = max, bottom = min
      const relativeY = rect.bottom - clientY;
      normalized = Math.max(0, Math.min(1, relativeY / rect.height));
    } else {
      // Horizontal: left = min, right = max
      const relativeX = clientX - rect.left;
      normalized = Math.max(0, Math.min(1, relativeX / rect.width));
    }

    return Math.round(min + normalized * range);
  }, [min, range, value, orientation]);

  // Handle pointer down
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);

    const newValue = getValueFromPosition(e.clientY, e.clientX);
    if (newValue !== value) {
      onChange(newValue);
    }

    // Capture pointer for drag
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [disabled, getValueFromPosition, onChange, value]);

  // Handle pointer move
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || disabled) return;

    const newValue = getValueFromPosition(e.clientY, e.clientX);
    if (newValue !== value) {
      onChange(newValue);
    }
  }, [isDragging, disabled, getValueFromPosition, onChange, value]);

  // Handle pointer up
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle keyboard
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    let newValue = value;
    const step = e.shiftKey ? 10 : 1;

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        e.preventDefault();
        newValue = Math.min(max, value + step);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        e.preventDefault();
        newValue = Math.max(min, value - step);
        break;
      case 'Home':
        e.preventDefault();
        newValue = min;
        break;
      case 'End':
        e.preventDefault();
        newValue = max;
        break;
    }

    if (newValue !== value) {
      onChange(newValue);
    }
  }, [disabled, max, min, onChange, value]);

  // Clean up on unmount or drag end
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalUp = () => setIsDragging(false);
    window.addEventListener('pointerup', handleGlobalUp);
    return () => window.removeEventListener('pointerup', handleGlobalUp);
  }, [isDragging]);

  const isVertical = orientation === 'vertical';

  return (
    <div
      ref={trackRef}
      className={`
        relative rounded-full bg-gray-700 cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isVertical ? 'w-12' : 'h-12'}
      `}
      style={isVertical ? { height } : { width: height }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="slider"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-orientation={orientation}
      aria-disabled={disabled}
    >
      {/* Fill */}
      <div
        className={`
          absolute rounded-full
          ${isVertical ? 'bottom-0 left-0 right-0' : 'top-0 bottom-0 left-0'}
        `}
        style={{
          background: `linear-gradient(${isVertical ? 'to top' : 'to right'}, ${accentColor}cc, ${accentColor})`,
          boxShadow: `0 0 10px ${accentColor}66`,
          ...(isVertical
            ? { height: `${normalizedValue * 100}%` }
            : { width: `${normalizedValue * 100}%` }
          ),
        }}
      />

      {/* Thumb */}
      <div
        className={`
          absolute w-8 h-8 rounded-full bg-white shadow-lg
          transition-transform
          ${isDragging ? 'scale-110' : ''}
          ${isVertical ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2'}
        `}
        style={{
          borderWidth: 4,
          borderStyle: 'solid',
          borderColor: accentColor,
          boxShadow: `0 2px 8px rgba(0,0,0,0.3), 0 0 8px ${accentColor}44`,
          ...(isVertical
            ? { bottom: `calc(${normalizedValue * 100}% - 16px)` }
            : { left: `calc(${normalizedValue * 100}% - 16px)` }
          ),
        }}
      />

      {/* Tick marks */}
      <div className={`absolute inset-0 flex ${isVertical ? 'flex-col-reverse' : 'flex-row'} justify-between py-4 px-1`}>
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <div
            key={tick}
            className={`
              bg-gray-500
              ${isVertical ? 'w-1 h-px' : 'h-1 w-px'}
            `}
          />
        ))}
      </div>
    </div>
  );
}
