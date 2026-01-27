import { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevice } from '../contexts/DeviceContext';
import { useAuth } from '../contexts/AuthContext';
import { midiService } from '../services/midi/MidiService';
import { TroubleshootPanel } from '../components/common/TroubleshootPanel';
import { checkBrowserCompatibility } from '../utils/browserCheck';
import { StarField } from '../components/three/StarField';
import type { MidiDeviceInfo } from '../types/midi';
import type { DeviceIdentity } from '../services/midi/protocol';

type ModalState = 'closed' | 'requesting' | 'selecting' | 'connecting' | 'identifying' | 'warning' | 'success' | 'demo';

interface DeviceWarningInfo {
  device: MidiDeviceInfo;
  identity: DeviceIdentity | null;
}

/** MIDI Cable Icon */
function MidiIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="8" cy="9" r="1.5" fill="currentColor" />
      <circle cx="16" cy="9" r="1.5" fill="currentColor" />
      <circle cx="6" cy="13" r="1.5" fill="currentColor" />
      <circle cx="12" cy="15" r="1.5" fill="currentColor" />
      <circle cx="18" cy="13" r="1.5" fill="currentColor" />
    </svg>
  );
}

/** Animated pulse rings */
function PulseRings({ color = "blue" }: { color?: "blue" | "green" | "purple" }) {
  const colorClasses = {
    blue: "border-blue-500",
    green: "border-green-500",
    purple: "border-purple-500",
  };
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className={`absolute w-full h-full rounded-full border ${colorClasses[color]} opacity-20 animate-ping`} style={{ animationDuration: '2s' }} />
      <div className={`absolute w-3/4 h-3/4 rounded-full border ${colorClasses[color]} opacity-30 animate-ping`} style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
    </div>
  );
}

/** Device Selection Modal */
function DeviceModal({
  state,
  devices,
  error,
  warningInfo,
  onClose,
  onSelectDevice,
  onDemo,
  onContinueAnyway,
  onSelectDifferent,
  onShowTroubleshoot,
}: {
  state: ModalState;
  devices: MidiDeviceInfo[];
  error: string | null;
  warningInfo: DeviceWarningInfo | null;
  onClose: () => void;
  onSelectDevice: (device: MidiDeviceInfo) => void;
  onDemo: () => void;
  onContinueAnyway: () => void;
  onSelectDifferent: () => void;
  onShowTroubleshoot: () => void;
}) {
  if (state === 'closed') return null;

  const canClose = state === 'selecting' || !!error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={canClose ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-700/50 bg-gradient-to-b from-neutral-800 to-neutral-900 shadow-2xl"
        style={{ animation: 'modal-enter 0.3s ease-out' }}
      >
        {/* Decorative top gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />

        {/* Close button */}
        {canClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-neutral-500 hover:text-white hover:bg-neutral-700/50 rounded-full transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-red-400 text-sm font-medium">{error}</p>
                <button
                  onClick={onShowTroubleshoot}
                  className="mt-2 text-red-300 hover:text-red-200 text-xs underline underline-offset-2"
                >
                  Need help? View troubleshooting guide
                </button>
              </div>
            </div>
          )}

          {/* Requesting State */}
          {state === 'requesting' && (
            <div className="text-center py-8">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <PulseRings color="blue" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <MidiIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Requesting MIDI Access</h3>
              <p className="text-neutral-400 text-sm">Please allow access when prompted by your browser</p>
            </div>
          )}

          {/* Selecting State */}
          {state === 'selecting' && (
            <>
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <MidiIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Connect Device</h2>
                  <p className="text-neutral-400 text-sm">Select your MIDI interface</p>
                </div>
              </div>

              {/* Device List */}
              {devices.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-neutral-400 font-medium mb-1">No MIDI devices found</p>
                  <p className="text-neutral-500 text-sm">Connect your device and try again</p>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {devices.map((device, index) => (
                    <button
                      key={device.id}
                      onClick={() => onSelectDevice(device)}
                      className="group w-full p-4 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-xl text-left border border-neutral-700/50 hover:border-blue-500/50 transition-all duration-200"
                      style={{ animation: `fade-in 0.3s ease-out ${index * 0.1}s both` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-neutral-700 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                          <svg className="w-5 h-5 text-neutral-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">{device.name}</div>
                          {device.manufacturer && (
                            <div className="text-xs text-neutral-500">{device.manufacturer}</div>
                          )}
                        </div>
                        <svg className="w-5 h-5 text-neutral-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-700/50"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-neutral-900 px-3 text-neutral-500">or</span>
                </div>
              </div>

              {/* Demo Mode Button */}
              <button
                onClick={onDemo}
                className="w-full p-4 rounded-xl border-2 border-dashed border-neutral-700 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-neutral-300 group-hover:text-purple-300 transition-colors">Try Demo Mode</div>
                    <div className="text-xs text-neutral-500">Explore without a device</div>
                  </div>
                </div>
              </button>
            </>
          )}

          {/* Connecting State */}
          {state === 'connecting' && (
            <div className="text-center py-8">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-neutral-700 border-t-blue-500 animate-spin" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <MidiIcon className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Connecting</h3>
              <p className="text-neutral-400 text-sm">Establishing MIDI connection...</p>
            </div>
          )}

          {/* Identifying State */}
          {state === 'identifying' && (
            <div className="text-center py-8">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-neutral-700 border-t-green-500 animate-spin" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Identifying Device</h3>
              <p className="text-neutral-400 text-sm">Checking if this is a Zoom G9.2tt...</p>
            </div>
          )}

          {/* Warning State */}
          {state === 'warning' && warningInfo && (
            <div className="py-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Unknown Device</h3>
                  <p className="text-amber-400/70 text-sm">
                    {warningInfo.identity
                      ? `Detected: ${warningInfo.identity.manufacturerName}`
                      : 'Device did not respond to identity request'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={onContinueAnyway}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl text-white font-medium transition-all shadow-lg shadow-blue-500/25"
                >
                  Continue Anyway
                </button>
                <button
                  onClick={onSelectDifferent}
                  className="w-full py-3 px-4 bg-neutral-700 hover:bg-neutral-600 rounded-xl text-white font-medium transition-all"
                >
                  Select Different Device
                </button>
                <button
                  onClick={onDemo}
                  className="w-full py-2 text-neutral-400 hover:text-white text-sm transition-colors"
                >
                  Use Demo Mode instead
                </button>
              </div>
            </div>
          )}

          {/* Success State */}
          {state === 'success' && (
            <div className="text-center py-8">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <PulseRings color="green" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-green-400 mb-2">Connected!</h3>
              <p className="text-neutral-400 text-sm">Launching editor...</p>
            </div>
          )}

          {/* Demo State */}
          {state === 'demo' && (
            <div className="text-center py-8">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <PulseRings color="purple" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-purple-400 mb-2">Demo Mode</h3>
              <p className="text-neutral-400 text-sm">Launching editor...</p>
            </div>
          )}
        </div>

        {/* CSS Animations */}
        <style>{`
          @keyframes modal-enter {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export function Splash() {
  const navigate = useNavigate();
  const { state: deviceState, actions } = useDevice();
  const { state: authState, actions: authActions } = useAuth();
  const [modalState, setModalState] = useState<ModalState>('closed');
  const [devices, setDevices] = useState<MidiDeviceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [warningInfo, setWarningInfo] = useState<DeviceWarningInfo | null>(null);

  const browserCheck = checkBrowserCompatibility();

  useEffect(() => {
    if (deviceState.status === 'connected' || deviceState.status === 'demo') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Derived state from device connection status
      setModalState(deviceState.status === 'connected' ? 'success' : 'demo');
      const timer = setTimeout(() => navigate('/editor'), 600);
      return () => clearTimeout(timer);
    }
  }, [deviceState.status, navigate]);

  const handleStart = async () => {
    if (!browserCheck.supported) {
      setError(browserCheck.message);
      setModalState('selecting');
      return;
    }

    setError(null);
    setModalState('requesting');

    try {
      await midiService.requestAccess();
      const availableDevices = midiService.getDevices();

      if (availableDevices.length === 0) {
        setError('No MIDI devices found. Connect your device and try again.');
        setModalState('selecting');
        return;
      }

      setDevices(availableDevices);
      setModalState('selecting');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to access MIDI');
      setModalState('selecting');
    }
  };

  const handleDeviceSelect = async (device: MidiDeviceInfo) => {
    setError(null);
    setModalState('connecting');
    actions.setConnecting();

    try {
      await midiService.connect(device.id);
      setModalState('identifying');
      const identity = await midiService.identify(2000);

      if (identity?.isG9TT) {
        actions.setConnected(device.id, device.name, identity.manufacturerName, `G9.2tt (v${identity.version.join('.')})`);
      } else {
        setWarningInfo({ device, identity });
        setModalState('warning');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      actions.setError(error || 'Connection failed');
      setModalState('selecting');
    }
  };

  const handleDemo = () => actions.setDemo();

  const handleContinueAnyway = () => {
    if (warningInfo) {
      const { device, identity } = warningInfo;
      actions.setConnected(device.id, device.name, identity?.manufacturerName ?? device.manufacturer, identity ? `Unknown (${identity.model})` : 'Unknown');
    }
  };

  const handleSelectDifferent = () => {
    midiService.disconnect();
    setWarningInfo(null);
    setModalState('selecting');
  };

  const handleClose = () => {
    setModalState('closed');
    setError(null);
    setDevices([]);
    setWarningInfo(null);
  };

  const handleRetry = () => {
    setShowTroubleshoot(false);
    setError(null);
    handleStart();
  };

  return (
    <div className="h-screen text-white flex flex-col relative overflow-hidden">
      {/* 3D Universe Background */}
      <Suspense fallback={null}>
        <StarField />
      </Suspense>

      {/* Browser Warning */}
      {!browserCheck.supported && (
        <div className="bg-yellow-600 text-yellow-100 px-4 py-2 text-center text-sm relative z-10 shrink-0">
          {browserCheck.message}
        </div>
      )}

      {/* Main Content - fills available space */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 relative z-10 min-h-0">
        {/* Logo - shrinks if needed */}
        <img
          src="/zoomlogo.png"
          alt="ZOOM"
          className="h-12 md:h-20 lg:h-28 mb-4 md:mb-8 shrink-0"
        />

        {/* Device Image - flexible, shrinks to fit */}
        <div className="flex-1 flex items-center justify-center min-h-0 w-full max-h-[40vh] md:max-h-[45vh]">
          <img
            src="/zoom-g9-nobg.png"
            alt="Zoom G9.2tt"
            className="max-w-full max-h-full object-contain"
            style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))' }}
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight mt-4 md:mt-6 mb-1 md:mb-2 shrink-0">
          G9.2<span className="text-blue-500">tt</span> Editor
        </h1>

        {/* Subtitle */}
        <p className="text-neutral-400 text-sm md:text-base mb-4 md:mb-6 shrink-0">
          Web-based patch editor for Zoom G9.2tt
        </p>

        {/* CTA Buttons - Sign in required first */}
        <div className="shrink-0">
          {authState.isLoading ? (
            <div className="flex items-center gap-3 text-neutral-400">
              <div className="w-5 h-5 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading...</span>
            </div>
          ) : !authState.user ? (
            <div className="flex flex-col items-center gap-3">
              {/* Sign in with Google - Required before Get Started */}
              <button
                onClick={() => authActions.signInWithGoogle()}
                className="flex items-center gap-3 px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-semibold text-white text-sm md:text-base transition-all shadow-lg shadow-blue-500/25"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in to Get Started
              </button>
              <p className="text-neutral-500 text-xs md:text-sm">
                Sign in required to save and sync your patches
              </p>
              {authState.error && (
                <p className="text-red-400 text-sm">{authState.error}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {/* User avatar and welcome message */}
              <div className="flex items-center gap-2 md:gap-3 bg-neutral-800/50 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-neutral-700">
                {authState.user.photoURL ? (
                  <img
                    src={authState.user.photoURL}
                    alt=""
                    className="w-6 h-6 md:w-8 md:h-8 rounded-full"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div
                  className={`w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-xs md:text-sm ${
                    authState.user.photoURL ? 'hidden' : ''
                  }`}
                >
                  {(authState.user.displayName ?? authState.user.email ?? '?').charAt(0).toUpperCase()}
                </div>
                <span className="text-neutral-300 text-xs md:text-sm max-w-[120px] md:max-w-none truncate">
                  {authState.user.displayName || authState.user.email}
                </span>
                <button
                  onClick={() => authActions.signOut()}
                  className="ml-1 text-neutral-500 hover:text-neutral-300 transition-colors"
                  title="Sign out"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>

              {/* Get Started button */}
              <button
                onClick={handleStart}
                className="px-6 md:px-8 py-2.5 md:py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-semibold text-white text-sm md:text-base transition-all shadow-lg shadow-blue-500/25"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 md:p-4 text-center relative z-10 shrink-0">
        <p className="text-neutral-600 text-[10px] md:text-xs">
          Requires Chrome or Edge with Web MIDI API
        </p>
      </div>

      {/* Modal */}
      <DeviceModal
        state={modalState}
        devices={devices}
        error={error}
        warningInfo={warningInfo}
        onClose={handleClose}
        onSelectDevice={handleDeviceSelect}
        onDemo={handleDemo}
        onContinueAnyway={handleContinueAnyway}
        onSelectDifferent={handleSelectDifferent}
        onShowTroubleshoot={() => setShowTroubleshoot(true)}
      />

      {/* Troubleshoot */}
      {showTroubleshoot && (
        <TroubleshootPanel
          onClose={() => setShowTroubleshoot(false)}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
