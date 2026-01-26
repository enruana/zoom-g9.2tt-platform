#!/usr/bin/env python3
"""
Example: Read a patch from the G9.2tt

This example demonstrates how to:
- Connect to the device
- Read a patch
- Display patch information
"""

import sys
sys.path.insert(0, "..")

from zoomg9 import G9Device, G9DeviceError


def main():
    # Parse command line argument for patch number
    patch_num = 0
    if len(sys.argv) > 1:
        try:
            patch_num = int(sys.argv[1])
        except ValueError:
            print(f"Usage: {sys.argv[0]} [patch_number]")
            return 1

    print("Zoom G9.2tt Patch Reader")
    print("=" * 40)

    # List available MIDI ports
    ports = G9Device.list_ports()
    print("\nAvailable MIDI ports:")
    print(f"  Input:  {ports['input']}")
    print(f"  Output: {ports['output']}")

    try:
        # Connect to device
        device = G9Device()
        device.connect()
        print(f"\nConnected to: {device.port_name}")

        # Query identity
        identity = device.identity()
        if identity["valid"]:
            print(f"Device: Manufacturer 0x{identity['manufacturer']:02X}, "
                  f"Model 0x{identity['model']:02X}")
            if identity["firmware"]:
                print(f"Firmware: {identity['firmware']}")

        # Read patch
        print(f"\nReading patch {patch_num}...")
        patch = device.read_patch(patch_num)

        # Display patch info
        print("\n" + patch.summary())

        # Disconnect
        device.disconnect()
        print("\nDisconnected.")

    except G9DeviceError as e:
        print(f"\nError: {e}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
