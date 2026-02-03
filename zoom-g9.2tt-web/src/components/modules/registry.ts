import type { ModuleName } from '../../types/patch';
import type { ModuleComponents } from './base/types';

// Import all module components
import { CompModuleMini, CompModulePanel } from './CompModule';
import { WahModuleMini, WahModulePanel } from './WahModule';
import { ExtModuleMini, ExtModulePanel } from './ExtModule';
import { ZnrModuleMini, ZnrModulePanel } from './ZnrModule';
import { AmpModuleMini, AmpModulePanel } from './AmpModule';
import { CabModuleMini, CabModulePanel } from './CabModule';
import { EqModuleMini, EqModulePanel } from './EqModule';
import { ModModuleMini, ModModulePanel } from './ModModule';
import { DlyModuleMini, DlyModulePanel } from './DlyModule';
import { RevModuleMini, RevModulePanel } from './RevModule';

/**
 * Registry mapping module keys to their Mini and Panel components.
 * This allows for module-specific customizations while maintaining
 * a consistent interface for the Pedalboard and Editor components.
 */
export const MODULE_REGISTRY: Record<ModuleName, ModuleComponents> = {
  comp: { Mini: CompModuleMini, Panel: CompModulePanel },
  wah: { Mini: WahModuleMini, Panel: WahModulePanel },
  ext: { Mini: ExtModuleMini, Panel: ExtModulePanel },
  znr: { Mini: ZnrModuleMini, Panel: ZnrModulePanel },
  amp: { Mini: AmpModuleMini, Panel: AmpModulePanel },
  cab: { Mini: CabModuleMini, Panel: CabModulePanel },
  eq: { Mini: EqModuleMini, Panel: EqModulePanel },
  mod: { Mini: ModModuleMini, Panel: ModModulePanel },
  dly: { Mini: DlyModuleMini, Panel: DlyModulePanel },
  rev: { Mini: RevModuleMini, Panel: RevModulePanel },
};

/**
 * Get the components for a specific module.
 * @param moduleKey - The module identifier (e.g., 'comp', 'eq', 'amp')
 * @returns The Mini and Panel components for the module
 */
export function getModuleComponents(moduleKey: ModuleName): ModuleComponents {
  return MODULE_REGISTRY[moduleKey];
}
