import { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevice } from '../contexts/DeviceContext';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={state === 'selecting' ? onClose : undefined} />

      <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-lg p-6">
        {/* Close button */}
        {(state === 'selecting' || error) && (
          <button onClick={onClose} className="absolute top-3 right-3 text-neutral-500 hover:text-white p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
            {error}
            <button onClick={onShowTroubleshoot} className="block mt-1 text-red-300 underline text-xs">
              Troubleshooting
            </button>
          </div>
        )}

        {/* Requesting */}
        {state === 'requesting' && (
          <div className="text-center py-6">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-300">Requesting MIDI access...</p>
            <p className="text-neutral-500 text-sm mt-1">Allow when prompted</p>
          </div>
        )}

        {/* Selecting */}
        {state === 'selecting' && (
          <>
            <h2 className="text-lg font-semibold text-white mb-4">Select MIDI Device</h2>

            {devices.length === 0 ? (
              <p className="text-neutral-400 text-sm py-4">No devices found</p>
            ) : (
              <div className="space-y-2 mb-4">
                {devices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => onSelectDevice(device)}
                    className="w-full p-3 bg-neutral-800 hover:bg-neutral-700 rounded text-left border border-neutral-700 hover:border-neutral-500"
                  >
                    <div className="font-medium text-white text-sm">{device.name}</div>
                    {device.manufacturer && (
                      <div className="text-xs text-neutral-500">{device.manufacturer}</div>
                    )}
                  </button>
                ))}
              </div>
            )}

            <button onClick={onDemo} className="w-full py-2 text-neutral-400 hover:text-white text-sm">
              Use Demo Mode
            </button>
          </>
        )}

        {/* Connecting */}
        {state === 'connecting' && (
          <div className="text-center py-6">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-300">Connecting...</p>
          </div>
        )}

        {/* Identifying */}
        {state === 'identifying' && (
          <div className="text-center py-6">
            <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-300">Identifying device...</p>
          </div>
        )}

        {/* Warning */}
        {state === 'warning' && warningInfo && (
          <>
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
              <p className="text-yellow-400 text-sm font-medium">Unknown Device</p>
              <p className="text-yellow-400/70 text-xs mt-1">
                {warningInfo.identity
                  ? `Detected: ${warningInfo.identity.manufacturerName}`
                  : 'Device did not respond to identity request'}
              </p>
            </div>
            <div className="space-y-2">
              <button onClick={onContinueAnyway} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded text-white font-medium text-sm">
                Continue Anyway
              </button>
              <button onClick={onSelectDifferent} className="w-full py-2.5 bg-neutral-700 hover:bg-neutral-600 rounded text-white font-medium text-sm">
                Select Different Device
              </button>
              <button onClick={onDemo} className="w-full py-2 text-neutral-400 hover:text-white text-sm">
                Use Demo Mode
              </button>
            </div>
          </>
        )}

        {/* Success */}
        {state === 'success' && (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-400 font-medium">Connected</p>
          </div>
        )}

        {/* Demo */}
        {state === 'demo' && (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-purple-400 font-medium">Demo Mode</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function Splash() {
  const navigate = useNavigate();
  const { state: deviceState, actions } = useDevice();
  const [modalState, setModalState] = useState<ModalState>('closed');
  const [devices, setDevices] = useState<MidiDeviceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [warningInfo, setWarningInfo] = useState<DeviceWarningInfo | null>(null);

  const browserCheck = checkBrowserCompatibility();

  useEffect(() => {
    if (deviceState.status === 'connected' || deviceState.status === 'demo') {
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
    <div className="min-h-screen text-white flex flex-col relative overflow-hidden">
      {/* 3D Universe Background */}
      <Suspense fallback={null}>
        <StarField />
      </Suspense>

      {/* Browser Warning */}
      {!browserCheck.supported && (
        <div className="bg-yellow-600 text-yellow-100 px-4 py-2 text-center text-sm relative z-10">
          {browserCheck.message}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {/* Logo */}
        <img
          src="/zoomlogo.png"
          alt="ZOOM"
          className="h-8 md:h-10 mb-12"
        />

        {/* Device Image */}
        <img
          src="/zoom-g9-nobg.png"
          alt="Zoom G9.2tt"
          className="max-w-full max-h-[300px] md:max-h-[360px] mb-10"
          style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))' }}
        />

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
          G9.2<span className="text-blue-500">tt</span> Editor
        </h1>

        {/* Subtitle */}
        <p className="text-neutral-400 mb-10">
          Web-based patch editor for Zoom G9.2tt
        </p>

        {/* CTA Button */}
        <button
          onClick={handleStart}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold text-white"
        >
          Get Started
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 text-center relative z-10">
        <p className="text-neutral-600 text-xs">
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
