import { useState, useEffect, useCallback, useRef } from 'react';
import type { ExpressionPedalState, PedalAssignment } from '../../types/expression';
import type { ModuleName } from '../../types/patch';
import { PEDAL_COLORS } from '../../data/expressionPedals';
import { SIGNAL_CHAIN_ORDER } from '../../data/effectTypes';
import { IconButton, ToggleButton } from '../common/Button';
import { PedalSlider } from './PedalSlider';
import { AssignmentRow, AddAssignmentButton, AssignmentEditor } from './AssignmentRow';

interface ExpressionPedalPanelProps {
  pedalState: ExpressionPedalState;
  onClose: () => void;
  onToeToggle?: (enabled: boolean) => void;
  onAssignmentsChange?: (assignments: PedalAssignment[]) => void;
}

const MAX_ASSIGNMENTS = 4;

/** Configuration panel for EXP1 expression pedal */
export function ExpressionPedalPanel({
  pedalState,
  onClose,
  onToeToggle,
  onAssignmentsChange,
}: ExpressionPedalPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const colors = PEDAL_COLORS.exp1;

  const [assignments, setAssignments] = useState<PedalAssignment[]>(pedalState.assignments);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Filter to Y-axis assignments only for EXP1
  const yAssignments = assignments.filter(a => a.axis === 'y');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAddingNew || editingIndex !== null) {
          setIsAddingNew(false);
          setEditingIndex(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isAddingNew, editingIndex]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  const handleToggleEnabled = (index: number) => {
    const newAssignments = [...assignments];
    // Find the actual index in the full array
    const yIndices = assignments.map((a, i) => a.axis === 'y' ? i : -1).filter(i => i !== -1);
    const actualIndex = yIndices[index];
    const existingAssignment = actualIndex !== undefined ? newAssignments[actualIndex] : undefined;
    if (actualIndex !== undefined && existingAssignment) {
      newAssignments[actualIndex] = {
        ...existingAssignment,
        enabled: !existingAssignment.enabled,
      };
      setAssignments(newAssignments);
      onAssignmentsChange?.(newAssignments);
    }
  };

  const handleRemove = (index: number) => {
    const yIndices = assignments.map((a, i) => a.axis === 'y' ? i : -1).filter(i => i !== -1);
    const actualIndex = yIndices[index];
    if (actualIndex !== undefined) {
      const newAssignments = assignments.filter((_, i) => i !== actualIndex);
      setAssignments(newAssignments);
      onAssignmentsChange?.(newAssignments);
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleSaveAssignment = (assignment: PedalAssignment) => {
    let newAssignments: PedalAssignment[];

    if (editingIndex !== null) {
      const yIndices = assignments.map((a, i) => a.axis === 'y' ? i : -1).filter(i => i !== -1);
      const actualIndex = yIndices[editingIndex];
      if (actualIndex !== undefined) {
        newAssignments = [...assignments];
        newAssignments[actualIndex] = assignment;
      } else {
        newAssignments = [...assignments, assignment];
      }
    } else {
      newAssignments = [...assignments, assignment];
    }

    setAssignments(newAssignments);
    onAssignmentsChange?.(newAssignments);
    setEditingIndex(null);
    setIsAddingNew(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-3xl bg-neutral-900 rounded-t-2xl shadow-2xl animate-slide-up focus:outline-none max-h-[80vh] flex flex-col"
        style={{
          borderTop: `3px solid ${colors.accent}`,
          boxShadow: `0 -4px 20px ${colors.accent}33`,
        }}
        tabIndex={-1}
        role="dialog"
        aria-label="EXP1 Expression Pedal Settings"
      >
        {/* Header */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* LED indicator */}
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  background: pedalState.toeEnabled
                    ? `radial-gradient(circle at 30% 30%, ${colors.led} 0%, ${colors.led}99 100%)`
                    : 'radial-gradient(circle at 30% 30%, #444 0%, #222 100%)',
                  boxShadow: pedalState.toeEnabled
                    ? `0 0 12px ${colors.led}, 0 0 20px ${colors.led}44`
                    : 'inset 0 1px 2px rgba(0,0,0,0.5)',
                }}
              />

              {/* Title */}
              <h3 className="text-xl font-bold" style={{ color: colors.accent }}>
                EXP1 Expression Pedal
              </h3>

              {/* Toe switch toggle */}
              <ToggleButton
                isOn={pedalState.toeEnabled}
                onClick={() => onToeToggle?.(!pedalState.toeEnabled)}
                accentColor={colors.led}
                size="md"
              />
            </div>

            {/* Close button */}
            <IconButton
              onClick={onClose}
              variant="ghost"
              size="md"
              aria-label="Close panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </IconButton>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
          <div className="grid md:grid-cols-[200px_1fr] gap-6">
            {/* Left: Pedal visualization */}
            <div className="flex flex-col items-center gap-4">
              {/* Pedal representation */}
              <div
                className="w-full max-w-[160px] h-48 rounded-lg relative"
                style={{
                  background: colors.bodyGradient,
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                {/* Grip surface */}
                <div
                  className="absolute inset-4 rounded"
                  style={{
                    background: 'repeating-linear-gradient(0deg, #333 0px, #333 4px, #222 4px, #222 8px)',
                    boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.5)',
                  }}
                />

                {/* Y-axis slider */}
                <div className="absolute right-2 top-4 bottom-4 w-4">
                  <PedalSlider
                    value={pedalState.yValue}
                    color={colors.accent}
                    disabled={!pedalState.toeEnabled}
                    orientation="vertical"
                  />
                </div>
              </div>

              {/* Current value */}
              <div className="text-center">
                <div className="text-sm text-neutral-500 uppercase tracking-wider">Position</div>
                <div className="text-2xl font-mono font-bold" style={{ color: colors.accent }}>
                  {pedalState.yValue}
                </div>
              </div>
            </div>

            {/* Right: Assignments */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">
                  Parameter Assignments
                </h4>
                <span className="text-sm text-neutral-500">
                  {yAssignments.length} / {MAX_ASSIGNMENTS}
                </span>
              </div>

              <div className="space-y-3">
                {yAssignments.map((assignment, index) => (
                  <AssignmentRow
                    key={`${assignment.module}-${assignment.paramIndex}-${index}`}
                    assignment={assignment}
                    index={index}
                    onToggleEnabled={handleToggleEnabled}
                    onRemove={handleRemove}
                    onEdit={handleEdit}
                  />
                ))}

                {yAssignments.length < MAX_ASSIGNMENTS && (
                  <AddAssignmentButton
                    onClick={() => setIsAddingNew(true)}
                    disabled={yAssignments.length >= MAX_ASSIGNMENTS}
                  />
                )}

                {yAssignments.length === 0 && (
                  <p className="text-center text-neutral-600 py-4">
                    No parameter assignments configured.
                    <br />
                    Add an assignment to control parameters with this pedal.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-3 border-t border-neutral-800 text-center shrink-0">
          <p className="text-xs text-neutral-600">
            <span className="hidden md:inline">
              Press <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400">ESC</kbd> to close
            </span>
            <span className="md:hidden">Tap outside to close</span>
          </p>
        </div>
      </div>

      {/* Assignment Editor Modal */}
      {(isAddingNew || editingIndex !== null) && (
        <AssignmentEditor
          assignment={editingIndex !== null ? yAssignments[editingIndex] : undefined}
          availableModules={SIGNAL_CHAIN_ORDER as ModuleName[]}
          axis="y"
          onSave={handleSaveAssignment}
          onCancel={() => {
            setIsAddingNew(false);
            setEditingIndex(null);
          }}
        />
      )}

      {/* Animation styles */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}
