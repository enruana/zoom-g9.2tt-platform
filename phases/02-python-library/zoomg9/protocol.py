"""
Zoom G9.2tt SysEx Protocol

Low-level SysEx message building and parsing functions.
"""

from .constants import (
    ZOOM_MANUFACTURER_ID,
    G9TT_MODEL_ID,
    DEVICE_ID,
    CMD_READ_PATCH,
    CMD_ENTER_EDIT,
    CMD_EXIT_EDIT,
    CMD_READ_RESPONSE,
    CMD_WRITE_PATCH,
    CMD_PARAM_CHANGE,
    PATCH_SIZE_NIBBLE,
)
from .encoding import decode_nibbles, encode_nibbles, encode_7bit, decode_7bit


def _build_sysex(cmd: int, data: bytes = b"") -> bytes:
    """
    Build a complete SysEx message.

    Format: F0 52 00 42 [CMD] [DATA...] F7

    Args:
        cmd: Command byte
        data: Optional data bytes

    Returns:
        Complete SysEx message including F0 and F7
    """
    return bytes([
        0xF0,
        ZOOM_MANUFACTURER_ID,
        DEVICE_ID,
        G9TT_MODEL_ID,
        cmd,
    ]) + data + bytes([0xF7])


def build_read_request(patch_num: int) -> bytes:
    """
    Build a read patch request message.

    Command 0x11: Request patch data from device.

    Args:
        patch_num: Patch number (0-99)

    Returns:
        7-byte SysEx message
    """
    if not 0 <= patch_num <= 99:
        raise ValueError(f"Patch number must be 0-99, got {patch_num}")
    return _build_sysex(CMD_READ_PATCH, bytes([patch_num]))


def build_enter_edit() -> bytes:
    """
    Build enter edit mode message.

    Command 0x12: Enter editing mode (required before write operations).

    Returns:
        6-byte SysEx message
    """
    return _build_sysex(CMD_ENTER_EDIT)


def build_exit_edit() -> bytes:
    """
    Build exit edit mode message.

    Command 0x1F: Exit editing mode.

    Returns:
        6-byte SysEx message
    """
    return _build_sysex(CMD_EXIT_EDIT)


def build_write_data(patch_data: bytes) -> bytes:
    """
    Build write patch data message.

    Command 0x28: Send patch data for preview or writing.
    Data must be 128 bytes (raw) or 147 bytes (pre-encoded).

    Args:
        patch_data: 128 bytes raw or 147 bytes 7-bit encoded

    Returns:
        153-byte SysEx message
    """
    if len(patch_data) == 128:
        encoded = encode_7bit(patch_data)
    elif len(patch_data) == 147:
        encoded = patch_data
    else:
        raise ValueError(f"Patch data must be 128 or 147 bytes, got {len(patch_data)}")

    return _build_sysex(CMD_WRITE_PATCH, encoded)


def build_param_change(effect_id: int, param_id: int, value: int) -> bytes:
    """
    Build a real-time parameter change message.

    Command 0x31: Immediate parameter modification.

    Args:
        effect_id: Effect module ID (0x00-0x0B)
        param_id: Parameter ID within the effect
        value: New value (0-127 for single byte, may use 2 bytes for larger)

    Returns:
        10-byte SysEx message
    """
    if not 0x00 <= effect_id <= 0x0B:
        raise ValueError(f"Effect ID must be 0x00-0x0B, got 0x{effect_id:02X}")
    if not 0 <= param_id <= 0x07:
        raise ValueError(f"Param ID must be 0x00-0x07, got 0x{param_id:02X}")
    if not 0 <= value <= 127:
        raise ValueError(f"Value must be 0-127, got {value}")

    return _build_sysex(CMD_PARAM_CHANGE, bytes([effect_id, param_id, value, 0x00]))


def build_patch_select(patch_num: int, mode: int = 0x02) -> bytes:
    """
    Build patch select/confirm message.

    Command 0x31 with special format for patch operations.

    Args:
        patch_num: Patch number (0-99)
        mode: Operation mode (0x02=preview, 0x09=confirm write)

    Returns:
        10-byte SysEx message
    """
    if not 0 <= patch_num <= 99:
        raise ValueError(f"Patch number must be 0-99, got {patch_num}")

    return _build_sysex(CMD_PARAM_CHANGE, bytes([patch_num, 0x02, mode, 0x00]))


def build_read_response(patch_num: int, patch_data: bytes) -> bytes:
    """
    Build a read response message (for bulk write to device).

    Command 0x21: Patch data in nibble-encoded format.
    Used when the device requests patches during bulk write.

    The checksum is CRC-32 of the 128 decoded bytes, encoded as 5 bytes of 7-bit values.
    Algorithm discovered by disassembling G9ED.exe (2026-01-26).

    Args:
        patch_num: Patch number (0-99)
        patch_data: 128 bytes raw patch data

    Returns:
        268-byte SysEx message
    """
    from .encoding import calculate_checksum

    if not 0 <= patch_num <= 99:
        raise ValueError(f"Patch number must be 0-99, got {patch_num}")
    if len(patch_data) != 128:
        raise ValueError(f"Patch data must be 128 bytes, got {len(patch_data)}")

    nibbles = encode_nibbles(patch_data)
    checksum = calculate_checksum(patch_data)

    return _build_sysex(CMD_READ_RESPONSE, bytes([patch_num]) + nibbles + checksum)


def build_identity_request() -> bytes:
    """
    Build a Universal Identity Request message.

    Returns:
        6-byte SysEx message
    """
    return bytes([0xF0, 0x7E, 0x7F, 0x06, 0x01, 0xF7])


def parse_sysex(data: bytes) -> dict:
    """
    Parse a SysEx message from the G9.2tt.

    Args:
        data: Complete SysEx message including F0 and F7

    Returns:
        Dictionary with parsed message fields:
        - 'valid': bool - Whether the message is valid
        - 'manufacturer': int - Manufacturer ID
        - 'device': int - Device ID
        - 'model': int - Model ID
        - 'command': int - Command byte
        - 'data': bytes - Payload data
    """
    result = {
        "valid": False,
        "manufacturer": 0,
        "device": 0,
        "model": 0,
        "command": 0,
        "data": b"",
    }

    if len(data) < 6:
        return result

    if data[0] != 0xF0 or data[-1] != 0xF7:
        return result

    result["manufacturer"] = data[1]
    result["device"] = data[2]
    result["model"] = data[3]
    result["command"] = data[4]
    result["data"] = data[5:-1]

    if result["manufacturer"] == ZOOM_MANUFACTURER_ID and result["model"] == G9TT_MODEL_ID:
        result["valid"] = True

    return result


def parse_read_response(data: bytes) -> tuple:
    """
    Parse a read patch response (0x21).

    Args:
        data: Complete 268-byte SysEx message

    Returns:
        Tuple of (patch_num, decoded_data) or (None, None) on error

    Raises:
        ValueError: If message format is invalid
    """
    if len(data) != 268:
        raise ValueError(f"Expected 268 bytes, got {len(data)}")

    parsed = parse_sysex(data)
    if not parsed["valid"]:
        raise ValueError("Invalid SysEx message")

    if parsed["command"] != CMD_READ_RESPONSE:
        raise ValueError(f"Expected command 0x21, got 0x{parsed['command']:02X}")

    payload = parsed["data"]
    patch_num = payload[0]
    nibbles = payload[1:257]  # 256 nibbles
    # checksum = payload[257:262]  # 5 bytes checksum (ignored for now)

    decoded = decode_nibbles(nibbles)
    return patch_num, decoded


def parse_identity_response(data: bytes) -> dict:
    """
    Parse a Universal Identity Response message.

    Args:
        data: Complete SysEx message

    Returns:
        Dictionary with device information
    """
    result = {
        "valid": False,
        "manufacturer": 0,
        "model": 0,
        "firmware": "",
    }

    if len(data) < 10:
        return result

    if data[0] != 0xF0 or data[-1] != 0xF7:
        return result

    # Universal SysEx Identity Response: F0 7E [device] 06 02 [manufacturer] [model...]
    if data[1] == 0x7E and len(data) >= 7:
        result["manufacturer"] = data[5]
        result["model"] = data[6]

        if len(data) >= 15:
            try:
                result["firmware"] = "".join(chr(b) for b in data[10:14])
            except (ValueError, IndexError):
                pass

        if result["manufacturer"] == ZOOM_MANUFACTURER_ID:
            result["valid"] = True

    return result
