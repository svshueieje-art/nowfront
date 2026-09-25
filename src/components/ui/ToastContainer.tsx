// ========================================
// Toast Renderer
// ========================================

import { useToast } from '@/hooks/useToast';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { clsx } from 'clsx';

const iconMap = {
  success: <CheckCircle2 className="h-5 w-5 text-success-500" />,
  error: <AlertCircle className="h-5 w-5 text-danger-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning-500" />,
  info: <Info className="h-5 w-5 text-info-500" />,
};

const bgMap = {
  success: 'border-success-500/20',
  error: 'border-danger-500/20',
  warning: 'border-warning-500/20',
  info: 'border-info-500/20',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            'pointer-events-auto glass-card rounded-lg border p-4 shadow-xl toast-enter',
            bgMap[toast.type]
          )}
          role="alert"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
              {iconMap[toast.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-100">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-surface-400 mt-0.5">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-1 rounded text-surface-500 hover:text-surface-300 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
