#!/usr/bin/env python3
"""
Example: Write a patch to the G9.2tt

This example demonstrates how to:
- Connect to the device
- Read, modify, and write a patch
- Rename a patch
"""

import sys
sys.path.insert(0, "..")

from zoomg9 import G9Device, G9DeviceError, Patch


def main():
    if len(sys.argv) < 3:
        print(f"Usage: {sys.argv[0]} <patch_number> <new_name>")
        print(f"Example: {sys.argv[0]} 0 'My Patch'")
        return 1

    patch_num = int(sys.argv[1])
    new_name = sys.argv[2]

    print("Zoom G9.2tt Patch Writer")
    print("=" * 40)

    try:
        with G9Device() as device:
            print(f"Connected to: {device.port_name}")

            # Read current patch
            print(f"\nReading patch {patch_num}...")
            patch = device.read_patch(patch_num)
            print(f"Current name: '{patch.name}'")

            # Modify patch
            old_name = patch.name
            patch.name = new_name
            print(f"New name: '{patch.name}'")

            # Write patch back
            print(f"\nWriting patch {patch_num}...")
            device.write_patch(patch_num, patch)
            print("Write successful!")

            # Verify by reading again
            print("\nVerifying...")
            verify = device.read_patch(patch_num)
            if verify.name == new_name:
                print(f"Verified: patch renamed from '{old_name}' to '{verify.name}'")
            else:
                print(f"Warning: verification failed, got '{verify.name}'")

    except G9DeviceError as e:
        print(f"\nError: {e}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
