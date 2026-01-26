"""
Zoom G9.2tt Effect Modules

Classes representing each effect module with parameter validation
and human-readable type names.
"""

from .constants import (
    AMP_TYPES,
    CMP_TYPES,
    ZNR_TYPES,
    WAH_TYPES,
    MOD_TYPES,
    DLY_TYPES,
    REV_TYPES,
    PARAM_RANGES,
    EFFECT_AMP,
    EFFECT_CMP,
    EFFECT_WAH,
    EFFECT_EXT,
    EFFECT_ZNR,
    EFFECT_EQ,
    EFFECT_CAB,
    EFFECT_MOD,
    EFFECT_DLY,
    EFFECT_REV,
)


class EffectModule:
    """Base class for effect modules."""

    effect_id = None
    type_names = {}

    def __init__(self):
        self._on = False
        self._type = 0
        self._params = {}

    @property
    def on(self) -> bool:
        """Whether the effect is enabled."""
        return self._on

    @on.setter
    def on(self, value: bool):
        self._on = bool(value)

    @property
    def type(self) -> int:
        """Effect type index."""
        return self._type

    @type.setter
    def type(self, value: int):
        if self.effect_id in PARAM_RANGES:
            ranges = PARAM_RANGES[self.effect_id]
            if 0x01 in ranges:
                min_val, max_val = ranges[0x01]
                if not min_val <= value <= max_val:
                    raise ValueError(f"Type must be {min_val}-{max_val}, got {value}")
        self._type = value

    @property
    def type_name(self) -> str:
        """Human-readable name of the current type."""
        return self.type_names.get(self._type, f"Unknown ({self._type})")

    def _validate_param(self, param_id: int, value: int):
        """Validate a parameter value against its range."""
        if self.effect_id in PARAM_RANGES:
            ranges = PARAM_RANGES[self.effect_id]
            if param_id in ranges:
                min_val, max_val = ranges[param_id]
                if not min_val <= value <= max_val:
                    raise ValueError(
                        f"Parameter 0x{param_id:02X} must be {min_val}-{max_val}, got {value}"
                    )

    def __repr__(self):
        status = "ON" if self._on else "OFF"
        return f"{self.__class__.__name__}({status}, type={self.type_name})"


class AmpModule(EffectModule):
    """Amplifier/Distortion module (44 types)."""

    effect_id = EFFECT_AMP
    type_names = AMP_TYPES

    def __init__(self):
        super().__init__()
        self._gain = 50
        self._tone = 15
        self._level = 50

    @property
    def gain(self) -> int:
        """Gain/drive amount (0-100)."""
        return self._gain

    @gain.setter
    def gain(self, value: int):
        self._validate_param(0x02, value)
        self._gain = value

    @property
    def tone(self) -> int:
        """Tone control (0-30)."""
        return self._tone

    @tone.setter
    def tone(self, value: int):
        self._validate_param(0x03, value)
        self._tone = value

    @property
    def level(self) -> int:
        """Output level (0-99)."""
        return self._level

    @level.setter
    def level(self, value: int):
        self._validate_param(0x04, value)
        self._level = value

    def __repr__(self):
        status = "ON" if self._on else "OFF"
        return f"AmpModule({status}, {self.type_name}, gain={self._gain}, tone={self._tone}, level={self._level})"


class CmpModule(EffectModule):
    """Compressor module (3 types)."""

    effect_id = EFFECT_CMP
    type_names = CMP_TYPES

    def __init__(self):
        super().__init__()
        self._sense = 25
        self._attack = 5
        self._tone = 5
        self._level = 25

    @property
    def sense(self) -> int:
        """Sensitivity/Threshold (0-50)."""
        return self._sense

    @sense.setter
    def sense(self, value: int):
        self._validate_param(0x02, value)
        self._sense = value

    @property
    def attack(self) -> int:
        """Attack/Ratio (0-9)."""
        return self._attack

    @attack.setter
    def attack(self, value: int):
        self._validate_param(0x03, value)
        self._attack = value

    @property
    def tone(self) -> int:
        """Tone/Attack/Release (0-10)."""
        return self._tone

    @tone.setter
    def tone(self, value: int):
        self._validate_param(0x04, value)
        self._tone = value

    @property
    def level(self) -> int:
        """Output level (0-49)."""
        return self._level

    @level.setter
    def level(self, value: int):
        self._validate_param(0x05, value)
        self._level = value


class WahModule(EffectModule):
    """Wah/EFX1 module (17 types)."""

    effect_id = EFFECT_WAH
    type_names = WAH_TYPES

    def __init__(self):
        super().__init__()
        self._position = 64
        self._sense = 64
        self._resonance = 64
        self._level = 25

    @property
    def position(self) -> int:
        """Position/Range (varies by type)."""
        return self._position

    @position.setter
    def position(self, value: int):
        self._validate_param(0x02, value)
        self._position = value

    @property
    def sense(self) -> int:
        """Sense/Tone (varies by type)."""
        return self._sense

    @sense.setter
    def sense(self, value: int):
        self._validate_param(0x03, value)
        self._sense = value

    @property
    def resonance(self) -> int:
        """Resonance/Gain (varies by type)."""
        return self._resonance

    @resonance.setter
    def resonance(self, value: int):
        self._validate_param(0x04, value)
        self._resonance = value

    @property
    def level(self) -> int:
        """Output level (0-49)."""
        return self._level

    @level.setter
    def level(self, value: int):
        self._validate_param(0x05, value)
        self._level = value


class ExtModule(EffectModule):
    """External Loop module."""

    effect_id = EFFECT_EXT

    def __init__(self):
        super().__init__()
        self._send = 80
        self._return = 80
        self._dry = 0

    @property
    def send(self) -> int:
        """Send level (0-100)."""
        return self._send

    @send.setter
    def send(self, value: int):
        self._validate_param(0x02, value)
        self._send = value

    @property
    def return_(self) -> int:
        """Return level (0-100)."""
        return self._return

    @return_.setter
    def return_(self, value: int):
        self._validate_param(0x03, value)
        self._return = value

    @property
    def dry(self) -> int:
        """Dry signal level (0-100)."""
        return self._dry

    @dry.setter
    def dry(self, value: int):
        self._validate_param(0x04, value)
        self._dry = value

    def __repr__(self):
        status = "ON" if self._on else "OFF"
        return f"ExtModule({status}, send={self._send}, return={self._return}, dry={self._dry})"


class ZnrModule(EffectModule):
    """Noise Reduction module (3 types)."""

    effect_id = EFFECT_ZNR
    type_names = ZNR_TYPES

    def __init__(self):
        super().__init__()
        self._threshold = 9

    @property
    def threshold(self) -> int:
        """Threshold level (0-15)."""
        return self._threshold

    @threshold.setter
    def threshold(self, value: int):
        self._validate_param(0x02, value)
        self._threshold = value

    def __repr__(self):
        status = "ON" if self._on else "OFF"
        return f"ZnrModule({status}, {self.type_name}, threshold={self._threshold})"


class EqModule(EffectModule):
    """6-Band Equalizer module."""

    effect_id = EFFECT_EQ

    def __init__(self):
        super().__init__()
        # Default all bands to flat (16 = 0dB)
        self._bands = [16, 16, 16, 16, 16, 16]

    @property
    def bands(self) -> list:
        """All 6 EQ bands (0-31 each, 16 = flat)."""
        return self._bands.copy()

    @bands.setter
    def bands(self, values: list):
        if len(values) != 6:
            raise ValueError("EQ requires exactly 6 band values")
        for i, v in enumerate(values):
            if not 0 <= v <= 31:
                raise ValueError(f"Band {i+1} must be 0-31, got {v}")
        self._bands = list(values)

    def get_band(self, band: int) -> int:
        """Get a specific band value (1-6)."""
        if not 1 <= band <= 6:
            raise ValueError("Band must be 1-6")
        return self._bands[band - 1]

    def set_band(self, band: int, value: int):
        """Set a specific band value (1-6, value 0-31)."""
        if not 1 <= band <= 6:
            raise ValueError("Band must be 1-6")
        if not 0 <= value <= 31:
            raise ValueError("Value must be 0-31")
        self._bands[band - 1] = value

    def __repr__(self):
        status = "ON" if self._on else "OFF"
        return f"EqModule({status}, bands={self._bands})"


class CabModule(EffectModule):
    """Cabinet Simulator module."""

    effect_id = EFFECT_CAB

    DEPTH_NAMES = {0: "Small", 1: "Middle"}
    MIC_NAMES = {0: "Dynamic", 1: "Condenser", 2: "Mic2", 3: "Mic3"}

    def __init__(self):
        super().__init__()
        self._depth = 0
        self._mic_type = 0
        self._mic_pos = 0

    @property
    def depth(self) -> int:
        """Cabinet depth (0=Small, 1=Middle)."""
        return self._depth

    @depth.setter
    def depth(self, value: int):
        self._validate_param(0x02, value)
        self._depth = value

    @property
    def depth_name(self) -> str:
        """Human-readable depth name."""
        return self.DEPTH_NAMES.get(self._depth, f"Unknown ({self._depth})")

    @property
    def mic_type(self) -> int:
        """Microphone type (0-3)."""
        return self._mic_type

    @mic_type.setter
    def mic_type(self, value: int):
        self._validate_param(0x03, value)
        self._mic_type = value

    @property
    def mic_type_name(self) -> str:
        """Human-readable mic type name."""
        return self.MIC_NAMES.get(self._mic_type, f"Unknown ({self._mic_type})")

    @property
    def mic_pos(self) -> int:
        """Microphone position (0-3)."""
        return self._mic_pos

    @mic_pos.setter
    def mic_pos(self, value: int):
        self._validate_param(0x04, value)
        self._mic_pos = value

    def __repr__(self):
        status = "ON" if self._on else "OFF"
        return f"CabModule({status}, depth={self.depth_name}, mic={self.mic_type_name}, pos={self._mic_pos})"


class ModModule(EffectModule):
    """Modulation/EFX2 module (28 types)."""

    effect_id = EFFECT_MOD
    type_names = MOD_TYPES

    def __init__(self):
        super().__init__()
        self._depth = 50
        self._rate = 50
        self._tone = 50
        self._mix = 25

    @property
    def depth(self) -> int:
        """Depth/Rate/Shift/Time (varies by type, 0-2047)."""
        return self._depth

    @depth.setter
    def depth(self, value: int):
        self._validate_param(0x02, value)
        self._depth = value

    @property
    def rate(self) -> int:
        """Rate/Fine/FeedBack (varies by type, 0-127)."""
        return self._rate

    @rate.setter
    def rate(self, value: int):
        self._validate_param(0x03, value)
        self._rate = value

    @property
    def tone(self) -> int:
        """Tone/Resonance/HiDamp (varies by type, 0-127)."""
        return self._tone

    @tone.setter
    def tone(self, value: int):
        self._validate_param(0x04, value)
        self._tone = value

    @property
    def mix(self) -> int:
        """Effect mix level (0-50)."""
        return self._mix

    @mix.setter
    def mix(self, value: int):
        self._validate_param(0x05, value)
        self._mix = value


class DlyModule(EffectModule):
    """Delay module (7 types)."""

    effect_id = EFFECT_DLY
    type_names = DLY_TYPES

    def __init__(self):
        super().__init__()
        self._time = 500
        self._feedback = 25
        self._hidamp = 5
        self._mix = 25

    @property
    def time(self) -> int:
        """Delay time in ms (0-5022)."""
        return self._time

    @time.setter
    def time(self, value: int):
        self._validate_param(0x02, value)
        self._time = value

    @property
    def feedback(self) -> int:
        """Feedback/repeats (0-50)."""
        return self._feedback

    @feedback.setter
    def feedback(self, value: int):
        self._validate_param(0x03, value)
        self._feedback = value

    @property
    def hidamp(self) -> int:
        """High frequency damping (0-10)."""
        return self._hidamp

    @hidamp.setter
    def hidamp(self, value: int):
        self._validate_param(0x04, value)
        self._hidamp = value

    @property
    def mix(self) -> int:
        """Effect mix level (0-50)."""
        return self._mix

    @mix.setter
    def mix(self, value: int):
        self._validate_param(0x05, value)
        self._mix = value


class RevModule(EffectModule):
    """Reverb module (15 types)."""

    effect_id = EFFECT_REV
    type_names = REV_TYPES

    def __init__(self):
        super().__init__()
        self._decay = 15
        self._predelay = 30
        self._tone = 5
        self._mix = 25

    @property
    def decay(self) -> int:
        """Decay time (0-29)."""
        return self._decay

    @decay.setter
    def decay(self, value: int):
        self._validate_param(0x02, value)
        self._decay = value

    @property
    def predelay(self) -> int:
        """Pre-delay in ms (0-99)."""
        return self._predelay

    @predelay.setter
    def predelay(self, value: int):
        self._validate_param(0x03, value)
        self._predelay = value

    @property
    def tone(self) -> int:
        """Reverb tone (0-10)."""
        return self._tone

    @tone.setter
    def tone(self, value: int):
        self._validate_param(0x04, value)
        self._tone = value

    @property
    def mix(self) -> int:
        """Effect mix level (0-50)."""
        return self._mix

    @mix.setter
    def mix(self, value: int):
        self._validate_param(0x05, value)
        self._mix = value
