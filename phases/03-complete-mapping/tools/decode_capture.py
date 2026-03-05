#!/usr/bin/env python3
"""
decode_capture.py - Decodifica capturas de aseqdump y muestra datos legibles
"""

import sys
import re

# Effect module names
EFFECT_NAMES = {
    0x00: "TOP", 0x01: "CMP", 0x02: "WAH", 0x03: "EXT",
    0x04: "ZNR", 0x05: "AMP", 0x06: "EQ",  0x07: "CAB",
    0x08: "MOD", 0x09: "DLY", 0x0A: "REV", 0x0B: "SYNC"
}

COMMAND_NAMES = {
    0x11: "READ_PATCH_REQ",
    0x12: "ENTER_EDIT",
    0x1F: "EXIT_EDIT",
    0x21: "READ_PATCH_RESP",
    0x28: "WRITE_PATCH",
    0x31: "PARAM_CHANGE",
    0x50: "ENABLE_LIVE",
    0x51: "DISABLE_LIVE",
}

# Bit width table for patch decoding
BIT_TBL = [
    [7, 0, 0, 0, 0, 0, 0, 0],       # Row 0: Global (Level)
    [1, 2, 4, 2, 4, 6, 0, 0],       # Row 1: CMP
    [1, 5, 5, 5, 5, 6, 0, 0],       # Row 2: WAH
    [1, 0, 7, 7, 7, 0, 0, 0],       # Row 3: EXT
    [1, 2, 4, 0, 0, 0, 0, 0],       # Row 4: ZNR-A
    [1, 6, 7, 5, 7, 1, 0, 0],       # Row 5: AMP-A
    [1, 0, 5, 5, 5, 5, 5, 5],       # Row 6: EQ-A
    [1, 0, 1, 2, 2, 0, 0, 0],       # Row 7: CAB
    [1, 5, 11, 7, 7, 7, 0, 0],      # Row 8: MOD
    [1, 3, 13, 6, 6, 6, 0, 0],      # Row 9: DLY
    [1, 4, 5, 7, 4, 6, 0, 0],       # Row 10: REV
    [1, 2, 4, 1, 6, 7, 5, 7],       # Row 11: Extra (ZNR-B, AMP-B, EQ-B)
]

ROW_NAMES = [
    "GLOBAL", "CMP", "WAH", "EXT", "ZNR-A", "AMP-A",
    "EQ-A", "CAB", "MOD", "DLY", "REV", "EXTRA"
]

ROW_PARAM_NAMES = [
    ["Level", "", "", "", "", "", "", ""],
    ["On", "Type", "P1", "P2", "P3", "P4", "", ""],
    ["On", "Type", "P1", "P2", "P3", "Level", "", ""],
    ["On", "", "Send", "Return", "Dry", "", "", ""],
    ["On", "Type", "Threshold", "", "", "", "", ""],
    ["On", "Type", "Gain", "Tone", "Level", "Ch", "", ""],
    ["On", "", "B1", "B2", "B3", "B4", "B5", "B6"],
    ["On", "", "Depth", "MicType", "MicPos", "", "", ""],
    ["On", "Type", "P1", "P2", "P3", "P4", "", ""],
    ["On", "Type", "Time", "FeedBack", "HiDamp", "Mix", "", ""],
    ["On", "Type", "Decay", "PreDelay", "Tone", "Mix", "", ""],
    ["ZNR-On", "ZNR-Type", "ZNR-Thresh", "AMP-Ch", "AMP-Type", "AMP-Gain", "AMP-Tone", "AMP-Level"],
]


def decode_7bit(data):
    """Decode 7-bit encoded data to raw bytes"""
    result = bytearray()
    for i in range(0, len(data), 8):
        chunk = data[i:i+7]
        high_bits = data[i+7] if i+7 < len(data) else 0
        for j, byte in enumerate(chunk):
            if j < len(chunk):
                b = byte
                if high_bits & (1 << j):
                    b |= 0x80
                result.append(b)
    return bytes(result[:128])


def decode_nibbles(data):
    """Decode nibble-encoded data to raw bytes"""
    result = bytearray()
    for i in range(0, len(data), 2):
        high = data[i] & 0x0F
        low = data[i+1] & 0x0F
        result.append((high << 4) | low)
    return bytes(result)


def decode_patch_bits(raw_128):
    """Decode 128-byte patch data using bit width table"""
    # Convert to bit stream
    bits = []
    for byte in raw_128:
        for i in range(7, -1, -1):
            bits.append((byte >> i) & 1)

    rows = []
    bit_pos = 0
    for row_idx, row_widths in enumerate(BIT_TBL):
        row_values = []
        for width in row_widths:
            if width == 0:
                row_values.append(0)
                continue
            value = 0
            for i in range(width):
                if bit_pos < len(bits):
                    value = (value << 1) | bits[bit_pos]
                    bit_pos += 1
            row_values.append(value)
        rows.append(row_values)

    return rows


def extract_patch_name(raw_128):
    """Extract 10-char patch name from bytes 65-74"""
    name_bytes = raw_128[65:75]
    return bytes(b for b in name_bytes if 32 <= b < 127).decode('ascii', errors='replace').strip()


def print_patch(raw_128, label=""):
    """Pretty print decoded patch data"""
    if label:
        print(f"\n{'='*60}")
        print(f"  {label}")
        print(f"{'='*60}")

    name = extract_patch_name(raw_128)
    print(f"\n  Patch Name: \"{name}\"")
    print(f"  Raw hex (first 32 bytes): {raw_128[:32].hex(' ')}")
    print()

    rows = decode_patch_bits(raw_128)

    for row_idx, (row_values, row_name) in enumerate(zip(rows, ROW_NAMES)):
        param_names = ROW_PARAM_NAMES[row_idx]
        widths = BIT_TBL[row_idx]
        parts = []
        for col, (val, pname, w) in enumerate(zip(row_values, param_names, widths)):
            if w > 0 and pname:
                parts.append(f"{pname}={val}")
        if parts:
            print(f"  {row_name:8s} │ {', '.join(parts)}")

    print()


def parse_sysex_line(line):
    """Parse a SysEx line from aseqdump output"""
    match = re.search(r'F0\s+(.*?)\s*F7', line)
    if not match:
        return None
    hex_str = match.group(1)
    try:
        data = bytes.fromhex(hex_str.replace(' ', ''))
    except ValueError:
        return None
    return data


def analyze_message(data, source=""):
    """Analyze a single SysEx message"""
    if len(data) < 4:
        print(f"  [Too short: {len(data)} bytes]")
        return

    if data[0] != 0x52 or data[2] != 0x42:
        # Check for Universal SysEx
        if data[0] == 0x7E:
            print(f"  [{source}] Universal SysEx (Identity Request/Response)")
            return
        print(f"  [{source}] Unknown manufacturer: 0x{data[0]:02X}")
        return

    cmd = data[3]
    cmd_name = COMMAND_NAMES.get(cmd, f"UNKNOWN(0x{cmd:02X})")

    if cmd == 0x28:  # Write/Preview Patch
        encoded = data[4:]  # Skip header (52 00 42 28)
        if len(encoded) >= 147:
            raw = decode_7bit(encoded[:147])
            print(f"  [{source}] {cmd_name} ({len(data)} bytes)")
            print_patch(raw, f"Write/Preview Patch")
        else:
            print(f"  [{source}] {cmd_name} (incomplete: {len(encoded)} encoded bytes)")

    elif cmd == 0x21:  # Read Patch Response
        patch_num = data[4]
        nibbles = data[5:261]  # 256 nibbles
        raw = decode_nibbles(nibbles)
        print(f"  [{source}] {cmd_name} - Patch #{patch_num}")
        print_patch(raw, f"Read Response Patch #{patch_num}")

    elif cmd == 0x31:  # Parameter Change
        if len(data) >= 7:
            effect_id = data[4]
            param_id = data[5]
            value = data[6]
            extra = data[7] if len(data) > 7 else 0
            effect_name = EFFECT_NAMES.get(effect_id, f"0x{effect_id:02X}")
            print(f"  [{source}] {cmd_name}: {effect_name} param[0x{param_id:02X}] = {value} (0x{value:02X}) extra=0x{extra:02X}")

    elif cmd == 0x11:  # Read Patch Request
        patch_num = data[4] if len(data) > 4 else '?'
        print(f"  [{source}] {cmd_name}: Patch #{patch_num}")

    elif cmd in (0x12, 0x1F, 0x50, 0x51):
        print(f"  [{source}] {cmd_name}")

    else:
        print(f"  [{source}] {cmd_name} ({len(data)} bytes): {data[:20].hex(' ')}...")


def diff_patches(raw1, raw2, label1="Msg A", label2="Msg B"):
    """Show differences between two decoded patches"""
    rows1 = decode_patch_bits(raw1)
    rows2 = decode_patch_bits(raw2)

    diffs = []
    for row_idx in range(len(rows1)):
        for col in range(8):
            if BIT_TBL[row_idx][col] > 0 and rows1[row_idx][col] != rows2[row_idx][col]:
                pname = ROW_PARAM_NAMES[row_idx][col]
                diffs.append(f"  {ROW_NAMES[row_idx]}.{pname}: {rows1[row_idx][col]} → {rows2[row_idx][col]}")

    if diffs:
        print(f"\n  Diferencias entre {label1} y {label2}:")
        for d in diffs:
            print(d)
    else:
        print(f"\n  {label1} y {label2} son idénticos (a nivel de parámetros)")

    # Also check raw byte differences
    raw_diffs = []
    for i in range(min(len(raw1), len(raw2))):
        if raw1[i] != raw2[i]:
            raw_diffs.append(f"  Byte {i}: 0x{raw1[i]:02X} → 0x{raw2[i]:02X}")

    if raw_diffs:
        print(f"\n  Diferencias en bytes raw:")
        for d in raw_diffs[:20]:
            print(d)


def main():
    if len(sys.argv) < 2:
        print("Uso: python3 decode_capture.py <archivo.log>")
        print("      python3 decode_capture.py <archivo.log> --diff")
        sys.exit(1)

    filename = sys.argv[1]
    show_diff = "--diff" in sys.argv

    with open(filename) as f:
        lines = f.readlines()

    messages = []
    decoded_patches = []

    print(f"\n{'='*60}")
    print(f"  Análisis de captura: {filename}")
    print(f"{'='*60}")

    msg_num = 0
    for line in lines:
        line = line.strip()
        if 'System exclusive' not in line:
            continue

        # Determine source
        source = "G9ED→Pedal" if line.startswith("128:") else "Pedal→G9ED" if line.startswith("24:") else "Unknown"

        data = parse_sysex_line(line)
        if data is None:
            continue

        msg_num += 1
        print(f"\n--- Mensaje #{msg_num} ---")
        analyze_message(data, source)
        messages.append((source, data))

        # Store decoded patches for diff
        cmd = data[3] if len(data) > 3 else 0
        if cmd == 0x28 and len(data) >= 151:
            raw = decode_7bit(data[4:151])
            decoded_patches.append((msg_num, raw))

    # Show diffs between consecutive patches if requested
    if show_diff and len(decoded_patches) > 1:
        print(f"\n{'='*60}")
        print(f"  Comparación entre mensajes")
        print(f"{'='*60}")
        for i in range(len(decoded_patches) - 1):
            num1, raw1 = decoded_patches[i]
            num2, raw2 = decoded_patches[i+1]
            diff_patches(raw1, raw2, f"Msg #{num1}", f"Msg #{num2}")

    print(f"\n  Total: {msg_num} mensajes SysEx")
    print()


if __name__ == "__main__":
    main()
