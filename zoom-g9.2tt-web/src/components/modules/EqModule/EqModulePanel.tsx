import type { BaseModulePanelProps } from '../base/types';
import { BaseModulePanel } from '../base';
import { EQSliderLarge } from '../../parameter/EQSliderLarge';
import { getEditableParameters } from '../../../data/parameterMaps';
import { MODULE_COLORS } from '../../../data/moduleColors';

/** EQ (6-Band Equalizer) Panel - 6 vertical sliders (unique layout) */
export function EqModulePanel(props: BaseModulePanelProps) {
  const { moduleKey, module, onParameterClick } = props;
  const parameters = getEditableParameters(moduleKey, module.type);
  const colors = MODULE_COLORS[moduleKey];

  return (
    <BaseModulePanel
      {...props}
      renderParameters={
        parameters.length > 0
          ? () => (
              <div className="flex justify-center items-end gap-2 md:gap-4 flex-wrap">
                {parameters.map((param, index) => {
                  const paramValue = module.params[index] ?? param.defaultValue ?? param.min;
                  return (
                    <EQSliderLarge
                      key={param.id}
                      parameter={param}
                      value={paramValue}
                      onClick={() => onParameterClick?.(index)}
                      disabled={!module.enabled}
                      accentColor={colors.accent}
                    />
                  );
                })}
              </div>
            )
          : undefined
      }
    />
  );
}
