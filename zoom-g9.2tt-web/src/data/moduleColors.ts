import type { ModuleName } from '../types/patch';

/** Pedal color themes for each module */
export const MODULE_COLORS: Record<ModuleName, {
  body: string;
  bodyGradient: string;
  accent: string;
  text: string;
  led: string;
}> = {
  comp: {
    body: '#dc2626',
    bodyGradient: 'linear-gradient(180deg, #ef4444 0%, #dc2626 30%, #b91c1c 100%)',
    accent: '#fca5a5',
    text: '#fee2e2',
    led: '#22c55e',
  },
  wah: {
    body: '#15803d',
    bodyGradient: 'linear-gradient(180deg, #22c55e 0%, #16a34a 30%, #15803d 100%)',
    accent: '#86efac',
    text: '#dcfce7',
    led: '#ef4444',
  },
  znr: {
    body: '#374151',
    bodyGradient: 'linear-gradient(180deg, #6b7280 0%, #4b5563 30%, #374151 100%)',
    accent: '#9ca3af',
    text: '#f3f4f6',
    led: '#fbbf24',
  },
  amp: {
    body: '#1e3a8a',
    bodyGradient: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 30%, #1d4ed8 100%)',
    accent: '#93c5fd',
    text: '#dbeafe',
    led: '#ef4444',
  },
  cab: {
    body: '#92400e',
    bodyGradient: 'linear-gradient(180deg, #d97706 0%, #b45309 30%, #92400e 100%)',
    accent: '#fcd34d',
    text: '#fef3c7',
    led: '#22c55e',
  },
  eq: {
    body: '#0e7490',
    bodyGradient: 'linear-gradient(180deg, #22d3ee 0%, #06b6d4 30%, #0891b2 100%)',
    accent: '#67e8f9',
    text: '#cffafe',
    led: '#f97316',
  },
  mod: {
    body: '#7e22ce',
    bodyGradient: 'linear-gradient(180deg, #a855f7 0%, #9333ea 30%, #7e22ce 100%)',
    accent: '#d8b4fe',
    text: '#f3e8ff',
    led: '#3b82f6',
  },
  dly: {
    body: '#0f766e',
    bodyGradient: 'linear-gradient(180deg, #2dd4bf 0%, #14b8a6 30%, #0d9488 100%)',
    accent: '#5eead4',
    text: '#ccfbf1',
    led: '#ec4899',
  },
  rev: {
    body: '#be185d',
    bodyGradient: 'linear-gradient(180deg, #ec4899 0%, #db2777 30%, #be185d 100%)',
    accent: '#f9a8d4',
    text: '#fce7f3',
    led: '#22c55e',
  },
  ext: {
    body: '#1e293b',
    bodyGradient: 'linear-gradient(180deg, #475569 0%, #334155 30%, #1e293b 100%)',
    accent: '#94a3b8',
    text: '#e2e8f0',
    led: '#f97316',
  },
};

export const DISABLED_COLORS = {
  body: '#2a2a2a',
  bodyGradient: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 30%, #1a1a1a 100%)',
  accent: '#525252',
  text: '#737373',
  led: '#333',
};
