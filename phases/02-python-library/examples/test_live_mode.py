#!/usr/bin/env python3
"""
Test: Verify Live Mode functionality

This test verifies that the live mode protocol works correctly:
1. Enable Live (0x50) - "Online"
2. Param Change (0x31) - Real-time parameter updates
3. Disable Live (0x51) - "Offline" (on disconnect)

Run this to verify real-time parameter changes work on your device.
"""

import sys
import time
sys.path.insert(0, "..")

from zoomg9 import G9Device, G9DeviceError


def main():
    print("Test: Live Mode Protocol")
    print("=" * 50)

    try:
        with G9Device() as device:
            print(f"Connected to: {device.port_name}")
            print()

            # Step 1: Enable live mode (sends 0x50 "Online")
            print("1. Enabling live mode (0x50)...")
            device.enable_live_mode()
            print("   OK - Live mode enabled")
            print()

            # Step 2: Read current patch to show initial state
            print("2. Reading patch 0...")
            patch = device.read_patch(0)
            print(f"   Patch name: {patch.name}")
            print(f"   COMP on: {patch.comp.on}")
            print()

            # Step 3: Toggle compressor
            print("3. Toggle COMP every second (Ctrl+C to stop)")
            print()

            comp_state = patch.comp.on

            while True:
                comp_state = not comp_state
                device.set_parameter("comp", "on", 1 if comp_state else 0)
                print(f'   COMP: {"ON" if comp_state else "OFF"}')
                time.sleep(1)

    except KeyboardInterrupt:
        print('\n\nTest stopped')
    except G9DeviceError as e:
        print(f"\nError: {e}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
