import type { BaseModuleMiniProps } from '../base/types';
import { BaseModuleMini } from '../base';
import { EQSlider } from '../../pedalboard/EQSlider';
import { getEditableParameters } from '../../../data/parameterMaps';
import { MODULE_COLORS } from '../../../data/moduleColors';

/** EQ (6-Band Equalizer) Mini - 6 vertical sliders (unique layout) */
export function EqModuleMini(props: BaseModuleMiniProps) {
  const { moduleKey, module, compact } = props;
  const parameters = compact ? [] : getEditableParameters(moduleKey, module.type).slice(0, 6);
  const baseColors = MODULE_COLORS[moduleKey];

  return (
    <BaseModuleMini
      {...props}
      renderParameters={
        !compact && parameters.length > 0
          ? () => (
              <div className="flex justify-center items-start gap-1 px-2">
                {parameters.map((param, index) => {
                  const paramValue = module.params[index] ?? param.defaultValue ?? param.min;
                  return (
                    <EQSlider
                      key={param.id}
                      parameter={param}
                      value={paramValue}
                      disabled={!module.enabled}
                      accentColor={baseColors.accent}
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
