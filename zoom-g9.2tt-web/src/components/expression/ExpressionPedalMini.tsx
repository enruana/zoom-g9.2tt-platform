import type { ExpressionPedalState } from '../../types/expression';
import { PEDAL_COLORS } from '../../data/expressionPedals';
import { PedalSlider } from './PedalSlider';
import { PedalToeSwitch } from './PedalToeSwitch';
import { PedalAssignments } from './PedalAssignments';

interface ExpressionPedalMiniProps {
  /** Current pedal state */
  pedalState: ExpressionPedalState;
  /** Callback when toe switch is toggled */
  onToeToggle?: (enabled: boolean) => void;
  /** Callback when pedal is selected/clicked (opens panel) */
  onSelect?: () => void;
  /** Whether to render in horizontal layout (mobile) */
  horizontal?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/** Mini representation of EXP1 expression pedal */
export function ExpressionPedalMini({
  pedalState,
  onToeToggle,
  onSelect,
  horizontal = false,
  className = '',
}: ExpressionPedalMiniProps) {
  const colors = PEDAL_COLORS.exp1;
  const yAssignments = pedalState.assignments.filter(a => a.axis === 'y');

  if (horizontal) {
    return (
      <div
        className={`rounded-lg p-2.5 ${className}`}
        style={{
          background: colors.bodyGradient,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.3)',
          border: '1px solid rgba(0,0,0,0.2)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Toe switch */}
          <PedalToeSwitch
            enabled={pedalState.toeEnabled}
            ledColor={colors.led}
            label="Toggle EXP1"
            onToggle={onToeToggle}
            size="sm"
          />

          {/* Main content - clickable area */}
          <button
            onClick={onSelect}
            className="flex-1 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
          >
            {/* Pedal surface representation */}
            <div
              className="w-12 h-10 rounded flex-shrink-0"
              style={{
                background: 'repeating-linear-gradient(90deg, #333 0px, #333 3px, #222 3px, #222 6px)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(255,255,255,0.1)',
              }}
            />

            {/* Slider horizontal */}
            <div className="flex-1 h-8">
              <PedalSlider
                value={pedalState.yValue}
                color={colors.accent}
                disabled={!pedalState.toeEnabled}
                orientation="horizontal"
                size="sm"
              />
            </div>
          </button>

          {/* Title and value */}
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.accent }}>
              EXP1
            </div>
            <div className="text-[9px] text-neutral-400">
              {pedalState.yValue}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vertical layout (desktop)
  return (
    <div
      className={`rounded-lg overflow-hidden h-full flex flex-col ${className}`}
      style={{
        background: colors.bodyGradient,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.3)',
        border: '1px solid rgba(0,0,0,0.2)',
      }}
    >
      {/* Header - clickable */}
      <button
        onClick={onSelect}
        className="p-2 text-center border-b border-black/20 hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.accent }}>
          EXP1
        </div>
      </button>

      {/* Main content - clickable */}
      <button
        onClick={onSelect}
        className="flex-1 p-2 flex flex-col gap-3 cursor-pointer hover:bg-white/5 transition-colors text-left"
      >
        {/* Pedal surface visual representation */}
        <div className="flex-1 flex gap-2">
          {/* Pedal surface with grip pattern */}
          <div
            className="flex-1 rounded-lg"
            style={{
              background: 'repeating-linear-gradient(0deg, #333 0px, #333 4px, #222 4px, #222 8px)',
              boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.5), inset 0 -2px 0 rgba(255,255,255,0.1)',
            }}
          />
          {/* Vertical slider */}
          <div className="w-4 flex-shrink-0">
            <PedalSlider
              value={pedalState.yValue}
              color={colors.accent}
              disabled={!pedalState.toeEnabled}
              orientation="vertical"
            />
          </div>
        </div>

        {/* Assignments section */}
        <div className="px-1">
          <div className="text-[8px] text-neutral-500 uppercase tracking-wider mb-1">Assigns</div>
          <PedalAssignments
            assignments={yAssignments}
            maxItems={3}
            compact
          />
        </div>

        {/* Value indicator */}
        <div className="text-center w-full">
          <span className="text-[10px] text-neutral-400">Y: </span>
          <span className="text-xs font-mono font-bold" style={{ color: colors.accent }}>
            {pedalState.yValue}
          </span>
        </div>
      </button>

      {/* Footer with toe switch */}
      <div className="p-3 flex justify-center border-t border-black/20">
        <PedalToeSwitch
          enabled={pedalState.toeEnabled}
          ledColor={colors.led}
          label="Toggle EXP1"
          onToggle={onToeToggle}
        />
      </div>
    </div>
  );
}
