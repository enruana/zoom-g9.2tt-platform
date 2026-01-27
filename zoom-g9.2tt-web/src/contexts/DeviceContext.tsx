import { createContext, useContext, useReducer, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { DeviceState, DeviceActions, DeviceContextValue } from '../types/midi';

const STORAGE_KEY = 'g9tt_connected_device';

/** Stored device info for auto-reconnection */
interface StoredDeviceInfo {
  deviceId: string;
  deviceName: string;
  manufacturer?: string;
  model?: string;
}

/** Load stored device info from localStorage */
function loadStoredDevice(): StoredDeviceInfo | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('[DeviceContext] Failed to load stored device:', e);
  }
  return null;
}

/** Save device info to localStorage */
function saveStoredDevice(info: StoredDeviceInfo | null): void {
  try {
    if (info) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.warn('[DeviceContext] Failed to save stored device:', e);
  }
}

/** Get stored device info (exported for use in other components) */
export function getStoredDeviceInfo(): StoredDeviceInfo | null {
  return loadStoredDevice();
}

/** Clear stored device info (exported for use in other components) */
export function clearStoredDeviceInfo(): void {
  saveStoredDevice(null);
}

// Action types
type DeviceAction =
  | { type: 'SET_CONNECTING' }
  | { type: 'SET_CONNECTED'; deviceId: string; deviceName: string; manufacturer?: string; model?: string }
  | { type: 'SET_DEMO' }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'DISCONNECT' };

// Initial state
const initialState: DeviceState = {
  status: 'disconnected',
  deviceId: null,
  deviceName: null,
  error: null,
  manufacturer: null,
  model: null,
};

// Reducer
function deviceReducer(state: DeviceState, action: DeviceAction): DeviceState {
  switch (action.type) {
    case 'SET_CONNECTING':
      return {
        ...state,
        status: 'connecting',
        error: null,
      };
    case 'SET_CONNECTED':
      return {
        ...state,
        status: 'connected',
        deviceId: action.deviceId,
        deviceName: action.deviceName,
        manufacturer: action.manufacturer ?? null,
        model: action.model ?? null,
        error: null,
      };
    case 'SET_DEMO':
      return {
        ...state,
        status: 'demo',
        deviceId: null,
        deviceName: 'Demo Device',
        manufacturer: 'Demo',
        model: 'G9.2tt (Demo)',
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.error,
      };
    case 'DISCONNECT':
      return initialState;
    default:
      return state;
  }
}

// Context
const DeviceContext = createContext<DeviceContextValue | null>(null);

// Provider props
interface DeviceProviderProps {
  children: ReactNode;
}

// Provider component
export function DeviceProvider({ children }: DeviceProviderProps) {
  const [state, dispatch] = useReducer(deviceReducer, initialState);

  // Persist device info when connected, clear when disconnected
  useEffect(() => {
    if (state.status === 'connected' && state.deviceId && state.deviceName) {
      saveStoredDevice({
        deviceId: state.deviceId,
        deviceName: state.deviceName,
        manufacturer: state.manufacturer ?? undefined,
        model: state.model ?? undefined,
      });
    } else if (state.status === 'disconnected') {
      saveStoredDevice(null);
    }
    // Don't clear on 'demo' or 'error' status to allow reconnection attempts
  }, [state.status, state.deviceId, state.deviceName, state.manufacturer, state.model]);

  const actions: DeviceActions = useMemo(
    () => ({
      setConnecting: () => dispatch({ type: 'SET_CONNECTING' }),
      setConnected: (deviceId: string, deviceName: string, manufacturer?: string, model?: string) =>
        dispatch({ type: 'SET_CONNECTED', deviceId, deviceName, manufacturer, model }),
      setDemo: () => dispatch({ type: 'SET_DEMO' }),
      setError: (error: string) => dispatch({ type: 'SET_ERROR', error }),
      disconnect: () => dispatch({ type: 'DISCONNECT' }),
    }),
    []
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}

// Hook
// eslint-disable-next-line react-refresh/only-export-components
export function useDevice(): DeviceContextValue {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
}
