# Phase 03: Complete Parameter Mapping

Mapeo completo de todos los módulos, tipos y parámetros del Zoom G9.2tt para completar la implementación web.

## Estructura

```
03-complete-mapping/
├── README.md                  # Este archivo
├── MAPPING_CHECKLIST.md       # Estado de mapeo y plan de trabajo
├── scripts/
│   ├── setup.sh               # Setup completo: XQuartz → SSH → MIDI → G9ED
│   └── capture.sh             # Captura MIDI bidireccional (G9ED ↔ pedal)
├── tools/
│   ├── decode_capture.py      # Decodifica capturas de aseqdump
│   └── parse_efx_xml.py       # Parsea G9ED.efx.xml → JSON + Markdown
├── reference/
│   ├── E_G92tt.pdf            # Manual oficial del pedal Zoom G9.2tt (inglés, 4MB)
│   ├── G9ED.efx.xml           # Definiciones originales del editor (fuente de verdad)
│   ├── efx_parsed.json        # XML parseado a JSON estructurado
│   └── efx_summary.md         # Resumen legible de todos los módulos/tipos/params
└── captures/
    ├── mapping_20260305_*.log  # Captura inicial (PreAmp A/B discovery)
    ├── dly_time_mapping.log    # DLY: 14-bit encoding descubierto
    ├── mod_mapping.log         # MOD: Z-MonoPitch params verificados
    ├── eq_cab_mapping.log      # EQ: 6 bandas + CAB: Depth/MicType/MicPos
    ├── expression_pedals.log   # Expression Pedals: Pedal1/2V/2H targets, switch, min/max
    └── total_footswitch_chain.log  # Total Level, Footswitch Fn1/Fn2, Effect Chain, BPM
```

## Uso

### Levantar entorno completo
```bash
cd scripts
./setup.sh                    # Verifica XQuartz, SSH, MIDI, Wine, lanza G9ED
```

### Capturar tráfico MIDI
```bash
cd scripts
./capture.sh nombre_sesion    # En otra terminal mientras G9ED corre
```

### Decodificar capturas
```bash
cd tools
python3 decode_capture.py ../captures/archivo.log         # Analizar
python3 decode_capture.py ../captures/archivo.log --diff   # Comparar patches
```

## Descubrimientos Clave

1. **Codificación 14-bit** para valores >127: `VALUE_LO | (VALUE_HI << 7)`
2. **Byte 61** del patch = selector A/B del PreAmp
3. **G9ED.efx.xml** contiene 120 tipos y 420 parámetros completos
4. **EQ** (EFFECT_ID=0x06): 6 bandas bipolares, params 0x02-0x07, rango 0-24 (display -12 a +12 dB)
5. **CAB** (EFFECT_ID=0x07): MicType (0-1), MicPos (0-2), Depth (0-2)
6. **EQ/CAB On/Off** se envía solo via Write/Preview (0x28), no como parameter change
7. **Expression Pedals** almacenados en patch bytes 75-128 (3 pedales × 4 targets), via Write/Preview
8. **ARRM RTM**: LFO interno con 8 wave types, target dinámico, max/min/sync
9. **Total Level** = EFFECT 0x00, PARAM 0x05 (rango 25-49, display 26-50)
10. **Footswitch Fn1/Fn2** = EFFECT 0x0B, PARAM 0x01/0x02 (18 opciones)
11. **BPM/Tempo** = EFFECT 0x0B, PARAM 0x00 (rango 0-250)
12. **Effect Chain** routing via Write/Preview (0x28)
