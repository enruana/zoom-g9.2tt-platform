# Checksum del Zoom G9.2tt - RESUELTO

## Estado: ✅ RESUELTO (2026-01-26)

El algoritmo de checksum de 5 bytes fue descifrado mediante ingeniería inversa de G9ED.exe.

## Algoritmo

```
CRC-32 estándar sobre 128 bytes → codificado en 5 bytes de 7 bits
```

### Detalles

1. **Entrada**: 128 bytes de datos del patch (decodificados de nibbles)
2. **Algoritmo**: CRC-32 con polinomio `0xEDB88320` y valor inicial `0xFFFFFFFF`
3. **Salida**: El CRC de 32 bits se codifica en 5 bytes de 7 bits cada uno

### Codificación 7-bit

```
Byte 0: bits 0-6   del CRC
Byte 1: bits 7-13  del CRC
Byte 2: bits 14-20 del CRC
Byte 3: bits 21-27 del CRC
Byte 4: bits 28-31 del CRC (solo 4 bits)
```

## Verificación

Probado con 6 patches reales:

| Patch | CRC Calculado | CRC Recibido | Match |
|-------|---------------|--------------|-------|
| 0 | 0xBB2108B0 | 0xBB2108B0 | ✓ |
| 1 | 0x01E92103 | 0x01E92103 | ✓ |
| 2 | 0x20C9E273 | 0x20C9E273 | ✓ |
| 10 | 0xD1857C80 | 0xD1857C80 | ✓ |
| 50 | 0xA3F005E9 | 0xA3F005E9 | ✓ |
| 99 | 0x9807EBDF | 0x9807EBDF | ✓ |

## Método de Descubrimiento

1. Desensamblamos G9ED.exe usando `monodis` en Raspberry Pi
2. Encontramos clase `G9ED.Crc32` con método `update(uint32 crc, byte data)`
3. Identificamos método `GotPatch` que valida el checksum

### Código IL clave

```il
// Init CRC = 0xFFFFFFFF
IL_0087:  ldc.i4.m1
IL_0088:  stloc.2

// Loop 128 bytes
IL_0096:  call unsigned int32 class G9ED.Crc32::update(...)

// Comparar
IL_00aa:  beq.s IL_00af  // OK si coincide
```

## Implementación

Ver `zoomg9/encoding.py`:
- `calculate_checksum(data)` - Calcula checksum de 5 bytes
- `_calculate_crc32(data)` - CRC-32 interno
- `_encode_crc_7bit(crc)` - Codifica CRC a 5 bytes

## Referencias

- [07-checksum-analysis](../01-reverse-engineering/07-checksum-analysis/) - Análisis completo
