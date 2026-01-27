# Zoom G9.2tt Platform

Plataforma de edición web para el pedal multiefectos Zoom G9.2tt, basada en ingeniería inversa del protocolo MIDI SysEx.

## Objetivo

Crear un editor web moderno que reemplace al software original G9ED (Windows XP, .NET 2.0) permitiendo:
- Editar patches en tiempo real
- Gestionar librería de patches
- Funcionar en cualquier navegador moderno
- Compatibilidad multiplataforma

## Fases del Proyecto

| Fase | Estado | Descripción |
|------|--------|-------------|
| [01 - Ingeniería Inversa](phases/01-reverse-engineering/) | ✅ Completo | Protocolo MIDI SysEx documentado completamente |
| [02 - Librería Python](phases/02-python-library/) | ✅ Completo | API Python funcional para lectura/escritura/control real-time |
| [03 - Editor Web](zoom-g9.2tt-web/) | 🔄 En progreso | Interfaz web con Web MIDI API + Online Mode |
| [04 - Despliegue](phases/04-deployment/) | ⏳ Pendiente | Documentación y distribución |

## Descubrimientos Clave

### Edit Mode Requerido para Control en Tiempo Real (2026-01-27)

Para que los comandos de cambio de parámetros (0x31) funcionen, el dispositivo **debe estar en Edit Mode**:

```
F0 52 00 42 12 F7   ← ENTER EDIT MODE (requerido!)
F0 52 00 42 31 ...  ← Cambios de parámetros funcionan
F0 52 00 42 1F F7   ← EXIT EDIT MODE (al terminar)
```

Sin el comando EDIT_ENTER (0x12), el pedal ignora silenciosamente los comandos 0x31.
Ver [PROTOCOL.md](phases/01-reverse-engineering/06-protocol-specification/PROTOCOL.md) para detalles completos.

## Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Editor Web    │────▶│  Librería Python │────▶│   Zoom G9.2tt   │
│  (JavaScript)   │     │   (WebSocket)    │     │  (MIDI SysEx)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                               │
         └───────────── Web MIDI API ────────────────────┘
                    (conexión directa opcional)
```

## Hardware Requerido

| Componente | Descripción |
|------------|-------------|
| Zoom G9.2tt | Pedal multiefectos |
| Interfaz MIDI USB | Roland UM-ONE (recomendado) |
| Cable MIDI | DIN 5 pines estándar |

## Estructura del Proyecto

```
zoom-g9.2tt-platform/
├── phases/                        # Documentación por fases
│   ├── 01-reverse-engineering/    # Fase 1: Ingeniería inversa
│   ├── 02-python-library/         # Fase 2: Librería Python
│   ├── 03-web-editor/             # Fase 3: Editor web
│   └── 04-deployment/             # Fase 4: Despliegue
├── tools/                         # Herramientas de desarrollo
├── lib/                           # Librería Python (producción)
└── web/                           # Aplicación web (producción)
```

## Quick Start

### Requisitos
- Python 3.8+ con `mido` y `python-rtmidi`
- Interfaz MIDI USB conectada al G9.2tt

### Instalación
```bash
pip install mido python-rtmidi
```

### Lectura de patch
```bash
python tools/g9tt_reader.py read 0  # Lee patch U0
```

### Preview de patch
```bash
python tools/g9tt_preview.py preview 5  # Preview patch U5
```

## Información del Dispositivo

| Propiedad | Valor |
|-----------|-------|
| Fabricante | Zoom Corporation |
| Modelo | G9.2tt |
| MIDI Manufacturer ID | 0x52 |
| MIDI Model ID | 0x42 |
| Patches | 100 (U0-U99) |
| Formato de patch | 128 bytes |

## Referencias

- [g9.2-control](https://github.com/sbiickert/g9.2-control) - Trabajo previo en Mac OS X
- [G9RPG](https://github.com/RedFerret61/G9RPG) - Generador de patches aleatorios
- [zoom-ms-utility](https://github.com/g200kg/zoom-ms-utility) - Protocolo de pedales MS

## Licencia

MIT License
