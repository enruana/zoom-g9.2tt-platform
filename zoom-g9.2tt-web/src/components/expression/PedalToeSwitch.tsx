interface PedalToeSwitchProps {
  /** Whether the toe switch is enabled */
  enabled: boolean;
  /** LED color when enabled */
  ledColor: string;
  /** Label for accessibility */
  label: string;
  /** Callback when toggled */
  onToggle?: (enabled: boolean) => void;
  /** Size variant */
  size?: 'sm' | 'md';
}

/** Toe switch component for expression pedals */
export function PedalToeSwitch({
  enabled,
  ledColor,
  label,
  onToggle,
  size = 'md',
}: PedalToeSwitchProps) {
  const sizeClass = size === 'sm' ? 'w-10 h-10' : 'w-12 h-12';
  const ledSizeClass = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* LED indicator */}
      <div
        className={`rounded-full ${ledSizeClass}`}
        style={{
          background: enabled
            ? `radial-gradient(circle at 30% 30%, ${ledColor} 0%, ${ledColor}99 100%)`
            : 'radial-gradient(circle at 30% 30%, #444 0%, #222 100%)',
          boxShadow: enabled
            ? `0 0 10px ${ledColor}, 0 0 20px ${ledColor}44`
            : 'inset 0 1px 2px rgba(0,0,0,0.5)',
          border: '1px solid rgba(0,0,0,0.4)',
        }}
      />

      {/* Toe switch button */}
      <div
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        tabIndex={0}
        onClick={() => onToggle?.(!enabled)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle?.(!enabled);
          }
        }}
        className={`relative rounded-full cursor-pointer active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-white/40 ${sizeClass}`}
        style={{
          background: 'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)',
        }}
      >
        {/* Chrome bezel */}
        <div
          className="absolute inset-[2px] rounded-full"
          style={{
            background: 'linear-gradient(180deg, #b0b0b0 0%, #808080 40%, #606060 100%)',
          }}
        >
          {/* Dome */}
          <div
            className="absolute inset-[2px] rounded-full"
            style={{
              background: 'radial-gradient(ellipse 80% 40% at 50% 20%, rgba(255,255,255,0.7) 0%, transparent 50%), linear-gradient(180deg, #d0d0d0 0%, #a0a0a0 50%, #808080 100%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
