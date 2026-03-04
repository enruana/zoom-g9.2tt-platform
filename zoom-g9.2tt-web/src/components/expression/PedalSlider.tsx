interface PedalSliderProps {
  /** Current value (0-127) */
  value: number;
  /** Accent color for the indicator */
  color: string;
  /** Whether the slider is disabled */
  disabled?: boolean;
  /** Orientation: vertical (default) or horizontal */
  orientation?: 'vertical' | 'horizontal';
  /** Size variant */
  size?: 'sm' | 'md';
}

/** Vertical or horizontal slider showing pedal position */
export function PedalSlider({
  value,
  color,
  disabled = false,
  orientation = 'vertical',
  size = 'md',
}: PedalSliderProps) {
  const percentage = (value / 127) * 100;
  const isVertical = orientation === 'vertical';

  const trackSize = size === 'sm' ? '8px' : '12px';
  const indicatorSize = size === 'sm' ? '12px' : '16px';

  return (
    <div
      className={`relative rounded-full ${isVertical ? 'w-3' : 'h-3'}`}
      style={{
        [isVertical ? 'width' : 'height']: trackSize,
        [isVertical ? 'height' : 'width']: '100%',
        background: 'linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Track fill */}
      <div
        className="absolute rounded-full"
        style={{
          background: disabled
            ? 'rgba(100,100,100,0.3)'
            : `linear-gradient(${isVertical ? '0deg' : '90deg'}, ${color}44 0%, ${color}88 100%)`,
          ...(isVertical
            ? {
                bottom: 0,
                left: '15%',
                right: '15%',
                height: `${percentage}%`,
              }
            : {
                left: 0,
                top: '15%',
                bottom: '15%',
                width: `${percentage}%`,
              }),
        }}
      />

      {/* Position indicator */}
      <div
        className="absolute rounded-full transition-all duration-75"
        style={{
          [isVertical ? 'width' : 'height']: indicatorSize,
          [isVertical ? 'height' : 'width']: indicatorSize,
          ...(isVertical
            ? {
                left: '50%',
                transform: 'translateX(-50%)',
                bottom: `calc(${percentage}% - ${parseInt(indicatorSize) / 2}px)`,
              }
            : {
                top: '50%',
                transform: 'translateY(-50%)',
                left: `calc(${percentage}% - ${parseInt(indicatorSize) / 2}px)`,
              }),
          background: disabled
            ? 'linear-gradient(180deg, #555 0%, #333 100%)'
            : `radial-gradient(circle at 30% 30%, ${color} 0%, ${color}cc 100%)`,
          boxShadow: disabled
            ? 'none'
            : `0 0 8px ${color}88, 0 2px 4px rgba(0,0,0,0.3)`,
          border: '2px solid rgba(255,255,255,0.2)',
        }}
      />
    </div>
  );
}
