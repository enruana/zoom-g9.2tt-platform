interface TroubleshootPanelProps {
  onClose: () => void;
  onRetry: () => void;
}

const troubleshootingTips = [
  {
    title: 'Check USB Connection',
    description: 'Ensure your G9.2tt is properly connected via USB cable. Try a different USB port if available.',
    icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  },
  {
    title: 'Power On the Device',
    description: 'Make sure your Zoom G9.2tt is powered on and showing activity on its display.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    title: 'Use Chrome or Edge',
    description: 'Web MIDI API is only supported in Chrome (89+) and Edge (89+) browsers. Safari and Firefox do not support MIDI.',
    icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
  },
  {
    title: 'Allow MIDI Access',
    description: 'When prompted, click "Allow" to grant the browser permission to access MIDI devices.',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    title: 'Close Other MIDI Apps',
    description: 'Other applications using MIDI (like DAWs) may block access. Close them and try again.',
    icon: 'M6 18L18 6M6 6l12 12',
  },
  {
    title: 'Restart the Device',
    description: 'If the G9.2tt is unresponsive, try turning it off and on again, then reconnect.',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  },
];

export function TroubleshootPanel({ onClose, onRetry }: TroubleshootPanelProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Troubleshooting</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tips List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {troubleshootingTips.map((tip, index) => (
            <div key={index} className="flex gap-4 p-3 bg-gray-700/50 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tip.icon} />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">{tip.title}</h3>
                <p className="text-sm text-gray-400">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Retry Connection
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
