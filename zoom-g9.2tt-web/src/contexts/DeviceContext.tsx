import { createContext, useContext, useReducer, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { DeviceState, DeviceActions, DeviceContextValue } from '../types/midi';

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
