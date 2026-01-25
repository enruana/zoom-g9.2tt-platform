# Nibble Encoding (Formato de Lectura)

## Descripción

El comando 0x21 (Read Patch Response) usa codificación nibble donde cada byte original se transmite como dos nibbles (4 bits cada uno).

## Conversión

```
128 bytes originales → 256 nibbles transmitidos
```

### Estructura del Mensaje

```
F0 52 00 42 21 [PATCH] [NIBBLE_HIGH_0] [NIBBLE_LOW_0] ... [NIBBLE_HIGH_127] [NIBBLE_LOW_127] F7
                  │           │              │
                  │           └──────────────┴── 256 nibbles (128 pares)
                  └── Número de patch
```

**Longitud total:** 268 bytes
- Header: 6 bytes (F0 52 00 42 21 PATCH)
- Datos: 256 nibbles
- Footer: 1 byte (F7)
- Checksum: 5 bytes adicionales (posición 262-266)

## Algoritmo de Decodificación

```python
def decode_nibbles(response):
    """
    Decodifica respuesta de lectura (268 bytes) → 128 bytes
    """
    if len(response) != 268:
        raise ValueError(f"Respuesta inválida: {len(response)} bytes")

    # Extraer nibbles (bytes 6-261)
    nibbles = response[6:262]  # 256 nibbles

    decoded = []
    for i in range(0, len(nibbles), 2):
        high = nibbles[i] & 0x0F      # Nibble alto
        low = nibbles[i+1] & 0x0F     # Nibble bajo
        byte_value = (high << 4) | low
        decoded.append(byte_value)

    return bytes(decoded)  # 128 bytes
```

## Ejemplo

### Entrada (nibbles)
```
0A 05 0F 0F 00 08 ...
```

### Proceso
```
0A 05 → (0xA << 4) | 0x5 = 0xA5
0F 0F → (0xF << 4) | 0xF = 0xFF
00 08 → (0x0 << 4) | 0x8 = 0x08
```

### Salida (bytes originales)
```
A5 FF 08 ...
```

## Notas

- Este formato solo se usa para la **respuesta de lectura** (0x21)
- Los nibbles siempre están en el rango 0x00-0x0F
- El orden es Big Endian (nibble alto primero)
