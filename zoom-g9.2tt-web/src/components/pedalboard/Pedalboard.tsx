import { useState, useCallback } from 'react';
import type { ModuleName, Patch } from '../../types/patch';
import { SIGNAL_CHAIN_ORDER } from '../../data/effectTypes';
import { ModuleMini } from './ModuleMini';

interface PedalboardProps {
  patch: Patch;
  onModuleSelect?: (moduleKey: ModuleName) => void;
  onModuleToggle?: (moduleKey: ModuleName, enabled: boolean) => void;
  selectedModule?: ModuleName | null;
}

export function Pedalboard({ patch, onModuleSelect, onModuleToggle, selectedModule = null }: PedalboardProps) {
  const [localSelectedModule, setLocalSelectedModule] = useState<ModuleName | null>(null);

  const currentSelected = selectedModule ?? localSelectedModule;

  const handleModuleSelect = useCallback((moduleKey: ModuleName) => {
    if (onModuleSelect) {
      onModuleSelect(moduleKey);
    } else {
      setLocalSelectedModule(prev => prev === moduleKey ? null : moduleKey);
    }
  }, [onModuleSelect]);

  return (
    <div className="w-full">
      {/* Signal Flow - Input */}
      <div className="flex items-center gap-2 mb-3 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-700 border border-neutral-600" />
          <span className="font-medium text-[10px] uppercase tracking-wider">Input</span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-neutral-700 to-transparent" />
      </div>

      {/* Pedalboard Surface */}
      <div
        className="p-3 sm:p-4 lg:p-6 rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Mobile: Flex wrap layout */}
        <div className="flex lg:hidden flex-wrap justify-center gap-2">
          {SIGNAL_CHAIN_ORDER.map((moduleKey) => (
            <div key={moduleKey} className="w-[calc(33.333%-8px)] min-w-[80px] max-w-[100px]">
              <ModuleMini
                moduleKey={moduleKey}
                module={patch.modules[moduleKey]}
                isSelected={currentSelected === moduleKey}
                onSelect={() => handleModuleSelect(moduleKey)}
                onToggle={(enabled) => onModuleToggle?.(moduleKey, enabled)}
                compact={true}
              />
            </div>
          ))}
        </div>

        {/* Desktop: Grid layout - 2 rows of 5, full width */}
        <div className="hidden lg:block">
          {/* First row: COMP, WAH, ZNR, AMP, CAB */}
          <div className="grid grid-cols-5 gap-4 xl:gap-6 mb-4 xl:mb-6">
            {SIGNAL_CHAIN_ORDER.slice(0, 5).map((moduleKey) => (
              <ModuleMini
                key={moduleKey}
                moduleKey={moduleKey}
                module={patch.modules[moduleKey]}
                isSelected={currentSelected === moduleKey}
                onSelect={() => handleModuleSelect(moduleKey)}
                onToggle={(enabled) => onModuleToggle?.(moduleKey, enabled)}
              />
            ))}
          </div>
          {/* Second row: EQ, MOD, DLY, REV, EXT */}
          <div className="grid grid-cols-5 gap-4 xl:gap-6">
            {SIGNAL_CHAIN_ORDER.slice(5, 10).map((moduleKey) => (
              <ModuleMini
                key={moduleKey}
                moduleKey={moduleKey}
                module={patch.modules[moduleKey]}
                isSelected={currentSelected === moduleKey}
                onSelect={() => handleModuleSelect(moduleKey)}
                onToggle={(enabled) => onModuleToggle?.(moduleKey, enabled)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Signal Flow - Output */}
      <div className="flex items-center gap-2 mt-3 text-xs text-neutral-500">
        <div className="flex-1 h-px bg-gradient-to-l from-neutral-700 to-transparent" />
        <div className="flex items-center gap-2">
          <span className="font-medium text-[10px] uppercase tracking-wider">Output</span>
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-700 border border-neutral-600" />
        </div>
      </div>
    </div>
  );
}
