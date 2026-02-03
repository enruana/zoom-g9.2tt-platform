import type { ModuleName, ModuleState } from '../../../types/patch';
import type { ParameterDef } from '../../../data/parameterMaps';

/** Props for the mini (pedalboard) module component */
export interface BaseModuleMiniProps {
  moduleKey: ModuleName;
  module: ModuleState;
  isSelected?: boolean;
  onSelect?: () => void;
  onToggle?: (enabled: boolean) => void;
  compact?: boolean;
}

/** Props for the full panel module component */
export interface BaseModulePanelProps {
  moduleKey: ModuleName;
  module: ModuleState;
  onClose: () => void;
  onParameterClick?: (paramIndex: number) => void;
  onToggleEnabled?: () => void;
  onTypeSelect?: () => void;
}

/** Props for rendering parameters (used by individual modules) */
export interface ParameterRenderProps {
  parameters: ParameterDef[];
  module: ModuleState;
  disabled: boolean;
  accentColor: string;
  onParameterClick?: (index: number) => void;
}

/** Module color configuration */
export interface ModuleColors {
  body: string;
  bodyGradient: string;
  accent: string;
  text: string;
  led: string;
}

/** Props for LED indicator */
export interface ModuleLEDProps {
  enabled: boolean;
  ledColor: string;
  size?: 'sm' | 'md';
}

/** Props for footswitch button */
export interface ModuleFootswitchProps {
  enabled: boolean;
  moduleName: string;
  onToggle?: (enabled: boolean) => void;
  size?: 'sm' | 'md';
}

/** Props for panel header */
export interface ModulePanelHeaderProps {
  moduleKey: ModuleName;
  module: ModuleState;
  colors: ModuleColors;
  canSelectType: boolean;
  typeName: string;
  onClose: () => void;
  onToggleEnabled?: () => void;
  onTypeSelect?: () => void;
}

/** Props for name section */
export interface ModuleNameSectionProps {
  name: string;
  typeName?: string;
  textColor: string;
  accentColor: string;
  compact?: boolean;
}

/** Module components interface for registry */
export interface ModuleComponents {
  Mini: React.ComponentType<BaseModuleMiniProps>;
  Panel: React.ComponentType<BaseModulePanelProps>;
}
