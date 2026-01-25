# Paso 03: Captura MIDI (Man-in-the-Middle)

## Objetivo

Interceptar y registrar todo el tráfico MIDI entre G9ED y el pedal G9.2tt para analizar el protocolo.

## Arquitectura de Captura

```
┌──────────────────────────────────────────────────────────────────┐
│                        Raspberry Pi                               │
│                                                                   │
│  ┌─────────┐    ┌─────────────────┐    ┌─────────┐              │
│  │  G9ED   │───▶│    ALSA         │───▶│ UM-ONE  │──── MIDI ───▶│
│  │ (Wine)  │    │   Sequencer     │    │         │              │
│  │         │◀───│                 │◀───│         │◀─── MIDI ────│
│  └─────────┘    └────────┬────────┘    └─────────┘              │
│                          │                                       │
│                     aseqdump                                     │
│                          │                                       │
│                          ▼                                       │
│                 /tmp/midi_traffic.log                            │
└──────────────────────────────────────────────────────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │   Zoom G9.2tt   │
                                              └─────────────────┘
```

## Requisito: Wine ALSA Sequencer

Para que la captura funcione, Wine debe usar ALSA Sequencer (no raw MIDI).

### Configurar Wine para ALSA Sequencer

```bash
# Crear archivo de registro
cat > /tmp/wine_midi_seq.reg << 'EOF'
Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\Software\Wine\Drivers]
"Audio"="alsa"

[HKEY_CURRENT_USER\Software\Wine\Midi]
"MidiDevice"="alsa"
EOF

# Aplicar registro
export WINEPREFIX=~/.wine32
box86 ~/wine-i386/wine-11.0-x86/bin/wine regedit /tmp/wine_midi_seq.reg
```

### Verificar que Wine usa ALSA

Con G9ED corriendo y conectado al UM-ONE:

```bash
aconnect -l
```

Debe mostrar:
```
client 128: 'WINE midi driver' [type=user,pid=XXXX]
    0 'WINE ALSA Output'
    Connecting To: 24:0
    1 'WINE ALSA Input'
    Connected From: 24:0
```

## Iniciar Captura

### 1. Verificar puertos MIDI

```bash
aconnect -l
```

Identificar:
- **UM-ONE**: client 24 (típicamente)
- **WINE midi driver**: client 128 (cuando G9ED está corriendo)

### 2. Iniciar aseqdump

```bash
# Capturar de Wine y UM-ONE
aseqdump -p 128:0,24:0 > /tmp/midi_traffic.log 2>&1 &

# Verificar que está corriendo
pgrep -a aseqdump
```

### 3. Operar G9ED

Realizar operaciones en G9ED:
- Cambiar patches
- Modificar parámetros
- Enviar/recibir datos

### 4. Ver captura

```bash
cat /tmp/midi_traffic.log
```

## Formato de Salida

```
Source  Event                  Ch  Data
128:0   System exclusive           F0 52 00 42 28 50 2A ... F7
24:0    System exclusive           F0 52 00 42 21 00 ... F7
```

- **128:0** = Desde G9ED (comandos al pedal)
- **24:0** = Desde UM-ONE (respuestas del pedal)

## Scripts de Captura

### midi_proxy.py

Proxy Python completo con logging detallado:

```python
#!/usr/bin/env python3
"""
MIDI Proxy - Captura bidireccional
"""
# Ver scripts/midi_proxy.py para implementación completa
```

### Comandos Útiles

```bash
# Limpiar log
echo "" > /tmp/midi_traffic.log

# Ver últimas entradas
tail -20 /tmp/midi_traffic.log

# Detener captura
pkill aseqdump

# Reiniciar captura
pkill aseqdump
aseqdump -p 128:0,24:0 > /tmp/midi_traffic.log 2>&1 &
```

## Análisis de Capturas

### Identificar tipo de mensaje

```bash
# Solo mensajes de G9ED al pedal
grep "128:0" /tmp/midi_traffic.log

# Solo respuestas del pedal
grep "24:0" /tmp/midi_traffic.log

# Buscar comando específico (ej: 0x28)
grep "F0 52 00 42 28" /tmp/midi_traffic.log
```

### Extraer datos SysEx

```bash
# Obtener solo los bytes de datos
cat /tmp/midi_traffic.log | grep "System exclusive" | awk '{for(i=5;i<=NF;i++) print $i}'
```

## Troubleshooting

### "No data captured"

1. Verificar que aseqdump está corriendo
2. Verificar que Wine usa ALSA sequencer
3. Verificar conexiones con `aconnect -l`

### "WINE midi driver not found"

Wine está usando raw MIDI. Aplicar el registro de configuración y reiniciar G9ED.

### Captura incompleta

Algunos mensajes SysEx muy largos pueden truncarse. Usar midi_proxy.py para captura completa.

## Capturas Guardadas

Las capturas importantes se guardan en `captures/` con formato:

```
captures/
├── 2026-01-24_parameter_change.log
├── 2026-01-24_patch_select.log
└── 2026-01-24_full_session.log
```

## Siguiente Paso

[04 - Análisis del Protocolo](../04-protocol-analysis/)
