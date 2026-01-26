"""
Zoom G9.2tt Data Encoding/Decoding

Handles nibble encoding (read responses) and 7-bit encoding (write data).
"""

from .constants import BIT_TBL


def decode_nibbles(data: bytes) -> bytes:
    """
    Decode nibble-encoded data to raw bytes.

    Used for: Read responses (0x21)
    Conversion: 256 nibbles -> 128 bytes

    Each byte is split into two nibbles in the encoded format:
        Original: 0xA5 -> Encoded: 0x0A 0x05

    Args:
        data: 256 bytes of nibble-encoded data

    Returns:
        128 bytes of decoded data
    """
    if len(data) != 256:
        raise ValueError(f"Expected 256 nibbles, got {len(data)}")

    decoded = []
    for i in range(0, len(data), 2):
        high = data[i] & 0x0F
        low = data[i + 1] & 0x0F
        decoded.append((high << 4) | low)
    return bytes(decoded)


def encode_nibbles(data: bytes) -> bytes:
    """
    Encode raw bytes to nibble format.

    Used for: Bulk write responses
    Conversion: 128 bytes -> 256 nibbles

    Args:
        data: 128 bytes of raw data

    Returns:
        256 bytes of nibble-encoded data
    """
    if len(data) != 128:
        raise ValueError(f"Expected 128 bytes, got {len(data)}")

    encoded = []
    for byte in data:
        high = (byte >> 4) & 0x0F
        low = byte & 0x0F
        encoded.extend([high, low])
    return bytes(encoded)


def decode_7bit(data: bytes) -> bytes:
    """
    Decode 7-bit MIDI-safe data to raw bytes.

    Used for: Write data (0x28)
    Conversion: 147 bytes -> 128 bytes

    Structure: Every 8 bytes contain 7 data bytes + 1 high-bits byte.
    The high-bits byte contains the MSB of each of the 7 data bytes.

    Args:
        data: 147 bytes of 7-bit encoded data

    Returns:
        128 bytes of decoded data
    """
    if len(data) != 147:
        raise ValueError(f"Expected 147 bytes, got {len(data)}")

    result = bytearray()

    for i in range(0, 147, 8):
        chunk = data[i:i + 7]
        high_bits = data[i + 7] if i + 7 < 147 else 0

        for j, byte in enumerate(chunk):
            if high_bits & (1 << j):
                byte |= 0x80
            result.append(byte)

    return bytes(result[:128])


def encode_7bit(data: bytes) -> bytes:
    """
    Encode raw bytes to 7-bit MIDI-safe format.

    Used for: Write patch data (0x28)
    Conversion: 128 bytes -> 147 bytes

    MIDI requires all data bytes < 128. This encoding strips bit 7
    from each byte and packs them into a separate high-bits byte.

    Structure:
        Every 7 bytes -> 8 transmitted bytes
        - 7 data bytes (bit 7 stripped, all values < 128)
        - 1 byte containing the 7 high bits

    Args:
        data: 128 bytes of raw data

    Returns:
        147 bytes of 7-bit encoded data (MIDI-safe)
    """
    if len(data) != 128:
        raise ValueError(f"Expected 128 bytes, got {len(data)}")

    result = bytearray()
    data = bytearray(data)

    i = 0
    while i < len(data):
        chunk = data[i:i + 7]

        high_bits = 0
        encoded_chunk = bytearray()

        for j, byte in enumerate(chunk):
            if byte & 0x80:
                high_bits |= (1 << j)
            encoded_chunk.append(byte & 0x7F)

        result.extend(encoded_chunk)
        result.append(high_bits)

        i += 7

    # Ensure exact size of 147 bytes
    while len(result) < 147:
        result.append(0x00)

    return bytes(result[:147])


def unpack_bits(packed_data: bytes) -> list:
    """
    Unpack bit-packed values from patch data using BIT_TBL.

    The first ~36 bytes of the 128-byte patch are bit-packed according
    to the widths defined in BIT_TBL. This function extracts the values.

    Args:
        packed_data: 128 bytes of decoded patch data

    Returns:
        12x8 matrix of extracted values
    """
    matrix = [[0] * 8 for _ in range(12)]
    bit_pos = 0

    for row in range(12):
        for col in range(8):
            num_bits = BIT_TBL[row][col]
            if num_bits == 0:
                continue

            byte_idx = bit_pos // 8
            bit_offset = bit_pos % 8

            value = 0
            bits_read = 0

            while bits_read < num_bits:
                if byte_idx >= len(packed_data):
                    break

                byte_val = packed_data[byte_idx]
                bits_avail = 8 - bit_offset
                bits_to_read = min(bits_avail, num_bits - bits_read)

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
    Pack values back into bit-packed format using BIT_TBL.

    Args:
        matrix: 12x8 matrix of values to pack

    Returns:
        Bit-packed bytes (first ~36 bytes of patch data)
    """
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
            bits_written = 0

            while bits_written < num_bits:
                byte_idx = bit_pos // 8
                bit_offset = bit_pos % 8

                bits_avail = 8 - bit_offset
                bits_to_write = min(bits_avail, num_bits - bits_written)

                mask = (1 << bits_to_write) - 1
                bits_val = (value >> bits_written) & mask

                packed[byte_idx] |= bits_val << bit_offset

                bits_written += bits_to_write
                bit_pos += bits_to_write

    return bytes(packed)


def calculate_checksum(data: bytes) -> bytes:
    """
    Calculate the 5-byte CRC-32 checksum for a patch read response.

    Algorithm discovered by disassembling G9ED.exe (2026-01-26):
    1. Calculate CRC-32 over the 128 decoded bytes
    2. Encode the 32-bit CRC as 5 bytes of 7-bit values

    The checksum appears after the 256 nibbles in a 0x21 response.

    Args:
        data: 128 bytes of decoded patch data

    Returns:
        5 bytes of checksum (7-bit encoded CRC-32)
    """
    if len(data) != 128:
        raise ValueError(f"Expected 128 bytes, got {len(data)}")

    crc = _calculate_crc32(data)
    return _encode_crc_7bit(crc)


# CRC-32 implementation (standard polynomial 0xEDB88320)
_CRC32_TABLE = None


def _init_crc32_table():
    """Initialize the CRC-32 lookup table."""
    global _CRC32_TABLE
    if _CRC32_TABLE is not None:
        return

    poly = 0xEDB88320
    table = []
    for i in range(256):
        crc = i
        for _ in range(8):
            if crc & 1:
                crc = (crc >> 1) ^ poly
            else:
                crc >>= 1
        table.append(crc)
    _CRC32_TABLE = table


def _calculate_crc32(data: bytes, init: int = 0xFFFFFFFF) -> int:
    """
    Calculate CRC-32 over data bytes.

    Uses standard CRC-32 algorithm with polynomial 0xEDB88320
    and initial value 0xFFFFFFFF (as in G9ED.exe).

    Args:
        data: Bytes to calculate CRC over
        init: Initial CRC value (default 0xFFFFFFFF)

    Returns:
        32-bit CRC value
    """
    _init_crc32_table()
    crc = init
    for byte in data:
        crc = _CRC32_TABLE[(crc ^ byte) & 0xFF] ^ ((crc >> 8) & 0x00FFFFFF)
    return crc


def _encode_crc_7bit(crc: int) -> bytes:
    """
    Encode a 32-bit CRC as 5 bytes of 7-bit values.

    The G9.2tt uses 7-bit encoding for MIDI safety:
    - Byte 0: bits 0-6
    - Byte 1: bits 7-13
    - Byte 2: bits 14-20
    - Byte 3: bits 21-27
    - Byte 4: bits 28-31 (only 4 bits used)

    Args:
        crc: 32-bit CRC value

    Returns:
        5 bytes, each < 128 (MIDI-safe)
    """
    return bytes([
        crc & 0x7F,
        (crc >> 7) & 0x7F,
        (crc >> 14) & 0x7F,
        (crc >> 21) & 0x7F,
        (crc >> 28) & 0x7F,
    ])


def _decode_crc_7bit(checksum_bytes: bytes) -> int:
    """
    Decode 5 bytes of 7-bit values to a 32-bit CRC.

    Args:
        checksum_bytes: 5 bytes of 7-bit encoded CRC

    Returns:
        32-bit CRC value
    """
    if len(checksum_bytes) != 5:
        raise ValueError(f"Expected 5 bytes, got {len(checksum_bytes)}")

    return (checksum_bytes[0] |
            (checksum_bytes[1] << 7) |
            (checksum_bytes[2] << 14) |
            (checksum_bytes[3] << 21) |
            (checksum_bytes[4] << 28))
