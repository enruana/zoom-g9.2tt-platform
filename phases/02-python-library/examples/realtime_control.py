#!/usr/bin/env python3
"""
Example: Real-time parameter control

This example demonstrates how to:
- Enable live mode for real-time parameter changes
- Sweep through parameter values
- Toggle effects on/off

The library uses the protocol discovered from G9ED:
1. Send Enable Live (0x50) - "Online"
2. Send Param Change (0x31) for real-time updates
3. Send Disable Live (0x51) - "Offline" when done
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


def demo_comp_toggle(device):
    """Demo: Toggle compressor on/off."""
    print("\n=== Compressor Toggle Demo ===")
    print("Toggling COMP every second (Ctrl+C to stop)...")

    try:
        state = False
        while True:
            state = not state
            device.set_parameter("comp", "on", 1 if state else 0)
            print(f"  COMP: {'ON' if state else 'OFF'}")
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopped")


def interactive_mode(device):
    """Interactive parameter control mode."""
    print("\n=== Interactive Mode ===")
    print("Enter commands in format: effect param value")
    print("Examples: amp gain 80, delay mix 30, comp on 1")
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

            # Enable live mode explicitly (optional, set_parameter does this automatically)
            print("Enabling live mode...")
            device.enable_live_mode()
            print("Live mode enabled!")

            if len(sys.argv) > 1:
                # Run specific demo
                demo = sys.argv[1].lower()
                if demo == "amp":
                    demo_amp_gain(device)
                elif demo == "delay":
                    demo_delay_mix(device)
                elif demo == "comp":
                    demo_comp_toggle(device)
                elif demo == "interactive":
                    interactive_mode(device)
                else:
                    print(f"Unknown demo: {demo}")
                    print("Available: amp, delay, comp, interactive")
            else:
                # Show help
                print("\nAvailable demos:")
                print("  python realtime_control.py amp         - Sweep amp gain")
                print("  python realtime_control.py delay       - Sweep delay mix")
                print("  python realtime_control.py comp        - Toggle compressor")
                print("  python realtime_control.py interactive - Interactive mode")
                print("\nRunning amp demo by default...")
                demo_amp_gain(device)

    except G9DeviceError as e:
        print(f"\nError: {e}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
