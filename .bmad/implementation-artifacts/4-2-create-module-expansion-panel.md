# Story 4.2: Create Module Expansion Panel

Status: done

## Story

As a **user**,
I want **to see all parameters of a selected module**,
So that **I can view and adjust the effect settings**.

## Acceptance Criteria

1. **AC1:** When a module is selected, an expansion panel slides up from the bottom ✅
2. **AC2:** The panel shows the module name and effect type prominently ✅
3. **AC3:** The panel displays all parameters for that module as visual knobs ✅
4. **AC4:** Each knob shows current value position ✅
5. **AC5:** Parameter names are displayed below each knob ✅
6. **AC6:** Clicking outside the panel or pressing ESC closes it ✅
7. **AC7:** The panel is scrollable if parameters don't fit ✅
8. **AC8:** Parameter data comes from `src/data/parameterMaps.ts` ✅

## Tasks / Subtasks

- [x] Task 1: Create parameter maps data (AC: 8)
  - [x] Create `src/data/parameterMaps.ts`
  - [x] Define parameter definitions per module and type
  - [x] Include name, min, max, unit for each parameter
  - [x] Helper functions: getModuleParameters, getEditableParameters, formatParameterValue

- [x] Task 2: Create Knob component (AC: 3, 4, 5)
  - [x] Create `src/components/parameter/Knob.tsx`
  - [x] Visual knob with rotation based on value (SVG arc)
  - [x] Display parameter name and formatted value
  - [x] Clickable to open editor (placeholder for Story 4.3)
  - [x] Multiple sizes (sm, md, lg)

- [x] Task 3: Create ModulePanel component (AC: 1, 2, 6, 7)
  - [x] Create `src/components/pedalboard/ModulePanel.tsx`
  - [x] Slide-up animation from bottom (CSS keyframes)
  - [x] Module name, type display, ON/OFF toggle button
  - [x] Type selector button (placeholder for Story 4.5)
  - [x] Parameter knob grid
  - [x] Scrollable content area (overflow-x-auto)
  - [x] Close on ESC key or backdrop click
  - [x] Footer hint text

- [x] Task 4: Integrate with Editor (AC: all)
  - [x] Import ModulePanel
  - [x] Render ModulePanel when selectedModule is set
  - [x] Add handler callbacks for panel interactions
  - [x] Remove old inline info panel

- [x] Task 5: Verify implementation
  - [x] Build passes: 283KB JS, 32KB CSS
  - [x] Lint passes

## Dev Notes

### Parameter Maps Structure

Each module has:
- `common`: Always present (On/Off, Type)
- `byType`: Type-specific parameters (keyed by type ID)
- `default`: Fallback when type-specific not defined

### Knob Component Features

- SVG arc for value visualization (270-degree range)
- Gradient background for 3D appearance
- Inner knob with indicator line
- Rotation from -135° (min) to +135° (max)
- Center value display with formatting
- Disabled state with opacity

### ModulePanel Features

- Fixed position modal with backdrop
- Slide-up animation (0.2s ease-out)
- Header: Module name, ON/OFF button, Type selector, Close button
- Body: Flex-wrap grid of Knob components
- Footer: Hint text for user guidance
- Keyboard accessible (ESC to close)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created `src/data/parameterMaps.ts`:
  - ParameterDef interface with id, name, shortName, min, max, unit, values, defaultValue
  - ModuleParameterMap interface with common, byType, default parameters
  - Complete parameter definitions for all 10 modules
  - Type-specific parameters for COMP, WAH, MOD with different types
  - Helper functions: getModuleParameters, getEditableParameters, formatParameterValue
  - Special handling for EQ dB values (16 = 0dB center)

- Created `src/components/parameter/Knob.tsx`:
  - Visual knob with SVG arc showing value
  - Configurable sizes (sm: 48px, md: 64px, lg: 80px)
  - Value-to-angle conversion (-135° to +135°)
  - Formatted value display in center
  - Parameter shortName below knob
  - Disabled state with opacity

- Created `src/components/pedalboard/ModulePanel.tsx`:
  - Fixed modal overlay with backdrop blur
  - Slide-up animation using CSS keyframes
  - Header with module name, ON/OFF toggle, type selector, close button
  - Grid of Knob components for editable parameters
  - ESC key and backdrop click to close
  - Focus management for accessibility

- Updated `src/pages/Editor.tsx`:
  - Added ModulePanel import
  - Added handler callbacks (handleClosePanel, handleParameterClick, handleToggleEnabled, handleTypeSelect)
  - Removed old inline info panel
  - Render ModulePanel as modal when module selected

- Build: 282.84KB JS, 31.92KB CSS
- Lint passes

### File List

**Created:**
- `zoom-g9.2tt-web/src/data/parameterMaps.ts` - Parameter definitions per module
- `zoom-g9.2tt-web/src/components/parameter/Knob.tsx` - Visual knob component
- `zoom-g9.2tt-web/src/components/pedalboard/ModulePanel.tsx` - Module expansion panel

**Modified:**
- `zoom-g9.2tt-web/src/pages/Editor.tsx` - Integrated ModulePanel
