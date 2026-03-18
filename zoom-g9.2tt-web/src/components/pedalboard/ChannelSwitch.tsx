import { ModuleFootswitch } from '../modules/shared/ModuleFootswitch';

interface ChannelSwitchProps {
  ampSel: 'A' | 'B';
  /** Called with the TARGET channel to switch to */
  onSwitch: (target: 'A' | 'B') => void;
}

export function ChannelSwitch({ ampSel, onSwitch }: ChannelSwitchProps) {
  const target: 'A' | 'B' = ampSel === 'A' ? 'B' : 'A';

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Label */}
      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
        PreAmp
      </span>

      {/* LED indicators + Footswitch */}
      <div className="flex items-center gap-2.5">
        {/* LED A */}
        <div className="flex flex-col items-center gap-0.5">
          <div
            className="w-2 h-2 rounded-full transition-all duration-150"
            style={{
              background: ampSel === 'A'
                ? 'radial-gradient(circle, #ff8c00 0%, #cc6600 70%)'
                : '#333',
              boxShadow: ampSel === 'A'
                ? '0 0 6px rgba(255, 140, 0, 0.6), 0 0 2px rgba(255, 140, 0, 0.3)'
                : 'inset 0 1px 2px rgba(0,0,0,0.5)',
            }}
          />
          <span className={`text-[8px] font-bold ${ampSel === 'A' ? 'text-orange-400' : 'text-neutral-600'}`}>
            A
          </span>
        </div>

        {/* Footswitch - reuse G9.2tt style */}
        <ModuleFootswitch
          enabled={ampSel === 'B'}
          moduleName="PreAmp Channel"
          onToggle={() => onSwitch(target)}
          size="xs"
        />

        {/* LED B */}
        <div className="flex flex-col items-center gap-0.5">
          <div
            className="w-2 h-2 rounded-full transition-all duration-150"
            style={{
              background: ampSel === 'B'
                ? 'radial-gradient(circle, #3b82f6 0%, #2563eb 70%)'
                : '#333',
              boxShadow: ampSel === 'B'
                ? '0 0 6px rgba(59, 130, 246, 0.6), 0 0 2px rgba(59, 130, 246, 0.3)'
                : 'inset 0 1px 2px rgba(0,0,0,0.5)',
            }}
          />
          <span className={`text-[8px] font-bold ${ampSel === 'B' ? 'text-blue-400' : 'text-neutral-600'}`}>
            B
          </span>
        </div>
      </div>
    </div>
  );
}
