import type { ModuleLEDProps } from '../base/types';

/** LED indicator component extracted from ModuleMini */
export function ModuleLED({ enabled, ledColor, size = 'md' }: ModuleLEDProps) {
  const sizeClass = size === 'sm' ? 'w-2.5 h-2.5' : 'w-4 h-4';

  return (
    <div
      className={`rounded-full ${sizeClass}`}
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
  );
}
