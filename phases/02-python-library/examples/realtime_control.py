#!/usr/bin/env python3
"""
Example: Real-time parameter control

This example demonstrates how to:
- Control parameters in real-time
- Sweep through parameter values
- Toggle effects on/off

NOTE: The device must be in Edit Mode for parameter changes (0x31) to work.
The library automatically enters edit mode when set_parameter() is called.
When using the context manager, exit_edit_mode() is called automatically on exit.
"""

import sys
import time
sys.path.insert(0, "..")

from zoomg9 import G9Device, G9DeviceError


def sweep_parameter(device, effect, param, start, end, step=1, delay=0.05):
    """Sweep a parameter from start to end value."""
    print(f"Sweeping {effect}.{param} from {start} to {end}...")

    if start < end:
        values = range(start, end + 1, step)
    else:
        values = range(start, end - 1, -step)

    for value in values:
        device.set_parameter(effect, param, value)
        time.sleep(delay)


def demo_amp_gain(device):
    """Demo: Sweep amp gain up and down."""
    print("\n=== AMP Gain Demo ===")

    # Sweep gain from 0 to 100
    sweep_parameter(device, "amp", "gain", 0, 100, step=5)
    time.sleep(0.5)

    # Sweep back down
    sweep_parameter(device, "amp", "gain", 100, 50, step=5)
    print("Done!")


def demo_delay_mix(device):
    """Demo: Sweep delay mix."""
    print("\n=== Delay Mix Demo ===")

    # Sweep mix from 0 to 50 and back
    sweep_parameter(device, "delay", "mix", 0, 50, step=2)
    time.sleep(0.3)
    sweep_parameter(device, "delay", "mix", 50, 25, step=2)
    print("Done!")


def interactive_mode(device):
    """Interactive parameter control mode."""
    print("\n=== Interactive Mode ===")
    print("Enter commands in format: effect param value")
    print("Examples: amp gain 80, delay mix 30, reverb on 1")
    print("Type 'quit' to exit")

    while True:
        try:
            cmd = input("\n> ").strip()
            if cmd.lower() in ("quit", "exit", "q"):
                break

            if not cmd:
                continue

            parts = cmd.split()
            if len(parts) != 3:
                print("Format: effect param value")
                continue

            effect, param, value = parts
            value = int(value)

            device.set_parameter(effect, param, value)
            print(f"Set {effect}.{param} = {value}")

        except ValueError as e:
            print(f"Error: {e}")
        except KeyboardInterrupt:
            break


def main():
    print("Zoom G9.2tt Real-time Control")
    print("=" * 40)

    try:
        with G9Device() as device:
            print(f"Connected to: {device.port_name}")

            if len(sys.argv) > 1:
                # Run specific demo
                demo = sys.argv[1].lower()
                if demo == "amp":
                    demo_amp_gain(device)
                elif demo == "delay":
                    demo_delay_mix(device)
                elif demo == "interactive":
                    interactive_mode(device)
                else:
                    print(f"Unknown demo: {demo}")
                    print("Available: amp, delay, interactive")
            else:
                # Run all demos
                demo_amp_gain(device)
                time.sleep(1)
                demo_delay_mix(device)
                print("\nFor interactive mode, run: python realtime_control.py interactive")

    except G9DeviceError as e:
        print(f"\nError: {e}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
