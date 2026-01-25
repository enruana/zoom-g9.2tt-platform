# Mapeo Completo de Parámetros - Zoom G9.2tt

Documento generado contrastando:
- Capturas MIDI en tiempo real (2026-01-25)
- G9ED.efx.xml (definición de efectos)
- g9tt_decoder.py (estructura del patch)

## Formato del Comando 0x31 (Parameter Change)

```
F0 52 00 42 31 [EFFECT_ID] [PARAM_ID] [VALUE] 00 F7
```

## Effect IDs

| ID | Módulo | Descripción |
|----|--------|-------------|
| 0x00 | TOP | Control de volumen global |
| 0x01 | CMP | Compresor/Limiter |
| 0x02 | WAH | Wah/EFX1 (Wah, Phaser, Filtros) |
| 0x03 | EXT | External Loop (Send/Return) |
| 0x04 | ZNR | Zoom Noise Reduction |
| 0x05 | AMP | Amplificador/Distorsión |
| 0x06 | EQ | Ecualizador 6 bandas |
| 0x07 | CAB | Simulador de cabina |
| 0x08 | MOD | Modulación/EFX2 |
| 0x09 | DLY | Delay |
| 0x0A | REV | Reverb |
| 0x0B | SYNC | Sistema (heartbeat) |

---

## 0x00 - TOP (Global)

| Param ID | Nombre | Min | Max | Notas |
|----------|--------|-----|-----|-------|
| 0x05 | Level | 0 | 100 | Volumen del patch |

**Captura MIDI:** Level en 0x05 (rango capturado: 4-49)
**XML:** Solo define Level, pero MIDI usa offset 0x05.
Posibles parámetros ocultos en 0x02-0x04 (BPM, tempo, etc.)

---

## 0x01 - CMP (Compressor)

3 tipos disponibles: Compressor, RackComp, Limiter

| Param ID | Compressor | RackComp | Limiter | Min | Max |
|----------|------------|----------|---------|-----|-----|
| 0x00 | On/Off | On/Off | On/Off | 0 | 1 |
| 0x01 | Type | Type | Type | 0 | 2 |
| 0x02 | Sense | Threshold | Threshold | 0 | 50 |
| 0x03 | Attack | Ratio | Ratio | 0 | 9 |
| 0x04 | Tone | Attack | Release | 0 | 10 |
| 0x05 | Level | Level | Level | 0 | 49 |

**XML confirmado**

---

## 0x02 - WAH/EFX1

17 tipos disponibles. Parámetros varían según tipo.

| Param ID | AutoWah | Booster | Phaser | Tremolo | Min | Max |
|----------|---------|---------|--------|---------|-----|-----|
| 0x00 | On/Off | On/Off | On/Off | On/Off | 0 | 1 |
| 0x01 | Type | Type | Type | Type | 0 | 16 |
| 0x02 | Position | Range | Rate | Rate | 0 | varies |
| 0x03 | Sense | Tone | Depth | Depth | 0 | varies |
| 0x04 | Resonance | Gain | Resonance | Level | 0 | varies |
| 0x05 | Level | Level | Level | Tone | 0 | 49 |

**Tipos:** AutoWah, AutoResonance, Booster, Tremolo, Phaser, FixedPhaser, RingModulator, SlowAttack, PedalVox, PedalCryBaby, MultiWah, PedalResonanceFilter, Octave, X-Wah, X-Phaser, X-Vibe, Z-Oscillator

---

## 0x03 - EXT (External Loop)

| Param ID | Nombre | Min | Max | Notas |
|----------|--------|-----|-----|-------|
| 0x00 | On/Off | 0 | 1 | |
| 0x02 | Send | 0 | 100 | Nivel de envío |
| 0x03 | Return | 0 | 100 | Nivel de retorno |
| 0x04 | Dry | 0 | 100 | Nivel de señal seca |

**XML:** EXT (max Send/Return/Dry = 100, init = 80/80/0)

---

## 0x04 - ZNR (Noise Reduction)

3 tipos: ZNR, NoiseGate, DirtyGate

| Param ID | Nombre | Min | Max | Notas |
|----------|--------|-----|-----|-------|
| 0x00 | On/Off | 0 | 1 | |
| 0x01 | Type | 0 | 2 | ZNR/NoiseGate/DirtyGate |
| 0x02 | Threshold | 0 | 15 | Umbral de activación |

**XML confirmado:** max=15, init=9

---

## 0x05 - AMP

44 tipos de amplificador/distorsión.

| Param ID | Nombre | Min | Max | Notas |
|----------|--------|-----|-----|-------|
| 0x00 | On/Off | 0 | 1 | |
| 0x01 | Type | 0 | 43 | Ver catálogo de AMPs |
| 0x02 | Gain | 0 | 100 | |
| 0x03 | Tone | 0 | 30 | EQ simple |
| 0x04 | Level | 0 | 99 | Volumen de salida |

**XML confirmado:** Gain max=100, Tone max=30, Level max=99

---

## 0x06 - EQ (Ecualizador 6 Bandas)

| Param ID | Nombre | Min | Max | Bits | Notas |
|----------|--------|-----|-----|------|-------|
| 0x00 | On/Off | 0 | 1 | 1 | |
| 0x02 | Band 1 (Low) | 0 | 31 | 5 | ~100Hz |
| 0x03 | Band 2 | 0 | 31 | 5 | ~200Hz |
| 0x04 | Band 3 (Mid) | 0 | 31 | 5 | ~400Hz |
| 0x05 | Band 4 | 0 | 31 | 5 | ~800Hz |
| 0x06 | Band 5 | 0 | 31 | 5 | ~1.6kHz |
| 0x07 | Band 6 (High) | 0 | 31 | 5 | ~3.2kHz |

**Nota:** EQ no tiene tipos en XML, definido en decoder como 6 params de 5 bits.
Valor 16 = flat (0dB), <16 = cut, >16 = boost.

---

## 0x07 - CAB (Cabinet Simulator)

| Param ID | Nombre | Min | Max | Bits | Valores |
|----------|--------|-----|-----|------|---------|
| 0x00 | On/Off | 0 | 1 | 1 | |
| 0x02 | Depth | 0 | 1 | 1 | 0=Small, 1=Middle |
| 0x03 | Mic Type | 0 | 3 | 2 | 0=Dynamic, 1=Condenser, 2=? |
| 0x04 | Mic Position | 0 | 3 | 2 | Posición del micrófono |

**Nota:** CAB no tiene tipos en XML, definido en decoder.

---

## 0x08 - MOD (Modulation/EFX2)

28 tipos disponibles.

| Param ID | Chorus | Flanger | PitchShifter | Delay | Min | Max |
|----------|--------|---------|--------------|-------|-----|-----|
| 0x00 | On/Off | On/Off | On/Off | On/Off | 0 | 1 |
| 0x01 | Type | Type | Type | Type | 0 | 27 |
| 0x02 | Depth | Depth | Shift | Time | 0 | varies |
| 0x03 | Rate | Rate | Fine | FeedBack | 0 | varies |
| 0x04 | Tone | Resonance | Tone | HiDamp | 0 | varies |
| 0x05 | Mix | Mix | Balance | Mix | 0 | 50 |

**Tipos:** Chorus, StereoChorus, Ensemble, ModDelay, Flanger, PitchShifter, PedalPitch, Vibrato, Step, Delay, TapeEcho, DynamicDelay, DynamicFlanger, MonoPitch, HarmonizedPitchShifter, PedalMonoPitch, Cry, ReverseDelay, BendChorus, CombFilter, Air, Z-Echo, X-Flanger, X-Step, Z-Step, Z-Pitch, Z-MonoPitch, Z-Talking

---

## 0x09 - DLY (Delay)

7 tipos disponibles.

| Param ID | Nombre | Min | Max | Notas |
|----------|--------|-----|-----|-------|
| 0x00 | On/Off | 0 | 1 | |
| 0x01 | Type | 0 | 6 | Ver tipos |
| 0x02 | Time | 0 | 5022 | En ms (13 bits) |
| 0x03 | FeedBack | 0 | 50 | Repeticiones |
| 0x04 | HiDamp | 0 | 10 | Atenuación de agudos |
| 0x05 | Mix | 0 | 50 | Nivel de efecto |

**Tipos:** Delay, PingPongDelay, Echo, PingPongEcho, AnalogDelay, ReverseDelay, Air

**XML confirmado:** Time max=5022

---

## 0x0A - REV (Reverb)

15 tipos disponibles.

| Param ID | Nombre | Min | Max | Notas |
|----------|--------|-----|-----|-------|
| 0x00 | On/Off | 0 | 1 | |
| 0x01 | Type | 0 | 14 | Ver tipos |
| 0x02 | Decay | 0 | 29 | Tiempo de reverb |
| 0x03 | PreDelay | 0 | 99 | Pre-delay en ms |
| 0x04 | Tone | 0 | 10 | Color del reverb |
| 0x05 | Mix | 0 | 50 | Nivel de efecto |

**Tipos:** Hall, Room, Spring, Arena, TiledRoom, ModernSpring, EarlyReflection, MultiTapDelay, PanningDelay, PingPongDelay, PingPongEcho, AutoPan, Z-Delay, Z-Dimension, Z-Tornado

**XML confirmado:** Decay max=29, PreDelay max=99

---

## 0x0B - SYNC (Sistema)

Mensajes de sincronización/heartbeat del sistema.

| Param ID | Nombre | Valores típicos | Notas |
|----------|--------|-----------------|-------|
| 0x00 | Status | 77-80 | Heartbeat periódico |
| 0x01 | Type | 2 | Tipo de sync |
| 0x02 | Param | 12 | Parámetro adicional |

**Nota:** Estos mensajes se envían automáticamente, no corresponden a controles de usuario.

---

## Notas Adicionales

### Parámetro Type (0x01)
- Siempre presente en módulos con múltiples tipos
- Cambiar el Type cambia qué parámetros están activos
- Los nombres de parámetros varían según el Type

### Módulos sin Type
- EXT: Solo un tipo
- EQ: No tiene tipos (6 bandas fijas)
- CAB: No tiene tipos (3 parámetros fijos)

### Codificación de Valores
- La mayoría de valores se envían directamente (0-127)
- Time de Delay usa 2 bytes (valor > 127)
- El byte extra (00) antes de F7 parece ser padding

### Correspondencia con Patch
Los parámetros MIDI corresponden al mismo orden en la estructura del patch, permitiendo lectura/escritura coherente.
