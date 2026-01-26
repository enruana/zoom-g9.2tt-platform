# Paso 07: Análisis del Checksum de 5 Bytes

## Estado: ✅ Completo (2026-01-26)

## Solución

El checksum es **CRC-32 estándar** codificado en 5 bytes de 7 bits.

### Algoritmo

```python
# 1. Calcular CRC-32 sobre los 128 bytes decodificados
crc = crc32(decoded_data, init=0xFFFFFFFF, poly=0xEDB88320)

# 2. Codificar en 5 bytes de 7 bits
checksum = [
    crc & 0x7F,          # bits 0-6
    (crc >> 7) & 0x7F,   # bits 7-13
    (crc >> 14) & 0x7F,  # bits 14-20
    (crc >> 21) & 0x7F,  # bits 21-27
    (crc >> 28) & 0x7F,  # bits 28-31
]
```

### Verificación

| Patch | CRC Calculado | CRC Recibido | Match |
|-------|---------------|--------------|-------|
| 0 | 0xBB2108B0 | 0xBB2108B0 | ✓ |
| 1 | 0x01E92103 | 0x01E92103 | ✓ |
| 2 | 0x20C9E273 | 0x20C9E273 | ✓ |
| 10 | 0xD1857C80 | 0xD1857C80 | ✓ |
| 50 | 0xA3F005E9 | 0xA3F005E9 | ✓ |
| 99 | 0x9807EBDF | 0x9807EBDF | ✓ |

## Método de Descubrimiento

Usamos **Estrategia 1: Desensamblar G9ED.exe** con `monodis` en Raspberry Pi.

### Pasos ejecutados

1. Copiamos G9ED.exe desde `/home/felipemantilla/g9ed/extracted/`
2. Desensamblamos con `monodis G9ED.exe > G9ED_full.il`
3. Buscamos `grep -n 'Crc32' G9ED_full.il`
4. Encontramos clase `G9ED.Crc32` con método `update(uint32 crc, byte data)`
5. Encontramos método `GotPatch` que valida el checksum

### Código IL relevante

```il
// Clase Crc32 - método update
.method public static unsigned int32 update(unsigned int32 crc, unsigned int8 data)
    IL_0000:  ldsfld unsigned int32[] G9ED.Crc32::CRC32_table
    IL_0005:  ldarg.0
    IL_0006:  conv.u1
    IL_0007:  ldarg.1
    IL_0008:  xor
    IL_0009:  ldelem.u4
    IL_000a:  ldarg.0
    IL_000b:  ldc.i4.8
    IL_000c:  shr.un
    IL_000d:  ldc.i4 16777215  // 0x00FFFFFF
    IL_0012:  and
    IL_0013:  xor
    IL_0014:  ret

// Método GotPatch - validación
IL_0087:  ldc.i4.m1         // init = 0xFFFFFFFF
IL_0088:  stloc.2
// ... loop sobre 128 bytes ...
IL_0096:  call unsigned int32 class G9ED.Crc32::update(...)
// ... comparar con checksum recibido ...
IL_00aa:  beq.s IL_00af     // OK si coincide
```

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `G9ED.exe` | Ejecutable original de Zoom |
| `G9ED.il` | Código IL parcial (solo headers) |
| `crc32_checksum.py` | Implementación del algoritmo |
| `verify_checksum.py` | Script de verificación con pedal real |
| `checksum_capture.py` | Script para capturar checksums |
| `checksum_analysis.py` | Script de análisis (no fue necesario) |

## Implementación Final

Ver `phases/02-python-library/zoomg9/encoding.py`:
- `calculate_checksum(data)` - Función pública
- `_calculate_crc32(data)` - CRC-32 interno
- `_encode_crc_7bit(crc)` - Codificación 7-bit

## El Problema Original

El comando READ_RESP incluye 5 bytes de checksum:

```
F0 52 00 42 21 [patch_num] [256 nibbles] [5 bytes checksum] F7
```

- El pedal **validaba** este checksum durante bulk write
- Datos con checksum incorrecto eran **rechazados silenciosamente**
- Sin conocer el algoritmo, no podíamos escribir patches modificados

## Algoritmos que NO funcionaron

Durante la investigación previa se descartaron:
- Suma simple de nibbles/bytes
- XOR de nibbles/bytes
- CRC-32 con init=0 (el error fue no usar init=0xFFFFFFFF)
- CRC-16 variantes

## Referencias

- [CHECKSUM.md](../../../02-python-library/CHECKSUM.md) - Documentación final
- [encoding.py](../../../02-python-library/zoomg9/encoding.py) - Implementación
