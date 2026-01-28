# Zoom G9.2tt Web Editor

A modern, browser-based patch editor for the Zoom G9.2tt guitar multi-effects pedal. Built with React, TypeScript, and Web MIDI API.

<p align="center">
  <a href="https://g9.enruana.com"><strong>🎸 Try it live at g9.enruana.com</strong></a>
</p>

## Screenshots

### Splash Screen
Connection hub with device selection, demo mode, and Google authentication.

<p align="center">
  <img src="public/splash.png" alt="Splash Screen" width="500"/>
</p>

### Collaborative Session
Remote control your pedal from any device. The server (with MIDI) shares a 6-character code, clients join and control parameters in real-time.

<p align="center">
  <img src="public/session.png" alt="Collaborative Session" width="700"/>
</p>

### Editor - Demo Mode
Virtual pedalboard with all 10 effect modules. Click any module to edit parameters, toggle effects on/off, and change effect types.

<p align="center">
  <img src="public/demo.png" alt="Editor Demo Mode" width="600"/>
</p>

### Mobile Interface
Fully responsive design for phones and tablets. Complete functionality on the go.

<p align="center">
  <img src="public/mobile.png" alt="Mobile Interface" width="300"/>
</p>

---

## Features

### Device Connection
- **Web MIDI API** - Direct browser connection to your pedal via USB MIDI interface
- **Auto-detection** - Automatically identifies G9.2tt devices
- **Connection Troubleshooting** - Built-in diagnostics and retry functionality
- **Demo Mode** - Explore the interface without hardware

### Patch Management
- **Read/Write Patches** - Full 100-patch library access (U0-U99)
- **Real-time Editing** - Changes apply instantly to the pedal
- **Duplicate Patches** - Copy patches to new locations
- **Rename Patches** - Edit patch names (10 characters max)
- **Bulk Operations** - Send all patches to device

### Effect Modules
Edit all 10 effect modules with full parameter control:

| Module | Description | Parameters |
|--------|-------------|------------|
| CMP | Compressor | Sense, Attack, Level |
| WAH | Wah/Filter | Type, Position, Range |
| EXT | External Loop | Position, Level |
| ZNR | Noise Reduction | Threshold, Decay |
| AMP | Amp Simulator | 22 amp models, Gain, EQ, Level |
| EQ | Parametric EQ | 6-band with frequency/gain |
| CAB | Cabinet Simulator | 16 cabinet types |
| MOD | Modulation | Chorus, Flanger, Phaser, etc. |
| DLY | Delay | Time, Feedback, Mix |
| REV | Reverb | Type, Decay, Mix |

### Virtual Pedalboard
- **Visual Interface** - Pedal-like module layout
- **Click-to-Edit** - Select any module to edit parameters
- **Enable/Disable** - Toggle modules on/off
- **Type Selector** - Quick effect type switching
- **Parameter Sliders** - Intuitive value adjustment
- **Precision Buttons** - Fine-tune with +1/-1, +10/-10

### Cloud Sync (Firebase)
- **Google Authentication** - Sign in with your Google account
- **Patch Backup** - Automatically save patches to cloud
- **Cross-Device Sync** - Access patches from any browser
- **Offline Support** - Works without internet, syncs when online

### Collaborative Sessions
Remote control your pedal from another device:

**Server Mode** (PC with MIDI):
- Create a session and get a 6-character code
- Share the code with others
- See connected clients
- Toggle Live Mode to send changes to pedal

**Client Mode** (Phone/Tablet):
- Join a session with the code
- Full control of all parameters
- See real-time state updates
- No MIDI hardware needed

### User Experience
- **Mobile Responsive** - Full functionality on phones/tablets
- **Undo/Redo** - History tracking for parameter changes
- **3D Splash Screen** - Animated particle effects
- **Dark Theme** - Easy on the eyes

---

## Requirements

### Browser
- **Chrome 89+** (required for Web MIDI API)
- Other Chromium-based browsers may work (Edge, Opera)
- Firefox/Safari do NOT support Web MIDI

### Hardware
- Zoom G9.2tt pedal
- USB MIDI interface (Roland UM-ONE MK2 recommended)
- Standard 5-pin MIDI cables

> **💡 Need a MIDI interface?** I recommend the [Roland UM-ONE MK2](https://tmsmusic.co/products/interface-roland-um-one-mk2?variant=39847122010303) - it's reliable and works perfectly with this project.

---

## Getting Started

### Use the Live Platform (Recommended)

Just visit **[g9.enruana.com](https://g9.enruana.com)** in Chrome - no installation required!

### Run Locally (Development)

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Configure Firebase (optional)

Copy `.env.example` to `.env` and fill in your Firebase config:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

#### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173 in Chrome.

#### 4. Connect Your Pedal

1. Connect MIDI interface to PC via USB
2. Connect MIDI OUT from interface to MIDI IN on pedal
3. Connect MIDI IN from interface to MIDI OUT on pedal
4. Click "Connect Device" in the app
5. Select your MIDI interface when prompted

---

## Usage

### Standalone Mode (Default)

1. Connect your G9.2tt via MIDI
2. Click "Connect Device"
3. Select patches from the list
4. Click modules on the pedalboard to edit
5. Changes are sent to pedal in real-time when Live Mode is ON

### Demo Mode

1. Click "Demo Mode" on splash screen
2. Explore the interface without hardware
3. All features work except MIDI communication

### Collaborative Session

**As Server (with MIDI):**
1. Connect your pedal
2. Click "Share Session" in the menu
3. Share the 6-character code
4. Toggle Live Mode to enable pedal updates

**As Client (remote):**
1. Sign in with Google
2. Enter the session code
3. Control parameters remotely
4. Changes sync through Firebase to the server

---

## Project Structure

```
src/
├── pages/
│   ├── Editor.tsx          # Main editor interface
│   ├── Splash.tsx          # Connection/login screen
│   └── JoinSession.tsx     # Session join page
│
├── components/
│   ├── pedalboard/         # Virtual pedalboard UI
│   │   ├── Pedalboard.tsx  # Main layout
│   │   ├── ModulePanel.tsx # Effect module editing
│   │   └── MiniKnob.tsx    # Rotary knob component
│   │
│   ├── parameter/          # Parameter controls
│   │   ├── Slider.tsx      # Value slider
│   │   └── TypeSelector.tsx # Effect type picker
│   │
│   ├── dialogs/            # Modal dialogs
│   │   ├── BulkSendDialog.tsx
│   │   ├── DuplicatePatchDialog.tsx
│   │   └── RenamePatchDialog.tsx
│   │
│   ├── session/            # Session UI components
│   └── common/             # Shared components
│
├── contexts/               # React Context state management
│   ├── AuthContext.tsx     # User authentication
│   ├── DeviceContext.tsx   # MIDI device state
│   ├── PatchContext.tsx    # Patch data state
│   ├── SessionContext.tsx  # Collaborative session
│   ├── SyncContext.tsx     # Firebase sync
│   └── HistoryContext.tsx  # Undo/redo
│
├── services/
│   ├── midi/
│   │   └── MidiService.ts  # Web MIDI API wrapper
│   ├── firebase/
│   │   ├── auth.ts         # Authentication
│   │   └── firestore.ts    # Database operations
│   └── session/
│       └── SessionService.ts # Session management
│
├── types/                  # TypeScript definitions
│   ├── patch.ts            # Patch data types
│   ├── midi.ts             # MIDI types
│   └── session.ts          # Session types
│
├── App.tsx                 # Root component
└── main.tsx                # Entry point
```

---

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

---

## Deployment

The live platform is hosted at **[g9.enruana.com](https://g9.enruana.com)**

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Manual

Build the `dist/` folder and serve with any static hosting.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| Tailwind CSS 4 | Styling |
| Three.js | 3D effects |
| Firebase | Auth, database, hosting |
| Web MIDI API | Device communication |

---

## Troubleshooting

### "No MIDI devices found"
- Ensure USB MIDI interface is connected
- Try unplugging and reconnecting
- Check if other apps are using the MIDI device
- Restart Chrome

### "Device not responding"
- Check MIDI cable connections (IN to OUT, OUT to IN)
- Power cycle the G9.2tt pedal
- Try a different USB port

### "Browser not supported"
- Use Chrome 89+ or another Chromium-based browser
- Web MIDI is not available in Firefox or Safari

### Changes not applying to pedal
- Ensure Live Mode is ON (green indicator)
- Check MIDI connections
- Verify the pedal is in the correct mode

---

## License

MIT License

---

## Author

Made by **enruana**

- Website: [g9.enruana.com](https://g9.enruana.com)
- Email: felipemantillagomez@gmail.com
- GitHub: [@enruana](https://github.com/enruana)
