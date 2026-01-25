#!/usr/bin/env python3
"""
MIDI Proxy Bidireccional para Zoom G9.2tt

Captura TODO el tráfico MIDI entre G9ED y el pedal, sin truncar.
Se coloca como "man-in-the-middle" entre el software y el hardware.

Arquitectura:
    G9ED (Wine) → VirMIDI → [PROXY] → UM-ONE → G9.2tt
    G9ED (Wine) ← VirMIDI ← [PROXY] ← UM-ONE ← G9.2tt

Uso:
    python midi_proxy.py --list                    # Ver puertos disponibles
    python midi_proxy.py --app VirMIDI --hw UM-ONE # Iniciar proxy
    python midi_proxy.py --app VirMIDI --hw UM-ONE --output capture.log

Requisitos:
    pip install mido python-rtmidi
"""

import argparse
import sys
import time
import os
import threading
from datetime import datetime
from pathlib import Path
from collections import deque

try:
    import mido
except ImportError:
    print("Error: Se requiere 'mido'")
    print("Instalar con: pip install mido python-rtmidi")
    sys.exit(1)


# Constantes del protocolo Zoom
ZOOM_MANUFACTURER = 0x52
G9TT_MODEL = 0x42

# Nombres de comandos conocidos
CMD_NAMES = {
    0x11: "READ_PATCH_REQ",
    0x12: "ENTER_EDIT",
    0x1F: "EXIT_EDIT",
    0x21: "READ_PATCH_RESP",
    0x28: "WRITE_PATCH",
    0x31: "PARAM_CHANGE",
}


class MidiProxy:
    def __init__(self, app_port_name, hw_port_name, output_file=None, save_sysex_dir=None):
        self.app_port_name = app_port_name
        self.hw_port_name = hw_port_name
        self.output_file = output_file
        self.save_sysex_dir = save_sysex_dir

        self.app_in = None
        self.app_out = None
        self.hw_in = None
        self.hw_out = None

        self.log_file = None
        self.sysex_counter = 0
        self.start_time = None
        self.message_count = 0
        self.running = False

        # Buffer para log thread-safe
        self.log_buffer = deque()
        self.log_lock = threading.Lock()

    def find_port(self, pattern, port_list):
        """Busca un puerto que contenga el patrón."""
        for port in port_list:
            if pattern.lower() in port.lower():
                return port
        return None

    def connect(self):
        """Conecta a los puertos MIDI."""
        inputs = mido.get_input_names()
        outputs = mido.get_output_names()

        print(f"\n{'='*60}")
        print("MIDI PROXY - Zoom G9.2tt")
        print(f"{'='*60}")

        # Buscar puertos de la aplicación (G9ED vía VirMIDI)
        app_in_name = self.find_port(self.app_port_name, inputs)
        app_out_name = self.find_port(self.app_port_name, outputs)

        if not app_in_name or not app_out_name:
            print(f"Error: No se encontró puerto de aplicación '{self.app_port_name}'")
            print(f"  Puertos de entrada: {inputs}")
            print(f"  Puertos de salida: {outputs}")
            return False

        # Buscar puertos del hardware (UM-ONE)
        hw_in_name = self.find_port(self.hw_port_name, inputs)
        hw_out_name = self.find_port(self.hw_port_name, outputs)

        if not hw_in_name or not hw_out_name:
            print(f"Error: No se encontró puerto de hardware '{self.hw_port_name}'")
            print(f"  Puertos de entrada: {inputs}")
            print(f"  Puertos de salida: {outputs}")
            return False

        print(f"\nConexiones:")
        print(f"  App (G9ED)  IN:  {app_in_name}")
        print(f"  App (G9ED)  OUT: {app_out_name}")
        print(f"  Hardware    IN:  {hw_in_name}")
        print(f"  Hardware    OUT: {hw_out_name}")

        # Abrir puertos
        try:
            self.app_in = mido.open_input(app_in_name)
            self.app_out = mido.open_output(app_out_name)
            self.hw_in = mido.open_input(hw_in_name)
            self.hw_out = mido.open_output(hw_out_name)
        except Exception as e:
            print(f"Error abriendo puertos: {e}")
            return False

        # Preparar archivo de log
        if self.output_file:
            self.log_file = open(self.output_file, 'w')
            print(f"\nLog: {self.output_file}")

        # Preparar directorio de SysEx
        if self.save_sysex_dir:
            Path(self.save_sysex_dir).mkdir(parents=True, exist_ok=True)
            print(f"SysEx dir: {self.save_sysex_dir}/")

        return True

    def disconnect(self):
        """Cierra todas las conexiones."""
        for port in [self.app_in, self.app_out, self.hw_in, self.hw_out]:
            if port:
                try:
                    port.close()
                except:
                    pass

        if self.log_file:
            self.log_file.close()

    def format_sysex(self, data, direction):
        """Formatea un mensaje SysEx para el log."""
        hex_str = " ".join(f"{b:02X}" for b in data)

        # Interpretar si es mensaje Zoom
        interpretation = ""
        if len(data) >= 4 and data[0] == ZOOM_MANUFACTURER and data[2] == G9TT_MODEL:
            cmd = data[3]
            cmd_name = CMD_NAMES.get(cmd, f"UNKNOWN_{cmd:02X}")
            interpretation = f" [{cmd_name}]"

            # Agregar info específica del comando
            if cmd == 0x11 and len(data) >= 5:  # Read request
                interpretation += f" patch={data[4]}"
            elif cmd == 0x21 and len(data) >= 5:  # Read response
                interpretation += f" patch={data[4]} ({len(data)} bytes)"
            elif cmd == 0x28:  # Write
                interpretation += f" ({len(data)} bytes)"
            elif cmd == 0x31 and len(data) >= 7:  # Param change
                effect_id = data[4]
                param_id = data[5]
                value = data[6]
                interpretation += f" effect=0x{effect_id:02X} param=0x{param_id:02X} value={value}"

        return f"F0 {hex_str} F7{interpretation}"

    def log_message(self, direction, msg):
        """Registra un mensaje MIDI."""
        elapsed = time.time() - self.start_time
        timestamp = f"[{elapsed:10.3f}s]"

        if msg.type == 'sysex':
            data = list(msg.data)
            formatted = self.format_sysex(data, direction)
            line = f"{timestamp} {direction:8s} SYSEX ({len(data)+2:3d} bytes): {formatted}"

            # Guardar SysEx a archivo si está habilitado
            if self.save_sysex_dir:
                self.save_sysex_file(data, direction)
        else:
            line = f"{timestamp} {direction:8s} {msg.type.upper()}: {msg}"

        # Imprimir
        print(line)

        # Guardar a archivo
        if self.log_file:
            self.log_file.write(line + "\n")
            self.log_file.flush()

        self.message_count += 1

    def save_sysex_file(self, data, direction):
        """Guarda un mensaje SysEx a archivo."""
        self.sysex_counter += 1
        timestamp = datetime.now().strftime("%H%M%S_%f")[:-3]

        # Determinar nombre del comando
        cmd_name = "unknown"
        if len(data) >= 4 and data[0] == ZOOM_MANUFACTURER and data[2] == G9TT_MODEL:
            cmd = data[3]
            cmd_name = CMD_NAMES.get(cmd, f"cmd{cmd:02X}").lower()

        filename = f"{self.sysex_counter:04d}_{timestamp}_{direction}_{cmd_name}.syx"
        filepath = Path(self.save_sysex_dir) / filename

        full_data = bytes([0xF0] + data + [0xF7])
        filepath.write_bytes(full_data)

    def forward_app_to_hw(self):
        """Thread: Retransmite mensajes de G9ED al pedal."""
        while self.running:
            try:
                for msg in self.app_in.iter_pending():
                    self.log_message("APP→HW", msg)
                    self.hw_out.send(msg)
            except Exception as e:
                if self.running:
                    print(f"Error app→hw: {e}")
            time.sleep(0.001)

    def forward_hw_to_app(self):
        """Thread: Retransmite mensajes del pedal a G9ED."""
        while self.running:
            try:
                for msg in self.hw_in.iter_pending():
                    self.log_message("HW→APP", msg)
                    self.app_out.send(msg)
            except Exception as e:
                if self.running:
                    print(f"Error hw→app: {e}")
            time.sleep(0.001)

    def run(self):
        """Ejecuta el proxy."""
        self.start_time = time.time()
        self.running = True

        print(f"\n{'='*60}")
        print("Proxy activo - Presiona Ctrl+C para detener")
        print(f"{'='*60}\n")

        # Iniciar threads de retransmisión
        t1 = threading.Thread(target=self.forward_app_to_hw, daemon=True)
        t2 = threading.Thread(target=self.forward_hw_to_app, daemon=True)
        t1.start()
        t2.start()

        try:
            while True:
                time.sleep(0.1)
        except KeyboardInterrupt:
            pass
        finally:
            self.running = False
            time.sleep(0.1)  # Esperar a que terminen los threads

            print(f"\n{'='*60}")
            print("Proxy detenido")
            print(f"  Mensajes capturados: {self.message_count}")
            print(f"  Duración: {time.time() - self.start_time:.1f}s")
            if self.sysex_counter > 0:
                print(f"  Archivos SysEx: {self.sysex_counter}")
            print(f"{'='*60}")


def list_ports():
    """Lista todos los puertos MIDI disponibles."""
    print("\n=== Puertos MIDI de Entrada ===")
    for name in mido.get_input_names():
        print(f"  {name}")

    print("\n=== Puertos MIDI de Salida ===")
    for name in mido.get_output_names():
        print(f"  {name}")

    print("\nEjemplo de uso:")
    print("  python midi_proxy.py --app 'VirMIDI' --hw 'UM-ONE'")


def main():
    parser = argparse.ArgumentParser(
        description="MIDI Proxy bidireccional para captura de tráfico G9.2tt"
    )
    parser.add_argument("--list", "-l", action="store_true",
                       help="Listar puertos MIDI disponibles")
    parser.add_argument("--app", "-a", metavar="PORT",
                       help="Puerto de la aplicación (ej: VirMIDI)")
    parser.add_argument("--hw", "-H", metavar="PORT",
                       help="Puerto del hardware (ej: UM-ONE)")
    parser.add_argument("--output", "-o", metavar="FILE",
                       help="Archivo de log de salida")
    parser.add_argument("--save-sysex", "-s", metavar="DIR",
                       help="Guardar cada SysEx a un archivo en el directorio")

    args = parser.parse_args()

    if args.list:
        list_ports()
        return

    if not args.app or not args.hw:
        print("Error: Se requieren --app y --hw")
        print("Usa --list para ver los puertos disponibles")
        parser.print_help()
        return

    proxy = MidiProxy(
        app_port_name=args.app,
        hw_port_name=args.hw,
        output_file=args.output,
        save_sysex_dir=args.save_sysex
    )

    if proxy.connect():
        try:
            proxy.run()
        finally:
            proxy.disconnect()


if __name__ == "__main__":
    main()
