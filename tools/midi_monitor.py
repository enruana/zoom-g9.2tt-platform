#!/usr/bin/env python3
"""
Monitor MIDI en tiempo real para capturar tráfico del Zoom G9.2tt.

Muestra todos los mensajes MIDI recibidos y puede guardarlos a archivo.

Requisitos:
    pip install mido python-rtmidi

Uso:
    python midi_monitor.py                    # Monitor interactivo
    python midi_monitor.py --output log.txt   # Guardar a archivo
    python midi_monitor.py --sysex-only       # Solo mensajes SysEx
    python midi_monitor.py --save-sysex dir/  # Guardar SysEx a archivos .syx
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
    print("Error: Se requiere la biblioteca 'mido'")
    print("Instalar con: pip install mido python-rtmidi")
    sys.exit(1)


def format_sysex(data: list) -> str:
    """Formatea datos SysEx para mostrar."""
    hex_str = " ".join(f"{b:02X}" for b in data)

    # Agregar interpretación básica
    interpretation = ""
    if len(data) >= 2:
        if data[0] == 0x7E:
            interpretation = " [Universal Non-RT]"
        elif data[0] == 0x7F:
            interpretation = " [Universal RT]"
        elif data[0] == 0x52:
            interpretation = " [Zoom]"
            if len(data) >= 4:
                interpretation += f" Model:{data[2]:02X} Cmd:{data[3]:02X}"

    return f"F0 {hex_str} F7{interpretation}"


def format_message(msg, start_time: float) -> str:
    """Formatea un mensaje MIDI para mostrar."""
    elapsed = time.time() - start_time
    timestamp = f"[{elapsed:8.3f}s]"

    if msg.type == 'sysex':
        data = list(msg.data)
        hex_data = format_sysex(data)
        return f"{timestamp} SYSEX ({len(data)+2} bytes): {hex_data}"

    elif msg.type == 'note_on':
        return f"{timestamp} NOTE ON:  ch={msg.channel} note={msg.note} vel={msg.velocity}"

    elif msg.type == 'note_off':
        return f"{timestamp} NOTE OFF: ch={msg.channel} note={msg.note}"

    elif msg.type == 'control_change':
        return f"{timestamp} CC:       ch={msg.channel} cc={msg.control} val={msg.value}"

    elif msg.type == 'program_change':
        return f"{timestamp} PC:       ch={msg.channel} program={msg.program}"

    elif msg.type == 'pitchwheel':
        return f"{timestamp} PITCH:    ch={msg.channel} value={msg.pitch}"

    else:
        return f"{timestamp} {msg.type.upper()}: {msg}"


def list_ports():
    """Lista puertos MIDI disponibles."""
    print("\n=== Puertos MIDI de Entrada ===")
    for i, name in enumerate(mido.get_input_names()):
        print(f"  [{i}] {name}")

    print("\n=== Puertos MIDI de Salida ===")
    for i, name in enumerate(mido.get_output_names()):
        print(f"  [{i}] {name}")


def find_input_port(port_name: str = None) -> str:
    """Encuentra un puerto MIDI de entrada."""
    ports = mido.get_input_names()

    if not ports:
        return None

    if port_name:
        for port in ports:
            if port_name.lower() in port.lower():
                return port
        return None

    # Buscar USB MIDI
    for port in ports:
        lower = port.lower()
        if "usb" in lower or "midi" in lower:
            if "iac" not in lower:
                return port

    return ports[0]


def save_sysex_file(data: list, output_dir: str, counter: int) -> str:
    """Guarda mensaje SysEx a un archivo .syx"""
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"sysex_{timestamp}_{counter:04d}.syx"
    filepath = Path(output_dir) / filename

    # Incluir F0 y F7
    full_data = bytes([0xF0] + data + [0xF7])
    filepath.write_bytes(full_data)

    return str(filepath)


def monitor(port_name: str = None,
            sysex_only: bool = False,
            output_file: str = None,
            save_sysex_dir: str = None):
    """Monitorea tráfico MIDI en tiempo real."""

    input_port = find_input_port(port_name)

    if not input_port:
        print("Error: No se encontró puerto MIDI de entrada")
        print("Usa --list para ver los puertos disponibles")
        return

    print(f"\n{'='*60}")
    print(f"MIDI Monitor - Zoom G9.2tt")
    print(f"{'='*60}")
    print(f"Puerto: {input_port}")
    print(f"Filtro: {'Solo SysEx' if sysex_only else 'Todos los mensajes'}")
    if output_file:
        print(f"Log: {output_file}")
    if save_sysex_dir:
        print(f"Guardando SysEx en: {save_sysex_dir}/")
    print(f"\nPresiona Ctrl+C para detener\n")
    print(f"{'='*60}\n")

    log_file = open(output_file, 'w') if output_file else None
    sysex_counter = 0
    start_time = time.time()
    message_count = 0

    try:
        with mido.open_input(input_port) as midi_in:
            for msg in midi_in:
                # Filtrar si es necesario
                if sysex_only and msg.type != 'sysex':
                    continue

                message_count += 1
                formatted = format_message(msg, start_time)

                # Mostrar en pantalla
                print(formatted)

                # Guardar a log
                if log_file:
                    log_file.write(formatted + "\n")
                    log_file.flush()

                # Guardar SysEx a archivo individual
                if save_sysex_dir and msg.type == 'sysex':
                    sysex_counter += 1
                    filepath = save_sysex_file(list(msg.data), save_sysex_dir, sysex_counter)
                    print(f"         -> Guardado: {filepath}")

    except KeyboardInterrupt:
        print(f"\n\n{'='*60}")
        print(f"Monitor detenido")
        print(f"Mensajes capturados: {message_count}")
        if sysex_counter > 0:
            print(f"Archivos SysEx guardados: {sysex_counter}")
        print(f"Duración: {time.time() - start_time:.1f} segundos")
        print(f"{'='*60}")

    finally:
        if log_file:
            log_file.close()


def main():
    parser = argparse.ArgumentParser(
        description="Monitor MIDI para captura de tráfico del Zoom G9.2tt"
    )
    parser.add_argument("-l", "--list", action="store_true",
                       help="Listar puertos MIDI disponibles")
    parser.add_argument("-p", "--port", metavar="NAME",
                       help="Nombre del puerto MIDI a monitorear")
    parser.add_argument("-s", "--sysex-only", action="store_true",
                       help="Mostrar solo mensajes SysEx")
    parser.add_argument("-o", "--output", metavar="FILE",
                       help="Guardar log a archivo")
    parser.add_argument("--save-sysex", metavar="DIR",
                       help="Guardar cada mensaje SysEx a un archivo .syx en el directorio especificado")

    args = parser.parse_args()

    if args.list:
        list_ports()
        return

    monitor(
        port_name=args.port,
        sysex_only=args.sysex_only,
        output_file=args.output,
        save_sysex_dir=args.save_sysex
    )


if __name__ == "__main__":
    main()
