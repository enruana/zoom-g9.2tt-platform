"""
Zoom G9.2tt Protocol Constants

Contains all MIDI IDs, command bytes, effect definitions, and parameter mappings.
"""

# MIDI Identification
ZOOM_MANUFACTURER_ID = 0x52
G9TT_MODEL_ID = 0x42
DEVICE_ID = 0x00

# SysEx Commands
CMD_READ_PATCH = 0x11
CMD_ENTER_EDIT = 0x12
CMD_EXIT_EDIT = 0x1F
CMD_READ_RESPONSE = 0x21
CMD_WRITE_PATCH = 0x28
CMD_PARAM_CHANGE = 0x31

# Patch Constants
PATCH_COUNT = 100
PATCH_SIZE_DECODED = 128
PATCH_SIZE_NIBBLE = 256
PATCH_SIZE_7BIT = 147
PATCH_NAME_LENGTH = 10
PATCH_NAME_OFFSET = 0x41  # 65

# Effect Module IDs
EFFECT_TOP = 0x00
EFFECT_CMP = 0x01
EFFECT_WAH = 0x02
EFFECT_EXT = 0x03
EFFECT_ZNR = 0x04
EFFECT_AMP = 0x05
EFFECT_EQ = 0x06
EFFECT_CAB = 0x07
EFFECT_MOD = 0x08
EFFECT_DLY = 0x09
EFFECT_REV = 0x0A
EFFECT_SYNC = 0x0B

# Effect Names
EFFECT_NAMES = {
    EFFECT_TOP: "TOP",
    EFFECT_CMP: "CMP",
    EFFECT_WAH: "WAH",
    EFFECT_EXT: "EXT",
    EFFECT_ZNR: "ZNR",
    EFFECT_AMP: "AMP",
    EFFECT_EQ: "EQ",
    EFFECT_CAB: "CAB",
    EFFECT_MOD: "MOD",
    EFFECT_DLY: "DLY",
    EFFECT_REV: "REV",
    EFFECT_SYNC: "SYNC",
}

# Common Parameter IDs
PARAM_ONOFF = 0x00
PARAM_TYPE = 0x01

# Bit-width table for unpacking patch data
# 12 rows (modules) x 8 columns (parameters)
BIT_TBL = [
    # Row 0: Global - PatchLevel in column 5
    [0, 0, 0, 0, 0, 7, 0, 0],
    # Row 1: CMP (onoff:1, type:2, parm1:6, parm2:4, parm3:4, parm4:6)
    [1, 2, 6, 4, 4, 6, 0, 0],
    # Row 2: WAH (onoff:1, type:5, parm1:7, parm2:7, parm3:6, parm4:6)
    [1, 5, 7, 7, 6, 6, 0, 0],
    # Row 3: EXT (onoff:1, ?, parm1:7, parm2:7, parm3:7)
    [1, 0, 7, 7, 7, 0, 0, 0],
    # Row 4: ZNR-A (onoff:1, type:2, parm1:4)
    [1, 2, 4, 0, 0, 0, 0, 0],
    # Row 5: AMP-A (onoff:1, type:6, parm1:7, parm2:5, parm3:7, parm4:1)
    [1, 6, 7, 5, 7, 1, 0, 0],
    # Row 6: EQ-A (onoff:1, ?, parm1-6: 5 bits each)
    [1, 0, 5, 5, 5, 5, 5, 5],
    # Row 7: CAB (onoff:1, ?, parm1:1, parm2:2, parm3:2)
    [1, 0, 1, 2, 2, 0, 0, 0],
    # Row 8: MOD (onoff:1, type:5, parm1:11, parm2-4:7 bits)
    [1, 5, 11, 7, 7, 7, 0, 0],
    # Row 9: DLY (onoff:1, type:3, parm1:13, parm2:6, parm3:4, parm4:6)
    [1, 3, 13, 6, 4, 6, 0, 0],
    # Row 10: REV (onoff:1, type:4, parm1:12, parm2:7, parm3:6, parm4:6)
    [1, 4, 12, 7, 6, 6, 0, 0],
    # Row 11: Empty
    [0, 0, 0, 0, 0, 0, 0, 0],
]

# Direct offsets for non-bit-packed fields in the 128-byte buffer
DIRECT_OFFSETS = {
    "ZnrB_onoff": 0x24,   # 36
    "ZnrB_type": 0x25,    # 37
    "ZnrB_parm1": 0x26,   # 38
    "AmpB_onoff": 0x2C,   # 44
    "AmpB_type": 0x2D,    # 45
    "AmpB_parm1": 0x2E,   # 46
    "AmpB_parm2": 0x2F,   # 47
    "AmpB_parm3": 0x30,   # 48
    "AmpB_parm4": 0x31,   # 49
    "EqB_onoff": 0x34,    # 52
    "EqB_parm1": 0x36,    # 54
    "EqB_parm2": 0x37,    # 55
    "EqB_parm3": 0x38,    # 56
    "EqB_parm4": 0x39,    # 57
    "EqB_parm5": 0x3A,    # 58
    "EqB_parm6": 0x3B,    # 59
    "AmpSel": 0x3C,       # 60 (0=A, 1=B)
    "Tempo_raw": 0x3D,    # 61 (actual = raw + 40)
    "PedalFunc0": 0x3E,   # 62
    "PedalFunc1": 0x3F,   # 63
    "Name": 0x41,         # 65 (10 bytes)
}

# AMP Types (44 total)
AMP_TYPES = {
    0: "Fender Clean",
    1: "VOX Clean",
    2: "JC Clean",
    3: "HiWatt Clean",
    4: "UK Blues",
    5: "US Blues",
    6: "Tweed Bass",
    7: "BG Crunch",
    8: "VOX Crunch",
    9: "Z Combo",
    10: "MS #1959",
    11: "MS Crunch",
    12: "MS Drive",
    13: "Rect Clean",
    14: "Rect Vintage",
    15: "Rect Modern",
    16: "HK Clean",
    17: "HK Crunch",
    18: "HK Drive",
    19: "DZ Clean",
    20: "DZ Crunch",
    21: "DZ Drive",
    22: "ENGL Drive",
    23: "PV Drive",
    24: "Z Stack",
    25: "OD-1",
    26: "TS808",
    27: "Centaur",
    28: "RAT",
    29: "DS-1",
    30: "GuvPlus",
    31: "Fuzz Face",
    32: "Hot Box",
    33: "Metal Zone",
    34: "Sansamp",
    35: "Z Metal",
    36: "Combo 1",
    37: "Combo 2",
    38: "Combo 3",
    39: "Combo 4",
    40: "Combo 5",
    41: "Combo 6",
    42: "Z Clean",
    43: "Aco.Sim",
}

# CMP Types (3 total)
CMP_TYPES = {
    0: "Compressor",
    1: "RackComp",
    2: "Limiter",
}

# ZNR Types (3 total)
ZNR_TYPES = {
    0: "ZNR",
    1: "NoiseGate",
    2: "DirtyGate",
}

# WAH Types (17 total)
WAH_TYPES = {
    0: "AutoWah",
    1: "AutoResonance",
    2: "Booster",
    3: "Tremolo",
    4: "Phaser",
    5: "FixedPhaser",
    6: "RingModulator",
    7: "SlowAttack",
    8: "PedalVox",
    9: "PedalCryBaby",
    10: "MultiWah",
    11: "PedalResonanceFilter",
    12: "Octave",
    13: "X-Wah",
    14: "X-Phaser",
    15: "X-Vibe",
    16: "Z-Oscillator",
}

# MOD Types (28 total)
MOD_TYPES = {
    0: "Chorus",
    1: "StereoChorus",
    2: "Ensemble",
    3: "ModDelay",
    4: "Flanger",
    5: "PitchShifter",
    6: "PedalPitch",
    7: "Vibrato",
    8: "Step",
    9: "Delay",
    10: "TapeEcho",
    11: "DynamicDelay",
    12: "DynamicFlanger",
    13: "MonoPitch",
    14: "HarmonizedPitchShifter",
    15: "PedalMonoPitch",
    16: "Cry",
    17: "ReverseDelay",
    18: "BendChorus",
    19: "CombFilter",
    20: "Air",
    21: "Z-Echo",
    22: "X-Flanger",
    23: "X-Step",
    24: "Z-Step",
    25: "Z-Pitch",
    26: "Z-MonoPitch",
    27: "Z-Talking",
}

# DLY Types (7 total)
DLY_TYPES = {
    0: "Delay",
    1: "PingPongDelay",
    2: "Echo",
    3: "PingPongEcho",
    4: "AnalogDelay",
    5: "ReverseDelay",
    6: "Air",
}

# REV Types (15 total)
REV_TYPES = {
    0: "Hall",
    1: "Room",
    2: "Spring",
    3: "Arena",
    4: "TiledRoom",
    5: "ModernSpring",
    6: "EarlyReflection",
    7: "MultiTapDelay",
    8: "PanningDelay",
    9: "PingPongDelay",
    10: "PingPongEcho",
    11: "AutoPan",
    12: "Z-Delay",
    13: "Z-Dimension",
    14: "Z-Tornado",
}

# Parameter ranges per effect module
PARAM_RANGES = {
    EFFECT_TOP: {
        0x05: (0, 100),  # Level
    },
    EFFECT_CMP: {
        0x00: (0, 1),    # On/Off
        0x01: (0, 2),    # Type
        0x02: (0, 50),   # Sense/Threshold
        0x03: (0, 9),    # Attack/Ratio
        0x04: (0, 10),   # Tone/Attack/Release
        0x05: (0, 49),   # Level
    },
    EFFECT_WAH: {
        0x00: (0, 1),    # On/Off
        0x01: (0, 16),   # Type
        0x02: (0, 127),  # Position/Range (varies)
        0x03: (0, 127),  # Sense/Tone (varies)
        0x04: (0, 127),  # Resonance/Gain (varies)
        0x05: (0, 49),   # Level
    },
    EFFECT_EXT: {
        0x00: (0, 1),    # On/Off
        0x02: (0, 100),  # Send
        0x03: (0, 100),  # Return
        0x04: (0, 100),  # Dry
    },
    EFFECT_ZNR: {
        0x00: (0, 1),    # On/Off
        0x01: (0, 2),    # Type
        0x02: (0, 15),   # Threshold
    },
    EFFECT_AMP: {
        0x00: (0, 1),    # On/Off
        0x01: (0, 43),   # Type
        0x02: (0, 100),  # Gain
        0x03: (0, 30),   # Tone
        0x04: (0, 99),   # Level
    },
    EFFECT_EQ: {
        0x00: (0, 1),    # On/Off
        0x02: (0, 31),   # Band 1 (100Hz)
        0x03: (0, 31),   # Band 2 (200Hz)
        0x04: (0, 31),   # Band 3 (400Hz)
        0x05: (0, 31),   # Band 4 (800Hz)
        0x06: (0, 31),   # Band 5 (1.6kHz)
        0x07: (0, 31),   # Band 6 (3.2kHz)
    },
    EFFECT_CAB: {
        0x00: (0, 1),    # On/Off
        0x02: (0, 1),    # Depth (0=Small, 1=Middle)
        0x03: (0, 3),    # Mic Type
        0x04: (0, 3),    # Mic Position
    },
    EFFECT_MOD: {
        0x00: (0, 1),    # On/Off
        0x01: (0, 27),   # Type
        0x02: (0, 2047), # Depth/Rate/Shift/Time (11 bits)
        0x03: (0, 127),  # Rate/Fine/FeedBack
        0x04: (0, 127),  # Tone/Resonance/HiDamp
        0x05: (0, 50),   # Mix
    },
    EFFECT_DLY: {
        0x00: (0, 1),    # On/Off
        0x01: (0, 6),    # Type
        0x02: (0, 5022), # Time (ms, 13 bits)
        0x03: (0, 50),   # FeedBack
        0x04: (0, 10),   # HiDamp
        0x05: (0, 50),   # Mix
    },
    EFFECT_REV: {
        0x00: (0, 1),    # On/Off
        0x01: (0, 14),   # Type
        0x02: (0, 29),   # Decay
        0x03: (0, 99),   # PreDelay
        0x04: (0, 10),   # Tone
        0x05: (0, 50),   # Mix
    },
}

# Parameter names per effect module
PARAM_NAMES = {
    EFFECT_TOP: {
        0x05: "Level",
    },
    EFFECT_CMP: {
        0x00: "On/Off",
        0x01: "Type",
        0x02: "Sense",
        0x03: "Attack",
        0x04: "Tone",
        0x05: "Level",
    },
    EFFECT_WAH: {
        0x00: "On/Off",
        0x01: "Type",
        0x02: "Position",
        0x03: "Sense",
        0x04: "Resonance",
        0x05: "Level",
    },
    EFFECT_EXT: {
        0x00: "On/Off",
        0x02: "Send",
        0x03: "Return",
        0x04: "Dry",
    },
    EFFECT_ZNR: {
        0x00: "On/Off",
        0x01: "Type",
        0x02: "Threshold",
    },
    EFFECT_AMP: {
        0x00: "On/Off",
        0x01: "Type",
        0x02: "Gain",
        0x03: "Tone",
        0x04: "Level",
    },
    EFFECT_EQ: {
        0x00: "On/Off",
        0x02: "Band1",
        0x03: "Band2",
        0x04: "Band3",
        0x05: "Band4",
        0x06: "Band5",
        0x07: "Band6",
    },
    EFFECT_CAB: {
        0x00: "On/Off",
        0x02: "Depth",
        0x03: "MicType",
        0x04: "MicPos",
    },
    EFFECT_MOD: {
        0x00: "On/Off",
        0x01: "Type",
        0x02: "Depth",
        0x03: "Rate",
        0x04: "Tone",
        0x05: "Mix",
    },
    EFFECT_DLY: {
        0x00: "On/Off",
        0x01: "Type",
        0x02: "Time",
        0x03: "FeedBack",
        0x04: "HiDamp",
        0x05: "Mix",
    },
    EFFECT_REV: {
        0x00: "On/Off",
        0x01: "Type",
        0x02: "Decay",
        0x03: "PreDelay",
        0x04: "Tone",
        0x05: "Mix",
    },
}
