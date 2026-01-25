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

Mapeo descubierto mediante captura MIDI:

| Effect ID | Módulo | Parámetros |
|-----------|--------|------------|
| 0x05 | AMP | 02=Gain, 03=Tone, 04=Level |
| ... | ... | (por descubrir) |

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

- [G9ED.efx.xml](G9ED.efx.xml) - Definición XML completa
- [modules/amp.md](modules/amp.md) - Detalles de amplificadores
- [modules/mod.md](modules/mod.md) - Detalles de modulación

## Trabajo Pendiente

- [ ] Completar mapeo de Effect IDs MIDI
- [ ] Documentar rangos de valores para cada parámetro
- [ ] Verificar correspondencia con bytes del patch
- [ ] Identificar parámetros del EQ y CAB

## Siguiente Paso

[06 - Especificación Final](../06-protocol-specification/)
