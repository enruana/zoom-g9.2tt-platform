# Story 4.1: Build Pedalboard Module Grid

Status: done

## Story

As a **user**,
I want **to see all 10 effect modules in my patch**,
So that **I can understand the signal chain and choose what to edit**.

## Acceptance Criteria

1. **AC1:** I see all 10 modules displayed: AMP, COMP, WAH, EXT, ZNR, EQ, CAB, MOD, DLY, REV ✅
2. **AC2:** Each module shows its name and current effect type ✅
3. **AC3:** Each module shows on/off status with visual indicator (lit/dim) ✅
4. **AC4:** Modules are arranged in a logical layout (matching pedal signal flow) ✅
5. **AC5:** Clicking a module selects it for editing ✅
6. **AC6:** The selected module is visually highlighted ✅
7. **AC7:** The layout is responsive (stacks on mobile, grid on desktop) ✅

## Tasks / Subtasks

- [x] Task 1: Create effect types data (AC: 2)
  - [x] Create `src/data/effectTypes.ts` with type names per module
  - [x] Export getEffectTypeName(module, typeId) helper function

- [x] Task 2: Create ModuleMini component (AC: 1, 2, 3, 5, 6)
  - [x] Create `src/components/pedalboard/ModuleMini.tsx`
  - [x] Display module name, effect type name
  - [x] Visual on/off indicator (lit LED vs dim)
  - [x] Selected state with highlight ring

- [x] Task 3: Add selectedModule state (AC: 5, 6)
  - [x] Add selectedModule useState in Editor
  - [x] Handle module selection and deselection (toggle)
  - [x] Show selected module info panel

- [x] Task 4: Create Pedalboard layout (AC: 4, 7)
  - [x] Create Pedalboard.tsx component
  - [x] Arrange modules in SIGNAL_CHAIN_ORDER
  - [x] Responsive grid: 5 cols desktop, 3 cols tablet, 2 cols mobile
  - [x] INPUT/OUTPUT flow indicators

- [x] Task 5: Verify implementation
  - [x] Build passes: 272KB JS, 27KB CSS
  - [x] Lint passes

## Dev Notes

### Module Signal Flow Order

Based on G9.2tt actual signal chain:
1. COMP (Compressor)
2. WAH (Wah/EFX1)
3. ZNR (Noise Reduction)
4. AMP (Amplifier/Distortion)
5. CAB (Cabinet Simulator)
6. EQ (6-Band Equalizer)
7. MOD (Modulation/EFX2)
8. DLY (Delay)
9. REV (Reverb)
10. EXT (External Loop)

### Effect Type Counts

From PARAMETER_MAP.md:
- AMP: 44 types
- COMP: 3 types
- WAH: 17 types
- EXT: 1 type (no selector)
- ZNR: 3 types
- EQ: no types (6-band fixed)
- CAB: no types (fixed params)
- MOD: 28 types
- DLY: 7 types
- REV: 15 types

### Module Color Scheme

Each module has a unique color for visual distinction:
- COMP: orange
- WAH: green
- ZNR: gray
- AMP: red
- CAB: amber
- EQ: blue
- MOD: purple
- DLY: cyan
- REV: pink
- EXT: slate

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created `src/data/effectTypes.ts` with all effect types:
  - AMP_TYPES (44 types), COMP_TYPES (3), WAH_TYPES (17), ZNR_TYPES (3)
  - MOD_TYPES (28), DLY_TYPES (7), REV_TYPES (15)
  - EXT_TYPES, EQ_TYPES, CAB_TYPES (single-type modules)
  - MODULE_INFO with display names, colors, descriptions
  - SIGNAL_CHAIN_ORDER for correct module arrangement
  - Helper functions: getEffectTypeName, getEffectTypeShortName, hasMultipleTypes

- Created `src/components/pedalboard/ModuleMini.tsx`:
  - Displays module name and effect type short name
  - LED indicator (colored when enabled, gray when disabled)
  - Selection ring with module-specific color
  - Disabled opacity effect
  - Accessible with ARIA labels

- Created `src/components/pedalboard/Pedalboard.tsx`:
  - Renders modules in signal chain order
  - Responsive grid layout (2/3/5 columns)
  - INPUT/OUTPUT flow indicators
  - Supports controlled and uncontrolled selection modes

- Updated `src/pages/Editor.tsx`:
  - Added selectedModule state
  - Replaced old grid with Pedalboard component
  - Added selected module info panel with:
    - Module full name and description
    - ON/OFF status badge
    - Close button
    - Effect type display

- Build passes: 272.44KB JS, 27.25KB CSS
- Lint passes

### File List

**Created:**
- `zoom-g9.2tt-web/src/data/effectTypes.ts` - Effect type definitions and helpers
- `zoom-g9.2tt-web/src/components/pedalboard/ModuleMini.tsx` - Mini module card component
- `zoom-g9.2tt-web/src/components/pedalboard/Pedalboard.tsx` - Module grid layout

**Modified:**
- `zoom-g9.2tt-web/src/pages/Editor.tsx` - Integrated new Pedalboard component
