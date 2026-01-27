# Story 4.4: Add 7-Segment Display and Precision Buttons

Status: done

## Story

As a **user**,
I want **to see exact parameter values and make fine adjustments**,
So that **I can dial in precise settings**.

## Acceptance Criteria

1. **AC1:** I see a 7-segment style display showing the current value ✅
2. **AC2:** The display updates in real-time as I move the slider ✅
3. **AC3:** I see a "+" button to increment the value by 1 ✅
4. **AC4:** I see a "-" button to decrement the value by 1 ✅
5. **AC5:** Holding +/- buttons accelerates the change speed ✅
6. **AC6:** Values are clamped to valid range (no overflow) ✅
7. **AC7:** `src/components/parameter/SevenSegment.tsx` renders the display ✅
8. **AC8:** `src/components/parameter/PrecisionButtons.tsx` renders +/- buttons ✅

## Tasks / Subtasks

- [x] Task 1: Create SevenSegment component (AC: 1, 2, 7)
  - [x] Create `src/components/parameter/SevenSegment.tsx`
  - [x] SVG-based 7-segment digit display
  - [x] Support for multi-digit numbers (configurable digits prop)
  - [x] Configurable size (sm/md/lg) and color
  - [x] Dim segments shown at 12% opacity

- [x] Task 2: Create PrecisionButtons component (AC: 3, 4, 5, 6, 8)
  - [x] Create `src/components/parameter/PrecisionButtons.tsx`
  - [x] Plus and minus buttons (arrow icons for vertical)
  - [x] Hold-to-repeat with acceleration:
    - Initial: 400ms delay, then 100ms repeat
    - After 10 repeats: accelerate to 50ms
  - [x] Value clamping to min/max
  - [x] Vertical or horizontal orientation

- [x] Task 3: Integrate with ParameterModal (AC: all)
  - [x] Replace large text value with SevenSegment
  - [x] Add PrecisionButtons next to slider
  - [x] Dynamic digit count based on parameter range

- [x] Task 4: Verify implementation
  - [x] Build passes: 292KB JS, 34KB CSS
  - [x] Lint passes

## Dev Notes

### 7-Segment Display

Standard 7-segment layout with SVG paths:
```
 aaaa
f    b
f    b
 gggg
e    c
e    c
 dddd
```

Each segment is a polygon path with angled ends for authentic look.
Segments lit per digit defined in SEGMENT_MAP constant.

### Hold-to-Repeat Logic

1. On pointerdown: execute action, start 400ms timeout
2. After timeout: start 100ms interval
3. After 10 repeats: switch to 50ms interval (acceleration)
4. On pointerup/leave/cancel: clear all timers

### Sizes

| Size | Width | Height | Stroke |
|------|-------|--------|--------|
| sm   | 20px  | 36px   | 3px    |
| md   | 30px  | 54px   | 4px    |
| lg   | 40px  | 72px   | 5px    |

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created `src/components/parameter/SevenSegment.tsx`:
  - SVG-based 7-segment display
  - SEGMENT_MAP defines which segments light for each digit (0-9, -, space)
  - Configurable: value, digits, size (sm/md/lg), color
  - Three sizes with proportional stroke widths
  - Dim segments at 12% opacity for LCD effect
  - Handles negative numbers and padding

- Created `src/components/parameter/PrecisionButtons.tsx`:
  - Vertical or horizontal orientation
  - Plus/minus buttons with arrow icons (vertical) or +/- text (horizontal)
  - Hold-to-repeat with acceleration
  - Disabled state when at min/max
  - Pointer events for touch and mouse
  - Cleanup timers on unmount

- Updated `src/components/parameter/ParameterModal.tsx`:
  - Replaced text value display with SevenSegment (green color)
  - Added PrecisionButtons to the left of slider
  - Dynamic digit count based on parameter.max length
  - Updated hint text

- Build: 292.21KB JS, 34.00KB CSS
- Lint passes

### File List

**Created:**
- `zoom-g9.2tt-web/src/components/parameter/SevenSegment.tsx` - SVG 7-segment display
- `zoom-g9.2tt-web/src/components/parameter/PrecisionButtons.tsx` - +/- buttons with hold-to-repeat

**Modified:**
- `zoom-g9.2tt-web/src/components/parameter/ParameterModal.tsx` - Integrated new components
