#!/usr/bin/env python3
"""
Captura MIDI Bidireccional para Zoom G9.2tt

Captura tráfico en AMBAS direcciones:
- G9ED → Pedal (comandos)
- Pedal → G9ED (respuestas)

Usa ALSA sequencer para conectarse a múltiples puertos.

Uso:
    python capture_bidirectional.py --output ~/bulk_capture

Requisitos:
    pip install mido python-rtmidi
"""

import argparse
import sys
import time
import subprocess
import threading
import signal
from datetime import datetime
from pathlib import Path

try:
    import mido
    # Forzar backend ALSA en Linux
    if sys.platform == 'linux':
        mido.set_backend('mido.backends.rtmidi/LINUX_ALSA')
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


def get_alsa_connections():
    """Obtiene conexiones ALSA usando aconnect."""
    try:
        result = subprocess.run(['aconnect', '-l'], capture_output=True, text=True)
        return result.stdout
    except:
        return ""


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
        "length": len(data) + 2,
    }

    if cmd == 0x11 and len(data) >= 5:
        info["patch"] = data[4]
        info["desc"] = f"Request patch {data[4]}"
    elif cmd == 0x21 and len(data) >= 5:
        info["patch"] = data[4]
        info["desc"] = f"Response patch {data[4]} ({len(data)+2} bytes)"
    elif cmd == 0x12:
        info["desc"] = "Enter edit mode"
    elif cmd == 0x1F:
        info["desc"] = "Exit edit mode"
    elif cmd == 0x28:
        info["desc"] = f"Write patch data ({len(data)+2} bytes)"
    elif cmd == 0x31 and len(data) >= 8:
        effect = data[4]
        param = data[5]
        value = data[6]
        mode = data[7]
        if param == 0x02 and mode in [0x02, 0x09]:
            info["desc"] = f"Patch {effect} {'select' if mode == 0x02 else 'store'}"
        else:
            info["desc"] = f"Effect 0x{effect:02X} param 0x{param:02X} = {value}"
    else:
        info["desc"] = f"Command 0x{cmd:02X}"

    return info


class BidirectionalCapture:
    def __init__(self, output_dir):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.log_file = None
        self.start_time = None
        self.message_count = 0
        self.sysex_count = 0
        self.running = False
        self.lock = threading.Lock()

        # Puertos
        self.inputs = []

    def find_ports(self):
        """Encuentra todos los puertos MIDI relevantes."""
        all_inputs = mido.get_input_names()

        print("\n=== Puertos MIDI disponibles ===")
        for p in all_inputs:
            print(f"  {p}")

        # Buscar puertos relevantes
        ports_to_open = []
        for port in all_inputs:
            lower = port.lower()
            # Incluir UM-ONE (hardware) y Wine (software)
            if 'um-one' in lower or 'wine' in lower:
                ports_to_open.append(port)

        return ports_to_open

    def connect(self):
        """Conecta a los puertos MIDI."""
        ports = self.find_ports()

        if not ports:
            print("\nError: No se encontraron puertos MIDI relevantes")
            print("Asegúrate de que G9ED esté corriendo y UM-ONE conectado")
            return False

        print(f"\n{'='*60}")
        print("CAPTURA BIDIRECCIONAL - Zoom G9.2tt")
        print(f"{'='*60}")
        print(f"\nDirectorio: {self.output_dir}")
        print(f"\nConectando a puertos:")

        for port_name in ports:
            try:
                inp = mido.open_input(port_name)
                direction = "HW→APP" if "um-one" in port_name.lower() else "APP→HW"
                self.inputs.append((port_name, inp, direction))
                print(f"  ✓ {port_name} [{direction}]")
            except Exception as e:
                print(f"  ✗ {port_name}: {e}")

        if not self.inputs:
            print("\nError: No se pudo conectar a ningún puerto")
            return False

        # Abrir log
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        log_path = self.output_dir / f"bidirectional_{timestamp}.log"
        self.log_file = open(log_path, 'w')
        print(f"\nLog: {log_path}")

        return True

    def disconnect(self):
        """Cierra conexiones."""
        for name, inp, _ in self.inputs:
            try:
                inp.close()
            except:
                pass
        if self.log_file:
            self.log_file.close()

    def log(self, text):
        """Escribe al log y consola (thread-safe)."""
        with self.lock:
            print(text)
            if self.log_file:
                self.log_file.write(text + "\n")
                self.log_file.flush()

    def save_sysex(self, data, direction, info):
        """Guarda mensaje SysEx a archivo."""
        with self.lock:
            self.sysex_count += 1
            count = self.sysex_count

        cmd_name = info.get("cmd_name", "unknown") if info else "raw"
        patch = info.get("patch", "") if info else ""
        patch_str = f"_p{patch:02d}" if patch != "" else ""

        timestamp = datetime.now().strftime("%H%M%S_%f")[:-3]
        dir_short = "tx" if "APP" in direction else "rx"

        filename = f"{count:04d}_{timestamp}_{dir_short}_{cmd_name}{patch_str}.syx"
        filepath = self.output_dir / filename

        full_data = bytes([0xF0] + list(data) + [0xF7])
        filepath.write_bytes(full_data)

        return filename

    def format_hex(self, data, max_bytes=50):
        """Formatea datos como hex."""
        hex_str = " ".join(f"{b:02X}" for b in data[:max_bytes])
        if len(data) > max_bytes:
            hex_str += f" ... (+{len(data)-max_bytes} bytes)"
        return hex_str

    def process_message(self, port_name, msg, direction):
        """Procesa un mensaje MIDI."""
        with self.lock:
            self.message_count += 1

        elapsed = time.time() - self.start_time

        if msg.type == 'sysex':
            data = list(msg.data)
            info = decode_zoom_sysex(data)

            # Guardar archivo
            filename = self.save_sysex(data, direction, info)

            # Log
            if info:
                self.log(f"[{elapsed:8.3f}s] {direction:8s} | {info['cmd_name']:12s} | {info.get('desc', '')}")
            else:
                self.log(f"[{elapsed:8.3f}s] {direction:8s} | SYSEX ({len(data)+2} bytes)")

            hex_preview = self.format_hex(data)
            self.log(f"             F0 {hex_preview} F7")
            self.log(f"             → {filename}")
            self.log("")
        else:
            self.log(f"[{elapsed:8.3f}s] {direction:8s} | {msg.type.upper()}")

    def listen_port(self, port_name, inp, direction):
        """Thread para escuchar un puerto."""
        while self.running:
            try:
                for msg in inp.iter_pending():
                    self.process_message(port_name, msg, direction)
            except Exception as e:
                if self.running:
                    self.log(f"Error en {port_name}: {e}")
            time.sleep(0.001)

    def run(self):
        """Ejecuta la captura."""
        self.start_time = time.time()
        self.running = True

        self.log(f"\n{'='*60}")
        self.log(f"Captura iniciada: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        self.log(f"{'='*60}")
        self.log("")
        self.log("Esperando mensajes... (Ctrl+C para detener)")
        self.log("")
        self.log("Direcciones:")
        self.log("  APP→HW = G9ED enviando al pedal (comandos)")
        self.log("  HW→APP = Pedal respondiendo a G9ED (respuestas)")
        self.log("")

        # Iniciar threads para cada puerto
        threads = []
        for port_name, inp, direction in self.inputs:
            t = threading.Thread(target=self.listen_port, args=(port_name, inp, direction), daemon=True)
            t.start()
            threads.append(t)

        try:
            while True:
                time.sleep(0.1)
        except KeyboardInterrupt:
            pass
        finally:
            self.running = False
            time.sleep(0.1)

            self.log("")
            self.log(f"{'='*60}")
            self.log(f"Captura finalizada: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            self.log(f"  Duración: {time.time() - self.start_time:.1f} segundos")
            self.log(f"  Mensajes: {self.message_count}")
            self.log(f"  Archivos SysEx: {self.sysex_count}")
            self.log(f"{'='*60}")


def main():
    parser = argparse.ArgumentParser(
        description="Captura MIDI bidireccional para Zoom G9.2tt"
    )
    parser.add_argument("--output", "-o", metavar="DIR",
                       default=f"/tmp/g9tt_bidir_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                       help="Directorio de salida")
    parser.add_argument("--list", "-l", action="store_true",
                       help="Listar puertos y conexiones ALSA")

    args = parser.parse_args()

    if args.list:
        print("\n=== Puertos MIDI (mido) ===")
        print("Inputs:")
        for p in mido.get_input_names():
            print(f"  {p}")
        print("Outputs:")
        for p in mido.get_output_names():
            print(f"  {p}")
        print("\n=== Conexiones ALSA ===")
        print(get_alsa_connections())
        return

    capture = BidirectionalCapture(args.output)

    if capture.connect():
        try:
            capture.run()
        finally:
            capture.disconnect()


if __name__ == "__main__":
    main()
