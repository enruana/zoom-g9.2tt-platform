import type { ModuleNameSectionProps } from '../base/types';

/** Module name and type section extracted from ModuleMini */
export function ModuleNameSection({ name, typeName, textColor, accentColor, compact = false }: ModuleNameSectionProps) {
  return (
    <div
      className={`text-center ${compact ? 'py-2 px-1.5' : 'py-4 px-3'}`}
      style={{ color: textColor }}
    >
      <div className={`font-bold tracking-wide ${compact ? 'text-[10px]' : 'text-base'}`}>
        {name}
      </div>
      {typeName && (
        <div
          className={`font-medium truncate ${compact ? 'text-[8px] mt-0.5' : 'text-xs mt-2'}`}
          style={{ color: accentColor }}
        >
          {typeName}
        </div>
      )}
    </div>
  );
}
