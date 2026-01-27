# Zoom G9.2tt MIDI Protocol Specification

**Version:** 1.0
**Date:** 2026-01-25
**Status:** Complete (Reverse Engineered)

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Connection Requirements](#2-connection-requirements)
3. [SysEx Message Structure](#3-sysex-message-structure)
4. [Commands Reference](#4-commands-reference)
5. [Data Encoding Formats](#5-data-encoding-formats)
6. [Patch Structure (128 bytes)](#6-patch-structure-128-bytes)
7. [Effect IDs & Parameters](#7-effect-ids--parameters)
8. [Operation Flows](#8-operation-flows)
9. [Code Examples](#9-code-examples)

---

## 1. Introduction

### Device Information

| Property | Value |
|----------|-------|
| Manufacturer | Zoom Corporation |
| Model | G9.2tt Twin Tube Guitar Effects Console |
| MIDI Manufacturer ID | 0x52 |
| MIDI Model ID | 0x42 |
| Patch Size | 128 bytes |
| Total Patches | 100 (00-99) |

### Protocol Overview

The G9.2tt uses MIDI System Exclusive (SysEx) messages for:
- Reading/writing patch data
- Real-time parameter control
- Patch selection and preview

---

## 2. Connection Requirements

### Hardware
- MIDI interface (USB-MIDI recommended)
- MIDI cables (IN and OUT)

### MIDI Connections
```
Computer MIDI OUT → G9.2tt MIDI IN
Computer MIDI IN  ← G9.2tt MIDI OUT
```

### Software Requirements
- MIDI library (mido, rtmidi, Web MIDI API)
- Support for SysEx messages

---

## 3. SysEx Message Structure

### General Format

```
F0 52 00 42 [CMD] [DATA...] F7
│  │  │  │   │      │       └── End of SysEx
│  │  │  │   │      └────────── Command data (variable length)
│  │  │  │   └───────────────── Command byte
│  │  │  └───────────────────── Model ID: 0x42 (G9.2tt)
│  │  └──────────────────────── Device ID: 0x00
│  └─────────────────────────── Manufacturer ID: 0x52 (Zoom)
└────────────────────────────── Start of SysEx
```

### Header (constant)
```
F0 52 00 42
```

### Footer
```
F7
```

---

## 4. Commands Reference

### Summary Table

| CMD | Name | Direction | Length | Description |
|-----|------|-----------|--------|-------------|
| 0x11 | Read Patch Request | → Device | 7 | Request patch data |
| 0x12 | Enter Edit Mode | → Device | 6 | Enter editing mode |
| 0x1F | Exit Edit Mode | → Device | 6 | Exit editing mode |
| 0x21 | Read Patch Response | ← Device | 268 | Patch data (nibble-encoded) |
| 0x28 | Write/Preview Patch | → Device | 153 | Send patch data (7-bit encoded) |
| 0x31 | Parameter Change | → Device | 10 | Real-time parameter control |
| 0x31 | Patch Select | → Device | 10 | Select/confirm patch |

### 0x11 - Read Patch Request

Request patch data from device.

```
F0 52 00 42 11 [PATCH] F7
                  │
                  └── Patch number (0x00-0x63 = 0-99)
```

**Length:** 7 bytes
**Response:** 0x21 (Read Patch Response)

### 0x12 - Enter Edit Mode

Enter editing mode. **Required before:**
- Write operations (0x28)
- Real-time parameter changes (0x31)

Without this command, the device will silently ignore parameter change commands.

```
F0 52 00 42 12 F7
```

**Length:** 6 bytes
**Response:** None (device enters edit mode silently)

### 0x1F - Exit Edit Mode

Exit editing mode.

```
F0 52 00 42 1F F7
```

**Length:** 6 bytes

### 0x21 - Read Patch Response

Device response containing patch data (nibble-encoded).

```
F0 52 00 42 21 [PATCH] [256 NIBBLES] [5 CHECKSUM] F7
                  │          │              │
                  │          │              └── Checksum bytes
                  │          └── Patch data (256 nibbles = 128 bytes)
                  └── Patch number
```

**Length:** 268 bytes
**Encoding:** Nibble (see Section 5.1)

### 0x28 - Write/Preview Patch Data

Send patch data for preview or writing.

```
F0 52 00 42 28 [147 BYTES] F7
                    │
                    └── Patch data (7-bit encoded)
```

**Length:** 153 bytes
**Encoding:** 7-bit (see Section 5.2)

### 0x31 - Parameter Change

Real-time parameter modification.

```
F0 52 00 42 31 [EFFECT_ID] [PARAM_ID] [VALUE] 00 F7
                    │           │        │
                    │           │        └── Value (0-127)
                    │           └── Parameter ID
                    └── Effect module ID
```

**Length:** 10 bytes
**Effect:** Immediate

### 0x31 - Patch Select

Select or confirm patch.

```
F0 52 00 42 31 [PATCH] 02 [MODE] 00 F7
                  │         │
                  │         └── Mode (02=preview, 09=select)
                  └── Patch number
```

**Length:** 10 bytes

---

## 5. Data Encoding Formats

### 5.1 Nibble Encoding (Read Response)

Used in command 0x21 (Read Patch Response).

**Conversion:** 128 bytes → 256 nibbles

Each original byte is split into two nibbles:
```
Original byte: 0xA5
High nibble:   0x0A
Low nibble:    0x05
Transmitted:   0A 05
```

**Decode Algorithm (Python):**
```python
def decode_nibbles(response):
    """Decode 268-byte response to 128 bytes"""
    nibbles = response[6:262]  # Extract 256 nibbles
    decoded = []
    for i in range(0, len(nibbles), 2):
        high = nibbles[i] & 0x0F
        low = nibbles[i+1] & 0x0F
        decoded.append((high << 4) | low)
    return bytes(decoded)
```

### 5.2 7-Bit Encoding (Write/Preview)

Used in command 0x28 (Write/Preview Patch).

**Conversion:** 128 bytes → 147 bytes

MIDI requires data bytes < 128. This encoding strips bit 7 from each byte and packs them separately.

**Structure:**
```
Every 7 bytes → 8 transmitted bytes
- 7 data bytes (bit 7 stripped)
- 1 byte containing the 7 high bits
```

**Encode Algorithm (Python):**
```python
def encode_7bit(data_128):
    """Encode 128 bytes to 147 bytes (7-bit safe)"""
    result = bytearray()
    for i in range(0, 128, 7):
        chunk = data_128[i:i+7]
        high_bits = 0
        for j, byte in enumerate(chunk):
            if byte & 0x80:
                high_bits |= (1 << j)
            result.append(byte & 0x7F)
        result.append(high_bits)
    return bytes(result[:147])
```

**Decode Algorithm (Python):**
```python
def decode_7bit(data_147):
    """Decode 147 bytes to 128 bytes"""
    result = bytearray()
    for i in range(0, 147, 8):
        chunk = data_147[i:i+7]
        high_bits = data_147[i+7] if i+7 < 147 else 0
        for j, byte in enumerate(chunk):
            if high_bits & (1 << j):
                byte |= 0x80
            result.append(byte)
    return bytes(result[:128])
```

---

## 6. Patch Structure (128 bytes)

The 128-byte patch data is organized as a bit matrix with 12 rows (effect modules).

### Module Layout

| Row | Module | Fields |
|-----|--------|--------|
| 0 | Global | PatchLevel, Tempo |
| 1 | CMP | On/Off, Type, Params 1-4 |
| 2 | WAH | On/Off, Type, Params 1-4 |
| 3 | EXT | On/Off, Params 1-3 |
| 4 | ZNR-A | On/Off, Type, Threshold |
| 5 | AMP-A | On/Off, Type, Gain, Tone, Level |
| 6 | EQ-A | On/Off, Bands 1-6 |
| 7 | CAB | On/Off, Depth, MicType, MicPos |
| 8 | MOD | On/Off, Type, Params 1-4 |
| 9 | DLY | On/Off, Type, Time, FeedBack, HiDamp, Mix |
| 10 | REV | On/Off, Type, Decay, PreDelay, Tone, Mix |
| 11 | Extra | ZNR-B, AMP-B, EQ-B settings |

### Bit Width Table

```python
BIT_TBL = [
    # Row 0: Global
    [7, 0, 0, 0, 0, 0, 0, 0],
    # Row 1: CMP
    [1, 2, 4, 2, 4, 6, 0, 0],
    # Row 2: WAH
    [1, 5, 5, 5, 5, 6, 0, 0],
    # Row 3: EXT
    [1, 0, 7, 7, 7, 0, 0, 0],
    # Row 4: ZNR-A
    [1, 2, 4, 0, 0, 0, 0, 0],
    # Row 5: AMP-A
    [1, 6, 7, 5, 7, 1, 0, 0],
    # Row 6: EQ-A
    [1, 0, 5, 5, 5, 5, 5, 5],
    # Row 7: CAB
    [1, 0, 1, 2, 2, 0, 0, 0],
    # Row 8: MOD
    [1, 5, 11, 7, 7, 7, 0, 0],
    # Row 9: DLY
    [1, 3, 13, 6, 4, 6, 0, 0],
    # Row 10: REV
    [1, 4, 5, 7, 4, 6, 0, 0],
    # Row 11: Extra (ZNR-B, AMP-B, EQ-B)
    [1, 2, 4, 1, 6, 7, 5, 7],
]
```

---

## 7. Effect IDs & Parameters

### Effect ID Table

| ID | Module | Description |
|----|--------|-------------|
| 0x00 | TOP | Global volume |
| 0x01 | CMP | Compressor/Limiter |
| 0x02 | WAH | Wah/EFX1 |
| 0x03 | EXT | External Loop |
| 0x04 | ZNR | Noise Reduction |
| 0x05 | AMP | Amplifier/Distortion |
| 0x06 | EQ | 6-Band Equalizer |
| 0x07 | CAB | Cabinet Simulator |
| 0x08 | MOD | Modulation/EFX2 |
| 0x09 | DLY | Delay |
| 0x0A | REV | Reverb |
| 0x0B | SYNC | System (heartbeat) |

### Parameter IDs

#### Common Structure
```
0x00 = On/Off (0=Off, 1=On)
0x01 = Type (effect type selector)
0x02+ = Effect-specific parameters
```

#### 0x00 - TOP
| Param | Name | Range |
|-------|------|-------|
| 0x05 | Level | 0-100 |

#### 0x01 - CMP (3 types)
| Param | Compressor | RackComp | Limiter | Range |
|-------|------------|----------|---------|-------|
| 0x00 | On/Off | On/Off | On/Off | 0-1 |
| 0x01 | Type | Type | Type | 0-2 |
| 0x02 | Sense | Threshold | Threshold | 0-50 |
| 0x03 | Attack | Ratio | Ratio | 0-9 |
| 0x04 | Tone | Attack | Release | 0-10 |
| 0x05 | Level | Level | Level | 0-49 |

#### 0x02 - WAH (17 types)
| Param | Name | Range |
|-------|------|-------|
| 0x00 | On/Off | 0-1 |
| 0x01 | Type | 0-16 |
| 0x02 | Position/Range | varies |
| 0x03 | Sense/Tone | varies |
| 0x04 | Resonance/Gain | varies |
| 0x05 | Level | 0-49 |

#### 0x03 - EXT
| Param | Name | Range |
|-------|------|-------|
| 0x00 | On/Off | 0-1 |
| 0x02 | Send | 0-100 |
| 0x03 | Return | 0-100 |
| 0x04 | Dry | 0-100 |

#### 0x04 - ZNR (3 types)
| Param | Name | Range |
|-------|------|-------|
| 0x00 | On/Off | 0-1 |
| 0x01 | Type | 0-2 |
| 0x02 | Threshold | 0-15 |

#### 0x05 - AMP (44 types)
| Param | Name | Range |
|-------|------|-------|
| 0x00 | On/Off | 0-1 |
| 0x01 | Type | 0-43 |
| 0x02 | Gain | 0-100 |
| 0x03 | Tone | 0-30 |
| 0x04 | Level | 0-99 |

#### 0x06 - EQ
| Param | Name | Range | Notes |
|-------|------|-------|-------|
| 0x00 | On/Off | 0-1 | |
| 0x02 | Band 1 | 0-31 | ~100Hz |
| 0x03 | Band 2 | 0-31 | ~200Hz |
| 0x04 | Band 3 | 0-31 | ~400Hz |
| 0x05 | Band 4 | 0-31 | ~800Hz |
| 0x06 | Band 5 | 0-31 | ~1.6kHz |
| 0x07 | Band 6 | 0-31 | ~3.2kHz |

Note: Value 16 = flat (0dB), <16 = cut, >16 = boost

#### 0x07 - CAB
| Param | Name | Range | Values |
|-------|------|-------|--------|
| 0x00 | On/Off | 0-1 | |
| 0x02 | Depth | 0-1 | 0=Small, 1=Middle |
| 0x03 | Mic Type | 0-3 | Dynamic/Condenser |
| 0x04 | Mic Position | 0-3 | |

#### 0x08 - MOD (28 types)
| Param | Name | Range |
|-------|------|-------|
| 0x00 | On/Off | 0-1 |
| 0x01 | Type | 0-27 |
| 0x02 | Depth/Rate | varies |
| 0x03 | Rate/Fine | varies |
| 0x04 | Tone/Resonance | varies |
| 0x05 | Mix | 0-50 |

#### 0x09 - DLY (7 types)
| Param | Name | Range |
|-------|------|-------|
| 0x00 | On/Off | 0-1 |
| 0x01 | Type | 0-6 |
| 0x02 | Time | 0-5022 (ms) |
| 0x03 | FeedBack | 0-50 |
| 0x04 | HiDamp | 0-10 |
| 0x05 | Mix | 0-50 |

#### 0x0A - REV (15 types)
| Param | Name | Range |
|-------|------|-------|
| 0x00 | On/Off | 0-1 |
| 0x01 | Type | 0-14 |
| 0x02 | Decay | 0-29 |
| 0x03 | PreDelay | 0-99 |
| 0x04 | Tone | 0-10 |
| 0x05 | Mix | 0-50 |

---

## 8. Operation Flows

### Read Patch

```
Host                           G9.2tt
  │                               │
  │─── F0 52 00 42 11 [N] F7 ────▶│  Request patch N
  │                               │
  │◀── F0 52 00 42 21 [N] [...] ──│  Response (268 bytes)
  │                               │
```

### Write Patch (Preview + Confirm)

```
Host                           G9.2tt
  │                               │
  │─── F0 52 00 42 12 F7 ────────▶│  Enter edit mode
  │                               │
  │─── F0 52 00 42 31 [N] 02 02 ─▶│  Select patch N
  │                               │
  │─── F0 52 00 42 28 [...] F7 ──▶│  Send patch data (preview)
  │                               │
  │─── F0 52 00 42 31 [N] 02 09 ─▶│  Confirm write
  │                               │
  │─── F0 52 00 42 1F F7 ────────▶│  Exit edit mode
  │                               │
```

### Real-Time Parameter Change

**IMPORTANT:** The device must be in Edit Mode (0x12) before parameter change commands (0x31) will be accepted. This was discovered on 2026-01-27 through bidirectional MIDI capture.

```
Host                           G9.2tt
  │                               │
  │─── F0 52 00 42 12 F7 ────────▶│  ENTER EDIT MODE (required!)
  │                               │
  │─── F0 52 00 42 31 05 02 50 ──▶│  Set AMP Gain to 80
  │       (immediate effect)      │
  │                               │
  │─── F0 52 00 42 31 01 00 00 ──▶│  Turn COMP Off
  │                               │
  │─── F0 52 00 42 31 01 00 01 ──▶│  Turn COMP On
  │                               │
  │        ... more changes ...   │
  │                               │
  │─── F0 52 00 42 1F F7 ────────▶│  EXIT EDIT MODE (when done)
  │                               │
```

**Key points:**
- Must send EDIT_ENTER (0x12) before any parameter changes
- Parameter changes take effect immediately (audible on pedal)
- Multiple parameters can be changed while in edit mode
- Send EXIT_EDIT (0x1F) when finished to return to normal operation
- Without EDIT_ENTER, the 0x31 commands are silently ignored

### Bulk Write (Send All to G9.2tt)

**Discovered 2026-01-25 via bidirectional capture.**

The bulk write uses a "pull" protocol where the pedal controls the transfer flow.
The pedal requests each patch sequentially and the host responds with patch data
in the same nibble-encoded format (0x21) used for read responses.

```
Host (G9ED)                    G9.2tt
  │                               │
  │─── Identity Request ─────────▶│  F0 7E 00 06 01 F7
  │◀── Identity Response ─────────│  F0 7E 00 06 02 52 42 ... F7
  │                               │
  │─── EDIT_ENTER (0x12) ────────▶│  F0 52 00 42 12 F7
  │                               │
  │◀── READ_REQ patch 0 ──────────│  F0 52 00 42 11 00 F7  (pedal requests)
  │─── READ_RESP patch 0 ────────▶│  F0 52 00 42 21 00 [256 nibbles] [5 chk] F7
  │                               │
  │◀── READ_REQ patch 1 ──────────│  F0 52 00 42 11 01 F7
  │─── READ_RESP patch 1 ────────▶│  F0 52 00 42 21 01 [256 nibbles] [5 chk] F7
  │                               │
  │         ... repeat for patches 2-99 ...
  │                               │
  │◀── EDIT_EXIT (0x1F) ──────────│  F0 52 00 42 1F F7  (pedal signals done)
  │                               │
```

**Key points:**
- Pedal initiates each transfer with READ_REQ (0x11)
- Host responds with READ_RESP (0x21) containing nibble-encoded data
- Same 268-byte format as read responses: 6-byte header + 256 nibbles + 5 checksum + F7
- Transfer rate: ~100ms per patch, ~10 seconds for all 100 patches
- Pedal sends EDIT_EXIT when bulk transfer is complete

**Note:** This is different from single patch write which uses command 0x28 (7-bit encoded).

### Bulk Read (Receive All from G9.2tt)

Standard read protocol repeated for all patches:

```
Host                           G9.2tt
  │                               │
  │─── Identity Request ─────────▶│
  │◀── Identity Response ─────────│
  │                               │
  │─── READ_REQ patch 0 ─────────▶│  F0 52 00 42 11 00 F7
  │◀── READ_RESP patch 0 ─────────│  F0 52 00 42 21 00 [...] F7
  │                               │
  │─── READ_REQ patch 1 ─────────▶│
  │◀── READ_RESP patch 1 ─────────│
  │         ... x100 ...          │
  │                               │
  │─── EDIT_EXIT ────────────────▶│  F0 52 00 42 1F F7
  │                               │
```

---

## 9. Code Examples

### Read Patch (Python)

```python
import mido

def read_patch(port_name, patch_num):
    """Read patch data from G9.2tt"""
    with mido.open_output(port_name) as out, \
         mido.open_input(port_name) as inp:

        # Send read request
        request = [0x52, 0x00, 0x42, 0x11, patch_num]
        out.send(mido.Message('sysex', data=request))

        # Wait for response
        for msg in inp:
            if msg.type == 'sysex' and len(msg.data) >= 6:
                if msg.data[3] == 0x42 and msg.data[4] == 0x21:
                    return decode_nibbles(bytes([0xF0] + list(msg.data) + [0xF7]))

    return None
```

### Set Parameter (Python)

```python
def enter_edit_mode(port):
    """Enter edit mode - REQUIRED before parameter changes"""
    port.send(mido.Message('sysex', data=[0x52, 0x00, 0x42, 0x12]))
    time.sleep(0.1)

def exit_edit_mode(port):
    """Exit edit mode"""
    port.send(mido.Message('sysex', data=[0x52, 0x00, 0x42, 0x1F]))

def set_parameter(port, effect_id, param_id, value):
    """Set effect parameter in real-time (must be in edit mode!)"""
    # F0 52 00 42 31 [effect] [param] [value] 00 F7
    data = [0x52, 0x00, 0x42, 0x31, effect_id, param_id, value, 0x00]
    port.send(mido.Message('sysex', data=data))

# Example: Set AMP Gain to 70
with mido.open_output('USB MIDI') as out:
    enter_edit_mode(out)          # REQUIRED!
    set_parameter(out, 0x05, 0x02, 70)  # AMP Gain = 70
    set_parameter(out, 0x01, 0x00, 1)   # COMP On
    # ... more changes ...
    exit_edit_mode(out)           # Clean up when done
```

### Write Patch (Python)

```python
def write_patch(port_name, patch_num, patch_data):
    """Write patch to G9.2tt"""
    with mido.open_output(port_name) as out:
        # Enter edit mode
        out.send(mido.Message('sysex', data=[0x52, 0x00, 0x42, 0x12]))
        time.sleep(0.1)

        # Select patch
        out.send(mido.Message('sysex',
            data=[0x52, 0x00, 0x42, 0x31, patch_num, 0x02, 0x02, 0x00]))
        time.sleep(0.1)

        # Send patch data
        encoded = encode_7bit(patch_data)
        out.send(mido.Message('sysex',
            data=[0x52, 0x00, 0x42, 0x28] + list(encoded)))
        time.sleep(0.1)

        # Confirm write
        out.send(mido.Message('sysex',
            data=[0x52, 0x00, 0x42, 0x31, patch_num, 0x02, 0x09, 0x00]))
        time.sleep(0.1)

        # Exit edit mode
        out.send(mido.Message('sysex', data=[0x52, 0x00, 0x42, 0x1F]))
```

---

## Appendix A: Effect Types

### AMP Types (44)

| ID | Name | Based On |
|----|------|----------|
| 0 | Fender Clean | Fender Twin Reverb '65 |
| 1 | VOX Clean | VOX AC30TBX |
| 2 | JC Clean | Roland Jazz Chorus |
| 3 | HiWatt Clean | HIWATT Custom100 |
| 4 | UK Blues | Marshall 1962 Bluesbreaker |
| 5 | US Blues | Fender Tweed Deluxe '53 |
| 6 | Tweed Bass | Fender Bassman |
| 7 | BG Crunch | MESA/BOOGIE Mark III |
| 8 | VOX Crunch | VOX AC30TBX |
| 9 | Z Combo | Original |
| 10 | MS #1959 | Marshall 1959 |
| 11 | MS Crunch | Marshall JCM800 |
| 12 | MS Drive | Marshall JCM2000 |
| 13-15 | Rect Clean/Vintage/Modern | MESA Dual Rectifier |
| 16-18 | HK Clean/Crunch/Drive | Hughes & Kettner TriAmp |
| 19-21 | DZ Clean/Crunch/Drive | Diezel Herbert |
| 22 | ENGL Drive | ENGL Ritchie Blackmore |
| 23 | PV Drive | Peavey 5150 |
| 24 | Z Stack | Original |
| 25-35 | Pedals | OD-1, TS808, Centaur, RAT, DS-1, etc. |
| 36-41 | Combos | Various combinations |
| 42 | Z Clean | Original |
| 43 | Aco.Sim | Acoustic Simulator |

### MOD Types (28)

Chorus, StereoChorus, Ensemble, ModDelay, Flanger, PitchShifter, PedalPitch, Vibrato, Step, Delay, TapeEcho, DynamicDelay, DynamicFlanger, MonoPitch, HarmonizedPitchShifter, PedalMonoPitch, Cry, ReverseDelay, BendChorus, CombFilter, Air, Z-Echo, X-Flanger, X-Step, Z-Step, Z-Pitch, Z-MonoPitch, Z-Talking

### DLY Types (7)

Delay, PingPongDelay, Echo, PingPongEcho, AnalogDelay, ReverseDelay, Air

### REV Types (15)

Hall, Room, Spring, Arena, TiledRoom, ModernSpring, EarlyReflection, MultiTapDelay, PanningDelay, PingPongDelay, PingPongEcho, AutoPan, Z-Delay, Z-Dimension, Z-Tornado

### WAH Types (17)

AutoWah, AutoResonance, Booster, Tremolo, Phaser, FixedPhaser, RingModulator, SlowAttack, PedalVox, PedalCryBaby, MultiWah, PedalResonanceFilter, Octave, X-Wah, X-Phaser, X-Vibe, Z-Oscillator

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | 2026-01-27 | CRITICAL: Documented that EDIT_ENTER (0x12) is required before parameter changes (0x31) work |
| 1.0 | 2026-01-25 | Initial release (reverse engineered) |

---

*This specification was created through reverse engineering of the Zoom G9.2tt and G9ED software. It is not official documentation from Zoom Corporation.*
