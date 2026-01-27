/** Check if Web MIDI API is supported */
export function isWebMidiSupported(): boolean {
  return typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
}

/** Get browser name for display */
export function getBrowserName(): string {
  const ua = navigator.userAgent;

  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome/')) return 'Chrome';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Opera/') || ua.includes('OPR/')) return 'Opera';

  return 'Unknown';
}

/** Check if the current browser supports Web MIDI */
export function checkBrowserCompatibility(): {
  supported: boolean;
  browserName: string;
  message: string;
} {
  const browserName = getBrowserName();
  const supported = isWebMidiSupported();

  let message = '';
  if (!supported) {
    switch (browserName) {
      case 'Firefox':
        message = 'Firefox does not support Web MIDI API. Please use Chrome or Edge.';
        break;
      case 'Safari':
        message = 'Safari does not support Web MIDI API. Please use Chrome or Edge.';
        break;
      default:
        message = 'Your browser does not support Web MIDI API. Please use Chrome 89+ or Edge 89+.';
    }
  }

  return { supported, browserName, message };
}
