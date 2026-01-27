import { useEffect, useState, useCallback, type ReactNode } from 'react';

export type ToastType = 'error' | 'warning' | 'success' | 'info';

interface ToastProps {
  id: number;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const typeConfig: Record<ToastType, {
  gradient: string;
  glow: string;
  iconBg: string;
  icon: ReactNode;
}> = {
  error: {
    gradient: 'from-red-500/20 to-red-900/20',
    glow: 'shadow-red-500/20',
    iconBg: 'bg-red-500',
    icon: (
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  warning: {
    gradient: 'from-yellow-500/20 to-yellow-900/20',
    glow: 'shadow-yellow-500/20',
    iconBg: 'bg-yellow-500',
    icon: (
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
      </svg>
    ),
  },
  success: {
    gradient: 'from-green-500/20 to-green-900/20',
    glow: 'shadow-green-500/20',
    iconBg: 'bg-green-500',
    icon: (
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  info: {
    gradient: 'from-blue-500/20 to-blue-900/20',
    glow: 'shadow-blue-500/20',
    iconBg: 'bg-blue-500',
    icon: (
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

function ToastItem({ message, type = 'info', duration = 4000, onClose }: ToastProps) {
  const [state, setState] = useState<'entering' | 'visible' | 'exiting'>('entering');
  const config = typeConfig[type];

  useEffect(() => {
    // Enter animation
    const enterTimer = setTimeout(() => setState('visible'), 10);

    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      setState('exiting');
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration]);

  useEffect(() => {
    if (state === 'exiting') {
      const timer = setTimeout(onClose, 200);
      return () => clearTimeout(timer);
    }
  }, [state, onClose]);

  const handleClose = useCallback(() => {
    setState('exiting');
  }, []);

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl
        bg-gradient-to-r ${config.gradient}
        backdrop-blur-xl bg-neutral-900/80
        border border-neutral-700/50
        shadow-lg ${config.glow}
        transition-all duration-200 ease-out
        ${state === 'entering' ? 'opacity-0 translate-x-4' : ''}
        ${state === 'visible' ? 'opacity-100 translate-x-0' : ''}
        ${state === 'exiting' ? 'opacity-0 translate-x-4 scale-95' : ''}
      `}
    >
      {/* Icon */}
      <div className={`${config.iconBg} w-6 h-6 rounded-lg flex items-center justify-center shrink-0`}>
        {config.icon}
      </div>

      {/* Message */}
      <p className="text-sm text-neutral-200 flex-1 pr-2">{message}</p>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="text-neutral-500 hover:text-neutral-300 transition-colors p-1 -mr-1 rounded-lg hover:bg-neutral-800/50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Toast state management
interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
const listeners: Set<(toasts: ToastItem[]) => void> = new Set();
let currentToasts: ToastItem[] = [];

function notifyListeners() {
  listeners.forEach(listener => listener([...currentToasts]));
}

// eslint-disable-next-line react-refresh/only-export-components
export const toast = {
  show(message: string, type: ToastType = 'info') {
    const id = ++toastId;
    // Limit to 5 toasts max
    if (currentToasts.length >= 5) {
      currentToasts = currentToasts.slice(1);
    }
    currentToasts = [...currentToasts, { id, message, type }];
    notifyListeners();
    return id;
  },
  error(message: string) {
    return this.show(message, 'error');
  },
  warning(message: string) {
    return this.show(message, 'warning');
  },
  success(message: string) {
    return this.show(message, 'success');
  },
  info(message: string) {
    return this.show(message, 'info');
  },
  dismiss(id: number) {
    currentToasts = currentToasts.filter(t => t.id !== id);
    notifyListeners();
  },
  subscribe(listener: (toasts: ToastItem[]) => void) {
    listeners.add(listener);
    listener([...currentToasts]);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toast.subscribe(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem
            id={t.id}
            message={t.message}
            type={t.type}
            onClose={() => toast.dismiss(t.id)}
          />
        </div>
      ))}
    </div>
  );
}

// Re-export for backwards compatibility
export { ToastItem as Toast };
