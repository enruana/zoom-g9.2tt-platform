interface PedalPosition2DProps {
  /** X-axis value (0-127) */
  xValue: number;
  /** Y-axis value (0-127) */
  yValue: number;
  /** Color for Y-axis */
  yColor: string;
  /** Color for X-axis */
  xColor: string;
  /** Whether the display is disabled */
  disabled?: boolean;
  /** Size in pixels */
  size?: number;
}

/** 2D position display showing X/Y pedal position */
export function PedalPosition2D({
  xValue,
  yValue,
  yColor,
  xColor,
  disabled = false,
  size = 64,
}: PedalPosition2DProps) {
  const xPercentage = (xValue / 127) * 100;
  const yPercentage = (yValue / 127) * 100;

  return (
    <div
      className="relative rounded-lg overflow-hidden"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)',
        boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Vertical center line */}
        <div
          className="absolute top-0 bottom-0 left-1/2"
          style={{
            width: 1,
            background: 'rgba(255,255,255,0.1)',
            transform: 'translateX(-50%)',
          }}
        />
        {/* Horizontal center line */}
        <div
          className="absolute left-0 right-0 top-1/2"
          style={{
            height: 1,
            background: 'rgba(255,255,255,0.1)',
            transform: 'translateY(-50%)',
          }}
        />
      </div>

      {/* Crosshair lines following position */}
      {!disabled && (
        <>
          {/* Vertical line from X position */}
          <div
            className="absolute top-0 bottom-0 transition-all duration-75"
            style={{
              width: 1,
              left: `${xPercentage}%`,
              background: `linear-gradient(180deg, transparent 0%, ${xColor}44 50%, transparent 100%)`,
            }}
          />
          {/* Horizontal line from Y position */}
          <div
            className="absolute left-0 right-0 transition-all duration-75"
            style={{
              height: 1,
              bottom: `${yPercentage}%`,
              background: `linear-gradient(90deg, transparent 0%, ${yColor}44 50%, transparent 100%)`,
            }}
          />
        </>
      )}

      {/* Position indicator */}
      <div
        className="absolute w-3 h-3 rounded-full transition-all duration-75"
        style={{
          left: `calc(${xPercentage}% - 6px)`,
          bottom: `calc(${yPercentage}% - 6px)`,
          background: disabled
            ? 'linear-gradient(180deg, #555 0%, #333 100%)'
            : `radial-gradient(circle at 30% 30%, white 0%, ${yColor} 100%)`,
          boxShadow: disabled
            ? 'none'
            : `0 0 8px ${yColor}88, 0 0 4px ${xColor}88`,
          border: '2px solid rgba(255,255,255,0.3)',
        }}
      />

      {/* Axis labels */}
      <div
        className="absolute text-[8px] font-bold opacity-40"
        style={{ bottom: 2, right: 4, color: xColor }}
      >
        X
      </div>
      <div
        className="absolute text-[8px] font-bold opacity-40"
        style={{ top: 2, left: 4, color: yColor }}
      >
        Y
      </div>
    </div>
  );
}
