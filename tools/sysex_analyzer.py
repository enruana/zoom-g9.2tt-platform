#!/usr/bin/env python3
"""
Analizador de mensajes SysEx para Zoom G9.2tt

Uso:
    python sysex_analyzer.py <archivo.syx>
    python sysex_analyzer.py <archivo.syx> --verbose
    python sysex_analyzer.py <archivo.syx> --compare <otro.syx>
"""

import sys
import argparse
from pathlib import Path
from typing import Optional

# Manufacturer IDs conocidos
MANUFACTURERS = {
    0x52: "Zoom",
    0x7E: "Universal (Non-Real Time)",
    0x7F: "Universal (Real Time)",
}

# Device IDs conocidos de pedales Zoom
ZOOM_DEVICES = {
    0x58: "MS-50G",
    0x5F: "MS-60B",
    0x61: "MS-70CDR",
    0x6E: "G1Four/G1XFour",
    # G9.2tt: Por descubrir
}

# Comandos conocidos de pedales Zoom
ZOOM_COMMANDS = {
    0x28: "Send Patch Data",
    0x29: "Request Current Patch",
    0x31: "Edit Parameter",
    0x32: "Store Patch",
    0x50: "Enter Edit Mode",
    0x51: "Exit Edit Mode",
    0x52: "Enter PC Mode",
    0x53: "Exit PC Mode",
    0x64: "System Command",
}


def parse_sysex(data: bytes) -> dict:
    """Parsea un mensaje SysEx y extrae sus componentes."""
    if len(data) < 2:
        return {"error": "Mensaje muy corto", "raw": data.hex(" ")}

    if data[0] != 0xF0:
        return {"error": "No comienza con F0", "raw": data.hex(" ")}

    if data[-1] != 0xF7:
        return {"error": "No termina con F7", "raw": data.hex(" ")}

    result = {
        "raw": data.hex(" ").upper(),
        "length": len(data),
        "manufacturer_byte": hex(data[1]),
        "manufacturer": MANUFACTURERS.get(data[1], "Unknown"),
    }

    # Universal SysEx
    if data[1] in (0x7E, 0x7F):
        result["type"] = "Universal SysEx"
        if len(data) >= 6:
            result["device_id"] = hex(data[2])
            result["sub_id1"] = hex(data[3])
            result["sub_id2"] = hex(data[4])

            # Identity Request
            if data[3] == 0x06 and data[4] == 0x01:
                result["message"] = "Identity Request"
            # Identity Reply
            elif data[3] == 0x06 and data[4] == 0x02:
                result["message"] = "Identity Reply"
                if len(data) >= 10:
                    result["reply_manufacturer"] = hex(data[5])
                    result["reply_manufacturer_name"] = MANUFACTURERS.get(data[5], "Unknown")
                    result["model_id"] = hex(data[6])
                    result["model_name"] = ZOOM_DEVICES.get(data[6], "Unknown (G9.2tt?)")

    # Zoom SysEx
    elif data[1] == 0x52:
        result["type"] = "Zoom SysEx"
        if len(data) >= 4:
            result["device_id"] = hex(data[2])
            result["model_id"] = hex(data[3])
            result["model_name"] = ZOOM_DEVICES.get(data[3], "Unknown (G9.2tt?)")

        if len(data) >= 5:
            result["command"] = hex(data[4])
            result["command_name"] = ZOOM_COMMANDS.get(data[4], "Unknown")

        if len(data) > 5:
            result["payload_length"] = len(data) - 6  # Sin F0, mfr, dev, model, cmd, F7
            result["payload"] = data[5:-1].hex(" ").upper()

    return result


def extract_messages(data: bytes) -> list:
    """Extrae todos los mensajes SysEx de un buffer."""
    messages = []
    i = 0

    while i < len(data):
        if data[i] == 0xF0:
            try:
                end = data.index(0xF7, i) + 1
                messages.append(data[i:end])
                i = end
            except ValueError:
                # F7 no encontrado, tomar el resto
                messages.append(data[i:])
                break
        else:
            i += 1

    return messages


def analyze_file(filepath: str, verbose: bool = False) -> list:
    """Analiza un archivo .syx y retorna lista de mensajes parseados."""
    path = Path(filepath)

    if not path.exists():
        print(f"Error: Archivo no encontrado: {filepath}")
        sys.exit(1)

    data = path.read_bytes()
    messages = extract_messages(data)

    print(f"\n{'='*60}")
    print(f"Archivo: {path.name}")
    print(f"Tamaño: {len(data)} bytes")
    print(f"Mensajes encontrados: {len(messages)}")
    print(f"{'='*60}")

    results = []
    for idx, msg in enumerate(messages, 1):
        parsed = parse_sysex(msg)
        results.append(parsed)

        print(f"\n--- Mensaje {idx} ({parsed['length']} bytes) ---")

        if "error" in parsed:
            print(f"  ERROR: {parsed['error']}")
            print(f"  Raw: {parsed['raw']}")
            continue

        print(f"  Tipo: {parsed.get('type', 'Unknown')}")
        print(f"  Manufacturer: {parsed['manufacturer']} ({parsed['manufacturer_byte']})")

        if "device_id" in parsed:
            print(f"  Device ID: {parsed['device_id']}")

        if "model_id" in parsed:
            print(f"  Model ID: {parsed['model_id']} ({parsed.get('model_name', 'Unknown')})")

        if "message" in parsed:
            print(f"  Message: {parsed['message']}")

        if "command" in parsed:
            print(f"  Command: {parsed['command']} ({parsed.get('command_name', 'Unknown')})")

        if "payload_length" in parsed:
            print(f"  Payload: {parsed['payload_length']} bytes")

        if verbose and "payload" in parsed:
            print(f"  Payload data: {parsed['payload']}")

        if verbose or len(messages) <= 3:
            print(f"  Raw: {parsed['raw']}")

    return results


def compare_files(file1: str, file2: str):
    """Compara dos archivos SysEx byte por byte."""
    data1 = Path(file1).read_bytes()
    data2 = Path(file2).read_bytes()

    print(f"\n{'='*60}")
    print(f"Comparando:")
    print(f"  A: {file1} ({len(data1)} bytes)")
    print(f"  B: {file2} ({len(data2)} bytes)")
    print(f"{'='*60}")

    min_len = min(len(data1), len(data2))
    differences = []

    for i in range(min_len):
        if data1[i] != data2[i]:
            differences.append({
                "offset": i,
                "hex_offset": hex(i),
                "byte_a": hex(data1[i]),
                "byte_b": hex(data2[i]),
            })

    if len(data1) != len(data2):
        print(f"\n  Longitud diferente: A={len(data1)}, B={len(data2)}")

    if differences:
        print(f"\n  Diferencias encontradas: {len(differences)}")
        print(f"\n  {'Offset':<10} {'Hex':<10} {'A':<6} {'B':<6}")
        print(f"  {'-'*32}")
        for d in differences[:50]:  # Mostrar máximo 50
            print(f"  {d['offset']:<10} {d['hex_offset']:<10} {d['byte_a']:<6} {d['byte_b']:<6}")

        if len(differences) > 50:
            print(f"  ... y {len(differences) - 50} diferencias más")
    else:
        print("\n  Los archivos son idénticos en los bytes comunes")


def main():
    parser = argparse.ArgumentParser(
        description="Analizador de mensajes SysEx para Zoom G9.2tt"
    )
    parser.add_argument("file", help="Archivo .syx a analizar")
    parser.add_argument("-v", "--verbose", action="store_true",
                       help="Mostrar payload completo")
    parser.add_argument("-c", "--compare", metavar="FILE",
                       help="Comparar con otro archivo .syx")

    args = parser.parse_args()

    if args.compare:
        compare_files(args.file, args.compare)
    else:
        analyze_file(args.file, args.verbose)


if __name__ == "__main__":
    main()
