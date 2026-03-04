import { useState, useEffect, useCallback, useRef } from 'react';
import type { ExpressionPedalState, PedalAssignment, ExpressionAxis } from '../../types/expression';
import type { ModuleName } from '../../types/patch';
import { PEDAL_COLORS } from '../../data/expressionPedals';
import { SIGNAL_CHAIN_ORDER } from '../../data/effectTypes';
import { IconButton, ToggleButton } from '../common/Button';
import { PedalSlider } from './PedalSlider';
import { PedalPosition2D } from './PedalPosition2D';
import { AssignmentRow, AddAssignmentButton, AssignmentEditor } from './AssignmentRow';

interface ZPedalPanelProps {
  pedalState: ExpressionPedalState;
  onClose: () => void;
  onToeToggle?: (enabled: boolean) => void;
  onAssignmentsChange?: (assignments: PedalAssignment[]) => void;
}

const MAX_ASSIGNMENTS_PER_AXIS = 4;

/** Configuration panel for Z-Pedal (EXP2) with X/Y axes */
export function ZPedalPanel({
  pedalState,
  onClose,
  onToeToggle,
  onAssignmentsChange,
}: ZPedalPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const colors = PEDAL_COLORS.zpedal;

  const [assignments, setAssignments] = useState<PedalAssignment[]>(pedalState.assignments);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingAxis, setEditingAxis] = useState<ExpressionAxis>('y');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [addingAxis, setAddingAxis] = useState<ExpressionAxis>('y');

  // Separate assignments by axis
  const yAssignments = assignments.filter(a => a.axis === 'y');
  const xAssignments = assignments.filter(a => a.axis === 'x');

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

  const handleToggleEnabled = (axis: ExpressionAxis, index: number) => {
    const newAssignments = [...assignments];
    const axisAssignments = axis === 'y' ? yAssignments : xAssignments;
    const globalIndex = assignments.findIndex(
      a => a === axisAssignments[index]
    );
    const existingAssignment = globalIndex !== -1 ? newAssignments[globalIndex] : undefined;
    if (globalIndex !== -1 && existingAssignment) {
      newAssignments[globalIndex] = {
        ...existingAssignment,
        enabled: !existingAssignment.enabled,
      };
      setAssignments(newAssignments);
      onAssignmentsChange?.(newAssignments);
    }
  };

  const handleRemove = (axis: ExpressionAxis, index: number) => {
    const axisAssignments = axis === 'y' ? yAssignments : xAssignments;
    const globalIndex = assignments.findIndex(
      a => a === axisAssignments[index]
    );
    if (globalIndex !== -1) {
      const newAssignments = assignments.filter((_, i) => i !== globalIndex);
      setAssignments(newAssignments);
      onAssignmentsChange?.(newAssignments);
    }
  };

  const handleEdit = (axis: ExpressionAxis, index: number) => {
    setEditingAxis(axis);
    setEditingIndex(index);
  };

  const handleAddNew = (axis: ExpressionAxis) => {
    setAddingAxis(axis);
    setIsAddingNew(true);
  };

  const handleSaveAssignment = (assignment: PedalAssignment) => {
    let newAssignments: PedalAssignment[];

    if (editingIndex !== null) {
      const axisAssignments = editingAxis === 'y' ? yAssignments : xAssignments;
      const globalIndex = assignments.findIndex(
        a => a === axisAssignments[editingIndex]
      );
      if (globalIndex !== -1) {
        newAssignments = [...assignments];
        newAssignments[globalIndex] = assignment;
      } else {
        newAssignments = [...assignments, { ...assignment, axis: editingAxis }];
      }
    } else {
      newAssignments = [...assignments, { ...assignment, axis: addingAxis }];
    }

    setAssignments(newAssignments);
    onAssignmentsChange?.(newAssignments);
    setEditingIndex(null);
    setIsAddingNew(false);
  };

  const renderAxisSection = (
    axis: ExpressionAxis,
    axisAssignments: PedalAssignment[],
    color: string,
    label: string
  ) => (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-semibold flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span style={{ color }}>{label}</span>
        </h4>
        <span className="text-xs text-neutral-500">
          {axisAssignments.length} / {MAX_ASSIGNMENTS_PER_AXIS}
        </span>
      </div>

      <div className="space-y-2">
        {axisAssignments.map((assignment, index) => (
          <AssignmentRow
            key={`${assignment.module}-${assignment.paramIndex}-${index}`}
            assignment={assignment}
            index={index}
            onToggleEnabled={(i) => handleToggleEnabled(axis, i)}
            onRemove={(i) => handleRemove(axis, i)}
            onEdit={(i) => handleEdit(axis, i)}
          />
        ))}

        {axisAssignments.length < MAX_ASSIGNMENTS_PER_AXIS && (
          <AddAssignmentButton
            onClick={() => handleAddNew(axis)}
            disabled={axisAssignments.length >= MAX_ASSIGNMENTS_PER_AXIS}
            axis={axis}
          />
        )}
      </div>
    </div>
  );

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
        className="relative w-full max-w-4xl bg-neutral-900 rounded-t-2xl shadow-2xl animate-slide-up focus:outline-none max-h-[85vh] flex flex-col"
        style={{
          borderTop: `3px solid ${colors.accent}`,
          boxShadow: `0 -4px 20px ${colors.accent}33`,
        }}
        tabIndex={-1}
        role="dialog"
        aria-label="Z-Pedal Settings"
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
                Z-Pedal (EXP2)
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
          <div className="grid md:grid-cols-[220px_1fr] gap-6">
            {/* Left: Pedal visualization */}
            <div className="flex flex-col items-center gap-4">
              {/* Pedal representation */}
              <div
                className="w-full max-w-[180px] rounded-lg relative p-3"
                style={{
                  background: colors.bodyGradient,
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                {/* 2D Position display */}
                <div className="flex justify-center mb-3">
                  <PedalPosition2D
                    xValue={pedalState.xValue ?? 64}
                    yValue={pedalState.yValue}
                    yColor={colors.accent}
                    xColor={colors.xAxis ?? '#f472b6'}
                    disabled={!pedalState.toeEnabled}
                    size={100}
                  />
                </div>

                {/* Sliders */}
                <div className="flex gap-3 justify-center">
                  {/* Y-axis slider */}
                  <div className="h-20">
                    <PedalSlider
                      value={pedalState.yValue}
                      color={colors.accent}
                      disabled={!pedalState.toeEnabled}
                      orientation="vertical"
                      size="sm"
                    />
                  </div>
                  {/* X-axis slider */}
                  <div className="flex-1 flex items-end">
                    <div className="w-full h-3">
                      <PedalSlider
                        value={pedalState.xValue ?? 64}
                        color={colors.xAxis ?? '#f472b6'}
                        disabled={!pedalState.toeEnabled}
                        orientation="horizontal"
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Current values */}
              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-xs text-neutral-500 uppercase tracking-wider">Y Axis</div>
                  <div className="text-xl font-mono font-bold" style={{ color: colors.accent }}>
                    {pedalState.yValue}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500 uppercase tracking-wider">X Axis</div>
                  <div className="text-xl font-mono font-bold" style={{ color: colors.xAxis }}>
                    {pedalState.xValue ?? 64}
                  </div>
                </div>
              </div>

              {/* Info box */}
              <div className="w-full p-3 bg-neutral-800/50 rounded-lg text-xs text-neutral-500">
                <p className="mb-1">
                  <span style={{ color: colors.accent }}>Y Axis:</span> Vertical pedal movement
                </p>
                <p>
                  <span style={{ color: colors.xAxis }}>X Axis:</span> Horizontal ribbon controller
                </p>
              </div>
            </div>

            {/* Right: Assignments by axis */}
            <div className="space-y-6">
              {/* Y-Axis Assignments */}
              {renderAxisSection('y', yAssignments, colors.accent, 'Y Axis (Vertical)')}

              {/* Divider */}
              <div className="border-t border-neutral-800" />

              {/* X-Axis Assignments */}
              {renderAxisSection('x', xAssignments, colors.xAxis ?? '#f472b6', 'X Axis (Ribbon)')}
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
          assignment={
            editingIndex !== null
              ? (editingAxis === 'y' ? yAssignments : xAssignments)[editingIndex]
              : undefined
          }
          availableModules={SIGNAL_CHAIN_ORDER as ModuleName[]}
          axis={isAddingNew ? addingAxis : editingAxis}
          showAxisSelector
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
