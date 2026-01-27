import { useEffect, useCallback, useRef } from 'react';
import type { ParameterDef } from '../../data/parameterMaps';
import { Slider } from './Slider';
import { SevenSegment } from './SevenSegment';
import { PrecisionButtons } from './PrecisionButtons';

interface ParameterModalProps {
  parameter: ParameterDef;
  value: number;
  onChange: (value: number) => void;
  onClose: () => void;
  moduleName?: string;
  accentColor?: string;
}

export function ParameterModal({
  parameter,
  value,
  onChange,
  onClose,
  moduleName,
  accentColor = '#22c55e',
}: ParameterModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle click outside
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Focus modal on mount
  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  // Determine how many digits to show based on max value
  const digitCount = Math.max(String(parameter.max).length, String(parameter.min).length);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6 min-w-[320px] animate-scale-in focus:outline-none"
        tabIndex={-1}
        role="dialog"
        aria-label={`Edit ${parameter.name}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {moduleName && (
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                {moduleName}
              </p>
            )}
            <h3 className="text-lg font-semibold text-white">
              {parameter.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 7-Segment Value Display */}
        <div className="flex justify-center mb-4">
          <SevenSegment
            value={value}
            digits={digitCount}
            size="lg"
            color={accentColor}
          />
        </div>

        {/* Unit display if applicable */}
        {parameter.unit && (
          <div className="text-center text-sm text-gray-400 mb-4">
            {parameter.unit}
          </div>
        )}

        {/* Slider + Precision Buttons */}
        <div className="flex justify-center items-center gap-6 mb-4">
          {/* Precision Buttons (vertical, left side) */}
          <PrecisionButtons
            value={value}
            min={parameter.min}
            max={parameter.max}
            onChange={onChange}
            orientation="vertical"
          />

          {/* Slider */}
          <Slider
            value={value}
            min={parameter.min}
            max={parameter.max}
            onChange={onChange}
            height={200}
            orientation="vertical"
            accentColor={accentColor}
          />
        </div>

        {/* Range Info */}
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Min: {parameter.min}</span>
          <span>Max: {parameter.max}</span>
        </div>

        {/* Hint */}
        <p className="text-center text-xs text-gray-500">
          Drag slider, use +/- buttons, or arrow keys • ESC to close
        </p>
      </div>

      {/* CSS for scale-in animation */}
      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.15s ease-out;
        }
      `}</style>
    </div>
  );
}
