# Checksum del Zoom G9.2tt - Problema Pendiente

## Estado

**NO RESUELTO** - El algoritmo de checksum no ha sido descifrado.

## Contexto

El comando READ_RESP (0x21) incluye 5 bytes de checksum al final:

```
F0 52 00 42 21 [patch_num] [256 nibbles] [5 bytes checksum] F7
```

Estructura completa: 268 bytes total
- Header: 6 bytes (F0 52 00 42 21 patch_num)
- Datos: 256 bytes (nibbles)
- Checksum: 5 bytes
- Footer: 1 byte (F7)

## Lo que funciona

- **Bulk Read**: Leer todos los patches ✓
- **Bulk Round-Trip**: Leer y escribir sin modificaciones ✓
- **Control en tiempo real**: Comando 0x31 para cambiar parámetros ✓

## Lo que NO funciona

- **Bulk Write con modificaciones**: El pedal valida el checksum y rechaza datos modificados

## Datos de análisis

Checksums capturados de varios patches:

| Patch | Sum Nibbles | Sum Decoded | Checksum Bytes |
|-------|-------------|-------------|----------------|
| 0 | 859 | 5989 | [48, 17, 4, 89, 11] |
| 1 | 903 | 6258 | [3, 66, 36, 15, 0] |
| 2 | 692 | 5117 | [115, 68, 39, 6, 2] |
| 10 | 877 | 6307 | [0, 121, 21, 12, 13] |
| 50 | 860 | 6020 | [105, 11, 64, 31, 10] |
| 99 | 815 | 5375 | [95, 87, 31, 64, 9] |

## Algoritmos descartados

- **Suma simple**: No coincide con ningún byte del checksum
- **Suma 7-bit split**: Los valores no corresponden
- **XOR**: No hay correlación
- **CRC-32**: No coincide (ni de nibbles ni de decoded)
- **CRC-16**: No coincide

## Observaciones

1. Los 5 bytes del checksum son todos < 128 (MIDI-safe)
2. Los valores varían significativamente entre patches
3. El checksum probablemente se calcula sobre los 256 nibbles
4. Podría ser un algoritmo propietario de Zoom

## Próximos pasos para resolver

1. **Analizar G9ED.exe**: Desensamblar el ejecutable de Windows para encontrar el algoritmo
2. **Más capturas**: Comparar checksums de datos conocidos
3. **Fuerza bruta**: Probar variaciones de CRC con diferentes polinomios
4. **Contactar comunidad**: Buscar si alguien más ha resuelto esto para otros pedales Zoom

## Workaround temporal

Mientras no se descifre el checksum, las modificaciones se pueden hacer usando:

1. **Control en tiempo real (0x31)**: Modifica parámetros del patch activo
2. **G9ED oficial**: Usar el software de Zoom para ediciones que requieren persistencia

## Referencias

- Captura de bulk write: `phases/01-reverse-engineering/captures/bulk_write_20260125/`
- Protocolo documentado: `phases/01-reverse-engineering/06-protocol-specification/PROTOCOL.md`
