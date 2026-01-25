#!/usr/bin/env python3
"""
Effect ID & Parameter Mapper v2 para Zoom G9.2tt

Captura mensajes MIDI 0x31 y muestra los nombres de parámetros
basados en G9ED.efx.xml.

Uso:
    python effect_id_mapper_v2.py                    # Captura en tiempo real
    python effect_id_mapper_v2.py --analyze FILE    # Analiza log existente
    python effect_id_mapper_v2.py --list            # Lista puertos MIDI
    python effect_id_mapper_v2.py --show-params     # Muestra parámetros del XML
"""

import argparse
import sys
import time
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from collections import defaultdict

# mido solo se requiere para captura en tiempo real
mido = None

def require_mido():
    global mido
    if mido is None:
        try:
            import mido as _mido
            mido = _mido
        except ImportError:
            print("Error: Se requiere 'mido' para captura en tiempo real")
            print("Instalar con: pip install mido python-rtmidi")
            sys.exit(1)


# Mapeo de Effect IDs confirmados
EFFECT_IDS = {
    0x00: "TOP",
    0x01: "CMP",
    0x02: "WAH",
    0x03: "EXT",
    0x04: "ZNR",
    0x05: "AMP",
    0x06: "EQ",
    0x07: "CAB",
    0x08: "MOD",
    0x09: "DLY",
    0x0A: "REV",
    0x0B: "SYNC",
}

# Parámetros comunes (índice 0 y 1)
COMMON_PARAMS = {
    0x00: "On/Off",
    0x01: "Type",
}


class XMLParamLoader:
    """Carga parámetros desde G9ED.efx.xml"""

    def __init__(self, xml_path: str = None):
        self.modules = {}
        self.xml_path = xml_path
        if xml_path and Path(xml_path).exists():
            self.load_xml(xml_path)

    def load_xml(self, xml_path: str):
        """Parsea el XML y extrae los parámetros por módulo."""
        try:
            tree = ET.parse(xml_path)
            root = tree.getroot()

            for module in root.findall('.//FxModule'):
                module_name = module.find('name').text
                self.modules[module_name] = {
                    'types': [],
                    'params_by_type': {}
                }

                for fx_type in module.findall('.//FxType'):
                    type_name = fx_type.find('name').text
                    self.modules[module_name]['types'].append(type_name)

                    params = []
                    for parm in fx_type.findall('.//FxParm'):
                        param_info = {
                            'name': parm.find('name').text,
                            'max': int(parm.find('max').text) if parm.find('max') is not None else 127,
                            'init': int(parm.find('init').text) if parm.find('init') is not None else 0,
                        }
                        params.append(param_info)

                    self.modules[module_name]['params_by_type'][type_name] = params

            print(f"XML cargado: {len(self.modules)} módulos")

        except Exception as e:
            print(f"Error cargando XML: {e}")

    def get_param_name(self, module_name: str, param_id: int, type_idx: int = 0) -> str:
        """
        Obtiene el nombre del parámetro.

        param_id 0 = On/Off
        param_id 1 = Type
        param_id 2+ = parámetros del efecto (índice = param_id - 2)
        """
        if param_id == 0:
            return "On/Off"
        if param_id == 1:
            return "Type"

        if module_name not in self.modules:
            return f"Param_{param_id}"

        module = self.modules[module_name]
        if not module['types']:
            return f"Param_{param_id}"

        # Usar el primer tipo como referencia (o el tipo especificado)
        type_name = module['types'][min(type_idx, len(module['types'])-1)]
        params = module['params_by_type'].get(type_name, [])

        # param_id 2 = primer parámetro del efecto (índice 0)
        param_idx = param_id - 2

        if 0 <= param_idx < len(params):
            return params[param_idx]['name']

        return f"Param_{param_id}"

    def get_all_param_names(self, module_name: str, param_id: int) -> list:
        """Obtiene todos los posibles nombres para un param_id (de todos los tipos)."""
        if param_id == 0:
            return ["On/Off"]
        if param_id == 1:
            return ["Type"]

        if module_name not in self.modules:
            return [f"Param_{param_id}"]

        module = self.modules[module_name]
        names = set()

        param_idx = param_id - 2

        for type_name, params in module['params_by_type'].items():
            if 0 <= param_idx < len(params):
                names.add(params[param_idx]['name'])

        return list(names) if names else [f"Param_{param_id}"]

    def print_all_params(self):
        """Imprime todos los parámetros de todos los módulos."""
        for module_name, module in self.modules.items():
            print(f"\n{'='*60}")
            print(f"Módulo: {module_name}")
            print(f"{'='*60}")
            print(f"  0x00: On/Off")
            print(f"  0x01: Type ({len(module['types'])} tipos)")

            for i, type_name in enumerate(module['types']):
                params = module['params_by_type'][type_name]
                print(f"\n  Tipo {i}: {type_name}")
                for j, param in enumerate(params):
                    print(f"    0x{j+2:02X}: {param['name']} (max={param['max']})")


class EffectIDMapper:
    def __init__(self, xml_loader: XMLParamLoader = None):
        self.xml_loader = xml_loader
        self.discovered = defaultdict(lambda: defaultdict(dict))
        # discovered[effect_id][param_id] = {'values': set(), 'names': []}
        self.message_count = 0
        self.start_time = None
        self.current_types = {}  # effect_id -> current type index

    def parse_0x31(self, data: bytes) -> dict:
        """Parsea un mensaje 0x31."""
        if len(data) < 9:
            return None
        if data[0] != 0xF0 or data[1] != 0x52 or data[4] != 0x31:
            return None

        return {
            'effect_id': data[5],
            'param_id': data[6],
            'value': data[7],
            'raw': data.hex().upper()
        }

    def process_sysex(self, data: list) -> dict:
        """Procesa un mensaje SysEx."""
        if data[0] != 0xF0:
            full_data = bytes([0xF0] + list(data) + [0xF7])
        else:
            full_data = bytes(data)

        if len(full_data) < 6:
            return None
        if full_data[1] != 0x52 or full_data[3] != 0x42:
            return None

        cmd = full_data[4]

        if cmd == 0x31 and len(full_data) >= 9:
            return self.parse_0x31(full_data)

        return None

    def get_module_name(self, effect_id: int) -> str:
        """Retorna el nombre del módulo."""
        return EFFECT_IDS.get(effect_id, f"UNK_{effect_id:02X}")

    def get_param_name(self, effect_id: int, param_id: int) -> str:
        """Retorna el nombre del parámetro."""
        module_name = self.get_module_name(effect_id)

        if self.xml_loader:
            names = self.xml_loader.get_all_param_names(module_name, param_id)
            if len(names) == 1:
                return names[0]
            elif len(names) > 1:
                return f"{names[0]}|..."  # Múltiples posibles nombres

        return COMMON_PARAMS.get(param_id, f"Param_{param_id}")

    def record_discovery(self, parsed: dict):
        """Registra un descubrimiento."""
        eff_id = parsed['effect_id']
        param_id = parsed['param_id']
        value = parsed['value']

        is_new_effect = eff_id not in self.discovered
        is_new_param = param_id not in self.discovered[eff_id]

        if param_id not in self.discovered[eff_id]:
            self.discovered[eff_id][param_id] = {'values': set(), 'names': []}

        self.discovered[eff_id][param_id]['values'].add(value)

        # Guardar el tipo actual si es param_id 1
        if param_id == 1:
            self.current_types[eff_id] = value

        self.message_count += 1

        return is_new_effect, is_new_param

    def format_discovery(self, parsed: dict, is_new_effect: bool, is_new_param: bool) -> str:
        """Formatea un descubrimiento para mostrar."""
        eff_id = parsed['effect_id']
        param_id = parsed['param_id']
        value = parsed['value']

        module = self.get_module_name(eff_id)
        param = self.get_param_name(eff_id, param_id)

        prefix = ""
        if is_new_effect:
            prefix = "*** NEW MODULE *** "
        elif is_new_param:
            prefix = "* new param * "

        return (f"{prefix}0x{eff_id:02X} {module:5} | "
                f"0x{param_id:02X} {param:20} | "
                f"Value: {value:3} (0x{value:02X})")

    def print_summary(self):
        """Imprime resumen."""
        print("\n" + "=" * 70)
        print("RESUMEN DE PARÁMETROS DESCUBIERTOS")
        print("=" * 70)

        if not self.discovered:
            print("No se descubrieron parámetros.")
            return

        print(f"\nTotal mensajes: {self.message_count}")
        print(f"Módulos: {len(self.discovered)}")
        print()

        for eff_id in sorted(self.discovered.keys()):
            params = self.discovered[eff_id]
            module = self.get_module_name(eff_id)

            print(f"┌─ 0x{eff_id:02X} {module}")

            for param_id in sorted(params.keys()):
                info = params[param_id]
                values = info['values']
                param_name = self.get_param_name(eff_id, param_id)
                min_val = min(values)
                max_val = max(values)

                print(f"│  0x{param_id:02X} {param_name:20} "
                      f"range=[{min_val:3}-{max_val:3}] samples={len(values)}")
            print("│")

        print("└" + "─" * 69)

        # Código Python
        print("\n" + "=" * 70)
        print("PARAM_MAP = {")
        for eff_id in sorted(self.discovered.keys()):
            params = self.discovered[eff_id]
            module = self.get_module_name(eff_id)
            print(f"    0x{eff_id:02X}: {{  # {module}")
            for param_id in sorted(params.keys()):
                info = params[param_id]
                values = info['values']
                param_name = self.get_param_name(eff_id, param_id)
                min_val = min(values)
                max_val = max(values)
                print(f"        0x{param_id:02X}: {{'name': '{param_name}', 'min': {min_val}, 'max': {max_val}}},")
            print("    },")
        print("}")


def find_xml_path() -> str:
    """Busca el archivo XML en ubicaciones comunes."""
    possible_paths = [
        Path(__file__).parent.parent / "phases/01-reverse-engineering/05-effect-mapping/G9ED.efx.xml",
        Path(__file__).parent / "G9ED.efx.xml",
        Path.home() / "G9ED.efx.xml",
        Path("/home/felipemantilla/G9ED.efx.xml"),
    ]

    for path in possible_paths:
        if path.exists():
            return str(path)

    return None


def find_input_port(port_name: str = None) -> str:
    """Encuentra un puerto MIDI de entrada."""
    require_mido()
    ports = mido.get_input_names()

    if not ports:
        return None

    if port_name:
        for port in ports:
            if port_name.lower() in port.lower():
                return port
        return None

    for port in ports:
        lower = port.lower()
        if "wine" in lower or "virmidi" in lower or "um-one" in lower:
            return port

    return ports[0]


def list_ports():
    """Lista puertos MIDI."""
    require_mido()
    print("\n=== Puertos MIDI de Entrada ===")
    for i, name in enumerate(mido.get_input_names()):
        print(f"  [{i}] {name}")


def capture_realtime(port_name: str = None, output_file: str = None, xml_path: str = None):
    """Captura en tiempo real."""
    require_mido()

    # Cargar XML
    xml_loader = XMLParamLoader(xml_path) if xml_path else None
    mapper = EffectIDMapper(xml_loader)

    input_port = find_input_port(port_name)

    if not input_port:
        print("Error: No se encontró puerto MIDI")
        print("Usa --list para ver puertos disponibles")
        return

    print()
    print("=" * 70)
    print("EFFECT & PARAMETER MAPPER v2 - Zoom G9.2tt")
    print("=" * 70)
    print(f"Puerto: {input_port}")
    print(f"XML: {xml_path or 'No cargado'}")
    print()
    print("Mueve los knobs en G9ED. Presiona Ctrl+C para ver resumen.")
    print()
    print("=" * 70)
    print(f"{'Effect':<20} | {'Parameter':<25} | {'Value':<15}")
    print("-" * 70)

    log_file = open(output_file, 'w') if output_file else None
    mapper.start_time = time.time()

    try:
        with mido.open_input(input_port) as midi_in:
            for msg in midi_in:
                if msg.type != 'sysex':
                    continue

                parsed = mapper.process_sysex(list(msg.data))

                if parsed:
                    is_new_effect, is_new_param = mapper.record_discovery(parsed)
                    output = mapper.format_discovery(parsed, is_new_effect, is_new_param)
                    timestamp = time.time() - mapper.start_time

                    print(f"[{timestamp:7.2f}s] {output}")

                    if log_file:
                        log_file.write(f"[{timestamp:.3f}] {parsed['raw']} | {output}\n")
                        log_file.flush()

    except KeyboardInterrupt:
        print()
        mapper.print_summary()
        elapsed = time.time() - mapper.start_time
        print(f"\nDuración: {elapsed:.1f}s")

    finally:
        if log_file:
            log_file.close()
            print(f"Log: {output_file}")


def analyze_log_file(filepath: str, xml_path: str = None):
    """Analiza un log existente."""
    xml_loader = XMLParamLoader(xml_path) if xml_path else None
    mapper = EffectIDMapper(xml_loader)

    print(f"\nAnalizando: {filepath}")
    print("=" * 70)

    hex_pattern = re.compile(r'F052004231([A-Fa-f0-9]+)')

    with open(filepath, 'r') as f:
        for line_num, line in enumerate(f, 1):
            match = re.search(r'F0[A-Fa-f0-9]+F7', line)
            if match:
                hex_data = match.group(0)
                try:
                    data = bytes.fromhex(hex_data)
                    if len(data) >= 9 and data[4] == 0x31:
                        parsed = mapper.process_sysex(list(data))
                        if parsed:
                            is_new_effect, is_new_param = mapper.record_discovery(parsed)
                            output = mapper.format_discovery(parsed, is_new_effect, is_new_param)
                            print(f"[{line_num:4}] {output}")
                except ValueError:
                    continue

    mapper.print_summary()


def main():
    parser = argparse.ArgumentParser(
        description="Mapea Effect IDs y Parameter IDs del Zoom G9.2tt"
    )
    parser.add_argument("-l", "--list", action="store_true",
                       help="Listar puertos MIDI")
    parser.add_argument("-p", "--port", metavar="NAME",
                       help="Puerto MIDI")
    parser.add_argument("-o", "--output", metavar="FILE",
                       help="Guardar log")
    parser.add_argument("-a", "--analyze", metavar="FILE",
                       help="Analizar log existente")
    parser.add_argument("-x", "--xml", metavar="FILE",
                       help="Ruta al G9ED.efx.xml")
    parser.add_argument("--show-params", action="store_true",
                       help="Mostrar todos los parámetros del XML")

    args = parser.parse_args()

    # Buscar XML automáticamente si no se especifica
    xml_path = args.xml or find_xml_path()

    if args.list:
        list_ports()
        return

    if args.show_params:
        if not xml_path:
            print("Error: No se encontró G9ED.efx.xml")
            print("Usa --xml para especificar la ruta")
            return
        loader = XMLParamLoader(xml_path)
        loader.print_all_params()
        return

    if args.analyze:
        analyze_log_file(args.analyze, xml_path)
        return

    capture_realtime(
        port_name=args.port,
        output_file=args.output,
        xml_path=xml_path
    )


if __name__ == "__main__":
    main()
