import type { ExpressionPedalState } from '../../types/expression';
import { PEDAL_COLORS } from '../../data/expressionPedals';
import { PedalSlider } from './PedalSlider';
import { PedalPosition2D } from './PedalPosition2D';
import { PedalToeSwitch } from './PedalToeSwitch';
import { PedalAssignments } from './PedalAssignments';

interface ZPedalMiniProps {
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

/** Mini representation of Z-Pedal (EXP2) with X/Y axes */
export function ZPedalMini({
  pedalState,
  onToeToggle,
  onSelect,
  horizontal = false,
  className = '',
}: ZPedalMiniProps) {
  const colors = PEDAL_COLORS.zpedal;
  const yAssignments = pedalState.assignments.filter(a => a.axis === 'y');
  const xAssignments = pedalState.assignments.filter(a => a.axis === 'x');

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
            label="Toggle Z-Pedal"
            onToggle={onToeToggle}
            size="sm"
          />

          {/* Main content - clickable */}
          <button
            onClick={onSelect}
            className="flex-1 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
          >
            {/* 2D Position display */}
            <PedalPosition2D
              xValue={pedalState.xValue ?? 64}
              yValue={pedalState.yValue}
              yColor={colors.accent}
              xColor={colors.xAxis ?? '#f472b6'}
              disabled={!pedalState.toeEnabled}
              size={48}
            />

            {/* Values */}
            <div className="flex-1">
              <div className="flex gap-2 text-[9px]">
                <span style={{ color: colors.accent }}>Y:{pedalState.yValue}</span>
                <span style={{ color: colors.xAxis }}>X:{pedalState.xValue ?? 64}</span>
              </div>
            </div>
          </button>

          {/* Title */}
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.accent }}>
              Z-PDL
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
          Z-Pedal
        </div>
      </button>

      {/* Main content - clickable */}
      <button
        onClick={onSelect}
        className="flex-1 p-2 flex flex-col gap-2 cursor-pointer hover:bg-white/5 transition-colors text-left"
      >
        {/* Position display and slider */}
        <div className="flex gap-2">
          {/* 2D Position display */}
          <div className="flex-1 flex justify-center">
            <PedalPosition2D
              xValue={pedalState.xValue ?? 64}
              yValue={pedalState.yValue}
              yColor={colors.accent}
              xColor={colors.xAxis ?? '#f472b6'}
              disabled={!pedalState.toeEnabled}
              size={56}
            />
          </div>
          {/* Vertical Y slider */}
          <div className="w-3">
            <PedalSlider
              value={pedalState.yValue}
              color={colors.accent}
              disabled={!pedalState.toeEnabled}
              orientation="vertical"
              size="sm"
            />
          </div>
        </div>

        {/* Horizontal X slider (ribbon) */}
        <div className="h-3 px-1">
          <PedalSlider
            value={pedalState.xValue ?? 64}
            color={colors.xAxis ?? '#f472b6'}
            disabled={!pedalState.toeEnabled}
            orientation="horizontal"
            size="sm"
          />
        </div>

        {/* Assignments sections */}
        <div className="flex-1 flex flex-col gap-2 px-1">
          {/* Y-Axis assignments */}
          <div>
            <div className="text-[8px] uppercase tracking-wider mb-0.5" style={{ color: colors.accent }}>
              Y Axis
            </div>
            <PedalAssignments
              assignments={yAssignments}
              maxItems={2}
              compact
            />
          </div>

          {/* X-Axis assignments */}
          <div>
            <div className="text-[8px] uppercase tracking-wider mb-0.5" style={{ color: colors.xAxis }}>
              X Axis
            </div>
            <PedalAssignments
              assignments={xAssignments}
              maxItems={2}
              compact
            />
          </div>
        </div>

        {/* Value indicators */}
        <div className="flex justify-center gap-3 text-[10px] w-full">
          <span>
            <span className="text-neutral-400">Y:</span>
            <span className="font-mono font-bold ml-0.5" style={{ color: colors.accent }}>
              {pedalState.yValue}
            </span>
          </span>
          <span>
            <span className="text-neutral-400">X:</span>
            <span className="font-mono font-bold ml-0.5" style={{ color: colors.xAxis }}>
              {pedalState.xValue ?? 64}
            </span>
          </span>
        </div>
      </button>

      {/* Footer with toe switch */}
      <div className="p-3 flex justify-center border-t border-black/20">
        <PedalToeSwitch
          enabled={pedalState.toeEnabled}
          ledColor={colors.led}
          label="Toggle Z-Pedal"
          onToggle={onToeToggle}
        />
      </div>
    </div>
  );
}
