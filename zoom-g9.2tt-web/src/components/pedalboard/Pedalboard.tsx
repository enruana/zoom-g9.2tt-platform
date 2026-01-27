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

  // Use external selection if provided, otherwise use local state
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
      {/* Signal Flow Label */}
      <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-700 border-2 border-gray-600" />
          <span className="font-medium">INPUT</span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-gray-600 via-gray-500 to-transparent" />
      </div>

      {/* Pedalboard Surface */}
      <div
        className="p-4 rounded-xl"
        style={{
          background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.5)',
        }}
      >
        {/* Module Grid - Responsive layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SIGNAL_CHAIN_ORDER.map((moduleKey) => (
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

      {/* Signal Flow Label - End */}
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
        <div className="flex-1 h-px bg-gradient-to-l from-gray-600 via-gray-500 to-transparent" />
        <div className="flex items-center gap-2">
          <span className="font-medium">OUTPUT</span>
          <div className="w-3 h-3 rounded-full bg-gray-700 border-2 border-gray-600" />
        </div>
      </div>
    </div>
  );
}
