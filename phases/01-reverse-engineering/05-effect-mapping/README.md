# Paso 05: Mapeo de Efectos

## Objetivo

Mapear todos los IDs de efectos y parámetros del protocolo MIDI con sus nombres legibles.

## Fuente de Datos

El archivo `G9ED.efx.xml` (extraído de G9ED.exe) contiene la definición completa de todos los efectos.

## Módulos del G9.2tt

| Módulo | # Tipos | Descripción |
|--------|---------|-------------|
| TOP | 1 | Control de volumen general |
| CMP | 3 | Compresores y limitadores |
| WAH | 17 | Wah, phaser, filtros, octavador |
| EXT | 1 | Send/Return externo |
| ZNR | 3 | Noise reduction |
| AMP | 44 | Modelos de amplificador y pedales |
| EQ | - | Ecualizador paramétrico |
| CAB | - | Simulador de cabina |
| MOD | 28 | Modulación (chorus, flanger, pitch) |
| DLY | 7 | Delays |
| REV | 15 | Reverbs |
| TTL | 1 | BPM/Tempo |

## Effect IDs (Comando 0x31)

Mapeo completo descubierto mediante captura MIDI (2026-01-25):

| Effect ID | Módulo | Estado |
|-----------|--------|--------|
| 0x00 | TOP/Global | ✅ Confirmado |
| 0x01 | CMP | ✅ Confirmado |
| 0x02 | WAH | ✅ Confirmado |
| 0x03 | EXT | ✅ Confirmado |
| 0x04 | ZNR | ✅ Confirmado |
| 0x05 | AMP | ✅ Confirmado |
| 0x06 | EQ | ✅ Confirmado |
| 0x07 | CAB | ✅ Confirmado |
| 0x08 | MOD | ✅ Confirmado |
| 0x09 | DLY | ✅ Confirmado |
| 0x0A | REV | ✅ Confirmado |
| 0x0B | SYNC | Especial (heartbeat) |

**Nota:** El Effect ID coincide con el índice de fila en BIT_TBL del decoder.

## Parameter IDs por Módulo (Comando 0x31)

Mapeo completo de parámetros capturados mediante MIDI (2026-01-25):

### 0x00 - TOP (Global)

| Param ID | Nombre | Rango Capturado |
|----------|--------|-----------------|
| 0x05 | Level | 4-49 |

### 0x01 - CMP (Compressor)

| Param ID | Nombre | Rango Capturado | Notas |
|----------|--------|-----------------|-------|
| 0x00 | On/Off | 0 | 0=Off, 1=On |
| 0x02 | Threshold/Sense | 7-10 | Depende del tipo |
| 0x03 | Ratio/Attack | 0-1 | Depende del tipo |
| 0x04 | Attack | 6-10 | |
| 0x05 | Level | 40-41 | |

### 0x02 - WAH

| Param ID | Nombre | Rango Capturado | Notas |
|----------|--------|-----------------|-------|
| 0x00 | On/Off | 0 | 0=Off, 1=On |
| 0x02 | Color/Sense | 0-21 | Depende del tipo |
| 0x03 | DryLevel/Resonance | 6-40 | Depende del tipo |
| 0x04 | Color/Level | 9-26 | Depende del tipo |
| 0x05 | Balance/Level | 40-41 | |

### 0x03 - EXT (External Loop)

| Param ID | Nombre | Rango Capturado |
|----------|--------|-----------------|
| 0x02 | Send | 82-83 |
| 0x03 | Return | 81 |
| 0x04 | Dry | 1 |

### 0x04 - ZNR (Noise Reduction)

| Param ID | Nombre | Rango Capturado |
|----------|--------|-----------------|
| 0x02 | Threshold | 10-11 |

### 0x05 - AMP

| Param ID | Nombre | Rango Capturado | Notas |
|----------|--------|-----------------|-------|
| 0x00 | On/Off | 0 | 0=Off, 1=On |
| 0x02 | Gain | 71 | |
| 0x03 | Body/Tone | 11 | Depende del tipo |
| 0x04 | Level | 90 | |

### 0x06 - EQ (Equalizer)

| Param ID | Nombre | Rango Capturado | Notas |
|----------|--------|-----------------|-------|
| 0x02 | Band 1 (Low) | 12 | |
| 0x03 | Band 2 | 18-19 | |
| 0x04 | Band 3 (Mid) | 11-12 | |
| 0x05 | Band 4 | 16-17 | |
| 0x06 | Band 5 | 0-4 | |
| 0x07 | Band 6 (High) | 14-16 | |

### 0x07 - CAB (Cabinet)

| Param ID | Nombre | Rango Capturado | Notas |
|----------|--------|-----------------|-------|
| 0x00 | On/Off | 0 | 0=Off, 1=On |
| 0x02 | Depth | 1 | Small/Middle |
| 0x03 | Mic Type | 0-2 | Dynamic/Condenser |
| 0x04 | Mic Position | 2 | |

### 0x08 - MOD (Modulation)

| Param ID | Nombre | Rango Capturado | Notas |
|----------|--------|-----------------|-------|
| 0x00 | On/Off | 0 | 0=Off, 1=On |
| 0x02 | Color/Rate | 7 | Depende del tipo |
| 0x03 | Attack/Depth | 8 | Depende del tipo |
| 0x04 | X-Fade/Tone | 1-15 | Depende del tipo |
| 0x05 | Mix | 1 | |

### 0x09 - DLY (Delay)

| Param ID | Nombre | Rango Capturado | Notas |
|----------|--------|-----------------|-------|
| 0x00 | On/Off | 0 | 0=Off, 1=On |
| 0x02 | Time/Size | 103-104 | Depende del tipo |
| 0x03 | FeedBack/Reflex | 11-12 | Depende del tipo |
| 0x04 | HiDamp | 9 | |
| 0x05 | Mix | 21 | |

### 0x0A - REV (Reverb)

| Param ID | Nombre | Rango Capturado | Notas |
|----------|--------|-----------------|-------|
| 0x00 | On/Off | 0 | 0=Off, 1=On |
| 0x02 | Decay/Width | 15 | Depende del tipo |
| 0x03 | PreDelay | 90 | |
| 0x04 | Tone/Width | 9 | Depende del tipo |
| 0x05 | Mix | 31 | |

### 0x0B - SYNC (Sistema)

| Param ID | Nombre | Rango Capturado | Notas |
|----------|--------|-----------------|-------|
| 0x00 | Status | 77-80 | Heartbeat/sync |
| 0x01 | Type | 2 | |
| 0x02 | Param | 12 | |

## Estructura General de Parámetros

```
Param 0x00 = On/Off (cuando aplica)
Param 0x01 = Type (selector de tipo de efecto)
Param 0x02+ = Parámetros específicos del efecto
```

**Nota:** Los nombres de parámetros varían según el tipo de efecto seleccionado dentro de cada módulo.

## Catálogo de Efectos

### AMP (44 modelos)

| Type | Nombre | Modelo Real |
|------|--------|-------------|
| 0 | Fender Clean | Fender Twin Reverb '65 |
| 1 | VOX Clean | VOX AC30TBX (Clean) |
| 2 | JC Clean | Roland JAZZ CHORUS |
| 3 | HiWatt Clean | HIWATT Custom100 |
| 4 | UK Blues | Marshall 1962 Bluesbreaker |
| 5 | US Blues | Fender Tweed Deluxe '53 |
| 6 | Tweed Bass | Fender BASSMAN |
| 7 | BG Crunch | MESA/BOOGIE Mark III |
| 8 | VOX Crunch | VOX AC30TBX (Crunch) |
| 9 | Z Combo | Z Combo (original) |
| 10 | MS #1959 | Marshall 1959 |
| 11 | MS Crunch | Marshall JCM800 |
| 12 | MS Drive | Marshall JCM2000 |
| 13 | Rect Clean | MESA Dual Rectifier (Orange) |
| 14 | Rect Vintage | MESA Dual Rectifier (Vintage) |
| 15 | Rect Modern | MESA Dual Rectifier (Modern) |
| 16 | HK Clean | Hughes & Kettner TriAmp (AMP1) |
| 17 | HK Crunch | Hughes & Kettner TriAmp (AMP2) |
| 18 | HK Drive | Hughes & Kettner TriAmp (AMP3) |
| 19 | DZ Clean | Diezel Herbert (ch1) |
| 20 | DZ Crunch | Diezel Herbert (ch2) |
| 21 | DZ Drive | Diezel Herbert (ch3) |
| 22 | ENGL Drive | ENGL Ritchie Blackmore |
| 23 | PV Drive | PEAVEY 5150 STACK |
| 24 | Z Stack | Z Stack (original) |
| 25 | Over Drive | BOSS OD-1 |
| 26 | TS808 | Ibanez TS808 |
| 27 | Centaur | KLON CENTAUR |
| 28 | Guv'nor | Marshall Guv'nor |
| 29 | RAT | PROCO RAT |
| 30 | DS-1 | BOSS DS-1 |
| 31 | dist+ | MXR Distortion+ |
| 32 | HotBox | MATCHLESS HOT BOX |
| 33 | FuzzFace | Dallas-Arbiter FUZZ FACE |
| 34 | BigMuff | Electro-Harmonix BIG MUFF |
| 35 | MetalZone | BOSS MT-2 |
| 36 | TS+F_Cmb | Fender Combo + TS9 |
| 37 | SD+M_Stk | Marshall Stack + SD-1 |
| 38 | FZ+M_Stk | Marshall Stack + FUZZ FACE |
| 39 | Z OD | Z OD (original) |
| 40 | ExtremeDS | Extreme DS (original) |
| 41 | DigiFuzz | DigiFuzz (original) |
| 42 | Z Clean | Z Clean (original) |
| 43 | Aco.Sim | Acoustic Simulator |

### CMP (3 tipos)

| Type | Nombre | Parámetros |
|------|--------|------------|
| 0 | Compressor | Sense, Attack, Tone, Level |
| 1 | RackComp | Threshold, Ratio, Attack, Level |
| 2 | Limiter | Threshold, Ratio, Release, Level |

### WAH (17 tipos)

| Type | Nombre |
|------|--------|
| 0 | AutoWah |
| 1 | AutoResonance |
| 2 | Booster |
| 3 | Tremolo |
| 4 | Phaser |
| 5 | FixedPhaser |
| 6 | RingModulator |
| 7 | SlowAttack |
| 8 | PedalVox |
| 9 | PedalCryBaby |
| 10 | MultiWah |
| 11 | PedalResonanceFilter |
| 12 | Octave |
| 13 | X-Wah |
| 14 | X-Phaser |
| 15 | X-Vibe |
| 16 | Z-Oscillator |

### MOD (28 tipos)

| Type | Nombre |
|------|--------|
| 0 | Chorus |
| 1 | StereoChorus |
| 2 | Ensemble |
| 3 | ModDelay |
| 4 | Flanger |
| 5 | PitchShifter |
| 6 | PedalPitch |
| 7 | Vibrato |
| 8 | Step |
| 9 | Delay |
| 10 | TapeEcho |
| 11 | DynamicDelay |
| 12 | DynamicFlanger |
| 13 | MonoPitch |
| 14 | HarmonizedPitchShifter |
| 15 | PedalMonoPitch |
| 16 | Cry |
| 17 | ReverseDelay |
| 18 | BendChorus |
| 19 | CombFilter |
| 20 | Air |
| 21 | Z-Echo |
| 22 | X-Flanger |
| 23 | X-Step |
| 24 | Z-Step |
| 25 | Z-Pitch |
| 26 | Z-MonoPitch |
| 27 | Z-Talking |

### DLY (7 tipos)

| Type | Nombre |
|------|--------|
| 0 | Delay |
| 1 | PingPongDelay |
| 2 | Echo |
| 3 | PingPongEcho |
| 4 | AnalogDelay |
| 5 | ReverseDelay |
| 6 | Air |

### REV (15 tipos)

| Type | Nombre |
|------|--------|
| 0 | Hall |
| 1 | Room |
| 2 | Spring |
| 3 | Arena |
| 4 | TiledRoom |
| 5 | ModernSpring |
| 6 | EarlyReflection |
| 7 | MultiTapDelay |
| 8 | PanningDelay |
| 9 | PingPongDelay |
| 10 | PingPongEcho |
| 11 | AutoPan |
| 12 | Z-Delay |
| 13 | Z-Dimension |
| 14 | Z-Tornado |

## Archivos de Referencia

- [PARAMETER_MAP.md](PARAMETER_MAP.md) - **Mapeo completo contrastado con XML**
- [G9ED.efx.xml](G9ED.efx.xml) - Definición XML completa de efectos
- [effect_ids_capture.log](effect_ids_capture.log) - Captura MIDI de Effect IDs
- [param_capture.log](param_capture.log) - Captura MIDI de Parameter IDs
- [modules/amp.md](modules/amp.md) - Detalles de amplificadores
- [modules/mod.md](modules/mod.md) - Detalles de modulación

## Trabajo Pendiente

- [x] Completar mapeo de Effect IDs MIDI (2026-01-25)
- [x] Mapear Parameter IDs completos para cada módulo (2026-01-25)
- [x] Identificar parámetros del EQ y CAB (2026-01-25)
- [x] Documentar rangos completos de valores - ver [PARAMETER_MAP.md](PARAMETER_MAP.md)
- [x] Contrastar capturas MIDI con XML (2026-01-25)
- [ ] Verificar correspondencia con bytes del patch (siguiente fase)

## Siguiente Paso

[06 - Especificación Final](../06-protocol-specification/)
