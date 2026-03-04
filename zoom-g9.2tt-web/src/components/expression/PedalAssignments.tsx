import type { PedalAssignment, ExpressionAxis } from '../../types/expression';
import { MODULE_COLORS } from '../../data/moduleColors';

interface PedalAssignmentsProps {
  /** List of assignments to display */
  assignments: PedalAssignment[];
  /** Filter by axis (optional) */
  axis?: ExpressionAxis;
  /** Maximum items to show */
  maxItems?: number;
  /** Whether in compact mode */
  compact?: boolean;
}

/** Displays a list of pedal parameter assignments */
export function PedalAssignments({
  assignments,
  axis,
  maxItems = 4,
  compact = false,
}: PedalAssignmentsProps) {
  const filtered = axis
    ? assignments.filter(a => a.axis === axis)
    : assignments;

  const display = filtered.slice(0, maxItems);

  if (display.length === 0) {
    return (
      <div className={`text-neutral-500 italic ${compact ? 'text-[8px]' : 'text-[10px]'}`}>
        No assignments
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${compact ? 'gap-0.5' : 'gap-1'}`}>
      {display.map((assignment, index) => {
        const moduleColor = MODULE_COLORS[assignment.module];
        return (
          <div
            key={`${assignment.module}-${assignment.paramIndex}-${index}`}
            className={`flex items-center ${compact ? 'gap-1' : 'gap-1.5'}`}
            style={{ opacity: assignment.enabled ? 1 : 0.5 }}
          >
            {/* Module indicator dot */}
            <div
              className={`rounded-full shrink-0 ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'}`}
              style={{
                backgroundColor: moduleColor.led,
                boxShadow: assignment.enabled ? `0 0 4px ${moduleColor.led}` : 'none',
              }}
            />
            {/* Module name + param */}
            <span
              className={`text-neutral-300 truncate leading-tight ${compact ? 'text-[8px]' : 'text-[10px]'}`}
            >
              <span className="font-semibold uppercase" style={{ color: moduleColor.accent }}>
                {assignment.module}
              </span>
              <span className="text-neutral-500">:</span>{' '}
              <span>{assignment.paramName}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
