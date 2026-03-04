import type { PedalAssignment, ExpressionAxis } from '../../types/expression';
import type { ModuleName } from '../../types/patch';
import { MODULE_COLORS } from '../../data/moduleColors';
import { MODULE_INFO } from '../../data/effectTypes';
import { IconButton } from '../common/Button';

interface AssignmentRowProps {
  assignment: PedalAssignment;
  index: number;
  showAxis?: boolean;
  onToggleEnabled: (index: number) => void;
  onRemove: (index: number) => void;
  onEdit: (index: number) => void;
}

/** A single assignment row in the pedal panel */
export function AssignmentRow({
  assignment,
  index,
  showAxis = false,
  onToggleEnabled,
  onRemove,
  onEdit,
}: AssignmentRowProps) {
  const moduleColor = MODULE_COLORS[assignment.module];
  const moduleInfo = MODULE_INFO[assignment.module];

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
        assignment.enabled ? 'bg-neutral-800' : 'bg-neutral-800/50'
      }`}
      style={{
        borderLeft: `3px solid ${assignment.enabled ? moduleColor.led : '#444'}`,
      }}
    >
      {/* Enable/Disable toggle */}
      <button
        onClick={() => onToggleEnabled(index)}
        className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
          assignment.enabled
            ? 'bg-green-600 text-white'
            : 'bg-neutral-700 text-neutral-500'
        }`}
        aria-label={assignment.enabled ? 'Disable assignment' : 'Enable assignment'}
      >
        {assignment.enabled && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Axis indicator (for Z-Pedal) */}
      {showAxis && (
        <span
          className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
          style={{
            backgroundColor: assignment.axis === 'y' ? '#38bdf833' : '#f472b633',
            color: assignment.axis === 'y' ? '#38bdf8' : '#f472b6',
          }}
        >
          {assignment.axis}
        </span>
      )}

      {/* Module indicator */}
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{
          backgroundColor: moduleColor.led,
          boxShadow: assignment.enabled ? `0 0 6px ${moduleColor.led}` : 'none',
        }}
      />

      {/* Module & Parameter info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span
            className="font-semibold text-sm uppercase"
            style={{ color: assignment.enabled ? moduleColor.accent : '#666' }}
          >
            {moduleInfo.name}
          </span>
          <span className={`text-sm ${assignment.enabled ? 'text-neutral-300' : 'text-neutral-600'}`}>
            {assignment.paramName}
          </span>
        </div>
        <div className={`text-xs ${assignment.enabled ? 'text-neutral-500' : 'text-neutral-700'}`}>
          Range: {assignment.minValue} - {assignment.maxValue}
        </div>
      </div>

      {/* Edit button */}
      <IconButton
        onClick={() => onEdit(index)}
        variant="ghost"
        size="sm"
        aria-label="Edit assignment"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </IconButton>

      {/* Remove button */}
      <IconButton
        onClick={() => onRemove(index)}
        variant="ghost"
        size="sm"
        aria-label="Remove assignment"
        className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </IconButton>
    </div>
  );
}

interface AddAssignmentButtonProps {
  onClick: () => void;
  disabled?: boolean;
  axis?: ExpressionAxis;
}

/** Button to add a new assignment */
export function AddAssignmentButton({ onClick, disabled, axis }: AddAssignmentButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full p-3 rounded-lg border-2 border-dashed transition-all flex items-center justify-center gap-2 ${
        disabled
          ? 'border-neutral-800 text-neutral-700 cursor-not-allowed'
          : 'border-neutral-700 text-neutral-500 hover:border-neutral-600 hover:text-neutral-400 hover:bg-neutral-800/50'
      }`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      <span className="text-sm font-medium">
        Add Assignment {axis ? `(${axis.toUpperCase()} Axis)` : ''}
      </span>
    </button>
  );
}

interface AssignmentEditorProps {
  assignment?: Partial<PedalAssignment>;
  availableModules: ModuleName[];
  axis?: ExpressionAxis;
  showAxisSelector?: boolean;
  onSave: (assignment: PedalAssignment) => void;
  onCancel: () => void;
}

/** Editor modal/form for creating or editing an assignment */
export function AssignmentEditor({
  assignment,
  availableModules,
  axis = 'y',
  showAxisSelector = false,
  onSave,
  onCancel,
}: AssignmentEditorProps) {
  const isEditing = !!assignment?.module;

  // Local state for the form - ensure we always have a valid module
  const defaultModule: ModuleName = assignment?.module ?? availableModules[0] ?? 'mod';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />

      {/* Editor Panel */}
      <div className="relative bg-neutral-900 rounded-xl shadow-2xl w-full max-w-md border border-neutral-800">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-white">
            {isEditing ? 'Edit Assignment' : 'New Assignment'}
          </h4>
          <IconButton onClick={onCancel} variant="ghost" size="sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </IconButton>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Axis selector (for Z-Pedal) */}
          {showAxisSelector && (
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Axis</label>
              <div className="flex gap-2">
                <button
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    axis === 'y'
                      ? 'bg-sky-600 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  Y (Vertical)
                </button>
                <button
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    axis === 'x'
                      ? 'bg-pink-600 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  X (Ribbon)
                </button>
              </div>
            </div>
          )}

          {/* Module selector */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Module</label>
            <select
              defaultValue={defaultModule}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableModules.map((mod) => (
                <option key={mod} value={mod}>
                  {MODULE_INFO[mod].fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Parameter selector */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Parameter</label>
            <select
              defaultValue={assignment?.paramIndex ?? 0}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Depth</option>
              <option value={1}>Rate</option>
              <option value={2}>Mix</option>
              <option value={3}>Level</option>
            </select>
            <p className="mt-1 text-xs text-neutral-500">
              Available parameters depend on the selected module and effect type
            </p>
          </div>

          {/* Min/Max range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Min Value</label>
              <input
                type="number"
                defaultValue={assignment?.minValue ?? 0}
                min={0}
                max={127}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Max Value</label>
              <input
                type="number"
                defaultValue={assignment?.maxValue ?? 100}
                min={0}
                max={127}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-neutral-800 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave({
                axis: axis,
                module: defaultModule,
                paramIndex: assignment?.paramIndex ?? 0,
                paramName: assignment?.paramName ?? 'Parameter',
                minValue: assignment?.minValue ?? 0,
                maxValue: assignment?.maxValue ?? 100,
                enabled: true,
              });
            }}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            {isEditing ? 'Save Changes' : 'Add Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
}
