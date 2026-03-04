import type { ModuleName } from './patch';

/** Axis type for expression pedals */
export type ExpressionAxis = 'y' | 'x';

/** A single parameter assignment for an expression pedal */
export interface PedalAssignment {
  /** Which axis controls this parameter (Y for vertical, X for horizontal/ribbon) */
  axis: ExpressionAxis;
  /** The module this parameter belongs to */
  module: ModuleName;
  /** Parameter index within the module */
  paramIndex: number;
  /** Display name of the parameter */
  paramName: string;
  /** Minimum value when pedal at heel position (0%) */
  minValue: number;
  /** Maximum value when pedal at toe position (100%) */
  maxValue: number;
  /** Whether this assignment is active */
  enabled: boolean;
}

/** State of an expression pedal */
export interface ExpressionPedalState {
  /** Current Y-axis (vertical) position (0-127) */
  yValue: number;
  /** Current X-axis (horizontal/ribbon) position (0-127), only for Z-Pedal */
  xValue?: number;
  /** Whether the toe switch is enabled/active */
  toeEnabled: boolean;
  /** List of parameter assignments (up to 4 per axis) */
  assignments: PedalAssignment[];
}

/** Type of expression pedal */
export type PedalType = 'exp1' | 'zpedal';
