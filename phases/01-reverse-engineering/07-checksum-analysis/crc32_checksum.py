#!/usr/bin/env python3
"""
CRC-32 Checksum para Zoom G9.2tt

Algoritmo descubierto desensamblando G9ED.exe:

1. Decodificar 256 nibbles a 128 bytes
2. Calcular CRC-32 sobre los 128 bytes con init=0xFFFFFFFF
3. Codificar el CRC en 5 bytes de 7 bits cada uno

El checksum está en bytes [262:267] del mensaje READ_RESP (268 bytes total).
"""

import struct

# Tabla CRC-32 estándar (polinomio 0xEDB88320)
CRC32_TABLE = []

def _init_crc32_table():
    """Inicializa la tabla CRC-32 con polinomio estándar."""
    global CRC32_TABLE
    if CRC32_TABLE:
        return

    poly = 0xEDB88320
    for i in range(256):
        crc = i
        for _ in range(8):
            if crc & 1:
                crc = (crc >> 1) ^ poly
            else:
                crc >>= 1
        CRC32_TABLE.append(crc)

def crc32_update(crc: int, byte: int) -> int:
    """Actualiza el CRC con un byte (como en G9ED.Crc32.update)."""
    _init_crc32_table()
    return CRC32_TABLE[(crc ^ byte) & 0xFF] ^ ((crc >> 8) & 0x00FFFFFF)

def calculate_crc32(data: bytes, init: int = 0xFFFFFFFF) -> int:
    """Calcula CRC-32 sobre los datos."""
    crc = init
    for byte in data:
        crc = crc32_update(crc, byte)
    return crc

def decode_nibbles(nibbles: bytes) -> bytes:
    """Decodifica 256 nibbles a 128 bytes."""
    if len(nibbles) != 256:
        raise ValueError(f"Expected 256 nibbles, got {len(nibbles)}")

    decoded = []
    for i in range(0, 256, 2):
        high = nibbles[i]
        low = nibbles[i + 1]
        decoded.append((high << 4) | low)
    return bytes(decoded)

def encode_checksum_7bit(crc: int) -> bytes:
    """Codifica CRC de 32 bits en 5 bytes de 7 bits (35 bits total)."""
    # crc32 es de 32 bits, lo extendemos a 35 bits con ceros
    # Byte 0: bits 0-6
    # Byte 1: bits 7-13
    # Byte 2: bits 14-20
    # Byte 3: bits 21-27
    # Byte 4: bits 28-34 (solo 4 bits significativos)
    return bytes([
        crc & 0x7F,
        (crc >> 7) & 0x7F,
        (crc >> 14) & 0x7F,
        (crc >> 21) & 0x7F,
        (crc >> 28) & 0x7F,
    ])

def decode_checksum_7bit(checksum_bytes: bytes) -> int:
    """Decodifica 5 bytes de 7 bits a un entero de 35 bits."""
    if len(checksum_bytes) != 5:
        raise ValueError(f"Expected 5 bytes, got {len(checksum_bytes)}")

    return (checksum_bytes[0] |
            (checksum_bytes[1] << 7) |
            (checksum_bytes[2] << 14) |
            (checksum_bytes[3] << 21) |
            (checksum_bytes[4] << 28))

def calculate_patch_checksum(patch_data: bytes) -> bytes:
    """
    Calcula el checksum de 5 bytes para un patch.

    Args:
        patch_data: 128 bytes del patch (decodificados)

    Returns:
        5 bytes de checksum codificado en 7-bit
    """
    if len(patch_data) != 128:
        raise ValueError(f"Expected 128 bytes, got {len(patch_data)}")

    crc = calculate_crc32(patch_data)
    return encode_checksum_7bit(crc)

def verify_read_response(response: bytes) -> bool:
    """
    Verifica el checksum de un READ_RESP (268 bytes).

    Args:
        response: Mensaje READ_RESP completo (268 bytes con F0 y F7)

    Returns:
        True si el checksum es válido
    """
    if len(response) != 268:
        raise ValueError(f"Expected 268 bytes, got {len(response)}")

    # Extraer nibbles (bytes 6-261, 256 nibbles)
    nibbles = response[6:262]

    # Extraer checksum recibido (bytes 262-266)
    received_checksum = response[262:267]
    received_crc = decode_checksum_7bit(received_checksum)

    # Decodificar y calcular CRC
    decoded = decode_nibbles(nibbles)
    calculated_crc = calculate_crc32(decoded)

    return received_crc == calculated_crc

def build_read_response_checksum(nibbles: bytes) -> bytes:
    """
    Calcula el checksum para datos en formato nibble.

    Args:
        nibbles: 256 nibbles

    Returns:
        5 bytes de checksum
    """
    decoded = decode_nibbles(nibbles)
    crc = calculate_crc32(decoded)
    return encode_checksum_7bit(crc)


# --- Pruebas ---

def test_with_known_data():
    """Prueba con datos conocidos capturados."""
    # Datos de CHECKSUM.md
    known_checksums = [
        # (patch_num, nibbles_sum, decoded_sum, checksum_bytes)
        (0, 859, 5989, [48, 17, 4, 89, 11]),
        (1, 903, 6258, [3, 66, 36, 15, 0]),
        (2, 692, 5117, [115, 68, 39, 6, 2]),
        (10, 877, 6307, [0, 121, 21, 12, 13]),
        (50, 860, 6020, [105, 11, 64, 31, 10]),
        (99, 815, 5375, [95, 87, 31, 64, 9]),
    ]

    print("=== Verificación de Checksums Conocidos ===\n")

    for patch_num, nib_sum, dec_sum, cs_bytes in known_checksums:
        # Decodificar el checksum recibido
        received_crc = decode_checksum_7bit(bytes(cs_bytes))

        print(f"Patch {patch_num}:")
        print(f"  Checksum bytes: {cs_bytes}")
        print(f"  Checksum hex: {' '.join(f'{b:02X}' for b in cs_bytes)}")
        print(f"  CRC decodificado: 0x{received_crc:08X} ({received_crc})")
        print()


def test_algorithm():
    """Prueba el algoritmo básico."""
    print("=== Prueba del Algoritmo ===\n")

    # Datos de prueba
    test_data = bytes([0x00] * 128)
    crc = calculate_crc32(test_data)
    checksum = encode_checksum_7bit(crc)

    print(f"128 bytes de ceros:")
    print(f"  CRC-32: 0x{crc:08X}")
    print(f"  Checksum 7-bit: {list(checksum)}")
    print()

    # Verificar round-trip
    decoded_crc = decode_checksum_7bit(checksum)
    print(f"  CRC round-trip: 0x{decoded_crc:08X}")
    print(f"  Match: {crc == decoded_crc}")


if __name__ == '__main__':
    test_algorithm()
    print()
    test_with_known_data()
