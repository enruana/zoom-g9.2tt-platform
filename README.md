# Zoom G9.2tt Platform

Modern web-based editor for the Zoom G9.2tt guitar multi-effects pedal, built on complete reverse engineering of the MIDI SysEx protocol.

**Plataforma de edición web moderna para el pedal multiefectos Zoom G9.2tt, basada en ingeniería inversa completa del protocolo MIDI SysEx.**

<p align="center">
  <a href="https://g9.enruana.com"><strong>🎸 Try it live at g9.enruana.com</strong></a>
</p>

---

## Overview

The original G9ED software (Windows XP, .NET 2.0) is obsolete and incompatible with modern systems. This project provides:

- **Complete MIDI Protocol Documentation** - Every SysEx command reverse-engineered
- **Python Library** - Full device control for automation and scripting
- **Modern Web Editor** - Browser-based editor with real-time control
- **Cloud Sync** - Firebase-powered patch backup and sync
- **Collaborative Sessions** - Remote control from phone/tablet

## Screenshots

<p align="center">
  <img src="zoom-g9.2tt-web/public/splash.png" alt="Splash Screen" width="280"/>
  <img src="zoom-g9.2tt-web/public/demo.png" alt="Editor Demo Mode" width="280"/>
  <img src="zoom-g9.2tt-web/public/mobile.png" alt="Mobile Interface" width="180"/>
</p>

<p align="center">
  <img src="zoom-g9.2tt-web/public/session.png" alt="Collaborative Session" width="600"/>
</p>

---

## Project Status

| Phase | Status | Description |
|-------|--------|-------------|
| [01 - Reverse Engineering](phases/01-reverse-engineering/) | ✅ Complete | Full MIDI SysEx protocol documented |
| [02 - Python Library](phases/02-python-library/) | ✅ Complete | Working API for read/write/real-time control |
| [03 - Web Editor](zoom-g9.2tt-web/) | ✅ Complete | Full-featured web interface with cloud sync |
| 04 - Deployment | 🔄 In Progress | Firebase hosting and distribution |

## Quick Links

| Resource | Description |
|----------|-------------|
| [**Live Platform**](https://g9.enruana.com) | Try it now in your browser |
| [Web Editor Source](zoom-g9.2tt-web/) | React/TypeScript web application |
| [Python Library](phases/02-python-library/) | Device control library |
| [Protocol Spec](phases/01-reverse-engineering/06-protocol-specification/PROTOCOL.md) | Complete MIDI protocol |
| [Parameter Map](phases/01-reverse-engineering/05-effect-mapping/PARAMETER_MAP.md) | All effect parameters |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           WEB EDITOR                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   React     │  │  Firebase   │  │   Session   │  │  Web MIDI   │    │
│  │     UI      │  │    Sync     │  │   Service   │  │   Service   │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
└─────────┼────────────────┼────────────────┼────────────────┼────────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
    ┌──────────┐    ┌──────────┐    ┌──────────────┐   ┌──────────┐
    │ Browser  │    │ Firestore│    │ Realtime DB  │   │ MIDI USB │
    │   UI     │    │ (patches)│    │ (sessions)   │   │ Interface│
    └──────────┘    └──────────┘    └──────────────┘   └────┬─────┘
                                                            │
                                                            ▼
                                                     ┌──────────────┐
                                                     │  Zoom G9.2tt │
                                                     │    Pedal     │
                                                     └──────────────┘
```

### Server/Client Session Architecture

```
┌─────────────────────┐         Firebase          ┌─────────────────────┐
│   SERVER MODE       │      Realtime DB          │   CLIENT MODE       │
│   (PC + MIDI)       │ ◄══════════════════════►  │   (Phone/Tablet)    │
├─────────────────────┤   /sessions/{code}        ├─────────────────────┤
│ - Connected to      │                           │ - No MIDI needed    │
│   physical pedal    │   State Broadcast ──────► │ - Full control UI   │
│ - Creates session   │   (patches, params)       │ - Joins via code    │
│ - Broadcasts state  │ ◄────── Commands          │ - Sends commands    │
│ - Executes commands │   (paramChange, etc)      │ - Real-time sync    │
└─────────────────────┘                           └─────────────────────┘
```

---

## Key Discovery: Edit Mode Required

For real-time parameter changes (0x31 commands) to work, the device **must be in Edit Mode**:

```
F0 52 00 42 12 F7   ← ENTER EDIT MODE (required!)
F0 52 00 42 31 ...  ← Parameter changes now work
F0 52 00 42 1F F7   ← EXIT EDIT MODE (when done)
```

Without EDIT_ENTER (0x12), the pedal silently ignores 0x31 commands.

---

## Hardware Requirements

| Component | Description |
|-----------|-------------|
| Zoom G9.2tt | Multi-effects pedal |
| USB MIDI Interface | Roland UM-ONE MK2 recommended |
| MIDI Cable | Standard 5-pin DIN |
| Modern Browser | Chrome 89+ (Web MIDI API support) |

> **💡 Need a MIDI interface?** I recommend the [Roland UM-ONE MK2](https://tmsmusic.co/products/interface-roland-um-one-mk2?variant=39847122010303) - it's reliable and works perfectly with this project. That's where I bought mine (ships to Colombia).

---

## Getting Started

### Use the Live Platform (Easiest)

Visit **[g9.enruana.com](https://g9.enruana.com)** in Chrome - no installation required!

### Run Locally (Development)

```bash
cd zoom-g9.2tt-web
npm install
npm run dev
```

Open http://localhost:5173 in Chrome.

### Python Library

```bash
cd phases/02-python-library
pip install -e .

# Read a patch
python examples/read_patch.py 0

# Real-time control
python examples/realtime_control.py
```

---

## Device Information

| Property | Value |
|----------|-------|
| Manufacturer | Zoom Corporation |
| Model | G9.2tt |
| MIDI Manufacturer ID | 0x52 |
| MIDI Model ID | 0x42 |
| Patches | 100 (U0-U99) |
| Patch Size | 128 bytes |
| Modules | 10 (CMP, WAH, EXT, ZNR, AMP, EQ, CAB, MOD, DLY, REV) |

---

## Project Structure

```
zoom-g9.2tt-platform/
├── zoom-g9.2tt-web/              # React web application
│   ├── src/
│   │   ├── pages/                # Editor, Splash, JoinSession
│   │   ├── components/           # UI components
│   │   ├── services/             # MIDI, Firebase, Session
│   │   ├── contexts/             # React state management
│   │   └── types/                # TypeScript definitions
│   └── README.md                 # Web app documentation
│
├── phases/
│   ├── 01-reverse-engineering/   # Protocol reverse engineering
│   │   ├── 06-protocol-specification/
│   │   │   └── PROTOCOL.md       # Complete protocol spec
│   │   └── 05-effect-mapping/
│   │       └── PARAMETER_MAP.md  # All parameters documented
│   │
│   └── 02-python-library/        # Python device control
│       ├── zoomg9/               # Library package
│       ├── examples/             # Usage examples
│       └── README.md             # Library documentation
│
└── tools/                        # Development utilities
    ├── g9tt_decoder.py           # Patch decoding
    ├── midi_monitor.py           # MIDI traffic monitor
    └── sysex_analyzer.py         # SysEx analysis
```

---

## MIDI Protocol Summary

| Command | ID | Description |
|---------|-----|-------------|
| Identity Request | 0x11 | Query device info (7 bytes) |
| Enter Edit Mode | 0x12 | Enable real-time editing (6 bytes) |
| Exit Edit Mode | 0x1F | Disable editing (6 bytes) |
| Read Patch Response | 0x21 | Patch data from device (268 bytes) |
| Write/Preview Patch | 0x28 | Send patch to device (153 bytes) |
| Parameter Change | 0x31 | Real-time parameter update (10 bytes) |

### Data Encoding

- **Patch Data**: 128 bytes → nibble-encoded (256 bytes) → 7-bit encoded (147 bytes)
- **CRC-32**: Standard polynomial (0xEDB88320), calculated over raw 128 bytes

---

## Tech Stack

### Web Editor
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **3D Effects**: Three.js + React Three Fiber
- **Backend**: Firebase (Auth, Firestore, Realtime DB)
- **MIDI**: Web MIDI API

### Python Library
- **MIDI**: mido + python-rtmidi
- **Format**: Python 3.8+

---

## Features

### Web Editor
- Real-time parameter editing
- Patch management (read/write/duplicate/rename)
- 3D animated splash screen
- Virtual pedalboard interface
- Google authentication
- Cloud sync to Firebase
- Collaborative remote sessions
- Undo/redo history
- Demo mode (no hardware)
- Mobile responsive

### Python Library
- Patch read/write
- Bulk operations (all 100 patches)
- Real-time parameter control
- Device identification
- Context manager for edit mode

---

## References

- [g9.2-control](https://github.com/sbiickert/g9.2-control) - Prior Mac OS X work
- [G9RPG](https://github.com/RedFerret61/G9RPG) - Random patch generator
- [zoom-ms-utility](https://github.com/g200kg/zoom-ms-utility) - MS series protocol

---

## License

MIT License

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

For protocol documentation or bug reports, please open an issue.

---

## Author

Made by **enruana**

- Email: felipemantillagomez@gmail.com
- GitHub: [@enruana](https://github.com/enruana)
