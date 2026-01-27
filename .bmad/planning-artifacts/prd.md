---
stepsCompleted: [step-01-init, step-02-discovery, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish, step-12-complete]
status: complete
completedAt: 2026-01-26
inputDocuments:
  - product-brief-zoom-g9.2tt-platform-2026-01-26.md
  - deep-research.md
  - brainstorming-session-2026-01-26.md
workflowType: 'prd'
documentCounts:
  briefs: 1
  research: 1
  brainstorming: 1
  projectDocs: 0
classification:
  projectType: web_app
  domain: general
  complexity: low-medium
  projectContext: greenfield
---

# Product Requirements Document - zoom-g9.2tt-platform

**Author:** enruana
**Date:** 2026-01-26

## Executive Summary

**Product:** zoom-g9.2tt-web — A modern, browser-based patch editor for the Zoom G9.2tt guitar effects console.

**Problem:** The official G9ED software only runs on Windows XP/Mac OS X 10.8. Owners of this professional-grade pedal cannot edit it from modern computers or mobile devices.

**Solution:** A web app using Web MIDI API that provides full editing capabilities with a superior visual experience — 3D splash screen, particle transitions, illustrated pedalboard, touch-friendly modal sliders.

**Core proposition:** "Your G9.2tt isn't obsolete—G9ED was."

**Technical foundation:**
- MIDI protocol fully reverse-engineered
- CRC-32 checksum algorithm discovered and verified
- Working Python library validates the approach
- Bulk read/write tested on real hardware

**Stack:** React + Vite, Firebase (Auth + Firestore + Hosting), Three.js, Web MIDI API, Tailwind CSS.

**Scope:**
- 45 Functional Requirements across 9 capability areas
- 17 Non-Functional Requirements
- 4 User Journeys covering all primary use cases
- MVP + 3 future phases defined

## Success Criteria

### User Success

| Metric | Target | Measurement |
|--------|--------|-------------|
| Successful device connection | > 80% on first session | App telemetry |
| Patch edited | > 90% of connected users | App telemetry |
| Patch saved to device | > 70% of users who edit | App telemetry |
| Time to first edit | < 60 seconds from landing | App telemetry |
| 7-day return rate | > 40% | Firebase Analytics |
| Sessions per month | > 3 per active user | Firebase Analytics |

**User success moment**: "I opened the app, connected my pedal, and edited a patch in under a minute. This is exactly what I needed."

### Business Success

| Metric | Target | Timeline |
|--------|--------|----------|
| Monthly Active Users | Track growth | Ongoing |
| GitHub stars | 100+ | Year 1 |
| Organic search ranking | #1 for "zoom g9.2tt editor" | Year 1 |
| Community mentions | Track in forums/Reddit | Ongoing |

**Business model**: Passion project — open source, free, community-driven. Success is user value and community adoption, not revenue.

### Technical Success

| Metric | Target |
|--------|--------|
| Browser compatibility | Chrome, Firefox, Safari (latest 2 versions) |
| Device compatibility | Desktop + Mobile (responsive) |
| Connection success rate | > 95% when hardware is properly connected |
| Real-time parameter latency | < 100ms perceived response |
| Firebase auth reliability | > 99.5% uptime |
| Page load time | < 3 seconds on 3G |

### Measurable Outcomes

**Launch readiness checklist:**
- [ ] All 10 effect modules editable (AMP, COMP, WAH, EXT, ZNR, EQ, CAB, MOD, DLY, REV)
- [ ] All core parameters accessible per module
- [ ] Read/write patches verified on real hardware
- [ ] Demo mode fully functional without hardware
- [ ] Gmail auth and Firebase sync working
- [ ] Works on Chrome, Firefox, Safari
- [ ] Responsive design works on tablet and phone
- [ ] No critical bugs in core workflow

## Product Scope

### MVP - Minimum Viable Product

**Core Functionality:**
- Web MIDI API device detection and connection
- Read all 100 patches from device
- Write patches to device (with CRC-32 checksum)
- Real-time parameter control (command 0x31)
- Demo mode for users without connected hardware

**Visual Experience:**
- 3D G9.2tt model on splash screen (Three.js)
- Particle explosion/collapse transition
- Illustrated pedalboard with curved layout
- Distinct visual personality per effect module

**User Interface:**
- Mini modules dashboard view
- Bottom panel expansion for selected module
- Visual knobs with modal slider editing
- 7-segment display for parameter values
- Precision +/- buttons for fine adjustment

**Data & Auth:**
- Gmail authentication (Firebase Auth)
- Cloud patch storage (Firebase Firestore)
- Sync patches across devices

**Editing:**
- Undo/redo stack within session
- Duplicate patch to experiment

### Growth Features (Post-MVP)

| Feature | Value |
|---------|-------|
| Patch sharing community | Social discovery, user engagement |
| Genre/artist preset packs | Content marketing, onboarding help |
| A/B comparison mode | Power user feature |
| PWA offline mode | Use without internet |

### Vision (Future)

**Phase 2: Community**
- Patch marketplace with ratings
- User profiles and favorites
- Community-curated collections

**Phase 3: Advanced**
- ARRM (auto-modulation) editor
- Expression pedal assignment UI
- Import/export G9ED .xex files

**Phase 4: Expansion**
- Support for other Zoom pedals (G5n, MS series)
- DAW integration
- AI-suggested patches

## User Journeys

### Journey 1: First-Time Success (Jake - Used Gear Buyer)

**Opening Scene:**
Jake bought a Zoom G9.2tt on Reverb for $150. It sounds amazing, but it came without the original CD. He's been stuck with factory presets for 3 months. He Googles "zoom g9.2tt editor mac" and finds our app.

**Rising Action:**
1. Jake opens the URL in Chrome on his MacBook
2. He sees the 3D G9.2tt model with "Waiting for connection..."
3. He clicks [Connect Device] and grants MIDI permission
4. His USB-MIDI interface shows up — he selects it
5. The pedal connects — particles explode and reform into the pedalboard
6. He sees all his patches listed with familiar names

**Climax:**
Jake taps the AMP module. The bottom panel slides up showing a beautiful illustrated amp pedal. He sees "PV Drive" with Gain at 69. He taps the Gain knob — a modal appears with a slider and 7-segment display showing "69". He drags it to 80 and HEARS THE CHANGE INSTANTLY on his guitar.

**Resolution:**
Jake spends the next hour tweaking patches he never could access before. He signs in with Gmail and his patches sync to the cloud. He finally owns his G9.2tt. "This is exactly what I needed."

**Capabilities Revealed:**
- Web MIDI device detection and connection
- Patch list display with names
- Module selection and expansion
- Parameter editing with modal slider
- Real-time audio feedback
- Gmail authentication
- Cloud sync

---

### Journey 2: Demo Explorer (Alex - Curious Browser)

**Opening Scene:**
Alex sees a G9.2tt for sale locally for $120. Before buying, he wants to know what it can do. He finds our app and clicks [Try Demo].

**Rising Action:**
1. Alex clicks [Try Demo] without connecting any hardware
2. Particles animate and the pedalboard appears
3. He sees all 10 effect modules in the curved layout
4. Everything is interactive — he can explore every parameter
5. He taps through AMP types: Fender Clean, VOX, Marshall, Mesa...
6. He discovers 44 amp models, 28 modulations, 15 reverbs

**Climax:**
Alex realizes this $120 pedal has more amp models than his $300 plugin bundle. The interface is beautiful and intuitive. He thinks: "If the editor is this good, the hardware must be worth it."

**Resolution:**
Alex messages the seller and buys the G9.2tt. When it arrives, he opens the app, connects, and all his demo exploration translates directly to the real hardware. Zero learning curve.

**Capabilities Revealed:**
- Demo mode without hardware
- Full UI functionality in demo
- Effect type browsing
- Parameter exploration
- Seamless demo-to-real transition

---

### Journey 3: Quick Edit at Gig (Carlos - Gigging Musician)

**Opening Scene:**
Carlos is at soundcheck. The room is boomy and his lead tone is too muddy. He needs to cut some low-mids on his solo patch. His laptop is in the car. He pulls out his iPhone.

**Rising Action:**
1. Carlos opens the app on his iPhone (already signed in)
2. His patches are there — synced from his home session
3. He taps his "Solo Lead" patch
4. He taps EQ module, then the 400Hz band
5. Modal slider appears — easy to use with thumb
6. He pulls it down from 18 to 12

**Climax:**
The change happens instantly on his pedal. He plays a test lick — the mud is gone. Total time: 45 seconds. The band is ready to start.

**Resolution:**
Carlos plays the gig with confidence. After the show, his patches are still synced. Tomorrow at home, he can fine-tune further on his laptop.

**Capabilities Revealed:**
- Mobile responsive design
- Cloud sync across devices
- Quick parameter access
- Touch-friendly modal slider
- Real-time changes on hardware

---

### Journey 4: Connection Trouble (Maria - Home Producer)

**Opening Scene:**
Maria opens the app and clicks [Connect Device]. Nothing appears in the device list. Her G9.2tt is connected via USB-MIDI interface, but the app doesn't see it.

**Rising Action:**
1. Maria sees "No MIDI devices found"
2. She clicks a [Troubleshoot] link
3. Tips appear: "Check USB connection", "Ensure MIDI interface is powered", "Try a different browser"
4. She realizes her USB hub doesn't have enough power
5. She connects the MIDI interface directly to her Mac
6. She clicks [Retry Connection]

**Climax:**
The device appears. She selects it. Connection succeeds. Particles animate and her pedalboard loads.

**Resolution:**
Maria bookmarks the troubleshooting page for future reference. She also learns that Chrome works more reliably than Safari for Web MIDI. Her session continues smoothly.

**Capabilities Revealed:**
- Empty state for no devices
- Troubleshooting guidance
- Retry connection flow
- Browser compatibility notes
- Graceful error handling

---

### Journey Requirements Summary

| Capability | J1 | J2 | J3 | J4 |
|------------|----|----|----|----|
| Web MIDI connection | ✓ | | ✓ | ✓ |
| Demo mode | | ✓ | | |
| Patch list display | ✓ | ✓ | ✓ | |
| Module selection | ✓ | ✓ | ✓ | |
| Parameter editing | ✓ | ✓ | ✓ | |
| Real-time feedback | ✓ | | ✓ | |
| Gmail auth | ✓ | | ✓ | |
| Cloud sync | ✓ | | ✓ | |
| Mobile responsive | | | ✓ | |
| Error handling | | | | ✓ |
| Troubleshooting UI | | | | ✓ |

**Key Insight:** Every journey reinforces the core loop (connect → browse → edit → save) while revealing different capability needs (demo mode, mobile, error handling).

## Innovation & Novel Patterns

### Detected Innovation Areas

| Innovation | Description | Differentiation |
|------------|-------------|-----------------|
| **Particle Transition UX** | 3D G9.2tt model explodes into particles, reforms as pedalboard | No pedal editor has cinematic transitions |
| **Touch-First Knob Control** | Visual knobs + modal slider + 7-segment display | Solves mobile knob problem elegantly |
| **Hardware Rescue Narrative** | "Your G9.2tt isn't obsolete—G9ED was" | Unique positioning in gear market |
| **Web MIDI for Legacy Hardware** | Browser-based editor for 2007 hardware | Extends life of abandoned products |

### Market Context & Competitive Landscape

**Current landscape:**
- G9ED (official): Windows XP only, discontinued, no modern alternative
- Generic MIDI editors: Don't understand G9.2tt patch structure
- Similar projects: None actively maintained for G9.2tt

**Market opportunity:**
- ~10,000+ G9.2tt units sold (estimated)
- Active used market on Reverb, eBay
- No competition for modern G9.2tt editing
- Community of users frustrated by G9ED limitations

### Validation Approach

| Innovation | Validation Method |
|------------|-------------------|
| Particle transitions | User reaction on first load ("wow factor") |
| Modal slider UX | Task completion time vs. traditional knobs |
| Hardware rescue message | Search ranking for "zoom g9.2tt editor" |
| Demo mode conversion | % of demo users who later connect hardware |

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Three.js adds bundle size | Lazy load 3D components, show static fallback |
| Particle animation too slow on mobile | Reduce particle count, skip on low-end devices |
| Modal slider unfamiliar to users | Add subtle tooltip on first use |
| Web MIDI browser support limited | Clear browser requirements, graceful degradation |

## Web App Specific Requirements

### Technical Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Framework** | React.js + Vite | Fast builds, modern DX, great ecosystem |
| **Hosting** | Firebase Hosting | Free tier, CDN, easy deploy |
| **Auth** | Firebase Auth | Gmail login, simple integration |
| **Database** | Firestore | Real-time sync, free tier sufficient |
| **3D Engine** | Three.js | Industry standard, good docs |
| **MIDI** | Web MIDI API | Native browser API, no plugins |
| **State** | React Context + useReducer | Simple, no external deps |
| **Styling** | Tailwind CSS | Rapid prototyping, responsive utils |

### Browser Compatibility Matrix

| Browser | Version | Support Level | Web MIDI Status |
|---------|---------|---------------|-----------------|
| Chrome | 89+ | ✅ Full | Native support |
| Edge | 89+ | ✅ Full | Native support (Chromium) |
| Firefox | 108+ | ⚠️ Partial | Behind `dom.webmidi.enabled` flag |
| Safari | 16+ | ⚠️ Limited | Experimental, requires flag |

**Recommendation:** Target Chrome/Edge as primary, show browser warning for Firefox/Safari.

### Responsive Design

| Breakpoint | Width | Layout | Priority |
|------------|-------|--------|----------|
| Mobile | < 768px | Stacked, full-width modules | High |
| Tablet | 768-1024px | 2-column pedalboard | Medium |
| Desktop | > 1024px | Full curved pedalboard | High |

**Touch considerations:**
- Modal slider optimized for thumb control
- Minimum touch target: 44x44px
- Swipe gestures for module navigation (future)

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 3s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Initial bundle size | < 500KB | Build output |
| Three.js chunk | Lazy loaded | Code splitting |
| MIDI connection time | < 500ms | App telemetry |

**Optimization strategies:**
- Code splitting for Three.js components
- Lazy load 3D models on demand
- Preload critical CSS
- Service worker for repeat visits (future PWA)

### SEO Strategy

**Minimal SEO (app, not content site):**
- Meta title: "G9.2tt Web Editor - Modern Editor for Zoom G9.2tt"
- Meta description: "Free browser-based patch editor for Zoom G9.2tt. No installation required."
- Open Graph tags for social sharing
- robots.txt allowing indexing

**No server-side rendering needed** — React SPA is sufficient.

### Accessibility Level

**Target: WCAG 2.1 AA (basic)**

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | Focus management, tab order |
| Screen reader | ARIA labels on interactive elements |
| Color contrast | 4.5:1 minimum ratio |
| Focus indicators | Visible focus states |
| Motion | Respect `prefers-reduced-motion` |

**Note:** Full accessibility audit post-MVP, basic compliance for launch.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving MVP

The MVP focuses on solving the core problem: enabling G9.2tt owners to edit their pedal from any modern browser. The visual experience (3D splash, particle transitions) is a key differentiator but not a blocker — if Three.js proves too complex, a 2D version can launch first.

**Core Principle:** Ship something that works reliably over something that looks perfect.

**Resource Requirements:**
- Solo developer can deliver MVP
- Required skills: React, basic Three.js, Firebase
- Reference: Python library already implements full protocol

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- ✅ Journey 1: First-Time Success (connect → edit → save)
- ✅ Journey 2: Demo Explorer (explore without hardware)
- ✅ Journey 3: Quick Edit at Gig (mobile editing)
- ✅ Journey 4: Connection Trouble (error handling)

**Must-Have Capabilities:**

| Category | Capabilities |
|----------|-------------|
| **Connection** | Web MIDI detection, device selection, connection status |
| **Read/Write** | Read all 100 patches, write with CRC-32 checksum |
| **Real-time** | Parameter changes heard instantly (command 0x31) |
| **UI** | Pedalboard view, module expansion, modal slider editing |
| **Visual** | 3D splash (can be 2D fallback), illustrated pedals |
| **Auth** | Gmail login via Firebase Auth |
| **Sync** | Patch storage in Firestore, cross-device sync |
| **Demo** | Full functionality without connected hardware |

### Post-MVP Features

**Phase 2 (Growth):**
- Patch sharing community
- User profiles and favorites
- Genre/artist preset packs
- Ratings and comments

**Phase 3 (Advanced):**
- A/B comparison mode
- PWA with offline editing
- ARRM (auto-modulation) editor
- Expression pedal assignment UI
- Import/export G9ED .xex files

**Phase 4 (Expansion):**
- Support for other Zoom pedals (G5n, MS-70CDR)
- DAW integration via MIDI
- AI-suggested patches
- Mobile companion app

### Risk Mitigation Strategy

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Web MIDI Safari support** | High | Medium | Target Chrome/Edge primary, show clear browser warning |
| **Three.js bundle size** | Medium | Low | Lazy load, code split, 2D fallback option |
| **Firebase free tier limits** | Low | Low | Limit patches per user (100 matches hardware) |
| **Protocol edge cases** | Low | Medium | Python library reference, real hardware testing |
| **User adoption** | Medium | Medium | Demo mode for discovery, SEO for "g9.2tt editor" |

**Technical De-risking Already Done:**
- ✅ MIDI protocol fully reverse-engineered
- ✅ CRC-32 checksum algorithm discovered and verified
- ✅ Python library proves read/write/real-time works
- ✅ Bulk operations tested on real hardware

## Functional Requirements

### Device Connection

- **FR1:** User can detect available MIDI devices in the browser
- **FR2:** User can select a specific MIDI device from the list
- **FR3:** User can see connection status (connected/disconnected/connecting)
- **FR4:** User can retry connection after failure
- **FR5:** User can disconnect from the current device
- **FR6:** System can identify if connected device is a Zoom G9.2tt

### Patch Management

- **FR7:** User can view a list of all 100 patches on the device
- **FR8:** User can select a patch to view/edit
- **FR9:** User can see patch name and basic info
- **FR10:** User can read all patch data from the device
- **FR11:** User can write modified patch data to the device
- **FR12:** User can duplicate a patch to a new slot
- **FR13:** User can rename a patch

### Parameter Editing

- **FR14:** User can view all 10 effect modules in a patch (AMP, COMP, WAH, EXT, ZNR, EQ, CAB, MOD, DLY, REV)
- **FR15:** User can select a module to expand and edit
- **FR16:** User can view all parameters of a selected module
- **FR17:** User can edit parameter values via modal slider
- **FR18:** User can see current parameter value in 7-segment style display
- **FR19:** User can fine-tune parameters with +/- buttons
- **FR20:** User can change effect type within a module
- **FR21:** System sends parameter changes to device in real-time

### Visual Experience

- **FR22:** User can see 3D G9.2tt model on splash screen
- **FR23:** User can see particle transition animation when connecting
- **FR24:** User can view pedalboard with illustrated module pedals
- **FR25:** User can see visual knob positions reflecting parameter values
- **FR26:** System respects user's reduced-motion preference

### User Authentication

- **FR27:** User can sign in with Gmail account
- **FR28:** User can sign out
- **FR29:** User can see their account info
- **FR30:** System persists session across page reloads

### Data Synchronization

- **FR31:** System saves user's patches to cloud storage
- **FR32:** User can access saved patches from any device
- **FR33:** System syncs patches when user logs in on new device
- **FR34:** User can see sync status

### Demo Mode

- **FR35:** User can enter demo mode without hardware connected
- **FR36:** User can explore all UI and modules in demo mode
- **FR37:** User can edit parameters in demo mode (no device write)
- **FR38:** User can switch from demo to connected mode seamlessly

### Error Handling

- **FR39:** User can see clear error messages when connection fails
- **FR40:** User can access troubleshooting guidance
- **FR41:** System shows browser compatibility warning when needed
- **FR42:** System handles unexpected disconnection gracefully

### Session Management

- **FR43:** User can undo recent parameter changes
- **FR44:** User can redo undone changes
- **FR45:** System warns user about unsaved changes before leaving

## Non-Functional Requirements

### Performance

| NFR | Requirement | Measurement |
|-----|-------------|-------------|
| **NFR1** | Parameter changes must be audible within 100ms | Manual testing with real hardware |
| **NFR2** | Page must be interactive within 3 seconds | Lighthouse TTI |
| **NFR3** | Initial bundle must be under 500KB | Build output |
| **NFR4** | 3D assets must lazy load without blocking UI | Network waterfall |
| **NFR5** | MIDI connection must establish within 500ms | App telemetry |

### Security

| NFR | Requirement |
|-----|-------------|
| **NFR6** | All traffic must use HTTPS (required for Web MIDI) |
| **NFR7** | Firebase Auth must be the only authentication method |
| **NFR8** | User data in Firestore must be scoped to authenticated user only |
| **NFR9** | No sensitive data stored in localStorage |

### Accessibility

| NFR | Requirement |
|-----|-------------|
| **NFR10** | All interactive elements must be keyboard accessible |
| **NFR11** | Color contrast must meet WCAG 2.1 AA (4.5:1) |
| **NFR12** | Animations must respect `prefers-reduced-motion` |
| **NFR13** | ARIA labels on all non-text interactive elements |

### Integration

| NFR | Requirement |
|-----|-------------|
| **NFR14** | Must work with Web MIDI API in Chrome 89+ and Edge 89+ |
| **NFR15** | Must gracefully degrade when Web MIDI unavailable |
| **NFR16** | Firebase SDK must be latest stable version |
| **NFR17** | Must handle Firebase service outages gracefully |
