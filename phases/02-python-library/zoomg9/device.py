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

NO FUNCIONA (checksum no descifrado):
    ✗ write_patch - El checksum de 5 bytes no está resuelto
    ✗ write_all - Requiere write_patch

Ver CHECKSUM.md para detalles del problema pendiente.
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
        Write a patch to the device.

        **NO IMPLEMENTADO**: El checksum de 5 bytes no ha sido descifrado.
        El pedal valida el checksum y rechaza datos con checksum incorrecto.

        Ver CHECKSUM.md para detalles.

        Args:
            patch_num: Patch number (0-99)
            patch: Patch object to write

        Raises:
            NotImplementedError: Siempre (checksum no resuelto)
        """
        raise NotImplementedError(
            "write_patch no está implementado: el algoritmo de checksum "
            "de 5 bytes no ha sido descifrado. Ver CHECKSUM.md"
        )

    def set_parameter(self, effect: str, param: str, value: int):
        """
        Set an effect parameter in real-time.

        Args:
            effect: Effect name (amp, delay, reverb, etc.)
            param: Parameter name (gain, time, mix, etc.)
            value: New value

        Raises:
            ValueError: If effect/param not found or value out of range
        """
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
        progress_callback: Optional[Callable[[int, int], None]] = None
    ):
        """
        Write all patches to the device.

        **NO IMPLEMENTADO**: Requiere write_patch que no funciona.

        Ver CHECKSUM.md para detalles.

        Args:
            patches: List of 100 Patch objects
            progress_callback: Optional callback(current, total) for progress updates

        Raises:
            NotImplementedError: Siempre (checksum no resuelto)
        """
        raise NotImplementedError(
            "write_all no está implementado: el algoritmo de checksum "
            "de 5 bytes no ha sido descifrado. Ver CHECKSUM.md"
        )

    def __enter__(self):
        """Context manager entry."""
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.disconnect()
        return False
