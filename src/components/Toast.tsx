interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'default';
  icon?: string;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const defaultIcons = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  default: '✓',
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast--${toast.type}`}
        >
          <span className="toast__icon">
            {toast.icon || defaultIcons[toast.type]}
          </span>
          <span className="toast__msg">{toast.message}</span>
          <button
            className="toast__close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
