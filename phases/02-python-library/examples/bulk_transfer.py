#!/usr/bin/env python3
"""
Example: Bulk read/write all patches

This example demonstrates how to:
- Read all 100 patches from the device
- Save patches to files
- Load patches from files
- Write all patches to the device
"""

import sys
import os
import json
sys.path.insert(0, "..")

from zoomg9 import G9Device, G9DeviceError, Patch


def progress_bar(current, total, width=40):
    """Display a progress bar."""
    pct = current / total
    filled = int(width * pct)
    bar = "=" * filled + "-" * (width - filled)
    print(f"\r[{bar}] {current}/{total} ({pct*100:.0f}%)", end="", flush=True)


def save_patches_json(patches, filename):
    """Save patches to a JSON file."""
    data = []
    for i, patch in enumerate(patches):
        patch_data = {
            "number": i,
            "name": patch.name,
            "level": patch.level,
            "tempo": patch.tempo,
            "amp_sel": patch.amp_sel,
            "raw": patch.to_bytes().hex(),
        }
        data.append(patch_data)

    with open(filename, "w") as f:
        json.dump(data, f, indent=2)

    print(f"Saved {len(patches)} patches to {filename}")


def load_patches_json(filename):
    """Load patches from a JSON file."""
    with open(filename, "r") as f:
        data = json.load(f)

    patches = []
    for entry in data:
        raw = bytes.fromhex(entry["raw"])
        patch = Patch.from_bytes(raw)
        patches.append(patch)

    print(f"Loaded {len(patches)} patches from {filename}")
    return patches


def save_patches_binary(patches, directory):
    """Save patches as individual .syx files."""
    os.makedirs(directory, exist_ok=True)

    for i, patch in enumerate(patches):
        filename = os.path.join(directory, f"patch_{i:02d}_{patch.name.strip()}.bin")
        with open(filename, "wb") as f:
            f.write(patch.to_bytes())

    print(f"Saved {len(patches)} patches to {directory}/")


def cmd_backup(device, filename):
    """Backup all patches to a file."""
    print(f"\nBacking up all patches to {filename}...")

    def progress(current, total):
        progress_bar(current, total)

    patches = device.read_all(progress_callback=progress)
    print()  # New line after progress bar

    save_patches_json(patches, filename)


def cmd_restore(device, filename):
    """Restore all patches from a file."""
    print(f"\nRestoring patches from {filename}...")

    patches = load_patches_json(filename)

    if len(patches) != 100:
        print(f"Warning: expected 100 patches, got {len(patches)}")
        return

    confirm = input("This will overwrite all patches. Continue? [y/N] ")
    if confirm.lower() != "y":
        print("Cancelled.")
        return

    def progress(current, total):
        progress_bar(current, total)

    device.write_all(patches, progress_callback=progress)
    print()  # New line after progress bar
    print("Restore complete!")


def cmd_list(device):
    """List all patch names."""
    print("\nReading patch names...")

    def progress(current, total):
        progress_bar(current, total)

    patches = device.read_all(progress_callback=progress)
    print()  # New line after progress bar

    print("\nPatch List:")
    print("-" * 30)
    for i, patch in enumerate(patches):
        print(f"  {i:2d}: {patch.name}")


def main():
    if len(sys.argv) < 2:
        print("Zoom G9.2tt Bulk Transfer")
        print("=" * 40)
        print(f"\nUsage: {sys.argv[0]} <command> [args]")
        print("\nCommands:")
        print("  list               List all patch names")
        print("  backup <file>      Backup all patches to JSON file")
        print("  restore <file>     Restore all patches from JSON file")
        return 1

    command = sys.argv[1].lower()

    try:
        with G9Device() as device:
            print(f"Connected to: {device.port_name}")

            if command == "list":
                cmd_list(device)

            elif command == "backup":
                if len(sys.argv) < 3:
                    print("Usage: backup <filename.json>")
                    return 1
                cmd_backup(device, sys.argv[2])

            elif command == "restore":
                if len(sys.argv) < 3:
                    print("Usage: restore <filename.json>")
                    return 1
                cmd_restore(device, sys.argv[2])

            else:
                print(f"Unknown command: {command}")
                return 1

    except G9DeviceError as e:
        print(f"\nError: {e}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
