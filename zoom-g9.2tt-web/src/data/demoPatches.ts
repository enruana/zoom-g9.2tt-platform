import type { Patch, ModuleState, PatchModules } from '../types/patch';

/** Create a default module state */
function createModule(enabled: boolean, type: number, params: number[]): ModuleState {
  return { enabled, type, params };
}

/** Create default modules with all disabled */
function createDefaultModules(): PatchModules {
  return {
    amp: createModule(true, 0, [50, 50, 50, 50, 50]),       // Clean amp
    comp: createModule(false, 0, [50, 50, 50]),            // Compressor off
    wah: createModule(false, 0, [50, 50]),                 // Wah off
    ext: createModule(false, 0, [50]),                     // External off
    znr: createModule(true, 0, [30]),                      // ZNR on, low threshold
    eq: createModule(false, 0, [50, 50, 50, 50, 50]),     // EQ off
    cab: createModule(true, 0, [50]),                      // Cabinet on
    mod: createModule(false, 0, [50, 50, 50, 50]),        // Modulation off
    dly: createModule(false, 0, [50, 50, 50, 50]),        // Delay off
    rev: createModule(false, 0, [50, 50]),                 // Reverb off
  };
}

/** Demo patch names - mix of genres and styles */
const patchNames = [
  'Clean Jazz',
  'Crunch Rock',
  'Heavy Metal',
  'Blues Lead',
  'Funk Clean',
  'Ambient Pad',
  'Classic OD',
  'Modern Hi-G',
  'Acoustic Sim',
  'Reggae Dub',
  'Surf Twang',
  'Country Tele',
  'Neo Soul',
  '80s Chorus',
  '90s Grunge',
  'Indie Rock',
  'Post Rock',
  'Shoegaze',
  'Math Rock',
  'Prog Lead',
  'Jazz Fusion',
  'Latin Jazz',
  'Smooth Jazz',
  'Bebop Clean',
  'Blues Crunch',
  'Texas Blues',
  'Chicago Blue',
  'Delta Slide',
  'Rock Rhythm',
  'Rock Lead',
  'Classic Rock',
  'Hard Rock',
  'Arena Rock',
  'Punk Rock',
  'Pop Punk',
  'Emo Clean',
  'Metal Rhythm',
  'Metal Lead',
  'Thrash Metal',
  'Djent',
  'Deathcore',
  'Black Metal',
  'Doom Metal',
  'Stoner Rock',
  'Desert Rock',
  'Psychedelic',
  'Space Rock',
  'Krautrock',
  'Noise Rock',
  'No Wave',
  'Pop Clean',
  'Pop Rock',
  'Dance Pop',
  'Synth Pop',
  'New Wave',
  'Post Punk',
  'Goth Rock',
  'Dark Wave',
  'Industrial',
  'EBM',
  'Funk Wah',
  'Disco Funk',
  'P-Funk',
  'Soul Clean',
  'R&B Smooth',
  'Gospel',
  'Christian',
  'Worship',
  'Praise',
  'Celtic',
  'Folk Rock',
  'Americana',
  'Alt Country',
  'Bluegrass',
  'Western',
  'Mariachi',
  'Flamenco',
  'Bossa Nova',
  'Samba',
  'Tango',
  'World Fus',
  'African',
  'Middle East',
  'Indian',
  'Asian',
  'Tropical',
  'Island',
  'Surf',
  'Rockabilly',
  'Swing',
  'Big Band',
  'Lounge',
  'Elevator',
  'Muzak',
  'Ambient',
  'Drone',
  'Soundscape',
  'Film Score',
  'Game Audio',
  'Default',
];

/** Generate all 100 demo patches */
function generateDemoPatches(): Patch[] {
  const patches: Patch[] = [];

  for (let i = 0; i < 100; i++) {
    const name = patchNames[i] ?? `Patch ${String(i).padStart(2, '0')}`;
    const modules = createDefaultModules();

    // Vary settings based on patch number to create variety
    const variation = i % 10;

    // Amp settings vary
    modules.amp.type = (i % 8);
    modules.amp.params = [
      40 + variation * 5,  // Gain
      50 + (variation - 5) * 3,  // Bass
      50,  // Mid
      50 + (variation - 5) * 2,  // Treble
      60 + variation * 2,  // Level
    ];

    // Enable effects based on patch category
    if (i >= 10 && i < 20) {
      // Rock patches - add some overdrive/distortion characteristics
      modules.amp.type = 3 + (i % 5);
      modules.amp.params[0] = 60 + (i % 4) * 10; // Higher gain
    }

    if (i >= 20 && i < 30) {
      // Metal patches - high gain, tight low end
      modules.amp.type = 10 + (i % 5);
      modules.amp.params[0] = 80 + (i % 3) * 5; // Very high gain
      modules.znr.params[0] = 50; // Higher noise gate
    }

    if (i >= 50 && i < 60) {
      // Modulation patches - enable chorus/flanger
      modules.mod.enabled = true;
      modules.mod.type = i % 6;
      modules.mod.params = [50 + variation * 3, 40, 60, 50];
    }

    if (i >= 40 && i < 50 || i >= 80 && i < 90) {
      // Delay patches
      modules.dly.enabled = true;
      modules.dly.type = i % 4;
      modules.dly.params = [300 + variation * 20, 40, 50, 30];
    }

    if (i >= 5 && i < 10 || i >= 90) {
      // Ambient/reverb patches
      modules.rev.enabled = true;
      modules.rev.type = i % 3;
      modules.rev.params = [60 + variation * 3, 50];
    }

    patches.push({
      id: i,
      name: name.substring(0, 10).padEnd(10, ' '),
      level: 80 + (i % 20),
      modules,
    });
  }

  return patches;
}

/** Pre-generated demo patches */
export const demoPatches: Patch[] = generateDemoPatches();

/** Get a single demo patch by ID */
export function getDemoPatch(id: number): Patch | undefined {
  return demoPatches[id];
}

/** Get all demo patches */
export function getAllDemoPatches(): Patch[] {
  return [...demoPatches];
}
