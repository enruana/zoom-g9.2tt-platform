#!/usr/bin/env python3
"""
Generate parameterMaps.ts from efx_parsed.json
Maps all G9.2tt parameter definitions from the XML-parsed data
into TypeScript constants for the web editor.
"""

import json
import sys
import os

# Module name mapping: XML name -> app module key
MODULE_MAP = {
    'CMP': 'comp',
    'WAH': 'wah',
    'EXT': 'ext',
    'ZNR': 'znr',
    'AMP': 'amp',
    'MOD': 'mod',
    'DLY': 'dly',
    'REV': 'rev',
}

# Modules we skip (handled separately or not editable)
SKIP_MODULES = {'TOP', 'EQ', 'CAB', 'TTL'}


def make_short_name(name: str) -> str:
    """Generate a 4-char short name from parameter name."""
    abbreviations = {
        'Level': 'LVL',
        'Sense': 'SENS',
        'Attack': 'ATK',
        'Release': 'REL',
        'Threshold': 'THRS',
        'Ratio': 'RTIO',
        'Tone': 'TONE',
        'Depth': 'DPTH',
        'Rate': 'RATE',
        'Resonance': 'RESO',
        'Feedback': 'FDBK',
        'Mix': 'MIX',
        'Balance': 'BAL',
        'Gain': 'GAIN',
        'Decay': 'DCAY',
        'Pre Delay': 'PDLY',
        'PreDelay': 'PDLY',
        'Hi Damp': 'HIDP',
        'HiDamp': 'HIDP',
        'Lo Damp': 'LODP',
        'LoDamp': 'LODP',
        'Range': 'RANG',
        'Position': 'POS',
        'Time': 'TIME',
        'Color': 'COLR',
        'Fine': 'FINE',
        'Shift': 'SHFT',
        'Speed': 'SPD',
        'Manual': 'MAN',
        'Spread': 'SPRD',
        'Volume': 'VOL',
        'Bass': 'BASS',
        'Middle': 'MID',
        'Treble': 'TRBL',
        'Presence': 'PRES',
        'Low': 'LOW',
        'High': 'HIGH',
        'Send': 'SEND',
        'Return': 'RTN',
        'Dry': 'DRY',
        'Mod': 'MOD',
        'ModDepth': 'MDPT',
        'ModRate': 'MRAT',
        'Pattern': 'PTRN',
        'Duty': 'DUTY',
        'Step': 'STEP',
        'PreD': 'PRED',
        'Tail': 'TAIL',
        'Bottom': 'BTM',
        'Top': 'TOP',
        'Drive': 'DRIV',
    }
    if name in abbreviations:
        return abbreviations[name]
    # Remove spaces, take first 4 chars uppercase
    clean = name.replace(' ', '').replace('-', '')
    return clean[:4].upper()


def escape_str(s: str) -> str:
    """Escape a string for TypeScript single quotes."""
    return s.replace("'", "\\'")


def format_param(param, idx):
    """Format a single parameter definition as TypeScript."""
    param_id = idx + 2  # 0=On/Off, 1=Type, 2+=params
    name = param['name']
    short_name = make_short_name(name)
    max_val = param['max']
    init_val = param['init']
    offset = param.get('offset', 0)
    rtm_max = param.get('rtm_max', 0)
    views = param.get('views', [])

    parts = [
        f"id: {param_id}",
        f"name: '{escape_str(name)}'",
        f"shortName: '{escape_str(short_name)}'",
        f"min: 0",
        f"max: {max_val}",
    ]

    if views:
        # Only include views when they cover the full value range (1:1 mapping).
        # Skip partial views (e.g., BPM-sync note names at the tail of Time params).
        if len(views) == max_val + 1:
            views_str = ', '.join(f"'{escape_str(v)}'" for v in views)
            parts.append(f"values: [{views_str}]")

    if init_val != 0:
        parts.append(f"defaultValue: {init_val}")

    if offset != 0:
        parts.append(f"displayOffset: {offset}")

    if rtm_max != 0 and rtm_max != max_val:
        parts.append(f"rtmMax: {rtm_max}")

    return '      { ' + ', '.join(parts) + ' }'


def generate_module(module_key, types_data):
    """Generate a ModuleParameterMap constant for a module."""
    const_name = f"{module_key.upper()}_PARAMS"
    lines = []

    # Determine max type index for Type param
    num_types = len(types_data)
    max_type = num_types - 1 if num_types > 1 else 0

    # Common params
    lines.append(f"export const {const_name}: ModuleParameterMap = {{")
    lines.append("  common: [")
    lines.append("    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },")
    if num_types > 1:
        lines.append(f"    {{ id: 1, name: 'Type', shortName: 'TYPE', min: 0, max: {max_type} }},")
    lines.append("  ],")

    # byType
    lines.append("  byType: {")

    # Check if all types have identical params
    all_same = True
    if num_types > 1:
        first_sig = [(p['name'], p['max'], p.get('offset', 0), tuple(p.get('views', []))) for p in types_data[0]['parameters']]
        for t in types_data[1:]:
            sig = [(p['name'], p['max'], p.get('offset', 0), tuple(p.get('views', []))) for p in t['parameters']]
            if sig != first_sig:
                all_same = False
                break

    if all_same and num_types > 1:
        # All types identical - use default only
        pass
    else:
        for type_idx, type_data in enumerate(types_data):
            params = type_data['parameters']
            if not params:
                continue
            lines.append(f"    // {type_data['name']} ({type_idx})")
            lines.append(f"    {type_idx}: [")
            for p_idx, p in enumerate(params):
                comma = ',' if p_idx < len(params) - 1 else ','
                lines.append(format_param(p, p_idx) + comma)
            lines.append("    ],")

    lines.append("  },")

    # Default params (use first type's params)
    if types_data and types_data[0]['parameters']:
        first_params = types_data[0]['parameters']
        lines.append("  default: [")
        for p_idx, p in enumerate(first_params):
            comma = ',' if p_idx < len(first_params) - 1 else ','
            lines.append(format_param(p, p_idx) + comma)
        lines.append("  ],")
    else:
        lines.append("  default: [],")

    lines.append("};")
    return lines


def generate():
    """Main generation function."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, '..', 'phases', '03-complete-mapping', 'reference', 'efx_parsed.json')

    with open(json_path) as f:
        data = json.load(f)

    output = []

    # Header
    output.append("/**")
    output.append(" * Parameter definitions for all G9.2tt modules")
    output.append(" * AUTO-GENERATED from G9ED.efx.xml via tools/generate_parameter_maps.py")
    output.append(" * Source: phases/03-complete-mapping/reference/efx_parsed.json (420 params)")
    output.append(" *")
    output.append(" * DO NOT EDIT MANUALLY - regenerate with: python3 tools/generate_parameter_maps.py")
    output.append(" */")
    output.append("")
    output.append("import type { ModuleName } from '../types/patch';")
    output.append("")

    # Interface
    output.append("/** Parameter definition */")
    output.append("export interface ParameterDef {")
    output.append("  id: number;")
    output.append("  name: string;")
    output.append("  shortName?: string;")
    output.append("  min: number;")
    output.append("  max: number;")
    output.append("  unit?: string;")
    output.append("  /** For parameters with discrete named values */")
    output.append("  values?: string[];")
    output.append("  /** Default/initial value */")
    output.append("  defaultValue?: number;")
    output.append("  /** Display offset: display = midi_value + offset */")
    output.append("  displayOffset?: number;")
    output.append("  /** Real-time max (for BPM sync params where full range isn't RT-controllable) */")
    output.append("  rtmMax?: number;")
    output.append("}")
    output.append("")

    # ModuleParameterMap interface
    output.append("/** Module parameter map by effect type */")
    output.append("export interface ModuleParameterMap {")
    output.append("  /** Common parameters for all types (usually On/Off and Type) */")
    output.append("  common: ParameterDef[];")
    output.append("  /** Type-specific parameters (keyed by type ID) */")
    output.append("  byType: Record<number, ParameterDef[]>;")
    output.append("  /** Default parameters (used when type-specific not defined) */")
    output.append("  default: ParameterDef[];")
    output.append("}")
    output.append("")

    # Generate each module from JSON
    for module_data in data['modules']:
        xml_name = module_data['name']
        if xml_name in SKIP_MODULES:
            continue
        module_key = MODULE_MAP.get(xml_name)
        if not module_key:
            continue

        output.append(f"// {'=' * 76}")
        output.append(f"// {module_key.upper()} ({xml_name}) - {len(module_data['types'])} types")
        output.append(f"// {'=' * 76}")
        output.append("")
        output.extend(generate_module(module_key, module_data['types']))
        output.append("")

    # Hardcoded EQ
    output.append("// " + "=" * 76)
    output.append("// EQ (6-Band Equalizer) - hardcoded (not in XML)")
    output.append("// " + "=" * 76)
    output.append("")
    output.append("export const EQ_PARAMS: ModuleParameterMap = {")
    output.append("  common: [")
    output.append("    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },")
    output.append("  ],")
    output.append("  byType: {},")
    output.append("  default: [")
    output.append("    { id: 2, name: 'Low', shortName: 'LOW', min: 0, max: 24, defaultValue: 12, unit: 'dB', displayOffset: -12 },")
    output.append("    { id: 3, name: 'Low Mid', shortName: 'LMID', min: 0, max: 24, defaultValue: 12, unit: 'dB', displayOffset: -12 },")
    output.append("    { id: 4, name: 'Mid', shortName: 'MID', min: 0, max: 24, defaultValue: 12, unit: 'dB', displayOffset: -12 },")
    output.append("    { id: 5, name: 'High Mid', shortName: 'HMID', min: 0, max: 24, defaultValue: 12, unit: 'dB', displayOffset: -12 },")
    output.append("    { id: 6, name: 'High', shortName: 'HIGH', min: 0, max: 24, defaultValue: 12, unit: 'dB', displayOffset: -12 },")
    output.append("    { id: 7, name: 'Presence', shortName: 'PRES', min: 0, max: 24, defaultValue: 12, unit: 'dB', displayOffset: -12 },")
    output.append("  ],")
    output.append("};")
    output.append("")

    # Hardcoded CAB
    output.append("// " + "=" * 76)
    output.append("// CAB (Cabinet Simulator) - hardcoded (not in XML)")
    output.append("// " + "=" * 76)
    output.append("")
    output.append("export const CAB_PARAMS: ModuleParameterMap = {")
    output.append("  common: [")
    output.append("    { id: 0, name: 'On/Off', shortName: 'ON', min: 0, max: 1, values: ['OFF', 'ON'] },")
    output.append("  ],")
    output.append("  byType: {},")
    output.append("  default: [")
    output.append("    { id: 2, name: 'Mic Type', shortName: 'MIC', min: 0, max: 1, values: ['Dynamic', 'Condenser'] },")
    output.append("    { id: 3, name: 'Mic Position', shortName: 'POS', min: 0, max: 2 },")
    output.append("    { id: 4, name: 'Depth', shortName: 'DPTH', min: 0, max: 2, values: ['Small', 'Middle', 'Large'] },")
    output.append("  ],")
    output.append("};")
    output.append("")

    # Module registry
    output.append("// " + "=" * 76)
    output.append("// Module parameter map registry")
    output.append("// " + "=" * 76)
    output.append("")
    output.append("export const MODULE_PARAMS: Record<ModuleName, ModuleParameterMap> = {")
    output.append("  comp: COMP_PARAMS,")
    output.append("  wah: WAH_PARAMS,")
    output.append("  ext: EXT_PARAMS,")
    output.append("  znr: ZNR_PARAMS,")
    output.append("  amp: AMP_PARAMS,")
    output.append("  eq: EQ_PARAMS,")
    output.append("  cab: CAB_PARAMS,")
    output.append("  mod: MOD_PARAMS,")
    output.append("  dly: DLY_PARAMS,")
    output.append("  rev: REV_PARAMS,")
    output.append("};")
    output.append("")

    # Helper functions
    output.append("/**")
    output.append(" * Get all parameters for a module and effect type")
    output.append(" */")
    output.append("export function getModuleParameters(module: ModuleName, typeId: number): ParameterDef[] {")
    output.append("  const paramMap = MODULE_PARAMS[module];")
    output.append("  const typeParams = paramMap.byType[typeId] ?? paramMap.default;")
    output.append("")
    output.append("  // For modules without a type selector, skip the type parameter")
    output.append("  const commonParams = paramMap.common.filter(p => {")
    output.append("    // Only include Type parameter if module has multiple types")
    output.append("    if (p.name === 'Type') {")
    output.append("      return Object.keys(paramMap.byType).length > 0 ||")
    output.append("             (module !== 'ext' && module !== 'eq' && module !== 'cab');")
    output.append("    }")
    output.append("    return true;")
    output.append("  });")
    output.append("")
    output.append("  return [...commonParams, ...typeParams];")
    output.append("}")
    output.append("")

    output.append("/**")
    output.append(" * Get editable parameters (excluding On/Off and Type which are handled separately)")
    output.append(" */")
    output.append("export function getEditableParameters(module: ModuleName, typeId: number): ParameterDef[] {")
    output.append("  const paramMap = MODULE_PARAMS[module];")
    output.append("  const typeParams = paramMap.byType[typeId] ?? paramMap.default;")
    output.append("  return typeParams.map(p => p.rtmMax ? { ...p, max: p.rtmMax } : p);")
    output.append("}")
    output.append("")

    output.append("/**")
    output.append(" * Format a parameter value for display")
    output.append(" */")
    output.append("export function formatParameterValue(param: ParameterDef, value: number): string {")
    output.append("  // Handle discrete value parameters")
    output.append("  if (param.values && param.values[value] !== undefined) {")
    output.append("    return param.values[value];")
    output.append("  }")
    output.append("")
    output.append("  const displayValue = value + (param.displayOffset ?? 0);")
    output.append("")
    output.append("  // Show +/- sign for offset parameters (e.g., EQ bands)")
    output.append("  if (param.displayOffset && param.displayOffset < 0) {")
    output.append("    return displayValue === 0 ? '0' : (displayValue > 0 ? `+${displayValue}` : `${displayValue}`);")
    output.append("  }")
    output.append("")
    output.append("  return param.unit ? `${displayValue}${param.unit}` : String(displayValue);")
    output.append("}")

    # Write output
    out_path = os.path.join(script_dir, '..', 'zoom-g9.2tt-web', 'src', 'data', 'parameterMaps.ts')
    content = '\n'.join(output) + '\n'
    with open(out_path, 'w') as f:
        f.write(content)

    print(f"Generated {out_path}")
    print(f"Total lines: {len(output)}")


if __name__ == '__main__':
    generate()
