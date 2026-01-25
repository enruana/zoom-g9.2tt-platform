#!/usr/bin/env python3
"""
Captura completa de sesión MIDI G9.2tt

Captura TODO el tráfico SysEx sin truncar, ideal para analizar bulk loads.
Guarda cada mensaje SysEx como archivo individual + log completo.

Uso:
    python capture_session.py                     # Captura interactiva
    python capture_session.py --port "UM-ONE"    # Puerto específico
    python capture_session.py --all-ports        # Todos los puertos

Requisitos:
    pip install mido python-rtmidi
"""

import argparse
import sys
import time
import os
from datetime import datetime
from pathlib import Path

try:
    import mido
except ImportError:
    print("Error: Se requiere 'mido'")
    print("Instalar con: pip install mido python-rtmidi")
    sys.exit(1)

# Constantes
ZOOM_MANUFACTURER = 0x52
G9TT_MODEL = 0x42

CMD_NAMES = {
    0x11: "READ_REQ",
    0x12: "EDIT_ENTER",
    0x1F: "EDIT_EXIT",
    0x21: "READ_RESP",
    0x28: "WRITE_DATA",
    0x31: "PARAM_CHG",
}


def decode_zoom_sysex(data):
    """Decodifica un mensaje SysEx de Zoom."""
    if len(data) < 4:
        return None

    if data[0] != ZOOM_MANUFACTURER or data[2] != G9TT_MODEL:
        return None

    cmd = data[3]
    info = {
        "cmd": cmd,
        "cmd_name": CMD_NAMES.get(cmd, f"0x{cmd:02X}"),
        "length": len(data) + 2,  # +2 for F0 and F7
    }

    if cmd == 0x11 and len(data) >= 5:  # Read request
        info["patch"] = data[4]
        info["desc"] = f"Read patch {data[4]}"

    elif cmd == 0x21 and len(data) >= 5:  # Read response
        info["patch"] = data[4]
        info["desc"] = f"Patch {data[4]} data ({len(data)+2} bytes)"

    elif cmd == 0x12:  # Enter edit
        info["desc"] = "Enter edit mode"

    elif cmd == 0x1F:  # Exit edit
        info["desc"] = "Exit edit mode"

    elif cmd == 0x28:  # Write data
        info["desc"] = f"Write patch data ({len(data)+2} bytes)"

    elif cmd == 0x31 and len(data) >= 8:  # Parameter change
        effect = data[4]
        param = data[5]
        value = data[6]
        mode = data[7] if len(data) >= 8 else 0

        if param == 0x02 and mode in [0x02, 0x09]:
            # Patch select/store
            info["desc"] = f"Patch {effect} {'select' if mode == 0x02 else 'store'}"
        else:
            info["desc"] = f"Effect 0x{effect:02X} param 0x{param:02X} = {value}"

    else:
        info["desc"] = f"Command 0x{cmd:02X}"

    return info


def format_hex(data, max_bytes=40):
    """Formatea datos como hex, truncando si es necesario."""
    hex_str = " ".join(f"{b:02X}" for b in data[:max_bytes])
    if len(data) > max_bytes:
        hex_str += f" ... (+{len(data)-max_bytes} bytes)"
    return hex_str


class SessionCapture:
    def __init__(self, output_dir, ports=None):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.ports = ports or []
        self.inputs = []
        self.log_file = None
        self.start_time = None
        self.message_count = 0
        self.sysex_count = 0

    def find_midi_ports(self):
        """Encuentra puertos MIDI disponibles."""
        available = mido.get_input_names()

        if not available:
            print("Error: No hay puertos MIDI disponibles")
            return []

        if not self.ports:
            # Usar todos los puertos que parezcan relevantes
            relevant = []
            for port in available:
                lower = port.lower()
                # Incluir UM-ONE, VirMIDI, Wine, USB MIDI
                if any(x in lower for x in ['um-one', 'virmidi', 'wine', 'usb', 'midi']):
                    if 'iac' not in lower:  # Excluir IAC en Mac
                        relevant.append(port)
            return relevant if relevant else available
        else:
            # Buscar puertos que coincidan con los patrones dados
            found = []
            for pattern in self.ports:
                for port in available:
                    if pattern.lower() in port.lower():
                        if port not in found:
                            found.append(port)
            return found

    def connect(self):
        """Conecta a los puertos MIDI."""
        ports = self.find_midi_ports()

        if not ports:
            return False

        print(f"\n{'='*60}")
        print("CAPTURA DE SESIÓN MIDI - Zoom G9.2tt")
        print(f"{'='*60}")
        print(f"\nDirectorio de salida: {self.output_dir}")
        print(f"\nPuertos a capturar:")

        for port_name in ports:
            try:
                inp = mido.open_input(port_name)
                self.inputs.append((port_name, inp))
                print(f"  ✓ {port_name}")
            except Exception as e:
                print(f"  ✗ {port_name}: {e}")

        if not self.inputs:
            print("\nError: No se pudo conectar a ningún puerto")
            return False

        # Abrir log
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        log_path = self.output_dir / f"session_{timestamp}.log"
        self.log_file = open(log_path, 'w')
        print(f"\nLog: {log_path}")

        return True

    def disconnect(self):
        """Cierra conexiones."""
        for name, inp in self.inputs:
            try:
                inp.close()
            except:
                pass

        if self.log_file:
            self.log_file.close()

    def save_sysex(self, data, port_name, info):
        """Guarda un mensaje SysEx a archivo."""
        self.sysex_count += 1

        # Nombre descriptivo
        cmd_name = info.get("cmd_name", "unknown") if info else "raw"
        patch = info.get("patch", "") if info else ""
        patch_str = f"_p{patch}" if patch != "" else ""

        timestamp = datetime.now().strftime("%H%M%S_%f")[:-3]
        port_short = port_name.split()[0].replace(":", "_")

        filename = f"{self.sysex_count:04d}_{timestamp}_{port_short}_{cmd_name}{patch_str}.syx"
        filepath = self.output_dir / filename

        # Escribir con F0 y F7
        full_data = bytes([0xF0] + list(data) + [0xF7])
        filepath.write_bytes(full_data)

        return filename

    def log(self, text):
        """Escribe al log y consola."""
        print(text)
        if self.log_file:
            self.log_file.write(text + "\n")
            self.log_file.flush()

    def process_message(self, port_name, msg):
        """Procesa un mensaje MIDI."""
        self.message_count += 1
        elapsed = time.time() - self.start_time

        if msg.type == 'sysex':
            data = list(msg.data)
            info = decode_zoom_sysex(data)

            # Guardar a archivo
            filename = self.save_sysex(data, port_name, info)

            # Log
            if info:
                desc = info.get("desc", "")
                self.log(f"[{elapsed:8.3f}s] {port_name[:20]:20s} | {info['cmd_name']:12s} | {desc}")
            else:
                self.log(f"[{elapsed:8.3f}s] {port_name[:20]:20s} | SYSEX ({len(data)+2} bytes)")

            # Mostrar hex resumido
            hex_preview = format_hex(data, 30)
            self.log(f"             → F0 {hex_preview} F7")
            self.log(f"             → Saved: {filename}")
            self.log("")
        else:
            # Otros mensajes MIDI (no SysEx)
            self.log(f"[{elapsed:8.3f}s] {port_name[:20]:20s} | {msg.type.upper()}: {msg}")

    def run(self):
        """Ejecuta la captura."""
        self.start_time = time.time()

        self.log(f"\n{'='*60}")
        self.log(f"Captura iniciada: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        self.log(f"{'='*60}")
        self.log("")
        self.log("Esperando mensajes MIDI... (Ctrl+C para detener)")
        self.log("")

        try:
            while True:
                for port_name, inp in self.inputs:
                    for msg in inp.iter_pending():
                        self.process_message(port_name, msg)
                time.sleep(0.001)
        except KeyboardInterrupt:
            pass

        self.log("")
        self.log(f"{'='*60}")
        self.log(f"Captura finalizada: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        self.log(f"  Duración: {time.time() - self.start_time:.1f} segundos")
        self.log(f"  Mensajes totales: {self.message_count}")
        self.log(f"  Archivos SysEx: {self.sysex_count}")
        self.log(f"{'='*60}")


def list_ports():
    """Lista puertos MIDI."""
    print("\n=== Puertos MIDI de Entrada ===")
    for name in mido.get_input_names():
        print(f"  {name}")

    print("\n=== Puertos MIDI de Salida ===")
    for name in mido.get_output_names():
        print(f"  {name}")


def main():
    parser = argparse.ArgumentParser(
        description="Captura completa de sesión MIDI para Zoom G9.2tt"
    )
    parser.add_argument("--list", "-l", action="store_true",
                       help="Listar puertos MIDI disponibles")
    parser.add_argument("--port", "-p", action="append", dest="ports",
                       help="Puerto(s) a capturar (puede repetirse)")
    parser.add_argument("--all-ports", "-a", action="store_true",
                       help="Capturar de todos los puertos MIDI")
    parser.add_argument("--output", "-o", metavar="DIR",
                       default=f"/tmp/g9tt_capture_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                       help="Directorio de salida")

    args = parser.parse_args()

    if args.list:
        list_ports()
        return

    ports = args.ports if not args.all_ports else None

    capture = SessionCapture(args.output, ports)

    if capture.connect():
        try:
            capture.run()
        finally:
            capture.disconnect()


if __name__ == "__main__":
    main()
