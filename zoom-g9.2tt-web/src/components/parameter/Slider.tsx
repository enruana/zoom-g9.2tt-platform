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

  // Clamp value to valid range
  const clampedValue = Math.max(min, Math.min(max, value));
  const range = max - min;
  const normalizedValue = range > 0 ? (clampedValue - min) / range : 0;

  // Convert position to value
  const getValueFromPosition = useCallback((clientY: number, clientX: number) => {
    const track = trackRef.current;
    if (!track) return clampedValue;

    const rect = track.getBoundingClientRect();

    let normalized: number;
    if (orientation === 'vertical') {
      const relativeY = rect.bottom - clientY;
      normalized = Math.max(0, Math.min(1, relativeY / rect.height));
    } else {
      const relativeX = clientX - rect.left;
      normalized = Math.max(0, Math.min(1, relativeX / rect.width));
    }

    return Math.round(min + normalized * range);
  }, [min, range, orientation, clampedValue]);

  // Handle touch/mouse start
  const handleStart = useCallback((clientY: number, clientX: number) => {
    if (disabled) return;
    setIsDragging(true);
    const newValue = getValueFromPosition(clientY, clientX);
    if (newValue !== clampedValue) {
      onChange(newValue);
    }
  }, [disabled, getValueFromPosition, onChange, clampedValue]);

  // Handle touch/mouse move
  const handleMove = useCallback((clientY: number, clientX: number) => {
    if (!isDragging || disabled) return;
    const newValue = getValueFromPosition(clientY, clientX);
    if (newValue !== clampedValue) {
      onChange(newValue);
    }
  }, [isDragging, disabled, getValueFromPosition, onChange, clampedValue]);

  // Handle touch/mouse end
  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientY, e.clientX);
  }, [handleStart]);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      handleStart(touch.clientY, touch.clientX);
    }
  }, [handleStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      handleMove(touch.clientY, touch.clientX);
    }
  }, [handleMove]);

  // Global event handlers for drag outside element
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMove(e.clientY, e.clientX);
    };

    const handleGlobalMouseUp = () => {
      handleEnd();
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      // Prevent scrolling while dragging
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        handleMove(touch.clientY, touch.clientX);
      }
    };

    const handleGlobalTouchEnd = () => {
      handleEnd();
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    window.addEventListener('touchend', handleGlobalTouchEnd);
    window.addEventListener('touchcancel', handleGlobalTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
      window.removeEventListener('touchcancel', handleGlobalTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  // Keyboard handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    let newValue = clampedValue;
    const step = e.shiftKey ? 10 : 1;

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        e.preventDefault();
        newValue = Math.min(max, clampedValue + step);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        e.preventDefault();
        newValue = Math.max(min, clampedValue - step);
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

    if (newValue !== clampedValue) {
      onChange(newValue);
    }
  }, [disabled, max, min, onChange, clampedValue]);

  const isVertical = orientation === 'vertical';

  return (
    <div
      ref={trackRef}
      className={`
        relative rounded-full bg-gray-700 cursor-pointer select-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isVertical ? 'w-14' : 'h-14'}
      `}
      style={{
        ...(isVertical ? { height } : { width: height }),
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleEnd}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="slider"
      aria-valuenow={clampedValue}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-orientation={orientation}
      aria-disabled={disabled}
    >
      {/* Fill */}
      <div
        className={`
          absolute rounded-full pointer-events-none
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
          absolute w-10 h-10 rounded-full bg-white shadow-lg pointer-events-none
          transition-transform duration-75
          ${isDragging ? 'scale-110' : ''}
          ${isVertical ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2'}
        `}
        style={{
          borderWidth: 4,
          borderStyle: 'solid',
          borderColor: accentColor,
          boxShadow: `0 2px 8px rgba(0,0,0,0.3), 0 0 12px ${accentColor}66`,
          ...(isVertical
            ? { bottom: `calc(${normalizedValue * 100}% - 20px)` }
            : { left: `calc(${normalizedValue * 100}% - 20px)` }
          ),
        }}
      />

      {/* Tick marks */}
      <div className={`absolute inset-0 flex pointer-events-none ${isVertical ? 'flex-col-reverse' : 'flex-row'} justify-between py-4 px-1`}>
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
