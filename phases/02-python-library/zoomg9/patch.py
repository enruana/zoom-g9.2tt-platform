"""
Zoom G9.2tt Patch Data Model

Represents a complete patch with all effect modules and serialization.
"""

from .constants import (
    PATCH_SIZE_DECODED,
    PATCH_NAME_LENGTH,
    PATCH_NAME_OFFSET,
    DIRECT_OFFSETS,
)
from .encoding import unpack_bits, pack_bits
from .effects import (
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


class Patch:
    """
    Represents a complete G9.2tt patch.

    Contains all effect modules and global settings. Can be serialized
    to/from the device's 128-byte format.
    """

    def __init__(self, name: str = "NewPatch"):
        """
        Create a new patch with default settings.

        Args:
            name: Patch name (max 10 characters)
        """
        self._name = name[:PATCH_NAME_LENGTH].ljust(PATCH_NAME_LENGTH)
        self._level = 50
        self._tempo = 120
        self._amp_sel = 0  # 0=A, 1=B
        self._pedal_func = (0, 0)

        # Effect modules - Channel A (bit-packed)
        self.comp = CmpModule()
        self.wah = WahModule()
        self.ext = ExtModule()
        self.znr_a = ZnrModule()
        self.amp_a = AmpModule()
        self.eq_a = EqModule()
        self.cab = CabModule()
        self.mod = ModModule()
        self.delay = DlyModule()
        self.reverb = RevModule()

        # Effect modules - Channel B (direct offsets)
        self.znr_b = ZnrModule()
        self.amp_b = AmpModule()
        self.eq_b = EqModule()

    @property
    def name(self) -> str:
        """Patch name (max 10 characters)."""
        return self._name.rstrip()

    @name.setter
    def name(self, value: str):
        self._name = value[:PATCH_NAME_LENGTH].ljust(PATCH_NAME_LENGTH)

    @property
    def level(self) -> int:
        """Patch output level (0-100)."""
        return self._level

    @level.setter
    def level(self, value: int):
        if not 0 <= value <= 100:
            raise ValueError("Level must be 0-100")
        self._level = value

    @property
    def tempo(self) -> int:
        """Patch tempo in BPM (40-250)."""
        return self._tempo

    @tempo.setter
    def tempo(self, value: int):
        if not 40 <= value <= 250:
            raise ValueError("Tempo must be 40-250")
        self._tempo = value

    @property
    def amp_sel(self) -> int:
        """Selected amp channel (0=A, 1=B)."""
        return self._amp_sel

    @amp_sel.setter
    def amp_sel(self, value: int):
        if value not in (0, 1):
            raise ValueError("amp_sel must be 0 (A) or 1 (B)")
        self._amp_sel = value

    @property
    def amp(self) -> AmpModule:
        """Currently selected amp module (A or B)."""
        return self.amp_a if self._amp_sel == 0 else self.amp_b

    @property
    def znr(self) -> ZnrModule:
        """Currently selected ZNR module (A or B)."""
        return self.znr_a if self._amp_sel == 0 else self.znr_b

    @property
    def eq(self) -> EqModule:
        """Currently selected EQ module (A or B)."""
        return self.eq_a if self._amp_sel == 0 else self.eq_b

    @classmethod
    def from_bytes(cls, data: bytes) -> "Patch":
        """
        Deserialize a patch from 128 bytes of decoded data.

        Args:
            data: 128 bytes of decoded patch data

        Returns:
            Patch instance with all values populated
        """
        if len(data) != PATCH_SIZE_DECODED:
            raise ValueError(f"Expected {PATCH_SIZE_DECODED} bytes, got {len(data)}")

        patch = cls()

        # Unpack bit-packed matrix
        matrix = unpack_bits(data)

        # Global (row 0)
        patch._level = matrix[0][5]

        # CMP (row 1)
        patch.comp._on = bool(matrix[1][0])
        patch.comp._type = matrix[1][1]
        patch.comp._sense = matrix[1][2]
        patch.comp._attack = matrix[1][3]
        patch.comp._tone = matrix[1][4]
        patch.comp._level = matrix[1][5]

        # WAH (row 2)
        patch.wah._on = bool(matrix[2][0])
        patch.wah._type = matrix[2][1]
        patch.wah._position = matrix[2][2]
        patch.wah._sense = matrix[2][3]
        patch.wah._resonance = matrix[2][4]
        patch.wah._level = matrix[2][5]

        # EXT (row 3)
        patch.ext._on = bool(matrix[3][0])
        patch.ext._send = matrix[3][2]
        patch.ext._return = matrix[3][3]
        patch.ext._dry = matrix[3][4]

        # ZNR-A (row 4)
        patch.znr_a._on = bool(matrix[4][0])
        patch.znr_a._type = matrix[4][1]
        patch.znr_a._threshold = matrix[4][2]

        # AMP-A (row 5)
        patch.amp_a._on = bool(matrix[5][0])
        patch.amp_a._type = matrix[5][1]
        patch.amp_a._gain = matrix[5][2]
        patch.amp_a._tone = matrix[5][3]
        patch.amp_a._level = matrix[5][4]
        # matrix[5][5] is the high bit extension (1 bit)

        # EQ-A (row 6)
        patch.eq_a._on = bool(matrix[6][0])
        patch.eq_a._bands[0] = matrix[6][2]
        patch.eq_a._bands[1] = matrix[6][3]
        patch.eq_a._bands[2] = matrix[6][4]
        patch.eq_a._bands[3] = matrix[6][5]
        patch.eq_a._bands[4] = matrix[6][6]
        patch.eq_a._bands[5] = matrix[6][7]

        # CAB (row 7)
        patch.cab._on = bool(matrix[7][0])
        patch.cab._depth = matrix[7][2]
        patch.cab._mic_type = matrix[7][3]
        patch.cab._mic_pos = matrix[7][4]

        # MOD (row 8)
        patch.mod._on = bool(matrix[8][0])
        patch.mod._type = matrix[8][1]
        patch.mod._depth = matrix[8][2]
        patch.mod._rate = matrix[8][3]
        patch.mod._tone = matrix[8][4]
        patch.mod._mix = matrix[8][5]

        # DLY (row 9)
        patch.delay._on = bool(matrix[9][0])
        patch.delay._type = matrix[9][1]
        patch.delay._time = matrix[9][2]
        patch.delay._feedback = matrix[9][3]
        patch.delay._hidamp = matrix[9][4]
        patch.delay._mix = matrix[9][5]

        # REV (row 10)
        patch.reverb._on = bool(matrix[10][0])
        patch.reverb._type = matrix[10][1]
        patch.reverb._decay = matrix[10][2]
        patch.reverb._predelay = matrix[10][3]
        patch.reverb._tone = matrix[10][4]
        patch.reverb._mix = matrix[10][5]

        # Direct offset fields (non-bit-packed)

        # ZNR-B
        patch.znr_b._on = bool(data[DIRECT_OFFSETS["ZnrB_onoff"]])
        patch.znr_b._type = data[DIRECT_OFFSETS["ZnrB_type"]]
        patch.znr_b._threshold = data[DIRECT_OFFSETS["ZnrB_parm1"]]

        # AMP-B
        patch.amp_b._on = bool(data[DIRECT_OFFSETS["AmpB_onoff"]])
        patch.amp_b._type = data[DIRECT_OFFSETS["AmpB_type"]]
        patch.amp_b._gain = data[DIRECT_OFFSETS["AmpB_parm1"]]
        patch.amp_b._tone = data[DIRECT_OFFSETS["AmpB_parm2"]]
        patch.amp_b._level = data[DIRECT_OFFSETS["AmpB_parm3"]]

        # EQ-B
        patch.eq_b._on = bool(data[DIRECT_OFFSETS["EqB_onoff"]])
        patch.eq_b._bands[0] = data[DIRECT_OFFSETS["EqB_parm1"]]
        patch.eq_b._bands[1] = data[DIRECT_OFFSETS["EqB_parm2"]]
        patch.eq_b._bands[2] = data[DIRECT_OFFSETS["EqB_parm3"]]
        patch.eq_b._bands[3] = data[DIRECT_OFFSETS["EqB_parm4"]]
        patch.eq_b._bands[4] = data[DIRECT_OFFSETS["EqB_parm5"]]
        patch.eq_b._bands[5] = data[DIRECT_OFFSETS["EqB_parm6"]]

        # Global settings
        patch._amp_sel = data[DIRECT_OFFSETS["AmpSel"]]
        patch._tempo = data[DIRECT_OFFSETS["Tempo_raw"]] + 40
        patch._pedal_func = (data[DIRECT_OFFSETS["PedalFunc0"]], data[DIRECT_OFFSETS["PedalFunc1"]])

        # Name
        name_start = DIRECT_OFFSETS["Name"]
        patch._name = data[name_start:name_start + PATCH_NAME_LENGTH].decode("ascii", errors="replace")

        return patch

    def to_bytes(self) -> bytes:
        """
        Serialize the patch to 128 bytes.

        Returns:
            128 bytes of patch data ready for encoding
        """
        # Start with a zero-filled buffer
        data = bytearray(PATCH_SIZE_DECODED)

        # Build the bit-packed matrix
        matrix = [[0] * 8 for _ in range(12)]

        # Global (row 0)
        matrix[0][5] = self._level

        # CMP (row 1)
        matrix[1][0] = int(self.comp._on)
        matrix[1][1] = self.comp._type
        matrix[1][2] = self.comp._sense
        matrix[1][3] = self.comp._attack
        matrix[1][4] = self.comp._tone
        matrix[1][5] = self.comp._level

        # WAH (row 2)
        matrix[2][0] = int(self.wah._on)
        matrix[2][1] = self.wah._type
        matrix[2][2] = self.wah._position
        matrix[2][3] = self.wah._sense
        matrix[2][4] = self.wah._resonance
        matrix[2][5] = self.wah._level

        # EXT (row 3)
        matrix[3][0] = int(self.ext._on)
        matrix[3][2] = self.ext._send
        matrix[3][3] = self.ext._return
        matrix[3][4] = self.ext._dry

        # ZNR-A (row 4)
        matrix[4][0] = int(self.znr_a._on)
        matrix[4][1] = self.znr_a._type
        matrix[4][2] = self.znr_a._threshold

        # AMP-A (row 5)
        matrix[5][0] = int(self.amp_a._on)
        matrix[5][1] = self.amp_a._type
        matrix[5][2] = self.amp_a._gain
        matrix[5][3] = self.amp_a._tone
        matrix[5][4] = self.amp_a._level
        matrix[5][5] = 0  # High bit extension

        # EQ-A (row 6)
        matrix[6][0] = int(self.eq_a._on)
        matrix[6][2] = self.eq_a._bands[0]
        matrix[6][3] = self.eq_a._bands[1]
        matrix[6][4] = self.eq_a._bands[2]
        matrix[6][5] = self.eq_a._bands[3]
        matrix[6][6] = self.eq_a._bands[4]
        matrix[6][7] = self.eq_a._bands[5]

        # CAB (row 7)
        matrix[7][0] = int(self.cab._on)
        matrix[7][2] = self.cab._depth
        matrix[7][3] = self.cab._mic_type
        matrix[7][4] = self.cab._mic_pos

        # MOD (row 8)
        matrix[8][0] = int(self.mod._on)
        matrix[8][1] = self.mod._type
        matrix[8][2] = self.mod._depth
        matrix[8][3] = self.mod._rate
        matrix[8][4] = self.mod._tone
        matrix[8][5] = self.mod._mix

        # DLY (row 9)
        matrix[9][0] = int(self.delay._on)
        matrix[9][1] = self.delay._type
        matrix[9][2] = self.delay._time
        matrix[9][3] = self.delay._feedback
        matrix[9][4] = self.delay._hidamp
        matrix[9][5] = self.delay._mix

        # REV (row 10)
        matrix[10][0] = int(self.reverb._on)
        matrix[10][1] = self.reverb._type
        matrix[10][2] = self.reverb._decay
        matrix[10][3] = self.reverb._predelay
        matrix[10][4] = self.reverb._tone
        matrix[10][5] = self.reverb._mix

        # Pack the bit matrix into the first ~36 bytes
        packed = pack_bits(matrix)
        data[:len(packed)] = packed

        # Direct offset fields

        # ZNR-B
        data[DIRECT_OFFSETS["ZnrB_onoff"]] = int(self.znr_b._on)
        data[DIRECT_OFFSETS["ZnrB_type"]] = self.znr_b._type
        data[DIRECT_OFFSETS["ZnrB_parm1"]] = self.znr_b._threshold

        # AMP-B
        data[DIRECT_OFFSETS["AmpB_onoff"]] = int(self.amp_b._on)
        data[DIRECT_OFFSETS["AmpB_type"]] = self.amp_b._type
        data[DIRECT_OFFSETS["AmpB_parm1"]] = self.amp_b._gain
        data[DIRECT_OFFSETS["AmpB_parm2"]] = self.amp_b._tone
        data[DIRECT_OFFSETS["AmpB_parm3"]] = self.amp_b._level

        # EQ-B
        data[DIRECT_OFFSETS["EqB_onoff"]] = int(self.eq_b._on)
        data[DIRECT_OFFSETS["EqB_parm1"]] = self.eq_b._bands[0]
        data[DIRECT_OFFSETS["EqB_parm2"]] = self.eq_b._bands[1]
        data[DIRECT_OFFSETS["EqB_parm3"]] = self.eq_b._bands[2]
        data[DIRECT_OFFSETS["EqB_parm4"]] = self.eq_b._bands[3]
        data[DIRECT_OFFSETS["EqB_parm5"]] = self.eq_b._bands[4]
        data[DIRECT_OFFSETS["EqB_parm6"]] = self.eq_b._bands[5]

        # Global settings
        data[DIRECT_OFFSETS["AmpSel"]] = self._amp_sel
        data[DIRECT_OFFSETS["Tempo_raw"]] = self._tempo - 40
        data[DIRECT_OFFSETS["PedalFunc0"]] = self._pedal_func[0]
        data[DIRECT_OFFSETS["PedalFunc1"]] = self._pedal_func[1]

        # Name
        name_bytes = self._name.encode("ascii", errors="replace")[:PATCH_NAME_LENGTH]
        name_bytes = name_bytes.ljust(PATCH_NAME_LENGTH, b"\x00")
        name_start = DIRECT_OFFSETS["Name"]
        data[name_start:name_start + PATCH_NAME_LENGTH] = name_bytes

        return bytes(data)

    def __repr__(self):
        return (
            f"Patch(name='{self.name}', level={self._level}, tempo={self._tempo}, "
            f"amp_sel={'A' if self._amp_sel == 0 else 'B'})"
        )

    def summary(self) -> str:
        """Generate a human-readable summary of the patch."""
        lines = [
            f"Patch: {self.name}",
            f"  Level: {self._level}  Tempo: {self._tempo} BPM  Amp: {'A' if self._amp_sel == 0 else 'B'}",
            "",
            "  Effect Modules:",
            f"    {self.comp}",
            f"    {self.wah}",
            f"    {self.ext}",
            f"    ZNR-A: {self.znr_a}",
            f"    ZNR-B: {self.znr_b}",
            f"    AMP-A: {self.amp_a}",
            f"    AMP-B: {self.amp_b}",
            f"    EQ-A: {self.eq_a}",
            f"    EQ-B: {self.eq_b}",
            f"    {self.cab}",
            f"    {self.mod}",
            f"    {self.delay}",
            f"    {self.reverb}",
        ]
        return "\n".join(lines)
