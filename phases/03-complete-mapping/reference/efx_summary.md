# Zoom G9.2tt Effect Parameters (G9ED.efx.xml)

- **Modules**: 12
- **Types (effects)**: 120
- **Parameters**: 420

## Modules

- **TOP** (1 types): Volume
- **CMP** (3 types): Compressor, RackComp, Limiter
- **WAH** (17 types): AutoWah, AutoResonance, Booster, Tremolo, Phaser, FixedPhaser, RingModulator, SlowAttack, PedalVox, PedalCryBaby, MultiWah, PedalResonanceFilter, Octave, X-Wah, X-Phaser, X-Vibe, Z-Oscillator
- **EXT** (1 types): EXT
- **ZNR** (3 types): ZNR, NoiseGate, DirtyGate
- **AMP** (44 types): Fender Clean, VOX Clean, JC Clean, HiWatt Clean, UK Blues, US Blues, Tweed Bass, BG Crunch, VOX Crunch, Z Combo, MS #1959, MS Crunch, MS Drive, Rect Clean, Rect Vintage, Rect Modern, HK Clean, HK Crunch, HK Drive, DZ Clean, DZ Crunch, DZ Drive, ENGL Drive, PV Drive, Z Stack, Over Drive, TS808, Centaur, Guv'nor, RAT, DS-1, dist+, HotBox, FuzzFace, BigMuff, MetalZone, TS+F_Cmb, SD+M_Stk, FZ+M_Stk, Z OD, ExtremeDS, DigiFuzz, Z Clean, Aco.Sim
- **EQ** (0 types): 
- **CAB** (0 types): 
- **MOD** (28 types): Chorus, StereoChorus, Ensemble, ModDelay, Flanger, PitchShifter, PedalPitch, Vibrato, Step, Delay, TapeEcho, DynamicDelay, DynamicFlanger, MonoPitch, HarmonizedPitchShifter, PedalMonoPitch, Cry, ReverseDelay, BendChorus, CombFilter, Air, Z-Echo, X-Flanger, X-Step, Z-Step, Z-Pitch, Z-MonoPitch, Z-Talking
- **DLY** (7 types): Delay, PingPongDelay, Echo, PingPongEcho, AnalogDelay, ReverseDelay, Air
- **REV** (15 types): Hall, Room, Spring, Arena, TiledRoom, ModernSpring, EarlyReflection, MultiTapDelay, PanningDelay, PingPongDelay, PingPongEcho, AutoPan, Z-Delay, Z-Dimension, Z-Tornado
- **TTL** (1 types): BPM

## TOP

### Volume

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Level | 80 | 100 | 100 | 0 | 0 | - |  |

## CMP

### Compressor

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Sense | 6 | 10 | 0 | 0 | 0 | - |  |
| Attack | 0 | 1 | 0 | 0 | 0 | RefTbl | Fast, Slow |
| Tone | 8 | 10 | 0 | 0 | 0 | - |  |
| Level | 39 | 49 | 0 | 0 | 1 | LvGain |  |

### RackComp

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Threshold | 40 | 50 | 0 | 0 | 0 | - |  |
| Ratio | 5 | 9 | 0 | 0 | 1 | - |  |
| Attack | 6 | 9 | 0 | 0 | 1 | - |  |
| Level | 39 | 49 | 0 | 0 | 1 | LvGain |  |

### Limiter

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Threshold | 10 | 50 | 0 | 0 | 0 | - |  |
| Ratio | 6 | 9 | 0 | 0 | 1 | - |  |
| Release | 9 | 9 | 0 | 0 | 1 | - |  |
| Level | 39 | 49 | 0 | 0 | 1 | LvGain |  |

## WAH

### AutoWah

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Position | 0 | 1 | 0 | 0 | 0 | WahRouting |  |
| Sense | 17 | 19 | 19 | 0 | 0 | RefTbl | -10, -9, -8... (20 vals) |
| Resonance | 8 | 10 | 10 | 0 | 0 | - |  |
| Level | 39 | 49 | 49 | 0 | 1 | LvGain |  |

### AutoResonance

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Position | 0 | 1 | 0 | 0 | 0 | WahRouting |  |
| Sense | 15 | 19 | 19 | 0 | 0 | RefTbl | -10, -9, -8... (20 vals) |
| Resonance | 8 | 10 | 10 | 0 | 0 | - |  |
| Level | 39 | 49 | 49 | 0 | 1 | LvGain |  |

### Booster

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Range | 2 | 4 | 0 | 0 | 1 | - |  |
| Tone | 6 | 10 | 0 | 0 | 0 | - |  |
| Gain | 8 | 10 | 10 | 0 | 0 | - |  |
| Level | 39 | 49 | 49 | 0 | 1 | LvGain |  |

### Tremolo

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Depth | 20 | 50 | 50 | 0 | 0 | LvGain |  |
| Rate | 40 | 78 | 50 | 50 | 0 | RefView | 32nd, 16th, quarter tri... (28 vals) |
| Wave | 15 | 29 | 29 | 0 | 0 | RefTbl | UP0, UP1, UP2... (30 vals) |
| Level | 39 | 49 | 49 | 0 | 1 | LvGain |  |

### Phaser

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Position | 0 | 1 | 0 | 0 | 0 | WahRouting |  |
| Rate | 15 | 78 | 50 | 50 | 0 | RefView | 32nd, 16th, quarter tri... (28 vals) |
| Color | 0 | 3 | 0 | 0 | 1 | - |  |
| Level | 39 | 49 | 49 | 0 | 1 | LvGain |  |

### FixedPhaser

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Position | 0 | 1 | 0 | 0 | 0 | WahRouting |  |
| Frequency | 15 | 49 | 49 | 49 | 1 | - |  |
| Color | 0 | 3 | 0 | 0 | 1 | - |  |
| Level | 39 | 49 | 49 | 0 | 1 | LvGain |  |

### RingModulator

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Position | 0 | 1 | 0 | 0 | 0 | WahRouting |  |
| Frequency | 39 | 49 | 49 | 0 | 1 | - |  |
| Balance | 25 | 50 | 50 | 0 | 0 | LvGain |  |
| Level | 39 | 49 | 49 | 0 | 1 | LvGain |  |

### SlowAttack

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Position | 0 | 1 | 0 | 0 | 0 | WahRouting |  |
| Time | 9 | 49 | 49 | 0 | 1 | - |  |
| Curve | 5 | 10 | 10 | 0 | 0 | - |  |
| Level | 39 | 49 | 49 | 0 | 1 | LvGain |  |

### PedalVox

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Position | 0 | 1 | 0 | 0 | 0 | WahRouting |  |
| Frequency | 14 | 49 | 49 | 0 | 1 | - |  |
| DryMix | 0 | 10 | 10 | 0 | 0 | - |  |
| Level | 34 | 49 | 49 | 0 | 1 | LvGain |  |

### PedalCryBaby

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Position | 0 | 1 | 0 | 0 | 0 | WahRouting |  |
| Frequency | 14 | 49 | 49 | 0 | 1 | - |  |
| DryMix | 0 | 10 | 10 | 0 | 0 | - |  |
| Level | 34 | 49 | 49 | 0 | 1 | LvGain |  |

### MultiWah

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Position | 0 | 1 | 0 | 0 | 0 | WahRouting |  |
| Frequency | 29 | 49 | 49 | 0 | 1 | - |  |
| Curve | 4 | 9 | 0 | 0 | 1 | - |  |
| Level | 39 | 49 | 49 | 0 | 1 | LvGain |  |

### PedalResonanceFilter

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Position | 0 | 1 | 0 | 0 | 0 | WahRouting |  |
| Frequency | 29 | 49 | 49 | 0 | 1 | - |  |
| Resonance | 7 | 10 | 10 | 0 | 0 | - |  |
| Level | 39 | 49 | 49 | 0 | 1 | LvGain |  |

### Octave

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| OctaveLevel | 40 | 50 | 50 | 0 | 0 | LvGain |  |
| DryLevel | 40 | 50 | 50 | 0 | 0 | LvGain |  |
| Tone | 8 | 10 | 0 | 0 | 0 | - |  |
| Level | 39 | 49 | 49 | 0 | 1 | LvGain |  |

### X-Wah

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Position | 0 | 1 | 0 | 0 | 0 | WahRouting |  |
| Frequency | 14 | 49 | 49 | 0 | 1 | - |  |
| X-Fade | 25 | 50 | 50 | 0 | 0 | LvGain |  |
| Level | 34 | 49 | 0 | 0 | 1 | LvGain |  |

### X-Phaser

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Color | 0 | 7 | 0 | 0 | 0 | RefTbl | 1,Before, 2,Before, 3,Before... (8 vals) |
| Rate | 15 | 78 | 50 | 50 | 0 | RefView | 32nd, 16th, quarter tri... (28 vals) |
| X-Fade | 25 | 50 | 50 | 0 | 0 | LvGain |  |
| Level | 39 | 49 | 0 | 0 | 1 | LvGain |  |

### X-Vibe

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| PHA Rate | 15 | 78 | 50 | 50 | 0 | RefView | 32nd, 16th, quarter tri... (28 vals) |
| TRM Rate | 15 | 78 | 50 | 50 | 0 | RefView | 32nd, 16th, quarter tri... (28 vals) |
| X-Fade | 25 | 50 | 50 | 0 | 0 | LvGain |  |
| Level | 39 | 49 | 0 | 0 | 1 | LvGain |  |

### Z-Oscillator

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Frequency | 62 | 62 | 60 | 60 | 33 | note RefView | Auto,Before, Auto,After |
| Portament | 8 | 10 | 10 | 0 | 0 | - |  |
| Vibrato | 0 | 10 | 10 | 0 | 0 | - |  |
| Balance | 0 | 50 | 50 | 0 | 0 | LvGain |  |

## EXT

### EXT

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Send | 80 | 100 | 100 | 0 | 0 | - |  |
| Return | 80 | 100 | 100 | 0 | 0 | - |  |
| Dry | 0 | 100 | 100 | 0 | 0 | - |  |

## ZNR

### ZNR

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Threshold | 9 | 15 | 0 | 0 | 1 | - |  |

### NoiseGate

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Threshold | 9 | 15 | 0 | 0 | 1 | - |  |

### DirtyGate

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Threshold | 9 | 15 | 0 | 0 | 1 | - |  |

## AMP

### Fender Clean

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### VOX Clean

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### JC Clean

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### HiWatt Clean

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### UK Blues

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### US Blues

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### Tweed Bass

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### BG Crunch

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### VOX Crunch

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### Z Combo

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### MS #1959

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### MS Crunch

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### MS Drive

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### Rect Clean

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 50 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### Rect Vintage

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### Rect Modern

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### HK Clean

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 50 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### HK Crunch

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### HK Drive

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### DZ Clean

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 50 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### DZ Crunch

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### DZ Drive

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### ENGL Drive

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### PV Drive

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### Z Stack

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### Over Drive

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### TS808

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### Centaur

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### Guv'nor

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### RAT

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### DS-1

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### dist+

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### HotBox

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### FuzzFace

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### BigMuff

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### MetalZone

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### TS+F_Cmb

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### SD+M_Stk

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### FZ+M_Stk

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### Z OD

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### ExtremeDS

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### DigiFuzz

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### Z Clean

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Gain | 60 | 100 | 100 | 0 | 0 | - |  |
| Tone | 15 | 30 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

### Aco.Sim

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Top | 8 | 10 | 10 | 0 | 0 | - |  |
| Body | 5 | 10 | 0 | 0 | 0 | - |  |
| Level | 79 | 99 | 99 | 0 | 1 | - |  |

## EQ

## CAB

## MOD

### Chorus

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Depth | 20 | 50 | 0 | 0 | 0 | LvGain |  |
| Rate | 24 | 49 | 49 | 0 | 1 | - |  |
| Tone | 7 | 10 | 0 | 0 | 0 | - |  |
| Mix | 25 | 50 | 50 | 0 | 0 | LvGain |  |

### StereoChorus

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Depth | 40 | 50 | 50 | 0 | 0 | LvGain |  |
| Rate | 29 | 49 | 49 | 0 | 1 | - |  |
| Tone | 7 | 10 | 0 | 0 | 0 | - |  |
| Mix | 30 | 50 | 50 | 0 | 0 | LvGain |  |

### Ensemble

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Depth | 40 | 50 | 0 | 0 | 0 | LvGain |  |
| Rate | 29 | 49 | 0 | 0 | 1 | - |  |
| Tone | 7 | 10 | 0 | 0 | 0 | - |  |
| Mix | 30 | 50 | 50 | 0 | 0 | LvGain |  |

### ModDelay

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Time | 239 | 2014 | 0 | 1999 | 1 | time RefView BpmSync | 16th, quarter tri, 16th dot... (15 vals) |
| FeedBack | 15 | 50 | 50 | 0 | 0 | LvGain |  |
| Rate | 24 | 49 | 49 | 0 | 1 | - |  |
| Mix | 25 | 50 | 50 | 0 | 0 | LvGain |  |

### Flanger

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Depth | 15 | 50 | 50 | 0 | 0 | LvGain |  |
| Rate | 7 | 78 | 50 | 50 | 0 | RefView | 32nd, 16th, quarter tri... (28 vals) |
| Resonance | 14 | 20 | 20 | 0 | -10 | - |  |
| Manual | 8 | 50 | 50 | 0 | 0 | LvGain |  |

### PitchShifter

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Shift | 24 | 25 | 0 | 0 | 8 | RefTbl | -12, -11, -10... (26 vals) |
| Tone | 6 | 10 | 0 | 0 | 0 | - |  |
| Fine | 25 | 50 | 0 | 0 | -25 | - |  |
| Balance | 20 | 50 | 50 | 0 | 0 | LvGain |  |

### PedalPitch

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Color | 4 | 7 | 0 | 0 | 1 | - |  |
| Mode | 0 | 1 | 0 | 0 | 0 | RefTbl | Up, Down |
| Tone | 8 | 10 | 0 | 0 | 0 | - |  |
| PedalPosition | 0 | 100 | 100 | 0 | 0 | - |  |

### Vibrato

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Depth | 20 | 50 | 50 | 0 | 0 | LvGain |  |
| Rate | 30 | 78 | 50 | 50 | 0 | RefView | 32nd, 16th, quarter tri... (28 vals) |
| Tone | 7 | 10 | 0 | 0 | 0 | - |  |
| Balance | 36 | 50 | 50 | 0 | 0 | LvGain |  |

### Step

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Depth | 30 | 50 | 50 | 0 | 0 | LvGain |  |
| Rate | 30 | 78 | 50 | 50 | 0 | RefView | 32nd, 16th, quarter tri... (28 vals) |
| Resonance | 6 | 10 | 10 | 0 | 0 | - |  |
| Shape | 8 | 10 | 10 | 0 | 0 | - |  |

### Delay

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Time | 239 | 2014 | 0 | 1999 | 1 | time RefView BpmSync | 16th, quarter tri, 16th dot... (15 vals) |
| FeedBack | 9 | 50 | 50 | 0 | 0 | LvGain |  |
| HiDamp | 8 | 10 | 0 | 0 | 0 | - |  |
| Mix | 25 | 50 | 50 | 0 | 0 | LvGain |  |

### TapeEcho

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Time | 239 | 2014 | 0 | 1999 | 1 | time RefView BpmSync | 16th, quarter tri, 16th dot... (15 vals) |
| FeedBack | 15 | 50 | 50 | 0 | 0 | LvGain |  |
| HiDamp | 8 | 10 | 0 | 0 | 0 | - |  |
| Mix | 25 | 50 | 50 | 0 | 0 | LvGain |  |

### DynamicDelay

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Time | 359 | 2014 | 0 | 1999 | 1 | time RefView BpmSync | 16th, quarter tri, 16th dot... (15 vals) |
| Amount | 40 | 50 | 50 | 0 | 0 | LvGain |  |
| FeedBack | 15 | 50 | 50 | 0 | 0 | LvGain |  |
| Sense | 5 | 19 | 19 | 0 | 0 | RefTbl | -10, -9, -8... (20 vals) |

### DynamicFlanger

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Depth | 30 | 50 | 50 | 0 | 0 | LvGain |  |
| Rate | 12 | 78 | 50 | 50 | 0 | RefView | 32nd, 16th, quarter tri... (28 vals) |
| Resonance | 17 | 20 | 20 | 0 | -10 | - |  |
| Sense | 16 | 19 | 19 | 0 | 0 | RefTbl | -10, -9, -8... (20 vals) |

### MonoPitch

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Shift | 20 | 26 | 0 | 0 | 10 | RefTbl | -24, -12, -11... (27 vals) |
| Tone | 6 | 10 | 0 | 0 | 0 | - |  |
| Fine | 25 | 50 | 0 | 0 | -25 | - |  |
| Balance | 25 | 50 | 50 | 0 | 0 | LvGain |  |

### HarmonizedPitchShifter

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Scale | 5 | 9 | 0 | 0 | 0 | RefTbl | -6, -5, -4... (10 vals) |
| Key | 0 | 11 | 0 | 0 | 0 | RefTbl | C, C#, D... (12 vals) |
| Tone | 6 | 10 | 0 | 0 | 0 | - |  |
| Mix | 35 | 50 | 50 | 0 | 0 | LvGain |  |

### PedalMonoPitch

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Color | 4 | 7 | 0 | 0 | 1 | - |  |
| Mode | 0 | 1 | 0 | 0 | 0 | RefTbl | Up, Down |
| Tone | 8 | 10 | 0 | 0 | 0 | - |  |
| PedalPosition | 0 | 100 | 100 | 0 | 0 | - |  |

### Cry

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Range | 4 | 9 | 9 | 0 | 1 | - |  |
| Resonance | 8 | 10 | 10 | 0 | 0 | - |  |
| Sense | 16 | 19 | 19 | 0 | 0 | RefTbl | -10, -9, -8... (20 vals) |
| Balance | 50 | 50 | 50 | 0 | 0 | LvGain |  |

### ReverseDelay

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Time | 350 | 1001 | 0 | 990 | 10 | time RefView BpmSync | 16th, quarter tri, 16th dot... (11 vals) |
| FeedBack | 25 | 50 | 50 | 0 | 0 | LvGain |  |
| HiDamp | 8 | 10 | 0 | 0 | 0 | - |  |
| Balance | 25 | 50 | 50 | 0 | 0 | LvGain |  |

### BendChorus

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Depth | 40 | 50 | 50 | 0 | -25 | LvGain |  |
| Attack | 0 | 9 | 9 | 0 | 1 | - |  |
| Release | 9 | 9 | 9 | 0 | 1 | - |  |
| Balance | 25 | 50 | 50 | 0 | 0 | LvGain |  |

### CombFilter

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Frequency | 0 | 49 | 49 | 0 | 1 | - |  |
| Resonance | 18 | 20 | 20 | 0 | -10 | - |  |
| HiDamp | 10 | 10 | 0 | 0 | 0 | - |  |
| Mix | 50 | 50 | 50 | 0 | 0 | LvGain |  |

### Air

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Size | 9 | 99 | 0 | 0 | 1 | - |  |
| Reflex | 6 | 10 | 10 | 0 | 0 | - |  |
| Tone | 8 | 10 | 0 | 0 | 0 | - |  |
| Mix | 20 | 50 | 50 | 0 | 0 | LvGain |  |

### Z-Echo

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Time | 35 | 99 | 99 | 0 | 1 | time10 |  |
| FeedBack | 9 | 50 | 50 | 0 | 0 | LvGain |  |
| HiDamp | 8 | 10 | 0 | 0 | 0 | - |  |
| Mix | 20 | 50 | 50 | 0 | 0 | LvGain |  |

### X-Flanger

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Depth | 15 | 50 | 0 | 0 | 0 | LvGain |  |
| Rate | 7 | 78 | 50 | 50 | 0 | RefView | 32nd, 16th, quarter tri... (28 vals) |
| X-Fade | 50 | 50 | 50 | 0 | 0 | LvGain |  |
| Manual | 8 | 50 | 0 | 0 | 0 | LvGain |  |

### X-Step

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Depth | 30 | 50 | 0 | 0 | 0 | LvGain |  |
| Rate | 30 | 78 | 50 | 50 | 0 | RefView | 32nd, 16th, quarter tri... (28 vals) |
| X-Fade | 50 | 50 | 50 | 0 | 0 | LvGain |  |
| Shape | 8 | 10 | 0 | 0 | 0 | - |  |

### Z-Step

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Frequency | 19 | 49 | 49 | 0 | 1 | - |  |
| Depth | 25 | 50 | 0 | 0 | 0 | LvGain |  |
| Shape | 8 | 10 | 0 | 0 | 0 | - |  |
| Mix | 30 | 50 | 50 | 0 | 0 | LvGain |  |

### Z-Pitch

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Color | 0 | 7 | 0 | 0 | 1 | - |  |
| Tone | 8 | 10 | 0 | 0 | 0 | - |  |
| PedalPosition V | 0 | 100 | 100 | 0 | 0 | - |  |
| PedalPosition H | 0 | 100 | 100 | 0 | 0 | - |  |

### Z-MonoPitch

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Color | 0 | 7 | 0 | 0 | 1 | - |  |
| Tone | 8 | 10 | 0 | 0 | 0 | - |  |
| PedalPosition V | 0 | 100 | 100 | 0 | 0 | - |  |
| PedalPosition H | 0 | 100 | 100 | 0 | 0 | - |  |

### Z-Talking

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Variation | 4 | 4 | 0 | 0 | 1 | - |  |
| Tone | 8 | 10 | 0 | 0 | 0 | - |  |
| Formant V | 0 | 100 | 100 | 0 | 0 | - |  |
| Formant H | 0 | 100 | 100 | 0 | 0 | - |  |

## DLY

### Delay

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Time | 359 | 5022 | 0 | 4999 | 1 | time RefView BpmSync | 16th, quarter tri, 16th dot... (23 vals) |
| FeedBack | 10 | 50 | 50 | 0 | 0 | LvGain |  |
| HiDamp | 8 | 10 | 0 | 0 | 0 | - |  |
| Mix | 20 | 50 | 50 | 0 | 0 | LvGain |  |

### PingPongDelay

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Time | 359 | 5022 | 0 | 4999 | 1 | time RefView BpmSync | 16th, quarter tri, 16th dot... (23 vals) |
| FeedBack | 10 | 50 | 50 | 0 | 0 | LvGain |  |
| HiDamp | 8 | 10 | 0 | 0 | 0 | - |  |
| Mix | 20 | 50 | 50 | 0 | 0 | LvGain |  |

### Echo

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Time | 359 | 5022 | 0 | 4999 | 1 | time RefView BpmSync | 16th, quarter tri, 16th dot... (23 vals) |
| FeedBack | 10 | 50 | 50 | 0 | 0 | LvGain |  |
| HiDamp | 8 | 10 | 0 | 0 | 0 | - |  |
| Mix | 20 | 50 | 50 | 0 | 0 | LvGain |  |

### PingPongEcho

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Time | 359 | 5022 | 0 | 4999 | 1 | time RefView BpmSync | 16th, quarter tri, 16th dot... (23 vals) |
| FeedBack | 10 | 50 | 50 | 0 | 0 | LvGain |  |
| HiDamp | 8 | 10 | 0 | 0 | 0 | - |  |
| Mix | 20 | 50 | 50 | 0 | 0 | LvGain |  |

### AnalogDelay

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Time | 599 | 5022 | 0 | 4999 | 1 | time RefView BpmSync | 16th, quarter tri, 16th dot... (23 vals) |
| FeedBack | 15 | 50 | 50 | 0 | 0 | LvGain |  |
| HiDamp | 8 | 10 | 0 | 0 | 0 | - |  |
| Mix | 35 | 50 | 50 | 0 | 0 | LvGain |  |

### ReverseDelay

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Time | 350 | 2505 | 0 | 2490 | 10 | time RefView BpmSync | 16th, quarter tri, 16th dot... (15 vals) |
| FeedBack | 20 | 50 | 50 | 0 | 0 | LvGain |  |
| HiDamp | 8 | 10 | 0 | 0 | 0 | - |  |
| Balance | 25 | 50 | 50 | 0 | 0 | LvGain |  |

### Air

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Size | 9 | 99 | 0 | 0 | 1 | - |  |
| Reflex | 6 | 10 | 10 | 0 | 0 | - |  |
| Tone | 8 | 10 | 0 | 0 | 0 | - |  |
| Mix | 20 | 50 | 50 | 0 | 0 | LvGain |  |

## REV

### Hall

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Decay | 9 | 29 | 29 | 0 | 1 | - |  |
| PreDelay | 44 | 99 | 0 | 0 | 1 | - |  |
| Tone | 5 | 10 | 0 | 0 | 0 | - |  |
| Mix | 30 | 50 | 50 | 0 | 0 | LvGain |  |

### Room

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Decay | 9 | 29 | 29 | 0 | 1 | - |  |
| PreDelay | 4 | 99 | 0 | 0 | 1 | - |  |
| Tone | 5 | 10 | 0 | 0 | 0 | - |  |
| Mix | 30 | 50 | 50 | 0 | 0 | LvGain |  |

### Spring

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Decay | 19 | 29 | 29 | 0 | 1 | - |  |
| PreDelay | 0 | 99 | 0 | 0 | 1 | - |  |
| Tone | 4 | 10 | 0 | 0 | 0 | - |  |
| Mix | 30 | 50 | 50 | 0 | 0 | LvGain |  |

### Arena

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Decay | 14 | 29 | 29 | 0 | 1 | - |  |
| PreDelay | 89 | 99 | 0 | 0 | 1 | - |  |
| Tone | 8 | 10 | 0 | 0 | 0 | - |  |
| Mix | 30 | 50 | 50 | 0 | 0 | LvGain |  |

### TiledRoom

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Decay | 19 | 29 | 29 | 0 | 1 | - |  |
| PreDelay | 9 | 99 | 0 | 0 | 1 | - |  |
| Tone | 8 | 10 | 0 | 0 | 0 | - |  |
| Mix | 35 | 50 | 50 | 0 | 0 | LvGain |  |

### ModernSpring

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Decay | 19 | 29 | 29 | 0 | 1 | - |  |
| PreDelay | 0 | 99 | 0 | 0 | 1 | - |  |
| Tone | 7 | 10 | 0 | 0 | 0 | - |  |
| Mix | 25 | 50 | 50 | 0 | 0 | LvGain |  |

### EarlyReflection

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Decay | 9 | 29 | 0 | 0 | 1 | - |  |
| Shape | 20 | 20 | 20 | 0 | -10 | - |  |
| Tone | 6 | 10 | 0 | 0 | 0 | - |  |
| Mix | 25 | 50 | 50 | 0 | 0 | LvGain |  |

### MultiTapDelay

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Time | 3008 | 3018 | 0 | 2999 | 1 | time RefView | 16th, quarter tri, 16th dot... (19 vals) |
| Pattern | 1 | 7 | 0 | 0 | 1 | - |  |
| Tone | 10 | 10 | 0 | 0 | 0 | - |  |
| Mix | 10 | 50 | 50 | 0 | 0 | LvGain |  |

### PanningDelay

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Time | 34 | 3018 | 0 | 2999 | 1 | time RefView | 16th, quarter tri, 16th dot... (19 vals) |
| FeedBack | 6 | 50 | 50 | 0 | 0 | LvGain |  |
| HiDamp | 5 | 10 | 0 | 0 | 0 | - |  |
| Pan | 5 | 50 | 50 | 0 | 0 | RefTbl | L50, L48, L46... (51 vals) |

### PingPongDelay

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Time | 3008 | 3018 | 0 | 2999 | 1 | time RefView BpmSync | 16th, quarter tri, 16th dot... (19 vals) |
| FeedBack | 5 | 50 | 50 | 0 | 0 | LvGain |  |
| HiDamp | 5 | 10 | 0 | 0 | 0 | - |  |
| Mix | 35 | 50 | 50 | 0 | 0 | LvGain |  |

### PingPongEcho

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Time | 3008 | 3018 | 0 | 2999 | 1 | time RefView BpmSync | 16th, quarter tri, 16th dot... (19 vals) |
| FeedBack | 5 | 50 | 50 | 0 | 0 | LvGain |  |
| HiDamp | 5 | 10 | 0 | 0 | 0 | - |  |
| Mix | 35 | 50 | 50 | 0 | 0 | LvGain |  |

### AutoPan

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Width | 40 | 50 | 50 | 0 | 0 | RefTbl | L50, L48, L46... (51 vals) |
| Rate | 48 | 78 | 50 | 50 | 0 | RefView | 32nd, 16th, quarter tri... (28 vals) |
| Depth | 5 | 10 | 10 | 0 | 0 | - |  |
| Wave | 1 | 10 | 10 | 0 | 0 | - |  |

### Z-Delay

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Time | 3008 | 3018 | 0 | 2999 | 1 | time RefView BpmSync | 16th, quarter tri, 16th dot... (19 vals) |
| FeedBack | 5 | 50 | 0 | 0 | 0 | LvGain |  |
| Pan | 25 | 50 | 50 | 0 | 0 | RefTbl | L50, L48, L46... (51 vals) |
| Mix | 35 | 50 | 50 | 0 | 0 | LvGain |  |

### Z-Dimension

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Pan | 25 | 50 | 50 | 0 | 0 | RefTbl | L50, L48, L46... (51 vals) |
| Depth | 0 | 50 | 50 | 0 | 0 | LvGain |  |
| Decay | 1 | 29 | 0 | 0 | 1 | - |  |
| Mix | 13 | 50 | 0 | 0 | 0 | LvGain |  |

### Z-Tornado

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| Time | 179 | 3018 | 0 | 2999 | 1 | time RefView BpmSync | 16th, quarter tri, 16th dot... (19 vals) |
| Rate | 9 | 77 | 49 | 49 | 1 | RefView | 32nd, 16th, quarter tri... (28 vals) |
| Width | 50 | 50 | 50 | 0 | 0 | RefTbl | L50, L48, L46... (51 vals) |
| Mix | 30 | 50 | 50 | 0 | 0 | LvGain |  |

## TTL

### BPM

| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |
|-----------|------|-----|---------|---------|--------|---------|--------------|
| ARRM BPM | 120 | 250 | 250 | 0 | 0 | - |  |

## Highlights

### Parameters with offset != 0

These parameters display as `display_value = midi_value + offset`.

| Module | Type | Parameter | Offset |
|--------|------|-----------|--------|
| CMP | Compressor | Level | 1 |
| CMP | RackComp | Ratio | 1 |
| CMP | RackComp | Attack | 1 |
| CMP | RackComp | Level | 1 |
| CMP | Limiter | Ratio | 1 |
| CMP | Limiter | Release | 1 |
| CMP | Limiter | Level | 1 |
| WAH | AutoWah | Level | 1 |
| WAH | AutoResonance | Level | 1 |
| WAH | Booster | Range | 1 |
| WAH | Booster | Level | 1 |
| WAH | Tremolo | Level | 1 |
| WAH | Phaser | Color | 1 |
| WAH | Phaser | Level | 1 |
| WAH | FixedPhaser | Frequency | 1 |
| WAH | FixedPhaser | Color | 1 |
| WAH | FixedPhaser | Level | 1 |
| WAH | RingModulator | Frequency | 1 |
| WAH | RingModulator | Level | 1 |
| WAH | SlowAttack | Time | 1 |
| WAH | SlowAttack | Level | 1 |
| WAH | PedalVox | Frequency | 1 |
| WAH | PedalVox | Level | 1 |
| WAH | PedalCryBaby | Frequency | 1 |
| WAH | PedalCryBaby | Level | 1 |
| WAH | MultiWah | Frequency | 1 |
| WAH | MultiWah | Curve | 1 |
| WAH | MultiWah | Level | 1 |
| WAH | PedalResonanceFilter | Frequency | 1 |
| WAH | PedalResonanceFilter | Level | 1 |
| WAH | Octave | Level | 1 |
| WAH | X-Wah | Frequency | 1 |
| WAH | X-Wah | Level | 1 |
| WAH | X-Phaser | Level | 1 |
| WAH | X-Vibe | Level | 1 |
| WAH | Z-Oscillator | Frequency | 33 |
| ZNR | ZNR | Threshold | 1 |
| ZNR | NoiseGate | Threshold | 1 |
| ZNR | DirtyGate | Threshold | 1 |
| AMP | Fender Clean | Level | 1 |
| AMP | VOX Clean | Level | 1 |
| AMP | JC Clean | Level | 1 |
| AMP | HiWatt Clean | Level | 1 |
| AMP | UK Blues | Level | 1 |
| AMP | US Blues | Level | 1 |
| AMP | Tweed Bass | Level | 1 |
| AMP | BG Crunch | Level | 1 |
| AMP | VOX Crunch | Level | 1 |
| AMP | Z Combo | Level | 1 |
| AMP | MS #1959 | Level | 1 |
| AMP | MS Crunch | Level | 1 |
| AMP | MS Drive | Level | 1 |
| AMP | Rect Clean | Level | 1 |
| AMP | Rect Vintage | Level | 1 |
| AMP | Rect Modern | Level | 1 |
| AMP | HK Clean | Level | 1 |
| AMP | HK Crunch | Level | 1 |
| AMP | HK Drive | Level | 1 |
| AMP | DZ Clean | Level | 1 |
| AMP | DZ Crunch | Level | 1 |
| AMP | DZ Drive | Level | 1 |
| AMP | ENGL Drive | Level | 1 |
| AMP | PV Drive | Level | 1 |
| AMP | Z Stack | Level | 1 |
| AMP | Over Drive | Level | 1 |
| AMP | TS808 | Level | 1 |
| AMP | Centaur | Level | 1 |
| AMP | Guv'nor | Level | 1 |
| AMP | RAT | Level | 1 |
| AMP | DS-1 | Level | 1 |
| AMP | dist+ | Level | 1 |
| AMP | HotBox | Level | 1 |
| AMP | FuzzFace | Level | 1 |
| AMP | BigMuff | Level | 1 |
| AMP | MetalZone | Level | 1 |
| AMP | TS+F_Cmb | Level | 1 |
| AMP | SD+M_Stk | Level | 1 |
| AMP | FZ+M_Stk | Level | 1 |
| AMP | Z OD | Level | 1 |
| AMP | ExtremeDS | Level | 1 |
| AMP | DigiFuzz | Level | 1 |
| AMP | Z Clean | Level | 1 |
| AMP | Aco.Sim | Level | 1 |
| MOD | Chorus | Rate | 1 |
| MOD | StereoChorus | Rate | 1 |
| MOD | Ensemble | Rate | 1 |
| MOD | ModDelay | Time | 1 |
| MOD | ModDelay | Rate | 1 |
| MOD | Flanger | Resonance | -10 |
| MOD | PitchShifter | Shift | 8 |
| MOD | PitchShifter | Fine | -25 |
| MOD | PedalPitch | Color | 1 |
| MOD | Delay | Time | 1 |
| MOD | TapeEcho | Time | 1 |
| MOD | DynamicDelay | Time | 1 |
| MOD | DynamicFlanger | Resonance | -10 |
| MOD | MonoPitch | Shift | 10 |
| MOD | MonoPitch | Fine | -25 |
| MOD | PedalMonoPitch | Color | 1 |
| MOD | Cry | Range | 1 |
| MOD | ReverseDelay | Time | 10 |
| MOD | BendChorus | Depth | -25 |
| MOD | BendChorus | Attack | 1 |
| MOD | BendChorus | Release | 1 |
| MOD | CombFilter | Frequency | 1 |
| MOD | CombFilter | Resonance | -10 |
| MOD | Air | Size | 1 |
| MOD | Z-Echo | Time | 1 |
| MOD | Z-Step | Frequency | 1 |
| MOD | Z-Pitch | Color | 1 |
| MOD | Z-MonoPitch | Color | 1 |
| MOD | Z-Talking | Variation | 1 |
| DLY | Delay | Time | 1 |
| DLY | PingPongDelay | Time | 1 |
| DLY | Echo | Time | 1 |
| DLY | PingPongEcho | Time | 1 |
| DLY | AnalogDelay | Time | 1 |
| DLY | ReverseDelay | Time | 10 |
| DLY | Air | Size | 1 |
| REV | Hall | Decay | 1 |
| REV | Hall | PreDelay | 1 |
| REV | Room | Decay | 1 |
| REV | Room | PreDelay | 1 |
| REV | Spring | Decay | 1 |
| REV | Spring | PreDelay | 1 |
| REV | Arena | Decay | 1 |
| REV | Arena | PreDelay | 1 |
| REV | TiledRoom | Decay | 1 |
| REV | TiledRoom | PreDelay | 1 |
| REV | ModernSpring | Decay | 1 |
| REV | ModernSpring | PreDelay | 1 |
| REV | EarlyReflection | Decay | 1 |
| REV | EarlyReflection | Shape | -10 |
| REV | MultiTapDelay | Time | 1 |
| REV | MultiTapDelay | Pattern | 1 |
| REV | PanningDelay | Time | 1 |
| REV | PingPongDelay | Time | 1 |
| REV | PingPongEcho | Time | 1 |
| REV | Z-Delay | Time | 1 |
| REV | Z-Dimension | Decay | 1 |
| REV | Z-Tornado | Time | 1 |
| REV | Z-Tornado | Rate | 1 |

### Parameters with rtm_max != 0 (real-time controllable)

| Module | Type | Parameter | rtm_max | max | Match? |
|--------|------|-----------|---------|-----|--------|
| TOP | Volume | Level | 100 | 100 | Yes |
| WAH | AutoWah | Sense | 19 | 19 | Yes |
| WAH | AutoWah | Resonance | 10 | 10 | Yes |
| WAH | AutoWah | Level | 49 | 49 | Yes |
| WAH | AutoResonance | Sense | 19 | 19 | Yes |
| WAH | AutoResonance | Resonance | 10 | 10 | Yes |
| WAH | AutoResonance | Level | 49 | 49 | Yes |
| WAH | Booster | Gain | 10 | 10 | Yes |
| WAH | Booster | Level | 49 | 49 | Yes |
| WAH | Tremolo | Depth | 50 | 50 | Yes |
| WAH | Tremolo | Rate | 50 | 78 | **No** |
| WAH | Tremolo | Wave | 29 | 29 | Yes |
| WAH | Tremolo | Level | 49 | 49 | Yes |
| WAH | Phaser | Rate | 50 | 78 | **No** |
| WAH | Phaser | Level | 49 | 49 | Yes |
| WAH | FixedPhaser | Frequency | 49 | 49 | Yes |
| WAH | FixedPhaser | Level | 49 | 49 | Yes |
| WAH | RingModulator | Frequency | 49 | 49 | Yes |
| WAH | RingModulator | Balance | 50 | 50 | Yes |
| WAH | RingModulator | Level | 49 | 49 | Yes |
| WAH | SlowAttack | Time | 49 | 49 | Yes |
| WAH | SlowAttack | Curve | 10 | 10 | Yes |
| WAH | SlowAttack | Level | 49 | 49 | Yes |
| WAH | PedalVox | Frequency | 49 | 49 | Yes |
| WAH | PedalVox | DryMix | 10 | 10 | Yes |
| WAH | PedalVox | Level | 49 | 49 | Yes |
| WAH | PedalCryBaby | Frequency | 49 | 49 | Yes |
| WAH | PedalCryBaby | DryMix | 10 | 10 | Yes |
| WAH | PedalCryBaby | Level | 49 | 49 | Yes |
| WAH | MultiWah | Frequency | 49 | 49 | Yes |
| WAH | MultiWah | Level | 49 | 49 | Yes |
| WAH | PedalResonanceFilter | Frequency | 49 | 49 | Yes |
| WAH | PedalResonanceFilter | Resonance | 10 | 10 | Yes |
| WAH | PedalResonanceFilter | Level | 49 | 49 | Yes |
| WAH | Octave | OctaveLevel | 50 | 50 | Yes |
| WAH | Octave | DryLevel | 50 | 50 | Yes |
| WAH | Octave | Level | 49 | 49 | Yes |
| WAH | X-Wah | Frequency | 49 | 49 | Yes |
| WAH | X-Wah | X-Fade | 50 | 50 | Yes |
| WAH | X-Phaser | Rate | 50 | 78 | **No** |
| WAH | X-Phaser | X-Fade | 50 | 50 | Yes |
| WAH | X-Vibe | PHA Rate | 50 | 78 | **No** |
| WAH | X-Vibe | TRM Rate | 50 | 78 | **No** |
| WAH | X-Vibe | X-Fade | 50 | 50 | Yes |
| WAH | Z-Oscillator | Frequency | 60 | 62 | **No** |
| WAH | Z-Oscillator | Portament | 10 | 10 | Yes |
| WAH | Z-Oscillator | Vibrato | 10 | 10 | Yes |
| WAH | Z-Oscillator | Balance | 50 | 50 | Yes |
| EXT | EXT | Send | 100 | 100 | Yes |
| EXT | EXT | Return | 100 | 100 | Yes |
| EXT | EXT | Dry | 100 | 100 | Yes |
| AMP | Fender Clean | Gain | 100 | 100 | Yes |
| AMP | Fender Clean | Level | 99 | 99 | Yes |
| AMP | VOX Clean | Gain | 100 | 100 | Yes |
| AMP | VOX Clean | Level | 99 | 99 | Yes |
| AMP | JC Clean | Gain | 100 | 100 | Yes |
| AMP | JC Clean | Level | 99 | 99 | Yes |
| AMP | HiWatt Clean | Gain | 100 | 100 | Yes |
| AMP | HiWatt Clean | Level | 99 | 99 | Yes |
| AMP | UK Blues | Gain | 100 | 100 | Yes |
| AMP | UK Blues | Level | 99 | 99 | Yes |
| AMP | US Blues | Gain | 100 | 100 | Yes |
| AMP | US Blues | Level | 99 | 99 | Yes |
| AMP | Tweed Bass | Gain | 100 | 100 | Yes |
| AMP | Tweed Bass | Level | 99 | 99 | Yes |
| AMP | BG Crunch | Gain | 100 | 100 | Yes |
| AMP | BG Crunch | Level | 99 | 99 | Yes |
| AMP | VOX Crunch | Gain | 100 | 100 | Yes |
| AMP | VOX Crunch | Level | 99 | 99 | Yes |
| AMP | Z Combo | Gain | 100 | 100 | Yes |
| AMP | Z Combo | Level | 99 | 99 | Yes |
| AMP | MS #1959 | Gain | 100 | 100 | Yes |
| AMP | MS #1959 | Level | 99 | 99 | Yes |
| AMP | MS Crunch | Gain | 100 | 100 | Yes |
| AMP | MS Crunch | Level | 99 | 99 | Yes |
| AMP | MS Drive | Gain | 100 | 100 | Yes |
| AMP | MS Drive | Level | 99 | 99 | Yes |
| AMP | Rect Clean | Gain | 100 | 100 | Yes |
| AMP | Rect Clean | Level | 99 | 99 | Yes |
| AMP | Rect Vintage | Gain | 100 | 100 | Yes |
| AMP | Rect Vintage | Level | 99 | 99 | Yes |
| AMP | Rect Modern | Gain | 100 | 100 | Yes |
| AMP | Rect Modern | Level | 99 | 99 | Yes |
| AMP | HK Clean | Gain | 100 | 100 | Yes |
| AMP | HK Clean | Level | 99 | 99 | Yes |
| AMP | HK Crunch | Gain | 100 | 100 | Yes |
| AMP | HK Crunch | Level | 99 | 99 | Yes |
| AMP | HK Drive | Gain | 100 | 100 | Yes |
| AMP | HK Drive | Level | 99 | 99 | Yes |
| AMP | DZ Clean | Gain | 100 | 100 | Yes |
| AMP | DZ Clean | Level | 99 | 99 | Yes |
| AMP | DZ Crunch | Gain | 100 | 100 | Yes |
| AMP | DZ Crunch | Level | 99 | 99 | Yes |
| AMP | DZ Drive | Gain | 100 | 100 | Yes |
| AMP | DZ Drive | Level | 99 | 99 | Yes |
| AMP | ENGL Drive | Gain | 100 | 100 | Yes |
| AMP | ENGL Drive | Level | 99 | 99 | Yes |
| AMP | PV Drive | Gain | 100 | 100 | Yes |
| AMP | PV Drive | Level | 99 | 99 | Yes |
| AMP | Z Stack | Gain | 100 | 100 | Yes |
| AMP | Z Stack | Level | 99 | 99 | Yes |
| AMP | Over Drive | Gain | 100 | 100 | Yes |
| AMP | Over Drive | Level | 99 | 99 | Yes |
| AMP | TS808 | Gain | 100 | 100 | Yes |
| AMP | TS808 | Level | 99 | 99 | Yes |
| AMP | Centaur | Gain | 100 | 100 | Yes |
| AMP | Centaur | Level | 99 | 99 | Yes |
| AMP | Guv'nor | Gain | 100 | 100 | Yes |
| AMP | Guv'nor | Level | 99 | 99 | Yes |
| AMP | RAT | Gain | 100 | 100 | Yes |
| AMP | RAT | Level | 99 | 99 | Yes |
| AMP | DS-1 | Gain | 100 | 100 | Yes |
| AMP | DS-1 | Level | 99 | 99 | Yes |
| AMP | dist+ | Gain | 100 | 100 | Yes |
| AMP | dist+ | Level | 99 | 99 | Yes |
| AMP | HotBox | Gain | 100 | 100 | Yes |
| AMP | HotBox | Level | 99 | 99 | Yes |
| AMP | FuzzFace | Gain | 100 | 100 | Yes |
| AMP | FuzzFace | Level | 99 | 99 | Yes |
| AMP | BigMuff | Gain | 100 | 100 | Yes |
| AMP | BigMuff | Level | 99 | 99 | Yes |
| AMP | MetalZone | Gain | 100 | 100 | Yes |
| AMP | MetalZone | Level | 99 | 99 | Yes |
| AMP | TS+F_Cmb | Gain | 100 | 100 | Yes |
| AMP | TS+F_Cmb | Level | 99 | 99 | Yes |
| AMP | SD+M_Stk | Gain | 100 | 100 | Yes |
| AMP | SD+M_Stk | Level | 99 | 99 | Yes |
| AMP | FZ+M_Stk | Gain | 100 | 100 | Yes |
| AMP | FZ+M_Stk | Level | 99 | 99 | Yes |
| AMP | Z OD | Gain | 100 | 100 | Yes |
| AMP | Z OD | Level | 99 | 99 | Yes |
| AMP | ExtremeDS | Gain | 100 | 100 | Yes |
| AMP | ExtremeDS | Level | 99 | 99 | Yes |
| AMP | DigiFuzz | Gain | 100 | 100 | Yes |
| AMP | DigiFuzz | Level | 99 | 99 | Yes |
| AMP | Z Clean | Gain | 100 | 100 | Yes |
| AMP | Z Clean | Level | 99 | 99 | Yes |
| AMP | Aco.Sim | Top | 10 | 10 | Yes |
| AMP | Aco.Sim | Level | 99 | 99 | Yes |
| MOD | Chorus | Rate | 49 | 49 | Yes |
| MOD | Chorus | Mix | 50 | 50 | Yes |
| MOD | StereoChorus | Depth | 50 | 50 | Yes |
| MOD | StereoChorus | Rate | 49 | 49 | Yes |
| MOD | StereoChorus | Mix | 50 | 50 | Yes |
| MOD | Ensemble | Mix | 50 | 50 | Yes |
| MOD | ModDelay | FeedBack | 50 | 50 | Yes |
| MOD | ModDelay | Rate | 49 | 49 | Yes |
| MOD | ModDelay | Mix | 50 | 50 | Yes |
| MOD | Flanger | Depth | 50 | 50 | Yes |
| MOD | Flanger | Rate | 50 | 78 | **No** |
| MOD | Flanger | Resonance | 20 | 20 | Yes |
| MOD | Flanger | Manual | 50 | 50 | Yes |
| MOD | PitchShifter | Balance | 50 | 50 | Yes |
| MOD | PedalPitch | PedalPosition | 100 | 100 | Yes |
| MOD | Vibrato | Depth | 50 | 50 | Yes |
| MOD | Vibrato | Rate | 50 | 78 | **No** |
| MOD | Vibrato | Balance | 50 | 50 | Yes |
| MOD | Step | Depth | 50 | 50 | Yes |
| MOD | Step | Rate | 50 | 78 | **No** |
| MOD | Step | Resonance | 10 | 10 | Yes |
| MOD | Step | Shape | 10 | 10 | Yes |
| MOD | Delay | FeedBack | 50 | 50 | Yes |
| MOD | Delay | Mix | 50 | 50 | Yes |
| MOD | TapeEcho | FeedBack | 50 | 50 | Yes |
| MOD | TapeEcho | Mix | 50 | 50 | Yes |
| MOD | DynamicDelay | Amount | 50 | 50 | Yes |
| MOD | DynamicDelay | FeedBack | 50 | 50 | Yes |
| MOD | DynamicDelay | Sense | 19 | 19 | Yes |
| MOD | DynamicFlanger | Depth | 50 | 50 | Yes |
| MOD | DynamicFlanger | Rate | 50 | 78 | **No** |
| MOD | DynamicFlanger | Resonance | 20 | 20 | Yes |
| MOD | DynamicFlanger | Sense | 19 | 19 | Yes |
| MOD | MonoPitch | Balance | 50 | 50 | Yes |
| MOD | HarmonizedPitchShifter | Mix | 50 | 50 | Yes |
| MOD | PedalMonoPitch | PedalPosition | 100 | 100 | Yes |
| MOD | Cry | Range | 9 | 9 | Yes |
| MOD | Cry | Resonance | 10 | 10 | Yes |
| MOD | Cry | Sense | 19 | 19 | Yes |
| MOD | Cry | Balance | 50 | 50 | Yes |
| MOD | ReverseDelay | FeedBack | 50 | 50 | Yes |
| MOD | ReverseDelay | Balance | 50 | 50 | Yes |
| MOD | BendChorus | Depth | 50 | 50 | Yes |
| MOD | BendChorus | Attack | 9 | 9 | Yes |
| MOD | BendChorus | Release | 9 | 9 | Yes |
| MOD | BendChorus | Balance | 50 | 50 | Yes |
| MOD | CombFilter | Frequency | 49 | 49 | Yes |
| MOD | CombFilter | Resonance | 20 | 20 | Yes |
| MOD | CombFilter | Mix | 50 | 50 | Yes |
| MOD | Air | Reflex | 10 | 10 | Yes |
| MOD | Air | Mix | 50 | 50 | Yes |
| MOD | Z-Echo | Time | 99 | 99 | Yes |
| MOD | Z-Echo | FeedBack | 50 | 50 | Yes |
| MOD | Z-Echo | Mix | 50 | 50 | Yes |
| MOD | X-Flanger | Rate | 50 | 78 | **No** |
| MOD | X-Flanger | X-Fade | 50 | 50 | Yes |
| MOD | X-Step | Rate | 50 | 78 | **No** |
| MOD | X-Step | X-Fade | 50 | 50 | Yes |
| MOD | Z-Step | Frequency | 49 | 49 | Yes |
| MOD | Z-Step | Mix | 50 | 50 | Yes |
| MOD | Z-Pitch | PedalPosition V | 100 | 100 | Yes |
| MOD | Z-Pitch | PedalPosition H | 100 | 100 | Yes |
| MOD | Z-MonoPitch | PedalPosition V | 100 | 100 | Yes |
| MOD | Z-MonoPitch | PedalPosition H | 100 | 100 | Yes |
| MOD | Z-Talking | Formant V | 100 | 100 | Yes |
| MOD | Z-Talking | Formant H | 100 | 100 | Yes |
| DLY | Delay | FeedBack | 50 | 50 | Yes |
| DLY | Delay | Mix | 50 | 50 | Yes |
| DLY | PingPongDelay | FeedBack | 50 | 50 | Yes |
| DLY | PingPongDelay | Mix | 50 | 50 | Yes |
| DLY | Echo | FeedBack | 50 | 50 | Yes |
| DLY | Echo | Mix | 50 | 50 | Yes |
| DLY | PingPongEcho | FeedBack | 50 | 50 | Yes |
| DLY | PingPongEcho | Mix | 50 | 50 | Yes |
| DLY | AnalogDelay | FeedBack | 50 | 50 | Yes |
| DLY | AnalogDelay | Mix | 50 | 50 | Yes |
| DLY | ReverseDelay | FeedBack | 50 | 50 | Yes |
| DLY | ReverseDelay | Balance | 50 | 50 | Yes |
| DLY | Air | Reflex | 10 | 10 | Yes |
| DLY | Air | Mix | 50 | 50 | Yes |
| REV | Hall | Decay | 29 | 29 | Yes |
| REV | Hall | Mix | 50 | 50 | Yes |
| REV | Room | Decay | 29 | 29 | Yes |
| REV | Room | Mix | 50 | 50 | Yes |
| REV | Spring | Decay | 29 | 29 | Yes |
| REV | Spring | Mix | 50 | 50 | Yes |
| REV | Arena | Decay | 29 | 29 | Yes |
| REV | Arena | Mix | 50 | 50 | Yes |
| REV | TiledRoom | Decay | 29 | 29 | Yes |
| REV | TiledRoom | Mix | 50 | 50 | Yes |
| REV | ModernSpring | Decay | 29 | 29 | Yes |
| REV | ModernSpring | Mix | 50 | 50 | Yes |
| REV | EarlyReflection | Shape | 20 | 20 | Yes |
| REV | EarlyReflection | Mix | 50 | 50 | Yes |
| REV | MultiTapDelay | Mix | 50 | 50 | Yes |
| REV | PanningDelay | FeedBack | 50 | 50 | Yes |
| REV | PanningDelay | Pan | 50 | 50 | Yes |
| REV | PingPongDelay | FeedBack | 50 | 50 | Yes |
| REV | PingPongDelay | Mix | 50 | 50 | Yes |
| REV | PingPongEcho | FeedBack | 50 | 50 | Yes |
| REV | PingPongEcho | Mix | 50 | 50 | Yes |
| REV | AutoPan | Width | 50 | 50 | Yes |
| REV | AutoPan | Rate | 50 | 78 | **No** |
| REV | AutoPan | Depth | 10 | 10 | Yes |
| REV | AutoPan | Wave | 10 | 10 | Yes |
| REV | Z-Delay | Pan | 50 | 50 | Yes |
| REV | Z-Delay | Mix | 50 | 50 | Yes |
| REV | Z-Dimension | Pan | 50 | 50 | Yes |
| REV | Z-Dimension | Depth | 50 | 50 | Yes |
| REV | Z-Tornado | Rate | 49 | 77 | **No** |
| REV | Z-Tornado | Width | 50 | 50 | Yes |
| REV | Z-Tornado | Mix | 50 | 50 | Yes |
| TTL | BPM | ARRM BPM | 250 | 250 | Yes |

### Parameters with named values (RefTbl)

| Module | Type | Parameter | # Values | Values |
|--------|------|-----------|----------|--------|
| CMP | Compressor | Attack | 2 | Fast, Slow |
| WAH | AutoWah | Sense | 20 | -10, -9, -8... (20 total) |
| WAH | AutoResonance | Sense | 20 | -10, -9, -8... (20 total) |
| WAH | Tremolo | Rate | 28 | 32nd, 16th, quarter tri... (28 total) |
| WAH | Tremolo | Wave | 30 | UP0, UP1, UP2... (30 total) |
| WAH | Phaser | Rate | 28 | 32nd, 16th, quarter tri... (28 total) |
| WAH | X-Phaser | Color | 8 | 1,Before, 2,Before, 3,Before... (8 total) |
| WAH | X-Phaser | Rate | 28 | 32nd, 16th, quarter tri... (28 total) |
| WAH | X-Vibe | PHA Rate | 28 | 32nd, 16th, quarter tri... (28 total) |
| WAH | X-Vibe | TRM Rate | 28 | 32nd, 16th, quarter tri... (28 total) |
| WAH | Z-Oscillator | Frequency | 2 | Auto,Before, Auto,After |
| MOD | ModDelay | Time | 15 | 16th, quarter tri, 16th dot... (15 total) |
| MOD | Flanger | Rate | 28 | 32nd, 16th, quarter tri... (28 total) |
| MOD | PitchShifter | Shift | 26 | -12, -11, -10... (26 total) |
| MOD | PedalPitch | Mode | 2 | Up, Down |
| MOD | Vibrato | Rate | 28 | 32nd, 16th, quarter tri... (28 total) |
| MOD | Step | Rate | 28 | 32nd, 16th, quarter tri... (28 total) |
| MOD | Delay | Time | 15 | 16th, quarter tri, 16th dot... (15 total) |
| MOD | TapeEcho | Time | 15 | 16th, quarter tri, 16th dot... (15 total) |
| MOD | DynamicDelay | Time | 15 | 16th, quarter tri, 16th dot... (15 total) |
| MOD | DynamicDelay | Sense | 20 | -10, -9, -8... (20 total) |
| MOD | DynamicFlanger | Rate | 28 | 32nd, 16th, quarter tri... (28 total) |
| MOD | DynamicFlanger | Sense | 20 | -10, -9, -8... (20 total) |
| MOD | MonoPitch | Shift | 27 | -24, -12, -11... (27 total) |
| MOD | HarmonizedPitchShifter | Scale | 10 | -6, -5, -4... (10 total) |
| MOD | HarmonizedPitchShifter | Key | 12 | C, C#, D... (12 total) |
| MOD | PedalMonoPitch | Mode | 2 | Up, Down |
| MOD | Cry | Sense | 20 | -10, -9, -8... (20 total) |
| MOD | ReverseDelay | Time | 11 | 16th, quarter tri, 16th dot... (11 total) |
| MOD | X-Flanger | Rate | 28 | 32nd, 16th, quarter tri... (28 total) |
| MOD | X-Step | Rate | 28 | 32nd, 16th, quarter tri... (28 total) |
| DLY | Delay | Time | 23 | 16th, quarter tri, 16th dot... (23 total) |
| DLY | PingPongDelay | Time | 23 | 16th, quarter tri, 16th dot... (23 total) |
| DLY | Echo | Time | 23 | 16th, quarter tri, 16th dot... (23 total) |
| DLY | PingPongEcho | Time | 23 | 16th, quarter tri, 16th dot... (23 total) |
| DLY | AnalogDelay | Time | 23 | 16th, quarter tri, 16th dot... (23 total) |
| DLY | ReverseDelay | Time | 15 | 16th, quarter tri, 16th dot... (15 total) |
| REV | MultiTapDelay | Time | 19 | 16th, quarter tri, 16th dot... (19 total) |
| REV | PanningDelay | Time | 19 | 16th, quarter tri, 16th dot... (19 total) |
| REV | PanningDelay | Pan | 51 | L50, L48, L46... (51 total) |
| REV | PingPongDelay | Time | 19 | 16th, quarter tri, 16th dot... (19 total) |
| REV | PingPongEcho | Time | 19 | 16th, quarter tri, 16th dot... (19 total) |
| REV | AutoPan | Width | 51 | L50, L48, L46... (51 total) |
| REV | AutoPan | Rate | 28 | 32nd, 16th, quarter tri... (28 total) |
| REV | Z-Delay | Time | 19 | 16th, quarter tri, 16th dot... (19 total) |
| REV | Z-Delay | Pan | 51 | L50, L48, L46... (51 total) |
| REV | Z-Dimension | Pan | 51 | L50, L48, L46... (51 total) |
| REV | Z-Tornado | Time | 19 | 16th, quarter tri, 16th dot... (19 total) |
| REV | Z-Tornado | Rate | 28 | 32nd, 16th, quarter tri... (28 total) |
| REV | Z-Tornado | Width | 51 | L50, L48, L46... (51 total) |
