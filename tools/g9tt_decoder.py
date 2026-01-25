#!/usr/bin/env python3
"""
Decodificador completo de patches Zoom G9.2tt
Basado en ingeniería inversa del G9ED.exe

Uso:
    python g9tt_decoder.py <archivo.syx>
    python g9tt_decoder.py decode <archivo.syx>
    python g9tt_decoder.py compare <archivo.syx> <xml_patch_index>
"""

import sys
import os
import argparse

# bit_tbl extraído de G9ED.exe - define bits por campo
# 12 filas x 8 columnas = 96 valores
# Cada valor indica cuántos bits usa ese campo en la matriz de empaquetado
BIT_TBL = [
    # Fila 0: Global - PatchLevel en columna 5
    [0, 0, 0, 0, 0, 7, 0, 0],
    # Fila 1: Comp (onoff:1, type:2, parm1:6, parm2:4, parm3:4, parm4:6)
    [1, 2, 6, 4, 4, 6, 0, 0],
    # Fila 2: Wah (onoff:1, type:5, parm1:7, parm2:7, parm3:6, parm4:6)
    [1, 5, 7, 7, 6, 6, 0, 0],
    # Fila 3: Ext? (onoff:1, ?, parm1:7, parm2:7, parm3:7)
    [1, 0, 7, 7, 7, 0, 0, 0],
    # Fila 4: ZnrA (onoff:1, type:2, parm1:4)
    [1, 2, 4, 0, 0, 0, 0, 0],
    # Fila 5: AmpA (onoff:1, type:6, parm1:7, parm2:5, parm3:7, parm4:1)
    [1, 6, 7, 5, 7, 1, 0, 0],
    # Fila 6: EqA (onoff:1, ?, parm1-6: 5 bits cada uno)
    [1, 0, 5, 5, 5, 5, 5, 5],
    # Fila 7: Cabi? (onoff:1, ?, parm1:1, parm2:2, parm3:2)
    [1, 0, 1, 2, 2, 0, 0, 0],
    # Fila 8: Modulation (onoff:1, type:5, parm1:11, parm2-4:7 bits)
    [1, 5, 11, 7, 7, 7, 0, 0],
    # Fila 9: Delay (onoff:1, type:3, parm1:13, parm2:6, parm3:4, parm4:6)
    [1, 3, 13, 6, 4, 6, 0, 0],
    # Fila 10: Reverb (onoff:1, type:4, parm1:12, parm2:7, parm3:6, parm4:6)
    [1, 4, 12, 7, 6, 6, 0, 0],
    # Fila 11: vacía
    [0, 0, 0, 0, 0, 0, 0, 0],
]

# Mapeo de offsets directos (no bit-packed) en el buffer Packed[128]
# Extraído del análisis del método Patch::Pack en G9ED.exe
DIRECT_OFFSETS = {
    "ZnrB_onoff": 0x24,   # 36
    "ZnrB_type": 0x25,    # 37
    "ZnrB_parm1": 0x26,   # 38
    "AmpB_onoff": 0x2C,   # 44
    "AmpB_type": 0x2D,    # 45
    "AmpB_parm1": 0x2E,   # 46
    "AmpB_parm2": 0x2F,   # 47
    "AmpB_parm3": 0x30,   # 48
    "AmpB_parm4": 0x31,   # 49
    "EqB_onoff": 0x34,    # 52
    "EqB_parm1": 0x36,    # 54
    "EqB_parm2": 0x37,    # 55
    "EqB_parm3": 0x38,    # 56
    "EqB_parm4": 0x39,    # 57
    "EqB_parm5": 0x3A,    # 58
    "EqB_parm6": 0x3B,    # 59
    "AmpSel": 0x3C,       # 60
    "Tempo_raw": 0x3D,    # 61 (valor real = raw + 40)
    "PedalFunc0": 0x3E,   # 62
    "PedalFunc1": 0x3F,   # 63
    "Name": 0x41,         # 65 (10 bytes)
}


def decode_nibbles(data: bytes) -> bytes:
    """Decodifica 256 nibbles a 128 bytes."""
    decoded = []
    for i in range(0, len(data), 2):
        high = data[i] & 0x0F
        low = data[i+1] & 0x0F
        decoded.append((high << 4) | low)
    return bytes(decoded)


def encode_nibbles(data: bytes) -> bytes:
    """Codifica 128 bytes a 256 nibbles."""
    encoded = []
    for byte in data:
        high = (byte >> 4) & 0x0F
        low = byte & 0x0F
        encoded.extend([high, low])
    return bytes(encoded)


def unpack_bits(packed_data: bytes) -> list:
    """
    Desempaqueta los valores bit-packed usando bit_tbl.

    Retorna una matriz 12x8 con los valores extraídos.
    """
    matrix = [[0]*8 for _ in range(12)]

    bit_pos = 0  # Posición actual en bits

    for row in range(12):
        for col in range(8):
            num_bits = BIT_TBL[row][col]
            if num_bits == 0:
                continue

            # Extraer num_bits desde bit_pos
            byte_idx = bit_pos // 8
            bit_offset = bit_pos % 8

            # Leer suficientes bytes y extraer los bits
            value = 0
            bits_read = 0

            while bits_read < num_bits:
                if byte_idx >= len(packed_data):
                    break

                byte_val = packed_data[byte_idx]

                # Bits disponibles en este byte
                bits_avail = 8 - bit_offset
                bits_to_read = min(bits_avail, num_bits - bits_read)

                # Extraer bits
                mask = ((1 << bits_to_read) - 1) << bit_offset
                extracted = (byte_val & mask) >> bit_offset

                value |= extracted << bits_read
                bits_read += bits_to_read

                byte_idx += 1
                bit_offset = 0

            matrix[row][col] = value
            bit_pos += num_bits

    return matrix


def pack_bits(matrix: list) -> bytes:
    """
    Empaqueta la matriz 12x8 de vuelta a bytes usando bit_tbl.

    Retorna los primeros ~36 bytes del buffer packed.
    """
    # Calcular tamaño total en bits
    total_bits = sum(sum(row) for row in BIT_TBL)
    total_bytes = (total_bits + 7) // 8

    packed = bytearray(total_bytes)
    bit_pos = 0

    for row in range(12):
        for col in range(8):
            num_bits = BIT_TBL[row][col]
            if num_bits == 0:
                continue

            value = matrix[row][col]

            # Escribir num_bits en bit_pos
            bits_written = 0
            while bits_written < num_bits:
                byte_idx = bit_pos // 8
                bit_offset = bit_pos % 8

                bits_avail = 8 - bit_offset
                bits_to_write = min(bits_avail, num_bits - bits_written)

                # Extraer los bits a escribir
                mask = (1 << bits_to_write) - 1
                bits_val = (value >> bits_written) & mask

                # Escribir en el byte
                packed[byte_idx] |= bits_val << bit_offset

                bits_written += bits_to_write
                bit_pos += bits_to_write

    return bytes(packed)


def parse_patch(filepath: str) -> dict:
    """
    Parsea un archivo .syx de patch G9.2tt.

    Retorna un diccionario con todos los parámetros decodificados.
    """
    with open(filepath, "rb") as f:
        data = f.read()

    if len(data) != 268:
        raise ValueError(f"Tamaño incorrecto: {len(data)} (esperado 268)")

    # Verificar header SysEx
    if data[0] != 0xF0 or data[-1] != 0xF7:
        raise ValueError("No es un mensaje SysEx válido")
    if data[1] != 0x52:
        raise ValueError(f"Manufacturer ID incorrecto: {data[1]:02X}")
    if data[3] != 0x42:
        raise ValueError(f"Model ID incorrecto: {data[3]:02X}")

    # Extraer nibbles y decodificar
    nibbles = data[6:6+256]
    packed = decode_nibbles(nibbles)

    result = {
        "raw_data": data,
        "packed_data": packed,
        "patch_num": data[5],
        "special_bytes": data[6+256:-1],
    }

    # Desempaquetar matriz bit-packed
    matrix = unpack_bits(packed)
    result["matrix"] = matrix

    # Campos bit-packed (extraídos de la matriz)
    result["PatchLevel"] = matrix[0][5]

    result["Comp_onoff"] = matrix[1][0]
    result["Comp_type"] = matrix[1][1]
    result["Comp_parm1"] = matrix[1][2]
    result["Comp_parm2"] = matrix[1][3]
    result["Comp_parm3"] = matrix[1][4]
    result["Comp_parm4"] = matrix[1][5]

    result["Wah_onoff"] = matrix[2][0]
    result["Wah_type"] = matrix[2][1]
    result["Wah_parm1"] = matrix[2][2]
    result["Wah_parm2"] = matrix[2][3]
    result["Wah_parm3"] = matrix[2][4]
    result["Wah_parm4"] = matrix[2][5]

    result["Ext_onoff"] = matrix[3][0]
    result["Ext_parm1"] = matrix[3][2]
    result["Ext_parm2"] = matrix[3][3]
    result["Ext_parm3"] = matrix[3][4]

    result["ZnrA_onoff"] = matrix[4][0]
    result["ZnrA_type"] = matrix[4][1]
    result["ZnrA_parm1"] = matrix[4][2]

    result["AmpA_onoff"] = matrix[5][0]
    result["AmpA_type"] = matrix[5][1]
    result["AmpA_parm1"] = matrix[5][2]
    result["AmpA_parm2"] = matrix[5][3]
    result["AmpA_parm3"] = matrix[5][4]
    result["AmpA_parm4"] = matrix[5][5]

    result["EqA_onoff"] = matrix[6][0]
    result["EqA_parm1"] = matrix[6][2]
    result["EqA_parm2"] = matrix[6][3]
    result["EqA_parm3"] = matrix[6][4]
    result["EqA_parm4"] = matrix[6][5]
    result["EqA_parm5"] = matrix[6][6]
    result["EqA_parm6"] = matrix[6][7]

    result["Cabi_onoff"] = matrix[7][0]
    result["Cabi_parm1"] = matrix[7][2]
    result["Cabi_parm2"] = matrix[7][3]
    result["Cabi_parm3"] = matrix[7][4]

    result["Mod_onoff"] = matrix[8][0]
    result["Mod_type"] = matrix[8][1]
    result["Mod_parm1"] = matrix[8][2]
    result["Mod_parm2"] = matrix[8][3]
    result["Mod_parm3"] = matrix[8][4]
    result["Mod_parm4"] = matrix[8][5]

    result["Delay_onoff"] = matrix[9][0]
    result["Delay_type"] = matrix[9][1]
    result["Delay_parm1"] = matrix[9][2]
    result["Delay_parm2"] = matrix[9][3]
    result["Delay_parm3"] = matrix[9][4]
    result["Delay_parm4"] = matrix[9][5]

    result["Reverb_onoff"] = matrix[10][0]
    result["Reverb_type"] = matrix[10][1]
    result["Reverb_parm1"] = matrix[10][2]
    result["Reverb_parm2"] = matrix[10][3]
    result["Reverb_parm3"] = matrix[10][4]
    result["Reverb_parm4"] = matrix[10][5]

    # Campos directos (no bit-packed)
    result["ZnrB_onoff"] = packed[DIRECT_OFFSETS["ZnrB_onoff"]]
    result["ZnrB_type"] = packed[DIRECT_OFFSETS["ZnrB_type"]]
    result["ZnrB_parm1"] = packed[DIRECT_OFFSETS["ZnrB_parm1"]]

    result["AmpB_onoff"] = packed[DIRECT_OFFSETS["AmpB_onoff"]]
    result["AmpB_type"] = packed[DIRECT_OFFSETS["AmpB_type"]]
    result["AmpB_parm1"] = packed[DIRECT_OFFSETS["AmpB_parm1"]]
    result["AmpB_parm2"] = packed[DIRECT_OFFSETS["AmpB_parm2"]]
    result["AmpB_parm3"] = packed[DIRECT_OFFSETS["AmpB_parm3"]]
    result["AmpB_parm4"] = packed[DIRECT_OFFSETS["AmpB_parm4"]]

    result["EqB_onoff"] = packed[DIRECT_OFFSETS["EqB_onoff"]]
    result["EqB_parm1"] = packed[DIRECT_OFFSETS["EqB_parm1"]]
    result["EqB_parm2"] = packed[DIRECT_OFFSETS["EqB_parm2"]]
    result["EqB_parm3"] = packed[DIRECT_OFFSETS["EqB_parm3"]]
    result["EqB_parm4"] = packed[DIRECT_OFFSETS["EqB_parm4"]]
    result["EqB_parm5"] = packed[DIRECT_OFFSETS["EqB_parm5"]]
    result["EqB_parm6"] = packed[DIRECT_OFFSETS["EqB_parm6"]]

    result["AmpSel"] = packed[DIRECT_OFFSETS["AmpSel"]]
    result["Tempo"] = packed[DIRECT_OFFSETS["Tempo_raw"]] + 40
    result["PedalFunc0"] = packed[DIRECT_OFFSETS["PedalFunc0"]]
    result["PedalFunc1"] = packed[DIRECT_OFFSETS["PedalFunc1"]]

    # Nombre (10 caracteres ASCII)
    name_start = DIRECT_OFFSETS["Name"]
    result["Name"] = packed[name_start:name_start+10].rstrip(b"\x00").decode("ascii", errors="replace")

    return result


def print_patch(patch: dict, verbose: bool = False):
    """Imprime los parámetros del patch en formato legible."""
    print("=" * 60)
    print("PATCH DECODIFICADO")
    print("=" * 60)
    print(f"Nombre: {patch['Name']}")
    print(f"Patch #: {patch['patch_num']}")
    print()

    print("[Global]")
    print(f"  PatchLevel: {patch['PatchLevel']}")
    print(f"  AmpSel: {patch['AmpSel']} (0=A, 1=B)")
    print(f"  Tempo: {patch['Tempo']} BPM")
    print(f"  PedalFunc: ({patch['PedalFunc0']}, {patch['PedalFunc1']})")
    print()

    print(f"[AmpA] onoff={patch['AmpA_onoff']} type={patch['AmpA_type']} "
          f"parm=({patch['AmpA_parm1']}, {patch['AmpA_parm2']}, "
          f"{patch['AmpA_parm3']}, {patch['AmpA_parm4']})")

    print(f"[AmpB] onoff={patch['AmpB_onoff']} type={patch['AmpB_type']} "
          f"parm=({patch['AmpB_parm1']}, {patch['AmpB_parm2']}, "
          f"{patch['AmpB_parm3']}, {patch['AmpB_parm4']})")

    print(f"[ZnrA] onoff={patch['ZnrA_onoff']} type={patch['ZnrA_type']} "
          f"parm1={patch['ZnrA_parm1']}")

    print(f"[ZnrB] onoff={patch['ZnrB_onoff']} type={patch['ZnrB_type']} "
          f"parm1={patch['ZnrB_parm1']}")

    print(f"[EqA]  onoff={patch['EqA_onoff']} "
          f"parm=({patch['EqA_parm1']}, {patch['EqA_parm2']}, "
          f"{patch['EqA_parm3']}, {patch['EqA_parm4']}, "
          f"{patch['EqA_parm5']}, {patch['EqA_parm6']})")

    print(f"[EqB]  onoff={patch['EqB_onoff']} "
          f"parm=({patch['EqB_parm1']}, {patch['EqB_parm2']}, "
          f"{patch['EqB_parm3']}, {patch['EqB_parm4']}, "
          f"{patch['EqB_parm5']}, {patch['EqB_parm6']})")

    print(f"[Comp] onoff={patch['Comp_onoff']} type={patch['Comp_type']} "
          f"parm=({patch['Comp_parm1']}, {patch['Comp_parm2']}, "
          f"{patch['Comp_parm3']}, {patch['Comp_parm4']})")

    print(f"[Wah]  onoff={patch['Wah_onoff']} type={patch['Wah_type']} "
          f"parm=({patch['Wah_parm1']}, {patch['Wah_parm2']}, "
          f"{patch['Wah_parm3']}, {patch['Wah_parm4']})")

    print(f"[Ext]  onoff={patch['Ext_onoff']} "
          f"parm=({patch['Ext_parm1']}, {patch['Ext_parm2']}, {patch['Ext_parm3']})")

    print(f"[Cabi] onoff={patch['Cabi_onoff']} "
          f"parm=({patch['Cabi_parm1']}, {patch['Cabi_parm2']}, {patch['Cabi_parm3']})")

    print(f"[Mod]  onoff={patch['Mod_onoff']} type={patch['Mod_type']} "
          f"parm=({patch['Mod_parm1']}, {patch['Mod_parm2']}, "
          f"{patch['Mod_parm3']}, {patch['Mod_parm4']})")

    print(f"[Delay] onoff={patch['Delay_onoff']} type={patch['Delay_type']} "
          f"parm=({patch['Delay_parm1']}, {patch['Delay_parm2']}, "
          f"{patch['Delay_parm3']}, {patch['Delay_parm4']})")

    print(f"[Reverb] onoff={patch['Reverb_onoff']} type={patch['Reverb_type']} "
          f"parm=({patch['Reverb_parm1']}, {patch['Reverb_parm2']}, "
          f"{patch['Reverb_parm3']}, {patch['Reverb_parm4']})")

    if verbose:
        print()
        print("[Special Bytes]")
        print(f"  {patch['special_bytes'].hex()}")

        print()
        print("[Bit-packed Matrix]")
        for i, row in enumerate(patch['matrix']):
            print(f"  Row {i:2d}: {row}")


def main():
    parser = argparse.ArgumentParser(
        description="Decodificador de patches Zoom G9.2tt"
    )
    parser.add_argument(
        "file",
        help="Archivo .syx a decodificar"
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Mostrar información detallada"
    )

    args = parser.parse_args()

    try:
        patch = parse_patch(args.file)
        print_patch(patch, verbose=args.verbose)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
