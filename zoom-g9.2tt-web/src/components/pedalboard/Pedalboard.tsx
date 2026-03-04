import { useState, useCallback } from 'react';
import type { ModuleName, Patch } from '../../types/patch';
import type { ExpressionPedalState, PedalAssignment } from '../../types/expression';
import { SIGNAL_CHAIN_ORDER } from '../../data/effectTypes';
import { DEMO_EXP1_STATE, DEMO_ZPEDAL_STATE } from '../../data/expressionPedals';
import { getModuleComponents } from '../modules/registry';
import {
  ExpressionPedalMini,
  ZPedalMini,
  ExpressionPedalPanel,
  ZPedalPanel,
} from '../expression';

type SelectedPedal = 'exp1' | 'zpedal' | null;

interface PedalboardProps {
  patch: Patch;
  onModuleSelect?: (moduleKey: ModuleName) => void;
  onModuleToggle?: (moduleKey: ModuleName, enabled: boolean) => void;
  selectedModule?: ModuleName | null;
  /** EXP1 pedal state (uses demo state if not provided) */
  exp1State?: ExpressionPedalState;
  /** Z-Pedal state (uses demo state if not provided) */
  zPedalState?: ExpressionPedalState;
  /** Callback when EXP1 toe switch is toggled */
  onExp1ToeToggle?: (enabled: boolean) => void;
  /** Callback when Z-Pedal toe switch is toggled */
  onZPedalToeToggle?: (enabled: boolean) => void;
  /** Callback when EXP1 assignments change */
  onExp1AssignmentsChange?: (assignments: PedalAssignment[]) => void;
  /** Callback when Z-Pedal assignments change */
  onZPedalAssignmentsChange?: (assignments: PedalAssignment[]) => void;
}

export function Pedalboard({
  patch,
  onModuleSelect,
  onModuleToggle,
  selectedModule = null,
  exp1State,
  zPedalState,
  onExp1ToeToggle,
  onZPedalToeToggle,
  onExp1AssignmentsChange,
  onZPedalAssignmentsChange,
}: PedalboardProps) {
  const [localSelectedModule, setLocalSelectedModule] = useState<ModuleName | null>(null);
  const [localExp1State, setLocalExp1State] = useState<ExpressionPedalState>(DEMO_EXP1_STATE);
  const [localZPedalState, setLocalZPedalState] = useState<ExpressionPedalState>(DEMO_ZPEDAL_STATE);
  const [selectedPedal, setSelectedPedal] = useState<SelectedPedal>(null);

  const currentSelected = selectedModule ?? localSelectedModule;
  const currentExp1 = exp1State ?? localExp1State;
  const currentZPedal = zPedalState ?? localZPedalState;

  const handleModuleSelect = useCallback((moduleKey: ModuleName) => {
    if (onModuleSelect) {
      onModuleSelect(moduleKey);
    } else {
      setLocalSelectedModule(prev => prev === moduleKey ? null : moduleKey);
    }
  }, [onModuleSelect]);

  const handleExp1ToeToggle = useCallback((enabled: boolean) => {
    if (onExp1ToeToggle) {
      onExp1ToeToggle(enabled);
    } else {
      setLocalExp1State(prev => ({ ...prev, toeEnabled: enabled }));
    }
  }, [onExp1ToeToggle]);

  const handleZPedalToeToggle = useCallback((enabled: boolean) => {
    if (onZPedalToeToggle) {
      onZPedalToeToggle(enabled);
    } else {
      setLocalZPedalState(prev => ({ ...prev, toeEnabled: enabled }));
    }
  }, [onZPedalToeToggle]);

  const handleExp1AssignmentsChange = useCallback((assignments: PedalAssignment[]) => {
    if (onExp1AssignmentsChange) {
      onExp1AssignmentsChange(assignments);
    } else {
      setLocalExp1State(prev => ({ ...prev, assignments }));
    }
  }, [onExp1AssignmentsChange]);

  const handleZPedalAssignmentsChange = useCallback((assignments: PedalAssignment[]) => {
    if (onZPedalAssignmentsChange) {
      onZPedalAssignmentsChange(assignments);
    } else {
      setLocalZPedalState(prev => ({ ...prev, assignments }));
    }
  }, [onZPedalAssignmentsChange]);

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
        {/* Mobile: Flex wrap layout with pedals below */}
        <div className="lg:hidden">
          {/* Modules grid */}
          <div className="flex flex-wrap justify-center gap-2">
            {SIGNAL_CHAIN_ORDER.map((moduleKey) => {
              const { Mini } = getModuleComponents(moduleKey);
              return (
                <div key={moduleKey} className="w-[calc(33.333%-8px)] min-w-[80px] max-w-[100px]">
                  <Mini
                    moduleKey={moduleKey}
                    module={patch.modules[moduleKey]}
                    isSelected={currentSelected === moduleKey}
                    onSelect={() => handleModuleSelect(moduleKey)}
                    onToggle={(enabled) => onModuleToggle?.(moduleKey, enabled)}
                    compact={true}
                  />
                </div>
              );
            })}
          </div>

          {/* Expression pedals in horizontal layout */}
          <div className="flex gap-2 mt-4">
            <ExpressionPedalMini
              pedalState={currentExp1}
              onToeToggle={handleExp1ToeToggle}
              onSelect={() => setSelectedPedal('exp1')}
              horizontal
              className="flex-1"
            />
            <ZPedalMini
              pedalState={currentZPedal}
              onToeToggle={handleZPedalToeToggle}
              onSelect={() => setSelectedPedal('zpedal')}
              horizontal
              className="flex-1"
            />
          </div>
        </div>

        {/* Desktop: Grid layout with pedals on sides */}
        <div className="hidden lg:flex gap-3 xl:gap-4">
          {/* EXP1 Pedal - Left side (wider) */}
          <div className="w-44 xl:w-52 shrink-0">
            <ExpressionPedalMini
              pedalState={currentExp1}
              onToeToggle={handleExp1ToeToggle}
              onSelect={() => setSelectedPedal('exp1')}
            />
          </div>

          {/* Modules Grid - Center (narrower modules) */}
          <div className="flex-1 min-w-0">
            {/* First row: COMP, WAH, ZNR, AMP, CAB */}
            <div className="grid grid-cols-5 gap-2 xl:gap-3 mb-2 xl:mb-3">
              {SIGNAL_CHAIN_ORDER.slice(0, 5).map((moduleKey) => {
                const { Mini } = getModuleComponents(moduleKey);
                return (
                  <Mini
                    key={moduleKey}
                    moduleKey={moduleKey}
                    module={patch.modules[moduleKey]}
                    isSelected={currentSelected === moduleKey}
                    onSelect={() => handleModuleSelect(moduleKey)}
                    onToggle={(enabled) => onModuleToggle?.(moduleKey, enabled)}
                  />
                );
              })}
            </div>
            {/* Second row: EQ, MOD, DLY, REV, EXT */}
            <div className="grid grid-cols-5 gap-2 xl:gap-3">
              {SIGNAL_CHAIN_ORDER.slice(5, 10).map((moduleKey) => {
                const { Mini } = getModuleComponents(moduleKey);
                return (
                  <Mini
                    key={moduleKey}
                    moduleKey={moduleKey}
                    module={patch.modules[moduleKey]}
                    isSelected={currentSelected === moduleKey}
                    onSelect={() => handleModuleSelect(moduleKey)}
                    onToggle={(enabled) => onModuleToggle?.(moduleKey, enabled)}
                  />
                );
              })}
            </div>
          </div>

          {/* Z-Pedal - Right side (wider) */}
          <div className="w-48 xl:w-56 shrink-0">
            <ZPedalMini
              pedalState={currentZPedal}
              onToeToggle={handleZPedalToeToggle}
              onSelect={() => setSelectedPedal('zpedal')}
            />
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

      {/* Expression Pedal Panels */}
      {selectedPedal === 'exp1' && (
        <ExpressionPedalPanel
          pedalState={currentExp1}
          onClose={() => setSelectedPedal(null)}
          onToeToggle={handleExp1ToeToggle}
          onAssignmentsChange={handleExp1AssignmentsChange}
        />
      )}

      {selectedPedal === 'zpedal' && (
        <ZPedalPanel
          pedalState={currentZPedal}
          onClose={() => setSelectedPedal(null)}
          onToeToggle={handleZPedalToeToggle}
          onAssignmentsChange={handleZPedalAssignmentsChange}
        />
      )}
    </div>
  );
}
