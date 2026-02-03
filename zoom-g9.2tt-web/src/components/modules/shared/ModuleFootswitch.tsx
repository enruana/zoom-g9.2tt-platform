import type { ModuleFootswitchProps } from '../base/types';

/** Footswitch button component extracted from ModuleMini */
export function ModuleFootswitch({ enabled, moduleName, onToggle, size = 'md' }: ModuleFootswitchProps) {
  const sizeClass = size === 'sm' ? 'w-8 h-8' : 'w-14 h-14';

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
  );
}
