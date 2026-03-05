# Zoom G9.2tt - Checklist de Mapeo Completo

## Fuentes de Datos

| Fuente | Cubre | No Cubre |
|--------|-------|----------|
| **E_G92tt.pdf** | Manual oficial: todos los módulos, parámetros, expression pedals, effect chain, ARRM, footswitch functions | No tiene datos MIDI (SysEx, param IDs, byte offsets) |
| **G9ED.efx.xml** | 10 módulos (120 tipos, 420 params): nombres, rangos, offsets, valores nombrados | EQ, CAB, PreAmp A/B, Expression Pedals, Effect Chain, Footswitch |
| **Capturas MIDI** | Codificación real de bytes, comportamiento On/Off, cambio de tipo | Solo lo que capturemos manualmente |
| **Patch data (128 bytes)** | Bit-packing, Row 11 (Canal B), byte 61 (A/B switch) | Expression pedal assignments, Effect Chain routing |

---

## Estado por Fuente

### A. Desde G9ED.efx.xml (420 params) → ✅ COMPLETO
Parseado y disponible en `reference/efx_parsed.json` y `reference/efx_summary.md`.

| Módulo | Tipos | Params | Estado |
|--------|-------|--------|--------|
| TOP | 1 | 1 | ✅ Level (0-100) |
| CMP | 3 | 12 | ✅ Compressor, RackComp, Limiter |
| WAH | 17 | 68 | ✅ Todos los 17 tipos con params completos |
| EXT | 1 | 3 | ✅ Send, Return, Dry |
| ZNR | 3 | 3 | ✅ ZNR, NoiseGate, DirtyGate (Threshold) |
| AMP | 44 | 132 | ✅ Todos los 44 tipos (Gain, Tone, Level) |
| MOD | 28 | 112 | ✅ Todos los 28 tipos con params completos |
| DLY | 7 | 28 | ✅ Todos los 7 tipos (Time, FeedBack, HiDamp, Mix) |
| REV | 15 | 60 | ✅ Todos los 15 tipos con params completos |
| TTL | 1 | 1 | ✅ ARRM BPM (0-250) |

### B. Desde Capturas MIDI → 🟡 PARCIAL

| Descubrimiento | Estado | Captura |
|----------------|--------|---------|
| Codificación 14-bit (valores >127) | ✅ | `dly_time_mapping.log` |
| DLY params verificados (Time, FeedBack, HiDamp, Mix) | ✅ | `dly_time_mapping.log` |
| MOD Z-MonoPitch params verificados | ✅ | `mod_mapping.log` |
| On/Off envía 0x31 + Write/Preview (0x28) | ✅ | Ambas capturas |
| Cambio de tipo envía Write/Preview (0x28), no 0x31 | ✅ | Ambas capturas |
| PreAmp A/B = byte 61 (0x00=A, 0x01=B) | ✅ | `mapping_20260305_114020.log` |
| EQ: 6 bandas mapeadas (EFFECT_ID=0x06) | ✅ | `eq_cab_mapping.log` |
| CAB: Depth, MicType, MicPos mapeados (EFFECT_ID=0x07) | ✅ | `eq_cab_mapping.log` |
| EQ/CAB On/Off solo via Write/Preview (0x28) | ✅ | `eq_cab_mapping.log` |
| Expression Pedals: almacenados en patch bytes 75-128 | ✅ | `expression_pedals.log` |
| Pedal1 Target-1: Switch=byte 77, Min=byte 82, Max=byte 83 | ✅ | `expression_pedals.log` |
| Pedal1 Target-2: TargetID=bytes 84-85, Max=byte 87, Switch=byte 88 | ✅ | `expression_pedals.log` |
| Pedal2V: cambios en bytes 91, 97, 99 | ✅ | `expression_pedals.log` |
| Pedal2H: cambios en bytes 112, 113, 115 | ✅ | `expression_pedals.log` |
| ARRM RTM: Target, WaveType, Max, Min, Sync (estructura documentada) | ✅ | Screenshots |
| Total Level: EFFECT=0x00, PARAM=0x05, rango 25-49 (display 26-50) | ✅ | `total_footswitch_chain.log` |
| TTL/EXTRA BPM: EFFECT=0x0B, PARAM=0x00, rango 69-80+ | ✅ | `total_footswitch_chain.log` |
| Footswitch Fn1: EFFECT=0x0B, PARAM=0x01 | ✅ | `total_footswitch_chain.log` |
| Footswitch Fn2: EFFECT=0x0B, PARAM=0x02 | ✅ | `total_footswitch_chain.log` |
| Effect Chain: cambio via Write/Preview (0x28) | ✅ | `total_footswitch_chain.log` |

#### EQ (EFFECT_ID = 0x06) — 6 bandas, rango bipolar

| Param ID | Banda | Rango MIDI | Display | Nota |
|----------|-------|------------|---------|------|
| 0x02 | Band 1 (160Hz) | 0-24 | -12 a +12 | Centro=12=flat, <12=cut, >12=boost |
| 0x03 | Band 2 (400Hz) | 0-24 | -12 a +12 | " |
| 0x04 | Band 3 (800Hz) | 0-24 | -12 a +12 | " |
| 0x05 | Band 4 (3.2kHz) | 0-24 | -12 a +12 | " |
| 0x06 | Band 5 (6.4kHz) | 0-24 | -12 a +12 | " |
| 0x07 | Band 6 (12kHz) | 0-24 | -12 a +12 | " |

> On/Off del EQ se envía via Write/Preview (0x28), no como 0x31 parameter change.

#### CAB (EFFECT_ID = 0x07) — 3 parámetros discretos

| Param ID | Parámetro | Rango | Valores |
|----------|-----------|-------|---------|
| 0x02 | MIC Type | 0-1 | 0=Dynamic, 1=Condenser |
| 0x03 | MicPos | 0-2 | 3 posiciones (Near/Middle/Far) |
| 0x04 | Depth | 0-2 | 0=Small, 1=Middle, 2=Large |

> On/Off del CAB se envía via Write/Preview (0x28), no como 0x31 parameter change.

### C. Capturas MIDI Completadas → ✅ COMPLETO

| # | Item | Prioridad | Estado | Qué hacer |
|---|------|-----------|--------|-----------|
| C1 | **EQ: 6 bandas** | ALTA | ✅ COMPLETO | 6 bandas bipolares 0-24, EFFECT_ID=0x06 |
| C2 | **CAB: Depth, MicType, MicPos** | ALTA | ✅ COMPLETO | 3 params discretos, EFFECT_ID=0x07 |
| C3 | **Expression Pedals** | ALTA | ✅ COMPLETO | 3 pedales × 4 targets en patch bytes 75-128, via Write/Preview |
| C4 | **Total: Level** | MEDIA | ✅ COMPLETO | EFFECT=0x00, PARAM=0x05, rango 25-49 (display 26-50) |
| C5 | **Footswitch Functions** | MEDIA | ✅ COMPLETO | Fn1=0x0B/0x01, Fn2=0x0B/0x02 (18 opciones documentadas) |
| C6 | **Effect Chain routing** | MEDIA | ✅ COMPLETO | Via Write/Preview (0x28), Pre-bF/Post-bF capturados |
| C7 | **ARRM Setting** | BAJA | ✅ DOCUMENTADO | Estructura: Target, WaveType(8), Max, Min, Sync (screenshots) |

---

## D. Implementación Web → 🔴 FALTA

Una vez tengamos todos los datos, hay que actualizar el código web:

| # | Tarea | Archivos a modificar |
|---|-------|---------------------|
| D1 | **Generar parameterMaps.ts desde efx_parsed.json** | `src/data/parameterMaps.ts` |
| D2 | **Implementar codificación 14-bit en protocol.ts** | `src/services/midi/protocol.ts` |
| D3 | **Corregir effectTypes.ts con nombres exactos del XML** | `src/data/effectTypes.ts` |
| D4 | **Agregar display offsets** (muchos params tienen offset=1) | `src/data/parameterMaps.ts`, UI components |
| D5 | **Agregar valores nombrados** (RefTbl: Fast/Slow, BPM sync, etc.) | `src/data/parameterMaps.ts`, UI components |
| D6 | **Implementar PreAmp A/B** | Nuevo componente + patch context |
| D7 | **Agregar EQ params** | Después de captura C1 |
| D8 | **Agregar CAB params correctos** | Después de captura C2 |
| D9 | **Implementar Expression Pedals MIDI** | Después de captura C3 |
| D10 | **Agregar BPM/Tempo editable** | Panel Total + protocol |
| D11 | **Agregar Effect Chain routing** | Después de captura C6 |

---

## Hallazgos Clave de esta Fase

### 1. Codificación 14-bit para valores >127
```
Format 0x31: F0 52 00 42 31 [EFFECT] [PARAM] [VALUE_LO] [VALUE_HI] F7
VALUE_LO = valor & 0x7F
VALUE_HI = valor >> 7
valor_real = VALUE_LO | (VALUE_HI << 7)
```
Aplica a: DLY Time, MOD Time/Delay, y cualquier param con max >127.

### 2. Cambio de tipo envía patch completo
Cuando se cambia el tipo de efecto (dropdown), G9ED envía un Write/Preview (0x28) del patch completo, no un Parameter Change (0x31).

### 3. On/Off envía doble
Toggle de On/Off envía: 0x31 param change + 0x28 Write/Preview del patch completo.

### 4. PreAmp A/B = byte 61 del patch
No es un parámetro MIDI, es un byte en la estructura del patch raw (128 bytes). Se cambia via Write/Preview.

### 5. Display offsets en XML
Muchos parámetros tienen `offset=1`, lo que significa: `display_value = midi_value + offset`. Ejemplo: Level con offset=1, MIDI 0-49 muestra como 1-50.

### 6. Parámetros con valores nombrados (RefTbl)
50 parámetros usan tablas de referencia: BPM sync (32nd, 16th, quarter...), pitch intervals (-24 a +24), wave shapes (UP0-UP14, DWN0-DWN14), etc.

### 7. rtm_max vs max
Algunos parámetros tienen `rtm_max < max`. Ejemplo: Rate params con BPM sync tienen max=78 (incluye named BPM values) pero rtm_max=50 (solo el rango numérico es controlable en tiempo real).

### 8. EQ y CAB no están en el XML — MAPEADOS via captura MIDI
Son módulos "fixed" sin tipos en el XML. Mapeados completamente via captura MIDI:
- **EQ** (EFFECT_ID=0x06): 6 bandas bipolares, params 0x02-0x07, rango 0-24 (centro=12=flat)
- **CAB** (EFFECT_ID=0x07): MicType (0-1), MicPos (0-2), Depth (0-2)
- On/Off de ambos se envía exclusivamente via Write/Preview (0x28), no como parameter change (0x31)

### 9. EQ es bipolar con offset -12
El EQ usa rango MIDI 0-24 pero el display es -12 a +12 dB. Fórmula: `display = midi_value - 12`. Valor MIDI 12 = 0 dB (flat).

### 10. Expression Pedals almacenados en patch bytes (no 0x31)
Los Expression Pedals (Pedal1, Pedal2V, Pedal2H) son datos del patch, NO parámetros MIDI individuales.
Se modifican via Write/Preview (0x28), igual que PreAmp A/B.

**3 pedales**: Pedal1 (EXP1), Pedal2V (Z-Pedal vertical), Pedal2H (Z-Pedal horizontal)
**4 targets por pedal**, cada uno con: Target ID, Switch (on/off), Min, Max

```
Pedal1 Target-1: Switch=byte 77 (0x80=ON), Min=byte 82, Max=byte 83
Pedal1 Target-2: TargetID=bytes 84-85, Max=byte 87, Switch=byte 88
Pedal2V:         Target area bytes ~91-99
Pedal2H:         Target area bytes ~112-115
```

Target list es dinámica (depende de los efectos activos en el patch):
Not Assigned, Volume, WAH:{type}:{param}, EXT:EXT:{Send/Return/Dry},
AMP:{type}:{Gain/Level}, MOD:{type}:{params}, DLY:{type}:{params},
REV:{type}:{params}, ARRM BPM

### 11. ARRM RTM Setting (documentado)
Auto-Repeat Real-time Modulation (LFO interno):
- **Target**: misma lista dinámica que Expression Pedals
- **WaveType**: 8 tipos (UpSaw, UpCurve, DownSaw, DownCurve, Triangle, SquareTri, Sine, Square)
- **Max/Min**: rango del LFO (0-100)
- **Sync**: sincronización con tempo (BPM)

### 12. Total Level = EFFECT 0x00, PARAM 0x05
```
F0 52 00 42 31 00 05 [VALUE_LO] [VALUE_HI] F7
```
Rango MIDI: 25-49, Display: 26-50 (offset +1). Es un parámetro normal (0x31).

### 13. Footswitch Functions = EFFECT 0x0B, PARAM 0x01/0x02
```
Fn1: F0 52 00 42 31 0B 01 [VALUE] 00 F7
Fn2: F0 52 00 42 31 0B 02 [VALUE] 00 F7
```
18 opciones disponibles:
EXT LOOP OnOff, PRE-AMP CH A/B, BPM TAP, Delay TAP, Hold Delay,
Delay Mute, Bypass OnOff, Mute OnOff, Manual Mode, COMP OnOff,
WAH/EFX1 OnOff, ZNR OnOff, PRE-AMP OnOff, EQ OnOff,
MOD/EFX2 OnOff, DELAY OnOff, REVERB OnOff

### 14. Effect Chain routing via Write/Preview
El cambio de routing (Pre-bF/Pre-AF/Post-bF/Post-AF) envía un Write/Preview (0x28) del patch completo.
Los tabs Post-AF y Pre-AF estaban bloqueados (posiblemente depende del canal A/B activo).

### 15. BPM/Tempo = EFFECT 0x0B, PARAM 0x00
```
F0 52 00 42 31 0B 00 [VALUE_LO] [VALUE_HI] F7
```
Rango observado: 69-80 (mapeado desde efx_parsed.json: 0-250 BPM).
