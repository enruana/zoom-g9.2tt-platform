import { ChannelSwitch } from './ChannelSwitch';

interface ChainMode {
  ampChain: number;
  wahPosition: number;
  label: string;
  description: string;
}

const CHAIN_MODES: ChainMode[] = [
  { ampChain: 0, wahPosition: 0, label: 'Pre-bF', description: 'AMP pre, WAH before' },
  { ampChain: 0, wahPosition: 1, label: 'Pre-AF', description: 'AMP pre, WAH after' },
  { ampChain: 1, wahPosition: 0, label: 'Post-bF', description: 'AMP post, WAH before' },
  { ampChain: 1, wahPosition: 1, label: 'Post-AF', description: 'AMP post, WAH after' },
];

interface PatchConfigBarProps {
  ampChain: number;
  wahPosition: number;
  ampSel: 'A' | 'B';
  onChainModeChange: (ampChain: number, wahPosition: number) => void;
  onChannelSwitch: (target: 'A' | 'B') => void;
}

export function PatchConfigBar({
  ampChain,
  wahPosition,
  ampSel,
  onChainModeChange,
  onChannelSwitch,
}: PatchConfigBarProps) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg mb-3"
      style={{
        background: 'linear-gradient(180deg, #1e1e1e 0%, #141414 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Left: Effect Chain */}
      <div className="flex flex-col gap-1">
        <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">
          Effect Chain
        </span>
        <div className="flex gap-1">
          {CHAIN_MODES.map((mode) => {
            const isActive = ampChain === mode.ampChain && wahPosition === mode.wahPosition;
            return (
              <button
                key={mode.label}
                onClick={() => onChainModeChange(mode.ampChain, mode.wahPosition)}
                title={mode.description}
                className={`px-2 py-1 text-[10px] font-semibold rounded transition-all ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-neutral-800/60 text-neutral-500 border border-transparent hover:text-neutral-300 hover:bg-neutral-700/60'
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Center: Channel A/B */}
      <div className="flex-shrink-0">
        <ChannelSwitch ampSel={ampSel} onSwitch={onChannelSwitch} />
      </div>

      {/* Right: ARRM placeholder */}
      <div className="flex flex-col gap-1 items-end">
        <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">
          ARRM
        </span>
        <span className="text-[10px] text-neutral-600 italic">Coming soon</span>
      </div>
    </div>
  );
}
