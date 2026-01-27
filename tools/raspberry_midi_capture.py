#!/usr/bin/env python3
"""
Raspberry Pi MIDI Capture Tool for Zoom G9.2tt

This script captures MIDI traffic between G9ED (Wine) and the G9.2tt pedal.
It automatically validates the environment and configures everything needed.

Usage:
    sudo python3 midi_capture.py

The script will:
1. Check all dependencies (strace)
2. Verify G9ED is running under Wine
3. Verify UM-ONE MIDI interface is connected
4. Show current MIDI connections
5. Start capturing when ready

Requirements:
    - G9ED running under Wine
    - UM-ONE connected to the Raspberry Pi
    - strace installed (apt install strace)
"""

import os
import re
import subprocess
import sys
import time
import shutil
from datetime import datetime
from pathlib import Path


# Zoom G9.2tt Protocol Constants
ZOOM_MANUFACTURER = 0x52
G9TT_MODEL = 0x42

CMD_NAMES = {
    0x11: "READ_PATCH_REQ",
    0x12: "ENTER_EDIT",
    0x1F: "EXIT_EDIT",
    0x21: "READ_PATCH_RESP",
    0x28: "WRITE_PATCH",
    0x31: "PARAM_CHANGE",
    0x50: "ENABLE_LIVE (Online)",
    0x51: "DISABLE_LIVE (Offline)",
}

EFFECT_NAMES = {
    0x00: "TOP",
    0x01: "CMP",
    0x02: "WAH",
    0x03: "EXT",
    0x04: "ZNR",
    0x05: "AMP",
    0x06: "EQ",
    0x07: "CAB",
    0x08: "MOD",
    0x09: "DLY",
    0x0A: "REV",
    0x0B: "SYNC",
}


class Colors:
    """ANSI color codes for terminal output."""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'


def print_status(message, status="info"):
    """Print a status message with color."""
    if status == "ok":
        print(f"  {Colors.GREEN}✓{Colors.END} {message}")
    elif status == "error":
        print(f"  {Colors.RED}✗{Colors.END} {message}")
    elif status == "warn":
        print(f"  {Colors.YELLOW}!{Colors.END} {message}")
    elif status == "info":
        print(f"  {Colors.BLUE}→{Colors.END} {message}")


def print_header(title):
    """Print a section header."""
    print(f"\n{Colors.BOLD}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{title}{Colors.END}")
    print(f"{Colors.BOLD}{'='*60}{Colors.END}")


def run_command(cmd, capture=True):
    """Run a shell command and return output."""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=capture,
            text=True,
            timeout=10
        )
        return result.returncode == 0, result.stdout.strip(), result.stderr.strip()
    except subprocess.TimeoutExpired:
        return False, "", "Command timed out"
    except Exception as e:
        return False, "", str(e)


def check_root():
    """Check if running as root."""
    return os.geteuid() == 0


def check_strace():
    """Check if strace is installed."""
    return shutil.which("strace") is not None


def install_strace():
    """Attempt to install strace."""
    print_status("Installing strace...")
    success, _, _ = run_command("apt-get update && apt-get install -y strace")
    return success


def find_g9ed_pid():
    """Find the PID of G9ED.exe process."""
    success, stdout, _ = run_command("pgrep -f G9ED.exe")
    if success and stdout:
        pids = stdout.split('\n')
        return int(pids[0]) if pids[0] else None
    return None


def check_umone():
    """Check if UM-ONE is connected."""
    success, stdout, _ = run_command("aconnect -l")
    if success:
        return "UM-ONE" in stdout
    return False


def get_midi_status():
    """Get current MIDI connection status."""
    success, stdout, _ = run_command("aconnect -l")
    if success:
        return stdout
    return None


def get_alsa_cards():
    """Get ALSA sound cards."""
    success, stdout, _ = run_command("cat /proc/asound/cards")
    if success:
        return stdout
    return None


def check_wine_running():
    """Check if Wine is running."""
    success, stdout, _ = run_command("pgrep -f wineserver")
    return success and bool(stdout.strip())


def parse_sysex_hex(hex_str):
    """Parse a hex string like \\xf0\\x52... into bytes and interpret."""
    hex_bytes = re.findall(r'\\x([0-9a-fA-F]{2})', hex_str)
    if not hex_bytes:
        return None

    data = bytes(int(h, 16) for h in hex_bytes)

    if len(data) >= 5 and data[0] == 0xF0 and data[1] == ZOOM_MANUFACTURER and data[3] == G9TT_MODEL:
        cmd = data[4]
        cmd_name = CMD_NAMES.get(cmd, f"UNKNOWN_0x{cmd:02X}")

        result = {
            "raw": data.hex(' ').upper(),
            "command": cmd_name,
            "cmd_byte": cmd,
            "length": len(data),
        }

        if cmd == 0x31 and len(data) >= 8:
            effect_id = data[5]
            param_id = data[6]
            value = data[7]
            result["effect"] = EFFECT_NAMES.get(effect_id, f"0x{effect_id:02X}")
            result["param_id"] = param_id
            result["value"] = value
            result["detail"] = f"{result['effect']}.param{param_id}={value}"
        elif cmd == 0x28:
            result["detail"] = f"Patch data ({len(data)} bytes)"

        return result
    return None


def validate_environment():
    """Validate the environment and return True if ready."""
    print_header("Environment Check")

    all_ok = True

    # Check root
    print("\n1. Checking permissions...")
    if check_root():
        print_status("Running as root", "ok")
    else:
        print_status("Not running as root - strace may fail", "error")
        print_status("Run with: sudo python3 midi_capture.py", "info")
        all_ok = False

    # Check strace
    print("\n2. Checking strace...")
    if check_strace():
        print_status("strace is installed", "ok")
    else:
        print_status("strace not found", "error")
        if check_root():
            print_status("Attempting to install strace...", "info")
            if install_strace():
                print_status("strace installed successfully", "ok")
            else:
                print_status("Failed to install strace", "error")
                print_status("Install manually: sudo apt install strace", "info")
                all_ok = False
        else:
            print_status("Install with: sudo apt install strace", "info")
            all_ok = False

    # Check UM-ONE
    print("\n3. Checking UM-ONE MIDI interface...")
    if check_umone():
        print_status("UM-ONE detected", "ok")
    else:
        print_status("UM-ONE not found", "error")
        print_status("Connect UM-ONE USB cable to Raspberry Pi", "info")
        all_ok = False

    # Check Wine
    print("\n4. Checking Wine...")
    if check_wine_running():
        print_status("Wine is running", "ok")
    else:
        print_status("Wine not running", "warn")
        print_status("Start G9ED first: wine ~/g9ed/G9ED.exe", "info")

    # Check G9ED
    print("\n5. Checking G9ED...")
    pid = find_g9ed_pid()
    if pid:
        print_status(f"G9ED.exe found (PID: {pid})", "ok")
    else:
        print_status("G9ED.exe not running", "error")
        print_status("Start G9ED: wine ~/g9ed/G9ED.exe", "info")
        all_ok = False

    # Show MIDI status
    print("\n6. Current MIDI connections:")
    midi_status = get_midi_status()
    if midi_status:
        for line in midi_status.split('\n'):
            if line.strip():
                print(f"     {line}")

    # Show ALSA cards
    print("\n7. ALSA sound cards:")
    cards = get_alsa_cards()
    if cards:
        for line in cards.split('\n'):
            if line.strip():
                print(f"     {line}")

    return all_ok, pid


def run_capture(pid, output_dir):
    """Run strace capture on the G9ED process."""
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    raw_log = output_dir / f"capture_{timestamp}_raw.log"
    parsed_log = output_dir / f"capture_{timestamp}_parsed.log"

    print_header("MIDI Capture")
    print(f"\n  G9ED PID:    {pid}")
    print(f"  Raw log:     {raw_log}")
    print(f"  Parsed log:  {parsed_log}")

    print(f"\n{Colors.YELLOW}Instructions:{Colors.END}")
    print("  1. Go to G9ED window")
    print("  2. Click 'Offline' (if currently Online)")
    print("  3. Click 'Online'")
    print("  4. Make parameter changes (turn knobs, toggle effects)")
    print("  5. Press Ctrl+C here to stop capture")

    print(f"\n{Colors.GREEN}Capturing... Press Ctrl+C to stop{Colors.END}\n")

    strace_cmd = [
        "strace",
        "-p", str(pid),
        "-e", "write",
        "-s", "9999",
        "-x"
    ]

    messages = []

    try:
        proc = subprocess.Popen(
            strace_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )

        with open(raw_log, 'w') as raw_f:
            for line in proc.stdout:
                raw_f.write(line)
                raw_f.flush()

                if '\\xf0\\x52\\x00\\x42' in line:
                    match = re.search(r'\\xf0\\x52[^"]+', line)
                    if match:
                        parsed = parse_sysex_hex(match.group())
                        if parsed:
                            messages.append(parsed)
                            detail = parsed.get('detail', '')
                            print(f"  [{len(messages):3d}] {parsed['command']:25s} {detail}")

    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Stopping capture...{Colors.END}")
        proc.terminate()
        proc.wait(timeout=5)

    # Write parsed log
    with open(parsed_log, 'w') as f:
        f.write(f"# MIDI Capture - {timestamp}\n")
        f.write(f"# G9ED PID: {pid}\n")
        f.write(f"# Total messages: {len(messages)}\n\n")

        for i, msg in enumerate(messages, 1):
            f.write(f"[{i:3d}] {msg['command']}\n")
            if 'detail' in msg:
                f.write(f"      {msg['detail']}\n")
            f.write(f"      {msg['raw']}\n\n")

    # Print summary
    print_header("Capture Summary")
    print(f"\n  Total messages: {len(messages)}")

    if messages:
        cmd_counts = {}
        for msg in messages:
            cmd = msg['command']
            cmd_counts[cmd] = cmd_counts.get(cmd, 0) + 1

        print("\n  Command frequency:")
        for cmd, count in sorted(cmd_counts.items(), key=lambda x: -x[1]):
            print(f"    {cmd}: {count}")

    print(f"\n  Logs saved to:")
    print(f"    {raw_log}")
    print(f"    {parsed_log}")

    return messages


def main():
    print_header("Zoom G9.2tt MIDI Capture Tool")
    print("\n  This tool captures MIDI traffic between G9ED and the pedal.")
    print("  It uses strace to intercept Wine's MIDI writes.")

    # Validate environment
    ready, pid = validate_environment()

    if not ready:
        print_header("Setup Required")
        print(f"\n  {Colors.RED}Environment not ready for capture.{Colors.END}")
        print("  Please fix the issues above and try again.")
        return 1

    # Confirm ready to capture
    print_header("Ready to Capture")
    print(f"\n  {Colors.GREEN}Environment is ready!{Colors.END}")

    try:
        input("\n  Press Enter to start capture (or Ctrl+C to exit)...")
    except KeyboardInterrupt:
        print("\n\n  Cancelled.")
        return 0

    # Run capture
    output_dir = Path.home() / "midi_captures"

    try:
        run_capture(pid, output_dir)
    except PermissionError:
        print(f"\n  {Colors.RED}Permission denied.{Colors.END}")
        print("  Run with: sudo python3 midi_capture.py")
        return 1
    except Exception as e:
        print(f"\n  {Colors.RED}Error: {e}{Colors.END}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
