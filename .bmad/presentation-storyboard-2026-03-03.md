# Presentation Storyboard — "Lo que se puede medir, se puede controlar"

**Created:** 2026-03-03
**Visual Designer:** Caravaggio (Presentation Master)
**Author:** enruana
**Format:** Excalidraw frame-based presentation (sketch style)
**Duration:** ~1 hora | 30 slides

---

## VISUAL DESIGN SYSTEM

### Concept: "Pedalboard Stage"
La presentación se siente como si estuvieras mirando el panel de un pedalboard profesional en un escenario oscuro. Negro profundo, acentos metálicos, LEDs que indican estado, y la información aparece como si fuera la pantalla del pedal iluminándose.

### Color Palette

#### Fondos
| Token | Color | Uso |
|-------|-------|-----|
| `bg-void` | `#030712` | Fondo principal de todas las slides |
| `bg-surface` | `#111827` | Cajas, contenedores, bloques de código |
| `bg-elevated` | `#1f2937` | Cards elevados, bloques destacados |
| `bg-metal` | `linear-gradient(180deg, #475569 0%, #1a1a2e 100%)` | Superficies "metálicas" tipo pedal |

#### Texto
| Token | Color | Uso |
|-------|-------|-----|
| `text-primary` | `#f3f4f6` | Títulos principales, texto de alto contraste |
| `text-secondary` | `#9ca3af` | Subtítulos, descripciones, notas |
| `text-muted` | `#6b7280` | Labels, metadata, texto de bajo contraste |
| `text-bright` | `#ffffff` | Texto máximo impacto (frases clave) |

#### Acentos LED (los protagonistas del color)
| Token | Color | Uso | Inspiración |
|-------|-------|-----|-------------|
| `led-blue` | `#3b82f6` | Acento primario, progreso, "poder" | AMP module LED |
| `led-purple` | `#a855f7` | Acento secundario, IA, "amplificación" | MOD module |
| `led-green` | `#22c55e` | Éxito, confirmación, "funciona" | COMP LED |
| `led-red` | `#ef4444` | Error, obstáculo, "peligro" | WAH LED |
| `led-cyan` | `#22d3ee` | Datos, protocolo, "información" | EQ module |
| `led-amber` | `#fbbf24` | Warning, pausa, "atención" | ZNR LED |
| `led-pink` | `#ec4899` | Highlight especial, momento emocional | REV module |
| `led-teal` | `#2dd4bf` | Cloud, sync, conexión | DLY module |

#### Glow Effects
Todos los colores LED tienen un glow asociado:
```
box-shadow: 0 0 10px {color}, 0 0 25px {color}44, 0 0 50px {color}22
```
Esto simula el halo real de un LED en una superficie oscura.

#### Gradientes Clave
| Nombre | Gradiente | Uso |
|--------|-----------|-----|
| `gradient-hero` | `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)` | Slides de impacto (apertura, cierre) |
| `gradient-blue-purple` | `linear-gradient(90deg, #3b82f6, #a855f7)` | Barras de progreso, transiciones, "IA en acción" |
| `gradient-metal` | `linear-gradient(180deg, #6b7280 0%, #374151 50%, #1f2937 100%)` | Superficies de pedal, hardware |
| `gradient-success` | `linear-gradient(90deg, #22c55e, #2dd4bf)` | Momentos de éxito, breakthrough |

### Typography Concept (Excalidraw)

| Nivel | Estilo | Tamaño Relativo | Uso |
|-------|--------|-----------------|-----|
| H1 | Excalidraw hand-drawn, BOLD | Extra Large | Títulos de acto, frases de impacto |
| H2 | Excalidraw hand-drawn, bold | Large | Títulos de slide, conceptos clave |
| Body | Excalidraw hand-drawn, normal | Medium | Texto explicativo, labels |
| Code | Monospace (Excalidraw code block) | Medium | Pseudo-código, hex data, terminal |
| Micro | Excalidraw hand-drawn, small | Small | Anotaciones, notas al pie |

### Visual Elements Vocabulary

#### Connectors
- **Flechas normales**: Línea sketch con punta → (flujo lógico)
- **Flechas energizadas**: Línea con glow LED (flujo con poder/IA)
- **Flechas rotas**: Línea punteada con ❌ (camino fallido)

#### Containers
- **Caja hardware**: Bordes redondeados, gradiente metal, sombra interna → representa hardware/pedal
- **Caja software**: Bordes rectos, bg-surface, borde fino led-blue → representa código/app
- **Caja IA**: Bordes redondeados, borde gradient blue-purple con glow → representa intervención IA
- **Caja error**: Bordes rectos, borde led-red con glow rojo → representa problema/obstáculo

#### Icons/Symbols
- **LED encendido**: Círculo pequeño con relleno de color + glow (módulo activo/éxito)
- **LED apagado**: Círculo pequeño gris `#374151` (módulo inactivo/pendiente)
- **Knob**: Círculo con indicador de posición (tipo G9.2tt) — para mostrar "parámetros"
- **Terminal**: Rectángulo negro con esquinas redondeadas, texto monospace verde/cyan

### Layout Grid

Todas las slides siguen una de estas 5 plantillas:

#### Template A: "Statement" (Frase de impacto)
```
┌─────────────────────────────────┐
│                                 │
│                                 │
│         FRASE GRANDE            │
│         centrada                │
│                                 │
│        [subtexto menor]         │
│                                 │
└─────────────────────────────────┘
```
Uso: Slides 2, 4, 6, 22, 26, 27, 30

#### Template B: "Diagram" (Diagrama principal)
```
┌─────────────────────────────────┐
│  Título                         │
│  ─────                          │
│                                 │
│    ┌───┐    ┌───┐    ┌───┐     │
│    │   │ →  │   │ →  │   │     │
│    └───┘    └───┘    └───┘     │
│                                 │
│  [nota/caption al pie]          │
└─────────────────────────────────┘
```
Uso: Slides 3, 7, 9, 14, 19, 20, 24

#### Template C: "Visual + Text" (Imagen con texto lateral)
```
┌─────────────────────────────────┐
│  Título                         │
│  ─────                          │
│  ┌──────────┐                   │
│  │          │  Texto            │
│  │  Visual  │  explicativo      │
│  │          │  al lado          │
│  └──────────┘                   │
└─────────────────────────────────┘
```
Uso: Slides 1, 5, 8, 15, 16, 29

#### Template D: "List/Table" (Listado estructurado)
```
┌─────────────────────────────────┐
│  Título                         │
│  ─────                          │
│  ● Item 1          [ícono]      │
│  ● Item 2          [ícono]      │
│  ● Item 3          [ícono]      │
│  ● Item 4          [ícono]      │
│                                 │
└─────────────────────────────────┘
```
Uso: Slides 10, 12, 18, 23, 28

#### Template E: "Split/Contrast" (Dos columnas contrastando)
```
┌────────────────┬────────────────┐
│                │                │
│   LADO A       │   LADO B       │
│   (antes/      │   (después/    │
│    problema)   │    solución)   │
│                │                │
└────────────────┴────────────────┘
```
Uso: Slides 13, 14, 24, 27

---

## STORYBOARD DETALLADO — 30 SLIDES

---

### APERTURA — "El Problema" (5 min)

---

#### SLIDE 1 — "El Pedal"
**Template:** C (Visual + Text)
**Timing:** 1 min

**Layout:**
```
┌─────────────────────────────────────────┐
│  bg: gradient-hero                      │
│                                         │
│  ┌───────────────┐                      │
│  │               │   ZOOM G9.2tt        │
│  │   [Foto/      │   Twin Tube Guitar   │
│  │    sketch     │   Effects Console    │
│  │    del pedal] │                      │
│  │               │   ● 120 efectos      │
│  │               │   ● 100 patches      │
│  └───────────────┘   ● Tubos de vacío   │
│                      ● 2007             │
│                                         │
│         LED verde ● encendido           │
└─────────────────────────────────────────┘
```
**Colores:** Fondo gradient-hero. Foto/sketch del pedal con borde gradient-metal. Texto text-primary. Bullets con LED verde. Año "2007" en text-muted.

**Nota visual:** El pedal se presenta como algo premium — respeto por el hardware. No es chatarra, es una máquina seria.

---

#### SLIDE 2 — "El Software Muerto"
**Template:** A (Statement)
**Timing:** 45 seg

**Layout:**
```
┌─────────────────────────────────────────┐
│  bg: bg-void                            │
│                                         │
│                                         │
│     "El único software que lo           │
│      controla solo corre en             │
│      Windows XP."                       │
│                                         │
│      ● LED rojo parpadeante ●           │
│                                         │
│     [Captura pixelada del G9ED          │
│      con overlay de "OBSOLETO"]         │
│                                         │
└─────────────────────────────────────────┘
```
**Colores:** Fondo bg-void. Texto text-bright en H1. Captura del G9ED con overlay semi-transparente rojo (`#ef444480`). LED rojo con glow. "OBSOLETO" en led-red con glow.

---

#### SLIDE 3 — "La Locura" ★ DIAGRAMA CLAVE
**Template:** B (Diagram)
**Timing:** 1.5 min

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  bg: bg-void                                     │
│  "El workaround"  (text-muted, small)            │
│                                                  │
│  ┌─────────┐      ┌─────────────┐      ┌──────┐ │
│  │ 💻      │ SSH  │ 🍓          │ Win  │ G9ED │ │
│  │ MacBook │ ───→ │ Raspberry   │ ───→ │ .exe │ │
│  │  (macOS)│      │ Pi          │      │      │ │
│  └─────────┘      └─────────────┘      └──────┘ │
│   metal-box        metal-box           error-box │
│                                                  │
│        ↓ cable MIDI DIN (línea temblorosa)       │
│                                                  │
│  ┌──────────────────────────────────────┐        │
│  │  🎸 Zoom G9.2tt                     │        │
│  │  [sketch del pedal, pequeño]         │        │
│  └──────────────────────────────────────┘        │
│   hardware-box con gradient-metal                │
│                                                  │
│  Labels: "Lento" "Frágil" "Tedioso"             │
│  (text-muted, scattered, con led-amber)          │
└──────────────────────────────────────────────────┘
```
**Colores:**
- MacBook: caja gradient-metal, borde led-blue
- Raspberry Pi: caja gradient-metal, borde led-green
- G9ED: caja bg-surface, borde led-red (error-box) — el punto problemático
- Pedal: caja gradient-metal grande con LED verde
- Flechas: líneas sketch temblorosas (no rectas — transmiten fragilidad)
- Labels "Lento", "Frágil", "Tedioso": text led-amber, dispersas como post-its

**Animación sugerida:** Los frames de Excalidraw pueden revelar cada caja secuencialmente — primero MacBook, luego flecha, luego Raspberry Pi, luego flecha, luego G9ED. Buildup de la complejidad absurda.

---

#### SLIDE 4 — "La Decisión"
**Template:** A (Statement)
**Timing:** 45 seg

**Layout:**
```
┌─────────────────────────────────────────┐
│  bg: bg-void                            │
│                                         │
│                                         │
│                                         │
│     "¿Y si lo construyo                 │
│          yo mismo?"                     │
│                                         │
│                                         │
│      ● LED blue, pulsando ●            │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```
**Colores:** Fondo bg-void puro. Texto text-bright, H1 grande. Un solo LED azul pulsando en el centro inferior — como un indicador de "encendido". Glow azul sutil.

**Nota visual:** Máximo espacio vacío. La pregunta flota sola. El LED sugiere que algo se acaba de activar.

---

### ACTO I — "Lo que se puede medir" (15 min)

---

#### SLIDE 5 — "El Muro"
**Template:** C (Visual + Text)
**Timing:** 1.5 min

**Layout:**
```
┌─────────────────────────────────────────┐
│  bg: bg-void                            │
│  "El Protocolo"  (led-cyan, H2)         │
│                                         │
│  ┌──────────────────────────────┐       │
│  │  F0 52 00 42 21 00 00       │       │
│  │  45 0A 03 08 00 04 05 0F    │       │
│  │  00 00 00 00 09 00 00 01    │       │
│  │  ...                        │       │
│  │  F7                         │       │
│  └──────────────────────────────┘       │
│   terminal-box (código hex real)        │
│                                         │
│  ● Propietario                          │
│  ● Sin documentación                    │
│  ● MIDI SysEx cerrado                   │
│  ● Nunca había usado MIDI               │
│                                         │
│  Bullets con LED rojo ●                 │
└─────────────────────────────────────────┘
```
**Colores:** Terminal box con bg-surface, borde led-cyan, texto monospace en led-cyan (`#22d3ee`). Bullets con LED rojo. Título en led-cyan.

---

#### SLIDE 6 — "El Principio" ★ FRASE CENTRAL
**Template:** A (Statement)
**Timing:** 1 min

**Layout:**
```
┌─────────────────────────────────────────┐
│  bg: gradient-hero                      │
│                                         │
│                                         │
│   "Lo que se puede medir,              │
│    se puede controlar."                 │
│                                         │
│   ─── gradient-blue-purple line ───     │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```
**Colores:** Fondo gradient-hero. Texto text-bright H1. Línea divisoria con gradient-blue-purple y glow. Nada más. Espacio. Respiración.

**Nota visual:** Esta es LA frase de la charla. Máximo impacto. Mínimo ruido.

---

#### SLIDE 7 — "La Captura"
**Template:** B (Diagram)
**Timing:** 1.5 min

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  bg: bg-void                                     │
│  "Sistema de Captura"  (text-primary, H2)        │
│                                                  │
│  ┌──────┐    ┌─────────┐    ┌──────────┐        │
│  │ 🎸   │    │  USB    │    │  🍓     │        │
│  │ G9.2 │ ══>│  MIDI   │ ══>│  Capture │        │
│  │  tt  │    │Interface│    │  Script  │        │
│  └──────┘    └─────────┘    └──────────┘        │
│  hardware     hardware       software            │
│                                    ↓             │
│                              ┌──────────┐        │
│                              │ 📄       │        │
│                              │ Archivos │        │
│                              │ .syx     │        │
│                              └──────────┘        │
│                              data-box            │
│                                                  │
│  Cable MIDI DIN ══  (doble línea, led-amber)     │
│  Cable USB ──  (línea simple, led-blue)          │
└──────────────────────────────────────────────────┘
```
**Colores:**
- Pedal: gradient-metal, LED verde encendido
- USB-MIDI Interface: gradient-metal, borde led-amber
- Capture Script: bg-surface, borde led-blue (es software)
- Archivos: bg-elevated, borde led-cyan
- Cables MIDI: doble línea led-amber con glow sutil
- Cables USB: línea simple led-blue

---

#### SLIDE 8 — "Los Datos Crudos"
**Template:** C (Visual + Text)
**Timing:** 1 min

**Layout:**
```
┌─────────────────────────────────────────┐
│  bg: bg-void                            │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  $ python capture_session.py    │    │
│  │                                 │    │
│  │  [RX] F0 52 00 42 21 00 00     │    │
│  │  45 0A 03 08 00 04 05 0F 00    │    │
│  │  00 00 00 09 00 00 01 05 00    │    │
│  │  00 0E 00 07 02 0B 0A 00 00   │    │
│  │  ...268 bytes...                │    │
│  │  4C F7                          │    │
│  │                                 │    │
│  │  [RX] F0 52 00 42 21 01 00     │    │
│  │  ...                            │    │
│  └─────────────────────────────────┘    │
│   full-width terminal, led-cyan text    │
│                                         │
│  "No necesitan entender esto."          │
│  (text-muted, italic)                   │
│                                         │
│  Header bytes resaltados:               │
│  F0 = led-green (inicio)                │
│  52 = led-blue (Zoom)                   │
│  42 = led-purple (G9.2tt)               │
│  F7 = led-red (fin)                     │
└─────────────────────────────────────────┘
```
**Colores:** Terminal full-width. Datos en led-cyan monospace. Bytes clave resaltados con colores LED distintos y glow sutil. Caption en text-muted.

**Nota visual:** La pantalla llena de hex transmite complejidad visceralmente. Los bytes coloreados son el único orden visible en el caos.

---

#### SLIDE 9 — "El Análisis con IA" ★ DIAGRAMA CLAVE
**Template:** B (Diagram)
**Timing:** 2 min

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  bg: bg-void                                     │
│  "Análisis de Protocolo"  (text-primary, H2)     │
│                                                  │
│  ┌──────────────┐         ┌──────────────┐       │
│  │  Datos hex   │  ─────> │  Claude Code │       │
│  │  capturados  │         │              │       │
│  │  (raw bytes) │         │  + Contexto  │       │
│  └──────────────┘         │    humano    │       │
│   terminal-box            └──────┬───────┘       │
│                            ia-box │               │
│                                   ↓               │
│              ┌────────────────────────────┐       │
│              │  Patrones Descubiertos:    │       │
│              │                            │       │
│              │  ● Nibble encoding         │       │
│              │  ● 7-bit encoding          │       │
│              │  ● 128 bytes por patch     │       │
│              │  ● Header: F0 52 00 42     │       │
│              │  ● 6 comandos SysEx        │       │
│              └────────────────────────────┘       │
│               result-box (borde gradient-success) │
│                                                   │
│  "Yo daba contexto. La IA encontraba patrones."  │
│  (text-secondary, center)                         │
└──────────────────────────────────────────────────┘
```
**Colores:**
- Datos hex: terminal-box, borde led-cyan
- Claude Code: ia-box con borde gradient-blue-purple y glow
- Resultados: bg-elevated, borde gradient-success
- Bullets con LED verde
- Caption en text-secondary

---

#### SLIDE 10 — "El Protocolo Descifrado"
**Template:** D (List/Table)
**Timing:** 1.5 min

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  bg: bg-void                                    │
│  "Protocolo SysEx Completo"  (led-cyan, H2)     │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │  CMD    │  Nombre           │  Función   │   │
│  │─────────│───────────────────│────────────│   │
│  │  0x11   │  Identity Request │  ¿Quién?   │   │
│  │  0x12   │  Enter Edit       │  Modo edit │   │
│  │  0x21   │  Read Patch       │  Dame patch│   │
│  │  0x28   │  Write Patch      │  Guarda    │   │
│  │  0x31   │  Param Change     │  Tiempo    │   │
│  │         │                   │  real      │   │
│  │  0x1F   │  Exit Edit        │  Salir     │   │
│  └──────────────────────────────────────────┘   │
│   table with bg-surface rows, led-cyan headers   │
│                                                 │
│  ● LED verde: cada comando = "descifrado"       │
│                                                 │
│  "Un protocolo que no existía en internet        │
│   ahora tenía especificación completa."          │
│  (text-secondary)                                │
└─────────────────────────────────────────────────┘
```
**Colores:** Tabla con header led-cyan sobre bg-elevated. Filas alternando bg-surface/bg-void. Código hex en monospace led-cyan. LED verde al lado de cada fila = "descifrado". Caption en text-secondary.

---

#### SLIDE 11 — "Pero Faltaba Algo"
**Template:** C (Visual + Text)
**Timing:** 45 seg

**Layout:**
```
┌─────────────────────────────────────────┐
│  bg: bg-void                            │
│                                         │
│  ┌───────────────────────────────┐      │
│  │                               │      │
│  │  [PATCH DATA]  +  [???]       │      │
│  │   ✅ decoded      ❓ unknown  │      │
│  │                               │      │
│  └───────────────────────────────┘      │
│                                         │
│   "Para ESCRIBIR patches                │
│    necesitábamos el checksum.            │
│                                         │
│    Sin él, el pedal rechaza             │
│    silenciosamente."                     │
│                                         │
│    ● LED amber parpadeante ●            │
└─────────────────────────────────────────┘
```
**Colores:** Bloque de patch data en led-green (decodificado). Bloque ??? en led-amber con glow pulsante. Texto text-primary. LED amber parpadeante.

---

### ACTO II — "El Momento que Cambió Todo" (15 min)

---

#### SLIDE 12 — "El Muro del Checksum"
**Template:** D (List/Table)
**Timing:** 1.5 min

**Layout:**
```
┌─────────────────────────────────────────┐
│  bg: bg-void                            │
│  "Intentamos todo"  (led-red, H2)       │
│                                         │
│  ┌────────────────────────┐             │
│  │  Datos capturados      │             │
│  └───────────┬────────────┘             │
│              ↓                          │
│  CRC-16          ──→  ❌                │
│  CRC-32 estándar ──→  ❌                │
│  XOR             ──→  ❌                │
│  Suma simple     ──→  ❌                │
│  Fletcher        ──→  ❌                │
│  CRC-32 custom   ──→  ❌                │
│                                         │
│  Cada ❌ es un LED rojo                 │
│                                         │
│  "Prácticamente imposible               │
│   encontrarlo así."                     │
│  (text-muted)                           │
└─────────────────────────────────────────┘
```
**Colores:** Título en led-red. Cada algoritmo en text-primary. Cada ❌ es un LED rojo con glow. Flechas en text-muted. La lista se siente como una pared de fracasos. Caption en text-muted.

---

#### SLIDE 13 — "La Sugerencia Inesperada"
**Template:** E (Split) modificado — chat style
**Timing:** 2 min

**Layout:**
```
┌─────────────────────────────────────────┐
│  bg: bg-void                            │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  ia-box (gradient-blue-purple)  │    │
│  │                                 │    │
│  │  Claude Code:                   │    │
│  │                                 │    │
│  │  "El G9ED está construido       │    │
│  │   en .NET. Podemos hacer        │    │
│  │   decompilación del ejecutable  │    │
│  │   para encontrar el algoritmo   │    │
│  │   directamente en el código     │    │
│  │   fuente."                      │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│         ┌─────────┐                     │
│         │  .exe   │ ← flecha desde      │
│         │  .NET   │   la sugerencia     │
│         └─────────┘                     │
│          file-icon con glow purple      │
│                                         │
│  "Yo no sabía que eso era posible."     │
│  (text-bright, italic)                  │
└─────────────────────────────────────────┘
```
**Colores:** Caja de mensaje IA con borde gradient-blue-purple y glow. Texto dentro en text-primary. Archivo .exe con ícono gradient-metal y glow led-purple. Frase final en text-bright italic.

---

#### SLIDE 14 — "El Contraste" ★ SLIDE MÁS IMPORTANTE
**Template:** E (Split/Contrast)
**Timing:** 2.5 min

**Layout:**
```
┌────────────────────┬─────────────────────┐
│                    │                     │
│  CAMINO A          │  CAMINO B           │
│  (bg tinted red)   │  (bg tinted green)  │
│                    │                     │
│  Datos capturados  │  Claude Code        │
│       ↓            │  sugiere decompile  │
│  Análisis manual   │       ↓             │
│       ↓            │  .exe .NET          │
│  Prueba y error    │       ↓             │
│       ↓            │  Código fuente      │
│                    │       ↓             │
│    ❌ IMPOSIBLE    │  CRC-32 encontrado  │
│   (LED rojo BIG)   │       ↓             │
│                    │     ✅ FUNCIONA     │
│                    │   (LED verde BIG)   │
│                    │                     │
└────────────────────┴─────────────────────┘
│  "Ni yo solo, ni la IA sola.            │
│   Fue la combinación."                   │
│  (text-bright, centered, H2)             │
└──────────────────────────────────────────┘
```
**Colores:**
- Lado A: fondo `#ef444410` (red tint muy sutil). Texto text-primary. LED rojo grande al final con glow fuerte
- Lado B: fondo `#22c55e10` (green tint muy sutil). Texto text-primary. LED verde grande al final con glow fuerte
- Línea divisoria vertical: gradient-blue-purple
- Frase inferior: text-bright, centrada, con gradient-blue-purple underline

**Animación sugerida:** Frame 1: Solo camino A visible. Frame 2: Camino B aparece. Frame 3: Frase de cierre. El contraste se construye visualmente.

**Nota visual:** ESTA ES LA SLIDE QUE SE QUEDA EN LA MEMORIA. El contraste rojo/verde, imposible/funciona, es visceral. El glow de los LEDs grandes ancla la atención.

---

#### SLIDE 15 — "El CRC-32"
**Template:** C (Visual + Text)
**Timing:** 1.5 min

**Layout:**
```
┌─────────────────────────────────────────┐
│  bg: bg-void                            │
│  "El Algoritmo"  (led-cyan, H2)         │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  crc = 0xFFFFFFFF               │    │
│  │  for byte in patch[0..128]:     │    │
│  │      crc = crc ^ byte           │    │
│  │      for bit in 0..8:           │    │
│  │          if crc & 1:            │    │
│  │              crc = (crc >> 1)   │    │
│  │                ^ 0xEDB88320     │    │
│  │          else:                  │    │
│  │              crc = crc >> 1     │    │
│  │  checksum = crc ^ 0xFFFFFFFF   │    │
│  └─────────────────────────────────┘    │
│   terminal-box con glow led-cyan        │
│                                         │
│  "Estaba dentro del .exe de 2007."      │
│  (text-secondary)                       │
│                                         │
│  Polinomio: 0xEDB88320 (led-purple)     │
│  Input: 128 bytes crudos (led-green)    │
└─────────────────────────────────────────┘
```
**Colores:** Terminal box con glow led-cyan. Keywords del código en led-purple. Valores hex en led-green. Caption text-secondary.

---

#### SLIDE 16 — "El Momento Eureka" ★ MOMENTO EMOCIONAL
**Template:** C (Visual + Text)
**Timing:** 1.5 min

**Layout:**
```
┌─────────────────────────────────────────┐
│  bg: bg-void                            │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  $ python write_patch.py        │    │
│  │                                 │    │
│  │  Writing 'Heavy Metal'          │    │
│  │  to slot U05...                 │    │
│  │                                 │    │
│  │  Encoding: 128 → 147 bytes     │    │
│  │  Checksum: 0x3A7F1BC2  ✅      │    │
│  │  Sending SysEx...       ✅      │    │
│  │  Device confirmed.      ✅      │    │
│  │                                 │    │
│  │  Patch written successfully.    │    │
│  └─────────────────────────────────┘    │
│   terminal-box                          │
│                                         │
│  ┌───────────────────┐                  │
│  │  [G9.2tt display] │                  │
│  │   U05 Heavy Metal │  ← LED verde    │
│  └───────────────────┘     BIG glow     │
│   hardware-box, gradient-metal          │
│                                         │
│  "Lo que se puede medir,               │
│   se puede controlar."                  │
│  (text-bright, gradient-blue-purple)    │
└─────────────────────────────────────────┘
```
**Colores:** Terminal con ✅ en led-green con glow. Display del pedal como hardware-box con gradient-metal, texto del display en led-green brillante. La frase final regresa con gradient-blue-purple.

**Nota visual:** Este es el payoff del Acto I+II. El LED verde brillando fuerte en la pantalla del pedal es la recompensa visual.

---

### ACTO III — "De Script a Plataforma" (12 min)

---

#### SLIDE 17 — "La Pregunta Siguiente"
**Template:** E (Split) simplificado
**Timing:** 1 min

**Layout:**
```
┌────────────────────┬─────────────────────┐
│                    │                     │
│  ┌──────────────┐  │                     │
│  │  $ python    │  │       ?             │
│  │  Terminal    │  │                     │
│  │  script      │  │    [silueta de      │
│  └──────────────┘  │     app web]        │
│                    │                     │
│  "Para mí"         │  "Para todos"       │
│  (text-muted)      │  (text-bright)      │
│                    │                     │
└────────────────────┴─────────────────────┘
```
**Colores:** Lado izquierdo: terminal pequeño, text-muted. Lado derecho: silueta de webapp con borde gradient-blue-purple con glow, text-bright. Flecha → entre ambos con gradient-blue-purple.

---

#### SLIDE 18 — "El Alcance"
**Template:** D (List)
**Timing:** 1.5 min

**Layout:**
```
┌─────────────────────────────────────────┐
│  bg: bg-void                            │
│  "Lo que se construyó"  (text-primary)  │
│                                         │
│  ●  10 módulos de efectos               │
│  ●  140+ tipos de efectos               │
│  ●  100 patches editables               │
│  ●  Edición en tiempo real              │
│  ●  Cloud sync                          │
│  ●  Sesiones colaborativas remotas      │
│  ●  Demo mode sin hardware              │
│  ●  Autenticación                       │
│  ●  Responsive mobile                   │
│                                         │
│  Cada ● es un LED de color diferente    │
│  (usando los colores de cada módulo)    │
│                                         │
│  "Una persona. Con IA."                 │
│  (text-bright, H2, centered)            │
└─────────────────────────────────────────┘
```
**Colores:** Cada bullet es un LED de un módulo diferente: led-red (comp), led-green (wah), led-blue (amp), led-cyan (eq), led-purple (mod), led-teal (dly), led-pink (rev), led-amber (znr). La lista se convierte en un arcoíris de LEDs. Frase final en text-bright con underline gradient-blue-purple.

---

#### SLIDE 19 — "El Proceso de Construcción" ★ DIAGRAMA CLAVE
**Template:** B (Diagram)
**Timing:** 2 min

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  bg: bg-void                                     │
│  "El Proceso"  (text-primary, H2)                │
│                                                  │
│  ┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐         │
│  │Brain│──>│Brief│──>│ PRD │──>│Arch.│         │
│  │storm│   │     │   │ 45  │   │     │         │
│  │     │   │     │   │ FRs │   │     │         │
│  └──┬──┘   └──┬──┘   └──┬──┘   └──┬──┘         │
│     │🤖      │🤖      │🤖      │🤖            │
│     ↓         ↓         ↓         ↓              │
│  ┌─────┐   ┌─────┐   ┌───────────────────┐      │
│  │Epics│──>│Story│──>│  Implementación   │      │
│  │  7  │   │  34 │   │  61 components    │      │
│  └──┬──┘   └──┬──┘   └──────────────────┘       │
│     │🤖      │🤖            │🤖                 │
│                                                  │
│  🤖 = ícono IA con glow gradient-blue-purple     │
│                                                  │
│  "Cada paso amplificado.                         │
│   Cada decisión, mía."                           │
│  (text-secondary)                                │
└──────────────────────────────────────────────────┘
```
**Colores:** Cajas en bg-elevated, bordes led-blue. Flechas en text-muted. Íconos IA debajo de cada caja con glow gradient-blue-purple (pequeños, no protagonistas — son el amplificador, no el motor). Caption text-secondary.

---

#### SLIDE 20 — "La Arquitectura" ★ DIAGRAMA CLAVE
**Template:** B (Diagram)
**Timing:** 2 min

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  bg: bg-void                                     │
│  "Arquitectura"  (led-blue, H2)                  │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │  PRESENTACIÓN                            │    │
│  │  Pages + 61 Components                   │    │
│  │  [íconos de módulos con sus colores LED] │    │
│  └──────────────────────────────────────────┘    │
│   borde led-pink                                 │
│                         ↕                        │
│  ┌──────────────────────────────────────────┐    │
│  │  ESTADO                                  │    │
│  │  Auth │ Device │ Patch │ Session │ Sync  │    │
│  │       │        │       │ History │       │    │
│  └──────────────────────────────────────────┘    │
│   borde led-purple                               │
│                         ↕                        │
│  ┌──────────────────────────────────────────┐    │
│  │  SERVICIOS                               │    │
│  │  MIDI Service │ Firebase │ Session Svc   │    │
│  └──────────────────────────────────────────┘    │
│   borde led-blue                                 │
│                         ↕                        │
│  ┌──────────────────────────────────────────┐    │
│  │  EXTERNO                                 │    │
│  │  Zoom G9.2tt (Web MIDI) │ Firebase Cloud │    │
│  └──────────────────────────────────────────┘    │
│   borde led-teal                                 │
│                                                  │
│  "Intencionalidad > Implementación"              │
│  (text-secondary)                                │
└──────────────────────────────────────────────────┘
```
**Colores:** Cada capa tiene un color LED distinto en su borde. Flechas bidireccionales entre capas en text-muted. Los 6 contextos en la capa de Estado como sub-cajas con sus propios mini colores. Caption text-secondary.

---

#### SLIDE 21 — "Velocidad Real"
**Template:** A (Statement) con diagrama simple
**Timing:** 1.5 min

**Layout:**
```
┌─────────────────────────────────────────┐
│  bg: bg-void                            │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ● Reverse Engineering protocolo │    │
│  │ ● Librería Python funcional     │    │
│  │ ● App web completa + deploy     │    │
│  └─────────────────────────────────┘    │
│   progress-bar con gradient-blue-purple │
│   llenándose de izq a der              │
│                                         │
│                                         │
│   "Una persona. Con IA."                │
│   (text-bright, H1, centrado)           │
│                                         │
│   ● LED azul ● LED purple ●            │
│     (pulsando alternadamente)           │
└─────────────────────────────────────────┘
```
**Colores:** Lista con LEDs progresivos (led-green, led-blue, led-purple). Barra de progreso con gradient-blue-purple y shimmer animation. Frase en text-bright H1. Dos LEDs pulsando.

---

### ACTO IV — "La Verdad Incómoda" (5 min)

---

#### SLIDE 22 — "No Todo Fue Perfecto"
**Template:** A (Statement)
**Timing:** 30 seg

**Layout:**
```
┌─────────────────────────────────────────┐
│  bg: bg-void                            │
│                                         │
│                                         │
│    ⚠️                                   │
│    "La IA rompe cosas."                 │
│                                         │
│    LED amber grande, glow fuerte        │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```
**Colores:** Fondo bg-void puro. Texto text-bright H1. Un único LED amber GRANDE con glow máximo. Nada más. El contraste con las slides anteriores de éxito es deliberado.

---

#### SLIDE 23 — "Ejemplos Reales"
**Template:** D (List)
**Timing:** 1.5 min

**Layout:**
```
┌─────────────────────────────────────────┐
│  bg: bg-void                            │
│                                         │
│  💥 Destruyó interfaces que             │
│     ya funcionaban                      │
│                                         │
│  💥 Alteró el protocolo de              │
│     comunicación sin avisar             │
│                                         │
│  💥 Cambió la estructura de datos       │
│     MIDI rompiendo funcionalidad        │
│                                         │
│  💥 Tuve que rehacer el módulo          │
│     de protocolo completo               │
│                                         │
│  Cada 💥 = LED rojo con glow           │
│                                         │
│  "Esto pasa. Siempre."                  │
│  (text-muted)                           │
└─────────────────────────────────────────┘
```
**Colores:** Bullets como LEDs rojos con glow. Texto text-primary. Caption text-muted. Tono visual: sobrio, no dramático. Son hechos.

---

#### SLIDE 24 — "Por Qué Importa" ★ DIAGRAMA CLAVE
**Template:** E (Split/Contrast)
**Timing:** 1.5 min

**Layout:**
```
┌────────────────────┬─────────────────────┐
│                    │                     │
│  Dev con           │  Dev sin            │
│  experiencia       │  contexto           │
│                    │                     │
│  [silueta con      │  [silueta con       │
│   LED verde        │   LED rojo          │
│   en la cabeza]    │   en la cabeza]     │
│                    │                     │
│  Detecta que el    │  No detecta         │
│  protocolo se      │  el error           │
│  rompió            │                     │
│       ↓            │       ↓             │
│  Corrige           │  Envía datos        │
│  ✅                │  corruptos ❌       │
│                    │                     │
└────────────────────┴─────────────────────┘
│                                          │
│  "Tu experiencia es el                   │
│   filtro de calidad."                    │
│  (text-bright, H2, centered)             │
└──────────────────────────────────────────┘
```
**Colores:** Lado izquierdo: tint verde sutil. Silueta con LED verde. Lado derecho: tint rojo sutil. Silueta con LED rojo. Frase en text-bright con gradient-blue-purple underline.

---

#### SLIDE 25 — "La Lección Inesperada"
**Template:** B (Diagram) simplificado
**Timing:** 1.5 min

**Layout:**
```
┌─────────────────────────────────────────┐
│  bg: bg-void                            │
│                                         │
│  ┌──────────┐    ┌──────────┐    ┌─────────────┐
│  │  Idea    │    │  Prompt  │    │  Resultado  │
│  │  vaga    │ →  │  claro y │ →  │  correcto   │
│  │  💭      │    │  preciso │    │  ✅          │
│  └──────────┘    └──────────┘    └─────────────┘
│   led-amber       led-blue        led-green     │
│                                                 │
│  "La IA te obliga                               │
│   a pensar mejor."                              │
│  (text-bright, H2)                              │
│                                                 │
│  "Te hace mejor ingeniero."                     │
│  (text-secondary)                               │
└─────────────────────────────────────────────────┘
```
**Colores:** Tres cajas con progresión de color: led-amber → led-blue → led-green. Flechas con gradient progresivo. Frase principal en text-bright. Sub-frase en text-secondary.

---

### CIERRE — "La Invitación" (8 min)

---

#### SLIDE 26 — "La Reflexión"
**Template:** A (Statement)
**Timing:** 1.5 min

**Layout:**
```
┌─────────────────────────────────────────┐
│  bg: gradient-hero                      │
│                                         │
│                                         │
│  "Tu proceso cognitivo                  │
│   no se acelera.                        │
│                                         │
│   Tus resultados sí."                   │
│                                         │
│  ─── gradient-blue-purple line ───      │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```
**Colores:** Fondo gradient-hero. Primera parte en text-secondary (proceso cognitivo — lo que NO cambia). Segunda parte en text-bright (resultados — lo que SÍ). Línea gradient-blue-purple.

**Nota visual:** El contraste tipográfico entre las dos partes de la frase es clave. Dim → Bright. Lo que no cambia vs lo que sí.

---

#### SLIDE 27 — "Lo que Cambió"
**Template:** E (Split/Contrast)
**Timing:** 2 min

**Layout:**
```
┌────────────────────┬─────────────────────┐
│                    │                     │
│  ANTES             │  AHORA              │
│  (text-muted)      │  (text-bright)      │
│                    │                     │
│  Memorizar syntax  │  Entender intención │
│       ↓            │       ↓             │
│  Buscar en Stack   │  Comunicarla        │
│  Overflow          │  claramente         │
│       ↓            │       ↓             │
│  Copy-paste        │  Validar el         │
│       ↓            │  resultado          │
│  Adaptar           │                     │
│                    │                     │
│  (todo text-muted) │  (todo text-bright) │
│                    │                     │
└────────────────────┴─────────────────────┘
│                                          │
│  "Lo que cambió no es QUÉ aprendes.     │
│   Es CÓMO lo aplicas."                   │
│  (text-bright, gradient underline)       │
└──────────────────────────────────────────┘
```
**Colores:** Lado ANTES: todo en text-muted, opaco, desvanecido. Lado AHORA: text-bright, LEDs activos. El contraste visual entre opaco y brillante refuerza el mensaje.

---

#### SLIDE 28 — "El Camino"
**Template:** D (List) con visual de escalera
**Timing:** 1.5 min

**Layout:**
```
┌─────────────────────────────────────────┐
│  bg: bg-void                            │
│                                         │
│                          ┌───────────┐  │
│                          │ Amplificar│  │
│                          │ con IA    │  │
│                    ┌─────┤   10x     │  │
│                    │Exper│ led-purple │  │
│                    │imen-│           │  │
│              ┌─────┤tar  │           │  │
│              │Apren│ led │           │  │
│              │der  │-blue│           │  │
│  ┌───────────┤     │     │           │  │
│  │ Práctica  │led- │     │           │  │
│  │ + Teoría  │green│     │           │  │
│  │ led-green │     │     │           │  │
│  └───────────┘     │     │           │  │
│                    └─────┘           │  │
│                          └───────────┘  │
│   Escalera ascendente                   │
│   cada peldaño con su LED               │
│                                         │
│  "No como muleta. Como amplificador."   │
│  (text-bright)                          │
└─────────────────────────────────────────┘
```
**Colores:** Tres peldaños con LED progresivo: led-green → led-blue → led-purple. Cada peldaño más grande y brillante que el anterior. Glow aumentando con cada nivel. "10x" en led-purple con glow máximo.

---

#### SLIDE 29 — "El Producto"
**Template:** C (Visual + Text)
**Timing:** 1 min

**Layout:**
```
┌─────────────────────────────────────────┐
│  bg: bg-void                            │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  [Screenshot real de la app     │    │
│  │   o LIVE DEMO]                  │    │
│  │                                 │    │
│  │  El pedalboard con los 10       │    │
│  │  módulos, colores, LEDs         │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│   borde gradient-blue-purple con glow   │
│                                         │
│  zoomg9.enruana.com                     │
│  (led-blue, monospace, con glow)        │
│                                         │
│  "Pueden probarlo ahora mismo."         │
│  (text-secondary)                       │
└─────────────────────────────────────────┘
```
**Colores:** Screenshot con borde gradient-blue-purple y glow fuerte. URL en led-blue monospace con glow. Si es live demo, la app misma ES la slide.

---

#### SLIDE 30 — "El Cierre" ★ ÚLTIMA SLIDE
**Template:** A (Statement)
**Timing:** 1 min + silencio

**Layout:**
```
┌─────────────────────────────────────────┐
│  bg: bg-void (negro absoluto)           │
│                                         │
│                                         │
│                                         │
│   "¿Qué van a construir                │
│        ustedes?"                        │
│                                         │
│                                         │
│   ● ● ● ● ● ● ● ● ● ●                │
│   (10 LEDs, uno por cada módulo,        │
│    en sus colores respectivos,          │
│    parpadeando suavemente)              │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```
**Colores:** bg-void absoluto. Texto text-bright H1 centrado. 10 LEDs en fila — cada uno con el color de un módulo del G9.2tt (red, green, amber, blue, orange, cyan, purple, teal, pink, slate) — parpadeando suavemente con glow. Como el pedalboard esperando ser activado.

**Nota visual:** Los 10 LEDs son la metáfora perfecta: potencial esperando ser usado. No están apagados — están encendidos, listos. Como la IA. Como sus habilidades. Solo falta que alguien los combine.

---

## SLIDE SUMMARY TABLE

| # | Título | Template | Acto | Diagrama Excalidraw |
|---|--------|----------|------|---------------------|
| 1 | El Pedal | C | Apertura | No (foto) |
| 2 | Software Muerto | A | Apertura | No |
| 3 | La Locura | B | Apertura | ★ SÍ |
| 4 | La Decisión | A | Apertura | No |
| 5 | El Muro | C | Acto I | No (terminal) |
| 6 | El Principio | A | Acto I | No |
| 7 | La Captura | B | Acto I | ★ SÍ |
| 8 | Datos Crudos | C | Acto I | No (terminal) |
| 9 | Análisis con IA | B | Acto I | ★ SÍ |
| 10 | Protocolo Descifrado | D | Acto I | No (tabla) |
| 11 | Faltaba Algo | C | Acto I | No |
| 12 | Muro del Checksum | D | Acto II | ★ SÍ |
| 13 | Sugerencia Inesperada | E mod | Acto II | ★ SÍ |
| 14 | El Contraste | E | Acto II | ★★★ SÍ (más importante) |
| 15 | El CRC-32 | C | Acto II | No (código) |
| 16 | Momento Eureka | C | Acto II | ★ SÍ (terminal + pedal) |
| 17 | Pregunta Siguiente | E | Acto III | No |
| 18 | El Alcance | D | Acto III | No |
| 19 | Proceso de Construcción | B | Acto III | ★★ SÍ |
| 20 | La Arquitectura | B | Acto III | ★★ SÍ |
| 21 | Velocidad Real | A | Acto III | No |
| 22 | No Todo Fue Perfecto | A | Acto IV | No |
| 23 | Ejemplos Reales | D | Acto IV | No |
| 24 | Por Qué Importa | E | Acto IV | ★ SÍ |
| 25 | Lección Inesperada | B | Acto IV | ★ SÍ |
| 26 | La Reflexión | A | Cierre | No |
| 27 | Lo que Cambió | E | Cierre | No |
| 28 | El Camino | D | Cierre | ★ SÍ (escalera) |
| 29 | El Producto | C | Cierre | No (screenshot/demo) |
| 30 | El Cierre | A | Cierre | No (solo LEDs) |

**Diagramas Excalidraw a producir:** 12 diagramas (de los cuales 3 son de alta prioridad: slides 3, 14, 20)

---

## ANIMATION NOTES (Excalidraw Frames)

Para slides con animación, usar múltiples frames en Excalidraw:

1. **Slide 3** (La Locura): 4 frames — buildup de cada componente
2. **Slide 14** (El Contraste): 3 frames — Camino A → Camino B → Frase de cierre
3. **Slide 19** (Proceso): 2 frames — flujo superior → flujo inferior
4. **Slide 28** (El Camino): 3 frames — cada peldaño aparece

---

## NEXT STEPS

1. Producir los 12 diagramas Excalidraw
2. Maquetar las 30 slides en el orden correcto con frames
3. Agregar animaciones (multi-frame) a slides clave
4. Review pass final de consistencia visual
5. Export a formato presentación

---

_Storyboard designed by Caravaggio, Presentation Master_
_Based on narrative script by Sophia, Master Storyteller_
