# 7-Bit Encoding (Formato de Escritura)

## Descripción

El comando 0x28 (Write/Preview Patch Data) usa codificación 7-bit para asegurar que todos los bytes sean válidos en MIDI (< 128).

## Conversión

```
128 bytes originales → 147 bytes transmitidos
```

### Razón

MIDI requiere que todos los bytes de datos sean < 128 (bit 7 = 0). Los datos del patch pueden contener cualquier valor (0-255), así que se usa esta codificación.

## Algoritmo

Cada grupo de 7 bytes se convierte en 8 bytes:
- 7 bytes de datos (con bit 7 eliminado)
- 1 byte con los bits 7 de los 7 bytes anteriores

### Diagrama

```
Original (7 bytes):     B0   B1   B2   B3   B4   B5   B6
                        │    │    │    │    │    │    │
Bit 7 de cada byte:     b0   b1   b2   b3   b4   b5   b6
                        └────┴────┴────┴────┴────┴────┴──▶ HIGH_BITS

Transmitido (8 bytes):  B0'  B1'  B2'  B3'  B4'  B5'  B6'  HIGH_BITS
                        (cada Bn' = Bn & 0x7F)
```

## Implementación

### Codificación (128 → 147 bytes)

```python
def encode_7bit(data_128):
    """
    Codifica 128 bytes a formato 7-bit (147 bytes)
    """
    if len(data_128) != 128:
        raise ValueError(f"Se esperan 128 bytes, recibido: {len(data_128)}")

    result = bytearray()
    i = 0

    while i < len(data_128):
        chunk = data_128[i:i+7]  # Tomar hasta 7 bytes
        high_bits = 0

        for j, byte in enumerate(chunk):
            # Guardar bit 7
            if byte & 0x80:
                high_bits |= (1 << j)
            # Añadir byte sin bit 7
            result.append(byte & 0x7F)

        # Añadir byte de bits altos
        result.append(high_bits)
        i += 7

    # Padding a 147 bytes si necesario
    while len(result) < 147:
        result.append(0x00)

    return bytes(result[:147])
```

### Decodificación (147 → 128 bytes)

```python
def decode_7bit(data_147):
    """
    Decodifica 147 bytes (7-bit) a 128 bytes originales
    """
    if len(data_147) != 147:
        raise ValueError(f"Se esperan 147 bytes, recibido: {len(data_147)}")

    result = bytearray()
    i = 0

    while i < len(data_147) and len(result) < 128:
        if i + 8 <= len(data_147):
            chunk = data_147[i:i+7]      # 7 bytes de datos
            high_bits = data_147[i+7]    # Byte de bits altos

            for j, byte in enumerate(chunk):
                if high_bits & (1 << j):
                    byte |= 0x80  # Restaurar bit 7
                result.append(byte)

            i += 8
        else:
            break

    return bytes(result[:128])
```

## Ejemplo

### Entrada (7 bytes originales)
```
A5 FF 08 80 7F 00 C0
│   │       │       │
│   │       │       └── Bit 7 = 1
│   │       └────────── Bit 7 = 1
│   └────────────────── Bit 7 = 1
└────────────────────── Bit 7 = 1
```

### Proceso
```
high_bits = 0b01001011 = 0x4B

Byte 0: A5 & 0x7F = 0x25, high_bits bit 0 = 1
Byte 1: FF & 0x7F = 0x7F, high_bits bit 1 = 1
Byte 2: 08 & 0x7F = 0x08, high_bits bit 2 = 0
Byte 3: 80 & 0x7F = 0x00, high_bits bit 3 = 1
Byte 4: 7F & 0x7F = 0x7F, high_bits bit 4 = 0
Byte 5: 00 & 0x7F = 0x00, high_bits bit 5 = 0
Byte 6: C0 & 0x7F = 0x40, high_bits bit 6 = 1
```

### Salida (8 bytes transmitidos)
```
25 7F 08 00 7F 00 40 4B
                     │
                     └── high_bits
```

## Verificación

```python
# Test de reversibilidad
original = bytes([0xA5, 0xFF, 0x08, 0x80, 0x7F, 0x00, 0xC0] + [0]*121)
encoded = encode_7bit(original)
decoded = decode_7bit(encoded)
assert original == decoded  # Debe pasar
```

## Notas

- Este formato solo se usa para **escritura/preview** (comando 0x28)
- 128 bytes → 19 grupos de 7 bytes (último grupo tiene padding)
- 19 grupos × 8 bytes = 152 bytes, pero solo se usan 147
- Todos los bytes transmitidos son < 128 (válidos para MIDI)
