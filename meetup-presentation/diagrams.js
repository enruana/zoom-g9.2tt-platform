/* ============================================
   Diagram Renderer — Rough.js + Excalidraw Data
   12 diagram slides rendered on canvas
   ============================================ */
var DiagramRenderer = (function () {
  'use strict';

  /* --- Font setup --- */
  var FONT_HAND = '"Montserrat", "Segoe UI", sans-serif';
  var FONT_MONO = '"Cascadia", "Cascadia Code", "Fira Code", monospace';

  /* --- Fragment groups per slide (0-indexed) --- */
  var FRAG_GROUPS = {
    3: {  // Slide 4: La Locura (4 fragments)
      0: ['grp-macbook', 'arrow-ssh', 'ssh-label', 'arrow-x11', 'x11-label'],
      1: ['grp-raspi', 'arrow-g9ed', 'wine-label', 'grp-g9ed'],
      2: ['arrow-usb-down', 'usb-label', 'grp-umone', 'arrow-midi-down', 'midi-cable-label'],
      3: ['grp-pedal', 'label-lento', 'label-fragil', 'label-tedioso', 'slide3-footer']
    },
    14: { // Slide 15: El Contraste (3 fragments)
      0: ['grp-camino-a'],
      1: ['grp-camino-b'],
      2: ['s14-quote1', 's14-quote2']
    },
    19: { // Slide 20: Proceso (2 fragments)
      0: ['s19-phase1', 's19-phase2', 's19-phase3', 's19-phase4', 's19-phase5', 's19-arr1', 's19-arr2', 's19-arr3', 's19-arr4', 's19-ai1', 's19-ai2', 's19-ai3', 's19-ai4', 's19-ai5'],
      1: ['s19-impl', 's19-impl-detail', 's19-ai6', 's19-ai-note', 's19-footer']
    },
    28: { // Slide 29: El Camino (3 fragments)
      0: ['s28-step1', 's28-step1-detail', 's28-led1'],
      1: ['s28-step2', 's28-step2-detail', 's28-led2', 's28-arr1'],
      2: ['s28-step3', 's28-step3-detail', 's28-led3', 's28-10x', 's28-glow', 's28-arr2', 's28-footer']
    }
  };

  /* ====== SLIDE DATA ====== */
  var SLIDES = {};

  /* --- Slide 4: La Locura --- */
  SLIDES[3] = [
    { t: 'rect', x: 0, y: 0, w: 1920, h: 1080, stroke: 'transparent', fill: '#030712', sw: 0, rough: 0, seed: 1002 },
    { t: 'text', x: 960, y: 48, text: 'El workaround', size: 28, color: '#6b7280', align: 'center', font: 'hand' },

    // === Fragment 0: MacBook + SSH/X11 arrows ===
    { t: 'rect', x: 100, y: 130, w: 320, h: 220, stroke: '#3b82f6', fill: '#374151', sw: 2, rough: 1, seed: 1010, round: 12, grp: 'grp-macbook' },
    { t: 'text', x: 260, y: 170, text: '\uD83D\uDCBB', size: 40, color: '#f3f4f6', align: 'center', font: 'hand', grp: 'grp-macbook' },
    { t: 'text', x: 260, y: 222, text: 'MacBook', size: 28, color: '#f3f4f6', align: 'center', font: 'hand', grp: 'grp-macbook' },
    { t: 'text', x: 260, y: 260, text: '(macOS)', size: 20, color: '#6b7280', align: 'center', font: 'hand', grp: 'grp-macbook' },
    { t: 'led', cx: 253, cy: 310, r: 8, fill: '#22c55e', stroke: '#166534', seed: 1014, grp: 'grp-macbook' },
    // SSH arrow
    { t: 'arrow', pts: [[430, 200], [620, 200]], stroke: '#9ca3af', sw: 2, rough: 1, seed: 1020, id: 'arrow-ssh' },
    { t: 'text', x: 525, y: 178, text: 'SSH', size: 18, color: '#fbbf24', align: 'center', font: 'mono', id: 'ssh-label' },
    // X11 arrow (return — GUI forwarded back to Mac)
    { t: 'arrow', pts: [[620, 280], [430, 280]], stroke: '#a855f7', sw: 2, rough: 1, seed: 1021, id: 'arrow-x11' },
    { t: 'text', x: 525, y: 300, text: 'X11 (GUI)', size: 18, color: '#a855f7', align: 'center', font: 'mono', id: 'x11-label' },

    // === Fragment 1: Raspberry Pi + G9ED.exe ===
    { t: 'rect', x: 630, y: 130, w: 360, h: 220, stroke: '#22c55e', fill: '#374151', sw: 2, rough: 1, seed: 1030, round: 12, grp: 'grp-raspi' },
    { t: 'text', x: 810, y: 170, text: '\uD83C\uDF53', size: 40, color: '#f3f4f6', align: 'center', font: 'hand', grp: 'grp-raspi' },
    { t: 'text', x: 810, y: 222, text: 'Raspberry Pi', size: 28, color: '#f3f4f6', align: 'center', font: 'hand', grp: 'grp-raspi' },
    { t: 'text', x: 810, y: 258, text: '(Emulando Windows XP)', size: 17, color: '#6b7280', align: 'center', font: 'hand', grp: 'grp-raspi' },
    { t: 'led', cx: 803, cy: 310, r: 8, fill: '#22c55e', stroke: '#166534', seed: 1031, grp: 'grp-raspi' },
    // Arrow to G9ED
    { t: 'arrow', pts: [[1000, 240], [1170, 240]], stroke: '#9ca3af', sw: 2, rough: 1, seed: 1040, id: 'arrow-g9ed' },
    { t: 'text', x: 1085, y: 218, text: 'Wine / XP', size: 16, color: '#ef4444', align: 'center', font: 'mono', id: 'wine-label' },
    // G9ED.exe
    { t: 'rect', x: 1180, y: 140, w: 320, h: 200, stroke: '#ef4444', fill: '#1f2937', sw: 3, rough: 1, seed: 1050, round: 12, grp: 'grp-g9ed' },
    { t: 'text', x: 1340, y: 195, text: 'G9ED.exe', size: 28, color: '#ef4444', align: 'center', font: 'mono', grp: 'grp-g9ed' },
    { t: 'text', x: 1340, y: 235, text: 'Zoom Editor', size: 20, color: '#9ca3af', align: 'center', font: 'hand', grp: 'grp-g9ed' },
    { t: 'text', x: 1340, y: 270, text: '(Windows XP only)', size: 16, color: '#6b7280', align: 'center', font: 'hand', grp: 'grp-g9ed' },
    { t: 'led', cx: 1333, cy: 310, r: 8, fill: '#ef4444', stroke: '#991b1b', seed: 1053, grp: 'grp-g9ed' },

    // === Fragment 2: UM-ONE + USB/MIDI cables ===
    // USB cable down from Raspberry Pi
    { t: 'arrow', pts: [[810, 360], [810, 450]], stroke: '#3b82f6', sw: 2, rough: 1, seed: 1060, id: 'arrow-usb-down' },
    { t: 'text', x: 870, y: 395, text: 'USB', size: 18, color: '#3b82f6', align: 'left', font: 'mono', id: 'usb-label' },
    // UM-ONE box
    { t: 'rect', x: 650, y: 460, w: 320, h: 150, stroke: '#fbbf24', fill: '#1f2937', sw: 2, rough: 1, seed: 1065, round: 12, grp: 'grp-umone' },
    { t: 'text', x: 810, y: 500, text: 'Roland UM-ONE', size: 24, color: '#fbbf24', align: 'center', font: 'hand', grp: 'grp-umone' },
    { t: 'text', x: 810, y: 535, text: 'USB \u2194 MIDI Interface', size: 18, color: '#9ca3af', align: 'center', font: 'mono', grp: 'grp-umone' },
    { t: 'led', cx: 750, cy: 570, r: 6, fill: '#ef4444', stroke: '#991b1b', seed: 1066, grp: 'grp-umone' },
    { t: 'led', cx: 810, cy: 570, r: 6, fill: '#22c55e', stroke: '#166534', seed: 1067, grp: 'grp-umone' },
    { t: 'led', cx: 870, cy: 570, r: 6, fill: '#ef4444', stroke: '#991b1b', seed: 1068, grp: 'grp-umone' },
    // MIDI DIN cable down to pedal
    { t: 'arrow', pts: [[810, 620], [810, 710]], stroke: '#fbbf24', sw: 3, rough: 1, seed: 1070, bidir: true, id: 'arrow-midi-down' },
    { t: 'text', x: 870, y: 658, text: 'MIDI DIN', size: 18, color: '#fbbf24', align: 'left', font: 'mono', id: 'midi-cable-label' },

    // === Fragment 3: Zoom G9.2tt pedal + labels ===
    { t: 'rect', x: 300, y: 720, w: 1020, h: 220, stroke: '#6b7280', fill: '#1f2937', sw: 3, rough: 1, seed: 1080, round: 12, grp: 'grp-pedal' },
    { t: 'text', x: 810, y: 760, text: '\uD83C\uDFB8', size: 40, color: '#f3f4f6', align: 'center', font: 'hand', grp: 'grp-pedal' },
    { t: 'text', x: 810, y: 815, text: 'Zoom G9.2tt', size: 36, color: '#f3f4f6', align: 'center', font: 'hand', grp: 'grp-pedal' },
    { t: 'text', x: 810, y: 855, text: 'Twin Tube Guitar Effects Console', size: 18, color: '#6b7280', align: 'center', font: 'hand', grp: 'grp-pedal' },
    { t: 'led', cx: 530, cy: 895, r: 7, fill: '#22c55e', stroke: '#166534', seed: 1084, grp: 'grp-pedal' },
    { t: 'led', cx: 630, cy: 895, r: 7, fill: '#3b82f6', stroke: '#1e3a8a', seed: 1085, grp: 'grp-pedal' },
    { t: 'led', cx: 730, cy: 895, r: 7, fill: '#a855f7', stroke: '#581c87', seed: 1086, grp: 'grp-pedal' },
    { t: 'led', cx: 830, cy: 895, r: 7, fill: '#ef4444', stroke: '#991b1b', seed: 1087, grp: 'grp-pedal' },
    { t: 'led', cx: 930, cy: 895, r: 7, fill: '#22d3ee', stroke: '#155e75', seed: 1088, grp: 'grp-pedal' },
    // Pain labels
    { t: 'text', x: 1480, y: 460, text: 'Lento', size: 28, color: '#fbbf24', align: 'center', font: 'hand', angle: -0.12, opacity: 0.8, id: 'label-lento' },
    { t: 'text', x: 1620, y: 540, text: 'Fr\u00e1gil', size: 28, color: '#fbbf24', align: 'center', font: 'hand', angle: 0.08, opacity: 0.8, id: 'label-fragil' },
    { t: 'text', x: 1520, y: 620, text: 'Tedioso', size: 28, color: '#fbbf24', align: 'center', font: 'hand', angle: -0.05, opacity: 0.8, id: 'label-tedioso' },
    // Footer quote
    { t: 'text', x: 960, y: 1000, text: '"Empec\u00e9 a pensar que comprar\nel pedal hab\u00eda sido un error."', size: 24, color: '#9ca3af', align: 'center', font: 'hand', opacity: 0.6, id: 'slide3-footer' }
  ];

  /* --- Slide 8: La Captura (same as workaround + MITM script) --- */
  SLIDES[7] = [
    { t: 'rect', x: 0, y: 0, w: 1920, h: 1080, stroke: 'transparent', fill: '#030712', sw: 0, rough: 0, seed: 7003 },
    { t: 'text', x: 960, y: 42, text: 'Sistema de Captura', size: 36, color: '#f3f4f6', align: 'center', font: 'hand' },

    // === TOP ROW: MacBook ← SSH/X11 → Raspberry Pi → G9ED.exe ===
    // MacBook
    { t: 'rect', x: 80, y: 110, w: 280, h: 190, stroke: '#3b82f6', fill: '#374151', sw: 2, rough: 1, seed: 7010, round: 12 },
    { t: 'text', x: 220, y: 148, text: '\uD83D\uDCBB', size: 36, color: '#f3f4f6', align: 'center', font: 'hand' },
    { t: 'text', x: 220, y: 195, text: 'MacBook', size: 24, color: '#f3f4f6', align: 'center', font: 'hand' },
    { t: 'text', x: 220, y: 225, text: '(macOS)', size: 16, color: '#6b7280', align: 'center', font: 'hand' },
    { t: 'led', cx: 213, cy: 265, r: 7, fill: '#22c55e', stroke: '#166534', seed: 7014 },
    // SSH arrow
    { t: 'arrow', pts: [[370, 175], [530, 175]], stroke: '#9ca3af', sw: 2, rough: 1, seed: 7020 },
    { t: 'text', x: 450, y: 155, text: 'SSH', size: 16, color: '#fbbf24', align: 'center', font: 'mono' },
    // X11 arrow (return)
    { t: 'arrow', pts: [[530, 240], [370, 240]], stroke: '#a855f7', sw: 2, rough: 1, seed: 7021 },
    { t: 'text', x: 450, y: 260, text: 'X11 (GUI)', size: 16, color: '#a855f7', align: 'center', font: 'mono' },

    // Raspberry Pi — BIG box (contains MITM)
    { t: 'rect', x: 540, y: 100, w: 520, h: 210, stroke: '#22c55e', fill: '#374151', sw: 2, rough: 1, seed: 7030, round: 12 },
    { t: 'text', x: 800, y: 138, text: '\uD83C\uDF53 Raspberry Pi', size: 24, color: '#f3f4f6', align: 'center', font: 'hand' },
    { t: 'text', x: 800, y: 168, text: '(Emulando Windows XP)', size: 16, color: '#6b7280', align: 'center', font: 'hand' },
    // MITM script inside Raspberry Pi
    { t: 'rect', x: 580, y: 195, w: 440, h: 90, stroke: '#22d3ee', fill: '#111827', sw: 2, rough: 1, seed: 7035, round: 8, glow: '#22d3ee' },
    { t: 'text', x: 800, y: 225, text: '\uD83D\uDD0D  MITM Script', size: 22, color: '#22d3ee', align: 'center', font: 'mono' },
    { t: 'text', x: 800, y: 255, text: 'intercepta y guarda todo el tr\u00e1fico MIDI', size: 15, color: '#9ca3af', align: 'center', font: 'hand' },
    { t: 'led', cx: 793, cy: 275, r: 6, fill: '#22d3ee', stroke: '#155e75', seed: 7036 },

    // Arrow to G9ED
    { t: 'arrow', pts: [[1070, 205], [1200, 205]], stroke: '#9ca3af', sw: 2, rough: 1, seed: 7040 },
    { t: 'text', x: 1135, y: 185, text: 'Wine', size: 15, color: '#ef4444', align: 'center', font: 'mono' },
    // G9ED.exe
    { t: 'rect', x: 1210, y: 120, w: 280, h: 180, stroke: '#ef4444', fill: '#1f2937', sw: 3, rough: 1, seed: 7050, round: 12 },
    { t: 'text', x: 1350, y: 170, text: 'G9ED.exe', size: 26, color: '#ef4444', align: 'center', font: 'mono' },
    { t: 'text', x: 1350, y: 205, text: 'Zoom Editor', size: 18, color: '#9ca3af', align: 'center', font: 'hand' },
    { t: 'text', x: 1350, y: 235, text: '(Windows XP only)', size: 14, color: '#6b7280', align: 'center', font: 'hand' },
    { t: 'led', cx: 1343, cy: 268, r: 7, fill: '#ef4444', stroke: '#991b1b', seed: 7053 },

    // === MIDDLE: USB down → UM-ONE → MIDI DIN down ===
    // USB cable from Raspberry Pi
    { t: 'arrow', pts: [[800, 320], [800, 400]], stroke: '#3b82f6', sw: 2, rough: 1, seed: 7060 },
    { t: 'text', x: 850, y: 355, text: 'USB', size: 16, color: '#3b82f6', align: 'left', font: 'mono' },
    // UM-ONE
    { t: 'rect', x: 650, y: 410, w: 300, h: 120, stroke: '#fbbf24', fill: '#1f2937', sw: 2, rough: 1, seed: 7065, round: 12 },
    { t: 'text', x: 800, y: 445, text: 'Roland UM-ONE', size: 22, color: '#fbbf24', align: 'center', font: 'hand' },
    { t: 'text', x: 800, y: 475, text: 'USB \u2194 MIDI', size: 16, color: '#9ca3af', align: 'center', font: 'mono' },
    { t: 'led', cx: 750, cy: 500, r: 5, fill: '#ef4444', stroke: '#991b1b', seed: 7066 },
    { t: 'led', cx: 800, cy: 500, r: 5, fill: '#22c55e', stroke: '#166534', seed: 7067 },
    { t: 'led', cx: 850, cy: 500, r: 5, fill: '#ef4444', stroke: '#991b1b', seed: 7068 },
    // MIDI DIN cable down
    { t: 'arrow', pts: [[800, 540], [800, 620]], stroke: '#fbbf24', sw: 3, rough: 1, seed: 7070, bidir: true },
    { t: 'text', x: 855, y: 575, text: 'MIDI DIN', size: 16, color: '#fbbf24', align: 'left', font: 'mono' },

    // === BOTTOM: Zoom G9.2tt ===
    { t: 'rect', x: 400, y: 630, w: 800, h: 180, stroke: '#6b7280', fill: '#1f2937', sw: 3, rough: 1, seed: 7080, round: 12 },
    { t: 'text', x: 800, y: 668, text: '\uD83C\uDFB8', size: 36, color: '#f3f4f6', align: 'center', font: 'hand' },
    { t: 'text', x: 800, y: 715, text: 'Zoom G9.2tt', size: 32, color: '#f3f4f6', align: 'center', font: 'hand' },
    { t: 'text', x: 800, y: 750, text: 'Twin Tube Guitar Effects Console', size: 16, color: '#6b7280', align: 'center', font: 'hand' },
    { t: 'led', cx: 600, cy: 775, r: 6, fill: '#22c55e', stroke: '#166534', seed: 7084 },
    { t: 'led', cx: 680, cy: 775, r: 6, fill: '#3b82f6', stroke: '#1e3a8a', seed: 7085 },
    { t: 'led', cx: 760, cy: 775, r: 6, fill: '#a855f7', stroke: '#581c87', seed: 7086 },
    { t: 'led', cx: 840, cy: 775, r: 6, fill: '#ef4444', stroke: '#991b1b', seed: 7087 },
    { t: 'led', cx: 920, cy: 775, r: 6, fill: '#22d3ee', stroke: '#155e75', seed: 7088 },

    // === RIGHT SIDE: Captured files output ===
    // Arrow from MITM script to files
    { t: 'arrow', pts: [[1030, 240], [1560, 240], [1560, 420]], stroke: '#22d3ee', sw: 2, rough: 1, seed: 7090, dash: true },
    { t: 'text', x: 1620, y: 350, text: 'log', size: 16, color: '#22d3ee', align: 'left', font: 'mono' },
    // Files box
    { t: 'rect', x: 1500, y: 430, w: 300, h: 200, stroke: '#22d3ee', fill: '#111827', sw: 2, rough: 1, seed: 7095, round: 12 },
    { t: 'text', x: 1650, y: 470, text: '\uD83D\uDCC4 Archivos .syx', size: 20, color: '#22d3ee', align: 'center', font: 'hand' },
    { t: 'text', x: 1650, y: 510, text: 'patch_001.syx\npatch_002.syx\npatch_003.syx\n...', size: 16, color: '#9ca3af', align: 'center', font: 'mono' },
    { t: 'led', cx: 1643, cy: 600, r: 7, fill: '#22c55e', stroke: '#166534', seed: 7098 },

    // === FLOW ANNOTATION ===
    { t: 'text', x: 1350, y: 720, text: 'G9ED lee un patch \u2192 el script captura\nlos bytes antes de que lleguen al pedal', size: 18, color: '#6b7280', align: 'center', font: 'hand' },

    // Footer
    { t: 'text', x: 960, y: 900, text: '"Cada vez que el software original le\u00eda un patch,\nyo capturaba los bytes."', size: 26, color: '#9ca3af', align: 'center', font: 'hand' }
  ];

  /* --- Slide 9: An\u00e1lisis con IA --- */
  SLIDES[9] = [
    { t: 'rect', x: 0, y: 0, w: 1920, h: 1080, stroke: 'transparent', fill: '#030712', sw: 0, rough: 0, seed: 9003 },
    { t: 'text', x: 960, y: 50, text: 'An\u00e1lisis de Protocolo', size: 36, color: '#f3f4f6', align: 'center', font: 'hand' },
    // Hex data box
    { t: 'rect', x: 100, y: 150, w: 500, h: 300, stroke: '#22d3ee', fill: '#111827', sw: 2, rough: 1, seed: 9010, round: 12 },
    { t: 'text', x: 350, y: 185, text: 'Datos hex capturados', size: 22, color: '#22d3ee', align: 'center', font: 'hand' },
    { t: 'text', x: 150, y: 230, text: 'F0 52 00 42 21 00 00\n45 0A 03 08 00 04 05 0F\n00 00 00 00 09 00 00 01\n05 00 00 0E 00 07 02 0B\n...268 bytes...\n4C F7', size: 18, color: '#22d3ee', align: 'left', font: 'mono' },
    // Arrow
    { t: 'arrow', pts: [[620, 300], [800, 300]], stroke: '#a855f7', sw: 2, rough: 1, seed: 9020 },
    // Claude Code box
    { t: 'rect', x: 820, y: 150, w: 500, h: 300, stroke: '#a855f7', fill: '#111827', sw: 3, rough: 1, seed: 9030, round: 12, glow: '#a855f7' },
    { t: 'text', x: 1070, y: 195, text: 'Claude Code', size: 28, color: '#a855f7', align: 'center', font: 'hand' },
    { t: 'text', x: 1070, y: 240, text: '+', size: 24, color: '#6b7280', align: 'center', font: 'hand' },
    { t: 'text', x: 1070, y: 280, text: 'Contexto humano', size: 24, color: '#f3f4f6', align: 'center', font: 'hand' },
    { t: 'text', x: 1070, y: 330, text: '"esto parece un header"\n"estos bytes cambian con volumen"', size: 16, color: '#9ca3af', align: 'center', font: 'hand' },
    // Arrow down
    { t: 'arrow', pts: [[1070, 470], [1070, 560]], stroke: '#22c55e', sw: 2, rough: 1, seed: 9040 },
    // Results box
    { t: 'rect', x: 520, y: 570, w: 880, h: 280, stroke: '#22c55e', fill: '#1f2937', sw: 2, rough: 1, seed: 9050, round: 12 },
    { t: 'text', x: 960, y: 600, text: 'Patrones Descubiertos:', size: 24, color: '#22c55e', align: 'center', font: 'hand' },
    { t: 'led', cx: 600, cy: 660, r: 6, fill: '#22c55e', stroke: '#166534', seed: 9060 },
    { t: 'text', x: 625, y: 650, text: 'Nibble encoding (byte \u2192 2 nibbles)', size: 20, color: '#f3f4f6', align: 'left', font: 'hand' },
    { t: 'led', cx: 600, cy: 695, r: 6, fill: '#22c55e', stroke: '#166534', seed: 9061 },
    { t: 'text', x: 625, y: 685, text: '7-bit encoding (MIDI safe)', size: 20, color: '#f3f4f6', align: 'left', font: 'hand' },
    { t: 'led', cx: 600, cy: 730, r: 6, fill: '#22c55e', stroke: '#166534', seed: 9062 },
    { t: 'text', x: 625, y: 720, text: '128 bytes por patch (raw data)', size: 20, color: '#f3f4f6', align: 'left', font: 'hand' },
    { t: 'led', cx: 600, cy: 765, r: 6, fill: '#22c55e', stroke: '#166534', seed: 9063 },
    { t: 'text', x: 625, y: 755, text: 'Header: F0 52 00 42 (Zoom G9.2tt)', size: 20, color: '#f3f4f6', align: 'left', font: 'hand' },
    { t: 'led', cx: 600, cy: 800, r: 6, fill: '#22c55e', stroke: '#166534', seed: 9064 },
    { t: 'text', x: 625, y: 790, text: '6 comandos SysEx identificados', size: 20, color: '#f3f4f6', align: 'left', font: 'hand' },
    // Footer
    { t: 'text', x: 960, y: 920, text: '"Yo daba contexto. La IA encontraba patrones."', size: 28, color: '#9ca3af', align: 'center', font: 'hand' }
  ];

  /* --- Slide 12: Muro del Checksum --- */
  SLIDES[12] = [
    { t: 'rect', x: 0, y: 0, w: 1920, h: 1080, stroke: 'transparent', fill: '#030712', sw: 0, rough: 0, seed: 12003 },
    { t: 'text', x: 960, y: 50, text: 'Intentamos todo', size: 42, color: '#ef4444', align: 'center', font: 'hand' },
    // Source data
    { t: 'rect', x: 660, y: 120, w: 600, h: 80, stroke: '#22d3ee', fill: '#111827', sw: 2, rough: 1, seed: 12010, round: 8 },
    { t: 'text', x: 960, y: 152, text: 'Datos capturados (patch + checksum)', size: 20, color: '#22d3ee', align: 'center', font: 'mono' },
    // Arrow down
    { t: 'arrow', pts: [[960, 210], [960, 270]], stroke: '#6b7280', sw: 2, rough: 1, seed: 12015 },
    // Failed attempts
    { t: 'rect', x: 460, y: 280, w: 700, h: 60, stroke: '#374151', fill: '#111827', sw: 1, rough: 1, seed: 12020, round: 6 },
    { t: 'text', x: 530, y: 300, text: 'CRC-16 (m\u00faltiples polinomios)', size: 22, color: '#f3f4f6', align: 'left', font: 'hand' },
    { t: 'led', cx: 1100, cy: 310, r: 10, fill: '#ef4444', stroke: '#991b1b', seed: 12021 },

    { t: 'rect', x: 460, y: 360, w: 700, h: 60, stroke: '#374151', fill: '#111827', sw: 1, rough: 1, seed: 12030, round: 6 },
    { t: 'text', x: 530, y: 380, text: 'CRC-32 est\u00e1ndar', size: 22, color: '#f3f4f6', align: 'left', font: 'hand' },
    { t: 'led', cx: 1100, cy: 390, r: 10, fill: '#ef4444', stroke: '#991b1b', seed: 12031 },

    { t: 'rect', x: 460, y: 440, w: 700, h: 60, stroke: '#374151', fill: '#111827', sw: 1, rough: 1, seed: 12040, round: 6 },
    { t: 'text', x: 530, y: 460, text: 'XOR simple', size: 22, color: '#f3f4f6', align: 'left', font: 'hand' },
    { t: 'led', cx: 1100, cy: 470, r: 10, fill: '#ef4444', stroke: '#991b1b', seed: 12041 },

    { t: 'rect', x: 460, y: 520, w: 700, h: 60, stroke: '#374151', fill: '#111827', sw: 1, rough: 1, seed: 12050, round: 6 },
    { t: 'text', x: 530, y: 540, text: 'Suma de bytes', size: 22, color: '#f3f4f6', align: 'left', font: 'hand' },
    { t: 'led', cx: 1100, cy: 550, r: 10, fill: '#ef4444', stroke: '#991b1b', seed: 12051 },

    { t: 'rect', x: 460, y: 600, w: 700, h: 60, stroke: '#374151', fill: '#111827', sw: 1, rough: 1, seed: 12060, round: 6 },
    { t: 'text', x: 530, y: 620, text: 'Fletcher checksum', size: 22, color: '#f3f4f6', align: 'left', font: 'hand' },
    { t: 'led', cx: 1100, cy: 630, r: 10, fill: '#ef4444', stroke: '#991b1b', seed: 12061 },

    { t: 'rect', x: 460, y: 680, w: 700, h: 60, stroke: '#374151', fill: '#111827', sw: 1, rough: 1, seed: 12070, round: 6 },
    { t: 'text', x: 530, y: 700, text: 'CRC-32 con polinomios custom', size: 22, color: '#f3f4f6', align: 'left', font: 'hand' },
    { t: 'led', cx: 1100, cy: 710, r: 10, fill: '#ef4444', stroke: '#991b1b', seed: 12071 },

    // Footer
    { t: 'text', x: 960, y: 820, text: '"Sin saber sobre QU\u00c9 datos se calcula el checksum,\nlas combinaciones son enormes."', size: 24, color: '#6b7280', align: 'center', font: 'hand' },
    { t: 'text', x: 960, y: 910, text: 'Pr\u00e1cticamente imposible.', size: 28, color: '#ef4444', align: 'center', font: 'hand' }
  ];

  /* --- Slide 13: Sugerencia Inesperada --- */
  SLIDES[13] = [
    { t: 'rect', x: 0, y: 0, w: 1920, h: 1080, stroke: 'transparent', fill: '#030712', sw: 0, rough: 0, seed: 13003 },
    // Chat box
    { t: 'rect', x: 310, y: 80, w: 1300, h: 380, stroke: '#a855f7', fill: '#111827', sw: 3, rough: 1, seed: 13010, round: 16, glow: '#a855f7' },
    { t: 'text', x: 380, y: 120, text: 'Claude Code:', size: 24, color: '#a855f7', align: 'left', font: 'mono' },
    { t: 'text', x: 380, y: 180, text: '"El G9ED est\u00e1 construido en .NET.\n\nPodemos hacer decompilaci\u00f3n del ejecutable\npara encontrar el algoritmo del checksum\ndirectamente en el c\u00f3digo fuente."', size: 28, color: '#f3f4f6', align: 'left', font: 'hand' },
    // .exe box
    { t: 'rect', x: 810, y: 540, w: 300, h: 140, stroke: '#a855f7', fill: '#1f2937', sw: 2, rough: 1, seed: 13020, round: 12, glow: '#a855f7' },
    { t: 'text', x: 960, y: 585, text: 'G9ED.exe', size: 28, color: '#f3f4f6', align: 'center', font: 'mono' },
    { t: 'text', x: 960, y: 625, text: '(.NET Framework)', size: 18, color: '#6b7280', align: 'center', font: 'hand' },
    // Arrow from chat to exe
    { t: 'arrow', pts: [[960, 470], [960, 530]], stroke: '#a855f7', sw: 2, rough: 1, seed: 13030 },
    // Glow
    { t: 'led', cx: 960, cy: 610, r: 40, fill: '#a855f7', stroke: 'transparent', seed: 13035, opacity: 0.08 },
    // Quotes
    { t: 'text', x: 960, y: 770, text: '"Yo no sab\u00eda que eso era posible. Nunca lo pens\u00e9."', size: 32, color: '#ffffff', align: 'center', font: 'hand' },
    { t: 'text', x: 960, y: 840, text: 'Solo pudo sugerirlo porque YO le di el contexto correcto.', size: 22, color: '#9ca3af', align: 'center', font: 'hand' }
  ];

  /* --- Slide 14: El Contraste --- */
  SLIDES[14] = [
    { t: 'rect', x: 0, y: 0, w: 1920, h: 1080, stroke: 'transparent', fill: '#030712', sw: 0, rough: 0, seed: 14003 },
    { t: 'text', x: 960, y: 40, text: 'El Contraste', size: 36, color: '#f3f4f6', align: 'center', font: 'hand' },
    // Left overlay (red tint)
    { t: 'rect', x: 0, y: 80, w: 940, h: 780, stroke: 'transparent', fill: '#ef4444', sw: 0, rough: 0, seed: 14004, opacity: 0.04, grp: 'grp-camino-a' },
    { t: 'text', x: 470, y: 110, text: 'CAMINO A', size: 32, color: '#ef4444', align: 'center', font: 'hand', grp: 'grp-camino-a' },
    { t: 'rect', x: 270, y: 180, w: 400, h: 70, stroke: '#374151', fill: '#111827', sw: 1, rough: 1, seed: 14010, round: 8, grp: 'grp-camino-a' },
    { t: 'text', x: 470, y: 205, text: 'Datos capturados', size: 22, color: '#f3f4f6', align: 'center', font: 'hand', grp: 'grp-camino-a' },
    { t: 'arrow', pts: [[470, 260], [470, 310]], stroke: '#6b7280', sw: 2, rough: 1, seed: 14011, grp: 'grp-camino-a' },
    { t: 'rect', x: 270, y: 320, w: 400, h: 70, stroke: '#374151', fill: '#111827', sw: 1, rough: 1, seed: 14012, round: 8, grp: 'grp-camino-a' },
    { t: 'text', x: 470, y: 345, text: 'An\u00e1lisis manual', size: 22, color: '#f3f4f6', align: 'center', font: 'hand', grp: 'grp-camino-a' },
    { t: 'arrow', pts: [[470, 400], [470, 450]], stroke: '#6b7280', sw: 2, rough: 1, seed: 14013, grp: 'grp-camino-a' },
    { t: 'rect', x: 270, y: 460, w: 400, h: 70, stroke: '#374151', fill: '#111827', sw: 1, rough: 1, seed: 14014, round: 8, grp: 'grp-camino-a' },
    { t: 'text', x: 470, y: 485, text: 'Prueba y error', size: 22, color: '#f3f4f6', align: 'center', font: 'hand', grp: 'grp-camino-a' },
    { t: 'arrow', pts: [[470, 540], [470, 610]], stroke: '#ef4444', sw: 2, rough: 1, seed: 14015, grp: 'grp-camino-a' },
    { t: 'text', x: 470, y: 640, text: 'IMPOSIBLE', size: 40, color: '#ef4444', align: 'center', font: 'hand', grp: 'grp-camino-a' },
    { t: 'led', cx: 470, cy: 720, r: 15, fill: '#ef4444', stroke: '#991b1b', seed: 14016, grp: 'grp-camino-a' },
    // Divider
    { t: 'line', pts: [[960, 80], [960, 860]], stroke: '#a855f7', sw: 2, rough: 0, seed: 14050, glow: '#a855f7' },
    // Right overlay (green tint)
    { t: 'rect', x: 980, y: 80, w: 940, h: 780, stroke: 'transparent', fill: '#22c55e', sw: 0, rough: 0, seed: 14005, opacity: 0.04, grp: 'grp-camino-b' },
    { t: 'text', x: 1450, y: 110, text: 'CAMINO B', size: 32, color: '#22c55e', align: 'center', font: 'hand', grp: 'grp-camino-b' },
    { t: 'rect', x: 1250, y: 180, w: 400, h: 70, stroke: '#374151', fill: '#111827', sw: 1, rough: 1, seed: 14020, round: 8, grp: 'grp-camino-b' },
    { t: 'text', x: 1450, y: 200, text: 'Claude Code sugiere\ndecompile del .exe', size: 20, color: '#f3f4f6', align: 'center', font: 'hand', grp: 'grp-camino-b' },
    { t: 'arrow', pts: [[1450, 260], [1450, 310]], stroke: '#22c55e', sw: 2, rough: 1, seed: 14021, grp: 'grp-camino-b' },
    { t: 'rect', x: 1250, y: 320, w: 400, h: 70, stroke: '#374151', fill: '#111827', sw: 1, rough: 1, seed: 14022, round: 8, grp: 'grp-camino-b' },
    { t: 'text', x: 1450, y: 345, text: 'Ejecutable .NET', size: 22, color: '#f3f4f6', align: 'center', font: 'hand', grp: 'grp-camino-b' },
    { t: 'arrow', pts: [[1450, 400], [1450, 450]], stroke: '#22c55e', sw: 2, rough: 1, seed: 14023, grp: 'grp-camino-b' },
    { t: 'rect', x: 1250, y: 460, w: 400, h: 70, stroke: '#374151', fill: '#111827', sw: 1, rough: 1, seed: 14024, round: 8, grp: 'grp-camino-b' },
    { t: 'text', x: 1450, y: 485, text: 'C\u00f3digo fuente', size: 22, color: '#f3f4f6', align: 'center', font: 'hand', grp: 'grp-camino-b' },
    { t: 'arrow', pts: [[1450, 540], [1450, 610]], stroke: '#22c55e', sw: 2, rough: 1, seed: 14025, grp: 'grp-camino-b' },
    { t: 'text', x: 1450, y: 630, text: 'CRC-32\nENCONTRADO', size: 36, color: '#22c55e', align: 'center', font: 'hand', grp: 'grp-camino-b' },
    { t: 'led', cx: 1450, cy: 720, r: 15, fill: '#22c55e', stroke: '#166534', seed: 14026, grp: 'grp-camino-b' },
    // Bottom quotes
    { t: 'text', x: 960, y: 900, text: '"Ni yo solo, ni la IA sola."', size: 36, color: '#ffffff', align: 'center', font: 'hand', id: 's14-quote1' },
    { t: 'text', x: 960, y: 960, text: 'Fue la combinaci\u00f3n.', size: 40, color: '#a855f7', align: 'center', font: 'hand', id: 's14-quote2' }
  ];

  /* --- Slide 17: Momento Eureka (now HTML with live animation) --- */

  /* --- Slide 19: Proceso de Construcci\u00f3n --- */
  SLIDES[19] = [
    { t: 'rect', x: 0, y: 0, w: 1920, h: 1080, stroke: 'transparent', fill: '#030712', sw: 0, rough: 0, seed: 19003 },
    { t: 'text', x: 960, y: 40, text: 'El Proceso', size: 36, color: '#f3f4f6', align: 'center', font: 'hand' },
    // Phase boxes (fragment 0)
    { t: 'rect', x: 80, y: 140, w: 240, h: 120, stroke: '#3b82f6', fill: '#1f2937', sw: 2, rough: 1, seed: 19010, round: 8, id: 's19-phase1' },
    { t: 'text', x: 200, y: 190, text: 'Brainstorm', size: 22, color: '#f3f4f6', align: 'center', font: 'hand', id: 's19-phase1' },
    { t: 'arrow', pts: [[330, 200], [400, 200]], stroke: '#6b7280', sw: 2, rough: 1, seed: 19011, id: 's19-arr1' },
    { t: 'rect', x: 410, y: 140, w: 240, h: 120, stroke: '#3b82f6', fill: '#1f2937', sw: 2, rough: 1, seed: 19012, round: 8, id: 's19-phase2' },
    { t: 'text', x: 530, y: 185, text: 'Product\nBrief', size: 22, color: '#f3f4f6', align: 'center', font: 'hand', id: 's19-phase2' },
    { t: 'arrow', pts: [[660, 200], [730, 200]], stroke: '#6b7280', sw: 2, rough: 1, seed: 19013, id: 's19-arr2' },
    { t: 'rect', x: 740, y: 140, w: 240, h: 120, stroke: '#3b82f6', fill: '#1f2937', sw: 2, rough: 1, seed: 19014, round: 8, id: 's19-phase3' },
    { t: 'text', x: 860, y: 185, text: 'PRD\n45 FRs', size: 22, color: '#f3f4f6', align: 'center', font: 'hand', id: 's19-phase3' },
    { t: 'arrow', pts: [[990, 200], [1060, 200]], stroke: '#6b7280', sw: 2, rough: 1, seed: 19015, id: 's19-arr3' },
    { t: 'rect', x: 1070, y: 140, w: 240, h: 120, stroke: '#3b82f6', fill: '#1f2937', sw: 2, rough: 1, seed: 19016, round: 8, id: 's19-phase4' },
    { t: 'text', x: 1190, y: 190, text: 'Arquitectura', size: 22, color: '#f3f4f6', align: 'center', font: 'hand', id: 's19-phase4' },
    { t: 'arrow', pts: [[1320, 200], [1390, 200]], stroke: '#6b7280', sw: 2, rough: 1, seed: 19017, id: 's19-arr4' },
    { t: 'rect', x: 1400, y: 140, w: 240, h: 120, stroke: '#3b82f6', fill: '#1f2937', sw: 2, rough: 1, seed: 19018, round: 8, id: 's19-phase5' },
    { t: 'text', x: 1520, y: 185, text: 'Epics\n7 \u00d7 34', size: 22, color: '#f3f4f6', align: 'center', font: 'hand', id: 's19-phase5' },
    // AI icons below each phase
    { t: 'text', x: 200, y: 280, text: '\uD83E\uDD16', size: 20, color: '#a855f7', align: 'center', font: 'hand', opacity: 0.8, id: 's19-ai1' },
    { t: 'text', x: 530, y: 280, text: '\uD83E\uDD16', size: 20, color: '#a855f7', align: 'center', font: 'hand', opacity: 0.8, id: 's19-ai2' },
    { t: 'text', x: 860, y: 280, text: '\uD83E\uDD16', size: 20, color: '#a855f7', align: 'center', font: 'hand', opacity: 0.8, id: 's19-ai3' },
    { t: 'text', x: 1190, y: 280, text: '\uD83E\uDD16', size: 20, color: '#a855f7', align: 'center', font: 'hand', opacity: 0.8, id: 's19-ai4' },
    { t: 'text', x: 1520, y: 280, text: '\uD83E\uDD16', size: 20, color: '#a855f7', align: 'center', font: 'hand', opacity: 0.8, id: 's19-ai5' },
    // Implementation box (fragment 1)
    { t: 'rect', x: 300, y: 400, w: 1320, h: 230, stroke: '#22c55e', fill: '#1f2937', sw: 2, rough: 1, seed: 19020, round: 12, id: 's19-impl' },
    { t: 'text', x: 960, y: 430, text: 'Implementaci\u00f3n', size: 36, color: '#22c55e', align: 'center', font: 'hand', id: 's19-impl' },
    { t: 'text', x: 960, y: 490, text: '61 components / 6 contexts / 3 services\n10 m\u00f3dulos / 140+ effect types / MIDI real-time\nFirebase / Sessions / Cloud Sync', size: 20, color: '#9ca3af', align: 'center', font: 'mono', id: 's19-impl-detail' },
    { t: 'text', x: 960, y: 590, text: '\uD83E\uDD16', size: 20, color: '#a855f7', align: 'center', font: 'hand', opacity: 0.8, id: 's19-ai6' },
    { t: 'text', x: 960, y: 680, text: '\uD83E\uDD16 = Cada paso amplificado con IA', size: 18, color: '#a855f7', align: 'center', font: 'hand', opacity: 0.6, id: 's19-ai-note' },
    // Footer
    { t: 'text', x: 960, y: 780, text: '"Cada paso amplificado.\nCada decisi\u00f3n, m\u00eda."', size: 28, color: '#9ca3af', align: 'center', font: 'hand', id: 's19-footer' }
  ];

  /* --- Slide 20: La Arquitectura --- */
  SLIDES[20] = [
    { t: 'rect', x: 0, y: 0, w: 1920, h: 1080, stroke: 'transparent', fill: '#030712', sw: 0, rough: 0, seed: 20003 },
    { t: 'text', x: 960, y: 40, text: 'Arquitectura', size: 36, color: '#3b82f6', align: 'center', font: 'hand' },
    // Layer 1 - Presentaci\u00f3n
    { t: 'rect', x: 160, y: 100, w: 1600, h: 160, stroke: '#ec4899', fill: '#111827', sw: 2, rough: 1, seed: 20010, round: 12 },
    { t: 'text', x: 220, y: 125, text: 'PRESENTACI\u00d3N', size: 24, color: '#ec4899', align: 'left', font: 'hand' },
    { t: 'text', x: 220, y: 165, text: 'CMP  WAH  ZNR  AMP  CAB  EQ  MOD  DLY  REV  EXT  /  Pedalboard  /  Dialogs  /  Session', size: 16, color: '#9ca3af', align: 'left', font: 'mono' },
    { t: 'text', x: 1650, y: 130, text: '61 comp.', size: 16, color: '#ec4899', align: 'center', font: 'mono' },
    // LEDs for modules
    { t: 'led', cx: 230, cy: 210, r: 5, fill: '#ef4444', stroke: '#991b1b', seed: 20015 },
    { t: 'led', cx: 290, cy: 210, r: 5, fill: '#22c55e', stroke: '#166534', seed: 20016 },
    { t: 'led', cx: 350, cy: 210, r: 5, fill: '#fbbf24', stroke: '#92400e', seed: 20017 },
    { t: 'led', cx: 410, cy: 210, r: 5, fill: '#3b82f6', stroke: '#1e3a8a', seed: 20018 },
    { t: 'led', cx: 470, cy: 210, r: 5, fill: '#22d3ee', stroke: '#155e75', seed: 20019 },
    // Arrow down
    { t: 'arrow', pts: [[960, 270], [960, 310]], stroke: '#6b7280', sw: 2, rough: 1, seed: 20020, bidir: true },
    // Layer 2 - Estado
    { t: 'rect', x: 160, y: 320, w: 1600, h: 160, stroke: '#a855f7', fill: '#111827', sw: 2, rough: 1, seed: 20030, round: 12 },
    { t: 'text', x: 220, y: 340, text: 'ESTADO (React Context)', size: 24, color: '#a855f7', align: 'left', font: 'hand' },
    // Context sub-boxes
    { t: 'rect', x: 220, y: 385, w: 200, h: 55, stroke: '#a855f7', fill: '#1f2937', sw: 1, rough: 1, seed: 20031, round: 6 },
    { t: 'text', x: 320, y: 405, text: 'Auth', size: 18, color: '#f3f4f6', align: 'center', font: 'mono' },
    { t: 'rect', x: 440, y: 385, w: 200, h: 55, stroke: '#a855f7', fill: '#1f2937', sw: 1, rough: 1, seed: 20032, round: 6 },
    { t: 'text', x: 540, y: 405, text: 'Device', size: 18, color: '#f3f4f6', align: 'center', font: 'mono' },
    { t: 'rect', x: 660, y: 385, w: 200, h: 55, stroke: '#a855f7', fill: '#1f2937', sw: 1, rough: 1, seed: 20033, round: 6 },
    { t: 'text', x: 760, y: 405, text: 'Patch', size: 18, color: '#f3f4f6', align: 'center', font: 'mono' },
    { t: 'rect', x: 880, y: 385, w: 200, h: 55, stroke: '#a855f7', fill: '#1f2937', sw: 1, rough: 1, seed: 20034, round: 6 },
    { t: 'text', x: 980, y: 405, text: 'Session', size: 18, color: '#f3f4f6', align: 'center', font: 'mono' },
    { t: 'rect', x: 1100, y: 385, w: 200, h: 55, stroke: '#a855f7', fill: '#1f2937', sw: 1, rough: 1, seed: 20035, round: 6 },
    { t: 'text', x: 1200, y: 405, text: 'Sync', size: 18, color: '#f3f4f6', align: 'center', font: 'mono' },
    { t: 'rect', x: 1320, y: 385, w: 200, h: 55, stroke: '#a855f7', fill: '#1f2937', sw: 1, rough: 1, seed: 20036, round: 6 },
    { t: 'text', x: 1420, y: 405, text: 'History', size: 18, color: '#f3f4f6', align: 'center', font: 'mono' },
    // Arrow down
    { t: 'arrow', pts: [[960, 490], [960, 530]], stroke: '#6b7280', sw: 2, rough: 1, seed: 20040, bidir: true },
    // Layer 3 - Servicios
    { t: 'rect', x: 160, y: 540, w: 1600, h: 160, stroke: '#3b82f6', fill: '#111827', sw: 2, rough: 1, seed: 20050, round: 12 },
    { t: 'text', x: 220, y: 560, text: 'SERVICIOS', size: 24, color: '#3b82f6', align: 'left', font: 'hand' },
    { t: 'rect', x: 220, y: 600, w: 400, h: 55, stroke: '#3b82f6', fill: '#1f2937', sw: 1, rough: 1, seed: 20051, round: 6 },
    { t: 'text', x: 420, y: 620, text: 'MIDI Service + Protocol', size: 18, color: '#f3f4f6', align: 'center', font: 'mono' },
    { t: 'rect', x: 660, y: 600, w: 400, h: 55, stroke: '#3b82f6', fill: '#1f2937', sw: 1, rough: 1, seed: 20052, round: 6 },
    { t: 'text', x: 860, y: 620, text: 'Firebase Auth + Firestore', size: 18, color: '#f3f4f6', align: 'center', font: 'mono' },
    { t: 'rect', x: 1100, y: 600, w: 400, h: 55, stroke: '#3b82f6', fill: '#1f2937', sw: 1, rough: 1, seed: 20053, round: 6 },
    { t: 'text', x: 1300, y: 620, text: 'Session Service', size: 18, color: '#f3f4f6', align: 'center', font: 'mono' },
    // Arrow down
    { t: 'arrow', pts: [[960, 710], [960, 750]], stroke: '#6b7280', sw: 2, rough: 1, seed: 20060, bidir: true },
    // Layer 4 - Externo
    { t: 'rect', x: 160, y: 760, w: 1600, h: 130, stroke: '#2dd4bf', fill: '#111827', sw: 2, rough: 1, seed: 20070, round: 12 },
    { t: 'text', x: 220, y: 780, text: 'EXTERNO', size: 24, color: '#2dd4bf', align: 'left', font: 'hand' },
    { t: 'rect', x: 220, y: 815, w: 600, h: 50, stroke: '#2dd4bf', fill: '#1f2937', sw: 1, rough: 1, seed: 20071, round: 6 },
    { t: 'text', x: 520, y: 833, text: 'Zoom G9.2tt (Web MIDI API)', size: 18, color: '#f3f4f6', align: 'center', font: 'mono' },
    { t: 'rect', x: 880, y: 815, w: 600, h: 50, stroke: '#2dd4bf', fill: '#1f2937', sw: 1, rough: 1, seed: 20072, round: 6 },
    { t: 'text', x: 1180, y: 833, text: 'Firebase Cloud (Auth + DB + Hosting)', size: 18, color: '#f3f4f6', align: 'center', font: 'mono' },
    // Footer
    { t: 'text', x: 960, y: 950, text: '"Intencionalidad > Implementaci\u00f3n"', size: 28, color: '#9ca3af', align: 'center', font: 'hand' }
  ];

  /* --- Slide 24: Por Qu\u00e9 Importa --- */
  SLIDES[24] = [
    { t: 'rect', x: 0, y: 0, w: 1920, h: 1080, stroke: 'transparent', fill: '#030712', sw: 0, rough: 0, seed: 24003 },
    // Left (green tint)
    { t: 'rect', x: 0, y: 0, w: 940, h: 860, stroke: 'transparent', fill: '#22c55e', sw: 0, rough: 0, seed: 24004, opacity: 0.04 },
    { t: 'text', x: 470, y: 60, text: 'Dev con experiencia', size: 28, color: '#22c55e', align: 'center', font: 'hand' },
    // Head with green LED
    { t: 'led', cx: 470, cy: 200, r: 50, fill: '#111827', stroke: '#22c55e', seed: 24010 },
    { t: 'led', cx: 470, cy: 200, r: 12, fill: '#22c55e', stroke: '#166534', seed: 24011 },
    { t: 'text', x: 470, y: 310, text: 'Detecta que el\nprotocolo se rompi\u00f3', size: 24, color: '#f3f4f6', align: 'center', font: 'hand' },
    { t: 'arrow', pts: [[470, 400], [470, 480]], stroke: '#22c55e', sw: 2, rough: 1, seed: 24012 },
    { t: 'text', x: 470, y: 520, text: 'Corrige \u2705', size: 32, color: '#22c55e', align: 'center', font: 'hand' },
    // Divider
    { t: 'line', pts: [[960, 30], [960, 860]], stroke: '#a855f7', sw: 2, rough: 0, seed: 24050, glow: '#a855f7' },
    // Right (red tint)
    { t: 'rect', x: 980, y: 0, w: 940, h: 860, stroke: 'transparent', fill: '#ef4444', sw: 0, rough: 0, seed: 24005, opacity: 0.04 },
    { t: 'text', x: 1450, y: 60, text: 'Dev sin contexto', size: 28, color: '#ef4444', align: 'center', font: 'hand' },
    // Head with red LED
    { t: 'led', cx: 1450, cy: 200, r: 50, fill: '#111827', stroke: '#ef4444', seed: 24020 },
    { t: 'led', cx: 1450, cy: 200, r: 12, fill: '#ef4444', stroke: '#991b1b', seed: 24021 },
    { t: 'text', x: 1450, y: 310, text: 'No detecta\nel error', size: 24, color: '#f3f4f6', align: 'center', font: 'hand' },
    { t: 'arrow', pts: [[1450, 400], [1450, 480]], stroke: '#ef4444', sw: 2, rough: 1, seed: 24022 },
    { t: 'text', x: 1450, y: 520, text: 'Env\u00eda datos\ncorruptos \u274C', size: 32, color: '#ef4444', align: 'center', font: 'hand' },
    // Bottom quote
    { t: 'text', x: 960, y: 920, text: '"Tu experiencia es el filtro de calidad."', size: 36, color: '#ffffff', align: 'center', font: 'hand' }
  ];

  /* --- Slide 26: Lecci\u00f3n Inesperada --- */
  SLIDES[25] = [
    { t: 'rect', x: 0, y: 0, w: 1920, h: 1080, stroke: 'transparent', fill: '#030712', sw: 0, rough: 0, seed: 25003 },
    { t: 'text', x: 960, y: 50, text: 'La lecci\u00f3n que no esperaba', size: 36, color: '#f3f4f6', align: 'center', font: 'hand' },

    // === LEFT: "Idea vaga" — messy, chaotic ===
    // Blurry thought cloud (multiple overlapping rects for chaos effect)
    { t: 'rect', x: 100, y: 160, w: 440, h: 400, stroke: '#fbbf24', fill: '#1f2937', sw: 2, rough: 2.5, seed: 25010, round: 20 },
    { t: 'rect', x: 120, y: 180, w: 400, h: 360, stroke: '#fbbf24', fill: 'transparent', sw: 1, rough: 3, seed: 25011, round: 16, opacity: 0.3 },
    { t: 'text', x: 320, y: 215, text: '\uD83D\uDCAD', size: 50, color: '#fbbf24', align: 'center', font: 'hand' },
    { t: 'text', x: 320, y: 290, text: '"Quiero que haga\nalgo con los patches\no algo as\u00ed..."', size: 22, color: '#fbbf24', align: 'center', font: 'hand', opacity: 0.7 },
    // Scattered confused words
    { t: 'text', x: 180, y: 400, text: 'MIDI?', size: 16, color: '#6b7280', align: 'center', font: 'hand', angle: -0.15, opacity: 0.4 },
    { t: 'text', x: 400, y: 430, text: 'bytes?', size: 16, color: '#6b7280', align: 'center', font: 'hand', angle: 0.1, opacity: 0.4 },
    { t: 'text', x: 260, y: 460, text: 'SysEx?', size: 16, color: '#6b7280', align: 'center', font: 'hand', angle: -0.08, opacity: 0.4 },
    { t: 'text', x: 370, y: 490, text: 'encode?', size: 16, color: '#6b7280', align: 'center', font: 'hand', angle: 0.12, opacity: 0.4 },
    { t: 'led', cx: 320, cy: 530, r: 10, fill: '#fbbf24', stroke: '#92400e', seed: 25015, opacity: 0.4 },
    { t: 'text', x: 320, y: 565, text: 'Resultado: VAGO', size: 22, color: '#ef4444', align: 'center', font: 'hand' },
    { t: 'led', cx: 320, cy: 595, r: 8, fill: '#ef4444', stroke: '#991b1b', seed: 25016 },

    // === CENTER: Transformation arrow ===
    { t: 'arrow', pts: [[580, 360], [740, 360]], stroke: '#a855f7', sw: 3, rough: 1, seed: 25020 },
    { t: 'text', x: 660, y: 330, text: 'pensar', size: 20, color: '#a855f7', align: 'center', font: 'hand' },
    { t: 'text', x: 660, y: 395, text: 'articular', size: 20, color: '#a855f7', align: 'center', font: 'hand' },

    // === MIDDLE: "Prompt claro" — structured, precise ===
    { t: 'rect', x: 760, y: 160, w: 440, h: 400, stroke: '#3b82f6', fill: '#1f2937', sw: 2, rough: 0.8, seed: 25030, round: 12 },
    { t: 'text', x: 980, y: 210, text: '\uD83D\uDCDD', size: 50, color: '#3b82f6', align: 'center', font: 'hand' },
    // Structured prompt lines
    { t: 'rect', x: 800, y: 270, w: 360, h: 260, stroke: '#374151', fill: '#111827', sw: 1, rough: 0.5, seed: 25031, round: 8 },
    { t: 'text', x: 830, y: 298, text: 'Lee el patch del slot U05.', size: 18, color: '#22d3ee', align: 'left', font: 'mono' },
    { t: 'text', x: 830, y: 330, text: 'Decodifica nibble + 7-bit.', size: 18, color: '#22d3ee', align: 'left', font: 'mono' },
    { t: 'text', x: 830, y: 362, text: 'Extrae par\u00e1metros del AMP.', size: 18, color: '#22d3ee', align: 'left', font: 'mono' },
    { t: 'text', x: 830, y: 394, text: 'Modifica gain a 0x7F.', size: 18, color: '#22d3ee', align: 'left', font: 'mono' },
    { t: 'text', x: 830, y: 426, text: 'Re-encode + checksum.', size: 18, color: '#22d3ee', align: 'left', font: 'mono' },
    { t: 'text', x: 830, y: 458, text: 'Env\u00eda SysEx al pedal.', size: 18, color: '#22d3ee', align: 'left', font: 'mono' },
    { t: 'text', x: 830, y: 490, text: 'Verifica confirmaci\u00f3n.', size: 18, color: '#22d3ee', align: 'left', font: 'mono' },
    { t: 'led', cx: 980, cy: 545, r: 10, fill: '#3b82f6', stroke: '#1e3a8a', seed: 25035 },

    // === RIGHT: arrow + Result ===
    { t: 'arrow', pts: [[1230, 360], [1390, 360]], stroke: '#22c55e', sw: 3, rough: 1, seed: 25040 },
    { t: 'text', x: 1310, y: 335, text: 'ejecutar', size: 20, color: '#22c55e', align: 'center', font: 'hand' },

    { t: 'rect', x: 1410, y: 200, w: 420, h: 320, stroke: '#22c55e', fill: '#1f2937', sw: 2, rough: 0.5, seed: 25050, round: 12 },
    { t: 'text', x: 1620, y: 250, text: '\u2705', size: 60, color: '#22c55e', align: 'center', font: 'hand' },
    { t: 'text', x: 1620, y: 340, text: 'Resultado\nexacto', size: 32, color: '#22c55e', align: 'center', font: 'hand' },
    { t: 'text', x: 1620, y: 410, text: 'Primera vez', size: 22, color: '#9ca3af', align: 'center', font: 'hand' },
    { t: 'text', x: 1620, y: 440, text: 'Sin ambig\u00fcedad', size: 22, color: '#9ca3af', align: 'center', font: 'hand' },
    { t: 'led', cx: 1620, cy: 490, r: 12, fill: '#22c55e', stroke: '#166534', seed: 25051, glow: true },
    { t: 'led', cx: 1620, cy: 490, r: 35, fill: '#22c55e', stroke: 'transparent', seed: 25052, opacity: 0.06 },

    // === BOTTOM: The insight ===
    { t: 'line', pts: [[200, 680], [1720, 680]], stroke: '#a855f7', sw: 2, rough: 0, seed: 25060, glow: '#a855f7' },
    { t: 'text', x: 960, y: 750, text: '"La IA te obliga a pensar mejor."', size: 48, color: '#ffffff', align: 'center', font: 'hand' },
    { t: 'text', x: 960, y: 830, text: 'Si no puedes articularlo claramente para la IA,', size: 26, color: '#9ca3af', align: 'center', font: 'hand' },
    { t: 'text', x: 960, y: 870, text: 'probablemente tampoco lo tienes claro para ti.', size: 26, color: '#9ca3af', align: 'center', font: 'hand' },
    { t: 'text', x: 960, y: 950, text: 'Te hace mejor ingeniero.', size: 34, color: '#a855f7', align: 'center', font: 'hand' }
  ];

  /* --- Slide 29: El Camino --- */
  SLIDES[28] = [
    { t: 'rect', x: 0, y: 0, w: 1920, h: 1080, stroke: 'transparent', fill: '#030712', sw: 0, rough: 0, seed: 28003 },

    // === Ascending path line (background) ===
    { t: 'line', pts: [[300, 800], [960, 480], [1620, 140]], stroke: '#374151', sw: 3, rough: 1.5, seed: 28001, opacity: 0.3 },
    // Glow trail
    { t: 'line', pts: [[300, 800], [960, 480], [1620, 140]], stroke: '#a855f7', sw: 1, rough: 0, seed: 28002, opacity: 0.1 },

    // === Step 1: APRENDER (bottom-left) ===
    // Outer glow
    { t: 'led', cx: 300, cy: 720, r: 80, fill: '#22c55e', stroke: 'transparent', seed: 28008, opacity: 0.03, id: 's28-step1' },
    // Main box
    { t: 'rect', x: 100, y: 620, w: 400, h: 200, stroke: '#22c55e', fill: '#1f2937', sw: 2, rough: 1, seed: 28010, round: 16, id: 's28-step1' },
    { t: 'text', x: 300, y: 668, text: '1', size: 24, color: '#22c55e', align: 'center', font: 'mono', opacity: 0.5, id: 's28-step1' },
    { t: 'text', x: 300, y: 710, text: 'Aprender', size: 36, color: '#22c55e', align: 'center', font: 'hand', id: 's28-step1' },
    // Detail items
    { t: 'text', x: 300, y: 760, text: 'Pr\u00e1ctica + Teor\u00eda', size: 20, color: '#9ca3af', align: 'center', font: 'hand', id: 's28-step1-detail' },
    { t: 'text', x: 300, y: 790, text: 'Construir. Romper. Leer c\u00f3digo ajeno.', size: 17, color: '#6b7280', align: 'center', font: 'hand', id: 's28-step1-detail' },
    // LED
    { t: 'led', cx: 300, cy: 840, r: 12, fill: '#22c55e', stroke: '#166534', seed: 28011, id: 's28-led1' },
    { t: 'text', x: 300, y: 875, text: 'Como siempre', size: 18, color: '#22c55e', align: 'center', font: 'hand', opacity: 0.7, id: 's28-led1' },

    // === Arrow 1 (ascending) ===
    { t: 'arrow', pts: [[510, 680], [700, 530]], stroke: '#6b7280', sw: 2, rough: 1.5, seed: 28020, id: 's28-arr1' },
    { t: 'text', x: 630, y: 630, text: '+', size: 28, color: '#6b7280', align: 'center', font: 'hand', id: 's28-arr1' },

    // === Step 2: EXPERIMENTAR (center) ===
    { t: 'led', cx: 960, cy: 430, r: 90, fill: '#3b82f6', stroke: 'transparent', seed: 28028, opacity: 0.03, id: 's28-step2' },
    { t: 'rect', x: 720, y: 330, w: 480, h: 220, stroke: '#3b82f6', fill: '#1f2937', sw: 2, rough: 1, seed: 28030, round: 16, id: 's28-step2' },
    { t: 'text', x: 960, y: 375, text: '2', size: 24, color: '#3b82f6', align: 'center', font: 'mono', opacity: 0.5, id: 's28-step2' },
    { t: 'text', x: 960, y: 420, text: 'Experimentar', size: 36, color: '#3b82f6', align: 'center', font: 'hand', id: 's28-step2' },
    { t: 'text', x: 960, y: 470, text: 'Proyectos reales', size: 20, color: '#9ca3af', align: 'center', font: 'hand', id: 's28-step2-detail' },
    { t: 'text', x: 960, y: 500, text: 'Curiosidad aplicada. Resolver problemas propios.', size: 17, color: '#6b7280', align: 'center', font: 'hand', id: 's28-step2-detail' },
    { t: 'led', cx: 960, cy: 545, r: 12, fill: '#3b82f6', stroke: '#1e3a8a', seed: 28031, id: 's28-led2' },
    { t: 'text', x: 960, y: 580, text: 'Cada vez m\u00e1s ambicioso', size: 18, color: '#3b82f6', align: 'center', font: 'hand', opacity: 0.7, id: 's28-led2' },

    // === Arrow 2 (ascending) ===
    { t: 'arrow', pts: [[1210, 400], [1360, 280]], stroke: '#6b7280', sw: 2, rough: 1.5, seed: 28040, id: 's28-arr2' },
    { t: 'text', x: 1310, y: 370, text: '+  \uD83E\uDD16', size: 28, color: '#a855f7', align: 'center', font: 'hand', id: 's28-arr2' },

    // === Step 3: AMPLIFICAR (top-right) — biggest, most dramatic ===
    // Multiple glow layers
    { t: 'led', cx: 1580, cy: 180, r: 160, fill: '#a855f7', stroke: 'transparent', seed: 28048, opacity: 0.03, id: 's28-step3' },
    { t: 'led', cx: 1580, cy: 180, r: 100, fill: '#a855f7', stroke: 'transparent', seed: 28049, opacity: 0.05, id: 's28-glow' },
    { t: 'rect', x: 1340, y: 80, w: 500, h: 280, stroke: '#a855f7', fill: '#1f2937', sw: 3, rough: 1, seed: 28050, round: 16, glow: '#a855f7', id: 's28-step3' },
    { t: 'text', x: 1590, y: 120, text: '3', size: 24, color: '#a855f7', align: 'center', font: 'mono', opacity: 0.5, id: 's28-step3' },
    { t: 'text', x: 1590, y: 168, text: 'Amplificar con IA', size: 36, color: '#a855f7', align: 'center', font: 'hand', id: 's28-step3' },
    { t: 'text', x: 1590, y: 218, text: 'Descubrir qu\u00e9 m\u00e1s se puede hacer', size: 20, color: '#9ca3af', align: 'center', font: 'hand', id: 's28-step3-detail' },
    { t: 'text', x: 1590, y: 248, text: 'Explorar caminos que no conoc\u00edas', size: 20, color: '#9ca3af', align: 'center', font: 'hand', id: 's28-step3-detail' },
    // 10x — BIG and glowing
    { t: 'text', x: 1590, y: 320, text: '10x', size: 72, color: '#a855f7', align: 'center', font: 'hand', id: 's28-10x' },
    { t: 'led', cx: 1590, cy: 380, r: 15, fill: '#a855f7', stroke: '#581c87', seed: 28051, id: 's28-led3', glow: true },

    // === Footer ===
    { t: 'line', pts: [[200, 940], [1720, 940]], stroke: '#a855f7', sw: 2, rough: 0, seed: 28060, glow: '#a855f7', id: 's28-footer' },
    { t: 'text', x: 960, y: 990, text: '"No como muleta. Como amplificador."', size: 36, color: '#ffffff', align: 'center', font: 'hand', id: 's28-footer' }
  ];


  /* ====== RENDERER ====== */

  function hasSlide(index) {
    return !!SLIDES[index];
  }

  function render(slideIndex, canvas, fragmentIndex) {
    var elements = SLIDES[slideIndex];
    if (!elements) return;

    canvas.width = 1920;
    canvas.height = 1080;
    canvas.style.width = '1920px';
    canvas.style.height = '1080px';

    var ctx = canvas.getContext('2d');
    var rc = rough.canvas(canvas);

    ctx.clearRect(0, 0, 1920, 1080);

    /* Determine visible elements based on fragment */
    var visibleIds = getVisibleIds(slideIndex, fragmentIndex);

    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      if (!isVisible(el, visibleIds, slideIndex, fragmentIndex)) continue;

      ctx.save();
      if (el.opacity !== undefined && el.opacity < 1) {
        ctx.globalAlpha = el.opacity;
      }
      if (el.angle) {
        var cx = el.x || el.cx || 0;
        var cy = el.y || el.cy || 0;
        ctx.translate(cx, cy);
        ctx.rotate(el.angle);
        ctx.translate(-cx, -cy);
      }

      switch (el.t) {
        case 'rect': drawRect(rc, ctx, el); break;
        case 'text': drawText(ctx, el); break;
        case 'led': drawLed(rc, ctx, el); break;
        case 'arrow': drawArrow(rc, ctx, el); break;
        case 'line': drawLine(rc, ctx, el); break;
      }

      ctx.restore();
    }
  }

  function getVisibleIds(slideIndex, fragmentIndex) {
    var fragGroups = FRAG_GROUPS[slideIndex];
    if (!fragGroups) return null; // no fragments = all visible

    if (fragmentIndex === undefined || fragmentIndex === null || fragmentIndex < 0) {
      // Only show non-grouped + title/bg elements
      return { mode: 'exclude-fragments' };
    }

    // Collect IDs visible up to this fragment
    var ids = {};
    for (var f = 0; f <= fragmentIndex; f++) {
      var group = fragGroups[f];
      if (group) {
        for (var j = 0; j < group.length; j++) {
          ids[group[j]] = true;
        }
      }
    }
    return { mode: 'include', ids: ids };
  }

  function isVisible(el, visibleIds, slideIndex) {
    if (!visibleIds) return true; // no fragment system
    if (!FRAG_GROUPS[slideIndex]) return true;

    var elId = el.id || '';
    var elGrp = el.grp || '';

    // Background and title always visible
    if (el.t === 'rect' && el.fill === '#030712' && el.w === 1920) return true;
    if (!elId && !elGrp) {
      // Check if this element's group matches any fragment group
      return isNotInAnyFragmentGroup(el, slideIndex);
    }

    if (visibleIds.mode === 'exclude-fragments') {
      // Only show elements NOT in any fragment group
      return isNotInAnyFragmentGroup(el, slideIndex);
    }

    // Check if element id or group is in visible set
    if (elId && visibleIds.ids[elId]) return true;
    if (elGrp && visibleIds.ids[elGrp]) return true;

    // Check if element is not in any fragment group (always visible)
    return isNotInAnyFragmentGroup(el, slideIndex);
  }

  function isNotInAnyFragmentGroup(el, slideIndex) {
    var fragGroups = FRAG_GROUPS[slideIndex];
    if (!fragGroups) return true;
    var elId = el.id || '';
    var elGrp = el.grp || '';
    for (var f in fragGroups) {
      var group = fragGroups[f];
      for (var j = 0; j < group.length; j++) {
        if (elId && group[j] === elId) return false;
        if (elGrp && group[j] === elGrp) return false;
      }
    }
    return true;
  }

  /* --- Draw functions --- */

  function drawRect(rc, ctx, el) {
    var opts = {
      stroke: el.stroke === 'transparent' ? 'transparent' : el.stroke,
      fill: el.fill || 'transparent',
      fillStyle: 'solid',
      strokeWidth: el.sw || 1,
      roughness: el.rough !== undefined ? el.rough : 1,
      seed: el.seed || 1
    };

    if (el.stroke === 'transparent') {
      // Just fill with native canvas
      ctx.fillStyle = el.fill || 'transparent';
      ctx.fillRect(el.x, el.y, el.w, el.h);
    } else {
      rc.rectangle(el.x, el.y, el.w, el.h, opts);
    }

    // Glow effect
    if (el.glow) {
      ctx.save();
      ctx.shadowColor = typeof el.glow === 'string' ? el.glow : el.stroke;
      ctx.shadowBlur = 20;
      ctx.strokeStyle = el.stroke;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      if (el.round) {
        roundRect(ctx, el.x, el.y, el.w, el.h, el.round);
        ctx.stroke();
      } else {
        ctx.strokeRect(el.x, el.y, el.w, el.h);
      }
      ctx.restore();
    }
  }

  function drawText(ctx, el) {
    var font = el.font === 'mono' ? FONT_MONO : FONT_HAND;
    ctx.font = el.size + 'px ' + font;
    ctx.fillStyle = el.color || '#f3f4f6';
    ctx.textAlign = el.align || 'left';
    ctx.textBaseline = 'top';

    var lines = (el.text || '').split('\n');
    var lineHeight = el.size * 1.4;
    var startY = el.y;

    for (var i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], el.x, startY + i * lineHeight);
    }
  }

  function drawLed(rc, ctx, el) {
    // Glow effect
    if (el.fill && el.fill !== 'transparent') {
      ctx.save();
      // Outer glow
      var gradient = ctx.createRadialGradient(el.cx, el.cy, el.r * 0.5, el.cx, el.cy, el.r * 4);
      gradient.addColorStop(0, el.fill + '44');
      gradient.addColorStop(1, el.fill + '00');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(el.cx, el.cy, el.r * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // LED body
    var opts = {
      stroke: el.stroke === 'transparent' ? 'transparent' : (el.stroke || '#333'),
      fill: el.fill || '#22c55e',
      fillStyle: 'solid',
      strokeWidth: 1,
      roughness: 0,
      seed: el.seed || 1
    };

    if (el.stroke === 'transparent') {
      ctx.save();
      ctx.globalAlpha = el.opacity || 1;
      ctx.fillStyle = el.fill;
      ctx.beginPath();
      ctx.arc(el.cx, el.cy, el.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      rc.circle(el.cx, el.cy, el.r * 2, opts);
    }
  }

  function drawArrow(rc, ctx, el) {
    var pts = el.pts;
    if (!pts || pts.length < 2) return;

    var opts = {
      stroke: el.stroke || '#9ca3af',
      strokeWidth: el.sw || 2,
      roughness: el.rough !== undefined ? el.rough : 1,
      seed: el.seed || 1
    };

    // Draw line segments
    for (var i = 0; i < pts.length - 1; i++) {
      rc.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], opts);
    }

    // Draw arrowhead at end
    var last = pts[pts.length - 1];
    var prev = pts[pts.length - 2];
    drawArrowhead(ctx, prev[0], prev[1], last[0], last[1], el.stroke || '#9ca3af', el.sw || 2);

    // Bidirectional
    if (el.bidir) {
      var first = pts[0];
      var second = pts[1];
      drawArrowhead(ctx, second[0], second[1], first[0], first[1], el.stroke || '#9ca3af', el.sw || 2);
    }
  }

  function drawArrowhead(ctx, fromX, fromY, toX, toY, color, sw) {
    var angle = Math.atan2(toY - fromY, toX - fromX);
    var headLen = 12 + sw * 2;
    var a1 = angle - Math.PI / 6;
    var a2 = angle + Math.PI / 6;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = sw;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(toX - headLen * Math.cos(a1), toY - headLen * Math.sin(a1));
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(a2), toY - headLen * Math.sin(a2));
    ctx.stroke();
    ctx.restore();
  }

  function drawLine(rc, ctx, el) {
    var pts = el.pts;
    if (!pts || pts.length < 2) return;

    var opts = {
      stroke: el.stroke || '#6b7280',
      strokeWidth: el.sw || 1,
      roughness: el.rough !== undefined ? el.rough : 0,
      seed: el.seed || 1
    };

    for (var i = 0; i < pts.length - 1; i++) {
      rc.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], opts);
    }

    // Glow
    if (el.glow) {
      ctx.save();
      ctx.shadowColor = typeof el.glow === 'string' ? el.glow : el.stroke;
      ctx.shadowBlur = 15;
      ctx.strokeStyle = el.stroke;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var j = 1; j < pts.length; j++) {
        ctx.lineTo(pts[j][0], pts[j][1]);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  return {
    hasSlide: hasSlide,
    render: render
  };
})();
