# zoomg9 - Zoom G9.2tt Python Library

A Python library for communicating with the Zoom G9.2tt Twin Tube Guitar Effects Console via MIDI SysEx.

## Estado Actual (2026-01-26)

### ✅ Funciona

- **Lectura de patches**: Leer cualquier patch individual o todos los 100
- **Escritura de patches**: Escribir patches modificados al pedal (checksum CRC-32 descifrado)
- **Control en tiempo real**: Cambiar parámetros del patch activo (comando 0x31)
- **Selección de patch**: Cambiar el patch activo (Program Change)
- **Identificación**: Consultar info del dispositivo
- **Bulk operations**: Leer y escribir todos los patches

### Checksum Resuelto

El algoritmo de checksum de 5 bytes fue descifrado el 2026-01-26 mediante ingeniería inversa de G9ED.exe:
- **Algoritmo**: CRC-32 estándar (polinomio 0xEDB88320, init 0xFFFFFFFF)
- **Datos**: Se calcula sobre los 128 bytes decodificados del patch
- **Codificación**: El CRC de 32 bits se codifica en 5 bytes de 7 bits cada uno

Ver [CHECKSUM.md](CHECKSUM.md) para detalles técnicos.

## Installation

```bash
pip install -e .
```

## Quick Start

```python
from zoomg9 import G9Device

with G9Device() as device:
    # Leer un patch
    patch = device.read_patch(0)
    print(patch.name)           # "G9 Drive"
    print(patch.amp.type_name)  # "PV Drive"
    print(patch.amp.gain)       # 69

    # Cambiar patch activo
    device.select_patch(10)

    # Control en tiempo real (esto SÍ funciona)
    device.set_parameter("amp", "gain", 80)
    device.set_parameter("delay", "mix", 30)
```

## API Reference

### G9Device

```python
from zoomg9 import G9Device

device = G9Device()
device.connect()

# Lectura
device.identity()                    # Info del dispositivo
patch = device.read_patch(0)         # Leer un patch
patches = device.read_all()          # Leer todos los patches

# Escritura (requiere BULK RX mode en el pedal)
device.write_patch(0, patch)         # Escribir un patch
device.write_all(patches)            # Escribir todos los patches

# Control en tiempo real
device.select_patch(10)              # Cambiar patch activo
device.set_parameter("amp", "gain", 80)  # Modificar parámetro

device.disconnect()
```

### Patch

```python
from zoomg9 import Patch

# Leer desde el dispositivo
patch = device.read_patch(0)

# Propiedades globales
patch.name       # "G9 Drive"
patch.level      # 0-100
patch.tempo      # 40-250 BPM
patch.amp_sel    # 0=A, 1=B

# Módulos de efectos
patch.amp_a      # AmpModule canal A
patch.amp_b      # AmpModule canal B
patch.amp        # Amp seleccionado actual
patch.comp       # CmpModule
patch.wah        # WahModule
patch.ext        # ExtModule
patch.znr_a      # ZnrModule canal A
patch.znr_b      # ZnrModule canal B
patch.eq_a       # EqModule canal A
patch.eq_b       # EqModule canal B
patch.cab        # CabModule
patch.mod        # ModModule
patch.delay      # DlyModule
patch.reverb     # RevModule

# Serialización
data = patch.to_bytes()           # 128 bytes
patch = Patch.from_bytes(data)    # Deserializar
```

### Control en Tiempo Real

El comando `set_parameter` modifica el patch activo inmediatamente:

```python
# Efectos disponibles
device.set_parameter("amp", "gain", 80)      # 0-100
device.set_parameter("amp", "tone", 15)      # 0-30
device.set_parameter("amp", "level", 70)     # 0-99
device.set_parameter("amp", "type", 10)      # 0-43

device.set_parameter("delay", "time", 500)   # 0-5022 ms
device.set_parameter("delay", "feedback", 30) # 0-50
device.set_parameter("delay", "mix", 25)     # 0-50

device.set_parameter("reverb", "decay", 15)  # 0-29
device.set_parameter("reverb", "mix", 25)    # 0-50

device.set_parameter("comp", "sense", 30)    # 0-50
device.set_parameter("mod", "depth", 50)     # 0-127
```

## Examples

### Leer y mostrar un patch

```python
from zoomg9 import G9Device

with G9Device() as device:
    patch = device.read_patch(0)
    print(patch.summary())
```

### Backup de todos los patches

```python
from zoomg9 import G9Device
import json

with G9Device() as device:
    patches = device.read_all()

    backup = []
    for i, p in enumerate(patches):
        backup.append({
            "number": i,
            "name": p.name,
            "data": p.to_bytes().hex()
        })

    with open("backup.json", "w") as f:
        json.dump(backup, f, indent=2)
```

### Sweep de ganancia en tiempo real

```python
from zoomg9 import G9Device
import time

with G9Device() as device:
    for gain in range(0, 101, 5):
        device.set_parameter("amp", "gain", gain)
        time.sleep(0.1)
```

### Bulk Round-Trip (sin modificaciones)

```bash
# Usar el script de ejemplo
python examples/bulk_roundtrip.py
```

## Effect Types

### Amplifiers (44 types)
Fender Clean, VOX Clean, JC Clean, HiWatt Clean, UK Blues, US Blues, Tweed Bass, BG Crunch, VOX Crunch, Z Combo, MS #1959, MS Crunch, MS Drive, Rect Clean/Vintage/Modern, HK Clean/Crunch/Drive, DZ Clean/Crunch/Drive, ENGL Drive, PV Drive, Z Stack, OD-1, TS808, Centaur, RAT, DS-1, GuvPlus, Fuzz Face, Hot Box, Metal Zone, Sansamp, Z Metal, Combo 1-6, Z Clean, Aco.Sim

### Modulation (28 types)
Chorus, StereoChorus, Ensemble, ModDelay, Flanger, PitchShifter, PedalPitch, Vibrato, Step, Delay, TapeEcho, DynamicDelay, DynamicFlanger, MonoPitch, HarmonizedPitchShifter, PedalMonoPitch, Cry, ReverseDelay, BendChorus, CombFilter, Air, Z-Echo, X-Flanger, X-Step, Z-Step, Z-Pitch, Z-MonoPitch, Z-Talking

### Delay (7 types)
Delay, PingPongDelay, Echo, PingPongEcho, AnalogDelay, ReverseDelay, Air

### Reverb (15 types)
Hall, Room, Spring, Arena, TiledRoom, ModernSpring, EarlyReflection, MultiTapDelay, PanningDelay, PingPongDelay, PingPongEcho, AutoPan, Z-Delay, Z-Dimension, Z-Tornado

## Requirements

- Python 3.8+
- mido >= 1.2.0
- python-rtmidi >= 1.5.0
- macOS: Driver Roland UM-ONE para Apple Silicon

## License

MIT License
