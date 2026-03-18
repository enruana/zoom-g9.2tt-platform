import type { ModuleFootswitchProps } from '../base/types';

/** Hex screw at a corner of the base plate */
function HexScrew({ size }: { size: number }) {
  const r = size / 2;
  return (
    <div
      className="rounded-full"
      style={{
        width: size,
        height: size,
        background: 'radial-gradient(circle at 40% 35%, #555 0%, #2a2a2a 60%, #1a1a1a 100%)',
        boxShadow: `inset 0 ${r * 0.15}px ${r * 0.3}px rgba(255,255,255,0.15), inset 0 -${r * 0.1}px ${r * 0.2}px rgba(0,0,0,0.4)`,
      }}
    >
      {/* Hex slot */}
      <svg viewBox="0 0 10 10" className="w-full h-full opacity-40">
        <line x1="3" y1="3" x2="7" y2="7" stroke="#111" strokeWidth="0.8" />
        <line x1="7" y1="3" x2="3" y2="7" stroke="#111" strokeWidth="0.8" />
      </svg>
    </div>
  );
}

/**
 * Realistic Zoom G9.2tt footswitch.
 * Dark metal base plate with 4 hex screws, chrome bezel, shiny dome button.
 */
export function ModuleFootswitch({ enabled, moduleName, onToggle, size = 'md' }: ModuleFootswitchProps) {
  // Dimensions based on size
  const plate = size === 'xs' ? 28 : size === 'sm' ? 36 : 56;
  const dome = size === 'xs' ? 14 : size === 'sm' ? 18 : 30;
  const bezel = size === 'xs' ? 18 : size === 'sm' ? 24 : 38;
  const screwSize = size === 'xs' ? 4 : size === 'sm' ? 5 : 8;
  const screwInset = size === 'xs' ? 2 : size === 'sm' ? 3 : 5;
  const borderRadius = size === 'xs' ? 4 : size === 'sm' ? 5 : 8;

  return (
    <div
      role="switch"
      aria-checked={enabled}
      aria-label={`Toggle ${moduleName}`}
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onToggle?.(!enabled);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          onToggle?.(!enabled);
        }
      }}
      className="relative cursor-pointer active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-white/30"
      style={{
        width: plate,
        height: plate,
        borderRadius,
      }}
    >
      {/* Base plate - dark brushed metal */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius,
          background: 'linear-gradient(160deg, #3a3a3a 0%, #252525 35%, #1a1a1a 70%, #222 100%)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
          border: '1px solid rgba(0,0,0,0.5)',
        }}
      />

      {/* 4 hex screws at corners */}
      <div className="absolute" style={{ top: screwInset, left: screwInset }}>
        <HexScrew size={screwSize} />
      </div>
      <div className="absolute" style={{ top: screwInset, right: screwInset }}>
        <HexScrew size={screwSize} />
      </div>
      <div className="absolute" style={{ bottom: screwInset, left: screwInset }}>
        <HexScrew size={screwSize} />
      </div>
      <div className="absolute" style={{ bottom: screwInset, right: screwInset }}>
        <HexScrew size={screwSize} />
      </div>

      {/* Chrome bezel ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: bezel,
          height: bezel,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(160deg, #c8c8c8 0%, #999 30%, #707070 60%, #888 100%)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.3)',
        }}
      >
        {/* Inner groove */}
        <div
          className="absolute rounded-full"
          style={{
            inset: 2,
            background: 'linear-gradient(160deg, #666 0%, #555 50%, #4a4a4a 100%)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
          }}
        />
      </div>

      {/* Dome button */}
      <div
        className="absolute rounded-full"
        style={{
          width: dome,
          height: dome,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `
            radial-gradient(ellipse 70% 50% at 40% 30%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.2) 40%, transparent 70%),
            linear-gradient(160deg, #d8d8d8 0%, #b0b0b0 30%, #909090 60%, #a0a0a0 100%)
          `,
          boxShadow: '0 1px 4px rgba(0,0,0,0.4), inset 0 -1px 2px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.6)',
        }}
      />
    </div>
  );
}
