"""
Zoom G9.2tt Device Communication

Main device class for MIDI communication with the G9.2tt.

FUNCIONALIDAD PROBADA (2026-01-26):
    ✓ connect/disconnect - Conexión MIDI
    ✓ identity - Consultar info del dispositivo
    ✓ select_patch - Cambiar patch activo (Program Change)
    ✓ read_patch - Leer un patch
    ✓ read_all - Leer todos los patches
    ✓ set_parameter - Control en tiempo real (comando 0x31)
    ✓ write_patch - Escribir patch via bulk write (checksum CRC-32 descifrado 2026-01-26)
    ✓ write_all - Escribir todos los patches
"""

import time
from typing import Optional, List, Callable

try:
    import mido
except ImportError:
    mido = None

from .constants import (
    PATCH_COUNT,
    EFFECT_NAMES,
    PARAM_RANGES,
)
from .protocol import (
    build_read_request,
    build_enter_edit,
    build_exit_edit,
    build_write_data,
    build_param_change,
    build_patch_select,
    build_read_response,
    build_identity_request,
    build_enable_live,
    build_disable_live,
    parse_read_response,
    parse_identity_response,
)
from .patch import Patch


class G9DeviceError(Exception):
    """Exception raised for G9.2tt device errors."""
    pass


class G9Device:
    """
    Main interface for communicating with the Zoom G9.2tt.

    Example usage:
        device = G9Device()
        device.connect()

        # Read a patch
        patch = device.read_patch(0)
        print(patch.name, patch.amp.type_name)

        # Modify and write
        patch.amp.gain = 80
        device.write_patch(0, patch)

        device.disconnect()
    """

    def __init__(self, port_name: Optional[str] = None):
        """
        Initialize the device interface.

        Args:
            port_name: Specific MIDI port name to use.
                      If None, will auto-detect on connect().
        """
        if mido is None:
            raise ImportError(
                "mido is required for MIDI communication. "
                "Install with: pip install mido python-rtmidi"
            )

        self.port_name = port_name
        self._inport = None
        self._outport = None
        self._connected = False
        self._in_edit_mode = False
        self._in_live_mode = False

    @property
    def connected(self) -> bool:
        """Whether the device is currently connected."""
        return self._connected

    @staticmethod
    def list_ports() -> dict:
        """
        List available MIDI ports.

        Returns:
            Dictionary with 'input' and 'output' port lists
        """
        if mido is None:
            return {"input": [], "output": []}

        return {
            "input": list(mido.get_input_names()),
            "output": list(mido.get_output_names()),
        }

    def _find_port(self) -> Optional[str]:
        """Auto-detect the G9.2tt MIDI port."""
        outputs = mido.get_output_names()

        # Priority search terms
        search_terms = ["G9", "UM-ONE", "MIDI", "USB"]

        for term in search_terms:
            for name in outputs:
                if term in name:
                    return name

        # Fall back to first available port
        if outputs:
            return outputs[0]

        return None

    def connect(self, port_name: Optional[str] = None) -> bool:
        """
        Connect to the G9.2tt.

        Args:
            port_name: Optional port name override

        Returns:
            True if connection successful

        Raises:
            G9DeviceError: If connection fails
        """
        if self._connected:
            return True

        if port_name:
            self.port_name = port_name
        elif not self.port_name:
            self.port_name = self._find_port()

        if not self.port_name:
            raise G9DeviceError("No MIDI port found")

        try:
            self._outport = mido.open_output(self.port_name)
            self._inport = mido.open_input(self.port_name)
            self._connected = True
            return True
        except Exception as e:
            raise G9DeviceError(f"Failed to connect: {e}")

    def disconnect(self):
        """Disconnect from the G9.2tt."""
        if self._in_live_mode:
            try:
                self.disable_live_mode()
            except Exception:
                pass

        if self._in_edit_mode:
            try:
                self.exit_edit_mode()
            except Exception:
                pass

        if self._outport:
            self._outport.close()
            self._outport = None

        if self._inport:
            self._inport.close()
            self._inport = None

        self._connected = False

    def _send_sysex(self, data: bytes):
        """Send a SysEx message."""
        if not self._connected:
            raise G9DeviceError("Not connected")

        # mido expects data without F0/F7
        if data[0] == 0xF0:
            data = data[1:]
        if data[-1] == 0xF7:
            data = data[:-1]

        msg = mido.Message("sysex", data=list(data))
        self._outport.send(msg)

    def _receive_sysex(self, timeout: float = 2.0) -> Optional[bytes]:
        """Receive a SysEx message with timeout."""
        if not self._connected:
            raise G9DeviceError("Not connected")

        start = time.time()
        while time.time() - start < timeout:
            for msg in self._inport.iter_pending():
                if msg.type == "sysex":
                    return bytes([0xF0] + list(msg.data) + [0xF7])
            time.sleep(0.01)
        return None

    def enter_edit_mode(self):
        """Enter edit mode (required before write operations)."""
        if self._in_edit_mode:
            return

        self._send_sysex(build_enter_edit())
        time.sleep(0.1)
        self._in_edit_mode = True

    def exit_edit_mode(self):
        """Exit edit mode."""
        if not self._in_edit_mode:
            return

        self._send_sysex(build_exit_edit())
        time.sleep(0.1)
        self._in_edit_mode = False

    def enable_live_mode(self):
        """
        Enable live/real-time mode for parameter changes.

        Sends command 0x50 ("Online" in G9ED).
        After this, parameter changes (0x31) will affect the sound in real-time.
        """
        if self._in_live_mode:
            return

        self._send_sysex(build_enable_live())
        time.sleep(0.1)
        self._in_live_mode = True

    def disable_live_mode(self):
        """
        Disable live/real-time mode.

        Sends command 0x51 ("Offline" in G9ED).
        """
        if not self._in_live_mode:
            return

        self._send_sysex(build_disable_live())
        time.sleep(0.1)
        self._in_live_mode = False

    def identity(self) -> dict:
        """
        Query device identity.

        Returns:
            Dictionary with manufacturer, model, firmware info
        """
        self._send_sysex(build_identity_request())
        response = self._receive_sysex(timeout=2.0)

        if response:
            return parse_identity_response(response)
        return {"valid": False}

    def select_patch(self, patch_num: int):
        """
        Select/activate a patch on the device.

        This changes the currently active patch that you hear.

        Args:
            patch_num: Patch number (0-99)
        """
        if not 0 <= patch_num <= 99:
            raise ValueError(f"Patch number must be 0-99, got {patch_num}")

        msg = mido.Message("program_change", program=patch_num)
        self._outport.send(msg)

    def read_patch(self, patch_num: int) -> Patch:
        """
        Read a patch from the device.

        Args:
            patch_num: Patch number (0-99)

        Returns:
            Patch object with all parameters

        Raises:
            G9DeviceError: If read fails
        """
        if not 0 <= patch_num <= 99:
            raise ValueError(f"Patch number must be 0-99, got {patch_num}")

        self._send_sysex(build_read_request(patch_num))
        response = self._receive_sysex(timeout=3.0)

        if not response or len(response) != 268:
            raise G9DeviceError(f"Failed to read patch {patch_num}")

        _, decoded = parse_read_response(response)
        return Patch.from_bytes(decoded)

    def write_patch(self, patch_num: int, patch: Patch):
        """
        Write a single patch to the device using bulk write protocol.

        This method uses the bulk write protocol where:
        1. Host sends ENTER_EDIT (0x12)
        2. Pedal (in BULK RX mode) sends READ_REQ (0x11) for each patch
        3. Host responds with READ_RESP (0x21) containing the patch data

        IMPORTANT: The pedal must be in BULK RX mode before calling this method.

        Args:
            patch_num: Patch number (0-99)
            patch: Patch object to write

        Raises:
            G9DeviceError: If write fails
            ValueError: If patch_num is out of range
        """
        if not 0 <= patch_num <= 99:
            raise ValueError(f"Patch number must be 0-99, got {patch_num}")

        # For single patch write, we need to do a full bulk write
        # but only modify the requested patch
        patches = self.read_all()
        patches[patch_num] = patch
        self.write_all(patches)

    def set_parameter(self, effect: str, param: str, value: int):
        """
        Set an effect parameter in real-time.

        NOTE: The device must be in live mode for real-time changes to work.
        This method automatically enables live mode if not already enabled.

        Args:
            effect: Effect name (amp, delay, reverb, etc.)
            param: Parameter name (gain, time, mix, etc.)
            value: New value

        Raises:
            ValueError: If effect/param not found or value out of range
        """
        # Enable live mode if not already (required for 0x31 commands to work)
        if not self._in_live_mode:
            self.enable_live_mode()
        # Map effect name to ID
        effect_map = {
            "top": 0x00,
            "cmp": 0x01, "comp": 0x01, "compressor": 0x01,
            "wah": 0x02,
            "ext": 0x03,
            "znr": 0x04,
            "amp": 0x05,
            "eq": 0x06,
            "cab": 0x07,
            "mod": 0x08,
            "dly": 0x09, "delay": 0x09,
            "rev": 0x0A, "reverb": 0x0A,
        }

        effect_lower = effect.lower()
        if effect_lower not in effect_map:
            raise ValueError(f"Unknown effect: {effect}")

        effect_id = effect_map[effect_lower]

        # Map param name to ID
        param_map = {
            "on": 0x00, "onoff": 0x00,
            "type": 0x01,
            "gain": 0x02, "sense": 0x02, "depth": 0x02, "time": 0x02, "decay": 0x02,
            "send": 0x02, "band1": 0x02,
            "tone": 0x03, "attack": 0x03, "rate": 0x03, "feedback": 0x03,
            "predelay": 0x03, "return": 0x03, "band2": 0x03,
            "level": 0x04, "resonance": 0x04, "hidamp": 0x04, "dry": 0x04,
            "band3": 0x04, "mictype": 0x03, "micpos": 0x04,
            "mix": 0x05, "band4": 0x05,
            "band5": 0x06, "band6": 0x07,
        }

        param_lower = param.lower()
        if param_lower not in param_map:
            raise ValueError(f"Unknown parameter: {param}")

        param_id = param_map[param_lower]

        # Validate value range
        if effect_id in PARAM_RANGES and param_id in PARAM_RANGES[effect_id]:
            min_val, max_val = PARAM_RANGES[effect_id][param_id]
            if not min_val <= value <= max_val:
                raise ValueError(f"Value must be {min_val}-{max_val}, got {value}")

        # Handle values > 127 (need special encoding)
        if value > 127:
            raise ValueError("Values > 127 require special handling (not yet implemented)")

        self._send_sysex(build_param_change(effect_id, param_id, value))

    def read_all(self, progress_callback: Optional[Callable[[int, int], None]] = None) -> List[Patch]:
        """
        Read all patches from the device.

        Args:
            progress_callback: Optional callback(current, total) for progress updates

        Returns:
            List of 100 Patch objects
        """
        patches = []

        for i in range(PATCH_COUNT):
            patch = self.read_patch(i)
            patches.append(patch)

            if progress_callback:
                progress_callback(i + 1, PATCH_COUNT)

        return patches

    def write_all(
        self,
        patches: List[Patch],
        progress_callback: Optional[Callable[[int, int], None]] = None,
        timeout: float = 5.0
    ):
        """
        Write all patches to the device using bulk write protocol.

        Protocol (discovered by analyzing G9ED):
        1. Host sends ENTER_EDIT (0x12)
        2. User puts pedal in BULK RX mode
        3. Pedal sends READ_REQ (0x11) for each patch it wants
        4. Host responds with READ_RESP (0x21) containing patch data + CRC-32 checksum
        5. Pedal sends EXIT_EDIT (0x1F) when done

        IMPORTANT: The pedal must be in BULK RX mode before calling this method.
        The method will wait for the pedal to request patches.

        Args:
            patches: List of 100 Patch objects
            progress_callback: Optional callback(current, total) for progress updates
            timeout: Timeout in seconds waiting for pedal requests

        Raises:
            G9DeviceError: If write fails or times out
            ValueError: If patches list is not exactly 100 items
        """
        if len(patches) != PATCH_COUNT:
            raise ValueError(f"Expected {PATCH_COUNT} patches, got {len(patches)}")

        # Convert patches to raw bytes
        patches_data = [p.to_bytes() for p in patches]

        # Send ENTER_EDIT to signal we're ready
        self._send_sysex(build_enter_edit())

        count = 0
        consecutive_errors = 0

        while True:
            # Wait for pedal to request a patch
            response = self._receive_sysex(timeout=timeout)

            if not response:
                consecutive_errors += 1
                if consecutive_errors >= 3:
                    if count == 0:
                        raise G9DeviceError(
                            "No response from pedal. Make sure it's in BULK RX mode."
                        )
                    break
                continue

            consecutive_errors = 0
            cmd = response[4] if len(response) > 4 else 0

            if cmd == 0x11:  # READ_REQ - pedal requesting a patch
                patch_num = response[5]
                if 0 <= patch_num < PATCH_COUNT:
                    # Build and send READ_RESP with correct checksum
                    resp = build_read_response(patch_num, patches_data[patch_num])
                    self._send_sysex(resp)
                    count += 1

                    if progress_callback:
                        progress_callback(count, PATCH_COUNT)

            elif cmd == 0x1F:  # EXIT_EDIT - pedal is done
                break

        if count != PATCH_COUNT:
            raise G9DeviceError(f"Only wrote {count}/{PATCH_COUNT} patches")

    def __enter__(self):
        """Context manager entry."""
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.disconnect()
        return False
