# Guía completa para implementar un editor web del Zoom G9.2TT

El Zoom G9.2TT puede controlarse mediante Web MIDI API replicando las funcionalidades del software oficial G9ED. La pedalera utiliza **MIDI DIN** (no USB-MIDI nativo), requiriendo un adaptador USB-MIDI. Toda la estructura de patches está documentada en un formato de texto parseable, y existen proyectos de ingeniería inversa que facilitan la implementación.

---

## El software G9ED: anatomía completa del editor oficial

El **G9.2tt Editor/Librarian (G9ED)** es el software oficial desarrollado por Zoom para Windows XP y Mac OS X 10.2-10.8. Permite transferir, editar y gestionar los **200 patches** del dispositivo mediante comunicación MIDI.

### Funcionalidades principales del G9ED

El software ofrece cuatro áreas funcionales diferenciadas:

**Edición de patches en tiempo real**: Los controles virtuales (knobs, botones) reflejan los 10 módulos de efectos. Cada cambio se transmite inmediatamente al G9.2TT cuando está en modo "Online", permitiendo escuchar las modificaciones al instante.

**Gestión de librería**: Interfaz tipo lista para los 100 patches de usuario. Permite renombrar, copiar, mover y organizar patches. Los 100 presets de fábrica aparecen en modo solo lectura.

**Transferencia bidireccional**: Bulk Dump para enviar/recibir todos los patches simultáneamente. También permite transferir patches individuales seleccionados.

**Import/Export de archivos**: Guarda librerías completas en formato `.xex` propietario. Incluye función de portapapeles con **formato de texto estructurado** para copiar/pegar patches entre usuarios.

### Estructura de la interfaz G9ED

| Sección | Función |
|---------|---------|
| Ventana Librarian | Lista de 100 patches con nombre y número |
| Editor Panel | Módulos con knobs virtuales para cada parámetro |
| Comment Editor | Campo de texto para descripción del patch |
| Status Bar | Indicador Online/Offline y estado de comunicación |
| Menú MIDI | Configuración de puertos MIDI IN/OUT |

---

## Arquitectura de efectos del G9.2TT: 10 módulos y 120 algoritmos

La cadena de señal del G9.2TT procesa **hasta 10 efectos simultáneos** con procesamiento de **32 bits a 96 kHz**. Incluye circuito de válvulas dual (2× 12AX7) que opera de forma analógica fuera de la cadena digital.

### Cadena de señal por defecto

```
INPUT → COMP → WAH/EFX1 → [EXT LOOP] → ZNR → PRE-AMP → EQ → CABINET → MOD/EFX2 → DELAY → REVERB → OUTPUT
```

El bloque PRE-AMP (desde EXT LOOP hasta CABINET) puede reubicarse después del DELAY mediante el parámetro "Chain".

### Módulo COMP: Compresores (3 tipos)

| Tipo | Parámetros | Rangos |
|------|------------|--------|
| **Compressor** | Sense, Attack, Level, Tone | 1-10, Fast/Slow, 0-100, 0-10 |
| **RackComp** | Threshold, Ratio, Attack, Level | 0-100, 1-∞, 1-10, 0-100 |
| **Limiter** | Threshold, Ratio, Release, Level | 0-100, 1-∞, 1-10, 0-100 |

### Módulo WAH/EFX1: Wah y filtros (~15 tipos)

Incluye efectos controlables por expresión: **AutoWah**, **PedalVox** (Vox), **PedalCryBaby** (Dunlop), **Phaser**, **Tremolo**, **RingMod**, **SlowAttack**, **Booster**, así como variantes "Z-" optimizadas para el Z-Pedal bidireccional.

Parámetro crítico: **Position** (Before/After) define si el efecto va antes o después del pre-amplificador.

### Módulo PRE-AMP: Modelado de amplificadores (~33 tipos)

Cada patch tiene **dos canales independientes (A/B)** con configuraciones separadas. Los modelos incluyen:

**Clean**: Fender Twin Reverb '65, Roland JC-120, HiWatt Custom 100, Matchless DC-30

**Crunch/Overdrive**: Fender Bassman, Vox AC30, Marshall Bluesbreaker, Fender '53 Tweed Deluxe, Mesa Boogie Mark I, Marshall JCM800

**High Gain**: Marshall JCM2000, Peavey 5150, Mesa Dual Rectifier (Orange/Vintage), Hughes & Kettner Triamp, Diezel Herbert

**Pedales modelados**: Ibanez TS808, Boss OD-1, Marshall Guv'nor, ProCo RAT, Boss Metal Zone, **Klon Centaur** (Silver/Gold), Dallas Arbiter Fuzz Face, Big Muff

Parámetros por canal: On/Off, Type, Gain (0-100), Level (0-100), Tone (0-100), Chain (Pre/Dir).

### Módulo EQ: Ecualizador de 6 bandas

| Banda | Frecuencia | Tipo | Rango |
|-------|------------|------|-------|
| 1 | 160 Hz | Shelving Low | ±12 dB |
| 2 | 400 Hz | Peaking | ±12 dB |
| 3 | 800 Hz | Peaking | ±12 dB |
| 4 | 3.2 kHz | Peaking | ±12 dB |
| 5 | 6.4 kHz | Peaking | ±12 dB |
| 6 | 12 kHz | Shelving High | ±12 dB |

Configuración **separada para Canal A y Canal B**.

### Módulo MOD/EFX2: Modulación (~25 tipos)

**Chorus**: Standard, Ensemble 3D, VintageCE, BendChorus, StereoCho

**Flanger**: Standard, DynamicFlang

**Pitch**: PitchShifter (±24 semitonos), HarmonicPitchShift (escalas), MonoPitch, Detune, Vibrato, Octave

**Delays especiales**: ModDelay, TapeEcho (hasta 2000ms), AnalogDelay, ReverseDelay, DynamicDelay

**Filtros**: StepFilter, SeqFilter, CombFilter, AirFilter

### Módulo DELAY principal (5 tipos)

| Tipo | Tiempo máximo | Características |
|------|---------------|-----------------|
| **Delay** | 5000 ms | Delay estándar digital |
| **PingPongDly** | 2500 ms | Rebote estéreo L/R |
| **MultiTapDly** | 2700 ms | Patrones rítmicos |
| **ReverseDly** | 2500 ms | Reproducción invertida |
| **AnalogDly** | 2000 ms | Emulación bucket-brigade |

Funciones especiales: **Hold Delay** (loop infinito), **Delay Mute**, **Tempo Sync** con subdivisiones musicales.

### Módulo REVERB (7 tipos + especiales)

Tipos principales: **Hall**, **Room**, **Spring**, **Plate**, **ModernSpring**, **Arena**, **TiledRoom**

Efectos adicionales: PanDelay, MultiTap, EarlyRef, GatedRev, **Z-HoldRev** (hold controlado por Z-Pedal).

Parámetros: Decay, PreDelay, Tone, Mix (0-100 cada uno).

---

## Estructura de datos: organización de patches y parámetros

### Organización de memoria

| Categoría | Cantidad | Acceso |
|-----------|----------|--------|
| **Patches de usuario** | 100 (5 grupos × 20 bancos) | Lectura/Escritura |
| **Patches preset** | 100 (5 grupos × 20 bancos) | Solo lectura |
| **Total** | 200 patches | |

Estructura jerárquica: **4 grupos** (U, u = usuario; A, b = preset) → **10 bancos** (0-9) → **5 patches por banco**.

### Formato de patch G9EDpatch (texto estructurado)

Este formato es **crítico para la implementación web** ya que permite import/export mediante portapapeles:

```
G9EDpatch {
  Name { PATCH_NAME }
  Comment { // Descripción opcional }
  PatchLevel { 0-100 }
  Tempo { 40-250 }
  PedalFunction { func1, func2 }
  AmpSel { A | B }
  AmpA { on|off, TipoAmp, Gain, Level, Tone, Pre|Dir }
  AmpB { on|off, TipoAmp, Gain, Level, Tone, Pre|Dir }
  EQ_A { on|off, 160Hz, 400Hz, 800Hz, 3.2kHz, 6.4kHz, 12kHz }
  EQ_B { on|off, valores... }
  ZnrA { on|off, Tipo, Threshold }
  ZnrB { on|off, Tipo, Threshold }
  Ext { on|off, SendLevel, ReturnLevel, DryLevel }
  Comp { on|off, Tipo, param1-4 }
  Wah { on|off, Tipo, Position, param1-4 }
  Cabi { on|off, Size, Position, MicType }
  Mod { on|off, Tipo, param1-4 }
  Del { on|off, Tipo, Time, Feedback, HiDamp, Mix }
  Rev { on|off, Tipo, Decay, PreDelay, Tone, Mix }
  Arrm { Wave, Target, Min, Max, Rate }
  Pedal1 { 1(target,min,max,switch) 2(...) 3(...) 4(...) }
  Pedal2V { 1(target,min,max,switch) 2(...) 3(...) 4(...) }
  Pedal2H { 1(target,min,max) 2(...) 3(...) 4(...) }
}
```

### Control de expresión: pedales asignables

**Pedal 1 (izquierdo)**: Movimiento vertical, 4 targets asignables con valores min/max y switch de módulo.

**Z-Pedal (derecho)**: Movimiento **bidireccional** (vertical + horizontal). Vertical: 4 targets con switch. Horizontal: 4 targets adicionales sin switch.

**ARRM (Auto-Repeat Real-time Modulation)**: LFO interno con formas de onda (Triangle, Square, Saw Up/Down, Random) para modulación cíclica automática de cualquier parámetro.

---

## Especificaciones MIDI para Web MIDI API

### Identificación del dispositivo

**Manufacturer ID de Zoom**: `0x52` (82 decimal)

**Identity Request**:
```
Solicitud:  F0 7E 7F 06 01 F7
Respuesta:  F0 7E [ch] 06 02 52 [product_id] [version...] F7
```

### Control Change por defecto

| CC# | Función | Valores |
|-----|---------|---------|
| 7 | Pedal 1 (Expression) | 0-127 |
| 11 | Pedal 2 Vertical | 0-127 |
| 12 | Pedal 2 Horizontal | 0-127 |
| 64 | COMP On/Off | 0-63=Off, 64-127=On |
| 65 | WAH/EFX1 On/Off | 0-63=Off, 64-127=On |
| 66 | EXT LOOP On/Off | 0-63=Off, 64-127=On |
| 67 | ZNR On/Off | 0-63=Off, 64-127=On |
| 68 | PRE-AMP On/Off | 0-63=Off, 64-127=On |
| 69 | EQ On/Off | 0-63=Off, 64-127=On |
| 70 | MOD/EFX2 On/Off | 0-63=Off, 64-127=On |
| 71 | DELAY On/Off | 0-63=Off, 64-127=On |
| 72 | REVERB On/Off | 0-63=Off, 64-127=On |
| 73 | MUTE On/Off | 0-63=Off, 64-127=On |
| 74 | BYPASS On/Off | 0-63=Off, 64-127=On |
| 75 | Canal A/B Switch | 0-63=A, 64-127=B |

### Program Change

**Direct Mode**: Bank Select (MSB 0=User, 1=Preset; LSB 0) + Program Change 0-99

**Mapping Mode**: Program Change 0-127 con tabla configurable de 128 patches

### Estructura SysEx de Zoom

```
F0 52 [channel] [device_id] [command] [data...] F7
```

Comandos documentados de pedales Zoom similares (referencia del proyecto zoom-zt2):
- Editor Mode ON: `F0 52 00 6e 50 F7`
- Editor Mode OFF: `F0 52 00 6e 51 F7`
- Request Current Patch: `F0 52 00 6e 29 F7`

**Nota importante**: El G9.2TT puede usar comandos ligeramente diferentes. Requiere pruebas de ingeniería inversa o análisis con MIDI monitor.

---

## Recursos de la comunidad y proyectos de código abierto

### Proyectos GitHub relevantes

**sbiickert/g9.2-control** — Trabajo de reverse engineering específico para G9.2TT en Objective-C. Incluye modelo de datos Core Data y análisis parcial de comunicación MIDI. Proyecto más relevante para entender la estructura.

**RedFerret61/G9RPG** — Generador de patches aleatorios en Java. Incluye conversión entre G9.2TT ↔ G7.1ut ↔ B9.1ut y documentación extensa del formato de texto.

**mungewell/zoom-zt2** — Documentación MIDI más completa disponible para pedales Zoom (G1Four, G3n, MS series). Scripts Python para decodificar patches y efectos. Aunque no es específico del G9.2TT, el protocolo SysEx de Zoom comparte estructura base.

### Comunidades activas

**Google Groups "zoom-g92tt-patch-bank"**: Principal comunidad de usuarios, intercambio de patches y troubleshooting técnico.

**GuitarPatches.com**: Biblioteca de patches creados por usuarios en formato G9EDpatch compatible con import/export.

---

## Recomendaciones para implementación Web MIDI

### Stack tecnológico sugerido

- **MIDI**: WEBMIDI.js v3.0 para abstracción del Web MIDI API con soporte SysEx
- **Parser**: Implementar parser del formato G9EDpatch (texto estructurado con llaves)
- **UI**: Componentes knob customizados (input range circular)
- **Almacenamiento**: IndexedDB para librería local de patches

### Funcionalidades a implementar por prioridad

1. **Conexión básica**: Detección del dispositivo, Identity Request, verificación Manufacturer ID 0x52
2. **Control en tiempo real**: Program Change para selección de patches, Control Change para módulos on/off
3. **Editor visual**: Interfaz con los 10 módulos y sus parámetros editables
4. **Import/Export**: Parser bidireccional del formato G9EDpatch para portapapeles
5. **Bulk Dump**: Transferencia completa de librería (100 patches) via SysEx

### Limitación crítica

El G9.2TT utiliza **conectores MIDI DIN tradicionales**, no USB-MIDI clase. Se requiere un adaptador USB-MIDI externo (como M-Audio UNO) para que Web MIDI API pueda comunicarse con el dispositivo. El puerto USB del G9.2TT es exclusivamente para audio (driver ASIO).

---

## Conclusión

El Zoom G9.2TT tiene una arquitectura bien documentada gracias al formato de texto del G9ED y proyectos de ingeniería inversa existentes. La implementación web es factible utilizando Web MIDI API con WEBMIDI.js. Los **120 tipos de efectos** distribuidos en **10 módulos** con **200 patches** organizados jerárquicamente pueden replicarse completamente. El formato G9EDpatch permite interoperabilidad con el software original y la comunidad de usuarios existente, garantizando compatibilidad con las librerías de patches compartidas en GuitarPatches.com.