"""
Zoom G9.2tt Python Library

A Python library for communicating with the Zoom G9.2tt effects processor
via MIDI SysEx messages.

Example usage:
    from zoomg9 import G9Device, Patch

    # Connect to the device
    device = G9Device()
    device.connect()

    # Read a patch
    patch = device.read_patch(0)
    print(patch.name, patch.amp.type_name, patch.amp.gain)

    # Modify parameters
    patch.amp.gain = 80
    patch.delay.time = 500

    # Write back
    device.write_patch(0, patch)

    # Real-time control
    device.set_parameter("amp", "gain", 70)

    device.disconnect()

Or using context manager:
    with G9Device() as device:
        patch = device.read_patch(0)
        print(patch.summary())
"""

__version__ = "0.1.0"
__author__ = "Andres Mantilla"

# Main classes
from .device import G9Device, G9DeviceError
from .patch import Patch

# Effect modules
from .effects import (
    EffectModule,
    AmpModule,
    CmpModule,
    WahModule,
    ExtModule,
    ZnrModule,
    EqModule,
    CabModule,
    ModModule,
    DlyModule,
    RevModule,
)

# Constants (for advanced users)
from .constants import (
    ZOOM_MANUFACTURER_ID,
    G9TT_MODEL_ID,
    PATCH_COUNT,
    AMP_TYPES,
    CMP_TYPES,
    ZNR_TYPES,
    WAH_TYPES,
    MOD_TYPES,
    DLY_TYPES,
    REV_TYPES,
    EFFECT_NAMES,
    PARAM_NAMES,
    PARAM_RANGES,
)

# Low-level functions (for advanced users)
from .encoding import (
    encode_nibbles,
    decode_nibbles,
    encode_7bit,
    decode_7bit,
    pack_bits,
    unpack_bits,
)

from .protocol import (
    build_read_request,
    build_write_data,
    build_param_change,
    build_enter_edit,
    build_exit_edit,
    parse_read_response,
)

__all__ = [
    # Version
    "__version__",
    # Main classes
    "G9Device",
    "G9DeviceError",
    "Patch",
    # Effect modules
    "EffectModule",
    "AmpModule",
    "CmpModule",
    "WahModule",
    "ExtModule",
    "ZnrModule",
    "EqModule",
    "CabModule",
    "ModModule",
    "DlyModule",
    "RevModule",
    # Constants
    "ZOOM_MANUFACTURER_ID",
    "G9TT_MODEL_ID",
    "PATCH_COUNT",
    "AMP_TYPES",
    "CMP_TYPES",
    "ZNR_TYPES",
    "WAH_TYPES",
    "MOD_TYPES",
    "DLY_TYPES",
    "REV_TYPES",
    "EFFECT_NAMES",
    "PARAM_NAMES",
    "PARAM_RANGES",
    # Encoding functions
    "encode_nibbles",
    "decode_nibbles",
    "encode_7bit",
    "decode_7bit",
    "pack_bits",
    "unpack_bits",
    # Protocol functions
    "build_read_request",
    "build_write_data",
    "build_param_change",
    "build_enter_edit",
    "build_exit_edit",
    "parse_read_response",
]
