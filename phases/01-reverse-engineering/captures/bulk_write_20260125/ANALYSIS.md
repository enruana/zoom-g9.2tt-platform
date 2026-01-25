# Análisis de Captura: Bulk Write (Send All to G9.2tt)

**Fecha:** 2026-01-25
**Método:** Captura bidireccional con `capture_bidirectional.py`
**Archivos:** 206 mensajes SysEx

## Resumen

El protocolo de "Send All to G9.2tt" usa un modelo **pull** donde el pedal controla la transferencia:

1. El host envía EDIT_ENTER
2. El pedal solicita cada patch secuencialmente (0x11)
3. El host responde con los datos del patch (0x21, nibble-encoded)
4. El pedal señala fin con EDIT_EXIT

## Secuencia Capturada

```
[  47.439s] APP→HW   | Identity Request (6 bytes)
[  47.447s] HW→APP   | Identity Response (15 bytes)
[  47.593s] APP→HW   | EDIT_ENTER
[  47.598s] HW→APP   | READ_REQ patch 0    ← Pedal pide
[  47.636s] APP→HW   | READ_RESP patch 0   ← Host envía (268 bytes)
[  47.726s] HW→APP   | READ_REQ patch 1
[  47.734s] APP→HW   | READ_RESP patch 1
... (patches 2-98) ...
[  57.848s] HW→APP   | READ_REQ patch 97
[  57.858s] APP→HW   | READ_RESP patch 97
[  57.949s] HW→APP   | READ_REQ patch 98
[  57.957s] APP→HW   | READ_RESP patch 98
[  58.048s] HW→APP   | READ_REQ patch 99
[  58.079s] APP→HW   | READ_RESP patch 99
[  58.170s] HW→APP   | EDIT_EXIT           ← Pedal termina
```

**Duración total:** ~10.6 segundos para 100 patches

## Formato de Mensajes

### Identity Request (Host → Pedal)
```
F0 7E 00 06 01 F7
```

### Identity Response (Pedal → Host)
```
F0 7E 00 06 02 52 42 00 00 00 31 2E 30 38 F7
                │  │           └─────────── Firmware: "1.08"
                │  └───────────────────── Model: 0x42 (G9.2tt)
                └──────────────────────── Manufacturer: 0x52 (Zoom)
```

### EDIT_ENTER (Host → Pedal)
```
F0 52 00 42 12 F7
```

### READ_REQ (Pedal → Host)
```
F0 52 00 42 11 [PATCH] F7
                  │
                  └── Número de patch (0x00-0x63)
```

### READ_RESP (Host → Pedal)
```
F0 52 00 42 21 [PATCH] [256 NIBBLES] [5 CHECKSUM] F7
                  │          │              │
                  │          │              └── Bytes de verificación
                  │          └── Datos del patch (nibble-encoded)
                  └── Número de patch
```
**Tamaño total:** 268 bytes

### EDIT_EXIT (Pedal → Host)
```
F0 52 00 42 1F F7
```

## Descubrimientos Clave

1. **Protocolo Pull:** A diferencia de la escritura individual (0x28), el bulk write usa READ_RESP (0x21)
2. **Pedal controla flujo:** El pedal decide cuándo pedir cada patch
3. **Mismo formato:** Los datos usan el mismo formato nibble-encoded que las lecturas
4. **Sin confirmación:** No hay ACK individual por patch, el pedal simplemente pide el siguiente
5. **Timing:** ~100ms entre patches, flujo continuo

## Implicaciones para la Librería

Para implementar bulk write:
1. Enviar EDIT_ENTER
2. Esperar READ_REQ del pedal
3. Responder con READ_RESP (datos en formato nibble)
4. Repetir hasta recibir EDIT_EXIT

El host debe ser **reactivo**, no proactivo.
