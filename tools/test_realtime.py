#!/usr/bin/env python3
"""
Test: Program Change + SYNC + COMP toggle
Based on G9ED captures - includes SYNC heartbeat
"""
import sys
import time

try:
    import mido
except ImportError:
    print("Error: mido not installed. Run: pip install mido python-rtmidi")
    sys.exit(1)

def find_port():
    outputs = mido.get_output_names()
    print(f"Available ports: {outputs}")
    for name in outputs:
        if 'UM-ONE' in name or 'G9' in name or 'MIDI' in name:
            return name
    if outputs:
        return outputs[0]
    return None

def send_program_change(port, patch_num):
    msg = mido.Message('program_change', program=patch_num)
    port.send(msg)
    print(f"  -> Program Change: patch {patch_num:02d}")

def send_sysex(port, data, label=""):
    msg = mido.Message('sysex', data=data)
    port.send(msg)
    hex_str = ' '.join(f'{b:02X}' for b in data)
    print(f"  -> SysEx: F0 {hex_str} F7  {label}")

def send_param_change(port, effect_id, param_id, value, label=""):
    data = [0x52, 0x00, 0x42, 0x31, effect_id, param_id, value, 0x00]
    send_sysex(port, data, label)

def send_sync(port, value=0x50):
    """Send SYNC heartbeat (module 0x0B) - seen in G9ED captures"""
    data = [0x52, 0x00, 0x42, 0x31, 0x0B, 0x00, value, 0x00]
    send_sysex(port, data, "(SYNC heartbeat)")

def main():
    port_name = find_port()
    if not port_name:
        print("No MIDI port found!")
        sys.exit(1)

    print(f"Using port: {port_name}\n")

    with mido.open_output(port_name) as port:
        # Select patch 00
        print("=== Selecting patch 00 ===")
        send_program_change(port, 0)
        time.sleep(0.5)

        # Send SYNC heartbeat (like G9ED does)
        print("\n=== Sending SYNC heartbeat ===")
        send_sync(port, 0x50)
        time.sleep(0.2)

        # Test COMP On/Off
        print("\n=== Testing COMP On/Off ===")

        print("\n1. Turning COMP OFF...")
        send_param_change(port, 0x01, 0x00, 0x00, "(COMP Off)")
        time.sleep(0.1)
        # G9ED sends multiple times
        send_param_change(port, 0x01, 0x00, 0x00, "(repeat)")
        time.sleep(2)

        print("\n2. Turning COMP ON...")
        send_param_change(port, 0x01, 0x00, 0x01, "(COMP On)")
        time.sleep(0.1)
        send_param_change(port, 0x01, 0x00, 0x01, "(repeat)")
        time.sleep(2)

        print("\n3. Turning COMP OFF...")
        send_param_change(port, 0x01, 0x00, 0x00, "(COMP Off)")
        time.sleep(0.1)
        send_param_change(port, 0x01, 0x00, 0x00, "(repeat)")

        print("\n=== Done! Did the COMP LED toggle? ===")

if __name__ == '__main__':
    main()
