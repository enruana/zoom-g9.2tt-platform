import type { BaseModuleMiniProps } from '../base/types';
import { BaseModuleMini } from '../base';
import { MiniKnob } from '../../pedalboard/MiniKnob';
import { getEditableParameters } from '../../../data/parameterMaps';
import { MODULE_COLORS } from '../../../data/moduleColors';

/** ZNR (Noise Reduction) Mini - 1 parameter (Threshold) */
export function ZnrModuleMini(props: BaseModuleMiniProps) {
  const { moduleKey, module, compact } = props;
  const parameters = compact ? [] : getEditableParameters(moduleKey, module.type);
  const baseColors = MODULE_COLORS[moduleKey];

  return (
    <BaseModuleMini
      {...props}
      renderParameters={
        !compact && parameters.length > 0
          ? () => (
              <div className="flex flex-wrap justify-center items-start gap-x-1 gap-y-1 px-1.5">
                {parameters.map((param, index) => {
                  const paramValue = module.params[index] ?? param.defaultValue ?? param.min;
                  return (
                    <MiniKnob
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
