/** Connection status states for the device */
export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'demo'
  | 'error';

/** Device state managed by DeviceContext */
export interface DeviceState {
  /** Current connection status */
  status: ConnectionStatus;
  /** MIDI device ID when connected */
  deviceId: string | null;
  /** Human-readable device name */
  deviceName: string | null;
  /** Error message when status is 'error' */
  error: string | null;
  /** Device manufacturer info (from identity response) */
  manufacturer: string | null;
  /** Device model info (from identity response) */
  model: string | null;
}

/** Actions available on DeviceContext */
export interface DeviceActions {
  /** Transition to connecting state */
  setConnecting: () => void;
  /** Transition to connected state with device info */
  setConnected: (deviceId: string, deviceName: string, manufacturer?: string, model?: string) => void;
  /** Transition to demo mode */
  setDemo: () => void;
  /** Transition to error state with message */
  setError: (error: string) => void;
  /** Disconnect and return to disconnected state */
  disconnect: () => void;
}

/** Combined context value */
export interface DeviceContextValue {
  state: DeviceState;
  actions: DeviceActions;
}

/** MIDI device info for device selection */
export interface MidiDeviceInfo {
  id: string;
  name: string;
  manufacturer?: string;
}
