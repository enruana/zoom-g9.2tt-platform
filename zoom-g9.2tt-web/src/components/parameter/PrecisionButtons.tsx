import { useCallback, useRef, useEffect } from 'react';

interface PrecisionButtonsProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  step?: number;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export function PrecisionButtons({
  value,
  min,
  max,
  onChange,
  step = 1,
  disabled = false,
  orientation = 'horizontal',
}: PrecisionButtonsProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatCountRef = useRef(0);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    repeatCountRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Handle increment
  const increment = useCallback(() => {
    onChange(Math.min(max, value + step));
  }, [max, onChange, step, value]);

  // Handle decrement
  const decrement = useCallback(() => {
    onChange(Math.max(min, value - step));
  }, [min, onChange, step, value]);

  // Start hold-to-repeat
  const startRepeat = useCallback((action: () => void) => {
    if (disabled) return;

    // Execute once immediately
    action();
    repeatCountRef.current = 1;

    // Start delay before repeating
    timeoutRef.current = setTimeout(() => {
      // Start repeating at initial speed
      intervalRef.current = setInterval(() => {
        action();
        repeatCountRef.current++;

        // Accelerate after 10 repeats
        if (repeatCountRef.current === 10 && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = setInterval(action, 50);
        }
      }, 100);
    }, 400);
  }, [disabled]);

  // Stop repeat
  const stopRepeat = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  const isVertical = orientation === 'vertical';
  const canDecrement = value > min;
  const canIncrement = value < max;

  const buttonClass = `
    flex items-center justify-center
    w-12 h-12 rounded-lg
    text-2xl font-bold
    transition-colors
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800
  `;

  const enabledClass = 'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-500';
  const disabledClass = 'bg-gray-800 text-gray-600 cursor-not-allowed';

  return (
    <div
      className={`flex ${isVertical ? 'flex-col' : 'flex-row'} gap-2`}
      role="group"
      aria-label="Precision adjustment"
    >
      {/* Plus button (first in vertical for natural up=more) */}
      {isVertical && (
        <button
          className={`${buttonClass} ${!disabled && canIncrement ? enabledClass : disabledClass}`}
          onPointerDown={() => startRepeat(increment)}
          onPointerUp={stopRepeat}
          onPointerLeave={stopRepeat}
          onPointerCancel={stopRepeat}
          disabled={disabled || !canIncrement}
          aria-label="Increase value"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}

      {/* Minus button */}
      <button
        className={`${buttonClass} ${!disabled && canDecrement ? enabledClass : disabledClass}`}
        onPointerDown={() => startRepeat(decrement)}
        onPointerUp={stopRepeat}
        onPointerLeave={stopRepeat}
        onPointerCancel={stopRepeat}
        disabled={disabled || !canDecrement}
        aria-label="Decrease value"
      >
        {isVertical ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <span>−</span>
        )}
      </button>

      {/* Plus button (horizontal layout) */}
      {!isVertical && (
        <button
          className={`${buttonClass} ${!disabled && canIncrement ? enabledClass : disabledClass}`}
          onPointerDown={() => startRepeat(increment)}
          onPointerUp={stopRepeat}
          onPointerLeave={stopRepeat}
          onPointerCancel={stopRepeat}
          disabled={disabled || !canIncrement}
          aria-label="Increase value"
        >
          <span>+</span>
        </button>
      )}
    </div>
  );
}
