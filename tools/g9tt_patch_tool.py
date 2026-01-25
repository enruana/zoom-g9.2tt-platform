#!/usr/bin/env python3
"""
Herramienta de análisis y manipulación de patches para Zoom G9.2tt

Uso:
    python g9tt_patch_tool.py analyze <archivo.syx>
    python g9tt_patch_tool.py decode <archivo.syx>
    python g9tt_patch_tool.py compare <archivo1.syx> <archivo2.syx>
    python g9tt_patch_tool.py setname <archivo.syx> <nuevo_nombre> <salida.syx>
"""

import sys
import argparse
from pathlib import Path


# Constantes del protocolo G9.2tt
ZOOM_MANUFACTURER = 0x52
G9TT_MODEL_ID = 0x42
CMD_READ_PATCH = 0x11
CMD_READ_RESPONSE = 0x21
PATCH_TOTAL_SIZE = 268
PATCH_PAYLOAD_SIZE = 261
NIBBLE_DATA_SIZE = 256
DECODED_DATA_SIZE = 128
NAME_OFFSET = 65
NAME_LENGTH = 10


def decode_nibbles(nibble_data: bytes) -> bytes:
    """Decodifica datos en formato nibble a bytes normales."""
    decoded = []
    for i in range(0, len(nibble_data), 2):
        high = nibble_data[i] & 0x0F
        low = nibble_data[i + 1] & 0x0F
        decoded.append((high << 4) | low)
    return bytes(decoded)


def encode_nibbles(data: bytes) -> bytes:
    """Codifica bytes normales a formato nibble."""
    encoded = []
    for byte in data:
        high = (byte >> 4) & 0x0F
        low = byte & 0x0F
        encoded.extend([high, low])
    return bytes(encoded)


def parse_patch_sysex(data: bytes) -> dict:
    """Parsea un mensaje SysEx de patch del G9.2tt."""
    if len(data) != PATCH_TOTAL_SIZE:
        raise ValueError(f"Tamaño incorrecto: {len(data)} (esperado {PATCH_TOTAL_SIZE})")

    if data[0] != 0xF0 or data[-1] != 0xF7:
        raise ValueError("No es un mensaje SysEx válido")

    if data[1] != ZOOM_MANUFACTURER:
        raise ValueError(f"Manufacturer ID incorrecto: {data[1]:02x}")

    if data[3] != G9TT_MODEL_ID:
        raise ValueError(f"Model ID incorrecto: {data[3]:02x}")

    result = {
        "manufacturer": data[1],
        "device_id": data[2],
        "model_id": data[3],
        "command": data[4],
        "patch_number": data[5],
        "payload": data[6:-1],
    }

    # Extraer secciones del payload
    payload = result["payload"]
    result["nibble_data"] = payload[:NIBBLE_DATA_SIZE]
    result["special_bytes"] = payload[NIBBLE_DATA_SIZE:]

    # Decodificar datos
    result["decoded_data"] = decode_nibbles(result["nibble_data"])

    # Extraer nombre
    decoded = result["decoded_data"]
    name_bytes = decoded[NAME_OFFSET:NAME_OFFSET + NAME_LENGTH]
    result["name"] = name_bytes.rstrip(b"\x00").decode("ascii", errors="replace")

    return result


def analyze_patch(filepath: str):
    """Analiza un archivo de patch."""
    data = Path(filepath).read_bytes()
    patch = parse_patch_sysex(data)

    print(f"\n{'='*60}")
    print(f"ANÁLISIS DE PATCH: {filepath}")
    print(f"{'='*60}")

    print(f"\n[Header SysEx]")
    print(f"  Manufacturer: 0x{patch['manufacturer']:02X} (Zoom)")
    print(f"  Device ID:    0x{patch['device_id']:02X}")
    print(f"  Model ID:     0x{patch['model_id']:02X} (G9.2tt)")
    print(f"  Command:      0x{patch['command']:02X} ({'Read Response' if patch['command'] == CMD_READ_RESPONSE else 'Unknown'})")
    print(f"  Patch #:      {patch['patch_number']}")

    print(f"\n[Datos del Patch]")
    print(f"  Nombre: \"{patch['name']}\"")
    print(f"  Datos codificados (nibbles): {len(patch['nibble_data'])} bytes")
    print(f"  Datos decodificados: {len(patch['decoded_data'])} bytes")
    print(f"  Bytes especiales: {patch['special_bytes'].hex()} = {list(patch['special_bytes'])}")

    # Mostrar datos decodificados
    print(f"\n[Datos Decodificados]")
    decoded = patch["decoded_data"]
    for i in range(0, len(decoded), 16):
        chunk = decoded[i:i+16]
        hex_str = " ".join(f"{b:02x}" for b in chunk)
        ascii_str = "".join(chr(b) if 32 <= b < 127 else "." for b in chunk)
        print(f"  {i:3d}: {hex_str:48s} | {ascii_str}")

    # Análisis de estructura
    print(f"\n[Estructura Interpretada]")
    print(f"  Bytes 0-63:   Configuración de efectos (¿COMP, WAH, ZNR, DRIVE, EQ?)")
    print(f"  Byte 64:      0x{decoded[64]:02X} (marcador)")
    print(f"  Bytes 65-74:  Nombre del patch")
    print(f"  Bytes 75-127: Más parámetros (¿CAB, MOD, DELAY, REVERB?)")

    # Checksums
    print(f"\n[Checksums]")
    sum_nibbles = sum(patch["nibble_data"])
    sum_decoded = sum(decoded)
    xor_decoded = 0
    for b in decoded:
        xor_decoded ^= b

    print(f"  Sum nibbles:     0x{sum_nibbles:04X} ({sum_nibbles})")
    print(f"  Sum decoded:     0x{sum_decoded:04X} ({sum_decoded})")
    print(f"  XOR decoded:     0x{xor_decoded:02X} ({xor_decoded})")
    print(f"  Special[4]:      0x{patch['special_bytes'][4]:02X} ({patch['special_bytes'][4]})")


def decode_patch(filepath: str):
    """Decodifica y muestra los datos de un patch."""
    data = Path(filepath).read_bytes()
    patch = parse_patch_sysex(data)

    print(f"Patch: {patch['name']} (#{patch['patch_number']})")
    print(f"\nDecoded hex ({len(patch['decoded_data'])} bytes):")
    print(patch["decoded_data"].hex())

    print(f"\nSpecial bytes:")
    print(patch["special_bytes"].hex())


def compare_patches(file1: str, file2: str):
    """Compara dos patches byte por byte."""
    data1 = Path(file1).read_bytes()
    data2 = Path(file2).read_bytes()

    patch1 = parse_patch_sysex(data1)
    patch2 = parse_patch_sysex(data2)

    print(f"\n{'='*60}")
    print(f"COMPARACIÓN DE PATCHES")
    print(f"{'='*60}")
    print(f"  A: {file1} - \"{patch1['name']}\"")
    print(f"  B: {file2} - \"{patch2['name']}\"")

    decoded1 = patch1["decoded_data"]
    decoded2 = patch2["decoded_data"]

    print(f"\n[Diferencias en datos decodificados]")
    diff_count = 0
    for i in range(min(len(decoded1), len(decoded2))):
        if decoded1[i] != decoded2[i]:
            diff_count += 1
            print(f"  Offset {i:3d}: A=0x{decoded1[i]:02X} B=0x{decoded2[i]:02X}")

    if diff_count == 0:
        print("  (idénticos)")
    else:
        print(f"\n  Total diferencias: {diff_count}")

    print(f"\n[Bytes especiales]")
    print(f"  A: {patch1['special_bytes'].hex()}")
    print(f"  B: {patch2['special_bytes'].hex()}")


def set_patch_name(input_file: str, new_name: str, output_file: str):
    """Cambia el nombre de un patch."""
    data = bytearray(Path(input_file).read_bytes())
    patch = parse_patch_sysex(bytes(data))

    # Preparar nuevo nombre (10 caracteres, padding con nulos)
    new_name_bytes = new_name[:NAME_LENGTH].encode("ascii")
    new_name_bytes = new_name_bytes.ljust(NAME_LENGTH, b"\x00")

    # Decodificar datos actuales
    decoded = bytearray(patch["decoded_data"])

    # Cambiar nombre
    decoded[NAME_OFFSET:NAME_OFFSET + NAME_LENGTH] = new_name_bytes

    # Re-codificar a nibbles
    new_nibbles = encode_nibbles(bytes(decoded))

    # Reconstruir el mensaje SysEx
    # Nota: Los bytes especiales (checksum?) podrían necesitar recalcularse
    new_data = bytearray([
        0xF0,
        ZOOM_MANUFACTURER,
        patch["device_id"],
        G9TT_MODEL_ID,
        patch["command"],
        patch["patch_number"],
    ])
    new_data.extend(new_nibbles)
    new_data.extend(patch["special_bytes"])  # Mantener checksum original por ahora
    new_data.append(0xF7)

    Path(output_file).write_bytes(bytes(new_data))
    print(f"Patch guardado: {output_file}")
    print(f"  Nombre anterior: \"{patch['name']}\"")
    print(f"  Nombre nuevo:    \"{new_name[:NAME_LENGTH]}\"")
    print(f"\n  NOTA: El checksum no fue recalculado - el patch podría no ser aceptado por el pedal")


def main():
    parser = argparse.ArgumentParser(description="Herramienta de patches para Zoom G9.2tt")
    subparsers = parser.add_subparsers(dest="command", help="Comandos disponibles")

    # Subcomando: analyze
    analyze_parser = subparsers.add_parser("analyze", help="Analiza un patch")
    analyze_parser.add_argument("file", help="Archivo .syx a analizar")

    # Subcomando: decode
    decode_parser = subparsers.add_parser("decode", help="Decodifica un patch")
    decode_parser.add_argument("file", help="Archivo .syx a decodificar")

    # Subcomando: compare
    compare_parser = subparsers.add_parser("compare", help="Compara dos patches")
    compare_parser.add_argument("file1", help="Primer archivo .syx")
    compare_parser.add_argument("file2", help="Segundo archivo .syx")

    # Subcomando: setname
    setname_parser = subparsers.add_parser("setname", help="Cambia el nombre de un patch")
    setname_parser.add_argument("input", help="Archivo .syx de entrada")
    setname_parser.add_argument("name", help="Nuevo nombre (max 10 caracteres)")
    setname_parser.add_argument("output", help="Archivo .syx de salida")

    args = parser.parse_args()

    if args.command == "analyze":
        analyze_patch(args.file)
    elif args.command == "decode":
        decode_patch(args.file)
    elif args.command == "compare":
        compare_patches(args.file1, args.file2)
    elif args.command == "setname":
        set_patch_name(args.input, args.name, args.output)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
