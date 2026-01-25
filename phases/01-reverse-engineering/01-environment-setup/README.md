# Paso 01: Preparación del Entorno

## Objetivo

Configurar todo el hardware y software necesario para la ingeniería inversa del protocolo MIDI.

## Hardware Requerido

### 1. Zoom G9.2tt
- Pedal multiefectos objetivo
- Firmware original (no modificado)

### 2. Interfaz MIDI USB
**Recomendado:** Roland UM-ONE MK2
- Soporta mensajes SysEx largos
- Class-compliant (sin drivers especiales)
- Probado y funcionando

**Alternativas:**
- M-Audio MIDISport UNO
- iConnectivity mio

**Evitar:** Cables genéricos baratos (<$15) que no soportan SysEx.

### 3. Raspberry Pi (Opcional pero recomendado)
- Raspberry Pi 4 o 5 (ARM64)
- Para ejecutar G9ED via Wine/box86
- Permite captura MIDI man-in-the-middle

### 4. Cables
- Cable MIDI DIN 5 pines (x2 para entrada y salida)
- Cable USB para interfaz MIDI

## Conexión Física

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Computador    │     │   UM-ONE         │     │   Zoom G9.2tt   │
│                 │     │   (MIDI-USB)     │     │                 │
│   USB ──────────┼─────┼─► USB            │     │                 │
│                 │     │                  │     │                 │
│                 │     │   MIDI OUT ──────┼─────┼─► MIDI IN       │
│                 │     │   MIDI IN  ◄─────┼─────┼── MIDI OUT      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Software Requerido

### En Mac (Host principal)

```bash
# XQuartz para X11 forwarding
brew install --cask xquartz

# Python y dependencias MIDI
pip install mido python-rtmidi
```

### En Raspberry Pi

```bash
# Dependencias ARM
sudo dpkg --add-architecture armhf
sudo apt update
sudo apt install -y \
    libc6:armhf \
    libx11-6:armhf \
    libfreetype6:armhf \
    libxext6:armhf \
    libxrender1:armhf

# box86 (emulador x86)
# Ver: https://github.com/ptitSeb/box86

# VirMIDI para captura
sudo modprobe snd-virmidi
```

## Verificación

### Verificar conexión MIDI

```bash
# Linux/Raspberry Pi
amidi -l
# Debería mostrar: hw:2,0,0  UM-ONE MIDI 1

# Mac
# Abrir Audio MIDI Setup > Ventana > Mostrar dispositivos MIDI
```

### Verificar comunicación con pedal

```bash
# Enviar Identity Request
python tools/identity_request.py

# Respuesta esperada:
# F0 7E 00 06 02 52 42 00 ... F7
#                 ^^ ^^
#                 |  └── Model ID (G9.2tt)
#                 └───── Manufacturer ID (Zoom)
```

## Troubleshooting

### "No MIDI devices found"
- Verificar que UM-ONE está conectado
- En Linux: `sudo modprobe snd-usb-audio`
- Verificar permisos: `sudo usermod -aG audio $USER`

### "SysEx truncated" o respuestas incompletas
- Interfaz MIDI no soporta SysEx largos
- Usar Roland UM-ONE u otra interfaz de calidad

### Pedal no responde
- Verificar que pedal está encendido
- Verificar conexión MIDI IN/OUT (cables cruzados)
- Probar con G9ED original primero

## Siguiente Paso

[02 - Acceso Remoto a G9ED](../02-g9ed-remote-access/)
