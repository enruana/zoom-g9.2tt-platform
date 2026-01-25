#!/usr/bin/env python3
"""
Effect ID Mapper para Zoom G9.2tt

Captura mensajes MIDI 0x31 (Parameter Change) y mapea los Effect IDs
de cada módulo del pedal.

Uso:
    python effect_id_mapper.py              # Captura en tiempo real
    python effect_id_mapper.py --analyze    # Analiza archivo de log existente
    python effect_id_mapper.py --list       # Lista puertos MIDI

Instrucciones:
    1. Ejecuta el script
    2. En G9ED, mueve un knob de cada módulo (CMP, WAH, AMP, MOD, etc.)
    3. El script mostrará los Effect IDs descubiertos
    4. Presiona Ctrl+C para ver el resumen final

Formato del comando 0x31 (Parameter Change):
    F0 52 00 42 31 [EFFECT_ID] [PARAM_ID] [VALUE] 00 F7
"""

import argparse
import sys
import time
import re
from datetime import datetime
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
            print("Error: Se requiere la biblioteca 'mido' para captura en tiempo real")
            print("Instalar con: pip install mido python-rtmidi")
            sys.exit(1)


# Hipótesis basada en BIT_TBL del decoder
HYPOTHESIZED_MODULES = {
    0x00: "TOP/Global",
    0x01: "CMP",
    0x02: "WAH",
    0x03: "EXT",
    0x04: "ZNR",
    0x05: "AMP",      # Confirmado
    0x06: "EQ",
    0x07: "CAB",
    0x08: "MOD",
    0x09: "DLY",
    0x0A: "REV",
    0x0B: "ZNR-B?",   # Posible segundo ZNR
    0x0C: "AMP-B?",   # Posible segundo AMP
    0x0D: "EQ-B?",    # Posible segundo EQ
}

# Parámetros conocidos por módulo
KNOWN_PARAMS = {
    0x05: {  # AMP
        0x00: "On/Off",
        0x01: "Type",
        0x02: "Gain",
        0x03: "Tone/Bass",
        0x04: "Level",
        0x05: "Presence?",
    }
}


class EffectIDMapper:
    def __init__(self):
        self.discovered = defaultdict(lambda: defaultdict(set))
        # discovered[effect_id][param_id] = set of values seen
        self.message_count = 0
        self.start_time = None

    def parse_0x31(self, data: bytes) -> dict:
        """
        Parsea un mensaje 0x31 de cambio de parámetro.

        Formato: F0 52 00 42 31 [EFFECT] [PARAM] [VALUE] 00 F7
        """
        if len(data) < 9:
            return None
        if data[0] != 0xF0 or data[1] != 0x52 or data[4] != 0x31:
            return None

        return {
            'effect_id': data[5],
            'param_id': data[6],
            'value': data[7],
            'extra': data[8] if len(data) > 8 else 0,
            'raw': data.hex().upper()
        }

    def process_sysex(self, data: list) -> dict:
        """Procesa un mensaje SysEx y extrae info si es 0x31."""
        # Añadir F0 al inicio si no está
        if data[0] != 0xF0:
            full_data = bytes([0xF0] + list(data) + [0xF7])
        else:
            full_data = bytes(data)

        # Verificar que es un comando del G9.2tt
        if len(full_data) < 6:
            return None
        if full_data[1] != 0x52 or full_data[3] != 0x42:
            return None

        cmd = full_data[4]

        if cmd == 0x31 and len(full_data) >= 9:
            return self.parse_0x31(full_data)

        return None

    def record_discovery(self, parsed: dict):
        """Registra un Effect ID descubierto."""
        eff_id = parsed['effect_id']
        param_id = parsed['param_id']
        value = parsed['value']

        is_new_effect = eff_id not in self.discovered
        is_new_param = param_id not in self.discovered[eff_id]

        self.discovered[eff_id][param_id].add(value)
        self.message_count += 1

        return is_new_effect, is_new_param

    def get_module_name(self, effect_id: int) -> str:
        """Retorna el nombre del módulo basado en Effect ID."""
        if effect_id in HYPOTHESIZED_MODULES:
            return HYPOTHESIZED_MODULES[effect_id]
        return f"UNKNOWN-{effect_id:02X}"

    def get_param_name(self, effect_id: int, param_id: int) -> str:
        """Retorna el nombre del parámetro si es conocido."""
        if effect_id in KNOWN_PARAMS:
            if param_id in KNOWN_PARAMS[effect_id]:
                return KNOWN_PARAMS[effect_id][param_id]
        return f"Param_{param_id:02X}"

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

        return (f"{prefix}Effect: 0x{eff_id:02X} ({module}) | "
                f"Param: 0x{param_id:02X} ({param}) | "
                f"Value: {value} (0x{value:02X})")

    def print_summary(self):
        """Imprime resumen de todos los Effect IDs descubiertos."""
        print("\n" + "=" * 70)
        print("RESUMEN DE EFFECT IDs DESCUBIERTOS")
        print("=" * 70)

        if not self.discovered:
            print("No se descubrieron Effect IDs.")
            print("Asegúrate de mover los knobs en G9ED mientras capturas.")
            return

        print(f"\nTotal de mensajes 0x31 capturados: {self.message_count}")
        print(f"Módulos descubiertos: {len(self.discovered)}")
        print()

        # Ordenar por Effect ID
        for eff_id in sorted(self.discovered.keys()):
            params = self.discovered[eff_id]
            module = self.get_module_name(eff_id)

            confirmed = "CONFIRMADO" if eff_id == 0x05 else "HIPÓTESIS"
            print(f"┌─ Effect ID: 0x{eff_id:02X} = {module} [{confirmed}]")
            print(f"│  Parámetros descubiertos: {len(params)}")

            for param_id in sorted(params.keys()):
                values = params[param_id]
                param_name = self.get_param_name(eff_id, param_id)
                min_val = min(values)
                max_val = max(values)

                print(f"│    ├─ 0x{param_id:02X} ({param_name}): "
                      f"rango [{min_val}-{max_val}], {len(values)} valores únicos")
            print("│")

        print("└" + "─" * 69)

        # Generar código Python para el mapeo
        print("\n" + "=" * 70)
        print("CÓDIGO PYTHON PARA EFFECT_IDS")
        print("=" * 70)
        print()
        print("EFFECT_IDS = {")
        for eff_id in sorted(self.discovered.keys()):
            module = self.get_module_name(eff_id)
            print(f"    0x{eff_id:02X}: \"{module}\",")
        print("}")
        print()

        # Generar mapeo de parámetros
        print("PARAM_IDS = {")
        for eff_id in sorted(self.discovered.keys()):
            params = self.discovered[eff_id]
            module = self.get_module_name(eff_id)
            print(f"    0x{eff_id:02X}: {{  # {module}")
            for param_id in sorted(params.keys()):
                values = params[param_id]
                min_val = min(values)
                max_val = max(values)
                print(f"        0x{param_id:02X}: {{'name': 'param_{param_id}', 'min': {min_val}, 'max': {max_val}}},")
            print("    },")
        print("}")


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

    # Buscar puertos MIDI USB o virtuales
    for port in ports:
        lower = port.lower()
        if "virmidi" in lower or "um-one" in lower or "usb" in lower:
            return port

    return ports[0]


def list_ports():
    """Lista puertos MIDI disponibles."""
    require_mido()
    print("\n=== Puertos MIDI de Entrada ===")
    for i, name in enumerate(mido.get_input_names()):
        print(f"  [{i}] {name}")


def capture_realtime(port_name: str = None, output_file: str = None):
    """Captura Effect IDs en tiempo real."""
    require_mido()
    mapper = EffectIDMapper()

    input_port = find_input_port(port_name)

    if not input_port:
        print("Error: No se encontró puerto MIDI de entrada")
        print("Usa --list para ver los puertos disponibles")
        return

    print()
    print("=" * 70)
    print("EFFECT ID MAPPER - Zoom G9.2tt")
    print("=" * 70)
    print(f"Puerto: {input_port}")
    print()
    print("INSTRUCCIONES:")
    print("  1. Abre G9ED y selecciona un patch")
    print("  2. Mueve los knobs de cada módulo (CMP, WAH, AMP, MOD, DLY, REV...)")
    print("  3. Los Effect IDs aparecerán aquí automáticamente")
    print("  4. Presiona Ctrl+C para ver el resumen")
    print()
    print("=" * 70)
    print()

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
        print(f"\nDuración de captura: {elapsed:.1f} segundos")

    finally:
        if log_file:
            log_file.close()
            print(f"Log guardado en: {output_file}")


def analyze_log_file(filepath: str):
    """Analiza un archivo de log existente."""
    mapper = EffectIDMapper()

    print(f"\nAnalizando: {filepath}")
    print("=" * 70)

    # Patrones para extraer datos hex
    hex_pattern = re.compile(r'DATA:\s*([A-Fa-f0-9]+)')
    sysex_pattern = re.compile(r'F052004231([A-Fa-f0-9]+)')

    with open(filepath, 'r') as f:
        for line_num, line in enumerate(f, 1):
            # Buscar comandos 0x31
            match = hex_pattern.search(line)
            if match:
                hex_data = match.group(1)
                try:
                    data = bytes.fromhex(hex_data)
                    parsed = mapper.process_sysex(list(data))

                    if parsed:
                        is_new_effect, is_new_param = mapper.record_discovery(parsed)
                        output = mapper.format_discovery(parsed, is_new_effect, is_new_param)
                        print(f"[Line {line_num:4d}] {output}")

                except ValueError:
                    continue

    mapper.print_summary()


def main():
    parser = argparse.ArgumentParser(
        description="Mapea Effect IDs del Zoom G9.2tt capturando mensajes MIDI 0x31"
    )
    parser.add_argument("-l", "--list", action="store_true",
                       help="Listar puertos MIDI disponibles")
    parser.add_argument("-p", "--port", metavar="NAME",
                       help="Nombre del puerto MIDI a monitorear")
    parser.add_argument("-o", "--output", metavar="FILE",
                       help="Guardar log de capturas a archivo")
    parser.add_argument("-a", "--analyze", metavar="FILE",
                       help="Analizar archivo de log existente")

    args = parser.parse_args()

    if args.list:
        list_ports()
        return

    if args.analyze:
        analyze_log_file(args.analyze)
        return

    capture_realtime(
        port_name=args.port,
        output_file=args.output
    )


if __name__ == "__main__":
    main()
