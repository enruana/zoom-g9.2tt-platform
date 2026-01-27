---
stepsCompleted: [1, 2, 3, 4]
status: complete
completedAt: '2026-01-26'
inputDocuments:
  - prd.md
  - architecture.md
---

# zoom-g9.2tt-platform - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for zoom-g9.2tt-platform, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Device Connection (6 FRs)**
- FR1: User can detect available MIDI devices in the browser
- FR2: User can select a specific MIDI device from the list
- FR3: User can see connection status (connected/disconnected/connecting)
- FR4: User can retry connection after failure
- FR5: User can disconnect from the current device
- FR6: System can identify if connected device is a Zoom G9.2tt

**Patch Management (7 FRs)**
- FR7: User can view a list of all 100 patches on the device
- FR8: User can select a patch to view/edit
- FR9: User can see patch name and basic info
- FR10: User can read all patch data from the device
- FR11: User can write modified patch data to the device
- FR12: User can duplicate a patch to a new slot
- FR13: User can rename a patch

**Parameter Editing (8 FRs)**
- FR14: User can view all 10 effect modules in a patch (AMP, COMP, WAH, EXT, ZNR, EQ, CAB, MOD, DLY, REV)
- FR15: User can select a module to expand and edit
- FR16: User can view all parameters of a selected module
- FR17: User can edit parameter values via modal slider
- FR18: User can see current parameter value in 7-segment style display
- FR19: User can fine-tune parameters with +/- buttons
- FR20: User can change effect type within a module
- FR21: System sends parameter changes to device in real-time

**Visual Experience (5 FRs)**
- FR22: User can see 3D G9.2tt model on splash screen
- FR23: User can see particle transition animation when connecting
- FR24: User can view pedalboard with illustrated module pedals
- FR25: User can see visual knob positions reflecting parameter values
- FR26: System respects user's reduced-motion preference

**User Authentication (4 FRs)**
- FR27: User can sign in with Gmail account
- FR28: User can sign out
- FR29: User can see their account info
- FR30: System persists session across page reloads

**Data Synchronization (4 FRs)**
- FR31: System saves user's patches to cloud storage
- FR32: User can access saved patches from any device
- FR33: System syncs patches when user logs in on new device
- FR34: User can see sync status

**Demo Mode (4 FRs)**
- FR35: User can enter demo mode without hardware connected
- FR36: User can explore all UI and modules in demo mode
- FR37: User can edit parameters in demo mode (no device write)
- FR38: User can switch from demo to connected mode seamlessly

**Error Handling (4 FRs)**
- FR39: User can see clear error messages when connection fails
- FR40: User can access troubleshooting guidance
- FR41: System shows browser compatibility warning when needed
- FR42: System handles unexpected disconnection gracefully

**Session Management (3 FRs)**
- FR43: User can undo recent parameter changes
- FR44: User can redo undone changes
- FR45: System warns user about unsaved changes before leaving

### NonFunctional Requirements

**Performance (5 NFRs)**
- NFR1: Parameter changes must be audible within 100ms
- NFR2: Page must be interactive within 3 seconds
- NFR3: Initial bundle must be under 500KB
- NFR4: 3D assets must lazy load without blocking UI
- NFR5: MIDI connection must establish within 500ms

**Security (4 NFRs)**
- NFR6: All traffic must use HTTPS (required for Web MIDI)
- NFR7: Firebase Auth must be the only authentication method
- NFR8: User data in Firestore must be scoped to authenticated user only
- NFR9: No sensitive data stored in localStorage

**Accessibility (4 NFRs)**
- NFR10: All interactive elements must be keyboard accessible
- NFR11: Color contrast must meet WCAG 2.1 AA (4.5:1)
- NFR12: Animations must respect `prefers-reduced-motion`
- NFR13: ARIA labels on all non-text interactive elements

**Integration (4 NFRs)**
- NFR14: Must work with Web MIDI API in Chrome 89+ and Edge 89+
- NFR15: Must gracefully degrade when Web MIDI unavailable
- NFR16: Firebase SDK must be latest stable version
- NFR17: Must handle Firebase service outages gracefully

### Additional Requirements

**From Architecture - Starter Template:**
- Project initialization: `npm create vite@latest zoom-g9.2tt-web -- --template react-ts`
- Post-init setup: Tailwind CSS, Firebase SDK, Three.js + @react-three/fiber, Vitest
- Epic 1 Story 1 must be project scaffolding

**From Architecture - Data Model:**
- Patch interface with id (0-99), name (10 chars max), modules
- PatchModules with 10 effect modules (amp, comp, wah, ext, znr, eq, cab, mod, dly, rev)
- ModuleState with enabled, type, params array
- ParameterChange for real-time updates

**From Architecture - Project Structure:**
- 15 React components across 4 feature folders
- 4 contexts: DeviceContext, PatchContext, AuthContext, HistoryContext
- 4 hooks: useMidi, usePatches, useFirestore, useMotionPreference
- 2 service domains: midi/, firebase/

**From Architecture - MIDI Service:**
- MidiService class with connection state machine
- Methods: requestAccess, connect, disconnect, readPatch, writePatch, sendParameter
- Protocol builders for SysEx messages
- CRC-32 checksum implementation

**From Architecture - Infrastructure:**
- Firebase Hosting with automatic HTTPS
- GitHub Actions CI/CD pipeline
- Environment configuration via .env

**From Architecture - Patterns:**
- DataSource interface for demo/connected mode abstraction
- Immutable state updates required
- Error handling pattern with try/catch/finally
- Component structure template defined

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 2 | MIDI device detection |
| FR2 | Epic 2 | Device selection |
| FR3 | Epic 2 | Connection status display |
| FR4 | Epic 2 | Retry connection |
| FR5 | Epic 2 | Disconnect |
| FR6 | Epic 2 | G9.2tt identification |
| FR7 | Epic 3 | Patch list view |
| FR8 | Epic 3 | Patch selection |
| FR9 | Epic 3 | Patch name/info |
| FR10 | Epic 3 | Read patch data |
| FR11 | Epic 5 | Write patch to device |
| FR12 | Epic 5 | Duplicate patch |
| FR13 | Epic 5 | Rename patch |
| FR14 | Epic 4 | View 10 modules |
| FR15 | Epic 4 | Module expansion |
| FR16 | Epic 4 | View parameters |
| FR17 | Epic 4 | Modal slider editing |
| FR18 | Epic 4 | 7-segment display |
| FR19 | Epic 4 | +/- buttons |
| FR20 | Epic 4 | Effect type change |
| FR21 | Epic 4 | Real-time parameter send |
| FR22 | Epic 7 | 3D splash model |
| FR23 | Epic 7 | Particle transition |
| FR24 | Epic 7 | Illustrated pedalboard |
| FR25 | Epic 7 | Visual knobs |
| FR26 | Epic 7 | Reduced-motion |
| FR27 | Epic 6 | Gmail sign-in |
| FR28 | Epic 6 | Sign out |
| FR29 | Epic 6 | Account info |
| FR30 | Epic 6 | Session persistence |
| FR31 | Epic 6 | Cloud storage |
| FR32 | Epic 6 | Cross-device access |
| FR33 | Epic 6 | New device sync |
| FR34 | Epic 6 | Sync status |
| FR35 | Epic 2 | Enter demo mode |
| FR36 | Epic 2 | Demo UI exploration |
| FR37 | Epic 2 | Demo parameter editing |
| FR38 | Epic 2 | Demo to connected switch |
| FR39 | Epic 2 | Error messages |
| FR40 | Epic 2 | Troubleshooting |
| FR41 | Epic 2 | Browser warning |
| FR42 | Epic 2 | Disconnection handling |
| FR43 | Epic 4 | Undo |
| FR44 | Epic 4 | Redo |
| FR45 | Epic 4 | Unsaved changes warning |

## Epic List

### Epic 1: Project Foundation
The project is initialized with all dependencies, folder structure, and configuration ready for development.

**FRs covered:** Architecture requirements (starter template, project structure, base configuration)

### Epic 2: Device Connection & Demo Mode
User can connect their Zoom G9.2tt via Web MIDI, or explore the app in demo mode without hardware.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR35, FR36, FR37, FR38, FR39, FR40, FR41, FR42

### Epic 3: Patch Browsing
User can view the list of 100 patches and select one to see its details.

**FRs covered:** FR7, FR8, FR9, FR10

### Epic 4: Parameter Editing
User can view all 10 effect modules, expand one, and edit its parameters with real-time feedback to the device.

**FRs covered:** FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR43, FR44, FR45

### Epic 5: Patch Persistence
User can save their changes back to the pedal, duplicate patches, and rename them.

**FRs covered:** FR11, FR12, FR13

### Epic 6: Authentication & Cloud Sync
User can sign in with Gmail and sync their patches to the cloud for access from any device.

**FRs covered:** FR27, FR28, FR29, FR30, FR31, FR32, FR33, FR34

### Epic 7: Visual Experience
User enjoys a premium visual experience with 3D model, particle transitions, and illustrated pedalboard.

**FRs covered:** FR22, FR23, FR24, FR25, FR26

---

## Epic 1: Project Foundation

The project is initialized with all dependencies, folder structure, and configuration ready for development.

### Story 1.1: Initialize Vite Project with React and TypeScript

As a **developer**,
I want **a properly configured Vite + React + TypeScript project**,
So that **I have a solid foundation to build the application**.

**Acceptance Criteria:**

**Given** I have Node.js installed
**When** I run the initialization command `npm create vite@latest zoom-g9.2tt-web -- --template react-ts`
**Then** a new project is created with React 18 and TypeScript 5.x
**And** the project compiles without errors using `npm run build`
**And** the dev server starts successfully with `npm run dev`
**And** TypeScript is configured with strict mode enabled
**And** ESLint is configured for React + TypeScript

---

### Story 1.2: Configure Tailwind CSS

As a **developer**,
I want **Tailwind CSS configured in the project**,
So that **I can rapidly build responsive UI with utility classes**.

**Acceptance Criteria:**

**Given** the Vite project from Story 1.1 exists
**When** I install Tailwind CSS with `npm install -D tailwindcss postcss autoprefixer`
**Then** Tailwind is initialized with `npx tailwindcss init -p`
**And** `tailwind.config.js` includes content paths for all `.tsx` files
**And** `src/index.css` includes Tailwind directives (@tailwind base, components, utilities)
**And** a test component renders with Tailwind classes correctly
**And** the build completes without CSS errors

---

### Story 1.3: Setup Firebase Configuration

As a **developer**,
I want **Firebase SDK configured with environment variables**,
So that **the app can use Firebase Auth and Firestore**.

**Acceptance Criteria:**

**Given** the project with Tailwind from Story 1.2 exists
**When** I install Firebase with `npm install firebase`
**Then** `src/services/firebase/config.ts` exports initialized Firebase app
**And** Firebase configuration uses `import.meta.env.VITE_*` variables
**And** `.env.example` documents all required Firebase environment variables
**And** `.env` is added to `.gitignore`
**And** the app builds successfully with placeholder environment values
**And** a console warning appears if Firebase config is missing (graceful degradation)

---

### Story 1.4: Create Project Structure and Routing

As a **developer**,
I want **the complete folder structure and routing configured**,
So that **all future stories have a consistent place to add code**.

**Acceptance Criteria:**

**Given** the project with Firebase config from Story 1.3 exists
**When** I create the folder structure from Architecture document
**Then** the following folders exist:
- `src/components/common/`
- `src/components/pedalboard/`
- `src/components/parameter/`
- `src/components/splash/`
- `src/contexts/`
- `src/hooks/`
- `src/services/midi/`
- `src/services/firebase/`
- `src/types/`
- `src/data/`
- `src/pages/`

**And** React Router v6 is installed and configured in `App.tsx`
**And** route `/` renders `Splash.tsx` placeholder component
**And** route `/editor` renders `Editor.tsx` placeholder component
**And** navigation between routes works correctly
**And** a 404 fallback redirects to `/`

---

## Epic 2: Device Connection & Demo Mode

User can connect their Zoom G9.2tt via Web MIDI, or explore the app in demo mode without hardware.

### Story 2.1: Create Device Context and Connection State Machine

As a **developer**,
I want **a DeviceContext that manages connection state**,
So that **all components can react to device connection changes**.

**Acceptance Criteria:**

**Given** the project structure from Epic 1 exists
**When** I create `src/contexts/DeviceContext.tsx`
**Then** the context exports a provider and `useDevice()` hook
**And** connection state includes: `disconnected`, `connecting`, `connected`, `demo`, `error`
**And** the context provides `state` object with `status`, `deviceId`, `deviceName`, `error`
**And** the context provides `actions` object with `setConnecting`, `setConnected`, `setDemo`, `setError`, `disconnect`
**And** TypeScript types are defined in `src/types/midi.ts`
**And** the provider wraps the app in `App.tsx`

---

### Story 2.2: Implement Web MIDI Service

As a **user**,
I want **the app to detect available MIDI devices**,
So that **I can see my Zoom G9.2tt in the device list**.

**Acceptance Criteria:**

**Given** I am on a browser that supports Web MIDI API (Chrome/Edge)
**When** the app requests MIDI access
**Then** `MidiService.requestAccess()` returns a `MIDIAccess` object
**And** `MidiService.getDevices()` returns list of available MIDI input/output pairs
**And** each device shows `id` and `name` properties
**And** `MidiService.connect(deviceId)` stores references to input/output ports
**And** `MidiService.disconnect()` closes the connection and clears references
**And** `MidiService.isConnected` returns current connection state
**And** the service is a singleton exported from `src/services/midi/MidiService.ts`

---

### Story 2.3: Build Splash Screen with Connection Flow

As a **user**,
I want **to see a splash screen where I can connect my device or try demo mode**,
So that **I can start using the app**.

**Acceptance Criteria:**

**Given** I navigate to the app root URL `/`
**When** the Splash page loads
**Then** I see a welcome message and app branding
**And** I see a "Connect Device" button
**And** I see a "Try Demo" button
**And** clicking "Connect Device" triggers MIDI access request
**And** if MIDI access is granted, I see a list of available MIDI devices
**And** I can select a device from the list to connect
**And** connection status is displayed (connecting spinner, connected success)
**And** after successful connection, I am navigated to `/editor`
**And** clicking "Try Demo" navigates to `/editor` in demo mode

---

### Story 2.4: Implement Demo Mode Data Source

As a **user**,
I want **to explore the app without connecting hardware**,
So that **I can see what the app offers before buying a G9.2tt**.

**Acceptance Criteria:**

**Given** I click "Try Demo" on the splash screen
**When** the app enters demo mode
**Then** `DeviceContext` state is set to `demo`
**And** a `DataSource` interface is defined with `readPatch`, `writePatch`, `sendParameter` methods
**And** `DemoDataSource` implements this interface with mock data
**And** `src/data/demoPatches.ts` contains sample patch data for all 100 patches
**And** the Editor page loads with demo patches visible
**And** all UI interactions work (selecting modules, viewing parameters)
**And** parameter changes update local state but show "Demo Mode" indicator
**And** I can switch from demo to connected mode by returning to splash and connecting

---

### Story 2.5: Add Error Handling and Troubleshooting UI

As a **user**,
I want **clear error messages and troubleshooting help when connection fails**,
So that **I can resolve issues and successfully connect**.

**Acceptance Criteria:**

**Given** I attempt to connect to a MIDI device
**When** the connection fails or Web MIDI is unavailable
**Then** I see a clear error message explaining what went wrong
**And** I see a "Troubleshoot" link/button
**And** clicking Troubleshoot shows tips: "Check USB connection", "Ensure MIDI interface is powered", "Try Chrome or Edge browser"
**And** if Web MIDI API is not supported, I see "Browser not supported" warning with recommended browsers
**And** I see a "Retry Connection" button to try again
**And** if device disconnects unexpectedly during use, a toast notification appears
**And** the app gracefully returns to splash screen on unexpected disconnect

---

### Story 2.6: Implement Device Identification and G9.2tt Detection

As a **user**,
I want **the app to verify my device is a Zoom G9.2tt**,
So that **I know the app will work correctly with my hardware**.

**Acceptance Criteria:**

**Given** I have selected a MIDI device and clicked connect
**When** the connection is established
**Then** `MidiService` sends an identity request SysEx message
**And** the response is parsed to check for Zoom manufacturer ID (0x52) and G9.2tt model ID
**And** if the device is identified as G9.2tt, connection proceeds normally
**And** if the device is not a G9.2tt, a warning is shown: "This device may not be a Zoom G9.2tt"
**And** the user can choose to continue anyway or select a different device
**And** `DeviceContext` stores the identified device info (manufacturer, model)

---

## Epic 3: Patch Browsing

User can view the list of 100 patches and select one to see its details.

### Story 3.1: Create Patch Context and Data Types

As a **developer**,
I want **a PatchContext that manages patch data and selection**,
So that **all components can access and modify patch state**.

**Acceptance Criteria:**

**Given** the DeviceContext from Epic 2 exists
**When** I create `src/contexts/PatchContext.tsx`
**Then** the context exports a provider and `usePatch()` hook
**And** `src/types/patch.ts` defines `Patch`, `PatchModules`, `ModuleState` interfaces matching Architecture spec
**And** state includes: `patches` (array of 100), `selectedPatchId`, `currentPatch`, `isLoading`
**And** actions include: `setPatches`, `selectPatch`, `updateCurrentPatch`
**And** the provider wraps the app inside DeviceContext provider
**And** `currentPatch` is derived from `selectedPatchId` and `patches` array

---

### Story 3.2: Implement Patch Reading from Device

As a **user**,
I want **to read patch data from my G9.2tt**,
So that **I can see and edit my actual patches**.

**Acceptance Criteria:**

**Given** I am connected to a G9.2tt device
**When** the app requests patch data
**Then** `MidiService.readPatch(patchId)` sends the correct SysEx read command (0x11)
**And** `src/services/midi/protocol.ts` exports `buildReadPatchMessage(patchId)` function
**And** the service waits for the device response with timeout (2 seconds)
**And** the response is parsed into a `Patch` object with all module data
**And** `MidiService.readAllPatches()` reads all 100 patches sequentially with progress callback
**And** patch names are decoded from the SysEx response (10 characters)
**And** reading errors are caught and reported via callback

---

### Story 3.3: Build Patch List UI

As a **user**,
I want **to see a list of all my patches**,
So that **I can browse and select the one I want to edit**.

**Acceptance Criteria:**

**Given** I am on the Editor page with patches loaded
**When** I view the patch list
**Then** I see a scrollable list of all 100 patches (0-99)
**And** each patch shows its number and name
**And** the currently selected patch is visually highlighted
**And** clicking a patch selects it and updates `PatchContext.selectedPatchId`
**And** the list shows a loading indicator while patches are being read
**And** in demo mode, the list shows demo patch names
**And** the patch list is accessible via keyboard navigation

---

### Story 3.4: Display Selected Patch Info

As a **user**,
I want **to see details of my selected patch**,
So that **I know what I'm about to edit**.

**Acceptance Criteria:**

**Given** I have selected a patch from the list
**When** the patch is selected
**Then** I see the patch name prominently displayed
**And** I see a summary showing which modules are enabled/disabled
**And** I see the patch number (e.g., "Patch 42")
**And** the info updates immediately when I select a different patch
**And** if no patch is selected, I see a prompt to "Select a patch to edit"
**And** the display works identically in demo mode and connected mode

---

## Epic 4: Parameter Editing

User can view all 10 effect modules, expand one, and edit its parameters with real-time feedback to the device.

### Story 4.1: Build Pedalboard Module Grid

As a **user**,
I want **to see all 10 effect modules in my patch**,
So that **I can understand the signal chain and choose what to edit**.

**Acceptance Criteria:**

**Given** I have a patch selected
**When** I view the pedalboard
**Then** I see all 10 modules displayed: AMP, COMP, WAH, EXT, ZNR, EQ, CAB, MOD, DLY, REV
**And** each module shows its name and current effect type
**And** each module shows on/off status with visual indicator (lit/dim)
**And** modules are arranged in a logical layout (matching pedal signal flow)
**And** clicking a module selects it for editing
**And** the selected module is visually highlighted
**And** the layout is responsive (stacks on mobile, grid on desktop)

---

### Story 4.2: Create Module Expansion Panel

As a **user**,
I want **to see all parameters of a selected module**,
So that **I can view and adjust the effect settings**.

**Acceptance Criteria:**

**Given** I have clicked on a module in the pedalboard
**When** the module is selected
**Then** an expansion panel slides up from the bottom
**And** the panel shows the module name and effect type prominently
**And** the panel displays all parameters for that module as visual knobs
**And** each knob shows current value position
**And** parameter names are displayed below each knob
**And** clicking outside the panel or pressing ESC closes it
**And** the panel is scrollable if parameters don't fit
**And** parameter data comes from `src/data/parameterMaps.ts`

---

### Story 4.3: Implement Parameter Modal with Slider

As a **user**,
I want **to edit a parameter value using a slider**,
So that **I can easily adjust settings with touch or mouse**.

**Acceptance Criteria:**

**Given** I have the module expansion panel open
**When** I tap/click on a knob
**Then** a modal appears centered on screen
**And** the modal shows the parameter name
**And** the modal displays a vertical slider for value adjustment
**And** the slider range matches the parameter's valid range
**And** dragging the slider updates the value in real-time
**And** the current value is displayed prominently
**And** tapping outside the modal or pressing ESC closes it
**And** the modal is touch-friendly (large touch targets, smooth dragging)

---

### Story 4.4: Add 7-Segment Display and Precision Buttons

As a **user**,
I want **to see exact parameter values and make fine adjustments**,
So that **I can dial in precise settings**.

**Acceptance Criteria:**

**Given** the parameter modal is open
**When** I view the value display
**Then** I see a 7-segment style display showing the current value
**And** the display updates in real-time as I move the slider
**And** I see a "+" button to increment the value by 1
**And** I see a "-" button to decrement the value by 1
**And** holding +/- buttons accelerates the change speed
**And** values are clamped to valid range (no overflow)
**And** `src/components/parameter/SevenSegment.tsx` renders the display
**And** `src/components/parameter/PrecisionButtons.tsx` renders +/- buttons

---

### Story 4.5: Implement Effect Type Selector

As a **user**,
I want **to change the effect type within a module**,
So that **I can use different amp models, modulations, etc**.

**Acceptance Criteria:**

**Given** I have a module expansion panel open
**When** I tap/click on the effect type name
**Then** a selector/dropdown appears with all available types for that module
**And** effect types are loaded from `src/data/effectTypes.ts`
**And** AMP module shows 44 amp types, MOD shows 28 types, etc.
**And** selecting a new type updates the module's type
**And** the available parameters may change based on the selected type
**And** the knob display updates to show the new type's parameters
**And** the selector is searchable/filterable for modules with many types

---

### Story 4.6: Send Real-time Parameter Changes to Device

As a **user**,
I want **to hear parameter changes instantly on my pedal**,
So that **I can dial in my sound by ear**.

**Acceptance Criteria:**

**Given** I am connected to my G9.2tt (not demo mode)
**When** I change a parameter value via slider or +/- buttons
**Then** `MidiService.sendParameter(module, param, value)` is called
**And** the MIDI command 0x31 is sent with correct module/param/value bytes
**And** `src/services/midi/protocol.ts` exports `buildParameterMessage()` function
**And** the change is audible on the pedal within 100ms (NFR1)
**And** rapid changes are debounced (max 30 messages/second)
**And** in demo mode, changes update local state only (no MIDI sent)
**And** `PatchContext.currentPatch` is updated optimistically

---

### Story 4.7: Implement Undo/Redo History

As a **user**,
I want **to undo and redo parameter changes**,
So that **I can experiment without fear of losing my settings**.

**Acceptance Criteria:**

**Given** I have made parameter changes to a patch
**When** I want to revert a change
**Then** I can click an "Undo" button or press Ctrl+Z
**And** the last parameter change is reverted
**And** the reverted change is pushed to the redo stack
**And** I can click "Redo" or press Ctrl+Y to restore the change
**And** `src/contexts/HistoryContext.tsx` manages the undo/redo stacks
**And** history tracks: patchId, module, param, oldValue, newValue
**And** undo/redo buttons show disabled state when stack is empty
**And** navigating away from editor with unsaved changes shows a warning dialog
**And** the warning offers: "Save", "Discard", "Cancel"

---

## Epic 5: Patch Persistence

User can save their changes back to the pedal, duplicate patches, and rename them.

### Story 5.1: Implement Patch Writing to Device

As a **developer**,
I want **to write patch data to the G9.2tt with correct checksum**,
So that **users can save their edited patches to the device**.

**Acceptance Criteria:**

**Given** I have a modified patch in memory
**When** the app needs to write it to the device
**Then** `MidiService.writePatch(patchId, patchData)` serializes the patch
**And** `src/services/midi/protocol.ts` exports `buildWritePatchMessage(patchId, data)` function
**And** `src/services/midi/checksum.ts` implements the CRC-32 algorithm (verified in Python library)
**And** the checksum is calculated and appended to the SysEx message
**And** the write command (0x12) is sent to the device
**And** the service waits for acknowledgment from the device
**And** errors (timeout, NACK) are caught and reported
**And** the Patch object is correctly serialized to match hardware byte format

---

### Story 5.2: Add Save Patch UI and Confirmation

As a **user**,
I want **to save my edited patch back to my pedal**,
So that **my changes are preserved on the hardware**.

**Acceptance Criteria:**

**Given** I have made changes to a patch
**When** I click the "Save to Device" button
**Then** a confirmation dialog appears: "Save changes to Patch [number]?"
**And** clicking "Save" triggers `MidiService.writePatch()`
**And** a loading indicator shows while saving
**And** on success, a toast shows "Patch saved successfully"
**And** on error, a toast shows the error message with retry option
**And** after successful save, the undo history is cleared
**And** the "unsaved changes" indicator is removed
**And** in demo mode, the button shows "Demo Mode - Cannot save to device"

---

### Story 5.3: Implement Patch Duplication

As a **user**,
I want **to duplicate a patch to another slot**,
So that **I can experiment with variations without losing the original**.

**Acceptance Criteria:**

**Given** I have a patch selected
**When** I click "Duplicate Patch"
**Then** a slot selector appears showing all 100 slots
**And** slots with existing patches show their names
**And** empty slots are marked as "Empty"
**And** I can select a destination slot
**And** if destination has data, a warning appears: "This will overwrite [patch name]"
**And** clicking "Duplicate" copies the current patch to the selected slot
**And** the copy is written to the device
**And** the patch list updates to show the new patch
**And** a toast confirms "Patch duplicated to slot [number]"

---

### Story 5.4: Implement Patch Renaming

As a **user**,
I want **to rename my patches**,
So that **I can organize them with meaningful names**.

**Acceptance Criteria:**

**Given** I have a patch selected
**When** I click on the patch name or "Rename" button
**Then** an input field appears with the current name
**And** the input is limited to 10 characters (hardware limit)
**And** only valid characters are allowed (A-Z, 0-9, space, basic symbols)
**And** invalid characters are filtered or show an error
**And** pressing Enter or clicking "Save" updates the patch name
**And** the name change is saved to the device immediately
**And** pressing Escape cancels the rename
**And** the patch list updates to show the new name
**And** a toast confirms "Patch renamed to [new name]"

---

## Epic 6: Authentication & Cloud Sync

User can sign in with Gmail and sync their patches to the cloud for access from any device.

### Story 6.1: Implement Firebase Authentication

As a **developer**,
I want **Firebase Auth integrated with Google sign-in**,
So that **users can authenticate and have their own cloud storage**.

**Acceptance Criteria:**

**Given** Firebase is configured from Epic 1
**When** I implement authentication
**Then** `src/contexts/AuthContext.tsx` exports a provider and `useAuth()` hook
**And** the context provides: `user`, `isLoading`, `error` state
**And** the context provides: `signInWithGoogle`, `signOut` actions
**And** `src/services/firebase/auth.ts` wraps Firebase Auth methods
**And** `signInWithGoogle()` opens Google OAuth popup
**And** session persists across page reloads using `browserLocalPersistence`
**And** `onAuthStateChanged` listener updates context when auth state changes
**And** the provider wraps the app inside other context providers

---

### Story 6.2: Add Auth UI Components

As a **user**,
I want **to sign in with my Gmail account**,
So that **I can sync my patches across devices**.

**Acceptance Criteria:**

**Given** I am on the app (splash or editor)
**When** I am not signed in
**Then** I see a "Sign in with Google" button
**And** clicking the button opens Google sign-in popup
**And** after successful sign-in, I see my profile picture and email
**And** I see a "Sign Out" option in a dropdown/menu
**And** clicking "Sign Out" shows confirmation: "Sign out? Your local changes will be preserved."
**And** after sign-out, the sign-in button reappears
**And** auth errors show clear messages (popup blocked, network error, etc.)
**And** the UI is consistent between splash and editor pages

---

### Story 6.3: Implement Firestore Patch Storage

As a **developer**,
I want **to store user patches in Firestore**,
So that **patches are persisted in the cloud per user**.

**Acceptance Criteria:**

**Given** a user is signed in
**When** patches need to be stored
**Then** `src/services/firebase/firestore.ts` exports `savePatches`, `loadPatches` functions
**And** patches are stored at path: `users/{userId}/patches/{patchId}`
**And** each patch document contains the full patch data as JSON
**And** Firestore security rules enforce: users can only read/write their own data
**And** `firestore.rules` file is created with proper rules (from Architecture)
**And** `loadPatches(userId)` returns all 100 patches for the user
**And** `savePatch(userId, patchId, patch)` saves a single patch
**And** `saveAllPatches(userId, patches)` batch saves all patches

---

### Story 6.4: Add Cloud Sync Functionality

As a **user**,
I want **my patches to sync automatically to the cloud**,
So that **I can access them from any device**.

**Acceptance Criteria:**

**Given** I am signed in with Google
**When** the app loads or I sign in
**Then** my cloud patches are automatically loaded
**And** I see a sync status indicator (syncing, synced, error)
**And** when I save a patch to device, it also saves to cloud
**And** if I have local patches and cloud patches, I see a merge prompt
**And** merge options: "Keep Local", "Keep Cloud", "Merge (keep both)"
**And** sync errors show a retry option
**And** offline changes are queued and synced when back online
**And** the sync indicator shows "Offline" when no connection
**And** signing in on a new device loads all cloud patches automatically

---

## Epic 7: Visual Experience

User enjoys a premium visual experience with 3D model, particle transitions, and illustrated pedalboard.

### Story 7.1: Add 3D G9.2tt Model to Splash Screen

As a **user**,
I want **to see a 3D model of my G9.2tt on the splash screen**,
So that **I feel connected to my hardware before I even connect it**.

**Acceptance Criteria:**

**Given** I navigate to the splash screen
**When** the page loads
**Then** I see a 3D model of the Zoom G9.2tt
**And** Three.js and @react-three/fiber are lazy loaded (code splitting)
**And** the model is displayed in `src/components/splash/DeviceModel.tsx`
**And** the model has subtle idle animation (gentle rotation or breathing)
**And** the 3D canvas has a fallback for browsers without WebGL
**And** the model file is loaded from `public/models/g9tt.glb`
**And** loading shows a placeholder/skeleton while model loads
**And** the 3D scene doesn't block the main thread (< 16ms frame time)

---

### Story 7.2: Implement Particle Transition Animation

As a **user**,
I want **to see a dramatic particle transition when I connect**,
So that **the app feels alive and premium**.

**Acceptance Criteria:**

**Given** I click "Connect Device" or "Try Demo" and connection succeeds
**When** the transition starts
**Then** the 3D model explodes into particles
**And** particles animate across the screen
**And** particles collapse/reform into the pedalboard view
**And** the transition is implemented in `src/components/splash/ParticleTransition.tsx`
**And** the animation completes in 1-2 seconds
**And** after animation, the user is on the Editor page
**And** the animation uses requestAnimationFrame for smooth 60fps
**And** particle count is reduced on mobile devices for performance
**And** if `prefers-reduced-motion` is set, skip animation and fade instead

---

### Story 7.3: Create Illustrated Pedalboard Design

As a **user**,
I want **to see a beautifully illustrated pedalboard**,
So that **editing feels intuitive and visually appealing**.

**Acceptance Criteria:**

**Given** I am on the Editor page
**When** I view the pedalboard
**Then** the modules are arranged in a curved layout resembling the real G9.2tt
**And** each module has a distinct visual style/color matching its function
**And** AMP modules look like amp pedals, MOD looks like modulation, etc.
**And** the pedalboard has a realistic surface texture/background
**And** modules cast subtle shadows for depth
**And** the design is implemented in `src/components/pedalboard/Pedalboard.tsx`
**And** individual modules use `src/components/pedalboard/ModuleMini.tsx`
**And** the layout adapts responsively (curved on desktop, grid on mobile)

---

### Story 7.4: Add Visual Knobs with Value Reflection

As a **user**,
I want **to see knob positions that reflect actual parameter values**,
So that **I can quickly see settings at a glance**.

**Acceptance Criteria:**

**Given** I am viewing a module's parameters
**When** parameters are displayed as knobs
**Then** each knob's rotation reflects the current value (0 = 7 o'clock, max = 5 o'clock)
**And** the knob component is `src/components/parameter/Knob.tsx`
**And** knobs have visual indicators (tick marks, value arc)
**And** hovering a knob shows the parameter name and value
**And** clicking a knob opens the parameter modal
**And** when value changes, the knob animates smoothly to new position
**And** knobs have visual states: default, hover, active, disabled
**And** the animation duration is ~150ms for responsive feel

---

### Story 7.5: Implement Reduced Motion Support

As a **user with motion sensitivity**,
I want **the app to respect my accessibility preferences**,
So that **I can use the app without discomfort**.

**Acceptance Criteria:**

**Given** my system has `prefers-reduced-motion: reduce` enabled
**When** I use the app
**Then** particle transitions are replaced with a simple fade
**And** knob animations are instant (no transition)
**And** any loading spinners use opacity fade instead of rotation
**And** `src/hooks/useMotionPreference.ts` exports the user's preference
**And** all animated components check this hook before animating
**And** the 3D model idle animation is disabled
**And** page transitions use fade instead of slide
**And** the app remains fully functional with all features accessible
