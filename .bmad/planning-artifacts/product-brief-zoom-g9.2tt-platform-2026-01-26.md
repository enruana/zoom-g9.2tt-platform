---
stepsCompleted: [1, 2, 3, 4, 5, 6]
status: complete
inputDocuments:
  - .bmad/brainstorming/brainstorming-session-2026-01-26.md
  - .bmad/research/deep-research.md
  - phases/01-reverse-engineering/06-protocol-specification/PROTOCOL.md
  - phases/01-reverse-engineering/05-effect-mapping/PARAMETER_MAP.md
  - phases/02-python-library/CHECKSUM.md
  - phases/02-python-library/README.md
date: 2026-01-26
author: enruana
---

# Product Brief: zoom-g9.2tt-platform

## Executive Summary

**zoom-g9.2tt-web** is a modern, browser-based editor that replaces the discontinued G9ED software for the Zoom G9.2tt guitar effects console. It provides universal access from any device with a browser, a visually stunning interface, and full editing capabilities—giving new life to hardware that still sounds great but lost its software support.

**Core proposition**: "Your G9.2tt isn't obsolete—G9ED was."

---

## Core Vision

### Problem Statement

The Zoom G9.2tt Twin Tube Guitar Effects Console is a professional-grade multi-effects unit with 200 patches, 120 effect algorithms, and dual tube circuitry. However, the official editing software (G9ED) only runs on Windows XP and Mac OS X 10.2-10.8—operating systems that are 15+ years old and no longer supported.

Owners of this excellent hardware face an impossible choice:
- Maintain an old computer just for editing patches
- Use the limited on-device interface (tiny screen, 4 buttons)
- Abandon full customization entirely

### Problem Impact

- **No modern OS support**: Mac, Linux, and modern Windows users are locked out
- **No mobile editing**: Cannot tweak patches at rehearsals or gigs
- **Lost investment**: A $500+ professional pedal becomes "configure once, never touch again"
- **Community fragmentation**: Sharing patches requires the archaic G9ED format

### Why Existing Solutions Fall Short

| Solution | Limitation |
|----------|------------|
| G9ED (official) | Windows XP/Mac OS X 10.8 only, discontinued |
| Virtual machines | Complex setup, poor MIDI passthrough, not portable |
| On-device editing | Tedious with small screen and limited controls |
| Generic MIDI editors | No understanding of G9.2tt's patch structure |

There is simply no modern way to fully edit the G9.2tt.

### Proposed Solution

A **browser-based web application** that:

1. **Runs anywhere**: Chrome, Firefox, Safari on Mac, Windows, Linux, tablets, phones
2. **Zero installation**: Open URL, connect pedal, start editing
3. **Full feature parity**: All 10 effect modules, all parameters, bulk operations
4. **Superior UX**: Illustrated pedalboard interface, 3D transitions, touch-friendly controls
5. **Cloud sync**: Patches saved to Firebase, accessible from any device
6. **Real-time editing**: Hear changes instantly as you adjust parameters

**Technical foundation**: Web MIDI API for communication, fully reverse-engineered protocol (SysEx commands, CRC-32 checksum), proven with working Python library.

### Key Differentiators

| Differentiator | Impact |
|----------------|--------|
| **Universal access** | Works on any modern device with a browser |
| **Zero friction** | No downloads, no drivers, no setup |
| **Visual experience** | Memorable 3D splash, particle transitions, illustrated pedals |
| **Touch-first UX** | Knobs + modal sliders work perfectly on mobile and desktop |
| **Cloud persistence** | Your patches follow you everywhere |
| **Open & free** | Community-driven, no licensing fees |
| **Hardware rescue** | Extends the useful life of quality gear |

---

## Target Users

### Primary Users

**Anyone who owns a Zoom G9.2tt** — regardless of skill level, musical style, or technical background.

#### Persona: "Carlos" — The Gigging Musician
- **Context**: Plays covers in a band, has 3-4 gigs per month
- **Problem**: Needs to tweak patches before shows but his MacBook can't run G9ED
- **Current workaround**: Uses the tiny on-device screen, very slow and frustrating
- **Success moment**: "I edited my patches on my iPad at the venue 10 minutes before soundcheck"

#### Persona: "Maria" — The Home Producer
- **Context**: Records guitar at home, uses G9.2tt for amp modeling
- **Problem**: Wants to experiment with all 44 amp types but navigating on-device is tedious
- **Current workaround**: Settled on 3-4 patches and never explores further
- **Success moment**: "I finally discovered what all these effects can do — found sounds I never knew existed"

#### Persona: "Jake" — The Used Gear Buyer
- **Context**: Bought G9.2tt on Reverb because it sounded great in demos
- **Problem**: No CD-ROM with G9ED, can't find working download, stuck with factory presets
- **Current workaround**: Uses only preset patches, can't customize
- **Success moment**: "Finally I can actually use this thing the way it was meant to be used"

### Secondary Users

**People who don't own a G9.2tt (yet)** — curious about the pedal or considering buying one used.

#### Persona: "Alex" — The Curious Browser
- **Context**: Saw a G9.2tt for sale, wants to know if it's worth buying
- **Problem**: Can't evaluate the pedal's capabilities without owning it
- **Demo mode value**: "I can see all the effects and interface before deciding to buy"
- **Potential outcome**: Buys the pedal because the app made it accessible

### User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│  DISCOVER                                                        │
│  • Google search: "zoom g9.2tt editor mac"                      │
│  • Reddit/forum recommendation                                   │
│  • YouTube video showing the app                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  ENTER                                                           │
│  • Open URL in browser                                          │
│  • See beautiful 3D G9.2tt waiting                              │
│  • Choose: [Connect Device] or [Try Demo]                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FALL IN LOVE                                                    │
│  • Particle transition → pedalboard appears                     │
│  • "Wow, this looks amazing"                                    │
│  • Touch a pedal → it works                                     │
│  • "This is exactly what I needed"                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  ADOPT                                                           │
│  • Sign in with Gmail to save patches                           │
│  • Patches sync to cloud                                        │
│  • Return anytime, from any device                              │
└─────────────────────────────────────────────────────────────────┘
```

**Key insight**: The app must be lovable from the first second — even without a connected pedal.

---

## Success Metrics

This is a **passion project** — open source, free, community-driven. Success is measured by user value and community adoption, not revenue.

### User Success Metrics

| Metric | What it measures | Target |
|--------|------------------|--------|
| **Successful connection** | % of users who connect their pedal on first session | > 80% |
| **Patch edited** | % of users who modify at least 1 parameter | > 90% |
| **Patch saved** | % of users who write changes to the pedal | > 70% |
| **Time to first edit** | How fast users start editing after landing | < 60 seconds |

### Engagement Metrics

| Metric | What it measures | Target |
|--------|------------------|--------|
| **7-day return** | % of users who return within first week | > 40% |
| **Sessions/month** | Average visits per active user | > 3 |
| **Demo → Real** | % of demo users who later connect a real pedal | Track |
| **Patches per user** | Average patches edited per session | > 2 |

### Community Metrics

| Metric | What it measures | Target |
|--------|------------------|--------|
| **GitHub stars** | Community interest and visibility | 100+ year 1 |
| **Forum mentions** | Organic word-of-mouth in guitar communities | Track |
| **Issues/PRs** | Community contribution and engagement | Track |

### Business Objectives

**Primary objective**: Create the definitive modern editor for Zoom G9.2tt owners worldwide.

**Success definition**: When someone Googles "zoom g9.2tt editor", this app is the answer.

### Key Performance Indicators

| KPI | Definition | Measurement |
|-----|------------|-------------|
| **Monthly Active Users** | Unique users who connect or use demo mode | Firebase Analytics |
| **Connection Success Rate** | % of MIDI connection attempts that succeed | App telemetry |
| **Feature Completeness** | % of G9ED features replicated | Manual tracking |
| **User Satisfaction** | Qualitative feedback from community | GitHub issues, forums |

---

## MVP Scope

### Core Features

The MVP delivers a fully functional G9ED replacement with a superior user experience.

#### Connection & Communication
- [ ] Web MIDI API device detection and connection
- [ ] Read all 100 patches from device
- [ ] Write patches to device (with CRC-32 checksum)
- [ ] Real-time parameter control (command 0x31)
- [ ] Demo mode for users without connected hardware

#### Visual Experience
- [ ] 3D G9.2tt model on splash screen (Three.js)
- [ ] Particle explosion/collapse transition
- [ ] Illustrated pedalboard with curved layout
- [ ] Distinct visual personality per effect module (Valhalla-inspired)

#### User Interface
- [ ] Mini modules dashboard view
- [ ] Bottom panel expansion for selected module
- [ ] Visual knobs (non-draggable, display state)
- [ ] Modal slider with 7-segment display for parameter editing
- [ ] Precision +/- buttons for fine adjustment
- [ ] Three-level zoom: Mini → Large → Modal

#### Data & Auth
- [ ] Gmail authentication (Firebase Auth)
- [ ] Cloud patch storage (Firebase Firestore)
- [ ] Sync patches across devices

#### Editing Features
- [ ] Undo/redo stack within session
- [ ] Duplicate patch to experiment

### Out of Scope for MVP

| Feature | Rationale for deferring |
|---------|------------------------|
| **Patch sharing community** | Requires moderation, user profiles, social features |
| **Genre/artist preset packs** | Requires content curation and licensing considerations |
| **A/B comparison toggle** | Enhancement, not core functionality |
| **PWA offline mode** | Complex offline sync logic, can add later |
| **Import/export .xex files** | G9ED proprietary format, low priority |
| **ARRM/pedal assignment editor** | Advanced feature, complex UI |

### MVP Success Criteria

**The MVP is complete when:**

1. **Core loop works**: User can connect pedal → see patches → edit parameters → save changes
2. **Demo mode works**: User without pedal can explore full UI and functionality
3. **Visual experience delivers**: 3D splash, particle transition, and pedalboard feel polished
4. **Cross-device works**: Same patches accessible from laptop, tablet, phone
5. **Real-time feedback**: Parameter changes are heard instantly on connected pedal

**Launch readiness checklist:**
- [ ] All 10 effect modules editable
- [ ] All core parameters accessible
- [ ] Works on Chrome, Firefox, Safari
- [ ] Works on desktop and mobile
- [ ] Firebase auth and sync functional
- [ ] No critical bugs in core workflow

### Future Vision

#### Phase 2: Community
- Patch sharing marketplace
- User profiles and favorites
- Community-curated preset packs
- Comments and ratings on patches

#### Phase 3: Advanced Features
- A/B comparison mode
- PWA with offline editing
- ARRM (auto-modulation) editor
- Expression pedal assignment UI
- Import/export G9ED .xex files

#### Phase 4: Expansion
- Support for other Zoom pedals (G5n, MS series)
- Integration with DAWs via MIDI
- Tone matching / AI-suggested patches
- Mobile companion app (React Native)
