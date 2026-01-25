# Paso 04: Análisis del Protocolo

## Objetivo

Decodificar y documentar todos los comandos SysEx del protocolo MIDI del G9.2tt.

## Estructura General de Mensajes SysEx

```
F0 52 00 42 [CMD] [DATA...] F7
│  │  │  │   │      │       └── End of SysEx
│  │  │  │   │      └────────── Datos del comando (variable)
│  │  │  │   └───────────────── Comando (1 byte)
│  │  │  └───────────────────── Model ID: 0x42 (G9.2tt)
│  │  └──────────────────────── Device ID: 0x00
│  └─────────────────────────── Manufacturer ID: 0x52 (Zoom)
└────────────────────────────── Start of SysEx
```

## Comandos Identificados

### 0x11 - Read Patch Request

Solicita datos de un patch.

```
F0 52 00 42 11 [PATCH] F7
                  │
                  └── Número de patch (0x00-0x63 = 0-99)
```

**Longitud:** 7 bytes

### 0x12 - Enter Edit Mode

Entra en modo de edición.

```
F0 52 00 42 12 F7
```

**Longitud:** 6 bytes

### 0x1F - Exit Edit Mode

Sale del modo de edición.

```
F0 52 00 42 1F F7
```

**Longitud:** 6 bytes

### 0x21 - Read Patch Response

Respuesta con datos del patch (nibble-encoded).

```
F0 52 00 42 21 [PATCH] [256 NIBBLES] F7
                  │          │
                  │          └── 256 nibbles = 128 bytes decodificados
                  └── Número de patch
```

**Longitud:** 268 bytes

**Decodificación:** Ver [data-formats/nibble-encoding.md](data-formats/nibble-encoding.md)

### 0x28 - Write/Preview Patch Data

Envía datos de patch al buffer temporal (preview) o para escritura.

```
F0 52 00 42 28 [147 BYTES] F7
                    │
                    └── Datos 7-bit encoded (128 bytes originales)
```

**Longitud:** 153 bytes

**Codificación:** Ver [data-formats/7bit-encoding.md](data-formats/7bit-encoding.md)

### 0x31 - Parameter Change / Select Patch

Comando multipropósito para cambios de parámetros y selección.

#### Variante: Cambio de Parámetro

```
F0 52 00 42 31 [EFFECT] [PARAM] [VALUE] 00 F7
                  │        │       │
                  │        │       └── Valor (0-127)
                  │        └────────── ID del parámetro
                  └─────────────────── ID del efecto
```

**Longitud:** 10 bytes

**Ejemplo:**
```
F0 52 00 42 31 05 02 34 00 F7
                │  │  │
                │  │  └── Value: 0x34 = 52
                │  └───── Param: 0x02 = Gain
                └──────── Effect: 0x05 = AMP
```

#### Variante: Selección de Patch

```
F0 52 00 42 31 [PATCH] 02 [MODE] 00 F7
                  │         │
                  │         └── Modo (02=preview, 09=select, etc.)
                  └── Número de patch
```

## Flujos de Operación

### Lectura de Patch

```
G9ED                          Pedal
  │                             │
  │──── 0x11 (Read Request) ───▶│
  │                             │
  │◀─── 0x21 (Read Response) ───│
  │                             │
```

### Preview de Patch

```
G9ED                          Pedal
  │                             │
  │──── 0x12 (Enter Edit) ─────▶│
  │                             │
  │──── 0x31 (Select) ─────────▶│
  │                             │
  │──── 0x28 (Preview Data) ───▶│
  │                             │
  │──── 0x31 (Confirm) ────────▶│
  │                             │
```

### Cambio de Parámetro en Tiempo Real

```
G9ED                          Pedal
  │                             │
  │──── 0x31 (Param Change) ───▶│
  │     (efecto aplicado        │
  │      inmediatamente)        │
  │                             │
```

## Documentación Detallada

- [commands/read-patch.md](commands/read-patch.md) - Lectura de patches
- [commands/write-patch.md](commands/write-patch.md) - Escritura de patches
- [commands/preview-patch.md](commands/preview-patch.md) - Preview sin guardar
- [commands/parameter-change.md](commands/parameter-change.md) - Cambios en tiempo real
- [data-formats/nibble-encoding.md](data-formats/nibble-encoding.md) - Formato de lectura
- [data-formats/7bit-encoding.md](data-formats/7bit-encoding.md) - Formato de escritura

## Siguiente Paso

[05 - Mapeo de Efectos](../05-effect-mapping/)
