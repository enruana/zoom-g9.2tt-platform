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
    Calculate the 5-byte checksum for a patch read response.

    The checksum appears after the 256 nibbles in a 0x21 response.

    Args:
        data: The patch data to checksum

    Returns:
        5 bytes of checksum data
    """
    # Based on reverse engineering, the checksum is a simple sum
    # split across multiple bytes. Format needs verification.
    total = sum(data) & 0xFFFF
    return bytes([
        (total >> 8) & 0x7F,
        total & 0x7F,
        0x00,
        0x00,
        0x00,
    ])
