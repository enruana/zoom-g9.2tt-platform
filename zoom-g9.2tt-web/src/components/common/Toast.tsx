import { useEffect, useState } from 'react';

export type ToastType = 'error' | 'warning' | 'success' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const typeStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
  error: {
    bg: 'bg-red-900/90',
    border: 'border-red-500',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
  warning: {
    bg: 'bg-yellow-900/90',
    border: 'border-yellow-500',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
  success: {
    bg: 'bg-green-900/90',
    border: 'border-green-500',
    icon: 'M5 13l4 4L19 7',
  },
  info: {
    bg: 'bg-blue-900/90',
    border: 'border-blue-500',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
};

export function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const styles = typeStyles[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 max-w-md p-4 rounded-lg border ${styles.bg} ${styles.border} text-white shadow-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={styles.icon} />
        </svg>
        <div className="flex-1">
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Toast container for managing multiple toasts
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

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((t, index) => (
        <div key={t.id} style={{ transform: `translateY(-${index * 4}px)` }}>
          <Toast
            message={t.message}
            type={t.type}
            onClose={() => toast.dismiss(t.id)}
          />
        </div>
      ))}
    </div>
  );
}
