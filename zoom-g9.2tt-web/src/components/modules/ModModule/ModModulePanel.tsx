import type { BaseModulePanelProps } from '../base/types';
import { BaseModulePanel } from '../base';
import { Knob } from '../../parameter/Knob';
import { getEditableParameters } from '../../../data/parameterMaps';
import { MODULE_COLORS } from '../../../data/moduleColors';

/** MOD (Modulation) Panel - 4 parameters, 28 types */
export function ModModulePanel(props: BaseModulePanelProps) {
  const { moduleKey, module, onParameterClick } = props;
  const parameters = getEditableParameters(moduleKey, module.type);
  const colors = MODULE_COLORS[moduleKey];

  return (
    <BaseModulePanel
      {...props}
      renderParameters={
        parameters.length > 0
          ? () => (
              <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                {parameters.map((param, index) => {
                  const paramValue = module.params[index] ?? param.defaultValue ?? param.min;
                  return (
                    <div
                      key={param.id}
                      className={`transition-opacity ${!module.enabled ? 'opacity-40' : ''}`}
                    >
                      <Knob
                        parameter={param}
                        value={paramValue}
                        onClick={() => onParameterClick?.(index)}
                        disabled={!module.enabled}
                        accentColor={colors.accent}
                      />
                    </div>
                  );
                })}
              </div>
            )
          : undefined
      }
    />
  );
}
