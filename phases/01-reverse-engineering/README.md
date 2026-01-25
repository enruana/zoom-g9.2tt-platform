# Fase 1: Ingeniería Inversa del Protocolo MIDI

Esta fase documenta el proceso completo de ingeniería inversa del protocolo MIDI SysEx del Zoom G9.2tt.

## Objetivo

Documentar completamente el protocolo de comunicación MIDI entre el software G9ED y el pedal G9.2tt para poder replicarlo en una aplicación web moderna.

## Estado: ✅ Completo (2026-01-25)

## Pasos

| # | Paso | Estado | Descripción |
|---|------|--------|-------------|
| 01 | [Preparación del Entorno](01-environment-setup/) | ✅ Completo | Requisitos de hardware y software |
| 02 | [Acceso Remoto a G9ED](02-g9ed-remote-access/) | ✅ Completo | Ejecutar G9ED en Raspberry Pi via SSH |
| 03 | [Captura MIDI](03-midi-capture/) | ✅ Completo | Man-in-the-middle para interceptar tráfico |
| 04 | [Análisis del Protocolo](04-protocol-analysis/) | ✅ Completo | Decodificar comandos SysEx |
| 05 | [Mapeo de Efectos](05-effect-mapping/) | ✅ Completo | Identificar IDs de efectos y parámetros |
| 06 | [Especificación Final](06-protocol-specification/) | ✅ Completo | Documentación completa del protocolo |

## Resumen de Descubrimientos

### Comandos Identificados

| Comando | Bytes | Descripción |
|---------|-------|-------------|
| 0x11 | 7 | Read Patch Request |
| 0x12 | 6 | Enter Edit Mode |
| 0x1F | 6 | Exit Edit Mode |
| 0x21 | 268 | Read Patch Response (también usado en Bulk Write) |
| 0x28 | 153 | Write/Preview Patch Data (single patch) |
| 0x31 | 10 | Parameter Change / Select Patch |

### Protocolos de Transferencia

| Operación | Protocolo | Notas |
|-----------|-----------|-------|
| Bulk Read | Host envía 0x11, pedal responde 0x21 | Host controla |
| Bulk Write | Host envía 0x12, pedal pide con 0x11, host responde 0x21 | **Pedal controla (pull)** |
| Single Write | Host usa 0x28 + 0x31 | 7-bit encoded |

### Formatos de Datos

| Formato | Uso | Conversión |
|---------|-----|------------|
| Nibble-encoded | Respuesta de lectura (0x21) | 256 nibbles → 128 bytes |
| 7-bit encoded | Escritura/Preview (0x28) | 128 bytes → 147 bytes |

### Estructura del Pedal

- **100 patches** (U0-U99)
- **128 bytes** por patch (datos reales)
- **10 módulos** de efectos: TOP, CMP, WAH, EXT, ZNR, AMP, EQ, CAB, MOD, DLY, REV

## Herramientas Desarrolladas

| Herramienta | Ubicación | Función |
|-------------|-----------|---------|
| g9tt_reader.py | /tools/ | Leer patches del pedal |
| g9tt_writer.py | /tools/ | Escribir patches al pedal |
| g9tt_preview.py | /tools/ | Preview sin guardar |
| midi_proxy.py | 03-midi-capture/scripts/ | Proxy MIDI para captura |

## Entorno de Desarrollo

```
┌─────────────────────────────────────────────────────────────────┐
│                           Mac (Host)                             │
│  ┌──────────────┐                                               │
│  │   XQuartz    │◄──── X11 Forwarding ────┐                     │
│  │  (Display)   │                         │                     │
│  └──────────────┘                         │                     │
└───────────────────────────────────────────│─────────────────────┘
                                            │ SSH -Y
                                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Raspberry Pi (ARM64)                        │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │    box86     │───▶│  Wine x86    │───▶│    G9ED      │      │
│  │  (emulator)  │    │   (11.0)     │    │  (.NET app)  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                                        │              │
│         │              ALSA Sequencer            │              │
│         │    ┌───────────────────────────┐       │              │
│         └───▶│  VirMIDI ◄──► UM-ONE      │◄──────┘              │
│              │     ▲                     │                      │
│              │     │ aseqdump            │                      │
│              │     ▼                     │                      │
│              │  (captura)                │                      │
│              └───────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ MIDI
                              ▼
                    ┌──────────────────┐
                    │   Zoom G9.2tt    │
                    │     (pedal)      │
                    └──────────────────┘
```

## Información de Conexión

| Recurso | Valor |
|---------|-------|
| Raspberry Pi IP | 192.168.80.31 |
| Usuario | felipemantilla |
| MIDI Interface | UM-ONE (hw:2,0) |
| VirMIDI | hw:3,0 - hw:3,3 |

## Próximos Pasos

**Fase 1 Completa.** Todos los objetivos alcanzados:

1. ~~Completar mapeo de Effect IDs~~ ✅ (2026-01-25)
2. ~~Documentar rangos de valores~~ ✅ (2026-01-25)
3. ~~Mapear Parameter IDs completos~~ ✅ (2026-01-25)
4. ~~Crear especificación final (PROTOCOL.md)~~ ✅ (2026-01-25)

**Siguiente:** [Fase 2 - Librería Python](../02-python-library/)
