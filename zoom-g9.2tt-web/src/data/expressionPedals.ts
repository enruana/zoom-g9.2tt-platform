import type { PedalType, ExpressionPedalState } from '../types/expression';

/** Color themes for expression pedals */
export const PEDAL_COLORS: Record<PedalType, {
  body: string;
  bodyGradient: string;
  accent: string;
  text: string;
  led: string;
  xAxis?: string;
}> = {
  exp1: {
    body: '#1f2937',
    bodyGradient: 'linear-gradient(180deg, #374151 0%, #1f2937 30%, #111827 100%)',
    accent: '#4ade80',
    text: '#d1d5db',
    led: '#22c55e',
  },
  zpedal: {
    body: '#1e293b',
    bodyGradient: 'linear-gradient(180deg, #334155 0%, #1e293b 30%, #0f172a 100%)',
    accent: '#38bdf8',
    text: '#e2e8f0',
    led: '#0ea5e9',
    xAxis: '#f472b6',
  },
};

/** Demo state for EXP1 pedal */
export const DEMO_EXP1_STATE: ExpressionPedalState = {
  yValue: 64,
  toeEnabled: true,
  assignments: [
    {
      axis: 'y',
      module: 'mod',
      paramIndex: 1,
      paramName: 'Depth',
      minValue: 0,
      maxValue: 100,
      enabled: true,
    },
    {
      axis: 'y',
      module: 'dly',
      paramIndex: 2,
      paramName: 'Mix',
      minValue: 0,
      maxValue: 100,
      enabled: true,
    },
  ],
};

/** Demo state for Z-Pedal */
export const DEMO_ZPEDAL_STATE: ExpressionPedalState = {
  yValue: 64,
  xValue: 64,
  toeEnabled: true,
  assignments: [
    {
      axis: 'y',
      module: 'wah',
      paramIndex: 0,
      paramName: 'Position',
      minValue: 0,
      maxValue: 127,
      enabled: true,
    },
    {
      axis: 'y',
      module: 'rev',
      paramIndex: 1,
      paramName: 'Mix',
      minValue: 0,
      maxValue: 100,
      enabled: true,
    },
    {
      axis: 'x',
      module: 'mod',
      paramIndex: 2,
      paramName: 'Rate',
      minValue: 0,
      maxValue: 100,
      enabled: true,
    },
    {
      axis: 'x',
      module: 'dly',
      paramIndex: 0,
      paramName: 'Time',
      minValue: 0,
      maxValue: 100,
      enabled: false,
    },
  ],
};
